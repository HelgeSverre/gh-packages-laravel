# Laravel Data Scrubber

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bernskiold/laravel-data-scrubber.svg?style=flat-square)](https://packagist.org/packages/bernskiold/laravel-data-scrubber)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/bernskiold/laravel-data-scrubber/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/bernskiold/laravel-data-scrubber/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bernskiold/laravel-data-scrubber.svg?style=flat-square)](https://packagist.org/packages/bernskiold/laravel-data-scrubber)

A Laravel package for scrubbing PII (Personally Identifiable Information) and sensitive data from Eloquent models.
Useful for GDPR compliance and data retention policies.

## Installation

Install the package via composer:

```bash
composer require bernskiold/laravel-data-scrubber
```

Optionally publish the configuration file:

```bash
php artisan vendor:publish --provider="Bernskiold\LaravelDataScrubber\DataScrubberServiceProvider" --tag="config"
```

If you're using [Laravel Horizon](https://laravel.com/docs/horizon), add the `data-scrubber` queue to your `config/horizon.php`:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'queues' => ['default', 'data-scrubber'],
            // ...
        ],
    ],
],
```

## Usage

### Implementing Scrubbable on a Model

To make a model scrubbable, implement the `Scrubbable` interface and use the `ScrubsData` trait:

```php
<?php

namespace App\Models;

use Bernskiold\LaravelDataScrubber\Concerns\ScrubsData;
use Bernskiold\LaravelDataScrubber\Contracts\Scrubbable;
use Bernskiold\LaravelDataScrubber\Data\ScrubbableFields;
use Bernskiold\LaravelDataScrubber\Strategies\AnonymizeEmailWithIdStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\AnonymizeFirstNameStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\AnonymizeLastNameStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\DeleteFileStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\HashStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\NullStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\RedactedStrategy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model implements Scrubbable
{
    use ScrubsData;
    use SoftDeletes;

    /**
     * Define which records should be scrubbed.
     *
     * In this example, we scrub soft-deleted records that are older than 30 days
     * and haven't already been scrubbed.
     */
    public function scrubbableQuery(): Builder
    {
        return static::query()
            ->onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(30))
            ->whereNull('scrubbed_at');
    }

    /**
     * Define which fields should be scrubbed and how.
     */
    public function scrubbableFields(): ScrubbableFields
    {
        return ScrubbableFields::make([
            'email' => AnonymizeEmailWithIdStrategy::class,
            'first_name' => AnonymizeFirstNameStrategy::class,
            'last_name' => AnonymizeLastNameStrategy::class,
            'phone' => NullStrategy::class,
            'ssn' => RedactedStrategy::class,
            'address' => HashStrategy::class,
            'profile_photo' => DeleteFileStrategy::class,
        ]);
    }
}
```

### Available Scrubbing Strategies

| Strategy                       | Description                                      | Example Result                        |
|--------------------------------|--------------------------------------------------|---------------------------------------|
| `NullStrategy`                 | Sets the value to `null`                         | `null`                                |
| `RedactedStrategy`             | Replaces with `[REDACTED]`                       | `[REDACTED]`                          |
| `AnonymizeFirstNameStrategy`   | Replaces with "Deleted"                          | `Deleted`                             |
| `AnonymizeLastNameStrategy`    | Replaces with "User"                             | `User`                                |
| `AnonymizeEmailStrategy`       | Replaces with a generic email                    | `anonymized@deleted.local`            |
| `AnonymizeEmailWithIdStrategy` | Replaces with email containing model ID          | `deleted-123@anonymized.local`        |
| `HashStrategy`                 | Hashes the value using SHA-256                   | `a8f5f167f44f4964e6c998dee827110c...` |
| `DeleteFileStrategy`           | Deletes file from storage and sets to `null`     | `null`                                |
| `MaskStrategy`                 | Masks middle characters, showing start and end   | `12******90`                          |
| `TruncateStrategy`             | Keeps first N characters and adds suffix         | `Jon***`                              |
| `JsonFieldStrategy`            | Scrubs specific keys in JSON/array data          | (varies per key)                      |
| `ConditionalStrategy`          | Applies different strategies based on conditions | (depends on condition)                |
| `CallbackStrategy`             | Uses a custom closure handler                    | (depends on handler)                  |

### Using Strategy Classes Directly

For more control, you can instantiate strategy classes directly with custom parameters:

```php
use Bernskiold\LaravelDataScrubber\Data\ScrubbableFields;
use Bernskiold\LaravelDataScrubber\Strategies\MaskStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\TruncateStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\JsonFieldStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\ConditionalStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\NullStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\RedactedStrategy;

public function scrubbableFields(): ScrubbableFields
{
    return ScrubbableFields::make([
        // Mask phone numbers: "1234567890" → "12******90"
        'phone' => new MaskStrategy(visibleStart: 2, visibleEnd: 2, maskChar: '*'),

        // Mask SSN showing only last 4: "123-45-6789" → "XXXXXXX6789"
        'ssn' => new MaskStrategy(visibleStart: 0, visibleEnd: 4, maskChar: 'X'),

        // Truncate names: "Jonathan" → "Jon***"
        'name' => new TruncateStrategy(keepChars: 3, suffix: '***'),

        // Truncate addresses: "123 Main Street" → "123 M..."
        'address' => new TruncateStrategy(keepChars: 5, suffix: '...'),

        // Scrub specific keys in JSON data
        'metadata' => new JsonFieldStrategy([
            'phone' => new MaskStrategy(2, 2),
            'ssn' => NullStrategy::class,
            'address' => RedactedStrategy::class,
        ]),

        // Apply different strategies based on conditions
        'sensitive_data' => new ConditionalStrategy(
            condition: fn ($value, $model) => $model->requires_full_redaction,
            thenStrategy: new RedactedStrategy,
            elseStrategy: new MaskStrategy(2, 2),
        ),
    ]);
}
```

### Using Custom Callbacks

For more complex scrubbing logic, use the `CallbackStrategy`:

```php
use Bernskiold\LaravelDataScrubber\Data\ScrubbableFields;
use Bernskiold\LaravelDataScrubber\Strategies\AnonymizeEmailWithIdStrategy;
use Bernskiold\LaravelDataScrubber\Strategies\CallbackStrategy;

public function scrubbableFields(): ScrubbableFields
{
    return ScrubbableFields::make([
        'email' => AnonymizeEmailWithIdStrategy::class,
        'metadata' => new CallbackStrategy(function ($value, $model, $field) {
            // Custom logic here
            return json_encode(['scrubbed' => true, 'at' => now()->toIso8601String()]);
        }),
    ]);
}
```

You can also use the fluent builder pattern:

```php
public function scrubbableFields(): ScrubbableFields
{
    return ScrubbableFields::make()
        ->add('email', AnonymizeEmailWithIdStrategy::class)
        ->add('first_name', AnonymizeFirstNameStrategy::class);
}
```

### Timestamp Logging

By default, the package logs when a record was scrubbed by updating a `scrubbed_at` column. This allows you to:

- Track which records have been scrubbed
- Prevent re-scrubbing already scrubbed records
- Query for scrubbed/unscrubbed records

Add the column to your migration using the provided Blueprint macro:

```php
$table->scrubbedAt();
```

This creates a nullable timestamp column using the name from your config (`data-scrubber.timestamp_column`, defaults to `scrubbed_at`).

To customize timestamp logging behavior, override `getScrubOptions()` in your model:

```php
use Bernskiold\LaravelDataScrubber\Data\ScrubOptions;

public function getScrubOptions(): ScrubOptions
{
    return ScrubOptions::defaults()
        ->dontLogScrubTimestamp(); // Disable timestamp logging
}
```

To use a different column name:

```php
public function getScrubOptions(): ScrubOptions
{
    return ScrubOptions::defaults()
        ->useTimestampColumn('data_cleaned_at');
}
```

### Query Scopes

When timestamp logging is enabled, the trait provides query scopes:

```php
// Get records that haven't been scrubbed
User::notScrubbed()->get();

// Get records that have been scrubbed
User::scrubbed()->get();
```

### Scrubbing Individual Records

You can scrub a single record programmatically:

```php
$user = User::find(1);

// Preview what will be scrubbed
$preview = $user->previewScrub();

// Perform the scrub
$user->scrub();

// Check if already scrubbed
if ($user->hasBeenScrubbed()) {
    // Already scrubbed
}
```

### Artisan Commands

The package provides two artisan commands for managing data scrubbing.

#### Scrub Command

Run the scrubber to process all eligible records:

```bash
# Preview what would be scrubbed (dry run)
php artisan data-scrubbing:scrub --dry-run

# Scrub all eligible records (with confirmation prompt)
php artisan data-scrubbing:scrub

# Scrub without confirmation
php artisan data-scrubbing:scrub --force

# Scrub only a specific model
php artisan data-scrubbing:scrub --model=User

# Run synchronously instead of queuing jobs
php artisan data-scrubbing:scrub --sync
```

By default, scrubbing is performed asynchronously using Laravel's queue system. You can configure this behavior globally in the config file or per-model via `getScrubOptions()`.

#### Config Report Command

View the configuration of all Scrubbable models:

```bash
# Display configuration for all models
php artisan data-scrubbing:config

# Filter to a specific model
php artisan data-scrubbing:config --model=User

# Output as JSON
php artisan data-scrubbing:config --json
```

This command displays a summary of all configured models, their fields, scrubbing strategies, and processing options.

### Configuration

The configuration file allows you to customize the package behavior:

```php
// config/data-scrubber.php

return [
    // Paths to scan for models implementing Scrubbable
    'model_paths' => [
        app_path('Models'),
        // Add additional paths as needed
    ],

    // Default column name for storing scrub timestamps
    'timestamp_column' => 'scrubbed_at',

    // Default values for built-in scrubbing strategies
    'strategies' => [
        'redacted' => ['replacement' => '[REDACTED]'],
        'anonymize_first_name' => ['replacement' => 'Deleted'],
        'anonymize_last_name' => ['replacement' => 'User'],
        'anonymize_email' => ['replacement' => 'anonymized@deleted.local'],
        'anonymize_email_with_id' => ['domain' => 'anonymized.local', 'prefix' => 'deleted-'],
        'hash' => ['algorithm' => 'sha256'],
        'delete_file' => ['disk' => null],
        'mask' => ['visible_start' => 2, 'visible_end' => 2, 'mask_char' => '*'],
        'truncate' => ['keep_chars' => 3, 'suffix' => '***'],
    ],

    // Queue configuration for async processing
    'queue' => [
        'async' => env('DATA_SCRUBBER_ASYNC', true),
        'connection' => null,
        'queue' => 'data-scrubber',
        'chunk_size' => 500,
        'tries' => 3,
        'backoff' => 60,
    ],
];
```

You can override options on a per-model basis by implementing `getScrubOptions()` in your model:

```php
public function getScrubOptions(): ScrubOptions
{
    return ScrubOptions::defaults()
        ->useTimestampColumn('data_cleaned_at')
        ->useChunkSize(100)
        ->scrubSynchronously(); // or scrubAsynchronously()
}
```

### Events

When a model is scrubbed, the package dispatches a `Scrubbed` event. You can register listeners for this event to perform additional actions such as notifying external systems, clearing caches, or triggering other workflows.

### Activity Log Integration (Optional)

If you have [Spatie Activity Log](https://github.com/spatie/laravel-activitylog) installed, the package provides two optional listeners for different purposes.

#### Logging Scrub Activity

To log when records are scrubbed, register the `LogScrubbedActivity` listener in your `EventServiceProvider`:

```php
use Bernskiold\LaravelDataScrubber\Events\Scrubbed;
use Bernskiold\LaravelDataScrubber\Listeners\LogScrubbedActivity;

protected $listen = [
    Scrubbed::class => [
        LogScrubbedActivity::class,
    ],
];
```

This listener will:

- Only log if Spatie Activity Log is installed
- Only log if the model uses the `LogsActivity` trait
- Log the field names and strategy names that were applied
- **Never log the actual data** (neither previous nor scrubbed values)

You can customize the event name and description in your config:

```php
// config/data-scrubber.php

'activity_log' => [
    'event' => 'data_scrubbed',
    'description' => 'Record data was scrubbed',
],
```

#### Scrubbing Activity Log Entries

Activity logs often store PII in their `properties` JSON column (e.g., old/new attribute values). To automatically scrub this data when a model is scrubbed, register the `ScrubActivityLogListener`:

```php
use Bernskiold\LaravelDataScrubber\Events\Scrubbed;
use Bernskiold\LaravelDataScrubber\Listeners\ScrubActivityLogListener;

protected $listen = [
    Scrubbed::class => [
        ScrubActivityLogListener::class,
    ],
];
```

This listener will scrub the configured property keys (default: `old` and `attributes`) in all activity log entries for the scrubbed model, using the same strategies defined in `scrubbableFields()`.

You can customize which property keys are scrubbed in your config:

```php
// config/data-scrubber.php

'activity_log' => [
    'property_keys' => ['old', 'attributes'],
],
```

To customize the behavior per-model, implement the `ScrubsActivityLog` interface:

```php
use Bernskiold\LaravelDataScrubber\Contracts\ScrubsActivityLog;
use Bernskiold\LaravelDataScrubber\Data\ScrubbableFields;

class User extends Model implements Scrubbable, ScrubsActivityLog
{
    // Opt out of activity log scrubbing entirely
    public function shouldScrubActivityLog(): bool
    {
        return true; // or false to skip
    }

    // Use different strategies for activity log scrubbing
    public function activityLogScrubbableFields(): ?ScrubbableFields
    {
        return ScrubbableFields::make([
            'email' => RedactedStrategy::class, // Different from model's strategy
        ]);

        // Return null to use the same strategies as scrubbableFields()
    }
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Bernskiold](https://github.com/bernskiold)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
