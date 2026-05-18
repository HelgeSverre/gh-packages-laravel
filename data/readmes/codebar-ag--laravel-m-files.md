<img src="https://banners.beyondco.de/Laravel%20M-Files.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-m-files&pattern=circuitBoard&style=style_1&description=An+opinionated+way+to+integrate+M-Files+with+Laravel&md=1&showWatermark=0&fontSize=175px&images=document-report" alt="Laravel M-Files banner with description and logo">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-m-files.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-m-files)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-m-files/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-m-files/actions/workflows/run-tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-m-files/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-m-files/actions/workflows/fix-php-code-style-issues.yml)
[![Larastan](https://img.shields.io/badge/Larastan-Level%205-brightgreen.svg)](https://github.com/larastan/larastan)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-m-files.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-m-files)

# Laravel M-Files Integration

A Laravel package providing DTOs and requests for integrating with M-Files REST API.

## Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-m-files
```

### Requirements

#### PHP and Laravel compatibility

| Package release | PHP (Composer constraint) | Laravel |
|-----------------|---------------------------|---------|
| **v13.x** | `8.3.*\|8.4.*\|8.5.*` | **^13.0** |
| **v12.x** | `8.2.*\|8.3.*\|8.4.*` | **^12.0** |

Install a package version whose row matches your application’s PHP and Laravel versions. The **current** major release is **v13.x** (see [Packagist](https://packagist.org/packages/codebar-ag/laravel-m-files) for the exact tag).

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="CodebarAg\MFiles\MFilesServiceProvider"
```

Add your M-Files authentication credentials to your `.env` file:

```env
M_FILES_URL=https://your-mfiles-server.com
M_FILES_USERNAME=your-username
M_FILES_PASSWORD=your-password
M_FILES_VAULT_GUID=ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW
M_FILES_CACHE_DRIVER=file
M_FILES_EXPIRATION_SECONDS=3600
# M_FILES_SESSION_ID=   # optional; exposed as config('m-files.auth.session_id') for custom use
```

### Configuration Options

The package supports the following configuration options:

- `M_FILES_URL` - Your M-Files server URL
- `M_FILES_USERNAME` - Your M-Files username
- `M_FILES_PASSWORD` - Your M-Files password
- `M_FILES_VAULT_GUID` - The vault GUID to connect to
- `M_FILES_CACHE_DRIVER` - Cache driver for storing authentication tokens (defaults to `CACHE_DRIVER`, then `file`)
- `M_FILES_EXPIRATION_SECONDS` - How long to cache the vault authentication token, in seconds (default: `3600`)
- `M_FILES_SESSION_ID` - Optional; sets `config('m-files.auth.session_id')` (not used by the package’s built-in connector/requests; available for your own integrations)

## Authentication

The package provides automatic authentication token management with caching support.

### M-Files Connector

```php
use CodebarAg\MFiles\Connectors\MFilesConnector;
use CodebarAg\MFiles\DTO\ConfigWithCredentials;

$config = new ConfigWithCredentials(
    url: 'https://your-mfiles-server.com',
    vaultGuid: '{ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW}',
    username: 'your-username',
    password: 'your-password',
    cacheDriver: 'file',
    tokenTtlSeconds: 3600,
);

$connector = new MFilesConnector(configuration: $config);
```

### How the connector authenticates

Authentication is handled automatically by the `MFilesConnector`. When you create a connector instance with your credentials, it will automatically:

1. **Cache authentication tokens** - Tokens are cached for `M_FILES_EXPIRATION_SECONDS` / `config('m-files.auth.expiration')` (default 3600 seconds), or the `tokenTtlSeconds` argument on `ConfigWithCredentials`
2. **Include authentication headers** - The `X-Authentication` header is automatically added to all requests
3. **Handle token refresh** - When the cache entry expires, a new token is obtained on the next request

You can optionally inject a `CacheKeyManager` for tests or custom cache wiring: `new MFilesConnector(configuration: $config, cacheKeyManager: $manager)`.

### Cache and production security

- Auth tokens are stored in your configured **Laravel cache store**. Use a **private** backend in production (not a shared public cache).
- Cache keys incorporate a hash of connection parameters (including credentials). For **multi-tenant** apps, avoid sharing one cache namespace across tenants; prefer per-tenant key prefixes or separate Redis databases where applicable.

```php
use CodebarAg\MFiles\Requests\LogInToVaultRequest;

// Manual authentication (if needed)
$request = new LogInToVaultRequest(
    url: 'https://your-mfiles-server.com',
    vaultGuid: '{ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW}',
    username: 'your-username',
    password: 'your-password',
);

$token = $request->send()->dto();
// Returns authentication token as string
```

## Requests

### Authentication Requests

#### LogInToVaultRequest

Gets an authentication token using username/password credentials.

**Constructor Parameters:**
- `url` (string) - M-Files server URL
- `vaultGuid` (string) - Vault GUID
- `username` (string) - M-Files username
- `password` (string) - M-Files password

**Request:**
```php
use CodebarAg\MFiles\Requests\LogInToVaultRequest;

$request = new LogInToVaultRequest(
    url: 'https://your-mfiles-server.com',
    vaultGuid: '{ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW}',
    username: 'your-username',
    password: 'your-password',
);
```

**Response:**
```php
$token = $request->send()->dto();
// Returns authentication token as string
```

### File Requests

#### UploadFileRequest

Uploads a file to M-Files.

**Constructor Parameters:**
- `fileContent` (string) - File content
- `fileName` (string) - File name

**Request:**
```php
use CodebarAg\MFiles\Requests\UploadFileRequest;

$request = new UploadFileRequest(
    fileContent: $fileContent,
    fileName: 'document.pdf'
);
```

**Response:**
```php
$uploadedFile = $connector->send($request)->dto();
// Returns array with file information including Title, Extension, and other metadata
```

#### CreateSingleFileDocumentRequest

Creates a single file document in M-Files.

**Constructor Parameters:**
- `title` (string) - Document title
- `files` (array) - Array of uploaded file information
- `propertyValues` (array) - Array of SetProperty objects for custom properties

**Request:**
```php
use CodebarAg\MFiles\Requests\CreateSingleFileDocumentRequest;
use CodebarAg\MFiles\DTO\SetProperty;
use CodebarAg\MFiles\Enums\MFDataTypeEnum;

$request = new CreateSingleFileDocumentRequest(
    title: 'My Document',
    files: [$uploadedFile]
);
```

**Response:**
```php
use CodebarAg\MFiles\DTO\ObjectProperties;

$document = $connector->send($request)->dto();
// Returns ObjectProperties DTO with document information
```

**With Custom Property Values:**
```php
$propertyValues = [
    new SetProperty(propertyDef: 0, dataType: MFDataTypeEnum::TEXT, value: 'Custom Title'),
    new SetProperty(propertyDef: 5, dataType: MFDataTypeEnum::DATE, value: '2024-01-01'),
];

$request = new CreateSingleFileDocumentRequest(
    title: 'Custom Document',
    files: [$uploadedFile],
    propertyValues: $propertyValues
);
```

#### DownloadFileRequest

Downloads a file from M-Files.

**Constructor Parameters:**
- `objectType` (int) - Object type ID
- `objectId` (int) - Object ID
- `objectVersion` (int) - Object version
- `fileId` (int) - File ID

**Request:**
```php
use CodebarAg\MFiles\Requests\DownloadFileRequest;

$request = new DownloadFileRequest(
    objectType: 0,
    objectId: 123,
    objectVersion: 1,
    fileId: 456
);
```

**Response:**
```php
use CodebarAg\MFiles\DTO\DownloadedFile;

$downloadedFile = $connector->send($request)->dto();
// Returns DownloadedFile DTO with content, name, extension, size, contentType
```

### Property Requests

#### GetObjectInformationRequest

Retrieves object information and properties from M-Files.

**Constructor Parameters:**
- `objectType` (int) - Object type ID
- `objectId` (int) - Object ID
- `objectVersion` (int) - Object version

**Request:**
```php
use CodebarAg\MFiles\Requests\GetObjectInformationRequest;

$request = new GetObjectInformationRequest(
    objectType: 0,
    objectId: 123,
    objectVersion: 1
);
```

**Response:**
```php
use CodebarAg\MFiles\DTO\ObjectProperties;

$objectProperties = $connector->send($request)->dto();
// Returns ObjectProperties DTO with object information and properties
```

#### SetPropertiesRequest

Sets properties for an existing object in M-Files.

**Constructor Parameters:**
- `objectType` (int) - Object type ID
- `objectId` (int) - Object ID
- `objectVersion` (int) - Object version (-1 for latest)
- `propertyValues` (array) - Array of SetProperty objects

**Request:**
```php
use CodebarAg\MFiles\Requests\SetPropertiesRequest;
use CodebarAg\MFiles\DTO\SetProperty;
use CodebarAg\MFiles\Enums\MFDataTypeEnum;

$propertyValues = [
    new SetProperty(1856, MFDataTypeEnum::BOOLEAN, true),
    new SetProperty(0, MFDataTypeEnum::TEXT, 'Updated Title'),
];

$request = new SetPropertiesRequest(
    objectType: 140,
    objectId: 1770,
    objectVersion: -1,
    propertyValues: $propertyValues
);
```

**Response:**
```php
use CodebarAg\MFiles\DTO\ObjectProperties;

$objectProperties = $connector->send($request)->dto();
// Returns ObjectProperties DTO with updated object information
```

## DTOs

### Configuration DTOs

#### ConfigWithCredentials

Represents M-Files configuration with authentication credentials.

**Properties:**
- `url` (string) - M-Files server URL
- `vaultGuid` (string) - Vault GUID
- `username` (string) - M-Files username
- `password` (string) - M-Files password
- `cacheDriver` (string|null) - Cache store name for tokens (see `M_FILES_CACHE_DRIVER` / `config('m-files.cache_driver')`)
- `tokenTtlSeconds` (int) - Cache TTL for the vault token in seconds (default **3600**; must be **≥ 1**)

**Methods:**
- `fromArray(array $data): self` - Builds from an array; **requires a Laravel app context** so `config('m-files.*')` defaults apply for omitted `cacheDriver` / `tokenTtlSeconds`. Required keys: `url`, `vaultGuid`, `username`, `password` (each a non-empty string). Throws `InvalidArgumentException` if validation fails.
- `toArray(): array` - Converts to array format (includes `tokenTtlSeconds`)

**Usage:**
```php
use CodebarAg\MFiles\DTO\ConfigWithCredentials;

$config = new ConfigWithCredentials(
    url: 'https://your-mfiles-server.com',
    vaultGuid: '{ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW}',
    username: 'your-username',
    password: 'your-password',
    cacheDriver: 'file',
    tokenTtlSeconds: 3600,
);

// Using static factory method (inside a Laravel application)
$config = ConfigWithCredentials::fromArray([
    'url' => 'https://your-mfiles-server.com',
    'vaultGuid' => '{ABC0DE2G-3HW-QWCQ-SDF3-WERWETWETW}',
    'username' => 'your-username',
    'password' => 'your-password',
    'cacheDriver' => 'file',
    'tokenTtlSeconds' => 3600,
]);
```

### File DTOs

#### File

Represents a file in M-Files.

**Properties:**
- `id` (int) - File ID
- `name` (string) - File name
- `extension` (string|null) - File extension
- `version` (int|null) - File version
- `size` (int|null) - File size in bytes

**Methods:**
- `fromArray(array $data): self` - Static factory method
- `toArray(): array` - Converts to array format

**Usage:**
```php
use CodebarAg\MFiles\DTO\File;

$file = new File(
    id: 456,
    name: 'document.pdf',
    extension: 'pdf',
    version: 1,
    size: 1024
);

// Using static factory method
$file = File::fromArray([
    'ID' => 456,
    'Name' => 'document.pdf',
    'Extension' => 'pdf',
    'Version' => 1,
    'Size' => 1024
]);
```

#### DownloadedFile

Represents a downloaded file with content and metadata.

**Properties:**
- `name` (string|null) - File name
- `extension` (string|null) - File extension
- `size` (int|null) - File size in bytes
- `contentType` (string|null) - MIME content type
- `content` (string) - File content

**Methods:**
- `fromArray(array $data): self` - Static factory method
- `toArray(): array` - Converts to array format

**Usage:**
```php
use CodebarAg\MFiles\DTO\DownloadedFile;

$downloadedFile = new DownloadedFile(
    name: 'document.pdf',
    extension: 'pdf',
    size: 1024,
    contentType: 'application/pdf',
    content: $fileContent
);

// Using static factory method
$downloadedFile = DownloadedFile::fromArray([
    'name' => 'document.pdf',
    'extension' => 'pdf',
    'size' => 1024,
    'contentType' => 'application/pdf',
    'content' => $fileContent
]);
```

### Property DTOs

#### SetProperty

Represents a property value for creating documents.

**Properties:**
- `propertyDef` (int) - Property definition ID
- `dataType` (MFDataTypeEnum) - Property data type
- `value` (mixed) - Property value
- `displayValue` (mixed) - Display value (optional)

**Methods:**
- `fromArray(int $propertyDef, MFDataTypeEnum $dataType, mixed $value, mixed $displayValue = null): self` - Static factory method
- `toArray(): array` - Converts to array format for API requests

**Usage:**
```php
use CodebarAg\MFiles\DTO\SetProperty;
use CodebarAg\MFiles\Enums\MFDataTypeEnum;

$propertyValue = new SetProperty(
    propertyDef: 0,
    dataType: MFDataTypeEnum::TEXT,
    value: 'Sample Text'
);

// Using static factory method
$propertyValue = SetProperty::fromArray(
    propertyDef: 0,
    dataType: MFDataTypeEnum::TEXT,
    value: 'Sample Text'
);

// Convert to array for API requests
$array = $propertyValue->toArray();
```

#### GetProperty

Represents a property retrieved from M-Files.

**Properties:**
- `propertyDef` (int) - Property definition ID
- `dataType` (MFDataTypeEnum) - Property data type
- `value` (mixed) - Property value
- `displayValue` (mixed) - Display value

**Methods:**
- `fromArray(array $data): self` - Static factory method
- `toArray(): array` - Converts to array format

**Usage:**
```php
use CodebarAg\MFiles\DTO\GetProperty;

$property = GetProperty::fromArray([
    'PropertyDef' => 0,
    'Value' => [
        'DataType' => 1,
        'Value' => 'Sample Text',
        'DisplayValue' => 'Sample Text'
    ]
]);
```

#### ObjectProperties

Represents object properties in M-Files.

**Properties:**
- `classId` (int) - Class ID
- `objectId` (int) - Object ID
- `objectTypeId` (int) - Object type ID
- `objectVersionId` (int) - Object version ID
- `lastModifiedAt` (CarbonImmutable) - Last modified timestamp
- `properties` (Collection) - Collection of GetProperty objects
- `files` (Collection) - Collection of File objects

**Methods:**
- `fromArray(array $data): self` - Static factory method
- `toArray(): array` - Converts to array format

**Usage:**
```php
use CodebarAg\MFiles\DTO\ObjectProperties;

$objectProperties = ObjectProperties::fromArray([
    'Class' => 1,
    'ObjVer' => [
        'ID' => 123,
        'Type' => 0,
        'Version' => 1,
        'Modified' => '2024-01-01T00:00:00Z'
    ],
    'Properties' => [],
    'Files' => []
]);
```

### Enums

#### MFDataTypeEnum

Represents data types in M-Files.

**Available Values:**
- `UNINITIALIZED` (0) - Document/Object
- `TEXT` (1) - Text
- `INTEGER` (2) - A 32-bit integer
- `FLOATING` (3) - A double-precision floating point
- `DATE` (5) - Date
- `TIME` (6) - Time
- `TIMESTAMP` (7) - Timestamp
- `BOOLEAN` (8) - Boolean
- `LOOKUP` (9) - Lookup (from a value list)
- `MULTISELECTLOOKUP` (10) - Multiple selection from a value list
- `INTEGER64` (11) - A 64-bit integer
- `FILETIME` (12) - FILETIME (a 64-bit integer)
- `MULTILINETEXT` (13) - Multi-line text
- `ACL` (14) - The access control list (ACL)

**Usage:**
```php
use CodebarAg\MFiles\Enums\MFDataTypeEnum;

$dataType = MFDataTypeEnum::TEXT;
$dataTypeValue = $dataType->value; // 1
```

## Testing

```bash
composer test
```

`composer test` runs Pest with `--no-coverage` so the suite passes without PCOV or Xdebug (PHPUnit is configured with `failOnWarning="true"`, and missing a coverage driver would otherwise fail the run).

Static analysis:

```bash
composer analyse
```

To generate a coverage report locally, install and enable [PCOV](https://github.com/krakjoe/pcov) or Xdebug, then run:

```bash
composer test-coverage
```

On GitHub Actions, the `run-tests` workflow runs the matrix with `--no-coverage` and includes a **coverage** job (PHP 8.5 + PCOV) that writes Clover output and uploads it as a workflow artifact.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Open a pull request or issue on [GitHub](https://github.com/codebar-ag/laravel-m-files). Please run `composer test` and `composer analyse` before submitting.

## Security

Operational notes on caching and credentials are described under [Cache and production security](#cache-and-production-security).

If you discover any security related issues, please email security@codebar.ch instead of using the issue tracker.

## Credits

- [Codebar Solutions AG](https://github.com/codebar-ag)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
