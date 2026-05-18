# Laravel Hostfact Wefact API wrapper

## Installation

```bash
composer require spits-online/laravel-wefact-api
php artisan vendor:publish --provider="Spits\WeFactApi\WeFactApiServiceProvider"
```

## Configuration

Set the .ENV variables

```dotenv
WEFACT_API_KEY=
WEFACT_BASE_URI=
```

Or modify the `config/wefact.php` file.

### HostFact

When using HostFact, modify the `config/wefact.php` and set the type to `\Spits\WeFactApi\HostFact::class`.

### Components

Each method supports default:

- List
- Find
- Show
- Create
- Edit
- Save

Additional methods will be documented on the component.

To start using the functionalities a new Entity must be instantiated.
```php
use Spits\WeFactApi\Entities\Debtor;

$debtor = new Debtor();
```
Optionally an $Identifier parameter may be provided.
When doing so automatically a `show` object call will be made to the API retrieving the objects data from WeFact.
After this you can use the supported methods
```php
//For the full fields list check WeFact documentation
$debtor->create([
    'Intials'           => $requestData['Initials'],
    'CompanyName'       => $requestData['CompanyName'],
    'EmailAddress'      => $requestData['EmailAddress'],
    'PhoneNumber'       => $requestData['PhoneNumber'],
    'Address'           => $requestData['Address'],
    'ZipCode'           => $requestData['ZipCode'],
    'City'              => $requestData['City'],
    'InvoiceAddress'    => $requestData['InvoiceAddress'],
]);
```



Alternatively the Wefact Facada may be used to instantiate the Entites as listed below.
#### Debtor

#### Creditor

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::creditor(1);
```

#### CreditInvoice

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::creditInvoice(1);
```

#### Debtor

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::debtor(1);
```

#### Group

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::group(1);
```

#### Invoice

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::invoice(1);
```

#### Product

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::product(1);
```

#### Quote

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::quote(1);
```

#### Service

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::service(1);
```

#### Subscription

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::subscription(1);
```

#### Ticket

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::ticket(1);
```
#### Vps

```php
use Spits\WeFactApi\Facades\WeFact;
WeFact::vps(1);
```


## HostFact only Entities
Since WeFact doesn't support domain management a few of the entities are only to be used in combination with HostFact.\
These entities are listed below:
- `Entities\Domain`
- `Entities\DomainContract`
- `Entities\Hosting`
- `Entities\Ssl`
- `Entities\Vps`
