# Laravel Restful Utils

This package provides utilities for building a restful API for Laravel projects.

This package requires PHP >= 8.0, and supports Laravel 9~13.

## Setup

In order to enable [error wrapping](#error-wrapping) feature, you should update your `app/Exceptions/Handler.php`.
Make `Handler` extends `NycuCsit\LaravelRestfulUtils\Exceptions\Handler` instead of original one.

And we suggest you add `HttpApiException` into the `$dontReport` list:

```php
use NycuCsit\LaravelRestfulUtils\Exceptions\HttpApiException;

protected $dontReport = [
    HttpApiException::class,
];
```

## Exceptions

We suggest throwing exceptions instead of returning a response to indicate the status.

These exceptions help you to give a well-wrapped error response:
* [NycuCsit\LaravelRestfulUtils\Exceptions\HttpApiException](src/Exceptions/HttpApiException.php)
* [NycuCsit\LaravelRestfulUtils\Exceptions\ForbiddenException](src/Exceptions/ForbiddenException.php)

### Error Wrapping

When enabled, error responses are represented like this:

```
{
    "error": {
        "code": "CONFLICT_STATUS",
        "message": "You cannot update this resource because it was locked."
    }
}
```

The `code` should be a string to simply indicate the type of error. The client may use it as error identifier.

The `message` should be a human-readable string to show the reason or what happened. You may provide localized message.

## API Controller

This package provides controllers for you to reduce many duplicated logics. Publish these controllers' base classes to
your app/Http/Controller:

```shell
php artisan vendor:publish --tag=restful-controllers
```

Now, you can use `ApiResourceController` and `ApiNestedResourceController` in app/Http/Controller in your application.
These controllers are designed to integrate with Laravel's built-in features:

* [resource controller](https://laravel.com/docs/master/controllers#resource-controllers) for routing and actions
* [form request](https://laravel.com/docs/master/validation#form-request-validation) for validation
* [policy](https://laravel.com/docs/master/authorization#creating-policies) for authorization
* [api resource](https://laravel.com/docs/master/eloquent-resources) for wrapping your data

So, we suggested you create a resource controller like this:

```shell
php artisan make:restful-controller UserController --model=User --requests
```

or for nested resource:

```shell
php artisan make:restful-controller PhotoController --model=Photo --parent=User --requests
```

Now, you may implement method stubs in your controller.

There are some properties can help you reduce passing arguments:
* `$this->request` the request object
* `$this->query` the query builder
* `$this->model` the model from [route model binding](https://laravel.com/docs/master/routing#route-model-binding)
* `$this->result` the response or resource will be returned
* `$this->parentModel` the parent model from route model binding, only for nested controllers

These properties are defined in [Context](src/Controller/Concerns/Context.php) trait.

**Be careful!**

Because of the [route implicit binding](https://laravel.com/docs/master/routing#implicit-binding), the action methods
(`show()`, `store()`, `update()`, `destroy()`, `index()` if nested resource is used) from the API Controllers cannot get
bindings, so you need write these action methods and call the parent version:

```php
class PhotoController extends ApiResourceController
{

    public function index(Request $request)
    {
        parent::indexAction($request);
    }
    
    public function store(StorePhotoRequest $request)
    {
        parent::storeAction($request);
    }

    public function show(Request $request, Photo $photo)
    {
        parent::showAction($request, $photo);
    }
    
    public function update(UpdatePhotoRequest $request, Photo $photo)
    {
        parent::updateAction($request, $photo);
    }

    public function destroy(Request $request, Photo $photo)
    {
        parent::destroyAction($request, $photo)
    }

    // ...
```

If you use the `make:restful-controller` command, these methods are generated for you.

There are many methods in the box, you can find each action method in [Concerns](src/Controller/Concerns) folder,
extend and override these methods to build something great!

* [`StoreAction`](src/Controller/Concerns/StoreAction.php)
* [`ShowAction`](src/Controller/Concerns/ShowAction.php)
* [`IndexAction`](src/Controller/Concerns/IndexAction.php)
* [`UpdateAction`](src/Controller/Concerns/UpdateAction.php)
* [`DestroyAction`](src/Controller/Concerns/DestroyAction.php)

Nested resource:
* [`IndexAction`](src/Controller/Concerns/Nested/IndexAction.php)
* [`StoreAction`](src/Controller/Concerns/Nested/StoreAction.php)

#### API Resource

For action method `index()` returns a collection of resources, action methods `show()`, `store()`, `update()` returns a single resource.
You may need a transformation layer that sits between your Eloquent models and the JSON responses that are actually returned to your application's users.
So, these methods may return [API Resources](https://laravel.com/docs/11.x/eloquent-resources#main-content) instead of the model.

Class [HasResourceActions](src/Controller/HasResourceActions.php) and [HasNestedResourceActions](src/Controller/HasNestedResourceActions.php) provides
function `constructJsonResource()` and `constructResourceCollection()` to construct resource instance that just wraps the model. 

To use your own resource class, you may use the `make:resource` artisan command:

```shell
php artisan make:resource PhotoResource
```

and override these methods in your controller:

```php
use App\Http\Resources\PhotoResource;

class PhotoController extends ApiResourceController
{
    // ...
    
    public function constructJsonResource($resource): JsonResource
    {
        return new PhotoResource($resource);
    }

    public function constructResourceCollection($resource): ResourceCollection
    {
        return new PhotoResource::collection($resource);
    }
}
```

In most case, simply create a `PhotoResource` and use its `::collection()` method to construct a resource collection.

In addition to generating resources that transform individual models, you may generate resources that are responsible for transforming collections of models.

To use your own collection class, you may use the artisan command to generate a collection:

```shell
php artisan make:resource User --collection
```

and override these methods in your controller:

```php
use App\Http\Resources\PhotoResource;
use App\Http\Resources\PhotoCollection;

class PhotoController extends ApiResourceController
{
    // ...
    
    public function constructJsonResource($resource): JsonResource
    {
        return new PhotoResource($resource);
    }

    public function constructResourceCollection($resource): ResourceCollection
    {
        return new PhotoCollection($resource);
    }
}
```

### Pagination

See: [`Pagination`](src/Controller/Concerns/Pagination.php)

You can add these properties in the controller to override the default value for pagination:

```php
    protected bool $alwaysPaginate = true;
    protected bool $enablePaginate = true;
    protected int $defaultLimit = 20;
    protected int $maxLimit = 100;
```

When the pagination enabled, query params `page` and `limit` may be used in the URL.

### Datetime store in local timezone

Laravel just stores the date in the model by the original hour/time of the date but without preserving the timezone
information.  You may use the custom cast [`LocalDatetime`](src/Casts/LocalDatetime.php) to transform date to local
timezone (`config('app.timezone')`) date for setting model attribute.

Attach `LocalDatetime` to a model attribute:

```php
    // import it
    use NycuCsit\LaravelRestfulUtils\Casts\LocalDatetime;

    // Attach it in the model class
    protected $casts = [
        'my_column' => LocalDatetime::class,
    ];
```

Once you attached `LocalDatetime`, you may assign an ISO 8601 string or a Carbon instance to `my_column` attribute.

If you need immutable instance or a date only (without time) attribute, here are parameters for you:

```php
    protected $casts = [
        'my_column1' => LocalDatetime::class . LocalDatetime::DATE_ONLY,
        'my_column2' => LocalDatetime::class . LocalDatetime::IMMUTABLE,
        'my_column3' => LocalDatetime::class . LocalDatetime::DATE_ONLY_IMMUTABLE,
    ];
```
