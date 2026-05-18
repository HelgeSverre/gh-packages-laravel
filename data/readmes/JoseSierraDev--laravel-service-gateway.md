# laravel-service-gateway
LaravelServiceGateway is a package that simplifies the creation of Service and Gateway layers in your Laravel projects. It provides custom Artisan commands to generate these layers quickly, ensuring a clean architecture for the logic of your application.

## Features

- **Create Services**: Generate service classes for handling business logic.
- **Create Gateways**: Generate gateway classes for external API integrations or other external services.
- **Create Models with Service and Gateway**: Automatically generate a model with corresponding service and gateway classes.

## Installation

To install the package, run the following command:

```bash
composer require josesierradev/laravel-service-gateway
```

## ⚙ Usage

After installation, you can use the following Artisan commands:

### Create a Service

To generate a service, use the following command:

```bash
php artisan make:service {ServiceName}
```
This will create a service class in the app/Services directory.

### Create a Gateway

To generate a gateway, use the following command:

```bash
php artisan make:gateway {GatewayName}
```
This will create a gateway class in the app/Gateways directory.

### Create a Model, Service, and Gateway



You can use the extended `make:model` command as usual, but now with the following options:

- `--service` or `-S`: Generate a Service class.
- `--gateway` or `-g`: Generate a Gateway class.
- `--sg` or `--gs`: Generate both Service and Gateway classes.

These can be combined with standard model options like:

- `-m`: Migration
- `-c`: Controller
- `-s`: Seeder
- `-f`: Factory

### Example

```bash
php artisan make:model Product -mcfs -Sg
```

This will create:
- The `Product` model
- A migration file
- A controller
- A factory
- A seeder
- A service class: `App\Services\ProductService`
- A gateway class: `App\Gateways\ProductGateway`

> ⚠ Note: If the model already exists, the service and gateway will not be created.

# Validators

### `make:validator` Command

The `make:validator` command generates a new Validator class, optionally linked to a Laravel Eloquent model for automatic rule generation. You can also choose to generate a Laravel FormRequest class that uses this validator.

## Usage

```bash
php artisan make:validator UserValidator
```

### With Model-Based Rule Generation

```bash
php artisan make:validator UserValidator --model=User
```

This will create a validator using the schema (if available) or model `$fillable` and `$casts` as fallback.

### With FormRequest

```bash
php artisan make:validator UserValidator --formRequest
```

Also generates a `UserValidatorRequest` FormRequest and links its `rules()` method to use the `UserValidator::rules()`.

### With Both

```bash
php artisan make:validator UserValidator --model=User --formRequest
```

## Rule Generation Strategy

1. **Using Schema (default)**: The command attempts to load the table structure from the database using Laravel Schema and Doctrine to infer column types, nullability, foreign keys, and unique constraints.
2. **Fallback to `$fillable`**: If the table does not exist in the schema, it warns the developer and uses the `$fillable` and `$casts` from the model to generate basic rules.

## Examples

```php
public static function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'max:255', 'unique:users,email'],
        'age' => ['nullable', 'integer'],
        'is_active' => ['required', 'boolean'],
        'created_by' => ['exists:users,id']
    ];
}
```

## Notes

- The command supports foreign key validation using the `exists:` rule if the schema is available.
- Supports types: `string`, `integer`, `boolean`, `numeric`, `date`, `array` based on the schema or casts.

## Options

| Option         | Shortcut | Description                                               |
|----------------|----------|-----------------------------------------------------------|
| `--model=Model`| `-m`     | Generate validation rules based on the model class        |
| `--formRequest`| `-f`     | Also create a FormRequest class using this validator      |

## Output

The validator will be created in the `App\Validators` namespace unless otherwise configured.

If `--formRequest` is passed, a file will also be created in `App\Http\Requests` and will use the validator rules.

---


Made with ❤️ by [JoseSierraDev](https://github.com/JoseSierraDev)


