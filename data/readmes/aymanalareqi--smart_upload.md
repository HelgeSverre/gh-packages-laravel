# Smart Upload

Laravel package for mobile file uploads with temporary storage - no database required.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/alareqi/smart-upload.svg?style=flat-square)](https://packagist.org/packages/alareqi/smart-upload)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/alareqi/smart-upload/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/alareqi/smart-upload/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/alareqi/smart-upload/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/alareqi/smart-upload/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/alareqi/smart-upload.svg?style=flat-square)](https://packagist.org/packages/alareqi/smart-upload)

This package provides a simple way to handle file uploads from mobile apps. Files are uploaded to a temporary location, then moved to their final destination when the form is submitted.

## Installation

```bash
composer require alareqi/smart-upload
```

No migrations needed - this package uses file-based temporary storage.

## How It Works

```
┌─────────────┐     /upload-file ┌─────────────┐
│ Mobile App  │ ────────────▶ │   Laravel  │
│             │               │   Server   │
│ 1.Select   │ ◀─────────── │ 2.Return  │
│    file    │    upload   │   signed  │
│             │     URL    │    URL   │
│ 3.Upload   │ ────────────▶ │          │
│    to URL   │  4.Upload  │          │
│             │    file   │          │
│5.Submit     │ ────────────▶ │6.Move to │
│    form    │   form     │ final    │
│             │   data    │ location │
└─────────────┘             └─────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/upload-file` | Upload file |

### Upload File

Upload a file directly to the endpoint:

```http
POST /api/upload-file
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[file content]
------WebKitFormBoundary--
```

Response:

```json
{
    "uuid": "abc-123-uuid",
    "path": "tmp/abc-123.jpg",
    "original_name": "photo.jpg",
    "size": 1024,
    "mime_type": "image/jpeg",
    "temp_url": "https://yourapp.com/storage/tmp/abc-123.jpg",
    "expires_at": "2024-01-01T12:00:00Z"
}
```

## Laravel Controller Usage

Use the `HasFileUploads` trait in your controller:

```php
use Alareqi\SmartUpload\Concerns\HasFileUploads;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use HasFileUploads;

    public function store(Request $request)
    {
        // Convert temporary upload to permanent storage
        $path = $this->convertUpload(
            $request->image_uuid,  // UUID from mobile
            'posts/images'        // Final directory
        );

        // Save to database
        Post::create([
            'title' => $request->title,
            'image' => $path,
        ]);
    }
}
```

### Multiple Files

For multiple file uploads, pass an array of UUIDs:

```php
use Alareqi\SmartUpload\Concerns\HasFileUploads;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use HasFileUploads;

    public function store(Request $request)
    {
        $imagePaths = [];

        // $request->image_uploads is array: ['uuid1', 'uuid2', 'uuid3']
        foreach ($request->image_uploads as $uuid) {
            $imagePaths[] = $this->convertUpload(
                $uuid,
                'posts/images'
            );
        }

        // Save to database
        Post::create([
            'title' => $request->title,
            'images' => json_encode($imagePaths),
        ]);
    }
}
```

Or convert each with custom filename:

```php
foreach ($request->images as $index => $uuid) {
    $path = $this->convertUpload(
        $uuid,
        'posts/images',
        'post_' . $post->id . '_image_' . $index . '.jpg'  // Custom filename
    );
}
```

## Configuration

Edit `config/smart-upload.php`:

```php
return [
    // Final storage disk
    'disk' => env('SMART_UPLOAD_DISK', 'local'),

    // Temporary directory
    'temp_directory' => env('SMART_UPLOAD_TEMP_DIR', 'smart-upload-tmp'),

    // Hours until temp file expires (also used as cache TTL)
    'expiration_hours' => 24,

    // Max file size in KB
    'max_file_size' => 10240,

    // Allowed mimes
    'allowed_mimes' => ['jpg', 'jpeg', 'png', 'gif', 'pdf'],

    // Cache driver for metadata
    'cache' => [
        'driver' => env('SMART_UPLOAD_CACHE_DRIVER', 'file'),
    ],

    // Temporary upload settings
    'temporary_file_upload' => [
        'disk' => 'local',
        'directory' => 'tmp',
    ],
];
```

## Cleanup Command

Run cleanup to delete expired temporary files:

```bash
php artisan smart-upload:cleanup
```

Schedule it in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('smart-upload:cleanup')->hourly();
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Ayman Alareqi](https://github.com/aymanalareqi)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.