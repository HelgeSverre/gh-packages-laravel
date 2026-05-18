# Currency Exchange Laravel Package

The `CurrencyExchange` package provides a simple and efficient way to retrieve currency exchange rates and perform currency conversions in your Laravel applications. Integrates with the [ExchangeRate API](https://www.exchangerate-api.com) for reliable and up-to-date data.

---

## Features
- Retrieve real-time exchange rates for any support currency.
- Perform currency conversions between two currencies.
- Easily configurable with a default base currency and API key.
- Includes a frontend UI for fetching rates and performing conversions.
- Lightweight and extensible, suitable for any Laravel application.

---

## Installation
### Step 1
```bash
composer require mattyeend/currency-exchange
```

### Step 2
Publish the package configuration file to customise settings like the API key and base currency:
```bash
php artisan vendor:publish --tag=config --provider="MattYeend\CurrencyExchange\CurrencyExchangeServiceProvider"
```
This will create a `currencyexchange.php` configuration file in your `config` directory.

### Step 3
Add your ExchangeRate API key to your `.env` file:
```env
EXCHANGERATE_API_KEY=your_api_key
```

--- 

## Usage
### Fetch Exchange Rates
You can fetch exchange rates programmatically using the `CurrencyExchangeService`:
```php
use MattYeend\CurrencyExchange\Services\CurrencyExchangeService;

$service = app(CurrencyExchangeService::class);
$rates = $service->getRates('GBP'); // Replace 'GBP' with your base currency

dd($rates); // Outputs an array of exchange rates
```

### Convert Currency
Perform a currency conversion between two currencies:
```php
$convertedAmount = $service->convert(100, 'GBP', 'EUR');

echo "Converted Amount: $convertedAmount";
```

---

## Routes
The package includes predefined routes for fetching exchange rates and performing conversions:
- View Exchange Rates: 
GET `/currency-exchange`
Displays a basic UI for fetching and displaying rates.
- Get Rates (API);
GET `/currency-exchange/rates`
Returns exchange rates for a specific base currency.
- Convert Currency (API):
POST `/currency-exchange/convert`
Accepts `amount`, `from`, and `to` parameters and returns the converted amount.

---

## Views
A basic UI is included for quick usage. Visit `/currency-exchange` to view rates and use the conversion form.
To customise the view, edit the Blade template at:
`resources/views/vendor/currencyexchange/index.blade.php`

---

## Testing
The package includes unit and feature tests. Run the tests using PHPUnit:
```bash
php artisan test
```

--- 

## Configuration
The following configuration options are available in `config/currencyexchange.php`:
```php
return [
    'api_key' -> env('EXCHANGERATE_API_KEY', 'your_api_key'),
    'base_currency' => 'GBP'
];
```

--- 

## License
This package is open-source software licensed under the MIT license.

---

## Contributing
Feel free to fork the repository and submit pull requests for improvements or new features!