# Laravel GSC Manager

Reusable Laravel package for discovering, storing, approving, and syncing Google Search Console data with Google Service Account JSON files.

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12
- `google/apiclient` `^2.0`
- One or more Google service accounts added to Search Console property permissions

This package does not use API keys. Authentication is always done with service account JSON credentials.

## Installation

```bash
composer require wonchoe/laravel-gsc-manager
php artisan vendor:publish --tag=gsc-config
php artisan migrate
```

For local path development:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "packages/wonchoe/laravel-gsc-manager"
    }
  ]
}
```

## Service Account JSON Files

Put one or more JSON files in:

```text
storage/app/private/gsc-keys/gsc-group-001.json
storage/app/private/gsc-keys/gsc-group-002.json
```

The file names can be anything. Each JSON file is treated as one service account and one group of accessible Search Console sites.

Add each service account `client_email` to the relevant Google Search Console property permissions. The package reads `client_email` and `project_id`, but never returns or logs `private_key`.

## Discovery

```bash
php artisan gsc:discover
php artisan gsc:discover --credential=gsc-group-001.json
```

Discovery scans `storage/app/private/gsc-keys`, upserts credentials, calls Search Console `sites.list`, and stores discovered properties. Broken JSON files are logged and skipped without stopping the batch.

## Approving Sites

By default, discovered sites are inactive until approved:

```http
POST /api/gsc/sites/{site}/approve
POST /api/gsc/sites/{site}/disable
```

You can also approve through your own admin UI or directly in the database by setting `status=approved` and `active=true`.

## Sync Search Analytics

```bash
php artisan gsc:sync-analytics --days=3
php artisan gsc:sync-analytics --type=web --type=image --days=30
php artisan gsc:sync-analytics --site=sc-domain:example.com --from=2026-04-01 --to=2026-04-20
```

Supported search types:

- `web`
- `image`
- `video`
- `news`
- `discover`
- `googleNews`

Supported dimensions:

- `date`
- `hour`
- `query`
- `page`
- `country`
- `device`
- `searchAppearance`

Search Analytics uses `startRow` pagination when enabled and stores `clicks`, `impressions`, `ctr`, `position`, dynamic dimension values, a row hash, and the raw API row.

## Discover Search Appearances

```bash
php artisan gsc:discover-search-appearances --days=30
```

Search Appearance names are not hardcoded. The package discovers them by querying Search Analytics grouped by `searchAppearance`.

## Sync Sitemaps

```bash
php artisan gsc:sync-sitemaps
```

Sitemap sync stores sitemap path, submitted/downloaded timestamps, warnings, errors, sitemap index status, pending status, contents, submitted counts, and deprecated `indexed` counts if Google returns them.

Submitting and deleting sitemaps require full scope and are disabled by default:

```php
'sitemaps' => [
    'submit_enabled' => false,
    'delete_enabled' => false,
],
```

## URL Inspection

```bash
php artisan gsc:inspect-urls --site=sc-domain:example.com --url=https://example.com/page
```

The package calls:

```text
POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
```

Stored URL Inspection fields include verdict, coverage state, robots state, indexing state, page fetch state, Google/user canonicals, crawl time, crawled-as value, sitemap URLs, referring URLs, inspection result link, AMP/mobile/rich results raw payloads, and the full raw response.

## Scheduler Example

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('gsc:discover')->dailyAt('02:00');
Schedule::command('gsc:access-check')->dailyAt('02:30');
Schedule::command('gsc:discover-search-appearances --days=30')->dailyAt('03:00');
Schedule::command('gsc:sync-analytics --days=3')->dailyAt('03:30');
Schedule::command('gsc:sync-sitemaps')->dailyAt('04:30');
```

## API Routes

Default prefix: `/api/gsc`

You can change the route URL prefix and route name prefix in `config/gsc-manager.php`:

```php
'routes' => [
    'enabled' => true,
    'prefix' => 'api/gsc', // use 'gsc' if you prefer /gsc/sites
    'name_prefix' => 'gsc-manager.',
    'middleware' => ['api'],
],
```

```text
GET    /credentials
GET    /credentials/{credential}
POST   /discover
POST   /access-check

GET    /sites
GET    /sites/{site}
POST   /sites/{site}/approve
POST   /sites/{site}/disable
POST   /sites/{site}/sync-analytics
POST   /sites/{site}/sync-sitemaps
POST   /sites/{site}/discover-search-appearances

GET    /sites/{site}/analytics
GET    /sites/{site}/analytics/summary
GET    /sites/{site}/search-appearances
GET    /sites/{site}/sitemaps
POST   /sites/{site}/sitemaps/submit
DELETE /sites/{site}/sitemaps

POST   /sites/{site}/inspect-url
GET    /sites/{site}/inspections

GET    /dashboard
GET    /sync-logs
```

All responses use:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "errors": []
}
```

Credential API responses expose safe fields only: `id`, `file_name`, `client_email`, `project_id`, `active`, `last_discovered_at`, and `last_synced_at`.

## Supported GSC Data

- Sites/properties from `sites.list`
- Search Analytics clicks, impressions, CTR, and position
- Search types: `web`, `image`, `video`, `news`, `discover`, `googleNews`
- Dimensions: `date`, `hour`, `query`, `page`, `country`, `device`, `searchAppearance`
- Sitemaps: submitted/downloaded timestamps, warnings, errors, contents
- URL Inspection: index status, canonicals, crawl time, robots/indexing state, AMP/mobile/rich results raw payloads
- Indexing API: optional and disabled by default

## Indexing API Warning

Google officially limits the Indexing API to pages with `JobPosting` or `BroadcastEvent` embedded in `VideoObject`. This package never runs Indexing API automatically for normal pages. It is disabled by default and guarded by `indexing_api.allowed_content_only`.

## Security Notes

- Protect API routes with `auth:sanctum`, admin middleware, or your internal authorization layer.
- Keep `storage/app/private/gsc-keys` outside the public webroot.
- Never expose service account JSON files through web routes.
- The package redacts `private_key`, tokens, and secrets from formatted errors.
- One broken JSON or one failed site sync is logged and skipped without crashing the whole batch.

## Configuration

Publish the config:

```bash
php artisan vendor:publish --tag=gsc-config
```

Key options:

- `credentials_path`: where JSON files are scanned
- `auto_approve_discovered_sites`: whether new sites become active immediately
- `default_scope`: usually `readonly`
- `analytics.row_limit`: capped at 25000
- `analytics.paginate`: enables `startRow` pagination
- `url_inspection.daily_limit_per_site`
- `url_inspection.qpm_limit_per_site`
- `rate_limits.max_retries`
