# KEJ Stock Market Package

**KEJ Stock Market** is a **Laravel package** that allows developers to fetch **live stock market data** from Bangladesh’s **DSE (Dhaka Stock Exchange)** and **CSE (Chittagong Stock Exchange)**. The package provides the data as **PHP arrays**—no views included—making it ideal for **API usage, dashboards, analytics, or financial applications**.

---

## **Key Features**

- Fetch **live DSE stock market data** in array format  
- Fetch **live CSE stock market data** in array format  
- **No frontend/views** included—just raw data for your application  
- **Laravel 8, 9, 10** compatible  
- **Caching** included to reduce repeated requests (default 5 minutes)  
- Ideal for **API endpoints, dashboards, or custom reporting**  

---

## **Installation**

Install via Composer:

```bash
composer require kejubayer/kej-stock-market
```

## **If you want to register manually:**
```php
// config/app.php
'providers' => [
    Kejubayer\StockMarket\KejStockMarketServiceProvider::class,
];
```


## **Usage**
```php
use Kejubayer\StockMarket\Services\DseService;
use Kejubayer\StockMarket\Services\CseService;

// DSE Data
$dseService = app(DseService::class);
$dseData = $dseService->getLatest();

// CSE Data
$cseService = app(CseService::class);
$cseData = $cseService->getLatest();

// Example output
print_r($dseData);
print_r($cseData);
```


## **Sample Output:**
```php
Array
(
    [0] => Array
        (
            [symbol] => ACI
            [ltp] => 123.50
            [high] => 125.00
            [low] => 122.50
            [closep] => 123.00
            [ycp] => 120.50
            [change] => 3.50
            [trade] => 1000
            [value] => 123500
            [volume] => 1000
        )
)
```


