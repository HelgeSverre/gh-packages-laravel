# Laravel FileUploader

A file uploader package for Laravel. Uploads any file type directly to the project directory. Requires an active license from Uddokta Ecommerce for the domain.

## Installation

```bash
composer require mrmahedi/laravel-fileuploader
```

## How It Works

- The package **automatically detects your domain** from the request
- It validates against the Uddokta Ecommerce license server
- If your domain has an active license, file uploads work
- If not, all uploads are blocked — no configuration can bypass this

## Usage

### Using the Facade

```php
use MrMahedi\FileUploader\Facades\FileUploader;

// Upload file to project root (keeps original name)
$path = FileUploader::upload($request->file('file'));

// Upload to a subdirectory
$path = FileUploader::upload($request->file('file'), 'plugins');

// Upload with a custom filename
$path = FileUploader::uploadAs($request->file('file'), 'custom-name.php', 'modules');

// Delete a file
FileUploader::delete('plugins/my-plugin.php');
```

### Using Dependency Injection

```php
use MrMahedi\FileUploader\FileUploader;

class UploadController extends Controller
{
    public function store(Request $request, FileUploader $uploader)
    {
        $path = $uploader->upload($request->file('file'));

        return response()->json(['path' => $path]);
    }
}
```

### Using the Middleware

Protect your upload routes with the license validation middleware:

```php
Route::post('/upload', [UploadController::class, 'store'])
    ->middleware('fileuploader.license');
```

## License

MIT
