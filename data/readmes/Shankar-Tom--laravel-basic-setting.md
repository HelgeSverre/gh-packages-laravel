# Laravel Basic Setting

A collection of useful traits, middleware, and rules to speed up Laravel development. This package provides helpers for API responses, searching Eloquent models (including relationships), safe Livewire calls, transaction-handling middleware, and a custom phone validation rule.

## Features

- **ApiResponse Trait**: Standardized JSON responses for success, error, validation errors, and internal server errors.
- **CanSearch Trait**: Easily add search and relation-search scopes to your Eloquent models.
- **LivewireSafeCallTrait**: Wrap Livewire actions in database transactions with error reporting.
- **HandleWithTransaction Middleware**: Automatically wraps HTTP requests in a DB transaction and handles exceptions gracefully.
- **ValidPhone Rule**: Validate phone numbers with a customizable regex.

## Installation

1. Install via Composer:
    ```bash
    composer require shankar/laravel-basic-setting
    ```
2. (Optional) Publish the middleware to your app:
    ```bash
    php artisan vendor:publish --tag=middleware
    ```

## Usage

### ApiResponse Trait
Use in your controllers to standardize API responses:
```php
use Shankar\LaravelBasicSetting\Traits\ApiResponse;

class ExampleController extends Controller {
    use ApiResponse;
    // ...

    public function exampleAction()
    {
        return $this->successResponse(data: 'Example data');
    }
    public function exampleErrorAction()
    {
        return $this->errorResponse(message: 'Example error');
    }

    public function exampleValidationErrorResponse()
    {
        return $this->validationErrorResponse(errors: 'Example validation error');
    }

    public function exampleInternalErrorResponse()
    {
        return $this->internalServerErrorResponse(exception: 'Example internal server error');
    }
}
```

### CanSearch Trait
Add to your Eloquent models for search functionality:
```php
use Shankar\LaravelBasicSetting\Traits\CanSearch;

class Post extends Model {
    use CanSearch;
}

// Usage:
Post::search('keyword')->get();
Post::searchRelation('keyword', ['user' => ['name', 'email']])->get();

```

### Lockable Trait
Use in your Eloquent models to add a simple lock/unlock feature:

```php
use Shankar\LaravelBasicSetting\Traits\Lockable;

class Post extends Model {
    use Lockable;
}
// In your controller

public function editPost(Post $post)
{
    $post->acquireLock();

    // your code 
}

public function updatePost(Post $post,Request $request)
{
    // your code for update
    $post->save();
    $post->releaseLock();
}

```


### LivewireSafeDBCallTrait
Use in Livewire components to safely wrap actions in transactions:
```php
use Shankar\LaravelBasicSetting\Traits\LivewireSafeDBCall;

class ExampleComponent extends Component {
    use LivewireSafeDBCall;
    // ...

    public function exampleAction()
    {
        $this->safeCall(function () {
            // Your code here
        });
    }
}

// Usage in Blade:
<script>
    window.addEventListener('livewire-error', event => {
        alert(event.detail.message);
    });
    
</script>


```

### LivewireHandleResetTrait
Use in Livewire components to reset properties:

```php
use Shankar\LaravelBasicSetting\Traits\LivewireHandleReset;
use Shankar\LaravelBasicSetting\Attributes\Unresetable;

class ExampleComponent extends Component {
    use LivewireHandleReset;
    // ...  
    #[Unresetable]
    public $property1;
    public $property2;
    
    public function mount()
    {
        $this->property1 = 'value1';
        $this->property2 = 'value2';
    }

    public function exampleAction()
    {
        $this->reset();  // reset only property2
    }
}
```

### LivewireHandleFormTrait
Use in Livewire components to handle form submissions:

```php
use Shankar\LaravelBasicSetting\Traits\HandleLivewireForm;

class ExampleComponent extends Component {
    use HandleLivewireForm;
    // ...

    public function exampleAction()
    {
        // Your code here
    }
}

// In bladefile 

<form wire:submit.prevent="submit('exampleAction')">
    // Your code here 
</form>

```

### HandleWithTransaction Middleware
Publish and register the middleware to wrap requests in DB transactions (see Installation step 2).

### Using in Routes

Wrap a route or route group in the middleware to enable DB transactions for the entire request:
```php
use Shankar\LaravelBasicSetting\Middleware\HandleWithTransaction;

Route::middleware(HandleWithTransaction::class)->group(function () {
    // Your routes here
});
// This middleware will wrap all the routes in a DB transaction and handle exceptions gracefully for your api routes. 

// To see the error in normal web (not API):
// 1. Add `HandleWithTransaction` to `kernel.php` middleware array
// 2. Add `HandleWithTransaction` to your route or route group


// In Blade file

@session('error')
    <p>{{ $message }}</p>
@endSession()
```


### ExpectJsonResponse Middleware
Publish and register the middleware to wrap requests in DB transactions (see Installation step 2).

### Using in Routes

Wrap a route or route group in the middleware to enable DB transactions for the entire request:
```php
use Shankar\LaravelBasicSetting\Middleware\ExpectJsonResponse;

Route::middleware(ExpectJsonResponse::class)->group(function () {
    // Your routes here
});

// This middleware is set header to reponse as json for all api routes , it auto apply to all api routes containing `api` prefix


```

### ValidPhone Rule
Use in your form requests for phone validation:
```php
use Shankar\LaravelBasicSetting\Rules\ValidPhone;

$request->validate([
    'phone' => ['required', new ValidPhone],
]);
```

## License

MIT
