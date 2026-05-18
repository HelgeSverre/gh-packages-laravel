# Laravel Enhance Enums

A small Laravel package that adds **translation support** for PHP 8.1+ Enums.

## Installation

Require the package via composer:

```bash
composer require a-sabagh/laravel-enhance-enums
```

## Usage

### 1. Create an Enum

```php
<?php

namespace App\Enums;

use Enhance\Enums\Concerns\Translatable;

enum PostStatus: string
{
    use Translatable;

    case PUBLISH = 'publish';
    case DRAFT   = 'draft';
}
```

### 2. Add Translations

Create a language file in your package or application:

```bash
lang/fa/enums.php
```

```php
<?php

use App\Enums\PostStatus;

return [
    PostStatus::class => [
        'publish' => 'منتشر شده',
        'draft'   => 'پیش نویس',
    ],
];
```

### 3. Call `translate()`

```php
PostStatus::PUBLISH->translate(); // returns "منتشر شده"
PostStatus::DRAFT->translate();   // returns "پیش نویس"
```
