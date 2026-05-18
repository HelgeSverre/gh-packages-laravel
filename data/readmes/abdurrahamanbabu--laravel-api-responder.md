# Laravel API Responder

A lightweight and clean **API response helper package** for Laravel.  
Provides standardized JSON responses for success, error, and pagination, making building RESTful APIs faster and more consistent.

---

## Installation

Install via Composer:

```bash
composer require abdur-rahaman/laravel-api-responder

```

##You can use the package via the helper function.



```
use Illuminate\Http\Request;
Route::get('/api/test', function(Request $request) {
    return responder()->success([
        'message' => 'API Responder is working!',
        'data' => ['foo' => 'bar']
    ]);
});

responder()->success($data, $message = null, $statusCode = 200);
responder()->error($message = 'Something went wrong', $statusCode = 400, $errors = []);
responder()->paginate($data, $message = null, $statusCode = 200);

```

