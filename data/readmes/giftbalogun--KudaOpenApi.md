<h1 align="center">KudaOpenApi Integration in Laravel</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/giftbalogun/kudaApiToken?color=56BEB8">

  <img alt="Star" src="https://img.shields.io/github/stars/giftbalogun/kudaApiToken?color=56BEB8">

  <img alt="GitHub issues" src="https://img.shields.io/github/issues/giftbalogun/kudaApiToken?color=56BEB8">

  <img alt="License" src="https://img.shields.io/github/license/giftbalogun/kudaApiToken?style=plastic&color=56BEB8">
</p>

<h4 align="center">
	Laravel integration with KudaOpenApi for seemless Banking via Kuda Bank Open Api
</h4>

<hr>

## Table of Contents  
1. [Getting Started](#dart-getting-started)  
2. [Installation](#dart-installation)  
3. [Usage](#sparkles-usage)  
4. [Documentation](#star-documentation)  
5. [Testing and Debugging](#wrench-testing-and-debugging)  
6. [License](#memo-license)  
7. [Social Presence](#mega-social-presence)  

<br>

## :dart: Getting Started

Enable your product for local transactions with the KUDA Open API platform! With the KUDA Open APIs, you can embed services on your platform and connect your customers to a wide range of banking services.

> **Note:** Ensure you have a [KUDA Business account](https://business.kuda.com/) linked to your profile for live access.

### Steps:
1. Sign up for a KUDA Business account.
2. Generate an API token from your developer dashboard.
3. Proceed with the installation and configuration below.

## :dart: Installation

[PHP](https://php.net) 7.2+ and [Composer](https://getcomposer.org) are required.

To get the latest version of KudaApiToken, simply require it

```bash
composer require giftbalogun/kudapaitoken
```

Or add the following line to the require block of your `composer.json` file.

```
"giftbalogun/kudapaitoken": "1.0.*"
```

and add This

```
"repositories": [
    {
        "type": "git",
        "url": "https://github.com/giftbalogun/kudaApiToken"
    }
],
```

You'll then need to run `composer install` or `composer update --prefer-dist` to download it and have the autoloader updated.

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Giftbalogun\Kudaapitoken\KudaApiTokenServiceProvider"
```

Open your .env file and add your public key, secret key, merchant email and payment url like so:

```php
KUDA_API_TOKEN=XXXXXXXXXXXXXXXXXXXX
KUDA_API_URL=XXXXXXXXXXXXXXXXXXXXXX
KUDA_USER_EMAIL=YOUR_EMAIL
ENVIRONMENT_ENV=LIVE_OR_TEST
```

## :star: Documentation
Documentation
http://kudaapitoken.readthedocs.io (COMING SOON)

Article Medium to Read
https://medium.com/@giftbalogun/laravel-integration-with-kudaopenapi-663825ecd247

## :sparkles: Usage

Availbale coomand to be use are in [COMMAND](COMMAND.md) file with easy to understand related to ServiceTypes.

Send request with this command.
```php
//simple
$data = [
    'email' => $request->email,
    'phoneNumber' => $request->phone,
    'lastName' => $request->l_name,
    'firstName' => $request->f_name,
    'businessName' => $request->business_name,
    'trackingReference' => $customer_code,
]; # $data is the format for making request to the api 

$ref = rand(); #used to generate randon unique number for the request

//For Pay with Transfer
$data = [
    "Amount"=>5000000,
    "IsFlexiblePayment"=>true, //true or false
    "RemittingAccounts"=>[
    {
        "SplitPercentage"=>50,
        "AccountName"=>"foods",
        "AccountNumber"=>"3020806687"
    },
    {
        "SplitPercentage"=>50,
        "AccountName"=>"foods",
        "AccountNumber"=>"3020808612"
    }
    ]
];

```

Styles of Calling the Controller
```php
use Giftbalogun\Kudaapitoken\Controllers\KudaBankController;

$this->kudabankservice->create_virtual_account($data, $ref);
```
OR

```php
use Giftbalogun\Kudaapitoken\Kuda;

$this->kuda->initController('default')->create_virtual_account($data, $ref);
## Controllers include 'Bill', 'Card', 'GiftCard', 'KudaBank' | Default is same as KudaBank
```

## ⚡️ Available Controllers

```php
$kuda->initController('Bill');
$kuda->initController('Card');
$kuda->initController('Saving');
$kuda->initController('PayWith');
$kuda->initController('KudaBank'); // default
$kuda->initController('GiftCard');
```

# ⚡️ Example: Creating a Customer Account

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Giftbalogun\Kudaapitoken\Controllers\KudaBankController;
use Giftbalogun\Kudaapitoken\Kuda;

class CustomController extends Controller
{
    private $kuda;
    private $kudabankservice;

    public function __construct()
    {
        $this->kudabankservice = new KudaBankController();
        ## Or call from Kuda service
        $this->kuda = new Kuda;
    }

    public function createcustomeraccount()
    {
        $customer_code = '000' . random_int(100000, 999999) . '0000';

        $data = [
            'email' => $request->email,
            'phoneNumber' => $request->phone,
            'lastName' => $request->l_name,
            'firstName' => $request->f_name,
            'businessName' => $request->business_name,
            'trackingReference' => $customer_code,
        ];
        $ref = rand();

        $newcustomeraccount = $this->kudabankservice->create_virtual_account($data, $ref);

        ## Or you can load from the Kuda Service
        
        $newcustomeraccount = $this->kuda->initController('default')->create_virtual_account($data, $ref);
        ## Controllers include 'Bill', 'Card', 'GiftCard', 'KudaBank' | Default is same as KudaBank

        $getvaccount = json_decode($newcustomeraccount['data']);

        return $getvaccount;
    }
}
```

# ⚡️ Example: Calling Status Helper

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Giftbalogun\Kudaapitoken\KudaStatusCodes;

class CustomController extends Controller
{
    public function createcustomeraccount()
    {
        $code = '00';
        $message = KudaStatusCodes::getMessage($code, 'kuda_to_kuda');

        echo $message ?? 'Unknown Status';  // Output: Successful
    }
}
```

# 💸 Example: Get Admin Balance

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Giftbalogun\Kudaapitoken\Kuda;

class CustomController extends Controller
{
    private $kuda;
    private $kudabankservice;

    public function __construct()
    {
        ##Kuda service
        $this->kuda = new Kuda;
    }

    public function getadminbalance()
    {
        $data = [];

        $ref = rand();

        ##load from the Kuda Service
        $balance = $this->kuda->initController('KudaBank')->getadminbalance($data, $ref);
        ## Controllers include 'Bill', 'Card', 'GiftCard', 'KudaBank' | Default is same as KudaBank

        $getadminbalance = json_decode($balance['data']);

        return $getadminbalance;
    }
}
```

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.

## Social Presense
Follow me on social media
[Medium](https://medium.com/@giftbalogun)!
[Twitter](https://twitter.com/am_de_one)!
[Instagram](https://www.instagram.com/am_thd_one/)!
[LinkedIn](https://www.linkedin.com/in/gift-balogun-907103160/)!
[Porfolio](https://giftbalogun.name.ng/)!

Made with :heart: by <a href="https://giftbalogun.name.ng" target="_blank">Gift Balogun</a>

&#xa0;

<a href="#top">Back to top</a>
