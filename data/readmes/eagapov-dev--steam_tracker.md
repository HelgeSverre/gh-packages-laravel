# Steam Price Tracker

A SaaS application for tracking Steam game prices. Users add games to their watchlist and receive price drop notifications via email and Telegram. Monetized through 4 subscription tiers powered by LemonSqueezy.

## Tech Stack

- **Backend:** Laravel 11, PHP 8.3
- **Frontend:** Blade + Livewire 3 + Tailwind CSS
- **Charts:** Chart.js
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Payments:** LemonSqueezy
- **Notifications:** Email (Laravel Mail) + Telegram Bot API
- **Queue:** Laravel Queue (database driver)
- **API Auth:** Laravel Sanctum

## Subscription Plans

| | Free | Starter ($3/mo) | Pro ($9/mo) | Enterprise ($29/mo) |
|---|---|---|---|---|
| Games in watchlist | 3 | 10 | 50 | Unlimited |
| Price check frequency | 24h | 12h | 6h | 1h |
| Email notifications | - | + | + | + |
| Telegram notifications | - | - | + | + |
| Price history | 7 days | 30 days | 1 year | Full |
| API access | - | - | - | + |

## Setup

```bash
# Clone and install
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
touch database/database.sqlite
php artisan migrate

# Seed test data (admin + sample games with price history)
php artisan db:seed

# Build assets
npm run build

# Run
php artisan serve
```

Open http://127.0.0.1:8000

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin (Enterprise) | `admin@steam.test` | `password` |
| Free User | `free@steam.test` | `password` |

## Environment Variables

Add these to `.env` for full functionality:

```env
# Steam API (works without key for store API)
STEAM_API_STORE_URL=https://store.steampowered.com/api

# LemonSqueezy (payments)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STARTER_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_ENTERPRISE_VARIANT_ID=

# Telegram Bot
TELEGRAM_BOT_TOKEN=

# PostgreSQL (production)
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=steam_price_tracker
# DB_USERNAME=postgres
# DB_PASSWORD=
```

## Key Pages

| URL | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | User dashboard — tracked games, active deals |
| `/games/search?q=` | Search Steam games (live API) |
| `/games/{steamAppId}` | Game details + price history chart |
| `/watchlist` | Manage tracked games and alerts |
| `/pricing` | Subscription plans |
| `/subscription/portal` | Manage subscription + Telegram setup |
| `/admin` | Admin panel (stats, users, games) |

## API (Enterprise plan)

```bash
# Endpoints
GET /api/v1/watchlist
GET /api/v1/games/{steamAppId}/prices?days=30

# Auth header
Authorization: Bearer {token}
```

Tokens are created via Laravel Sanctum. User must have the Enterprise plan.

## Background Jobs

### Price Checking

```bash
# Manual check for a specific plan
php artisan price:check free
php artisan price:check starter
php artisan price:check pro
php artisan price:check enterprise

# Cleanup old price history
php artisan price:cleanup-history
```

### Scheduler (production)

Add to crontab:

```
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Schedule:
- `price:check free` — daily
- `price:check starter` — every 6 hours
- `price:check pro` — every 6 hours
- `price:check enterprise` — hourly
- `price:cleanup-history` — daily at 03:00

### Queue Worker (production)

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

## Testing

```bash
php artisan test
```

49 tests covering: authentication, game search, watchlist CRUD, plan limits, admin access, API authorization.

## Project Structure

```
app/
├── Console/Commands/       # price:check, price:cleanup-history
├── Http/
│   ├── Controllers/
│   │   ├── Admin/          # Admin dashboard, users, games
│   │   ├── Api/            # Enterprise API endpoints
│   │   ├── DashboardController.php
│   │   ├── GameController.php
│   │   ├── WatchlistController.php
│   │   ├── SubscriptionController.php
│   │   └── WebhookController.php
│   └── Middleware/          # CheckGameLimit, EnsureSubscribed, EnsureAdmin
├── Jobs/                    # CheckGamePrices, SendPriceDropNotification
├── Livewire/                # GameSearch (autocomplete)
├── Models/                  # User, Game, Watchlist, PriceHistory, NotificationLog
├── Notifications/           # PriceDropNotification (email)
└── Services/                # SteamApiService, TelegramService
config/
├── plans.php                # Subscription plan definitions
├── steam.php                # Steam API config
├── lemonsqueezy.php         # Payment config
└── telegram.php             # Bot config
```

## LemonSqueezy Setup

1. Create store at https://lemonsqueezy.com
2. Create 3 products (Starter, Pro, Enterprise) with monthly variants
3. Copy variant IDs to `.env`
4. Set webhook URL to `https://yourdomain.com/webhooks/lemonsqueezy`
5. Set webhook secret in `.env`
6. Enable events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`

## Telegram Bot Setup

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Copy token to `TELEGRAM_BOT_TOKEN` in `.env`
3. Users connect by sending `/start` to the bot, then entering their Chat ID in subscription settings
