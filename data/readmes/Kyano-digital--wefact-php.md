# kyano-digital/wefact-php

A complete PHP client for the [WeFact API](https://developer.wefact.com) — covers all resources and every documented action. Works with Laravel (via ServiceProvider + Facade) and plain PHP.

## Installation

```bash
composer require kyano-digital/wefact-php
```

### Laravel setup

Laravel auto-discovers the ServiceProvider and Facade. Publish the config:

```bash
php artisan vendor:publish --tag=wefact-config
```

Add your API key to `.env`:

```env
WEFACT_API_KEY=your-api-key-here
```

### Plain PHP setup

```php
use KyanoDigital\WeFact\WeFact;

$wefact = new WeFact(apiKey: 'your-api-key-here');
```

## Usage

### Laravel

```php
use Kyano\WeFact\Facades\WeFact;

WeFact::debtors()->add([
    'CompanyName' => 'Company Inc.',
    'EmailAddress' => 'employee@company.inc',
]);

WeFact::invoices()->add([
    'DebtorCode' => 'DB10001',
    'InvoiceLines' => [
        ['Description' => 'Product', 'PriceExcl' => 150.00, 'TaxCode' => 'V21'],
    ],
]);
```

### Plain PHP

```php
use KyanoDigital\WeFact\WeFact;

$wefact = new WeFact(apiKey: 'your-api-key-here');

$debtor = $wefact->debtors()->add([
    'CompanyName'  => 'Company Inc.',
    'EmailAddress' => 'employee@company.inc',
]);
```

---

## Error Handling

All methods throw `WeFactException` on API errors or HTTP failures.

```php
use Kyano\WeFact\Exceptions\WeFactException;

try {
    WeFact::invoices()->add([...]);
} catch (WeFactException $e) {
    // Human-readable message
    $e->getMessage();

    // Array of WeFact API error strings
    $e->getApiErrors();

    // Full raw API response
    $e->getApiResponse();
}
```

---

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Kyano Digital B.V.
