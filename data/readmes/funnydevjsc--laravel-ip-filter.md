# IP Filter Laravel

The free Laravel package to help you filter your users ip with multiple services

## Use Cases

- Perform a powerful checking for user ip before approving registration or invoice making.
- Parse result from validator
- Example use case

## Features

- Get information from ip-api.com
- Check blacklist from barracudacentral, getipintel, easydmarc, valli, uceprotect, projecthoneypot, team-cymru, fortiguard, talosintelligence, scamalytics
- Check quality and e-commerce fraud from maxmind, apivoid, ipqualityscore, cleantalk, iphub
- Easy to validate with a simple line code

## Requirements

- **PHP**: 8.1 or higher
- **Laravel** 9.0 or higher

## Quick Start

If you prefer to install this package into your own Laravel application, please follow the installation steps below

## Installation

#### Step 1. Install a Laravel project if you don't have one already

https://laravel.com/docs/installation

#### Step 2. Require the current package using composer:

```bash
composer require funnydevjsc/laravel-ip-filter
```

#### Step 3. Publish the controller file and config file

```bash
php artisan vendor:publish --provider="FunnyDev\IpFilter\IpFilterServiceProvider" --tag="ip-filter"
```

If publishing files fails, please create corresponding files at the path `config/ip-filter.php` and `app\Http\Controllers\IpFilterControllers.php` from this package. And you can also further customize the IpFilterControllers.php file to suit your project.

#### Step 4. Update the various config settings in the published config file:

After publishing the package assets a configuration file will be located at <code>config/ip-filter.php</code>.

<!--- ## Usage --->

## Testing

``` php
<?php

namespace App\Console\Commands;

use FunnyDev\IpFilter\IpFilterSdk;
use Illuminate\Console\Command;

class IpFilterTestCommand extends Command
{
    protected $signature = 'ip-filter:test';

    protected $description = 'Test Ip Filter SDK';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $instance = new IpFilterSdk();
        
        // Perform checking with fast mode turned on and only use $result['recommended'] as signal (true/false)
        $result = $instance->validate(ip: '127.0.0.1', fast: true, score: false);
        
        // Perform a full checking
        $result = $instance->validate(ip: '127.0.0.1', fast: false, score: true);
        
        // Explanation of results (structure returned by the SDK)
        $result = [
            'query' => '127.0.0.1',
            'recommend' => true, // Whether to accept this IP
            'reason' => '', // Reason when not recommended
            'trustable' => [
                'mobile' => false,
                'proxy' => false,
                'hosting' => false,
                'botnet' => false,
                'total_server' => 0, // Number of blacklist engines checked
                'blacklist' => 0, // Percent of blacklists detected (0-100)
                'fraud_score' => 0, // Fraud score (0-100)
                'reputation' => 'Unknown',
                'spam_ip' => false,
            ],
            'location' => [
                'country' => 'Unknown',
                'countryCode' => 'Unknown',
                'region' => 'Unknown',
                'regionName' => 'Unknown',
                'city' => 'Unknown',
                'zip' => 'Unknown',
                'lat' => 'Unknown',
                'lon' => 'Unknown',
                'timezone' => 'Unknown',
            ],
            'dns' => [
                'isp' => 'Unknown',
                'org' => 'Unknown',
                'as' => 'Unknown',
                'asname' => 'Unknown',
            ],
        ];
    }
}
```

## Feedback

Respect us in the [Laravel Việt Nam](https://www.facebook.com/groups/167363136987053)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security-related issues, please ip contact@funnydev.vn or use the issue tracker.

## Credits

- [Funny Dev., Jsc](https://github.com/funnydevjsc)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
