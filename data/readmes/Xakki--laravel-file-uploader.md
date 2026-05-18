# Laravel File Uploader

> Fast, secure and convenient downloader **of any files** for **Laravel 10+** (PHP **8.3+** ) with a modern JS widget.  
> Supports **chunked upload** (the chunk size is configured in the config, 1 MB by default), **Drag&Drop**, list of uploaded files (size/date), **copying a public link**, **soft deletion to trash** with TTL auto-cleanup, localization **en/ru**, flexible configuration and work with any disks (including **s3/cloudfront**).

[![Packagist](https://img.shields.io/badge/packagist-xakki%2Flaravel--file--uploader-blue)](#установка)
[![Laravel](https://img.shields.io/badge/Laravel-10%2B-FF2D20)](https://laravel.com)
![PHP](https://img.shields.io/badge/PHP-8.3%2B-777)
[![License](https://img.shields.io/badge/License-Apache--2.0-green)](#license)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-lightgrey)](#ci--qa--coding-style)
[![Coverage](https://img.shields.io/badge/Coverage-codecov-lightgrey)](#ci--qa--coding-style)

---

## Features

- 🚀 **Chunks**: sending a file in parts, **the chunk size is configurable** (`chunk_size`), default is **1 MB**.
- 🌍**i18n**: **en** (default), **ru**.
- ***Service Provider**: an autodiscaver, publishing assets/config/locales.
- 📦 **Any disks**: default is `files`; there are ready-made recipes for **s3/CloudFront** (public/private).
- 🎨**Pop-up widget**: for uploading files.
  - 🖱️**Drag & Drop** + file selection.
  - 📋**File list**: name, size, date, **copy public link** in one click, delete.
  - 🧹**Deletion to the trash** (soft-delete) + auto-cleaning by **TTL** (default is 30 days).
  - 🔐 **Access via middleware** (default is `web` + `auth`) - changes in the config.

---

## Content

- [Installation](#installation)
- [Configuration](#configuration)
- [Integration with S3 / CloudFront](#integration-with-s3--cloudfront)
- [Widget (JS)](#widget-js)
- [Routes and API](#routes-and-api)
- [Delete and Trash](#delete-and-trash)
- [Localization (i18n)](#localization-i18n)
- [PHP Service](#php-service)
- [Security](#security)
- [Performance](#performance)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [CI / QA / Coding Style](#ci--qa--coding-style)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Installation

```bash
composer require xakki/laravel-file-uploader
````

If the auto-finder is disabled, add the provider to `config/app.php `:

```php
'providers' => [
    Xakki\LaravelFileUploader\Providers\FileUploaderServiceProvider::class,
],
```

Publish assets, and translations.:

```bash
php artisan vendor:publish --tag=file-uploader-assets
php artisan vendor:publish --tag=file-uploader-translations
```

Make a public symlink (if not already created):

```bash
php artisan storage:link --relative
```

> 💡 **The default disk is `public`**. Make sure that it is defined in `config/filesystems.php `.

---

## Configuration

Basic usage by env. Hire available env:

```
FILE_UPLOADER_DISK=public
FILE_UPLOADER_DIRECTORY=uploads
FILE_UPLOADER_TEMPORARY_DIRECTORY=uploads/.chunks
FILE_UPLOADER_METADATA_DIRECTORY=uploads/.meta
FILE_UPLOADER_TRASH_DIRECTORY=uploads/.trash
FILE_UPLOADER_CHUNK_SIZE=1048576
FILE_UPLOADER_MAX_SIZE=52428800
FILE_UPLOADER_ALLOWED_EXTENSIONS=pdf,docx,txt,jpeg,gif,png,webp,application/octet-stream:*,application/zip:zip,application/x-zip-compressed:zip
FILE_UPLOADER_TRASH_TTL_DAYS=30
FILE_UPLOADER_DEFAULT_LOCALE=en
```

The file: `config/file-uploader.php ' (redefine if necessary).
Optional publish configs:
```bash
php artisan vendor:publish --tag=file-uploader-config
```

`FILE_UPLOADER_ALLOWED_EXTENSIONS` accepts a comma-separated list of extensions. You can also bind MIME types to specific
extensions using the `mime:extension` format (set `*` as the extension to skip the extension check when the MIME matches).
For example, the default configuration is equivalent to:

```php
'allowed_extensions' => [
    'pdf',
    'docx',
    'txt',
    'jpeg',
    'gif',
    'png',
    'webp',
    'zip',
    'rar',
    'gz',
    'application/octet-stream' => '*',
    'application/zip' => 'zip',
    'application/x-zip-compressed' => 'zip',
    'application/x-rar-compressed' => 'rar',
    'application/vnd.rar' => 'rar',
    'application/gzip' => 'gz',
    'application/x-gzip' => 'gz',
],
```


> **About the size of the chunk**: the client takes the `chunk_size` from the `/init` response, because the value change in the config is automatically picked up at the front.

### Access control options

```php
'allow_delete_all_files' => false, // Allow everyone to delete all files when true
'full_access' => [
    'users' => [/* user IDs with full access */],
    'roles' => [/* role names checked via hasAnyRole/hasRole/getRoleNames */],
],
```

* When both arrays are empty (default), only the author of the file can delete it.
* The widget hides the delete button for foreign files unless `allow_delete_all_files` is enabled or the current user has full access.

---

## Integration with S3 / CloudFront

Below are two proven scenarios.

### Option A: S3 + CloudFront Public tank as CDN (simple public URLs)

`.env`:

```dotenv
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=eu-central-1
AWS_BUCKET=my-public-bucket
AWS_URL=https://dxxxxx.cloudfront.net
AWS_USE_PATH_STYLE_ENDPOINT=false
```

`config/filesystems.php ` (fragment of the s3 driver):

```php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env ('AWS_URL'), / / < -- cloudfront domain here
    'visibility' => 'public',
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
],
```

`config/file-uploader.php`:

```php
'disk' => 's3',
'public_url_resolver' => null, / / Storage:: url () returns the CloudFront URL
```

> **Summary:** `Storage:: url (.path)` will build .l based on `aws_url' (CloudFront domain).

---

### Option B: S3 + CloudFront Private Tank with **signed links**

If the bucket is private and file access requires a signature, use one of two paths:

**B1. S3 pre-signed (temporary) URLs:**

* Create a temporary URL in the controller/service along with 'Storage:: url()`:

  ```php
  $url = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(10));
  ```
* Return it to the client (widget/listing).
* * * Plus**: simple and regular. **Minus**: The URL will be s3 format, not CloudFront.

**B2. CloudFront Signed URL (recommended if you need a CDN domain):**

1. Specify in ' config / file-uploader.php ` **public URL resolver** (string callable; it is convenient to put the class in a package/project):

```php
'public_url_resolver' => \App\Support\FileUrlResolvers\CloudFrontSignedResolver::class.'@resolve',
```

2. Implement `CloudFrontSignedResolver' (example):

```php
<?php

namespace App\Support\FileUrlResolvers;

use Aws\CloudFront\UrlSigner;

class CloudFrontSignedResolver
{
    public function __construct(
        private readonly string $domain = 'https://dxxxxx.cloudfront.net',
        private readonly string $keyPairId = 'KXXXXXXXXXXXX',
        private readonly string $privateKeyPath = '/path/to/cloudfront_private_key.pem',
        private readonly int $ttlSeconds = 600, / / 10 minutes
    ) {}

    public function resolve(string $path): string
    {
// Normalizing the CloudFront URL
        $resourceUrl = rtrim($this->domain, '/').'/'.ltrim($path, '/');

        // Signing the URL
        $signer = new UrlSigner($this->keyPairId, file_get_contents($this->privateKeyPath));
        $expires = time() + $this->ttlSeconds;

        return $signer->getSignedUrl($resourceUrl, $expires);
    }
}
```

> **Important:** use the **string callable** (`Class@method') along with the closure — this is compatible with `php artisan config: cache'.

---

## Widgets (JS)

### Initialization


Insert the container and initialize the widget (for example, in `layouts/app.blade.php `):

```php
use Xakki\LaravelFileUploader\Services\FileWidget;

echo app(FileWidget::class)->getWidget();
```

If you want to work with the uploader without the widget, you can use the core service directly:

```php
use Xakki\LaravelFileUploader\Http\Requests\UploadChunkRequest;
use Xakki\LaravelFileUploader\Services\FileUpload;

public function store(UploadChunkRequest $request): JsonResponse
{
    $config = [
        'disk' => 'public',
        'chunk_size' => 1024 * 1024,
    ];

    $uploader = new FileUpload($config);

    $result = $uploader->handleChunk($request);
    $completed = $result instanceof FileMetadata;
    if ($completed) {
        $result = $uploader->formatFileForResponse($result);
        $messageKey = 'file-uploader::messages.upload_completed';
    } else {
        $messageKey = 'file-uploader::messages.chunk_received';
    }
    $response = [
        'success' => true,
        'data' => [
            'completed' => $completed,
            'metadata' => $result,
        ],
        'message' => Lang::get($messageKey, [
            'current' => $chunkRequest->chunkIndex + 1,
            'total' => $chunkRequest->totalChunks,
            'name' => $chunkRequest->fileName,
        ])
    ];
    return response()->json($response);
}
```

### Events

* `file-uploader:success` — `{ file }`
* `file-uploader:deleted` — `{ id }`

---

## Routes and API

> Prefix:'config ('file-uploader.route_prefix`)`, default is '/file-upload'.
> All routes are wrapped in `middleware' from the config (default: `web`, `auth`).

### Redirecting chunks

`POST /file-upload/chunks`

**Body** - `multipart/form-data` with fields:

* `filechunk'-binary chunk (<<config ('file-uploader.chunk_size')`).
* `chunkIndex ' — chunk number (0..N-1).
* `totalChunks' — total chunks.
* `uploadId' is a unique ID (for example, 'upload-${Datenow()}-${Math.random()}`).
* 'filesize', 'filename', 'mimetype' - metadata.
* `fileLastModified` — optional timestamp (ms) of the original file.

**Response (200 JSON)**

```json
{
  "status": "ok",
  "completed": true,
  "file": {
    "id": "upload-...",
    "name": "report.pdf",
    "size": 7340032,
    "mime": "application/pdf",
    "url": "https://example.com/storage/uploads/report.pdf",
    "created_at": "2025-10-09T10:12:33Z",
    "lastModified": 1696600000000,
    "own": true
  },
  "message": "File \"report.pdf\" uploaded successfully."
}
```

If `completed = false', the service will continue to wait for the remaining chunks.

### List of files

`GET /file-upload/files`

**Response (200 JSON)**

```json
{
  "status": "ok",
  "files": [
    {
      "id": "upload-...",
      "name": "report.pdf",
      "size": 7340032,
      "mime": "application/pdf",
      "url": "https://example.com/storage/uploads/report.pdf",
      "created_at": "2025-10-09T10:12:33Z",
      "lastModified": 1696600000000,
      "own": true
    }
  ]
}
```

---

## Delete and trash

### Deletion (soft-delete)

`DELETE /file-upload/files/{id}`

**Response (200 JSON)**

```json
{ "status": "ok", "message": "File moved to trash." }
```

> By default, only the author of the file can delete it. Enable `allow_delete_all_files` in the config or grant full access to specific users/roles to override this behaviour.

### Recovery

`POST /file-upload/files/{id}/restore`

**Response (200 JSON)**

```json
{ "status": "ok", "message": "File restored." }
```

### Emptying the trash (TTL)

```bash
php artisan file-uploader:cleanup
```

`app/Console/Kernel.php`:

```php
$schedule->command('file-uploader:cleanup')->daily();
```

Via HTTP:`DELETE /file-upload/trash/cleanup` → `{"status": "ok", "count": <int>}'.

> TTL is controlled by `trash_ttl_days' (default **30** ).

---

## Localization (i18n)

* Server: locales from `supported_locales' (`en`/`ru`), default is `default_locale'.
* Widget: by default, **en**; you can specify `locale: 'ru` and/or redefine the strings in 'i18n'.

---

## PHP service

```
Xakki\LaravelFileUploader\Services\FileUpload
```

**Responsible for:**

* Validation of `size` / 'mime' / 'extension' (config).
* Receiving chunks to a temporary directory (`storage/app/chunks/{uploadId}`).
* Assembling the final file and saving it to `Storage::disk ()...)`.
* Generation of a public or signed link (via `public_url_resolver`/`Storage::url`/`temporaryUrl`).
* Transfer/restore files from the trash.
* Clearing temporary chunks and trash (command/shadower).

Example:

```php
use Xakki\LaravelFileUploader\Http\Requests\UploadChunkRequest;
use Xakki\LaravelFileUploader\Services\FileUpload;

/** @var FileUpload $uploader */
$uploader = app(FileUpload::class);
/** @var UploadChunkRequest $request */
$result = $uploader->handleChunk($request);
// true - for chunk, FileMetadata for completed load
```

---

## Security

* Type/extension/size validation.
* Checking the actual MIME (whitelist).
* CSRF (for `web') / Bearer (for API).
* Access via middleware (authorized users by default).
* CORS/Headers — configure at the application level.
* Regular cleaning of temporary/deleted data on a schedule.

---

## Performance

* **`chunk_size`** is configurable (1 MB by default).
  A larger chunk means fewer requests, but higher risks of retransmission; a smaller chunk is more resistant to network failures.
* Parallel sending of chunks on the client is possible (turn it on with caution, given the limitations of the server).
* For large files, consider `post_max_size`, `upload_max_filesize`, and reverse-proxy limits.

---

## FAQ

**Is it possible to download multiple files at the same time?** yes. The widget supports queuing and (if desired) concurrency.

**How do I change the disk/folder?**
`config/file-uploader.php` → `disk` / `directory`. For S3/CloudFront, see the integration section.

**How do I get a CDN link?**
For a public CDN, specify `AWS_URL` (CloudFront domain) and use `Storage::url()'.
For a private CDN— implement a `public_url_resolver` with a CloudFront signature (example above).

**How can I disable authorization?**
Change the `middleware' (for example, `['web']`) or leave it empty — only if it is safe to do so.

---

## Troubleshooting

* **415/422** — check the MIME/extensions and `max_size'.
* **404 on links** — check the `storage:link` and the disk/directory configuration.
* **CSRF** — pass `_token` or use Bearer.
* **Build failed** — make sure that all chunks are received (indexes are continuous) and the size is the same.

---

## CI / QA / Coding Style

* **CI:** GitHub Actions — tests ('phpunit`/`pest'), static analysis (`phpstan`), linting (`pint`).
* **Coverage:** Codecov.
* **Style:** PSR-12, Laravel Pint.

---

## Roadmap

* [x] Progress bar on file and shared.
* [x] Parallel loading of chunks + auto-resume.
* [ ] Rename file
* [ ] Demo site
* [ ] Filters/search/sort through the file list.
* [ ] ignored files & path
* [ ] make preview of image
* [ ] Additional locales.
* [ ] Wrappers for Livewire/Vue.

---

## Contributing

PR/Issue are welcome.
Before shipping:

* Cover new functionality with tests.
* Follow the code style and SemVer.
* Update `CHANGELOG.md `.

---

## License

License **Apache-2.0**. See `LICENSE'.

---

## Credits

* Package: **xakki/laravel-file-uploader**
* Namespace: `Xakki\LaravelFileUploader`
* Author(s): @xakki

## Alternative
* https://github.com/pionl/laravel-chunk-upload/blob/master/config/chunk-upload.php