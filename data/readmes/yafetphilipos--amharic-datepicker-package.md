# Amharic Datepicker for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/yafet/amharic-datepicker.svg?style=flat-square)](https://packagist.org/packages/yafet/amharic-datepicker)
[![Total Downloads](https://img.shields.io/packagist/dt/yafet/amharic-datepicker.svg?style=flat-square)](https://packagist.org/packages/yafet/amharic-datepicker)

A premium, modern Ethiopian (Amharic) calendar datepicker for Laravel 11, 12, and 13.

Built with **Alpine.js** and **Vanilla JavaScript**, this package replaces outdated jQuery-based implementations with a clean, modern, high-performance experience for both developers and end users.

It includes:

- A fully interactive Ethiopian calendar datepicker UI.
- Seamless Livewire integration.
- Elegant Ethiopian ↔ Gregorian date conversion utilities.
- Powerful Ethiopian date formatting helpers.
- Eloquent model integration.
- Timezone-aware backend conversion support.
- Zero jQuery dependency.

---

# What's New in This Version

This release introduces a major upgrade to Ethiopian/Gregorian conversion handling and developer ergonomics.

## New Features

### 1. Elegant `EthiopianDate` Object

Conversions now return a dedicated `EthiopianDate` object instead of a raw array.

This provides:

- Rich formatting support.
- Array-style access compatibility.
- Cleaner Blade rendering.
- Safer date handling.

Example:

```php
$ethDate = $calendar->fromGregorian('2024-05-06');

echo $ethDate->format('F j, Y');
// ሚያዝያ 28, 2016
```

---

### 2. Powerful Formatting Support

The new formatter supports:

| Format | Description                | Example |
| ------ | -------------------------- | ------- |
| `d`    | Day with leading zero      | `01`    |
| `j`    | Day without leading zero   | `1`     |
| `m`    | Month with leading zero    | `08`    |
| `n`    | Month without leading zero | `8`     |
| `F`    | Full Amharic month name    | `ሚያዝያ`  |
| `M`    | Short Amharic month name   | `ሚያዝ`   |
| `Y`    | Ethiopian year             | `2016`  |

Examples:

```php
$date->format('d/m/Y');
// 28/08/2016

$date->format('F j, Y');
// ሚያዝያ 28, 2016

$date->format('M j');
// ሚያዝ 28
```

---

### 3. Graceful Gregorian Input Handling

`fromGregorian()` now accepts multiple input types automatically.

Supported inputs:

```php
$calendar->fromGregorian('2024-05-06');

$calendar->fromGregorian(new DateTime());

$calendar->fromGregorian(time());

$calendar->fromGregorian([2024, 5, 6]);
```

No manual parsing required.

---

### 4. Improved Ethiopian → Gregorian Conversion

`toGregorian()` now supports multiple Ethiopian date formats.

Supported:

```php
$calendar->toGregorian(2016, 8, 28);

$calendar->toGregorian('2016-08-28');

$calendar->toGregorian('28/08/2016');
```

Returns a native `DateTime` instance.

---

### 5. New Static `now()` Helper

Quickly access the current Ethiopian date.

```php
$today = EthiopianCalendar::now();

echo $today->format('F j, Y');
```

Timezone supported:

```php
$today = EthiopianCalendar::now('Africa/Addis_Ababa');
```

---

### 6. New Eloquent Trait

A new `HasEthiopianCalendar` trait makes Ethiopian formatting effortless inside models.

Example:

```php
use Yafet\AmharicDatepicker\Traits\HasEthiopianCalendar;

class Member extends Model
{
    use HasEthiopianCalendar;

    protected $casts = [
        'dob' => 'date',
    ];
}
```

Usage:

```blade
{{ $member->ethiopian('dob', 'F j, Y') }}
```

Output:

```text
ሚያዝያ 29, 2009
```

---

### 7. Cleaner Modern Asset Management

This version introduces Vite aliases for cleaner imports.

No more ugly imports like:

```js
../../public/vendor/...
```

Now simply use:

```js
import amharicDatepicker from "amharic-datepicker/js/datepicker.js";
```

---

# Features

- ✅ Zero jQuery
- ✅ Alpine.js powered
- ✅ Livewire compatible
- ✅ Ethiopian ↔ Gregorian conversion
- ✅ Rich Ethiopian formatting engine
- ✅ Eloquent model integration
- ✅ Inline and popup modes
- ✅ Month/year dropdown navigation
- ✅ Custom year ranges
- ✅ Timezone support
- ✅ Tailwind-friendly design
- ✅ Pagume + leap year support
- ✅ Production-ready calendar logic

---

# Installation

## 1. Install via Composer

```bash
composer require yafet/amharic-datepicker
```

---

## 2. Publish Assets

```bash
php artisan vendor:publish --tag=amharic-datepicker-assets
```

---

# Modern Vite Setup (Recommended)

## vite.config.js

```js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [laravel(["resources/css/app.css", "resources/js/app.js"])],

  resolve: {
    alias: {
      "amharic-datepicker": path.resolve(
        __dirname,
        "vendor/yafet/amharic-datepicker/resources",
      ),
    },
  },
});
```

---

## resources/js/app.js

```js
import amharicDatepicker from "amharic-datepicker/js/datepicker.js";

window.amharicDatepicker = amharicDatepicker;
```

---

## resources/css/app.css

```css
@import "amharic-datepicker/css/datepicker.css";
```

---

# Usage

# Basic Usage (Popup)

```blade
<x-amharic-datepicker name="appointment_date" />
```

---

# Livewire Usage

## wire:model

```blade
<x-amharic-datepicker
    name="dob"
    wire:model="dob"
/>
```

## wire:model.live

```blade
<x-amharic-datepicker
    name="dob"
    wire:model.live="dob"
/>
```

## With Custom Classes

```blade
<x-amharic-datepicker
    name="dob"
    wire:model.live="dob"
    class="w-full rounded-lg border-gray-300"
/>
```

---

# Inline Calendar Mode

```blade
<x-amharic-datepicker
    name="event_date"
    inline="true"
/>
```

---

# Setting Default Values

```blade
<x-amharic-datepicker
    name="dob"
    value="2016-08-28"
/>
```

---

# Custom Format

```blade
<x-amharic-datepicker
    name="meeting_date"
    format="yyyy-mm-dd"
/>
```

---

# Custom Year Range

```blade
<x-amharic-datepicker
    name="dob"
    yearStart="1950"
    yearEnd="2050"
/>
```

---

# Error Customization

By default, the component provides a premium error message design with an icon. However, you can customize it using the `error` slot to match your theme (e.g., when using **Flux** or **Volt**).

```blade
<x-amharic-datepicker name="dob" wire:model="dob">
    <x-slot:error>
        @error('dob')
            <flux:error>{{ $message }}</flux:error>
        @enderror
    </x-slot:error>
</x-amharic-datepicker>
```

---

# Backend Conversion Usage

# Initialize Calendar

```php
use Yafet\AmharicDatepicker\EthiopianCalendar;

$calendar = new EthiopianCalendar('Africa/Addis_Ababa');
```

---

# Gregorian → Ethiopian

## From String

```php
$ethDate = $calendar->fromGregorian('2024-05-06');
```

## From DateTime

```php
$ethDate = $calendar->fromGregorian(new DateTime());
```

## From Timestamp

```php
$ethDate = $calendar->fromGregorian(time());
```

## From Array

```php
$ethDate = $calendar->fromGregorian([2024, 5, 6]);
```

---

# Ethiopian Date Formatting

```php
echo $ethDate->format('d/m/Y');
```

Output:

```text
28/08/2016
```

---

```php
echo $ethDate->format('F j, Y');
```

Output:

```text
ሚያዝያ 28, 2016
```

---

```php
echo $ethDate->format('M j');
```

Output:

```text
ሚያዝ 28
```

---

# Array Access Compatibility

```php
echo $ethDate['year'];

echo $ethDate['month'];

echo $ethDate['day'];
```

---

# Current Ethiopian Date

```php
$today = EthiopianCalendar::now();

echo $today->format('F j, Y');
```

---

# Ethiopian → Gregorian

## Using Integers

```php
$gregorian = $calendar->toGregorian(2016, 8, 28);
```

---

## Using yyyy-mm-dd

```php
$gregorian = $calendar->toGregorian('2016-08-28');
```

---

## Using dd/mm/yyyy

```php
$gregorian = $calendar->toGregorian('28/08/2016');
```

---

# DateTime Result

```php
echo $gregorian->format('Y-m-d');
```

---

# Eloquent Model Integration

## Add Trait

```php
use Yafet\AmharicDatepicker\Traits\HasEthiopianCalendar;

class Member extends Model
{
    use HasEthiopianCalendar;

    protected $casts = [
        'dob' => 'date',
    ];
}
```

---

# Blade Usage

```blade
{{ $member->ethiopian('dob') }}
```

Default format:

```text
28/08/2016
```

---

# Custom Format

```blade
{{ $member->ethiopian('dob', 'F j, Y') }}
```

Output:

```text
ሚያዝያ 28, 2016
```

---

# 🛠 Component Props

| Prop        | Description            | Default            |
| ----------- | ---------------------- | ------------------ |
| `name`      | Input name             | `date`             |
| `id`        | Input id               | same as name       |
| `value`     | Initial Ethiopian date | `null`             |
| `inline`    | Inline calendar mode   | `false`            |
| `format`    | Display format         | `dd/mm/yyyy`       |
| `yearStart` | Starting year          | `1900`             |
| `yearEnd`   | Ending year            | `currentYear + 10` |
| `class`     | Custom input classes   | `''`               |

---

# Full Example

## Blade

```blade
<x-amharic-datepicker
    name="dob"
    wire:model.live="dob"
    format="dd/mm/yyyy"
    yearStart="1950"
    yearEnd="2050"
    class="w-full rounded-lg border-gray-300"
/>
```

---

## Controller

```php
use Yafet\AmharicDatepicker\EthiopianCalendar;

$calendar = new EthiopianCalendar();

$ethiopian = $calendar->fromGregorian(now());

echo $ethiopian->format('F j, Y');
```

---

# 🔥 Best Practices

## Always Cast Date Fields

```php
protected $casts = [
    'dob' => 'date',
];
```

---

## Use Addis Ababa Timezone

```php
$calendar = new EthiopianCalendar('Africa/Addis_Ababa');
```

---

## Prefer `format()` Over Manual Access

Good:

```php
$date->format('F j, Y');
```

Avoid:

```php
$date['month'];
```

The formatter handles localization cleanly.

---

# Leap Year & Pagume Support

The package properly handles:

- Ethiopian leap years.
- Pagume 5/6.
- Gregorian leap year alignment.
- Historical Julian date conversion logic.

---

# Credits

This package is a modern evolution of several outstanding Ethiopian calendar projects.

- Inspired by:
  [https://packagist.org/packages/etdatepickerlaravel/ethiopian-datepicker](https://packagist.org/packages/etdatepickerlaravel/ethiopian-datepicker)

- Based on the original jQuery implementation:
  [https://github.com/arefathi/AmharicDatepickerCalendar](https://github.com/arefathi/AmharicDatepickerCalendar)

- Original Ethiopian calendar algorithms by Keith Wood.

---

# License

The MIT License (MIT).

See `LICENSE.md` for more information.
