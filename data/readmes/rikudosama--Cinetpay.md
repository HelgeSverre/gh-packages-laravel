# :package_description
---
A Laravel package for integrating CinetPay

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/:package_name.jpg?t=1" width="419px" />](https://github-ad-click/cinetpay)


## Installation

You can install the package via composer:

```bash
composer require Rikudosama/Cinetpay
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --provider="Rikudosama\Cinetpay\CinetpayServiceProvider" --tag="config"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="config"
```

This is the contents of the published config file:

```php
return [
     'api_key' => env('CINETPAY_API_KEY'),
    'site_id' => env('CINETPAY_SITE_ID'),
    'base_url' => env('CINETPAY_BASE_URL', 'https://api.cinetpay.com/v1/'),
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag=":cinetpay-views"
```

## Usage

```php
use Rikudosama\Cinetpay\Cinetpay;

class PaymentController extends Controller
{
    protected $cinetpay;

    public function __construct(Cinetpay $cinetpay)
    {
        $this->cinetpay = $cinetpay;
    }

    public function processPayment(Request $request)
    {
        $data = [
            // Les données requises pour le paiement
        ];

        $response = $this->cinetpay->makePayment($data);

        // Traitez la réponse comme nécessaire
    }
}
```
## Usage views
```php
return view('cinetpay::cinetpay');

```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [:author_name](https://github.com/rikudosama)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
