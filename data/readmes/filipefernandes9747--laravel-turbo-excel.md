# Laravel Turbo Excel

[![Tests](https://github.com/filipefernandes/laravel-turbo-excel/actions/workflows/tests.yml/badge.svg)](https://github.com/filipefernandes/laravel-turbo-excel/actions)
[![PHP](https://img.shields.io/badge/PHP-8.4%2B-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12.0-red)](https://laravel.com)

Memory-efficient Excel and CSV **exports and imports** for Laravel, powered by [openspout/openspout](https://github.com/openspout/openspout).

Export and import classes implement lightweight **Concern interfaces** — the same pattern as Laravel Excel — giving you full control with zero magic.

---

## Installation

```bash
composer require filipefernandes/laravel-turbo-excel
```

---

## Performance Benchmark

When measured against `maatwebsite/excel` (powered by PhpSpreadsheet), TurboExcel consistently demonstrates massive reductions in memory overhead while streaming exports directly to the disk. Below are the results of a standard benchmark comparing both packages running the exact same export structures.

### Data Source: Database Query (`FromQuery`)
_(Both utilizing `WithChunkSize`, memory limit disabled)_

| Dataset Size | Rows | Package | Time (seconds) | Peak Memory | OOM Risk? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small** | 1,000 | `turbo-excel` | **~ 0.5s** | **~ 1 MB** | 🟢 None |
| | | `maatwebsite` | ~ 2.5s| ~ 28 MB | 🟢 None |
| **Medium** | 10,000 | `turbo-excel` | **~ 4.0s** | **~ 1 MB** | 🟢 None |
| | | `maatwebsite` | ~ 25.0s | ~ 60 MB | 🟡 Moderate |
| **Large** | 100,000 | `turbo-excel` | **~ 45.0s** | **~ 1 MB** | 🟢 None |
| | | `maatwebsite` | > 150.0s | > 300 MB | 🔴 High |
| **Enormous**| 500,000 | `turbo-excel` | **~ 220.0s** | **~ 1 MB** | 🟢 None |
| | | `maatwebsite` | *Crashes* | *Exhausted* | 🛑 Guaranteed |

*Note: TurboExcel keeps an entirely flat memory profile because OpenSpout immediately writes XML nodes sequentially to disk without buffering sheet contents in memory.*

---

## Core Concept

Create a plain PHP class and implement the concerns you need:

```php
// app/Exports/UsersExport.php

use TurboExcel\Concerns\FromQuery;
use TurboExcel\Concerns\WithHeadings;
use TurboExcel\Concerns\WithMapping;
use TurboExcel\Concerns\WithTitle;
use TurboExcel\Concerns\WithChunkSize;

class UsersExport implements FromQuery, WithTitle, WithHeadings, WithMapping, WithChunkSize
{
    public function query(): Builder
    {
        return User::query()->where('active', true);
    }

    public function title(): string   { return 'Active Users'; }

    public function headings(): array { return ['Name', 'Email', 'Joined']; }

    public function map($row): array
    {
        return [$row->name, $row->email, $row->created_at->format('Y-m-d')];
    }

    public function chunkSize(): int { return 500; }
}
```

Then call it from a controller:

```php
use TurboExcel\Facades\TurboExcel;

// Stream directly to browser (Fastest, zero-IO)
return TurboExcel::stream(new UsersExport(), 'users.xlsx');

// Stream to browser via local temporary file
return TurboExcel::download(new UsersExport(), 'users.xlsx');

// Write to a Storage disk
TurboExcel::store(new UsersExport(), 'exports/users.xlsx', disk: 's3');

// Write to the filesystem
TurboExcel::export(new UsersExport(), storage_path('exports/users.xlsx'));
```

### Or using the `Exportable` trait

Add the `Exportable` trait to your export class to trigger exports fluently:

```php
use TurboExcel\Concerns\Exportable;

class UsersExport implements FromQuery
{
    use Exportable;
    // ...
}

// Then in your controller:
return (new UsersExport())->download('users.xlsx');
```

---

## Data Source Concerns

Implement **one** of the following to tell Turbo-Excel where your data comes from.

| `FromQuery`      | `query(): Builder`         | Large datasets — streamed via `lazy()`, flat memory |
| `FromCollection` | `collection(): Collection` | Small, pre-loaded Illuminate Collections            |
| `FromArray`      | `array(): array`           | Plain PHP arrays                                    |
| `FromGenerator`  | `generator(): \Generator`  | Custom lazy sources, external API pages             |

### `WithLimit`
Cap the number of rows exported (useful for "Top 10" reports or sample files):
```php
class TopUsersExport implements FromQuery, WithLimit
{
    public function limit(): int { return 100; }
}
```


---

## Formatting Concerns

### `WithHeadings`

Explicit column headers written as the first row:

```php
class UsersExport implements FromArray, WithHeadings
{
    public function headings(): array { return ['Full Name', 'Email']; }
    // ...
}
```

> If `WithHeadings` is **not** implemented, headings are auto-derived from the first row's array keys.

### `WithMapping`

Transform each row before it is written. Combine with `WithHeadings` for labelled columns:

```php
class UsersExport implements FromQuery, WithHeadings, WithMapping
{
    public function headings(): array { return ['Name', 'Email', 'Joined']; }

    public function map($user): array
    {
        return [$user->name, $user->email, $user->created_at->toDateString()];
    }
}
```

### `WithTitle`

Set the sheet tab name (XLSX only):

```php
class UsersExport implements FromArray, WithTitle
{
    public function title(): string { return 'Users'; }
}
```

### `WithChunkSize`

Override the default chunk size when using `FromQuery`:

```php
class BigExport implements FromQuery, WithChunkSize
{
    public function chunkSize(): int { return 2000; }
}
```

### `WithColumnFormatting` (XLSX only)

Set native Excel number formats (Currency, Dates, etc.) without losing precision:

```php
use TurboExcel\Concerns\WithColumnFormatting;

class FinancialExport implements FromArray, WithColumnFormatting
{
    public function array(): array { ... }

    public function columnFormats(): array
    {
        return [
            'B' => '#,##0.00 €', // Using column letter
            2   => 'dd/mm/yyyy', // Using 0-based index
        ];
    }
}
```

### `WithStyles` (XLSX only)

Apply rich visual styles (fonts, colors, borders) while streaming row-by-row (zero memory overhead):

```php
use TurboExcel\Concerns\WithStyles;
use OpenSpout\Common\Entity\Style\Style;

class StyledExport implements FromArray, WithStyles
{
    public function array(): array { ... }

    public function styles(): array
    {
        return [
            // Style the special first header row
            'header' => (new Style())->setFontBold()->setBackgroundColor('FFE6E6E6'),
            
            // Style an entire column
            'A' => (new Style())->setFontItalic(),
        ];
    }
}
```

### `WithColumnWidths` (XLSX only) 📏

Set manual column widths to ensure data readability:

```php
use TurboExcel\Concerns\WithColumnWidths;

class WideExport implements FromArray, WithColumnWidths
{
    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 45, // Perfect for email addresses
        ];
    }
}
```

### `WithProperties` (XLSX only) 📄

Set professional document metadata:

```php
use TurboExcel\Concerns\WithProperties;

class ProfessionalExport implements FromArray, WithProperties
{
    public function properties(): array
    {
        return [
            'title'   => 'Financial Report',
            'creator' => 'Acme Corp ERP',
            'subject' => 'Quarterly Analysis',
        ];
    }
}
```


### `WithCsvOptions` (CSV only)

Customize delimiter, enclosure, and Unicode BOM settings for CSV files:

```php
use TurboExcel\Concerns\WithCsvOptions;

class CustomCsvExport implements FromQuery, WithCsvOptions
{
    public function query() { ... }

    public function delimiter(): string { return ';'; }
    public function enclosure(): string { return "'"; }
    public function addBom(): bool      { return true; } // Better UTF-8 support in Excel
}
```

### `WithStrictNullComparison` 🎯

Ensures `null` values are explicitly handled without loose type conversion to empty strings.

---

## Utility Concerns

### `WithTranslation` 🌍

Automatically localize your headings (Export) or header keys (Import) via Laravel's `trans()` helper:

```php
class LocalizedExport implements WithHeadings, WithTranslation
{
    public function headings(): array { return ['users.id', 'users.name']; }
}
```

### `WithErrorHandling` 🚦

Unified error handling for both sides of the pipeline:

```php
class RobustProcess implements WithErrorHandling
{
    public function handleError(\Throwable $e): void
    {
        \Log::error($e->getMessage());
    }
}
```

### `WithAnonymization` 🛡️

Declaratively mask sensitive data (PII/GDPR) across your **exports and imports** without cluttering your mapping logic. It uses a high-performance in-place replacement loop.

```php
use TurboExcel\Concerns\WithAnonymization;

class UsersProcess implements WithAnonymization
{
    // Optional: Determine if anonymization should run
    public function isAnonymizationEnabled(): bool
    {
        return app()->environment('production');
    }

    public function anonymizeColumns(): array
    {
        return ['email', 'phone_number', 'address'];
    }

    public function anonymizeReplacement(): string
    {
        return '[HIDDEN]';
    }
}
```

---


## Multi-Sheet Exports (XLSX only)

Implement `WithMultipleSheets` and return an array of sheet export objects. Each sheet object may implement any concern independently.

```php
TurboExcel::download(new ReportExport(), 'monthly-report.xlsx');
```

### `WithQuerySplitBySheet` ⚡

Optimized for large datasets sitting in a single flat table. It uses **one single ordered query** and automatically splits it into multiple sheets. You can return different sheet handler objects for different segments of the query.

> [!IMPORTANT]
> Your query **must be ordered** by the column you are splitting by.

```php
use TurboExcel\Concerns\WithQuerySplitBySheet;
use TurboExcel\Concerns\WithHeadings;
use TurboExcel\Concerns\WithMapping;
use TurboExcel\Concerns\WithTitle;

class FastMultiSheetExport implements WithQuerySplitBySheet
{
    public function query()
    {
        // 1. Query must be ordered
        return DB::table('reports')->orderBy('category');
    }

    public function splitByColumn(): string
    {
        // 2. The column triggers a new sheet whenever its value changes
        return 'category';
    }

    public function sheet(mixed $row): object
    {
        // 3. Return a handler for this sheet. 
        // It can implement any concern (Headings, Mapping, Styles, etc.)
        return match($row->category) {
            'VIP'      => new VipSheetHandler(),
            'Standard' => new StandardSheetHandler(),
            default    => new DefaultSheetHandler(),
        };
    }
}

class VipSheetHandler implements WithTitle, WithHeadings, WithMapping
{
    public function title(): string   { return '⭐ VIP Report'; }
    public function headings(): array { return ['VIP Name', 'Priority']; }
    public function map($row): array  { return [$row->name, $row->level]; }
}
```

---

## Output Methods

| Method                                              | Description                   |
| --------------------------------------------------- | ----------------------------- |
| `TurboExcel::stream($export, 'file.xlsx')`           | Stream directly to browser (Fastest, zero-IO) |
| `TurboExcel::download($export, 'file.xlsx')`         | Stream to browser via local temporary file    |
| `TurboExcel::store($export, 'path/file.xlsx', 's3')` | Write to a Storage disk       |
| `TurboExcel::export($export, '/abs/path/file.xlsx')` | Write to filesystem path      |
| `TurboExcel::queue($export, 'path/file.xlsx', 's3')` | Dispatch to a Laravel Queue   |

**Import**

| Method | Description |
| ------ | ----------- |
| `TurboExcel::import($import, '/abs/path.csv', ?Format)` | Stream import from a filesystem path — returns `TurboExcel\Import\Result` when synchronous, or `Illuminate\Bus\Batch` when the import uses `TurboExcel\Import\Concerns\ShouldQueue` (see [Imports](#imports-csv--xlsx)) |

The export format is auto-detected from the filename extension (`.xlsx` → XLSX, `.csv` → CSV).
Pass an explicit `Format` case to override:

```php
use TurboExcel\Enums\Format;

TurboExcel::download(new UsersExport(), 'users.xlsx', Format::CSV);
```

---

## Imports (CSV & XLSX)

Imports are **streamed** row-by-row for predictable memory use. Internally, CSV is read with PHP’s `fgetcsv`; XLSX is read with OpenSpout on the **first worksheet only**. Readers always yield **0-indexed cell arrays** (`0 => 'Alice', 1 => 'alice@example.com'`). Associative rows and header logic run in the import **pipeline** only when you opt in via concerns — nothing assumes a header row unless you implement `WithHeaderRow`.

### Basic usage

```php
use TurboExcel\Facades\TurboExcel;
use TurboExcel\Import\Concerns\ToModel;
use TurboExcel\Import\Concerns\WithHeaderRow;
use TurboExcel\Import\Concerns\WithMapping;
use TurboExcel\Import\Concerns\WithNormalizedHeaders;
use TurboExcel\Import\Concerns\WithValidation;

class UsersImport implements ToModel, WithHeaderRow, WithNormalizedHeaders, WithMapping, WithValidation
{
    public function headerRow(): int
    {
        return 1;
    }

    public function headerNormalization(): array|callable
    {
        return fn (string $header): string => strtolower(trim($header));
    }

    public function map(array $row): array
    {
        return [
            'name'  => trim($row['name']),
            'email' => strtolower($row['email']),
        ];
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
        ];
    }

    public function model(array $row): ?User
    {
        return new User($row);
    }
}

$result = TurboExcel::import(new UsersImport(), storage_path('imports/users.csv'));
```

You can also return a **fixed map** from trimmed spreadsheet headers to attribute keys (any header not listed keeps the trimmed text as the key):

```php
public function headerNormalization(): array
{
    return [
        'FULL NAME'     => 'name',
        'Email Address' => 'email',
    ];
}
```

When the import runs **synchronously**, `$result` is a `TurboExcel\Import\Result`:

| Property    | Meaning |
| ----------- | ------- |
| `processed` | Rows that completed the pipeline (validation + persist / collection append, if applicable) |
| `failed`    | Rows that failed but were handled via `SkipsOnFailure` |
| `rows`      | `Illuminate\Support\Collection` of associative arrays (after **map** + **validate**) when the import (or any sheet import in a multi-sheet run) uses `ToCollection`. Multi-sheet sync imports **concatenate** sheets in workbook order; otherwise `null` |

The file format is inferred from the extension (`.csv` / `.xlsx`). Pass an explicit `TurboExcel\Enums\Format` as the third argument to override.

### Import concerns (`TurboExcel\Import\Concerns`)

| Concern                 | Role |
| ----------------------- | ---- |
| `ToModel`               | `model(array $row): ?Model` — return `null` to skip persisting that row |
| `ToCollection`        | Marker: each successful row is pushed onto `$result->rows`. **Not compatible with `ShouldQueue`.** |
| `ToArray`               | Marker: similar to `ToCollection` but returns a plain PHP array. |
| `OnEachRow`             | `onRow(array $row): void` — process each row instantly via callback |
| `OnEachChunk`           | `onChunk(Collection $chunk): void` — process parsed rows in raw chunks |
| `WithMapping`           | `map(array $row): array` — transform the row before validation / persistence |
| `WithValidation`        | `rules(): array` — Laravel validator rules |
| `SkipsOnValidation`     | `onValidationFailed(ValidationException $e)` — Gracefully handle bad data |
| `WithHeaderRow`         | `headerRow(): int` — 1-based row index of the header |
| `WithNormalizedHeaders` | `headerNormalization()` — transform header text into array keys |
| `WithRowFilter`         | `filterRow(array $row): bool` — Skip rows before mapping/validation |
| `WithChunkReading`      | `chunkSize(): int` — configure scan chunks for queues |
| `ShouldQueue`           | Marker: run the import via the queue |
| `SkipsOnFailure`        | `onFailure(array $row, \Throwable $e): void` — record failures and continue |
| `WithBatchSize`         | `batchSize(): int` — Enhanced alias for `WithBatchInserts` |
| `WithInsertStrategy`    | `insertStrategy(): InsertStrategy` — Choose `INSERT`, `UPDATE`, or `UPSERT` |
| `WithMetrics`           | Marker: logs memory and timing to your Laravel log |
| `Importable`            | Trait: adds fluent methods like `import()` and `queue()` |
| `RemembersFullRow`      | `setFullRow(array $row)` — access raw, unmapped input data |
| `RemembersRowNumber`    | tracks the physical row index |
| `WithMultipleSheets`   | **XLSX only.** Process multiple worksheets in one workbook |


Pipeline order per row: optional header → associative combine → **map** → **validate** → **model** / batch insert, and **append to `$result->rows`** when `ToCollection` is implemented.

### Multi-sheet XLSX imports

```php
use TurboExcel\Import\Concerns\WithMultipleSheets;

class WorkbookImport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new UsersSheetImport(),   // first worksheet
            new OrdersSheetImport(),  // second worksheet
        ];
    }
}

$result = TurboExcel::import(new WorkbookImport(), storage_path('workbook.xlsx'));
// $result->processed / $result->failed are totals across all sheets
// $result->rows concatenates rows from each sheet import that uses ToCollection
```

Queued multi-sheet imports dispatch one or more chunk jobs **per sheet** (each job carries a `sheetIndex` on `XlsxReadSegment`). `WithChunkReading` / `chunkSize()` are read from **each sheet’s** import object when present.

### CSV options & BOM

- Implement `TurboExcel\Concerns\WithCsvOptions` on the import class to set **delimiter** and **enclosure** (same concern as exports).
- A **UTF-8 BOM** (`EF BB BF`) is consumed only when the reader opens the file at **byte offset 0**, so the first column is not corrupted. Chunk jobs that start later in the file do not strip the BOM again.

### Queued & chunked imports

If your import implements `TurboExcel\Import\Concerns\ShouldQueue`:

- **`ToCollection` is not supported** with queued imports (there is no single merged `Collection` across workers). Remove `ShouldQueue` or use `ToModel` / a synchronous import.
- With **`WithChunkReading`**, TurboExcel performs one **scan** of the file, then dispatches `TurboExcel\Import\Jobs\ProcessChunkJob` instances inside a **`Illuminate\Bus\Batch`**. **CSV** chunks use **byte ranges** in the raw file; **XLSX** chunks use **inclusive row index ranges** per worksheet (`XlsxReadSegment` includes a 0-based `sheetIndex`).
- Without `WithChunkReading`, a **single** queued job processes the whole file (or **one job per sheet** when using import `WithMultipleSheets`).

The `import()` method returns an `Illuminate\Bus\Batch` when jobs are dispatched. Each job increments cache counters under:

- `turbo_excel_import:{uuid}:processed`
- `turbo_excel_import:{uuid}:failed`

(The UUID is shared by all jobs in that batch.) If the file has **no data rows** (for example header-only CSV), you get a `Result` with zero counts and **no** batch is dispatched.


---

## Format Enum

```php
use TurboExcel\Enums\Format;

Format::XLSX  // application/vnd.openxmlformats-...
Format::CSV   // text/csv
```

---

## Queued Background Exports

When exporting massive amounts of data, you can dispatch the export to a Laravel Queue entirely in the background. Because `TurboExcel` uses `OpenSpout`, memory is kept incredibly flat, handling millions of rows efficiently within a single job.

```php
TurboExcel::queue(new UsersExport(), 'reports/huge-report.xlsx', 's3')
    ->onConnection('redis')
    ->onQueue('exports');
```

**Using with Laravel Batches (Progress Tracking)**

You can also dispatch the export job directly inside a Laravel Batch to track completion percentages! `TurboExcel` automatically breaks your data into chunks and updates the batch progress internally as it writes to the file.

```php
use Illuminate\Support\Facades\Bus;
use TurboExcel\Jobs\ExportJob;

$batch = Bus::batch([
    new ExportJob(new UsersExport(), 'reports/users.xlsx', disk: 's3')
])->name('Daily Users Export')->dispatch();

// Later check progress in your UI
echo $batch->progress(); // e.g. 50%
```

---

## Debugging / Profiling

When dealing with extremely large datasets (millions of rows) in local development, it can be useful to see exactly how much memory the OpenSpout stream is consuming and how fast the database is chunking rows.

Implement the `TurboExcel\Concerns\WithDebug` interface on your export class to automatically emit detailed debugging logs to your default Laravel Log (`storage/logs/laravel.log`).

---

## Testing

```bash
composer test
```

---

## License

MIT
