# elgibor-solution/laravel-payment-bni

Namespace: `ESolution\BNIPayment`

Laravel package to integrate **BNI Virtual Account / eCollection** and **BNI QRIS SNAP BI (MPM)** with:

- ✅ VA: create, update, inquiry
- ✅ QRIS SNAP BI (Dynamic QR MPM + Inquiry)
- ✅ Access Token B2B (SNAP)
- ✅ X-SIGNATURE (HMAC / RSA)
- ✅ Webhook payment notification
- ✅ Audit trail ke DB (request/response)
- ✅ Error handling granular (kode BNI)
- ✅ DB Config (override config file)
- ✅ Mirror billing + reconcile (scheduler)
- ✅ Events: `BniPaymentReceived`, `BniBillingPaid`, `BniBillingExpired`
- ✅ Unit tests (Orchestra), Postman collection

---

## 📦 Installation

```bash
composer require elgibor-solution/laravel-payment-bni
```

Publish config & migration:

```bash
php artisan vendor:publish --provider="ESolution\BNIPayment\BNIPaymentServiceProvider"
php artisan vendor:publish --provider="ESolution\BNIPayment\BNIPaymentServiceProvider" --tag=bni-migrations
php artisan migrate
```

---

## ⚙️ Configuration

File utama konfigurasi: **`config/bni.php`**

### ENV minimal

```env
# General BNI
BNI_HOSTNAME=api.bni-ecollection.com
BNI_HOSTNAME_STAGING=apibeta.bni-ecollection.com
BNI_PORT=443
BNI_ORIGIN=https://your-domain.com
BNI_CLIENT_ID=your_bni_client_id
BNI_TIMEOUT=15
BNI_VERIFY_SSL=true
BNI_DEBUG=true        # true = sandbox / staging

# ==== QRIS SNAP / SNAP BI ====
BNI_SNAP_BASE_URL=https://merchant-api.qris-bni.com/apisnap
BNI_SNAP_BASE_URL_STAGING=https://qris-merchant-api.spesandbox.com/apisnap
BNI_SNAP_CLIENT_ID=your_snap_client_id
BNI_SNAP_CLIENT_KEY=your_snap_client_key
BNI_SNAP_CLIENT_SECRET=your_snap_client_secret
BNI_SNAP_PARTNER_ID=your_partner_id
BNI_SNAP_VERSION=v1.0
BNI_SNAP_PRIVATE_KEY_PATH=/full/path/to/private_key.pem
BNI_SNAP_SIGNATURE_TYPE=1   # 1=HMAC+Token, 2=RSA no token

# ==== QRIS Merchant Info ====
BNI_QRIS_MERCHANT_ID=00007100010926
BNI_QRIS_TERMINAL_ID=213141251124
BNI_QRIS_PATH_GENERATE_QR=/v1.0/debit/payment-qr/qr-mpm
BNI_QRIS_PATH_QUERY_PAYMENT=/v1.0/debit/payment-qr/qr-mpm/status
BNI_QRIS_PATH_ACCESS_TOKEN=/access-token/b2b
```

### Potongan `config/bni.php` (versi baru)

```php
return [
    'hostname' => env('BNI_HOSTNAME', 'api.bni-ecollection.com'),
    'hostname_staging' => env('BNI_HOSTNAME_STAGING', 'apibeta.bni-ecollection.com'),
    'port' => (int) env('BNI_PORT', 443),
    'origin' => env('BNI_ORIGIN', 'your-origin'),
    'client_id' => env('BNI_CLIENT_ID', '320'),
    'timeout' => (int) env('BNI_TIMEOUT', 15),
    'verify_ssl' => (bool) env('BNI_VERIFY_SSL', true),

    'debug' => (bool) env('BNI_DEBUG', false),

    'snap' => [
        'base_url' => env('BNI_SNAP_BASE_URL', 'https://merchant-api.qris-bni.com/apisnap'),
        'base_url_staging' => env('BNI_SNAP_BASE_URL_STAGING', 'https://qris-merchant-api.spesandbox.com/apisnap'),
        'version' => env('BNI_SNAP_VERSION', 'v1.0'),
        'client_id' => env('BNI_SNAP_CLIENT_ID', env('BNI_CLIENT_ID')),
        'client_key' => env('BNI_SNAP_CLIENT_KEY', env('BNI_CLIENT_ID')),
        'client_secret' => env('BNI_SNAP_CLIENT_SECRET', ''),
        'partner_id' => env('BNI_SNAP_PARTNER_ID', ''),
        'private_key_path' => env('BNI_SNAP_PRIVATE_KEY_PATH', storage_path('app/bni/snap_private_key.pem')),
        'public_key_path' => env('BNI_SNAP_PUBLIC_KEY_PATH', storage_path('app/bni/snap_public_key.pem')),
        'signature_type' => (int) env('BNI_SNAP_SIGNATURE_TYPE', 1),
        'timeout' => (int) env('BNI_SNAP_TIMEOUT', env('BNI_TIMEOUT', 15)),
        'verify_ssl' => (bool) env('BNI_SNAP_VERIFY_SSL', env('BNI_VERIFY_SSL', true)),
    ],

    'routes' => [
        'prefix' => env('BNI_ROUTE_PREFIX', ''),
        'middleware' => ['api'],
    ],

    'qris' => [
        'merchant_id' => env('BNI_QRIS_MERCHANT_ID', ''),
        'terminal_id' => env('BNI_QRIS_TERMINAL_ID', ''),
        'path_access_token'  => env('BNI_QRIS_PATH_ACCESS_TOKEN', '/access-token/b2b'),
        'path_generate_qr'   => env('BNI_QRIS_PATH_GENERATE_QR', '/v1.0/debit/payment-qr/qr-mpm'),
        'path_query_payment' => env('BNI_QRIS_PATH_QUERY_PAYMENT', '/v1.0/debit/payment-qr/qr-mpm/status'),
        // fallback lama
        'path_create_dynamic' => '/qris/create',
        'path_inquiry_status' => '/qris/inquiry',
    ],

    'schedule' => [
        'enabled' => env('BNI_SCHEDULE_ENABLED', false),
        'cron' => env('BNI_SCHEDULE_CRON', '*/5 * * * *'),
    ],
];
```

> ⚠️ **Catatan:** Untuk VA / eCollection masih memakai mekanisme lama (BniEnc). SNAP BI khusus untuk channel `qris`.

---

## 🧱 Arsitektur Singkat

| Class                      | Fungsi                                               |
| -------------------------- | ---------------------------------------------------- |
| `BaseClient`               | HTTP client, logger, routing ke host BNI (VA / SNAP) |
| `BniVaClient`              | Integrasi BNI Virtual Account / eCollection          |
| `BniQrisClient`            | Integrasi BNI QRIS SNAP BI (generate QR & inquiry)   |
| `BniSnapAuth`              | Access Token B2B, X-SIGNATURE (HMAC / RSA)           |
| `BniEnc`                   | Enkripsi / dekripsi payload BNI VA                   |
| `BniPaymentLog`            | Audit trail request/response                         |
| `BniBilling`               | Mirror data billing VA di DB                         |
| Event `BniPaymentReceived` | Dikirim saat ada webhook payment                     |
| Event `BniBillingPaid`     | Dikirim saat VA sukses dibayar                       |
| Event `BniBillingExpired`  | Dikirim saat VA kedaluwarsa                          |

---

## 🧾 Penggunaan BNI VA / eCollection

### 1. Persiapan data kredensial

Untuk VA, kamu akan menerima dari BNI:

- `client_id`
- `secret_key` (kadang disebut `client_secret` atau `api_key` di dokumen lama)
- Prefix billing (optional, tergantung setup)

**Saran:** simpan di `.env` kamu sendiri:

```env
BNI_VA_CLIENT_ID=your_va_client_id
BNI_VA_SECRET=your_va_secret_key
BNI_VA_PREFIX=SAAS   # contoh prefix untuk nomor VA
```

Dan di `config/services.php` (opsional):

```php
'bni_va' => [
    'client_id' => env('BNI_VA_CLIENT_ID', env('BNI_CLIENT_ID')),
    'secret' => env('BNI_VA_SECRET', ''),
    'prefix' => env('BNI_VA_PREFIX', ''),
],
```

### 2. Membuat VA (Create Billing)

```php
use ESolution\BNIPayment\Clients\BniVaClient;

$clientId = config('services.bni_va.client_id');   // atau config('bni.client_id')
$secret   = config('services.bni_va.secret');
$prefix   = config('services.bni_va.prefix', '');

$client = app(BniVaClient::class);

$response = $client->createVa([
    'type'           => 'createbilling',
    'client_id'      => $clientId,
    'trx_id'         => 'INV-2025-0001',   // unique per invoice
    'trx_amount'     => '150000',          // tanpa desimal
    'billing_type'   => 'c',               // 'c' = closed / fixed amount
    'customer_name'  => 'PT Pelanggan Makmur',
    'customer_email' => 'finance@pelanggan.com',
    'customer_phone' => '08123456789',
    'datetime_expired' => '2025-12-31 23:59:00',
    'description'    => 'Tagihan langganan SaaS bulan Desember 2025',
], $clientId, $prefix, $secret);
```

Paket ini akan otomatis:

- Meng-enkripsi payload
- Memanggil endpoint BNI eCollection
- Menyimpan / mengupdate data ke tabel `bni_billings` via model `BniBilling`:
  - `trx_id`
  - `virtual_account`
  - `trx_amount`
  - `customer_name` / `customer_email` / `customer_phone`
  - `billing_type`
  - `description`
  - `expired_at`

### 3. Update VA (Update Billing)

```php
$response = $client->updateVa([
    'type'           => 'updatebilling',
    'client_id'      => $clientId,
    'trx_id'         => 'INV-2025-0001',
    'trx_amount'     => '200000',
    'customer_name'  => 'PT Pelanggan Makmur',
    'customer_email' => 'finance@pelanggan.com',
    'customer_phone' => '08123456789',
    'billing_type'   => 'c',
    'description'    => 'Update nominal tagihan',
    'datetime_expired' => '2026-01-15 23:59:00',
], $clientId, $prefix, $secret);
```

### 4. Inquiry VA (Cek Status Billing)

```php
$response = $client->inquiryVa('INV-2025-0001', $clientId, $prefix, $secret);

// Contoh akses data:
$status   = $response['status'] ?? null;
$paidAmt  = $response['payment_amount'] ?? null;
```

---

## 🔔 Webhook Payment Notification (VA)

Paket ini menyediakan route webhook default untuk notifikasi pembayaran BNI VA.

### 1. Route

Setelah publish config, route default:

```text
POST /bni/va/payment-notification
```

Route ini:

- Memverifikasi dan mendekripsi payload
- Menyimpan log ke `bni_payment_logs`
- Mengupdate status `BniBilling`
- Mem-broadcast event `BniPaymentReceived`

### 2. Contoh Listener

Daftarkan listener di `EventServiceProvider`:

```php
protected $listen = [
    \ESolution\BNIPayment\Events\BniPaymentReceived::class => [
        \App\Listeners\HandleBniPaymentReceived::class,
    ],
];
```

Contoh listener sederhana:

```php
namespace App\Listeners;

use ESolution\BNIPayment\Events\BniPaymentReceived;

class HandleBniPaymentReceived
{
    public function handle(BniPaymentReceived $event)
    {
        $payload = $event->payload;

        // contoh: tandai invoice sebagai paid
        $trxId = $payload['trx_id'] ?? null;

        if ($trxId) {
            // update invoice internal kamu di sini
        }
    }
}
```

---

## 🕒 Scheduler & Reconcile

Aktifkan scheduler di `.env`:

```env
BNI_SCHEDULE_ENABLED=true
BNI_SCHEDULE_CRON=*/5 * * * *   # setiap 5 menit
```

Tambahkan ke `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    if (config('bni.schedule.enabled')) {
        $schedule->command('bni:reconcile')->cron(config('bni.schedule.cron'));
    }
}
```

Jalankan manual:

```bash
php artisan bni:reconcile
```

---

## 💳 Penggunaan BNI QRIS SNAP BI (MPM)

### 1. Inisialisasi Client

```php
use ESolution\BNIPayment\Clients\BniQrisClient;

$qris = new BniQrisClient();
```

### 2. Generate Dynamic QR (MPM)

```php
$response = $qris->generateQr([
    'partnerReferenceNo' => 'INV-2025-0001',
    'amount' => [
        'value' => '15000.00',
        'currency' => 'IDR',
    ],
    'merchantId'    => config('bni.qris.merchant_id'),
    'terminalId'    => config('bni.qris.terminal_id'),
    'validityPeriod'=> '2025-12-31T23:59:00+07:00',
    'additionalInfo'=> [
        'additionalData' => 'Tagihan SaaS Desember 2025',
    ],
]);

$qrContent = $response['qrContent'] ?? null;
```

### 3. Inquiry Payment (MPM Query Payment)

```php
// cukup dengan partnerReferenceNo
$response = $qris->queryPayment('INV-2025-0001');

// atau dengan payload lengkap
$response = $qris->queryPayment([
    'partnerReferenceNo' => 'INV-2025-0001',
]);

$status = $response['responseCode'] ?? null;
```

> `BniQrisClient::createDynamic()` dan `BniQrisClient::inquiryStatus()` masih ada sebagai alias untuk kompatibilitas mundur, namun disarankan pindah ke `generateQr()` dan `queryPayment()`.

---

## 🔑 Access Token B2B SNAP

Access Token (`../{version}/access-token/b2b`) diambil otomatis oleh `BaseClient` ketika:

- Channel = `qris`
- `signature_type = 1` (Symmetric Signature with Get Token)

Token disimpan di Laravel Cache.

Jika ingin ambil manual:

```php
use ESolution\BNIPayment\Services\BniSnapAuth;

$token = BniSnapAuth::getAccessToken();
```

---

## 🔐 X-SIGNATURE (HMAC / RSA)

Implementasi mengikuti dokumen **MPM – BNI QR ACQUIRING MERCHANT API SNAP BI v1.5.5**.

### Signature Type 1 – Symmetric (HMAC SHA512)

```text
stringToSign =
  HTTPMethod + ":" +
  EndpointUrl + ":" +
  AccessToken + ":" +
  Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" +
  TimeStamp
```

Header:

- `X-SIGNATURE = HMAC_SHA512(clientSecret, stringToSign)`
- `Authorization: Bearer {accessToken}`

### Signature Type 2 – Asymmetric (RSA SHA256)

```text
stringToSign =
  HTTPMethod + ":" +
  EndpointUrl + ":" +
  Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" +
  TimeStamp
```

Header:

- `X-SIGNATURE = base64(RSA-SHA256(privateKey, stringToSign))`

Paket ini menangani detail tersebut secara otomatis lewat `BniSnapAuth::buildRequestSignature()` dan `BaseClient::snapRequest()`.

---

## 🧪 Testing

```bash
php artisan test
```

Atau dari Tinker:

```bash
php artisan tinker

>>> app(ESolution\BNIPayment\Clients\BniVaClient::class)->createVa([...]);
>>> app(ESolution\BNIPayment\Clients\BniQrisClient::class)->generateQr([...]);
```

---

## 🤝 Contributing

Pull request dan issue sangat diterima.

1. Fork repository
2. Buat branch feature: `git checkout -b feature/nama-feature`
3. Commit & push
4. Buka Pull Request

---

## 📄 License

Apache 2.0

---

## 🧑‍💻 Maintainer

**PT Elgibor Solusi Digital**  
https://elgibor-solution.com
