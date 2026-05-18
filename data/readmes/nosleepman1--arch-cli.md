# laravel-arch-cli

A Laravel Artisan command that scaffolds a complete backend module in one shot — model, migration, service, versioned API controller, form requests, policy, events, listeners, notifications, and API resource.

## Requirements

- PHP 8.1+
- Laravel 10, 11, 12, or 13

## Installation

```bash
composer require nosleepman/laravel-arch-cli
```

Laravel's package auto-discovery registers the service provider automatically. No manual configuration needed.

## Usage

```bash
php artisan arch:module <ModelName>
```

The command will ask a few questions interactively, then generate everything.

**Example session:**

```
php artisan arch:module Project

Model name [Project]: Project
Enter fields (name:type, press Enter for each, empty line to finish):
  Field: title:string
  Field: description:text:nullable
  Field: status:string
  Field:
Controller version [v1]: v1
Include policies? [yes]: yes
Include events? [no]: yes
```

## What gets generated

| File | Location |
|------|----------|
| Model with `$fillable` | `app/Models/ProjectModel.php` |
| Migration with columns | `database/migrations/..._create_projects_table.php` |
| Service layer | `app/Services/ProjectService.php` |
| API Controller | `app/Http/Controllers/API/V1/ProjectController.php` |
| Store request | `app/Http/Requests/Project/StoreProjectRequest.php` |
| Update request | `app/Http/Requests/Project/UpdateProjectRequest.php` |
| Policy | `app/Policies/ProjectPolicy.php` |
| Event (if enabled) | `app/Events/ProjectCreated.php` |
| Listener (if enabled) | `app/Listeners/ProjectCreatedListener.php` |
| Notification (if enabled) | `app/Notifications/ProjectCreatedNotification.php` |
| API Resource | `app/Http/Resources/ProjectResource.php` |

## Field syntax

Fields are entered as `name:type` or `name:type:modifier`.

```
title:string
body:text:nullable
price:integer
email:string:unique
is_active:boolean
```

Supported types: `string`, `text`, `integer`, `boolean`, `email`  
Supported modifiers: `nullable`, `unique`

The migration columns and form request validation rules are generated from this input automatically.

## Architecture overview

```
src/
├── ArchCLIServiceProvider.php         # Registers the command
├── Console/Commands/
│   └── GenerateModuleCommand.php      # CLI entry point, orchestrates generators
├── Generators/
│   ├── ModelGenerator.php             # Calls make:model, injects $fillable
│   ├── MigrationGenerator.php         # Calls make:migration, injects columns
│   ├── ControllerGenerator.php        # Calls make:controller --api, moves to API/V1/, injects service calls
│   ├── RequestGenerator.php           # Calls make:request ×2, injects validation rules
│   ├── ServiceGenerator.php           # Writes from Service.stub
│   ├── PolicyGenerator.php            # Calls make:policy --model
│   ├── EventGenerator.php             # Writes from Event.stub
│   ├── ListenerGenerator.php          # Writes from Listener.stub
│   ├── NotificationGenerator.php      # Writes from Notification.stub
│   └── ResourceGenerator.php          # Writes from Resource.stub
└── Stubs/
    ├── Service.stub
    ├── Event.stub
    ├── Listener.stub
    ├── Notification.stub
    └── Resource.stub
```

**Two types of generators:**
- *Artisan wrappers* (`Model`, `Migration`, `Controller`, `Request`, `Policy`) — call native Laravel `make:*` commands, then modify the generated file.
- *Stub-based* (`Service`, `Event`, `Listener`, `Notification`, `Resource`) — read a `.stub` template, replace `{{class}}` / `{{model}}` placeholders, and write the result.

## After generation

Register the new routes in your API route file:

```php
// routes/api.php
use App\Http\Controllers\API\V1\ProjectController;

Route::apiResource('projects', ProjectController::class);
```

If you enabled policies, register them in `AuthServiceProvider` (Laravel 10) or directly in the controller using `$this->authorizeResource()`.

If you enabled events, register the listener in `EventServiceProvider`:

```php
protected $listen = [
    \App\Events\ProjectCreated::class => [
        \App\Listeners\ProjectCreatedListener::class,
    ],
];
```

The generated `ProjectCreatedListener` implements `ShouldQueue` — make sure a queue worker is running, or change the interface if you want synchronous handling.

## Known limitations

- Pluralisation is naive (`name . 's'`). Names like `Category` will produce `categorys` in the migration table name. Rename the migration manually in that case.
- The `--full` flag is accepted but currently has no effect — all optional components are already controlled by the interactive prompts.
- The generated service dispatches a `Created` event unconditionally. If you chose not to generate events, remove that line from the service manually.

## Contributing

1. Fork the repo and create a feature branch.
2. Add or update a generator in `src/Generators/`.
3. If adding a stub-based generator, add the corresponding `.stub` file in `src/Stubs/`.
4. Run the tests: `composer test`

## License

MIT — see [LICENSE](LICENSE).
