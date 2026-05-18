# Sidebar Manager for Laravel

A flexible, dynamic sidebar management package for Laravel applications. This package allows you to define, manipulate, and render your sidebar navigation entirely through code or configuration.

## Features

- **Fluent API**: Expressive and easy registration of menu items.
- **Facade Support**: Use the `Sidebar` facade for clean, static-like access.
- **Config Driven**: Define your core sidebar structure in `config/sidebar.php`.
- **Dynamic Manipulation**: Add or modify categories and items at runtime.
- **Permission Based**: Built-in support for Laravel's Gate/Permission system.
- **Blade Component**: Clean rendering using a single `<x-sidebar-manager-nav />` component.
- **Badges**: Support for static or dynamic (callable) badges.
- **Active State Detection**: Automatic highlighting of active menu items.

## Installation

You can install the package via composer:

```bash
composer require tasmir/sidebar-manager
```

Publish the config file (optional):
```bash
php artisan vendor:publish --tag="config"
```

## Basic Usage

### 1. Rendering the Sidebar
Place the Blade component in your layout:

```blade
<x-sidebar-manager-nav />
```

### 2. Static Configuration
You can define your menu in `config/sidebar.php`. You can also remove default categories or specific items:

```php
return [
    'menu' => [
        'marketing' => [
            'category' => 'Marketing',
            'order' => 50,
            'items' => [
                'campaigns' => [
                    'label' => 'Campaigns',
                    'route' => 'admin.marketing.campaigns',
                    'icon' => '<svg>...</svg>',
                    'permission' => 'campaigns_list',
                ],
            ],
        ],
    ],
    
    // Remove default items or categories
    'remove' => [
        'dashboard', // Removes the entire dashboard category
        'system' => ['activity'], // Removes only the 'activity' item from 'system'
    ],
];
```

### 3. Fluent API (via Facade)
You can manipulate the sidebar from anywhere (e.g., controllers, closures, or providers) using the `Sidebar` facade:

```php
use Sidebar;

// Add a category
Sidebar::category('settings', [
    'category' => 'Settings',
    'order' => 100,
]);

// Add an item fluently
Sidebar::item('settings', 'profile', [
    'label' => 'My Profile',
    'route' => 'admin.profile.edit',
    'icon' => '<svg>...</svg>',
]);

// Extending an existing group from another module
Sidebar::item('marketing', 'newsletter', [
    'label' => 'Newsletter',
    'route' => 'admin.marketing.newsletter',
    'icon' => '<svg>...</svg>',
    'order' => 10, // Items will be sorted by this order
]);

// Remove an item
Sidebar::removeItem('system', 'activity');

// Remove an entire category
Sidebar::removeCategory('dashboard');
```

### 4. Blade Directives
You can also manage the sidebar directly from your Blade templates for view-specific adjustments:

```blade
{{-- Add a category --}}
@addSidebarCategory('reports', ['category' => 'Reports', 'order' => 60])

{{-- Add an item to a category --}}
@addSidebarItem('reports', 'sales', [
    'label' => 'Sales Report',
    'route' => 'admin.reports.sales',
    'icon' => '<svg>...</svg>'
])

{{-- Remove items or categories --}}
@removeSidebarItem('system', 'activity')
@removeSidebarCategory('dashboard')

{{-- Finally, render the sidebar --}}
<x-sidebar-manager-nav />
```

## Menu Item Configuration

Each item accepts a configuration array:

| Key | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Display text. |
| `route` | `string` | Laravel route name. |
| `url` | `string` | Fallback URL. |
| `params`| `array` | Route parameters. |
| `icon`  | `string` | Raw HTML/SVG for the icon. |
| `active`| `bool`   | Active state logic. |
| `permission`| `string` | Required permission. |
| `badge` | `int\|Closure` | Static number or closure. |
| `order` | `int` | Sort position. |

## Contributing
Contributions are welcome! If you have any ideas, bug fixes, or improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/tasmir/sidebar-manager).

---
Developed by [Tasmir](https://github.com/tasmir)

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.
