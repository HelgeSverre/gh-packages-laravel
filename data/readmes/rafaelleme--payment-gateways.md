# rafaelleme/payment-gateways

PHP library for payment gateway integration built for **Laravel**, following **DDD** and **Ports & Adapters** principles.

Supports multiple providers. Currently implemented: **Asaas**.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.1 |
| Laravel | ^10.0\|^11.0\|^12.0 |
| `guzzlehttp/guzzle` | ^7.0 |
| `psr/log` | ^3.0 |

> All `illuminate/*` packages come bundled with Laravel — no extra installation needed.

---

## Installation

```bash
composer require rafaelleme/payment-gateways
```

The `ServiceProvider` and `Facade` are auto-discovered via `composer.json`.

---

## Architecture

The **core** (Domain + Application) is fully decoupled from Laravel.
The **Laravel layer** wires everything together via `ServiceProvider`, `Facade`, `Webhooks` and route registration.

```
src/
├── Core/
│   ├── Domain/
│   │   ├── Contracts/
│   │   │   └── GatewayContract.php         # Single port (payments + customers + subscriptions)
│   │   ├── Entities/
│   │   │   ├── Payment.php
│   │   │   ├── Customer.php
│   │   │   └── Subscription.php
│   │   ├── ValueObjects/
│   │   │   ├── Money.php
│   │   │   ├── CustomerId.php
│   │   │   ├── CreditCard.php
│   │   │   ├── CreditCardData.php
│   │   │   ├── CreditCardHolderInfo.php
│   │   │   └── CreditCardToken.php
│   │   ├── Enums/
│   │   │   ├── BillingType.php
│   │   │   ├── PaymentStatus.php
│   │   │   ├── SubscriptionCycle.php
│   │   │   └── SubscriptionStatus.php
│   │   └── Exceptions/
│   │       ├── PaymentException.php
│   │       ├── CustomerException.php
│   │       └── SubscriptionException.php
│   └── Application/
│       └── Services/
│           ├── PaymentService.php
│           ├── CustomerService.php
│           └── SubscriptionService.php
├── Infrastructure/
│   ├── Gateways/
│   │   ├── Asaas/
│   │   │   ├── AsaasGateway.php            # Single adapter — implements GatewayContract
│   │   │   ├── AsaasClient.php             # HTTP communication
│   │   │   ├── Payments/AsaasPaymentMapper.php
│   │   │   ├── Customers/AsaasCustomerMapper.php
│   │   │   ├── Subscriptions/AsaasSubscriptionMapper.php
│   │   │   └── CreditCard/AsaasCreditCardMapper.php
│   │   └── FakeGateway.php                 # In-memory implementation for tests
│   └── Http/
│       └── GuzzleHttpClient.php
├── Support/
│   └── GatewayManager.php                  # Driver registry with lazy loading
└── Laravel/
    ├── PaymentGatewaysServiceProvider.php
    ├── Facades/
    │   └── PaymentGateway.php
    ├── Webhooks/
    │   ├── AsaasWebhookController.php
    │   ├── AsaasWebhookHandler.php
    │   └── Events/
    │       ├── PaymentReceived.php
    │       ├── PaymentOverdue.php
    │       └── PaymentRefused.php
    └── routes/
        └── webhooks.php
```

> **No DTOs.** Gateways receive and return domain entities directly.

---

## Setup

### 1. Run the install command

```bash
php artisan payment-gateways:install
```

This command will:

- Publish `config/payment-gateways.php` to your application's `config/` directory
- Publish all migrations to your application's `database/migrations/` directory
- Display all required `.env` variables

**Options:**

| Option | Description |
|---|---|
| `--force` | Overwrite already published files |
| `--without-migrations` | Skip publishing migrations |

### 2. Run the migrations

```bash
php artisan migrate
```

This creates the `gateway_customers`, `gateway_subscriptions` and `gateway_payments` tables.

### 3. Configure `.env`

```dotenv
PAYMENT_GATEWAY_DEFAULT=asaas
PAYMENT_GATEWAY_GRACE_PERIOD_DAYS=3

ASAAS_API_KEY=your-api-key

# Production
ASAAS_BASE_URL=https://api.asaas.com

# Sandbox
# ASAAS_BASE_URL=https://api-sandbox.asaas.com
```

> The consuming project controls the URL — no sandbox flag in the library.

### 4. (Optional) Configure the Asaas webhook

Register the following URL in the Asaas dashboard:

```
https://your-domain.com/webhooks/asaas
```

Add the route to the CSRF exception list in your application:

```php
// app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    'webhooks/asaas',
];
```

---

### Manual publish (alternative)

If you prefer to publish assets individually:

```bash
# Config only
php artisan vendor:publish --tag=payment-gateways-config

# Migrations only
php artisan vendor:publish --tag=payment-gateways-migrations
```

---

## Usage

### Via Facade

```php
use Rafaelleme\PaymentGateways\Laravel\Facades\PaymentGateway;
use Rafaelleme\PaymentGateways\Core\Domain\Entities\Customer;
use Rafaelleme\PaymentGateways\Core\Domain\Entities\Payment;
use Rafaelleme\PaymentGateways\Core\Domain\Entities\Subscription;
use Rafaelleme\PaymentGateways\Core\Domain\Enums\BillingType;
use Rafaelleme\PaymentGateways\Core\Domain\Enums\SubscriptionCycle;
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\CustomerId;
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\Money;

// --- Customers ---
$customer = PaymentGateway::createCustomer(new Customer(
    name:    'John Doe',
    email:   'john@example.com',
    cpfCnpj: '12345678900',
));

// --- Payments ---
$payment = PaymentGateway::createPayment(new Payment(
    customerId:  new CustomerId($customer->id),
    value:       new Money(149.90),
    billingType: BillingType::PIX,
    dueDate:     '2026-05-01',
));

// --- Subscriptions ---
$subscription = PaymentGateway::createSubscription(new Subscription(
    customerId:  new CustomerId($customer->id),
    value:       new Money(29.90),
    billingType: BillingType::CREDIT_CARD,
    cycle:       SubscriptionCycle::MONTHLY,
    nextDueDate: '2026-05-01',
));

// --- Switch driver at runtime ---
PaymentGateway::driver('stripe')->createPayment($payment);
```

### Via Dependency Injection

```php
use Rafaelleme\PaymentGateways\Core\Domain\Contracts\GatewayContract;

class PaymentController extends Controller
{
    public function __construct(private GatewayContract $gateway) {}
}
```

---

## Credit Card

### With token

```php
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\CreditCard;
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\CreditCardHolderInfo;

$subscription = new Subscription(
    // ...
    creditCard: new CreditCard(
        holderInfo: new CreditCardHolderInfo(
            name:          'John Doe',
            email:         'john@example.com',
            cpfCnpj:       '12345678900',
            postalCode:    '01310-100',
            addressNumber: '100',
        ),
        token: 'tok_abc123',
    ),
);
```

### With raw card data

```php
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\CreditCardData;

$subscription = new Subscription(
    // ...
    creditCard: new CreditCard(
        holderInfo: new CreditCardHolderInfo(/* ... */),
        cardData: new CreditCardData(
            holderName:  'John Doe',
            number:      '4111111111111111',
            expiryMonth: '12',
            expiryYear:  '2030',
            ccv:         '123',
        ),
    ),
);
```

### Tokenize a card

```php
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\CreditCardData;

$token = PaymentGateway::tokenizeCreditCard('cus_abc123', new CreditCardData(
    holderName:  'John Doe',
    number:      '4111111111111111',
    expiryMonth: '12',
    expiryYear:  '2030',
    ccv:         '123',
));

$token->token;       // 8608b88a-f74f-4f22-b3a1-dbbfc4c42cc9
$token->brand;       // VISA
$token->last4Digits; // 1111
```

---

## Webhooks

The package registers `POST /webhooks/asaas` automatically via the `ServiceProvider`.

> ⚠️ Add `/webhooks/asaas` to the `$except` list in your application's `VerifyCsrfToken` middleware.

### Asaas events → Laravel events

| Asaas event | Laravel event dispatched |
|---|---|
| `PAYMENT_RECEIVED` | `PaymentReceived` |
| `PAYMENT_CONFIRMED` | `PaymentReceived` |
| `PAYMENT_OVERDUE` | `PaymentOverdue` |
| `PAYMENT_REFUSED` | `PaymentRefused` |

Unknown events are silently ignored.

### Register listeners

```php
// app/Providers/EventServiceProvider.php
use Rafaelleme\PaymentGateways\Laravel\Webhooks\Events\PaymentReceived;
use Rafaelleme\PaymentGateways\Laravel\Webhooks\Events\PaymentOverdue;
use Rafaelleme\PaymentGateways\Laravel\Webhooks\Events\PaymentRefused;

protected $listen = [
    PaymentReceived::class => [HandlePaymentReceived::class],
    PaymentOverdue::class  => [HandlePaymentOverdue::class],
    PaymentRefused::class  => [HandlePaymentRefused::class],
];
```

### Access payment data in a listener

```php
public function handle(PaymentReceived $event): void
{
    $event->payment['id'];           // pay_xxx
    $event->payment['subscription']; // sub_xxx
    $event->payment['value'];        // 49.90
    $event->payment['status'];       // RECEIVED
}
```

---

## Error Handling

Each context has its own typed exception:

```php
use Rafaelleme\PaymentGateways\Core\Domain\Exceptions\PaymentException;
use Rafaelleme\PaymentGateways\Core\Domain\Exceptions\CustomerException;
use Rafaelleme\PaymentGateways\Core\Domain\Exceptions\SubscriptionException;

try {
    PaymentGateway::createPayment($payment);
} catch (PaymentException $e) { ... }

try {
    PaymentGateway::getCustomer('cus_missing');
} catch (CustomerException $e) { ... }

try {
    PaymentGateway::cancelSubscription('sub_missing');
} catch (SubscriptionException $e) { ... }
```

---

## Adding a New Gateway

1. Create `src/Infrastructure/Gateways/{Gateway}/`
2. Implement `{Gateway}Gateway.php implements GatewayContract`
3. Register in `GatewayManager`

```php
$manager->extend('stripe', fn () => new StripeGateway(apiKey: 'sk_live_...'));
```

No changes needed to the core or application layers.

---

## Testing

Use `FakeGateway` to avoid hitting external APIs:

```php
use Rafaelleme\PaymentGateways\Infrastructure\Gateways\FakeGateway;

$gateway = new FakeGateway();

$customer = $gateway->createCustomer(new Customer(name: 'John', email: 'j@j.com'));
$payment  = $gateway->createPayment(new Payment(/* ... */));

$gateway->hasPayment($payment->id);   // true
$gateway->hasCustomer($customer->id); // true
$gateway->reset();                    // clear state between tests
```

### Running the test suite

```bash
docker compose run --rm php ./vendor/bin/phpunit
docker compose run --rm php ./vendor/bin/phpstan analyze
docker compose run --rm php ./vendor/bin/php-cs-fixer fix
```

---

## License

MIT

## Coupons (Stripe)

### Apply a coupon to a new subscription

```php
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\Coupon;

$subscription = new Subscription(
    // ...
    coupon: new Coupon(
        code:                'DISCOUNT50',
        discountPercentage:  '50',
    ),
);

$createdSubscription = PaymentGateway::createSubscription($subscription);
```

### Apply a coupon to an existing subscription

```php
use Rafaelleme\PaymentGateways\Core\Application\Services\CouponService;
use Rafaelleme\PaymentGateways\Core\Domain\ValueObjects\Coupon;

$couponService = app(CouponService::class);

$updatedSubscription = $couponService->applyCouponToSubscription(
    subscriptionId: 'sub_abc123',
    coupon: new Coupon(
        code:                'WELCOME20',
        discountPercentage:  '20',
    ),
);
```
