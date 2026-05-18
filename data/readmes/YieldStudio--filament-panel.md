# Filament Panel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/yieldstudio/filament-panel.svg?style=flat-square)](https://packagist.org/packages/yieldstudio/filament-panel)
[![Total Downloads](https://img.shields.io/packagist/dt/yieldstudio/filament-panel.svg?style=flat-square)](https://packagist.org/packages/yieldstudio/filament-panel)

A comprehensive Filament plugin package that provides enhanced UI components, developer tools, and customization options for Filament panels.

## Features

- **YieldPanel Plugin**: Pre-configured panel with customizable colors, fonts, and icons
- **Environment Indicator**: Visual indicator showing the current environment (production, staging, development)
- **Developer Login**: Quick login widget for development environments
- **Copy Action**: Enhanced copy-to-clipboard action with visual feedback
- **Progress Bar Column**: Advanced table column with customizable progress bars and thresholds
- **Phosphor Icons**: Integration with Phosphor icon set

## Installation

You can install the package via composer:

```bash
composer require yieldstudio/filament-panel
```

## Usage

### YieldPanel Plugin

The main plugin that provides a pre-configured panel setup with optional suggested colors, fonts, and icons.

```php
use YieldStudio\FilamentPanel\Plugins\YieldPanel;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(
            YieldPanel::make()
                ->withSuggestedColors()    // Apply YieldStudio color palette
                ->withSuggestedFont()       // Use Inter font
                ->withSuggestedIcons()      // Use Phosphor icons
        );
}
```

**Methods:**
- `withSuggestedColors(bool $condition = true)`: Apply primary (#027BFC) and secondary (#151D53) color palettes
- `withSuggestedFont(bool $condition = true)`: Use Inter as the default font
- `withSuggestedIcons(bool $condition = true)`: Enable Phosphor duotone icons

### Environment Indicator Plugin

Display a visual indicator badge showing the current application environment.

```php
use YieldStudio\FilamentPanel\Plugins\EnvironmentIndicator;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(
            EnvironmentIndicator::make()
                ->visible(fn () => auth()->user()?->hasRole('super_admin'))
                ->showBadge(fn (): bool => !app()->environment('production'))
                ->color(fn (): array => match (app()->environment()) {
                    'production' => Color::Red,
                    'staging' => Color::Orange,
                    'development' => Color::Blue,
                    default => Color::Gray,
                })
                ->badgePosition(PanelsRenderHook::GLOBAL_SEARCH_BEFORE)
        );
}
```

**Methods:**
- `visible(bool|Closure $visible)`: Control when the indicator is visible
- `showBadge(bool|Closure $showBadge)`: Toggle badge display
- `color(array|Closure $color)`: Set badge color based on environment
- `badgePosition(string $position)`: Define where the badge appears (default: before global search)

**Default Behavior:**
- Visible only to super_admin users
- Hidden in production, shown in other environments
- Color-coded: Red (production), Orange (staging), Blue (development)

### Developer Login Plugin

Quick login widget for development environments with one-click user switching.

```php
use YieldStudio\FilamentPanel\Plugins\DevelopperLogin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(
            DevelopperLogin::make()
                ->enabled(fn () => app()->isLocal())
                ->users([
                    'Admin User' => 'admin@example.com',
                    'Regular User' => 'user@example.com',
                ])
                ->modelClass(\App\Models\User::class)
        );
}
```

**Methods:**
- `enabled(bool|Closure $condition)`: Enable/disable the login widget (default: local environment only)
- `users(array|Closure $users)`: Array of user credentials for quick login
- `modelClass(string|Closure $modelClass)`: User model class (default: `\App\Models\User`)

**Security Note:** Only enable in development/local environments!

### Copy Action

Enhanced copy-to-clipboard action with automatic object/array formatting and success notifications.

```php
use YieldStudio\FilamentPanel\Actions\CopyAction;

// In a table
public static function table(Table $table): Table
{
    return $table
        ->columns([
            TextColumn::make('id'),
            TextColumn::make('email'),
        ])
        ->actions([
            CopyAction::make()
                ->copyable(fn ($record) => $record->email),
        ]);
}

// In a form or infolist
CopyAction::make()
    ->copyable(fn ($record) => $record->api_key)
    ->successNotificationTitle('API Key copied!')
```

**Features:**
- Automatically formats objects/arrays as readable text
- Success notification with customizable message
- Tooltip support
- Compatible with tables, forms, and infolists

### Progress Bar Column

Advanced table column displaying progress bars with customizable thresholds and colors.

```php
use YieldStudio\FilamentPanel\Tables\Columns\ProgressBarColumn;

public static function table(Table $table): Table
{
    return $table
        ->columns([
            ProgressBarColumn::make('stock')
                ->maxValue(100)
                ->lowThreshold(20)
                ->dangerColor('rgb(244, 63, 94)')
                ->warningColor('rgb(251, 146, 60)')
                ->successColor('rgb(34, 197, 94)')
                ->dangerLabel(fn ($state) => $state <= 0 ? 'Out of stock' : $state)
                ->warningLabel(fn ($state) => $state . ' - Low stock')
                ->successLabel(fn ($state) => $state . ' - In stock'),
        ]);
}
```

**Methods:**
- `maxValue(int|Closure $value)`: Maximum value for progress calculation
- `lowThreshold(int|Closure $value)`: Threshold for warning state
- `dangerColor(string|array|Closure $color)`: Color when value ≤ 0
- `warningColor(string|array|Closure $color)`: Color when value ≤ threshold
- `successColor(string|array|Closure $color)`: Color when value > threshold
- `dangerLabel(string|Closure $label)`: Label for danger state
- `warningLabel(string|Closure $label)`: Label for warning state
- `successLabel(string|Closure $label)`: Label for success state

**Default Colors:**
- Danger: Red (`rgb(244, 63, 94)`)
- Warning: Orange (`rgb(251, 146, 60)`)
- Success: Green (`rgb(34, 197, 94)`)

## Translations

The package includes translations for English and French. Publish the language files to customize:

```bash
php artisan vendor:publish --tag="yield-panel-translations"
```

## Views

Publish the views for customization:

```bash
php artisan vendor:publish --tag="yield-panel-views"
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="yield-panel-config"
```

## Testing

```bash
composer test
```

Run static analysis:

```bash
composer analyse
```

Run code formatting:

```bash
composer lint
```

Run refactoring:

```bash
composer refactor
```

Run all quality checks:

```bash
composer finalize
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [YieldStudio](https://github.com/yieldstudio)

## License

Proprietary. See [LICENSE.md](LICENSE.md) for more information.
