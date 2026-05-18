# Laravel Hierarchical Billing

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mahmoud-elboshy/laravel-hierarchical-billing.svg)](https://packagist.org/packages/mahmoud-elboshy/laravel-hierarchical-billing)
[![License](https://img.shields.io/github/license/Mahmoud-ElBoshy/laravel-hierarchical-billing)](LICENSE.md)
[![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%2B%2011%2B%2012%2B%2013%2B-red)](https://laravel.com)

A Laravel package for managing **hierarchical account billing** — supporting subscription, per-event, and sub-account billing models within a single tenant.

Built from real-world experience running a production SaaS platform.

---

## The Problem

Most billing packages handle simple user → subscription flows. But what if your SaaS has:

- A **main organization** paying a monthly subscription
- **Sub-accounts** (departments/branches) each with their own billing
- **Per-event charges** on top of the subscription

No existing package handles this out of the box. This one does.

---

## Features

- ✅ **3 billing models** in one package: Subscription, Per-Event, Sub-Account
- ✅ **Hierarchical accounts** — main accounts with unlimited sub-accounts
- ✅ **Polymorphic** — attach billing to any model (User, Organization, Team, etc.)
- ✅ **Transaction tracking** — full audit trail for every charge
- ✅ **Trial & Grace periods** — configurable out of the box
- ✅ **Gateway agnostic** — works with any payment gateway
- ✅ **Laravel 10, 11, 12 & 13** support

---

## Installation

```bash
composer require mahmoud-elboshy/laravel-hierarchical-billing
```

Publish and run migrations:

```bash
php artisan vendor:publish --tag="hierarchical-billing-migrations"
php artisan migrate
```

Publish config (optional):

```bash
php artisan vendor:publish --tag="hierarchical-billing-config"
```

---

## Usage

### 1. Add the trait to your model

```php
use MahmoudElBoshy\HierarchicalBilling\Traits\HasBilling;
use MahmoudElBoshy\HierarchicalBilling\Traits\HasSubAccounts;

class Organization extends Model
{
    use HasBilling, HasSubAccounts;
}
```

---

### 2. Subscription Billing

```php
// Subscribe an organization to a plan
$organization->subscribe('plan_pro', [
    'ends_at' => now()->addMonth(),
]);

// Check subscription status
$organization->isSubscribed(); // true

// Cancel subscription
$organization->cancelSubscription();
```

---

### 3. Per-Event Billing

```php
// Charge for a specific event
$billingAccount = $organization->billingAccount;

$billingAccount->billedEvents()->create([
    'event_reference' => 'EVENT-001',
    'event_type'      => 'conference',
    'amount'          => 500.00,
    'currency'        => 'SAR',
    'billed_at'       => now(),
]);
```

---

### 4. Sub-Account Billing

```php
// Create a sub-account under the main organization
$subAccount = $organization->createSubAccount([
    'metadata' => ['department' => 'Marketing'],
]);

// Check sub-account count
$organization->activeSubAccountsCount(); // 1

// Check if limit reached
$organization->hasReachedSubAccountLimit(); // false
```

---

### 5. Billing Status Checks

```php
$organization->isSubscribed();             // true/false
$organization->billingAccount->isActive(); // true/false
$organization->billingAccount->onTrial();  // true/false
$organization->billingAccount->hasExpired(); // true/false
$organization->billingAccount->isSubAccount(); // true/false
```

---

## Configuration

```php
// config/hierarchical-billing.php

return [
    'default_model'      => 'subscription', // subscription | per_event | sub_account
    'currency'           => 'SAR',
    'sub_account_limit'  => null,           // null = unlimited
    'trial_days'         => 14,
    'grace_period_days'  => 3,
];
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `billing_accounts` | Main & sub-accounts with hierarchy via `parent_id` |
| `billing_transactions` | Full transaction history |
| `billed_events` | Per-event billing records |

---

## Roadmap

- [ ] Artisan commands for billing management
- [ ] Webhook handling helpers
- [ ] Invoice generation
- [ ] Usage-based billing model
- [ ] Proration support

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT License. See [LICENSE](LICENSE.md) for details.

---

## Author

**Mahmoud El Boshy** — Senior Backend Engineer  
[GitHub](https://github.com/Mahmoud-ElBoshy) · [LinkedIn](https://www.linkedin.com/in/mahmoudelboshy/)
