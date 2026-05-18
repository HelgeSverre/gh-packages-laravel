# ImageMan

**Professional Laravel image upload, processing and multi-disk management package.**

[![Latest Version](https://img.shields.io/packagist/v/ibrahim-kaya/imageman.svg?style=flat-square)](https://packagist.org/packages/ibrahim-kaya/imageman)
[![Total Downloads](https://img.shields.io/packagist/dt/ibrahim-kaya/imageman.svg?style=flat-square)](https://packagist.org/packages/ibrahim-kaya/imageman)
[![Tests](https://img.shields.io/github/actions/workflow/status/ibrahim-kaya/ImageMan/tests.yml?label=tests&style=flat-square)](https://github.com/ibrahim-kaya/ImageMan/actions)
[![License](https://img.shields.io/packagist/l/ibrahim-kaya/imageman.svg?style=flat-square)](LICENSE)

> 🇹🇷 [Türkçe dokümantasyon için README.tr.md dosyasına bakın](README.tr.md)

---

## Features

- **WebP & AVIF conversion** — Auto-convert any uploaded image to WebP or AVIF on the fly
- **Multi-size variants** — Generate thumbnail, medium, large and custom size presets in one pass
- **Multi-disk support** — Switch between `local`, `s3`, `ftp`, `sftp`, GCS and any Flysystem driver
- **Duplicate detection** — SHA-256 hash-based deduplication with `reuse`, `throw` or `allow` modes
- **Watermarking** — Apply logo or text watermarks with configurable position and opacity
- **LQIP placeholders** — Generate base64 blur placeholders for smooth lazy-loading transitions
- **EXIF stripping** — Remove GPS coordinates and device info to protect user privacy
- **CDN integration** — Built-in URL generators for Imgix, Cloudinary, ImageKit and Cloudflare Images
- **Event system** — `ImageUploaded`, `ImageProcessed`, `ImageDeleted` events for reactive workflows
- **Queue support** — Dispatch image processing to a background queue for fast HTTP responses
- **HasImages trait** — Drop into any Eloquent model for instant upload/retrieve/delete support
- **Artisan commands** — `imageman:regenerate`, `imageman:clean`, `imageman:convert`
- **Blade directives** — `@image`, `@responsiveImage`, `@lazyImage`
- **API Resource** — Ready-made `ImageResource` for JSON API responses
- **Filament v3** — Form component and table column for the Filament admin panel
- **Laravel Nova** — Custom field for the Nova admin panel
- **Fluent API** — Chainable builder that reads like plain English

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.1 |
| Laravel | ^10.0 \| ^11.0 |
| Intervention Image | ^3.0 |

Optional (for admin panel integrations):
- `filament/filament` ^3.0
- `laravel/nova` ^4.0

---

## Installation

**1. Install via Composer:**

```bash
composer require ibrahim-kaya/imageman
```

**2. Publish the config file:**

```bash
php artisan vendor:publish --tag=imageman-config
```

**3. Publish and run migrations:**

```bash
php artisan vendor:publish --tag=imageman-migrations
php artisan migrate
```

The `imageman_images` table will be created in your database.

---

## Configuration

After publishing, edit `config/imageman.php`. Every option is documented with an inline comment in the file. Key settings:

| Key | Default | Description |
|---|---|---|
| `disk` | `local` | Default filesystem disk (env: `IMAGEMAN_DISK`) |
| `path` | `images` | Storage directory prefix (env: `IMAGEMAN_PATH`) |
| `format` | `webp` | Output format: `webp`, `avif`, `jpeg`, `original` |
| `webp_quality` | `80` | WebP encoding quality (1–100) |
| `avif_quality` | `70` | AVIF encoding quality (1–100) |
| `default_sizes` | `['thumbnail','medium']` | Size presets generated for every upload |
| `detect_duplicates` | `true` | Enable SHA-256 duplicate detection |
| `on_duplicate` | `reuse` | `reuse` / `throw` / `allow` |
| `queue` | `false` | Process images in a background queue |
| `url_generator` | `default` | `default`, `imgix`, `cloudinary`, `imagekit`, `cloudflare` |
| `generate_lqip` | `true` | Generate blur placeholder data URIs |
| `strip_exif` | `true` | Strip EXIF metadata for privacy |

---

## Basic Usage

### Upload an image

```php
use IbrahimKaya\ImageMan\ImageManFacade as ImageMan;

// From an HTTP request field
$image = ImageMan::upload($request->file('photo'))->save();

// From a remote URL
$image = ImageMan::uploadFromUrl('https://example.com/photo.jpg')->save();

echo $image->url('medium');     // Public URL for the medium variant
echo $image->url('thumbnail');  // Public URL for the thumbnail
echo $image->url();             // Main image URL
```

### Retrieve and delete

```php
$image = ImageMan::find(1);      // Returns ?Image
$image = ImageMan::get(1);       // Returns Image or throws ImageNotFoundException

ImageMan::destroy(1);            // Deletes DB record + disk files
$image->delete();                // Same, called on the model instance
```

---

### Upload from URL

The `uploadFromUrl()` method downloads the remote image and passes it through the same processing pipeline as a regular upload (WebP conversion, resizing, watermarking, etc.):

```php
// Basic
$image = ImageMan::uploadFromUrl('https://example.com/photo.jpg')->save();

// Full fluent chain — all options available
$image = ImageMan::uploadFromUrl('https://cdn.example.com/banner.png', timeoutSeconds: 60)
    ->disk('s3')
    ->collection('remote')
    ->sizes(['thumbnail', 'medium', 'large'])
    ->format('avif')
    ->watermark()
    ->meta(['alt' => 'Remote banner'])
    ->save();

// Via HasImages trait — just pass the URL string instead of an UploadedFile
$post->uploadImage('https://example.com/photo.jpg', 'gallery');
$user->uploadImage('https://example.com/avatar.png', 'avatars', ['disk' => 's3', 'timeout' => 45]);
```

**Error handling:**

```php
use IbrahimKaya\ImageMan\Exceptions\UrlFetchException;

try {
    $image = ImageMan::uploadFromUrl($url)->save();
} catch (UrlFetchException $e) {
    // URL not reachable, non-2xx response, or response is not an image
    Log::error('Remote image download failed', ['url' => $url, 'reason' => $e->getMessage()]);
}
```

---

## Fluent API Reference

All methods return `$this` (except `save()` which returns an `Image` model).

| Method | Description |
|---|---|
| `->disk('s3')` | Override the storage disk |
| `->collection('gallery')` | Set the collection name |
| `->sizes(['thumbnail','large'])` | Choose which size presets to generate |
| `->withOriginal()` | Also keep the unmodified original file |
| `->for($model)` | Associate with an Eloquent model |
| `->meta(['alt' => '…'])` | Attach metadata (alt text, title, etc.) |
| `->format('avif')` | Override output format for this upload |
| `->filename('my-photo')` | Custom filename stem (slugified, no extension needed) |
| `->inDirectory('products')` | Store inside a custom subdirectory |
| `->noUuid()` | Omit UUID folder for a deterministic, stable path |
| `->watermark()` | Enable watermark (overrides config) |
| `->noWatermark()` | Disable watermark for this upload |
| `->watermarkImage($path)` | Use a specific image file as watermark |
| `->watermarkText('© 2024')` | Use a text string as watermark |
| `->withLqip()` | Enable LQIP generation |
| `->withoutLqip()` | Disable LQIP generation |
| `->replaceExisting()` | Delete old images in the collection after saving |
| `->keepExisting()` | Keep old images even if collection is singleton |
| `->maxSize(2048)` | Max file size in KB |
| `->minWidth(400)` | Minimum width in pixels |
| `->maxWidth(2000)` | Maximum width in pixels |
| `->aspectRatio('16/9')` | Enforce aspect ratio |
| `->save()` | Execute and return `Image` model |

---

## Size Variants

Define named presets in `config/imageman.php`:

```php
'sizes' => [
    'thumbnail' => ['width' => 150,  'height' => 150,  'fit' => 'cover'],
    'medium'    => ['width' => 800,  'height' => 600,  'fit' => 'contain'],
    'large'     => ['width' => 1920, 'height' => 1080, 'fit' => 'contain'],
    'hero'      => ['width' => 2560, 'height' => 1440, 'fit' => 'cover'],
],
```

Retrieve by name:

```php
$image->url('thumbnail');   // Thumbnail URL
$image->url('hero');        // Hero URL
$image->path('medium');     // Storage path
$image->variants();         // ['thumbnail' => ['path' => …, 'width' => 150, …], …]
$image->srcset();           // "url 150w, url 800w, url 1920w"
```

---

## Disk Management

Switch disk per upload — no config change needed:

```php
// Upload to S3
$image = ImageMan::upload($file)->disk('s3')->save();

// Upload to FTP
$image = ImageMan::upload($file)->disk('ftp')->save();

// Default disk override for the next upload only
ImageMan::disk('s3')->upload($file)->save();
```

Make sure the target disk is configured in `config/filesystems.php`.

---

## Custom Filename & Directory

### Custom filename

Set a custom filename stem for the stored file. The extension is always determined automatically from the output format — do not include it:

```php
$image = ImageMan::upload($file)
    ->filename('product-hero')
    ->save();
// → images/{uuid}/product-hero.webp
// → images/{uuid}/product-hero_thumbnail.webp
```

Turkish characters and spaces are automatically slugified:

```php
->filename('Ürün Fotoğrafı')  // → urun-fotografı
```

### Custom directory

Group images into a subdirectory without changing the base path config:

```php
$image = ImageMan::upload($file)
    ->inDirectory('products/phones')
    ->filename('iphone-16')
    ->save();
// → images/products/phones/{uuid}/iphone-16.webp
```

Each directory segment is slugified automatically:

```php
->inDirectory('Ürün Görselleri')  // → urun-gorselleri
```

### Deterministic paths with `->noUuid()`

By default every upload gets its own UUID folder to prevent collisions. Call `->noUuid()` to omit it and get a fully stable, predictable URL — ideal for profile photos and cover images:

```php
$image = ImageMan::upload($file)
    ->inDirectory('users/' . $user->id)
    ->filename('avatar')
    ->noUuid()
    ->save();
// → images/users/42/avatar.webp  (always the same URL)
```

> **Note:** When `noUuid()` is active, uploading to the same path again **silently overwrites** the existing file. Combine with `->replaceExisting()` (or singleton collections) to also clean up the old database record.

### Path composition table

| `inDirectory()` | `noUuid()` | `filename()` | Result |
|---|---|---|---|
| ✗ | ✗ | ✗ | `images/{uuid}/{uuid}.webp` |
| `'products'` | ✗ | ✗ | `images/products/{uuid}/{uuid}.webp` |
| `'products'` | ✗ | `'iphone'` | `images/products/{uuid}/iphone.webp` |
| `'users/42'` | ✓ | `'avatar'` | `images/users/42/avatar.webp` |
| `'products'` | ✓ | ✗ | `images/products/{uuid}.webp` |

---

## WebP & AVIF Conversion

Change format globally (in `.env` or config):

```env
# .env
IMAGEMAN_DISK=s3
```

```php
// config/imageman.php
'format' => 'avif',   // Convert everything to AVIF
```

Or per upload:

```php
$image = ImageMan::upload($file)->format('avif')->save();
$image = ImageMan::upload($file)->format('original')->save(); // No conversion
```

---

## Watermarking

### Global config

Set a default watermark for all uploads in `config/imageman.php`:

```php
'watermark' => [
    'enabled'  => true,
    'type'     => 'image',               // 'image' or 'text'
    'path'     => storage_path('app/watermark.png'),
    'text'     => null,
    'position' => 'bottom-right',
    'opacity'  => 50,
    'padding'  => 15,
],
```

### Per-upload: image watermark

Override the watermark image on a single upload without touching the config file:

```php
$image = ImageMan::upload($file)
    ->watermarkImage(storage_path('app/logo.png'))
    ->save();

// All options:
$image = ImageMan::upload($file)
    ->watermarkImage(
        path:     storage_path('app/logo.png'),
        position: 'bottom-right', // top-left | top-center | top-right
                                   // center-left | center | center-right
                                   // bottom-left | bottom-center | bottom-right
        opacity:  40,              // 0 (invisible) – 100 (solid)
        padding:  15,              // px gap from edge
    )
    ->save();
```

### Per-upload: text watermark

```php
$image = ImageMan::upload($file)
    ->watermarkText('© 2024 My Company')
    ->save();

// All options:
$image = ImageMan::upload($file)
    ->watermarkText(
        text:     '© 2024 My Company',
        position: 'bottom-center',
        opacity:  70,
        padding:  12,
    )
    ->save();
```

### Enable / disable for a single upload

```php
// Enable for this upload only (uses config path/text)
$image = ImageMan::upload($file)->watermark()->save();

// Disable for this upload only (even if config has enabled: true)
$image = ImageMan::upload($file)->noWatermark()->save();
```

### Priority rules

| Method called | Result |
|---|---|
| `->watermarkImage($path)` | Enables watermark, uses given image |
| `->watermarkText($text)` | Enables watermark, uses given text |
| `->watermark()` | Enables watermark, keeps config type/path/text |
| `->noWatermark()` | Disables watermark for this upload |
| *(none)* | Falls back entirely to `config/imageman.php` |

---

## Duplicate Detection

When the same file is uploaded twice, ImageMan checks the SHA-256 hash:

```php
// config/imageman.php
'detect_duplicates' => true,
'on_duplicate'      => 'reuse',  // 'reuse' | 'throw' | 'allow'
```

| Mode | Behaviour |
|---|---|
| `reuse` | Returns the existing Image model. No new file stored. |
| `throw` | Throws `DuplicateImageException` with a reference to the existing image. |
| `allow` | Creates a new record regardless. |

Handle the exception:

```php
use IbrahimKaya\ImageMan\Exceptions\DuplicateImageException;

try {
    $image = ImageMan::upload($file)->save();
} catch (DuplicateImageException $e) {
    $existing = $e->existingImage();
    return response()->json(['message' => 'Duplicate', 'image' => $existing]);
}
```

---

## Singleton Collections

A **singleton collection** holds exactly one image per model instance. When a new image is uploaded to a singleton collection, all previously stored images in that collection for the same model are automatically deleted **after** the new image has been successfully saved — so the model is never left without an image during the transition.

### Option 1 — Config-based (always singleton)

List the collection names in `config/imageman.php`:

```php
'singleton_collections' => ['profile_pic', 'avatar', 'cover'],
```

Any upload to those collections will automatically replace the previous one — no extra method call needed:

```php
// First upload
$user->uploadImage($request->file('photo'), 'profile_pic');

// Second upload — first image is automatically deleted after this saves
$user->uploadImage($request->file('photo'), 'profile_pic');
```

### Option 2 — Per-upload with `->replaceExisting()`

Use the fluent method to opt in on a single upload:

```php
$image = ImageMan::upload($file)
    ->for($user)
    ->collection('avatar')
    ->replaceExisting()
    ->save();
```

### Option 3 — `HasImages` trait with `replace` option

```php
// Explicit replace
$user->uploadImage($file, 'profile_pic', ['replace' => true]);

// Explicit keep (even if profile_pic is in singleton_collections config)
$user->uploadImage($file, 'profile_pic', ['replace' => false]);
```

### Override: keeping multiple images in a singleton collection

Call `->keepExisting()` to opt out of automatic replacement even when the collection is listed in config:

```php
// profile_pic is in singleton_collections but we want to keep both this time
$image = ImageMan::upload($file)
    ->for($user)
    ->collection('profile_pic')
    ->keepExisting()
    ->save();
```

### How it works

| Scenario | Result |
|---|---|
| `replaceExisting()` + model set | Old images in collection deleted after new save |
| `keepExisting()` | Old images kept regardless of config |
| `replaceExisting()` + **no model** | Silently ignored (no scope to delete within) |
| Different collection on same model | Untouched |
| Same collection on different model instance | Untouched |

> **Safety guarantee:** Old images are only deleted *after* the new image has been fully written to disk and the database record has been committed. If processing fails before that point, the old image remains intact.

---

## LQIP & Lazy Loading

Access the blur placeholder:

```php
$image->lqip();  // "data:image/webp;base64,/9j/4AAQ…"
```

Use in Blade with the `@lazyImage` directive:

```blade
@lazyImage($post->image->id, 'large', ['class' => 'lazyload w-full'])
```

Renders:

```html
<img
    src="data:image/webp;base64,…"
    data-src="https://…/images/abc.webp"
    class="lazyload w-full"
    loading="lazy"
    alt="…"
>
```

Add [lazysizes](https://github.com/aFarkas/lazysizes) to your front-end for the blur-to-sharp transition.

---

## EXIF Stripping

Enabled by default. Strips GPS coordinates, device model, and all other EXIF metadata before saving:

```php
// config/imageman.php
'strip_exif' => true,
```

---

## Upload Validation

Set global rules in config:

```php
'validation' => [
    'max_size'      => 10240,   // 10 MB
    'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
],
```

Or apply rules fluently per upload:

```php
use IbrahimKaya\ImageMan\Exceptions\ValidationException;

try {
    $image = ImageMan::upload($request->file('photo'))
        ->maxSize(5120)          // 5 MB max
        ->minWidth(400)          // At least 400px wide
        ->maxWidth(4096)
        ->aspectRatio('16/9')    // Must be widescreen
        ->save();
} catch (ValidationException $e) {
    return back()->withErrors($e->errors());
}
```

---

## Model Integration (HasImages Trait)

Add the trait to any Eloquent model:

```php
use IbrahimKaya\ImageMan\Traits\HasImages;

class User extends Model
{
    use HasImages;
}

class Post extends Model
{
    use HasImages;
}
```

### Methods available

```php
// Upload
$user->uploadImage($request->file('avatar'), 'avatars');
$post->uploadImage($request->file('photo'), 'gallery', ['sizes' => ['thumbnail', 'large']]);

// Retrieve
$user->getImage('avatars');          // → ?Image (most recent)
$post->getImages('gallery');         // → Collection<Image>
$post->getAllImages();               // → Collection grouped by collection name
$user->hasImage('avatars');          // → bool

// Eloquent relationships
$user->images;                       // All images (morphMany)
$user->image;                        // Latest default image (morphOne)

// Delete
$post->deleteImages('gallery');      // Delete all gallery images + files
$post->deleteImages('*');            // Delete all collections
```

---

## Event System

Listen to ImageMan events in your `EventServiceProvider`:

```php
use IbrahimKaya\ImageMan\Events\ImageUploaded;
use IbrahimKaya\ImageMan\Events\ImageProcessed;
use IbrahimKaya\ImageMan\Events\ImageDeleted;

protected $listen = [
    ImageUploaded::class  => [SendUploadNotification::class],
    ImageProcessed::class => [TriggerCdnWarmup::class],
    ImageDeleted::class   => [CleanupSearch::class],
];
```

Event payloads:

```php
// ImageUploaded
$event->image;   // Image model
$event->model;   // Associated Eloquent model (or null)

// ImageProcessed
$event->image;    // Image model (with variants populated)
$event->variants; // ['thumbnail' => ['path' => …], …]

// ImageDeleted
$event->imageId;  // Former primary key
$event->disk;     // Disk name
$event->paths;    // Array of deleted file paths
```

---

## Queue Processing

Enable background processing to keep upload responses fast:

```php
// config/imageman.php
'queue'            => true,
'queue_connection' => 'redis',
'queue_name'       => 'images',
```

Start the worker:

```bash
php artisan queue:work --queue=images
```

When queue is enabled, `save()` inserts the DB record immediately (so you get an ID back) and dispatches `ProcessImageJob`. Variants are available once the job completes — listen to `ImageProcessed` to know when they are ready.

---

## Chunked Uploads

Upload files larger than PHP's `upload_max_filesize` limit by splitting them into small chunks in the browser and reassembling them on the server. All chunks are fed through the standard ImageUploader pipeline (WebP/AVIF conversion, size variants, watermark, LQIP, queue, etc.) once assembly is complete.

### Enable chunk routes

Chunk routes are enabled by default (`config('imageman.chunks.enabled') = true`). They are always loaded when chunk support is on — regardless of the `register_routes` setting.

If you want to add authentication middleware to chunk endpoints:

```php
// config/imageman.php
'chunks' => [
    'enabled'    => true,
    'middleware' => ['auth:sanctum'],
    // ...
],
```

### JavaScript helper

Publish the bundled `ImageManUploader` class to your `public/` directory:

```bash
php artisan vendor:publish --tag=imageman-js
# → public/vendor/imageman/imageman-uploader.js
```

The file is a UMD bundle — it works as a plain `<script>` tag, an ES module import, or a CommonJS `require()`.

#### Script tag

```html
<script src="/vendor/imageman/imageman-uploader.js"></script>
<script>
const uploader = new ImageManUploader({
    endpoint:    '/imageman/chunks',
    collection:  'gallery',
    chunkSize:   2 * 1024 * 1024,   // 2 MB per chunk (optional, server returns hint)
    concurrency: 3,                  // parallel chunk uploads
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
    },
    onProgress: (pct) => console.log(pct + '%'),
    onComplete: (uploadId, imageId) => console.log('Done! image_id:', imageId),
    onError:    (err)  => console.error('Upload failed:', err),
});

document.querySelector('input[type=file]').addEventListener('change', (e) => {
    uploader.upload(e.target.files[0]);
});
</script>
```

#### ES module (Vite / webpack)

```js
import ImageManUploader from '/vendor/imageman/imageman-uploader.js';

const uploader = new ImageManUploader({ endpoint: '/imageman/chunks', ... });
```

#### CommonJS (Node / older bundlers)

```js
const ImageManUploader = require('./public/vendor/imageman/imageman-uploader');
```

### Resumable uploads

Store the `upload_id` returned at initiation (e.g. in `localStorage`) so that if the page is refreshed or the browser closes mid-upload, the session can be resumed — only the missing chunks are re-sent:

```js
// Save upload_id on initiation (onProgress / onComplete callbacks fire normally)
uploader.upload(file).then(() => localStorage.removeItem('uploadId'));
// The upload_id is available after initiation via the server response.
// A simple approach: initiate manually, save the ID, then use resume():
uploader.resume(savedUploadId, file);
```

### Abort an upload

```js
uploader.abort(); // Sends DELETE /imageman/chunks/{id} and cleans up disk files
```

### HTTP API reference

| Method   | URL                                  | Description                          |
|----------|--------------------------------------|--------------------------------------|
| `POST`   | `/imageman/chunks/initiate`          | Start a new session, get `upload_id` |
| `POST`   | `/imageman/chunks/{id}`              | Upload one chunk (multipart)         |
| `GET`    | `/imageman/chunks/{id}/status`       | Poll assembly status                 |
| `DELETE` | `/imageman/chunks/{id}`              | Abort and delete all chunk files     |

**Initiate request body** (JSON or form-data):

| Field           | Type    | Required | Description                                |
|-----------------|---------|----------|--------------------------------------------|
| `filename`      | string  | yes      | Original file name                         |
| `mime_type`     | string  | yes      | MIME type (must be in `allowed_mimes`)     |
| `total_size`    | integer | yes      | Full file size in bytes                    |
| `total_chunks`  | integer | yes      | Number of chunks the file is split into    |
| `collection`    | string  | no       | Target collection (default: `"default"`)   |
| `disk`          | string  | no       | Target storage disk                        |
| `meta`          | object  | no       | Arbitrary metadata                         |
| `imageable_type`| string  | no       | Eloquent model FQCN for polymorphic link   |
| `imageable_id`  | integer | no       | Eloquent model primary key                 |

**Status response** fields: `status`, `received_chunks`, `missing_chunks`, `total_chunks`, `image_id`, `error_message`.

Status values: `uploading` → `assembling` → `processing` (queued) → `complete` / `failed`.

### Queue assembly

Set `assemble_on_queue` in config (or inherit from `imageman.queue`) to run chunk assembly in the background:

```php
'chunks' => [
    'assemble_on_queue' => true,  // dispatches AssembleChunksJob
],
```

Poll `GET /imageman/chunks/{id}/status` until `status === 'complete'` — the JS helper does this automatically.

### Clean stale sessions

Chunk files are stored under `storage/app/imageman_chunks/{upload_id}/`. Use the included Artisan command to remove sessions that were abandoned:

```bash
php artisan imageman:clean-chunks                 # Remove sessions inactive > 24h
php artisan imageman:clean-chunks --dry-run       # Preview only
php artisan imageman:clean-chunks --older-than=48 # Custom TTL in hours
php artisan imageman:clean-chunks --status=failed # Only failed sessions
```

Schedule it in `App\Console\Kernel`:

```php
$schedule->command('imageman:clean-chunks')->daily()->withoutOverlapping();
```

---

## Artisan Commands

### Regenerate variants

Re-run size generation for existing images. Useful after adding a new size preset:

```bash
php artisan imageman:regenerate
php artisan imageman:regenerate --size=hero          # Only the 'hero' preset
php artisan imageman:regenerate --collection=gallery # Only gallery images
php artisan imageman:regenerate --disk=s3            # Only S3 images
```

### Clean orphaned images

Remove images with no associated model:

```bash
php artisan imageman:clean              # With confirmation prompt
php artisan imageman:clean --dry-run    # Preview only (no deletions)
php artisan imageman:clean --older-than=30  # Only images older than 30 days
```

### Bulk format conversion

Convert stored images to a new format (e.g. after changing `config.format`):

```bash
php artisan imageman:convert --format=webp
php artisan imageman:convert --format=avif
php artisan imageman:convert --format=webp --dry-run
```

---

## CDN Integration

### Imgix

```php
// config/imageman.php
'url_generator' => 'imgix',
'imgix' => [
    'domain'   => env('IMGIX_DOMAIN'),    // e.g. 'mysite.imgix.net'
    'sign_key' => env('IMGIX_SIGN_KEY'),  // optional
],
```

### Cloudinary

```php
'url_generator' => 'cloudinary',
'cloudinary' => [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key'    => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
],
```

### ImageKit

```php
'url_generator' => 'imagekit',
'imagekit' => [
    'url_endpoint' => env('IMAGEKIT_URL_ENDPOINT'),
    'public_key'   => env('IMAGEKIT_PUBLIC_KEY'),
    'private_key'  => env('IMAGEKIT_PRIVATE_KEY'),
],
```

### Cloudflare Images

```php
'url_generator' => 'cloudflare',
'cloudflare' => [
    'account_id' => env('CF_IMAGES_ACCOUNT_ID'),
    'api_token'  => env('CF_IMAGES_API_TOKEN'),
],
```

### Custom URL Generator

Implement `UrlGeneratorContract` and reference your class:

```php
'url_generator' => \App\ImageMan\MyCustomUrlGenerator::class,
```

---

## Blade Directives

### @image — Single variant

```blade
@image($post->image->id, 'medium', ['class' => 'rounded-xl', 'alt' => 'Post photo'])
```

Renders:

```html
<img src="https://…/abc.webp" width="800" height="600" class="rounded-xl" alt="Post photo" loading="lazy">
```

### @responsiveImage — srcset

```blade
@responsiveImage($post->image->id, [
    'sizes' => '(max-width: 768px) 100vw, 800px',
    'class' => 'w-full',
])
```

Renders:

```html
<img
    src="https://…/abc_medium.webp"
    srcset="https://…/abc_thumbnail.webp 150w, https://…/abc_medium.webp 800w, https://…/abc_large.webp 1920w"
    sizes="(max-width: 768px) 100vw, 800px"
    width="800" height="600"
    class="w-full"
    loading="lazy"
    alt="…"
>
```

### @lazyImage — LQIP lazy load

```blade
@lazyImage($post->image->id, 'large', ['class' => 'lazyload'])
```

Renders an `<img>` with `src` set to the LQIP placeholder and `data-src` pointing to the full image, ready for [lazysizes](https://github.com/aFarkas/lazysizes).

---

## API Resource

Use in controllers to return a consistent JSON structure:

```php
use IbrahimKaya\ImageMan\Resources\ImageResource;

// Single image
return ImageResource::make($image);

// Collection
return ImageResource::collection(Image::all());
```

Example JSON output:

```json
{
    "id": 1,
    "url": "https://cdn.example.com/images/abc.webp",
    "variants": {
        "thumbnail": "https://cdn.example.com/images/abc_thumbnail.webp",
        "medium":    "https://cdn.example.com/images/abc_medium.webp"
    },
    "lqip": "data:image/webp;base64,UklGRk…",
    "srcset": "https://… 150w, https://… 800w",
    "width": 1920,
    "height": 1080,
    "size": 204800,
    "mime_type": "image/webp",
    "original_filename": "hero-photo.jpg",
    "collection": "gallery",
    "disk": "s3",
    "meta": { "alt": "Hero photo" },
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

---

## Filament v3 Integration

Register the plugin in your panel provider:

```php
use IbrahimKaya\ImageMan\Integrations\Filament\FilamentImageManPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(FilamentImageManPlugin::make());
}
```

### Form component

```php
use IbrahimKaya\ImageMan\Integrations\Filament\Forms\ImageManUpload;

ImageManUpload::make('photo')
    ->collection('avatars')
    ->disk('s3')
    ->sizes(['thumbnail', 'medium'])
```

### Table column

```php
use IbrahimKaya\ImageMan\Integrations\Filament\Tables\ImageManColumn;

ImageManColumn::make('photo')
    ->collection('avatars')
    ->size('thumbnail')
    ->circular()
```

---

## Laravel Nova Integration

```php
use IbrahimKaya\ImageMan\Integrations\Nova\ImageManField;

public function fields(NovaRequest $request): array
{
    return [
        ImageManField::make('Photo')
            ->collection('avatars')
            ->disk('s3')
            ->size('medium'),
    ];
}
```

---

## Private Disk Routes

To serve images stored on a private disk through your Laravel app, enable the optional routes:

```php
// config/imageman.php
'register_routes'    => true,
'route_prefix'       => 'imageman',
'route_middleware'   => ['auth'],
```

Two endpoints become available:

| Route | Description |
|---|---|
| `GET /imageman/{id}/{variant?}` | Proxy-stream the image through PHP |
| `GET /imageman/{id}/{variant?}/sign` | Redirect to a signed temporary URL (S3/GCS) |

---

## Temporary Signed URLs

For private disks (S3, GCS, Azure Blob):

```php
// Default TTL from config (imageman.signed_url_ttl, default: 60 minutes)
$url = $image->temporaryUrl();

// Custom TTL in minutes
$url = $image->temporaryUrl(30);

// Specific variant
$url = $image->temporaryUrl(15, 'medium');
```

---

## Testing

The package ships with an Orchestra Testbench-based test suite:

```bash
composer install
./vendor/bin/phpunit
```

### Testing in your own application

Use `Storage::fake()` and the `fakeImageFile()` helper pattern:

```php
use Illuminate\Support\Facades\Storage;
use IbrahimKaya\ImageMan\ImageManFacade as ImageMan;

public function test_user_can_upload_avatar(): void
{
    Storage::fake('s3');

    $user = User::factory()->create();
    $file = \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg', 200, 200);

    $image = ImageMan::upload($file)->for($user)->collection('avatars')->disk('s3')->save();

    $this->assertNotNull($image);
    $this->assertSame('avatars', $image->collection);
    $this->assertSame('s3', $image->disk);
    Storage::disk('s3')->assertExists($image->directory . '/' . $image->filename);
}
```

---

## Contributing

Pull requests are welcome. Please:

1. Fork the repository and create a branch from `main`.
2. Write tests covering your change.
3. Ensure `./vendor/bin/phpunit` passes with no failures.
4. Follow PSR-12 code style.
5. Submit a pull request with a clear description of the change.

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.
