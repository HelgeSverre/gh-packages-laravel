# User Discounts Laravel Package

A reusable Laravel package for managing user-level discounts with deterministic stacking, usage caps, and concurrency safety.

## Installation

### Via Packagist (if published)
```bash
composer require taskb/user-discounts
```

### Via Git Repository
If the package is hosted on a Git repository (e.g., GitHub), add it to your `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/yourusername/user-discounts"
        }
    ],
    "require": {
        "taskb/user-discounts": "dev-main"
    }
}
```

Then run:
```bash
composer install
```

Publish the configuration and migrations:

```bash
php artisan vendor:publish --provider="TaskB\UserDiscounts\UserDiscountsServiceProvider" --tag=config
php artisan vendor:publish --provider="TaskB\UserDiscounts\UserDiscountsServiceProvider" --tag=migrations
```

Run the migrations:

```bash
php artisan migrate
```

## Configuration

The package comes with a configuration file `config/user_discounts.php` where you can set:

- `stacking_order`: Array defining the order to apply discount types (e.g., `['percentage', 'fixed']`).
- `max_percentage_cap`: Maximum total percentage discount (default: 100).
- `rounding_precision`: Decimal places for rounding (default: 2).

## Usage

### Using the DiscountService

Inject or resolve the `DiscountService`:

```php
use TaskB\UserDiscounts\Services\DiscountService;

$discountService = app(DiscountService::class);
```

#### Assign a Discount to a User

```php
$discountService->assign($userId, $discountId);
```

#### Check if User is Eligible for a Discount

```php
$eligible = $discountService->eligibleFor($userId, $discountId);
```

#### Revoke a Discount from a User

```php
$discountService->revoke($userId, $discountId);
```

#### Apply Discounts to a Base Amount

Applies all eligible discounts for the user in stacking order:

```php
$totalDiscount = $discountService->apply($userId, $baseAmount);
```

### Creating Discounts

Use the `Discount` model:

```php
use TaskB\UserDiscounts\Models\Discount;

$discount = Discount::create([
    'name' => '10% Off',
    'type' => 'percentage',
    'value' => 10.00,
    'is_active' => true,
    'expires_at' => now()->addDays(30),
    'usage_cap' => 5, // per user
]);
```

### Events

Listen to events for custom logic:

- `TaskB\UserDiscounts\Events\DiscountAssigned`
- `TaskB\UserDiscounts\Events\DiscountRevoked`
- `TaskB\UserDiscounts\Events\DiscountApplied`

## Testing

Run the included unit test:

```bash
php artisan test tests/Unit/DiscountServiceTest.php
```

## Features

- Deterministic discount stacking.
- Per-user usage caps.
- Expiration and active status checks.
- Concurrency-safe application.
- Full audit trail.
- Configurable stacking, caps, and rounding.