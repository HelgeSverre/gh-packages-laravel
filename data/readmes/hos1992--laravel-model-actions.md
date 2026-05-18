# Laravel Model Actions

A Laravel package for generating action classes for Eloquent models with built-in CRUD operations.

## Features

- 🚀 **Artisan Command** - Generate all action classes for a model with a single command
- 📦 **Base Action Classes** - Extensible base classes for Index, Show, Store, Update, and Delete operations
- 🎯 **Static & Instance Execution** - Run actions statically or via helper function
- 🔧 **Customizable Stubs** - Publish and customize action stubs to match your coding style
- ✅ **Confirmation Dialogs** - Warns before overwriting existing actions
- 🎨 **Clean Architecture** - Follows single responsibility principle with dedicated action classes
- 🪝 **Lifecycle Hooks** - Before/after hooks for custom logic injection
- 📦 **Bulk Operations** - BulkDelete and BulkUpdate actions for multiple records
- 🔍 **Query Filters** - Built-in search, sort, and date range filtering
- 🔍 **Query Filters** - Built-in search, sort, and date range filtering

## Installation

Install the package via Composer:

```bash
composer require hosnyadeeb/laravel-model-actions
```

The package will automatically register its service provider.

## Publish Assets (Optional)

### Publish Configuration

```bash
php artisan vendor:publish --tag=model-actions-config
```

### Publish Stubs for Customization

This allows you to customize the generated action classes, including the Base classes.

```bash
php artisan vendor:publish --tag=model-actions-stubs
```

Once published, you can edit the files in `stubs/model-actions/`. The command will automatically use these custom stubs when generating new actions.

Example:

- `stubs/model-actions/Index.stub` -> Customizes `UserIndexAction`
- `stubs/model-actions/base/IndexAction.stub` -> Customizes `App\Actions\_Base\IndexAction`

## Usage

### Generate Actions for a Model

```bash
# Generate all actions for User model
php artisan make:actions User

# Generate specific actions only
php artisan make:actions User --actions=index,store,update

# Force overwrite existing actions
php artisan make:actions User --force

# Specify custom model namespace
php artisan make:actions User --model-path=App\\Domain\\Users\\Models
```

This will create the following files in `app/Actions/User/`:

- `UserIndexAction.php`
- `UserShowAction.php`
- `UserStoreAction.php`
- `UserUpdateAction.php`
- `UserDeleteAction.php`

### Generate a Custom Action

Create a single custom action for a model:

```bash
# Basic usage - model name extracted from action name
php artisan make:action UserActivateAction

# Explicit model name
php artisan make:action ActivateAction User

# Force overwrite
php artisan make:action UserActivateAction --force
```

This creates `app/Actions/User/UserActivateAction.php` with hooks ready to use.

### Running Actions

There are three ways to execute an action:

#### 1. Static Method (Recommended)

```php
use App\Actions\User\UserIndexAction;
use App\Actions\User\UserShowAction;
use App\Actions\User\UserStoreAction;
use App\Actions\User\UserUpdateAction;
use App\Actions\User\UserDeleteAction;

// Index - Get paginated users
$users = UserIndexAction::run(perPage: 15);

// Index - Get all users without pagination
$allUsers = UserIndexAction::run(getAll: true);

// Index - With eager loading
$usersWithRoles = UserIndexAction::run(with: ['roles', 'permissions']);

// Show - Get single user
$user = UserShowAction::run(selectValue: '1');

// Store - Create new user
$newUser = UserStoreAction::run(data: [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => bcrypt('password'),
]);

// Update - Update existing user
$updatedUser = UserUpdateAction::run(
    data: ['name' => 'Jane Doe'],
    selectValue: '1'
);

// Delete - Delete a user
$deleted = UserDeleteAction::run(selectValue: '1');
```

#### 2. Helper Function

```php
use App\Actions\User\UserIndexAction;

// Using the run() helper
$users = run(new UserIndexAction(perPage: 10));

// With multiple parameters
$user = run(new UserShowAction(
    selectValue: '1',
    with: ['roles', 'posts']
));
```

#### 3. Instance Method

```php
use App\Actions\User\UserIndexAction;

// Create instance and execute
$action = new UserIndexAction(perPage: 10);
$users = $action->execute();

// Or using invokable
$users = $action();
```

### Customizing Actions

#### Using Custom Query Builder

The `IndexAction` provides a `customBuilder` method for complex queries:

```php
<?php

namespace App\Actions\User;

use App\Actions\_Base\IndexAction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class UserIndexAction extends IndexAction
{
    public function __construct(
        private ?int    $perPage = null,
        private bool    $getAll = false,
        private ?string $orderKey = null,
        private ?string $orderDir = null,
        private array   $select = [],
        private array   $with = [],
        private array   $withOut = [],
        private array   $where = [],
        private array   $request = [],
    ) {
        parent::__construct(
            model: new User(),
            perPage: $this->perPage,
            getAll: $this->getAll,
            orderKey: $this->orderKey,
            orderDir: $this->orderDir,
            select: $this->select,
            with: $this->with,
            withOut: $this->withOut,
            where: $this->where,
        );
    }

    protected function customBuilder(Builder $builder): void
    {
        // Add search functionality
        if ($search = $this->request['search'] ?? null) {
            $builder->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $this->request['status'] ?? null) {
            $builder->where('status', $status);
        }

        // Date range filter
        if ($from = $this->request['from'] ?? null) {
            $builder->whereDate('created_at', '>=', $from);
        }
    }
}
```

#### Overriding Store/Update Logic

```php
<?php

namespace App\Actions\User;

use App\Actions\_Base\StoreAction;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

final class UserStoreAction extends StoreAction
{
    public function __construct(
        private array $data
    ) {
        parent::__construct(
            model: new User(),
            data: $this->data,
        );
    }

    public function __invoke(): mixed
    {
        // Hash password before storing
        if (isset($this->data['password'])) {
            $this->data['password'] = Hash::make($this->data['password']);
        }

        // Create user
        $user = User::create($this->data);

        // Assign default role
        $user->assignRole('user');

        // Send welcome email
        $user->notify(new WelcomeNotification());

        return $user;
    }
}
```

### In Controllers

```php
<?php

namespace App\Http\Controllers;

use App\Actions\User\UserIndexAction;
use App\Actions\User\UserShowAction;
use App\Actions\User\UserStoreAction;
use App\Actions\User\UserUpdateAction;
use App\Actions\User\UserDeleteAction;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = UserIndexAction::run(
            perPage: $request->input('per_page', 15),
            with: ['roles'],
            request: $request->all()
        );

        return response()->json($users);
    }

    public function show(string $id)
    {
        $user = UserShowAction::run(
            selectValue: $id,
            with: ['roles', 'permissions']
        );

        return response()->json($user);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        $user = UserStoreAction::run(data: $request->all());

        return response()->json($user, 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
        ]);

        $user = UserUpdateAction::run(
            data: $request->all(),
            selectValue: $id
        );

        return response()->json($user);
    }

    public function destroy(string $id)
    {
        UserDeleteAction::run(selectValue: $id);

        return response()->json(['message' => 'User deleted successfully']);
    }
}
```

## Lifecycle Hooks

All actions support `before()`, `after()`, and `onError()` hooks for injecting custom logic:

### Using Hooks

```php
<?php

namespace App\Actions\User;

use App\Actions\_Base\StoreAction;
use App\Models\User;
use Illuminate\Support\Facades\Log;

final class UserStoreAction extends StoreAction
{
    public function __construct(private array $data)
    {
        parent::__construct(model: new User(), data: $this->data);
    }

    /**
     * Called before handle() executes.
     */
    protected function before(): void
    {
        Log::info('Creating new user', ['email' => $this->data['email'] ?? null]);
    }

    /**
     * Called after handle() executes successfully.
     */
    protected function after(mixed $result): mixed
    {
        // Send welcome email
        $result->notify(new WelcomeNotification());

        // Log success
        Log::info('User created successfully', ['id' => $result->id]);

        return $result;
    }

    /**
     * Called when an exception is thrown.
     */
    protected function onError(\Throwable $e): void
    {
        Log::error('Failed to create user', [
            'email' => $this->data['email'] ?? null,
            'error' => $e->getMessage()
        ]);
    }
}
```

### Hook Execution Order

1. `before()` - Runs before the main action logic
2. `handle()` - Main action logic executes
3. `after($result)` - Runs after successful execution (can modify result)
4. `onError($e)` - Runs if an exception occurs (then re-throws)

## Custom Actions

Create custom business logic actions beyond CRUD operations.

### Creating a Custom Action

Use the artisan command:

```bash
php artisan make:action UserActivateAction
```

Or create manually by extending the base `Action` class:

```php
<?php

namespace App\Actions\User;

use App\Actions\Action;
use App\Models\User;
use Illuminate\Support\Facades\Log;

final class UserActivateAction extends Action
{
    public function __construct(
        private int $userId,
        private ?string $activatedBy = null
    ) {}

    public function handle(): User
    {
        $user = User::findOrFail($this->userId);

        $user->update([
            'status' => 'active',
            'activated_at' => now(),
            'activated_by' => $this->activatedBy,
        ]);

        return $user->fresh();
    }

    protected function before(): void
    {
        Log::info("Activating user {$this->userId}");
    }

    protected function after(mixed $result): mixed
    {
        // Send notification
        $result->notify(new AccountActivatedNotification());

        return $result;
    }
}
```

### Running Custom Actions

```php
// Static method
$user = UserActivateAction::run(userId: 1, activatedBy: 'admin');

// Instance method
$action = new UserActivateAction(userId: 1);
$user = $action->execute();

// Helper function
$user = run(new UserActivateAction(userId: 1));
```

### Composite Actions

Chain multiple actions together:

```php
<?php

namespace App\Actions\User;

use App\Actions\Action;

final class UserRegisterAction extends Action
{
    public function __construct(
        private array $userData,
        private string $role = 'user'
    ) {}

    public function handle(): array
    {
        // Create user
        $user = UserStoreAction::run(data: $this->userData);

        // Assign role
        $user->assignRole($this->role);

        // Create profile
        $profile = ProfileStoreAction::run(data: [
            'user_id' => $user->id,
        ]);

        return compact('user', 'profile');
    }
}

// Usage
$result = UserRegisterAction::run(
    userData: ['name' => 'John', 'email' => 'john@example.com'],
    role: 'subscriber'
);
```

### Using Traits in Custom Actions

Combine multiple traits for enhanced functionality:

```php
<?php

namespace App\Actions\User;

use App\Actions\Action;
use App\Models\User;
use HosnyAdeeb\ModelActions\Traits\Filterable;

final class UserSearchAction extends Action
{
    use Filterable;

    protected array $searchable = ['name', 'email', 'profile.bio'];

    public function __construct(
        private array $filters = []
    ) {
        $this->setFilters($this->filters);
    }

    public function handle(): mixed
    {
        $query = User::query()->with('profile');
        $this->applyFilters($query);
        return $query->paginate(20);
    }
}
```

## Query Filters

The `Filterable` trait provides powerful search, sort, and date filtering capabilities for Index actions.

### Using Filters

```php
<?php

namespace App\Actions\User;

use App\Actions\_Base\IndexAction;
use App\Models\User;
use HosnyAdeeb\ModelActions\Traits\Filterable;

final class UserIndexAction extends IndexAction
{
    use Filterable;

    // Columns that can be searched
    protected array $searchable = ['name', 'email', 'profile.bio'];

    // Default sorting
    protected string $defaultSort = 'created_at';
    protected string $defaultSortDirection = 'desc';

    public function __construct(
        private array $filters = [],
        private ?int $perPage = null,
    ) {
        parent::__construct(model: new User(), perPage: $this->perPage);
        $this->setFilters($this->filters);
    }

    public function handle(): mixed
    {
        $query = User::query();

        // Apply all filters (search, sort, date range, where conditions)
        $this->applyFilters($query);

        return $query->paginate($this->perPage ?? 20);
    }
}
```

### Available Filter Parameters

| Parameter                  | Description               | Example                     |
| -------------------------- | ------------------------- | --------------------------- |
| `search` or `q`            | Search term               | `?search=john`              |
| `sort` or `order_by`       | Column to sort by         | `?sort=name`                |
| `direction` or `order_dir` | Sort direction (asc/desc) | `?direction=asc`            |
| `date_from` or `from`      | Filter from date          | `?date_from=2024-01-01`     |
| `date_to` or `to`          | Filter to date            | `?date_to=2024-12-31`       |
| Any other key              | Where condition           | `?status=active&role=admin` |

### Usage in Controller

```php
public function index(Request $request)
{
    $users = UserIndexAction::run(
        filters: $request->all(),
        perPage: $request->input('per_page', 15)
    );

    return response()->json($users);
}
```

### Searching Relationships

Define relationship columns with dot notation:

```php
protected array $searchable = [
    'name',
    'email',
    'profile.bio',      // Searches profile.bio relationship
    'roles.name',       // Searches roles.name relationship
];
```

## Bulk Actions

Perform operations on multiple records at once.

### BulkDeleteAction

```php
<?php

namespace App\Actions\User;

use HosnyAdeeb\ModelActions\Actions\_Base\BulkDeleteAction;

final class UserBulkDeleteAction extends BulkDeleteAction
{
    protected function model(): string
    {
        return \App\Models\User::class;
    }

    protected function before(): void
    {
        // Log before bulk delete
        Log::info('Bulk deleting users', ['count' => count($this->ids)]);
    }
}

// Usage
$deletedCount = UserBulkDeleteAction::run([1, 2, 3, 4, 5]);

// Force delete (for soft delete models)
$deletedCount = UserBulkDeleteAction::run([1, 2, 3], forceDelete: true);
```

### BulkUpdateAction

```php
<?php

namespace App\Actions\User;

use HosnyAdeeb\ModelActions\Actions\_Base\BulkUpdateAction;

final class UserBulkUpdateAction extends BulkUpdateAction
{
    protected function model(): string
    {
        return \App\Models\User::class;
    }

    protected function prepareData(array $data): array
    {
        // Add updated_at timestamp
        $data['updated_at'] = now();
        return $data;
    }
}

// Usage - update status for multiple users
$updatedCount = UserBulkUpdateAction::run(
    ids: [1, 2, 3, 4, 5],
    data: ['status' => 'active']
);
```

## Configuration

After publishing the config file, you can customize:

```php
// config/model-actions.php

return [
    // Namespace for generated actions
    'actions_namespace' => 'App\\Actions',

    // Path for generated actions
    'actions_path' => app_path('Actions'),

    // Default model namespace
    'model_namespace' => 'App\\Models',

    // Default pagination count
    'pagination_per_page' => env('PAGINATION_PER_PAGE', 20),

    // Default action types to generate
    'default_actions' => [
        'Index',
        'Show',
        'Store',
        'Update',
        'Delete',
    ],
];
```

## Customizing Stubs

After publishing stubs, you can find them in `stubs/model-actions/`. Modify these files to change the generated action structure:

- `Index.stub` - Template for index actions
- `Show.stub` - Template for show actions
- `Store.stub` - Template for store actions
- `Update.stub` - Template for update actions
- `Delete.stub` - Template for delete actions

## Directory Structure

After generating actions, your project will have:

```
app/
└── Actions/
    ├── Action.php              # Base action class
    ├── _Base/                   # Base action types
    │   ├── IndexAction.php
    │   ├── ShowAction.php
    │   ├── StoreAction.php
    │   ├── UpdateAction.php
    │   └── DeleteAction.php
    └── User/                    # Model-specific actions
        ├── UserIndexAction.php
        ├── UserShowAction.php
        ├── UserStoreAction.php
        ├── UserUpdateAction.php
        └── UserDeleteAction.php
```

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
