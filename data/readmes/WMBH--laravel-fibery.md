# Laravel Fibery

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wmbh/laravel-fibery.svg?style=flat-square)](https://packagist.org/packages/wmbh/laravel-fibery)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wmbh/laravel-fibery/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wmbh/laravel-fibery/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wmbh/laravel-fibery/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wmbh/laravel-fibery/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wmbh/laravel-fibery.svg?style=flat-square)](https://packagist.org/packages/wmbh/laravel-fibery)

A Laravel package for interacting with the [Fibery](https://fibery.io) API. Provides a fluent query builder, entity management, and full API coverage for Schema, Types, Fields, Files, and Documents.

## Quick Start

```php
use WMBH\Fibery\Facades\Fibery;

// Query entities
$tasks = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name', 'Project/Status'])
    ->where('Project/Status', 'Active')
    ->limit(10)
    ->get();

// Create entity
$task = Fibery::create('Project/Task', [
    'fibery/name' => 'New Task',
]);

// Update entity
Fibery::update('Project/Task', $task['fibery/id'], [
    'fibery/name' => 'Updated Task',
]);
```

## Installation

Install the package via Composer:

```bash
composer require wmbh/laravel-fibery
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="fibery-config"
```

## Configuration

Add these environment variables to your `.env` file:

```env
FIBERY_WORKSPACE=your-workspace
FIBERY_TOKEN=your-api-token
FIBERY_TIMEOUT=30
```

**FIBERY_WORKSPACE** is your workspace subdomain. For example:
- If your Fibery URL is `https://mycompany.fibery.io` → workspace is `mycompany`
- If your Fibery URL is `https://acme-corp.fibery.io` → workspace is `acme-corp`

Get your API token from Fibery: **Settings > API Tokens > Create Token**

The configuration file (`config/fibery.php`) contains:

```php
return [
    'workspace' => env('FIBERY_WORKSPACE'),
    'token' => env('FIBERY_TOKEN'),
    'timeout' => env('FIBERY_TIMEOUT', 30),
    'retry' => [
        'times' => env('FIBERY_RETRY_TIMES', 3),
        'sleep' => env('FIBERY_RETRY_SLEEP', 1000), // milliseconds
    ],
];
```

## Testing Connection

Verify your configuration with the artisan command:

```bash
php artisan fibery:test
```

## Usage

### Query Builder

The query builder provides a fluent interface for querying Fibery entities:

```php
use WMBH\Fibery\Facades\Fibery;

// Basic query
$tasks = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name', 'Project/Status'])
    ->where('Project/Status', 'Active')
    ->orderBy('fibery/creation-date', 'desc')
    ->limit(10)
    ->get();

// Get first result
$task = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name'])
    ->where('fibery/public-id', 'TASK-123')
    ->first();

// Check existence
$exists = Fibery::query('Project/Task')
    ->where('fibery/name', 'My Task')
    ->exists();

// Count results
$count = Fibery::query('Project/Task')
    ->where('Project/Status', 'Active')
    ->count();
```

### Where Clauses

```php
// Equals (shorthand)
->where('Project/Status', 'Active')

// With operator
->where('Project/Priority', '>', 5)
->where('Project/DueDate', '<=', '2024-12-31')

// Where In
->whereIn('Project/Status', ['Active', 'In Progress'])

// Where Null / Not Null
->whereNull('Project/Assignee')
->whereNotNull('Project/DueDate')

// Multiple conditions (AND)
->where('Project/Status', 'Active')
->where('Project/Priority', '>', 3)

// OR conditions
->orWhere([
    ['Project/Status', '=', 'Active'],
    ['Project/Priority', '>', 5],
])
```

### Relationships

```php
// Include related entity fields
$tasks = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name'])
    ->with('Project/Assignee', ['fibery/id', 'fibery/name', 'user/email'])
    ->get();

// Include collection with subquery
$tasks = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name'])
    ->with('Project/Tags', function ($query) {
        $query->select(['fibery/id', 'Project/name'])
              ->limit(5);
    })
    ->get();

// Aggregates
$projects = Fibery::query('Project/Project')
    ->select(['fibery/id', 'fibery/name'])
    ->withCount('task_count', ['Project/Tasks', 'fibery/id'])
    ->get();
```

### Pagination

```php
$tasks = Fibery::query('Project/Task')
    ->select(['fibery/id', 'fibery/name'])
    ->limit(10)
    ->offset(20)  // Skip first 20
    ->get();

// Aliases
->take(10)
->skip(20)

// Get all results (use carefully)
->noLimit()
```

### Entity Operations

```php
// Create - returns the created entity with its fibery/id (UUID)
$task = Fibery::create('Project/Task', [
    'fibery/name' => 'New Task',
    'Project/Priority' => 5,
    // For relations, pass an object with fibery/id of the related entity
    'Project/Status' => ['fibery/id' => '123e4567-e89b-12d3-a456-426614174000'],
]);
// $task['fibery/id'] contains the UUID of the created entity

// Update - pass the entity UUID (fibery/id), NOT the public ID
Fibery::update('Project/Task', '123e4567-e89b-12d3-a456-426614174000', [
    'fibery/name' => 'Updated Task Name',
    'Project/Priority' => 10,
]);

// Delete - pass the entity UUID (fibery/id)
Fibery::delete('Project/Task', '123e4567-e89b-12d3-a456-426614174000');

// Find by UUID (fibery/id) - the internal unique identifier
$task = Fibery::find('Project/Task', '123e4567-e89b-12d3-a456-426614174000');

// Find by Public ID (fibery/public-id) - the human-readable ID like "TASK-123"
$task = Fibery::findByPublicId('Project/Task', 'TASK-123');

// Create or Update (upsert) - useful for syncing external data
Fibery::entity()->createOrUpdate('Project/Task', [
    'fibery/name' => 'Task Name',
    'Project/ExternalId' => 'ext-123',
], ['Project/ExternalId']); // Field to check for duplicates
```

> **Note on IDs:** Fibery uses two types of IDs:
> - `fibery/id` - UUID like `123e4567-e89b-12d3-a456-426614174000` (used for API operations)
> - `fibery/public-id` - Human-readable like `TASK-123` (shown in UI)

### Collection Operations

```php
// All collection operations use fibery/id (UUIDs)

// Add tags to a task - pass entity UUID and array of tag UUIDs
Fibery::addToCollection(
    'Project/Task',                              // Type name
    '123e4567-e89b-12d3-a456-426614174000',     // Task's fibery/id
    'Project/Tags',                              // Collection field name
    ['abc-uuid-1', 'def-uuid-2']                 // Tag fibery/ids to add
);

// Remove items from collection
Fibery::removeFromCollection('Project/Task', 'task-uuid', 'Project/Tags', ['tag-uuid-1']);

// Replace all collection items (removes existing, adds new)
Fibery::setCollection('Project/Task', 'task-uuid', 'Project/Tags', ['tag-uuid-3']);

// Clear all items from collection
Fibery::clearCollection('Project/Task', 'task-uuid', 'Project/Tags');
```

### Batch Operations

```php
// Create multiple entities
Fibery::entity()->createMany('Project/Task', [
    ['fibery/name' => 'Task 1'],
    ['fibery/name' => 'Task 2'],
    ['fibery/name' => 'Task 3'],
]);

// Update multiple entities
Fibery::entity()->updateMany('Project/Task', [
    ['fibery/id' => 'uuid-1', 'Project/Status' => ['fibery/id' => 'done-uuid']],
    ['fibery/id' => 'uuid-2', 'Project/Status' => ['fibery/id' => 'done-uuid']],
]);

// Delete multiple entities
Fibery::entity()->deleteMany('Project/Task', ['uuid-1', 'uuid-2', 'uuid-3']);
```

### Schema API

```php
// Get full schema
$schema = Fibery::schema()->getSchema();

// Get all types (databases)
$types = Fibery::schema()->getTypes();

// Get specific type
$taskType = Fibery::schema()->getType('Project/Task');

// Get fields for a type
$fields = Fibery::schema()->getFields('Project/Task');

// Get all spaces
$spaces = Fibery::schema()->getSpaces();

// Get types in a space
$projectTypes = Fibery::schema()->getTypesInSpace('Project');

// Check if type exists
if (Fibery::schema()->typeExists('Project/Task')) {
    // ...
}
```

### Type API (Database Management)

```php
// Create a new database
Fibery::types()->create('Project', 'Feature');

// Rename a database
Fibery::types()->rename('Project/Feature', 'Project/Enhancement');

// Delete a database
Fibery::types()->delete('Project/Enhancement');
```

### Field API

```php
// Create fields
Fibery::fields()->createTextField('Project/Task', 'Project/Notes');
Fibery::fields()->createNumberField('Project/Task', 'Project/StoryPoints');
Fibery::fields()->createDateField('Project/Task', 'Project/DueDate');
Fibery::fields()->createCheckboxField('Project/Task', 'Project/IsBlocked');

// Create single-select field
Fibery::fields()->createSingleSelectField('Project/Task', 'Project/Priority', [
    'Low', 'Medium', 'High', 'Critical'
]);

// Create relation field
Fibery::fields()->createRelationField('Project/Task', 'Project/Assignee', 'fibery/user');

// Rename field
Fibery::fields()->rename('Project/Task', 'Project/Notes', 'Project/Description');

// Delete field
Fibery::fields()->delete('Project/Task', 'Project/OldField');
```

### File API

```php
// Upload a file
$file = Fibery::files()->upload('/path/to/file.pdf');

// Upload from content
$file = Fibery::files()->uploadContent($content, 'document.pdf');

// Download a file
$content = Fibery::files()->download('file-secret');

// Download to path (throws FiberyException on write failure)
Fibery::files()->downloadTo('file-secret', '/path/to/save.pdf');

// Attach file to entity
Fibery::files()->attachToEntity('Project/Task', 'task-uuid', 'Files/Files', $file['fibery/id']);
```

### Document API (Rich Text)

```php
// Get document content
$content = Fibery::documents()->getContent('document-secret');

// Update document content
Fibery::documents()->updateContent('document-secret', [
    'content' => [
        'doc' => [
            'type' => 'doc',
            'content' => [/* ProseMirror content */]
        ]
    ]
]);

// Set markdown content
Fibery::documents()->setMarkdown('document-secret', '# Hello World');
```

### Webhooks

Use webhooks to receive notifications when entities change in Fibery.

```php
// Create a webhook for a type
$webhook = Fibery::webhooks()->create('https://your-endpoint.com/webhook', 'Space/Task');
// Returns: ['id' => 5, 'url' => '...', 'type' => 'Space/Task', 'state' => 'active', ...]

// List all webhooks
$webhooks = Fibery::webhooks()->all();

// Get a webhook by ID
$webhook = Fibery::webhooks()->get(5);

// Delete a webhook
Fibery::webhooks()->delete(5);

// Get webhooks filtered by type
$webhooks = Fibery::webhooks()->getByType('Space/Task');

// Check if a webhook exists
if (Fibery::webhooks()->exists(5)) {
    // ...
}
```

> **Note:** Only Fibery Admins can configure webhooks. Rich text field changes are not supported.

### Raw Commands

```php
// Execute raw command
$result = Fibery::command('fibery.entity/query', [
    'query' => [
        'q/from' => 'Project/Task',
        'q/select' => ['fibery/id'],
        'q/limit' => 10,
    ],
]);

// Batch commands
$results = Fibery::batch([
    ['command' => 'fibery.entity/create', 'args' => [...]],
    ['command' => 'fibery.entity/create', 'args' => [...]],
]);
```

## Error Handling

The package provides a hierarchy of exceptions for granular error handling:

```php
use WMBH\Fibery\Exceptions\FiberyException;
use WMBH\Fibery\Exceptions\AuthenticationException;
use WMBH\Fibery\Exceptions\RateLimitException;
use WMBH\Fibery\Exceptions\ConnectionException;
use WMBH\Fibery\Exceptions\TimeoutException;

try {
    $tasks = Fibery::query('Project/Task')->get();
} catch (AuthenticationException $e) {
    // Invalid or missing token (HTTP 401)
} catch (RateLimitException $e) {
    // Rate limit exceeded after all retries (HTTP 429)
    $retryAfter = $e->getRetryAfter(); // seconds from Retry-After header
} catch (TimeoutException $e) {
    // Request timed out (extends ConnectionException)
} catch (ConnectionException $e) {
    // Network error: DNS failure, connection refused, etc.
} catch (FiberyException $e) {
    // General API error
    $response = $e->getResponse(); // full API response data
    $statusCode = $e->getCode();   // HTTP status code
}
```

**Exception hierarchy:**

```
FiberyException (base)
├── AuthenticationException (401)
├── RateLimitException (429)
├── ValidationException (422)
├── ConnectionException (network errors)
│   └── TimeoutException (request timeouts)
```

All exceptions extend `FiberyException`, so catching `FiberyException` catches everything. Use specific exception types for targeted error handling.

## Rate Limits

Fibery enforces rate limits:
- 3 requests per second per token
- 7 requests per second per workspace

The package automatically retries on 429 responses (configurable via `retry.times` and `retry.sleep`). When retries are exhausted, a `RateLimitException` is thrown with the `Retry-After` value from the API response.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [WMBH](https://github.com/wmbh)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
