# PHP Laravel package for PPL myApi 2 Integration

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bohemicastudio/ppl-myapi.svg?style=flat-square)](https://packagist.org/packages/bohemicastudio/ppl-myapi)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/bohemicastudio/ppl-myapi/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/bohemicastudio/ppl-myapi/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/bohemicastudio/ppl-myapi/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/bohemicastudio/ppl-myapi/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bohemicastudio/ppl-myapi.svg?style=flat-square)](https://packagist.org/packages/bohemicastudio/ppl-myapi)

This package provides a straightforward and easy-to-use integration with **PPL myApi 2**, focusing on **creating shipments** and **downloading shipping labels** within the PPL system. Rather than implementing the entire API, this package is designed to cover only the **essential features** needed for shipment processing.

While our primary focus is on shipment creation, we welcome **community contributions** and encourage pull requests for additional features.

## Features
- Full support for all `/codelist/` endpoints
- Shipment creation via `POST /shipment/batch`
- Label download (retrievable from the shipment creation response)
- Direct API requests via `PplMyApi::request`, with customizable response handling

For detailed implementation instructions, see the [Usage](#usage) section below.

## Additional Resources
- Official API documentation: [PPL Sandbox](https://sandbox.ppl.cz/)
- Need help? Open an issue on GitHub

## Installation

You can install the package via composer:

```bash
composer require bohemicastudio/ppl-myapi
```

You have to publish the config file and setup proper credentials:

```bash
php artisan vendor:publish --tag="ppl-myapi-config"
```

This is the contents of the published config file:

```php
return [
    'client_id' => env('PPL_MYAPI2_CLIENT_ID'),
    'client_secret' => env('PPL_MYAPI2_CLIENT_SECRET'),
    'production' => env('PPL_MYAPI2_PRODUCTION', false),
    'access_token_url' => env('PPL_MYAPI2_ACCESS_TOKEN_URL', env('PPL_MYAPI2_PRODUCTION') ? 'https://api.dhl.com/ecs/ppl/myapi2/login/getAccessToken' : 'https://api-dev.dhl.com/ecs/ppl/myapi2/login/getAccessToken'),
    'base_url' => env('PPL_MYAPI2_BASE_URL', env('PPL_MYAPI2_PRODUCTION') ? 'https://api.dhl.com/ecs/ppl/myapi2' : 'https://api-dev.dhl.com/ecs/ppl/myapi2'),
];

```

## Usage

Below is a basic example of how to create a shipment batch using this package and download the labels. You can customize the shipment details by adding additional fields as needed. The provided models ensure a structured approach to handling shipments efficiently.

```php
use BohemicaStudio\PplMyApi\Enums\ProductList;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\ShipmentBatch;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\Shipment;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\Address;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\CashOnDelivery;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\ShipmentSet;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\LabelSettings;
use BohemicaStudio\PplMyApi\Models\Data\Shipment\CompleteLabelSettings;
use BohemicaStudio\PplMyApi\Services\PplMyApiShipmentService;
use BohemicaStudio\PplMyApi\PplMyApi;
use GuzzleHttp\Exception\ClientException;

// First, create a shipment batch. This is a basic example; you can add more fields as required.
$shipmentBatch = new ShipmentBatch(
    shipments: [
        new Shipment(
            // Ideally, use PplMyApiCodelistService to fetch all product types, but you can also use enum as we assume it won't change
            productType: ProductList::ParcelCzechBusinessCod->value, 
            recipient: new Address(
                country: 'CZ',
                zipCode: '15500',
                name: 'Company Name',
                name2: 'Company Name',
                street: 'Street 10/1',
                city: 'Praha 13',
                contact: 'John Doe',
                phone: '+420123456789',
                email: 'receipient@example.com',
            ),
            referenceId: '96aeaec1-4ca6-49f5-b0a6-8eef258586a5',
            sender: new Address(
                country: 'CZ',
                zipCode: '15500',
                name: 'Your Company Name',
                name2: 'Your Company Name',
                street: 'Your Street 10/1',
                city: 'Praha 13',
                contact: 'Your Name',
                phone: '+420223456789',
                email: 'sender@example.com',
            ),
            cashOnDelivery: new CashOnDelivery(
                codCurrency: 'CZK',
                codPrice: 1000,
                codVarSym: '1234567890',
            ),
            shipmentSet: new ShipmentSet(
                numberOfShipments: 2, // Number of packages in the shipment
                shipmentSetItems: [],
            ),
        ),
    ],
    labelSettings: new LabelSettings(
        format: 'Pdf',
        completeLabelSettings: new CompleteLabelSettings(
            isCompleteLabelRequested: true,
            pageSize: 'A4',
        ),
    ),
    shipmentsOrderBy: 'ShipmentNumber',
);

$pplApi = new PplMyApi();
$service = new PplMyApiShipmentService($pplApi);

try {
    $shipmentBatchUrl = $service->createShipmentBatch($shipmentBatch);
} catch (ClientException $e) {
    // You may want to output the validation error
    dd($e->getResponse()->getBody()->getContents());
}

// Ideally, you should create a delayed queued job for this, that will try this after 1 minute and repeat for let's say 10 minutes (as PPL API does not provide any webhook or callback)
// But if you are forced to do it in the same request, you can do it like this:
$attempts = 0;
while ($attempts < 24) {
    sleep($attempts === 0 ? 3 : 2);
    // Then we can get the shipment batch detail - parsing of shipment batch detail will work only if there is only one shipment in the batch
    // Otherwise you need to parse the response yourself
    $detail = $service->getShipmentBatchDetail($shipmentBatchUrl);
    if ($detail->isFullyCompleted()) {
        $count = 0;
        foreach ($detail->items as $item) {
            // Make sure the directory exists
            $name = 'pdf/' . $item->shipmentNumber . '_' . $count . '.pdf';
            file_put_contents(public_path($name), $pplApi->request($item->labelUrl)->getBody()->getContents());
            $count++;
        }

        break;
    }

    $attempts++;
}
```

This example demonstrates the core structure for creating a shipment. Be sure to adjust the shipment details based on your requirements.

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

- [Bohemica Studio](https://github.com/BohemicaStudio)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## With ❤️ by Bohemica Studio & Alex Kratky

* [Contact webpage](https://bohemicastudio.com/)
* [Github webpage](https://github.com/bohemicastudio)
* [Github webpage of Alex Kratky](https://github.com/alexkratky)

This package was inspired by [PplMyApi](https://github.com/Salamek/PplMyApi) and [php-ppl-create-package-label-api](https://github.com/szymsza/php-ppl-create-package-label-api).

## Searching for Uncomplicated Digital Signage?

Discover **[Bohemica Signage](https://bohemicasignage.com/)**—the hassle-free way to manage digital displays!
