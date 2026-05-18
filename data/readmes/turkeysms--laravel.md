# TurkeySMS Laravel Package (Official) 🚀

Integrate **TurkeySMS API V4** into your Laravel application seamlessly. This official package provides a clean, elegant syntax for sending SMS, OTP, and managing your TurkeySMS account. Featuring Facade support and Auto-Discovery.

## 🛠 Installation

You can install the package via composer:

```bash
composer require turkeysms/laravel
```

The package will automatically register its service provider and facade (Auto-Discovery).

### Publish Configuration

Publish the config file to customize your settings:

```bash
php artisan vendor:publish --provider="TurkeySms\Laravel\TurkeySmsServiceProvider" --tag="config"
```

---

## ⚙️ Configuration

Add your **API Key** to your `.env` file:

```env
TURKEYSMS_API_KEY=your_api_key_here
TURKEYSMS_DEFAULT_TITLE=SENDER
```

---

## 🚀 Usage

### Sending Standard SMS

```php
use TurkeySms;

$result = TurkeySms::send([
    'mobile' => '905xxxxxxxxx',
    'text'   => 'Hello from TurkeySMS Laravel!',
    'title'  => 'SENDER'
]);
```

### Sending OTP SMS

Ultra-fast delivery for verification codes:

```php
$result = TurkeySms::sendOtp([
    'mobile' => '905xxxxxxxxx',
    'lang'   => 1, // 0: English, 1: Turkish, 2: Arabic
    'digits' => 4
]);
```

### Advanced OTP (Custom Text)

```php
$result = TurkeySms::sendDetailedOtp([
    'mobile' => '905xxxxxxxxx',
    'title'  => 'SENDER',
    'text'   => 'Your verification code is: TS-CODE',
    'lang'   => 1
]);
```

### Check Balance

```php
$balance = TurkeySms::getBalance();
// Returns: ["status" => "success", "balance" => "1500 SMS", ...]
```

---

## 🛡 Security

If you discover any security-related issues, please email support@turkeysms.com.tr instead of using the issue tracker.

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---
© 2026 **TurkeySMS Bilişim ve İletişim Hizmetleri Tic. Ltd. Şti.**
