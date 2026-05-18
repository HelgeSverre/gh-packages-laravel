# User Discounts

A production-ready Laravel package for deterministic, concurrency-safe user-level discounts with stacking support, usage caps, and comprehensive auditing.

## Features

- ✅ **Deterministic Stacking**: Discounts apply in a predictable order (priority → id)
- ✅ **Concurrency Safe**: Database-level locking prevents race conditions
- ✅ **Usage Caps**: Per-user usage limits enforced at database level
- ✅ **Percentage Cap**: Configurable maximum total percentage discount
- ✅ **Full Auditing**: All assignments, revocations, and applications logged
- ✅ **Idempotent**: Safe to retry operations without side effects
- ✅ **Laravel 10/11/12 Compatible**

## Requirements

- PHP ^8.2
- Laravel ^10.0 | ^11.0 | ^12.0

## Installation

Install via Composer:

```bash
composer require remotedeveloper007/user-discounts
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=user-discounts-config
```

Publish and run migrations:

```bash
php artisan vendor:publish --tag=user-discounts-migrations
php artisan migrate
```

## Configuration

The `config/user-discounts.php` file contains:

```php
return [
    // How discounts stack: 'priority' (uses stacking_priority field)
    'stacking_order' => 'priority',

    // Maximum total percentage discount (prevents >100% discounts)
    'max_percentage_cap' => 50,

    // Rounding mode: 'round' | 'floor' | 'ceil'
    'rounding_mode' => 'round',

    // Decimal precision for final amounts
    'precision' => 2,
];
```

## Usage

### Creating Discounts

```php
use Remotedeveloper007\UserDiscounts\Models\Discount;

$discount = Discount::create([
    'code' => 'WELCOME10',
    'type' => 'percentage', // or 'fixed'
    'value' => 10,
    'active' => true,
    'stacking_priority' => 1, // Lower = applied first
    'max_usage_per_user' => 3, // null = unlimited
    'starts_at' => now(),
    'ends_at' => now()->addDays(30),
]);
```

### Assigning Discounts to Users

```php
use Remotedeveloper007\UserDiscounts\Services\DiscountService;

$service = app(DiscountService::class);
$user = auth()->user();

$service->assign($user, $discount);
```

### Checking Eligibility

```php
if ($service->eligibleFor($user, $discount)) {
    // User can use this discount
}

// Get detailed eligibility with reason
$result = $service->eligibleForWithReason($user, $discount);
// Returns: ['eligible' => bool, 'reason' => string|null]
// Reasons: 'expired', 'inactive', 'revoked', 'usage_cap_reached', or null if eligible
```

**Eligibility Rules:**
- Discount must be active (`active = true`)
- Within valid date range (`starts_at` to `ends_at`)
- Not revoked for this user
- Usage cap not exceeded (if `max_usage_per_user` is set)

### Applying Discounts

```php
$originalPrice = 100.00;

// Simple apply (returns final amount only)
$finalPrice = $service->apply($user, $originalPrice);
// Automatically applies ALL eligible discounts in priority order

// Detailed apply (returns structured data for UI/API)
$result = $service->applyWithDetails($user, $originalPrice);
// Returns: [
//   'original_amount' => 100.00,
//   'final_amount' => 85.00,
//   'total_savings' => 15.00,
//   'applied' => [
//     ['code' => 'WELCOME10', 'type' => 'percentage', 'value' => 10, 'saved' => 10.00],
//     ['code' => 'SAVE5', 'type' => 'fixed', 'value' => 5, 'saved' => 5.00],
//   ],
//   'skipped' => [
//     ['code' => 'EXPIRED', 'reason' => 'expired'],
//   ],
// ]
```

### Revoking Discounts

```php
$service->revoke($user, $discount);
```

## How It Works

### Lifecycle

1. **Create** - Admin creates a discount in the system
2. **Assign** - Discount is assigned to specific users
3. **Eligible** - Check if user can still use the discount (active, not expired, usage cap not reached)
4. **Apply** - Discount is applied to an amount, usage is incremented, audit logged
5. **Revoke** - Discount assignment is revoked (soft delete)

### Determinism

Same inputs always produce same outputs:
- Discounts are sorted by `stacking_priority` (ASC), then `id` (ASC)
- No randomness in discount selection or application
- Reproducible across multiple requests

### Idempotency

Safe to retry operations:
- `assign()` - Uses `firstOrCreate`, won't duplicate
- `revoke()` - Sets timestamp, repeated calls have same effect
- `apply()` - Each call increments usage; designed for single application per transaction

### Concurrency Safety

Prevents race conditions:
- Uses database transactions
- `lockForUpdate()` on both discount and user_discount rows
- Eligibility re-checked within lock
- Usage incremented atomically

### Example: Preventing Double Application

❌ **Without locking:**
```
Request A: Check usage (0/1) ✓ → Apply → Increment (1)
Request B: Check usage (0/1) ✓ → Apply → Increment (2) ← BUG!
```

✅ **With locking:**
```
Request A: Lock → Check (0/1) ✓ → Apply → Increment (1) → Unlock
Request B: Wait → Lock → Check (1/1) ✗ → Skip → Unlock
```

## Events

Listen to these events in your application:

```php
use Remotedeveloper007\UserDiscounts\Events\{
    DiscountAssigned,
    DiscountRevoked,
    DiscountApplied
};

// In EventServiceProvider
protected $listen = [
    DiscountAssigned::class => [
        SendWelcomeEmail::class,
    ],
    DiscountApplied::class => [
        LogRevenueImpact::class,
    ],
];
```

## Database Schema

### discounts
- Stores discount definitions (code, type, value, dates, etc.)

### user_discounts
- Pivot table tracking which users have which discounts
- Stores `times_used` counter and revocation status

### discount_audits
- Immutable audit log of all discount operations
- Records: assigned, revoked, applied actions with metadata

## Testing

Run the test suite:

```bash
vendor/bin/phpunit
```

Example test validates usage cap enforcement:

```php
$service->assign($user, $discount); // max_usage_per_user = 1
$this->assertEquals(90.00, $service->apply($user, 100.00)); // Works
$this->assertEquals(100.00, $service->apply($user, 100.00)); // Skipped (cap reached)
```

## Production Considerations

### Indexes
All foreign keys and query columns are indexed for performance.

### Retry Safety
All operations are designed to be safe under retries and concurrent access.

### Extension Points
- Add custom validation logic by extending `DiscountService`
- Create listeners for events to trigger side effects
- Add custom discount types by extending the `Discount` model

### Future Enhancements
- Money library integration for precise currency handling
- Idempotency keys for duplicate request detection
- Discount facades for cleaner syntax
- Multi-currency support

## License

MIT License

## Support

For issues, questions, or contributions, please open an issue on GitHub.
