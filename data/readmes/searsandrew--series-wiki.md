# SeriesWiki (Laravel package)

SeriesWiki is a **series-agnostic, spoiler-safe wiki backend toolkit** for Laravel. It provides a block-based content model with:

- **Spoiler gating** (work/chapter gates) with safe/full block bodies
- **Timeline filtering** (year/era slices) at the block level
- **Variants** (faction/perspective switching) driven by data tables (no hardcoding)
- **Templates** that seed entries with required blocks by entry type (e.g. planet/species/ship)
- **Internal link suggestions** via a crawler + review/apply workflow
- **Search API** backed by crawler snapshots (`safe` and `full` modes)
- **Validation** for entry meta + block payloads (extensible via config)

> This package does **not** include a UI/editor. Your application provides the admin/editor experience.

---

## Install

```bash
composer require searsandrew/series-wiki
```
Publish config + migrations:

```php
php artisan vendor:publish --tag=series-wiki-config
php artisan vendor:publish --tag=series-wiki-migrations
php artisan migrate
```
---

## Core Concepts
* **Series:** A wiki universe / series namespace (e.g. “Stellar Empire”)
* **Entry:** A page/subject (ship/species/planet/event/etc.)
* **Block:** The unit of content for an entry (text/image/chart/map/etc.)
* **Gate:** A spoiler threshold (work + chapter position)
* **TimeSlice:** A year/era/range for timeline filtering
* **Variant:** An alternate view of an entry (often faction-based)
* **Template:** Seeds an entry with a standard set of blocks (by entry type)

---

## Rendering (Spoilers + Timeline + Variants)
Render blocks for an entry using a viewer context:
```php
use Searsandrew\SeriesWiki\Services\EntryRenderer;
use Searsandrew\SeriesWiki\Services\Timeline\YearRange;

$renderer = app(EntryRenderer::class);

$blocks = $renderer->renderWithContext(
    $entry,
    auth()->user(),                // or null for guest
    new YearRange(4250, 4250),      // or null for no time filtering
    'republic'                      // variant_key (optional)
);
```
Each item includes:
* display.text (for text blocks)
* display.payload (for non-text blocks)
* is_locked / locked_mode

---

## Templates: create entry scaffolds by type
Create a template with `entry_type = 'planet'`, then use your app to create entries of type `planet`.
The package will resolve the default template by type and seed the required blocks.

---

## Search API (Safe vs Full)
Search uses crawler snapshots. Query in safe mode for spoiler-safe results (recommended for public):

```php
use Searsandrew\SeriesWiki\Services\Search\SearchService;

$results = app(SearchService::class)->search($series, 'Type 88', [
    'mode' => 'safe',   // 'safe' or 'full'
    'type' => 'ship',   // optional entry type filter
    'limit' => 20,
]);
```
Each result includes: entry, score, snippet, mode

---

## Crawler: Link Suggestions + Snapshots
Generate snapshots and link suggestions:
```bash
  php artisan series-wiki:crawl --series=stellar-empire
```
The crawler creates:
* entry snapshots in `sw_entry_snapshots` (both `safe` and `full` modes)
* suggestions in `sw_link_suggestions` (`new|accepted|dismissed`)

---

## Applying suggestions
Your app can review suggestions and apply them to blocks using:
* `Searsandrew\SeriesWiki\Services\Crawler\LinkSuggestionWorkflow`

It supports accept/dismiss and applying a suggestion to markdown content.

### URL generation
Markdown URL generation is configurable:
```php
    // config/series-wiki.php
    'links' => [
      'url_generator' => function ($entry) {
          return '/wiki/' . $entry->slug;
      },
    ],
```

---

### Validation
Validation is extensible via config:
* `entries.types.{type}.rules/defaults/fields`
* `blocks.types.{type}.rules/defaults/fields`

Use:
* `Searsandrew\SeriesWiki\Services\Entries\EntryValidator`
* `Searsandrew\SeriesWiki\Services\Blocks\BlockValidator`

---

## Tests
```bash
    ./vendor/bin/pest
```

## License
MIT