# jalali

[![Latest Stable Version](https://img.shields.io/packagist/v/derakht/jalali.svg?style=flat-square)](https://packagist.org/packages/derakht/jalali)
[![Total Downloads](https://img.shields.io/packagist/dt/derakht/jalali.svg?style=flat-square)](https://packagist.org/packages/derakht/jalali)
[![GitHub Actions](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fbriannesbitt%2FCarbon%2Fbadge&style=flat-square&label=Build&logo=none)](https://actions-badge.atrox.dev/briannesbitt/Carbon/goto)

Add Jalali calendar utilities to Carbon.

## Installation
```
$ composer require derakht/jalali
```

## Usage

```php
<?php

use derakht\Jalali\Jalali;

Jalali::parse('2022-01-01')->toJalaliDateString(); // 1400/10/11 
Jalali::parse('2022-01-01')->toJalaliDateTimeString(); // 1400/10/11 00:00:00

Jalali::parseJalali('1400/01/01')->toDateString(); // 2021-03-21
Jalali::parseJalali('1400/01/01')->addDay()->toDateString(); // 2021-03-22
Jalali::parseJalali('1400/06/31')->addJalaliMonth()->toJalaliDateString(); // 1400/07/30

```