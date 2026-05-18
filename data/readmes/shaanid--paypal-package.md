# PayPal Laravel Package

A production-standard Laravel package for PayPal REST API integration, featuring robust error handling, transaction persistence, and audit logging.

## 🚀 Features

- **Service-Oriented Architecture**: Decoupled payment logic.
- **Database Persistence**: Automatic tracking of every transaction (Pending, Completed, Canceled, Failed).
- **Audit Logging**: Full traceability of API requests and responses.
- **Action Pattern**: Clean, testable, and reusable business logic.
- **Ready-to-use UI**: Modern, responsive checkout interface.

## 🛠️ Installation

1. **Install via Composer**:
   (Since this is currently a local package, you would typically add it to your `repositories` in `composer.json`)

    ```json
    "repositories": [
        {
            "type": "path",
            "url": "../path-to-your-package"
        }
    ]
    ```

    Then run:

    ```bash
    composer require shaanid/paypal-package
    ```

2. **Publish Configuration and Views**:

    ```bash
    php artisan vendor:publish --provider="Shaanid\PayPal\PayPalServiceProvider"
    ```

3. **Environment Configuration**:
   Add your PayPal credentials to your `.env` file:

    ```env
    PAYPAL_MODE=sandbox
    PAYPAL_SANDBOX_CLIENT_ID=your_client_id
    PAYPAL_SANDBOX_CLIENT_SECRET=your_client_secret
    PAYPAL_CURRENCY=USD
    ```

4. **Run Migrations**:
    ```bash
    php artisan migrate
    ```

## 📁 Usage

The package automatically registers the following routes:

- `GET /paypal`: The checkout index page.
- `POST /paypal/process`: Handles order creation and redirection to PayPal.
- `GET /paypal/success`: Handles successful payment capture.
- `GET /paypal/cancel`: Handles payment cancellation.

### Overriding Logic

You can use the Actions and Services provided by the package in your own controllers:

```php
use Shaanid\PayPal\Actions\CreatePayPalOrderAction;
use Shaanid\PayPal\DTOs\PaymentData;

public function checkout(CreatePayPalOrderAction $action)
{
    $data = new PaymentData(amount: '20.00', currency: 'USD', userId: auth()->id());
    $approvalLink = $action->execute($data->toCollection());

    return redirect()->away($approvalLink);
}
```

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
