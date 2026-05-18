

# openprovider.com API Support for Laravel

1. [Introduction](#overview)
    - [Why This Package?](#why-this-package)
2. [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Step-by-Step Installation](#step-by-step-installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
    - [1. Contact Management](#1-contact-management)
        - [Retrieve Contacts](#retrieve-contacts)
        - [Retrieve a Single Contact](#retrieving-a-single-contact)
        - [Create or Update Contacts](#create-or-update-contacts)
        - [Delete Contacts](#delete-contacts)
        - [Contact Model Overview](#contact-model-overview)
    - [2. Sending Notifications](#2-sending-notifications)
        - [Supported Notification Channels](#supported-notification-channels)
        - [Example: Sending SMS Notifications](#example-sending-sms-notifications)
5. [Exception Handling](#exception-handling)
6. [Contributing](#contributing)
7. [License](#license)
8. [Contact](#contact)


## Overview
The Laravel Openprovider package simplifies integrating the powerful Openprovider API into your Laravel applications.
It provides a user-friendly way to manage Domains and DNS Zone records.
This package is designed to make communication between [Laravel](https://laravel.com) and [Openprovider](https://www.openprovider.com/) seamless and efficient.


[//]: # (- **Dynamic Templates**: Leverage reusable templates for consistent notifications.)


## Installation

### Prerequisites
Before installing this package, ensure your system meets the following requirements:
- **PHP**: Version `^8.3`
- **Laravel**: Version  `^11.0`, `^12.0`
- **Openprovider Account**

### Step-by-Step Installation
1. Add the package to your Laravel project using Composer:
    ```bash
    composer require spits-online/laravel-openprovider-api
   ```
2. Once installed, the package will automatically register the `LarvelOpenproviderApiServiceProvider` using Laravel's package auto-discovery.
3. Run the following command to publish the package configuration:
   ```bash
   php artisan vendor:publish --tag="laravel-openprovider-api-config"
    ```
   This will create a `config/openprovider-api.php` file in your application.


## Configuration

OPENPROVIDER_USERNAME="{{username}}"
OPENPROVIDER_PASSWORD="{{password}}"

The `config/openprovider-api.php` file contains all configurable options, including:

- Openprovider base URL: the API URL for openprovider `OPENPROVIDER_BASE_URL` most likely `"https://api.openprovider.eu/v1beta"`
- Server IP: Set the IP address of your server to communicate with the API `OPENPROVIDER_IP`
- Openprovider username: Set the username of your account (must have permission to use API, can be set in Openprovider dashboard) `OPENPROVIDER_USERNAME`.
- Openprovider password: Set the password of your account (must have permission to use API, can be set in Openprovider dashboard) `OPENPROVIDER_PASSWORD`.

    ```env
    OPENPROVIDER_BASE_URL="https://api.openprovider.eu/v1beta"
    OPENPROVIDER_IP={IP address of your server}
    OPENPROVIDER_USERNAME={Openprovider username}
    OPENPROVIDER_PASSWORD={Openprovider password}
    ```
For detailed configuration options, refer to the comments within the config/openprovider-api.php file.

## Usage

### 1. Domain management

This package provides functionality for managing domains via the Openprovider API. Below are the key actions you can perform with the `DomainService`.

#### Retrieve a list of domains
You can retrieve a list of domain using the `getDomains()` method.
To be able to retrieve the domains, make sure you have specified the credentials in your `.env` file.

```php
use Spits\LaravelOpenproviderApi\Services\DomainService;

$domains = app(new DomainService())->index(options: ['limit' => 100, 'offset' => 100]);
```

Parameters:
- `options`: An array of options for the request see the [Openprovider docs](https://docs.openprovider.com/doc/all#operation/ListDomains) for the available options.


#### Retrieving a single domain
You can also retrieve a single domain using the `getDomain()` method. This allows you to get only one domain by specifying its id.

```php
use Spits\LaravelOpenproviderApi\Services\DomainService;

$domain = app(new DomainService())->getDomain(id: 'Openprovider ID');
```

Parameters:
- `id`: The id of the domain

#### Update domain
You can update a domain by passing the `id` and `data` array  to the `updateDomain` method.\
This method requires the domain's identifier.

```php
use Spits\LaravelOpenproviderApi\Services\DomainService;

$response = new DomainService()->updateDomain(id: 'id', data: []);


```

Parameters:
- `id`: The `ID` of the domain you wish to update
- `data`: The data you wish to update. See the [Openprovider docs](https://docs.openprovider.com/doc/all#operation/UpdateDomain) for the updatable  attributes


### 2. Managing DNS zones

This package supports managing DNS zones.\
We made specific controllers for the Dns zone records as its our own main use case.\
But the DnsService class can be used for all functions related to DNS zones. 

#### Retrieving DNS zone records
You can get the records by using the `show` function in DnsRecordsController.


```php
use Spits\LaravelOpenproviderApi\Services\DnsService;

class DnsRecordsController {
    public function show(string $domain, DnsService $service) 
    {
        $options = request()->get('options', ['with_records' => 'true']);

        $response = $service->getDnsZone($domain, $options);

        return $response->collect();
    }
}
```

Parameters:
- `domain`: The domain for which you want to see de DNS zone information
- `options`: An array set as query param with all the options you want to send with the call. See the docs for available [options](https://docs.openprovider.com/doc/all#tag/ZoneService)

#### Creating / Updating / Removing records
We chose too split these in separate controller functions.\
But all can be done in 1 operation by calling the `updateDnsZone` function in `Spits\LaravelOpenproviderApi\Services\DnsService`

```php
use Spits\LaravelOpenproviderApi\Services\DnsService;

class DnsRecordsController {
    public function store(string $domain, DnsService $service, DnsRecordStoreRequest $request)
    {
        $data = [
            'provider' => $request->validated('provider'),
            'records' => [
                'add' => [
                    $request->validated('record'),
                ],
            ],
        ];

        return $service->updateDnsZone($domain, $data);
    }
}
```

#### Exporting records
We created the `export` function in `Spits\LaravelOpenproviderApi\Http\Controllers\DnsRecordsController` to export Dns zone records to an .xlsx file.

```php
use Spits\LaravelOpenproviderApi\Services\DnsService;

class DnsRecordsController {
    public function export(string $domain, DnsService $service)
    {
        $options = request()->get('options', ['with_records' => 'true']);

        $response = $service->getDnsZone($domain, $options);
        $data = $response->collect();
        $collection = collect($data['data']['records'])->map(function ($item) {
            return (object) $item;
        });

        $export = new DnsZoneExport($collection);

        return Excel::download($export, 'dns_zone_'.$domain.'.xlsx');
    }
}
```

## Contributing

Please submit ideas, issues and pull requests to the [GitHub repository](https://github.com/spits-online/laravel-openprovider-api).

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Contact

For any inquiries or support, please contact [Spits](mailto:webapps@spits.online).
