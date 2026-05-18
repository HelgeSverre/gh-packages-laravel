# Laravel FreeBoxPHP package

Project migrated to https://codeberg.org/madpilot78/Laravel-FreeBoxPHP

Package to use FreeBoxPHP library to access you FreeBox/IliadBox from
Laravel apps.

## Install

Using composer:

```sh
composer require madpilot78/Laravel-FreeBoxPHP
```

## Usage

This package provides in laravel a `madpilot78\FreeBoxPHP\Box` class that can be
injected in controllers.

Otherwise it can be instantiated via the [Laravel Service Container](https://laravel.com/docs/11.x/container)
like this:

```php
namespace App\Repositories;

use Illuminate\Support\Facades\App;
use madpilot78\FreeBoxPHP\Box;

class RouterRepository
{
    private Box $box;

    public function __construct()
    {
        $this->box = App::make(Box::class);

        if (empty($this->box->getBoxInfo())) {
            $this->box->discover();
        }
    }

/* ... */

}
```

Refer to [FreeBoxPHP](https://github.com/madpilot78/FreeBoxPHP) for details on how
to use the underlying library.
