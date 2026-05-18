# Laravel AI Try-On

A reusable Laravel Composer package that adds an ecommerce "Try Out" button and modal to product detail pages. Shoppers upload their own photo, the package sends that photo plus the product image to an AI image-editing provider, and the generated virtual try-on preview is displayed in the modal.

The default provider is Google Gemini image generation through the Gemini API. Model names are configuration values, so you can use Nano Banana / Gemini Flash Image variants, newer Gemini image models, OpenAI, Replicate, or your own provider implementation without changing application code.

## Installation

```bash
composer require fahimhossain/laravel-ai-tryon
```

Publish the package files:

```bash
php artisan vendor:publish --tag=ai-tryon-config
php artisan vendor:publish --tag=ai-tryon-assets
php artisan vendor:publish --tag=ai-tryon-migrations
```

Or publish everything at once:

```bash
php artisan ai-tryon:install
php artisan migrate
```

## Environment

```dotenv
AI_TRYON_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
AI_TRYON_DISK=public
QUEUE_CONNECTION=database
AI_TRYON_PREMIUM_URL=https://example.com/upgrade
```

Google currently documents Gemini image generation through `generateContent` with text and inline image parts. Nano Banana model names can change, so keep `GEMINI_IMAGE_MODEL` in your environment or config rather than hardcoding a provider class.

## Blade Usage

Place the component below your product image:

```blade
<x-ai-tryon::button
    :product-id="$product->id"
    :product-image="$product->image_url"
    product-type="shirt"
/>
```

Supported product types are configurable and include `shirt`, `t-shirt`, `pant`, `cap`, `dress`, `shoes`, `accessory`, and `other`.

The component renders a button, upload modal, selected-photo preview, loading state, generated image, and clear error messages. It uses plain JavaScript and CSS published to `public/vendor/ai-tryon`.

## Configuration

Publish `config/ai-tryon.php` and update:

```php
'provider' => env('AI_TRYON_PROVIDER', 'gemini'),

'providers' => [
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    ],
],
```

To add a custom provider, bind your implementation to:

```php
FahimHossain\LaravelAiTryon\Contracts\AiTryOnProviderInterface::class
```

The provider must return a `FahimHossain\LaravelAiTryon\Data\TryOnResult`.

## Usage Limits and Premium CTA

The package tracks usage in `ai_tryon_usages`, not the external provider quota. This is intentional because AI providers do not reliably expose package-level free quota state to your Laravel app.

Limits are checked by authenticated `user_id`, with guest fallback to IP address:

```php
'limits' => [
    'free_generations_per_user' => 5,
    'free_generations_per_ip' => 3,
    'daily_generations_per_user' => 20,
],
```

When a limit is exceeded, the endpoint returns JSON with `code: limit_exceeded` and the configured `premium_url` so the frontend can show an upgrade CTA.

## Queue Setup

Queueing is enabled by default:

```php
'queue' => [
    'enabled' => true,
    'connection' => env('AI_TRYON_QUEUE_CONNECTION', env('QUEUE_CONNECTION', 'database')),
],
```

For the database queue:

```bash
php artisan queue:table
php artisan migrate
php artisan queue:work
```

Set `ai-tryon.queue.enabled` to `false` for synchronous local testing.

## Privacy Notes

The package validates MIME type and max file size, never exposes API keys to the frontend, and uses Laravel CSRF protection on the upload endpoint.

User photos are stored temporarily so queued jobs can process them. By default, uploads are deleted after generation and the stored user-photo path is cleared:

```php
'privacy' => [
    'store_user_uploads' => false,
    'auto_delete_uploads' => true,
    'require_consent' => false,
],
```

Show shoppers a clear consent and accuracy notice. AI try-on previews may be inaccurate and should not be treated as a guaranteed product fit.

## Provider Details

Gemini requests send:

- the configured prompt
- the uploaded shopper photo as inline base64 image data
- the product image as inline base64 image data
- `generationConfig.responseModalities` including image output

Generated images are saved to the configured Laravel storage disk.

OpenAI and Replicate provider classes are included as configurable starting points. Production Replicate models vary by schema, so adjust `providers.replicate.input_keys` or pass custom input options from your application if needed.

## Routes

The package registers:

- `POST /ai-tryon/generate`
- `GET /ai-tryon/generations/{uuid}`

You can change prefix and middleware in config.

## Local Development and Testing

```bash
composer install
vendor/bin/phpunit
```

The tests use Orchestra Testbench and SQLite in memory.

## Packagist Publishing

1. Use your real package name in `composer.json`, for example `fahimhossain/laravel-ai-tryon`.
2. Keep the namespace consistent with your autoload mapping, for example `FahimHossain\\LaravelAiTryon`.
3. Push the repository to GitHub.
4. Create a Packagist package pointing to the GitHub repository.
5. Tag releases with SemVer, for example `v1.0.0`.

## License

MIT.
