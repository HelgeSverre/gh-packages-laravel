# Impersonation

This package is aimed for role-based Laravel site, enabling user to impersonate as another user.

## Usage

This package will register a route of `/impersonation`, which list all of the users.

After impersonating as an user, you have to logout then login again in order to getting back to your account.

Since this package uses `Auth::loginUsingId()`, when impersonating, the user getting impersonated will be shown on the debugbar.

## Installation

```shell
composer require nycu-csit/laravel-impersonation:^3.0.0
```

## Configuration

```shell
php artisan vendor:publish --tag=impersonation
```

Available options:

- `enabled`: Whether to enable this package or not.
- `impersonable_roles`: Array of role names that can impersonate as other users.
- `post_impersonation_route`: The path to redirect to after impersonation.
- `display_columns`: Array of column names getting displayed when visiting `/impersonation`. Leave empty to show all columns.

## Test

```shell
./vendor/bin/phpunit
```

## Customize Impersonation Policy

This package uses [policy discovery](https://laravel.com/docs/12.x/authorization#policy-discovery) mechanism provided by Laravel.
That is, by default, if the user model is called `User` in your app, you should implement `impersonate(User $user): bool` in your `UserPolicy` class.
However, if you bind another policy onto your user model, you should implement `impersonate(User $user): bool` in such policy instead.

For example, in `app/Policies/UserPolicy.php`, you should either

1. use the trait [`NycuCsit\Impersonation\Traits\ImpersonationPolicyTrait`](./src/Traits/ImpersonationPolicyTrait.php), or
2. provide custom impersonation logic like the following snippet

   ```php
   <?php

   namespace App\Policies;

   use App\Model\User;

   class UserPolicy
   {
       public function impersonate(User $user): bool
       {
           $roles = $user->roles()->pluck('name');
           return $roles->contains(
               fn ($role) => in_array($role, ['admin'])
           );
       }
   }
   ```

For more examples, you can see [workbench/app/Policies/NotAutoDiscoverableCustomUserPolicy.php](./workbench/app/Policies/NotAutoDiscoverableCustomUserPolicy.php).
