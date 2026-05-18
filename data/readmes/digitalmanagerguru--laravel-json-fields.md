# Laravel Json Fields (Laravel Package)
[![GitHub tag](https://img.shields.io/github/tag/digitalmanagerguru/laravel-json-fields?include_prereleases=&sort=semver&color=blue)](https://github.com/digitalmanagerguru/laravel-json-fields/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![issues - laravel-json-fields](https://img.shields.io/github/issues/digitalmanagerguru/laravel-json-fields)](https://github.com/digitalmanagerguru/laravel-json-fields/issues)

Laravel JSON Fieds is simple and clean way to work with Eloquent JSON Fieds with Dot Notation.

## Version Compatibility

| Laravel       | Laravel JSON Fields                                 |
| :------------ | :-------------------------------------------------- |
| 13.x          | [3.x]                                               |
| 12.x          | [2.x]                                               |
| 10.x, 11.X    | [1.x]                                               |

## Installation

To install, run `composer require digitalmanagerguru/laravel-json-fields`.

## What does it support?
- Check if a key exists
- Check if the field is empty
- Check if a key contains a value
- Get a value from a key
- Set a value in a key
- Merge two arrays in a key
- Delete values from a key
- Get all the content from the field decoded as an associative array
- Set all the content from and encoded associative array as JSON
- Get the JSON field name
- Add a log entry to the field

## Usage
### Importing
On a Laravel Eloquent Model import the PHP Interface `Digitalmanagerguru\LaravelJsonFields\Contracts\HasJsonField` then import the PHP Trait `Digitalmanagerguru\LaravelJsonFields\Traits\HasJsonFieldTrait`, like:

```
...
use Digitalmanagerguru\LaravelJsonFields\Contracts\HasJsonField;
use Digitalmanagerguru\LaravelJsonFields\Traits\HasJsonFieldTrait;

class User extends Authenticatable implements HasJsonField
{
    use HasJsonFieldTrait;

    ...
}
```

### Changing the default field name
By default it maps a field called `metadata`, it can be changed by declaring an attribute called `$jsonField` like:
```
class ... implements HasJsonField
{
    use HasJsonFieldTrait;

    ...
    protected $jsonField = 'settings';

    ...
    
}
```

### Methods Usage
#### Check if a key exists (`hasJsonKey($value)`)
`$user->hasJsonKey("addresses") //boolean`

#### Check if the field is empty (`hasJsonField()`)
`$user->hasJsonField() //boolean`

#### Check if a key contains a value (`isEmptyJsonKeyValue($key)`)
`$user->isEmptyJsonKeyValue("addresses.default") //boolean`

#### Get a value from a key (`getJsonKeyValue($key, $default = null)`)
`$user->getJsonKeyValue("addresses.default", []) //any`

#### Set a value in a key (`setJsonKeyValue($key, $value)`)
`$user->setJsonKeyValue("addresses.default", ["street" => "...."]) //void`

#### Merge two arrays in a key (`mergeJsonKeyValue($key, array $value)`)
`$user->mergeJsonKeyValue("addresses", ["default" => [...]]) //void`

#### Delete values from a key (`forgetJsonKey($key)`)
`$user->forgetJsonKey("addresses") //void`
or
`$user->forgetJsonKey(["addresses", "is_active"]) //void`

#### Keep values from a key, delete others (`onlyJsonKey($key)`)
`$user->onlyJsonKey("addresses") //void`
or
`$user->onlyJsonKey(["addresses", "is_active"]) //void`

#### Get all the content from the field decoded as an associative array (`getJsonFieldValue()`)
`$user->getJsonFieldValue() //array`

#### Set all the content from and encoded associative array as JSON (`setJsonFieldValue(array $value)`)
`$user->setJsonFieldValue([...]) //void`

#### Get the JSON field name (`getJsonFieldName()`)
`$user->getJsonFieldName() //string`

#### Add a log entry to the field (`addLog($value)`)
`$user->addLog("Changed the is_active status") //string`

## License
Laravel JSON Fields is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).

## Contributing
Please report any issue you find in the issues page. Pull requests are more than welcome.
