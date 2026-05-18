# Laravel-Payments
Easily integrate eSewa & Khalti payments in your Laravel app


---

## 🚀 Installation

```bash
composer require shikhar/laravel-payments
```

---

## 📁 Publish Config File

```bash
php artisan vendor:publish --tag=payments-config
```

This will create:

```
config/payments.php
```

---

## ⚙️ Example `config/payments.php`

```php
return [

  'default' => env('PAYMENT_DEFAULT', 'khalti'),

  'gateways' => [

    'khalti' => [
      'public_key' => env('KHALTI_PUBLIC_KEY', ''),
      'secret_key' => env('KHALTI_SECRET_KEY', ''),
    ],

    'esewa' => [
      'form_url' => 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      'merchant_id' => env('ESEWA_MERCHANT_ID', 'EPAYTEST'),
      'secret_key' => env('ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q'), 
    ],

  ],

];
```

---

## 🔐 Add Credentials to `.env`

```env
PAYMENT_DEFAULT=esewa

KHALTI_PUBLIC_KEY=your_public_key
KHALTI_SECRET_KEY=your_secret_key

ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=your_secret_key
```

---

## 🧩 Controller Example

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Shikhar\Payments\PaymentManager;

class PaymentController extends Controller
{

    public $payment;

    public function __construct(PaymentManager $payment)
    {
        $this->payment = $payment;
    }

    public function pay(Request $request)
    {

        $payload = [
            'tax_amount' => $request->input('tax_amount'),
            'transaction_uuid' => $request->input('transaction_uuid', uniqid()),
            'product_code' => $request->input('product_code'),
            'customer_name' => $request->input('customer_name', null),
            'customer_email' => $request->input('customer_email', null),
            'customer_phone' => $request->input('customer_phone', null),
            'success_url' => $request->input('success_url'),
            'failure_url' => $request->input('failure_url'),
        ];

        // Charge via selected gateway
        $response = $this->payment
            ->via($request->payment_gateway)
            ->charge($request->amount, $payload);

        // Return JSON or redirect as needed
        return view('shikhar-payments::esewa', compact('response'));
    }
}```

---

## 💳 Example Payment Form (User Chooses Gateway)

```html
<form id="paymentForm" method="POST" action="{{ url('/pay') }}">
    @csrf

    <select name="payment_gateway" required>
        <option value="esewa">Esewa</option>
        <option value="khalti">Khalti</option>
    </select>

    <input type="number" name="amount" value="100" required>
    <input type="number" name="tax_amount" value="10">
    <input type="text" name="transaction_uuid" value="{{ uniqid() }}">
    <input type="text" name="product_code" value="EPAYTEST">

    <input type="text" name="success_url" value="https://yourapp.com/success">
    <input type="text" name="failure_url" value="https://yourapp.com/failure">

    <input type="text" name="customer_name" value="John Doe">
    <input type="email" name="customer_email" value="john@example.com">
    <input type="text" name="customer_phone" value="9800000000">

    <button type="submit">Pay Now</button>
</form>
```

---

## 🧾 Esewa Redirect Page Example

```html
<form id="esewaForm" method="POST" action="{{ $response['action_url'] }}" style="display:none;">
    @foreach ($response['fields'] as $key => $value)
        <input type="hidden" name="{{ $key }}" value="{{ $value }}">
    @endforeach
</form>

<button onclick="document.getElementById('esewaForm').submit();">
    Pay with Esewa
</button>
```

---

## 🏗 Folder Structure

```
src/
  PaymentManager.php
  Providers/
      PaymentServiceProvider.php
config/
  payments.php
```

---

## 📌 Usage Summary

- Install package  
- Publish `payments.php`  
- Configure `.env`  
- Inject `PaymentManager`  

```php
$this->payment->via('esewa')->charge(100, $payload);
```

OR:

```php
$this->payment->via('khalti')->charge(100, $payload);
```

---

## 🧪 Sandbox Support

- Esewa: default sandbox form URL included  
- Khalti: works automatically with test keys  

---

## 📜 License

MIT © Shikhar Bahik Magar


