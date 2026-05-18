# Journalism

Journalism is a Laravel package providing a simple way to log data to your database.

## Installation

``` bash
composer require thtg88/journalism
```

You can publish the configuration file and views by running:
```bash
php artisan vendor:publish --provider="Thtg88\Journalism\JournalismServiceProvider"
```

## Usage

Journalism is particularly useful when tracking changes to models.

You can therefore apply it to either a generic model observer for every model event (create, update, and destroy) or,
if you use the repository pattern to all your CRUD methods to track what, when, and by whom certain changes have occurred.

Make sure you register the helper as a singleton in your `AppServiceProvider`:

```php

// app/Providers/AppServiceProvider.php

use Thtg88\Journalism\Helpers\JournalEntryHelper;

public function register(): void
{
    $this->app->singleton(JournalEntryHelper::class, static function ($app) {
        return $app->make(JournalEntryHelper::class);
    });
}
```

Or you can simply use it in whichever class you prefer:

```php
use Thtg88\Journalism\Helpers\JournalEntryHelper;

(new JournalEntryHelper())->createJournalEntry('create', $model, ['foo' => 'bar']);
```

### Using Model Observers

For more documentation on model observer, see the [Laravel docs](https://laravel.com/docs/8.x/eloquent#observers)

First, create a base model observer:

```php
<?php

// app/Observers/Observer.php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Thtg88\Journalism\Helpers\JournalEntryHelper;
use Thtg88\Journalism\Models\JournalEntry;

abstract class Observer
{
    /**
     * Handle the Model "created" event.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public function created(Model $model): void
    {
        if (config('journalism.enabled') === false) {
            return;
        }

        // Create journal entry only if not creating journal entry i.e. infinite recursion
        if ($model instanceof JournalEntry) {
            return;
        }

        app(JournalEntryHelper::class)->createJournalEntry(
            'create',
            $model,
            $model->toArray(),
        );
    }

    /**
     * Handle the Model "updated" event.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public function updated(Model $model): void
    {
        if (config('journalism.enabled') === false) {
            return;
        }

        // Create journal entry only if not creating journal entry i.e. infinite recursion
        if ($model instanceof JournalEntry) {
            return;
        }

        app(JournalEntryHelper::class)->createJournalEntry(
            'update',
            $model,
            $model->toArray(),
        );
    }

    /**
     * Handle the Model "deleted" event.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public function deleted(Model $model): void
    {
        if (config('journalism.enabled') === false) {
            return;
        }

        // Create journal entry only if not creating journal entry i.e. infinite recursion
        if ($model instanceof JournalEntry) {
            return;
        }

        app(JournalEntryHelper::class)->createJournalEntry('delete', $model);
    }

    /**
     * Handle the Model "forceDeleted" event.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public function forceDeleted(Model $model): void
    {
        if (config('journalism.enabled') === false) {
            return;
        }

        // Create journal entry only if not creating journal entry i.e. infinite recursion
        if ($model instanceof JournalEntry) {
            return;
        }

        app(JournalEntryHelper::class)->createJournalEntry('delete', $model);
    }
}
```

Then, create an actual model observer, extending your base one:

```php
<?php

// app/Observers/UserObserver.php

namespace App\Observers;

class UserObserver extends Observer
{
}
```

Register it in `EventServiceProvider`:

```php
use App\Models\User;
use App\Observers\UserObserver;

public function boot()
{
    User::observe(UserObserver::class);
}
```

Now you can perform a database operation using the user model. A database row should appear in the `journal_entries` table!

### Using the Repository Pattern

**Coming soon!**

## License

Journalism is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Security Vulnerabilities

If you discover a security vulnerability within Journalism, please send an e-mail to Marco Marassi at security@marco-marassi.com. All security vulnerabilities will be promptly addressed.
