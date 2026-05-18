# PHP Arabic Support

**Modern Arabic text support for PHP and Laravel.**

PHP Arabic Support is a PHP-first package for Arabic-safe text operations: readable Unicode slugs, ASCII slugs, normalization policies, search keys, Arabic digits, text cleaning, safe filenames, excerpts, validation rules, Laravel macros, and Eloquent helper traits.

## Why this package is useful

Arabic text needs explicit handling. Generic string helpers often treat text as bytes or simple Unicode code points, while Arabic applications often need separate behavior for display, search, URLs, storage limits, and security.

A single visible Arabic character can be composed of a base letter plus one or more marks:

```php
use ArabicSupport\Arabic;
use ArabicSupport\Enums\LengthUnit;

Arabic::length('مُ', LengthUnit::Grapheme); // 1 visible character
Arabic::length('مُ', LengthUnit::Unicode);  // 2 Unicode code points
Arabic::length('مُ', LengthUnit::Byte);     // UTF-8 byte length
```

Use `LengthUnit::Grapheme` for UI and display-safe limits, `LengthUnit::Unicode` for Unicode code-point limits, and `LengthUnit::Byte` for byte-limited protocols or storage.

The package also separates intent:

```php
use ArabicSupport\Arabic;
use ArabicSupport\Enums\ArabicPolicy;

Arabic::normalize('قائِمةٌ تَجْرِيبيّة على مَنْصّةِ الإدارة', ArabicPolicy::Display);
// قائِمةٌ تَجْرِيبيّة على مَنْصّةِ الإدارة

Arabic::normalize('قائِمةٌ تَجْرِيبيّة على مَنْصّةِ الإدارة', ArabicPolicy::Search);
// قائمه تجريبيه علي منصه الاداره

Arabic::normalize('قائِمةٌ تَجْرِيبيّة على مَنْصّةِ الإدارة', ArabicPolicy::Slug);
// قائمة تجريبية على منصة الإدارة
```

`Search` is aggressive and should not be displayed to users. `Slug` keeps readable Arabic spelling while removing marks that are poor for URLs.

## Requirements

```bash
php >= 8.2
```

Recommended extensions:

```bash
ext-mbstring
ext-intl
```

The package includes fallbacks, but these extensions improve Unicode lowercase, normalization, transliteration, grapheme-aware length, and substring behavior.

## Installation

```bash
composer require helturkey/php-arabic-support
```

## Quick examples

```php
use ArabicSupport\Arabic;
use ArabicSupport\Enums\LengthUnit;
use ArabicSupport\Enums\SlugMode;

Arabic::unicodeSlug('دليل المستخدم العربي 2026');
// دليل-المستخدم-العربي-2026

Arabic::asciiSlug('دليل المستخدم العربي 2026');
// dlil-almstkhdm-alarby-2026

Arabic::slug('دليل المستخدم العربي 2026', SlugMode::Unicode);
// دليل-المستخدم-العربي-2026

Arabic::sanitize('<b>أَحْمَدُ، مَدْرَسَةٌ؟ iPhone X</b>');
// أَحْمَدُ، مَدْرَسَةٌ؟ iPhone X

Arabic::sanitizeForSearch('<b>أَحْمَدُ، مَدْرَسَةٌ؟ iPhone X</b>');
// احمد مدرسه iphone x

Arabic::safeFilename('تقرير: المبيعات/العام؟.pdf');
// تقرير-المبيعات-العام.pdf

Arabic::limit('مُحَمَّد علي', 5, LengthUnit::Grapheme, '...');
// مُحَ...
```

## Laravel

Laravel integration is optional. Plain PHP users do not install Laravel runtime dependencies.

```php
use Illuminate\Support\Str;

Str::arabicSlug('دليل المستخدم');
Str::arabicSearchKey('إدارة المبيعات');
Str::stripArabicDiacritics('مُحَمَّد');
Str::arabicExcerpt('<p>وصف منتج طويل</p>', 100);
```

## Documentation

English documentation:

- [Getting Started](docs/en/getting-started.md)
- [API Reference](docs/en/api-reference.md)
- [Normalization Policies](docs/en/normalization-policies.md)
- [Length Units](docs/en/length-units.md)
- [Laravel Integration](docs/en/laravel-integration.md)
- [Direct Classes](docs/en/direct-classes.md)
- [Security and Patterns](docs/en/security-and-patterns.md)
- [Profanity Filtering](docs/en/profanity-filtering.md)
- [Examples](docs/en/examples.md)

Arabic documentation:

- [البدء السريع](docs/ar/getting-started.md)
- [مرجع الواجهة](docs/ar/api-reference.md)
- [سياسات التطبيع](docs/ar/normalization-policies.md)
- [وحدات الطول](docs/ar/length-units.md)
- [تكامل Laravel](docs/ar/laravel-integration.md)
- [استخدام الأصناف مباشرة](docs/ar/direct-classes.md)
- [الأمان والأنماط](docs/ar/security-and-patterns.md)
- [فلترة الكلمات المحظورة](docs/ar/profanity-filtering.md)
- [أمثلة](docs/ar/examples.md)

## License

MIT
