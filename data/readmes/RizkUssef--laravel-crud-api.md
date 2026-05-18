# 🚀 Laravel CRUD Api Package

<p align="center">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/rizkussef/laravel-crud-api.svg?style=flat-square)](https://packagist.org/packages/rizkussef/laravel-crud-api)
[![Total Downloads](https://img.shields.io/packagist/dt/rizkussef/laravel-crud-api.svg?style=flat-square)](https://packagist.org/packages/rizkussef/laravel-crud-api)
[![License](https://img.shields.io/packagist/l/rizkussef/laravel-crud-api.svg?style=flat-square)](LICENSE)

</p>

A clean, scalable **Api CRUD architecture for Laravel**, built around a reusable **Base Service** and **Base Controller** with automatic:

- ✅ Model Resolution
- ✅ Resource Resolution
- ✅ Collection Handling
- ✅ Pagination
- ✅ Advanced Filtering (=, !=, >, <, >=, <=, LIKE, IN, BETWEEN, NULL checks, Date operations)
- ✅ Eager Loading Relationships
- ✅ API Response Formatting
- ✅ Auto-Validation using Form Requests
- ✅ Auto Creation of Model, Resource, Requests, Controller, Service, Migration using Command

Designed to eliminate repetitive CRUD logic while keeping your application clean and maintainable. Pass filters and relationships directly from your frontend to dynamically build optimized queries with full control over data retrieval.

---

# 📦 Installation

Install via Composer:

```bash
composer require rizkussef/laravel-crud-api
```

If needed, manually register the provider in:

```php
config/app.php
```

```php
Rizkussef\LaravelCrudApi\ApiCrudServiceProvider::class,
```

---

# ⚙️ Publish Configuration

```bash
php artisan vendor:publish --provider="Rizkussef\LaravelCrudApi\ApiCrudServiceProvider" --tag=config
```

This will publish:

```php
config/api-crud.php
```

Example:

```php
return [
    'paginate' => 15,
];
```

---

# 🏗 Architecture

```
App
 ├── Models
 │     └── User.php
 ├── Services
 │     └── UserService.php
 ├── Http
 │     ├── Controllers
 │     │      └── UserController.php
 │     ├── Requests
 │     │      ├── UserRequest.php
 │     │      └── UserUpdateRequest.php
 │     └── Resources
 │            └── UserResource.php
```

---

# ⚡ Artisan Generator Command

The absolute fastest way to get started is by using the built-in Artisan generator. This powerful command scaffolds a fully functional CRUD API endpoint in seconds!

```bash
php artisan api-crud:make {Model}
```

### 🎯 Example: Creating an Article API

```bash
php artisan api-crud:make Article
```

**What happens behind the scenes?** The command automatically generates all layers required for an API CRUD operation:

| Layer | Generated File | Description |
| :--- | :--- | :--- |
| **Model** | `App\Models\Article.php` | The Eloquent model (along with its database migration). |
| **Resource** | `App\Http\Resources\ArticleResource.php` | Automatically serializes and formats your JSON response. |
| **Requests** | `App\Http\Requests\ArticleRequest.php`<br>`ArticleUpdateRequest.php` | Dedicated Form validation classes (Auto-validated by Controller). |
| **Service** | `App\Services\ArticleService.php` | Core business logic layer (Extends `ApiCrudService`). |
| **Controller**| `App\Http\Controllers\ArticleController.php` | Handles routing and formatting (Extends `ApiCrudController`). |

### ⚙️ Available Options

| Option | Description | Example |
| :--- | :--- | :--- |
| `--no-migration` | Tells the generator to skip database migration file creation. | `php artisan api-crud:make User --no-migration` |

Once generated, just register your new endpoint in `routes/api.php` and you're fully operational!

```php
Route::apiResource('articles', ArticleController::class);
```

---

# 🛠 Manual Setup (Step-by-Step)

### 1️⃣ Create a Service

```php
namespace App\Services;

use Rizkussef\LaravelCrudApi\Services\ApiCrudService;

class UserService extends ApiCrudService
{
    // Add custom business logic here if needed
}
```

### 🔎 Automatic Resolution (Models, Resources, and Form Requests)

The architecture heavily relies on naming conventions to automatically resolve dependencies:

```
UserService → App\Models\User
UserService → App\Http\Resources\UserResource
UserController → App\Http\Requests\UserRequest (Used for store)
UserController → App\Http\Requests\UserUpdateRequest (Used for update)
```

No need to manually inject or define the Model, Resource, or Form Requests. `ApiCrudController` automatically validates inbound requests using the resolved Form Request before passing data to the Service.

---

## 2️⃣ Create a Controller

```php
namespace App\Http\Controllers;

use App\Services\UserService;
use Rizkussef\LaravelCrudApi\Http\Controllers\ApiCrudController;

class UserController extends ApiCrudController {
    public function __construct(UserService $service)
    {
        parent::__construct($service);
    }
}
```

Just Inject the specific service for this controller.

---

# � Filters & Relationships

The package includes powerful filtering and eager-loading capabilities. Pass filters and relationships from the frontend to dynamically build queries. They can be passed either as array parameters or as JSON-encoded strings.

## Available Filter Operators

### Comparison Operators

```php
// Equal / Greater Than / Less Than
['age' => ['operator' => '=', 'value' => 25]]
['age' => ['operator' => '>', 'value' => 18]]
['age' => ['operator' => '>=', 'value' => 18]]
['age' => ['operator' => '<', 'value' => 65]]
['age' => ['operator' => '<=', 'value' => 65]]
['status' => ['operator' => '!=', 'value' => 'deleted']]
```

### String Matching

```php
// LIKE search (wildcard)
['name' => ['operator' => 'like', 'value' => 'John']]

// Starts with
['email' => ['operator' => 'starts_with', 'value' => 'admin']]

// Ends with
['email' => ['operator' => 'ends_with', 'value' => '.com']]

// Simple value (auto LIKE for strings)
['name' => 'John']  // Searches LIKE "%John%"
```

### Array Operations

```php
// Multiple values
['status' => ['operator' => 'in', 'value' => ['active', 'pending']]]

// Exclude values
['status' => ['operator' => 'not_in', 'value' => ['deleted', 'banned']]]

// Range
['price' => ['operator' => 'between', 'value' => [100, 500]]]
['price' => ['operator' => 'not_between', 'value' => [100, 500]]]
```

### NULL Checks

```php
['deleted_at' => ['operator' => 'null']]      // IS NULL
['verified_at' => ['operator' => '!null']]    // IS NOT NULL
['verified_at' => ['operator' => 'not_null']]
['published_at' => ['operator' => 'exists', 'value' => true]]   // IS NOT NULL
['published_at' => ['operator' => 'exists', 'value' => false]]  // IS NULL
```

### Date Operations

```php
['created_at' => ['operator' => 'date', 'value' => '2024-02-23']]
['created_at' => ['operator' => 'year', 'value' => 2024]]
['created_at' => ['operator' => 'month', 'value' => 2]]
['created_at' => ['operator' => 'day', 'value' => 23]]
```

## Frontend Examples
### Axios Example

```javascript
import axios from 'axios';

const fetchUsers = async () => {
  const { data } = await axios.get('/api/users/Paginate', {
    params: {
      filters: {
        status: 'active',
        age: { operator: '>', value: 18 }
      },
      relationships: ['profile', 'comments'],
      per_page: 15
    }
  });
  
  console.log(data);
};
```

## Backend Services Examples

### Another Service Calling This Service

```php
namespace App\Services;

use App\Services\UserService;

class ReportService
{
    public function __construct(private UserService $userService) {}

    /**
     * Generate active users report
     */
    public function getActiveUsersReport()
    {
        $filters = [
            'status' => 'active',
            'created_at' => [
                'operator' => 'date',
                'value' => now()->subMonth()->format('Y-m-d')
            ]
        ];

        $relationships = ['profile', 'department'];

        return $this->userService->index($filters, $relationships);
    }

    /**
     * Get premium users with pagination
     */
    public function getPremiumUsers($page = 1)
    {
        $filters = [
            'subscription_type' => 'premium',
            'last_payment_date' => [
                'operator' => '!=null'
            ]
        ];

        $relationships = ['subscription', 'profile'];

        return $this->userService->getPaginated(
            perPage: 50,
            filters: $filters,
            relationships: $relationships
        );
    }

    /**
     * Search users by multiple criteria
     */
    public function searchUsers($name, $department, $minAge)
    {
        $filters = [
            'name' => $name,
            'department_id' => $department,
            'age' => [
                'operator' => '>=',
                'value' => $minAge
            ]
        ];

        return $this->userService->index($filters, ['profile', 'department']);
    }
}
```

---

# �🔁 Built-in CRUD Methods

The BaseCrudController provides:

- `index()` – List records
- `getPaginated($perPage)` - Paginate list of records
- `show($id)` – Show single record
- `store(Request $request)` – Automatically resolves and validates the incoming Request using the associated Form Request, then creates record
- `update(Request $request, $id)` – Automatically resolves and validates using the associated Update Form Request, then updates record
- `destroy($id)` – Delete record

Controller handles validation & response formatting. All business logic is handled inside **ApiCrudService**.

---

# 📄 Automatic Resource Handling

### Single Item

```php
return new UserResource($user);
```

### Collection

```php
return UserResource::collection($users);
```

Automatically handled by the base service.

### No Resource

```php
// No UserResource exists
return $user; // returns full user model data
```
If the corresponding Resource class does not exist, the base controller will return the raw model data instead of a resource.

---

# 📊 Example JSON Response

### GET /users

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15
  }
}
```

---

# 🧠 Best Practices

✔ Use the Artisan Generator Command to create all layers automatically.<br>
✔ Keep business logic inside Model-specific services.<br>
✔ Keep controllers thin. <br>
✔ Extend ApiCrudService instead of modifying it.<br>
✔ Use Resources for API formatting.<br>
✔ Use filters and relationships to avoid N+1 query problems.

### Example 1: Simple Business Logic with Filters

```php
namespace App\Services;

use Rizkussef\LaravelCrudApi\Services\ApiCrudService;

class UserService extends ApiCrudService
{
    /**
     * Activate user
     */
    public function activate($id)
    {
        $user = $this->model->findOrFail($id);
        $user->update(['active' => true]);
        return $this->applyResource($user);
    }

    /**
     * Get active users in a department
     */
    public function getActiveDepartmentUsers($departmentId, $perPage = 15)
    {
        $filters = [
            'active' => true,
            'department_id' => $departmentId
        ];
        
        $relationships = ['department', 'profile'];
        
        return $this->getPaginated($perPage, $filters, $relationships);
    }
}
```

### Example 2: Complex Filtering with Date Range

```php
namespace App\Services;

use Rizkussef\LaravelCrudApi\Services\ApiCrudService;

class OrderService extends ApiCrudService
{
    /**
     * Get high-value orders in date range with customer details
     */
    public function getHighValueOrders($minAmount, $startDate, $endDate, $perPage = 20)
    {
        $filters = [
            'total_amount' => [
                'operator' => '>=',
                'value' => $minAmount
            ],
            'created_at' => [
                'operator' => 'between',
                'value' => [$startDate, $endDate]
            ],
            'status' => [
                'operator' => 'in',
                'value' => ['completed', 'shipped']
            ]
        ];

        $relationships = ['customer', 'items.product', 'payment'];

        return $this->getPaginated($perPage, $filters, $relationships);
    }

    /**
     * Search orders by customer name and status
     */
    public function searchOrders($customerName, $statuses)
    {
        $filters = [
            'customer_name' => [
                'operator' => 'like',
                'value' => $customerName
            ],
            'status' => [
                'operator' => 'in',
                'value' => $statuses
            ]
        ];

        return $this->index($filters, ['customer', 'items']);
    }
}
```

### Example 3: Filtering with NULL Checks

```php
namespace App\Services;

use Rizkussef\LaravelCrudApi\Services\ApiCrudService;

class ArticleService extends ApiCrudService
{
    /**
     * Get published articles with authors and comments
     */
    public function getPublishedArticles($perPage = 15)
    {
        $filters = [
            'status' => 'published',
            'published_at' => [
                'operator' => '!null'  // IS NOT NULL
            ]
        ];

        $relationships = ['author', 'comments.author', 'tags'];

        return $this->getPaginated($perPage, $filters, $relationships);
    }

    /**
     * Get articles pending review (no reviewer assigned)
     */
    public function getPendingReview()
    {
        $filters = [
            'status' => 'draft',
            'reviewer_id' => [
                'operator' => 'null'  // IS NULL
            ]
        ];

        return $this->index($filters, ['author']);
    }
}
```
# 🔌 Dependency Injection

ApiCrudService is bound in the container via the Service Provider, so it can be injected anywhere.

---

# 🔧 Extending

You can extend:

- ApiCrudController
- ApiCrudService
- Pagination configuration
  
And you can use:

- API Response Trait
- Filter Query Trait
- Relationship Query Trait

---

# 🛣 Example Routes

```php
Route::apiResource('users', UserController::class);
```
---

# 👨‍💻 Author & Support

**Developed by Rizk Ussef**

A fullstack developer passionate about creating clean, maintainable architecture patterns and reusable solutions for building scalable applications across frontend and backend ecosystems.

### Get in Touch

- **GitHub:** [@rizkussef](https://github.com/rizkussef)
- **Email:** rizk.ussef@gmail.com
- **Issues & Feedback:** [GitHub Issues](https://github.com/rizkussef/laravel-crud-api/issues)

---

# 🤝 Contributing

Contributions are welcome! If you find bugs or have feature suggestions, please open an issue or submit a pull request.

---

# 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

