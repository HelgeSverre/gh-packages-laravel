# Bruno API Documentation Generator

A Laravel package to automatically generate Bruno collections for API testing.

## Features

- ✅ Automatically generates Bruno endpoints from Laravel controllers
- ✅ Extracts validation rules from FormRequest classes
- ✅ Generates realistic payloads with Faker
- ✅ Supports Route Model Binding
- ✅ Parses PHPDoc for descriptions and documentation
- ✅ Auto-detects middleware and authentication
- ✅ Generates test cases for each endpoint (200, 201, 400, 401, 403, 404, 422, 500)
- ✅ Creates a complete Bruno structure (bruno.json, collection.bru, environments)
- ✅ Supports nested arrays and complex objects in payloads
- ✅ Includes Italian-specific field generators (fiscal code, VAT number)

## Installation

```bash
composer require badass-dd/bruno-generator
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=bruno-generator-config
```

## Usage

### Generate endpoints for a single controller

```bash
# Full controller
php artisan generate:bruno-endpoints Api\\UserController

# Only a specific method
php artisan generate:bruno-endpoints Api\\UserController --method=store

# With short namespace
php artisan generate:bruno-endpoints UserController
```

### Generate all API endpoints

```bash
php artisan generate:bruno-endpoints --all
```

### Available options

| Option | Description |
|--------|-------------|
| `--method=` | Generate only for a specific method |
| `--all` | Generate for all API controllers |
| `--dry-run` | Preview without creating files |
| `--output=bruno` | Output directory |
| `--locale=it_IT` | Faker locale |
| `--base-url=` | Base URL (default: `{{host}}`) |
| `--collection-name=` | Collection name |
| `--no-tests` | Do not generate test files |
| `--clean` | Clean output folder before generating |

### Examples

```bash
# Preview without writing files
php artisan generate:bruno-endpoints Api\\ProductController --dry-run

# Generate with Italian locale and custom collection name
php artisan generate:bruno-endpoints --all --locale=it_IT --collection-name="My API"

# Regenerate from scratch
php artisan generate:bruno-endpoints --all --clean
```

## Generated structure

```
bruno/
├── bruno.json              # Collection configuration (REQUIRED by Bruno)
├── collection.bru          # Collection-level headers and auth
├── environments/
│   ├── Local.bru           # Local environment
│   ├── Test.bru            # Test environment
│   └── Production.bru      # Production environment
├── User/
│   ├── folder.bru          # Folder metadata
│   ├── index.bru           # GET /api/users
│   ├── store.bru           # POST /api/users
│   ├── show.bru            # GET /api/users/{id}
│   ├── update.bru          # PUT /api/users/{id}
│   ├── destroy.bru         # DELETE /api/users/{id}
│   └── tests/
│       ├── folder.bru
│       ├── store_201.bru   # Test 201 Created
│       ├── store_401.bru   # Test 401 Unauthorized
│       ├── store_422.bru   # Test 422 Validation Error
│       └── ...
└── Product/
    ├── folder.bru
    └── ...
```

## How to use in Bruno

1. Open Bruno
2. File → Open Collection
3. Select the `bruno/` folder
4. Choose an Environment (Local, Test, Production)
5. Set the `bearerToken` in the environment
6. Run the requests!

## Environments configuration

Edit `bruno/environments/Local.bru`:

```
vars {
  host: http://localhost:8000
  bearerToken: your_token_here
}
```

## Automatic analysis

The package automatically analyzes:

### FormRequest

```php
class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ];
    }
}
```

Generates payload:

```json
{
  "name": "Mario Rossi",
  "email": "mario.rossi@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```

### PHPDoc

```php
/**
 * Creates a new user.
 *
 * @authenticated
 * @bodyParam name string required The user's name
 * @bodyParam email string required The user's email
 * @response 201 {"id": 1, "name": "Mario"}
 * @throws \Illuminate\Validation\ValidationException
 */
public function store(StoreUserRequest $request)
```

### Route Model Binding

```php
// routes/api.php
Route::get('/users/{user}', [UserController::class, 'show']);

// Controller
public function show(User $user)
```

Automatically generates the path parameter with an appropriate value.

## Advanced configuration

Publish and edit `config/bruno-generator.php`:

```php
return [
    // Custom environments
    'environments' => [
        'Local' => [
            'host' => 'http://localhost:8000',
            'bearerToken' => '',
        ],
        'Staging' => [
            'host' => 'https://staging.myapp.com',
            'bearerToken' => '',
        ],
    ],

    // Custom field generators for specific fields
    'field_generators' => [
        'tenant_id' => fn($faker) => 1,
        'currency' => fn($faker) => 'EUR',
    ],

    // Test cases to generate
    'test_cases' => [200, 201, 400, 401, 403, 404, 422],

    // Exclude controllers
    'exclude_controllers' => [
        'App\\Http\\Controllers\\Api\\InternalController',
    ],
];
```

## Generated automated tests

Each endpoint generates tests to verify:

- ✅ Correct status code
- ✅ Response time < 5 seconds
- ✅ Content-Type JSON
- ✅ Error response structure (422 → `errors`, 401 → `message`)

Example 422 test:

```
tests {
  test("Status is 422 Unprocessable Entity", function() {
    expect(res.getStatus()).to.equal(422);
  });

  test("Response contains validation errors", function() {
    const body = res.getBody();
    expect(body).to.have.property("errors");
  });
}
```

## Requirements

- PHP 8.1+
- Laravel 10+
- Bruno App

## License

MIT
