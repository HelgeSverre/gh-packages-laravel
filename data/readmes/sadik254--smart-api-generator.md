# SmartApiGenerator

[![Latest Version](https://img.shields.io/github/v/release/sadik254/smart-api-generator?style=flat-square)](https://github.com/sadik254/smart-api-generator/releases)  
[![License](https://img.shields.io/github/license/sadik254/smart-api-generator?style=flat-square)](LICENSE) 
[![Latest Version on Packagist](https://img.shields.io/packagist/v/saleh/smart-api-generator.svg?style=flat-square)](https://packagist.org/packages/saleh/smart-api-generator)
[![Total Downloads](https://img.shields.io/packagist/dt/saleh/smart-api-generator.svg?style=flat-square)](https://packagist.org/packages/saleh/smart-api-generator)


A Laravel package to quickly generate API scaffolding — model, migration, controller, and routes — with customizable fields and validation, saving you repetitive work.

---

## Features

- Generate Eloquent Model with fillable properties  
- Generate Migration with nullable or required fields  
- Generate RESTful API Controller with full CRUD methods  
- Generate Postman Collection with one command
- Auto-append API resource routes with proper controller imports  
- Validation rules auto-generated based on field types and requirements  
- Simple artisan command interface  

---

## Installation

Require the package via Composer:

```bash
composer require saleh/smart-api-generator
```
Laravel will auto-discover the service provider.

## Usage

Run the artisan command and follow the prompts:

```bash
php artisan make:smart-api {ModelName}
```

Example:

```bash
php artisan make:smart-api Post
```

When prompted to enter fields, use the format:

```
title:string:req, body:text, published_at:datetime
```

- Append :req to mark a field as required (validation and migration NOT nullable)

- Omit :req to make the field nullable 

Run this artisan command to create the postman collection of all the existing models, if the collection contains the previous model data it won't duplicate rather safely skip that model:

```bash
php artisan smart-api:postman
```

You can specifically tell the artisan command to create specific model's collection using the following command

```bash
php artisan smart-api:postman User
```

## What it Generates

- Model with $fillable properties
- Migration with specified fields (nullable or required)
- Controller with API resource methods: index, show, store, update, destroy
- Routes added automatically in routes/api.php with proper controller import

## Example Generated Controller Store Validation

```php
$request->validate([
    'title' => 'required|string|max:255',
    'body' => 'nullable|string',
    'published_at' => 'nullable|date',
]);
```
## License
This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT)

## Contributing
Feel free to open issues or submit pull requests for improvements!

## Author
Md. Saleh Sadik — GitHub — sadik254@gmail.com

## Important
I am really new to this kind of publishing, any kind of suggesstion is welcome. 