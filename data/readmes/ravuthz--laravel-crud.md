# Laravel Crud Trait and Service for API

## Install Package via Composer

```bash
composer require ravuthz/laravel-crud
```


## Usage

### Generate Crud Controller and Test
```bash
php artisan crud --help

# Generate crud model, controller, test, request, resource
php artisan crud:generate Post --test

# Generate only crud controller
php artisan crud:controller Post

# Generate only crud controller test
php artisan crud:controller-test Post
```

### Use by follow sample PostController and PostControllerTest

First create: 

- Create controller model, and migration via `php artisan make:model Post -mc` command
- Create request via `php artisan make:request PostRequest` command
- Create resource via `php artisan make:resource PostResource` command

Then you can use the following sample code to make it as crud controller and test.

```php
// PostController.php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use App\Http\Requests\PostRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostCollection;
use Ravuthz\LaravelCrud\CrudController;

class PostController extends CrudController
{
    protected $model = Post::class;
    protected $resource = PostResource::class;
    // protected $collection = PostCollection::class;
    protected $storeRequest = PostRequest::class;
    protected $updateRequest = PostRequest::class;

    // Override this method to add custom logic before saving
    protected function beforeSave($request, $model, $id = null)
    {
        return $model;
    }

    // Override this method to add custom logic after saving
    protected function afterSave($request, $model, $id = null)
    {
        return $model;
    }

}
```

```php
// PostControllerTest.php
<?php

namespace Tests\Feature\Http\Controllers\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Ravuthz\LaravelCrud\TestCrud;

class PostControllerTest extends TestCrud
{
    use RefreshDatabase;

    protected string $route = 'api/posts';

    protected function setUp(): void
    {
        parent::setUp();
        Passport::actingAs(User::factory()->create());

        Post::create([
            'name' => $this->faker->name(),
            'desc' => $this->faker->sentence(),
        ]);
    }

    protected function requestPayload($id = null): array
    {
        // $time = now()->format('Y-m-d_H:m:s.u');
        // some related data, attachment with some unique value with time here

        return [
            'id' => $id
            // 'name' => $this->faker->name(),
            // 'desc' => $this->faker->sentence(),
        ];
    }
}

```
