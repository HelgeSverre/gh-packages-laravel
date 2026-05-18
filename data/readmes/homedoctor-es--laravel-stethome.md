StethoMe SDK for Laravel
=======================
Laravel integration for the [StethoMe SDK](https://github.com/jlorente/stethome-php-sdk).

## Installation

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

With Composer installed, you can then install the extension using the following commands:

```bash
$ php composer.phar require jlorente/laravel-stethome
```

or add 

```json
...
    "require": {
        "jlorente/laravel-stethome": "*"
    }
```

to the ```require``` section of your `composer.json` file.

## Configuration

1. Register the ServiceProvider in your config/app.php service provider list.

config/app.php
```php
return [
    //other stuff
    'providers' => [
        //other stuff
        \Jlorente\Laravel\StethoMe\StethoMeServiceProvider::class,
    ];
];
```

2. Add the following facade to the $aliases section.

config/app.php
```php
return [
    //other stuff
    'aliases' => [
        //other stuff
        'StethoMe' => \Jlorente\Laravel\StethoMe\Facades\StethoMe::class,
    ];
];
```

3. Set the vendor_token in the config/stethome.php file or use the predefined env 
variables.

config/stethome.php
```php
return [
    'vendor_token' => 'YOUR_VENDOR_TOKEN',
    //other configuration
];
```
or 
.env
```
//other configurations
STETHOME_VENDOR_TOKEN=<YOUR_VENDOR_TOKEN>
```

## Usage

You can use the facade alias StethoMe to execute api calls. The authentication 
params will be automaticaly injected.

```php
StethoMe::pulmonary()->getVisitId();
```

See the [StethoMe PHP SDK](https://github.com/jlorente/stethome-php-sdk) or the [StethoMe API](https://documenter.getpostman.com/view/6250828/S17m1BbV?version=latest) to know more about the 
methods and the API endpoints params and responses.

## License 
Copyright &copy; 2020 José Lorente Martín <jose.lorente.martin@gmail.com>.

Licensed under the BSD 3-Clause License. See LICENSE.txt for details.
