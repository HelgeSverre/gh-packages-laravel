# Laravel 3X-UI Manager
 
<p>
<a href="https://packagist.org/packages/chamikasamaraweera/laravel-3x-ui-manager"><img src="https://img.shields.io/packagist/v/chamikasamaraweera/laravel-3x-ui-manager.svg" alt="Latest Version"></a>
<a href="https://packagist.org/packages/chamikasamaraweera/laravel-3x-ui-manager"><img src="https://img.shields.io/packagist/php-v/chamikasamaraweera/laravel-3x-ui-manager.svg" alt="PHP Version"></a>
<a href="https://packagist.org/packages/chamikasamaraweera/laravel-3x-ui-manager"><img src="https://img.shields.io/packagist/l/chamikasamaraweera/laravel-3x-ui-manager.svg" alt="License"></a>
</p>

A Laravel package to manage **multiple 3X-UI (Xray) panels** from a single billing or hosting control panel.

Designed for hosting businesses that sell VPN plans across multiple regional servers (EU, US, SG, AU, etc.) — each user buys a plan on a chosen server and this package handles the full lifecycle: provisioning, traffic sync, suspension, renewal, and termination.

---

## Features

- **Multi-panel support** — manage unlimited panels (EU, US, SG, AU, JP, …) each with its own credentials and custom base path
- **Custom URI path support** — works with 3X-UI's configurable web base path (`/xui`, `/base-xui`, `/mypath`, …)
- **Full client lifecycle** — create, enable/disable, reset traffic, renew, delete
- **Auto session management** — login, cookie caching, and automatic re-authentication on expiry
- **Traffic sync** — scheduled command syncs usage from all panels; auto-suspends over-quota or expired accounts
- **Local database** — `vpn_accounts` table mirrors panel state for fast queries without hitting the panel API
- **Complete API coverage** — all endpoints from the [official 3X-UI API wiki](https://github.com/MHSanaei/3x-ui/wiki/Configuration#api-documentation)
- **Laravel 10/11/12/13** compatible

---

## Requirements

- PHP `^8.3`
- Laravel `^10.0 | ^11.0 | ^12.0 | ^13.0`
- A running [3X-UI panel](https://github.com/MHSanaei/3x-ui) (any version with API enabled)

---

## Installation

### 1. Install via Composer

```bash
composer require chamikasamaraweera/laravel-3x-ui-manager
```

> **Local development:** If you are working with a local path repository, add it to your project's `composer.json` first:
> ```json
> "repositories": [
>     { "type": "path", "url": "./packages/laravel-3x-ui-manager" }
> ],
> "minimum-stability": "dev",
> "prefer-stable": true
> ```

### 2. Publish config and migrations

```bash
php artisan vendor:publish --tag=3xui-config
php artisan vendor:publish --tag=3xui-migrations
php artisan migrate
```

### 3. Configure `.env`

Add a block for each of your panels. The `BASE_PATH` must match the **URI Path** set in your 3X-UI panel under **Panel Settings**.

```env
# ── Europe ──────────────────────────────────────
THREEXUI_EU_URL=https://eu.yourdomain.com:8443
THREEXUI_EU_USER=admin
THREEXUI_EU_PASS=your_password
THREEXUI_EU_BASE_PATH=xui          # default — change if you set a custom path

# ── United States ────────────────────────────────
THREEXUI_US_URL=https://us.yourdomain.com:8443
THREEXUI_US_USER=admin
THREEXUI_US_PASS=your_password
THREEXUI_US_BASE_PATH=xui

# ── Singapore ────────────────────────────────────
THREEXUI_SG_URL=https://sg.yourdomain.com:8443
THREEXUI_SG_USER=admin
THREEXUI_SG_PASS=your_password
THREEXUI_SG_BASE_PATH=xui

# ── Global ───────────────────────────────────────
THREEXUI_DEFAULT_INBOUND_ID=1
```

> **Custom base path example:** If your panel URL is `https://host:8443/base-xui/panel/`, set `BASE_PATH=base-xui`.

---

## Configuration

The published config file is at `config/3xui.php`.

```php
'panels' => [
    'eu' => [
        'name'               => 'Europe',
        'url'                => env('THREEXUI_EU_URL'),
        'username'           => env('THREEXUI_EU_USER'),
        'password'           => env('THREEXUI_EU_PASS'),
        'base_path'          => env('THREEXUI_EU_BASE_PATH', 'xui'),
        'default_inbound_id' => 1,   // optional per-panel override
        'enabled'            => true,
    ],
    // add as many panels as you need …
],

'default_inbound_id' => env('THREEXUI_DEFAULT_INBOUND_ID', 1),
'session_ttl'        => 60,   // minutes — how long to cache login sessions
'timeout'            => 30,   // seconds — HTTP request timeout
```

---

## Quick Start

### Provision a VPN account when a user purchases a plan

```php
use ThreeXUI\Services\VpnAccountService;

class OrderController extends Controller
{
    public function completePurchase(Request $request, VpnAccountService $vpn)
    {
        $account = $vpn->provision(auth()->id(), $request->server, [
            'traffic_gb' => 50,   // GB quota  (0 = unlimited)
            'days'       => 30,   // expiry in days (0 = never)
            'limit_ip'   => 2,    // simultaneous device limit (0 = unlimited)
        ]);

        $order->update(['vpn_account_id' => $account->id]);

        return response()->json($account);
    }
}
```

### Show live traffic to the user

```php
use ThreeXUI\Facades\ThreeXUI;
use ThreeXUI\Models\VpnAccount;

class DashboardController extends Controller
{
    public function show()
    {
        $account = VpnAccount::forUser(auth()->id())->active()->firstOrFail();

        $traffic = ThreeXUI::getTraffic($account->panel_key, $account->email);
        $inbound = ThreeXUI::panel($account->panel_key)->getInbound($account->inbound_id);

        return view('vpn.dashboard', compact('account', 'traffic', 'inbound'));
    }
}
```

---

## Usage Reference

### `VpnAccountService`

The primary service for your billing system to call. Inject it via the constructor or use it directly.

```php
use ThreeXUI\Services\VpnAccountService;

$vpn = app(VpnAccountService::class);
```

#### `provision(int $userId, string $panelKey, array $options): VpnAccount`

Creates a client on the 3X-UI panel and stores the account in your local database.

```php
$account = $vpn->provision($user->id, 'sg', [
    'traffic_gb'  => 100,         // quota in GB, 0 = unlimited
    'days'        => 30,          // expiry from now, 0 = never
    'limit_ip'    => 3,           // max simultaneous connections
    'inbound_id'  => 2,           // override the default inbound
]);
```

Returns a `VpnAccount` model instance.

#### `suspend(VpnAccount $account): VpnAccount`

Disables the client on the panel and marks the local record as `suspended`.

```php
$vpn->suspend($account);
```

#### `unsuspend(VpnAccount $account): VpnAccount`

Re-enables the client and marks the local record as `active`.

```php
$vpn->unsuspend($account);
```

#### `renew(VpnAccount $account, int $additionalDays, ?int $newTrafficGB = null): VpnAccount`

Resets traffic, extends the expiry, and optionally changes the quota.

```php
// Extend by 30 days, keep existing quota
$vpn->renew($account, 30);

// Extend by 30 days and upgrade to 100 GB
$vpn->renew($account, 30, newTrafficGB: 100);
```

#### `terminate(VpnAccount $account): void`

Deletes the client from the panel and soft-deletes the local record.

```php
$vpn->terminate($account);
```

#### `syncTraffic(VpnAccount $account): VpnAccount`

Pulls live traffic from the panel into the local DB. Auto-suspends if over quota or expired.

```php
$account = $vpn->syncTraffic($account);
echo $account->traffic_used_gb; // e.g. 12.45
```

#### `syncAllTraffic(): void`

Syncs every active account in chunks of 100. Use this in the scheduled command.

---

### `ThreeXUI` Facade

Direct access to panel operations without the billing layer.

```php
use ThreeXUI\Facades\ThreeXUI;
```

| Method | Description |
|--------|-------------|
| `ThreeXUI::panel('sg')` | Returns a `PanelClient` for the given panel key |
| `ThreeXUI::availablePanels()` | Lists all enabled panels `[['key','name'], …]` |
| `ThreeXUI::createClient($panel, $options)` | Low-level client provisioning |
| `ThreeXUI::deleteClient($panel, $inboundId, $uuid)` | Remove a client |
| `ThreeXUI::getTraffic($panel, $email)` | Get formatted traffic stats |
| `ThreeXUI::suspendClient($panel, $inboundId, $email)` | Disable a client |
| `ThreeXUI::unsuspendClient($panel, $inboundId, $email)` | Enable a client |
| `ThreeXUI::resetTraffic($panel, $inboundId, $email)` | Reset usage counter |
| `ThreeXUI::serverStatus($panel)` | Server resource stats |
| `ThreeXUI::allServerStatuses()` | Stats for all panels at once |

---

### `PanelClient` — Raw API Access

For advanced use cases you can call the panel API directly.

```php
$client = ThreeXUI::panel('eu');
```

#### Inbounds

```php
$client->getInbounds();                        // GET  /panel/api/inbounds/list
$client->getInbound(int $id);                  // GET  /panel/api/inbounds/get/:id
$client->addInbound(array $payload);           // POST /panel/api/inbounds/add
$client->updateInbound(int $id, array $data);  // POST /panel/api/inbounds/update/:id
$client->deleteInbound(int $id);               // POST /panel/api/inbounds/del/:id
$client->resetAllTraffics();                   // POST /panel/api/inbounds/resetAllTraffics
$client->resetAllClientTraffics(int $id);      // POST /panel/api/inbounds/resetAllClientTraffics/:id
$client->deleteDepletedClients(int $id = -1);  // POST /panel/api/inbounds/delDepletedClients/:id
$client->importInbound(array $payload);        // POST /panel/api/inbounds/import
```

#### Clients

```php
$client->addClient(int $inboundId, array $payload);           // POST /panel/api/inbounds/addClient
$client->updateClient(string $uuid, array $payload);          // POST /panel/api/inbounds/updateClient/:clientId
$client->deleteClient(int $inboundId, string $uuid);          // POST /panel/api/inbounds/:id/delClient/:clientId
$client->deleteClientByEmail(int $inboundId, string $email);  // POST /panel/api/inbounds/:id/delClientByEmail/:email
$client->enableClient(int $inboundId, string $email);         // (fetches inbound → updateClient with enable=true)
$client->disableClient(int $inboundId, string $email);        // (fetches inbound → updateClient with enable=false)
```

#### Traffic & Stats

```php
$client->getClientTraffic(string $email);         // GET  /panel/api/inbounds/getClientTraffics/:email
$client->getClientTrafficById(int $inboundId);    // GET  /panel/api/inbounds/getClientTrafficsById/:id
$client->resetClientTraffic(int $id, string $email); // POST /panel/api/inbounds/:id/resetClientTraffic/:email
$client->updateClientTraffic(string $email, array $payload); // POST /panel/api/inbounds/updateClientTraffic/:email
$client->getOnlineClients();                      // POST /panel/api/inbounds/onlines
$client->getLastOnline();                         // POST /panel/api/inbounds/lastOnline
```

#### IP Management

```php
$client->getClientIps(string $email);    // POST /panel/api/inbounds/clientIps/:email
$client->clearClientIps(string $email);  // POST /panel/api/inbounds/clearClientIps/:email
```

#### Server

```php
$client->getServerStatus();    // POST /server/status
$client->getPanelBaseUrl();    // debug: returns resolved base URL
```

---

### `VpnAccount` Model

All provisioned accounts are stored in the `vpn_accounts` table.

```php
use ThreeXUI\Models\VpnAccount;
```

#### Scopes

```php
VpnAccount::active()->get();                  // status = active
VpnAccount::forUser($userId)->get();          // filter by user
VpnAccount::forPanel('sg')->get();            // filter by panel
VpnAccount::forUser($userId)->active()->first(); // combine scopes
```

#### Database columns

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | bigint | Your billing system user ID |
| `panel_key` | string | e.g. `sg`, `eu`, `us` |
| `inbound_id` | int | 3X-UI inbound ID |
| `client_uuid` | string | UUID used in 3X-UI |
| `email` | string | Unique identifier in 3X-UI (not a real email) |
| `traffic_limit_bytes` | bigint | `0` = unlimited |
| `expires_at` | timestamp | `null` = never expires |
| `status` | enum | `active` / `suspended` / `expired` / `deleted` |
| `traffic_used_up` | bigint | Upload bytes (synced from panel) |
| `traffic_used_down` | bigint | Download bytes (synced from panel) |
| `traffic_synced_at` | timestamp | Last sync time |

#### Computed accessors

```php
$account->traffic_used_bytes   // int   — up + down bytes
$account->traffic_used_gb      // float — e.g. 12.45
$account->traffic_limit_gb     // string — e.g. "50 GB" or "Unlimited"
$account->expiry_timestamp_ms  // int   — Unix ms for 3X-UI (0 = never)
$account->is_expired           // bool
$account->is_over_limit        // bool
```

---

## Scheduled Traffic Sync

Register the built-in command in your scheduler. In Laravel 10 (`app/Console/Kernel.php`):

```php
$schedule->command('threexui:sync-traffic')->everyFiveMinutes();
```

In Laravel 11+ (`routes/console.php`):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('threexui:sync-traffic')->everyFiveMinutes();
```

The command:
1. Fetches live traffic from all panels for every active account
2. Updates `traffic_used_up` / `traffic_used_down` in the local DB
3. Auto-suspends accounts that have exceeded their quota
4. Auto-suspends and marks as `expired` accounts past their `expires_at`

---

## Billing System Integration Examples

### Auto-suspend on invoice overdue

```php
// In your invoice webhook / event listener:
public function handle(InvoiceOverdue $event): void
{
    $account = VpnAccount::where('user_id', $event->invoice->user_id)
        ->active()
        ->first();

    if ($account) {
        app(VpnAccountService::class)->suspend($account);
    }
}
```

### Reactivate on payment

```php
public function handle(PaymentReceived $event): void
{
    $account = VpnAccount::where('user_id', $event->invoice->user_id)
        ->where('status', 'suspended')
        ->first();

    if ($account) {
        app(VpnAccountService::class)->unsuspend($account);
    }
}
```

### Plan upgrade — change quota and extend

```php
public function handleUpgrade(Request $request, VpnAccountService $vpn): void
{
    $account = VpnAccount::find($request->vpn_account_id);

    $vpn->renew($account, additionalDays: 30, newTrafficGB: 200);
}
```

### Get all server statuses for an admin dashboard

```php
$statuses = ThreeXUI::allServerStatuses();

// Returns:
// [
//   'eu' => ['cpu' => 12.4, 'mem' => [...], 'xray' => ['running' => true, ...]],
//   'sg' => ['cpu' => 8.1, ...],
//   'us' => ['error' => 'Connection timed out'],  ← panel offline, won't throw
// ]
```

### Add more panels at any time

Just add a new entry to `config/3xui.php` and the matching `.env` vars — no code changes needed:

```php
'panels' => [
    'eu' => [...],
    'us' => [...],
    'sg' => [...],
    'au' => [                                          // ← new panel
        'name'      => 'Australia',
        'url'       => env('THREEXUI_AU_URL'),
        'username'  => env('THREEXUI_AU_USER'),
        'password'  => env('THREEXUI_AU_PASS'),
        'base_path' => env('THREEXUI_AU_BASE_PATH', 'xui'),
        'enabled'   => true,
    ],
],
```

---

## API Endpoint Reference

All endpoints follow the structure:

```
https://{host}:{port}/{base_path}/{endpoint}
```

| Category | Base path |
|----------|-----------|
| Login | `/{base_path}/login` |
| Inbounds & Clients | `/{base_path}/panel/api/inbounds/…` |
| Server status | `/{base_path}/server/status` |

See the [official 3X-UI API documentation](https://github.com/MHSanaei/3x-ui/wiki/Configuration#api-documentation) for the full endpoint list.

---

## Troubleshooting

### `PanelAuthException: Login failed — HTTP 404`

Your `base_path` is wrong. Open your panel URL in a browser. If it loads at `https://host:8443/mypath/panel/`, then set `BASE_PATH=mypath`.

### `PanelAuthException: No session cookie returned`

The panel returned a successful login response but no cookie. Make sure your panel URL uses `http://` or `https://` correctly and that the panel's SSL certificate is valid (or set `verify => false` which is already the default).

### `PanelException: Client [email] not found in inbound`

The email identifier does not exist on the panel. This can happen if the client was manually deleted from the panel UI. Call `terminate()` to clean up the local record.

### `composer require` fails — version conflict

Make sure your project's `composer.json` has:
```json
"minimum-stability": "dev",
"prefer-stable": true
```

---

## Changelog

### v1.0.0
- Initial release
- Full 3X-UI API coverage (`/panel/api/inbounds/*`)
- Multi-panel routing with per-panel `base_path`
- `VpnAccountService` with provision / suspend / renew / terminate / syncTraffic
- `VpnAccount` Eloquent model with scopes and computed accessors
- `threexui:sync-traffic` Artisan command
- Laravel 10 / 11 / 12 / 13 support

---

## License

MIT — see [LICENSE](LICENSE).

---

## Credits

Built on top of the [3X-UI panel](https://github.com/MHSanaei/3x-ui) by [@MHSanaei](https://github.com/MHSanaei).
