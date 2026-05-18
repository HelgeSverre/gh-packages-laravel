# zhylon/open

[![Tests](https://github.com/Zhylon/open/actions/workflows/tests.yml/badge.svg)](https://github.com/Zhylon/open/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/zhylon/open.svg)](https://packagist.org/packages/zhylon/open)
[![PHP Version](https://img.shields.io/packagist/php-v/zhylon/open.svg)](https://packagist.org/packages/zhylon/open)
[![License](https://img.shields.io/github/license/Zhylon/open.svg)](LICENSE)

A small Laravel package that leaves a friendly message for curious developers who peek at your source code or open DevTools.

```html
<!--

    👋 Hello curious developer! Looks like you're exploring the source.
    Zhylon is building infrastructure and developer tools in Europe.

    ⚡ Website:  https://zhylon.net
    🐙 GitHub:   https://github.com/Zhylon

    We build developer tools for Europe.
    Privacy-first. No lock-in. Made in EU. 🇪🇺

-->
```

---

## What it does

- Injects an **HTML comment** after `<head>` — visible in browser source view
- Injects a styled **console message** before `</body>` — visible in DevTools → Console
- Only activates in configured environments (default: `production`)
- Skips JSON responses, redirects, and non-HTML content automatically
- Zero configuration required — works out of the box via auto-discovery

---

## Installation

```bash
composer require zhylon/open
```

That's it. The package registers itself via Laravel's auto-discovery.

---

## Configuration

Publish the config file if you want to customize the messages:

```bash
php artisan vendor:publish --tag=zopen-config
```

This creates `config/zopen.php`:

```php
return [
    'html_comment' => [
        'enabled' => env('ZHYLON_OPEN_HTML_COMMENT', true),
        'message' => env('ZHYLON_OPEN_HTML_MESSAGE', '👋 Hello curious developer! ...'),
        'github'  => env('ZHYLON_OPEN_GITHUB', 'https://github.com/Zhylon'),
        'website' => env('ZHYLON_OPEN_WEBSITE', 'https://zhylon.net'),
    ],

    'console' => [
        'enabled' => env('ZHYLON_OPEN_CONSOLE', true),
        'message' => env('ZHYLON_OPEN_CONSOLE_MESSAGE', 'Hey, you found us! 🚀'),
        'style'   => env('ZHYLON_OPEN_CONSOLE_STYLE', 'color: #6366f1; font-size: 14px; font-weight: bold;'),
    ],

    'environments' => ['production'],
];
```

### Environment variables

| Variable                      | Default                     | Description                                 |
|-------------------------------|-----------------------------|---------------------------------------------|
| `ZHYLON_OPEN_ENABLED`         | `true`                      | Master switch — disables all output at once |
| `ZHYLON_OPEN_HTML_COMMENT`    | `true`                      | Enable/disable HTML comment                 |
| `ZHYLON_OPEN_HTML_MESSAGE`    | *(see config)*              | The message shown in source view            |
| `ZHYLON_OPEN_GITHUB`          | `https://github.com/Zhylon` | GitHub URL shown in comment + console       |
| `ZHYLON_OPEN_WEBSITE`         | `https://zhylon.net`        | Website URL shown in comment + console      |
| `ZHYLON_OPEN_CONSOLE`         | `true`                      | Enable/disable console output               |
| `ZHYLON_OPEN_CONSOLE_MESSAGE` | `Hey, you found us! 🚀`     | Message shown in DevTools console           |
| `ZHYLON_OPEN_CONSOLE_STYLE`   | *(purple, bold)*            | CSS string for console styling              |

---

## Customizing the views

Publish the Blade views to customize the output completely:

```bash
php artisan vendor:publish --tag=zopen-views
```

Views are published to `resources/views/vendor/zopen/`.

---

## Requirements

| Requirement | Version                 |
|-------------|-------------------------|
| PHP         | ^8.3                    |
| Laravel     | ^11.0 \| ^12.0 \| ^13.0 |

---

## About Zhylon

Zhylon Systems is building a suite of developer tools for Europe — infrastructure, deployment, monitoring, realtime, and more.

**Privacy-first. No lock-in. Made in EU. 🇪🇺**

- 🌍 [zhylon.net](https://zhylon.net)
- 🐙 [github.com/Zhylon](https://github.com/Zhylon)
- 📡 [sitealarm.de](https://sitealarm.de) — uptime monitoring
- ☁️ [cloud.zhylon.net](https://cloud.zhylon.net) — deployment & infrastructure

---

## Contributing

This package is open-source and part of the Zhylon ecosystem. Issues and PRs are welcome.

```bash
composer install
composer test       # run tests
composer format     # run Laravel Pint
```

---

## License

MIT — see [LICENSE](LICENSE.md) for details.
