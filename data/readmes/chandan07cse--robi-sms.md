# AdaReach SMS - Laravel Package & Standalone Library

[![Latest Version on Packagist](https://img.shields.io/packagist/v/chandan07cse/robi-sms.svg?style=flat-square)](https://packagist.org/packages/chandan07cse/robi-sms)
[![Total Downloads](https://img.shields.io/packagist/dt/chandan07cse/robi-sms.svg?style=flat-square)](https://packagist.org/packages/chandan07cse/robi-sms)
[![License](https://img.shields.io/packagist/l/chandan07cse/robi-sms.svg?style=flat-square)](https://packagist.org/packages/chandan07cse/robi-sms)
[![PHP Version](https://img.shields.io/packagist/php-v/chandan07cse/robi-sms.svg?style=flat-square)](https://packagist.org/packages/chandan07cse/robi-sms)

A comprehensive PHP package for integrating with **AdaReach (Robi/MobiReach) Business SMS API**. Works seamlessly with **Laravel** or as a **standalone PHP library** (PHP 7.4+).

---

## 📑 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Laravel Installation](#-laravel-installation)
- [Standalone Installation](#-standalone-installation-without-laravel)
- [Phone Number Formats](#-phone-number-formats)
- [Bangla/Unicode SMS](#-banglaunicode-sms)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)
- [License](#-license)

---

## ✨ Features

### Core Features
- ✅ Send single and bulk SMS messages
- ✅ **Phone auto-normalization** (01XXX → 880XXX, +880XXX → 880XXX)
- ✅ **Bangla/Unicode auto-detection**
- ✅ Real-time SMS delivery tracking
- ✅ Balance checking (API & GUI balance)
- ✅ **PHP 7.4+ compatible**
- ✅ **Works without Laravel** (Standalone mode)
- ✅ Token-based authentication with auto-refresh
- ✅ File-based token caching

### Dashboard Features
- 🎨 Modern, responsive UI with tabs
- 📊 Character counter with SMS parts calculation
- 📱 Single & Bulk SMS sending
- 💰 Real-time balance display
- 🔐 Credential management
- 📄 Message history (Laravel mode)
- 📈 Analytics and statistics (Laravel mode)

### Security
- 🔒 Token-based authentication with auto-refresh
- 🔐 Encrypted credentials (Laravel mode)
- 💾 File-based token caching (Standalone mode)
- 🛡️ Database-backed configuration (Laravel mode)

---

## 📋 Requirements

### Laravel Requirements
- PHP 8.1 or higher
- Laravel 10.x or 11.x
- MySQL/PostgreSQL database
- Redis (optional, for caching)
- Node.js 16+ (for dashboard assets)

### Standalone Requirements
- PHP 7.4 or higher (PHP 7.4, 8.0, 8.1, 8.2, 8.3)
- cURL extension
- JSON extension
- Composer

---

## 🎯 Laravel Installation

Perfect for Laravel applications with full dashboard, analytics, and database integration.

### Step 1: Install Package

```bash
composer require chandan07cse/robi-sms
```

### Step 2: Publish Configuration & Assets

```bash
# Publish config, migrations, and assets
php artisan vendor:publish --provider="AdaReach\Sms\AdaReachServiceProvider"

# Run migrations
php artisan migrate

# Build dashboard assets (optional)
npm install && npm run build
```

### Step 3: Configure Environment

Add these to your `.env` file:

```env
ADAREARCH_USERNAME=your_username
ADAREARCH_PASSWORD=your_password
ADAREARCH_BASE_URL=https://api.mobireach.com.bd
ADAREARCH_DEFAULT_SENDER=8801XXXXXXXXX
```

### Step 4: Usage in Laravel

```php
use AdaReach\Sms\Facades\AdaReach;

// Send single SMS
$response = AdaReach::sendSms('01703611094', 'Hello from Laravel!');

// Send bulk SMS
$response = AdaReach::sendBulkSms(
    ['01703611094', '01812345678'],
    'Bulk message'
);

// Check balance
$balance = AdaReach::getBalance();

// Get account info
$info = AdaReach::getAccountInfo();
```

### Step 5: Access Dashboard

Visit your Laravel SMS dashboard:

```
http://your-laravel-app.test/sms-dashboard
```

**Dashboard Features:**
- 📊 Real-time analytics & statistics
- 📱 Send single & bulk SMS
- 💰 Balance monitoring
- 📈 Message history & tracking
- 🔐 Credential management
- 📄 Export message logs

---

## 🚀 Standalone Installation (Without Laravel)

Perfect for plain PHP projects, WordPress, custom frameworks, or any PHP 7.4+ application.

### Step 1: Install via Composer

```bash
composer require chandan07cse/robi-sms
```

### Step 2: Basic Setup

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

// Initialize client
$client = new StandaloneClient(
    'your_username',
    'your_password',
    'YourSenderID'  // Optional but recommended
);

// Send SMS
try {
    $response = $client->sendSms('01703611094', 'Hello from PHP!');
    
    if ($response['status'] === 'SUCCESS') {
        echo "✅ SMS sent! Message ID: " . $response['id'];
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
```

### Send Bulk SMS

```php
$phones = ['01703611094', '01812345678', '01956789012'];
$message = 'Hello everyone!';

$response = $client->sendBulkSms($phones, $message);

echo "Sent to " . count($response['successful']) . " numbers";
foreach ($response['failed'] as $failed) {
    echo "Failed: {$failed['phone']} - {$failed['error']}\n";
}
```

### Check Balance

```php
// Get current balance
$balance = $client->getBalance();
echo "Current balance: {$balance} BDT\n";

// Get detailed account info
$accountInfo = $client->getAccountInfo();
print_r($accountInfo);
```

### Advanced Configuration

```php
$client = new StandaloneClient(
    'username',
    'password',
    'SenderID',
    'https://api.mobireach.com.bd',  // Custom base URL
    '/path/to/cache'                  // Custom cache directory
);

// Change sender ID dynamically
$client->setSender('NewSenderID');

// Get current sender
$currentSender = $client->getSender();
```

### Dashboard Setup (Optional)

Add ONE line to your `index.php` or routing file:

```php
require __DIR__ . '/vendor/chandan07cse/robi-sms/routes/sms-dashboard.php';
```

Then visit: `http://yoursite.com/sms-dashboard`

**Alternative Methods:**

**Using .htaccess (Apache):**
```apache
RewriteEngine On
RewriteRule ^sms-dashboard$ vendor/chandan07cse/robi-sms/public/sms-dashboard.php [L]
```

**Using Nginx:**
```nginx
location /sms-dashboard {
    rewrite ^/sms-dashboard$ /vendor/chandan07cse/robi-sms/public/sms-dashboard.php last;
}
```

**PHP Built-in Server (Development):**
```bash
cd vendor/chandan07cse/robi-sms/public
php -S localhost:8080 sms-dashboard.php
```

**Environment Configuration:**

Create `.env` file in your project root:

```env
ADAREARCH_USERNAME=your_username
ADAREARCH_PASSWORD=your_password
ADAREARCH_DEFAULT_SENDER=8801XXXXXXXXX
```

---

## 📱 Phone Number Formats

The package automatically normalizes phone numbers. All these formats work:

```php
// All these are normalized to: 8801703611094

$client->sendSms('01703611094', 'Test');       // ✅ Auto-adds 880
$client->sendSms('1703611094', 'Test');        // ✅ Auto-adds 880
$client->sendSms('8801703611094', 'Test');     // ✅ Works as-is
$client->sendSms('+8801703611094', 'Test');    // ✅ Auto-removes +
```

### How it Works

1. **Starts with `+880`** → Removes `+` → `8801703611094`
2. **Starts with `880`** → No change → `8801703611094`
3. **Starts with `01`** → Replaces with `880` → `8801703611094`
4. **Starts with `1`** → Adds `880` prefix → `8801703611094`

---

## 🇧🇩 Bangla/Unicode SMS

The package **automatically detects** Bangla/Unicode characters and sets the correct content type.

### Auto-Detection

```php
// English SMS (contentType=1, 160 chars/SMS)
$client->sendSms('01703611094', 'Hello World');

// Bangla SMS (contentType=2, 70 chars/SMS) - AUTO-DETECTED
$client->sendSms('01703611094', 'হ্যালো বাংলা!');

// Mixed content (Unicode auto-detected)
$client->sendSms('01703611094', 'Hello হ্যালো 123');

// Emoji (Unicode auto-detected)
$client->sendSms('01703611094', 'Hello 👋 World 🌍');
```

### Character Limits

| Content Type | Characters per SMS | Detection |
|--------------|-------------------|-----------|
| English/ASCII | 160 characters | Automatic |
| Bangla/Unicode | 70 characters | Automatic |
| Emoji/Special | 70 characters | Automatic |

### Manual Override

```php
// Force Unicode (not recommended, auto-detection is better)
$response = $client->sendSms('01703611094', 'Test', null, true);
```

---

## 📚 API Reference

### StandaloneClient

#### Constructor

```php
public function __construct(
    string $username,
    string $password,
    string $sender = null,
    string $baseUrl = 'https://api.mobireach.com.bd',
    string $cacheDir = null
)
```

#### Methods

##### sendSms()

Send SMS to a single recipient.

```php
public function sendSms(
    string $phone,
    string $message,
    string $sender = null,
    bool $isUnicode = null
): array
```

**Parameters:**
- `$phone` - Phone number (auto-normalized)
- `$message` - SMS content
- `$sender` - Sender ID (optional, uses default if not provided)
- `$isUnicode` - Force Unicode mode (optional, auto-detected if null)

**Returns:**
```php
[
    'status' => 'SUCCESS',
    'id' => 'message_id',
    'phone' => '8801703611094',
    'message' => 'Your message',
    'sender' => 'SenderID'
]
```

##### sendBulkSms()

Send SMS to multiple recipients.

```php
public function sendBulkSms(
    array $phones,
    string $message,
    string $sender = null,
    bool $isUnicode = null
): array
```

**Returns:**
```php
[
    'status' => 'SUCCESS',
    'successful' => ['8801703611094', '8801812345678'],
    'failed' => [],
    'total' => 2
]
```

##### getBalance()

Check account balance.

```php
public function getBalance(): float
```

**Returns:** Balance amount (float)

##### getAccountInfo()

Get detailed account information.

```php
public function getAccountInfo(): array
```

**Returns:**
```php
[
    'balance' => 1000.50,
    'username' => 'your_username',
    'api_url' => 'https://api.mobireach.com.bd'
]
```

##### setSender()

Set or change the sender ID.

```php
public function setSender(string $sender): self
```

##### getSender()

Get current sender ID.

```php
public function getSender(): ?string
```

---

## 💡 Examples

### Example 1: Simple SMS Sending

```php
<?php
require 'vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

$client = new StandaloneClient('username', 'password', 'MySender');

try {
    $result = $client->sendSms('01703611094', 'Hello from AdaReach!');
    echo "Success! Message ID: " . $result['id'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Example 2: Bulk SMS with Loop

```php
<?php
require 'vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

$client = new StandaloneClient('username', 'password', 'MySender');

// Read phones from database or CSV
$users = [
    ['phone' => '01703611094', 'name' => 'John'],
    ['phone' => '01812345678', 'name' => 'Jane'],
    ['phone' => '01956789012', 'name' => 'Bob']
];

foreach ($users as $user) {
    $message = "Hello {$user['name']}, Welcome to our service!";
    
    try {
        $result = $client->sendSms($user['phone'], $message);
        echo "✅ Sent to {$user['name']}: {$result['id']}\n";
    } catch (Exception $e) {
        echo "❌ Failed for {$user['name']}: {$e->getMessage()}\n";
    }
    
    // Rate limiting (optional)
    sleep(1);
}
```

### Example 3: Check Balance Before Sending

```php
<?php
require 'vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

$client = new StandaloneClient('username', 'password', 'MySender');

// Check balance first
$balance = $client->getBalance();
echo "Current balance: {$balance} BDT\n";

if ($balance < 10) {
    die("Insufficient balance! Please recharge.\n");
}

// Send SMS
$result = $client->sendSms('01703611094', 'Your OTP is: 123456');
echo "OTP sent! Message ID: " . $result['id'];
```

### Example 4: Bangla SMS with Error Handling

```php
<?php
require 'vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

$client = new StandaloneClient('username', 'password', 'MySender');

$phones = ['01703611094', '01812345678'];
$message = 'আপনার অর্ডার সফল হয়েছে। ধন্যবাদ!';

foreach ($phones as $phone) {
    try {
        $result = $client->sendSms($phone, $message);
        
        if ($result['status'] === 'SUCCESS') {
            echo "✅ Sent to {$phone}\n";
        } else {
            echo "❌ Failed to {$phone}: " . ($result['error'] ?? 'Unknown error') . "\n";
        }
    } catch (Exception $e) {
        echo "❌ Exception for {$phone}: {$e->getMessage()}\n";
    }
}
```

### Example 5: Using with Database

```php
<?php
require 'vendor/autoload.php';

use AdaReach\Sms\StandaloneClient;

$client = new StandaloneClient('username', 'password', 'MySender');

// Connect to database
$pdo = new PDO('mysql:host=localhost;dbname=mydb', 'user', 'pass');

// Get pending SMS from database
$stmt = $pdo->query("SELECT id, phone, message FROM pending_sms WHERE sent = 0 LIMIT 100");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    try {
        $result = $client->sendSms($row['phone'], $row['message']);
        
        // Update database
        $update = $pdo->prepare("UPDATE pending_sms SET sent = 1, message_id = ?, sent_at = NOW() WHERE id = ?");
        $update->execute([$result['id'], $row['id']]);
        
        echo "✅ Sent SMS ID: {$row['id']}\n";
    } catch (Exception $e) {
        // Log error
        $error = $pdo->prepare("UPDATE pending_sms SET error = ? WHERE id = ?");
        $error->execute([$e->getMessage(), $row['id']]);
        
        echo "❌ Failed SMS ID: {$row['id']}\n";
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Error 1510: "New API Other Error"

**Cause:** Using old API parameter names.

**Solution:** Update to latest version:
```bash
composer update chandan07cse/robi-sms
```

#### 2. Phone Number Not Working

**Cause:** Invalid phone format.

**Solution:** Use any of these formats (auto-normalized):
```php
'01703611094'      // ✅ Recommended
'8801703611094'    // ✅ Also works
'+8801703611094'   // ✅ Also works
```

#### 3. Bangla SMS Not Sending

**Cause:** Old version without Unicode detection.

**Solution:** Update to latest version. Unicode is now auto-detected:
```bash
composer update chandan07cse/robi-sms
```

#### 4. Dashboard Not Loading

**Cause:** Route not registered or .env not configured.

**Solution:**
1. Add route include:
   ```php
   require __DIR__ . '/vendor/chandan07cse/robi-sms/routes/sms-dashboard.php';
   ```
2. Create `.env` file with credentials

#### 5. Token Cache Issues

**Cause:** No write permissions on cache directory.

**Solution:**
```bash
# Create cache directory
mkdir -p storage/cache/sms

# Set permissions
chmod -R 755 storage/cache/sms
```

### Debug Mode

Enable debug mode to see detailed API responses:

```php
$client = new StandaloneClient('user', 'pass', 'sender');

try {
    $result = $client->sendSms('01703611094', 'Test');
    print_r($result);  // See full response
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    echo "\nTrace: " . $e->getTraceAsString();
}
```

---

## 📝 Changelog

### [v2.1.0] - 2026-01-31

#### 🐛 Critical Bug Fix - SMS Sending Now Works!

**Fixed Error 1510** - Standalone client was using incorrect API parameter names.

**Fixed:**
- ✅ Corrected AdaReach API parameter names in StandaloneClient
  - Changed `recipients` → `receiver` (API requirement)
  - Changed `text` → `content` (API requirement)
  - Added `msgType` = 'T' (Transactional/Promotional flag)
  - Added `requestType` = 'S'/'B' (Single/Bulk detection)
  - Added `contentType` = 1/2 (Regular text/Unicode flag)

**Impact:**
- ✅ SMS sending now works correctly in standalone mode
- ✅ Fixes Error 1510 "New API Other Error"
- ✅ No breaking changes - existing code works as-is

### [v2.0.0] - 2026-01-31

#### 🎉 Major Release - PHP 7.4+ Support & Standalone Mode

**Added:**
- ✅ Standalone Client for use without Laravel
- ✅ PHP 7.4, 8.0, 8.1, 8.2, 8.3 support
- ✅ Phone number auto-normalization (01XXX → 880XXX)
- ✅ Bangla/Unicode auto-detection
- ✅ Ready-to-use SMS dashboard
- ✅ File-based token caching
- ✅ cURL-based HTTP client

---

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

## 🤝 Support

- **GitHub:** [https://github.com/chandan07cse/robi-sms](https://github.com/chandan07cse/robi-sms)
- **Packagist:** [https://packagist.org/packages/chandan07cse/robi-sms](https://packagist.org/packages/chandan07cse/robi-sms)
- **Issues:** [https://github.com/chandan07cse/robi-sms/issues](https://github.com/chandan07cse/robi-sms/issues)

---

## 🙏 Credits

- **Author:** [chandan07cse](https://github.com/chandan07cse)
- **API Provider:** [AdaReach (MobiReach)](https://www.mobireach.com.bd/)

---

Made with ❤️ for the PHP community
