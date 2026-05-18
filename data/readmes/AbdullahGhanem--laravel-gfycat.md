# Laravel Tokeet

[![Latest Stable Version](https://poser.pugx.org/ewa/tokeet/v/stable.svg)](https://packagist.org/packages/ewa/tokeet) [![License](https://poser.pugx.org/ewa/tokeet/license.svg)](https://packagist.org/packages/ewa/tokeet) [![Total Downloads](https://poser.pugx.org/ewa/tokeet/downloads.svg)](https://packagist.org/packages/ewa/tokeet)

A Laravel package that provides a clean interface to the [Tokeet Property Management API](https://www.tokeet.com/). Manage rentals, inquiries, guests, channels, rates, events, invoices, and messages directly from your Laravel application.

## Requirements

- PHP 8.0+
- Laravel 9.x, 10.x, 11.x, or 12.x

## Installation

Install via Composer:

```bash
composer require ewa/tokeet
```

The package uses Laravel's auto-discovery, so the service provider and facade are registered automatically.

### Publish Configuration

```bash
php artisan tokeet:install
```

Or manually:

```bash
php artisan vendor:publish --provider="Ewa\Tokeet\TokeetServiceProvider" --tag="config"
```

### Environment Variables

Add the following to your `.env` file:

```env
TOKEET_API_KEY=your-api-key
TOKEET_ACCOUNT_ID=your-account-id
```

You can find your API key in your Tokeet account under **Settings > API**.

## Usage

Use the `Tokeet` facade to interact with the API:

```php
use Ewa\Tokeet\Facades\Tokeet;
```

### Rentals

```php
// Get all rentals
$rentals = Tokeet::getRentals();

// Get a single rental
$rental = Tokeet::getRental('rental-id');

// Create a rental
$rental = Tokeet::createRental([
    'name' => 'Beach House',
    'address' => '123 Ocean Drive',
    'bedrooms' => 3,
    'bathrooms' => 2,
]);

// Update a rental
Tokeet::updateRental('rental-id', [
    'name' => 'Updated Beach House',
]);

// Delete a rental
Tokeet::deleteRental('rental-id');
```

### Inquiries (Bookings)

```php
// Get all inquiries
$inquiries = Tokeet::getInquiries();

// Get a single inquiry
$inquiry = Tokeet::getInquiry('inquiry-id');

// Create an inquiry
$inquiry = Tokeet::createInquiry([
    'guest_name' => 'John Doe',
    'check_in' => '2026-04-01',
    'check_out' => '2026-04-07',
    'rental_id' => 'rental-id',
]);

// Update an inquiry
Tokeet::updateInquiry('inquiry-id', [
    'status' => 'confirmed',
]);

// Delete an inquiry
Tokeet::deleteInquiry('inquiry-id');
```

### Guests

```php
// Get all guests
$guests = Tokeet::getGuests();

// Get a single guest
$guest = Tokeet::getGuest('guest-id');

// Create a guest
$guest = Tokeet::createGuest([
    'name' => 'Jane Doe',
    'email' => 'jane@example.com',
    'phone' => '+1234567890',
]);

// Update a guest
Tokeet::updateGuest('guest-id', [
    'phone' => '+0987654321',
]);
```

### Channels

```php
// Get all channels
$channels = Tokeet::getChannels();
```

### Rates

```php
// Get rates for a rental
$rates = Tokeet::getRates('rental-id');

// Create a rate
Tokeet::createRate([
    'rental_id' => 'rental-id',
    'name' => 'Summer Rate',
    'amount' => 150,
    'start_date' => '2026-06-01',
    'end_date' => '2026-08-31',
]);

// Delete a rate
Tokeet::deleteRate('rate-id');
```

### Events (Calendar)

```php
// Get all events
$events = Tokeet::getEvents();

// Create an event
Tokeet::createEvent([
    'rental_id' => 'rental-id',
    'title' => 'Maintenance',
    'start_date' => '2026-04-15',
    'end_date' => '2026-04-16',
]);

// Delete an event
Tokeet::deleteEvent('event-id');
```

### Invoices

```php
// Get all invoices
$invoices = Tokeet::getInvoices();

// Get a single invoice
$invoice = Tokeet::getInvoice('invoice-id');

// Create an invoice
Tokeet::createInvoice([
    'inquiry_id' => 'inquiry-id',
    'amount' => 1050,
]);
```

### Messages

```php
// Get all messages
$messages = Tokeet::getMessages();

// Send a message
Tokeet::sendMessage([
    'inquiry_id' => 'inquiry-id',
    'body' => 'Welcome to our property!',
]);
```

### Error Handling

Failed API requests return an array with the status code and error details:

```php
$result = Tokeet::getRentals();

if (is_array($result) && isset($result['status_code'])) {
    // Handle error
    echo "Error {$result['status_code']}: " . json_encode($result['error']);
}
```

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
