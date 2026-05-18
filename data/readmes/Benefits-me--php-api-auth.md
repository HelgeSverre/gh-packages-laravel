# php-api-auth

## Installation

### Require Package
```shell
composer require benefits-me/php-api-auth
```

### Publish provider and configuration
```shell
php artisan vendor:publish --provider="BenefitsMe\ApiAuth\Provider\AuthServiceProvider"
```

## Project Structure

```text
/
├── config/                  # Configuration files (e.g. api-auth.php)
├── src/                     # Library source code
│   ├── Enums/               # Enum types
│   ├── Exceptions/          # Custom exception classes
│   ├── Provider/            # Service providers (e.g. AuthServiceProvider)
│   └── Services/            # Service classes (e.g. AuthService)
├── tests/                   # PEST unit and feature tests
│   ├── Feature/             # Feature tests
│   ├── Unit/                # Unit tests
│   ├── Pest.php             # PEST bootstrap file
│   └── TestCase.php         # Base test class
├── vendor/                  # Composer dependencies (auto-generated)
├── composer.json            # Composer configuration file
├── composer.lock            # Composer lock file
├── phpunit.xml              # PHPUnit configuration
├── README.md                # Project documentation
└── LICENSE                  # License file
```
