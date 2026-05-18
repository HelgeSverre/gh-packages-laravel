# ☁️ Impono

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrfrkayvaz/impono.svg?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/impono)
[![License](https://img.shields.io/packagist/l/mrfrkayvaz/impono?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/impono)
[![Total Downloads](https://img.shields.io/packagist/dt/mrfrkayvaz/impono?style=flat-square)](https://packagist.org/packages/mrfrkayvaz/impono)
![GitHub stars](https://img.shields.io/github/stars/mrfrkayvaz/impono?style=flat-square)

A flexible Laravel package that handles uploads from links, raw data, or files, turning them into a unified upload process. Impono provides powerful image manipulation, compression, and storage capabilities with an intuitive API.

## Features

- 🔗 **Multiple Upload Sources**: Upload from files, URLs, or raw data (base64)
- 🖼️ **Image Manipulation**: Resize, convert, apply filters, and more
- 🗜️ **Smart Compression**: Automatic image optimization
- 🎨 **Built-in Filters**: Sepia, blur, brightness adjustments
- 💾 **Flexible Storage**: Support for multiple Laravel storage disks
- 🔧 **Extensible**: Easy to add custom manipulation drivers
- 🧪 **Well Tested**: Comprehensive test suite with Pest PHP
- ⚡ **Performance**: Optimized for speed and memory efficiency

## Installation

You can install the package via Composer:

```bash
composer require mrfrkayvaz/impono
```

### Laravel Auto-Discovery

The package will automatically register itself with Laravel 5.5+.

### Manual Registration

If you're using an older version of Laravel, add the service provider to your `config/app.php`:

```php
'providers' => [
    // ...
    Impono\ImponoServiceProvider::class,
],
```

And add the facade alias:

```php
'aliases' => [
    // ...
    'Impono' => Impono\Facades\Impono::class,
],
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Impono\ImponoServiceProvider" --tag="impono-config"
```

### Environment Variables

Add these variables to your `.env` file:

```env
FILESYSTEM_DISK=local
IMPOONO_TEMP_PATH=impono/tmp
IMPOONO_LOCATION=uploads
```

## Usage

### Basic Upload from File

```php
use Impono\Facades\Impono;
use Illuminate\Http\Request;

public function upload(Request $request)
{
    $file = $request->file('image');
    
    $result = Impono::fromFile($file)
        ->disk('local')
        ->location('uploads/2025/jan')
        ->push('my-image.png');
    
    echo $result->getURL(); // uploads/2025/jan/my-image.png
}
```

### Upload from URL

```php
use Impono\Facades\Impono;

$result = Impono::fromUrl('https://example.com/image.jpg')
    ->resize(800, 600)
    ->quality(85)
    ->convert(Extension::WEBP)
    ->compress()
    ->push('optimized-image.webp');

echo $result->getURL();
```

### Upload from Base64 Data

```php
use Impono\Facades\Impono;

$base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

$result = Impono::fromData($base64Data)
    ->resize(400, 300)
    ->sepia()
    ->push('vintage-photo.png');
```

### Image Manipulation

```php
use Impono\Facades\Impono;
use Impono\Enums\Extension;

$result = Impono::fromFile($file)
    ->resize(1200, 800)           // Resize to specific dimensions
    ->quality(90)                 // Set JPEG quality
    ->convert(Extension::WEBP)    // Convert to WebP format
    ->sepia()                     // Apply sepia filter
    ->blur(5)                     // Apply blur effect
    ->brightness(20)              // Adjust brightness
    ->compress()                  // Optimize file size
    ->disk('s3')                  // Store on S3
    ->location('images/gallery')  // Custom storage path
    ->push('processed-image.webp');
```

### Available Image Operations

#### Resizing
```php
->resize(800, 600)        // Resize to exact dimensions
->width(800)              // Set width only
->height(600)             // Set height only
```

#### Format Conversion
```php
use Impono\Enums\Extension;

->convert(Extension::WEBP)    // Convert to WebP
->convert(Extension::PNG)     // Convert to PNG
->convert(Extension::JPEG)    // Convert to JPEG
->convert(Extension::GIF)     // Convert to GIF
->convert(Extension::AVIF)    // Convert to AVIF
->convert(Extension::HEIC)    // Convert to HEIC
->convert(Extension::TIFF)    // Convert to TIFF
```

#### Filters and Effects
```php
->sepia()                 // Apply sepia filter
->blur(5)                 // Apply blur (1-100)
->brightness(20)          // Adjust brightness (-100 to 100)
->quality(85)             // Set JPEG quality (1-100)
```

#### Compression
```php
->compress()              // Optimize file size
```

### Storage Configuration

```php
// Use different storage disks
->disk('local')           // Local storage
->disk('s3')              // Amazon S3
->disk('gcs')             // Google Cloud Storage

// Set custom storage location
->location('uploads/2025/jan')
->location('images/products')
```

### File Information

```php
$result = Impono::fromFile($file)->push();

// Get file information
echo $result->getURL();        // File path
echo $result->getFilename();   // Filename without extension
echo $result->getExtension();  // File extension
echo $result->getDisk();       // Storage disk
echo $result->getLocation();   // Storage location
echo $result->getIsTemp();     // Is temporary file

// Get image dimensions (for images)
$width = $result->getWidth();
$height = $result->getHeight();
$fileSize = $result->getFileSize();
```

## Configuration Options

### Basic Configuration

```php
// config/impono.php
return [
    'temp_path' => 'impono/tmp',        // Temporary file storage path
    'location' => 'uploads',             // Default storage location
    
    'mimes' => [
        // Supported file types
        ['extension' => 'jpg', 'type' => 'image', 'mime' => 'image/jpeg'],
        ['extension' => 'png', 'type' => 'image', 'mime' => 'image/png'],
        ['extension' => 'gif', 'type' => 'image', 'mime' => 'image/gif'],
        ['extension' => 'webp', 'type' => 'image', 'mime' => 'image/webp'],
        // ... more file types
    ]
];
```

### Supported File Types

The package supports a wide range of file types:

**Images:**
- JPEG, PNG, GIF, WebP, AVIF, HEIC, TIFF, BMP, SVG

**Videos:**
- MP4, WebM

**Documents:**
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV

**Audio:**
- MP3, WebA

**Archives:**
- ZIP, RAR

**Other:**
- TXT, XML

## Advanced Usage

### Custom Storage Paths

```php
$result = Impono::fromFile($file)
    ->disk('s3')
    ->location('user-uploads/' . auth()->id() . '/profile')
    ->push('avatar.jpg');
```

### Batch Processing

```php
$files = $request->file('images');
$results = [];

foreach ($files as $file) {
    $results[] = Impono::fromFile($file)
        ->resize(800, 600)
        ->compress()
        ->push();
}
```

### Error Handling

```php
try {
    $result = Impono::fromUrl('https://example.com/image.jpg')
        ->resize(800, 600)
        ->push();
} catch (\InvalidArgumentException $e) {
    // Handle unsupported file type
    return response()->json(['error' => 'Unsupported file type'], 400);
} catch (\RuntimeException $e) {
    // Handle download/processing errors
    return response()->json(['error' => 'Failed to process image'], 500);
}
```

## Testing

The package includes a comprehensive test suite. Run tests using:

```bash
composer test
```

## Requirements

- PHP 8.2+
- Laravel 12.0+
- GD or Imagick extension
- Spatie Image package

## Dependencies

- `illuminate/support` ^12.0
- `illuminate/database` ^12.0
- `illuminate/http` ^12.0
- `spatie/image` ^3.8
- `spatie/image-optimizer` ^1.8

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

If you find this package useful, please consider starring it on GitHub. For issues and feature requests, please use the [GitHub issue tracker](https://github.com/mrfrkayvaz/impono/issues).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Roadmap

- [ ] Video manipulation support
- [ ] PDF processing capabilities
- [ ] Advanced compression algorithms
- [ ] CDN integration
- [ ] Batch processing queue support
- [ ] Watermark functionality

---

**Made with ❤️ for the Laravel community**
