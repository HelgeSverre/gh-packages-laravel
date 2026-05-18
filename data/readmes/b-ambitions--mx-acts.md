# MX-Acts

Laravel package for generating Russian storage acts MX-1 and MX-3.

## Installation

```bash
composer require mikhail-solovian/mx-acts
```
## Publish config (optional)
```bash
php artisan vendor:publish --provider="BAmbitions\MxActs\MxActsServiceProvider"
```
## Usage
```injectablephp
use BAmbitions\MxActs\Facades\MxActs;
use BAmbitions\MxActs\DTO\ActData;
use BAmbitions\MxActs\DTO\OrganizationData;
use BAmbitions\MxActs\DTO\ItemData;

$data = new ActData(
    number: 'МХ-001',
    date: now(),
    keeper: new OrganizationData(name: 'Keeper LLC', inn: '1234567890'),
    depositor: new OrganizationData(name: 'Client LLC', inn: '0987654321'),
    items: [
        new ItemData(name: 'Product', unit: 'pcs', quantity: 10, price: 1000),
    ],
    returnDate: now(), // required for MX-3
);

// Download PDF
return MxActs::mx1Pdf($data);
return MxActs::mx3Pdf($data);

// Download Excel
return MxActs::mx1Excel($data);
return MxActs::mx3Excel($data);

// Save to file
MxActs::saveMx1Pdf($data, storage_path('app/mx1.pdf'));
```
## License
MIT License.

## Author
Mikhail Solovian - mikhail.s1990@gmail.com