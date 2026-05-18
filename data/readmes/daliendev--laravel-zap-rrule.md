# laravel-zap-rrule

[RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) RRule support for [laravel-zap](https://github.com/ludoguenet/laravel-zap).

> Inspired by [feat: rrule support #71](https://github.com/ludoguenet/laravel-zap/pull/71) proposed by [@shavonn](https://github.com/shavonn).

## Installation

```bash
composer require laraveljutsu/zap
composer require daliendev/laravel-zap-rrule
```

No config changes needed. The service provider auto-discovers and wires everything.

## Usage

```php
use Zap\Facades\Zap;

// Every Monday, Wednesday, Friday
Zap::for($user)
    ->named('Standup')
    ->from('2025-01-06')->to('2025-12-31')
    ->addPeriod('09:00', '09:30')
    ->rrule('FREQ=WEEKLY;BYDAY=MO,WE,FR')
    ->save();

// 1st and 15th of every month
Zap::for($user)
    ->named('Billing run')
    ->from('2025-01-01')->to('2025-12-31')
    ->addPeriod('10:00', '11:00')
    ->rrule('FREQ=MONTHLY;BYMONTHDAY=1,15')
    ->save();

// First Monday of every month
Zap::for($user)
    ->named('Monthly review')
    ->from('2025-01-01')
    ->addPeriod('14:00', '15:00')
    ->rrule('FREQ=MONTHLY;BYDAY=1MO')
    ->save();

// Every 2 weeks on Tuesday (DTSTART derived from start_date)
Zap::for($user)
    ->named('Biweekly sync')
    ->from('2025-01-07')->to('2025-12-31')
    ->addPeriod('14:00', '15:00')
    ->rrule('FREQ=WEEKLY;INTERVAL=2;BYDAY=TU')
    ->save();
```

All existing laravel-zap APIs (`isBookableAt`, `getBookableSlots`, `forDate`, …) work transparently with rrule schedules.

## How it works

This package hooks into the three extension points laravel-zap exposes:

| Extension point                 | What we do                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `config('zap.models.schedule')` | Swap in `ZapRRule\Models\Schedule`                                                               |
| `SafeFrequencyConfigCast`       | Extend with `RRuleAwareFrequencyConfigCast` to deserialise `frequency = 'rrule'` rows            |
| `'zap'` container binding       | Rebind to our `ScheduleService` so `Zap::for()` returns our fluent builder (which has `rrule()`) |

The Eloquent query builder's `forDate()` scope is also extended to include rrule schedules in date queries; the per-occurrence check is delegated to `RRuleFrequencyConfig::shouldCreateRecurringInstance()` at the PHP level (same pattern used by laravel-zap for `monthly_ordinal_weekday`).

## Custom Schedule model

If you already have a custom Schedule model, extend ours instead of the base:

```php
// app/Models/Schedule.php
use ZapRRule\Models\Schedule as RRuleSchedule;

class Schedule extends RRuleSchedule
{
    // your customizations
}
```

Then set in `config/zap.php`:

```php
'models' => [
    'schedule' => App\Models\Schedule::class,
],
```

## Requirements

- PHP ≥ 8.2
- `laraveljutsu/laravel-zap` ^1.0
- `rlanvin/php-rrule` ^2.6 (installed automatically)

## License

[MIT](LICENSE)
