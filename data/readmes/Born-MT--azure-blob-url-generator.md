# Azure Blob URL Generator

A Laravel package that provides Azure Blob Storage URL generation with SAS (Shared Access Signature) tokens for [Spatie Laravel Media Library](https://spatie.be/docs/laravel-medialibrary).

This package extends Spatie's default URL generator to produce Azure Blob Storage URLs with SAS token authentication, enabling secure access to media files stored in Azure Blob Storage.

## Requirements

- PHP 8.2 or higher
- Laravel (with Illuminate Support)
- [spatie/laravel-medialibrary](https://github.com/spatie/laravel-medialibrary) ^11.17
- [azure-oss/storage-blob-laravel](https://github.com/Azure-OSS/azure-storage-php-adapter-laravel) ^1.4

## Installation

Install the package via Composer:

```bash
composer require bornmt/azure-blob-url-generator
```

### Register the Service Provider

If you're using Laravel 11+, the service provider may be auto-discovered. Otherwise, add it to the `providers` array in `config/app.php`:

```php
'providers' => [
    // ...
    BornMT\AzureBlobUrlGenerator\UrlGeneratorServiceProvider::class,
],
```

## Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
AZURE_STORAGE_ENDPOINT=https://yourstorageaccount.blob.core.windows.net
AZURE_STORAGE_CONTAINER=your-container-name
AZURE_STORAGE_SAS_TOKEN=sv=2021-06-08&ss=b&srt=sco&sp=rl&se=...
```

| Variable                  | Description                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `AZURE_STORAGE_ENDPOINT`  | The full URL of your Azure Storage account (e.g., `https://mystorageaccount.blob.core.windows.net`) |
| `AZURE_STORAGE_CONTAINER` | The name of the blob container where media files are stored                                         |
| `AZURE_STORAGE_SAS_TOKEN` | The SAS token string (without the leading `?`) for authenticated access                             |

> **Note:** Ensure your SAS token has appropriate permissions (e.g., `r` for read access) and is configured with a suitable expiration for your use case.

### 2. Configure Spatie Media Library

Update your Spatie Media Library configuration to use this package's URL generator. Publish the media library config if you haven't already:

```bash
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-config"
```

Then, in `config/media-library.php`, set the custom URL generator:

```php
'url_generator' => \BornMT\AzureBlobUrlGenerator\Services\UrlGeneratorService::class,
```

### 3. Configure Your Filesystem

Add the Azure disk to `config/filesystems.php`:

```php
'disks' => [
    'azure' => [
        'driver' => 'azure-storage-blob',
        'sasToken' => env('AZURE_STORAGE_SAS_TOKEN'),
        'container' => env('AZURE_STORAGE_CONTAINER'),
        'endpoint' => env('AZURE_STORAGE_ENDPOINT'),
        'connection_string' => sprintf(
            'BlobEndpoint=%s;SharedAccessSignature=%s',
            env('AZURE_STORAGE_ENDPOINT'),
            env('AZURE_STORAGE_SAS_TOKEN')
        ),
    ],
],
```

Set your default media disk in `config/media-library.php` or via the `MEDIA_DISK` environment variable:

```env
MEDIA_DISK=azure
```

## Usage

Once configured, media URLs are generated automatically when you call `getUrl()` or `getTemporaryUrl()` on your media items.

### Basic Usage with Spatie Media Library

```php
// Add media to a model
$yourModel->addMedia($pathToFile)
    ->toMediaCollection('documents', 'azure');

// Get the Azure Blob SAS URL
$media = $yourModel->getFirstMedia('documents');
$url = $media->getUrl();  // Returns full URL with SAS token

// Get a temporary URL (uses same SAS token - ensure your SAS has appropriate expiration)
$temporaryUrl = $media->getTemporaryUrl(now()->addHours(1));
```

## Generated URL Format

URLs are generated in the following format:

```
{endpoint}/{container}/{path-to-file}?{sas_token}
```

Example:

```
https://mystorageaccount.blob.core.windows.net/my-container/media/1/image.jpg?sv=2021-06-08&ss=b&srt=sco&sp=rl&se=...
```

## License

The MIT License (MIT). Please see the [License File](LICENSE) for more information.
