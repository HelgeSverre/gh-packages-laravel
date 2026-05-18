# 📝 Laravel Model History Package

A Laravel package that allows you to track changes to your Eloquent models (history) in an opt-in fashion. The package provides extensibility, so you can store changes in your preferred storage system.

## ✨ Features

- **Opt-in tracking**: Models choose to track changes by using a trait
- **Tracks creation and updates**: Captures both model creation and modification events
- **Extensibility**: Use the default Eloquent implementation or create your own
- **Configurable**: Configuration available for additional control

## 📦 Installation

You can install the package via composer:

```bash
composer require patoui/model-history
```

Optionally, you can publish the config file with:

```bash
php artisan vendor:publish --tag="model-history-config"
```

Optionally, you can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="model-history-migrations"
php artisan migrate
```

You can publish both config and migrations at once with:

```bash
php artisan vendor:publish --provider="Patoui\ModelHistory\ModelHistoryServiceProvider"
```

## ⚙️ Configuration

After publishing the config file, you can customize the package behavior by editing `config/model-history.php`.

### 🎯 Customizing the model history

You can customize which model is used for storing changes:

```php
'model' => \App\Models\ModelHistory::class,
```

### 🚫 Customizing Excluded Properties

You can customize which properties are excluded from the model history by modifying the `exclude_properties` array in your published config file. For example, if you want to also exclude `password` fields and any `_token` fields:

```php
'exclude_properties' => [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
    'password',
    'remember_token',
    '_token',
],
```

#### 🔧 Model configuration

You may add an additional property to the model to override the default configuration of excluded properties
```php
protected array $modelHistoryExcludedProperties = ['password'];
```

## 🚀 Usage

### 📚 Basic Usage

To start tracking changes for a model, simply add the `TrackModelHistory` trait and the `TrackModelHistoryContract` interface:

```php
use Illuminate\Database\Eloquent\Model;
use Patoui\ModelHistory\Contracts\TrackModelHistoryContract;
use Patoui\ModelHistory\Traits\TrackModelHistory;

class User extends Model implements TrackModelHistoryContract
{
    use TrackModelHistory;
}
```

Now any changes to this model will be automatically tracked:

```php
// Creation is tracked
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com'
]);

// Updates are tracked
$user->update(['name' => 'Jane Doe']);
```

## 🗄️ Using non-Eloquent storage

This package provides a `ModelHistoryRepositoryContract` so you may implement your own repository. Once implemented you can simply override the registered singleton in your app service provider

```php
$this->app->singleton(ModelHistoryRepositoryContract::class, MyNewChangeRepository::class);
```

### 🏠 Using ClickHouse

Here's an example using ClickHouse with the Laravel ClickHouse package.

First, install the Laravel ClickHouse package:

```bash
composer require glushkovds/phpclickhouse-laravel
```

Complete the setup from the package.

Create a migration for the `changes` table:

```php
<?php

declare(strict_types=1);

use PhpClickHouseLaravel\RawColumn;
use PhpClickHouseLaravel\Migration;
use PhpClickHouseSchemaBuilder\Tables\MergeTree;

return new class extends Migration
{
    public function up(): void
    {
        static::createMergeTree('model_histories', fn (MergeTree $table) => $table
            ->columns([
                $table->uuid('id')->default(new RawColumn('generateUUIDv4()')),
                $table->string('model_type'),
                $table->string('model_id'),
                $table->string('old'),
                $table->string('new'),
                $table->uInt64('auth_id'),
                $table->datetime('created_at', 3),
            ])->orderBy('created_at')
        );
    }

    public function down(): void
    {
        static::write('DROP TABLE model_histories');
    }
};
```

Create a ClickHouse model for the model history:

```php
<?php

declare(strict_types=1);

namespace App\Models;

use PhpClickHouseLaravel\BaseModel;

class ModelHistory extends BaseModel
{
    protected $casts = [
        'old' => 'array',
        'new' => 'array',
    ];
}
```

Now publish the config

```
php artisan vendor:publish --tag="model-history-config"
```

Now update the `model` with your own

```
'model' => \App\Models\ModelHistory::class,
```

## 🧪 Testing

```bash
composer test
```

## 📋 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## 👥 Credits

- [Patrique Ouimet](https://github.com/patoui)
- [All Contributors](../../contributors)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.