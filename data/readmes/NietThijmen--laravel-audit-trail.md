# Laravel audit trail
This is a really really basic audit trail implementation I made for school.

Should never ever ever be used in Production environments


## Installation
```bash
composer require nietthijmen/laravel-audit-trail
php artisan vendor:publish --provider "NietThijmen\LaravelAuditTrail\LaravelAuditTrailServiceProvider" --tag="audit-trail-provider"
php artisan vendor:publish --provider "NietThijmen\LaravelAuditTrail\LaravelAuditTrailServiceProvider" --tag="audit-trail-migrations"
```

## Usage
Add the following interface to your models:
```
NietThijmen\LaravelAuditTrail\Contracts\Auditable;
```

```diff
- class User extends Authenticatable {
+ class User extends Authenticatable implements Auditable {
```
