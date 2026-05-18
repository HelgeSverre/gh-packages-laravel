# Filament Context Sidebar

[![run-tests](https://github.com/skylence-be/filament-context-sidebar/actions/workflows/run-tests.yml/badge.svg)](https://github.com/skylence-be/filament-context-sidebar/actions/workflows/run-tests.yml)

Contextual sidebar navigation for Filament resource pages. Compatible with Filament 4.

## Installation

```bash
composer require skylence/filament-context-sidebar
```

Register the plugin in your Panel provider:

```php
use Skylence\FilamentContextSidebar\FilamentContextSidebarPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentContextSidebarPlugin::make(),
        ]);
}
```

Optionally publish config and views:

```bash
php artisan vendor:publish --tag="filament-context-sidebar-config"
php artisan vendor:publish --tag="filament-context-sidebar-views"
```

## Usage with Resource Pages

1. Define pages in your resource:

```php
use Filament\Resources\Resource;

class UserResource extends Resource
{
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
            'view' => Pages\ViewUser::route('/{record}/view'),
            'settings' => Pages\UserSettings::route('/{record}/settings'),
        ];
    }
}
```

2. Add the sidebar method to your resource:

```php
use Illuminate\Database\Eloquent\Model;
use Skylence\FilamentContextSidebar\ContextSidebar;
use Skylence\FilamentContextSidebar\ContextNavigationItem;

class UserResource extends Resource
{
    public static function sidebar(Model $record): ContextSidebar
    {
        return ContextSidebar::make()
            ->title($record->name)
            ->description($record->email)
            ->navigationItems([
                ContextNavigationItem::make('View')
                    ->icon('heroicon-o-eye')
                    ->url(fn () => static::getUrl('view', ['record' => $record])),
                ContextNavigationItem::make('Edit')
                    ->icon('heroicon-o-pencil')
                    ->url(fn () => static::getUrl('edit', ['record' => $record])),
                ContextNavigationItem::make('Settings')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->url(fn () => static::getUrl('settings', ['record' => $record])),
            ]);
    }
}
```

3. Use the `HasContextSidebar` trait on your pages:

```php
use Filament\Resources\Pages\ViewRecord;
use Skylence\FilamentContextSidebar\Concerns\HasContextSidebar;

class ViewUser extends ViewRecord
{
    use HasContextSidebar;

    protected static string $resource = UserResource::class;
}
```

## Usage with Pages

```php
use Filament\Pages\Page;
use Skylence\FilamentContextSidebar\Concerns\HasContextSidebar;
use Skylence\FilamentContextSidebar\ContextSidebar;
use Skylence\FilamentContextSidebar\ContextNavigationItem;

class Settings extends Page
{
    use HasContextSidebar;

    public static function sidebar(): ContextSidebar
    {
        return ContextSidebar::make()
            ->title('Settings')
            ->navigationItems([
                ContextNavigationItem::make('General')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->url(GeneralSettings::getUrl()),
                ContextNavigationItem::make('Security')
                    ->icon('heroicon-o-shield-check')
                    ->url(SecuritySettings::getUrl()),
            ]);
    }
}
```

## Options

### Layout

```php
ContextSidebar::make()
    ->sidebarNavigation()  // Default - sidebar on the left
    ->topbarNavigation()   // Navigation above content
```

### Navigation Item Options

```php
ContextNavigationItem::make('Label')
    ->icon('heroicon-o-home')
    ->url('/path')
    ->badge('New')
    ->badgeColor('success')
    ->group('Group Name')
    ->sort(1)
    ->visible(fn () => auth()->user()->can('view'))
    ->isActiveWhen(fn () => request()->routeIs('*settings*'))
    ->translateLabel()
```

### Title and Description

```php
ContextSidebar::make()
    ->title('User Settings')
    ->description('user@example.com')
    ->descriptionCopyable()
```

## Configuration

The config file allows you to set the sidebar width at different breakpoints:

```php
// config/filament-context-sidebar.php
return [
    'sidebar_width' => [
        'sm' => 12,  // Full width on small screens
        'md' => 3,
        'lg' => 3,
        'xl' => 3,
        '2xl' => 3,
    ],
];
```

## License

MIT
