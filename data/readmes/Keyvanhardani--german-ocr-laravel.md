# German-OCR Laravel Package

Official Laravel package for the [German-OCR API](https://german-ocr.de) -- OCR and document analysis optimized for German documents.

Offizielles Laravel-Paket fuer die [German-OCR API](https://german-ocr.de) -- OCR und Dokumentenanalyse, optimiert fuer deutsche Dokumente.

---

## Requirements / Voraussetzungen

- PHP 8.1+
- Laravel 10, 11, or 12
- A German-OCR API account ([german-ocr.de](https://german-ocr.de))

## Installation

```bash
composer require german-ocr/laravel
```

The package uses Laravel's auto-discovery, so the service provider and facade are registered automatically.

Das Paket nutzt Laravels Auto-Discovery -- Service Provider und Facade werden automatisch registriert.

### Publish Configuration / Konfiguration veroeffentlichen

```bash
php artisan vendor:publish --tag=german-ocr-config
```

### Environment Variables / Umgebungsvariablen

Add the following to your `.env` file:

```env
GERMAN_OCR_API_KEY=gocr_your-api-key
GERMAN_OCR_API_SECRET=your-api-secret
```

Optional settings:

```env
GERMAN_OCR_BASE_URL=https://api.german-ocr.de
GERMAN_OCR_API_VERSION=v1
GERMAN_OCR_DEFAULT_MODEL=german-ocr
GERMAN_OCR_OUTPUT_FORMAT=json
GERMAN_OCR_POLLING_TIMEOUT=120
GERMAN_OCR_POLLING_INTERVAL=2
GERMAN_OCR_HTTP_TIMEOUT=60
GERMAN_OCR_RETRY_TIMES=3
```

---

## Authentication / Authentifizierung

The API uses Bearer token authentication in the format `{api_key}:{api_secret}`. The API key starts with `gocr_`.

Die API nutzt Bearer-Token-Authentifizierung im Format `{api_key}:{api_secret}`. Der API-Schluessel beginnt mit `gocr_`.

---

## Available Models / Verfuegbare Modelle

### v1 Models

| Model | Description / Beschreibung |
|---|---|
| `german-ocr` | Turbo -- fastest processing / Schnellste Verarbeitung |
| `german-ocr-pro` | Pro -- balanced speed and accuracy / Ausgewogene Geschwindigkeit und Genauigkeit |
| `german-ocr-ultra` | Ultra -- high accuracy for complex documents / Hohe Genauigkeit fuer komplexe Dokumente |
| `privacy-shield` | Anonymization and data redaction / Anonymisierung und Datenschwaerzung |

### v2 Models

| Model | Description / Beschreibung |
|---|---|
| `german-ocr-max` | Maximum accuracy (EUR 0.10/page), automatically uses /v2/ endpoint / Maximale Genauigkeit, nutzt automatisch /v2/-Endpunkt |

When you use `german-ocr-max`, the package automatically routes the request to the `/v2/analyze` endpoint regardless of the configured `api_version`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/analyze` | Submit file for OCR (v1 models) |
| POST | `/v2/analyze` | Submit file for OCR (german-ocr-max) |
| GET | `/v1/jobs/{job_id}` | Get job status/result |
| GET | `/v2/jobs/{job_id}` | Get job status/result (v2) |
| DELETE | `/v1/jobs/{job_id}` | Cancel a job |
| GET | `/v1/balance` | Get account balance |
| GET | `/v1/usage` | Get usage statistics |

---

## Response Handling

The API can return two types of responses:

- **200 Direct Response**: The OCR result is returned immediately (for small/fast documents).
  ```json
  {"text": "...", "model_used": "german-ocr", "processing_time_ms": 1234}
  ```

- **202 Async Response**: A job is created and must be polled for completion.
  ```json
  {"job_id": "...", "status": "pending"}
  ```

The `analyze()` method handles both cases transparently -- it returns an `OcrResult` in either case.

---

## Usage / Verwendung

### Basic OCR / Einfache Texterkennung

```php
use GermanOcr\Laravel\Facades\GermanOcr;

// From a file path
$result = GermanOcr::analyze('/path/to/document.pdf', 'german-ocr-ultra');

echo $result->text;              // Full extracted text
echo $result->modelUsed;         // Model that processed the document
echo $result->processingTimeMs;  // Processing time in milliseconds
echo $result->pageCount;         // Number of pages (if available)
```

### With Prompt and Output Format

```php
$result = GermanOcr::analyze(
    '/path/to/invoice.pdf',
    'german-ocr-pro',
    prompt: 'Extract invoice number, date, and total amount',
    outputFormat: 'markdown',
);

echo $result->text;  // Markdown-formatted result
```

### Using the MAX Model (v2)

```php
// Automatically uses /v2/analyze endpoint
$result = GermanOcr::analyze('/path/to/complex-document.pdf', 'german-ocr-max');

echo $result->text;
echo $result->modelUsed;  // "german-ocr-max"
```

### From an Upload (Controller) / Aus einem Upload

```php
public function store(Request $request)
{
    $request->validate(['document' => 'required|file|mimes:pdf,png,jpg,jpeg,tiff']);

    $result = GermanOcr::analyze(
        $request->file('document'),
        'german-ocr-pro',
    );

    return response()->json([
        'text' => $result->text,
        'model_used' => $result->modelUsed,
        'processing_time_ms' => $result->processingTimeMs,
    ]);
}
```

### Invoice Extraction / Rechnungsextraktion

```php
$invoice = GermanOcr::extractInvoice($file);

echo $invoice->text;
echo $invoice->processingTimeMs;
```

### Privacy Shield / Datenschutz-Anonymisierung

```php
$anonymized = GermanOcr::anonymize($file);

echo $anonymized->text;  // Text with personal data redacted
```

### Account Balance and Usage / Kontostand und Nutzung

```php
// Get current balance
$balance = GermanOcr::balance();
// e.g. ['balance' => 42.50, 'currency' => 'EUR']

// Get usage statistics
$usage = GermanOcr::usage();
// e.g. ['total_pages' => 1500, 'total_cost' => 15.00, 'period' => '2026-03']
```

### Async Processing via Laravel Queue / Asynchrone Verarbeitung

```php
use GermanOcr\Laravel\Jobs\ProcessDocument;

// Dispatch to queue
ProcessDocument::dispatch('/path/to/document.pdf', 'german-ocr-max');

// With prompt and output format
ProcessDocument::dispatch(
    '/path/to/document.pdf',
    'german-ocr-ultra',
    'Extract all tables',
    'markdown',
);

// Listen for completion via event listeners
use GermanOcr\Laravel\Events\OcrCompleted;
use GermanOcr\Laravel\Events\OcrFailed;

Event::listen(OcrCompleted::class, function (OcrCompleted $event) {
    // $event->result   -- OcrResult DTO
    // $event->filePath -- Original file path
    // $event->model    -- Model used
    logger()->info('OCR completed', [
        'file' => $event->filePath,
        'text' => $event->result->text,
    ]);
});

Event::listen(OcrFailed::class, function (OcrFailed $event) {
    logger()->error('OCR failed', [
        'file' => $event->filePath,
        'error' => $event->errorMessage,
    ]);
});
```

### Non-Blocking Job Submission / Nicht-blockierende Job-Uebermittlung

```php
// Submit without waiting for the result
$job = GermanOcr::submitJob($file, 'german-ocr-ultra');

// If 200 direct response, $job is an OcrResult
// If 202 async response, $job is an OcrJob
if ($job instanceof \GermanOcr\Laravel\Models\OcrJob) {
    echo $job->jobId;  // "job-abc123"

    // Check later
    $result = GermanOcr::getJob($job->jobId);
    if ($result->isCompleted()) {
        echo $result->text;
    }

    // Or wait with custom timeout
    $result = GermanOcr::waitForResult($job->jobId, timeout: 60, interval: 3);
}

// Cancel a pending job
GermanOcr::cancelJob($job->jobId);
```

---

## Configuration Reference / Konfigurationsreferenz

The full configuration file (`config/german-ocr.php`):

| Key | Env Variable | Default | Description |
|---|---|---|---|
| `api_key` | `GERMAN_OCR_API_KEY` | `''` | Your API key (starts with gocr_) / Ihr API-Schluessel |
| `api_secret` | `GERMAN_OCR_API_SECRET` | `''` | Your API secret / Ihr API-Secret |
| `base_url` | `GERMAN_OCR_BASE_URL` | `https://api.german-ocr.de` | API base URL (without version) |
| `api_version` | `GERMAN_OCR_API_VERSION` | `v1` | Default API version (v1 or v2) |
| `default_model` | `GERMAN_OCR_DEFAULT_MODEL` | `german-ocr` | Default OCR model |
| `output_format` | `GERMAN_OCR_OUTPUT_FORMAT` | `json` | Default output format (json/markdown/text/n8n) |
| `polling.timeout` | `GERMAN_OCR_POLLING_TIMEOUT` | `120` | Max wait time in seconds |
| `polling.interval` | `GERMAN_OCR_POLLING_INTERVAL` | `2` | Poll interval in seconds |
| `http.timeout` | `GERMAN_OCR_HTTP_TIMEOUT` | `60` | HTTP request timeout |
| `http.connect_timeout` | `GERMAN_OCR_CONNECT_TIMEOUT` | `10` | Connection timeout |
| `http.retry.times` | `GERMAN_OCR_RETRY_TIMES` | `3` | Number of retry attempts |
| `http.retry.sleep` | `GERMAN_OCR_RETRY_SLEEP` | `500` | Delay between retries (ms) |
| `queue.connection` | `GERMAN_OCR_QUEUE_CONNECTION` | `null` | Queue connection for async jobs |
| `queue.queue` | `GERMAN_OCR_QUEUE_NAME` | `default` | Queue name for async jobs |

---

## Error Handling / Fehlerbehandlung

The package throws specific exceptions for different error scenarios:

```php
use GermanOcr\Laravel\Exceptions\AuthenticationException;
use GermanOcr\Laravel\Exceptions\QuotaExceededException;
use GermanOcr\Laravel\Exceptions\GermanOcrException;

try {
    $result = GermanOcr::analyze($file);
} catch (AuthenticationException $e) {
    // 401/403 -- Invalid API credentials
    // Ungueltige API-Zugangsdaten
} catch (QuotaExceededException $e) {
    // 429 -- Rate limit or quota exceeded
    // Rate-Limit oder Kontingent ueberschritten
} catch (GermanOcrException $e) {
    // Any other API error
    $e->getMessage();
    $e->getCode();          // HTTP status code
    $e->getErrorCode();     // API error code
    $e->getErrorDetails();  // Full error response
}
```

---

## DTOs / Datenobjekte

### OcrResult

| Property | Type | Description |
|---|---|---|
| `jobId` | `?string` | The job identifier (null for direct 200 responses) |
| `status` | `string` | Job status (pending, processing, completed, failed) |
| `text` | `?string` | Extracted text / OCR result |
| `modelUsed` | `?string` | Model that processed the document |
| `processingTimeMs` | `?int` | Processing time in milliseconds |
| `pageCount` | `?int` | Number of pages processed |
| `progress` | `?array` | Progress info (current_page, total_pages, phase) |

### OcrJob

| Property | Type | Description |
|---|---|---|
| `jobId` | `string` | The job identifier |
| `status` | `string` | Job status |
| `model` | `?string` | Model used |

---

## Testing / Testen

```bash
composer test
```

Or directly:

```bash
./vendor/bin/phpunit
```

You can use `Http::fake()` in your application tests to mock German-OCR responses:

```php
Http::fake([
    // Mock a direct 200 response
    'api.german-ocr.de/v1/analyze' => Http::response([
        'text' => 'Mocked OCR text',
        'model_used' => 'german-ocr',
        'processing_time_ms' => 500,
    ], 200),

    // Or mock an async 202 response
    'api.german-ocr.de/v1/analyze' => Http::response([
        'job_id' => 'test-job',
        'status' => 'pending',
    ], 202),
    'api.german-ocr.de/v1/jobs/test-job' => Http::response([
        'job_id' => 'test-job',
        'status' => 'completed',
        'result' => 'Mocked OCR text',
        'processing_time_ms' => 1500,
    ], 200),
]);

$result = GermanOcr::analyze('/path/to/test.pdf');
$this->assertEquals('Mocked OCR text', $result->text);
```

---

## License / Lizenz

MIT License. See [LICENSE](LICENSE) for details.

## Support

- Documentation / Dokumentation: [https://docs.german-ocr.de](https://docs.german-ocr.de)
- Email: support@german-ocr.de
- Issues: [GitHub Issues](https://github.com/german-ocr/laravel/issues)
