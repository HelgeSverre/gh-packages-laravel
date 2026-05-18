<p align="center">
  <img src="https://www.seven.io/wp-content/uploads/Logo.svg" width="250" alt="seven logo" />
</p>

<h1 align="center">seven SMS for Bagisto</h1>

<p align="center">
  Send transactional and marketing SMS to your Bagisto customers and customer groups via the seven gateway.
  <br />
  <a href="https://www.seven.io"><strong>seven.io</strong></a> &middot;
  <a href="https://docs.seven.io">API Docs</a> &middot;
  <a href="https://docs.seven.io/en/third-party-provider/e-commerce/bagisto">Integration Docs</a> &middot;
  <a href="https://packagist.org/packages/seven.io/bagisto">Packagist</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Bagisto-1.2%20|%201.3-blue" alt="Bagisto 1.2 | 1.3" />
  <img src="https://img.shields.io/badge/PHP-7.4%20|%208.x-purple" alt="PHP 7.4 | 8.x" />
</p>

---

## Features

- **Send to Customer** - Trigger an SMS for any customer with one click from the admin panel
- **Send to Customer Group** - Broadcast a message to every customer in a Bagisto group
- **Property Placeholders** - Use `{{first_name}}`, `{{last_name}}` (and any other customer property) in your message body
- **Two Configuration Modes** - Configure the API key in the admin UI or via `.env`
- **Native Service Provider** - Auto-discovered Laravel service provider, no manual wiring required

## Prerequisites

- [Bagisto](https://bagisto.com/) 1.2 or 1.3
- PHP 7.4 or 8.x
- A [seven account](https://www.seven.io/) with API key ([How to get your API key](https://help.seven.io/en/developer/where-do-i-find-my-api-key))

## Installation

### 1. Install via Composer

```bash
composer require seven.io/bagisto
```

### 2. Register the service provider

The provider is auto-discovered. If you have disabled package discovery, add it manually to `config/app.php`:

```php
'providers' => [
    // ...
    Seven\Bagisto\Providers\SevenServiceProvider::class,
],
```

### 3. Run migrations

```bash
php artisan cache:clear
php artisan migrate
```

## Configuration

You can supply your API key either through the admin UI **or** via environment variable. The admin-UI value takes precedence.

### Option A: Admin panel

Navigate to **Dashboard > Configure > seven**, enter your API key and click **Save**.

### Option B: Environment variable

Add the key to your `.env`:

```dotenv
SEVEN_API_KEY=your-seven-api-key
```

Then reference it in `config/services.php`:

```php
return [
    // ...
    'seven' => [
        'api_key' => env('SEVEN_API_KEY'),
    ],
];
```

Cache the configuration:

```bash
php artisan cache:clear && php artisan config:cache
```

> **Note:** When the API key is set in the admin UI, it overrides the environment variable. The `.env` value is intentionally not displayed in the configuration form.

## Usage

### Send to a single customer

Go to **Customers**, locate the row of the recipient and click the **seven** icon in the *Actions* column.

### Send to a customer group

Go to **Groups** and click the **seven** icon next to the target group.

### Use placeholders

Any property defined on the customer can be referenced in the message body. Example:

```
Hi {{first_name}}, your order is on its way!
```

Unresolved placeholders remain as plain text in the outgoing SMS.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `seven` icon missing from the Customers/Groups list | Run `php artisan cache:clear && php artisan config:cache` and reload. |
| API key from `.env` is ignored | A value set in the admin UI overrides the `.env`. Clear the field in **Dashboard > Configure > seven** to fall back. |
| SMS sending fails | Verify the API key in the seven [dashboard](https://app.seven.io/) and check your account balance. |

## Support

Need help? Feel free to [contact us](https://www.seven.io/en/company/contact/) or [open an issue](https://github.com/seven-io/bagisto/issues).

## License

[MIT](LICENSE)
