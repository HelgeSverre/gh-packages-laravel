# Search for points of interest

[![Latest Version on Packagist](https://img.shields.io/packagist/v/teamzac/points-of-interest.svg?style=flat-square)](https://packagist.org/packages/teamzac/points-of-interest)

A package, which includes Laravel support, for searching multiple providers of point-of-interest (POI) data. Currently includes support for Google, Yelp, FourSquare, and Here.com.

## Installation

You can install the package via composer:

```bash
composer require teamzac/points-of-interest
```

Once installed, Laravel 8+ will auto-discover the package. If you do not, or cannot, use auto-discovery, you may manually install by adding the following to ```config/app.php```:

``` php
    // providers
    \TeamZac\POI\PointsOfInterestServiceProvider::class,
    
    // aliases
    'POI' => \TeamZac\POI\Facades\POI::class,
```

If you would like to override the default configuration, you may run:

``` bash
php artisan vendor:publish --provider="TeamZac\POI\PointsOfInterestServiceProvider"
```

## Usage

This package uses the manager strategy to handle switching between different data providers. You can set a default provider as well as any other providers through the configuration file. If you need to retrieve a specific driver, you can use the driver() method on the POI facade:

``` php
POI::driver('google');
```

This will return the driver instance, on which you can specify your query type. If you omit the explicit call to a driver, you'll receive the default driver specified in the configuration.

## Data Providers

We currently support:

* Google Places
* Yelp Fusion
* Here.com Places API
* FourSquare


## Query Types

This package supports three types of queries: **retrieving** a POI based on the unique ID from the provider, **matching** a POI based on some known attributes, and **searching** for POIs based on certain criteria.

The match and search query types return a fluent query object on which your search parameters can be set. The retrieve query type only accepts the unique ID;

### Retrieve a POI based on the provider's unique ID

If you know the provider's ID for the POI, you can fetch their record using the retrieve query:

``` php
$place = POI::retrieve('provider-id');

$place = POI::driver('yelp')->retrieve('provider-id');
```

Unlike the other two queries, the retrieve query directly returns an instance of ```TeamZac\POI\Support\Place```.

### Matching based on known attributes

If you have some known attributes for a POI and would like to retrieve a matching copy from a specific provider, you should use the match query.

``` php
$query = POI::match('walmart supercenter')
    ->near(Address::make([
        'street' => '123 Main Street',
        'city' => 'Fort Worth',
        'state' => 'Texas',
        'country' => 'US',
        'postalCode' => 76102,
        'latLng' => LatLng::make(32, -97)
    ]);
    
$place = $query->get();
```

Available methods on the match query are:

``` php
$query->search('search term')
    ->address(/** @var TeamZac\POI\Support\Address */)
    ->phone(/** use a phone number instead of a search query, where available */);
    
// use the get() method to perform the query
```

The ```get()``` method of the match query returns in instance of ```TeamZac\POI\Support\Place```. 

### Searching for POIs

If you want to search around a specific address or lat/lng coordinate pair, you should use the search query.


``` php
$query = POI::search(/** optional search term goes here */);

$collection = $query->get();
```

The ```get()``` method returns an instance of ```TeamZac\POI\Support\PlaceCollection```, which is a subclass of ```Illuminate\Support\Collection``` that adds a few properties and methods for retrieving additional results. Learn more about the ```PlaceCollection``` here.

We've done our best to provide a standardized interface across all platforms, even though there are at times significant differences between them. Some providers allow searching within arbitrary geometries and/or bounding boxes, while others only allow you to search near a specified address or lat/lng pair.

#### Searching near a location

To search near a specific address or location, you can use the ```near()``` method, which accepts an instance of ```TeamZac\POI\Support\Address```. Address is a value object that holds information about a street address, including the street name/number, city, state, country, postal code, and latitude/longitude pair (which should be an instance of ```TeamZac\POI\Support\LatLng```).


``` php
// Google requires a lat/lng pair with optional radius
POI::driver('google')->search()->near(Address::make([
    'latLng' => LatLng::make(32, -97),
])->radius(500); // meters

// Yelp requires an address, including country code
POI::driver('yelp')->search()->near(Address::make([
    'street' => '123 Main Street',
    'city' => 'Fort Worth',
    'state' => 'Texas',
    'postalCode' => 76102,
    'country' => 'US',
]);
```

If possible, it's recommended to provide a full address including lat/lng when making your request and let the provider convert it to the correct request format. If your Address does not contain sufficient information to run the query, an ```InsufficientAddressExeption``` will be thrown.

#### Searching within a geometry or bounding box

Coming soon...

#### Filtering by category

When available, you may filter your searches by business category. Yelp allows filtering by multiple categories, while Google only allows a single type to be used. If multiple categories are provided to the Google driver, it will use only the first.

``` php
$query = POI::search()->near(/** @var Address */);

// you can narrow your search by category where available
// if the provider does not support this option, it will result in a no-op
$query->categories(['retail', 'restaurant']);

```

We provide a generic set of categories that each provider is responsible for mapping to its own specific category codes. For more information, go here. **TODO: add something about this**

The following providers support searching within arbitrary polygons:

* Here

The following only allow searching about a specific location:

* Google
* Yelp

## Classes

### Address

A value object that is used to standardize address syntax across the various platforms.

``` php
Address::make([
    'street' => '123 Main Street',
    // etc
]);
```

### LatLng 

A value object that is used to hold a lat/lng coordinate pair

``` php
LatLng::make(32, -97);
```

### Place

A value object that is used to standardized POI responses across the various platforms. You most likely will not need to create an instance of this object directly unless you're extending the ```TeamZac\POI\Manager``` by adding a new provider.

``` php
$place = POI::driver('google')->retrieve('provider-id');

$place->getProvider();      // 'google'
$place->getId();            // 'provider-id'
$place->getName();          // business name
$place->getAddress();       // TeamZac\POI\Support\Address
$place->getPhone();         // phone number
$place->getCategories();    // array of category strings
$place->getRaw();           // array containing the raw results from the provider
```

### PlaceCollection

The ```TeamZac\POI\Support\PlaceCollection``` is a subclass of ```Illuminate\Support\Collection``` that provides the ability to query for additional results when available.

``` php
$collection = POI::search()->near($address)->get();

// get a new instance of PlaceCollection containing the next page of search results
$collection->nextPage();

// get the total number of results found
$collection->getTotal();
```

## Extending

If you need to add additional data providers, you can extend the Manager class.

``` php
POI::extend('new-provider', function($app) {
    // create and return your driver here
});
```

Your provider should implement the ```TeamZac\POI\Contracts\ProviderInterface``` interface, which includes the following methods:

### match()

The ```match()``` method accepts an optional search term and returns a query object that implements ```TeamZac\POI\Contracts\MatchQueryInterface```.

The ```MatchQueryInterface``` requires the following methods:

* ```search($term = null)```
* ```phone($number = null)```
* ```near(Address $addess)```
* ```get()```

The ```get()``` method should return an instance of ```TeamZac\POI\Support\Place```.

### search()

The ```search()``` method accepts an optional search term and returns a query object that implements ```TeamZac\POI\Contracts\SearchQueryInterface```.

The ```SearchQueryInterface``` requires the following methods:

* ```search($term = null)```
* ```near(Address $address)```
* ```within($tbd)```
* ```get()```

The ```get()``` method should return an instance of ```TeamZac\POI\Support\PlaceCollection```.

### retrieve()

The ```retrieve()``` method accepts an ID and returns an instance of ```TeamZac\POI\Support\Place```.


### Testing

``` bash
composer test
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email chad@zactax.com instead of using the issue tracker.

## Credits

- [Chad Janicek](https://github.com/teamzac)
- [All Contributors](../../contributors)
- [Laravel Package Boilerplate](https://laravelpackageboilerplate.com)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
