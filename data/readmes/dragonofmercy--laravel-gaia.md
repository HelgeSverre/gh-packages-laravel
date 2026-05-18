# laravel-gaia
Gaia package for Laravel 12

## Usage

Install

````bash
composer require dragonofmercy/laravel-gaia
````

In your providers.php

````php
return [
    Demeter\Providers\DemeterServiceProvider::class,
    Gui\Providers\GuiServiceProvider::class,
    Minerva\Providers\MinervaServiceProvider::class,
    ...
];
````

Don't forget to publish assets

````bash
php artisan vendor:publish --tag=gui
````

This is a home package no support will be provided!  
If this project help to increase your productivity, you can give me a cup of coffee :) 

<a href="https://ko-fi.com/dragonofmercy" target="_blank"><img src="https://cdn.ko-fi.com/cdn/kofi2.png?v=3" alt="Donate" width="160px" /></a>
