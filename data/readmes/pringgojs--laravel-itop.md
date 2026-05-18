# Laravel iTop Wrapper

This package is a very small, database‑centric wrapper around iTop for Laravel
projects. It provides Eloquent models corresponding to the iTop schema, a simple
API client (`ApiService`), and a handful of helpers/builders to construct payloads
for the iTop REST interface.

It **does not** include any migrations, configuration defaults, or automatic
synchronisation/forwarding logic – those responsibilities are left to the
consuming application. Think of it as a lightweight toolkit rather than a full
integration suite.

---

## Contents

- Eloquent models mirroring common iTop tables (`Ticket`, `Attachment`,
  `Contact`, etc.).
- `Services\ApiService` – a minimal HTTP client for the iTop REST API.
- `Services\ItopServiceBuilder` – static helpers to build JSON payloads for
  ticket creation, attachment upload, state updates, etc.
- Traits for ticket relations and utility methods.

There is no default configuration schema and no supplied migrations.

## 📦 Installation

```bash
composer require pringgojs/laravel-itop
```

The service provider is auto‑discovered by Laravel. If you need to override the
empty `itop.php` configuration file you may publish it:

```bash
php artisan vendor:publish \
    --provider="Pringgojs\LaravelItop\LaravelItopServiceProvider" \
    --tag="config"
```

No migrations are included; the models assume that your database already
contains the appropriate iTop tables.

## 🔧 Configuration

The default `config/itop.php` is empty. Add whatever settings your application
requires (e.g. base URLs, credentials) and resolve them when instantiating the
services.

## 🛠 Usage

The package does not provide high‑level jobs or commands. Use the provided
classes directly in your own code. For example, create a client and send a
request:

```php
$itop = new \Pringgojs\LaravelItop\Services\ApiService(
    'https://itop.example.com',
    'admin',
    'secret'
);

$response = $itop->callApi([
    'operation' => 'core/create',
    'class'     => 'UserRequest',
    'fields'    => [/* ... */],
]);
```

Helpers are available to build the payloads:

```php
$payload = \Pringgojs\LaravelItop\Services\ItopServiceBuilder::payloadTicketCreate([
    'title' => 'Example',
    // …
]);
```

Models in `src/Models` can be used to read/write existing iTop tables with
Eloquent.

## 📁 Structure

The package is deliberately small – the main directories are:

- `src/Models` – Eloquent representations of iTop tables.
- `src/Services` – HTTP client and payload builders.
- `src/Builders` – convenience methods for common iTop request formats.
- `src/Traits` & `src/Utils` – assorted helpers.

## 🧪 Testing

There are no package tests; integrate models and services directly in your
application’s test suite as needed.

## 📚 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.

---

Feel free to contribute or report issues at the repository on GitHub.
