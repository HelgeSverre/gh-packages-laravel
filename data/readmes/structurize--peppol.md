# Laravel Structurize Peppol

This package provides a Laravel integration for generating and sending
UBL invoices over the Peppol network using the Structurize API.

It extends the base `structurize/structurize` package and adds
Peppol-specific tools, migrations, services, and configuration options.

## Features

-   Generate UBL invoices using Structurize
-   Send invoices over the Peppol network
-   Database logging for Peppol communication
-   Company Peppol connectivity tracking
-   Multi-tenant support (optional)
-   Simple service-based invoice sending API

## Installation

### 1. Install Structurize core package

``` bash
composer require structurize/structurize
```

### 2. Create a Structurize account & API Key

Sign up and generate an API key on the Structurize platform.

### 3. Register your company as a Peppol participant

Follow the Digiteal documentation:

https://doc.digiteal.eu/reference/registerparticipant

### 4. Configure environment variables

``` env
STRUCTURIZE_API_URL=https://app.structurize.be/api/v2/
STRUCTURIZE_API_KEY={your-api-key}
```

### 5. Update `config/services.php`

``` php
'structurize' => [
    'api_url' => env('STRUCTURIZE_API_URL'),
    'key'     => env('STRUCTURIZE_API_KEY'),
],
```

## Install the Peppol package

``` bash
composer require structurize/peppol
```

## Configuration

### Publish config and migrations

``` bash
php artisan vendor:publish --tag=peppol-config
php artisan vendor:publish --tag=peppol-migrations
php artisan migrate
```

# Config File Explanation (`config/peppol.php`)

## api_key

Defines which env variable contains the Structurize API key.

## tables

Defines the database tables used by the package.

## table-fields

Field mapping for your tables.

## services

Defines the service used to generate the JSON payload required to build
UBL invoices.

## multi_tenant

Used when your application needs to work with multiple Structurize API
keys.

## Usage

```

### Send Invoice Over Peppol

``` php
$peppolService->sendInvoice($invoice);
```

### Scheduling

``` php
$schedule->command('peppol:sync-companies company')->daily();
```

### UI Integration

Use fields like:

-   `company->peppol_connected`
-   `invoice->peppol_sent`
-   `invoice->peppol_sent_at`

## License

MIT
