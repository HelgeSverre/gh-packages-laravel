# Laravel Cloudflare

A modern PHP 8+ package for seamless Cloudflare API integration in Laravel applications. Manage zones, DNS records, firewall rules, analytics, and more with a clean, type-safe interface.

[![PHP Version](https://img.shields.io/badge/PHP-8.0%2B-blue.svg)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-8%2B-red.svg)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

-  **Modern PHP 8+** - Strict type hints, typed properties, and modern syntax
-  **Comprehensive Coverage** - Zones, DNS, Firewall, Settings, and more
-  **Well Documented** - Extensive PHPDoc **blocks** with parameter tables
-  **Type Safe** - Full type safety with strict typing throughout
-  **Laravel Integration** - Built specifically for Laravel using HTTP facade
-  **Easy to Use** - Intuitive API with consistent method naming
-  **Free Tier Friendly** - All free tier functions fully supported
-  **Auto-Discovery** - Automatic service provider registration

## Requirements

- PHP 8.0 or higher
- Laravel 8.0 or higher
- Cloudflare API Token or API Key

## Installation

Install the package via Composer:

```bash
composer require secretwebmaster/laravel-cloudflare
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=cloudflare-config
```

Add your Cloudflare credentials to your `.env` file:

```env
CLOUDFLARE_API_TOKEN=your-api-token
```

## Basic Usage

### Initialize the Client

```php
use Secretwebmaster\LaravelCloudflare\Client;

// Option 1: Create using .env values
$client = new Client();

// Option 2: Create manually with API Token
$client = new Client('your-api-token');

// Option 3: Create manually with Email + API Key
$client = new Client(null, 'your-email@example.com', 'your-api-key');
```

### Working with Zones

The `Zones` model provides complete zone management functionality.

#### List All Zones

```php
// List all zones
$response = $client->zones()->list();

// List zones with pagination
$zones = $client->zones()->list([
    'page' => 1,
    'per_page' => 20
]);

// Filter zones by status
$zones = $client->zones()->list([
    'status' => 'active'
]);
```

#### Get Zone by Domain

```php
// Get zone information by domain name
$zone = $client->zones()->getByDomain('example.com');
```

#### Get Zone ID by Domain

```php
// Quickly get just the zone ID
$zoneId = $client->zones()->getZoneIdByDomain('example.com');
```

#### Create a New Zone

```php
$response = $client->zones()->create([
    'name' => 'example.com',
]);
```

#### Get Zone Details

```php
$response = $client->zones()->get($zoneId);
```

#### Update Zone Settings

```php
$client->zones()->edit($zoneId, [
    'paused' => false,
    'plan' => [
        'id' => 'plan-id'
    ]
]);
```

#### Purge Cache

```php
// Purge everything
$client->zones()->purgeCache($zoneId, ['purge_everything' => true]);

// Purge specific files
$client->zones()->purgeCache($zoneId, [
    'files' => [
        'https://example.com/style.css',
        'https://example.com/script.js'
    ]
]);

// Purge by tags
$client->zones()->purgeCache($zoneId, [
    'tags' => ['static', 'images']
]);

// Purge by hostname
$client->zones()->purgeCache($zoneId, [
    'hosts' => ['www.example.com', 'api.example.com']
]);
```

#### Check Zone Activation

```php
$response = $client->zones()->activationCheck($zoneId);
```

#### Delete Zone

```php
$response = $client->zones()->delete($zoneId);
```

### Working with DNS Records

The `DnsRecords` model handles all DNS record operations.

#### List DNS Records

```php
// List all DNS records for a zone
$response = $client->dnsRecords()->list($zoneId);

// Filter by record type
$records = $client->dnsRecords()->list($zoneId, [
    'type' => 'A'
]);

// Filter by name
$records = $client->dnsRecords()->list($zoneId, [
    'name' => 'www.example.com'
]);

// Combine filters with pagination
$records = $client->dnsRecords()->list($zoneId, [
    'type' => 'A',
    'page' => 1,
    'per_page' => 50
]);
```

#### Create DNS Record

```php
// Create an A record
$record = $client->dnsRecords()->create($zoneId, [
    'type' => 'A',
    'name' => 'www.example.com',
    'content' => '192.168.1.1',
    'ttl' => 1,  // 1 = Auto
    'proxied' => true
]);

// Create a CNAME record
$record = $client->dnsRecords()->create($zoneId, [
    'type' => 'CNAME',
    'name' => 'blog',
    'content' => 'example.com',
    'ttl' => 1,
    'proxied' => false
]);

// Create an MX record
$record = $client->dnsRecords()->create($zoneId, [
    'type' => 'MX',
    'name' => 'example.com',
    'content' => 'mail.example.com',
    'priority' => 10,
    'ttl' => 1
]);

// Create a TXT record
$record = $client->dnsRecords()->create($zoneId, [
    'type' => 'TXT',
    'name' => '_dmarc',
    'content' => 'v=DMARC1; p=reject; rua=mailto:admin@example.com',
    'ttl' => 1
]);
```

#### Get DNS Record Details

```php
$response = $client->dnsRecords()->get($zoneId, $recordId);
```

#### Update DNS Record (Full Update)

```php
// Update entire record
$client->dnsRecords()->update($zoneId, $recordId, [
    'type' => 'A',
    'name' => 'www.example.com',
    'content' => '192.168.1.2',
    'ttl' => 1,
    'proxied' => true
]);
```

#### Patch DNS Record (Partial Update)

```php
// Update only specific fields
$client->dnsRecords()->edit($zoneId, $recordId, [
    'content' => '192.168.1.3',
    'proxied' => false
]);

// Just change TTL
$client->dnsRecords()->edit($zoneId, $recordId, [
    'ttl' => 3600
]);
```

#### Delete DNS Record

```php
$response = $client->dnsRecords()->delete($zoneId, $recordId);
```

## Advanced Usage

### Zone Settings

Manage all zone settings with dedicated getter and setter methods.

```php
// Get SSL setting
$response = $client->zoneSettings()->getSsl($zoneId);

// Update SSL setting
$client->zoneSettings()->updateSsl($zoneId, ['value' => 'full']);

// Get Always Use HTTPS
$alwaysHttps = $client->zoneSettings()->getAlwaysUseHttps($zoneId);

// Enable Always Use HTTPS
$client->zoneSettings()->updateAlwaysUseHttps($zoneId, ['value' => 'on']);

// Get and update multiple settings
$settings = $client->zoneSettings()->list($zoneId);

// Update any setting using the generic update method
$client->zoneSettings()->update($zoneId, 'minify', [
    'value' => [
        'css' => 'on',
        'html' => 'on',
        'js' => 'on'
    ]
]);
```

### Firewall Access Rules

Manage IP access rules at zone, account, or user level.

```php
// Zone-level: Block an IP
$client->firewallAccessRules()->create($zoneId, [
    'mode' => 'block',
    'configuration' => [
        'target' => 'ip',
        'value' => '192.168.1.100'
    ],
    'notes' => 'Blocked spam source'
]);

// Zone-level: Whitelist an IP range
$client->firewallAccessRules()->create($zoneId, [
    'mode' => 'whitelist',
    'configuration' => [
        'target' => 'ip_range',
        'value' => '10.0.0.0/8'
    ],
    'notes' => 'Office IP range'
]);

// Account-level: Challenge by country
$client->firewallAccessRules()->createAccount($accountId, [
    'mode' => 'challenge',
    'configuration' => [
        'target' => 'country',
        'value' => 'CN'
    ]
]);

// List zone access rules
$rules = $client->firewallAccessRules()->list($zoneId);

// Delete a rule
$client->firewallAccessRules()->delete($zoneId, $ruleId);
```

### Page Rules

Create and manage page rules for URL-specific behaviors.

```php
// Create a page rule
$client->pageRules()->create($zoneId, [
    'targets' => [
        [
            'target' => 'url',
            'constraint' => [
                'operator' => 'matches',
                'value' => 'example.com/admin/*'
            ]
        ]
    ],
    'actions' => [
        [
            'id' => 'ssl',
            'value' => 'strict'
        ],
        [
            'id' => 'always_use_https',
            'value' => true
        ]
    ],
    'priority' => 1,
    'status' => 'active'
]);

// List all page rules
$rules = $client->pageRules()->list($zoneId);

// Get available settings
$settings = $client->pageRules()->getSettingList();
```

### Accounts & Users

```php
// List accounts
$accounts = $client->accounts()->list();

// Get account details
$account = $client->accounts()->get($accountId);

// Get user details
$user = $client->users()->get();

// Update user
$client->users()->update([
    'first_name' => 'John',
    'last_name' => 'Doe'
]);
```

## Available Models

All models are accessible through the client:

| Model | Description | Methods |
|-------|-------------|---------|
| `Zones` | Zone management | list, create, get, edit, delete, purgeCache, etc. |
| `DnsRecords` | DNS record management | list, create, get, update, patch, delete, import, export |
| `ZoneSettings` | Zone settings (86 methods) | getSsl, updateSsl, getMinify, updateMinify, etc. |
| `FirewallAccessRules` | IP access rules | User/Account/Zone level CRUD operations |
| `FirewallLockdowns` | Zone lockdown rules | list, create, get, update, delete |
| `FirewallUARules` | User Agent blocking | list, create, get, update, delete |
| `Waf` | Web Application Firewall | Overrides, Packages, Groups, Rules management |
| `PageRules` | Page rules | list, create, get, update, delete |
| `Accounts` | Account management | list, get, details, update |
| `Users` | User management | get, details, update |

## Error Handling

All methods return the Cloudflare API response. Check the `success` field:

```php
$response = $client->zones()->create(['name' => 'example.com']);

// Get error code explanations
$errorCodes = $client->zones()->errorCodes();
echo $errorCodes['1061']; // "An A, AAAA or CNAME record already exists..."
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security-related issues, please email the package maintainer instead of using the issue tracker.

## Credits

- **Author**: SecretWebmaster
- Built with ❤️ for the Laravel community

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Resources

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Laravel Documentation](https://laravel.com/docs)
- [Package Repository](https://github.com/secretwebmaster/laravel-cloudflare)

## Support

- **Issues**: [GitHub Issues](https://github.com/secretwebmaster/laravel-cloudflare/issues)
- **Documentation**: This README and inline PHPDoc blocks
- **Cloudflare API**: [Official API Docs](https://developers.cloudflare.com/api/)
