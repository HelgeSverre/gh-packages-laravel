# DB Cleaner

A Laravel package that scans your database tables for data quality issues and helps you fix them.

## The Problem

Real-world databases accumulate noise over time:

- `"john doe"`, `"John Doe"`, `"JOHN DOE"` — same person, three records
- `" Engineering "`, `"engineering"` — same department, inconsistent casing
- `"Managment"`, `"Management"` — typo that slipped past validation
- `" alice@example.com"` — leading space breaking lookups

These issues corrupt reports, break deduplication logic, and make search unreliable. DB Cleaner detects and fixes them without guesswork.

## What It Does

| Issue | How Detected |
|-------|-------------|
| Exact duplicates | `GROUP BY col HAVING COUNT(*) > 1` |
| Fuzzy duplicates | Levenshtein distance (configurable threshold) |
| Soundex matches | `soundex()` grouping |
| Leading/trailing whitespace | `col != TRIM(col)` |
| Double spaces / tabs | SQL `LIKE` patterns |
| Casing inconsistencies | `GROUP BY LOWER(col) HAVING COUNT(DISTINCT col) > 1` |
| Typos | `similar_text()` against high-frequency values |

Each column gets a **quality score (0–100)** and a **letter grade (A–F)**. Scores are stored so you can track improvement over time.

## Installation

```bash
composer require laravelldone/db-cleaner
php artisan vendor:publish --provider="Laravelldone\DbCleaner\DbCleanerServiceProvider"
php artisan migrate
```

## Quick Start

```bash
# Scan all tables and see what's wrong
php artisan db-cleaner:scan

# Preview what cleaning would do — no data is touched
php artisan db-cleaner:clean users --column=name --type=whitespace --dry-run

# Apply the fix
php artisan db-cleaner:clean users --column=name --type=whitespace
```

## Configuration

`config/db-cleaner.php` — the key options:

```php
// Limit to specific tables and columns (empty = scan everything)
'tables' => [
    'users'    => ['name', 'email'],
    'products',
],

// Tables never scanned
'exclude_tables' => ['migrations', 'jobs', 'sessions'],

// Fuzzy duplicate sensitivity (lower = stricter)
'duplicates' => ['fuzzy_threshold' => 2],

// Typo detection similarity (0–100, higher = stricter)
'typos' => ['similarity_threshold' => 85],
```

## CLI

```bash
# Scan one table, specific columns
php artisan db-cleaner:scan --table=users --columns=name,email

# View scan history
php artisan db-cleaner:report --table=users --format=json

# Clean types: whitespace | casing | duplicate
php artisan db-cleaner:clean users --column=name --type=casing --dry-run
php artisan db-cleaner:clean users --column=name --type=casing --force
```

## PHP / Facade

```php
use Laravelldone\DbCleaner\Facades\DbCleaner;

$analysis = DbCleaner::scan('users');

$analysis->qualityScore;      // 73.4
$analysis->grade;             // C
$analysis->totalIssueCount(); // 28

// Preview before touching anything
$actions = DbCleaner::previewClean('users', 'name', 'whitespace');

// Apply (confirm required — no accidental changes)
DbCleaner::clean('users', 'name', 'whitespace', confirm: true);
```

## REST API

```
GET  /api/db-cleaner/status              — overall DB health
GET  /api/db-cleaner/tables              — all tables with scores
GET  /api/db-cleaner/tables/{table}      — detailed column breakdown
POST /api/db-cleaner/tables/{table}/scan — trigger a scan
GET  /api/db-cleaner/history             — score trends over time
POST /api/db-cleaner/clean/preview       — preview cleaning actions
POST /api/db-cleaner/clean/apply         — apply (requires "confirm": true)
```

Protect the API with a token in `.env`:
```
DB_CLEANER_API_TOKEN=your-secret
```

## Dashboard

Visit `/db-cleaner` for a Livewire dashboard with:
- Quality scores and grades per table
- Issue breakdown chart (Chart.js, no npm required)
- Score trend over time
- Run scans and apply cleaning from the browser

## Safety

- **No data is ever modified without explicit confirmation** — `--dry-run` in CLI, `"confirm": true` in the API, `confirm: true` in PHP
- All cleaning runs inside a `DB::transaction()`
- Fuzzy analysis is skipped on tables over 5,000 rows by default (`max_rows_for_fuzzy`) to prevent memory issues

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- Livewire 3 or 4

## License

MIT
