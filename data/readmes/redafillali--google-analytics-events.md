# Google Analytics Events for Laravel

A lightweight Laravel package that sends events to **Google Analytics 4 (GA4)** using the **Measurement Protocol**.

> Track frontend or backend interactions (form submissions, purchases, clicks, etc.) directly from your Laravel app.

---

## 🚀 Features

- ✅ Simple API for sending custom GA4 events  
- 🔐 Uses secure Measurement Protocol (`measurement_id` & `api_secret`)  
- 🍪 Automatically extracts `client_id` from `_ga` cookie or generates fallback UUID  
- ⚙️ Configurable via `.env` or `config/google-analytics-events.php`

---

## 📦 Installation

### 1. Require the package

If installed locally (recommended for development):

```bash
composer require redaelfillali/google-analytics-events
```

Then install:

```bash
composer require redaelfillali/google-analytics-events
```

### 2. Publish the config

```bash
php artisan vendor:publish --tag=config
```

### 3. Add your credentials to `.env`

```env
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_secret_here
```

---

## ⚙️ Configuration

`config/google-analytics-events.php`:

```php
return [
    'measurement_id' => env('GA_MEASUREMENT_ID', 'your-id'),
    'api_secret' => env('GA_API_SECRET', 'your-secret'),
];
```

---

## 📡 Usage

### Send an event manually

```php
use Redaelfillali\GoogleAnalyticsEvents\GoogleAnalyticsService;

app(GoogleAnalyticsService::class)->sendEvent('form_submission', [
    'form_id' => 'contact',
    'submitted_at' => now()->toIso8601String(),
]);
```

### Optional: Provide a custom `client_id`

```php
app(GoogleAnalyticsService::class)->sendEvent('purchase', [
    'value' => 49.99,
], '123456789.987654321');
```

---

## 🧪 Debug

Once events are sent correctly, visit your GA4 property:

**Google Analytics → Admin → DebugView**  
To see real-time incoming events.

---

## 📁 Package Structure

```
redaelfillali/google-analytics-events/
├── src/
│   ├── GoogleAnalyticsService.php
│   └── GoogleAnalyticsEventsServiceProvider.php
├── config/
│   └── google-analytics-events.php
├── composer.json
└── README.md
```

---

## ✅ Requirements

- PHP 8.1+ or 8.4+
- Laravel 9, 10, 11, 12, or 13
- Google Analytics 4 property
- Measurement Protocol API secret

---

## 📃 License

MIT License

---

## 🤝 Credits

Developed by [Reda El Fillali](https://www.linkedin.com/in/redaelfillali/)
