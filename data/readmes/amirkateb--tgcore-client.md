# Main Panel
برای دریافت توکن و پنل به ایدی @amir_katebsaber در تلگرام پیام دهید
# TGCore Client (amirkateb/tgcore-client)

این پکیج برای پروژه‌های Laravel طراحی شده تا **فقط از طریق TGCore (هسته مرکزی تلگرام)** با تلگرام کار کنند.

در این معماری:
- **TGCore** توکن بات را نگه می‌دارد، وبهوک تلگرام را دریافت می‌کند، همه‌چیز را لاگ/رصد می‌کند و آپدیت‌ها را به پروژه شما فوروارد می‌کند.
- **پروژه مصرف‌کننده (Consumer)** هیچ ارتباط مستقیمی با Telegram Bot API ندارد و فقط از طریق TGCore پیام/فایل ارسال می‌کند.
- **TGCore Client** داخل پروژه مصرف‌کننده نصب می‌شود تا:
  1) آپدیت‌های فوروارد‌شده از TGCore را دریافت کند و امضای HMAC را verify کند (با محافظت در برابر replay).
  2) payload را نرمال کند و به Handlerهای پروژه شما dispatch کند (مستقیم یا روی queue).
  3) یک Gateway Client بدهد تا **ارسال پیام/فایل فقط از طریق TGCore** انجام شود (JSON و Multipart واقعی).

---

## سازگاری

- PHP: `^8.1`
- Laravel: `10.x` و `11.x`

---

## نصب

### روش 1: نصب از Packagist / VCS
```bash
composer require amirkateb/tgcore-client
```

### روش 2: نصب به صورت لوکال (Path Repository)
اگر پکیج را کنار پروژه نگه می‌دارید:

در `composer.json` پروژه مصرف‌کننده:
```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../tgcore-client"
    }
  ]
}
```

سپس:
```bash
composer require amirkateb/tgcore-client:dev-main
```

---

## انتشار کانفیگ و اجرای مایگریشن

### Publish کانفیگ
```bash
php artisan vendor:publish --tag=tgcore-client-config
```

### اجرای مایگریشن‌ها
```bash
php artisan migrate
```

این جداول ساخته می‌شود:
- `tgcore_client_bots` (اختیاری، در صورت استفاده از resolver دیتابیس)
- `tgcore_client_update_receipts` (برای idempotency و ثبت وضعیت دریافت/هندل)

---

## تنظیمات TGCore (در پنل مدیریت Core)

برای هر Bot در پنل TGCore این فیلدها باید تنظیم شود:

1) **consumer_url**
- آدرس endpoint دریافت آپدیت در پروژه مصرف‌کننده
- پیش‌فرض پکیج:  
  `/tgcore/ingest`
- مثال:
  - `https://consumer.example.com/tgcore/ingest`

2) **consumer_secret**
- یک secret قوی که TGCore برای امضای درخواست‌های فوروارد به consumer استفاده می‌کند
- همین secret در پروژه مصرف‌کننده هم باید برای verify موجود باشد (با config یا database)

3) **Set Webhook**
- برای Bot باید webhook روی TGCore set شود (در خود پنل TGCore)

4) **Outbound (Consumer -> Core)**
- پروژه مصرف‌کننده برای ارسال پیام/فایل به TGCore از endpointهای Core استفاده می‌کند:
  - `/api/tgcore/consumer/bots/{botUuid}/send-message`
  - `/api/tgcore/consumer/bots/{botUuid}/send-photo`
  - `/api/tgcore/consumer/bots/{botUuid}/send-document`
  - `/api/tgcore/consumer/bots/{botUuid}/send-voice`
  - `/api/tgcore/consumer/bots/{botUuid}/send-audio`
  - `/api/tgcore/consumer/bots/{botUuid}/send-video`
  - `/api/tgcore/consumer/bots/{botUuid}/send-location`
  - `/api/tgcore/consumer/bots/{botUuid}/send-chat-action`
  - `/api/tgcore/consumer/bots/{botUuid}/edit-message-text`
  - `/api/tgcore/consumer/bots/{botUuid}/answer-callback-query`
  - `/api/tgcore/consumer/bots/{botUuid}/send-media-group`
  - `/api/tgcore/consumer/bots/{botUuid}/send-sticker`
  - `/api/tgcore/consumer/bots/{botUuid}/send-animation`
  - `/api/tgcore/consumer/bots/{botUuid}/send-invoice`

نکته: تمام این درخواست‌ها توسط TGCore با **consumer_secret همان Bot** verify می‌شوند و سپس TGCore با توکن خودش به تلگرام ارسال می‌کند.

---

## تنظیمات پروژه مصرف‌کننده (Consumer)

### 1) تنظیم مسیر ingest
در `config/tgcore_client.php`:
- `route.path` پیش‌فرض `/tgcore/ingest` است.

اگر می‌خواهید تغییر دهید:
```php
'route' => [
    'path' => '/my-ingest',
]
```

### 2) تنظیم middleware روت ingest
پیش‌فرض:
- `api`
- `tgcore-client.verify`

اگر لازم دارید middleware دیگری اضافه کنید:
```php
'route' => [
    'middleware' => ['api', 'tgcore-client.verify'],
]
```

### 3) Verify امضای TGCore (Core -> Consumer)
پکیج برای verify از این headerها استفاده می‌کند:
- `X-TGCore-Bot-UUID`
- `X-TGCore-Timestamp`
- `X-TGCore-Signature`

و با `tolerance_seconds` و `replay_ttl_seconds` از replay جلوگیری می‌کند:
```php
'signature' => [
    'tolerance_seconds' => 300,
    'replay_ttl_seconds' => 600,
],
```

### 4) تعریف Secret برای هر Bot (Resolver)

دو حالت دارید:

#### حالت A) Resolver از Config
در `.env`:
```
TGCORE_CLIENT_RESOLVER=config
```

در `config/tgcore_client.php`:
```php
'bots' => [
    'BOT_UUID_1' => ['secret' => 'CONSUMER_SECRET_1'],
    'BOT_UUID_2' => ['secret' => 'CONSUMER_SECRET_2'],
],
```

#### حالت B) Resolver از Database
در `.env`:
```
TGCORE_CLIENT_RESOLVER=database
```

سپس در جدول `tgcore_client_bots` رکورد بسازید:
- `bot_uuid` = همان uuid بات در TGCore
- `secret` = consumer_secret همان بات
- `is_active` = 1

---

## صف (Queue) و نحوه پردازش آپدیت‌ها

پکیج می‌تواند آپدیت‌ها را:
- مستقیم هندل کند (sync)
- یا به Job بفرستد (پیشنهادی برای production)

در `.env`:
```
TGCORE_CLIENT_QUEUE_ENABLED=true
TGCORE_CLIENT_QUEUE_NAME=default
```

اگر connection خاص می‌خواهید:
```
TGCORE_CLIENT_QUEUE_CONNECTION=redis
```

اجرای worker:
```bash
php artisan queue:work
```

---

## تعریف Handlerها (Routing منطق ربات در Consumer)

Handlerها داخل پروژه مصرف‌کننده هستند و فقط روی DTO کار می‌کنند.

### 1) نمونه Handler (Echo)
فایل: `app/TGCore/Handlers/EchoHandler.php`
```php
<?php

namespace App\TGCore\Handlers;

use amirkateb\TGCoreClient\Contracts\UpdateHandler;
use amirkateb\TGCoreClient\DTO\TGCoreUpdate;
use amirkateb\TGCoreClient\Gateway\TGCoreGatewayClient;

class EchoHandler implements UpdateHandler
{
    public function __construct(
        private readonly TGCoreGatewayClient $gateway
    ) {
    }

    public function handle(TGCoreUpdate $update): mixed
    {
        if ($update->type() !== 'message') {
            return null;
        }

        $botUuid = $update->botUuid();
        $chatId = $update->chatId();

        if (!$botUuid || !$chatId) {
            return null;
        }

        $text = $update->messageText() ?? '';

        return $this->gateway->sendMessage($botUuid, $chatId, 'گرفتم: ' . $text);
    }
}
```

### 2) اتصال Handler در کانفیگ
در `config/tgcore_client.php`:
```php
'handlers' => [
    'types' => [
        'message' => [
            \App\TGCore\Handlers\EchoHandler::class,
        ],
    ],
    'commands' => [
    ],
    'default' => [
    ],
],
```

پکیج ابتدا handlerهای `command` را (اگر متن `/start` و … باشد) اعمال می‌کند و سپس handlerهای `type` را.

---

## DTO و فیلدهای مهم

`amirkateb\TGCoreClient\DTO\TGCoreUpdate` شامل:
- `botUuid()`
- `updateDbId()`
- `telegramUpdateId()`
- `type()`
- `chatId()`
- `fromId()`
- `messageId()`
- `messageText()`
- `callbackData()`
- `fileIds()`

---

## ارسال پیام/فایل فقط از طریق Core (Gateway Client)

تمام ارسال‌ها از طریق:
`amirkateb\TGCoreClient\Gateway\TGCoreGatewayClient`

### تنظیمات Gateway
در `.env` پروژه مصرف‌کننده:
```
TGCORE_GATEWAY_BASE_URL=https://tgcore.example.com
TGCORE_GATEWAY_PATH_PREFIX=/api/tgcore/consumer
TGCORE_GATEWAY_TIMEOUT=15
TGCORE_GATEWAY_CONNECT_TIMEOUT=7
```

نکته: `TGCORE_GATEWAY_BASE_URL` باید URL سرور TGCore باشد.

---

### 1) sendMessage
```php
$gateway->sendMessage($botUuid, $chatId, 'سلام', [
    'parse_mode' => 'HTML',
]);
```

### 2) ارسال Photo با file_id یا URL
```php
$gateway->sendPhoto($botUuid, $chatId, $fileIdOrUrl, [
    'caption' => 'عکس',
]);
```

### 3) ارسال Photo با Multipart واقعی (کم‌هزینه و مناسب فایل بزرگ)
```php
$gateway->sendPhotoUpload($botUuid, $chatId, storage_path('app/tmp/p.jpg'), 'p.jpg', [
    'caption' => 'عکس',
]);
```

### 4) ارسال Document / Voice / Audio / Video با Multipart واقعی
```php
$gateway->sendDocumentUpload($botUuid, $chatId, storage_path('app/tmp/report.pdf'), 'report.pdf', [
    'caption' => 'فایل',
]);

$gateway->sendVoiceUpload($botUuid, $chatId, storage_path('app/tmp/v.ogg'), 'v.ogg');

$gateway->sendAudioUpload($botUuid, $chatId, storage_path('app/tmp/a.mp3'), 'a.mp3', [
    'title' => 'Music',
]);

$gateway->sendVideoUpload($botUuid, $chatId, storage_path('app/tmp/v.mp4'), 'v.mp4', [
    'supports_streaming' => true,
]);
```

---

## sendMediaGroup

### حالت A) بدون آپلود (فقط file_id / URL)
```php
$media = [
    ['type' => 'photo', 'media' => $fileId1, 'caption' => 'اولی'],
    ['type' => 'photo', 'media' => $fileId2, 'caption' => 'دومی'],
];

$gateway->sendMediaGroup($botUuid, $chatId, $media);
```

### حالت B) با آپلود Multipart واقعی
در media باید از `attach://` استفاده کنید:
```php
$media = [
    ['type' => 'photo', 'media' => 'attach://p1', 'caption' => 'اولی'],
    ['type' => 'photo', 'media' => 'attach://p2', 'caption' => 'دومی'],
];

$attachments = [
    'p1' => storage_path('app/tmp/1.jpg'),
    'p2' => storage_path('app/tmp/2.jpg'),
];

$gateway->sendMediaGroupUpload($botUuid, $chatId, $media, $attachments);
```

---

## sendSticker / sendAnimation

### Sticker با file_id
```php
$gateway->sendSticker($botUuid, $chatId, $fileId);
```

### Sticker با آپلود
```php
$gateway->sendStickerUpload($botUuid, $chatId, storage_path('app/tmp/s.webp'), 's.webp');
```

### Animation با آپلود
```php
$gateway->sendAnimationUpload($botUuid, $chatId, storage_path('app/tmp/a.gif'), 'a.gif', [
    'caption' => 'گیف',
]);
```

---

## sendInvoice

```php
$gateway->sendInvoice($botUuid, [
    'chat_id' => $chatId,
    'title' => 'اشتراک',
    'description' => 'پلن ماهانه',
    'payload' => 'sub_month_1',
    'provider_token' => 'PROVIDER_TOKEN',
    'currency' => 'USD',
    'prices' => [
        ['label' => 'Monthly', 'amount' => 499],
    ],
]);
```

---

## خطاهای رایج و عیب‌یابی

### 1) invalid_signature / missing_headers
- مطمئن شوید `consumer_secret` برای همان Bot در TGCore تنظیم شده است.
- در پروژه مصرف‌کننده، secret همان bot_uuid باید موجود باشد (config یا database).
- clock سرورها خیلی اختلاف نداشته باشد (بهتر: NTP فعال باشد).

### 2) timestamp_out_of_range
- اختلاف ساعت سرور Consumer و TGCore زیاد است.
- مقدار `tolerance_seconds` را موقتاً افزایش دهید، سپس مشکل ساعت را حل کنید.

### 3) duplicate=true
- یعنی همان درخواست قبلاً با همین امضا دریافت شده؛ replay protection فعال است.

### 4) gateway_base_url_missing
- `TGCORE_GATEWAY_BASE_URL` در پروژه مصرف‌کننده ست نشده است.

---

## نکات امنیتی

- `consumer_secret` باید طولانی و تصادفی باشد.
- در production حتماً HTTPS استفاده شود.
- توصیه می‌شود TGCore و Consumer هر دو NTP داشته باشند تا timestamp درست باشد.
- اگر چند Bot دارید، secret هر Bot را جدا نگه دارید.

---

## لایسنس
MIT
