# Dynamic Enum Generator

A Laravel package to automatically generate PHP enums from database columns.  

---

## Installation

```bash
composer require mattyeend/dynamic-enum-generator
```

This package supports Laravel 10, 11, and 12.

Laravel will auto-discover the service provider.

--- 

## Usage

Generate an enum from a specific table and column:
```bash
php artisan enum:generate --table=users --column=status
```

---

## Options

- `--table`: The database table name.
- `--column`: The column name to generate the enum from.
- `--path`: Path where enums are saved (default: `app/Enums`).

---

## Example
Suppose you have a `users` table with a `status` column containing:

- `active`
- `inactive`
- `pending`

Running: 
```bash
php artisan enum:generate --table=users --column=status
```

Generates `app/Enums/Status.php`:
```php
<?php

namespace App\Enums;

enum Status: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case PENDING = 'pending';
}
```

--- 

## Features
- Works with any table and column
- Creates directories automatically if missing
- Generates native PHP 8.1+ enums
- Perfect for status, role, type fields, etc.

--- 

## License
This package is licensed under the MIT License.

---

## Contributing
Feel free to fork the repository and submit pull requests for improvements or new features!