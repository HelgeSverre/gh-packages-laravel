# Inventory Package

A DDD, microservice-ready inventory package for Laravel 13.

## Features

- **Anti-oversell** — Redis distributed lock + DB `FOR UPDATE` + reservation model
- **CQRS** — separated Actions (commands) from read queries
- **Multi-warehouse** — every stock record is warehouse-scoped
- **Audit log** — every mutation writes an `inv_movements` record with before/after snapshot
- **Transfer** — two-phase `create → complete` stock transfer between warehouses
- **Adjustment** — signed quantity changes with typed reasons
- **Stocktake** — physical count reconciliation with automatic variance correction
- **Idempotent reserve** — supports `Idempotency-Key` with payload hash validation and TTL
- **Batch reservation actions** — release/commit multiple tokens with partial success result
- **Microservice-ready** — swap to `INVENTORY_DRIVER=http` to proxy all calls to a remote service

---

## Installation

```bash
composer require bengkulu/inventory
php artisan vendor:publish --tag=inventory-config
php artisan vendor:publish --tag=inventory-migrations
php artisan migrate
php artisan db:seed --class="Vexaltrix\\Inventory\\Database\\Seeders\\InventorySeeder"
```

---

## Demo Seeder

`Vexaltrix\Inventory\Database\Seeders\InventorySeeder` now seeds a deterministic multi-warehouse scenario instead of a single warehouse stock snapshot.

- Creates `WH-MAIN`, `WH-EAST`, and `WH-RETURNS`
- Seeds opening balances through adjustment actions
- Replays reservation commit and release flows
- Executes inter-warehouse transfers and completes them
- Runs a stocktake correction on the east hub

The seeder only cleans up and recreates its own `DEMO-*` SKUs and the warehouse codes above, so it can be rerun locally without wiping unrelated inventory data.

---

## Quick Start

```php
use Vexaltrix\Inventory\Facades\Inventory;
use Vexaltrix\Inventory\DTOs\AdjustStock;
use Vexaltrix\Inventory\DTOs\TransferStock;
use Vexaltrix\Inventory\DTOs\Stocktake;
use Vexaltrix\Inventory\Enums\AdjustmentReason;

// ── Check stock ───────────────────────────────────────────────────────────────
$level = Inventory::getAvailableStock('SKU-001');
echo $level->available(); // on_hand - reserved

// Scope to a specific warehouse
$level = Inventory::getAvailableStock('SKU-001', warehouseId: 3);

// ── Reserve stock (anti-oversell) ─────────────────────────────────────────────
$inventory = Inventory::reserveStock(
    sku:         'SKU-001',
    qty:         5,
    referenceId: 'order-abc-123',
);

// Get the reservation token (stored in inv_reservations)
$token = \Vexaltrix\Inventory\Models\Reservation::where('reference_id', 'order-abc-123')
    ->latest()->first()->token;

// Later: commit (deducts on_hand) or release (frees reserved qty)
Inventory::commitReservation($token);
Inventory::releaseReservation($token);

// ── Adjust stock ──────────────────────────────────────────────────────────────
Inventory::adjustStock(new AdjustStock(
    sku:         'SKU-001',
    warehouseId: 1,
    qty:         -10,
    reason:      AdjustmentReason::Damaged,
    note:        'Water damage in bay 3',
));

// Shorthand helpers
AdjustStock::increase('SKU-001', warehouseId: 1, qty: 50, reason: AdjustmentReason::Found);
AdjustStock::decrease('SKU-001', warehouseId: 1, qty: 5,  reason: AdjustmentReason::Lost);

// ── Transfer between warehouses ───────────────────────────────────────────────
$transfer = Inventory::createTransfer(new TransferStock(
    sku:             'SKU-001',
    fromWarehouseId: 1,
    toWarehouseId:   2,
    qty:             20,
    note:            'Rebalancing stock',
));

// Mark as received at destination
Inventory::completeTransfer($transfer->id);

// ── Stocktake / physical count ────────────────────────────────────────────────
Inventory::countStock(new Stocktake(
    sku:         'SKU-001',
    warehouseId: 1,
    countedQty:  95,   // system had 100 → variance = -5
    note:        'Quarterly count',
    countedBy:   'Jane Smith',
));

// ── Movement audit log ────────────────────────────────────────────────────────
$movements = Inventory::movements('SKU-001', warehouseId: 1);
```

---

## Configuration

```env
INVENTORY_DRIVER=local              # local | http
INVENTORY_RESERVATION_TTL=900       # seconds before auto-expire
INVENTORY_LOCK_TTL=10               # Redis lock seconds
INVENTORY_IDEMPOTENCY_TTL=86400     # idempotency key lifetime (seconds)
INVENTORY_QUEUE_CONNECTION=redis
INVENTORY_QUEUE_NAME=inventory
INVENTORY_API_AUTH_ENABLED=true     # enable auth:sanctum on inventory API routes

# Frontend guard (Vue dashboard)
VITE_INVENTORY_REQUIRE_AUTH=true

# HTTP driver (microservice mode)
INVENTORY_SERVICE_URL=http://inventory-service
INVENTORY_SERVICE_TOKEN=secret
INVENTORY_SERVICE_TIMEOUT=5
```

---

## Architecture

```
Facade (Inventory::)
  └── InventoryRouter          ← picks local or HTTP driver at runtime
        ├── InventoryManager   ← local: delegates to Actions
        │     ├── GetAvailableStock
        │     ├── ReserveStock        ← Redis lock → DB FOR UPDATE → Reservation
        │     ├── ReleaseReservation
        │     ├── CommitReservation
        │     ├── CreateAdjustment
        │     ├── CreateTransfer
        │     ├── CompleteTransfer
        │     └── CountStock
        └── InventoryHttpClient ← HTTP: proxies to remote microservice
```

### Reserve Flow (anti-oversell detail)

```
reserveStock()
  1. Cache::lock("inv:reserve:{sku}:{warehouse}")   ← Redis distributed lock
  2. DB::transaction()
  3.   Inventory::lockForUpdate()                   ← DB pessimistic lock
  4.   check available = on_hand - reserved ≥ qty
  5.   increment reserved
  6.   create Reservation (token, expires_at)
  7.   create InventoryMovement (audit)
  8.   event(StockReserved)
  9.   → listener: ExpireReservationJob::dispatch()->delay(expires_at)
 10.   if Idempotency-Key exists:
       - lock idempotency record
       - same key + same payload => replay existing reservation
       - same key + different payload => 422
```

## Workflow

1. Order Flow (Reserve → Commit / Release)

```
sequenceDiagram
    participant Client
    participant API
    participant Inventory
    participant DB

    Client->>API: GET /stock/{sku}
    API->>Inventory: checkAvailable(sku)
    Inventory->>DB: read stock
    DB-->>Inventory: on_hand, reserved
    Inventory-->>API: available
    API-->>Client: stock response

    Client->>API: POST /reserve
    API->>Inventory: reserve(sku, qty)
    Inventory->>DB: lock + validate available
    alt enough stock
        Inventory->>DB: insert reservation
        Inventory->>DB: update reserved += qty
        Inventory-->>API: reservation token
        API-->>Client: 201 Created
    else out of stock
        Inventory-->>API: error
        API-->>Client: 422
    end

    alt Order Success
        Client->>API: POST /commit
        API->>Inventory: commit(token)
        Inventory->>DB: validate reservation
        Inventory->>DB: on_hand -= qty
        Inventory->>DB: reserved -= qty
        Inventory->>DB: mark committed
        API-->>Client: success
    else Order Cancel
        Client->>API: POST /release
        API->>Inventory: release(token)
        Inventory->>DB: reserved -= qty
        Inventory->>DB: mark released
        API-->>Client: success
    end
```

2. Transfer Flow (Kho → Kho)

```
sequenceDiagram
    participant Client
    participant API
    participant Inventory
    participant DB

    Client->>API: POST /transfers
    API->>Inventory: createTransfer
    Inventory->>DB: validate stock
    Inventory->>DB: on_hand (from) -= qty
    Inventory->>DB: create transfer (in_transit)
    API-->>Client: transfer created

    Client->>API: POST /transfers/{id}/complete
    API->>Inventory: completeTransfer
    Inventory->>DB: on_hand (to) += qty
    Inventory->>DB: update status completed
    API-->>Client: success
```

3. Adjustment Flow
```
sequenceDiagram
    participant Client
    participant API
    participant Inventory
    participant DB

    Client->>API: POST /adjust
    API->>Inventory: adjustStock
    Inventory->>DB: calculate new on_hand
    Inventory->>DB: insert movement log
    Inventory->>DB: update stock
    API-->>Client: 201 Created
```

4. Stocktake Flow
```
sequenceDiagram
    participant Staff
    participant API
    participant Inventory
    participant DB

    Staff->>API: POST /stocktakes (counted_qty)
    API->>Inventory: handleStocktake

    Inventory->>DB: get system_qty
    Inventory->>Inventory: variance = counted - system

    alt variance != 0
        Inventory->>DB: create adjustment (stocktake_correction)
        Inventory->>DB: update on_hand
    else no variance
        Inventory->>DB: mark completed
    end

    API-->>Staff: result
```

5. Full Lifecycle (End-to-End)
```
sequenceDiagram
    participant User
    participant System
    participant DB

    User->>System: Check stock
    System->>DB: read available
    DB-->>System: stock data

    User->>System: Reserve
    System->>DB: reserved += qty

    alt Order success
        User->>System: Commit
        System->>DB: on_hand -= qty
        System->>DB: reserved -= qty
    else Cancel
        User->>System: Release
        System->>DB: reserved -= qty
    end

    User->>System: Stocktake
    System->>DB: compare counted vs system
    System->>DB: auto adjust if needed
```
---

## Events

| Event | Payload |
|---|---|
| `StockReserved` | `Reservation` |
| `ReservationReleased` | `Reservation` |
| `ReservationCommitted` | `Reservation` |
| `ReservationExpired` | `Reservation` |
| `StockAdjusted` | `InventoryMovement, AdjustmentReason` |
| `TransferCreated` | `Transfer` |
| `TransferCompleted` | `Transfer` |

---

## HTTP API

All operations are available as REST endpoints. See **[CURL.md](./CURL.md)** for the full cURL reference.

Authentication endpoints:
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

Inventory endpoints:
```
GET    /api/inventory/warehouses
GET    /api/inventory/warehouses/{id}
GET    /api/inventory/stock/{sku}
GET    /api/inventory/movements/{sku}
POST   /api/inventory/reserve
POST   /api/inventory/reservations/{token}/release
POST   /api/inventory/reservations/{token}/commit
POST   /api/inventory/reservations/release-batch
POST   /api/inventory/reservations/commit-batch
POST   /api/inventory/adjust
POST   /api/inventory/transfers
POST   /api/inventory/transfers/{id}/complete
POST   /api/inventory/stocktakes
```

Reserve supports optional idempotency header:
```http
Idempotency-Key: reserve-order-abc-123-v1
```

Disable routes if using only the Facade/package internals:
```env
INVENTORY_ROUTES_ENABLED=false
```

---

## Testing

```bash
composer test
# or
./vendor/bin/phpunit
```
