# uid-keys

[![Latest Stable Version](https://img.shields.io/github/v/release/brokeyourbike/uid-keys-laravel)](https://github.com/brokeyourbike/uid-keys-laravel/releases)
[![Total Downloads](https://poser.pugx.org/brokeyourbike/uid-keys/downloads)](https://packagist.org/packages/brokeyourbike/uid-keys)
[![codecov](https://codecov.io/gh/brokeyourbike/uid-keys-laravel/graph/badge.svg?token=uoAi4iV0Ab)](https://codecov.io/gh/brokeyourbike/uid-keys-laravel)

A simple drop-in solution for providing UUID and ULID support for the IDs of your Eloquent models. 


## Installation

```bash
composer require brokeyourbike/uid-keys
```

## Usage

```php
use Illuminate\Database\Eloquent\Model;
use BrokeYourBike\UidKeys\Database\Eloquent\Ulid;

class ExampleModel extends Model
{
    use Ulid;

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;
}
```

## Inspiration

Code mainly stolen from the [goldspecdigital/laravel-eloquent-uuid](https://github.com/goldspecdigital/laravel-eloquent-uuid) package.

## Authors

- [Ivan Stasiuk](https://github.com/brokeyourbike) | [Twitter](https://twitter.com/brokeyourbike) | [LinkedIn](https://www.linkedin.com/in/brokeyourbike) | [stasi.uk](https://stasi.uk)

## License

[Mozilla Public License v2.0](https://github.com/brokeyourbike/uid-keys-laravel/blob/main/LICENSE)
