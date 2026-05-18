# phila-opa

A Laravel package for querying the **Philadelphia Office of Property Assessment (OPA)** public dataset via Carto's SQL API. It gives you a fluent, Eloquent-style query builder, a typed read-only `OpaProperty` model, opt-in caching, and a raw-SQL escape hatch.

## What this package does

The City of Philadelphia publishes assessment data for every property in the city — roughly 580,000 parcels covering owners, addresses, market values, sale history, building characteristics, zoning, and more. That data is exposed publicly through Carto, a hosted PostGIS database, which accepts SQL queries over an HTTP endpoint at `https://phl.carto.com/api/v2/sql` and returns JSON. There is no official Laravel client. To use the data from a Laravel app you would normally hand-write SQL strings, send them via Guzzle, parse the JSON, and cast the loosely-typed strings that come back into something useful. **This package does all of that for you.**

You write code that looks like Eloquent (`OpaProperty::query()->where('zip_code', '19103')->limit(50)->get()`), and the package compiles a safe SQL string, sends it to Carto, parses the response, and hands you back a collection of `OpaProperty` objects whose `market_value` is a `float`, `sale_date` is a `Carbon` instance, and so on. You can also drop down to the plain builder when you don't need the model, or skip the builder entirely and run raw SQL when you need joins, aggregates, or PostGIS calls the builder doesn't model.

## How it works

The package has three layers, each doing one job. The **query builder** (`JerseyMike\PhilaOpa\Query\Builder`) collects your `where`, `whereIn`, `orderBy`, etc. calls into a structured array of clauses. Each column you reference is checked against a hard-coded schema (`JerseyMike\PhilaOpa\Support\Fields::SCHEMA`) — this catches typos at the call site and prevents identifier injection by refusing any column the dataset doesn't actually have. When you call `get()` or `count()`, the builder hands its accumulated state to the **grammar** (`JerseyMike\PhilaOpa\Query\Grammar`), which compiles a single Postgres-flavored SQL string. The grammar is the only place that produces SQL: it wraps identifiers, validates operators against an allowlist, and escapes string values by doubling single quotes.

That SQL string then goes to the **Carto client** (`JerseyMike\PhilaOpa\Client\CartoClient`), which is a thin wrapper around Laravel's HTTP client. It picks `GET` for short queries and switches to `POST` automatically when the SQL gets longer than 2 KB (so big `WHERE ... IN (...)` lists don't blow URL length limits at proxies and CDNs). If caching is enabled — either globally via config or per-query via `->cache($ttl)` — the client wraps the HTTP call in `Cache::remember()` keyed by the SHA-1 hash of the SQL, so identical queries are served from cache and different queries don't collide. The HTTP response is checked for non-2xx status (which throws a `CartoApiException` carrying the original payload) and the `rows` array is returned. If you used `OpaProperty::query()`, those rows are then hydrated into model instances; if you used `Opa::query()`, you get the raw associative arrays.

The **`OpaProperty` model** is deliberately not an Eloquent model — there is no database connection involved. It's a small read-only value object that takes a row from Carto and applies type casts on attribute access using the same schema constant the builder uses for validation. This keeps the package lightweight (no `DatabaseManager`, no migrations, no relationships to confuse) while still giving you the ergonomic `$property->market_value` access pattern with proper PHP types. Everything is wired up by `PhilaOpaServiceProvider` as singletons, registered automatically through Laravel's package discovery, and exposed through the `Opa` facade for code that prefers a static API.

> **Data sources**
> - Dataset reference: [`opa_properties_public`](https://cityofphiladelphia.github.io/carto-api-explorer/#opa_properties_public)
> - Field metadata: [Philadelphia metadata catalog](https://metadata.phila.gov/#home/datasetdetails/5543865f20583086178c4ee5/representationdetails/55d624fdad35c7e854cb21a4/)
> - SQL endpoint: `https://phl.carto.com/api/v2/sql`

---

## Table of contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Quickstart](#quickstart)
5. [The query builder](#the-query-builder)
   - [Selecting columns](#selecting-columns)
   - [Where clauses](#where-clauses)
   - [Ordering, limit, offset](#ordering-limit-offset)
   - [Aggregates and existence](#aggregates-and-existence)
   - [Inspecting the SQL](#inspecting-the-sql)
6. [The `OpaProperty` model](#the-opaproperty-model)
7. [Caching](#caching)
8. [Raw SQL escape hatch](#raw-sql-escape-hatch)
9. [Field schema reference](#field-schema-reference)
10. [Error handling](#error-handling)
11. [Architecture](#architecture)
12. [Testing](#testing)
13. [Recipes](#recipes)
14. [Limitations and gotchas](#limitations-and-gotchas)
15. [Contributing](#contributing)
16. [License](#license)

---

## Requirements

| Dependency  | Version          |
| ----------- | ---------------- |
| PHP         | `^8.2`           |
| Laravel     | `^11.0` or `^12.0` |
| HTTP client | Guzzle `^7.8` (transitive via `illuminate/http`) |

The package uses Laravel's `Http`, `Cache`, and `Config` contracts. No database connection is required — all data comes from Carto's public SQL endpoint.

---

## Installation

```bash
composer require jersey-mike/phila-opa
```

The service provider and `Opa` facade are auto-discovered via Laravel's package discovery, so there is nothing else to register.

Optionally publish the config file so you can change the endpoint, timeout, or cache settings:

```bash
php artisan vendor:publish --tag=phila-opa-config
```

This creates `config/phila-opa.php` in your application.

---

## Configuration

The published `config/phila-opa.php`:

```php
return [
    'endpoint' => env('PHILA_OPA_ENDPOINT', 'https://phl.carto.com/api/v2/sql'),
    'table'    => env('PHILA_OPA_TABLE', 'opa_properties_public'),
    'timeout'  => (int) env('PHILA_OPA_TIMEOUT', 15),

    'cache' => [
        'enabled' => (bool) env('PHILA_OPA_CACHE', false),
        'store'   => env('PHILA_OPA_CACHE_STORE', null),  // null = default Laravel cache store
        'ttl'     => (int) env('PHILA_OPA_CACHE_TTL', 3600),
        'prefix'  => 'phila-opa:',
    ],
];
```

### Environment variables

| Variable                  | Default                                | Purpose                                                       |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| `PHILA_OPA_ENDPOINT`      | `https://phl.carto.com/api/v2/sql`     | Carto SQL endpoint (rarely changes)                           |
| `PHILA_OPA_TABLE`         | `opa_properties_public`                | Source table name                                             |
| `PHILA_OPA_TIMEOUT`       | `15`                                   | HTTP timeout in seconds                                       |
| `PHILA_OPA_CACHE`         | `false`                                | When `true`, every query is cached using `cache.ttl`          |
| `PHILA_OPA_CACHE_STORE`   | (default store)                        | Laravel cache store name (e.g. `redis`, `file`, `array`)      |
| `PHILA_OPA_CACHE_TTL`     | `3600`                                 | Default cache lifetime in seconds when global cache is on     |

---

## Quickstart

```php
use JerseyMike\PhilaOpa\Models\OpaProperty;
use JerseyMike\PhilaOpa\Facades\Opa;

// Eloquent-style — returns a ResultCollection<OpaProperty>
$results = OpaProperty::query()
    ->where('zip_code', '19103')
    ->where('market_value', '>', 500_000)
    ->whereIn('category_code', [1, 2])
    ->orderByDesc('market_value')
    ->limit(50)
    ->get();

foreach ($results as $property) {
    echo "{$property->location} — \${$property->market_value}\n";
}

// Find by parcel number
$one = OpaProperty::findByParcel('883309000');
echo $one->market_value;          // float
echo $one->sale_date->toDateString(); // Carbon

// Builder without the model — returns plain associative arrays
$rows = Opa::query()
    ->select(['parcel_number', 'market_value'])
    ->where('owner_1', 'like', 'SMITH%')
    ->limit(10)
    ->get();

// Raw SQL escape hatch
$rows = Opa::sql("SELECT COUNT(*) AS n FROM opa_properties_public WHERE year_built > 2000");
```

---

## The query builder

You can obtain a builder in two ways:

```php
use JerseyMike\PhilaOpa\Models\OpaProperty;
use JerseyMike\PhilaOpa\Facades\Opa;

$modelBuilder = OpaProperty::query();   // ->get() returns ResultCollection<OpaProperty>
$plainBuilder = Opa::query();           // ->get() returns ResultCollection<array>
```

Both return an `JerseyMike\PhilaOpa\Query\Builder`. They differ only in whether the rows are hydrated into `OpaProperty` instances.

> **Schema enforcement.** Every column reference (in `select`, `where`, `orderBy`, etc.) is validated against the OPA schema (see [Field schema reference](#field-schema-reference)). Unknown columns throw `InvalidQueryException`. This catches typos and prevents identifier injection. If you need a column the schema does not list, use [`Opa::sql(...)`](#raw-sql-escape-hatch).

### Selecting columns

```php
Opa::query()->select(['parcel_number', 'market_value', 'zip_code'])->get();

// Equivalent variadic form
Opa::query()->select('parcel_number', 'market_value')->get();

// No select() call → SELECT *
Opa::query()->limit(5)->get();
```

### Where clauses

| Method                                              | SQL fragment                            |
| --------------------------------------------------- | --------------------------------------- |
| `where('zip_code', '19103')`                        | `zip_code = '19103'`                    |
| `where('market_value', '>', 500000)`                | `market_value > 500000`                 |
| `orWhere('zip_code', '19104')`                      | `OR zip_code = '19104'`                 |
| `whereIn('category_code', [1, 2, 3])`               | `category_code IN (1, 2, 3)`            |
| `whereNotIn('category_code', [99])`                 | `category_code NOT IN (99)`             |
| `whereNull('sale_date')` / `whereNotNull(...)`      | `sale_date IS [NOT] NULL`               |
| `whereBetween('year_built', 1990, 2000)`            | `year_built BETWEEN 1990 AND 2000`      |
| `whereLike('owner_1', 'SMITH%')`                    | `owner_1 LIKE 'SMITH%'`                 |
| `whereILike('location', '%chestnut%')`              | `location ILIKE '%chestnut%'`           |

#### Allowed operators

`=`, `!=`, `<>`, `<`, `<=`, `>`, `>=`, `LIKE`, `ILIKE`, `NOT LIKE`, `NOT ILIKE`, `IS`, `IS NOT`. Case-insensitive — anything else throws `InvalidQueryException`.

#### Nested groups (closures)

```php
Opa::query()
    ->where('zip_code', '19103')
    ->orWhere(function ($q) {
        $q->where('zip_code', '19104')
          ->where('market_value', '>', 100_000);
    })
    ->get();
// → WHERE zip_code = '19103' OR (zip_code = '19104' AND market_value > 100000)
```

A closure passed to `where()` / `orWhere()` receives a fresh nested builder. Only its `wheres` are merged into the parent query — `select`, `limit`, etc. are ignored on nested builders.

#### Value escaping

- Strings have single quotes doubled (`O'Brien` → `'O''Brien'`).
- Integers and floats are emitted unquoted.
- `null` becomes `NULL`.
- `true` / `false` become `TRUE` / `FALSE`.
- `DateTimeInterface` instances become `'Y-m-d H:i:s'`.
- Backed enums use their `->value`.

### Ordering, limit, offset

```php
Opa::query()
    ->orderBy('market_value', 'desc')   // or ->orderByDesc('market_value')
    ->orderBy('parcel_number')          // default 'asc'
    ->limit(100)
    ->offset(200)
    ->get();
```

`orderBy` only accepts `asc` / `desc` (case-insensitive); anything else throws `InvalidQueryException`.

### Aggregates and existence

```php
$count  = Opa::query()->where('zoning', 'RSA-5')->count();   // int
$exists = Opa::query()->where('parcel_number', 'X')->exists();
$first  = OpaProperty::query()->where('zip_code', '19103')->first(); // OpaProperty|null
```

`count()` issues `SELECT COUNT(*) AS aggregate ...` and returns the integer aggregate.

### Inspecting the SQL

```php
$sql = Opa::query()
    ->where('zip_code', '19103')
    ->orderByDesc('market_value')
    ->limit(10)
    ->toSql();

// SELECT * FROM opa_properties_public WHERE zip_code = '19103' ORDER BY market_value DESC LIMIT 10
```

Useful for logging, debugging, or copy-pasting into the [Carto SQL API explorer](https://cityofphiladelphia.github.io/carto-api-explorer/#opa_properties_public).

---

## The `OpaProperty` model

`JerseyMike\PhilaOpa\Models\OpaProperty` is **not** an Eloquent model — it does not use a database connection. It is a lightweight read-only value object with typed accessors.

```php
$p = OpaProperty::findByParcel('883309000');

$p->parcel_number;       // string '883309000'
$p->market_value;        // float
$p->year_built;          // int
$p->sale_date;           // Carbon\Carbon instance
$p->owner_1;             // string
$p->no_such_field;       // null (unknown attributes return null)

$p->toArray();           // raw row as returned by Carto
json_encode($p);         // JSON-serializable
```

Casting rules come from the schema in `JerseyMike\PhilaOpa\Support\Fields::SCHEMA`:

| Column type      | PHP value                                       |
| ---------------- | ----------------------------------------------- |
| `int`            | `int` (via numeric cast; non-numeric pass-through) |
| `float`          | `float`                                         |
| `date`           | `Carbon\Carbon` (parsed; falls back to raw on failure) |
| `bool`           | `bool`                                          |
| `string` / other | raw value                                       |

`null` values are returned as `null` regardless of declared type.

### Static helpers

| Method                                  | Returns                  |
| --------------------------------------- | ------------------------ |
| `OpaProperty::query()`                  | `Builder` (hydrating)    |
| `OpaProperty::findByParcel($parcel)`    | `OpaProperty` or `null`  |
| `OpaProperty::fromRow($row)`            | `OpaProperty` (manual hydration of an array) |

---

## Caching

Caching is **opt-in**. There are two ways to enable it.

### 1. Per-query cache

```php
OpaProperty::query()
    ->where('zip_code', '19103')
    ->cache(600)   // cache this query for 600 seconds
    ->get();
```

The cache key is `phila-opa:` + `sha1($sql)`, so identical SQL strings share a cache entry and different SQL strings do not collide.

### 2. Global cache via config

```env
PHILA_OPA_CACHE=true
PHILA_OPA_CACHE_TTL=3600
PHILA_OPA_CACHE_STORE=redis   # optional
```

Every call through `CartoClient::run()` (which means every builder call and every `Opa::sql(...)`) is cached for `cache.ttl` seconds. A per-query `->cache(ttl)` still overrides the global TTL.

### Cache store

`cache.store` accepts any name registered in your `config/cache.php`. Leave it `null` to use the default store. For tests or short-lived processes, `array` is convenient.

### When to cache

OPA assessment data updates on a slow cadence (annual reassessments and periodic transfers). Hours-long cache TTLs are usually safe and dramatically reduce latency. Skip caching when you need the freshest possible value (e.g. confirming a transfer in real time).

---

## Raw SQL escape hatch

Anything the builder cannot express — joins, window functions, PostGIS calls, columns not in the schema whitelist — can be sent directly to Carto:

```php
use JerseyMike\PhilaOpa\Facades\Opa;

$rows = Opa::sql("
    SELECT zip_code, AVG(market_value) AS avg_value, COUNT(*) AS n
    FROM opa_properties_public
    WHERE year_built > 2000
    GROUP BY zip_code
    ORDER BY avg_value DESC
    LIMIT 20
");

// With caching:
$rows = Opa::sql($sql, cacheTtl: 1800);
```

`Opa::sql()` returns the raw `rows` array from Carto. **You are responsible for safely interpolating any user input** (the builder does this for you; raw SQL does not). Use parameter-style helpers from the grammar if needed:

```php
use JerseyMike\PhilaOpa\Query\Grammar;

$g = app(Grammar::class);
$zip = $g->literal($userInput);   // safely quoted
$rows = Opa::sql("SELECT * FROM opa_properties_public WHERE zip_code = {$zip} LIMIT 5");
```

---

## Field schema reference

The full schema lives in [`src/Support/Fields.php`](src/Support/Fields.php) as `Fields::SCHEMA`. Highlights:

| Column                       | Type     | Notes                              |
| ---------------------------- | -------- | ---------------------------------- |
| `parcel_number`              | string   | OPA's primary identifier (string)  |
| `location`                   | string   | Property street address            |
| `unit`                       | string   | Unit/apt number                    |
| `zip_code`                   | string   | 5-digit ZIP                        |
| `owner_1`, `owner_2`         | string   |                                    |
| `mailing_address_1`/`_2`     | string   |                                    |
| `mailing_city_state`         | string   |                                    |
| `mailing_zip`                | string   |                                    |
| `market_value`               | float    | Total assessed market value        |
| `taxable_land`               | float    |                                    |
| `taxable_building`           | float    |                                    |
| `exempt_land`                | float    |                                    |
| `exempt_building`            | float    |                                    |
| `homestead_exemption`        | float    |                                    |
| `sale_date`                  | date     | Most recent sale                   |
| `sale_price`                 | float    |                                    |
| `recording_date`             | date     |                                    |
| `year_built`                 | int      |                                    |
| `year_built_estimate`        | string   | `Y` or empty                       |
| `total_livable_area`         | float    | sq ft                              |
| `total_area`                 | float    | sq ft                              |
| `frontage`, `depth`          | float    | feet                               |
| `number_of_bedrooms`         | int      |                                    |
| `number_of_bathrooms`        | float    | (e.g. `1.5`)                       |
| `number_of_rooms`            | int      |                                    |
| `number_stories`             | int      |                                    |
| `category_code`              | int      | High-level use category            |
| `category_code_description`  | string   |                                    |
| `building_code`              | string   |                                    |
| `building_code_description`  | string   |                                    |
| `zoning`                     | string   | e.g. `RSA-5`                       |
| `geographic_ward`            | string   |                                    |
| `census_tract`               | string   |                                    |
| `lat`, `lng`                 | float    | Point geometry components          |
| `the_geom`                   | geom     | PostGIS geometry (raw via SQL)     |
| `the_geom_webmercator`       | geom     | PostGIS geometry (web mercator)    |

> Want a column we missed? Open a PR adding it to `Fields::SCHEMA`, or use `Opa::sql()` to bypass the whitelist entirely.

For the authoritative list of fields and their meanings, consult the [Philadelphia metadata catalog page](https://metadata.phila.gov/#home/datasetdetails/5543865f20583086178c4ee5/representationdetails/55d624fdad35c7e854cb21a4/).

---

## Error handling

All exceptions inherit from a small hierarchy:

| Class                                              | Extends                       | Thrown when                                                          |
| -------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `JerseyMike\PhilaOpa\Exceptions\OpaException`          | `RuntimeException`            | Base class for runtime API failures.                                 |
| `JerseyMike\PhilaOpa\Exceptions\CartoApiException`     | `OpaException`                | Carto returned a non-2xx response. Exposes `$statusCode` and `$payload`. |
| `JerseyMike\PhilaOpa\Exceptions\InvalidQueryException` | `InvalidArgumentException`    | Unknown column, bad operator, or invalid order direction.            |

Example:

```php
use JerseyMike\PhilaOpa\Exceptions\CartoApiException;
use JerseyMike\PhilaOpa\Exceptions\InvalidQueryException;

try {
    $rows = Opa::query()->where('typo_column', 'x')->get();
} catch (InvalidQueryException $e) {
    // Schema validation failed — fix your code.
    report($e);
}

try {
    $rows = Opa::sql("SELECT bad_syntax FROM");
} catch (CartoApiException $e) {
    logger()->error('Carto API error', [
        'status'  => $e->statusCode,
        'payload' => $e->payload,
    ]);
}
```

The HTTP layer also throws Laravel's stock `Illuminate\Http\Client\ConnectionException` on network/timeout failures. Wrap calls in your own retry/circuit breaker if needed.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Your application                                                 │
│   OpaProperty::query()       Opa::query()       Opa::sql(...)    │
└──────────────────┬───────────────┬──────────────────┬────────────┘
                   │               │                  │
                   ▼               ▼                  ▼
              ┌───────────────────────────┐    ┌────────────────┐
              │  Query\Builder            │    │  OpaManager    │
              │  • where/whereIn/etc.     │    │  • query()     │
              │  • toSql()  ─► Grammar    │    │  • sql()       │
              └────────────┬──────────────┘    └────────┬───────┘
                           │                            │
                           ▼                            ▼
                    ┌─────────────────────────────────────┐
                    │  Client\CartoClient                  │
                    │  • run($sql, $cacheTtl)              │
                    │  • GET <2KB / POST ≥2KB              │
                    │  • Cache wrapping (sha1 of SQL)      │
                    └────────────────┬─────────────────────┘
                                     │
                                     ▼
                       https://phl.carto.com/api/v2/sql
```

**Key files:**
- [`src/PhilaOpaServiceProvider.php`](src/PhilaOpaServiceProvider.php) — config merge and singleton bindings
- [`src/OpaManager.php`](src/OpaManager.php) — facade root; entry point for `query()` / `sql()`
- [`src/Query/Builder.php`](src/Query/Builder.php) — fluent query API
- [`src/Query/Grammar.php`](src/Query/Grammar.php) — SQL string compilation, identifier wrapping, value escaping
- [`src/Client/CartoClient.php`](src/Client/CartoClient.php) — HTTP + cache integration
- [`src/Models/OpaProperty.php`](src/Models/OpaProperty.php) — read-only model w/ typed accessors
- [`src/Support/Fields.php`](src/Support/Fields.php) — single source of truth for the schema

All bindings are singletons, so `app(OpaManager::class)`, `Opa::client()`, and the facade share a single Guzzle pool, single grammar, single client.

---

## Testing

The package ships with a Testbench-based suite. To run it locally:

```bash
composer install
vendor/bin/phpunit
```

23 tests / 42 assertions cover:

- Grammar literal escaping, operator allowlist, identifier wrapping
- Builder SQL output for representative chains (basic, `IN`, `BETWEEN`, nested `OR`, etc.)
- Builder validation errors (unknown column, bad operator, bad direction)
- Model casting (numeric, date, null, unknown attribute)
- HTTP behavior (GET vs POST switch, error → `CartoApiException`)
- End-to-end builder + hydration (with `Http::fake()`)
- Caching (per-query, global, distinct keys, no-cache default)

### Faking Carto in your own tests

```php
use Illuminate\Support\Facades\Http;
use JerseyMike\PhilaOpa\Models\OpaProperty;

Http::fake([
    'phl.carto.com/*' => Http::response([
        'rows' => [
            ['parcel_number' => '1', 'market_value' => '100'],
        ],
    ], 200),
]);

$results = OpaProperty::query()->where('parcel_number', '1')->get();
$this->assertSame(100.0, $results->first()->market_value);
```

---

## Recipes

### Properties on a single block

```php
OpaProperty::query()
    ->where('street_name', 'CHESTNUT')
    ->where('street_designation', 'ST')
    ->whereBetween('house_number', '1500', '1599')
    ->orderBy('house_number')
    ->get();
```

### Recently sold high-value properties

```php
OpaProperty::query()
    ->where('sale_date', '>=', '2024-01-01')
    ->where('sale_price', '>', 1_000_000)
    ->orderByDesc('sale_date')
    ->limit(50)
    ->cache(1800)
    ->get();
```

### Properties owned by a person or LLC

```php
OpaProperty::query()
    ->whereILike('owner_1', 'SMITH%')
    ->orderByDesc('market_value')
    ->get();
```

### Aggregating with raw SQL

```php
$rows = Opa::sql("
    SELECT category_code_description AS category, COUNT(*) AS n, AVG(market_value) AS avg_value
    FROM opa_properties_public
    WHERE zip_code = '19103'
    GROUP BY category_code_description
    ORDER BY n DESC
", cacheTtl: 3600);
```

### Pagination

```php
$page = 1;
$perPage = 100;

OpaProperty::query()
    ->where('zip_code', '19103')
    ->orderBy('parcel_number')
    ->limit($perPage)
    ->offset(($page - 1) * $perPage)
    ->get();
```

### Streaming a large export (manual pagination)

```php
$offset = 0;
$batch = 1000;
do {
    $rows = OpaProperty::query()
        ->orderBy('parcel_number')
        ->limit($batch)
        ->offset($offset)
        ->get();

    foreach ($rows as $p) {
        // write to file, ship to a queue, etc.
    }

    $offset += $batch;
} while ($rows->count() === $batch);
```

---

## Limitations and gotchas

- **Read-only.** OPA's Carto endpoint is a public read replica; there is no write API. The package does not implement `insert`/`update`/`delete`.
- **No joins in the builder.** The builder targets a single table. For joins to other Carto tables (e.g. `real_estate_transfers`), use `Opa::sql()`.
- **No PostGIS helpers.** Geospatial filters (`ST_Within`, `ST_DWithin`, etc.) must be written via `Opa::sql()`. The `the_geom` and `the_geom_webmercator` columns are recognized by the schema but exposed as raw values on the model.
- **URL length.** Carto's GET endpoint accepts long query strings, but proxies and CDNs may truncate. The client automatically switches to POST for SQL longer than 2,000 characters.
- **Rate limiting.** Carto is a free public service. Cache aggressively in production and avoid bursty unbounded queries.
- **Stale data.** When caching is enabled, the model returns whatever is in the cache — even if Carto has been updated. Tune `cache.ttl` accordingly or skip caching for freshness-critical paths.
- **Schema drift.** If Philadelphia adds a new column and you reference it before `Fields::SCHEMA` is updated, you'll get `InvalidQueryException`. Use `Opa::sql()` until the schema constant is updated.
- **Unicode in identifiers.** Bare safe identifiers (`/^[A-Za-z_][A-Za-z0-9_]*$/`) are emitted unquoted; everything else is double-quoted with embedded quotes doubled. This is Postgres-correct but worth knowing if you ever extend the grammar.

---

## Contributing

1. Fork and clone.
2. `composer install`
3. Add tests for any change to `Builder`, `Grammar`, `CartoClient`, or `OpaProperty`.
4. `vendor/bin/phpunit` — must stay green.
5. Schema additions: edit `src/Support/Fields.php`, link the metadata page entry in your PR description.

---

## License

MIT — see [LICENSE](LICENSE).
