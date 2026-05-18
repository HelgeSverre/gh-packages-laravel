# PaymentModule Laravel Package

یک پکیج ساده برای مدیریت پرداخت‌ها در لاراول با پشتیبانی از درگاه‌های ایرانی (Shetabit Multipay).

این پکیج شامل:
- ایجاد و مدیریت تراکنش‌ها
- ذخیره وضعیت پرداخت‌ها (pending, success, failed)
- Factory و Seeder برای تست
- روت‌ها و کنترلر آماده
- امکان اضافه کردن view برای فرم پرداخت و تاریخچه تراکنش‌ها

---

## ۱. نصب

### ۱.۱ نصب با Composer از GitHub

```bash
composer require username/payment-module:dev-main
```

### ۱.۲ نصب به صورت local

در `composer.json` پروژه:

```json
"repositories": [
    {
        "type": "path",
        "url": "./packages/PaymentModule"
    }
]
```

سپس:

```bash
composer require username/payment-module
```

---

## ۲. Service Provider

در Laravel ۹/۱۰ معمولا auto-discovery فعال است.  
اگر فعال نیست، در `config/app.php` اضافه کن:

```php
PaymentModule\PaymentModuleServiceProvider::class,
```

---

## ۳. Migration

اجرای migration برای ایجاد جدول payments:

```bash
php artisan migrate
```

---

## ۴. Seeder

اجرای Seeder برای داده تستی:

```bash
php artisan db:seed --class="PaymentModule\Database\Seeders\PaymentSeeder"
```

Seeder به صورت خودکار ۱۵ تراکنش با وضعیت‌های مختلف ایجاد می‌کند:
- ۵ pending
- ۵ success
- ۵ failed

---

## ۵. Factory

برای تست و توسعه می‌توان از factory استفاده کرد:

```php
use PaymentModule\Models\Payment;

Payment::factory()->count(10)->create();
```

> توجه: مدل Payment باید `HasFactory` و `newFactory()` درست تعریف شده باشد.

---

## ۶. Routes

پکیج روت‌های زیر را دارد:

```php
POST   /payment/initiate   -> PaymentController@initiate
GET    /payment/callback   -> PaymentController@callback
```

- می‌توان middleware('auth') را حذف یا فعال کرد.

---

## ۷. Views (اختیاری)

در صورت اضافه کردن view:

```
packages/PaymentModule/src/Resources/views/
    initiate.blade.php   -> فرم پرداخت
    history.blade.php    -> لیست تراکنش‌ها
```

در ServiceProvider:

```php
$this->loadViewsFrom(__DIR__.'/Resources/views', 'PaymentModule');
```

مثال استفاده در کنترلر:

```php
public function showForm()
{
    return view('PaymentModule::initiate');
}

public function history()
{
    $payments = Payment::all();
    return view('PaymentModule::history', compact('payments'));
}
```

---

## ۸. استفاده در Controller

```php
use PaymentModule\Models\Payment;

// ایجاد یک پرداخت جدید
$payment = Payment::create([
    'order_id' => uniqid('ORD-'),
    'user_id' => auth()->id(),
    'amount' => 50000,
    'status' => 'pending',
]);
```

---

## ۹. درگاه پرداخت

- پکیج از [Shetabit Multipay](https://github.com/shetabit/multipay) پشتیبانی می‌کند.  
- قبل از استفاده، multipay را نصب کن:

```bash
composer require shetabit/multipay
php artisan vendor:publish --tag=multipay-config
```

- تنظیمات در `.env` و `config/multipay.php` قرار می‌گیرد.

---

## ۱۰. مثال فرم پرداخت

```blade
<form action="{{ route('payment.initiate') }}" method="POST">
    @csrf
    <label>مبلغ پرداخت:</label>
    <input type="number" name="amount" required>
    <button type="submit">پرداخت</button>
</form>
```

---

## ۱۱. Callback Controller

```php
public function callback(Request $request)
{
    $payment = Payment::where('order_id', $request->order_id)->firstOrFail();

    try {
        // verify payment via multipay
        $receipt = $this->paymentService->verify($payment, 'zarinpal');
        $payment->update(['status' => 'success']);
        return "پرداخت موفق! شماره تراکنش: {$payment->transaction_id}";
    } catch (\Exception $e) {
        $payment->update(['status' => 'failed']);
        return "پرداخت ناموفق!";
    }
}
```

---

## ۱۲. License

MIT License

