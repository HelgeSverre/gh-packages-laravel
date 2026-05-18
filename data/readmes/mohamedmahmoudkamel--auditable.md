# Laravel Auditable

A Laravel package that provides automatic auditing for Eloquent models.

## Package Installation

### 1. Install Package

```bash
composer require kamel/laravel-auditable
```

## Usage

### Basic Usage

Add the `Auditable` trait to any Eloquent model:

```php
<?php

namespace App\Models;

use Kamel\Auditable\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use Auditable;

    protected $fillable = ['name', 'email', 'password'];
}
```

### How It Works

Once the trait is added, all Eloquent operations are automatically audited:

```php
// Creating a user - triggers audit
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com'
]);

// Updating a user - triggers audit
$user = User::find(1);
$user->name = 'Jane Doe';
$user->save();

// Mass update - triggers audit
User::where('id', 1)->update(['email' => 'jane@example.com']);
```

### Event Handling

The package dispatches `AuditWasTriggered` events. Listen for them.

### Audit Data Structure

Each audit record contains:

- `model_type`: The audited model class
- `model_id`: The model's primary key
- `old_values`: JSON of previous values
- `new_values`: JSON of new values
- `user_type`: User model class (if authenticated)
- `user_id`: User ID (if authenticated)
- `url`: Request URL


## Development Setup

### Build Docker Container

```bash
make build
```

### Run Tests

```bash
make test
```

### Clean Environment

```bash
make clean
```

## Available Make Commands

- `make build` - Build the Docker container
- `make test` - Run the test suite with testdox output
- `make clean` - Remove Docker containers and images
