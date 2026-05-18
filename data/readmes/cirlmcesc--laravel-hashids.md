# Laravel Hashids

[![Latest Stable Version](http://poser.pugx.org/cirlmcesc/laravel-hashids/v)](https://packagist.org/packages/cirlmcesc/laravel-hashids) [![Total Downloads](http://poser.pugx.org/cirlmcesc/laravel-hashids/downloads)](https://packagist.org/packages/cirlmcesc/laravel-hashids) [![License](http://poser.pugx.org/cirlmcesc/laravel-hashids/license)](https://packagist.org/packages/cirlmcesc/laravel-hashids) [![PHP Version Require](http://poser.pugx.org/cirlmcesc/laravel-hashids/require/php)](https://packagist.org/packages/cirlmcesc/laravel-hashids)

---

## TL;DR

Do not explicitly display the ID of the data in the interface or URI. Use the Trail on the Model to automatically encrypt the ID, and at the same time, it will correctly decrypt the instance of the class you want to inject into the route. It also provides quick methods to encrypt and decrypt the ID when you need. It provides some commands for testing. Inspired by [vinkla/hashids](https://github.com/vinkla/hashids).

---

## Getting started

**Install via composer**

Require this package, with Composer, in the root directory of your project.

```bash
composer require cirlmcesc/laravel-hashids
```

**Configuration file**

Artisan command will be published to `config/`. The mode of operation can be customized by modifying parameters and attributes.

```shell
php artisan hashids:install
```

---

## Usage

**Use on Model**

Use Model trait, you can use it quickly. Using trait on the model, you can quickly use it to automatically encrypt the ID when the model is serialized and the value of the field set by ```$_only_need_encode_fields```. It is also possible to not set this property and all fields ends with ```_id``` will be automatically encrypted.You can choose to set the ```$_doesnt_need_encode_fields``` property to prevent these fields from being encrypted. However, ``` $_only_need_encode_fields ``` and ``` $_doesnt_need_encode_fields ``` are mutually exclusive. If both are set, an exception will be thrown when the model is serialized into an array. Of course, you can also choose to set the ```$_only_encode_id``` property to determine whether to encrypt only the ID field. If additional fields need to be encrypted and the field does not end with ```_id```, then it is necessary to set ```$_only ined_encode_fields``` to all fields ending with ```_id``` plus the fields that require additional encryption Only in this way can it work properly.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Cirlmcesc\LaravelHashids\Traits\Hashidsable;

class Foo extends Model
{
    use Hashidsable;

    /**
     * Encrypt the list of other fields that 
     * need to be encrypted while encrypting the ID.
     *
     * @var bool
     */
    public $_only_encode_id = false;

    /**
     * When encrypting an ID, you can choose to
     * Only encrypt which fields.
     * You can also set some fields with suffixes 
     * other than `_id`, but they must be of type `int`.
     *
     * @var array<string>
     */
    public $_only_need_encode_fields = [
        'aaa',
        'bbb',
        'ccc_id',
        'ddd_id',
    ];

    /**
     * While encrypting the ID, you can choose 
     * which fields do not encryption,
     * Only applicable to fields with suffix 'id'.
     *
     * @var array<string>
     */
    public $_doesnt_need_encode_fields = [
        'xxx_id',
        'yyy_id',
        'zzz_id',
    ];
}
```

**Use on Route**

When injecting the model ID into routing or controller operations, it will automatically decode the ID. No additional action is required.

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Models\Foo;

Route::get('/foos/{foo}', fn(Foo $foo) => $foo);

```

**Use on Resource Class**

When you use resource classes, model serialization does not go through Model Trait, so you need to encrypt the ID in the ```toArray``` method of the resource class.The usage ```hashids_encode_in_array``` method allows for batch encryption of ID fields.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FooResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return hashids_encode_in_array([
            'id' => $this->id,
            'foo' => $this->foo,
            'app_id' => $this->app_id,
            'banana_id' => $this->banana_id,
        ]);
    }
}

```

**Use functions elsewhere**

Quickly encrypt and decrypt. Some functions are provided.

```php
<?php

/**
 * encode id
 *
 * @param int $id
 * @return string
 */
function hashids_encode(int $id): string;

/**
 *  decode id
 *
 * @param string $id
 * @param int $remedy 
 * @return int
 */
function hashids_decode(string $id, int $remedy = 0): int;

 /**
 * encode ids in array
 *
 * @param array $data
 * @param array $dosent_encode_keys
 * @param string $suffix
 * @return array
 */
function hashids_encode_in_array(array $data, array $dosent_encode_keys = [], string $suffix = '_id'): array;

/**
 * decode ids in array
 *
 * @param array $data
 * @param array $dosent_decode_keys
 * @param string $suffix
 * @return array
 */
function hashids_decode_in_array(array $data, array $dosent_decode_keys = [], string $suffix = '_id'): array;

```

**Test command**
Artisan command can use encryption and decryption on the command line.

```shell
php artisan hashids:test
```
