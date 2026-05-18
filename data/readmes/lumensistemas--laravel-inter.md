# Laravel Inter

[![Latest Version on Packagist](https://img.shields.io/packagist/v/lumensistemas/laravel-inter.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/laravel-inter)
[![Tests](https://img.shields.io/github/actions/workflow/status/lumensistemas/laravel-inter/package-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/lumensistemas/laravel-inter/actions/workflows/package-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/lumensistemas/laravel-inter.svg?style=flat-square)](https://packagist.org/packages/lumensistemas/laravel-inter)

A typed, testable Laravel API client for [Banco Inter](https://developers.inter.co/). Supports billing (cobranca), multi-tenancy, and OAuth 2.0 + mTLS authentication.

**Requirements:** PHP 8.4+, Laravel 12+

## Installation

You can install the package via composer:

```bash
composer require lumensistemas/laravel-inter
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=inter-config
```

Add your credentials to `.env`:

```env
INTER_CLIENT_ID=your-client-id
INTER_CLIENT_SECRET=your-client-secret
INTER_CERTIFICATE=/path/to/certificate.crt
INTER_PRIVATE_KEY=/path/to/private.key
INTER_ENVIRONMENT=sandbox
INTER_CONTA_CORRENTE=
```

## Usage

### Billing (Cobranca)

```php
use LumenSistemas\Inter\Facades\Inter;

// Issue a new billing (boleto + Pix QR code)
$response = Inter::billing()->create(
    seuNumero: 'INV-001',
    valorNominal: 150.00,
    dataVencimento: '2026-05-01',
    numDiasAgenda: 30,
    pagador: [
        'cpfCnpj' => '12345678901',
        'tipoPessoa' => 'FISICA',
        'nome' => 'John Doe',
        'endereco' => 'Rua Example, 123',
        'cidade' => 'Curitiba',
        'uf' => 'PR',
        'cep' => '80000000',
    ],
);
// $response->data['codigoSolicitacao']

// Retrieve a billing
$billing = Inter::billing()->find('abc-123-def');
// $billing->data['cobranca'], $billing->data['boleto'], $billing->data['pix']

// List billings (paginated)
$page = Inter::billing()->list(
    dataInicial: '2026-04-01',
    dataFinal: '2026-04-30',
    situacao: 'A_RECEBER',
    tipoOrdenacao: 'DESC',
);

// Iterate through all pages automatically
foreach (Inter::billing()->all(['dataInicial' => '2026-04-01', 'dataFinal' => '2026-04-30']) as $item) {
    // ...
}

// Get billing PDF (base64)
$pdf = Inter::billing()->pdf('abc-123-def');

// Cancel a billing
Inter::billing()->cancel('abc-123-def', 'APEDIDODOCLIENTE');

// Summary grouped by status
$summary = Inter::billing()->summary(
    dataInicial: '2026-04-01',
    dataFinal: '2026-04-30',
);
```

### Billing Webhooks

```php
use LumenSistemas\Inter\Facades\Inter;

// Register a webhook URL
Inter::billingWebhook()->create('https://example.com/webhooks/inter/billing');

// Retrieve current webhook config
$webhook = Inter::billingWebhook()->retrieve();
// $webhook->data['webhookUrl'], $webhook->data['criacao']

// Delete the webhook
Inter::billingWebhook()->delete();

// Retrieve callback delivery history
$callbacks = Inter::billingWebhook()->callbacks(
    dataHoraInicio: '2026-04-01T00:00:00Z',
    dataHoraFim: '2026-04-30T23:59:59Z',
);
```

### Multi-Tenancy

Each tenant can use its own credentials:

```php
$tenant = Inter::client(
    clientId: $tenant->inter_client_id,
    clientSecret: $tenant->inter_client_secret,
    certificate: $tenant->inter_certificate_path,
    privateKey: $tenant->inter_private_key_path,
);

$tenant->billing()->create(...);
```

## Testing

```bash
composer test                # Unit + Feature tests
composer test:integration    # Integration tests (requires .env credentials)
```

### Webhook Development

Start a local webhook receiver and register it with Inter's sandbox:

```bash
composer webhook:serve       # Start receiver on port 8008
composer webhook:register    # Register TEST_EXPOSE_URL from .env with Inter
```

Use [Expose](https://expose.dev) or ngrok to tunnel the local server to a public URL.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/lumensistemas/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Lucas Vasconcelos](https://github.com/lucasvscn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
