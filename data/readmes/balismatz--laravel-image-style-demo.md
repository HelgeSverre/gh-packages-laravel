# Laravel Image Style Demo

This is a demo website built with [Laravel](https://laravel.com) that provides various examples demonstrating how to use the [Laravel Image Style](https://github.com/balismatz/laravel-image-style) package.

The current examples cover only part of the functionality provided by the package. Additional examples may be added in the future.

> [!IMPORTANT]
> The [UI components](https://tailwindcss.com/plus) are designed and developed by the creators of Tailwind CSS.
>
> Images are provided by [Tailwind CSS](https://tailwindcss.com) and [Unsplash](https://unsplash.com).

> [!CAUTION]
> This demo focuses exclusively on showcasing the features of the **Laravel Image Style** package.
> It does not include production concerns such as authentication, authorization,
> caching, testing, security hardening, or performance optimization.

## Installation

Ensure that your machine meets all requirements. If not, install them by following the instructions in the [official documentation](https://laravel.com/docs/12.x/installation).

If you prefer, this demo already includes [Laravel Sail](https://laravel.com/docs/12.x/sail).

1. Clone the repository.
2. Run `composer install`.
3. Copy `.env.example` to `.env` and configure the `.env` file.
4. Run `php artisan key:generate`.
5. Run `php artisan storage:link`.
6. Run `php artisan migrate:fresh --seed`.
7. Run `npm install`.
8. Run `npm run build`.

## Examples

The following examples are used to display styled images in this demo:

### Simple Styled Images

---

#### First Example

A simple example where you can pass the following:

1. The image style class (e.g., [App\ImageStyles\User\Thumbnail::class](app/ImageStyles/User/Thumbnail.php)) or ID (e.g., `user-thumbnail`).
2. The storage path of the original image.
3. The style parameters (e.g., `['text' => 'Sample text']`).
4. A boolean indicating whether the styled image should be recreated on every request.

<br/>

> **Implementation & Usage**
>
> - Blade component: [resources/views/components/styled-image-example/first.blade.php](resources/views/components/styled-image-example/first.blade.php)
> - Blade component class: [app/View/Components/StyledImageExample/First.php](app/View/Components/StyledImageExample/First.php)
> - Used in: [resources/views/components/section/hero.blade.php](resources/views/components/section/hero.blade.php#L29)

<br/>

#### Second Example

An alternative example where, instead of passing the parameters individually, you can pass the styled image information or the URL directly.

In contrast to the first example, this approach allows you to use all the capabilities of the [imageStyle()->imageInformation()](https://github.com/balismatz/laravel-image-style/blob/1.x/src/ImageStyle.php#L62) method.

<br/>

> **Implementation & Usage**
>
> - Blade component: [resources/views/components/styled-image-example/second.blade.php](resources/views/components/styled-image-example/second.blade.php)
> - Blade component class: [app/View/Components/StyledImageExample/Second.php](app/View/Components/StyledImageExample/Second.php)
> - Used in: [resources/views/components/section/hero.blade.php](resources/views/components/section/hero.blade.php#L41)

<br/>

### Responsive Styled Images

---

#### First Example

A simple example where you can pass the following:

1. The image style classes (e.g., [[App\ImageStyles\Section\Banner\Sm::class](app/ImageStyles/Section/Banner/Sm.php), [App\ImageStyles\Section\Banner\Md::class](app/ImageStyles/Section/Banner/Md.php)]) or IDs (e.g., `['section-banner-sm', 'section-banner-md']`), or a mix of classes and IDs, as an array or collection. Each media query (e.g., `['(width >= 640px)', '(width >= 1024px)']`) must be defined as the key for its corresponding image style value.
2. The storage path of the original image.
3. The style parameters (e.g., `['text' => 'Sample text']`).
4. A boolean indicating whether the styled images should be recreated on every request.
5. A fallback image style that will be used when none of the media conditions evaluate to true. If not provided, the first image style in the array or collection will be used as the fallback.

<br/>

> **Implementation & Usage**
>
> - Blade component: [resources/views/components/styled-image-example/responsive/first.blade.php](resources/views/components/styled-image-example/responsive/first.blade.php)
> - Blade component class: [app/View/Components/StyledImageExample/Responsive/First.php](app/View/Components/StyledImageExample/Responsive/First.php)
> - Used in: [resources/views/components/section/banner.blade.php](resources/views/components/section/banner.blade.php#L8)

<br/>

#### Second Example

An alternative example where, instead of passing the parameters individually, you can pass the styled images information or the URLs directly. Each media query must be defined as the key for its corresponding image style value.

In contrast to the first example, you can:

1. Use all the capabilities of the [imageStyle()->imageInformation()](https://github.com/balismatz/laravel-image-style/blob/1.x/src/ImageStyle.php#L62) method.
2. Use a different image per media query (e.g., `image-mobile.jpg` for mobile media queries and `image.jpg` for other media queries).
3. Provide additional formats alongside the default format (see [imageStyle()->imageInformationToWebp()](https://github.com/balismatz/laravel-image-style/blob/1.x/src/ImageStyle.php#L101)). A common use case is to maintain "JPG" images while also providing "WebP" alternatives, allowing support for browsers that do not support "WebP".

<br/>

> **Implementation & Usage**
>
> - Blade component: [resources/views/components/styled-image-example/responsive/second.blade.php](resources/views/components/styled-image-example/responsive/second.blade.php)
> - Blade component class: [app/View/Components/StyledImageExample/Responsive/Second.php](app/View/Components/StyledImageExample/Responsive/Second.php)
> - Used in: [resources/views/components/post/card.blade.php](resources/views/components/post/card.blade.php#L30)

<br/>

> [!NOTE]
> All image styles are located in the [app/ImageStyles](app/ImageStyles) directory.
>
> The image style names and structure used in this demo are generic. You may use any naming convention and structure that best suits your application.

## Contributing

Contributions are welcome. Feel free to open a pull request with additional or alternative examples.
