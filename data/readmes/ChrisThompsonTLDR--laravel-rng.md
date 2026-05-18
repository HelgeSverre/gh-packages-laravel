# Laravel RNG

Deterministic, stream-isolated RNG for Laravel using PHP's native Random extension. Ideal for games, simulations, and reproducible seeding pipelines.

## Installation

```bash
composer require christhompsontldr/laravel-rng
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=rng-config
```

Environment variables:

| Variable | Description |
|----------|-------------|
| `RNG_MASTER_SEED` | Master seed for deterministic RNG. When set, all streams produce reproducible sequences. |
| `RNG_LOGGING` | When `true`, each roll is logged for audit (use `rng:audit` to view). |

## Basic Usage

```php
use Rng\RngManager;

$rng = app(RngManager::class);
$stream = $rng->for('my_stream');

// Integer in range (inclusive)
$roll = $stream->int(1, 20);  // d20

// Boolean with probability (0.0 - 1.0)
$hit = $stream->chance(0.75);  // 75% hit chance

// Pick one item from array (uniform)
$item = $stream->pick(['sword', 'shield', 'potion']);
```

Streams are isolated: `seeding` and `combat` produce independent sequences from the same master seed.

## RPG Seeding Example

Reproducible unit generation for a low-fantasy game:

```php
use Rng\RngManager;

$rng = app(RngManager::class);
$seeding = $rng->for('seeding');

$archetypes = ['scout', 'heavy', 'mixed'];
$units = [];

for ($i = 0; $i < 25; $i++) {
    $arch = $seeding->pick($archetypes);
    $cp = $seeding->int(60, 90);
    $ipBudget = 100 - $cp;
    $units[] = compact('arch', 'cp', 'ipBudget');
}
// Same master seed → same 25 units every run
```

With a database factory (e.g. Newland `UnitFactory`):

```php
$rng = app(RngManager::class);
$seeding = $rng->for('seeding');

for ($i = 0; $i < 25; $i++) {
    $arch = $seeding->pick(['scout', 'heavy', 'mixed']);
    $cp = $seeding->int(60, 90);
    UnitFactory::new()
        ->lowFantasy()
        ->archetype($arch)
        ->cpValue($cp)
        ->create(['ip_budget' => 100 - $cp]);
}
```

## Combat Example

Deterministic combat rolls per turn:

```php
$rng = app(RngManager::class);
$combat = $rng->for('combat');

// Initiative
$initiative = $combat->int(1, 20);

// Attack roll
$attackRoll = $combat->int(1, 20);

// Damage
$damage = $combat->int(2, 12);

// Hit chance (e.g. 65%)
$hit = $combat->chance(0.65);
```

When `rng.logging` is `true`, each roll is logged with stream name, roll index, type, and result. Run `php artisan rng:audit` to inspect.

## Testing

Override the master seed in tests for predictable fixtures:

```php
// In setUp() or test
config(['rng.default_master_seed' => 42]);

$rng = app(RngManager::class);
$stream = $rng->for('seeding');
$arch = $stream->pick(['scout', 'heavy']);  // Deterministic
```

Or inject directly when not using the container:

```php
$manager = new \Rng\RngManager(42);
$stream = $manager->for('seeding');
```

Use `rng:test-seed` to generate a sample roll sequence for fixtures:

```bash
php artisan rng:test-seed
# Seed: 42
# [16, 4, 13, 19, 1]

php artisan rng:test-seed 12345
# Seed: 12345
# [19, 7, 14, 18, 20]
```

## Artisan Commands

| Command | Description |
|---------|-------------|
| `rng:seed {seed}` | Set `RNG_MASTER_SEED` in `.env` |
| `rng:audit` | Show logged rolls (when logging enabled) |
| `rng:test-seed {seed?}` | Output seed and sample d20 sequence for fixtures |

## Requirements

- PHP 8.4+
- Laravel 12+

## License

MIT
