# NGO.Tools Laravel Starter

Laravel package for building [NGO.Tools](https://ngo.tools) extensions.

## Quick Start

The easiest way to get started is via the NGO.Tools admin panel:

1. Go to **Apps** in your NGO.Tools panel
2. Click **App erstellen**, enter a name
3. Run the generated command in your terminal

This will create a Laravel project, install this package, and connect your app automatically.

## Manual Installation

```bash
composer require ngo-tools/sdk-laravel-starter
php artisan ngotools:install
```

## Commands

| Command | Description |
|---------|-------------|
| `php artisan ngotools:install` | Interactive setup wizard (UI slots, webhooks, scopes) |
| `php artisan ngotools:dev` | Start dev server + cloudflared tunnel |
| `php artisan ngotools:sync` | Push manifest changes to NGO.Tools |

## Configuration

After installation, configuration is in `config/ngotools.php` and `.env`:

```env
NGOTOOLS_API_URL=https://your-org.ngo.tools
NGOTOOLS_DEV_TOKEN=...
NGOTOOLS_WEBHOOK_SECRET=...
NGOTOOLS_PORT=8001
```

## UI Slots

Extensions can integrate into these UI slots:

- **Navigation Entry** — Full-page iframe under a navigation link
- **Dashboard Card** — Widget card on the dashboard
- **Contact Tab** — Tab on the contact detail page

Views are published to `resources/views/vendor/ngotools/pages/`.

## Webhooks

When you select webhook events during setup, the package generates:
- `routes/ngotools-webhooks.php` with a webhook handler
- HMAC-SHA256 signature verification middleware

## Manifest

The app manifest is generated at `.well-known/ngotools.json` and served automatically. Edit it manually or re-run `php artisan ngotools:install` to regenerate.

## License

MIT
