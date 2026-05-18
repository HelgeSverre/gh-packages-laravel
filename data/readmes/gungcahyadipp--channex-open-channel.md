# Channex Open Channel PHP Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gungcahyadipp/channex-open-channel.svg?style=flat-square)](https://packagist.org/packages/gungcahyadipp/channex-open-channel)
[![Total Downloads](https://img.shields.io/packagist/dt/gungcahyadipp/channex-open-channel.svg?style=flat-square)](https://packagist.org/packages/gungcahyadipp/channex-open-channel)
[![License](https://img.shields.io/packagist/l/gungcahyadipp/channex-open-channel.svg?style=flat-square)](https://packagist.org/packages/gungcahyadipp/channex-open-channel)

PHP package untuk integrasi dengan [Channex Open Channel API](https://channex.io). Package ini mendukung penggunaan standalone (plain PHP 8.2+) maupun dengan Laravel framework.

## Requirements

- PHP 8.2 atau lebih tinggi
- Guzzle HTTP Client 7.0+

## Installation

```bash
composer require gungcahyadipp/channex-open-channel
```

## Quick Start (Laravel)

```bash
# 1. Publish semua file (config, controller, handlers, routes)
php artisan vendor:publish --tag=channex

# 2. Tambahkan ke routes/api.php
# require __DIR__ . '/channex.php';

# 3. Set environment variables di .env
```

**Environment Variables:**

```env
CHANNEX_API_KEY=open_channel_api_key
CHANNEX_INBOUND_API_KEY=your-inbound-api-key
CHANNEX_PROVIDER_CODE=OpenChannel
CHANNEX_ENVIRONMENT=staging
```

**Endpoints yang tersedia setelah publish:**

| Method | Endpoint |
|--------|----------|
| GET | `/api/channex/test_connection/` |
| GET | `/api/channex/mapping_details/` |
| GET\|POST | `/api/channex/changes/` |

---

## Laravel Setup (Detail)

### Publish Options

```bash
# Publish semua sekaligus
php artisan vendor:publish --tag=channex

# Atau publish terpisah:
php artisan vendor:publish --tag=channex-config      # config/channex.php
php artisan vendor:publish --tag=channex-controller  # ChannexController.php
php artisan vendor:publish --tag=channex-handlers    # Handler classes
php artisan vendor:publish --tag=channex-routes      # routes/channex.php
```

### Konfigurasi

**File: `config/channex.php`**

| Config Key | Description | Default |
|------------|-------------|---------|
| `api_key` | API key untuk mengirim request ke Channex | `open_channel_api_key` |
| `inbound_api_key` | API key untuk validasi request dari Channex | `null` |
| `provider_code` | Provider code unik dari Channex | `OpenChannel` |
| `environment` | `staging` atau `production` | `staging` |
| `endpoints.api` | Custom API endpoint (opsional) | `null` |
| `endpoints.secure` | Custom secure endpoint (opsional) | `null` |

### Default Endpoints

| Environment | API Endpoint | Secure Endpoint |
|-------------|--------------|-----------------|
| staging | `https://staging.channex.io/api/v1` | `https://secure-staging.channex.io/api/v1` |
| production | `https://app.channex.io/api/v1` | `https://secure.channex.io/api/v1` |

---

## Usage

### Push Booking (Laravel)

```php
use GungCahyadiPP\ChannexOpenChannel\Laravel\Facades\Channex;
use GungCahyadiPP\ChannexOpenChannel\DTOs\Booking;
use GungCahyadiPP\ChannexOpenChannel\DTOs\Customer;
use GungCahyadiPP\ChannexOpenChannel\DTOs\Room;
use GungCahyadiPP\ChannexOpenChannel\DTOs\Occupancy;
use GungCahyadiPP\ChannexOpenChannel\DTOs\RoomDay;

$booking = new Booking(
    status: Booking::STATUS_NEW,
    hotelCode: 'HOTEL123',
    arrivalDate: '2024-05-09',
    departureDate: '2024-05-10',
    currency: 'USD',
    customer: new Customer(surname: 'Doe', name: 'John'),
    rooms: [
        new Room(
            roomTypeCode: 'ROOM001',
            occupancy: new Occupancy(adults: 2),
            days: [
                new RoomDay(date: '2024-05-09', price: '100.00', ratePlanCode: 'RATE001')
            ]
        )
    ]
);

// Push ke Channex
$response = Channex::pushBooking($booking);

// Request full sync
Channex::requestFullSync('HOTEL123');
```

### Push Booking (Standalone PHP)

```php
use GungCahyadiPP\ChannexOpenChannel\ChannexConfig;
use GungCahyadiPP\ChannexOpenChannel\ChannexClient;

$config = new ChannexConfig(
    apiKey: 'your-api-key',
    providerCode: 'YOUR_PROVIDER_CODE',
    environment: 'staging'
);

$client = new ChannexClient($config);
$response = $client->pushBooking($booking);
```

---

## Implementing Channex Endpoints

Setelah publish, edit handler classes di `app/Handlers/Channex/`:

### 1. TestConnectionHandler

**File:** `app/Handlers/Channex/TestConnectionHandler.php`

```php
protected function validateHotelCode(string $hotelCode): bool
{
    // Cek apakah hotel_code valid di sistem Anda
    return Property::where('channex_code', $hotelCode)->exists();
}
```

### 2. MappingDetailsHandler

**File:** `app/Handlers/Channex/MappingDetailsHandler.php`

```php
protected function getRoomTypes(string $hotelCode): array
{
    $property = Property::where('channex_code', $hotelCode)->first();
    
    return $property->roomTypes->map(function ($room) {
        $roomType = new RoomType(id: (string) $room->id, title: $room->name);
        
        foreach ($room->ratePlans as $rate) {
            $roomType->addRatePlan(new RatePlan(
                id: (string) $rate->id,
                title: $rate->name,
                sellMode: RatePlan::SELL_MODE_PER_ROOM,
                maxPersons: $room->max_occupancy,
                currency: 'USD',
                readOnly: false
            ));
        }
        
        return $roomType;
    })->toArray();
}
```

### 3. ChangesHandler

**File:** `app/Handlers/Channex/ChangesHandler.php`

```php
protected function processAvailabilityChanges(string $hotelCode, array $changes): void
{
    foreach ($changes as $change) {
        Availability::updateOrCreate(
            ['room_type_id' => $change->roomTypeId, 'date' => $change->dateFrom],
            ['available' => $change->availability]
        );
    }
}

protected function processRestrictionChanges(string $hotelCode, array $changes): void
{
    foreach ($changes as $change) {
        $rate = $change->getRateForOccupancy();
        
        Restriction::updateOrCreate(
            ['rate_plan_id' => $change->ratePlanId, 'date' => $change->dateFrom],
            [
                'rate' => $rate?->getAmount(),
                'stop_sell' => $change->stopSell,
                'min_stay_arrival' => $change->minStayArrival,
            ]
        );
    }
}
```

---

## DTOs Reference

### Booking DTOs

| Class | Description |
|-------|-------------|
| `Booking` | Main booking object |
| `Customer` | Customer information |
| `Company` | Customer company info |
| `Room` | Booking room |
| `RoomDay` | Daily room pricing |
| `Occupancy` | Room occupancy (adults, children, infants) |
| `Guest` | Guest information |
| `Guarantee` | Credit card details (virtual card support) |
| `Service` | Extra services/fees |
| `Deposit` | Payment deposits |

### Mapping DTOs

| Class | Description |
|-------|-------------|
| `RoomType` | Room type for mapping |
| `RatePlan` | Rate plan for mapping |

### Changes DTOs

| Class | Description |
|-------|-------------|
| `AvailabilityChange` | Availability update from Channex |
| `RestrictionChange` | Rate/restriction update from Channex |
| `Rate` | Rate information |

---

## Booking Status Constants

```php
use GungCahyadiPP\ChannexOpenChannel\DTOs\Booking;

Booking::STATUS_NEW       // new
Booking::STATUS_MODIFIED  // modified
Booking::STATUS_CANCELLED // cancelled

Booking::PAYMENT_COLLECT  // collect
Booking::PAYMENT_PREPAID  // prepaid
```

---

## Testing

```bash
./vendor/bin/phpunit
```

## License

MIT License

## Links

- [Packagist](https://packagist.org/packages/gungcahyadipp/channex-open-channel)
- [GitHub](https://github.com/gungcahyadipp/channex-open-channel)
- [Channex API Documentation](https://docs.channex.io)
