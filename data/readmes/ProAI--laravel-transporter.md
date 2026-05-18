# Laravel Transporter

A Laravel package for building GraphQL APIs backed by Eloquent models. Transporter bridges GraphQL schema definitions (SDL) with Laravel's Eloquent ORM, providing automatic field resolution, batched data loading, authorization via policies, cursor-based pagination, and more.

## Requirements

- PHP 8.2+
- Laravel 12 or 13

## Installation

```bash
composer require proai/laravel-transporter
```

The service provider is auto-discovered by Laravel.

Create the schema cache directory:

```bash
mkdir -p storage/framework/graphql
```

## Quick Start

### 1. Define your GraphQL schema

Create a `.gql` or `.graphql` file in `resources/graphql/`:

```graphql
# resources/graphql/app.gql
type Query {
    user(id: ID!): User
        @resolver(class: "App\\GraphQL\\Resolvers\\UserResolver")
    users: [User!]! @resolver(class: "App\\GraphQL\\Resolvers\\UsersResolver")
}

type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    postsConnection(first: Int!, after: String): PostConnection! @connection
    postsCount: Int! @count
}

type Post {
    id: ID!
    title: String!
    body: String!
}

type PostConnection {
    edges: [PostEdge!]!
    nodes: [Post!]!
    pageInfo: PageInfo!
}

type PostEdge {
    node: Post!
    cursor: String!
}

type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
}
```

### 2. Optionally add PHP configuration

Create a `.php` file with the same name to mutate types:

```php
// resources/graphql/app.php
<?php

use ProAI\Transporter\Type\Definition\ObjectType;

$schema->type('User', function (ObjectType $type) {
    $type->model(\App\Models\User::class);
});

$schema->type('Post', function (ObjectType $type) {
    $type->model(\App\Models\Post::class);
});
```

### 3. Create a resolver

```php
namespace App\GraphQL\Resolvers;

use App\Models\User;
use ProAI\Transporter\ArgumentBag;
use ProAI\Transporter\Context;
use ProAI\Transporter\Resolvers\Resolver;

class UserResolver extends Resolver
{
    public function __invoke(mixed $source, ArgumentBag $args, Context $context, mixed $info): mixed
    {
        return $context->loader(User::class)->asyncFind($args->get('id'));
    }
}
```

### 4. Set up a route

```php
use Illuminate\Http\Request;
use ProAI\Transporter\Transporter;

Route::post('/graphql', function (Request $request, Transporter $transporter) {
    $schema = $transporter->buildSchema('app');

    return $transporter->graphql(
        schema: $schema,
        source: $request->input('query'),
        variableValues: $request->input('variables'),
        operationName: $request->input('operationName'),
    );
});
```

## Schema Files

Schema files live in `resources/graphql/`. Each schema has:

- **SDL file** (required): `.gql` or `.graphql` - The GraphQL schema definition
- **PHP file** (optional): `.php` - Type mutators and configuration

Dot-separated keys map to subdirectories. For example, `admin.users` resolves to `resources/graphql/admin/users.gql`.

### Merging Schemas

Combine multiple schema files into one:

```php
$schema = $transporter->mergeSchemas(['app', 'admin']);
```

## Directives

Transporter provides built-in directives for common patterns:

| Directive                     | Location         | Description                                  |
| ----------------------------- | ---------------- | -------------------------------------------- |
| `@resolver(class: "...")`     | Field            | Use a custom resolver class for the field    |
| `@typeResolver(class: "...")` | Interface, Union | Resolve the concrete type for abstract types |
| `@connection`                 | Field            | Enable cursor-based pagination (Relay-style) |
| `@count`                      | Field            | Resolve as a count aggregate                 |
| `@coercion(class: "...")`     | Scalar           | Custom scalar value coercion                 |
| `@values(class: "...")`       | Enum             | Map enum values to a PHP class               |

## Resolvers

Custom resolvers extend the `Resolver` base class, which provides authorization, validation, and job dispatching via traits (`AuthorizesFields`, `ValidatesFields`, `DispatchesJobs`):

```php
use ProAI\Transporter\Resolvers\Resolver;

class CreatePostResolver extends Resolver
{
    public function __invoke(mixed $source, ArgumentBag $args, Context $context, mixed $info): mixed
    {
        $this->authorize('create', Post::class);

        $this->validate($args, [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        return Post::create($args->all());
    }
}
```

### Default Resolution

Fields without a `@resolver` directive are resolved automatically:

- **Identifier fields** (default: `id`) are resolved from the model key or `HasClientKey` contract
- **Attributes** are resolved from Eloquent model attributes (camelCase fields map to snake_case columns)
- **Relationships** are resolved via batched relation loaders to prevent N+1 queries

## Data Loaders

Transporter uses deferred data loading to batch database queries and prevent N+1 problems.

### Model Loader

Load models by primary key with automatic batching:

```php
// Single model (batched with other requests)
$context->loader(User::class)->asyncFind($id);

// Find or throw ModelNotFoundException
$context->loader(User::class)->asyncFindOrFail($id);

// Find by a specific column
$context->loader(User::class)->asyncFindBy('email', $email);
```

### Relation Loader

Relations are loaded automatically by the default resolver. Access manually via:

```php
$context->relationLoader($model, 'posts')->asyncLoad();
```

## Connections (Cursor Pagination)

Use the `@connection` directive on fields that return paginated results. The connection field name should end with `Connection` (e.g., `postsConnection` resolves the `posts` relation).

The `Connection` class provides:

- `edges()` - Array of `Edge` objects with `node` and `cursor`
- `nodes()` - Array of models
- `pageInfo()` - `PageInfo` with `hasPreviousPage`, `hasNextPage`, `startCursor`, `endCursor`

## Authorization

### Policy-based Authorization

Transporter integrates with Laravel's Gate/Policy system. Enable enforced policies to require a policy for all resolved models:

```php
use ProAI\Transporter\Transporter;

Transporter::$enforcedPolicies = true;
```

### Shields

Shields provide fine-grained attribute and relation access control per request:

```php
use ProAI\Transporter\Shield;

// Only allow these attributes
return Shield::whitelist(['name', 'email'], ['posts']);

// Allow everything except these
return Shield::blacklist(['secret_field'], ['admin_relation']);
```

Apply the `ShieldsAttributes` trait to your models:

```php
use ProAI\Transporter\ShieldsAttributes;

class User extends Model
{
    use ShieldsAttributes;
}
```

Temporarily disable shields:

```php
Shield::disableFor(function () {
    // Access all attributes freely
});
```

### Resolver Authorization

Use the `authorize` method in resolvers:

```php
$this->authorize('update', $post);
$this->authorizeForUser($user, 'delete', $post);
```

## Validation

Validate arguments in resolvers using Laravel's validation:

```php
$this->validate($args, [
    'email' => 'required|email',
    'name' => 'required|string|max:255',
]);
```

## Job Dispatching

Dispatch jobs from resolvers using the built-in `DispatchesJobs` trait:

```php
$this->dispatch(new ProcessPost($post));

// Dispatch synchronously in the current process
$this->dispatchNow(new ProcessPost($post));
```

## Error Handling

### Field Errors

Throw client-safe errors from resolvers using the `field_error` helper:

```php
field_error('User not found', 'NOT_FOUND');
```

Or use `FieldException` directly:

```php
use ProAI\Transporter\FieldException;

throw new FieldException('Invalid input', 'BAD_USER_INPUT');
```

The code parameter accepts any string. Common conventions: `BAD_USER_INPUT` (default), `NOT_FOUND`, `UNAUTHENTICATED`, `FORBIDDEN`.

Additionally, the default error handler automatically maps these Laravel exceptions to GraphQL errors:

- `AuthenticationException` → `UNAUTHENTICATED`
- `ModelNotFoundException` → `NOT_FOUND`
- `AuthorizationException` → `FORBIDDEN`

### Custom Error Handler

Replace the default error handler:

```php
Transporter::$errorHandler = MyErrorHandler::class;
```

## Type Mutators

Configure types in the companion PHP file using the `$schema` variable:

```php
$schema->type('User', function (ObjectType $type) {
    $type->model(\App\Models\User::class);
});

$schema->scalar('DateTime', function (ScalarType $type) {
    // configure scalar
});

$schema->interface('Node', function (InterfaceType $type) {
    // configure interface
});

$schema->union('SearchResult', function (UnionType $type) {
    // configure union
});

$schema->enum('Status', function (EnumType $type) {
    // configure enum
});

$schema->input('CreateUserInput', function (InputObjectType $type) {
    // configure input
});
```

## Contracts

### HasClientKey

Implement on models that use a custom client-facing identifier:

```php
use ProAI\Transporter\Contracts\HasClientKey;

class User extends Model implements HasClientKey
{
    public function getClientKey(): mixed
    {
        return $this->uuid;
    }

    public function getClientKeyName(): string
    {
        return 'uuid';
    }
}
```

### HasParent

Implement on models that define a parent relationship (used for authorization chains). Requires the `ReversesRelationships` trait:

```php
use ProAI\Transporter\Contracts\HasParent;
use ProAI\Transporter\ReverseRelation;
use ProAI\Transporter\ReversesRelationships;

class Post extends Model implements HasParent
{
    use ReversesRelationships;

    public function parent(): ReverseRelation
    {
        return $this->reverseOf(User::class, 'posts');
    }
}
```

For polymorphic relationships, use `reverseOfMorph` instead:

```php
public function parent(): ReverseRelation
{
    return $this->reverseOfMorph('commentable');
}
```

## Configuration

Static properties on `Transporter` control global behavior:

```php
use ProAI\Transporter\Transporter;

// Require policies for all models (default: false)
Transporter::$enforcedPolicies = true;

// Change the identifier field name (default: 'id')
Transporter::$identifierField = 'id';

// Enable normalized result format for client-side caching (default: false)
// Splits response data into `roots` (query results with references) and
// `entities` (deduplicated objects keyed by type and ID), similar to how
// Apollo Client normalizes its cache.
Transporter::$normalizedResult = true;

// Set a custom error handler class
Transporter::$errorHandler = \App\GraphQL\CustomErrorHandler::class;
```

## Schema Caching

Schemas are automatically cached to `storage/framework/graphql/` after first build. The cache is invalidated when the source SDL or PHP files are modified (based on file modification time). Use `php artisan transporter:clear` to force a rebuild.

## Artisan Commands

```bash
# Clear cached GraphQL schemas
php artisan transporter:clear
```

## License

This package is released under the [MIT License](LICENSE).
