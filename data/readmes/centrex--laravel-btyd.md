# Laravel BTYD — BG/NBD + Gamma-Gamma CLV Prediction

[![Latest Version on Packagist](https://img.shields.io/packagist/v/centrex/laravel-btyd.svg?style=flat-square)](https://packagist.org/packages/centrex/laravel-btyd)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/centrex/laravel-btyd/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/centrex/laravel-btyd/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/centrex/laravel-btyd/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/centrex/laravel-btyd/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/centrex/laravel-btyd?style=flat-square)](https://packagist.org/packages/centrex/laravel-btyd)

Implements the **Buy 'Til You Die** model for customer lifetime value (CLV) prediction. Fits BG/NBD parameters (purchase frequency + churn) and Gamma-Gamma parameters (monetary value) using MLE via Nelder-Mead optimisation. Supports persisting fitted parameters to the database for reuse.

## Installation

```bash
composer require centrex/laravel-btyd
php artisan vendor:publish --tag="laravel-btyd-migrations"
php artisan migrate
```

## Usage

### 1. Build customer summaries from transaction history

```php
use Centrex\Btyd\Btyd;

// Each transaction: ['date' => Carbon|string, 'amount' => float]
$transactions = [
    ['date' => '2024-01-15', 'amount' => 120.00],
    ['date' => '2024-03-02', 'amount' => 85.50],
    ['date' => '2024-06-18', 'amount' => 200.00],
];

$summary = Btyd::transactionsToSummary($transactions);
// returns: frequency, recency (days), T (days since first purchase), monetary, n_transactions, total_revenue
```

### 2. Fit the models on a cohort

```php
$btyd = new Btyd();

// Fit BG/NBD on cohort summaries (frequency, recency, T required per customer)
$bgnbdParams = $btyd->fitBgNbd($cohortSummaries);
// returns: ['r' => ..., 'alpha' => ..., 'a' => ..., 'b' => ...]

// Fit Gamma-Gamma on customers with at least 1 repeat purchase (frequency, monetary required)
$ggParams = $btyd->fitGammaGamma($cohortSummaries);
// returns: ['p' => ..., 'q' => ..., 'v' => ...]
```

### 3. Predict for individual customers

```php
// Expected number of transactions over the next 12 months
$expectedTx = $btyd->expectedTransactions($customerSummary, horizonMonths: 12);

// Expected monetary value per transaction
$expectedMonetary = $btyd->expectedMonetary($customerSummary);

// Customer lifetime value (expectedTx × expectedMonetary)
$clv = $btyd->customerClv($customerSummary, horizonMonths: 12);
```

### 4. Persist fitted parameters

```php
use Centrex\Btyd\Models\BtydParam;

// Save fitted params for a given model class
BtydParam::updateOrCreate(
    ['model' => App\Models\Customer::class],
    ['params' => array_merge($bgnbdParams, $ggParams)],
);

// Load later
$params = BtydParam::getParams(App\Models\Customer::class);
```

### Full workflow example

```php
$btyd = new Btyd();

// Build summaries for all customers
$summaries = Customer::all()->map(fn ($c) =>
    Btyd::transactionsToSummary($c->orders->map(fn ($o) => [
        'date' => $o->created_at,
        'amount' => $o->total,
    ])->toArray())
)->toArray();

// Fit
$btyd->fitBgNbd($summaries);
$btyd->fitGammaGamma($summaries);

// Predict CLV for a single customer
$clv = $btyd->customerClv($summaries[0], 12);
echo "12-month CLV: {$clv}";
```

## Testing

```bash
composer test        # full suite
composer test:unit   # pest only
composer test:types  # phpstan
composer lint        # pint
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [centrex](https://github.com/centrex)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
