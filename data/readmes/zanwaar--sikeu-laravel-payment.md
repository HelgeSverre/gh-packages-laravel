# SIKEU Laravel Payment

Laravel package untuk integrasi SIKEU Payment Gateway. Package ini hanya menyediakan service layer; controller, route, dan callback handler dibuat di aplikasi Laravel Anda.

## Requirements

- PHP 8.0+
- Laravel 9.x sampai 13.x
- Guzzle HTTP Client 7.x

## Instalasi

```bash
composer require sikeu/laravel-payment
php artisan vendor:publish --tag=sikeu-config
```

Tambahkan ke `.env`:

```env
SIKEU_API_BASE_URL=https://api.sikeu.id
SIKEU_API_KEY=your-api-key
SIKEU_SHARED_SECRET=your-shared-secret
SIKEU_SOURCE_APP=YOUR_APP_NAME
SIKEU_DEFAULT_PROVIDER=BRI
SIKEU_DEFAULT_QRIS_PROVIDER=BRI_QRIS
```

Lalu refresh config:

```bash
php artisan config:clear
```

## Alur Yang Direkomendasikan

1. Ambil daftar `service_category` lewat `getAvailableServices()`.
2. Ambil daftar `revenue_account_code` lewat `getRevenueAccountCodes()`.
3. Simpan atau tampilkan dua daftar itu di aplikasi Anda.
4. Saat membuat payment request, kirim hanya nilai yang berasal dari dua method tersebut.
5. Cek status dengan `checkPaymentRequest()` atau proses notifikasi callback dari SIKEU.

> `service_category` dan `revenue_account_code` tidak boleh di-hardcode berdasarkan asumsi. Dua field ini harus mengikuti master data dari SIKEU.

## Implementasi Minimal

Controller paling sederhana yang siap dipakai:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Sikeu\LaravelPayment\Exceptions\SikeuPaymentException;
use Sikeu\LaravelPayment\Services\SikeuPaymentService;

class PaymentController extends Controller
{
    public function __construct(
        private SikeuPaymentService $payment
    ) {}

    public function serviceCategories()
    {
        return response()->json($this->payment->getAvailableServices());
    }

    public function revenueAccountCodes()
    {
        return response()->json($this->payment->getRevenueAccountCodes());
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'service_category' => 'required|string',
            'customer_no' => 'required|string',
            'customer_name' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string',
            'revenue_account_code' => 'required|string',
            'provider' => 'nullable|string',
            'attributes' => 'nullable|array',
        ]);

        try {
            return response()->json($this->payment->createPaymentRequest($validated));
        } catch (SikeuPaymentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->getResponseData(),
            ], 400);
        }
    }

    public function show(string $paymentRequestId)
    {
        try {
            return response()->json($this->payment->checkPaymentRequest($paymentRequestId));
        } catch (SikeuPaymentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->getResponseData(),
            ], 400);
        }
    }
}
```

Route yang direkomendasikan:

```php
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('payments')->group(function () {
    Route::get('/service-categories', [PaymentController::class, 'serviceCategories']);
    Route::get('/revenue-account-codes', [PaymentController::class, 'revenueAccountCodes']);
    Route::post('/', [PaymentController::class, 'create']);
    Route::get('/{paymentRequestId}', [PaymentController::class, 'show']);
});
```

Contoh request:

```json
{
    "service_category": "UKT",
    "customer_no": "2024000001",
    "customer_name": "John Doe",
    "amount": 5000000,
    "description": "Pembayaran UKT",
    "revenue_account_code": "411100",
    "attributes": {
        "nim": "2024000001",
        "faculty": "Teknik",
        "study_program": "Informatika",
        "semester": "2"
    }
}
```

Nilai `UKT` dan `411100` di atas hanya contoh. Ambil nilai validnya dari SIKEU melalui `getAvailableServices()` dan `getRevenueAccountCodes()`.

## QRIS

Jika ingin membuat payment QRIS, gunakan method khusus berikut:

```php
$result = $payment->createQrisPaymentRequest([
    'service_category' => 'UKT',
    'customer_no' => '2024000001',
    'customer_name' => 'John Doe',
    'amount' => 5000000,
    'description' => 'Pembayaran UKT',
    'revenue_account_code' => '411100',
    'provider' => 'BRI_QRIS', // opsional, default dari config
]);
```

Response QRIS akan mengandung data seperti `paymentRequestId`, `qrId`, `qrContent`, dan `expiryDate`/`qrExpiryDate`.

## Callback

Setelah pembayaran diproses, SIKEU dapat mengirim HTTP `POST` ke endpoint callback aplikasi Anda. Callback ini dipakai untuk sinkronisasi status pembayaran tanpa harus terus melakukan polling.

Alur yang direkomendasikan:

1. Buat payment request dan simpan `paymentRequestId` di database lokal.
2. Tampilkan VA atau QRIS ke user.
3. Setelah user membayar, SIKEU mengirim callback ke aplikasi Anda.
4. Aplikasi Anda memverifikasi signature, mencari data berdasarkan `paymentRequestId`, lalu mengubah status pembayaran.
5. Jika perlu, jalankan proses lanjutan seperti aktivasi tagihan, notifikasi, atau queue job.

Tambahkan callback URL yang bisa diakses publik:

```env
SIKEU_CALLBACK_URL=https://your-domain.tld/api/sikeu/callback
```

Sampaikan ke admin SIKEU bahwa URL callback ini harus didaftarkan di sisi SIKEU agar notifikasi pembayaran dapat dikirim ke aplikasi Anda.

Route yang direkomendasikan:

```php
use App\Http\Controllers\SikeuCallbackController;
use Illuminate\Support\Facades\Route;

Route::post('/sikeu/callback', [SikeuCallbackController::class, 'handle'])
    ->middleware('sikeu.signature');
```

Header penting yang perlu divalidasi:

- `X-Timestamp`
- `X-Signature`

Contoh middleware validasi signature:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateSikeuSignature
{
    public function handle(Request $request, Closure $next)
    {
        $timestamp = $request->header('X-Timestamp');
        $signature = $request->header('X-Signature');
        $secret = config('sikeu.auth.shared_secret');

        if (!$timestamp || !$signature) {
            return response()->json(['message' => 'Missing signature headers'], 401);
        }

        $body = $request->getContent();
        $expected = hash_hmac('sha256', $timestamp . ':' . $body, $secret);

        if (!hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        return $next($request);
    }
}
```

Daftarkan middleware tersebut dengan alias `sikeu.signature` sesuai versi Laravel yang Anda gunakan.

Contoh payload callback:

```json
{
    "paymentRequestId": "PAY-123456",
    "virtualAccountNo": "88881234567890001",
    "customerNo": "2024000001",
    "amount": 5000000,
    "paidAmount": 5000000,
    "status": "PAID",
    "paidAt": "2026-04-02T14:30:00+07:00",
    "transactionId": "TXN-BRI-20260402-001",
    "sourceApp": "YOUR_APP_NAME"
}
```

Contoh handler callback:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SikeuCallbackController extends Controller
{
    public function handle(Request $request)
    {
        $data = $request->json()->all();
        $paymentRequestId = $data['paymentRequestId'] ?? null;

        if (!$paymentRequestId) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $payment = DB::table('payments')
            ->where('payment_request_id', $paymentRequestId)
            ->first();

        if (!$payment) {
            return response()->json(['status' => 'ignored'], 200);
        }

        if ($payment->status === 'PAID') {
            return response()->json(['status' => 'already_processed'], 200);
        }

        DB::table('payments')
            ->where('payment_request_id', $paymentRequestId)
            ->update([
                'status' => $data['status'] ?? $payment->status,
                'paid_amount' => $data['paidAmount'] ?? null,
                'transaction_id' => $data['transactionId'] ?? null,
                'paid_at' => $data['paidAt'] ?? null,
                'updated_at' => now(),
            ]);

        return response()->json(['status' => 'ok'], 200);
    }
}
```

Hal penting saat implementasi callback:

- Endpoint callback jangan dipasang auth login biasa; cukup lindungi dengan validasi signature.
- Selalu lakukan idempotency check agar callback yang terkirim ulang tidak memproses pembayaran dua kali.
- Jika `paymentRequestId` tidak ditemukan, tetap balas `200 OK` agar SIKEU tidak terus retry.
- Proses berat seperti sinkronisasi akademik atau kirim notifikasi sebaiknya dikirim ke queue.
- Usahakan response callback cepat; jangan menunggu proses panjang sebelum membalas `200 OK`.

## Method Yang Tersedia

### Master Data

- `getAvailableServices(): array`
  Ambil daftar `service_category` yang valid dari SIKEU. Gunakan nilai `code` dari response.
- `getRevenueAccountCodes(): array`
  Ambil daftar `revenue_account_code` yang valid dari SIKEU. Gunakan nilai `code` dari response.

### Payment Request

- `createPaymentRequest(array $data): array`
  Membuat payment request. Field utama: `service_category`, `customer_no`, `customer_name`, `amount`, `description`, `revenue_account_code`. Field opsional: `provider`, `attributes`.
- `getPaymentRequest(string $paymentRequestId): array`
  Ambil detail payment request.
- `checkPaymentRequest(string $paymentRequestId): array`
  Cek status payment request.
- `cancelPaymentRequest(string $paymentRequestId): array`
  Batalkan payment request.

### QRIS

- `createQrisPaymentRequest(array $data): array`
  Membuat payment request QRIS. Jika `provider` tidak dikirim, package memakai `SIKEU_DEFAULT_QRIS_PROVIDER`.
- `checkQrisPaymentStatus(string $paymentRequestId): array`
  Cek status pembayaran QRIS.

## Catatan Penting

- `service_category` wajib berasal dari `getAvailableServices()`.
- `revenue_account_code` wajib berasal dari `getRevenueAccountCodes()`.
- `amount` akan dikirim sebagai integer.
- Default provider diambil dari `config/sikeu.php`.
- Logging request/response aktif melalui config package.

## License

MIT
