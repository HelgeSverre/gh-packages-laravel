# Laravel Test Data Blueprints

Reusable **scenario-based test datasets** for Laravel applications — built on top of factories, but designed to model full domain states.

## What you get 
- Fluent DSL: `Blueprint::define(...)->create(...)->tap(...)`
- `@ref` token resolution: `@company`, `@company.id`, `@users[0].id`
- Composition: `->use('base-blueprint')`
- Snapshots: `->snapshot()` + `UsesBlueprints` trait caches datasets per test process (and params)
- Time travel: `->at('2025-01-01')` via `Carbon::setTestNow()` (restored after run)
- Artisan generator: `php artisan make:blueprint SaaSCompany`

## Install
```bash
composer require binarysolutions/test-data-blueprints --dev
```

Publish config (optional):
```bash
php artisan vendor:publish --tag=test-data-blueprints-config
```

## Define a blueprint
Blueprint files are plain PHP in `./blueprints/*.php` returning a Blueprint instance.

```php
<?php

use BinarySolutions\TestDataBlueprints\Fluent\Blueprint;
use App\Models\Company;
use App\Models\User;

return Blueprint::define('saas-company')
    ->at('2025-01-01')
    ->create(Company::factory(), as: 'company')
    ->create(User::factory()->count(5)->for('@company'), as: 'users')
    ->snapshot();
```

## Composition
```php
return Blueprint::define('company-with-subscription')
    ->use('saas-company')
    ->create(Subscription::factory()->for('@company'), as: 'subscription')
    ->snapshot();
```

## Use in PHPUnit
```php
use BinarySolutions\TestDataBlueprints\Testing\UsesBlueprints;

class MyTest extends TestCase {
    use UsesBlueprints;

    public function test_it_works() {
        $refs = $this->blueprint('saas-company', ['users' => 3]);
        $this->assertCount(3, $refs->get('users'));
    }
}
```

## Use in Pest
```php
use BinarySolutions\TestDataBlueprints\Testing\UsesBlueprints;

uses(UsesBlueprints::class)->in('Feature', 'Unit');
```
