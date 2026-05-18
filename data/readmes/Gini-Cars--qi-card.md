# Qi Card Laravel Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ht3aa/qi-card.svg?style=flat-square)](https://packagist.org/packages/ht3aa/qi-card)
[![Total Downloads](https://img.shields.io/packagist/dt/ht3aa/qi-card.svg?style=flat-square)](https://packagist.org/packages/ht3aa/qi-card)

![Qi Card Integration For Laravel](image.png)

A comprehensive Laravel package that provides all the functionality you need to integrate your application with the Qi Card API, including payments, notifications, and user authentication.

## Features

- 🔐 **User Authentication**: Seamlessly authenticate users via Qi Card authorization codes
- 📊 **User Information Management**: Store and manage user information from Qi Card with configurable scopes
- 💳 **Card List Management**: Optional storage and management of user card lists
- 💰 **Payment Processing**: Create and manage payments with webhook support and polymorphic product relationships
- 📬 **Inbox Notifications**: Send notifications directly to users' Qi Card inbox
- 🖼️ **Avatar Management**: Optional S3 storage for user avatars
- 🔄 **Automatic Updates**: Configurable user data updates on each login
- 🏗️ **Laravel Integration**: Built with Laravel best practices and includes migrations, facades, and notifications

## Requirements

- PHP ^8.4
- Laravel ^11.0 || ^12.0
- Laravel Sanctum (required for API token authentication)

## Installation

### Install Laravel Sanctum

This package requires Laravel Sanctum to be installed. Please follow the [Laravel Sanctum installation guide](https://laravel.com/docs/12.x/sanctum) to install and configure Sanctum in your Laravel application.

### Install Qi Card Package

You can install the package via Composer:

```bash
composer require ht3aa/qi-card
```

### Publish Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="qi-card-config"
```

This will create a `config/qi-card.php` file in your config directory.

### Publish and Run Migrations

Publish and run the migrations to create the `qi_card_users` and `qi_card_payments` tables:

```bash
php artisan vendor:publish --tag="qi-card-migrations"
php artisan migrate
```

The migrations create the following tables:

#### `qi_card_users` table:
- `id`: Primary key
- `wallet_id`: Unique identifier for the Qi Card user
- `user_info`: JSON field storing user information
- `card_list`: JSON field storing user card list (optional)
- `qi_card_access_token`: Access token for API calls
- `timestamps`: Created and updated timestamps

#### `qi_card_payments` table:
- `id`: Primary key
- `payment_request_id`: Unique payment request identifier
- `payment_id`: Payment ID from Qi Card API (nullable)
- `amount`: Payment amount (decimal)
- `order_description`: Description of the order
- `redirect_url`: URL to redirect user for payment
- `product_type`: Polymorphic product type
- `product_id`: Polymorphic product ID
- `qi_card_user_id`: Foreign key to `qi_card_users` table
- `status`: Payment status (default: "PROCESSING")
- `timestamps`: Created and updated timestamps

### Publish Views (Optional)

If you need to customize views:

```bash
php artisan vendor:publish --tag="qi-card-views"
```

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
QI_CARD_API_BASE_URL=https://api.qi-card.com
QI_CARD_API_CLIENT_ID=your_client_id_here
QI_CARD_API_PRIVATE_KEY=your_private_key_here
QI_CARD_API_PUBLIC_KEY=your_public_key_here

# Payment configuration (optional)
QI_CARD_PAYMENT_PRODUCT_CODE=your_product_code_here
QI_CARD_PAYMENT_WEBHOOK_URL=https://your-app.com/api/v1/qi-card/payments/webhook
QI_CARD_PAYMENT_CUSTOM_WEBHOOK_URL=https://your-custom-webhook-url.com
```

> **Note**: Contact the Qi Card team to obtain your `CLIENT_ID`, `PRIVATE_KEY`, and `PAYMENT_PRODUCT_CODE`. These are required for the package to function properly.

### Configuration File

The published configuration file (`config/qi-card.php`) contains the following options:

```php
return [
    // Enable fetching and storing user information
    'user_info_scopes_enabled' => true,

    // Enable fetching and storing card list
    // Requires CARD_LIST scope in your mini app
    'card_list_scope_enabled' => false,

    // Store avatar URLs in S3 storage instead of original URLs
    // Requires USER_AVATAR scope in your mini app and S3 configuration
    'store_avatar_url_in_s3_storage' => false,

    // Update user data (user_info, card_list, access_token) on every login
    'update_user_data_every_login' => false,

    // API configuration (loaded from environment variables)
    'api' => [
        'base_url' => env('QI_CARD_API_BASE_URL'),
        'private_key' => env('QI_CARD_API_PRIVATE_KEY'),
        'public_key' => env('QI_CARD_API_PUBLIC_KEY'),
        'client_id' => env('QI_CARD_API_CLIENT_ID'),
        'payment_product_code' => env('QI_CARD_PAYMENT_PRODUCT_CODE'),
        'payment_webhook_url' => env('QI_CARD_PAYMENT_WEBHOOK_URL', null),
        'payment_custom_webhook_url' => env('QI_CARD_PAYMENT_CUSTOM_WEBHOOK_URL', null),
    ],
];
```

### Configuration Options Explained

#### `user_info_scopes_enabled`
When enabled (default: `true`), the package will fetch and store user information from Qi Card. Make sure your mini app has the appropriate scopes configured to receive user data.

#### `card_list_scope_enabled`
When enabled (default: `false`), the package will fetch and store the user's card list. You must use the `CARD_LIST` scope in your mini app to receive this data.

#### `store_avatar_url_in_s3_storage`
When enabled (default: `false`), user avatars will be downloaded and stored in your S3 storage. The original URL will be replaced with the S3 path. Requires:
- `USER_AVATAR` scope in your mini app
- Proper S3 configuration in your Laravel application
- S3 disk configured in `config/filesystems.php`

#### `update_user_data_every_login`
When enabled (default: `false`), user data (user_info, card_list, and access_token) will be updated every time a user logs in. When disabled, data is only stored on first registration.

#### Payment Configuration Options

##### `payment_product_code`
Your Qi Card product code for payments. This is required when creating payments. Contact the Qi Card team to obtain your product code.

##### `payment_webhook_url`
The webhook URL where Qi Card will send payment status updates. If not set, defaults to the package's built-in webhook route (`/api/v1/qi-card/payments/webhook`).

##### `payment_custom_webhook_url`
An optional custom webhook URL where payment webhook data will be forwarded. This allows you to send payment updates to your own endpoint in addition to the package's webhook handler.

## Usage

### User Authentication

To authenticate a user with Qi Card, you need to obtain an authorization code from your mini app and use it to create or retrieve a user:

```php
use Ht3aa\QiCard\Facades\QiCard;

// In your authentication controller
public function authenticate(Request $request)
{
    $authCode = $request->input('auth_code');
    
    try {
        $user = QiCard::createUser($authCode);
        
        // The user is now authenticated
        // $user is an instance of Ht3aa\QiCard\QiCardUser
        
        return response()->json([
            'user' => $user,
            'token' => $user->createToken('auth')->plainTextToken,
        ]);
    } catch (\Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException $e) {
        return response()->json([
            'message' => 'Authentication failed',
        ], 422);
    }
}
```

The `createUser` method will:
1. Exchange the authorization code for an access token
2. Fetch user information (if `user_info_scopes_enabled` is true)
3. Fetch card list (if `card_list_scope_enabled` is true)
4. Store avatar in S3 (if `store_avatar_url_in_s3_storage` is true)
5. Create a new user or update existing user based on configuration
6. Return a `QiCardUser` model instance

### Working with QiCardUser Model

The `QiCardUser` model provides access to user data through convenient accessors:

```php
use Ht3aa\QiCard\QiCardUser;

// Find a user
$user = QiCardUser::where('wallet_id', $qiCardId)->first();

// Access raw data
$userInfo = $user->user_info; // Array of user information
$cardList = $user->card_list; // Array of cards (if enabled)
$accessToken = $user->qi_card_access_token; // Access token
```

#### User Information Accessors

The model provides convenient accessors for accessing user information:

```php
// Basic user information
$gender = $user->gender; // Returns gender (M/F)
$nationality = $user->nationality; // Returns nationality code (e.g., "IRQ")
$avatar = $user->avatar; // Returns avatar path/URL

// Avatar with temporary S3 URL (if stored in S3)
$avatarUrl = $user->avatar_temporary_s3_url; // Returns temporary S3 URL (5 minutes expiry)

// User names
$userName = $user->user_name; // Returns full name in English (e.g., "HASAN TAHSIN ABDULRIDHA AL KAABI")
$userNameInArabic = $user->user_info_user_name_in_arabic; // Returns full name in Arabic

// Contact information
$contactInfos = $user->contact_infos; // Returns array of contact information
$mobilePhone = $user->mobile_phone_number; // Returns formatted mobile phone (e.g., "+9647708246418")
$email = $user->email; // Returns email address if available
```

#### Card List Accessors

Access card information with these accessors:

```php
// Card list
$cardList = $user->card_list; // Returns array of all cards

// First card information
$firstCard = $user->first_card; // Returns first card object
$accountNumber = $user->first_card_account_number; // Returns account number (e.g., "5862997060")
$maskedCardNo = $user->first_card_masked_card_no; // Returns masked card number (e.g., "417763******4382")
```

#### Accessor Reference

| Accessor | Returns | Description |
|---------|---------|-------------|
| `gender` | `string` or `null` | User's gender (M/F) |
| `avatar` | `string` or `null` | Avatar path or URL |
| `avatar_temporary_s3_url` | `string` or `null` | Temporary S3 URL for avatar (5 min expiry) |
| `nationality` | `string` or `null` | Nationality code |
| `user_name` | `string` or `null` | Full name in English |
| `user_info_user_name_in_arabic` | `string` or `null` | Full name in Arabic |
| `contact_infos` | `array` or `null` | Array of contact information |
| `mobile_phone_number` | `string` or `null` | Formatted mobile phone number with + prefix |
| `email` | `string` or `null` | Email address if available |
| `card_list` | `array` or `null` | Array of all cards |
| `first_card` | `array` or `null` | First card object |
| `first_card_account_number` | `string` or `null` | Account number of first card |
| `first_card_masked_card_no` | `string` or `null` | Masked card number of first card |

### Payment Processing

The package provides comprehensive payment processing functionality with webhook support and polymorphic product relationships.

#### Creating a Payment

To create a payment, you need a product model (any Eloquent model) and a `QiCardUser`:

```php
use Ht3aa\QiCard\Facades\QiCard;
use Ht3aa\QiCard\Models\QiCardUser;
use App\Models\Order; // Your product model

$user = QiCardUser::find($id);
$order = Order::find($orderId);

try {
    $payment = QiCard::createPayment(
        amount: 100.00, // Amount in IQD (will be converted to millis)
        product: $order, // Any Eloquent model
        orderDescription: 'Order #12345',
        qiCardUser: $user
    );
    
    // Redirect user to payment URL
    return redirect($payment->redirect_url);
    
} catch (\Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException $e) {
    // Handle error
    return back()->withErrors(['payment' => 'Failed to create payment']);
}
```

The `createPayment` method will:
1. Generate a unique payment request ID
2. Create a payment request with Qi Card API
3. Store the payment in the database with status "PROCESSING"
4. Return a `QiCardPayment` model with the redirect URL

#### Working with QiCardPayment Model

The `QiCardPayment` model provides access to payment information:

```php
use Ht3aa\QiCard\Models\QiCardPayment;
use Ht3aa\QiCard\Enums\QiCardPaymentStatus;

// Find a payment
$payment = QiCardPayment::where('payment_request_id', $requestId)->first();

// Access payment data
$amount = $payment->amount;
$status = $payment->status; // "SUCCESS", "FAIL", "PROCESSING", or "CANCELLED"
$redirectUrl = $payment->redirect_url;
$orderDescription = $payment->order_description;

// Access the related user
$user = $payment->qiCardUser; // Returns QiCardUser model

// Access the polymorphic product
$product = $payment->product; // Returns the related model (e.g., Order)
```

#### Payment Status Enum

The package includes a `QiCardPaymentStatus` enum with the following values:

```php
use Ht3aa\QiCard\Enums\QiCardPaymentStatus;

QiCardPaymentStatus::SUCCESS;      // Payment succeeded
QiCardPaymentStatus::FAIL;         // Payment failed
QiCardPaymentStatus::PROCESSING;   // Payment is being processed
QiCardPaymentStatus::CANCELLED;    // Payment was cancelled
```

#### Payment Webhook

The package includes a built-in webhook endpoint that handles payment status updates from Qi Card. The webhook route is automatically registered at:

```
POST /api/v1/qi-card/payments/webhook
```

The webhook handler will:
1. Find the payment by `paymentRequestId`
2. Update the payment status based on the webhook data
3. Optionally forward the webhook data to your custom webhook URL (if configured)

**Webhook Payload Example:**

```json
{
    "paymentResult": {
        "resultCode": "SUCCESS",
        "resultMessage": "Success.",
        "resultStatus": "S"
    },
    "paymentId": "20260101111212800100166820603167424",
    "paymentRequestId": "23dcbc4f-d71c-4f70-b211-f089c00e8f70",
    "extendInfo": "{\"sourcePlatform\":\"MINI_APP\"}",
    "paymentTime": "2026-01-01T15:29:44+03:00",
    "paymentAmount": {
        "currency": "IQD",
        "value": "1000"
    },
    "paymentCreateTime": "2026-01-01T15:27:53+03:00"
}
```

**Important Notes:**
- Make sure your webhook URL is publicly accessible
- The webhook endpoint does not require authentication by default (you may want to add middleware)
- If `payment_custom_webhook_url` is configured, the webhook data will be forwarded to that URL via HTTP POST

#### Payment Flow Example

Here's a complete example of handling a payment flow:

```php
use Ht3aa\QiCard\Facades\QiCard;
use Ht3aa\QiCard\Models\QiCardUser;
use App\Models\Order;

// 1. Create payment
$user = QiCardUser::where('wallet_id', $walletId)->first();
$order = Order::create([...]);

$payment = QiCard::createPayment(
    amount: $order->total,
    product: $order,
    orderDescription: "Order #{$order->id}",
    qiCardUser: $user
);

// 2. Redirect user to payment page
return redirect($payment->redirect_url);

// 3. Webhook will automatically update payment status
// You can check payment status later:
$payment->refresh();
if ($payment->status === 'SUCCESS') {
    // Payment successful, update order
    $order->update(['status' => 'paid']);
}
```

### Sending Super Qi Notifications App

The package provides a convenient way to send notifications to users' Qi Card inbox.

#### Using the Facade

```php
use Ht3aa\QiCard\Facades\QiCard;
use Ht3aa\QiCard\QiCardUser;

$user = QiCardUser::find($id);

try {
    $response = QiCard::sendSuperQiInboxNotification(
        accessToken: $user->qi_card_access_token,
        title: 'Notification Title',
        content: 'Your notification message here',
        url: 'https://your-app.com/some-page' // Optional
    );
    
    // Notification sent successfully
} catch (\Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException $e) {
    // Handle error
}
```

#### Using Laravel Notifications

The package includes a notification class that integrates with Laravel's notification system:

```php
use Ht3aa\QiCard\Notifications\SuperQiInboxNotification;
use Ht3aa\QiCard\QiCardUser;

$user = QiCardUser::find($id);

$user->notify(new SuperQiInboxNotification(
    title: 'Welcome!',
    message: 'Thank you for using our service.',
    url: 'https://your-app.com/dashboard'
));
```

#### Queued Notifications

You can queue notifications for better performance:

```php
use Illuminate\Bus\Queueable;
use Ht3aa\QiCard\Notifications\SuperQiInboxNotification;

// In your notification class or controller
$user->notify((new SuperQiInboxNotification(
    title: 'Order Update',
    message: 'Your order has been processed.',
    url: 'https://your-app.com/orders/123'
))->delay(now()->addMinutes(5)));
```

### Available Methods

#### `QiCard::createUser(string $authCode): QiCardUser`
Creates or retrieves a Qi Card user using an authorization code.

**Parameters:**
- `$authCode` (string): Authorization code from Qi Card mini app

**Returns:** `QiCardUser` model instance

**Throws:** `UnprocessableEntityHttpException` if the request fails

#### `QiCard::createPayment(string $amount, Model $product, string $orderDescription, QiCardUser $qiCardUser): QiCardPayment`
Creates a payment request with Qi Card.

**Parameters:**
- `$amount` (string|float): Payment amount in IQD (will be converted to millis)
- `$product` (Model): Any Eloquent model (polymorphic relationship)
- `$orderDescription` (string): Description of the order
- `$qiCardUser` (QiCardUser): The Qi Card user making the payment

**Returns:** `QiCardPayment` model instance

**Throws:** `UnprocessableEntityHttpException` if the request fails

**Note:** Requires `payment_product_code` to be configured in your config file.

#### `QiCard::sendSuperQiInboxNotification(string $accessToken, string $title, string $content, string $url = ''): array`
Sends a notification to a user's Qi Card inbox.

**Parameters:**
- `$accessToken` (string): User's Qi Card access token
- `$title` (string): Notification title
- `$content` (string): Notification content/message
- `$url` (string, optional): URL to open when notification is clicked

**Returns:** API response array

**Throws:** `UnprocessableEntityHttpException` if the request fails

## Mini App Scopes

To use this package effectively, you need to configure the appropriate scopes in your Qi Card mini app. The scopes you need depend on which features you want to use:

- **User Information**: Enable `USER_INFO` related scopes to fetch user information
- **Card List**: Enable `CARD_LIST` scope to fetch and store card lists
- **Avatar**: Enable `USER_AVATAR` scope to fetch and store avatars

Consult the Qi Card documentation to understand which scopes are available and how to configure them in your mini app.

## Database Schema

### `qi_card_users` Table

The `qi_card_users` table stores the following information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `wallet_id` | string | Unique Qi Card user identifier |
| `user_info` | json | User information from Qi Card API |
| `card_list` | json | List of user's cards (optional) |
| `qi_card_access_token` | string | Access token for API calls |
| `created_at` | timestamp | Record creation time |
| `updated_at` | timestamp | Record last update time |

### `qi_card_payments` Table

The `qi_card_payments` table stores payment information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `payment_request_id` | string | Unique payment request identifier |
| `payment_id` | string | Payment ID from Qi Card API (nullable) |
| `amount` | decimal(15,2) | Payment amount |
| `order_description` | text | Description of the order |
| `redirect_url` | text | URL to redirect user for payment |
| `product_type` | string | Polymorphic product type |
| `product_id` | bigint | Polymorphic product ID |
| `qi_card_user_id` | bigint | Foreign key to `qi_card_users` table |
| `status` | string | Payment status (default: "PROCESSING") |
| `created_at` | timestamp | Record creation time |
| `updated_at` | timestamp | Record last update time |

## Error Handling

The package throws `UnprocessableEntityHttpException` when API requests fail. Always wrap API calls in try-catch blocks:

```php
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

try {
    $user = QiCard::createUser($authCode);
} catch (UnprocessableEntityHttpException $e) {
    // Handle API errors
    Log::error('Qi Card API error: ' . $e->getMessage());
    return response()->json(['error' => 'Authentication failed'], 422);
} catch (\Exception $e) {
    // Handle other errors (e.g., missing configuration)
    Log::error('Qi Card error: ' . $e->getMessage());
    return response()->json(['error' => 'Configuration error'], 500);
}
```

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/qi-card.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/qi-card)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Hasan Tahseen](https://github.com/ht3aa)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
