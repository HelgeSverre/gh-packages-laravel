# Laravel Impersonation (Jetstream + Livewire Compatible)

Allows admin users to log in as client accounts securely. This package is designed to work seamlessly with **Laravel Jetstream** and **Livewire** stacks.

---

## Installation

You can install the package via composer:

```bash
composer require henrymanyonyi/laravel-impersonation
```

### 1. Publish and Run Migrations
The package requires a way to track impersonation states. Publish and run the migrations with:

```bash
php artisan vendor:publish --tag=impersonation-migrations
php artisan migrate
```

### 2. Prepare the User Model
Add the `ImpersonatesUsers` trait to your `User` model. This provides the necessary logic to handle the session swapping.

```php
use Henrymanyonyi\Impersonation\Traits\ImpersonatesUsers;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use ImpersonatesUsers;
}
```

---

## Usage

### Start Impersonation
To login as a specific user, add a form pointing to the impersonation start route. You should typically wrap this in an `@can` or admin middleware check.

```html
<form method="POST" action="{{ route('impersonate.start', $user->id) }}">
    @csrf
    <button type="submit" class="btn btn-primary">
        Login as user
    </button>
</form>
```

### Stop Impersonation
When an admin is impersonating a user, you should display a banner or button to allow them to return to their original account.

```html
@if(session()->has('impersonator_id'))
    <div class="impersonation-banner">
        <p>You are currently logged in as <strong>{{ auth()->user()->name }}</strong></p>
        
        <form method="POST" action="{{ route('impersonate.stop') }}">
            @csrf
            <button type="submit">Return to admin</button>
        </form>
    </div>
@endif
```

---

## Security
By default, this package includes middleware to ensure only authorized users can initiate an impersonation session. Ensure your admin logic is properly defined in your `AuthServiceProvider` or via the package configuration.

## License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.# laravel-impersonation
