# Filament Mega Menu

A mega menu sidebar plugin for Filament 4.

## Installation

```bash
composer require skylence/filament-mega-menu
```

## Usage

Add the plugin to your Filament panel provider:

```php
use Skylence\FilamentMegaMenu\MegaMenuPlugin;
use Skylence\FilamentMegaMenu\MegaMenuItem;
use Skylence\FilamentMegaMenu\MegaMenuColumn;
use Skylence\FilamentMegaMenu\MegaMenuLink;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            MegaMenuPlugin::make()
                ->logoIcon('heroicon-o-cube')
                ->logoUrl('/')
                ->panelWidth(900)
                ->menuItems([
                    MegaMenuItem::make('dashboard')
                        ->label('Dashboard')
                        ->icon('heroicon-o-home')
                        ->url('/dashboard'),

                    MegaMenuItem::make('sales')
                        ->label('Sales')
                        ->icon('heroicon-o-shopping-cart')
                        ->columns([
                            MegaMenuColumn::make('Orders')
                                ->links([
                                    MegaMenuLink::make('All Orders')
                                        ->url('/orders')
                                        ->icon('heroicon-o-document-text'),
                                    MegaMenuLink::make('Create Order')
                                        ->url('/orders/create'),
                                ]),
                            MegaMenuColumn::make('Invoices')
                                ->links([
                                    MegaMenuLink::make('All Invoices')
                                        ->url('/invoices'),
                                ]),
                        ]),
                ]),
        ]);
}
```

## Configuration

### Menu Items

Menu items can be direct links or expandable panels with columns:

```php
// Direct link
MegaMenuItem::make('dashboard')
    ->label('Dashboard')
    ->icon('heroicon-o-home')
    ->url('/dashboard')

// Resource link
MegaMenuItem::make('users')
    ->label('Users')
    ->icon('heroicon-o-users')
    ->resource(UserResource::class)

// Panel with columns
MegaMenuItem::make('sales')
    ->label('Sales')
    ->icon('heroicon-o-shopping-cart')
    ->columns([...])
    ->sort(10)
    ->visible(fn () => auth()->user()->can('view_sales'))
```

### Columns

Columns group related links within a menu panel:

```php
MegaMenuColumn::make('Orders')
    ->links([...])
    ->visible(fn () => auth()->user()->can('view_orders'))
```

### Links

Links are the individual navigation items:

```php
MegaMenuLink::make('All Orders')
    ->url('/orders')
    ->icon('heroicon-o-document-text')
    ->badge('5', 'bg-red-100 text-red-800')
    ->visible(fn () => auth()->user()->can('view_orders'))
    ->disabled(fn () => ! Feature::active('orders'))
    ->isActiveWhen(fn () => request()->routeIs('orders.*'))
```

## Styling

The sidebar uses Tailwind CSS classes. To customize the appearance, you can publish the views:

```bash
php artisan vendor:publish --tag=filament-mega-menu-views
```

## Requirements

- PHP 8.2+
- Laravel 11+
- Filament 4.0+

## License

MIT
