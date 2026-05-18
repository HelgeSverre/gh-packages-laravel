# Davinet/Artisan-commands

This package provides a set of new artisan commands for Laravel

## Installation

Use the package manager [composer](https://getcomposer.org/) to install dannyvilla/artisan-commands

```bash
composer require dannyvilla/artisan-commands
```

### Configuration

Publish the package config when you want to change where models are discovered or where TypeScript definitions are written:

```bash
php artisan vendor:publish --provider="Davinet\ArtisanCommand\ArtisanCommandServiceProvider"
```

This creates `config/artisan-commands.php` in your application. The relevant options are:

```php
return [
    'models_path' => 'app/Models/',

    'transform' => [
        'type' => 'interface',
        'output' => 'resouces/js/types',
    ],
];
```

- `models_path` tells the package where your Eloquent models live. Change it if your application keeps models outside `app/Models`.
- `transform.type` controls the generated TypeScript declaration style. Use `interface` to generate `export interface IUser { ... }`, or `type` to generate `export type IUser = { ... }`.
- `transform.output` controls the output folder, relative to the application base path. Change it to match your frontend structure, such as `resources/js/types` or `resources/ts/generated`.

## Usage

### Model annotate command
Add generated PHPDoc annotations to Eloquent models from database columns and typed relation methods.

```bash
php artisan model:annotate
```

Annotate one model by basename, fully qualified class, or configured model path:

```bash
php artisan model:annotate User
php artisan model:annotate App\\Models\\User
```

Preview changes without writing files:

```bash
php artisan model:annotate --dry-run
```

The command scans `artisan-commands.models_path`, inspects each model table, and writes a generated section inside the model class PHPDoc:

```php
/**
 * @generated model annotations
 * @property int $id
 * @property string $email
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $posts
 * @property-read \App\Models\Profile|null $profile
 * @end-generated model annotations
 */
class User extends Model
{
}
```

On later runs, only the generated section between the markers is replaced, so your handwritten class documentation is kept. Relation annotations are generated from public, parameterless model methods with an Eloquent relation return type, such as `posts(): HasMany` or `profile(): HasOne`.

### TypeScript transform command
Transform PHP classes, models, resources, and enums marked with the `TypeScriptTransform` attribute into TypeScript definitions.

```bash
php artisan typescript:transform
```

Definitions are written to `resouces/js/types/index.d.ts` by default. Publish the config to change `transform.type` to `interface` or `type`, and `transform.output` to another output folder.

Only PHP types marked with `#[TypeScriptTransform]` are transformed. The command scans your application classes, reflects each marked type, and writes one TypeScript definition file. Related transformed types can also be included when they are referenced by model relations, resource responses, or typed properties.

The command supports four kinds of PHP types:

- **Plain PHP classes:** public non-static properties are mapped to TypeScript properties.
- **Eloquent models:** database columns are mapped first, including their database type and nullability. Relation methods such as `profile(): HasOne` are added as optional nested properties. If database inspection is not possible, the command falls back to `@property` annotations, then `$fillable`, then public properties.
- **JSON resources:** the TypeScript shape is inferred from the array returned by `toArray()`, not from the resource class properties.
- **Enums:** enum cases become a TypeScript `const` object and a value-union type.

#### Classes and models

```php
use Davinet\ArtisanCommand\Attributes\TypeScriptTransform;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[TypeScriptTransform]
class User extends Model
{
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }
}
```

For a model, the command inspects the model table and maps each column:

- numeric columns become `number`
- boolean columns become `boolean`
- date, time, text, uuid, enum, and string columns become `string`
- JSON and array columns become `Record<string, any>`
- nullable database columns become optional TypeScript properties
- non-null database columns, like most IDs, become required TypeScript properties

Typed Eloquent relation methods are included too. For example, `profile(): HasOne` adds `profile?: IProfile`, while `posts(): HasMany` adds `posts?: IPost[]`.

If the database cannot be inspected, model properties are resolved in this fallback order:

1. `@property`, `@property-read`, and `@property-write` annotations
2. `$fillable` fields
3. public non-static class properties

#### Resources

Resources are transformed from their `toArray()` response instead of their class properties.

```php
use Davinet\ArtisanCommand\Attributes\TypeScriptTransform;
use Illuminate\Http\Resources\Json\JsonResource;

#[TypeScriptTransform]
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
        ];
    }
}
```

For a resource, the command creates a sample backing model when it can infer one from the resource name, such as `UserResource` to `User`. It then calls `toArray()` and maps the returned keys and values to TypeScript. Nested arrays become inline object types, nested resources become their own transformed types, and resource collections become arrays of the collected resource type.

#### Enums

```php
use Davinet\ArtisanCommand\Attributes\TypeScriptTransform;

#[TypeScriptTransform]
enum UserRole: string
{
    case ADMIN = 'admin';
    case USER = 'user';
}
```

This generates:

```ts
export const UserRoles = { ADMIN: 'admin', USER: 'user' } as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
```

For an enum, the exported const preserves the original PHP case names and backed values. The exported type is the union of the const values, so `UserRole` is equivalent to `'admin' | 'user'`.

### Repository command
Generate an empty repository file:

```bash
php artisan make:repository UserRepository
```

Generate a repository for a model:

```bash
php artisan make:repository UserRepository --model=User
```

You may also pass a fully qualified model class:

```bash
php artisan make:repository UserRepository --model=App\Models\User
```

### Service command
Generate a service class:

```bash
php artisan make:service PayPalPaymentService
```

Generate a service class with a repository dependency:

```bash
php artisan make:service UserService UserRepository
```

### View command
Generate an empty view:

```bash
php artisan make:view folder.subfolder.view
```

Generate a view with a layout:

```bash
php artisan make:view folder.subfolder.view --layout=app
```

### Lang command
Generate a new locale file:

```bash
php artisan make:lang myFilename --locale=es
```

Generate a new JSON locale file:

```bash
php artisan make:lang --locale=es --json
```

### Class command
Generate a class:

```bash
php artisan make:class App\Handlers\UserHandlers
```

You can use a dot (`.`) as separator:

```bash
php artisan make:class App.Handlers.UserHandlers --separator=.
```

Generate a trait:

```bash
php artisan make:class App\Traits\MyTrait --kind=trait
```

Generate an interface:

```bash
php artisan make:class App\Contracts\IClassable --kind=interface
```

### File command
Generate a generic file:

```bash
php artisan make:file folder.subfolder1.subfolder2.filename --ext=php
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
