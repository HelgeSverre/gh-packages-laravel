# Asaas Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/lumensistemas/asaas-laravel.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/asaas-laravel)
[![Tests](https://img.shields.io/github/actions/workflow/status/lumensistemas/asaas-laravel/package-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/lumensistemas/asaas-laravel/actions/workflows/package-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/lumensistemas/asaas-laravel.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/asaas-laravel)

A Laravel package for integrating with the [Asaas](https://www.asaas.com/) payment gateway API. Manage customers, payments (Boleto, Pix, Credit Card), bills, and webhooks with fully typed DTOs and enums.

## Installation

You can install the package via composer:

```bash
composer require lumensistemas/asaas-laravel
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=asaas-config
```

Add your credentials to `.env`:

```env
ASAAS_API_KEY=your-api-key
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=your-webhook-token
```

### Configuration

| Variable | Description | Default |
|---|---|---|
| `ASAAS_API_KEY` | Your Asaas API key | `""` |
| `ASAAS_ENVIRONMENT` | `production` or `sandbox` | `sandbox` |
| `ASAAS_TIMEOUT` | HTTP request timeout (seconds) | `30` |
| `ASAAS_CONNECT_TIMEOUT` | HTTP connection timeout (seconds) | `10` |
| `ASAAS_WEBHOOK_TOKEN` | Token for webhook signature verification | `""` |

## Usage

You can use the `Asaas` facade or inject `LumenSistemas\Asaas\Asaas` via the container.

### Customers

```php
use LumenSistemas\Asaas\Facades\Asaas;
use LumenSistemas\Asaas\DTOs\Customer\CreateCustomerData;
use LumenSistemas\Asaas\DTOs\Customer\UpdateCustomerData;
use LumenSistemas\Asaas\DTOs\Customer\CustomerListFilters;

// Create
$customer = Asaas::customers()->create(new CreateCustomerData(
    name: 'John Doe',
    cpfCnpj: '12345678901',
    email: 'john@example.com',
));

// Find
$customer = Asaas::customers()->find('cus_abc123');

// Update
$customer = Asaas::customers()->update('cus_abc123', new UpdateCustomerData(
    email: 'newemail@example.com',
));

// List with filters
$result = Asaas::customers()->list(new CustomerListFilters(
    limit: 20,
    name: 'John',
));

foreach ($result->data as $customer) {
    echo $customer->name;
}

// Delete and restore
Asaas::customers()->delete('cus_abc123');
Asaas::customers()->restore('cus_abc123');
```

### Payments

```php
use LumenSistemas\Asaas\Facades\Asaas;
use LumenSistemas\Asaas\DTOs\Payment\CreatePaymentData;
use LumenSistemas\Asaas\DTOs\Payment\PaymentDiscount;
use LumenSistemas\Asaas\DTOs\Payment\PaymentInterest;
use LumenSistemas\Asaas\DTOs\Payment\PaymentFine;
use LumenSistemas\Asaas\Enums\Payment\PaymentBillingType;

// Create a Pix payment
$payment = Asaas::payments()->create(new CreatePaymentData(
    customer: 'cus_abc123',
    billingType: PaymentBillingType::Pix,
    value: 100.00,
    dueDate: '2025-12-31',
    description: 'Order #1234',
    discount: new PaymentDiscount(value: 10.00, dueDateLimitDays: 5, type: 'FIXED'),
    interest: new PaymentInterest(value: 1.0),
    fine: new PaymentFine(value: 2.0, type: 'PERCENTAGE'),
));

// Get Pix QR code
$pix = Asaas::payments()->getPixQrCode($payment->id);
echo $pix->payload;       // Pix copy-paste code
echo $pix->encodedImage;  // Base64-encoded QR code image

// Get bank slip details
$bankSlip = Asaas::payments()->getIdentificationField($payment->id);
echo $bankSlip->identificationField; // Digitable line
echo $bankSlip->barCode;

// Get billing info (Pix, Credit Card, or Bank Slip depending on payment type)
$billingInfo = Asaas::payments()->getBillingInfo($payment->id);

// Get payment status
$status = Asaas::payments()->getStatus($payment->id);

// Refund (full or partial)
Asaas::payments()->refund($payment->id);
Asaas::payments()->refund($payment->id, value: 50.00, description: 'Partial refund');

// Receive in cash
Asaas::payments()->receiveInCash($payment->id, paymentDate: '2025-12-20');

// List, find, update, delete, restore
$result = Asaas::payments()->list();
$payment = Asaas::payments()->find('pay_abc123');
Asaas::payments()->delete('pay_abc123');
Asaas::payments()->restore('pay_abc123');
```

### Bills

```php
use LumenSistemas\Asaas\Facades\Asaas;
use LumenSistemas\Asaas\DTOs\Bill\CreateBillData;
use LumenSistemas\Asaas\DTOs\Bill\BillSimulateRequest;

// Simulate a bill payment
$simulation = Asaas::bills()->simulate(new BillSimulateRequest(
    identificationField: '23793.38128 60000.000003 00000.000400 1 84340000001000',
));

echo $simulation->fee;
echo $simulation->minimumScheduleDate;

// Create a bill payment
$bill = Asaas::bills()->create(new CreateBillData(
    identificationField: '23793.38128 60000.000003 00000.000400 1 84340000001000',
    scheduleDate: '2025-12-31',
    description: 'Utility bill',
));

// List, find, cancel
$result = Asaas::bills()->list();
$bill = Asaas::bills()->find('bill_abc123');
Asaas::bills()->cancel('bill_abc123');
```

### Webhooks

#### Managing webhook configurations

```php
use LumenSistemas\Asaas\Facades\Asaas;
use LumenSistemas\Asaas\DTOs\Webhook\CreateWebhookData;
use LumenSistemas\Asaas\Enums\Webhook\WebhookEvent;
use LumenSistemas\Asaas\Enums\Webhook\WebhookSendType;

// Create a webhook configuration
$webhook = Asaas::webhooks()->create(new CreateWebhookData(
    url: 'https://yourapp.com/webhooks/asaas',
    events: [WebhookEvent::PaymentReceived, WebhookEvent::PaymentOverdue],
    name: 'Payment notifications',
    email: 'admin@yourapp.com',
    sendType: WebhookSendType::Sequentially,
    authToken: 'your-secret-token',
));

// List, find, update, delete
$result = Asaas::webhooks()->list();
$webhook = Asaas::webhooks()->find('wbh_abc123');
Asaas::webhooks()->delete('wbh_abc123');

// Remove backoff penalty from interrupted webhook
Asaas::webhooks()->removeBackoff('wbh_abc123');
```

#### Handling incoming webhooks

Register the middleware in your route and use the `WebhookHandler` to process events:

```php
use Illuminate\Support\Facades\Route;
use LumenSistemas\Asaas\Webhook\WebhookHandler;
use LumenSistemas\Asaas\DTOs\Webhook\WebhookEventPayload;
use LumenSistemas\Asaas\Enums\Webhook\WebhookEvent;

Route::post('/webhooks/asaas', function (Request $request) {
    $handler = new WebhookHandler();

    $handler->on(WebhookEvent::PaymentReceived, function (WebhookEventPayload $payload) {
        // Handle payment received
        $payment = $payload->payment;
    });

    $handler->on(WebhookEvent::PaymentOverdue, function (WebhookEventPayload $payload) {
        // Handle overdue payment
    });

    $handler->onAny(function (WebhookEventPayload $payload) {
        // Runs for every event
    });

    $handler->handle(WebhookEventPayload::fromJson($request->getContent()));

    return response()->noContent();
})->middleware('asaas.webhook');
```

The `asaas.webhook` middleware verifies the `asaas-access-token` header against your `ASAAS_WEBHOOK_TOKEN` and returns a `401` response if the token is invalid.

### Multi-tenant usage

Override the API key at runtime for multi-tenant applications:

```php
$tenantAsaas = Asaas::withApiKey($tenant->asaas_api_key);
$customers = $tenantAsaas->customers()->list();
```

### Error handling

API errors throw `AsaasApiException`, which provides access to the HTTP response and structured error details:

```php
use LumenSistemas\Asaas\Exceptions\AsaasApiException;

try {
    Asaas::customers()->create(new CreateCustomerData(
        name: 'John Doe',
        cpfCnpj: 'invalid',
    ));
} catch (AsaasApiException $e) {
    $e->getStatusCode();  // HTTP status code
    $e->getErrors();      // [['code' => '...', 'description' => '...']]
    $e->getResponse();    // Full HTTP response
}
```

## Testing

Run the unit and feature tests (no API key required):

```bash
composer test
```

### Integration tests (live API)

Integration tests hit the real Asaas sandbox API. Set the required environment variables and run:

```bash
export ASAAS_TEST_API_KEY="your_sandbox_api_key"

./vendor/bin/pest --testsuite=Integration
```

### Webhook integration tests

Webhook tests verify end-to-end event delivery through a local server and a public tunnel:

1. Start the local webhook server:

```bash
composer webhook:serve
```

2. In another terminal, expose it via [Expose](https://github.com/beyondcode/expose):

```bash
expose share http://localhost:9876
```

3. Run the webhook tests:

```bash
export ASAAS_TEST_API_KEY="your_sandbox_api_key"
export ASAAS_WEBHOOK_URL="https://your-subdomain.sharedwithexpose.com"
export ASAAS_WEBHOOK_TOKEN="your_secret_token"  # optional

./vendor/bin/pest --testsuite=Integration --filter=Webhook
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/lumensistemas/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Lucas Vasconcelos](https://github.com/lumensistemas)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
