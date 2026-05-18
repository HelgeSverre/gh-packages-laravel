# Nova Reusable Blocks

[![Latest Version on Packagist](https://img.shields.io/packagist/v/iamgerwin/nova-reusable-blocks.svg?style=flat-square)](https://packagist.org/packages/iamgerwin/nova-reusable-blocks)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/iamgerwin/nova-reusable-blocks/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/iamgerwin/nova-reusable-blocks/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/iamgerwin/nova-reusable-blocks/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/iamgerwin/nova-reusable-blocks/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/iamgerwin/nova-reusable-blocks.svg?style=flat-square)](https://packagist.org/packages/iamgerwin/nova-reusable-blocks)

A Laravel Nova package that provides reusable section blocks for building dynamic, headless CMS API responses. Perfect for creating flexible page layouts that can be consumed by frontend applications.

> "Because sometimes your CMS needs more blocks than a Minecraft world." 🎮

## Features

- 🎠 **Carousel Banner Block** - Fully-featured carousel with customizable slides, transitions, and interactive elements
- 🦸 **Hero Block** - Dynamic hero sections with image, video, or carousel options
- 📝 **Hero Text Block** - Text-only hero sections for simple headers
- 🖼️ **Gallery Block** - Image galleries with MediaHub support
- 🌆 **Image Divider Block** - Content dividers with images and CTAs
- 📄 **WYSIWYG Block** - Rich text content with flexible editor support
- 🔧 **Extensible Architecture** - Easy to add your own custom blocks
- 📱 **Headless CMS Ready** - Designed for API consumption by frontend frameworks
- 🎨 **Rich Configuration** - Comprehensive options via enums for type safety
- 🖼️ **Media Flexible** - Works with Nova MediaHub or standard Image fields
- ✨ **PHP 8.2+** - Modern PHP with strict types and enums

## Installation

You can install the package via composer:

```bash
composer require iamgerwin/nova-reusable-blocks
```

The package requires:
- PHP 8.2 or higher
- Laravel 10.0, 11.0, or 12.0
- Laravel Nova 4.0 or higher
- `whitecube/nova-flexible-content` package

## Usage

### Basic Usage

In your Nova Resource, use the `Section` class to add flexible content blocks:

```php
use Iamgerwin\NovaReusableBlocks\Section;

public function fields(NovaRequest $request)
{
    return [
        // Other fields...
        
        Section::all('content'), // 'content' is the database column name
        
        // More fields...
    ];
}
```

This will add a flexible content field with all available blocks (currently includes the Carousel Banner block).

### Hide Create Button

If you want to hide the "Add Blocks" button until the resource is created:

```php
Section::all('content', hideCreate: true)
```

### Custom Field Name

Use a different field name for your flexible content:

```php
Section::all('page_data')  // Will store in 'page_data' column
```

## Available Blocks

### Hero Block
A flexible hero component supporting image, video, or carousel backgrounds. Uses MediaHub when available or falls back to Image/URL fields.

### Hero Text Block
A simple hero section with title, subtitle, and description.

### Carousel Banner Block

The Carousel Banner is a feature-rich content block that creates dynamic image carousels with customizable options.

### Features

- **Multiple Slides** - Add unlimited slides with images, titles, descriptions, and CTAs
- **Auto Play** - Configurable auto-play with adjustable speed (1000-10000ms)
- **Transition Effects** - Choose from Slide, Fade, Cube, Coverflow, Flip, or Cards
- **Navigation Controls** - Optional arrows and pagination dots
- **Aspect Ratios** - 16:9 (standard), 21:9 (cinematic), or 3:1 (panoramic)
- **Width Options** - Full width or constrained container
- **Button Customization** - Size, color palette, variant, and target options
- **Content Positioning** - 9-point grid for overlay positioning
- **Accessibility** - Alt text support and keyboard navigation ready

### Configuration Options

#### Carousel Settings

| Option | Type | Default | Range | Description |
|--------|------|---------|-------|-------------|
| Auto Play | Boolean | `true` | - | Enable automatic slide progression |
| Auto Play Speed | Number | `5000ms` | 1000-10000ms | Time between transitions |
| Show Navigation | Boolean | `true` | - | Display navigation arrows |
| Show Dots | Boolean | `true` | - | Display pagination dots |
| Transition Effect | Select | `slide` | 6 options | Animation style |
| Transition Speed | Number | `300ms` | 100-2000ms | Transition duration |
| Pause on Hover | Boolean | `true` | - | Pause on mouse hover |
| Aspect Ratio | Select | `16:9` | 3 options | Carousel dimensions |
| Width | Select | `normal_width` | 2 options | Container width |

#### Slide Settings

Each slide includes:
- **Image** - Background image (MediaHub or standard upload)
- **Title** - Optional headline text
- **Description** - Optional body text
- **Button** - Optional CTA with link
- **Button Target** - `_self` or `_blank`
- **Button Size** - Small or Large
- **Button Color Palette** - Light, Light Text, or Dark
- **Button Variant** - Outline or Underline
- **Content Position** - 9-point positioning grid
- **Alt Text** - Accessibility description

### API Response Structure

The carousel data will be available in your API responses in this format:

```json
{
  "type": "carousel-banner",
  "attributes": {
    "slides": [
      {
        "layout": "carousel-slide",
        "attributes": {
          "slide_image": "https://example.com/image.jpg",
          "title": "Welcome",
          "description": "Discover amazing content",
          "button_text": "Learn More",
          "button_link": "https://example.com/learn",
          "button_target": "_self",
          "button_size": "lg",
          "button_color_palette": "light",
          "button_variant": "outline",
          "content_position": "center",
          "alt_text": "Welcome banner"
        }
      }
    ],
    "banner_title": "Featured Content",
    "banner_description": "Check out our latest updates",
    "auto_play": true,
    "auto_play_speed": 5000,
    "show_navigation": true,
    "show_dots": true,
    "transition_effect": "slide",
    "transition_speed": 300,
    "pause_on_hover": true,
    "aspect_ratio": "16:9",
    "width": "normal_width"
  }
}
```

### Gallery Block
Display multiple images in a gallery format. Supports MediaHub for advanced media management or falls back to text input for image URLs.

### Image Divider Block
A content divider section with an image, title, subtitle, and optional CTA button. Choose between two layout options (image left or right).

### WYSIWYG Block
Rich text content block with flexible editor support. Automatically detects and uses:
- TinymceEditor (if installed)
- Trix (Nova's default rich text editor)
- Textarea (fallback for HTML/Markdown)

Includes optional table of contents display.

## Extending with Custom Blocks

You can easily create your own blocks by extending the `Section` class:

```php
use Iamgerwin\NovaReusableBlocks\Section as BaseSection;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;

class CustomSection extends BaseSection
{
    protected static function getDefaultBlocks(): array
    {
        return [
            ...parent::getDefaultBlocks(), // Include default blocks
            static::heroBlock(),
            static::testimonialBlock(),
        ];
    }
    
    protected static function heroBlock(): array
    {
        return static::registerBlock(
            'Hero Section',
            'hero-section',
            [
                Text::make('Headline', 'headline')->rules('required'),
                Textarea::make('Subheadline', 'subheadline'),
                Text::make('CTA Text', 'cta_text'),
                Text::make('CTA Link', 'cta_link'),
            ]
        );
    }
}
```

Then use your custom class in your Nova Resource:

```php
CustomSection::all('content')
```

## Media Field Compatibility

The package automatically detects if you have `outl1ne/nova-media-hub` installed:

- **With MediaHub**: Uses `MediaHubField` for advanced media management
- **Without MediaHub**: Falls back to Laravel Nova's standard `Image` field

No configuration needed—it just works!

## Frontend Implementation

### Recommended Libraries

- **Swiper.js** - Full-featured with all transition effects
- **Glide.js** - Lightweight alternative
- **Keen Slider** - Performance-focused

### Implementation Tips

1. **Responsive Design** - Adapt aspect ratios for mobile devices
2. **Accessibility** - Implement keyboard navigation and ARIA labels
3. **Performance** - Lazy load images for Core Web Vitals
4. **Touch Support** - Enable swipe gestures on mobile
5. **Fallbacks** - Provide static image fallback for no-JS scenarios

## Testing

```bash
composer test
```

## Code Style

The package uses Laravel Pint for code styling:

```bash
composer format
```

## Static Analysis

Run PHPStan for static analysis:

```bash
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. Please read our [Contributing Guide](CONTRIBUTING.md) for detailed information about:

- Commit message format and examples
- Development workflow
- Coding standards
- Pull request guidelines

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [iamgerwin](https://github.com/iamgerwin)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
