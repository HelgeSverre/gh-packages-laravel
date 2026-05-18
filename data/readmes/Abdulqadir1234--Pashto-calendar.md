# 📅 Pashto Calendar for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/qadir/pashto-calendar.svg?style=flat-square)](https://packagist.org/packages/qadir/pashto-calendar)
[![Total Downloads](https://img.shields.io/packagist/dt/qadir/pashto-calendar.svg?style=flat-square)](https://packagist.org/packages/qadir/pashto-calendar)
[![License](https://img.shields.io/github/license/Abdulqadir1234/Pashto-calendar?style=flat-square)](LICENSE.md)

A full-featured Laravel package for the **Pashto Solar Hijri (Shamsi) calendar** used in Afghanistan.  
Provides date conversion, event management, Blade components, and full RTL support with Pashto localization.

---

## ✨ Features

- ✅ **Bidirectional Conversion** between Gregorian and Pashto (Jalali) dates
- ✅ **Event Management** – store, retrieve, and manage events on specific Pashto dates
- ✅ **Beautiful RTL Demo** – interactive calendar with Alpine.js and Tailwind CSS
- ✅ **Blade Component** – `<x-pashto-calendar>` for easy embedding
- ✅ **Blade Directives** – `@pashtoDate`, `@pashtoNow`, `@pashtoNumber`, etc.
- ✅ **Carbon Macros** – `now()->toPashto()`, `Carbon::parsePashto()`
- ✅ **Helper Functions** – `pashto_now()`, `pashto_number()`, `to_shamsi_pashto()`
- ✅ **Validation Rules** – `pashto_date`, `pashto_date_format`
- ✅ **Eloquent Cast** – `PashtoDateCast` for model attributes
- ✅ **Holidays** – Afghan national holidays built‑in (Nowroz, Independence Day, etc.)
- ✅ **Fully Configurable** – language, numerals, first day of week, RTL, demo route
- ✅ **Light/Dark Mode** – theme toggle with localStorage persistence

---

## 📦 Installation

You can install the package via Composer:

```bash
composer require qadir/pashto-calendar