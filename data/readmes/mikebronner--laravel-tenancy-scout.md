# laravel-tenacy-scout
Providing scout commands for the Laravel Tenancy package.

## Installation
```sh
composer require genealabs/laravel-tanancy-scout
```

## Usage
Instead of applying `UsesTenantConnection` to your models, apply `SearchableTenantConnection` from this package:
```php
<?php

namespace App;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use GeneaLabs\LaravelTenancyScout\Traits\SearchableTenantConnection;

class User extends Authenticatable
{
    use SearchableTenantConnection;
}
```

#### Based On
Bertrand Son Kintanar, "How to implement Laravel Scout with Tenancy," Medium (https://medium.com/@bkintanar/how-to-implement-laravel-scout-with-tenancy-79cba01ad0b4). Accessed on 11 July 2020.
