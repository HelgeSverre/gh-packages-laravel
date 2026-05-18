# Laravel Todo

[![Latest Version on Packagist](https://img.shields.io/packagist/v/charleslightjarvis/laravel-todo.svg?style=flat-square)](https://packagist.org/packages/charleslightjarvis/laravel-todo)
[![Total Downloads](https://img.shields.io/packagist/dt/charleslightjarvis/laravel-todo.svg?style=flat-square)](https://packagist.org/packages/charleslightjarvis/laravel-todo)
[![License](https://img.shields.io/packagist/l/charleslightjarvis/laravel-todo.svg?style=flat-square)](LICENSE.md)

Attach todo lists to any Eloquent model in your Laravel application.

## The Problem

In a Laravel application, multiple entities (`User`, `Project`, `Team`, `Invoice`...) often need their own todo list. Without a package, you have to:

- Create a separate table for each entity type (`user_todos`, `project_todos`, `team_todos`...)
- Duplicate models, scopes, and relationships
- Maintain the same logic across multiple places
- No unified API to interact with todos

## The Solution

`laravel-todo` lets you attach todos to **any Eloquent model** with a single trait. One table, one logic, every model.

- ✅ Attach todos to `User`, `Project`, `Team`, `Invoice` — anything
- ✅ Fluent API via Trait and Facade
- ✅ Built-in scopes: `pending`, `completed`, `overdue`, `highPriority`, `dueToday`
- ✅ Polymorphic creator support (tracks who created the todo)
- ✅ Zero duplication

## Features

- ✅ Polymorphic relationship – attach todos to any model (`User`, `Project`, `Team`, etc.)
- ✅ Fluent API via Facade or Trait
- ✅ Built-in scopes: `pending()`, `completed()`, `overdue()`, `highPriority()`, `dueToday()`
- ✅ Status management: `pending`, `in_progress`, `completed`, `cancelled`
- ✅ Priority levels: `low`, `medium`, `high`
- ✅ Tracks who created each todo (polymorphic `creator` relation)
- ✅ Zero UI – backend only, integrate however you want

## Requirements

- PHP 8.2 or higher
- Laravel 11.0 or higher

## Installation

Install the package via Composer:

```bash
composer require charleslightjarvis/laravel-todo
```

Publish the migration file:

```bash
php artisan vendor:publish --tag="todo-migrations"
```

Run the migrations:

```bash
php artisan migrate
```

Publish the configuration file (optional):

```bash
php artisan vendor:publish --tag="todo-config"
```

## Configuration

The config file `config/todo.php` allows you to customize:

```php
return [
    'prune_after_days' => 30,

    'models' => [
        'todo' => CharlesLightjarvis\Todo\Models\Todo::class,
    ],

    'todo_morph_key' => 'todoable_id',
];
```

## Usage

### 1. Add the trait to your model

Add `HasTodos` to any Eloquent model you want to attach todos to:

```php
use CharlesLightjarvis\Todo\Traits\HasTodos;

class User extends Model
{
    use HasTodos;
}

class Project extends Model
{
    use HasTodos;
}
```

### 2. Creating todos via the Trait

Use the `todos()` relation directly on any model that uses `HasTodos`:

```php
$user = User::find(1);

// Create a todo on the model
$todo = $user->todos()->create([
    'title'    => 'Buy groceries',
    'priority' => 'high',
    'due_at'   => now()->addDays(2),
]);

// Create with addTodo() — optionally assign a creator
$todo = $user->addTodo([
    'title'    => 'Finish the report',
    'priority' => 'medium',
], $creator);
```

### 3. Querying todos via the Trait

All built-in scopes are available directly on the relation:

```php
$user->todos()->pending()->get();
$user->todos()->inProgress()->get();
$user->todos()->completed()->get();
$user->todos()->cancelled()->get();

$user->todos()->highPriority()->get();
$user->todos()->overdue()->get();
$user->todos()->dueToday()->get();

// Scopes can be chained
$user->todos()->pending()->highPriority()->get();
```

### 4. Creating and querying todos via the Facade

The `Todo` facade provides a model-agnostic API — useful when you do not have a direct reference to the owning model instance:

```php
use CharlesLightjarvis\Todo\Facades\Todo;

// Create a todo for any model
$todo = Todo::createFor($user, [
    'title'    => 'Fix navigation bug',
    'priority' => 'high',
    'due_at'   => now()->addWeek(),
]);

// Scope queries to a specific model
Todo::for($user)->pending()->get();
Todo::for($user)->highPriority()->get();
Todo::for($user)->overdue()->get();

// Count
Todo::for($user)->count();
Todo::for($user)->pending()->count();
Todo::for($user)->completed()->count();
```

### 5. Completing and cancelling todos

Both methods are ownership-aware — they silently return `false` if the todo does not belong to the model:

```php
// Complete a todo
$user->completeTodo($todo);

// After completion
$todo->refresh();
$todo->status->value;  // 'completed'
$todo->completed_at;   // Carbon timestamp

// Cancel a todo
$user->cancelTodo($todo);

$todo->refresh();
$todo->status->value;  // 'cancelled'

// Another user cannot complete a todo they don't own
$otherUser->completeTodo($todo); // returns false, status unchanged
```

### 6. Accessing todo relations

```php
// All todos attached to the model
$user->todos;

// All todos created by the model (via the creator relation)
$user->createdTodos;
```

### 7. Tracking who created a todo

```php
// Via addTodo — pass the creator as the second argument
$todo = $project->addTodo(['title' => 'Review PR'], auth()->user());

// Or set creator fields manually
$todo = $project->todos()->create([
    'title'        => 'Review PR',
    'creator_type' => $user->getMorphClass(),
    'creator_id'   => $user->id,
]);

// Resolve the creator
$todo->creator; // returns the creator model
```

## Available Scopes

| Scope            | Description                          |
| ---------------- | ------------------------------------ |
| `pending()`      | Status = `pending`                   |
| `inProgress()`   | Status = `in_progress`               |
| `completed()`    | Status = `completed`                 |
| `cancelled()`    | Status = `cancelled`                 |
| `overdue()`      | Not completed + `due_at` in the past |
| `highPriority()` | Priority = `high`                    |
| `dueToday()`     | `due_at` is today                    |

## Enums

The package provides two enums for type safety:

```php
use CharlesLightjarvis\Todo\Enums\TodoStatusEnum;
use CharlesLightjarvis\Todo\Enums\TodoPriorityEnum;

// Status values
TodoStatusEnum::PENDING->value;      // 'pending'
TodoStatusEnum::IN_PROGRESS->value;  // 'in_progress'
TodoStatusEnum::COMPLETED->value;    // 'completed'
TodoStatusEnum::CANCELLED->value;    // 'cancelled'

// Priority values
TodoPriorityEnum::LOW->value;    // 'low'
TodoPriorityEnum::MEDIUM->value; // 'medium'
TodoPriorityEnum::HIGH->value;   // 'high'
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email charlestagne55@gmail.com instead of using the issue tracker.

## Credits

- [Charles Lightjarvis](https://github.com/CharlesLightjarvis)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
