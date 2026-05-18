# Paperless-ngx Laravel Package

A comprehensive Laravel package for integrating with Paperless-ngx document management system. This package provides authentication, document management, search capabilities, and bulk operations through a clean Laravel interface.

## Features

- ✅ **Authentication Support**: Token-based and Basic authentication
- ✅ **Document Management**: Upload, download, update, delete documents
- ✅ **Search & Filtering**: Full-text search with various filters
- ✅ **Bulk Operations**: Bulk edit and download documents
- ✅ **Metadata Management**: Tags, correspondents, document types, storage paths
- ✅ **Custom Fields**: Support for custom field operations
- ✅ **Share Links**: Create and manage document share links
- ✅ **Statistics**: Get system statistics and user profile
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Configuration**: Flexible configuration system
- ✅ **Facade Support**: Easy access via Laravel Facade
- ✅ **Artisan Commands**: Built-in testing and management commands

## Requirements

- PHP 8.2 or newer (including PHP 8.4)
- Laravel 10, 11, or 12

The supported integration surface is `PaperlessService`, the `Paperless` facade, configuration keys, and Artisan commands. Classes under `Codewithathis\PaperlessNgx\Http` and `Codewithathis\PaperlessNgx\Api` are internal implementation details and may change without a major release.

## Installation

### Via Composer

```bash
composer require codewithathis/paperless-ngx
```

### Manual Installation

1. **Add to your `composer.json`:**

```json
{
    "require": {
        "codewithathis/paperless-ngx": "^2.0"
    }
}
```

2. **Run composer install:**

```bash
composer install
```

3. **Publish Configuration:**

```bash
php artisan vendor:publish --provider="Codewithathis\PaperlessNgx\PaperlessServiceProvider" --tag="paperless-config"
```

4. **Environment Variables**

Add the following variables to your `.env` file:

```env
# Paperless-ngx Configuration
PAPERLESS_BASE_URL=http://your-paperless-instance.com
PAPERLESS_TOKEN=your_api_token_here
PAPERLESS_USERNAME=your_username
PAPERLESS_PASSWORD=your_password
# token | basic | auto — default auto; see Configuration > Authentication
PAPERLESS_AUTH_METHOD=auto

# Optional Settings
PAPERLESS_PAGE_SIZE=25
PAPERLESS_TIMEOUT=30
PAPERLESS_MAX_FILE_SIZE=52428800
PAPERLESS_LOGGING_ENABLED=true
PAPERLESS_LOG_LEVEL=error
```

## Configuration

The package can be configured through the `config/paperless.php` file. Key configuration options:

### Authentication

`auth.method` controls how requests are signed when using the service container defaults:

- **`token`** — send the API token only (even if username/password are also set in `.env`).
- **`basic`** — HTTP Basic auth with username/password only.
- **`auto`** — legacy behaviour: Basic auth when both username and password are set; otherwise the token.

Runtime `setToken()` / `setBasicAuth()` on `PaperlessService` override the above for that instance.

```php
'auth' => [
    'token' => env('PAPERLESS_TOKEN', null),
    'username' => env('PAPERLESS_USERNAME', null),
    'password' => env('PAPERLESS_PASSWORD', null),
    'method' => env('PAPERLESS_AUTH_METHOD', 'auto'),
],
```

### Document Upload Settings

```php
'upload' => [
    'max_file_size' => env('PAPERLESS_MAX_FILE_SIZE', 50 * 1024 * 1024),
    'allowed_mime_types' => [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        // ... more types
    ],
    'auto_ocr' => env('PAPERLESS_AUTO_OCR', true),
    'auto_tag' => env('PAPERLESS_AUTO_TAG', false),
],
```

## Usage

### Basic Usage

#### Using Dependency Injection

```php
use Codewithathis\PaperlessNgx\PaperlessService;

class DocumentController extends Controller
{
    public function __construct(private PaperlessService $paperlessService)
    {
    }

    public function index()
    {
        $documents = $this->paperlessService->getDocuments();
        return response()->json($documents);
    }
}
```

#### Using the Facade

```php
use Codewithathis\PaperlessNgx\Facades\Paperless;

// Test connection
$isConnected = Paperless::testConnection();

// Get documents
$documents = Paperless::getDocuments(['title__icontains' => 'invoice']);

// Upload document
$documentId = Paperless::uploadDocument($file, [
    'title' => 'Invoice #123',
    'correspondent' => 1,
    'tags' => [1, 2, 3],
]);
```

### Authentication

#### Token Authentication (Recommended)

```php
// Set token
$paperlessService->setToken('your_api_token');

// Or in constructor
$paperlessService = new PaperlessService(
    'http://your-paperless-instance.com',
    'your_api_token'
);
```

#### Basic Authentication

```php
// Set credentials
$paperlessService->setBasicAuth('username', 'password');

// Or in constructor
$paperlessService = new PaperlessService(
    'http://your-paperless-instance.com',
    null,
    'username',
    'password'
);
```

### Document Operations

#### Upload Document

```php
use Illuminate\Http\UploadedFile;

$file = $request->file('document');
$metadata = [
    'title' => 'Invoice #123',
    'correspondent' => 1,
    'document_type' => 2,
    'tags' => [1, 2, 3],
    'storage_path' => 1,
    'archive_serial_number' => 1001,
];

$documentId = $paperlessService->uploadDocument($file, $metadata);
```

#### Get Documents with Filters

```php
$filters = [
    'title__icontains' => 'invoice',
    'correspondent__id' => 1,
    'tags__id__in' => [1, 2, 3],
    'created__gte' => '2024-01-01',
    'created__lte' => '2024-12-31',
];

$documents = $paperlessService->getDocuments($filters, 1, 25);
```

#### Update Document

```php
$data = [
    'title' => 'Updated Invoice Title',
    'correspondent' => 2,
    'tags' => [1, 4, 5],
];

$document = $paperlessService->updateDocument(123, $data);
```

#### Download Document

```php
// Download processed version
$content = $paperlessService->downloadDocument(123);

// Download original version
$originalContent = $paperlessService->downloadDocument(123, true);
```

#### Delete Document

```php
$deleted = $paperlessService->deleteDocument(123);
```

### Search Operations

#### Search Documents

```php
// Search in database only
$results = $paperlessService->searchDocuments('invoice', true);

// Search in full content
$results = $paperlessService->searchDocuments('invoice', false);
```

#### Get Search Autocomplete

```php
$suggestions = $paperlessService->getSearchAutocomplete('inv', 10);
```

### Bulk Operations

#### Bulk Edit Documents

```php
$documentIds = [1, 2, 3, 4, 5];
$editData = [
    'correspondent' => 1,
    'tags' => [1, 2],
    'document_type' => 2,
];

$result = $paperlessService->bulkEditDocuments($documentIds, $editData);
```

#### Bulk Download Documents

```php
$documentIds = [1, 2, 3, 4, 5];
$downloadInfo = $paperlessService->bulkDownloadDocuments($documentIds);
```

### Metadata Management

#### Tags

```php
// Get all tags
$tags = $paperlessService->getTags();

// Create tag
$tag = $paperlessService->createTag([
    'name' => 'Important',
    'color' => '#ff0000',
]);

// Update tag
$updatedTag = $paperlessService->updateTag(1, [
    'name' => 'Very Important',
    'color' => '#00ff00',
]);

// Delete tag
$deleted = $paperlessService->deleteTag(1);
```

#### Correspondents

```php
// Get correspondents
$correspondents = $paperlessService->getCorrespondents();

// Create correspondent
$correspondent = $paperlessService->createCorrespondent([
    'name' => 'ABC Company',
    'matching_algorithm' => 1,
    'match' => 'ABC',
]);

// Update correspondent
$updatedCorrespondent = $paperlessService->updateCorrespondent(1, [
    'name' => 'ABC Corporation',
]);

// Delete correspondent
$deleted = $paperlessService->deleteCorrespondent(1);
```

#### Document Types

```php
// Get document types
$documentTypes = $paperlessService->getDocumentTypes();

// Create document type
$documentType = $paperlessService->createDocumentType([
    'name' => 'Invoice',
    'matching_algorithm' => 1,
    'match' => 'invoice',
]);

// Update document type
$updatedDocumentType = $paperlessService->updateDocumentType(1, [
    'name' => 'Invoice Document',
]);

// Delete document type
$deleted = $paperlessService->deleteDocumentType(1);
```

### Document Notes

```php
// Get document notes
$notes = $paperlessService->getDocumentNotes(123);

// Add note
$note = $paperlessService->addDocumentNote(123, 'This is an important document');

// Delete note
$deleted = $paperlessService->deleteDocumentNote(123, 1);
```

### Document History

```php
// Get document history
$history = $paperlessService->getDocumentHistory(123);
```

### Share Links

```php
// Get document share links
$shareLinks = $paperlessService->getDocumentShareLinks(123);

// Create share link
$shareLink = $paperlessService->createShareLink([
    'document' => 123,
    'expiration' => '2024-12-31',
]);

// Update share link
$updatedShareLink = $paperlessService->updateShareLink(1, [
    'expiration' => '2024-06-30',
]);

// Delete share link
$deleted = $paperlessService->deleteShareLink(1);
```

### Statistics

```php
// Get system statistics
$statistics = $paperlessService->getStatistics();
```

### System Information

```php
// Get system status
$status = $paperlessService->getStatus();

// Get remote version
$version = $paperlessService->getRemoteVersion();

// Get user profile
$profile = $paperlessService->getProfile();

// Generate auth token
$token = $paperlessService->generateAuthToken();
```

## Artisan Commands

The package includes several Artisan commands for testing and management:

### Test Connection

```bash
php artisan paperless:test
```

### Test with File Upload

```bash
php artisan paperless:test --upload=/path/to/document.pdf
```

### Test Search

```bash
php artisan paperless:test --search="invoice"
```



## Error Handling

The service includes comprehensive error handling with custom exception classes:

### Custom Exceptions

- **`PaperlessApiException`** - For API-related errors (HTTP status codes, response data, unique constraint violations)
- **`PaperlessConnectionException`** - For connection issues (timeout, DNS, SSL, network)
- **`PaperlessValidationException`** - For validation failures (metadata, field validation)
- **`PaperlessFileException`** - For file-related errors (size, type, permissions, corruption)

### Basic Error Handling

```php
use Codewithathis\PaperlessNgx\Exceptions\PaperlessApiException;
use Codewithathis\PaperlessNgx\Exceptions\PaperlessConnectionException;

try {
    $documents = $paperlessService->getDocuments();
} catch (PaperlessApiException $e) {
    // Handle API errors (4xx, 5xx status codes)
    $statusCode = $e->getStatusCode();
    $responseData = $e->getResponseData();
    
    if ($e->isAuthenticationError()) {
        return response()->json(['error' => 'Authentication failed'], 401);
    }
    
    return response()->json(['error' => $e->getMessage()], $statusCode);
} catch (PaperlessConnectionException $e) {
    // Handle connection issues
    return response()->json(['error' => 'Service unavailable'], 503);
}
```

### Using the Exception Handler

```php
use Codewithathis\PaperlessNgx\Exceptions\PaperlessExceptionHandler;

try {
    $result = $paperlessService->uploadDocument($file, $metadata);
} catch (PaperlessException $e) {
    $errorResponse = PaperlessExceptionHandler::handle($e);
    $httpStatusCode = PaperlessExceptionHandler::getHttpStatusCode($e);
    
    return response()->json($errorResponse, $httpStatusCode);
}
```

For detailed exception handling examples, see [EXCEPTION_HANDLING_EXAMPLES.md](EXCEPTION_HANDLING_EXAMPLES.md).

## Logging

The service logs all API interactions when logging is enabled:

```php
'logging' => [
    'enabled' => env('PAPERLESS_LOGGING_ENABLED', true),
    'level' => env('PAPERLESS_LOG_LEVEL', 'error'),
    'channel' => env('PAPERLESS_LOG_CHANNEL', 'paperless'),
],
```

## Caching

The service supports caching for improved performance:

```php
'cache' => [
    'enabled' => env('PAPERLESS_CACHE_ENABLED', true),
    'ttl' => env('PAPERLESS_CACHE_TTL', 3600),
    'prefix' => env('PAPERLESS_CACHE_PREFIX', 'paperless'),
],
```

## Security

Security settings for SSL verification and timeouts:

```php
'security' => [
    'verify_ssl' => env('PAPERLESS_VERIFY_SSL', true),
    'allow_self_signed' => env('PAPERLESS_ALLOW_SELF_SIGNED', false),
    'timeout' => env('PAPERLESS_REQUEST_TIMEOUT', 30),
],
```

## Testing

Test the connection to your Paperless-ngx instance:

```php
// Test connection
$isConnected = $paperlessService->testConnection();

if ($isConnected) {
    echo "Successfully connected to Paperless-ngx";
} else {
    echo "Failed to connect to Paperless-ngx";
}
```

## Examples

### Complete Document Management Workflow

```php
use Codewithathis\PaperlessNgx\PaperlessService;
use Illuminate\Http\UploadedFile;

class DocumentService
{
    public function __construct(private PaperlessService $paperlessService)
    {
    }

    public function processInvoice(UploadedFile $file, array $data)
    {
        try {
            // 1. Upload document
            $documentId = $this->paperlessService->uploadDocument($file, [
                'title' => $data['title'],
                'correspondent' => $data['correspondent_id'],
                'document_type' => $data['document_type_id'],
                'tags' => $data['tag_ids'],
            ]);

            // 2. Add note
            $this->paperlessService->addDocumentNote($documentId, 'Processed automatically');

            // 3. Get document details
            $document = $this->paperlessService->getDocument($documentId);

            return [
                'success' => true,
                'document_id' => $documentId,
                'document' => $document,
            ];
        } catch (Exception $e) {
            Log::error('Failed to process invoice', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function searchInvoices(string $query)
    {
        $filters = [
            'title__icontains' => $query,
            'document_type__name__icontains' => 'invoice',
        ];

        return $this->paperlessService->getDocuments($filters);
    }

    public function bulkTagDocuments(array $documentIds, array $tagIds)
    {
        return $this->paperlessService->bulkEditDocuments($documentIds, [
            'tags' => $tagIds,
        ]);
    }
}
```

### Using with Laravel Jobs

```php
use Codewithathis\PaperlessNgx\PaperlessService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $filePath,
        private array $metadata
    ) {
    }

    public function handle(PaperlessService $paperlessService)
    {
        $file = new UploadedFile($this->filePath, basename($this->filePath));
        
        $documentId = $paperlessService->uploadDocument($file, $this->metadata);
        
        // Process the uploaded document
        Log::info('Document uploaded successfully', ['document_id' => $documentId]);
    }
}
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your API token or credentials
   - Check if the Paperless-ngx instance is accessible
   - Ensure the authentication method is correctly configured

2. **Upload Fails**
   - Check file size limits
   - Verify supported file types
   - Ensure proper permissions on the Paperless-ngx instance

3. **Connection Timeout**
   - Increase timeout settings in configuration
   - Check network connectivity
   - Verify Paperless-ngx instance is running

4. **SSL Certificate Issues**
   - Set `PAPERLESS_VERIFY_SSL=false` for self-signed certificates
   - Update SSL certificates on your Paperless-ngx instance

### Debug Mode

Enable debug logging to troubleshoot issues:

```env
PAPERLESS_LOGGING_ENABLED=true
PAPERLESS_LOG_LEVEL=debug
```

## Package Structure

```
codewithathis/paperless-ngx/
├── src/
│   ├── PaperlessService.php
│   ├── PaperlessServiceProvider.php
│   ├── Facades/
│   │   └── Paperless.php
│   ├── Http/
│   │   └── Controllers/
│   │       └── PaperlessController.php
│   └── Commands/
│       └── TestPaperlessConnection.php
├── config/
│   └── paperless.php
├── routes/
│   └── api.php
├── composer.json
└── README.md
```

## Requirements

- PHP >= 8.0
- Laravel >= 9.0
- Guzzle HTTP Client (included with Laravel)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run the test command
php artisan paperless:test

# Test with file upload
php artisan paperless:test --upload=/path/to/test.pdf

# Test search functionality
php artisan paperless:test --search="invoice"
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

If you encounter any issues or have questions, please:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [issues](https://github.com/codewithathis/paperless-ngx/issues)
3. Create a new issue with detailed information

## Credits

- [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) - The document management system
- [Laravel](https://laravel.com) - The PHP framework for web artisans
