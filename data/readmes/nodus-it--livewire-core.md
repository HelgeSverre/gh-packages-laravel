# Livewire Core
[![License](https://poser.pugx.org/nodus-it/livewire-core/license)](//packagist.org/packages/nodus-it/livewire-core)
[![Latest Unstable Version](https://poser.pugx.org/nodus-it/livewire-core/v/unstable)](//packagist.org/packages/nodus-it/livewire-core)
[![Total Downloads](https://poser.pugx.org/nodus-it/livewire-core/downloads)](//packagist.org/packages/nodus-it/livewire-core)
[![Build Status](https://travis-ci.org/nodus-it/livewire-core.svg?branch=master)](https://travis-ci.org/nodus-it/livewire-core)
[![codecov](https://codecov.io/gh/nodus-it/livewire-core/branch/master/graph/badge.svg)](https://codecov.io/gh/nodus-it/livewire-core)


_The core package for all Laravel Livewire packages from Nodus-IT._

**This package is currently being developed and is still in testing**

## Installation
You can install the package via composer:
````
composer require nodus-it/livewire-core
````

You can publish the config file with:
````
php artisan vendor:publish --provider="Nodus\Packages\LivewireCore\LivewireCoreServiceProvider" --tag="livewire-core:config"
````

You can publish the blade views with:
````
php artisan vendor:publish --provider="Nodus\Packages\LivewireCore\LivewireCoreServiceProvider" --tag="livewire-core:views"
````

## Usage
### Controller integration
All our Livewire components can be used as standalone in your blade views as you are used to it. 
But we are offering an optional way to integrate a Livewire component so to say as full page component into your controllers.

In order to use this, you need to use the ``SupportsLivewire`` trait in your controller.
This trait provides a single function named ``livewire()`` where you can pass your component class and an array with parameters:
````php 
public function index()
{
    return $this->livewire(UserListView::class, ['builder' => User::query()]);
}
````

By default, this would be extending a layout called ``layouts.app`` and adding the component to a section called ``content``.

#### Customize layout or section
In order to customize the used layout and/or section you have two possible ways.
First you could use the fluent interface of the ``LivewireComponent`` class, which is returned when calling the ``livewire()`` method. 
With that you can just pass your desired settings via the following methods:
````php
public function index()
{
    return $this->livewire(UserListView::class, ['builder' => User::query()])
        ->layout('myFolder.layoutName', ['title' => '...'])
        ->section('myContentSection');
}
````
In case you don't want to define this on every ``livewire()`` call, you can also add some properties and methods to your controller, with which you can define the default layout, the layout parameters and the default section for all ``livewire()`` calls of this controller:
````php
protected $defaultLayout = 'myFolder.layoutName';

protected $defaultSection = 'myContentSection';

private function getLayoutData()
{
    return [
        'title' => $this->title,
    ];
}
````


### CSP nonce handling
This package provides the support for the Content Security Policy (CSP) nonce for all assets in the Laravel Livewire packages from Nodus-IT.
To use it you need to add your CSP nonce provider callback to the config:
````php
// Possible values: "<nonce_callable>", "null"
'csp_nonce'   => 'my_nonce_provider_function',
````
The generated nonce is then automatically added to all assets provided by our packages.

For ease of use we added also a Blade Directive for adding the nonce HTML attribute to your custom assets:
````html
<script @nonce>
...
</script>
````

## Testing
````
composer test
````

## License
The MIT License (MIT). Please see [License File](LICENCE) for more information.