# Boogle Client

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-10%20|%2011%20|%2012%20|%2013-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![License](https://img.shields.io/badge/License-MIT-005f73)](LICENSE)
[![Packagist](https://img.shields.io/packagist/v/andreapollastri/boogle-client.svg?label=Packagist)](https://packagist.org/packages/andreapollastri/boogle-client)

> **Exception reporting for Laravel** — send errors, stack traces, and HTTP context from your application to a [Boogle](https://boogle.app) instance, or to any compatible ingestion endpoint.

The package hooks into Laravel’s native reporting: environment and exception filters, deduplication, and a full **request snapshot** (URL, method, body, query, optional headers and session) with sensitive keys masked.

---

## Contents

- [Requirements](#requirements)
- [Features](#features)
- [Installation](#installation)
- [Exception handler registration](#exception-handler-registration)
- [JSON payload shape](#json-payload-shape)
- [Configuration](#configuration)
- [Artisan and testing](#artisan-and-testing)
- [Boogle app and API alignment](#boogle-app-and-api-alignment)
- [License](#license)

---

## Requirements

- **PHP** 8.2+
- **Laravel** 10, 11, 12, or 13
- **Guzzle** 7 (pulled in as a dependency)

---

## Features

| | |
| :--- | :--- |
| **Laravel-native** | Service provider, `Boogle` facade, Artisan commands |
| **Exception payload** | Class, message, file, line, stack (configurable frame limit), runtime info (PHP, Laravel, DB, memory) |
| **HTTP snapshot** | Under `exception.http`: URL, query, body, cookies, method, IP, user agent, client hints (browser / OS), plus optional session and headers |
| **User** | `exception.user` with `id`, `uuid`, `email`, `name` when authenticated |
| **Safe in dev** | If `BOOGLE_*` is missing or invalid, nothing is sent; use `Boogle::isEnabled()` for conditional logic |
| **Control over delivery** | Environments, ignored classes, cache-based dedup, and masking via `config/boogle.php` |

---

## Installation

```bash
composer require andreapollastri/boogle-client
php artisan boogle:install
```

| `.env` variable | Role |
| :--- | :--- |
| `BOOGLE_KEY` | API token |
| `BOOGLE_PROJECT_KEY` | Project identifier |
| `BOOGLE_SERVER` | Ingestion URL (default: `https://boogle.app/api/log`) |

---

## Exception handler registration

| Version | Where to wire |
| :--- | :--- |
| **Laravel 11+** | `bootstrap/app.php` → `withExceptions` callback |
| **Laravel ≤ 10** | `App\Exceptions\Handler` → `register` |

**Laravel 11+**

```php
use Boogle\Facade as Boogle;
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions) {
    Boogle::registerExceptionHandler($exceptions);
})
```

**Laravel 10 and below** — in `App\Exceptions\Handler::register()`:

```php
$this->reportable(function (\Throwable $e) {
    Boogle::handle($e);
});
```

---

## JSON payload shape

### Root

| Key | Value |
| :--- | :--- |
| `key` | `BOOGLE_PROJECT_KEY` |
| `token` | `BOOGLE_KEY` |
| `exception` | Object described below |

### `exception` (main fields)

| Key | Value |
| :--- | :--- |
| `exception` | Exception FQCN |
| `error` | Message |
| `file`, `line`, `class` | Where the error occurred |
| `fileType` | Default `php`, or the value passed to `handle()` |
| `executor` | Stack trace (up to `lines_count` **frames**) |
| `storage` | PHP and Laravel versions, DB driver, memory use |
| `user` | When logged in: `id`, `uuid`, `email`, `name` — otherwise `null` |
| `http` | **Request snapshot** (full context for Boogle) |
| `host` | Request host (or hostname with no HTTP context) |
| `method` | Same as `http.method` (backwards compatible with older views) |
| `fullUrl` | Same as `http.url` |

### `exception.http` (for every report that passes config)

| Field | Description |
| :--- | :--- |
| `url` | Full URL including query string (`$request->fullUrl()`) |
| `query` | Query parameters array (subject to `include_query`) |
| `payload` | Body: parsed JSON or form fields, without duplicating query params; GET → `[]` |
| `cookies` | Name → value (after `blacklist`), or if `cookie_values` is `false`, name → `[REDACTED]` |
| `method` | `GET`, `POST`, `PUT`, … |
| `ip` | Client IP |
| `user_agent` | Full user agent string |
| `client` | `browser` and `os` (heuristics + Client Hints when available) |
| `content_type` | `Content-Type` header value |
| `is_json` | Request detected as JSON |
| `wants_json` | `expectsJson()` |
| `is_ajax` | `ajax()` (XMLHttpRequest) |
| `is_secure` | HTTPS |
| `referer` | `Referer` header if present |
| `headers` | Only if `include_headers: true` (with masking) |
| `session` | Only if `include_session: true` (with masking) |

**Custom data** — third argument: `Boogle::handle($e, 'php', ['http' => ['note' => 'x']])` with [`array_replace_recursive`](https://www.php.net/array_replace_recursive) merged into `http`. Other keys in the same array are merged into `exception` as before.

The config `blacklist` masks passwords, tokens, and similar keys in query, payload, cookies, session, and headers.

---

## Configuration

Published as `config/boogle.php`.

| Key | Role |
| :--- | :--- |
| `environments` | e.g. `['production']` — reports only run in these environments |
| `except` | Exception classes that are never reported |
| `lines_count` | How many **frames** of the stack to include in `executor` |
| `sleep` | Seconds to deduplicate the same exception (`0` = every throw attempts a send) |
| `blacklist` | Sub-keys to replace with `[REDACTED]` |
| `http` | `include_query`, `include_payload`, `include_cookies`, `cookie_values`, `include_session`, `include_headers` |

For backward compatibility, the older `context` key (from earlier releases) is still read: `include_input` maps to `include_payload`.

---

## Artisan and testing

| Command | What it does |
| :--- | :--- |
| `boogle:install` | Publishes the config file |
| `boogle:test` | Sends a test exception (no-op when Boogle is disabled) |

In tests, swap the container binding for `Boogle\Fakes\BoogleFake`.

---

## Boogle app and API alignment

Notes for the [Boogle](https://boogle.app) product or a self‑hosted instance so the dashboard and storage match everything this client sends today.

1. **Ingestion (`POST` to the log URL)**  
   - Persist the full **`exception`** object (JSON column or equivalent), not a narrow subset of fields.  
   - In particular, map and store **`exception.http`**.

2. **Model / database**  
   - A JSON field or column for **`http`**, or flat derived columns: `url`, `method`, `ip`, `user_agent`, plus JSON for `query`, `payload`, `cookies`.  
   - Columns for `exception.user` (e.g. nullable `user_id`) if you need server-side indexes or filters.

3. **Error detail view**  
   - A “Request / context” area with `http.url`, `http.method`, `http.query`, `http.payload`, `http.cookies`, `http.ip`, `http.user_agent`, `http.client`, and `referer` / `is_ajax` as needed.  
   - A “User” area reading `exception.user` (id, email) when not `null`.  
   - Keep that separate from any free-text feedback form (a different feature).

4. **API validation**  
   - Avoid overly strict `validate` rules on the client body: do not drop rich payloads in `exception.http`.

5. **Indexes and privacy**  
   - Optionally truncate or hash sensitive values in `http.payload` / cookies in the UI (the client already applies `blacklist`).

6. **Product documentation**  
   - Official integration contract: `key`, `token`, and `exception` with the sub-structure documented in this README.

---

## License

MIT — see `composer.json` and the repository license file.
