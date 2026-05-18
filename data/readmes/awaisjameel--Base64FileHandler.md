# Base64 File Handler

A Laravel package for handling and storing base64 encoded files.

## Installation

You can install the package via composer:

```bash
composer require AwaisJameel/base64-file-handler
```

The package will automatically register its service provider if you're using Laravel 5.5+.

You can publish the configuration file with:

```bash
php artisan vendor:publish --provider="AwaisJameel\Base64FileHandler\Base64FileHandlerServiceProvider" --tag="config"
```

## Configuration

After publishing the configuration file, you can find it at `config/base64-file-handler.php`. The configuration allows you to set:

-   Default storage disk
-   Default storage path
-   Allowed file extensions
-   Valid image extensions

## Usage

### Basic Usage

You can use the facade to store base64 encoded files:

```php
use AwaisJameel\Base64FileHandler\Facades\Base64FileHandler;

// Store a base64 encoded file
$filePath = Base64FileHandler::store($base64Data);

// Store with custom parameters
$filePath = Base64FileHandler::store(
    $base64Data,
    'local',                   // custom disk
    'custom/path/',            // custom path
    'original-filename.jpg',   // original filename
    ['jpg', 'png']             // allowed extensions
);
```

### Validating Images

```php
use AwaisJameel\Base64FileHandler\Facades\Base64FileHandler;

try {
    Base64FileHandler::isValidImage($base64Data);
    // The data is a valid image
} catch (Exception $e) {
    // The data is not a valid image
}
```

### Getting File Information

```php
use AwaisJameel\Base64FileHandler\Facades\Base64FileHandler;

$fileInfo = Base64FileHandler::getFileInfo($base64Data);
// Returns array with mime, extension, size, and decoded data
```

### Direct Instantiation

You can also use the class directly without the facade:

```php
use AwaisJameel\Base64FileHandler\Base64FileHandler;

$handler = new Base64FileHandler([
    'disk' => 'local',
    'path' => 'custom/path/',
    'allowed_extensions' => ['jpg', 'png', 'pdf'],
]);

$filePath = $handler->store($base64Data);
```

## Error Handling

The package throws exceptions when:

-   The base64 data is invalid
-   The file extension is not allowed
-   The image extension is invalid (when validating images)
-   Unable to store the file

Wrap your code in try-catch blocks to handle these exceptions.

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
