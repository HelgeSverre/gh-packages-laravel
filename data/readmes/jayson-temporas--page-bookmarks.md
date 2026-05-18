# Page Bookmarks

A simple bookmark management system for Laravel Filament applications. This package provides an intuitive way for users to save, organize, and access bookmarks directly within your Admin panel.

## Features

- 📚 **Smart Bookmark Creation**: Automatically captures the current page URL and title
- 📁 **Folder Organization**: Organize bookmarks into custom folders
- 🔍 **Real-time Search**: Search through your bookmarks with instant filtering
- ⌨️ **Keyboard Shortcuts**: Quick bookmark creation shortcut `Cmd+Shift+B` on Mac or `Ctrl+Shift+B` on Windows/Linux
- 👤 **User-specific**: Each user has their own private bookmarks
- 🎯 **Customizable**: Configurable icons, render hooks, table names

## Screenshots

### Add Bookmark
![Bookmark Manager](assets/add_bookmark.png)

### View Bookmarks
![Bookmark Viewer](assets/view_bookmark.png)

## Requirements

- PHP 8.3+
- Laravel 11+
- Filament 3, 4, and 5

## Installation

**Install the package via Composer:**

### For Filament 3
```bash
composer require jaysontemporas/page-bookmarks:"^1.0"
```

### For Filament 4 
```bash
composer require jaysontemporas/page-bookmarks:"^2.0"
```

### For Filament 5
```bash
composer require jaysontemporas/page-bookmarks:"^3.0"
```

**Publish and run the installation command:**

```bash
php artisan page-bookmarks:install
```

This command will:
- Publish the configuration file
- Publish and run the database migrations
- Publish the assets

## Configuration

### Basic Configuration

The package configuration file is located at `config/page-bookmarks.php`. Here are the main configuration options:

```php
return [
    // Table names (customizable to avoid conflicts)
    'tables' => [
        'bookmarks' => 'bookmarks',
        'bookmark_folders' => 'bookmark_folders',
    ],

    // User model for bookmark associations
    'models' => [
        'user' => \App\Models\User::class,
    ],

    // Icons used throughout the interface
    'icons' => [
        'add_bookmark' => 'heroicon-o-folder-plus',
        'view_bookmarks' => 'heroicon-o-bookmark',
        'bookmark_item' => 'heroicon-o-bookmark',
        'folder' => 'heroicon-o-folder',
        'search' => 'heroicon-o-magnifying-glass',
        'delete' => 'heroicon-o-trash',
        'chevron_down' => 'heroicon-o-chevron-down',
        'empty_state' => 'heroicon-o-bookmark',
    ],

    // Render hook positions in Filament
    'render_hooks' => [
        'add_bookmark' => \Filament\View\PanelsRenderHook::GLOBAL_SEARCH_AFTER,
        'view_bookmarks' => \Filament\View\PanelsRenderHook::GLOBAL_SEARCH_AFTER,
    ],
];
```


This package utilizes Filament's theming system, so you'll need to set up a custom theme to properly style all components.

> [!NOTE] Before proceeding, ensure you have configured a custom theme if you're using Filament Panels. Check the Filament documentation on themes for detailed instructions. This step is required for both the Panels Package and standalone Forms package.

[Filament 3](https://filamentphp.com/docs/3.x/panels/themes)
[Filament 4](https://filamentphp.com/docs/4.x/styling/overview#creating-a-custom-theme)
[Filament 5](https://filamentphp.com/docs/5.x/styling/overview#creating-a-custom-theme)

### Filament 3
To properly compile all the package styles, update your Tailwind configuration by adding the package's view paths:

```js
// In your resources/css/filament/admin/tailwind.config.js
// where admin is the name of your panel
module.exports = {
    content: [
        // Include the package's blade templates
        './vendor/jaysontemporas/page-bookmarks/resources/**/*.blade.php',
        // Your existing paths...
    ],
    // The rest of your Tailwind config
};
```
### Filament 4 and 5
Add the plugin's views to your theme css file.

```css
@source '../../../../vendor/jaysontemporas/page-bookmarks/resources/**/*.blade.php';
```

## Usage

### Adding the HasBookmarks Trait

To enable bookmark functionality for your User model, add the `HasBookmarks` trait:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use JaysonTemporas\PageBookmarks\Traits\HasBookmarks;

class User extends Authenticatable
{
    use HasBookmarks;

    // ... rest of your User model
}
```

## Customization

### Customizing Render Hooks

You can customize where the bookmark components appear in your Filament panel by modifying the `render_hooks` configuration:

```php
'render_hooks' => [
    'add_bookmark' => \Filament\View\PanelsRenderHook::GLOBAL_SEARCH_AFTER,
    'view_bookmarks' => \Filament\View\PanelsRenderHook::GLOBAL_SEARCH_AFTER,
],
```

For a complete list of available render hook options, please refer to the [official Filament documentation](https://filamentphp.com/docs/3.x/support/render-hooks). The documentation includes all available `PanelsRenderHook` constants and their specific use cases.

### Custom Icons

You can customize the icons used throughout the interface by modifying the `icons` configuration:

```php
'icons' => [
    'add_bookmark' => 'heroicon-o-bookmark-square',
    'view_bookmarks' => 'heroicon-o-bookmark',
    // ... other icons
],
```

### Custom Table Names

If you need to avoid table name conflicts, you can customize the table names:

```php
'tables' => [
    'bookmarks' => 'my_custom_bookmarks',
    'bookmark_folders' => 'my_custom_bookmark_folders',
],
```

### Custom User Model

If you have a custom User model, update the configuration:

```php
'models' => [
    'user' => \App\Models\CustomUser::class,
],
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.