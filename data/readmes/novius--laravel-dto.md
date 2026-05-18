# Laravel DTO

A simple and extensible DTO (Data Transfer Objects) package for Laravel.

This package allows you to define structured data objects with built-in validation, default values, and automatic casting, while supporting both camelCase and snake_case naming conventions.

## Installation

You can install the package via composer:

```bash
composer require novius/laravel-dto
```

## Artisan Command

You can easily generate a new DTO class using the following Artisan command:

```bash
php artisan make:dto UserDto
```

By default, the class will be created in the `app/Dtos` directory.

## Basic Usage

To create a DTO, simply extend the `Novius\LaravelDto\Dto` class and define your properties.

```php
use Novius\LaravelDto\Dto;

/**
 * @property string $name
 * @property int $age
 * @property ?string $email
 *
 * @method string getName()
 * @method self setName(string $name)
 * @method int getAge()
 * @method self setAge(int $age)
 * @method ?string getEmail()
 * @method self setEmail(?string $email)
 */
class UserDto extends Dto
{
    protected string $name;
    protected int $age;
    protected ?string $email;
}

// Instantiation from an array
$dto = new UserDto([
    'name' => 'John Doe',
    'age' => 30,
    'email' => 'john@example.com',
]);

echo $dto->name; // John Doe
```

If you try to pass a property that is not defined in the class, an `InvalidArgumentException` will be thrown.

## Features

### Validation

Override the `rules()` method to define Laravel validation rules for your properties.

```php
protected function rules(): array
{
    return [
        'name' => 'required|string|min:3',
        'age' => 'required|integer|min:18',
        'email' => 'nullable|email',
    ];
}
```

You can also customize validation messages and attributes by overriding the `messages()` and `attributes()` methods:

```php
protected function messages(): array
{
    return [
        'name.min' => 'The :attribute is too short (min :min characters)!',
    ];
}

protected function attributes(): array
{
    return [
        'email' => 'user email address',
    ];
}
```

A `ValidationException` is thrown if the data does not comply with these rules during instantiation or modification via a setter.

### Default Values

Override the `defaults()` method to define default values.

```php
protected function defaults(): array
{
    return [
        'age' => 18,
        'status' => 'active',
    ];
}
```

### Casting

The package supports the same cast types as Laravel's Eloquent models. It also **automatically infers** the cast type from the native PHP type of your properties.

```php
class UserDto extends Dto
{
    protected int $age;           // Automatically cast to int
    protected bool $is_active;    // Automatically cast to bool
    protected Carbon $created_at; // Automatically cast to Carbon
    protected UserStatus $status; // Automatically cast to Backed Enum
    protected AddressDto $address;// Automatically cast to nested DTO
    protected Fluent $metadata;   // Automatically cast to Fluent
}
```

If you need more control, you can still override the `casts()` method. Explicit casts always take precedence over native type inference.

Supported types: `int`, `float`, `string`, `bool`, `array`, `object`, `date`, `datetime`, `immutable_date`, `immutable_datetime`, `decimal:x`, `json`, `encrypted`.

You can also cast properties to [Backed Enums](https://www.php.net/manual/en/language.enumerations.backed.php) or [Fluent](https://laravel.com/api/11.x/Illuminate/Support/Fluent.html) objects:

```php
protected function casts(): array
{
    return [
        'status' => UserStatus::class,
    ];
}
```

You can also specify a custom format for date and datetime casts, which will be used when calling `toArray()`:

```php
protected function casts(): array
{
    return [
        'created_at' => 'datetime:Y-m-d H:i',
        'birth_date' => 'date:d/m/Y',
    ];
}
```

### Magic Getters, Setters and Fluent Interface

You can access your properties via magic methods. Setters automatically apply validation and casting.

```php
$dto->setName('Jane Doe'); // Setter
echo $dto->getName();      // Getter
```

The package also supports a fluent interface (methods with the same name as the property):

```php
$dto->name('Jane Doe');    // Setter (returns $this)
echo $dto->name();         // Getter
```

### CamelCase / Snake_case Support

If your properties are defined in `snake_case` in your class, you can access them in `camelCase` seamlessly.

```php
/**
 * @property string $first_name
 *
 * @method string getFirstName()
 * @method self setFirstName(string $firstName)
 */
class UserDto extends Dto {
    protected string $first_name;
}

$dto = new UserDto(['first_name' => 'John']);

echo $dto->firstName;      // John
echo $dto->getFirstName(); // John
$dto->setFirstName('Jane');
```

### Array Conversion

The `toArray()` method returns all properties (public, protected, or private). It recursively handles nested DTOs.
Dates are formatted according to their cast:
- `Y-m-d` for `date` and `immutable_date`
- `Y-m-d H:i:s` for `datetime` and `immutable_datetime` (MySQL format)

### Property Mapping

You can map property names to different keys when converting the DTO to an array using the `#[Map]` attribute or the `map()` method.

The `map()` method takes precedence over the attribute.

```php
use Novius\LaravelDto\Dto;
use Novius\LaravelDto\Attributes\Map;

class UserDto extends Dto
{
    #[Map('dt-debut')]
    protected string $date_begin;

    protected string $date_end;

    protected function map(): array
    {
        return [
            'date_end' => 'dt-fin',
        ];
    }
}
```

### Configuration via Attributes

In addition to methods, you can use PHP attributes to configure your properties directly.

#### Validation Rules

Use the `#[Rules]` attribute to define validation rules.

```php
use Novius\LaravelDto\Attributes\Rules;

class UserDto extends Dto
{
    #[Rules('required|string|min:3')]
    protected string $name;
}
```

#### Default Values

Use the `#[DefaultValue]` attribute to define default values.

```php
use Novius\LaravelDto\Attributes\DefaultValue;

class UserDto extends Dto
{
    #[DefaultValue(18)]
    protected int $age;
}
```

#### Custom Casting

Use the `#[Cast]` attribute to define a custom cast type.

```php
use Novius\LaravelDto\Attributes\Cast;

class UserDto extends Dto
{
    #[Cast('bool')]
    protected $is_admin;

    #[Cast('datetime:Y-m-d H:i')]
    protected Carbon $created_at;
}
```

**Note:** Methods (`rules()`, `defaults()`, `casts()`) always take precedence over attributes.

### Excluding Properties from DTO Mechanisms

You can use the `#[ExcludeFromDTO]` attribute to completely exclude a property from all DTO mechanisms (constructor instantiation, magic getters/setters, fluent interface, validation, and `toArray()` output).

This is useful for properties that you want to keep in the class for internal use only, without them being part of the Data Transfer Object's public data flow.

```php
use Novius\LaravelDto\Dto;
use Novius\LaravelDto\Attributes\ExcludeFromDTO;

class UserDto extends Dto
{
    protected string $name;

    #[ExcludeFromDTO]
    protected string $internal_token;
}

// This will throw an InvalidArgumentException because internal_token is excluded
$dto = new UserDto(['name' => 'John', 'internal_token' => 'secret']);

// This is also forbidden
$dto = new UserDto(['name' => 'John']);
$dto->internal_token = 'secret'; // Throws InvalidArgumentException
```

Excluded properties are not present in the array representation:

```php
$dto = new UserDto(['name' => 'John']);
print_r($dto->toArray());
// Output: ['name' => 'John']
```

## Testing

The package uses [Pest](https://pestphp.com/) for testing.

```bash
composer test
```

## Static Analysis

```bash
composer analyze
```

## License

This project is licensed under the AGPL-3.0-or-later License.
