# Laravel Package Search

**English** | [中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Italiano](README.it.md) | [Русский](README.ru.md) | [Português (Brasil)](README.pt-BR.md)

---

## Overview

**Laravel Package Search** is an OpenClaw Agent Skill that helps developers quickly find, evaluate, and recommend high-quality Laravel ecosystem packages.

[![Packagist](https://img.shields.io/packagist/v/laravel/framework?style=flat-square)](https://packagist.org/packages/laravel/framework)
[![Stars](https://img.shields.io/github/stars/relunctance/laravel-package-search?style=flat-square)](https://github.com/relunctance/laravel-package-search)
[![ClawHub](https://img.shields.io/badge/ClawHub-laravel--package--search-6C43E5?style=flat-square)](https://clawhub.com/laravel-package-search)

---

## Features

- 🔍 **Real-time Packagist API** — data never stale, live on every query
- 🗄️ **Local Cache (1h TTL)** — fast repeat queries
- 🤖 **Smart Scene Detection** — find packages by business scenario (auth, payment, AI, etc.)
- 📊 **Quality Scoring** — stars × downloads × activity × compatibility
- 📖 **Laravel Docs Cross-Ref** — automatic links to official documentation (via [laravel-docs-reader](https://clawhub.com/laravel-docs-reader))
- 📦 **Direct Install Commands** — `composer require` ready to copy

---

## Quick Start

```
You: "I need a Laravel permission package for Laravel 11"
Bot: → Detects scene: auth
     → Live Packagist search: laravel+auth
     → Returns ranked packages with install commands + Packagist links
```

---

## CLI Tool

```bash
php scripts/search.php search <scene> [limit]   # Search by scene (auth, payment, ai...)
php scripts/search.php compare <pkg1> <pkg2>   # Compare two packages
php scripts/search.php recommend <requirement>  # Natural language recommendation
php scripts/search.php top [limit]             # Top N packages (default 10)
php scripts/search.php scenes                  # List all 22 scenes
```

---

## Supported Scenes (22)

| Code | Scene | Packagist 搜索 | Top Package |
|------|-------|---------------|-------------|
| `auth` | Authentication & Authorization | [→](https://packagist.org/search?q=laravel+auth) | [spatie/laravel-permission](https://packagist.org/packages/spatie/laravel-permission) |
| `payment` | Payment & Billing | [→](https://packagist.org/search?q=laravel+payment) | [yansongda/pay](https://packagist.org/packages/yansongda/pay) |
| `search` | Full-text Search | [→](https://packagist.org/search?q=laravel+search+scout) | [laravel/scout](https://packagist.org/packages/laravel/scout) |
| `admin` | Admin Panel | [→](https://packagist.org/search?q=laravel+admin+filament) | [filament/filament](https://packagist.org/packages/filament/filament) |
| `queue` | Queue & Jobs | [→](https://packagist.org/search?q=laravel+queue+horizon) | [laravel/horizon](https://packagist.org/packages/laravel/horizon) |
| `excel` | Excel Import/Export | [→](https://packagist.org/search?q=laravel+excel) | [maatwebsite/excel](https://packagist.org/packages/maatwebsite/excel) |
| `media` | Media & Files | [→](https://packagist.org/search?q=laravel+media) | [spatie/laravel-medialibrary](https://packagist.org/packages/spatie/laravel-medialibrary) |
| `wechat` | WeChat / Mini Program | [→](https://packagist.org/search?q=laravel+wechat) | [overtrue/laravel-wechat](https://packagist.org/packages/overtrue/laravel-wechat) |
| `multitenancy` | Multi-tenancy SaaS | [→](https://packagist.org/search?q=laravel+multi-tenant) | [stancl/tenancy](https://packagist.org/packages/stancl/tenancy) |
| `ai` | AI / LLM Integration | [→](https://packagist.org/search?q=laravel+openai+llm) | [openai-php/laravel](https://packagist.org/packages/openai-php/laravel) |
| `ratelimit` | Rate Limiting | [→](https://packagist.org/search?q=laravel+rate+limit) | Laravel built-in |
| `stripe` | Stripe Payments | [→](https://packagist.org/search?q=laravel+stripe) | [laravel/cashier](https://packagist.org/packages/laravel/cashier) |
| `sms` | SMS Notifications | [→](https://packagist.org/search?q=laravel+sms) | [laravel/twilio](https://packagist.org/packages/laravel/twilio-notification-channel) |
| `logging` | Logging & Audit | [→](https://packagist.org/search?q=laravel+log+activity) | [spatie/laravel-activitylog](https://packagist.org/packages/spatie/laravel-activitylog) |
| `api` | API & HTTP | [→](https://packagist.org/search?q=laravel+api) | [laravel/sanctum](https://packagist.org/packages/laravel/sanctum) |
| `testing` | Testing | [→](https://packagist.org/search?q=laravel+testing+pest) | [pestphp/pest](https://packagist.org/packages/pestphp/pest) |
| `cache` | Caching | [→](https://packagist.org/search?q=laravel+redis+cache) | [predis/predis](https://packagist.org/packages/predis/predis) |
| `email` | Email & Notifications | [→](https://packagist.org/search?q=laravel+mail) | [laravel/mail](https://packagist.org/packages/laravel/mail) |
| `storage` | Cloud Storage | [→](https://packagist.org/search?q=laravel+storage+s3) | [league/flysystem-aws-s3-v3](https://packagist.org/packages/league/flysystem-aws-s3-v3) |
| `security` | Security | [→](https://packagist.org/search?q=laravel+security) | Laravel built-in |
| `ui` | Frontend UI | [→](https://packagist.org/search?q=laravel+ui+vue) | [laravel/breeze](https://packagist.org/packages/laravel/breeze) |
| `devtools` | Developer Tools | [→](https://packagist.org/search?q=laravel+debug+telescope) | [laravel/telescope](https://packagist.org/packages/laravel/telescope) |

---

## Top 20 Packages

| Rank | Package | Packagist | Stars | Use Case | Score |
|------|---------|-----------|-------|----------|-------|
| 1 | [filament/filament](https://packagist.org/packages/filament/filament) | [→](https://packagist.org/packages/filament/filament) | 25k | Admin Panel | 96 |
| 2 | [spatie/laravel-permission](https://packagist.org/packages/spatie/laravel-permission) | [→](https://packagist.org/packages/spatie/laravel-permission) | 25k | RBAC | 95 |
| 3 | [laravel/horizon](https://packagist.org/packages/laravel/horizon) | [→](https://packagist.org/packages/laravel/horizon) | 7k | Queue Monitor | 95 |
| 4 | [laravel/telescope](https://packagist.org/packages/laravel/telescope) | [→](https://packagist.org/packages/laravel/telescope) | 12k | Debugging | 94 |
| 5 | [stancl/tenancy](https://packagist.org/packages/stancl/tenancy) | [→](https://packagist.org/packages/stancl/tenancy) | 5k | Multi-tenancy | 94 |
| 6 | [pestphp/pest](https://packagist.org/packages/pestphp/pest) | [→](https://packagist.org/packages/pestphp/pest) | 11k | Testing | 93 |
| 7 | [laravel/scout](https://packagist.org/packages/laravel/scout) | [→](https://packagist.org/packages/laravel/scout) | 13k | Search | 92 |
| 8 | [guzzlehttp/guzzle](https://packagist.org/packages/guzzlehttp/guzzle) | [→](https://packagist.org/packages/guzzlehttp/guzzle) | 25k | HTTP Client | 92 |
| 9 | [spatie/laravel-activitylog](https://packagist.org/packages/spatie/laravel-activitylog) | [→](https://packagist.org/packages/spatie/laravel-activitylog) | 10k | Activity Log | 90 |
| 10 | [spatie/laravel-medialibrary](https://packagist.org/packages/spatie/laravel-medialibrary) | [→](https://packagist.org/packages/spatie/laravel-medialibrary) | 10k | Media | 90 |
| 11 | [laravel/sanctum](https://packagist.org/packages/laravel/sanctum) | [→](https://packagist.org/packages/laravel/sanctum) | 8k | SPA Auth | 90 |
| 12 | [spatie/laravel-backup](https://packagist.org/packages/spatie/laravel-backup) | [→](https://packagist.org/packages/spatie/laravel-backup) | 12k | Backup | 88 |
| 13 | [barryvdh/laravel-dompdf](https://packagist.org/packages/barryvdh/laravel-dompdf) | [→](https://packagist.org/packages/barryvdh/laravel-dompdf) | 12k | PDF | 88 |
| 14 | [maatwebsite/excel](https://packagist.org/packages/maatwebsite/excel) | [→](https://packagist.org/packages/maatwebsite/excel) | 13k | Excel | 88 |
| 15 | [tymon/jwt-auth](https://packagist.org/packages/tymon/jwt-auth) | [→](https://packagist.org/packages/tymon/jwt-auth) | 13k | JWT | 88 |
| 16 | [socialiteproviders/manager](https://packagist.org/packages/socialiteproviders/manager) | [→](https://packagist.org/packages/socialiteproviders/manager) | 10k | Social OAuth | 88 |
| 17 | [laravel/cashier](https://packagist.org/packages/laravel/cashier) | [→](https://packagist.org/packages/laravel/cashier) | 9k | Stripe Billing | 90 |
| 18 | [predis/predis](https://packagist.org/packages/predis/predis) | [→](https://packagist.org/packages/predis/predis) | 12k | Redis | 85 |
| 19 | [laravel/breeze](https://packagist.org/packages/laravel/breeze) | [→](https://packagist.org/packages/laravel/breeze) | 10k | Auth Starter | 85 |
| 20 | [yansongda/pay](https://packagist.org/packages/yansongda/pay) | [→](https://packagist.org/packages/yansongda/pay) | 6k | Alipay/WeChat Pay | 88 |

> Run `php scripts/search.php top 20` for **live** rankings with real-time Packagist data.

---

## Scoring

Packages are scored 0-100 in real-time:

| Criterion | Weight | Source |
|-----------|--------|--------|
| GitHub Stars | 15% | Packagist (github_stars) |
| Packagist Downloads | 20% | Packagist API |
| Favorites | 10% | Packagist (favers) |
| Activity (≤30d=100) | 30% | Last commit |
| Laravel Compatibility | 15% | composer.json |
| Description Quality | 10% | Non-empty = 100 |

---

## Installation

```bash
# Install via ClawHub CLI
clawhub install laravel-package-search

# Or download from GitHub
git clone https://github.com/relunctance/laravel-package-search.git
cd laravel-package-search

# Run CLI
php scripts/search.php scenes
php scripts/search.php search auth 3
php scripts/search.php recommend "I need WeChat Pay for Laravel 11"
```

---

## File Structure

```
laravel-package-search/
├── SKILL.md                      # Skill specification
├── README.md                     # English version
├── README.zh-CN.md              # Chinese version
├── references/
│   ├── top20-packages.md        # Full Top 20 with details
│   └── scene-index.md           # All 22 scenes with Packagist links
└── scripts/
    └── search.php               # Real-time Packagist CLI
```

---

## laravel-docs-reader Integration

This skill cross-references [laravel-docs-reader](https://clawhub.com/laravel-docs-reader) for official Laravel documentation:

```
✅ spatie/laravel-permission → Authorization docs
✅ laravel/scout → Database Search docs
✅ laravel/horizon → Queues docs
✅ laravel/sanctum → SPA Authentication docs
✅ filament/filament → filamentphp.com/docs
...
```

---

## Contributing

Found a missing package or outdated info?
- 🐛 [Open an Issue](https://github.com/relunctance/laravel-package-search/issues)
- 🔧 [Submit a PR](https://github.com/relunctance/laravel-package-search/pulls)

---

## License

MIT License | [GitHub](https://github.com/relunctance/laravel-package-search) | [ClawHub](https://clawhub.com/laravel-package-search)
