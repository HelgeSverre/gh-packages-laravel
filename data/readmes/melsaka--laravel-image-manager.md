# Laravel Image Manager Package

A comprehensive Laravel package for managing polymorphic images with automatic resizing, multiple formats support, and flexible storage options.

## Features

- **Polymorphic Image Relations**: Associate images with any Eloquent model
- **Automatic Image Resizing**: Configure multiple sizes for different use cases
- **Format Conversion**: Convert images to WebP, JPEG, PNG, or keep original format
- **Flexible Storage**: Support for any Laravel filesystem disk
- **Batch Operations**: Store, update, sync, and delete multiple images
- **Easy Configuration**: Simple configuration for different models and image types

## Installation

Install the package via Composer:

```bash
composer require melsaka/laravel-image-manager
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=image-manager-config
```

Publish the migration file: (optional)

```bash
php artisan vendor:publish --tag=image-manager-migrations
```

Run the migration:

```bash
php artisan migrate
```

## Configuration

The configuration file `config/image-manager.php` allows you to customize:

- Storage disk and base path
- Default image format and quality
- Model-specific image types and sizes
- Public/private access settings

### Example Configuration

```php
return [
    'storage_disk' => 'public', // could be r2, aws, etc..
    'base_path' => 'uploads',
    'format' => 'webp',
    'quality' => 90,
];
```

## Important: Storage Link

If you're using the `public` disk (default), don't forget to create the storage link:
```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`, making your images accessible via URL.

## Usage

### 1. Add the Trait to Your Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Melsaka\ImageManager\Traits\HasImages;

class User extends Model
{
    use HasImages;
    
    // Your model code...
}
```

If you want you can always eager load the model images like that (optional):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Melsaka\ImageManager\Traits\HasImages;

class User extends Model
{
    use HasImages;
    
    protected $with = ['images'];
    // Your model code...
}
```

### 2. Configure Image Handling for the Model

**By default, every model that uses the `HasImages` trait automatically supports a `'default'` image type** with predefined sizes. You can start using it immediately without any configuration:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Melsaka\ImageManager\Traits\HasImages;

class Product extends Model
{
    use HasImages;
    
    // No configuration needed! 'default' type is ready to use
}
```

#### Default Configuration

The default `'default'` image type comes with these sizes:
```php
'default' => [
    'sizes' => [
        'small' => ['width' => 300, 'height' => 300, 'mode' => 'cover'],
        'medium' => ['width' => 600, 'height' => 400, 'mode' => 'cover'],
        'large' => ['width' => 1920, 'height' => 1080, 'mode' => 'cover'],
    ],
]
```

### 3. Store Images

```php
// Store a single image
$user = User::find(1);

$image = $user->storeImage($uploadedFile);

$image = $user->storeImage($uploadedFile, 'avatar');

// Store multiple images
$images = $user->storeImages($uploadedFiles, 'gallery');

// Store or update (replaces existing image of same type)
$image = $user->storeOrUpdateImage($uploadedFile, 'avatar');

// get array of all image urls 
$image->getUrls();
```

### 4. Retrieve Images

```php
$avatars = $user->getImages();

// Get all images of a specific type
$avatars = $user->getImages('avatar');

// Get a single image
$avatar = $user->getImage('avatar');

// Get image URLs
$urls = $user->getImageUrls('avatar');
// Returns: ['name' => 'filename.webp', 'original' => 'url', 'small' => 'url', 'medium' => 'url']

// Get specific size URL
$thumbnailUrl = $user->getImageUrl('small', 'avatar');

// Auto-detects (convenient for single models)
$product->getImages('gallery');

// Explicit (forces fresh query even if loaded)
$product->getImages('gallery', false);

// Explicit (forces using loaded data, avoids N+1)
foreach ($products as $product) {
    $product->getImages('gallery', true); // Clear intention
}
```

### 5. Delete Images

```php
// Delete single image by type
$user->deleteImage('avatar');

// Delete all images of a type
$user->deleteImagesOfType('gallery');

// Delete all images
$user->deleteAllImages();
```

### 6. Advanced Operations

```php
// Replace all images of a type
$user->replaceImages($newFiles, 'gallery');

// Sync images (update existing, add new, remove extra)
$user->syncImages($files, 'gallery');

// Update image by ID
$user->updateImageById($uploadedFile, $imageId);
```

### 7. Eager Load Images

```php
// Eager load all user images
User::with('images')->get();

// load user images
$user->load('images');
```

### 8. API Resources

In eloquent api resource you can do something like that:

```php
class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // more code ...
            'image' => $this->when($this->relationLoaded('images'), $this->getImageUrls()),
        ];
    }
}
```

## Customizing Image Types (Optional)

You can customize the default configuration or add additional image types by implementing the `supportedImages()` method:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Melsaka\ImageManager\Traits\HasImages;

class Product extends Model
{
    use HasImages;
    
    /**
     * Define supported image types and their sizes.
     */
    public static function supportedImages(): array
    {
        return [
            // Customize the 'default' type
            'default' => [
                'sizes' => [
                    'small' => [
                        'width' => 200,
                        'height' => 200,
                        'mode' => 'cover',
                    ],
                    'large' => [
                        'width' => 1200,
                        'height' => 800,
                        'mode' => 'scale',
                    ],
                ],
            ],
            // Add additional types
            'thumbnail' => [
                'sizes' => [
                    'small' => [
                        'width' => 150,
                        'height' => 150,
                        'mode' => 'cover',
                    ],
                    'medium' => [
                        'width' => 300,
                        'height' => 300,
                        'mode' => 'cover',
                    ],
                ],
            ],
            'gallery' => [
                'sizes' => [
                    'thumbnail' => [
                        'width' => 200,
                        'height' => 200,
                        'mode' => 'cover',
                    ],
                    'large' => [
                        'width' => 1200,
                        'height' => 800,
                        'mode' => 'scale',
                    ],
                ],
            ],
            'banner' => [
                'sizes' => [
                    'desktop' => [
                        'width' => 1920,
                        'height' => 400,
                        'mode' => 'cover',
                    ],
                    'mobile' => [
                        'width' => 768,
                        'height' => 300,
                        'mode' => 'cover',
                    ],
                ],
            ],
        ];
    }
}
```

### Configuration Structure

- **Image Types** (e.g., `default`, `thumbnail`, `gallery`, `banner`): Define different categories of images for your model
- **Sizes** (e.g., `small`, `medium`, `large`): Define multiple size variations for each image type
- **Dimensions**: Specify `width` and `height` in pixels for each size
- **Resize Mode**: Choose how the image should be processed
- **Background** (optional): For `pad` and `contain` modes, specify a background color

### Resize Modes

The package uses [Intervention Image](http://image.intervention.io/) for image processing. The following modes are supported:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `cover` | Crop and resize to exact dimensions, maintaining aspect ratio | Profile pictures, thumbnails, hero images |
| `coverDown` | Like `cover`, but only shrinks (never enlarges) | Thumbnails where you don't want to upscale small images |
| `scale` | Scale proportionally within dimensions, maintaining aspect ratio | Product images, galleries where full content matters |
| `scaleDown` | Like `scale`, but only shrinks (never enlarges) | Preventing upscaling of small images |
| `resize` | Resize to exact dimensions (may distort if aspect ratio differs) | When exact dimensions are critical |
| `resizeDown` | Like `resize`, but only shrinks (never enlarges) | Fixed dimensions without upscaling |
| `pad` | Resize to fit and add padding to reach exact dimensions | Consistent dimensions with preserved content |
| `contain` | Resize to fit within dimensions and center with padding | Product images on solid backgrounds |

**Background Color:** For `pad` and `contain` modes, you can optionally specify a background color (hex format without `#`):
```php
'medium' => [
    'width' => 600,
    'height' => 400,
    'mode' => 'pad',
    'background' => 'ffffff', // White background (hex without #)
],
```

**Note:** 
- When using `scale`, `scaleDown`, `pad`, or `contain` modes, the resulting image fits within the specified dimensions but may not match them exactly, as the aspect ratio is preserved.
- An **original** size is always stored automatically alongside your configured sizes.

### Best Practices

- Use **descriptive type names** that reflect the image's purpose (e.g., `avatar`, `cover_photo`, `product_image`)
- Define **multiple sizes** to serve optimized images for different contexts (mobile, tablet, desktop)
- Choose `cover` mode for **fixed-dimension containers** where cropping is acceptable (e.g., square avatars, card thumbnails)
- Choose `scale` mode when **preserving the entire image** is important (e.g., product photos, artwork)
- Use `*Down` variants to prevent upscaling of small images
- Use `pad` or `contain` for consistent dimensions without cropping important content

## Environment Variables

You can override configuration values using environment variables:

```env
IMAGE_MANAGER_STORAGE_DISK=s3
IMAGE_MANAGER_BASE_PATH=images
IMAGE_MANAGER_FORMAT=webp
IMAGE_MANAGER_QUALITY=85
```

## Requirements

- PHP ^8.2
- Laravel ^11.0 or ^12.0
- Intervention Image ^3.0

## Credits

- [Mohamed ElSaka](https://github.com/melsaka)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.