# TLT Verifactu
A Laravel package for EU VAT validation and VERIFACTU support. This package can be used with any 
invoicing system (SIF). You must submit the declaration of responsibility (declaración responsable) for 
your system yourself.

**Please note: Canary, Ceuta and Melilla tax modes are not supported.**

## Installation

### Prerequisites
PHP 8.3 or above with the dom, json, libxml, openssl, and soap extensions installed and enabled. 
Laravel 11 or 12 is required.

### Requirements for QR Code Generator
- [`ext-gd`](https://www.php.net/manual/book.image) for `Gdlib` based output **or**
- [`ext-imagick`](https://github.com/Imagick/imagick) with [ImageMagick](https://imagemagick.org) installed
- [`ext-fileinfo`](https://www.php.net/manual/book.fileinfo.php) required by `Imagick` output

### OpenSSL Configuration
The Spanish FNMT certification authority uses outdated encryption algorithms that are not supported by 
OpenSSL 3.0 and above.

For OpenSSL versions higher than 3.0, you must enable legacy encryption methods. To do this, open your 
`openssl.conf` (e.g., `/etc/ssl/openssl.cnf` on Ubuntu/Debian) and add the following:

```
[openssl_init]
providers = provider_sect

# List of providers to load
[provider_sect]
default = default_sect
legacy = legacy_sect

[default_sect]
activate = 1

[legacy_sect]
activate = 1
```

To install the package, run:

```bash
composer require taiwanleaftea/tlt-verifactu
```

```bash
php artisan vendor:publish --tag=tlt-verifactu --ansi --force
```

The package will be installed, and `config/tlt-verifactu.php` will be published.

Open your `.env` file and add the variables `VERIFACTU_PRODUCTION` (set to true to use the production AEAT server) 
and `VERIFACTU_DISK` (the disk where SSL certificates are stored).

## Usage

### VAT Number Validator

```php
use Taiwanleaftea\TltVerifactu\Support\Facades\VatValidator

// Offline validation by format
echo VatValidator::formatValid('ES', 'B12345678');

// Online validation via the VIES service
$response = VatValidator::online('ES', 'B12345678');
if ($response->success) {
    // VAT number present in the VIES database
    echo $response->valid;
    // Data returned from the VIES database (varies per country)
    echo $response->vatNumber;
    echo $response->countryCode;
    echo $response->requestDate
    echo $response->name
    echo $response->address;
} else {
    foreach ($response->errors as $error) {
        echo $error . PHP_EOL;
    }
}
```

### VERIFACTU Service

#### Register Invoice
```php
use Illuminate\Support\Carbon;
use Taiwanleaftea\TltVerifactu\Classes\Certificate;
use Taiwanleaftea\TltVerifactu\Classes\LegalPerson;
use Taiwanleaftea\TltVerifactu\Classes\Recipient;
use Taiwanleaftea\TltVerifactu\Enums\EstadoRegistro;
use Taiwanleaftea\TltVerifactu\Enums\IdType;
use Taiwanleaftea\TltVerifactu\Enums\InvoiceType;
use Taiwanleaftea\TltVerifactu\Enums\OperationQualificationType;
use Taiwanleaftea\TltVerifactu\Exceptions\CertificateException;
use Taiwanleaftea\TltVerifactu\Support\Facades\Verifactu;

$certificate = new Certificate('certificate.p12', 'password');
$issuer = new LegalPerson('XYZ SA', 'A12345678', 'ES', IdType::NIF);
$recipient = new Recipient('ABC SL', 'B12345678', 'ES', IdType::NIF);
Verifactu::config($certificate);

$previous = [
    'number' => '2025/1',
    'date' => Carbon::createFromFormat('Y-m-d', '2025-01-10'),
    'hash' => '8B709172FA124AC15D8F8570F941EBA70F99088628D4A59BF675627A7E250F15',
];

$invoice = [
    'number' => '2025/2',
    'date' => Carbon::createFromFormat('Y-m-d', '2025-01-12'),
    'description' => 'Invoice description'
    'type' =>InvoiceType::STANDARD,
    'amount' => 121,
    'base' => 100,
    'vat' => 21,
    'rate' => 21,
];

try {
    $result = Verifactu::submitInvoice(
        issuer: $issuer,
        invoiceData: $invoice,
        options: [], // 'subsanacion', 'rectificado'
        operationQualificationType: OperationQualificationType::SUBJECT_DIRECT,
        previous: $previous, // or null for the first invoice
        recipient: $recipient,
    );
} catch (CertificateException $e) {
    $this->error($e->getMessage());
    exit();
}

echo $result->hash;
echo $result->json; // JSON response from the SOAP client

if ($result->success) {
    echo 'Success';
    echo $result->csv; // CSV code from AEAT
    echo $result->qrSVG; // QR code as SVG string
    echo $result->qrURI; // Full qualified URI for further QR code generation 
} else {
    if ($result->status == EstadoRegistro::ACCEPTED_ERRORES) {
        // Invoice was registered with errors
        echo $result->status->name;
        echo $result->csv;
    }

    echo 'Errors:' . PHP_EOL;
    foreach ($result->errors as $error) {
        $echo $error;
    }
}
```

#### Cancel Invoice
```php
use Illuminate\Support\Carbon;
use Taiwanleaftea\TltVerifactu\Classes\Certificate;
use Taiwanleaftea\TltVerifactu\Classes\LegalPerson;
use Taiwanleaftea\TltVerifactu\Enums\EstadoRegistro;
use Taiwanleaftea\TltVerifactu\Enums\IdType;
use Taiwanleaftea\TltVerifactu\Exceptions\CertificateException;
use Taiwanleaftea\TltVerifactu\Support\Facades\Verifactu;

Verifactu::config($certificate);
$issuer = new LegalPerson('XYZ SA', 'A12345678', 'ES', IdType::NIF);

$previous = [
    'number' => '2025/2',
    'date' => Carbon::createFromFormat('Y-m-d', '2025-01-12'),
    'hash' => '8B709172FA124AC15D8F8570F941EBA70F99088628D4A59BF675627A7E250F15',
];

$invoice = [
    'number' => '2025/2',
    'date' => Carbon::createFromFormat('Y-m-d', '2025-01-12'),
];

try {
    $result = Verifactu::cancelInvoice(
        issuer: $issuer,
        invoiceData: $invoice,
        previous: $previous,
    );
} catch (CertificateException $e) {
    echo $e->getMessage();
    exit();
}

echo $result->hash;
echo $result->json;

if ($result->success) {
    echo 'Success';
    echo $result->csv;
} else {
    if ($result->status == EstadoRegistro::ACCEPTED_ERRORES) {
        echo $result->csv;
    }

    echo 'Errors:' . PHP_EOL;
    foreach ($result->errors as $error) {
        echo $error;
    }
}
```

## QR Code Generation
```php
use Illuminate\Support\Carbon;
use Taiwanleaftea\TltVerifactu\Support\Facades\Verifactu;
use Taiwanleaftea\TltVerifactu\Exceptions\QRGeneratorException;

// base64 encoded PNG
try {
    $qrcode = Verifactu::generateQrPNG(
        issuerNIF: 'A12345678',
        invoiceDate: Carbon::createFromFormat('Y-m-d', '2025-01-12'),
        number: '2025/2',
        totalAmount: '121.00',
    );
} catch (QRGeneratorException $e) {
    echo $e->getMessage();
}

// QR code in SVG format
$qrcode = Verifactu::generateQrSVG(
    issuerNIF: 'A12345678',
    invoiceDate: Carbon::createFromFormat('Y-m-d', '2025-01-12'),
    number: '2025/2',
    totalAmount: '121.00',
);
```

# License
TLT Verifactu is licensed under the MIT License. See the LICENSE file for more information.
