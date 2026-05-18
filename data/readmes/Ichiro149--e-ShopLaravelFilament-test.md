<div align="center">

# 🛒 e-Shop

### ⚡ Modern E-Commerce Platform

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-3.2-FDAE4B?style=for-the-badge&logo=laravel&logoColor=white)](https://filamentphp.com)
[![PHP](https://img.shields.io/badge/PHP-8.3+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![Tests](https://github.com/Ichiro149/e-ShopLaravelFilament-test/actions/workflows/tests.yml/badge.svg)](https://github.com/Ichiro149/e-ShopLaravelFilament-test/actions/workflows/tests.yml)
[![PHPStan](https://img.shields.io/badge/PHPStan-Level%205-brightgreen?style=flat-square)](https://phpstan.org)
[![Code Style](https://img.shields.io/badge/Code%20Style-Laravel%20Pint-orange?style=flat-square)](https://laravel.com/docs/pint)

<br/>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-testing">Testing</a>
</p>

<br/>

**Full-stack e-commerce solution with Admin Panel, Seller Dashboard, and beautiful Customer Storefront**

<br/>

> ⚠️ **Demo Mode**: This project includes a configurable demo banner for educational/portfolio deployments

</div>

<br/>

---

<br/>

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/Ichiro149/e-ShopLaravelFilament-test.git
cd filament-test && composer install && npm install

# Setup
cp .env.example .env && php artisan key:generate
php artisan migrate --seed && php artisan storage:link

# Run
npm run build && php artisan serve
```

**🐳 Docker:** `cp .env.docker .env && make init` → http://localhost:8080

<br/>

---

<br/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛍️ Customer Experience

- 📦 **Product Catalog** with advanced filtering & search
- 🎨 **Product Variants** (size, color, etc.)
- 🛒 **Shopping Cart** with coupon support
- 💝 **Wishlist** & Product Comparison
- ⭐ **Reviews & Ratings** system
- 📍 **Order Tracking** by number
- 🔐 **Two-Factor Authentication** (2FA)
- 🌍 **Multi-language** (EN, RU, LV)
- 🌙 **Dark/Light Theme**
- 💬 **Product Chat** with sellers
- ⚙️ **Account Settings** (username, notifications, privacy)

</td>
<td width="50%">

### 🎛️ Admin Panel

- 📊 **Dashboard** with analytics widgets
- 📦 **Products** — CRUD, variants, CSV import/export
- 🏢 **Companies** — verification, moderation
- 📋 **Orders** — status management, history
- 🎫 **Coupons** — fixed/percentage discounts
- 💬 **Support Tickets** — real-time chat
- ⭐ **Reviews Moderation**
- 💰 **Refund Requests**
- 👥 **User Management** with ban actions
- 🚫 **Ban System** — account, IP, fingerprint bans
- 🔒 **Email Masking** for user privacy

</td>
</tr>
</table>

<br/>

### 🏢 Multi-Vendor System

<table>
<tr>
<td width="33%" align="center">

**👨‍💼 Seller Panel**

Own dashboard to manage
company, products & orders

</td>
<td width="33%" align="center">

**🏪 Company Profiles**

Public storefront pages
at `/companies/{slug}`

</td>
<td width="33%" align="center">

**👥 Follow System**

Customers can follow
their favorite sellers

</td>
</tr>
</table>

<br/>

### 🔐 Role System

| Role | Access Level |
|:-----|:-------------|
| 🔴 **Super Admin** | Full system access, role management, ticket deletion |
| 🟠 **Admin** | Manage orders, products, tickets, reviews, bans |
| 🟡 **Seller** | Manage own company, products, orders, customer chat |
| 🟢 **User** | Browse, purchase, submit tickets, product chat |

<br/>

### 🔔 Notifications & Integrations

<table>
<tr>
<td>📧 Email (Gmail/Yandex SMTP)</td>
<td>🔔 Real-time in-app notifications</td>
<td>📄 PDF Invoice generation</td>
</tr>
<tr>
<td>🔑 OAuth (Google, GitHub, Discord)</td>
<td>💬 Live ticket chat (3s polling)</td>
<td>📊 Activity logging</td>
</tr>
</table>

<br/>

---

<br/>

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="20%">
<img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="80"/><br/>
<b>Laravel 12</b><br/>
<sub>Backend Framework</sub>
</td>
<td align="center" width="20%">
<img src="https://filamentphp.com/favicon/apple-touch-icon.png" width="50"/><br/>
<b>Filament 3.2</b><br/>
<sub>Admin Panel</sub>
</td>
<td align="center" width="20%">
<img src="https://livewire.laravel.com/favicon.ico" width="50"/><br/>
<b>Livewire 3</b><br/>
<sub>Reactive UI</sub>
</td>
<td align="center" width="20%">
<img src="https://alpinejs.dev/alpine_long.svg" width="80"/><br/>
<b>Alpine.js</b><br/>
<sub>JavaScript</sub>
</td>
<td align="center" width="20%">
<img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" width="50"/><br/>
<b>Tailwind CSS</b><br/>
<sub>Styling</sub>
</td>
</tr>
</table>

<br/>

| Layer | Technologies |
|:------|:------------|
| **Backend** | PHP 8.2+, Laravel 12, Filament 3.2, Livewire 3, DomPDF |
| **Frontend** | Alpine.js 3, Tailwind CSS 3, Vite 7 |
| **Database** | MySQL 8.0+ (prod), SQLite (testing) |
| **Auth** | Laravel Socialite (Google, GitHub, Discord), 2FA |

<br/>

---

<br/>

## 🧪 Testing

<div align="center">

```
✅ 139 Tests | ✅ 243 Assertions | ⚡ 2.9s
```

</div>

<br/>

```bash
# Run all tests
php artisan test

# With coverage
php artisan test --coverage

# Specific suite
php artisan test --filter=OrderTest
```

<br/>

### Test Coverage

| Module | Tests | What's Covered |
|:-------|:-----:|:---------------|
| 🔐 Auth | 14 | Registration, login, OAuth, 2FA |
| 🛒 Cart | 12 | Add, update, remove, stock validation |
| 📦 Orders | 9 | Checkout, placement, tracking |
| 🏢 Company | 11 | Creation, followers, products |
| 💬 Tickets | 12 | Creation, messages, status |
| 💝 Wishlist | 9 | Add, remove, isolation |
| 🎫 Coupons | 14 | Validation, calculation |
| ⭐ Reviews | 7 | Submit, moderation |
| 📊 Comparison | 10 | Add, remove, clear |
| 📜 Login History | 11 | Tracking, timestamps |

<br/>

---

<br/>

## 💻 Development

### Start Development Server

```bash
# All services at once
composer dev
```

This starts: **Laravel** (8000) + **Vite** (HMR) + **Queue** + **Pail** (logs)

<br/>

### Code Quality

```bash
# Fix code style
vendor/bin/pint

# Static analysis
vendor/bin/phpstan analyse

# Run tests
php artisan test
```

<br/>

---

<br/>

## 📁 Project Structure

```
app/
├── 📂 Filament/
│   ├── Resources/          # Admin CRUD (Products, Orders, Tickets...)
│   └── Seller/Resources/   # Seller panel (Company, Products)
│
├── 📂 Http/
│   ├── Controllers/        # Web controllers
│   ├── Requests/           # Form validation
│   └── Middleware/         # Custom middleware
│
├── 📂 Models/              # 20+ Eloquent models
├── 📂 Services/            # Business logic (OrderService)
├── 📂 Policies/            # Authorization
├── 📂 Notifications/       # Email & in-app
└── 📂 Jobs/                # Queue jobs

database/
├── 📂 factories/           # Test factories
├── 📂 migrations/          # Schema
└── 📂 seeders/             # Sample data

resources/
├── 📂 css/                 # Modular styles
├── 📂 js/                  # Alpine components
├── 📂 lang/                # Translations (en, ru, lv)
└── 📂 views/               # Blade templates

tests/
├── 📂 Feature/             # 139 feature tests
└── 📂 Unit/                # Unit tests
```

<br/>

---

<br/>

## ⚙️ Configuration

### Environment Variables

```env
# App
APP_NAME=e-Shop
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_DATABASE=eshop

# Queue (required)
QUEUE_CONNECTION=database

# Mail (Gmail SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

<br/>

### 📧 Gmail Setup

1. Enable [2-Step Verification](https://myaccount.google.com/security)
2. Create [App Password](https://myaccount.google.com/apppasswords)
3. Add to `.env` and run `php artisan config:clear`

<br/>

---

<br/>

## 🔌 API Endpoints

<details>
<summary><b>📦 Products</b></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/products` | Product listing |
| GET | `/products/{slug}` | Product details |
| GET | `/category/{slug}` | By category |
| GET | `/search` | Global search |

</details>

<details>
<summary><b>🛒 Cart</b></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/cart` | View cart |
| POST | `/cart/add/{id}` | Add item |
| PATCH | `/cart/update/{id}` | Update qty |
| DELETE | `/cart/remove/{id}` | Remove item |
| POST | `/cart/coupon/apply` | Apply coupon |

</details>

<details>
<summary><b>🏢 Companies</b></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/companies` | All companies |
| GET | `/companies/{slug}` | Company page |
| POST | `/companies/{id}/follow` | Follow/unfollow |

</details>

<details>
<summary><b>💬 Support</b></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/support` | List tickets |
| POST | `/support` | Create ticket |
| GET | `/support/{id}` | View ticket |
| POST | `/support/{id}/reply` | Send message |

</details>

<br/>

---

<br/>

## 📝 License

This project is open-sourced under the [MIT License](https://opensource.org/licenses/MIT).

<br/>

---

<br/>

<div align="center">

### 🌟 Star this repo if you find it helpful!

<br/>

**Built with ❤️ using**

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-FDAE4B?style=for-the-badge&logo=laravel&logoColor=white)](https://filamentphp.com)
[![Livewire](https://img.shields.io/badge/Livewire-FB70A9?style=for-the-badge&logo=livewire&logoColor=white)](https://livewire.laravel.com)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?style=for-the-badge&logo=alpine.js&logoColor=white)](https://alpinejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

<sub>Made by <a href="https://github.com/Ichiro149">@Ichiro149</a></sub>

</div>
