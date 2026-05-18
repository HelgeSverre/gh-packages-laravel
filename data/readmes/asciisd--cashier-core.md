# Cashier Core

[![Latest Version on Packagist](https://img.shields.io/packagist/v/asciisd/cashier-core.svg?style=flat-square)](https://packagist.org/packages/asciisd/cashier-core)
[![Total Downloads](https://img.shields.io/packagist/dt/asciisd/cashier-core.svg?style=flat-square)](https://packagist.org/packages/asciisd/cashier-core)
[![License](https://img.shields.io/packagist/l/asciisd/cashier-core.svg?style=flat-square)](https://packagist.org/packages/asciisd/cashier-core)

A flexible payment processing system for Laravel using the Factory Pattern. This package provides a unified interface for multiple payment processors, making it easy to add new payment gateways without changing your application code.

## Features

- **Factory Pattern**: Easy to extend with new payment processors
- **Unified Interface**: Consistent API across all payment processors
- **Laravel Integration**: Native Laravel package with service provider
- **Database Models**: Built-in models for transactions, payments, and payment methods
- **Configurable**: Flexible configuration system
- **Testable**: Comprehensive test suite included
- **Multiple Processors**: Support for custom processors
- **Refund Support**: Full and partial refunds
- **Authorization & Capture**: Pre-authorization and later capture
- **Payment Methods**: Store and manage customer payment methods
- **Webhooks**: Built-in webhook handling support
- **Security**: Encrypted sensitive data storage
- **Logging**: Comprehensive payment logging

## Installation

```bash
composer require asciisd/cashier-core
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Asciisd\CashierCore\CashierCoreServiceProvider" --tag="config"
```

Publish and run the migrations:

```bash
php artisan vendor:publish --provider="Asciisd\CashierCore\CashierCoreServiceProvider" --tag="migrations"
php artisan migrate
```

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Default processor
CASHIER_DEFAULT_PROCESSOR=stripe

# General Settings
CASHIER_CURRENCY=USD
CASHIER_LOGGING_ENABLED=true
```

## Usage

### Basic Payment Processing

```php
use Asciisd\CashierCore\Facades\PaymentFactory;

// Create a payment processor
$processor = PaymentFactory::create('stripe');

// Process a payment
$result = $processor->charge([
    'amount' => 20, // $20.00
    'currency' => 'USD',
    'source' => 'tok_visa',
    'description' => 'Order #12345',
    'metadata' => [
        'order_id' => '12345',
        'customer_id' => 'cust_123',
    ],
]);

if ($result->isSuccessful()) {
    echo "Payment successful! Transaction ID: {$result->transactionId}";
} else {
    echo "Payment failed: {$result->message}";
}
```

### Working with Different Processors

```php
// Check available processors
$processors = PaymentFactory::getProcessorNames();
// Returns: []
```

### Refund Processing

```php
$processor = PaymentFactory::create('stripe');

// Full refund
$refundResult = $processor->refund('ch_transaction_id');

// Partial refund
$partialRefundResult = $processor->refund('ch_transaction_id', 500); // $5.00

if ($refundResult->isSuccessful()) {
    echo "Refund successful! Refund ID: {$refundResult->refundId}";
}
```

### Authorization and Capture

```php
$processor = PaymentFactory::create('stripe');

// Authorize payment
$authResult = $processor->authorize([
    'amount' => 3000,
    'currency' => 'USD',
    'source' => 'tok_visa',
    'description' => 'Pre-authorization',
]);

if ($authResult->isSuccessful()) {
    // Later, capture the payment
    $captureResult = $processor->capture($authResult->transactionId, 2500);
}
```

### Database Models

#### Using the Payable Trait

Add the `Payable` trait to your models that can make payments:

```php
use Asciisd\CashierCore\Traits\Payable;

class User extends Model
{
    use Payable;
    
    // Your model code...
}
```

This provides helpful methods:

```php
$user = User::find(1);

// Get all transactions
$transactions = $user->transactions;

// Get successful transactions
$successful = $user->getSuccessfulTransactions();

// Get total amount spent
$totalSpent = $user->getTotalSpent(); // Returns total amount
$formattedTotal = $user->getFormattedTotalSpent(); // Returns formatted string

// Payment methods
$paymentMethods = $user->paymentMethods;
$defaultMethod = $user->getDefaultPaymentMethod();
```

#### Working with Transactions

```php
use Asciisd\CashierCore\Models\Transaction;

// Create a transaction record
$transaction = Transaction::create([
    'processor_name' => 'stripe',
    'processor_transaction_id' => $result->transactionId,
    'payable_type' => 'App\\Models\\User',
    'payable_id' => $user->id,
    'amount' => $result->amount,
    'currency' => $result->currency,
    'status' => $result->status,
    'description' => 'Order payment',
    'processed_at' => now(),
]);

// Query transactions
$successfulTransactions = Transaction::successful()->get();
$stripeTransactions = Transaction::byProcessor('stripe')->get();
$recentTransactions = Transaction::where('created_at', '>=', now()->subDays(7))->get();
```

#### Managing Payment Methods

```php
use Asciisd\CashierCore\Models\PaymentMethod;

// Create a payment method
$paymentMethod = PaymentMethod::create([
    'user_type' => 'App\\Models\\User',
    'user_id' => $user->id,
    'processor_name' => 'stripe',
    'processor_payment_method_id' => 'pm_1234567890',
    'type' => 'credit_card',
    'brand' => 'visa',
    'last_four' => '4242',
    'exp_month' => 12,
    'exp_year' => 2025,
    'is_default' => true,
]);

// Make it the default
$paymentMethod->makeDefault();

// Check expiration
if ($paymentMethod->is_expired) {
    // Handle expired payment method
}
```

### Adding Custom Payment Processors

1. Create a class that extends `AbstractPaymentProcessor`:

```php
use Asciisd\CashierCore\Abstracts\AbstractPaymentProcessor;
use Asciisd\CashierCore\DataObjects\PaymentResult;
use Asciisd\CashierCore\DataObjects\RefundResult;

class CustomProcessor extends AbstractPaymentProcessor
{
    protected array $supportedFeatures = ['charge', 'refund'];

    public function getName(): string
    {
        return 'custom';
    }

    public function charge(array $data): PaymentResult
    {
        $validatedData = $this->validatePaymentData($data);
        
        // Your payment processing logic here
        
        return $this->createSuccessResult(
            transactionId: 'custom_' . uniqid(),
            amount: $validatedData['amount'],
            currency: $validatedData['currency']
        );
    }

    public function refund(string $transactionId, ?int $amount = null): RefundResult
    {
        // Your refund logic here
    }
}
```

2. Register it in your configuration:

```php
// config/cashier-core.php
'processors' => [
    'custom' => [
        'class' => \App\PaymentProcessors\CustomProcessor::class,
        'config' => [
            'api_key' => env('CUSTOM_API_KEY'),
            'secret' => env('CUSTOM_SECRET'),
        ],
    ],
],
```

3. Use it through the factory:

```php
$processor = PaymentFactory::create('custom');
```

### Error Handling

```php
use Asciisd\CashierCore\Exceptions\InvalidPaymentDataException;
use Asciisd\CashierCore\Exceptions\PaymentProcessingException;
use Asciisd\CashierCore\Exceptions\ProcessorNotFoundException;

try {
    $processor = PaymentFactory::create('stripe');
    $result = $processor->charge($paymentData);
    
} catch (InvalidPaymentDataException $e) {
    // Handle validation errors
    echo "Invalid payment data: {$e->getMessage()}";
    
} catch (PaymentProcessingException $e) {
    // Handle payment processing errors
    echo "Payment failed: {$e->getMessage()}";
    if ($e->getTransactionId()) {
        echo "Transaction ID: {$e->getTransactionId()}";
    }
    
} catch (ProcessorNotFoundException $e) {
    // Handle unknown processor
    echo "Processor not found: {$e->getMessage()}";
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

## Configuration Options

The package provides extensive configuration options. See the published config file for all available settings:

- **Processors**: Configure multiple payment processors
- **Currency**: Set default and supported currencies
- **Database**: Customize table names and connections
- **Webhooks**: Configure webhook handling
- **Logging**: Control payment logging
- **Security**: Configure data encryption and masking
- **Retry Logic**: Set up retry mechanisms for failed payments
- **Feature Flags**: Enable/disable specific features

## Supported Payment Processors

### Built-in Processors

### Extensible Architecture

The Factory Pattern makes it easy to add new processors:

1. Implement the `PaymentProcessorInterface`
2. Extend `AbstractPaymentProcessor` for common functionality
3. Register in configuration
4. Use immediately through the factory

## Security Features

- **Data Encryption**: Sensitive data is encrypted before storage
- **Card Masking**: Credit card numbers are automatically masked
- **Webhook Verification**: Secure webhook signature verification
- **Input Validation**: Comprehensive input validation for all processors

## Examples

Check the `examples/BasicUsage.php` file for comprehensive usage examples covering:

- Basic payment processing
- Refund handling
- Authorization and capture
- Payment method management
- Error handling
- Custom processor registration
- Database queries

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Support

For support, please open an issue on GitHub or contact us at <info@asciisd.com>.
