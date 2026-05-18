![FreePlaceholder](https://freeplaceholder.com/snippet.png)

# FreePlaceholder for Laravel

Laravel package with Blade components, Blade directives, an Eloquent trait, and helper functions for [FreePlaceholder.com](https://freeplaceholder.com) — the free, open-source placeholder image and avatar service.

> **Note:** All parameters follow [Tailwind CSS naming conventions](https://tailwindcss.com/docs). Use hyphenated keys (e.g. `text-color`, `font-weight`, `border-color`) in options arrays and component attributes.

## Installation

```bash
composer require freeplaceholder/laravel
```

The service provider and facade are auto-discovered via Laravel's package discovery.

### Publish Configuration

```bash
php artisan vendor:publish --tag=freeplaceholder-config
```

This publishes `config/freeplaceholder.php` where you can set the base URL and default options.

## Quick Start

```php
use FreePlaceholder\Facades\FreePlaceholder;

// Generate a placeholder image URL
$url = FreePlaceholder::url(600, 400);
// => "https://freeplaceholder.com/600x400"

// Generate an avatar URL
$avatar = FreePlaceholder::avatarUrl('John Doe');
// => "https://freeplaceholder.com/avatar/John%20Doe"
```

## Facade

The `FreePlaceholder` facade provides two primary methods:

### `FreePlaceholder::url(width, height, options)`

Generates a placeholder image URL.

```php
use FreePlaceholder\Facades\FreePlaceholder;

FreePlaceholder::url(800, 600, [
    'format' => 'png',
    'bg' => '3b82f6',
    'text-color' => 'ffffff',
    'text' => 'Hero Image',
    'text-size' => 32,
    'font-weight' => 'bold',
    'opacity' => 80,
    'grayscale' => false,
    'border' => 2,
    'border-color' => '000000',
    'border-style' => 'dashed',
]);
// => "https://freeplaceholder.com/800x600.png?bg=3b82f6&text-color=ffffff&text=Hero+Image&text-size=32&font-weight=bold&opacity=80&grayscale=false&border=2&border-color=000000"
```

#### Options

| Option        | Type      | Default | Description                                                                 |
| ------------- | --------- | ------- | --------------------------------------------------------------------------- |
| `format`      | `string`  | `"svg"` | Output format: `svg`, `png`, `jpg`, `webp`                                  |
| `bg`          | `string`  | auto    | Background color — hex without `#`                                         |
| `gradient`    | `string`  | —       | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`        | `string`  | —       | Gradient start color — hex without `#`                                     |
| `via`         | `string`  | —       | Gradient middle color — hex without `#`                                    |
| `to`          | `string`  | —       | Gradient end color — hex without `#`                                       |
| `text-color`  | `string`  | auto    | Text color — hex without `#`                                                |
| `text`        | `string`  | auto    | Overlay text                                                                |
| `text-size`   | `int`     | auto    | Font size in pixels                                                         |
| `font-weight` | `string`  | auto    | Tailwind font weight: `thin`, `extralight`, `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`, `black` |
| `opacity`     | `int`     | `100`   | Opacity 0–100                                                               |
| `grayscale`   | `bool`    | `false` | Apply grayscale filter                                                      |
| `border`      | `int`     | `0`     | Border width in pixels                                                     |
| `border-color`| `string`  | —       | Border color — hex without `#`                                             |
| `border-style`| `string`  | `"solid"` | Border style: `solid`, `dashed`, `dotted`, `double`, `none`                |
| `text-align`  | `string`  | —       | Text alignment: `left`, `center`, `right`                                   |
| `text-transform` | `string` | —     | Transform: `uppercase`, `lowercase`, `capitalize`, `none`                  |
| `text-decoration` | `string` | —   | Decoration: `underline`, `overline`, `line-through`, `none`                |
| `letter-spacing` | `string` | —    | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px     |
| `blur`        | `int`     | —       | Gaussian blur in px (0–100)                                                |
| `brightness`  | `int`     | —       | Brightness 0–200 (100 = normal)                                           |
| `contrast`    | `int`     | —       | Contrast 0–200 (100 = normal)                                              |
| `hue-rotate`  | `int`     | —       | Hue rotation 0–360 degrees                                                 |
| `invert`      | `bool`    | —       | Invert colors                                                              |
| `rounded`     | `string \| int` | —  | Border radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, or px |
| `saturate`    | `int`     | —       | Saturation 0–200 (100 = normal)                                            |
| `sepia`       | `bool`    | —       | Sepia tone filter                                                          |

### `FreePlaceholder::avatarUrl(name, options)`

Generates an avatar image URL.

```php
FreePlaceholder::avatarUrl('Jane Smith', [
    'size' => 64,
    'format' => 'webp',
    'bg' => '10b981',
    'text-color' => 'ffffff',
    'font-weight' => 'semibold',
    'opacity' => 90,
    'grayscale' => false,
    'border' => 2,
    'border-color' => '000000',
    'border-style' => 'dashed',
]);
// => "https://freeplaceholder.com/avatar/Jane%20Smith.webp?size=64&bg=10b981&text-color=ffffff&font-weight=semibold&opacity=90&grayscale=false&border=2&border-color=000000"
```

#### Options

| Option        | Type     | Default | Description                                                                 |
| ------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `size`        | `int`    | `128`   | Image size in pixels (1–1024)                                               |
| `format`      | `string` | `"svg"` | Output format: `svg`, `png`, `jpg`, `webp`                                  |
| `bg`          | `string` | auto    | Background color — hex without `#`                                          |
| `gradient`    | `string` | —       | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`        | `string` | —       | Gradient start color — hex without `#`                                      |
| `via`         | `string` | —       | Gradient middle color — hex without `#`                                     |
| `to`          | `string` | —       | Gradient end color — hex without `#`                                        |
| `text-color`  | `string` | auto    | Text color — hex without `#`                                               |
| `font-weight` | `string` | auto    | Tailwind font weight: `thin`, `extralight`, `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`, `black` |
| `opacity`     | `int`    | `100`   | Opacity 0–100                                                               |
| `grayscale`   | `bool`   | `false` | Apply grayscale filter                                                      |
| `border`      | `int`    | `0`     | Border width in pixels                                                     |
| `border-color`| `string` | —       | Border color — hex without `#`                                              |
| `border-style`| `string` | `"solid"` | Border style: `solid`, `dashed`, `dotted`, `double`, `none`               |
| `text-decoration` | `string` | —   | Decoration: `underline`, `overline`, `line-through`, `none`               |
| `letter-spacing` | `string` | —    | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px    |
| `blur`        | `int`    | —       | Gaussian blur in px (0–100)                                                |
| `brightness`  | `int`    | —       | Brightness 0–200 (100 = normal)                                            |
| `contrast`    | `int`    | —       | Contrast 0–200 (100 = normal)                                               |
| `hue-rotate`  | `int`    | —       | Hue rotation 0–360 degrees                                                 |
| `invert`      | `bool`   | —       | Invert colors                                                              |
| `saturate`    | `int`    | —       | Saturation 0–200 (100 = normal)                                            |
| `sepia`       | `bool`   | —       | Sepia tone filter                                                          |

## Blade Components

### `<x-placeholder />`

```blade
<x-placeholder
    :width="800"
    :height="600"
    format="png"
    bg="3b82f6"
    text-color="ffffff"
    text="Hero Image"
    font-weight="bold"
    :opacity="80"
    :grayscale="false"
    :border="2"
    border-color="000000"
    border-style="dashed"
    class="rounded-lg"
    alt="Hero placeholder"
/>
```

#### Attributes

| Attribute     | Type     | Required | Default               | Description                                                                 |
| ------------- | -------- | -------- | --------------------- | --------------------------------------------------------------------------- |
| `width`       | `int`    | No       | `300`                 | Width in pixels                                                             |
| `height`      | `int`    | No       | `300`                 | Height in pixels                                                            |
| `format`      | `string` | No       | `"svg"`               | Output format                                                               |
| `bg`          | `string` | No       | auto                  | Background hex color                                                        |
| `gradient`    | `string` | No       | —                     | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`        | `string` | No       | —                     | Gradient start color — hex without `#`                                      |
| `via`         | `string` | No       | —                     | Gradient middle color — hex without `#`                                     |
| `to`          | `string` | No       | —                     | Gradient end color — hex without `#`                                        |
| `text-color`  | `string` | No       | auto                  | Text hex color                                                              |
| `text`        | `string` | No       | `"{width}×{height}"`   | Overlay text                                                                |
| `text-size`   | `int`    | No       | auto                  | Font size in pixels                                                         |
| `font-weight` | `string` | No       | auto                  | Tailwind font weight: `thin`, `extralight`, `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`, `black` |
| `opacity`     | `int`    | No       | `100`                 | Opacity 0–100                                                               |
| `grayscale`   | `bool`   | No       | `false`               | Apply grayscale filter                                                      |
| `border`      | `int`    | No       | `0`                   | Border width in pixels                                                     |
| `border-color`| `string` | No       | —                     | Border color — hex without `#`                                               |
| `border-style`| `string` | No       | `"solid"`             | Border style: `solid`, `dashed`, `dotted`, `double`, `none`                 |
| `text-align`  | `string` | No       | —                     | Text alignment: `left`, `center`, `right`                                    |
| `text-transform` | `string` | No     | —                     | Transform: `uppercase`, `lowercase`, `capitalize`, `none`                    |
| `text-decoration` | `string` | No   | —                     | Decoration: `underline`, `overline`, `line-through`, `none`                  |
| `letter-spacing` | `string` | No    | —                     | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px     |
| `blur`        | `int`    | No       | —                     | Gaussian blur in px (0–100)                                                  |
| `brightness`  | `int`    | No       | —                     | Brightness 0–200 (100 = normal)                                             |
| `contrast`    | `int`    | No       | —                     | Contrast 0–200 (100 = normal)                                               |
| `hue-rotate`  | `int`    | No       | —                     | Hue rotation 0–360 degrees                                                  |
| `invert`      | `bool`   | No       | —                     | Invert colors                                                               |
| `rounded`     | `string \| int` | No  | —                     | Border radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, or px  |
| `saturate`    | `int`    | No       | —                     | Saturation 0–200 (100 = normal)                                             |
| `sepia`       | `bool`   | No       | —                     | Sepia tone filter                                                           |

All additional HTML attributes (`class`, `id`, `alt`, `style`, etc.) are forwarded to the `<img>` element.

### `<x-avatar />`

```blade
<x-avatar
    name="Jane"
    :size="64"
    format="webp"
    :grayscale="true"
    :border="2"
    border-color="000000"
    border-style="dashed"
    rounded="full"
/>
```

#### Attributes

| Attribute     | Type     | Required | Default  | Description                                                                 |
| ------------- | -------- | -------- | -------- | --------------------------------------------------------------------------- |
| `name`        | `string` | Yes      | —        | Name for initials/color                                                     |
| `size`        | `int`    | No       | `128`    | Size in pixels                                                              |
| `format`      | `string` | No       | `"svg"`  | Output format                                                               |
| `bg`          | `string` | No       | auto     | Background hex color                                                        |
| `gradient`    | `string` | No       | —        | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`        | `string` | No       | —        | Gradient start color — hex without `#`                                      |
| `via`         | `string` | No       | —        | Gradient middle color — hex without `#`                                     |
| `to`          | `string` | No       | —        | Gradient end color — hex without `#`                                        |
| `text-color`  | `string` | No       | auto     | Text hex color                                                              |
| `font-weight` | `string` | No       | auto     | Tailwind font weight                                                        |
| `opacity`     | `int`    | No       | `100`    | Opacity 0–100                                                               |
| `grayscale`   | `bool`   | No       | `false`  | Apply grayscale filter                                                      |
| `border`      | `int`    | No       | `0`      | Border width in pixels                                                     |
| `border-color`| `string` | No       | —        | Border color — hex without `#`                                               |
| `border-style`| `string` | No       | `"solid"` | Border style: `solid`, `dashed`, `dotted`, `double`, `none`                  |
| `rounded`     | `string \| int` | No       | —         | Border radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, or px  |
| `text-decoration` | `string` | No   | —        | Decoration: `underline`, `overline`, `line-through`, `none`                 |
| `letter-spacing` | `string` | No    | —        | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px    |
| `blur`        | `int`    | No       | —        | Gaussian blur in px (0–100)                                                |
| `brightness`  | `int`    | No       | —        | Brightness 0–200 (100 = normal)                                            |
| `contrast`    | `int`    | No       | —        | Contrast 0–200 (100 = normal)                                               |
| `hue-rotate`  | `int`    | No       | —        | Hue rotation 0–360 degrees                                                  |
| `invert`      | `bool`   | No       | —        | Invert colors                                                               |
| `saturate`    | `int`    | No       | —        | Saturation 0–200 (100 = normal)                                             |
| `sepia`       | `bool`   | No       | —        | Sepia tone filter                                                           |

## Blade Directives

### `@placeholder`

Renders a placeholder `<img>` tag inline:

```blade
@placeholder(width: 600, height: 400, text: 'Hello', bg: '3b82f6', textColor: 'ffffff', fontWeight: 'bold', opacity: 80, grayscale: false, border: 2, borderColor: '000000', borderStyle: 'dashed')
```

#### Parameters

| Parameter   | Type     | Default | Description                                                                 |
| ----------- | -------- | ------- | --------------------------------------------------------------------------- |
| `width`     | `int`    | `300`   | Width in pixels                                                             |
| `height`    | `int`    | `300`   | Height in pixels                                                            |
| `format`    | `string` | `"svg"` | Output format                                                               |
| `bg`        | `string` | `""`    | Background hex color                                                        |
| `gradient`  | `string` | `""`    | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`      | `string` | `""`    | Gradient start color — hex without `#`                                      |
| `via`       | `string` | `""`    | Gradient middle color — hex without `#`                                     |
| `to`        | `string` | `""`    | Gradient end color — hex without `#`                                        |
| `textColor` | `string` | `""`    | Text hex color                                                              |
| `text`      | `string` | `""`    | Overlay text                                                                |
| `textSize`  | `int`    | `null`  | Font size in pixels                                                         |
| `fontWeight`| `string` | `""`    | Tailwind font weight                                                        |
| `opacity`   | `int`    | `100`   | Opacity 0–100                                                               |
| `grayscale` | `bool`   | `false` | Apply grayscale filter                                                      |
| `border`    | `int`    | `0`     | Border width in pixels                                                     |
| `borderColor`| `string`| `""`    | Border color — hex without `#`                                              |
| `borderStyle`| `string`| `"solid"` | Border style: `solid`, `dashed`, `dotted`, `double`, `none`               |
| `textAlign` | `string` | `""`    | Text alignment: `left`, `center`, `right`                                  |
| `textTransform` | `string` | `""` | Transform: `uppercase`, `lowercase`, `capitalize`, `none`                  |
| `textDecoration` | `string` | `""` | Decoration: `underline`, `overline`, `line-through`, `none`                |
| `letterSpacing` | `string` | `""` | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px    |
| `blur`      | `int`    | `null`  | Gaussian blur in px (0–100)                                                 |
| `brightness`| `int`    | `null`  | Brightness 0–200 (100 = normal)                                            |
| `contrast`  | `int`    | `null`  | Contrast 0–200 (100 = normal)                                              |
| `hueRotate` | `int`    | `null`  | Hue rotation 0–360 degrees                                                 |
| `invert`    | `bool`   | `false` | Invert colors                                                              |
| `rounded`   | `string \| int` | `""` | Border radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, or px |
| `saturate`  | `int`    | `null`  | Saturation 0–200 (100 = normal)                                            |
| `sepia`     | `bool`   | `false` | Sepia tone filter                                                          |
| `class`     | `string` | `""`    | CSS class                                                                   |
| `alt`       | `string` | `""`    | Alt text                                                                    |
| `id`        | `string` | `""`    | HTML id                                                                     |

### `@avatar`

Renders an avatar `<img>` tag inline:

```blade
@avatar(name: 'John Doe', size: 128, bg: '3b82f6', textColor: 'ffffff', fontWeight: 'semibold')
```

#### Parameters

| Parameter   | Type     | Default | Description                                                                 |
| ----------- | -------- | ------- | --------------------------------------------------------------------------- |
| `name`      | `string` | —       | Name (required)                                                             |
| `size`      | `int`    | `128`   | Size in pixels                                                              |
| `format`    | `string` | `"svg"` | Output format                                                               |
| `bg`        | `string` | `""`    | Background hex color                                                        |
| `gradient`  | `string` | `""`    | Gradient direction: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`, `radial` |
| `from`      | `string` | `""`    | Gradient start color — hex without `#`                                      |
| `via`       | `string` | `""`    | Gradient middle color — hex without `#`                                     |
| `to`        | `string` | `""`    | Gradient end color — hex without `#`                                        |
| `textColor` | `string` | `""`    | Text hex color                                                              |
| `fontWeight`| `string` | `""`    | Tailwind font weight                                                        |
| `opacity`   | `int`    | `100`   | Opacity 0–100                                                               |
| `grayscale` | `bool`   | `false` | Apply grayscale filter                                                      |
| `border`    | `int`    | `0`     | Border width in pixels                                                     |
| `borderColor`| `string`| `""`    | Border color — hex without `#`                                              |
| `borderStyle`| `string`| `"solid"` | Border style: `solid`, `dashed`, `dotted`, `double`, `none`               |
| `textDecoration` | `string` | `""` | Decoration: `underline`, `overline`, `line-through`, `none`                |
| `letterSpacing` | `string` | `""` | Spacing: `tighter`, `tight`, `normal`, `wide`, `wider`, `widest`, or px    |
| `blur`      | `int`    | `null`  | Gaussian blur in px (0–100)                                                |
| `brightness`| `int`    | `null`  | Brightness 0–200 (100 = normal)                                            |
| `contrast`  | `int`    | `null`  | Contrast 0–200 (100 = normal)                                               |
| `hueRotate` | `int`    | `null`  | Hue rotation 0–360 degrees                                                 |
| `invert`    | `bool`   | `false` | Invert colors                                                              |
| `saturate`  | `int`    | `null`  | Saturation 0–200 (100 = normal)                                            |
| `sepia`     | `bool`   | `false` | Sepia tone filter                                                          |
| `class`     | `string` | `""`    | CSS class                                                                   |
| `alt`       | `string` | `""`    | Alt text                                                                    |
| `id`        | `string` | `""`    | HTML id                                                                     |

## Eloquent Trait: `HasPlaceholder`

Add the `HasPlaceholder` trait to any Eloquent model to get `placeholder` and `avatar` accessors:

```php
use FreePlaceholder\Traits\HasPlaceholder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasPlaceholder;
}
```

### Usage

```php
$user = User::find(1); // name = "John Doe"

$user->avatar;
// => "https://freeplaceholder.com/avatar/John%20Doe"

$user->placeholder;
// => "https://freeplaceholder.com/300x300?text=John+Doe"

// With overrides
$user->avatarUrl(['size' => 64, 'format' => 'png']);
$user->placeholderUrl(['width' => 800, 'height' => 600, 'format' => 'webp']);
```

### Customizing the Text Field

By default the trait reads the `name` attribute. Override `placeholderTextField()` to use a different attribute:

```php
class Company extends Model
{
    use HasPlaceholder;

    protected function placeholderTextField(): string
    {
        return 'company_name';
    }
}
```

### Customizing Default Options

Override `placeholderOptions()` to set per-model defaults. All options use hyphenated keys (Tailwind naming):

```php
class User extends Model
{
    use HasPlaceholder;

    protected function placeholderOptions(): array
    {
        return [
            'size' => 64,
            'format' => 'webp',
            'width' => 200,
            'height' => 200,
            'bg' => '3b82f6',
            'text-color' => 'ffffff',
            'font-weight' => 'semibold',
            'opacity' => 90,
            'grayscale' => false,
            'border' => 2,
            'border-color' => '000000',
            'border-style' => 'dashed',
        ];
    }
}
```

### Trait Methods

| Method                         | Returns  | Description                                  |
| ------------------------------ | -------- | -------------------------------------------- |
| `$model->avatar`               | `string` | Avatar URL using the configured text field    |
| `$model->placeholder`          | `string` | Placeholder URL using the configured text field |
| `$model->avatarUrl($overrides)`     | `string` | Avatar URL with option overrides         |
| `$model->placeholderUrl($overrides)` | `string` | Placeholder URL with option overrides   |

### Overridable Methods

| Method                  | Default    | Description                                  |
| ----------------------- | ---------- | -------------------------------------------- |
| `placeholderTextField()` | `'name'`  | Which model attribute provides the text/name |
| `placeholderOptions()`   | `[]`      | Default options merged into every URL call    |

## Helper Functions

Global helper functions are available without any imports. Options use hyphenated keys:

```php
$url = placeholder_url(600, 400, [
    'text' => 'Hello',
    'format' => 'png',
    'bg' => '3b82f6',
    'text-color' => 'ffffff',
    'font-weight' => 'bold',
    'opacity' => 80,
]);
$avatar = avatar_url('John Doe', ['size' => 64, 'font-weight' => 'semibold']);
```

## Configuration

The published `config/freeplaceholder.php` file contains:

```php
return [
    'base_url' => env('FREEPLACEHOLDER_BASE_URL', 'https://freeplaceholder.com'),

    'defaults' => [
        'width' => 300,
        'height' => 300,
        'format' => 'svg',
    ],

    'avatar_defaults' => [
        'size' => 128,
        'format' => 'svg',
    ],
];
```

You can also set the base URL via the `FREEPLACEHOLDER_BASE_URL` environment variable.

## Documentation

Full API documentation and interactive examples are available at [freeplaceholder.com/docs](https://freeplaceholder.com/docs).

## Support

For issues specific to this package, please [open a GitHub issue](https://github.com/freeplaceholder/laravel/issues). For general questions or support, contact [support@twentymileswest.com](mailto:support@twentymileswest.com).

## License

[MIT](./LICENSE)