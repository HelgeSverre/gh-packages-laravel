# DEV SMS Gateway Laravel Package

Laravel package for integrating with `puppy-sms-gateway-server`.

It supports:
- user register/login
- environment creation
- environment API key management
- SMS send via environment API key
- status polling and account logs

## Requirements
- PHP 8.1+
- Laravel 9/10/11/12
- `guzzlehttp/guzzle` (installed automatically)

## Install

### Option 1: Packagist (after publish)
```bash
composer require dilumsadeepa/dev-sms-gateway-laravel-package
```

### Option 2: GitHub VCS (before Packagist)
```bash
composer config repositories.dev-sms-gateway vcs https://github.com/dilumsadeepa/DEV-SMS-Gateway-Laravel-package.git
composer require dilumsadeepa/dev-sms-gateway-laravel-package:dev-main
```

## Publish Config
```bash
php artisan vendor:publish --tag=puppy-sms-gateway-config
```

## Configuration
Set values in your Laravel `.env`:

```dotenv
PUPPY_SMS_GATEWAY_BASE_URL=http://127.0.0.1:8090

# Environment API key (used for send/status)
PUPPY_SMS_GATEWAY_API_KEY=

# Auth token (used for account endpoints: /api/auth/me, /api/environments, /api/account/logs)
PUPPY_SMS_GATEWAY_AUTH_TOKEN=

# Optional default pin. Not required when using environment API key.
PUPPY_SMS_GATEWAY_PIN=

PUPPY_SMS_GATEWAY_TIMEOUT=20
PUPPY_SMS_GATEWAY_SEND_ENDPOINT=/api/send-sms
PUPPY_SMS_GATEWAY_HEALTH_ENDPOINT=/health
PUPPY_SMS_GATEWAY_STATUS_ENDPOINT=/api/status
PUPPY_SMS_GATEWAY_LOGS_ENDPOINT=/api/account/logs
PUPPY_SMS_GATEWAY_REGISTER_ENDPOINT=/api/auth/register
PUPPY_SMS_GATEWAY_LOGIN_ENDPOINT=/api/auth/login
PUPPY_SMS_GATEWAY_ME_ENDPOINT=/api/auth/me
PUPPY_SMS_GATEWAY_LOGOUT_ENDPOINT=/api/auth/logout
PUPPY_SMS_GATEWAY_ENVIRONMENTS_ENDPOINT=/api/environments
```

## Quick Start (Full Flow)

```php
use Puppy\SmsGateway\Laravel\Facades\PuppySmsGateway;

// 1) Register (creates account only)
PuppySmsGateway::register('Alice', 'alice@example.com', 'StrongPass123');

// 2) Login
$login = PuppySmsGateway::login('alice@example.com', 'StrongPass123');
$token = $login['token'];
PuppySmsGateway::setAuthToken($token);

// 3) Create environment (returns default environment API key)
$environment = PuppySmsGateway::createEnvironment(
    name: 'Production',
    pin: '1234',
    description: 'Main Android device',
    metadata: ['region' => 'us']
);

$apiKey = $environment['apiKey'];
PuppySmsGateway::setApiKey($apiKey);

// 4) Send SMS with environment API key
$send = PuppySmsGateway::send('+14075551234', 'Hello from Laravel package');

// 5) Poll status (uses API key by default)
$status = PuppySmsGateway::status($send['requestId']);
```

## Common Operations

```php
use Puppy\SmsGateway\Laravel\Facades\PuppySmsGateway;

$health = PuppySmsGateway::health();
$me = PuppySmsGateway::me();
$environments = PuppySmsGateway::environments();
$apiKeys = PuppySmsGateway::listApiKeys('<environment-id>');
$newKey = PuppySmsGateway::createApiKey('<environment-id>', 'backend-service');
$revoke = PuppySmsGateway::revokeApiKey('<environment-id>', '<key-id>');
$logs = PuppySmsGateway::logs(); // requires auth token
```

## Notes
- `send()` requires an environment API key.
- `status()` accepts either API key or auth token.
- `logs()` uses account endpoint and requires auth token.
- If SMS device acknowledgement times out, `send()` returns a pending-style response from the server.

## License
MIT
