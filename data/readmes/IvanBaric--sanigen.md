# Sanigen

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ivanbaric/sanigen.svg?style=flat-square)](https://packagist.org/packages/ivanbaric/sanigen)
[![Total Downloads](https://img.shields.io/packagist/dt/ivanbaric/sanigen.svg?style=flat-square)](https://packagist.org/packages/ivanbaric/sanigen)
[![License](https://img.shields.io/packagist/l/ivanbaric/sanigen.svg?style=flat-square)](https://packagist.org/packages/ivanbaric/sanigen)

Sanigen provides declarative sanitization and attribute generators for Eloquent models, so teams can keep input cleanup consistent without repeating pipelines across models.

## Quick Start

```bash
composer require ivanbaric/sanigen
```

Recommended: publish the config file.

```bash
php artisan vendor:publish --provider="IvanBaric\Sanigen\SanigenServiceProvider" --tag="config"
```

Define aliases in `config/sanigen.php`, then reuse the same defaults across your models.

```php
'aliases' => [
    'text' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish',
    'title' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish|lower|ucfirst',
    'ascii' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish|ascii',
    'email' => 'trim|lower|email',
    'url' => 'trim|strip_newlines|strip_scripts|url',
    'slug' => 'trim|lower|slug',
    'decimal' => 'trim|decimal',
    'phone' => 'trim|phone_clean',
];
```

Sanigen gives you two model properties:

- `$sanitize`: applies sanitizer aliases from `config/sanigen.php`
- `$generate`: fills empty attributes on `creating` using generator rules

```php
use Illuminate\Database\Eloquent\Model;
use IvanBaric\Sanigen\Traits\Sanigen;

class Post extends Model
{
    use Sanigen;

    protected $fillable = ['name', 'description', 'email', 'website', 'slug', 'price', 'phone'];

    protected array $sanitize = [
        'name' => 'title',
        'description' => 'text',
        'email' => 'email',
        'website' => 'url',
        'slug' => 'slug',
        'price' => 'decimal',
        'phone' => 'phone',
    ];

    protected array $generate = [
        'slug' => 'slugify:name',
        'uuid' => 'uuid',
        'owner_id' => 'user:id',
        'team_id' => 'user:current_team_id',
    ];
}
```

```php
$post = Post::create([
    'name' => '  <script>alert(1)</script>my FIRST post  ',
    'description' => '<script>alert(1)</script><p>Hello <strong>world</strong></p>',
    'email' => ' USER@EXAMPLE.COM ',
    'website' => 'example.com',
    'price' => ' EUR 1,234.56 ',
    'phone' => ' +1 (123) 456-7890 ',
]);
```

Result:

```php
[
    'uuid' => '550e8400-e29b-41d4-a716-446655440000',
    'owner_id' => 1,
    'team_id' => 42,
    'name' => 'My first post',
    'description' => 'Hello world',
    'email' => 'user@example.com',
    'website' => 'https://example.com',
    'slug' => 'my-first-post',
    'price' => '1234.56',
    'phone' => '+11234567890',
]
```

## Available Aliases

- `text`: generic cleaned text
- `title`: cleaned title-style text
- `ascii`: cleaned ASCII-only text
- `email`: normalized email
- `url`: normalized URL
- `slug`: slug-ready value
- `decimal`: normalized decimal number
- `phone`: normalized phone number

## Class-Level Attributes

Besides model properties, you can use class-level attributes:

```php
use IvanBaric\Sanigen\Attributes\Generate;
use IvanBaric\Sanigen\Attributes\Sanitize;

#[Sanitize([
    'name' => 'title',
    'description' => 'text',
    'email' => 'email',
])]
#[Generate([
    'slug' => 'slugify:name',
    'uuid' => 'uuid',
])]
class Post extends Model
{
    use Sanigen;
}
```

Rule priority is:

1. explicit model properties (`$sanitize`, `$generate`)
2. class-level attributes (`#[Sanitize]`, `#[Generate]`)
3. config defaults (`sanitize_defaults`, `generate_defaults`)

## Full Reference

<details open>
<summary>Built-in sanitizers</summary>

| Sanitizer | Description | Example |
| --- | --- | --- |
| `trim` | Removes whitespace from beginning and end | `" Hello "` -> `"Hello"` |
| `lower` | Converts to lowercase | `"Hello"` -> `"hello"` |
| `upper` | Converts to uppercase | `"hello"` -> `"HELLO"` |
| `ucfirst` | Capitalizes first character | `"hello"` -> `"Hello"` |
| `squish` | Normalizes whitespace to single spaces | `"Hello   World"` -> `"Hello World"` |
| `strip_newlines` | Removes all line breaks | `"Line 1\nLine 2"` -> `"Line 1Line 2"` |
| `strip_html` | Removes all HTML tags | `"<p>Hello</p>"` -> `"Hello"` |
| `strip_tags` | Removes HTML tags except allowed ones | `"<script>Hello</script>"` -> `"Hello"` |
| `strip_scripts` | Removes script-bearing markup, inline JS handlers, dangerous protocols, and suspicious JS patterns | `"<script>alert(1)</script>Hello"` -> `"Hello"` |
| `strip_emoji` | Removes emoji characters | `"Hello 👋 World 🌍"` -> `"Hello  World "` |
| `alpha` | Keeps only letters | `"Hello123"` -> `"Hello"` |
| `alnum` | Keeps only letters and numbers | `"Hello123!"` -> `"Hello123"` |
| `alpha_dash` | Keeps letters, numbers, hyphens, underscores | `"Hello-123_!"` -> `"Hello-123_"` |
| `ascii` | Keeps only ASCII characters | `"cafe ć"` -> `"cafe "` |
| `digits` | Keeps only digits | `"Price: $123.45"` -> `"12345"` |
| `decimal` | Keeps decimal number characters and normalizes separators | `"1,234.56 €"` -> `"1234.56"` |
| `email` | Sanitizes email addresses | `" USER@EXAMPLE.COM "` -> `"user@example.com"` |
| `phone_clean` | Sanitizes phone numbers | `"(123) 456-7890"` -> `"+1234567890"` |
| `url` | Ensures URLs have a protocol | `"example.com"` -> `"https://example.com"` |
| `slug` | Creates a URL-friendly slug | `"Hello World"` -> `"hello-world"` |

</details>

<details open>
<summary>Built-in generators</summary>

| Generator | Purpose | Example |
| --- | --- | --- |
| `uuid` | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| `uuid:v7` | UUID v7 | `018f0f4b-9c3a-7c3e-9d9a-2c3c4b5a6d7e` |
| `uuid:v8` | UUID v8 | `018f0f4b-9c3a-8c3e-9d9a-2c3c4b5a6d7e` |
| `ulid` | ULID | `01J3Z3N6K2Z9N0R2Z7T1W5Y8QG` |
| `autoincrement` | next numeric value | `1` -> `2` -> `3` |
| `unique_string:length` | unique random string | `unique_string:8` -> `A1B2C3D4` |
| `random_string:length` | random string | `random_string:16` -> `aZ2kLm9Qp0xYt1uV` |
| `slugify:field` | unique slug from another field | `slugify:title` -> `my-post-title` |
| `slugify:field,date` | unique slug with date suffix | `slugify:title,date` -> `my-post-title-27-03-2026` |
| `slugify:field,uuid` | unique slug with UUID suffix | `slugify:title,uuid` -> `my-post-title-550e8400-e29b-41d4-a716-446655440000` |
| `carbon:+7 days` | Carbon date from a modifier | `carbon:+7 days` -> `2026-04-03 12:00:00` |
| `user:property` | authenticated user property | `user:id` -> `1`, `user:email` -> `user@example.com` |

</details>

<details>
<summary>Custom sanitizers</summary>

Scaffold a sanitizer class:

```bash
php artisan make:sanitizer Username
php artisan make:sanitizer Admin/TitleClean --force
```

```php
namespace App\Sanitizers;

use IvanBaric\Sanigen\Sanitizers\Contracts\Sanitizer;

class UsernameSanitizer implements Sanitizer
{
    public function apply(string $value): string
    {
        return strtolower(trim($value));
    }
}
```

Register it:

```php
use IvanBaric\Sanigen\Registries\SanitizerRegistry;

SanitizerRegistry::register('username', \App\Sanitizers\UsernameSanitizer::class);
```

Use it:

```php
protected $sanitize = [
    'username' => 'username',
];
```

</details>

<details>
<summary>Custom generators</summary>

Scaffold a generator class:

```bash
php artisan make:generator Slug
php artisan make:generator Content/Slug --force
```

```php
namespace App\Generators;

use IvanBaric\Sanigen\Generators\Contracts\GeneratorContract;

class CouponCodeGenerator implements GeneratorContract
{
    public function generate(string $field, object $model): mixed
    {
        return 'SALE-' . strtoupper(str()->random(8));
    }
}
```

Register it:

```php
use IvanBaric\Sanigen\Registries\GeneratorRegistry;

GeneratorRegistry::register('coupon_code', \App\Generators\CouponCodeGenerator::class);
```

Use it:

```php
protected $generate = [
    'code' => 'coupon_code',
];
```

</details>

## Resanitize Existing Rows

Warning: this command updates existing database records. Run it on a backup-aware deployment path and test it on staging first.

```bash
php artisan sanigen:resanitize "App\Models\Post" --chunk=200
```

## Production Notes

```php
return [
    'enabled' => true,
    'missing_sanitizer' => 'throw',
    'aliases' => [
        'text' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish',
        'title' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish|lower|ucfirst',
        'ascii' => 'strip_html|strip_scripts|strip_emoji|strip_newlines|trim|squish|ascii',
        'email' => 'trim|lower|email',
        'url' => 'trim|strip_newlines|strip_scripts|url',
        'slug' => 'trim|lower|slug',
        'decimal' => 'trim|decimal',
        'phone' => 'trim|phone_clean',
    ],
    'allowed_html_tags' => '<p><strong><em><a><ul><ol><li><br>',
    'encoding' => 'UTF-8',
    'max_strip_scripts_input_length' => 32768,
    'sanitize_defaults' => [],
    'generate_defaults' => [],
];
```

## Spatie Translatable Support

Sanigen works with Spatie Laravel Translatable because translatable attributes are stored as arrays and Sanigen sanitizes each scalar item individually.

## Limitations

Sanigen only runs when data goes through an Eloquent model instance.

## Tests

```bash
composer test
```

## License

MIT. See [LICENSE.md](LICENSE.md).
