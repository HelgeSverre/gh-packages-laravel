# ArtisanPack UI Media Library

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)]()
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.2-blue)]()
[![Laravel Version](https://img.shields.io/badge/laravel-%3E%3D12.0-red)]()

A comprehensive media management package for Laravel applications with support for image processing, folder organization, tagging, and modern image format conversion (WebP/AVIF).

## Features

### Core Features
- 📁 **Hierarchical Folder Organization** - Organize media into nested folders
- 🏷️ **Tag Management** - Tag media items for easy categorization
- 🖼️ **Image Processing** - Automatic thumbnail generation in multiple sizes
- 🚀 **Modern Image Formats** - Automatic conversion to WebP and AVIF
- 📦 **Storage Abstraction** - Support for multiple storage backends via Laravel's filesystem
- 🎬 **Video Support** - Video thumbnail extraction using FFmpeg (optional)
- 🔍 **Advanced Search & Filtering** - Search by name, filter by type, folder, or tag
- 🎯 **Drag & Drop Upload** - Modern upload interface with progress tracking
- 🖱️ **Media Modal Component** - Single/multi-select modal for choosing media with context support
- 🔐 **Permission-based Access Control** - Granular capability-based permissions
- 🎨 **Publishable Views** - Customize all Blade views to match your design
- 🧪 **Comprehensive Test Coverage** - Over 500 tests with 90%+ coverage

### New in v1.1
- ⚡ **Livewire 4 Streaming Uploads** - Real-time upload progress with `wire:stream` (automatic fallback for Livewire 3)
- 📊 **Media Statistics Dashboard** - KPI cards with sparklines showing upload trends, storage usage, and type distribution
- 📤 **Table Export** - Export media library data to CSV, XLSX, or PDF formats
- 🪟 **Glass Effects** - Modern glassmorphism UI with customizable blur and transparency
- 🧩 **Visual Editor Integration** - MediaPicker component for CMS visual editors with block content helpers
- ⌨️ **Keyboard Navigation** - Full keyboard support for media selection (arrow keys, Enter, Escape)
- 🕐 **Recently Used Media** - Quick access to recently selected media items
- ⚙️ **Feature Flags** - Granular control over features via configuration

## Requirements

- PHP 8.2 or higher
- Laravel 12.0 or higher
- Intervention Image 3.0 for image processing
- FFmpeg (optional, for video thumbnail extraction)

## Installation

Install via Composer:

```bash
composer require artisanpack-ui/media-library
```

## Quick Start

```php
// Upload media
$media = apUploadMedia($file, [
    'title' => 'My Image',
    'alt_text' => 'Alt text for accessibility',
    'folder_id' => 1,
]);

// Get media URL
$url = apGetMediaUrl($mediaId, 'thumbnail');

// Display image
$media = apGetMedia($mediaId);
echo $media->displayImage('large', ['class' => 'img-fluid']);
```

## What's New in v1.1

### Livewire 4 Streaming Uploads
Real-time upload progress with automatic Livewire 3 fallback:

```blade
<livewire:media-upload-zone wire:stream="uploadProgress" />
```

### Visual Editor Integration
Embed the MediaPicker in your CMS visual editor:

```blade
<livewire:media-picker
    context="featured-image"
    :allowed-types="['image']"
    :multi-select="false"
/>
```

### Media Statistics Dashboard
Display KPI cards with sparklines:

```blade
<livewire:media-statistics
    :show-sparklines="true"
    :sparkline-days="30"
/>
```

### Table Export
Export your media library to various formats:

```blade
<x-artisanpack-table-export
    :formats="['csv', 'xlsx', 'pdf']"
    filename="media-export"
/>
```

## Documentation

📚 **[Complete Documentation](docs/home.md)**

### Getting Started
- **[Quick Start](docs/getting-started.md)** - Get up and running quickly
- **[Installation](docs/installation/installation.md)** - Detailed installation instructions
- **[Configuration](docs/installation/configuration.md)** - All configuration options
- **[Upgrading to v1.1](docs/upgrading.md)** - Migration guide from v1.0.x

### Usage
- **[Helper Functions](docs/usage/helper-functions.md)** - Common usage patterns
- **[Working with Models](docs/usage/models.md)** - Advanced model usage
- **[Livewire Components](docs/usage/livewire-components.md)** - UI component guide
- **[Streaming Uploads](docs/usage/streaming-uploads.md)** - Livewire 4 real-time upload progress
- **[Table Export](docs/usage/table-export.md)** - Export media data to CSV/XLSX/PDF

### Visual Editor Integration
- **[MediaPicker Component](docs/visual-editor/media-picker.md)** - Visual editor media selection
- **[Block Content Helpers](docs/visual-editor/block-helpers.md)** - Block content integration
- **[Integration Examples](docs/visual-editor/examples.md)** - Complete integration examples

### Dashboard & Statistics
- **[Media Statistics](docs/dashboard/statistics.md)** - KPI cards and sparklines
- **[Glass Effects](docs/dashboard/glass-effects.md)** - Glassmorphism UI customization

### API & Integration
- **[API Reference](docs/api/endpoints.md)** - Complete API documentation
- **[CMS Integration](docs/integration/cms-module.md)** - Digital Shopfront CMS setup
- **[Permissions](docs/integration/permissions.md)** - Access control guide
- **[Customization](docs/integration/customization.md)** - Customization options

### Reference
- **[Troubleshooting](docs/reference/troubleshooting.md)** - Common issues and solutions
- **[FAQ](docs/reference/faq.md)** - Frequently asked questions
- **[Changelog](CHANGELOG.md)** - Version history

## Testing

Run the test suite:

```bash
composer test
```

## Contributing

Contributions are welcome! Please ensure all tests pass and code follows ArtisanPack UI Code Standards.

## Security

If you discover a security vulnerability, please send an email to security@artisanpack.com.

## Credits

- [Jacob Martella](https://github.com/jacobmartella)
- Intervention Image for image processing
- PHP-FFMpeg for video processing

## License

This package is proprietary software developed by ArtisanPack UI.

