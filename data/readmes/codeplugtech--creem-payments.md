# Laravel Creem Payments Package

1. Add the `Billable` trait to your billable model definition.

```php
use Codeplugtech\CreemPayments\Billable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Billable;
}
```

2. Add API Keys to your `.env` file

```
CREEM_API_KEY=YOUR_API_KEY
CREEM_SANDBOX=true
CREEM_WEBHOOK_SECRET=YOUR_WEBHOOK_KEY
```

3. You can create a checkout session using the code below:

```php
$user->subscription()->createCheckoutSession([
    'product_id' => 'prod_123',
    'customer_email' => $user->email,
     // other parameters
]);
```

or via the static method:

```php
use Codeplugtech\CreemPayments\CreemPayments;

CreemPayments::createCheckoutSession([
    'product_id' => 'prod_123',
    'customer_email' => 'test@example.com'
]);
```

4. Exclude `creem/*` from CSRF protection in `bootstrap/app.php` file for Laravel 11

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'creem/*',
    ]);
})
```
