# anselmi-dev/sumsub

Base Laravel package to integrate the [Sumsub](https://sumsub.com) API (KYC / identity verification).

Provides everything needed to work with Sumsub: signed HTTP client, applicant creation, SDK tokens, webhooks, and events.

> **Using Livewire?** Install [`anselmi-dev/livewire-sumsub`](https://github.com/anselmi-dev/livewire-sumsub) only — it includes this package as a dependency and centralizes credentials + widget in a single install.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.3 |
| Laravel | ^11.0 \| ^12.0 \| ^13.0 |
| guzzlehttp/guzzle | ^7.0 |

---

## Installation

```bash
composer require anselmi-dev/sumsub:^1.0
```

The service provider is registered automatically via Laravel package discovery.

---

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=sumsub-config
```

This creates `config/sumsub.php`. Add the variables to your `.env`:

```env
SUMSUB_APP_TOKEN=your-app-token
SUMSUB_SECRET_KEY=your-secret-key
SUMSUB_BASE_URL=https://api.sumsub.com
SUMSUB_WEBHOOK_SECRET=your-webhook-secret
SUMSUB_DEFAULT_LEVEL=basic-kyc-level
SUMSUB_WEBHOOK_ROUTE=webhooks/sumsub
SUMSUB_WEBHOOK_ROUTE_NAME=sumsub.webhook
```

Webhook jobs use Laravel's default queue (`QUEUE_CONNECTION` in `config/queue.php`).

The **App Token** and **Secret Key** are in the Sumsub dashboard: **Developer Tools → App Tokens**.

---

## Database

The package loads migrations automatically. Run:

```bash
php artisan migrate
```

To customize the migration before running it:

```bash
php artisan vendor:publish --tag=sumsub-migrations
php artisan migrate
```

Table created: `sumsub_applicants` (`tenant_id`, `user_id`, `applicant_id`, `level_name`, `review_status`, `review_answer`, `raw_data`).

---

## Usage

### Create an applicant

```php
use AnselmiDev\Sumsub\Facades\Sumsub;

$applicant = Sumsub::createApplicant(auth()->user());
```

Optional verification level:

```php
$applicant = Sumsub::createApplicant(auth()->user(), 'advanced-kyc-level');
```

If the user already has a local applicant, the existing record is returned (idempotent). If Sumsub responds with **409** (applicant exists in Sumsub but not in your DB), the package recovers it by `externalUserId` and syncs locally.

### Generate SDK token (frontend)

```php
$result = Sumsub::generateSdkToken(auth()->user());

// [
//     'token'  => 'eyJhbGci...',
//     'userId' => '5cb56e8e...',
// ]
```

Pass it to the [Sumsub Web SDK](https://developers.sumsub.com/web-sdk/):

```js
const snsWebSdkInstance = snsWebSdk
    .init(token, () => getNewAccessToken())
    .withConf({ lang: 'en' })
    .build();

snsWebSdkInstance.launch('#sumsub-websdk-container');
```

### Check status

```php
use AnselmiDev\Sumsub\Models\SumsubApplicant;

$applicant = SumsubApplicant::where('user_id', auth()->id())->latest()->first();

// Simplified status (pending | progress | completed | cancelled)
$applicant->status->value;
$applicant->status->label();
$applicant->status->color();

$applicant->status->isPending();
$applicant->status->isProgress();
$applicant->status->isCompleted();
$applicant->status->isCancelled();
```

### Refresh from the Sumsub API

```php
$applicant = Sumsub::refreshApplicant($applicant);
```

---

## UI in the host application

This package **does not include** Livewire components or Blade views. It exposes `KycVerificationState` to map domain state to widget state:

| Source | Method |
|---|---|
| Persisted `SumsubApplicant` | `KycVerificationState::fromApplicant($applicant)` or `$applicant->verificationState()` |
| `SumsubStatus` | `KycVerificationState::fromSumsubStatus($status)` |
| SDK event (`reviewAnswer`) | `KycVerificationState::fromReviewAnswer('GREEN')` |

Enum states: `idle`, `loading`, `sdk_ready`, `progress`, `completed`, `cancelled`, `error`.

Example in Livewire:

```php
use AnselmiDev\Sumsub\Contracts\KycRepositoryInterface;
use AnselmiDev\Sumsub\DataTypes\KycVerificationState;
use AnselmiDev\Sumsub\Services\SumsubService;

public string $state = KycVerificationState::Idle->value;

public function mount(KycRepositoryInterface $repository): void
{
    $applicant = $repository->findByUserId(auth()->id());
    if ($applicant) {
        $this->state = $applicant->verificationState()->value;
    }
}

public function startVerification(SumsubService $sumsub): void
{
    $this->state = KycVerificationState::Loading->value;
    $result = $sumsub->generateSdkToken(auth()->user());
    $this->state = KycVerificationState::SdkReady->value;
}
```

---

## Webhooks

Route registered automatically:

```
POST /webhooks/sumsub
```

Configure this URL in Sumsub (**Webhooks**). The controller validates the HMAC-SHA256 signature with `SUMSUB_WEBHOOK_SECRET` and queues `ProcessSumsubWebhook`.

Exclude the route from CSRF if applicable:

```php
// bootstrap/app.php
$middleware->validateCsrfTokens(except: [
    'webhooks/sumsub',
]);
```

Customize URI and route name in `.env`:

```env
SUMSUB_WEBHOOK_ROUTE=webhooks/sumsub
SUMSUB_WEBHOOK_ROUTE_NAME=sumsub.webhook
```

---

## Events

| Event | When it fires |
|---|---|
| `ApplicantCreated` | After creating an applicant in Sumsub and saving it locally |
| `ApplicantStatusChanged` | Every webhook that updates the local record |
| `ApplicantReviewed` | When a final result arrives (`GREEN` / `RED` / `RETRY`) |

### Example: mark KYC verified on approval

```php
use AnselmiDev\Sumsub\Events\ApplicantReviewed;
use Illuminate\Support\Facades\Event;

Event::listen(ApplicantReviewed::class, function (ApplicantReviewed $event) {
    if ($event->isApproved()) {
        $event->applicant->user->update(['kyc_verified_at' => now()]);
    }

    if ($event->isRejected()) {
        // notify, update status, etc.
    }
});
```

Helpers on `ApplicantReviewed`:

```php
$event->applicant;
$event->reviewAnswer;    // 'GREEN' | 'RED' | 'RETRY'
$event->webhookPayload;

$event->isApproved();
$event->isRejected();
$event->needsRetry();
```

---

## Replace the repository (advanced)

By default, `SumsubApplicantRepository` is used on the `sumsub_applicants` table.

To use your own models, implement `KycRepositoryInterface` and register it in `AppServiceProvider`:

```php
use AnselmiDev\Sumsub\Contracts\KycRepositoryInterface;
use App\Repositories\MyCustomKycRepository;

public function register(): void
{
    $this->app->bind(KycRepositoryInterface::class, MyCustomKycRepository::class);
}
```

```php
use AnselmiDev\Sumsub\Contracts\KycRepositoryInterface;
use AnselmiDev\Sumsub\Models\SumsubApplicant;

class MyCustomKycRepository implements KycRepositoryInterface
{
    public function findByUserId(int|string $userId): ?SumsubApplicant { ... }
    public function findByApplicantId(string $applicantId): ?SumsubApplicant { ... }
    public function create(array $data): SumsubApplicant { ... }
    public function updateStatus(string $applicantId, array $data): SumsubApplicant { ... }
}
```

---

## SaaS / multi-tenant mode

Enable in `.env`:

```env
SUMSUB_SAAS_MODE=true
```

Use `forTenant()` to scope applicants and optionally use per-tenant credentials:

```php
Sumsub::forTenant(
    tenantId: $tenant->id,
    appToken: $tenant->sumsub_app_token,   // optional
    secretKey: $tenant->sumsub_secret_key, // optional
)->createApplicant($user);
```

---

## Full KYC flow

```
1. User starts verification (UI in your app)
2. Backend: Sumsub::createApplicant($user)
3. Backend: Sumsub::generateSdkToken($user)
4. Frontend: Sumsub Web SDK with the token
5. User uploads documents to Sumsub
6. Sumsub → POST /webhooks/sumsub
7. Package validates signature and processes ProcessSumsubWebhook
8. Job updates SumsubApplicant and dispatches ApplicantReviewed
9. Your listener updates the user / sends notifications
```

---

## Facade reference

```php
use AnselmiDev\Sumsub\Facades\Sumsub;

Sumsub::createApplicant(Authenticatable $user, ?string $levelName = null): SumsubApplicant
Sumsub::generateSdkToken(Authenticatable $user, ?string $levelName = null): array
Sumsub::refreshApplicant(SumsubApplicant $applicant): SumsubApplicant
Sumsub::forTenant(string $tenantId, ?string $appToken = null, ?string $secretKey = null): SumsubService
```

---

## Package structure

```
anselmi-dev/sumsub/
├── config/
│   └── sumsub.php              # Publishable config
├── database/
│   └── migrations/             # Publishable migrations
├── routes/
│   └── api.php                 # Webhook route
├── src/
│   ├── Console/                # Artisan commands
│   ├── Contracts/              # SumsubClientInterface, KycRepositoryInterface
│   ├── DataTypes/              # SumsubStatus, KycVerificationState
│   ├── Events/                 # ApplicantCreated, ApplicantReviewed, …
│   ├── Facades/                # Sumsub
│   ├── Http/
│   │   ├── Client/             # SumsubClient (signed REST API)
│   │   └── Webhooks/           # SumsubWebhookController
│   ├── Jobs/                   # ProcessSumsubWebhook
│   ├── Models/                 # SumsubApplicant
│   ├── Repositories/           # SumsubApplicantRepository
│   ├── Services/               # SumsubService
│   └── SumsubServiceProvider.php
└── tests/
```

Design conventions and decisions: see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Simulate webhooks (non-production only)

```bash
php artisan sumsub:simulate-webhook --answer=GREEN --sync

php artisan sumsub:simulate-webhook 5cb56e8e0a975a35f333cb83 --answer=RED
```

---

## Publishing assets

| Tag | Command | Destination |
|---|---|---|
| Config | `php artisan vendor:publish --tag=sumsub-config` | `config/sumsub.php` |
| Migrations | `php artisan vendor:publish --tag=sumsub-migrations` | `database/migrations/` |

---

## License

MIT
