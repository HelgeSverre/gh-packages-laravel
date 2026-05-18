# Laravel APU Schedule

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chengkangzai/laravel-apu-schedule.svg?style=flat-square)](https://packagist.org/packages/chengkangzai/laravel-apu-schedule)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/chengkangzai/laravel-apu-schedule/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/chengkangzai/laravel-apu-schedule/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/chengkangzai/laravel-apu-schedule/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/chengkangzai/laravel-apu-schedule/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/chengkangzai/laravel-apu-schedule.svg?style=flat-square)](https://packagist.org/packages/chengkangzai/laravel-apu-schedule)

![Package Banner](https://banners.beyondco.de/Laravel%20Apu%20Schedule.png?theme=light&packageManager=composer+require&packageName=chengkangzai%2Flaravel-apu-schedule&pattern=ticTacToe&style=style_1&description=query+student%27s+timetable+from+APU&md=1&showWatermark=1&fontSize=100px&images=academic-cap)

A Laravel package that provides a simple API to retrieve and query student timetable information from [Asia Pacific University (APU)](https://apu.edu.my/).

## 📋 Features

- Retrieve all available intake codes
- Get groupings for a specific intake
- Query timetable schedules by intake and grouping
- Access official APU holidays

## 🚀 Installation

You can install the package via Composer:

```bash
composer require chengkangzai/laravel-apu-schedule
```

## 📖 Usage

### Get all intake codes

```php
use Chengkangzai\ApuSchedule\ApuSchedule;

$intakes = ApuSchedule::getIntakes(); // Returns: UC3F2111SE, AFCF2011AS ...
```

### Get all groupings for a specific intake code

```php
use Chengkangzai\ApuSchedule\ApuSchedule;

$groupings = ApuSchedule::getGroupings("UC3F2111SE"); // Returns: G1, G2, G3 ...
```

### Get schedule for a specific intake and grouping

```php
use Chengkangzai\ApuSchedule\ApuSchedule;

$schedule = ApuSchedule::getSchedule("UC3F2111SE", "G1");
```

<details>
<summary>Example schedule output</summary>

```json
[
    {
        "INTAKE": "...",
        "MODID": "...",
        "MODULE_NAME": "...",
        "DAY": "...",
        "LOCATION": "...",
        "ROOM": "...",
        "LECTID": "...",
        "NAME": "...",
        "SAMACCOUNTNAME": "...",
        "DATESTAMP": "...",
        "DATESTAMP_ISO": "...",
        "TIME_FROM": "...",
        "TIME_TO": "...",
        "TIME_FROM_ISO": "...",
        "TIME_TO_ISO": "...",
        "GROUPING": "...",
        "CLASS_CODE": "...",
        "COLOR": "..."
    },
    {}
]
```
</details>

### Get all official APU holidays

```php
use Chengkangzai\ApuSchedule\ApuHoliday;

$allHolidays = ApuHoliday::getAll(); // Returns a collection of holidays
```

### Get official APU holidays for a specific year

```php
use Chengkangzai\ApuSchedule\ApuHoliday;

$holidaysFor2023 = ApuHoliday::getByYear(2023); // Returns holidays for 2023
```

<details>
<summary>Example holiday object structure</summary>

```php
[
    "holiday_description" => "New Year's Day",
    "holiday_end_date" => "Sat, 01 Jan 2022 00:00:00 GMT",
    "holiday_name" => "New Year's Day",
    "holiday_people_affected" => "all",
    "holiday_start_date" => "Sat, 01 Jan 2022 00:00:00 GMT",
    "id" => 336,
]
```
</details>

## 🧪 Testing

```bash
composer test
```

## 📝 Changelog

Please see the [CHANGELOG](CHANGELOG.md) file for details on what has changed recently.

## 🤝 Contributing

Contributions are welcome! Please see the [CONTRIBUTING](.github/CONTRIBUTING.md) guide for details.

## 🔒 Security Vulnerabilities

If you discover a security vulnerability, please review [our security policy](../../security/policy) for instructions on how to report it.

## ✨ Credits

- [chengkangzai](https://github.com/chengkangzai)
- [All Contributors](../../contributors)

## 📄 License

This package is open-sourced software licensed under the [MIT License](LICENSE.md).
