

Soap Laravel Subscriptions is a flexible plans and subscription management system for Laravel, with the required tools to run your SAAS like services efficiently. It's simple architecture, accompanied by powerful underlying to afford solid platform for your business.

 - Payments are out of scope for this package.
 - You may want to extend some of the core models, in case you need to override the logic behind some helper methods like renew(), cancel() etc. E.g.: when cancelling a subscription you may want to also cancel the recurring payment attached.
## Version Support
| Laravel Subscriptions      | Larvel Version      |
| ------------- | -------------------------------- |
| 1.x           | 10.x, 11.x on PHP 8.2 and 8.3w 1 |

## Support us





You can publish the config file with:

```bash

This is the contents of the published config file:

```php

return [

    // Manage autoload migrations
    'autoload_migrations' => true,

    // Subscriptions Database Tables
    'tables' => [

        'plans' => 'plans',
        'plan_features' => 'plan_features',
        'plan_subscriptions' => 'plan_subscriptions',
        'plan_feature_usage' => 'plan_feature_usage',

    ],

    // Subscriptions Models
    'models' => [

        'plan' => \Soap\LaravelSubscriptions\Models\Plan::class,
        'plan_feature' => \Soap\LaravelSubscriptions\Models\PlanFeature::class,
        'plan_subscription' => \Soap\LaravelSubscriptions\Models\PlanSubscription::class,
        'plan_feature_usage' => \Soap\LaravelSubscriptions\Models\PlanSubscriptionUsage::class,

    ],

];
```

