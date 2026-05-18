# A VueJS/Inertia TableBuilder package for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/comfycoders/laravel-vue-table-builder.svg?style=flat-square)](https://packagist.org/packages/comfycoders/laravel-vue-table-builder)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/comfycoders/laravel-vue-table-builder/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/comfycoders/laravel-vue-table-builder/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/comfycoders/laravel-vue-table-builder/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/comfycoders/laravel-vue-table-builder/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/comfycoders/laravel-vue-table-builder.svg?style=flat-square)](https://packagist.org/packages/comfycoders/laravel-vue-table-builder)

A powerful and flexible table builder package for Laravel with Vue 3, Inertia.js, and shadcn-vue components. Similar to Laravel Splade tables but built for modern Vue 3 applications with beautiful UI components.

## Installation

You can install the package via composer:

```bash
composer require tranquil-tools/laravel-vue-table-builder
```
Alter you vite.config.ts to add an `@table-builder` alias:
```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [
        // ...
    ],
    resolve: {
        alias: {

            // Add this:

            '@table-builder': path.resolve(__dirname, 'vendor/tranquil-tools/laravel-vue-table-builder/resources/js'),
        },
    },
});
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="vue-table-builder-config"
```

The content of the published config can be viewed [here](./config/vue-table-builder.php).

## Usage

### Backend (Laravel)

Create a table class:

```php
use TranquilTools\TableBuilder\AbstractTable;
use TranquilTools\TableBuilder\TableBuilder;
use App\Models\User;

class UsersTable extends AbstractTable
{
    public function for()
    {
        return User::query();
    }

    public function configure(TableBuilder $table)
    {
        $table
            ->defaultSort('name')
            ->withGlobalSearch(columns: ['name', 'email'])
            ->column('id', 'ID')
            ->column('name', 'Name', sortable: true)
            ->column('email', 'Email', sortable: true)
            ->column('created_at', 'Created', sortable: true)
            ->paginate(25);
    }
}
```

In your controller:

```php
use Inertia\Inertia;

public function index()
{
    return Inertia::render('Users/Index', [
        'table' => \App\Tables\UsersTable::build(),
    ]);
}
```

### Frontend (Vue)

Import the TableBuilder component:

```vue
<script setup lang="ts">
import { TableBuilder } from '@/components'
import type { TableData } from '@/types/table-builder'

defineProps<{
  table: TableData
}>()
</script>

<template>
  <div>
    <h1>Users</h1>
    <TableBuilder :table="table" />
  </div>
</template>
```

### Features

- 🎨 Beautiful UI with shadcn-vue table components
- 🔍 Sortable columns with visual indicators
- 📄 Pagination with Inertia.js optimization
- 🎯 Nested relationship support (e.g., `user.company.name`)
- 🚀 Built with TypeScript for type safety
- ⚡ Optimized navigation with preserve-state and preserve-scroll
- 📱 Fully responsive design

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [ComfyCoders B.V.](https://comfycoders.nl)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
