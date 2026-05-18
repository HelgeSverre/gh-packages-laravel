# Add static responsive images to your Laravel project

[![Latest Version on Packagist](https://img.shields.io/packagist/v/infernalmedia/responsive-image-craft.svg?style=flat-square)](https://packagist.org/packages/infernalmedia/responsive-image-craft)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/infernalmedia/responsive-image-craft/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/infernalmedia/responsive-image-craft/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/infernalmedia/responsive-image-craft/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/infernalmedia/responsive-image-craft/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/infernalmedia/responsive-image-craft.svg?style=flat-square)](https://packagist.org/packages/infernalmedia/responsive-image-craft)

Introducing **ResponsiveImageCraft**, a powerful Laravel package that empowers you to effortlessly generate responsive images in various desired static formats through a simple command line interface. This package equips you with a versatile component to effortlessly display these responsive images on your web pages. Additionally, you'll find a collection of SCSS mixins to effortlessly generate the necessary code when using the images as background-images, ensuring a seamless integration into your projects.

With **ResponsiveImageCraft**, you can now efficiently manage and serve responsive images, enhancing your website's performance and user experience across various devices. Embrace the ease and flexibility of **ResponsiveImageCraft** as it takes care of the heavy lifting for you, delivering stunning visuals without the hassle. So why wait? Elevate your image handling capabilities today with **ResponsiveImageCraft**.

## Installation

You can install the package via composer:

```bash
composer require infernalmedia/responsive-image-craft
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="responsive-image-craft-config"
```

This is the contents of the published config file:

```php
return [
    'use_responsive_images' => env('USE_RESPONSIVE_IMAGES', true),
    'source_disk' => env('RESPONSIVE_IMAGES_SOURCE_DISK', 'public'),
    'target_disk' => env('RESPONSIVE_IMAGES_TARGET_DISK', 's3'),
    'source_directory' => env('RESPONSIVE_IMAGES_SOURCE_DIRECTORY', 'images'),
    'target_directory' => env('RESPONSIVE_IMAGES_TARGET_DIRECTORY', 'images'),
    'sizes' => explode(',', env('RESPONSIVE_IMAGES_SIZES', "320,640,880,1024,1200,1760,2100")),
    'extensions' => [
        "jpg",
        "png",
        "avif",
        "webp",
    ],
    'extensions_filters_rules' => [
        "jpg" => ["png"],
        "png" => ["jpg"],
        "webp" => [],
        "avif" => [],
    ],
    'extensions_to_ignore' => [
        'svg'
    ],
    'filename_to_ignore' => [
        'favicon'
    ],
    'supported_file_extensions' => [
        "jpg",
        "webp",
        "png",
        "avif",
        "gif",
        "tiff",
        "pjpg"
    ],
    'filename_spacer' => '@',
    'container_css_class_name' => 'img-container'
    'scss_path' => resource_path('/scss/utilities'),
];
```

Optionally, you can publish the scss helper. The scss needs `sass:^1.57` to run correctly. 

```bash
php artisan vendor:publish --tag="responsive-image-craft-scss"
```

## Usage

### Images generations

After configuring, the source and targets, run:

```bash
php artisan responsive-image-craft:generate
```

Optionally you can define the source

```bash
php artisan responsive-image-craft:generate --source-disk=public --relative-source-path=images
```

### Responsive Image Component

Here is a basic working configuration

```php
<x-infernal-responsive-img src="full/path/to/generated/image.original-extension"
                            alt="the alternate text"
                            height=1570 {{-- original height --}}
                            width=1216 {{-- original width --}} />
```

Will generate the following html

```html
<div class="img-container the-css-class-to-add-to-the-wrapping-container">
    <picture>
        <!-- load avif images if supported -->
        <source type="image/avif" srcset="url-to-img@320.avif 320w, ....{until 1216w}">
        [...]
        <!-- the img format fallback -->       
        <img src="url-to-img.jpg" srcset="url-to-img@320.jpg 320w,...{until 1216w}" alt="the alternate text" decoding="async" loading="lazy" width="1216" height="1570">
    </picture>
</div>
```

#### The following attributes are available for customization

- `$alt`  
The alternative text for the image. [Learn more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-alt)
- `$skipPictureTag`  
A flag to skip the `picture` tag and only render the `img` tag.
- `$src`  
The image relative path.
- `$height`  
The height of the original image. [Learn more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-height)
- `$width`  
The width of the original image [Learn more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-width).   The width value will define de maximum available image width, following the generated ones. 

- `$asyncDecoding`  
Enable async decoding of the image. This can improve page load performance by decoding images in the background. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding)
- `$lazy`  
Enable lazy loading of the image. When set to true, the image will load only when it's visible in the viewport. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading)
- `$containerClass`  
CSS class to add to the wrapping top `<div>`. You can apply custom styling using this class.
- `$imgAttributes`  
Additional html attributes to be added to the `img` tag. e.g.:`"class=img-class data-attribute=attribute"`

Here is complete example:

```php
<x-infernal-responsive-img src="full/path/to/generated/image.original-extension"
                            alt="the alternate text"
                            container-class="the-css-class-to-add-to-the-wrapping-container" {{-- optional --}}
                            height=1570 {{-- original height --}}
                            width=1216 {{-- original width --}}
                            :async-decoding="true" 
                            :lazy="true" 
                            :skip-picture-tag="false" 
                            img-attributes="attributes to add to img tag" />
```

Will generate the following html

```html
<div class="img-container the-css-class-to-add-to-the-wrapping-container">
    <picture>
        <!-- load avif images if supported -->
        <source type="image/avif" srcset="url-to-img@320.avif 320w, ....{until 1216w}">
        [...]
        <!-- the img format fallback -->       
        <img attributes to add to img tag src="url-to-img.jpg" srcset="url-to-img@320.jpg 320w,...{until 1216w}" alt="the alternate text" decoding="async" loading="lazy" width="1216" height="1570">
    </picture>
</div>
```

### Using responsive image with Sass (and ViteJs)

#### Configuration

Set your vite.config.js to give env variables to your scss

```js
import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import { AssetsScssFile } from './resources/js/AssetsScssFile'

export default defineConfig(async ({ command, mode }) => {
    const env = loadEnv(mode, process.cwd())
    const useResponsiveImages = Boolean(
        JSON.parse(env.VITE_USE_RESPONSIVE_IMAGES.toLowerCase())
    )
    const assetsUrl = useResponsiveImages ? env.VITE_ASSETS_URL : null
    const variables = new Map([
        ['$assetsUrl', assetsUrl],
        ['$filenameSpacer', env.VITE_RESPONSIVE_IMAGES_FILENAME_SPACER],
    ])

    const scss = new AssetsScssFile()
    scss.createSCSSFile(variables)

    return {
        plugins: [
            laravel({
                ...
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: "@use 'assets' as *;",
                },
            },
        },
    }
})
```

#### Responsive Image SCSS Mixins and Styles

The Responsive Image SCSS module provides useful mixins and styles for creating responsive background images and managing media queries. 

##### Mixin usage

   Use the `responsive-background-image-from-existing-css-var` mixin to generate responsive background images from existing CSS vars generated by the laravel facade `ResponsiveImageCraft::getCssVariables()`:

   ```scss
   .example-class {
       @include responsive-background-image-from-existing-css-var(
           $sizes: (480px, 768px, 1024px),
           $extensions: ('webp', 'jpg'),
           $full: 'full'
       );
   }
   ```

   Or use the `responsive-background-image` mixin to generate responsive background images

   ```scss
   .example-class {
       @include responsive-background-image(
           $base-relative-path: "images/example.jpg",
           $extensions: ('webp', 'jpg'),
           $breakpoints: (480px, 768px, 1024px),
           $file-name-spacer: '@'
       );
   }
   ```

Be careful, the extensions list order will define the browser preference.  

Other useful functions are available in `/scss/_assets-url-helper.scss`

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

- [Guillaume Ernst](https://github.com/infernalmedia)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
