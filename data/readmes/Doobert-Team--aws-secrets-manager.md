# AWS Secrets Manager for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/doobert/aws-secrets-manager.svg?style=flat-square)](https://packagist.org/packages/doobert/aws-secrets-manager)
[![Total Downloads](https://img.shields.io/packagist/dt/doobert/aws-secrets-manager.svg?style=flat-square)](https://packagist.org/packages/doobert/aws-secrets-manager)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

> Seamless integration with AWS Secrets Manager for Laravel. Caching, atomic locking, flexible config mapping, and easy setup.

---

## 🚀 Installation

Install via Composer:

```bash
composer require doobert/aws-secrets-manager
```

If not auto-discovered, add the service provider to `config/app.php`:

```php
'providers' => [
    // ...
    Doobert\AWSSecretsManager\AWSSecretsManagerServiceProvider::class,
],
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Doobert\\AWSSecretsManager\\AWSSecretsManagerServiceProvider" --tag=config
```

---

## ⚙️ Configuration

Edit `config/aws-secrets-manager.php` or set these in your `.env`:

| Key                | Description                                      | Default         |
|--------------------|--------------------------------------------------|-----------------|
| enabled            | Enable/disable the package                       | true            |
| check_latency      | Log cache/AWS latency                            | false           |
| region             | AWS region for Secrets Manager                   | us-west-2       |
| cache_ttl          | Cache lifetime (seconds)                         | 3600            |
| cache_store        | Laravel cache store to use (e.g., redis)         | redis           |
| name               | AWS secret name                                  | (empty)         |
| log_channel        | Log channel for package logs                     | awssecrets      |
| load_in_console    | Load secrets when running artisan/console        | false           |
| keys_raw           | Map secret keys to config (see below)            | false           |

**Example `.env`:**

```dotenv
AWS_SECRETS_ENABLED=true
AWS_SECRETS_REGION=us-west-2
AWS_SECRETS_CACHE_TTL=3600
AWS_SECRETS_CACHE_STORE=redis
AWS_SECRETS_NAME=your-secret-name
AWS_SECRETS_LOG_CHANNEL=awssecrets
AWS_SECRETS_LOAD_IN_CONSOLE=false
AWS_SECRETS_KEYS_RAW="DB_PASSWORD:database.connections.mysql.password,API_KEY:services.api.key"
```

---

## 🛠 Usage

Inject or resolve the service:

```php
use Doobert\AWSSecretsManager\AWSSecretsManagerService;

$service = app(AWSSecretsManagerService::class);
$secret = $service->getSecret('your-secret-name');
```

### Mapping Secrets to Config


**Mapping Secrets to Config**

Set `AWS_SECRETS_KEYS_RAW` or `aws-secrets-manager.keys_raw` to map secret keys to Laravel config values:

```
AWS_SECRETS_KEYS_RAW="DB_PASSWORD:database.connections.mysql.password,API_KEY:services.api.key"
```

Format: `SECRET_KEY:config.path`, comma-separated for multiple pairs. This will automatically set config values at runtime.
**Load in Console**

Set `AWS_SECRETS_LOAD_IN_CONSOLE=true` to load secrets when running artisan/console commands (disabled by default for performance).

---

## 📋 Logging

All logs are sent to the channel defined in `log_channel` (default: `awssecrets`). If not set, logs go to the default Laravel log channel.

---

## Refreshing the secrets in Cache

## 🛡 Artisan Command: Refresh Secrets


You can manually refresh and cache your AWS secret after rotation using the included artisan command:

```bash
php artisan doobertaws:secret-refresh
```

This will force a fresh fetch from AWS Secrets Manager and update the cache. Useful after rotating secrets in AWS.

**Options:**

- `--all` (future use): Refresh all configured secrets.

**Example output:**

```
Refreshing secret: your-secret-name
Secret refreshed and cached in Redis successfully.
    Keys available: DB_PASSWORD, API_KEY
```

If the secret cannot be fetched, you’ll see an error message with troubleshooting tips.

## ✅ Testing

From the package directory:

```bash
composer install
./vendor/bin/phpunit --configuration phpunit.xml
```

---

## 📦 Requirements

- Laravel 8.0+
- PHP 8.0+
- AWS SDK for PHP

---

## 📄 License

MIT
