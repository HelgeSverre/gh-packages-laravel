# 🚀 Laravel Heizreport API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mapo-89/laravel-heizreport-api.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-heizreport-api)
[![Total Downloads](https://img.shields.io/packagist/dt/mapo-89/laravel-heizreport-api.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-heizreport-api)
![GitHub Actions](https://github.com/mapo-89/laravel-heizreport-api/actions/workflows/main.yml/badge.svg)

A simple Laravel integration for the [Heizreport API](https://heizreport.com/hilfethemen/schnittstellen). This package provides a clean interface to interact with the API.

📖 This README is also available in [🇩🇪 German](README.de.md).

---

## 📦 Installation

Install the package via Composer:

```bash
composer require mapo-89/laravel-heizreport-api
```

Add your API token to your `.env` file:

```env
HEIZREPORT_API_TOKEN=your-token-here
```

Alternatively, you can load the token dynamically (e.g., from a database). In your `AppServiceProvider` inside the `boot()` method:

```php
use Illuminate\Support\Facades\Config;
use App\Models\Integration;

public function boot()
{
    Config::set('heizreport-api.api_token', Integration::getApiToken('Heizreport'));
}
```

Optionally, you can publish the config file:

```bash
php artisan vendor:publish --provider="Mapo89\LaravelHeizreportApi\HeizreportApiServiceProvider" --tag="config"
```

---

## ⚙️ Usage

```php
use Mapo89\LaravelHeizreportApi\Facades\HeizreportApi;

// Example: Fetch all projects
$data = HeizreportApi::make()->projects()->all(); // customize this based on your needs
```

> 📚 Full API documentation available at: [heizreport.com](https://heizreport.com/hilfethemen/schnittstellen)

---

## ✅ Testing

```bash
composer test
```

---

## 📒 Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

---

## 🔐 Security

If you discover any security issues, please do **not** use the issue tracker. Instead, email us directly at [info@postler.de](mailto:info@postler.de).

---

## 👥 Credits

- [Manuel Postler](https://github.com/mapo-89)  
- [All Contributors](../../contributors)

---

## 📄 License

The MIT License (MIT). Please see the [License File](LICENSE.md) for more information.

---

## 🛠️ Laravel Package Boilerplate

Generated using the [Laravel Package Boilerplate](https://laravelpackageboilerplate.com).
