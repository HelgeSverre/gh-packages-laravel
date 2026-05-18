

# Laravel E-Invoice Suite

Multi-provider E-Invoice integration for Laravel 8+ (EY, Adaequare, etc.)

---

## Features

- Plug-and-play support for multiple e-invoice providers (EY, Adaequare, and more)
- Unified API for generating IRN, EWay Bill, and cancellations
- Easily extendable for new providers
- Simple configuration via config/einvoice.php or .env
- Clean, production-ready codebase

---

## Installation

### 1. Require the package via Composer

If published on Packagist:

```sh
composer require salmanahmad143/laravel-einvoice-suite
```

### 2. Publish the configuration file

```sh
php artisan vendor:publish --tag=einvoice-config
```

### 3. Configure your credentials

Edit `.env` or `config/einvoice.php` to set your API credentials for each provider:

```php
// .env example in case of EY..
EINVOICE_EY_API_URL=https://api.eyprovider.com
EINVOICE_EY_API_KEY=your-ey-api-key
EINVOICE_EY_USERNAME=your-ey-username
EINVOICE_EY_PASSWORD=your-ey-password


// .env example in case of Adaequare..
EINVOICE_API_MODE=TEST # or PRODUCTION (for Adaequare provider)
EINVOICE_ADAEQUARE_API_URL=https://api.adaequare.com
EINVOICE_ADAEQUARE_CLIENT_ID=your-adaequare-client-id
EINVOICE_ADAEQUARE_CLIENT_SECRET=your-adaequare-client-secret
EINVOICE_ADAEQUARE_USERNAME=your-adaequare-username
EINVOICE_ADAEQUARE_PASSWORD=your-adaequare-password
```

---

## Basic Usage

### 1. Import the Manager

```php
use LaravelEInvoiceSuite\EInvoiceManager;
```

### 2. Prepare Invoice Parameters

```php
$params = [
    'suppGstin' => '29ABCDE1234F2Z5',
    'docNo' => 'INV-1001',
    'docDate' => '01/04/2026',
    'docType' => 'INV',
    'custGstin' => '27ABCDE1234F1Z6',
    'custOrSupName' => 'Customer Name',
    'custOrSupAddr1' => 'Customer Address',
    'custPincode' => '400001',
    'billToState' => '27',
    'invAssessableAmt' => 1000,
    'invIgstAmt' => 0,
    'invCgstAmt' => 90,
    'invSgstAmt' => 90,
    'totalInvoiceAmount' => 1180,
    'lineItems' => [
        [
            'SlNo' => 1,
            'PrdDesc' => 'Product 1',
            'IsServc' => 'N',
            'HsnCd' => '1001',
            'Qty' => 1,
            'Unit' => 'NOS',
            'UnitPrice' => 1000,
            'TotAmt' => 1000,
            'Discount' => 0,
            'AssAmt' => 1000,
            'GstRt' => 18,
            'CgstAmt' => 90,
            'SgstAmt' => 90,
            'IgstAmt' => 0,
            'TotItemVal' => 1180
        ]
    ]
];
```

### 3. Generate IRN (Invoice Reference Number)

```php
// For EY Provider
$manager = new EInvoiceManager('ey');
$manager->setParameters($params);
$response = $manager->generateIrn();

// For Adaequare Provider
$manager = new EInvoiceManager('adaequare');
$manager->setParameters($params);
$response = $manager->generateIrn();

// Handle the response
if ($response['status']) {
    // Success
    print_r($response['data']);
} else {
    // Error
    echo 'Error: ' . $response['data'];
}
```

### 4. Generate EWay Bill

```php
$manager->setParameters($params); // Set parameters if not already set
$response = $manager->generateEwayBill();
```

### 5. Cancel EWay Bill

```php
$manager->setParameters([
    'ewbNo' => '123456789012',
    'canRemarks' => 'Order cancelled',
    'canReason' => '3',
]);
$response = $manager->cancelEwayBill();
```

### 6. Cancel IRN

```php
$manager->setParameters([
    'irn' => 'IRN1234567890',
    'canRemarks' => 'Wrong entry',
    'canReason' => '3',
]);
$response = $manager->cancelIrn();
```

---

## Configuration

The configuration file `config/einvoice.php` allows you to set credentials for each provider. Example:

```php
return [
    'default_provider' => env('EINVOICE_PROVIDER', 'ey'),
    'providers' => [
        'ey' => [
            'api_url' => env('EINVOICE_EY_API_URL'),
            'api_key' => env('EINVOICE_EY_API_KEY'),
            'username' => env('EINVOICE_EY_USERNAME'),
            'password' => env('EINVOICE_EY_PASSWORD'),
        ],
        'adaequare' => [
            'api_url' => env('EINVOICE_ADAEQUARE_API_URL'),
            'client_id' => env('EINVOICE_ADAEQUARE_CLIENT_ID'),
            'client_secret' => env('EINVOICE_ADAEQUARE_CLIENT_SECRET'),
            'username' => env('EINVOICE_ADAEQUARE_USERNAME'),
            'password' => env('EINVOICE_ADAEQUARE_PASSWORD'),
        ],
    ],
];
```

## Troubleshooting

- Ensure your credentials are correct in `.env` or `config/einvoice.php`.
- Check the API endpoints for each provider.
- Use try/catch to handle exceptions and log errors.

---

## License

MIT License. See LICENSE file for details.
