[![Tests](https://github.com/yannelli/plaud-api-laravel/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/yannelli/plaud-api-laravel/actions/workflows/tests.yml)

# Laravel Plaud API Package

An **unofficial** Laravel package for the Plaud API. This package provides a clean, Laravel-idiomatic interface for managing recordings, transcriptions, and summaries from the Plaud platform.

## Features

- ✅ Full authentication support
- ✅ Retrieve and manage recordings
- ✅ Download audio files, transcripts, and summaries
- ✅ Create shareable links
- ✅ Trash, restore, and permanently delete recordings
- ✅ Laravel HTTP client integration
- ✅ Facade support for easy access
- ✅ Type-safe models with PHP 8.3+ typed properties
- ✅ Comprehensive error handling

## Requirements

- PHP 8.3 or higher
- Laravel 12.x
- Guzzle HTTP client 7.x

## Installation

Install the package via Composer:

```bash
composer require yannelli/laravel-plaud
```

### Publish Configuration (Optional)

You can publish the configuration file if you want to customize it:

```bash
php artisan vendor:publish --tag=plaud-config
```

This will create a `config/plaud.php` file in your Laravel application.

### Environment Configuration

Add your Plaud access token to your `.env` file:

```env
PLAUD_ACCESS_TOKEN=your-access-token-here
```

## Usage

### Authentication

First, authenticate with the Plaud API to obtain an access token:

```php
use Yannelli\LaravelPlaud\Facades\Plaud;

// Authenticate with username and password
$authResponse = Plaud::authenticate('your-username', 'your-password');

// Access token is automatically set in the client
$accessToken = $authResponse->accessToken;
```

### Using Dependency Injection

You can also use dependency injection instead of the facade:

```php
use Yannelli\LaravelPlaud\PlaudService;

class RecordingController extends Controller
{
    public function __construct(
        protected PlaudService $plaud
    ) {}

    public function index()
    {
        $recordings = $this->plaud->getAllRecordings();
        return view('recordings.index', compact('recordings'));
    }
}
```

### Get User Information

```php
use Yannelli\LaravelPlaud\Facades\Plaud;

$user = Plaud::getMyUser();

echo $user->dataUser->email;
echo $user->dataUser->nickname;
```

### Get System Status

```php
$status = Plaud::getStatus();

// Check processing status
if (!empty($status->dataProcessingTranssummAi->filesTrans)) {
    echo "Files are being transcribed...";
}
```

### Retrieve Recordings

#### Get All Recordings

```php
$recordings = Plaud::getAllRecordings();

foreach ($recordings->dataFileList as $recording) {
    echo $recording->filename;
    echo $recording->duration;
    echo $recording->startTime;
}
```

#### Get Recordings with Filters

```php
$recordings = Plaud::getRecordingsWithFilter(
    skip: 0,
    limit: 50,
    isTrash: 0,  // 0 = not in trash, 1 = in trash, 2 = all
    sortBy: 'start_time',
    isDesc: true
);
```

#### Get Specific Recordings by ID

```php
$recordingIds = ['recording-id-1', 'recording-id-2'];
$recordings = Plaud::getSpecificRecordings($recordingIds);
```

### File Tags (Folders)

```php
$tags = Plaud::getFileTags();

foreach ($tags->dataFiletagList as $tag) {
    echo $tag->name;
    echo $tag->color;
}
```

### Create Shareable Links

```php
use Yannelli\LaravelPlaud\Models\Requests\RequestShareableLinkPermissions;

$permissions = new RequestShareableLinkPermissions(
    isAudio: 1,      // Allow audio sharing
    isTrans: 1,      // Allow transcript sharing
    isAiContent: 1,  // Allow AI content sharing
    isMindmap: 0     // Disable mindmap sharing
);

$shareableLink = Plaud::createShareableLink('recording-id', $permissions);

echo $shareableLink->url; // The shareable URL
```

### Download Files

#### Download Audio File

```php
use Yannelli\LaravelPlaud\Facades\Plaud;
use Illuminate\Support\Facades\Storage;

$recordingId = 'your-recording-id';
$base64Audio = Plaud::downloadAudioFile($recordingId);

// Decode and save to storage
$audioData = base64_decode($base64Audio);
Storage::put('recordings/audio.mp3', $audioData);
```

#### Download Transcript

```php
use Yannelli\LaravelPlaud\Constants\FileTypes;

$recordingId = 'your-recording-id';

// Download as PDF
$base64Transcript = Plaud::downloadTranscriptFile($recordingId, FileTypes::PDF);

// Or download as TXT, DOCX, SRT, or Markdown
$base64Transcript = Plaud::downloadTranscriptFile($recordingId, FileTypes::TXT);

// Save to storage
$transcriptData = base64_decode($base64Transcript);
Storage::put('recordings/transcript.pdf', $transcriptData);
```

#### Download Summary

```php
use Yannelli\LaravelPlaud\Constants\FileTypes;

$recordingId = 'your-recording-id';
$base64Summary = Plaud::downloadSummaryFile($recordingId, FileTypes::DOCX);

$summaryData = base64_decode($base64Summary);
Storage::put('recordings/summary.docx', $summaryData);
```

### Manage Recordings

#### Move to Trash

```php
$recordingIds = ['recording-id-1', 'recording-id-2'];
$success = Plaud::trashRecordings($recordingIds);

if ($success) {
    echo "Recordings moved to trash successfully";
}
```

#### Restore from Trash

```php
$recordingIds = ['recording-id-1', 'recording-id-2'];
$success = Plaud::untrashRecordings($recordingIds);
```

#### Permanently Delete

```php
$recordingIds = ['recording-id-1', 'recording-id-2'];
$success = Plaud::permanentlyDeleteRecordings($recordingIds);

if ($success) {
    echo "Recordings permanently deleted";
}
```

## Available File Types

The package provides a `FileTypes` constant class with the following supported formats:

```php
use Yannelli\LaravelPlaud\Constants\FileTypes;

FileTypes::MP3      // Audio format
FileTypes::WAV      // Audio format
FileTypes::TXT      // Plain text
FileTypes::PDF      // PDF document
FileTypes::DOCX     // Microsoft Word
FileTypes::SRT      // Subtitle format
FileTypes::MARKDOWN // Markdown format
```

## Error Handling

The package throws `PlaudException` for API errors:

```php
use Yannelli\LaravelPlaud\Facades\Plaud;
use Yannelli\LaravelPlaud\Exceptions\PlaudException;

try {
    $recordings = Plaud::getAllRecordings();
} catch (PlaudException $e) {
    // Handle API errors
    logger()->error('Plaud API Error: ' . $e->getMessage());

    // Get HTTP status code if available
    $statusCode = $e->getCode();
}
```

## Advanced Usage

### Using the Low-Level Client

If you need more control, you can use the `PlaudClient` directly:

```php
use Yannelli\LaravelPlaud\PlaudClient;

$client = new PlaudClient();
$client->authenticate('username', 'password');

// Make custom API requests
$response = $client->get('/custom/endpoint');
$response = $client->post('/custom/endpoint', ['data' => 'value']);
```

### Accessing the Client from the Service

```php
use Yannelli\LaravelPlaud\Facades\Plaud;

$client = Plaud::getClient();
$accessToken = Plaud::getAccessToken();
```

## Available Methods

### PlaudService Methods

| Method | Description |
|--------|-------------|
| `authenticate($username, $password)` | Authenticate with username and password |
| `getMyUser()` | Get current user information |
| `getStatus()` | Get API and system status |
| `getAllRecordings()` | Get all recordings without filters |
| `getRecordingsWithFilter(...)` | Get recordings with custom filters |
| `getSpecificRecordings($ids)` | Get specific recordings by IDs |
| `getFileTags()` | Get all file tags (folders) |
| `createShareableLink($id, $permissions)` | Create a shareable link |
| `downloadAudioFile($id)` | Download audio file as base64 |
| `downloadTranscriptFile($id, $type)` | Download transcript as base64 |
| `downloadSummaryFile($id, $type)` | Download summary as base64 |
| `trashRecordings($ids)` | Move recordings to trash |
| `untrashRecordings($ids)` | Restore recordings from trash |
| `permanentlyDeleteRecordings($ids)` | Permanently delete recordings |

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security-related issues, please email the package maintainer instead of using the issue tracker.

## Credits

- Original .NET library: [JamesStuder/Plaud_API](https://github.com/JamesStuder/Plaud_API)
- Laravel package maintainer: [Ryan Yannelli](https://ryanyannelli.com)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Disclaimer

This is an **unofficial** package and is not affiliated with, maintained, or endorsed by Plaud. Use at your own risk.
