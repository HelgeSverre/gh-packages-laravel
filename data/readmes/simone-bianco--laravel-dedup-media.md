<p align="center">
    <img src="art/banner.png" alt="Laravel Dedup Media" width="600">
</p>

<p align="center">
    <a href="https://packagist.org/packages/simone-bianco/laravel-dedup-media"><img src="https://img.shields.io/packagist/v/simone-bianco/laravel-dedup-media.svg?style=flat-square" alt="Latest Version"></a>
    <a href="https://packagist.org/packages/simone-bianco/laravel-dedup-media"><img src="https://img.shields.io/packagist/dt/simone-bianco/laravel-dedup-media.svg?style=flat-square" alt="Total Downloads"></a>
    <a href="https://github.com/simone-bianco/laravel-dedup-media/blob/main/LICENSE"><img src="https://img.shields.io/packagist/l/simone-bianco/laravel-dedup-media.svg?style=flat-square" alt="License"></a>
</p>

# Laravel Dedup Media

A powerful Laravel package for **content-addressable media storage** with automatic deduplication. Store files only once, reference them many times—saving disk space and improving performance.

## ✨ Features

- **🔄 Automatic Deduplication** — Files with identical content are stored only once using SHA256 hashing
- **📊 Reference Counting** — Automatic cleanup when files are no longer referenced
- **💾 Any Storage Disk** — Works with local, S3, GCS, or any Laravel filesystem disk
- **🔧 Fully Customizable** — Pluggable hasher and path generator interfaces
- **🎯 Simple Integration** — Just add a trait to your Eloquent models
- **📁 Smart Path Distribution** — Hash-based subdirectories prevent filesystem bottlenecks
- **🧹 Auto-Cleanup** — Files are automatically deleted when no longer needed

## 📦 Installation

Install the package via Composer:

```bash
composer require simone-bianco/laravel-dedup-media
```

Run the installation command:

```bash
php artisan dedup-media:install
php artisan migrate
```

## ⚙️ Configuration

The configuration file will be published to `config/dedup_media.php`:

```php
return [
    // The filesystem disk for storing media
    'disk' => env('DEDUP_MEDIA_DISK', 'local'),

    // Base directory within the disk
    'directory' => 'dedup-media',

    // Hasher class (must implement Hasher contract)
    'hasher' => \SimoneBianco\LaravelDedupMedia\Hashers\Sha256Hasher::class,

    // Path generator class (must implement PathGenerator contract)
    'path_generator' => \SimoneBianco\LaravelDedupMedia\PathGenerators\HashBasedPathGenerator::class,
];
```

## 🚀 Quick Start

### 1. Add the Trait to Your Model

```php
use SimoneBianco\LaravelDedupMedia\Traits\HasDedupMedia;

class Document extends Model
{
    use HasDedupMedia;
}
```

### 2. Attach Media

```php
// From a file path
$document->attachMediaFromPath('/path/to/file.pdf', 'documents');

// From raw content
$document->attachMediaFromContent($pdfContent, 'report.pdf', 'documents');

// From base64 encoded content
$document->attachMediaFromBase64($base64Data, 'image.png', 'images');

// From an uploaded file
$document->attachMediaFromUpload($request->file('attachment'), 'uploads');
```

### 3. Retrieve Media

```php
// Get all media in a collection
$allMedia = $document->getMedia('documents');

// Get the first media item
$media = $document->getFirstMedia('documents');

// Check if media exists
if ($document->hasMedia('documents')) {
    // ...
}

// Get media count
$count = $document->getMediaCount('documents');
```

### 4. Access Media Properties

```php
$media->hash;            // SHA256 content hash
$media->path;            // Storage path
$media->original_name;   // Original filename
$media->mime_type;       // MIME type
$media->size;            // Size in bytes
$media->reference_count; // Number of models referencing this file

// Get file contents
$contents = $media->getContents();

// Get public URL (if disk supports it)
$url = $media->getUrl();

// Get a stream resource
$stream = $media->getStream();
```

## 🔄 How Deduplication Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Upload: report.pdf                        │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │ Hash: abc123│                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              ▼                         ▼                    │
│     ┌────────────────┐       ┌────────────────┐            │
│     │ Hash exists?   │  NO   │ Store new file │            │
│     │     YES        │──────▶│ ref_count = 1  │            │
│     └───────┬────────┘       └────────────────┘            │
│             │                                               │
│             ▼                                               │
│     ┌────────────────┐                                     │
│     │ Reuse existing │                                     │
│     │ ref_count += 1 │                                     │
│     └────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

When a model is deleted, the reference count is automatically decremented. When `ref_count` reaches zero, the physical file is deleted.

## 📁 Path Generation Strategy

By default, files are stored using a hash-based directory structure:

```
dedup-media/
├── ab/
│   └── cd/
│       └── abcdef1234567890...pdf
├── 12/
│   └── 34/
│       └── 1234567890abcdef...jpg
```

This distributes files across ~65,536 possible directories, preventing performance issues from too many files in a single folder.

## 🔧 Customization

### Custom Hasher

Create a class implementing `SimoneBianco\LaravelDedupMedia\Contracts\Hasher`:

```php
use SimoneBianco\LaravelDedupMedia\Contracts\Hasher;

class Md5Hasher implements Hasher
{
    public function hash(string $content): string
    {
        return md5($content);
    }

    public function hashFile(string $path): string
    {
        return md5_file($path);
    }
}
```

### Custom Path Generator

Create a class implementing `SimoneBianco\LaravelDedupMedia\Contracts\PathGenerator`:

```php
use SimoneBianco\LaravelDedupMedia\Contracts\PathGenerator;

class DateBasedPathGenerator implements PathGenerator
{
    public function generate(string $hash, string $extension): string
    {
        $date = now()->format('Y/m/d');
        return "{$date}/{$hash}.{$extension}";
    }
}
```

Update your config to use the custom implementations:

```php
// config/dedup_media.php
'hasher' => App\Media\Md5Hasher::class,
'path_generator' => App\Media\DateBasedPathGenerator::class,
```

## 🧪 Using the Facade

You can also use the `DedupMedia` facade directly:

```php
use SimoneBianco\LaravelDedupMedia\Facades\DedupMedia;

// Save a file
$media = DedupMedia::saveFromPath('/path/to/file.pdf', 'document.pdf');

// Check if a file exists by hash
$exists = DedupMedia::existsByHash($hash);

// Find media by hash
$media = DedupMedia::findByHash($hash);
```

## 📋 Requirements

- PHP 8.3+
- Laravel 12.0+

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
    Made with ❤️ by <a href="https://github.com/simone-bianco">Simone Bianco</a>
</p>
