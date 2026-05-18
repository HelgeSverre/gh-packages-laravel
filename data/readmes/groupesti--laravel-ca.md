# Laravel CA

> Modular Certificate Authority system for Laravel -- Core Package.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/groupesti/laravel-ca.svg)](https://packagist.org/packages/groupesti/laravel-ca)
[![PHP Version](https://img.shields.io/badge/php-8.4%2B-blue)](https://www.php.net/releases/8.4/)
[![Laravel](https://img.shields.io/badge/laravel-12.x-red)](https://laravel.com)
[![Tests](https://github.com/groupesti/laravel-ca/actions/workflows/tests.yml/badge.svg)](https://github.com/groupesti/laravel-ca/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/groupesti/laravel-ca)](LICENSE.md)

## Requirements

- **PHP** 8.4 or higher
- **Laravel** 12.x
- **PHP Extensions:** dom, curl, libxml, mbstring, zip, pdo, sqlite/mysql/pgsql, openssl
- **phpseclib** 3.x

## Installation

Install the package via Composer:

```bash
composer require groupesti/laravel-ca
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=ca-config
```

Publish the database migrations:

```bash
php artisan vendor:publish --tag=ca-migrations
```

Or publish everything at once:

```bash
php artisan vendor:publish --tag=ca
```

Run the migrations:

```bash
php artisan migrate
```

Seed the lookup tables with default data:

```bash
php artisan ca:seed-lookups
```

## Configuration

The configuration file is published to `config/ca.php`. Below is a description of each section and key.

### `tenant` -- Multi-Tenancy

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `tenant.enabled` | `bool` | `false` | Enable multi-tenant isolation via a global scope. |
| `tenant.resolver` | `string` | `TenantResolverInterface::class` | FQCN of the class that resolves the current tenant ID. Must implement `CA\Contracts\TenantResolverInterface`. |
| `tenant.column` | `string` | `'tenant_id'` | The database column used for tenant isolation. |

### `storage` -- Key & Certificate Storage

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `storage.default` | `string` | `'database'` | Default storage driver (`database` or `filesystem`). |
| `storage.drivers.database.connection` | `string\|null` | `null` | Database connection name (null = default). |
| `storage.drivers.database.table` | `string` | `'ca_storage'` | Table name for database storage. |
| `storage.drivers.filesystem.disk` | `string` | `'local'` | Laravel filesystem disk name. |
| `storage.drivers.filesystem.base_path` | `string` | `'ca-storage'` | Base path within the filesystem disk. |

### `encryption` -- Private Key Encryption

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `encryption.default` | `string` | `'laravel'` | Default encryption strategy (`laravel` or `passphrase`). |
| `encryption.strategies.laravel.driver` | `string` | `'laravel'` | Uses Laravel's built-in encryption (APP_KEY). |
| `encryption.strategies.passphrase.driver` | `string` | `'passphrase'` | Encrypts with a user-supplied passphrase. |
| `encryption.strategies.passphrase.cipher` | `string` | `'aes-256-cbc'` | Cipher algorithm for passphrase-based encryption. |

### `defaults` -- Certificate Defaults

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `defaults.key_algorithm` | `string` | `'rsa-4096'` | Default key algorithm for new CAs. |
| `defaults.hash_algorithm` | `string` | `'sha256'` | Default hash/signature algorithm. |
| `defaults.validity.root_ca` | `int` | `3650` | Default validity in days for Root CAs. |
| `defaults.validity.intermediate_ca` | `int` | `1825` | Default validity for Intermediate CAs. |
| `defaults.validity.server_tls` | `int` | `397` | Default validity for server TLS certificates. |
| `defaults.validity.client_mtls` | `int` | `365` | Default validity for client mTLS certificates. |
| `defaults.validity.code_signing` | `int` | `365` | Default validity for code signing certificates. |
| `defaults.validity.smime` | `int` | `365` | Default validity for S/MIME certificates. |
| `defaults.validity.domain_controller` | `int` | `365` | Default validity for domain controller certificates. |
| `defaults.validity.user` | `int` | `365` | Default validity for user certificates. |
| `defaults.validity.computer` | `int` | `365` | Default validity for computer certificates. |

### `serial_number` -- Serial Number Generation

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `serial_number.generator` | `string` | `'random'` | Serial number generation strategy. |
| `serial_number.bytes` | `int` | `20` | Number of random bytes for serial generation (RFC 5280 recommends >= 20). |

### `crl` -- Certificate Revocation Lists

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `crl.enabled` | `bool` | `true` | Enable CRL generation. |
| `crl.lifetime_hours` | `int` | `24` | CRL validity in hours. |
| `crl.overlap_hours` | `int` | `12` | Overlap period for CRL renewal. |
| `crl.distribution_points` | `array` | `[]` | List of CRL distribution point URLs. |

### `ocsp` -- Online Certificate Status Protocol

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ocsp.enabled` | `bool` | `true` | Enable OCSP responder. |
| `ocsp.responder_url` | `string\|null` | `null` | OCSP responder URL embedded in certificates. |
| `ocsp.response_lifetime_minutes` | `int` | `60` | OCSP response validity in minutes. |
| `ocsp.nonce_required` | `bool` | `true` | Require nonce in OCSP requests. |

### `api` -- REST API

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `api.enabled` | `bool` | `true` | Enable the built-in REST API routes. |
| `api.prefix` | `string` | `'api/ca'` | URL prefix for API routes. |
| `api.middleware` | `array` | `['api', 'ca.auth']` | Middleware applied to API routes. |

### `microsoft` -- Microsoft OID Extensions

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `microsoft.oids` | `array` | *(see config)* | Microsoft-specific OID mappings for Active Directory and Windows PKI integration. |

## Usage

### Creating a Root Certificate Authority

Using the `CaManager` service:

```php
use CA\DTOs\DistinguishedName;
use CA\Models\KeyAlgorithm;
use CA\Services\CaManager;

$caManager = app(CaManager::class);

$dn = new DistinguishedName(
    commonName: 'My Root CA',
    organization: 'My Organization',
    country: 'CA',
    state: 'Quebec',
    locality: 'Montreal',
);

$algorithm = KeyAlgorithm::fromSlug('rsa-4096');

$rootCa = $caManager->createRootCA(
    dn: $dn,
    algorithm: $algorithm,
    validityDays: 3650,
    pathLength: 2,
);
```

### Creating an Intermediate CA

```php
$intermediateDn = new DistinguishedName(
    commonName: 'My Intermediate CA',
    organization: 'My Organization',
    country: 'CA',
);

$intermediateCa = $caManager->createIntermediateCA(
    parent: $rootCa,
    dn: $intermediateDn,
    algorithm: KeyAlgorithm::fromSlug('ecdsa-p384'),
    validityDays: 1825,
);
```

### Multi-Tenant Usage

```php
// Scope all operations to a specific tenant
$tenantManager = $caManager->forTenant(tenantId: 'tenant-uuid');

$allCas = $tenantManager->all();
$ca = $tenantManager->find('ca-uuid');
```

### Using the Facade

```php
use CA\Facades\Ca;

// The Ca facade proxies to CaManager
$rootCa = Ca::createRootCA(dn: $dn, algorithm: $algorithm);
$cas = Ca::all();
```

### Working with Lookups

All 18 lookup models share a single `ca_lookups` table and inherit from the base `Lookup` model:

```php
use CA\Models\KeyAlgorithm;
use CA\Models\CertificateStatus;
use CA\Models\CertificateType;

// Retrieve by slug (cached)
$rsa4096 = KeyAlgorithm::fromSlug('rsa-4096');
$active = CertificateStatus::fromSlug('active');

// Get all active entries (cached)
$algorithms = KeyAlgorithm::active();

// Access metadata
$keySize = $rsa4096->getKeySize(); // 4096
$isRsa = $rsa4096->isRsa();        // true
```

Available lookup models: `KeyAlgorithm`, `CertificateStatus`, `CertificateType`, `RevocationReason`, `HashAlgorithm`, `ExportFormat`, `KeyStatus`, `ScepMessageType`, `ScepPkiStatus`, `ScepFailInfo`, `ChallengeStatus`, `ChallengeType`, `OrderStatus`, `AuthorizationStatus`, `CsrStatus`, `PolicySeverity`, `PolicyAction`, `NameType`.

### Certificate Templates

```php
use CA\Models\CertificateTemplate;

$template = CertificateTemplate::create([
    'certificate_authority_id' => $rootCa->id,
    'name' => 'Server TLS',
    'slug' => 'server-tls',
    'type' => 'server_tls',
    'key_usage' => ['digitalSignature', 'keyEncipherment'],
    'extended_key_usage' => ['serverAuth'],
    'validity_days' => 397,
    'is_active' => true,
]);
```

### Artisan Commands

```bash
# Create a new Root CA interactively
php artisan ca:init

# Create a Root CA with options
php artisan ca:init --cn="Root CA" --o="Acme Corp" --c=US --algorithm=rsa-4096 --validity=3650

# List all Certificate Authorities
php artisan ca:list

# Show status of a specific CA
php artisan ca:status {ca-uuid}

# Seed lookup tables with default data
php artisan ca:seed-lookups
```

### REST API Endpoints

When `ca.api.enabled` is `true`, the following routes are registered under the configured prefix (default: `api/ca`):

| Method | URI | Action | Route Name |
|--------|-----|--------|------------|
| `GET` | `/` | List all CAs | `ca.index` |
| `POST` | `/` | Create a new CA | `ca.store` |
| `GET` | `/{id}` | Show a CA | `ca.show` |
| `PUT` | `/{id}` | Update a CA | `ca.update` |
| `DELETE` | `/{id}` | Delete a CA | `ca.destroy` |
| `GET` | `/{id}/hierarchy` | Show CA hierarchy | `ca.hierarchy` |

## Testing

Run the test suite with Pest:

```bash
./vendor/bin/pest
```

Run with coverage:

```bash
./vendor/bin/pest --coverage
```

Check code formatting:

```bash
./vendor/bin/pint --test
```

Run static analysis:

```bash
./vendor/bin/phpstan analyse
```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md). Do **not** open a public issue.

## Credits

- [GroupESTI](https://github.com/groupesti)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
