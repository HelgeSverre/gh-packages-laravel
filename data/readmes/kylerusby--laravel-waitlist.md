# Laravel Waitlist

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kylerusby/laravel-waitlist.svg?style=flat-square)](https://packagist.org/packages/kylerusby/laravel-waitlist)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/kylerusby/laravel-waitlist/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/kylerusby/laravel-waitlist/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/kylerusby/laravel-waitlist/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/kylerusby/laravel-waitlist/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/kylerusby/laravel-waitlist.svg?style=flat-square)](https://packagist.org/packages/kylerusby/laravel-waitlist)

A beautiful, ready-to-use Laravel package for managing waitlists. Collect email addresses from interested users with a stunning, pre-built landing page styled with Tailwind CSS. Perfect for product launches, beta releases, or any project that needs to build anticipation.

## Requirements

- PHP 8.4 or higher
- Laravel 11.x or 12.x

## Features

- 🎨 **Beautiful Pre-built UI** - Modern, responsive waitlist page with Tailwind CSS
- 📧 **Email Collection** - Simple form with validation and unique email constraint
- ⚙️ **Highly Configurable** - Customize text, colors, and behavior via config
- 🛣️ **Flexible Routing** - Enable/disable routes or override paths and middleware
- 🎯 **Easy Integration** - Works out of the box with zero configuration
- 🔒 **Form Validation** - Built-in request validation with custom error messages
- 🎭 **Customizable Views** - Publish and modify the Blade template to match your brand

## Installation

### Via Composer

```bash
composer require kylerusby/laravel-waitlist
```

### Local Development

To use this package locally in your Laravel project:

1. Add the path repository to your project's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "/path/to/laravel-waitlist",
            "options": {
                "symlink": true
            }
        }
    ]
}
```

2. Require the package:

```bash
composer require kylerusby/laravel-waitlist @dev
```

### Publish and Run Migrations

```bash
php artisan vendor:publish --tag="waitlist-migrations"
php artisan migrate
```

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag="waitlist-config"
```

### Publish Views (Optional)

```bash
php artisan vendor:publish --tag="waitlist-views"
```

## Usage

Once installed, the package works immediately with zero configuration!

### Quick Start

Visit `/waitlist` in your Laravel application to see the pre-built waitlist page. Users can enter their email addresses, and they'll be saved to the database.

### Accessing Waitlist Data

```php
use KyleRusby\LaravelWaitlist\Models\Waitlist;

// Get all waitlist entries
$entries = Waitlist::all();

// Get recent entries
$recent = Waitlist::latest()->take(10)->get();

// Export emails
$emails = Waitlist::pluck('email')->toArray();

// Count total signups
$count = Waitlist::count();
```

### Named Routes

The package registers named routes that you can use in your application:

```php
// Generate URLs
route('waitlist.index')  // GET /waitlist
route('waitlist.store')  // POST /waitlist

// In Blade templates
<a href="{{ route('waitlist.index') }}">Join Waitlist</a>

// In redirects
return redirect()->route('waitlist.index');
```

### Custom Controller Usage

If you disable the default routes, you can use the controller in your own routes:

```php
use KyleRusby\LaravelWaitlist\Http\Controllers\WaitlistController;

Route::get('/join-us', [WaitlistController::class, 'index'])->name('waitlist.index');
Route::post('/join-us', [WaitlistController::class, 'store'])->name('waitlist.store');
```

## Configuration

After publishing the config file, you'll find it at `config/waitlist.php`. Here are the available options:

### Enable/Disable Waitlist

Control whether the waitlist functionality is enabled:

```php
// .env
WAITLIST_ENABLED=true

// Or in config/waitlist.php
'enabled' => env('WAITLIST_ENABLED', true),
```

### Route Configuration

Customize the routes or disable them entirely:

```php
'routes' => [
    'enabled' => true,              // Enable/disable package routes
    'prefix' => '',                 // Add a prefix (e.g., 'early-access')
    'middleware' => ['web'],        // Apply middleware
    'paths' => [
        'index' => '/waitlist',     // GET route path
        'store' => '/waitlist',     // POST route path
    ],
],
```

**Examples:**

Disable routes to use your own:
```php
'routes' => [
    'enabled' => false,
],
```

Add a prefix and custom path:
```php
'routes' => [
    'prefix' => 'early-access',
    'paths' => [
        'index' => '/join',
        'store' => '/join',
    ],
],
// Routes will be: /early-access/join
```

Apply guest middleware:
```php
'routes' => [
    'middleware' => ['web', 'guest'],
],
```

### Page Content

Customize the waitlist page text and appearance:

```php
'headline' => 'Be the First to Experience Something Amazing',
'subheadline' => 'Join our exclusive waitlist and get early access when we launch.',
'badge_text' => 'Limited Early Access',
'button_text' => 'Join Waitlist',
'success_message' => 'Thank you for joining! We\'ll be in touch soon.',
'member_count' => 1234,  // Displayed as social proof
```

**Note:** The success message is displayed in the view template. The controller returns "Added to waitlist!" as a flash message. To customize both, publish the views and modify the template.

### Form Validation

The package includes built-in form validation with custom error messages:

```php
// Validation rules
'email' => [
    'required',
    'email',
    'unique:waitlist,email',
]

// Custom error messages
'email.required' => 'Please provide an email address.'
'email.email' => 'Please provide a valid email address.'
'email.unique' => 'This email is already on the waitlist.'
```

### Complete Configuration Example

```php
<?php

return [
    'enabled' => env('WAITLIST_ENABLED', true),

    'routes' => [
        'enabled' => true,
        'prefix' => 'beta',
        'middleware' => ['web', 'throttle:60,1'],
        'paths' => [
            'index' => '/signup',
            'store' => '/signup',
        ],
    ],

    'headline' => 'Join the Beta Program',
    'subheadline' => 'Get exclusive early access to our new platform.',
    'badge_text' => '🚀 Beta Access',
    'button_text' => 'Get Early Access',
    'success_message' => 'Welcome to the beta! Check your email for next steps.',
    'member_count' => 500,
];
```

## Cloudflare Turnstile (Optional)

Protect your waitlist form from bots using Cloudflare Turnstile. This package ships with a Blade component and server-side validation ready to use.

### 1) Enable and Configure

Add the following to your `.env`:

```env
CLOUDFLARE_TURNSTILE_ENABLED=true
CLOUDFLARE_SITE_KEY=your-site-key
CLOUDFLARE_TURNSTILE_SECRET=your-secret-key

# Optional (defaults shown)
CLOUDFLARE_TURNSTILE_THEME=light
CLOUDFLARE_TURNSTILE_SIZE=normal
CLOUDFLARE_TURNSTILE_CALLBACK=onSuccess
```

The config lives under `config/waitlist.php` → `turnstile`.

### 2) Use with the Package’s Built-in View

If you’re using the provided stub at `GET /waitlist`, Turnstile is already included. Just set your `.env` values above and you’re done.

### 3) Include in Your Own Blade View

If you aren’t using the provided stub, you can include the component inside your form:

```blade
<form method="POST" action="{{ route('waitlist.store') }}">
    @csrf

    <input type="email" name="email" required>

    {{-- Cloudflare Turnstile --}}
    <x-waitlist::turnstile />

    <button type="submit">Join Waitlist</button>
</form>
```

The component automatically:
- Loads the Turnstile script
- Renders the widget
- Provides `cf-turnstile-response` for server-side validation

Prefer to embed manually? You can, but don’t include both the component and manual embed at the same time:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<div
  class="cf-turnstile"
  data-sitekey="{{ config('waitlist.turnstile.site_key') }}"
  data-theme="{{ config('waitlist.turnstile.theme') }}"
  data-size="{{ config('waitlist.turnstile.size') }}"
  data-callback="{{ config('waitlist.turnstile.callback') }}"
></div>
```

### 4) Server-side Verification

When `CLOUDFLARE_TURNSTILE_ENABLED=true`, the package’s request validator automatically verifies the token for the built-in `POST /waitlist` route.

If you use your own controller/request, add the rule yourself:

```php
use KyleRusby\LaravelWaitlist\Rules\TurnstileRule;

// In a FormRequest
public function rules(): array
{
    return [
        'email' => ['required', 'email'],
        'cf-turnstile-response' => ['required', new TurnstileRule($this->ip())],
    ];
}
```

Or in a controller/route closure:

```php
use Illuminate\Http\Request;
use KyleRusby\LaravelWaitlist\Rules\TurnstileRule;

Route::post('/waitlist', function (Request $request) {
    $request->validate([
        'email' => ['required', 'email'],
        'cf-turnstile-response' => ['required', new TurnstileRule($request->ip())],
    ]);

    // ...store email
});
```

Notes:
- Tokens are single-use and valid for ~5 minutes.
- The widget auto-populates `cf-turnstile-response` on form submit.

## Customization

### Customizing the View

Publish the views to customize the waitlist page:

```bash
php artisan vendor:publish --tag="waitlist-views"
```

The view will be published to `resources/views/vendor/laravel-waitlist/waitlist.blade.php`. You can then modify the HTML, styling, and layout to match your brand.

### Using Your Own View

If you've disabled the package routes, you can create your own controller and view:

```php
// routes/web.php
use Illuminate\Http\Request;
use KyleRusby\LaravelWaitlist\Models\Waitlist;

Route::get('/waitlist', function () {
    return view('my-custom-waitlist');
});

Route::post('/waitlist', function (Request $request) {
    $request->validate([
        'email' => 'required|email|unique:waitlist,email',
    ]);
    
    Waitlist::create([
        'email' => $request->email,
    ]);
    
    return back()->with('success', 'Added to waitlist!');
});
```

### Database Model

The `Waitlist` model is a standard Eloquent model with the following attributes:

- `id` - Primary key
- `email` - Unique email address (string, 255)
- `created_at` - Timestamp
- `updated_at` - Timestamp

You can extend or customize it by creating your own model that extends the package's model:

```php
namespace App\Models;

use KyleRusby\LaravelWaitlist\Models\Waitlist as BaseWaitlist;

class Waitlist extends BaseWaitlist
{
    // Add custom scopes
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Add custom methods
    public function notify()
    {
        // Send notification email
    }
    
    // Add custom attributes
    public function getIsRecentAttribute(): bool
    {
        return $this->created_at->isToday();
    }
}
```

**Usage:**

```php
// Using custom scope
$recentSignups = Waitlist::recent(30)->get();

// Using custom attribute
$entry = Waitlist::first();
if ($entry->is_recent) {
    // Do something
}
```

## Advanced Usage

### Exporting Waitlist

Export all emails to a CSV:

```php
use KyleRusby\LaravelWaitlist\Models\Waitlist;

Route::get('/export-waitlist', function () {
    $filename = 'waitlist-' . now()->format('Y-m-d') . '.csv';
    $headers = [
        'Content-Type' => 'text/csv',
        'Content-Disposition' => "attachment; filename=\"$filename\"",
    ];

    $callback = function () {
        $file = fopen('php://output', 'w');
        fputcsv($file, ['Email', 'Joined At']);

        Waitlist::chunk(200, function ($entries) use ($file) {
            foreach ($entries as $entry) {
                fputcsv($file, [
                    $entry->email,
                    $entry->created_at->format('Y-m-d H:i:s'),
                ]);
            }
        });

        fclose($file);
    };

    return response()->stream($callback, 200, $headers);
});
```

### Email Notifications

Send notifications to new signups using model observers:

```php
// In a service provider (e.g., AppServiceProvider)
use KyleRusby\LaravelWaitlist\Models\Waitlist;
use Illuminate\Support\Facades\Mail;

public function boot()
{
    Waitlist::created(function ($waitlist) {
        Mail::to($waitlist->email)->send(new WelcomeToWaitlist($waitlist));
    });
}
```

Or create a custom observer:

```php
// app/Observers/WaitlistObserver.php
namespace App\Observers;

use KyleRusby\LaravelWaitlist\Models\Waitlist;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeToWaitlist;

class WaitlistObserver
{
    public function created(Waitlist $waitlist): void
    {
        Mail::to($waitlist->email)->send(new WelcomeToWaitlist($waitlist));
    }
}

// Register in AppServiceProvider
use App\Observers\WaitlistObserver;

public function boot()
{
    Waitlist::observe(WaitlistObserver::class);
}
```

### Adding Additional Fields

If you need to collect more than just email addresses, follow these steps:

1. **Publish and modify the migration:**

```php
// database/migrations/create_waitlist_table.php
Schema::create('waitlist', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->string('name')->nullable();
    $table->string('company')->nullable();
    $table->text('reason')->nullable();
    $table->timestamps();
});
```

2. **Update the model's fillable attributes:**

```php
namespace App\Models;

use KyleRusby\LaravelWaitlist\Models\Waitlist as BaseWaitlist;

class Waitlist extends BaseWaitlist
{
    protected $fillable = [
        'email',
        'name',
        'company',
        'reason',
    ];
}
```

3. **Extend the form request validation:**

```php
namespace App\Http\Requests;

use KyleRusby\LaravelWaitlist\Http\Requests\StoreWaitlistRequest;

class CustomWaitlistRequest extends StoreWaitlistRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'reason' => 'nullable|string|max:1000',
        ]);
    }
}
```

4. **Publish and modify the view** to include the new form fields.

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Run static analysis:

```bash
composer analyse
```

Format code:

```bash
composer format
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Kyle Rusby](https://github.com/kylerusby)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
