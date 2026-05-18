# Laravel Custom Module Creator

This package provides a robust, modular architecture for Laravel applications. Designed for consistency and maintainability, it allows you to build features in isolation within the `app/Modules` directory.

> **🚀 Zero-Config:** As of v2.0.0, this package automatically handles PSR-4 autoloading, Service Provider registration, and API route discovery. No manual `composer.json` or `app.php` edits are required.

---

## 📋 Requirements

| Requirement | Supported Versions |
| :--- | :--- |
| **PHP** | `^8.2` |
| **Laravel** | `^11.0 \| ^12.0 \| ^13.0` |

---

## 📦 Installation

```shell
composer require jackwander/laravel-module-maker
```

---

## ⚙️ Configuration Reference

To customize the package behavior, publish the configuration file:

```shell
php artisan vendor:publish --tag="config"
```

The configuration file (`config/module-maker.php`) allows you to define where your modules are stored and which base classes they should inherit from.

### 📄 Default Configuration

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Package Paths & Namespaces
    |--------------------------------------------------------------------------
    */
    'paths' => [
        'modules'    => base_path('app/Modules'), // Root folder for modules
        'api_prefix' => 'api/v1',                 // URL prefix for generated routes
    ],

    'namespaces' => [
        'root' => 'App\\Modules',                 // Base namespace for modules
    ],

    /*
    |--------------------------------------------------------------------------
    | Base Classes
    |--------------------------------------------------------------------------
    */
    'base_classes' => [
        'service'        => \Jackwander\ModuleMaker\Base\BaseService::class,
        'api_controller' => \Jackwander\ModuleMaker\Base\BaseApiController::class,
        'model'          => \Jackwander\ModuleMaker\Base\BaseModel::class,
    ]
];
```

### 🛠️ Overriding Options
- **`paths.modules`**: If you prefer a different root folder (e.g., `app/Core`), update this and ensures the `namespaces.root` matches your PSR-4 autoloading.
- **`paths.api_prefix`**: Change the versioning or prefix of your API routes (e.g., `api/v2`).
- **`base_classes`**: This defines the parent classes for your generated Services, Controllers, and Models. We recommend using `php artisan jw:init` to automatically set these up as local bridge classes.

---

## 🏗️ Architecture & Inheritance

To keep your application maintainable and scalable, this package encourages an **Intermediate Base Class** (Bridge) pattern. This allows you to customize global behavior—like custom response formatting or shared business logic—without ever touching the `vendor/` directory.

    The Inheritance Chain
Your generated modules follow this hierarchy:

**`Vendor Base`** ➜ **`App Core`** ➜ **`Module File`**

1.  **Vendor Base:** The raw logic provided by the package inside `ModuleMaker/Base` (Read-only).
2.  **App Core:** Your custom bridge where you add project-specific logic (Editable).
3.  **Module File:** The specific logic for a feature (e.g., `PersonService`).

---

## 🚀 Quick Start: Core Initialization

To take full control of your application's architecture, we recommend initializing a **Core Module**. This generates local base classes in your project that extend the package's internal logic, allowing you to add global methods that every future module will inherit.

```shell
php artisan jw:init
```

### What this does:
1.  **Creates Base Classes:** Generates `BaseModel`, `BaseApiController`, and `BaseService` in `app/Modules/Core/`.
2.  **Localizes Config:** Automatically updates `config/module-maker.php` to point to these new local classes.
3.  **Hierarchy Bridge:** Your local classes extend the vendor classes, giving you the best of both worlds: automatic package updates and full project customization.

### Example: Customizing your Core
Once initialized, you can open `app/Modules/Core/BaseService.php` and add project-wide logic:

```php
<?php

namespace App\Modules\Core;

use Jackwander\ModuleMaker\Base\BaseService as VendorBaseService;

class BaseService extends VendorBaseService 
{
    public function customGlobalLogic()
    {
        // Now every generated service/repository in your project has access to this!
    }
}
```

### Manual Configuration & Stubs (Optional)
If you prefer to manually configure the system or need to edit the generation source:

**Config Publishing:**
```shell
php artisan vendor:publish --provider="Jackwander\ModuleMaker\ModuleServiceProvider" --tag="config"
```

**Stub Customization:**
If you want to fully modify the structure of the generated code, you can publish the Stubs:
```shell
php artisan vendor:publish --provider="Jackwander\ModuleMaker\ModuleServiceProvider" --tag="module-maker-stubs"
```
This will copy standard Laravel `.stub` files into `stubs/vendor/module-maker/`. The package will automatically read these templates before falling back to the defaults.

--- 

## 🛠 Usage

### 1. Creating a New Module
To generate a complete module structure (Folders, Service Providers, and Routes), run:

```shell
php artisan jw:make-module Person
```

### 2. Creating a Model (The Powerhouse Command)
In v2.0.0, the `jw:make-model` command is the most efficient way to build your feature. I have updated it to support standard Laravel-style flags so you can generate the entire stack at once:

```shell
# Generate Model + Migration + Service + Controller + Routes
php artisan jw:make-model CivilStatus --module=Person -a

# Or use specific flags:
php artisan jw:make-model CivilStatus --module=Person -m -s -c
```
Available Flags:

- `-m `| `--migration` : Generate a Migration file.
- `-s` | `--service` : Generate a Service class.
- `-c` | `--controller` : Generate a Controller.
- `-a` | `--all` : Generate All (Full Stack).

### 3. Individual Component Generation
If you need to add a single component to an existing module, you can use these granular commands:

---

#### Migration
```shell
php artisan jw:make-migration insert_status_column --module=Person --table=persons
```
---

#### Seeder
To generate a new seeder for a specific module, use the `jw:make-seeder` command. The package automatically singularizes the name and appends the `Seeder` suffix for you.

```shell
php artisan jw:make-seeder Status --module=Person
```
What happens next?

**File Creation:** A new seeder is created at `app/Modules/Person/Database/Seeders/StatusSeeder.php`.

**Smart Output:** The terminal will provide a `ready-to-copy` snippet so you can register it instantly.

### Why use modular seeders?
> By keeping seeders inside the module, you ensure that your features are completely portable. If you move the Person module to a different project, your data-seeding logic goes with it.

---

### 🧪 Factory Generation
Modular factories require an explicit `$model` property because they live outside the default Laravel namespace. Use the `jw:make-factory` command to generate one:

```shell
php artisan jw:make-factory Person --module=Person
```

### Connecting the Factory to your Model
 If the convention do not apply automatically to your particular application or factory, you may add the `UseFactory` attribute to the model to manually specify the model's factory.

---

### ✨ Domain-Driven Generation Commands (v2.5.0+)
Beyond the basics, this package provides a massive suite of commands to build out complete domain-driven architectures completely isolated within your modules.

#### API Resource
```shell
php artisan jw:make-resource CivilStatus --module=Person
```
*(Tip: The `--all` flag on `jw:make-model` will automatically generate and inject this into your Base Controller!)*

#### Form Requests (Validation)
```shell
php artisan jw:make-request StorePerson --module=Person
```

#### Queued Jobs
```shell
php artisan jw:make-job ProcessImport --module=Person
```

#### Events & Listeners
```shell
php artisan jw:make-event PersonCreated --module=Person
php artisan jw:make-listener SendWelcomeEmail --module=Person
```

#### Policies & Authorization
```shell
php artisan jw:make-policy Person --module=Person
```

#### Custom Validation Rules
```shell
php artisan jw:make-rule ValidPhoneNumber --module=Person
```

#### Model Observers
```shell
php artisan jw:make-observer Person --module=Person
```

---

#### Controller
```shell
php artisan jw:make-controller CivilStatus --module=Person
```

#### Service
```shell
php artisan jw:make-service CivilStatus --module=Person
```

### ✅ System Verification
I have included a health-check command to ensure your environment is correctly configured and that all modules are being detected by the system:
```shell
php artisan jw:check
```

### 📂 Folder Structure
Generated modules seamlessly follow a strict, PSR-4 compliant Domain-Driven structure automatically:

```text
app/Modules/
└── Person/
    ├── Controllers/         # Module-specific Controllers
    ├── Events/              # Event dispatchers (v2.5.0+)
    ├── Jobs/                # Queued Background Jobs (v2.5.0+)
    ├── Listeners/           # Event Listeners (v2.5.0+)
    ├── Models/              # Eloquent Models
    ├── Observers/           # Model Observers (v2.5.0+)
    ├── Policies/            # Authorization Policies (v2.5.0+)
    ├── Providers/           # Module Service Provider (Auto-registered)
    ├── Requests/            # Form Validation Requests (v2.5.0+)
    ├── Resources/           # API JSON Resources (v2.4.0+)
    ├── Rules/               # Custom Validation Rules (v2.5.0+)
    ├── Services/            # Business Logic / Service Layer
    ├── Database/
    │   ├── Factories/       # Model Factories
    │   ├── Migrations/      # Module-specific Migrations
    │   └── Seeders/         # Database Seeders
    └── Routes/
        └── api.php          # Module API Routes (Prefix: api/v1/person)
```
