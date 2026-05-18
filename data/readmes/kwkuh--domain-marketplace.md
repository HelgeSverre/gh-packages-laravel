<div align="center">

# 🌐 DomainMarket

**Open-source, self-hosted domain marketplace.**
For investors, brokers, and registrars who want to own their sales channel.

[![CI](https://github.com/kwkuh/domain-marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/kwkuh/domain-marketplace/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)](https://www.php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-v4-F59E0B)](https://filamentphp.com)
[![Made with Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stars](https://img.shields.io/github/stars/kwkuh/domain-marketplace?style=social)](https://github.com/kwkuh/domain-marketplace/stargazers)

[Demo](#-demo) · [Features](#-features) · [Quick start](#-quick-start) · [Roadmap](#-roadmap) · [Contributing](CONTRIBUTING.md)

</div>

---

## ✨ Why DomainMarket?

The big domain marketplaces — Dan, Sedo, Afternic — take a **10–25% commission** on every sale, lock you into their checkout, and own the buyer relationship.

DomainMarket flips that. Run it on a $5 VPS, list your portfolio under your own brand, and **keep 100% of every sale**.

- 🪙 **No commission.** It's your server.
- 🔐 **No vendor lock-in.** Export anytime. SQLite or MySQL. Your data.
- 🚀 **SEO-first.** Server-rendered Blade, JSON-LD Product schema, sitemap-ready.
- 🧠 **No AI required.** Related-domain engine works on tags + TLD + category similarity. Cheap to run.
- 🌍 **No paid APIs.** RDAP-first for WHOIS lookups. Free, modern, standards-compliant.
- 🎨 **Admin panel out of the box.** Filament v4 handles every CRUD action.

> Not a SaaS. Not a "lite" version. The full thing, MIT-licensed.

---

## 📸 Demo

> Demo coming soon. For now, run it locally in 60 seconds — see [Quick start](#-quick-start).

| Public storefront | Domain landing page | Admin (Filament) |
|---|---|---|
| _Screenshot pending_ | _Screenshot pending_ | _Screenshot pending_ |

---

## 🎯 Features

### Public storefront
- Homepage with featured / latest / categories
- Per-domain landing page with **make-offer form** + JSON-LD Product schema
- Search with filters: keyword, TLD, category, price range, sort (price ↑/↓, popular, newest)
- Seller portfolio pages (`/seller/{username}`)
- Category browse pages (`/category/{slug}`)
- Related-domains engine (no AI: category + TLD + tag similarity)
- SEO baked in: OpenGraph, canonical URLs, schema.org markup

### Seller / admin
- Filament-powered admin panel at `/admin`
- Domain CRUD with category, tags, sale type (BIN / make-offer), description
- Inquiry inbox (offers with status: pending / accepted / rejected / countered)
- Category & tag management
- Multi-seller ready (every domain belongs to a `User`)

### Built-in but optional
- Domain verification (TXT record / nameserver) — *V2*
- Static landing page export — *V2*
- Auction mode — *V3*
- Commission system for multi-vendor SaaS mode — *V3*

---

## 🧱 Stack

| Layer | Tech |
|---|---|
| Backend | **Laravel 12** (PHP 8.2+) |
| Frontend | **Blade** + **Livewire** + **Alpine.js** |
| Admin | **Filament v4** |
| Styling | **Tailwind CSS 4** |
| Database | **SQLite** (default) · **MySQL / MariaDB** (recommended for prod) · **PostgreSQL** |
| Queue | Database / **Redis** (optional) |
| Build | **Vite** |

Designed to run on a single $5 VPS. No vendor lock-in, no required SaaS.

---

## 🚀 Quick start

```bash
# 1. Clone
git clone https://github.com/kwkuh/domain-marketplace.git
cd domain-marketplace

# 2. Install deps
composer install
npm install

# 3. Env + key
cp .env.example .env
php artisan key:generate

# 4. Database (SQLite by default — file already created)
php artisan migrate --seed

# 5. Build assets
npm run build

# 6. Serve
php artisan serve
```

Open <http://127.0.0.1:8000> for the storefront and <http://127.0.0.1:8000/admin> for the dashboard.

**Default admin login:** `admin@example.com` / `password` (change immediately after install).

### Docker (coming soon)

```bash
docker compose up -d  # planned for v0.2
```

---

## 🗂️ Project structure

```
app/
├── Models/                  # Domain, Category, Tag, Offer, User
├── Http/Controllers/        # Home, Domain, Search, Seller, Category, Offer
├── Filament/Resources/      # Admin CRUD (auto-generated)
└── Services/                # WhoisService, DomainService (planned)

resources/views/
├── layouts/app.blade.php    # Master layout
├── components/              # x-domain-card
├── home.blade.php           # /
├── domain.blade.php         # /domain/{name}
├── search.blade.php         # /search
├── seller.blade.php         # /seller/{username}
└── category.blade.php       # /category/{slug}

database/
├── migrations/              # 7 tables: users+, categories, tags, domains,
│                            #   domain_tag, offers, favorites
└── seeders/DatabaseSeeder.php  # 1 admin, 8 categories, 7 tags, 10 sample domains
```

---

## 🗺️ Roadmap

### v0.1 — MVP _(current)_
- [x] Domain CRUD + public landing pages
- [x] Search & filters (keyword, TLD, category, price, sort)
- [x] Make-offer form + offer inbox
- [x] Admin panel (Filament)
- [x] Categories + tags
- [x] Related domains (similarity-based, no AI)
- [x] SEO basics (OG, JSON-LD, canonical)

### v0.2
- [ ] Public seller registration + auth
- [ ] WHOIS / RDAP sync job (port-43 fallback) + expiry alerts
- [ ] Watchlist / favorites UI
- [ ] Sitemap.xml + RSS feed
- [ ] Bulk CSV import / export
- [ ] Docker Compose

### v0.3
- [ ] Domain ownership verification (TXT / NS)
- [ ] Static landing page export (GitHub Pages / Netlify / CF Pages)
- [ ] Analytics dashboard (views, inquiries, conversion)
- [ ] Webhook system (new offer, new inquiry)

### v1.0
- [ ] Auction mode (timer, bid history)
- [ ] Multi-vendor / SaaS mode + commission system
- [ ] REST API + Sanctum tokens
- [ ] Theme system

---

## 🤝 Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the ground rules.

For bugs and feature requests, please [open an issue](https://github.com/kwkuh/domain-marketplace/issues/new/choose).

## 🔒 Security

Found a vulnerability? Don't open a public issue — see [SECURITY.md](SECURITY.md).

## 📜 License

MIT © [Kukuh](https://github.com/kwkuh)

Free to use, modify, and self-host. Attribution appreciated but not required.

---

<div align="center">

**Built by domainers, for domainers.**
If this saved you a Dan.com commission, [⭐ star the repo](https://github.com/kwkuh/domain-marketplace).

</div>
