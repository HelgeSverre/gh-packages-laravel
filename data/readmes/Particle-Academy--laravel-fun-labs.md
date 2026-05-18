# Laravel Fun Lab

[![Powered by Tynn](https://img.shields.io/endpoint?url=https%3A%2F%2Ftynn.ai%2Fo%2Fparticle-academy%2Flaravel-fun-lab%2Fbadge.json)](https://tynn.ai/o/particle-academy/laravel-fun-lab)
[![Latest Version](https://img.shields.io/packagist/v/particle-academy/laravel-fun-lab.svg?style=flat-square)](https://packagist.org/packages/particle-academy/laravel-fun-lab)
[![License](https://img.shields.io/packagist/l/particle-academy/laravel-fun-lab.svg?style=flat-square)](https://packagist.org/packages/particle-academy/laravel-fun-lab)
[![Laravel](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-red.svg?style=flat-square)](https://laravel.com)

> Analytics disguised as gamification — turn user activity into meaningful engagement insights.

Laravel Fun Lab (LFL) is an analytics-driven gamification layer for Laravel applications. Track user engagement through XP, achievements, and prizes while capturing structured activity data that apps normally never track.

## Features

- 🎯 **Event-Driven Architecture** - Every action, reward, or update is an observable event
- 🎮 **GamedMetrics XP System** - Create independent XP buckets with automatic level progression
- 📊 **MetricLevelGroups** - Combine multiple XP metrics with weights for composite leveling
- 🏆 **Achievements** - Define and grant achievements with auto-unlock on level-up
- 🎁 **Prizes** - Reward users with virtual or physical prizes
- 📈 **Built-in Analytics** - Query aggregate engagement data for behavioral insights
- 🔌 **Extensible** - Macros, hooks, and custom implementations
- ⚡ **Drop-In Simple** - Install → Track → Award workflow

## Installation

```bash
composer require particle-academy/laravel-fun-lab
php artisan lfl:install
```

## Quick Start

### 1. Add the Awardable Trait

Add the `Awardable` trait to any model you want to gamify:

```php
use LaravelFunLab\Traits\Awardable;

class User extends Authenticatable
{
    use Awardable;
}

// Works with any model!
class Team extends Model
{
    use Awardable;
}
```

The `Awardable` trait gives your model a **Profile** that tracks XP, achievements, and prizes.

### 2. Create GamedMetrics (XP Categories)

GamedMetrics are independent XP buckets. Each metric tracks its own XP and levels:

```php
use LaravelFunLab\Facades\LFL;

// Create XP categories
LFL::setup(a: 'gamed-metric', with: ['slug' => 'combat-xp', 'name' => 'Combat XP']);
LFL::setup(a: 'gamed-metric', with: ['slug' => 'crafting-xp', 'name' => 'Crafting XP']);
LFL::setup(a: 'gamed-metric', with: ['slug' => 'social-xp', 'name' => 'Social XP']);
```

### 3. Define Levels for Metrics

Levels are XP thresholds that can auto-unlock achievements:

```php
// Define levels for combat-xp
LFL::setup(a: 'metric-level', with: ['metric' => 'combat-xp', 'level' => 1, 'xp' => 0, 'name' => 'Novice']);
LFL::setup(a: 'metric-level', with: ['metric' => 'combat-xp', 'level' => 2, 'xp' => 100, 'name' => 'Apprentice']);
LFL::setup(a: 'metric-level', with: ['metric' => 'combat-xp', 'level' => 3, 'xp' => 500, 'name' => 'Warrior']);
LFL::setup(a: 'metric-level', with: ['metric' => 'combat-xp', 'level' => 4, 'xp' => 1000, 'name' => 'Champion']);
```

### 4. Award XP

Award XP using the fluent `award()` method:

```php
// Award XP to a specific GamedMetric
LFL::award('combat-xp')
    ->to($user)
    ->amount(50)
    ->because('defeated boss')
    ->save();

// Check the profile
$profile = $user->getProfile();
echo $profile->total_xp; // Total XP across all metrics
```

### 5. Create and Grant Achievements

```php
// Create an achievement
LFL::setup(a: 'achievement', with: ['slug' => 'first-login', 'name' => 'First Login', 'description' => 'Welcome!', 'icon' => 'star']);

// Grant the achievement
LFL::grant('first-login')
    ->to($user)
    ->because('completed onboarding')
    ->save();

// Check if user has an achievement
if ($user->hasAchievement('first-login')) {
    // ...
}
```

### 6. Create and Grant Prizes

```php
// Create a prize
LFL::setup(
    a: 'prize',
    with: [
        'slug' => 'premium-access',
        'name' => '1 Month Premium Access',
        'type' => 'virtual',
        'inventory' => 100, // Limited quantity
    ]
);

// Grant the prize
LFL::grant('premium-access')
    ->to($user)
    ->because('won monthly contest')
    ->save();
```

### 7. Check Level Progress

```php
// Check if user has reached a specific level in a metric
if (LFL::hasLevel($user, 3, metric: 'combat-xp')) {
    echo "You're a Warrior!";
}

// Check level in a metric group
if (LFL::hasLevel($user, 10, group: 'overall-power')) {
    echo "You've reached Overall Power Level 10!";
}
```

### 8. Create Metric Level Groups

Combine multiple metrics with weights for composite leveling:

```php
// Create a group
LFL::setup(a: 'metric-level-group', with: ['slug' => 'overall-power', 'name' => 'Overall Power']);

// Add metrics to the group with weights
LFL::setup(a: 'metric-level-group-metric', with: ['group' => 'overall-power', 'metric' => 'combat-xp', 'weight' => 1.0]);
LFL::setup(a: 'metric-level-group-metric', with: ['group' => 'overall-power', 'metric' => 'crafting-xp', 'weight' => 0.5]);

// Define levels for the group
LFL::setup(a: 'metric-level-group-level', with: ['group' => 'overall-power', 'level' => 1, 'xp' => 0, 'name' => 'Beginner']);
LFL::setup(a: 'metric-level-group-level', with: ['group' => 'overall-power', 'level' => 10, 'xp' => 5000, 'name' => 'Expert']);
```

### 9. Leaderboards

```php
// Get top users by XP
$leaders = LFL::leaderboard()
    ->for(User::class)
    ->by('xp')
    ->take(10);
```

## API Summary

| Method                                            | Purpose                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| `LFL::setup()`                                    | Create GamedMetrics, MetricLevels, MetricLevelGroups, Achievements, Prizes |
| `LFL::award($metric)`                             | Award XP to a GamedMetric (fluent builder)                                 |
| `LFL::grant($slug)`                               | Grant an Achievement or Prize (fluent builder)                             |
| `LFL::hasLevel($user, $level, metric: or group:)` | Check if user has reached a level                                          |
| `LFL::profile($user)`                             | Get the user's gamification profile                                        |
| `LFL::leaderboard()`                              | Build leaderboard queries                                                  |
| `LFL::analytics()`                                | Build analytics queries                                                    |

## Documentation

- **[Usage Guide](docs/usage.md)** - Examples and patterns
- **[API Reference](docs/api.md)** - PHP facade + REST API documentation
- **[React / SPA Integration](docs/react.md)** - Auth contract, CORS, Echo, typed clients
- **[Broadcasting](docs/broadcasting.md)** - Real-time event channels and payloads
- **[Configuration](docs/configuration.md)** - All configuration options
- **[Extending](docs/extending.md)** - Custom implementations and hooks

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x

## License

MIT License - see [LICENSE](LICENSE) for details.
