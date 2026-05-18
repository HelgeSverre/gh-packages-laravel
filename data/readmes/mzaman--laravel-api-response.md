
# Laravel API Response

A flexible and scalable API response handling package for Laravel, designed to provide a standardized approach for handling success, error, validation, and custom responses. It supports **localization**, **customization** of messages, **pagination**, and **metadata** for API responses.

---

## Installation

To install the package, use **Composer**:

```bash
composer require mzaman/laravel-api-response
```

---

## Publishing Language Files

After installing the package, you need to publish the language files for localization support:

```bash
php artisan vendor:publish --provider="MasudZaman\LaravelApiResponse\Providers\LaravelApiResponseServiceProvider" --tag=lang
```

This will publish the language files to the `lang/` directory in your Laravel application. You can then edit or add your translations in the respective language files.

---

## Configuration

There is no configuration file for custom messages in the package, as it uses the language files directly for all messages.

---

## What's New in v3.3.0

Version 3.3.0 introduces powerful new features for better API observability, debugging, and client communication:

### 1. **Request ID Tracking**

Automatically correlate requests across your application and logs. When a client sends an `X-Request-ID` header, it's automatically included in all responses.

**Benefits:**
- Track requests across microservices
- Correlate logs and errors
- Debug distributed systems
- Improve observability

**Example:**
```php
// Client sends request with header: X-Request-ID: abc-123-def-456

return ApiResponse::success($data, 200, 'Data retrieved');

// Response automatically includes:
// "meta": {
//     "request_id": "abc-123-def-456"
// }
```

**No code changes required!** Just ensure your client sends the `X-Request-ID` header.

---

### 2. **Custom Error Codes**

Provide machine-readable error codes for better client-side error handling.

**Benefits:**
- Consistent error identification
- Better client-side error handling
- Easier error tracking and analytics
- Internationalization-friendly

**Example:**
```php
// Without error code (auto-generated)
return ApiResponse::error(404, 'Raindrop not found');
// Response: "error_code": "NOT_FOUND"

// With custom error code
return ApiResponse::error(
    404,
    'Raindrop not found',
    [],
    [],
    'RAINDROP_NOT_FOUND'  // Custom machine-readable code
);
// Response: "error_code": "RAINDROP_NOT_FOUND"
```

**Use Cases:**
```php
// Business logic errors
return ApiResponse::error(400, 'Insufficient credits', [], [], 'INSUFFICIENT_CREDITS');

// Resource conflicts
return ApiResponse::error(409, 'Email already exists', [], [], 'EMAIL_DUPLICATE');

// Permission errors
return ApiResponse::error(403, 'Premium feature', [], [], 'PREMIUM_REQUIRED');
```

---

### 3. **Context Data for Debugging**

Add additional debugging information that's only visible in debug mode.

**Benefits:**
- Rich debugging information in development
- No sensitive data leakage in production
- Faster issue resolution
- Better error reports

**Example:**
```php
return ApiResponse::error(
    404,
    'Raindrop not found',
    [],
    [],
    'RAINDROP_NOT_FOUND',
    [
        'raindrop_id' => 12345,
        'user_id' => 67890,
        'collection_id' => -1,
        'search_query' => 'Laravel tutorials'
    ]
);

// In debug mode (APP_DEBUG=true):
// "context": {
//     "raindrop_id": 12345,
//     "user_id": 67890,
//     "collection_id": -1,
//     "search_query": "Laravel tutorials"
// }

// In production (APP_DEBUG=false):
// Context is automatically excluded
```

---

### 4. **Retry-After Headers**

Tell clients when to retry failed requests due to rate limiting or service unavailability.

**Benefits:**
- Better client behavior
- Reduced server load
- Improved user experience
- Standards-compliant (RFC 7231)

**Rate Limiting Example:**
```php
return ApiResponse::manyRequests(
    'Too many requests. Please slow down.',
    [],
    [],
    60  // Retry after 60 seconds
);

// Response includes:
// HTTP Header: Retry-After: 60
// "message": "Too many requests. Please slow down."
```

**Service Unavailable Example:**
```php
return ApiResponse::serviceUnavailable(
    'External API temporarily unavailable',
    [],
    [],
    120  // Retry after 120 seconds (2 minutes)
);

// Response includes:
// HTTP Header: Retry-After: 120
// "message": "External API temporarily unavailable"
```

**Smart Client Implementation:**
```javascript
// JavaScript client example
fetch('/api/raindrops')
    .then(response => {
        if (response.status === 429 || response.status === 503) {
            const retryAfter = response.headers.get('Retry-After');
            console.log(`Retry after ${retryAfter} seconds`);
            // Schedule retry
            setTimeout(() => fetch('/api/raindrops'), retryAfter * 1000);
        }
        return response.json();
    });
```

---

### 5. **Backward Compatibility**

All new features are **100% backward compatible**:
- All new parameters are optional
- Default values maintain existing behavior
- No breaking changes
- Existing code works without modifications

**Migration:**
```php
// Old code (still works!)
return ApiResponse::error(404, 'Not found');

// New code (with enhancements)
return ApiResponse::error(404, 'Not found', [], [], 'RESOURCE_NOT_FOUND', ['id' => 123]);
```

---

## Usage

Once the package is installed and language files are configured, you can use the provided methods to send standardized API responses.

### 1. Success Response

You can use the **`ApiResponse` class** to return success responses. Here’s how you can use it:

#### Using the Facade:

```php
use MasudZaman\LaravelApiResponse\Response\ApiResponse;

class UserController extends Controller
{
    public function getUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return ApiResponse::error(404, 'User not found');
        }

        return ApiResponse::success($user, 200, 'User fetched successfully');
    }
}
```


### 2. Error Response

For error handling, you can return error responses with the `error()` method. You can also pass custom error messages and validation errors.

#### Example:

```php
public function createUser(Request $request)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
    ]);

    // Handle unexpected errors
    if (!$validatedData) {
        return ApiResponse::error(422, 'Validation failed', [
            'name' => 'Name is required',
            'email' => 'Email is invalid'
        ]);
    }

    $user = User::create($validatedData);

    return ApiResponse::success($user, 'User created successfully', 201);
}
```

### 3. Localization

Laravel API Response supports localization for error messages and other strings.

To localize the messages, create language files in the `lang/{locale}/api.php` directory, and Laravel will automatically load them based on the current locale.

Example:

```php
// lang/en/api.php
return [
    'success' => 'Request was successful',
    'created_success' => 'Resource created successfully',
    'bad_request' => 'Invalid request',
    'unauthorized' => 'Authentication required',
    'forbidden' => 'Permission denied',
    'not_found' => 'Resource not found',
    'internal_server_error' => 'An unexpected error occurred',
    'service_unavailable' => 'Service temporarily unavailable',
    'validation_failed' => 'Validation failed',
    'conflict' => 'Conflict detected',
    'rate_limit_exceeded' => 'Rate limit exceeded',
    // Other messages...
];

// lang/es/api.php (Spanish localization)
return [
    'success' => 'La solicitud fue exitosa',
    'created_success' => 'Recurso creado exitosamente',
    'bad_request' => 'Solicitud inválida',
    'unauthorized' => 'Se requiere autenticación',
    'forbidden' => 'Permiso denegado',
    'not_found' => 'Recurso no encontrado',
    'internal_server_error' => 'Ocurrió un error inesperado',
    'service_unavailable' => 'Servicio temporalmente no disponible',
    'validation_failed' => 'La validación falló',
    'conflict' => 'Conflicto detectado',
    'rate_limit_exceeded' => 'Límite de solicitudes excedido',
    // Other messages...
];
```

You can switch the language based on the user's preference or application settings by setting the locale in your controller or middleware:

```php
app()->setLocale('es');
```

### 4. Pagination Support

The package allows you to handle paginated data using the `meta` field to include pagination metadata. Here’s how you can return paginated data:

```php
use Illuminate\Pagination\LengthAwarePaginator;

class UserController extends Controller
{
    public function listUsers(Request $request)
    {
        $users = User::paginate(10);

        return ApiResponse::success($users, 'Users fetched successfully', 200, [
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
            ]
        ]);
    }
}
```

This will automatically add pagination metadata to your response.

### 5. Testing

You can test your API responses using **PHPUnit** or **Pest** (if you are using it).

Here’s an example test case for testing the success and error responses:

```php
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_user()
    {
        $response = $this->get('/api/user/1');
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'User fetched successfully'
                 ]);
    }

    public function test_create_user()
    {
        $response = $this->postJson('/api/user', [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'User created successfully'
                 ]);
    }

    public function test_validation_error()
    {
        $response = $this->postJson('/api/user', [
            'name' => '',
            'email' => 'invalid-email'
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Validation failed',
                     'errors' => [
                         'name' => ['The name field is required.'],
                         'email' => ['The email must be a valid email address.']
                     ]
                 ]);
    }
}
```

### 6. Helper Methods

Below are the available helper functions for sending standardized responses based on different status codes:

- `apiResponse()` - Sends a success response.
- `errorResponse()` - Sends an error response.
- `successResponse()` - Sends a basic success response (200).
- `createdResponse()` - Sends a resource created response (201).
- `acceptedResponse()` - Sends an accepted response (202).
- `noContentResponse()` - Sends a no content response (204).
- `unavailableResponse()` - Sends a service unavailable response (503).
- `maintenanceResponse()` - Sends a maintenance mode response (503).
- `failResponse()` - Sends a bad request response (400).
- `unauthorizedResponse()` - Sends an unauthorized response (401).
- `forbiddenResponse()` - Sends a forbidden response (403).
- `notFoundResponse()` - Sends a not found response (404).
- `validationErrorResponse()` - Sends a validation error response (422).
- `manyRequestsResponse()` - Sends a too many requests response (429).
- `updatedResponse()` - Sends an updated response (200).
- `deletedResponse()` - Sends a deleted response (200).

---

### Helper Functions Example Usage

Here is a list of example usages for various helper methods:

---

### apiResponse()

Sends a success response.

```php
return apiResponse($data, 'The data was successfully retrieved.');
```

---

### errorResponse()

Sends an error response.

```php
return errorResponse(404);
return errorResponse(500, 'Something went wrong.');
```

---

### successResponse()

Sends a basic success response (200).

```php
return successResponse($data);
return successResponse($data, 'The data was successfully retrieved.');
```

---

### createdResponse()

Sends a resource created response (201).

```php
return createdResponse($data, 'Resource created successfully');
```

---

### acceptedResponse()

Sends an accepted response (202).

```php
return acceptedResponse($data, 'Request accepted for processing');
```

---

### noContentResponse()

Sends a no content response (204).

```php
return noContentResponse();
```

---

### unavailableResponse()

Sends a service unavailable response (503).

```php
return unavailableResponse('Service temporarily unavailable');
```

---

### maintenanceResponse()

Sends a maintenance mode response (503).

```php
return maintenanceResponse('Service under maintenance');
```

---

### failResponse()

Sends a bad request response (400).

```php
return failResponse('Bad request: Missing parameters');
```

---

### unauthorizedResponse()

Sends an unauthorized response (401).

```php
return unauthorizedResponse('Authentication required');
```

---

### forbiddenResponse()

Sends a forbidden response (403).

```php
return forbiddenResponse('Permission denied');
```

---

### notFoundResponse()

Sends a not found response (404).

```php
return notFoundResponse('The resource could not be found');
```

---

### validationErrorResponse()

Sends a validation error response (422).

```php
return validationErrorResponse('Validation failed', $errors);
```

---

### manyRequestsResponse()

Sends a too many requests response (429).

```php
return manyRequestsResponse('Too many requests, please try again later');
```

---

### updatedResponse()

Sends an updated response (200).

```php
return updatedResponse($data, 'Resource updated successfully');
```

---

### deletedResponse()

Sends a deleted response (200).

```php
return deletedResponse('Resource deleted successfully');
```

---

### License

This package is open-sourced software licensed under the **MIT** license.
