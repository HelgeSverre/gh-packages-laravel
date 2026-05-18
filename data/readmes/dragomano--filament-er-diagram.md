# Filament ER Diagram

![PHP](https://img.shields.io/badge/PHP-^8.2-blue.svg?style=flat)
[![Coverage Status](https://coveralls.io/repos/github/dragomano/filament-er-diagram/badge.svg?branch=main)](https://coveralls.io/github/dragomano/filament-er-diagram?branch=main)

A Filament 5 plugin that generates a live, interactive ER diagram directly inside your admin panel.
It auto-discovers all Eloquent models in a given directory, reads their database columns via `Schema`, detects relationships via Reflection, and renders an interactive force-directed graph powered by D3.js.

---

<img width="1976" height="1126" alt="Image" src="https://github.com/user-attachments/assets/4b095a40-21a0-4c92-9d0d-98b2e18c1f36" />

## Features

- 🔍 Auto-discovers Eloquent models — no configuration needed for basic use
- 🔗 Detects `hasMany`, `hasOne`, `belongsTo`, `belongsToMany`, `morphMany`, `morphOne` and `Through` variants
- 🏷️ Shows table name, column names, types, PK and FK badges
- 🖱️ Draggable nodes, pan & zoom, click-to-highlight connected models
- 🔎 Real-time model search
- 💾 One-click export to SVG or PNG
- 🌙 Full dark mode support
- ⚙️ Fully configurable via fluent plugin API

---

## Installation

```bash
composer require bugo/filament-er-diagram
```

> **Requires a custom Filament theme.** Add the plugin's views to your theme's CSS source:
> ```css
> @source '../../../../vendor/bugo/filament-er-diagram/resources/**/*.blade.php';
> ```

Publish the config (optional):

```bash
php artisan vendor:publish --tag="filament-er-diagram-config"
```

Build the JS assets:

```bash
php artisan filament:assets
```

---

## Usage

Register the plugin in your `AdminPanelProvider`:

```php
use Bugo\FilamentErDiagram\ErDiagramPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            ErDiagramPlugin::make(),
        ]);
}
```

The panel now has an **ER Diagram** page under the *Tools* navigation group.

### Customisation

```php
ErDiagramPlugin::make()
    ->modelsPath('app/Domain/Models')          // custom directory
    ->excludeModels([PersonalAccessToken::class])
    ->withoutColumns()                          // hide column details
    ->withoutRelationshipLabels()               // hide edge labels
    ->navigationGroup('Developer')
    ->navigationSort(10)
    ->navigationIcon('heroicon-o-table-cells'),
```

### Artisan command

```bash
# Print a table summary
php artisan er-diagram:generate --path=app/Models

# Print clean JSON to stdout
php artisan er-diagram:generate --format=json --path=app/Models

# Save JSON to file
php artisan er-diagram:generate --format=json --output=er-diagram.json

# Exclude specific models
php artisan er-diagram:generate --exclude=App\\Models\\PersonalAccessToken
```
