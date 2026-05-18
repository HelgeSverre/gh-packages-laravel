Tool Kit for Laravel
====================

Includes a set of useful tools for the Laravel framework.

## Documentation

- [Helpers](docs/helpers.md) - Global helper functions
- [Blade Directives](docs/blade-directives.md) - @nltobr, @nltobrcompact, @nltop, @nltopflat
- [Components](docs/components.md) - Required field marker
- [Enums](docs/enums.md) - AppEnv, BytesConvention, Civilities


## Installation

With Composer:

```sh
composer require axn/tool-kit-for-laravel
```

To use some of these tools you must have correctly installed the package [forxer/generic-term-translations-for-laravel](https://github.com/forxer/generic-term-translations-for-laravel#generic-term-translations-for-laravel) already prerequisite by this package (therefore present).

Use the locales publisher of [Laravel Lang](https://laravel-lang.com/) to add/update/reset or remove translations:

- If you have never used [Laravel Lang](https://laravel-lang.com/): [add locales](https://laravel-lang.com/usage/add-locales.html)
- If you are already using [Laravel Lang](https://laravel-lang.com/): just [update the locales](https://laravel-lang.com/usage/update-locales.html)


## Quick Reference

### Helpers

| Helper | Description |
|--------|-------------|
| `app_env_enum()` | Get standardized environment enum |
| `app_env_name()` | Get standardized environment name |
| `carbon()` | Create Carbon instance from various formats |
| `collect_models()` | Create Eloquent collection |
| `str_html()` | Create HtmlString instance |
| `linebreaks()` | Normalize line endings to UNIX format |
| `nl_to_br()` | Alias of `nl2br()` |
| `nl_to_br_compact()` | Convert consecutive newlines to single `<br>` |
| `nl_to_p()` | Convert newlines to paragraphs |
| `nl_to_p_flat()` | Convert text to single paragraph with `<br>` |
| `number_formatted()` | Format number with locale |
| `compute_dec_to_time()` | Decimal to time array |
| `convert_dec_to_time()` | Decimal to time string |
| `human_readable_bytes_size()` | Format bytes to human readable (legacy default, accepts `BytesConvention`) |
| `human_readable_bytes_size_si()` | Format bytes using SI convention (1000-based, kB/MB/GB/TB) |
| `human_readable_bytes_size_iec()` | Format bytes using IEC convention (1024-based, KiB/MiB/GiB/TiB) |
| `mime_type_to_fa5_class()` | MIME type to FontAwesome 5 icon |
| `mime_type_to_fa6_class()` | MIME type to FontAwesome 6 icon |
| `mime_type_to_fa7_class()` | MIME type to FontAwesome 7 icon |
| `trans_lcfirst()` | Translate with first char lowercase |
| `trans_ucfirst()` | Translate with first char uppercase |
| `is_valid_model()` | Check if class is valid Eloquent model |
| `semver_to_id()` | Convert semver to numeric ID |

### Blade Directives

| Directive | Description |
|-----------|-------------|
| `@nltobr()` | Convert newlines to `<br>` |
| `@nltobrcompact()` | Convert consecutive newlines to single `<br>` |
| `@nltop()` | Convert newlines to paragraphs |
| `@nltopflat()` | Convert to single paragraph with `<br>` |

### Components

| Component | Description |
|-----------|-------------|
| `<x-required-field-marker />` | Display required field indicator |

### Enums

| Enum | Description |
|------|-------------|
| `AppEnv` | Standardized environment names |
| `BytesConvention` | Byte size conventions (SI / IEC) |
| `Civilities` | Form civilities (Mrs, Mr) |


## Requirements

- PHP 8.4+
- Laravel 12.x or 13.x


## License

MIT
