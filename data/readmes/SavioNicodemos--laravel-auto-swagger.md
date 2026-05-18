# Laravel Auto Swagger Docs

Simple to use OAS3 compatible documentation generator.  
Also includes Swagger UI.

## About

This package is heavily inspired by the [Mezatsong/laravel-swagger-docs](https://github.com/Mezatsong/laravel-swagger-docs).

The set of functions that this package has are included:

1. OAS3 support (with constant verifications to ensure syntax and compatibility)
1. Custom decorators
1. Custom responses with support for multiple content types per status code
1. Custom Schemas with `@Schema` and `@Property` annotations
1. Custom Schema builders
1. Automatic Parameters generation based on path and Form Request classes
1. Inclusion of Swagger UI with option to select between different UI drivers
1. Automatic Schema generation from Eloquent Models or custom Schema classes
1. Generate operation tags based on route prefix or controller name
1. Developer warnings for undefined tags and unreferenced custom schemas

## Installation

### Install package through composer

```shell
composer require savionicodemos/laravel-auto-swagger --dev
```

### Publish configuration files and views

```shell
php artisan vendor:publish --provider "AutoSwagger\Docs\SwaggerServiceProvider"
```

### Edit the `swagger.php` configuration file for your liking

## Usage

Laravel Auto Swagger Docs works based on recommended practices by Laravel. It will parse your routes and generate a path object for each one. If you inject Form Request classes in your controller's actions as request validation, it will also generate the parameters for each request that has them. For the parameters, it will take into account whether the request is a GET/HEAD/DELETE or a POST/PUT/PATCH request and make its best guess as to the type of parameter object it should generate. It will also generate the path parameters if your route contains them. Finally, this package will also scan any documentation you have in your action methods and add it as summary and description to that path, along with any appropriate annotations such as `@deprecated`.

### Command line

Generating the swagger documentation is easy, simply run `php artisan swagger:generate` in your project root. The output of the command will be stored in your storage path linked in the config file.

If you wish to generate docs for a subset of your routes, you can pass a filter using `--filter`, for example: `php artisan swagger:generate --filter="/api"`

You can also configure your `swagger.php` file to always regenerate when accessing Swagger UI, or by adding this line in your `.env`: `SWAGGER_GENERATE_ALWAYS=true`

By default, the package prints documentation in JSON format. If you want YAML format, override it using the `--format` flag. Make sure to have the yaml extension installed if you choose to do so.

Format options are:

- `json`
- `yaml`

> [!NOTE]
> During generation the command will print yellow warnings in the terminal for any issues found (such as undefined tags or unreferenced schemas). These are also written to the Laravel log. See the [Developer Warnings](#developer-warnings) section for details.

---

### Annotations syntax

The annotations are written in the PHPDoc block of your controller methods. The syntax is as follows:

```php
/**
 * @Request({
 *    "summary": "Title of the route",
 *    "description": "This is a longer description for the route which will be visible once the panel is expanded",
 *    "tags": ["Authentication","Users"]
 * })
 */
```

The syntax is basically JSON inside a comment block. Follow the JSON syntax strictly.

---

## @Request() decorator

You can have only one `@Request()` decorator per method.

```php
/**
 * You can also do this — the first line will be used as "summary"
 *
 * Anything after the first blank line counts as "description".
 *
 * @Request({
 *     "summary": "Title of the route",       // <- Overwrites the summary above if provided
 *     "description": "A short description",  // <- Overwrites description above if provided
 *     "tags": ["Authentication","Users"],      // <- Associates this operation with these tag sections
 *     "pathParams": [{                         // <- Overwrites auto-generated path parameter definitions
 *         "name": "user_id",
 *         "type": "string",
 *         "description": "User ID to fetch",
 *     }]
 * })
 */
public function someMethod(Request $request, string $reference) {}
```

### Supported @Request keys

| Key | Type | Description |
| --- | --- | --- |
| `summary` | string | Short title of the operation |
| `description` | string | Longer description (also readable from the plain docblock text) |
| `tags` | string[] | Tags this operation belongs to. If omitted, the tag is inferred from the route prefix or controller name depending on `default_tags_generation_strategy` |
| `operationId` | string | Explicit `operationId` for the operation |
| `pathParams` | object | Override path parameter definitions for the route |

---

## @Response() decorator

You can have multiple `@Response()` decorators on the same method.

```php
/**
 * @Response({
 *     "code": 200,
 *     "description": "Return user model",
 *     "ref": "User"
 * })
 * @Response({
 *     "code": 400,
 *     "description": "Bad Request",
 *     "ref": "APIError[]"
 * })
 * @Response({
 *     "code": "302",
 *     "description": "Redirect"
 * })
 * @Response({
 *     "code": 500,
 *     "description": "Internal Server Error"
 * })
 */
public function someMethod(Request $request) {}
```

### Supported @Response keys

| Key | Type | Description |
| --- | --- | --- |
| `code` | int\|string | **Required.** HTTP status code. Must be the first key. |
| `description` | string | Human-readable description of this response |
| `ref` | string | Reference to a Schema, an array of schemas, or a schema builder. See below. |
| `content_type` | string | Content type for this response. Use for non-JSON responses such as file downloads. |

### `ref` formats

```php
"ref": "User"              // <- Refers to the User schema
"ref": "APIError[]"        // <- Array of APIError schemas
"ref": "#/components/schemas/User"  // <- Full OpenAPI path
"ref": "P(User)"           // <- Schema builder (Laravel Pagination wrapping User)
"ref": "SP(User)"          // <- Schema builder (Laravel SimplePaginate wrapping User)
```

> [!NOTE]
> See all available schema builders or create your own — explore `swagger.schema_builders` in the config.

### Binary / file download responses

Use `content_type` to declare a non-JSON response body (e.g. PDF, CSV, image):

```php
/**
 * @Response({"code": 200, "description": "PDF ticket.", "content_type": "application/pdf"})
 * @Response({"code": 401, "description": "Unauthorized."})
 */
public function download(): Response {}
```

### Multiple content types for the same status code

You can stack multiple `@Response` decorators with the same code to declare several content types. Each adds its own entry under the response without overwriting the others:

```php
/**
 * @Response({"code": 200, "description": "Export result.", "content_type": "application/pdf"})
 * @Response({"code": 200, "content_type": "text/csv"})
 * @Response({"code": 401, "description": "Unauthorized."})
 */
public function export(): Response {}
```

> [!NOTE]
> The `description` is taken from the first `@Response` that declares it for a given code.
> For multiple content types without `content_type`, use `ref` on each to point to different schemas.

---

## Custom Validators (Form Request rules)

These rules are added directly to your Form Request `rules()` array. They are purely for documentation purposes — they do not affect Laravel's validation behaviour (except `swagger_min` and `swagger_max` which optionally can).

> [!NOTE]
> These rules are registered by the package's service provider. There is no extra setup required.

> [!NOTE]
> When a Form Request produces at least one visible parameter, the generated `requestBody` is automatically marked as `required: true` in the spec. If all fields are hidden via `swagger_hidden`, no `requestBody` is emitted at all.

#### swagger_hidden

Completely hides a field (and any of its nested children) from the generated documentation. Useful for internal fields or fields only used for conditional logic.

```php
$rules = [
    'internal_token' => 'swagger_hidden',
    'internal_token.value' => 'string', // also hidden because parent is hidden
];
```

#### swagger_required

Overrides the required status for a parameter in the documentation, independently of the actual Laravel validation rule. Useful when a field is conditionally required at runtime but should always appear as required (or optional) in the docs.

```php
$rules = [
    'limit' => [
        $condition ? 'required' : 'nullable',
        'swagger_required:true',   // always show as required in docs
    ],
    'cursor' => [
        'required',
        'swagger_required:false',  // always show as optional in docs
    ],
];
```

#### swagger_default

Sets the default value shown for the parameter in the documentation.

```php
$rules = [
    'locale' => 'swagger_default:en_GB',
];
```

#### swagger_example

Sets an example value for the parameter in the documentation.

```php
$rules = [
    'currency' => 'swagger_example:EUR',
];
```

> [!NOTE]
> `swagger_default` communicates that the application uses this value when the field is absent.
> `swagger_example` just illustrates how the field should be filled — it has no runtime meaning.

#### swagger_description

Sets the description text for the parameter in the documentation.

```php
$rules = [
    'limit' => 'swagger_description:Maximum number of items to return',
];
```

#### swagger_min

Documents a minimum value. Optionally also enforces it at runtime by appending `:fail`.

```php
$rules = [
    'page' => 'swagger_default:1|swagger_min:1',         // docs only
    'page' => 'swagger_default:1|swagger_min:1:fail',    // docs + enforced
];
```

#### swagger_max

Documents a maximum value. Optionally also enforces it at runtime by appending `:fail`.

```php
$rules = [
    'take' => 'swagger_default:10|swagger_min:1|swagger_max:50',       // docs only
    'take' => 'swagger_default:10|swagger_min:1|swagger_max:50:fail',  // docs + enforced
];
```

### Automatic type inference from Laravel rules

The package reads standard Laravel validation rules to automatically infer OpenAPI types and formats:

| Laravel rule | OpenAPI type | OpenAPI format / keyword |
| --- | --- | --- |
| `integer` | `integer` | — |
| `numeric` | `number` | — |
| `boolean` | `boolean` | — |
| `array` | `array` | — |
| `file`, `image`, `mimes`, `mimetypes` | `string` | `binary` |
| `date` | `string` | `date` |
| `after`, `before`, `after_or_equal`, `before_or_equal` | `string` | `date` |
| `email` | `string` | `email` |
| `uuid` | `string` | `uuid` |
| `url` | `string` | `uri` |
| `ip` | `string` | `ip` |
| `ipv4` | `string` | `ipv4` |
| `ipv6` | `string` | `ipv6` |
| `json` | `string` | `json` |
| `password` | `string` | `password` |
| `nullable` | adds `nullable: true` | — |
| `in:a,b,c` | adds `enum: [a, b, c]` | — |
| `min` / `max` on strings | adds `minLength` / `maxLength` | — |
| `min` / `max` on integers or numbers | adds `minimum` / `maximum` | — |
| `multiple_of:n` on integers or numbers | adds `multipleOf` | — |
| `regex:pattern` | adds `pattern` | — |

---

## Custom Schemas

Custom Schema classes let you define reusable OpenAPI schemas that are not tied to an Eloquent model. They are plain PHP classes with typed properties and optional `@Schema` / `@Property` docblock annotations.

### Setup

Create your schema classes inside the folder configured in `swagger.schemas` (default: `app/Swagger/Schemas`). Each class in that folder (and any subdirectories) is automatically discovered and registered in `components.schemas`.

```php
// app/Swagger/Schemas/Address.php
namespace App\Swagger\Schemas;

class Address
{
    public string  $street;
    public string  $city;
    public ?string $state;
    public string  $zip_code;
    public string  $country;
}
```

The property names become the schema property names. PHP types are automatically mapped to OpenAPI types:

| PHP type | OpenAPI type |
| --- | --- |
| `string` | `string` |
| `int` | `integer` |
| `float` | `number` |
| `bool` | `boolean` |
| `array` | `array` |
| `DateTime`, `DateTimeImmutable`, `DateTimeInterface` | `string` + `format: date-time` |
| `?type` (nullable) | type + `nullable: true` |

#### DateTime auto-inference

When a property's PHP type is `DateTime`, `DateTimeImmutable`, `DateTimeInterface`, or any class that implements `DateTimeInterface` (including Carbon), the package automatically sets `type: string` and `format: date-time` — no annotation needed:

```php
class FlightSchedule
{
    public \DateTime          $scheduled_at;   // → type: string, format: date-time
    public \DateTimeImmutable $completed_at;   // → type: string, format: date-time
    public ?\DateTimeInterface $cancelled_at;  // → type: string, format: date-time, nullable: true
    public ?string            $note;           // → type: string, nullable: true
}
```

#### Static properties as examples

If a property is declared `static` with a default value, that value is used as the `example` in the generated schema:

```php
class FlightSegment
{
    static string $origin_code = 'GRU';        // → example: "GRU"
    static int    $duration_minutes = 390;     // → example: 390
}
```

---

### @Schema annotation

Use `@Schema` on the class to declare which properties are required in the OpenAPI schema. Only fields that exist as properties on the class are included in the `required` array.

```php
/**
 * @Schema({
 *     "required": ["street", "city", "zip_code", "country"]
 * })
 */
class Address
{
    public string  $street;
    public string  $city;
    public ?string $state;
    public string  $zip_code;
    public string  $country;
}
```

---

### @Property annotation

Use `@Property` on individual properties to override or extend the automatically inferred type information.

```php
class FlightSegment
{
    /**
     * @Property({"enum": ["economy", "business", "first"]})
     */
    static string $cabin_class = 'economy';
```

#### Supported @Property keys

| Key | Description |
| --- | --- |
| `type` | Overrides the inferred OpenAPI type (`string`, `integer`, `number`, `boolean`, `array`, `object`) |
| `format` | Sets the OpenAPI format (e.g. `date`, `date-time`, `uuid`, `uri`, `binary`) |
| `description` | Description text for this property |
| `example` | Example value (overrides the static default if present) |
| `nullable` | `true` to mark the property as nullable |
| `enum` | Array of allowed values, e.g. `["active", "inactive"]` |
| `deprecated` | `true` to mark the property as deprecated |
| `arrayOf` | When `type` is `array`, defines the item type, e.g. `"arrayOf": "integer"` |
| `ref` | Reference to another schema. Supports the same formats as `@Response` `ref` |
| `raw` | Injects a raw OpenAPI property object verbatim, bypassing all other inference |

#### @Property `ref` examples

```php
/**
 * @Property({"ref": "FlightDetails"})          // $ref to FlightDetails
 * @Property({"ref": "FlightSegment[]"})         // array of FlightSegments
 * @Property({"ref": "FlightDetails", "nullable": true, "description": "Optional detail"})
 */
```

When both `ref` and `nullable` or `description` are present, the output uses `allOf` to comply with the OpenAPI spec:

```json
{
  "description": "Optional detail",
  "nullable": true,
  "allOf": [{ "$ref": "#/components/schemas/FlightDetails" }]
}
```

#### @Property `raw` — verbatim injection

Use `raw` when you need full control and none of the other keys are sufficient:

```php
/**
 * @Property({"raw": {"type": "string", "format": "uri"}})
 */
static string $booking_url = 'https://example.com';
```

---

### Multiple schemas directories

The `schemas` key in each page config accepts either a single path or an array of paths. This is useful for modularized projects:

```php
// config/swagger.php (inside a page entry)
'schemas' => [
    app_path('Swagger/Schemas'),
    base_path('modules/Orders/Swagger/Schemas'),
    base_path('modules/Auth/Swagger/Schemas'),
],
```

---

## Tags

### Automatic tag generation

Tags are generated automatically based on the `default_tags_generation_strategy` page config:

| Strategy | Behaviour |
| --- | --- |
| `prefix` | Uses the first segment of the route URI (e.g. `/users/profile` → tag `users`) |
| `controller` | Derives the tag from the controller class name (e.g. `UserController` → tag `User`) |
| _(anything else)_ | No tag is added — all operations fall into the default group |

You can always override the auto-generated tag per operation using the `tags` key in `@Request`.

### Declaring global tags

Define global tags in the page config to attach descriptions to each tag group. These appear in Swagger UI's sidebar:

```php
// config/swagger.php (inside a page entry)
'tags' => [
    ['name' => 'Users',           'description' => 'Operations related to users'],
    ['name' => 'Authentication',  'description' => 'Login, logout, and token refresh'],
    ['name' => 'Flights',         'description' => 'Flight search and booking'],
],
```

---

## Developer Warnings

During `swagger:generate`, the package prints warnings to the terminal (in yellow, using Laravel's `$this->warn()`) and to the Laravel log whenever it detects issues worth your attention. Nothing breaks — these are advisory only.

### Undefined tag warning

Fires when an operation uses a tag that is **not declared in the global `tags` array**. Only active when at least one global tag is configured (if `tags` is empty, the check is skipped entirely to avoid noise on unconfigured projects).

```
[AutoSwagger/Docs] Tag 'bookings' is used in an operation but is not defined in the global
tags array. Add it to the 'tags' key in your config/swagger.php to include a description.
```

**Fix:** add the missing tag to the `tags` array in your page config, or remove the `tags` entry from the `@Request` annotation if it was a typo.

### Unreferenced custom schema warning

Fires when a class from your `schemas` folder is generated into `components.schemas` but never referenced by any `$ref` anywhere in the documentation (neither in a path operation response nor in another schema's properties). Eloquent model schemas are excluded from this check — it only applies to classes you explicitly placed in the schemas folder.

```
[AutoSwagger/Docs] Schema 'LegacyPayload' is defined but never referenced in any operation.
Consider removing it or referencing it via @Response or @Property.
```

**Fix:** either delete the unused schema class, or add a `@Response` with `"ref": "LegacyPayload"` to the relevant controller methods.
