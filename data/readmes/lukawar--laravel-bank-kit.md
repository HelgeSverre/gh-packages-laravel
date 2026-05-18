# laravel-bank-kit

A Laravel package for generating Polish bank transfer files (ELIXIR format) and QR payment codes (Polish ZBP standard).

---

## Requirements

- PHP 8.2+
- Laravel 11+
- `ext-iconv` (for CP852 encoding in ELIXIR files)
- `ext-gd` or `ext-imagick` (required only when using QR codes with embedded logos)

---

## Installation

```bash
composer require lukawar/laravel-bank-kit
```

The package registers itself automatically via Laravel's package auto-discovery.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=bank-kit-config
```

---

## Configuration

`config/bank-kit.php`:

```php
return [
    // Default sender used in ELIXIR transfer files
    'sender' => [
        'account' => env('BANK_KIT_SENDER_ACCOUNT', ''),
        'name'    => env('BANK_KIT_SENDER_NAME', ''),
        'address' => env('BANK_KIT_SENDER_ADDRESS', ''),
    ],

    // QR code logo settings
    'qr' => [
        // null        → no logo
        // 'default'   → built-in black square logo
        // '/path/...' → custom image file (PNG/SVG recommended)
        'logo_path'  => env('BANK_KIT_QR_LOGO_PATH', null),
        'logo_width' => env('BANK_KIT_QR_LOGO_WIDTH', 60),
    ],

    // Payment gateways (future use)
    'gateways' => [],
];
```

`.env` variables:

| Variable                  | Default | Description                                |
|---------------------------|---------|--------------------------------------------|
| `BANK_KIT_SENDER_ACCOUNT` | —       | NRB account number of the default sender   |
| `BANK_KIT_SENDER_NAME`    | —       | Sender name                                |
| `BANK_KIT_SENDER_ADDRESS` | —       | Sender address                             |
| `BANK_KIT_QR_LOGO_PATH`   | `null`  | Logo path (`null`, `'default'`, or a path) |
| `BANK_KIT_QR_LOGO_WIDTH`  | `60`    | Logo width in pixels                       |

---

## ELIXIR Transfer Files

### Transfer types

| Class                    | ELIXIR code | Description                    |
|--------------------------|-------------|--------------------------------|
| `StandardTransfer`       | `51`        | Standard domestic transfer     |
| `SplitPaymentTransfer`   | `53`        | VAT split payment              |
| `TaxOfficeTransfer`      | `71`        | Tax office payment (US)        |
| `ZusTransfer`            | `51`        | Social insurance payment (ZUS) |

### Standard transfer

```php
use lukawar\BankKit\DTOs\StandardTransfer;
use lukawar\BankKit\Formatters\ElixirFormatter;
use lukawar\BankKit\Generators\ElixirFileGenerator;
use Carbon\Carbon;

$transfer = new StandardTransfer(
    senderAccount:    '58249000050000460073649930',
    senderName:       'Firma Sp. z o.o.',
    senderAddress:    'ul. Przykładowa 1|00-001 Warszawa',
    recipientAccount: '12345678901234567890123456',
    recipientName:    'Kontrahent',
    recipientAddress: 'ul. Odbiorcza 2|00-002 Kraków',
    amountInGrosze:   531200,            // 5312.00 PLN
    executionDate:    Carbon::today(),
    title:            'Faktura VAT 1/2024',
);

$generator = new ElixirFileGenerator(new ElixirFormatter());
$files = $generator->generate(collect([$transfer]));

// $files[0] contains CP852-encoded file content ready to save
file_put_contents('transfers.pli', $files[0]);
```

### Split payment (MPP)

```php
use lukawar\BankKit\DTOs\SplitPaymentTransfer;

$transfer = new SplitPaymentTransfer(
    senderAccount:    '58249000050000460073649930',
    senderName:       'Firma Sp. z o.o.',
    senderAddress:    'ul. Przykładowa 1|00-001 Warszawa',
    recipientAccount: '12345678901234567890123456',
    recipientName:    'Kontrahent',
    recipientAddress: 'ul. Odbiorcza 2|00-002 Kraków',
    amountInGrosze:   123400,
    executionDate:    Carbon::today(),
    title:            'Faktura VAT 5/2024',
);
```

### Tax office transfer (US)

```php
use lukawar\BankKit\DTOs\TaxOfficeTransfer;
use lukawar\BankKit\Enums\TaxPeriodType;

$transfer = new TaxOfficeTransfer(
    senderAccount:    '58249000050000460073649930',
    senderName:       'Firma Sp. z o.o.',
    senderAddress:    'ul. Przykładowa 1|00-001 Warszawa',
    recipientAccount: '12345678901234567890123456',
    recipientName:    'Urząd Skarbowy',
    recipientAddress: 'ul. Skarbowa 1|00-001 Warszawa',
    amountInGrosze:   100000,
    executionDate:    Carbon::today(),
    taxpayerNip:      '1234567890',
    periodType:       TaxPeriodType::Month,
    periodNumber:     '03',
    formSymbol:       'PIT37',
    additionalInfo:   'DEKLARACJA',
);

// Generated title: N1234567890|M03|PIT37|DEKLARACJA
```

Available `TaxPeriodType` values:

| Enum case | Value | Description |
|-----------|-------|-------------|
| `Year`    | `R`   | Annual      |
| `Quarter` | `K`   | Quarterly   |
| `Month`   | `M`   | Monthly     |
| `Decade`  | `D`   | 10-day      |
| `Day`     | `J`   | Daily       |
| `None`    | `0`   | No period   |

### ZUS transfer

```php
use lukawar\BankKit\DTOs\ZusTransfer;

$transfer = new ZusTransfer(
    senderAccount:      '58249000050000460073649930',
    senderName:         'Firma Sp. z o.o.',
    senderAddress:      'ul. Przykładowa 1|00-001 Warszawa',
    recipientAccount:   '12345678901234567890123456',
    recipientName:      'ZUS',
    recipientAddress:   'ul. Składkowa 1|00-001 Warszawa',
    amountInGrosze:     150000,
    executionDate:      Carbon::today(),
    contributionPeriod: 'MARZEC 2024',
);

// Generated title: SKLADKA ZA MARZEC 2024
```

### Multiple transfers & file splitting

The generator automatically splits transfers into multiple files when the collection exceeds 50 items (ELIXIR limit).

```php
$files = $generator->generate(collect($transfers)); // array of file contents

$extension = $generator->resolveExtension(collect($transfers)); // 'pli' or 'pls'

foreach ($files as $index => $content) {
    file_put_contents("transfers_{$index}.{$extension}", $content);
}
```

File extensions:
- `.pli` — standard transfers only
- `.pls` — collection contains at least one split payment transfer

---

## QR Payment Codes

Generates QR codes following the **Polish Bank Association (ZBP)** payment standard.

QR content format: `|PL|{IBAN}|{AMOUNT_IN_GROSZE}|{RECIPIENT_NAME}|{TITLE}|||`

### Basic usage

```php
use lukawar\BankKit\QrPayment\DTOs\QrPaymentData;
use lukawar\BankKit\QrPayment\Formatters\PolishQrPaymentFormatter;
use lukawar\BankKit\QrPayment\Generators\QrPaymentGenerator;
use lukawar\BankKit\QrPayment\Renderers\EndroidSvgRenderer;

$generator = new QrPaymentGenerator(
    new PolishQrPaymentFormatter(),
    new EndroidSvgRenderer(),
);

$data = new QrPaymentData(
    iban:           'PL10105000997603123456789123',
    amountInGrosze: 53120,               // 531.20 PLN
    recipientName:  'Firma Sp. z o.o.',
    title:          'Faktura VAT 1/2024', // optional
);

$svg = $generator->generate($data, size: 300);

// In a Laravel controller:
return response($svg, 200, ['Content-Type' => $generator->mimeType()]);
```

### PNG output

```php
use lukawar\BankKit\QrPayment\Renderers\EndroidPngRenderer;

$generator = new QrPaymentGenerator(
    new PolishQrPaymentFormatter(),
    new EndroidPngRenderer(),
);

$png = $generator->generate($data);
```

### With a logo in the center

```php
use lukawar\BankKit\QrPayment\DTOs\QrLogo;

$logo = new QrLogo(
    imagePath: '/path/to/logo.png', // PNG or SVG
    width:     60,                  // pixels
);

$svg = $generator->generate($data, size: 300, logo: $logo);
```

Using the built-in black square default logo:

```php
use lukawar\BankKit\QrPayment\Logos\BlackSquareLogoGenerator;
use lukawar\BankKit\QrPayment\DTOs\QrLogo;

$logoPath = (new BlackSquareLogoGenerator())->generate();
$logo = new QrLogo(imagePath: $logoPath, width: 60);

$svg = $generator->generate($data, logo: $logo);
```

Or resolve logo from config (`BANK_KIT_QR_LOGO_PATH=default`):

```php
use lukawar\BankKit\BankKitServiceProvider;

$logo = BankKitServiceProvider::resolveLogoFromConfig();
$svg = $generator->generate($data, logo: $logo);
```

### Via the BankKit facade

```php
use lukawar\BankKit\Facades\BankKit;
use lukawar\BankKit\QrPayment\DTOs\QrPaymentData;

$data = new QrPaymentData(
    iban:           'PL10105000997603123456789123',
    amountInGrosze: 53120,
    recipientName:  'Firma Sp. z o.o.',
    title:          'Faktura VAT 1/2024',
);

$svg = BankKit::generateQrPayment($data);
```

### IBAN handling

`QrPaymentData` normalizes the IBAN automatically (removes spaces and dashes, uppercases) and validates the format on construction. An `InvalidIbanException` is thrown for invalid values.

```php
// All of these produce the same normalized IBAN: PL10105000997603123456789123
new QrPaymentData(iban: 'pl 10 1050 0099 7603 1234 5678 9123', ...);
new QrPaymentData(iban: 'PL10-1050-0099-7603-1234-5678-9123', ...);
```

### Custom formatter or renderer

Implement the appropriate interface to plug in your own format or output type:

```php
use lukawar\BankKit\QrPayment\Contracts\QrPaymentFormatterInterface;
use lukawar\BankKit\QrPayment\DTOs\QrPaymentData;

class SepaQrPaymentFormatter implements QrPaymentFormatterInterface
{
    public function format(QrPaymentData $data): string
    {
        return implode("\n", [
            'BCD', '002', '1', 'SCT', '',
            $data->recipientName,
            $data->iban,
            'EUR'.number_format($data->amountInGrosze / 100, 2, '.', ''),
            '', '', $data->title,
        ]);
    }
}

$generator = new QrPaymentGenerator(
    new SepaQrPaymentFormatter(),
    new EndroidSvgRenderer(),
);
```

---

## License

Proprietary.
