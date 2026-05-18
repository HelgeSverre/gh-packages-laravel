# Laravel Refine

Laravel Refine is a package that provides elegant and efficient query filtering and sorting for Laravel applications.

## Installation

You can install the package via Composer:

```bash
composer require refinephp/laravel-refine
```

```bash
php artisan vendor:publish --tag=laravel-refine
```

## Basic Usage

### Filtering

To add filtering capabilities to your model, you can simply use the `Filterable` trait in your model:

```php
use Refinephp\LaravelRefine\Traits\Filterable;

class User extends Model
{
    use Filterable;
}
```

Following that, you can use the `filter` method to filter your query results in your controller:

```php
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        return User::filter()->get();
    }
}
```

From your request, you can pass the filter parameters as query string parameters. For example:

```http
GET /users?filters[name][$eq]=John&filters[age][$eq]=30
```
