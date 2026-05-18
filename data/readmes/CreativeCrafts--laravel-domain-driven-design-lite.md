[![Latest Version on Packagist](https://img.shields.io/packagist/v/creativecrafts/laravel-domain-driven-design-lite.svg?style=flat-square)](https://packagist.org/packages/creativecrafts/laravel-domain-driven-design-lite)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/creativecrafts/laravel-domain-driven-design-lite/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/creativecrafts/laravel-domain-driven-design-lite/actions?query=workflow%3ACI+branch%3Amain)
[![Code Style](https://img.shields.io/badge/code%20style-pint-blue?style=flat-square)](https://github.com/creativecrafts/laravel-domain-driven-design-lite/actions/workflows/pint-autofix.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/creativecrafts/laravel-domain-driven-design-lite.svg?style=flat-square)](https://packagist.org/packages/creativecrafts/laravel-domain-driven-design-lite)

> Pragmatic, Laravel-native **DDD modules** with generators, safety rails, and CI helpers – without drowning you in ceremony.

---

## ✅ Quick Start (60s)

```bash
composer require creativecrafts/laravel-domain-driven-design-lite --dev
php artisan ddd-lite:module Planner
php artisan ddd-lite:make:dto Planner CreateTripData --props="id:Ulid|nullable,title:string"
php artisan ddd-lite:publish:quality --target=all
```

---

## 📚 Contents

- [Start Here](#start-here)
- [What is DDD‑Lite?](#what-is-ddd-lite)
- [Architecture Overview](#architecture-overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Provider & Publishing](#provider--publishing)
- [Getting Started (QuickStart)](#getting-started-quickstart)
- [Command Reference](#command-reference)
- [Project Initialization](#project-initialization)
- [Enforcing Strict Architecture with Deptrac + PHPStan](#enforcing-strict-architecture-with-deptrac--phpstan)
- [Limitations: Circular Dependencies at Scale](#limitations-circular-dependencies-at-scale)
- [Safety Rails: Manifest & Rollback](#safety-rails-manifest--rollback)
- [Package Quality: PHPStan, Deptrac & Pest](#package-quality-phpstan-deptrac--pest)
- [Common Workflows](#common-workflows)
- [Testing Philosophy](#testing-philosophy)
- [Design Principles](#design-principles)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [Security](#security)
- [Credits](#credits)
- [License](#license)

<a id="start-here"></a>
## 🧩 Start Here

If you only read three sections:
- **Getting Started (QuickStart)** – a 60‑second setup.
- **Common Workflows** – the most practical end‑to‑end examples.
- **Command Reference** – every command and flag in one place.

<a id="what-is-ddd-lite"></a>
### 🧭 What is DDD-Lite?

**DDD-Lite** is a developer-tooling package that helps you organise your Laravel 12+ application into **modular, domain-oriented boundaries**.

It gives you:

- A **module structure** (`modules/<ModuleName>`) with a clear split between:
  - `App/` – adapters & Laravel-specific glue (controllers, requests, models, providers, repositories)
  - `Domain/` – pure PHP domain code (DTOs, actions, contracts, queries, value objects)
- **Generators** for:
  - DTOs, Actions, Contracts, Repositories, Value Objects
  - Queries and Query Builders
  - Aggregate Roots
  - Controllers, Requests, Models, Migrations, Providers, Routes
- A **conversion engine** to move existing `app/*` code into modules:
  - Discovers move candidates (controllers, models, requests, actions, DTOs, contracts)
  - Applies moves with AST-based namespace rewrites
- **Safety rails** for all file operations:
  - Every run produces a **Manifest** (with creates/updates/deletes/moves/mkdirs)
  - `--dry-run` on everything
  - **Rollback** by manifest id
- **Quality & CI tooling**:
  - Publishable PHPStan & Deptrac configs
  - Optional Pest architecture tests
  - `ddd-lite:doctor` / `ddd-lite:doctor:domain` / `ddd-lite:doctor-ci` to keep modules healthy

The goal is: **clean seams, safer refactors, better testability** – without requiring you to rewrite your entire app in one go.

---

<a id="architecture-overview"></a>
## 🧱 Architecture Overview

A DDD-Lite **module** lives under `modules/<ModuleName>`:

```text
modules/<ModuleName>/
├─ App/
│  ├─ Http/
│  │  ├─ Controllers/
│  │  └─ Requests/
│  ├─ Models/
│  ├─ Providers/
│  └─ Repositories/
├─ Domain/
│  ├─ Actions/
│  ├─ Contracts/
│  ├─ DTO/
│  ├─ Queries/
│  └─ ValueObjects/
├─ database/
│  └─ migrations/
├─ Routes/
│  ├─ api.php
│  └─ web.php
└─ tests/
   ├─ Feature/
   └─ Unit/
```

✅ Rules of thumb

**Domain:**
  - Pure PHP, no hard dependency on Laravel.
  - Orchestrates use cases with Actions (e.g. CreateTripAction).
  - Talks to the outside world through Contracts (e.g. TripRepositoryContract).
  - Uses DTOs and Value Objects for data.

**App:**
  - Typical Laravel adapters (controllers, form requests, models).
  - Implements contracts using Eloquent (e.g. TripRepository).
  - Wires things together using module service providers.

<a id="requirements"></a>
### ⚙️ Requirements
-	PHP: ^8.3
-	Laravel (Illuminate components): ^12.0
-	Composer

Recommended dev dependencies in your app (for quality tooling integration):
  -	larastan/larastan
  -	deptrac/deptrac
  -	pestphp/pest
  -	pestphp/pest-plugin-laravel
  -	pestphp/pest-plugin-arch

<a id="installation"></a>
### ⚙️ Installation
Require the package in your Laravel app (usually as a dev dependency):

```bash
composer require creativecrafts/laravel-domain-driven-design-lite --dev
```

> This package is primarily a developer tool (scaffolding, conversion, quality helpers), so installing under --dev is recommended.
Laravel’s package discovery will automatically register the service provider.

<a id="provider--publishing"></a>
### 📦 Provider & Publishing

DDD-Lite ships with stubs and quality configs you can copy into your app.

**Stubs (module scaffolding & generators)**

To publish the stubs:

```bash
php artisan vendor:publish --tag=ddd-lite
php artisan vendor:publish --tag=ddd-lite-stubs
```
This will create:
- `stubs/ddd-lite/*.stub` – templates for:
  - DTOs, Actions, Contracts, Repositories, Value Objects, Aggregates
  - Controllers (including an --inertia variant)
  - Requests
  - Models & migrations
  - Module providers and route/event providers
  - Routes (web & api)

You typically don’t need to touch these unless you want to customise the generated code style.

**Quality tooling**

To seed PHPStan, Deptrac and Pest architecture tests into your application:

```bash
php artisan ddd-lite:publish:quality --target=all
```
This will (in your app):
- Create `phpstan.app.neon` with sensible defaults for `app/` + `modules/`
- Create `deptrac.app.yaml` describing layer boundaries (Http, Models, Domain, Modules, etc.)
- Add `tests/ArchitectureTest.php` with baseline rules:
  - No debug helpers (`dd`, `dump`, `var_dump`, …)
  - No stray `env()` calls
  - Enforce strict types

**Safe publishing tip**
- Run once, then commit the generated files so changes are visible in code review.

You can also publish selectively:

```bash
php artisan ddd-lite:publish:quality --target=phpstan
php artisan ddd-lite:publish:quality --target=deptrac
php artisan ddd-lite:publish:quality --target=pest-arch
```

**Customising stubs (recommended workflow)**

1) Publish the stubs once:
```bash
php artisan vendor:publish --tag=ddd-lite-stubs
```
2) Edit the generated files under `stubs/ddd-lite/` in your app (e.g. tweak DTO or controller templates).
3) Re-run the generator command. Your customised stubs are now the source of truth.

Tip: keep your stub changes small and version-controlled so upgrades are easy to diff.

<a id="enforcing-strict-architecture-with-deptrac--phpstan"></a>
## ✅ Enforcing Strict Architecture with Deptrac + PHPStan

This package ships publishable templates you can wire into your app to enforce
module boundaries and strict layered architecture.

### 1) Publish the configs

```bash
php artisan ddd-lite:publish:quality --target=deptrac
php artisan ddd-lite:publish:quality --target=phpstan
```

This creates (in your app):
- `deptrac.app.yaml` – layer rules for `app/` and `modules/`
- `phpstan.app.neon` – analysis paths + defaults for `modules/`

### 2) Deptrac: strict module boundaries

The template already defines layers like `Http`, `Models`, `Repositories`, `Domain`,
`Providers`, and `ModulesAll`. To enforce stricter module boundaries, extend the ruleset
to constrain `Modules\*\Domain` and `Modules\*\App` explicitly.

Example (add to `deptrac.app.yaml`):

```yaml
layers:
  - name: ModuleDomain
    collectors:
      - type: classNameRegex
        value: '#^Modules\\[^\\]+\\Domain\\.*$#'

  - name: ModuleApp
    collectors:
      - type: classNameRegex
        value: '#^Modules\\[^\\]+\\App\\.*$#'

ruleset:
  ModuleDomain:
    - Framework
  ModuleApp:
    - ModuleDomain
    - Framework
```

For cross‑module rules, add a shared kernel (e.g. `Modules\Shared`) and only allow
`ModuleDomain` to depend on `Modules\Shared` (not other modules).

### 3) PHPStan: include modules and tighten strictness

The published `phpstan.app.neon` already includes:
- `paths: [app, modules]`
- Larastan extension include

To go stricter, set `level: max` and enable stricter checks:

```neon
parameters:
  level: max
  checkMissingIterableValueType: true
  checkGenericClasses: true
```

### 4) CI integration

Use the existing Composer scripts:

```bash
composer run deptrac:app-template
composer run stan
```

<a id="limitations-circular-dependencies-at-scale"></a>
## ⚠️ Limitations: Circular Dependencies at Scale

- Deptrac detects circular dependencies at the **layer graph** level. If you do not
  model modules as distinct layers, cycles across modules may be invisible.
- Dynamic resolution (service container bindings, facades, late static calls) can hide
  cycles that Deptrac cannot infer statically.
- Large modular systems can produce noisy or slow analysis. You may need to scope rules
  (`paths`, `exclude_files`) or split configs per module to keep feedback fast.
- PHPStan does **not** detect architectural cycles; it only validates types and static
  correctness. Use Deptrac (or Pest Arch tests) for structure enforcement.

<a id="getting-started-quickstart"></a>
## 🚀 Getting Started (QuickStart)

We’ll build a simple Planner module with a Trip aggregate.

**1) Scaffold a module**

```bash
php artisan ddd-lite:module Planner
```

This creates modules/Planner with:
- Providers (module, route, event) under App/Providers
- Routes in Routes/api.php and Routes/web.php
- Domain folders (Actions, DTOs, Contracts, Queries, ValueObjects)
- Tests folders

Core flags:
- --dry-run – preview actions without writing
- --fix-psr4 – auto-rename lowercased module folders to proper PascalCase
- --shared – scaffold a Shared Kernel (domain‑only) module
- --rollback=<manifest-id> – undo a previous scaffold
- --force – overwrite content when needed (with backups)

> For full details see: docs/module-scaffold.md

**2) Generate a DTO**

```bash
php artisan ddd-lite:make:dto Planner CreateTripData \
  --props="id:Ulid|nullable,title:string,startsAt:CarbonImmutable,endsAt:CarbonImmutable"
```
This generates modules/Planner/Domain/DTO/CreateTripData.php:
- Properly typed constructor
- readonly by default
- Optional unit test (unless --no-test is passed)

**3) Generate a domain Action**

```bash
php artisan ddd-lite:make:action Planner CreateTrip \
  --in=Trip \
  --input=FQCN --param=data \
  --returns=ulid
```
This creates Domain/Actions/Trip/CreateTripAction.php similar to:
```php
namespace Modules\Planner\Domain\Actions\Trip;

use Modules\Planner\Domain\Contracts\TripRepositoryContract;
use Modules\Planner\Domain\DTO\CreateTripData;

final class CreateTripAction
{
    public function __construct(
        private TripRepositoryContract $repo,
    ) {}

    public function __invoke(CreateTripData $data): string
    {
        // Domain invariants live here
        return $this->repo->create($data);
    }
}
```

**4) Implement the repository & bind it**
Create an Eloquent repository in modules/Planner/App/Repositories/TripRepository.php (or let ddd-lite:make:repository scaffold it):

```bash
php artisan ddd-lite:make:repository Planner Trip
```
Then wire the contract to the implementation:
```bash
php artisan ddd-lite:bind Planner TripRepositoryContract TripRepository
```
ddd-lite:bind edits your module provider so that:
```php
$this->app->bind(
    TripRepositoryContract::class,
    TripRepository::class,
);
```
is registered.

**5) Expose via HTTP**
Generate a controller + request:

```bash
php artisan ddd-lite:make:controller Planner Trip --resource
php artisan ddd-lite:make:request Planner StoreTrip
```

### ✅ Recipes

**Recipes index**
- Controller orchestrates a Domain action
- Payments module walkthrough
- Orders module creation + structure

#### Controller Orchestrates a Domain Action (HTTP stays in App)

This is the missing piece most people want: the controller only adapts HTTP input and delegates to the Domain action. The action stays HTTP‑free.

**1) Generate the pieces**
```bash
php artisan ddd-lite:make:action Billing CreateInvoice --in=Invoice --input=FQCN
php artisan ddd-lite:make:controller Billing Invoice
php artisan ddd-lite:make:request Billing StoreInvoice
```

**2) Domain action (pure business logic)**
```php
<?php

namespace Modules\Billing\Domain\Actions;

use Modules\Billing\Domain\Contracts\InvoiceRepositoryContract;
use Modules\Billing\Domain\DTO\CreateInvoiceData;

final class CreateInvoiceAction
{
    public function __construct(private InvoiceRepositoryContract $repository)
    {
    }

    public function execute(CreateInvoiceData $data): string
    {
        return $this->repository->create($data);
    }
}
```

**3) Form request (HTTP concerns only)**
```php
<?php

namespace Modules\Billing\App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreInvoiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'amount' => ['required', 'integer', 'min:1'],
        ];
    }
}
```

**4) Controller (orchestrates, no business logic)**
```php
<?php

namespace Modules\Billing\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Billing\App\Http\Requests\StoreInvoiceRequest;
use Modules\Billing\Domain\Actions\CreateInvoiceAction;
use Modules\Billing\Domain\DTO\CreateInvoiceData;

final class InvoiceController
{
    public function __construct(private CreateInvoiceAction $action)
    {
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $data = new CreateInvoiceData(
            $request->string('title')->toString(),
            $request->integer('amount'),
        );

        $id = $this->action->execute($data);

        return response()->json(['id' => $id], 201);
    }
}
```

**5) Minimal feature test (verifies orchestration)**
```php
<?php

use Modules\Billing\Domain\Actions\CreateInvoiceAction;

it('orchestrates the domain action from the controller', function (): void {
    $action = Mockery::mock(CreateInvoiceAction::class);
    $action->shouldReceive('execute')->once()->andReturn('inv_123');
    $this->instance(CreateInvoiceAction::class, $action);

    $response = $this->postJson('/billing/invoices', [
        'title' => 'Pro Plan',
        'amount' => 1200,
    ]);

    $response->assertCreated()->assertJson(['id' => 'inv_123']);
});
```

**Boundary rule of thumb:** App layer knows HTTP; Domain layer never does.

#### Payments Module Walkthrough (DTO → Contract → Repository → Action)

This compact slice ties the pieces together with real code, while keeping Domain pure and App infrastructural.

**1) Generate the artifacts**
```bash
php artisan ddd-lite:make:dto Payments CreatePaymentData --props="reference:string,amount:int"
php artisan ddd-lite:make:contract Payments PaymentRepository
php artisan ddd-lite:make:repository Payments Payment --contract=PaymentRepositoryContract
php artisan ddd-lite:make:action Payments CreatePayment --in=Payment --input=FQCN
php artisan ddd-lite:bind Payments PaymentRepositoryContract PaymentRepository
```

**2) DTO (Domain)**
```php
<?php

namespace Modules\Payments\Domain\DTO;

final class CreatePaymentData
{
    public function __construct(
        public string $reference,
        public int $amount,
    ) {
    }
}
```

**3) Contract (Domain)**
```php
<?php

namespace Modules\Payments\Domain\Contracts;

use Modules\Payments\Domain\DTO\CreatePaymentData;

interface PaymentRepositoryContract
{
    public function create(CreatePaymentData $data): string;
}
```

**4) Repository (App, Eloquent adapter)**
```php
<?php

namespace Modules\Payments\App\Repositories;

use Modules\Payments\App\Models\Payment;
use Modules\Payments\Domain\Contracts\PaymentRepositoryContract;
use Modules\Payments\Domain\DTO\CreatePaymentData;

final class PaymentRepository implements PaymentRepositoryContract
{
    public function create(CreatePaymentData $data): string
    {
        $payment = Payment::query()->create([
            'reference' => $data->reference,
            'amount' => $data->amount,
        ]);

        return (string) $payment->getKey();
    }
}
```

**5) Action (Domain, orchestrates business rules)**
```php
<?php

namespace Modules\Payments\Domain\Actions;

use Modules\Payments\Domain\Contracts\PaymentRepositoryContract;
use Modules\Payments\Domain\DTO\CreatePaymentData;

final class CreatePaymentAction
{
    public function __construct(private PaymentRepositoryContract $repository)
    {
    }

    public function execute(CreatePaymentData $data): string
    {
        return $this->repository->create($data);
    }
}
```

**Boundary rule of thumb:** Domain owns the contract and action; App wires the implementation and persistence.

### 🧠 DDD-Lite in Practice: Example Flow

A typical “vertical slice” in a module:
- **DTO:** CreateTripData – validated input from HTTP or CLI.
- **Action:** CreateTripAction – orchestrates creation, enforces invariants.
- **Contract:** TripRepositoryContract – interface for persistence.
- **Repository:** TripRepository (Eloquent) – implements contract.
- **Controller:** TripController@store – adapts HTTP to the action.

Generators help you keep this shape consistent across modules without hand-rolling boilerplate every time.

### ✅ Advanced Workflows

#### Multi‑Tenant SaaS Structure + Boundary Enforcement (Deptrac + PHPStan)

This section shows a concrete, enforceable layout for multi‑tenant apps, with shared domain concepts and strict module boundaries.

**1) Recommended module layout**
```
modules/
  Shared/                 # Shared Kernel (domain-only)
    Domain/
      ValueObjects/
      Contracts/
      Exceptions/
      Enums/
  Tenancy/                # Tenant resolution + context
    App/
    Domain/
  Billing/
    App/
    Domain/
  Projects/
    App/
    Domain/
  Users/
    App/
    Domain/
```

**2) Shared Kernel (domain‑only)**
Use `--shared` to keep it pure (no HTTP/Routes):
```bash
php artisan ddd-lite:module Shared --shared
```

**3) Shared domain concepts (example)**
```php
<?php

namespace Modules\Shared\Domain\ValueObjects;

final class TenantId
{
    public function __construct(public string $value)
    {
    }
}
```

**4) Tenancy boundary (example contract)**
```php
<?php

namespace Modules\Tenancy\Domain\Contracts;

use Modules\Shared\Domain\ValueObjects\TenantId;

interface CurrentTenantResolverContract
{
    public function resolve(): TenantId;
}
```

**5) App layer adapter uses tenancy, Domain stays pure**
```php
<?php

namespace Modules\Projects\App\Actions;

use Modules\Shared\Domain\ValueObjects\TenantId;
use Modules\Tenancy\Domain\Contracts\CurrentTenantResolverContract;

final class BuildTenantContext
{
    public function __construct(private CurrentTenantResolverContract $resolver)
    {
    }

    public function handle(): TenantId
    {
        return $this->resolver->resolve();
    }
}
```

### ✅ Deptrac: Enforce Module Boundaries

Create a `deptrac.yaml` in your host app (this repo ships a package example, but apps should define their own rules):

```yaml
parameters:
  paths:
    - modules

  layers:
    - name: SharedDomain
      collectors:
        - type: directory
          value: modules/Shared/Domain

    - name: TenancyDomain
      collectors:
        - type: directory
          value: modules/Tenancy/Domain

    - name: BillingDomain
      collectors:
        - type: directory
          value: modules/Billing/Domain

    - name: ProjectsDomain
      collectors:
        - type: directory
          value: modules/Projects/Domain

    - name: UsersDomain
      collectors:
        - type: directory
          value: modules/Users/Domain

    - name: AppLayer
      collectors:
        - type: directory
          value: modules/.*/App

  ruleset:
    SharedDomain: [SharedDomain]
    TenancyDomain: [TenancyDomain, SharedDomain]
    BillingDomain: [BillingDomain, SharedDomain, TenancyDomain]
    ProjectsDomain: [ProjectsDomain, SharedDomain, TenancyDomain]
    UsersDomain: [UsersDomain, SharedDomain]
    AppLayer: [SharedDomain, TenancyDomain, BillingDomain, ProjectsDomain, UsersDomain]
```

**6) Run Deptrac with DDD‑Lite**
```bash
php artisan ddd-lite:doctor:domain --config=deptrac.yaml
```

### ✅ PHPStan: Block Cross‑Module Dependencies

Add module‑level `ban` rules in your app’s `phpstan.neon` to prevent accidental imports:

```neon
parameters:
  forbiddenSymbols:
    - 'Modules\\Billing\\Domain\\.*'
  ignoreErrors:
    - '#^Access to an undefined property#'
```

Then override per‑module configs (example for Projects):
```neon
includes:
  - phpstan.neon

parameters:
  forbiddenSymbols:
    - 'Modules\\Billing\\Domain\\.*'
    - 'Modules\\Users\\Domain\\.*'
```

**Boundary rule of thumb:** Domains depend only on Shared + their own contracts. App layer can orchestrate across modules via contracts and adapters.

**Limitations & Mitigations (circular dependencies)**
- Deptrac can detect cycles but won’t tell you how to break them. When a cycle appears, move shared contracts/value objects into `Shared/Domain` and depend on those instead of cross‑module concrete classes.
- Avoid App ↔ Domain cycles by keeping infrastructure in App and interfaces in Domain.
- If you must allow a dependency for a transition period, document it explicitly and remove it once the migration is complete.

**Shared concepts + cross‑module communication (tenant‑safe patterns)**
- Put common value objects and contracts in `Shared/Domain` (e.g., `TenantId`, `Money`, `Period`).
- Expose inter‑module capabilities via **Domain contracts** (e.g., `Billing\Domain\Contracts\Invoices`), and bind App implementations in the owning module.
- Prefer **application services** in App for orchestration across modules; Domain actions should stay within their module boundary.

**Tenant isolation guidelines**
- Always pass `TenantId` into Domain actions or repositories; never infer tenancy inside Domain from HTTP or globals.
- In App repositories, scope every query by tenant (e.g., `->where('tenant_id', $tenantId->value)`).
- For cross‑module reads, use contracts that accept `TenantId` explicitly to prevent accidental leakage.

#### Safe Refactor Workflow with `--dry-run` + Rollback

Use dry‑run previews and manifests to refactor large features into modules safely.

**1) Plan the move (no files written)**
```bash
php artisan ddd-lite:convert Billing \
  --plan-moves \
  --paths=app/Models,app/Http/Controllers,app/Http/Requests \
  --dry-run
```
**Syntax reminders**
- `--paths` is a comma‑separated list of directories (no spaces).
- `--plan-moves` discovers candidates only (no writes).

**2) Apply moves with review (writes manifest)**
```bash
php artisan ddd-lite:convert Billing --apply-moves --review
```
The output includes a manifest id:
```
Manifest: 55f96156eac4ea63
```

**3) Inspect what was changed**
```bash
php artisan ddd-lite:manifest:show 55f96156eac4ea63
```
Each action records the file path and the type (create/update/move).

**How to read dry‑run output**
- `move` indicates a file will be relocated into the module.
- `update` indicates a namespace or import rewrite.
- If you see unexpected paths, narrow `--paths` before applying moves.

**4) Rollback if needed**
```bash
php artisan ddd-lite:convert Billing --rollback=55f96156eac4ea63
```

**5) Refactor with dry‑run safety (scaffold + bind)**
```bash
php artisan ddd-lite:module Billing --dry-run
php artisan ddd-lite:make:contract Billing BillingRepository --dry-run
php artisan ddd-lite:make:repository Billing Billing --dry-run
```

**6) Verification checklist**
- Review dry‑run output for unexpected paths.
- Use `ddd-lite:manifest:show` to confirm changes before committing.
- If anything looks off, rollback immediately and re‑run with a narrower `--paths` scope.

**Error handling tips**
- If a command fails after writing files, rollback using the manifest id printed in the output.
- For repeated refactors, keep the manifest id in your PR notes.
 - If you hit unexpected rewrites, run `ddd-lite:convert <Module> --report` to review planned namespace changes before applying.

**Before/After tree (concrete example)**

Before (legacy feature in app/):
```
app/
  Models/
    BillingAccount.php
  Http/
    Controllers/
      Billing/
        BillingAccountController.php
    Requests/
      Billing/
        StoreBillingAccountRequest.php
```

After (moved into modules/Billing):
```
modules/
  Billing/
    App/
      Http/
        Controllers/
          BillingAccountController.php
        Requests/
          StoreBillingAccountRequest.php
      Models/
        BillingAccount.php
    Domain/
      Actions/
      Contracts/
      DTO/
```

#### Convert Monolith `app/` → Invoicing Module (with namespace rewrites)

This is the complete, safe workflow: scaffold the module first, then plan + apply moves.

**1) Scaffold the module (required)**
```bash
php artisan ddd-lite:module Invoicing
```

**2) Plan the conversion (no files written)**
```bash
php artisan ddd-lite:convert Invoicing \
  --plan-moves \
  --paths=app/Models,app/Http/Controllers,app/Http/Requests \
  --dry-run
```

**3) Review and apply moves (writes manifest)**
```bash
php artisan ddd-lite:convert Invoicing --apply-moves --review
```

**4) Confirm namespace rewrites**
```bash
php artisan ddd-lite:convert Invoicing --report
```

**5) Rollback if needed**
```bash
php artisan ddd-lite:convert Invoicing --rollback=<manifest-id>
```

**Notes**
- The conversion engine rewrites namespaces to `Modules\\Invoicing\\...` during moves.
- Use `--paths` to keep scope tight and predictable for large refactors.

#### Create an Orders Module + Typical Structure

**1) Create the module**
```bash
php artisan ddd-lite:module Orders
```

**2) Typical directory structure (Domain vs App)**
```
modules/
  Orders/
    App/
      Http/
      Models/
      Providers/
      Repositories/
    Domain/
      Actions/
      Contracts/
      DTO/
      Queries/
      ValueObjects/
    Database/
      migrations/
    Routes/
    tests/
```

**3) Register + adapter example**
The module provider is created and registered automatically during `ddd-lite:module`.
To connect App infrastructure to Domain, bind a contract in the module provider:
```php
$this->app->bind(
    OrderRepositoryContract::class,
    EloquentOrderRepository::class,
);
```
Then use the contract inside a Domain action, while App implementations remain Eloquent‑based.

**4) Minimal flow (Controller → Action → Repository)**
```php
<?php

namespace Modules\Orders\App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Orders\App\Http\Requests\StoreOrderRequest;
use Modules\Orders\Domain\Actions\CreateOrderAction;
use Modules\Orders\Domain\DTO\CreateOrderData;

final class OrderController
{
    public function __construct(private CreateOrderAction $action)
    {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = new CreateOrderData(
            $request->integer('customer_id'),
            $request->integer('total'),
        );

        $id = $this->action->execute($data);

        return response()->json(['id' => $id], 201);
    }
}
```

```php
<?php

namespace Modules\Orders\Domain\Actions;

use Modules\Orders\Domain\Contracts\OrderRepositoryContract;
use Modules\Orders\Domain\DTO\CreateOrderData;

final class CreateOrderAction
{
    public function __construct(private OrderRepositoryContract $repository)
    {
    }

    public function execute(CreateOrderData $data): string
    {
        return $this->repository->create($data);
    }
}
```

<a id="project-initialization"></a>
## 🧭 Project Initialization

For a guided, one‑shot setup (stubs, quality configs, optional module, and CI snippet):

```bash
php artisan ddd-lite:init --module=Core --publish=all --ci=show
```

Common flags:
- --module= – scaffold a starter module (e.g. Core)
- --no-module – skip module scaffolding
- --publish=all|quality|stubs|none
- --ci=show|write|none
- --ci-path=... – write workflow to a custom path
- --yes – non‑interactive defaults

<a id="command-reference"></a>
### 🧰 Command Reference

All commands share a consistent UX:
- --dry-run – print what would happen; no files written; no manifest saved.
- --force – overwrite when content changes (backups are tracked in manifests).
- --rollback=<manifest-id> – revert a previous run (see Manifest section below).

**Command Index**
- Bootstrap: `ddd-lite:init`
- Scaffolding: `ddd-lite:module`
- Generators: `ddd-lite:make:*`
- Wiring: `ddd-lite:bind`
- Conversion: `ddd-lite:convert`
- Quality: `ddd-lite:publish:quality`, `ddd-lite:doctor`, `ddd-lite:doctor:domain`, `ddd-lite:doctor-ci`, `ddd-lite:boundaries`
- Manifests: `ddd-lite:manifest:list`, `ddd-lite:manifest:show`
- Stubs: `ddd-lite:stubs:diff`, `ddd-lite:stubs:sync`
- Modules: `ddd-lite:modules:list`

**Cheat Sheet**

| Goal | Command |
| --- | --- |
| Initialize a project | `php artisan ddd-lite:init --module=Core --publish=all --ci=show` |
| Create a module skeleton | `php artisan ddd-lite:module Billing` |
| Generate a DTO | `php artisan ddd-lite:make:dto Billing CreateInvoiceData --props="id:Ulid,title:string"` |
| Create an Action | `php artisan ddd-lite:make:action Billing CreateInvoice --in=Invoice --input=FQCN` |
| Bind a contract | `php artisan ddd-lite:bind Billing InvoiceRepositoryContract InvoiceRepository` |
| Plan legacy moves | `php artisan ddd-lite:convert Billing --plan-moves --paths=app/Models` |
| Apply moves safely | `php artisan ddd-lite:convert Billing --apply-moves --review` |
| Suggest contracts | `php artisan ddd-lite:convert Billing --plan-moves --suggest-contracts` |
| Publish quality tooling | `php artisan ddd-lite:publish:quality --target=all` |
| Run structural checks | `php artisan ddd-lite:doctor --module=Billing` |
| List modules + health | `php artisan ddd-lite:modules:list --with-health` |

**1. Module scaffolding & conversion**

**ddd-lite:module**
Scaffold a new module skeleton:
```bash
php artisan ddd-lite:module Planner
```
Key flags:
- name (required) – module name in PascalCase.
- --dry-run – preview only.
- --force – overwrite files if they exist.
- --shared – scaffold a Shared Kernel (domain‑only) module.
- --fix-psr4 – rename existing lowercased module folders to PSR-4 PascalCase.
- --rollback=<id> – rollback a previous scaffold.

See docs/module-scaffold.md￼ for details.

**ddd-lite:convert**
Discover and optionally apply moves from app/* into modules:
```bash
php artisan ddd-lite:convert Planner \
  --plan-moves \
  --paths=app/Http/Controllers,app/Models
```
> To use the namespace rewriting and AST-based moves, install nikic/php-parser:

> composer require --dev nikic/php-parser

Important options:
- module – target module name.
- --plan-moves – discover move candidates and print a plan (no writes).
- --apply-moves – actually apply moves (AST-safe namespace rewrites).
- --review – interactive confirmation per move (with --apply-moves).
- --all – apply all moves without prompts.
- --only=controllers,models,requests,actions,dto,contracts – include kinds.
- --except=... – exclude kinds.
- --paths=... – comma-separated paths to scan.
- --with-shims – include shim suggestions in the printed plan.
- --suggest-contracts – print suggested contracts/bindings for moved models/actions.
- --export-plan=path.json – write discovered move plan to JSON.
- --dry-run, --force, --rollback=<id>.

Use this to gradually migrate a legacy app into DDD-Lite modules.

**Safe conversion workflow**
- Start with `--plan-moves` and export the plan (`--export-plan=...`) for review.
- Apply with `--review` before `--all`.
- Keep the manifest id; roll back with `--rollback=<id>` if needed.

**2. Domain generators**

**ddd-lite:make:dto**
Generate a DTO under Domain/DTO:
```bash
php artisan ddd-lite:make:dto Planner CreateTripData \
  --in=Trip \
  --props="id:Ulid|nullable,title:string,startsAt:CarbonImmutable"
```
- module – module name.
- name – DTO class name.
- --in= – optional subnamespace inside Domain/DTO.
- --props= – name:type[|nullable] comma-separated.
- --readonly – enforce readonly class (default: true).
- --no-test – skip generating a test.

**ddd-lite:make:action**
Generate a domain action in Domain/Actions:
```bash
php artisan ddd-lite:make:action Planner CreateTrip \
  --in=Trip \
  --input=FQCN --param=data \
  --returns=ulid
```
- --in= – optional subnamespace.
- --method= – method name (default __invoke).
- --input= – parameter type preset: none|ulid|FQCN.
- --param= – parameter variable name.
- --returns= – void|ulid|FQCN.
- --no-test – skip test.

**ddd-lite:make:contract**
Generate a domain contract:
```bash
php artisan ddd-lite:make:contract Planner TripRepository \
  --in=Trip \
  --methods="find:TripData|null(id:Ulid); create:TripData(data:TripCreateData)"
```
- --methods= – semi-colon separated: name:ReturnType(args...).
- --with-fake – generate a Fake implementation under tests/Unit/fakes.
- --no-test – skip the contract test.

**ddd-lite:make:repository**
Generate an Eloquent repository for an aggregate:
```bash
php artisan ddd-lite:make:repository Planner Trip
```
Creates:
- App/Repositories/TripRepository.php
- Optional tests (unless --no-test).

**ddd-lite:make:value-object**
Generate a value object:
```bash
php artisan ddd-lite:make:value-object Planner Email \
  --scalar=string
```
- --scalar= – backing scalar type: string|int|float|bool.
- --no-test – skip generating a test.
- --with-validation-test – include a validation test that expects `InvalidArgumentException`.

By default, a test is created at:
`modules/<Module>/tests/Unit/Domain/ValueObjects/<Name>Test.php`

**Example: Email value object with validation (egulias/email-validator)**

1) Install the validator in your app:
```bash
composer require egulias/email-validator
```

2) Generate the value object:
```bash
php artisan ddd-lite:make:value-object Users Email --scalar=string
```

3) Update the generated file:

Path: `modules/Users/Domain/ValueObjects/Email.php`

```php
<?php

declare(strict_types=1);

namespace Modules\Users\Domain\ValueObjects;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\RFCValidation;
use InvalidArgumentException;

final readonly class Email
{
    public function __construct(private string $value)
    {
        $validator = new EmailValidator();
        if (!$validator->isValid($value, new RFCValidation())) {
            throw new InvalidArgumentException('Invalid email address.');
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

4) Instantiate in your Domain layer (e.g. in an Action):

```php
use Modules\Users\Domain\ValueObjects\Email;

$email = new Email($data->email);
```

5) Add a minimal test (Pest):

Path: `modules/Users/tests/Unit/EmailTest.php`

```php
<?php

declare(strict_types=1);

use Modules\Users\Domain\ValueObjects\Email;

it('accepts valid email', function (): void {
    $email = new Email('user@example.com');

    expect((string)$email)->toBe('user@example.com');
});

it('rejects invalid email', function (): void {
    new Email('not-an-email');
})->throws(InvalidArgumentException::class);
```

**ddd-lite:make:aggregate-root**
Generate an aggregate root base:
```bash
php artisan ddd-lite:make:aggregate-root Planner Trip
```
Useful for richer domain modelling around key aggregates.

**Query side**
- ddd-lite:make:query – generate a Query class in Domain/Queries.
- ddd-lite:make:query-builder – generate a QueryBuilder helper.
- ddd-lite:make:aggregator – generate an Aggregator to combine queries.
  - add `--no-test` to skip generating tests for each of these.

Example:
```bash
php artisan ddd-lite:make:query Planner TripIndexQuery
php artisan ddd-lite:make:query-builder Planner Trip
php artisan ddd-lite:make:aggregator Planner TripIndexAggregator
```

**3. App-layer generators**

**ddd-lite:make:model**
Generate an Eloquent model in App/Models:
```bash
php artisan ddd-lite:make:model Planner Trip \
  --table=trips \
  --fillable="title,starts_at,ends_at"
```
Options:
- --table=, --fillable=, --guarded=
- --soft-deletes
- --no-timestamps

**ddd-lite:make:migration**
Generate a migration under Database/migrations:
```bash
php artisan ddd-lite:make:migration Planner create_trips_table --create=trips
```
- module? – module name (optional).
- name? – migration base name.
- --table= – table name.
- --create= – shortcut for table creation.
- --path= – override path (defaults to module migrations).
- --force, --dry-run, --rollback=<id>.

**ddd-lite:make:controller**
Generate a controller:
```bash
php artisan ddd-lite:make:controller Planner Trip --resource
```
- --resource – standard Laravel resource methods.
- --inertia – generate methods that return Inertia pages.
- --suffix= – class suffix (default Controller).

**ddd-lite:make:request**
Generate a form request:
```bash
php artisan ddd-lite:make:request Planner StoreTrip
```
- --suffix= – class suffix (default Request).

**4. Binding & wiring**

**ddd-lite:bind**
Bind a domain contract to an implementation in the module provider:

```bash
php artisan ddd-lite:bind Planner TripRepositoryContract TripRepository
```
- module – module name.
- contract – contract short name or FQCN.
- implementation – implementation short name or FQCN.
- --force – skip class existence checks (e.g. when generating ahead of time).

**5. Manifest commands**
Every write operation (scaffolding, generate, convert, publish, doctor fixes) is tracked via a **Manifest**.

**ddd-lite:manifest:list**
List manifests:

```bash
php artisan ddd-lite:manifest:list --module=Planner --type=create --json
```
Options:
- --module= – filter by module.
- --type= – mkdir|create|update|delete|move.
- --after=, --before= – ISO8601 bounds for created_at.
- --json – machine-readable output.

**ddd-lite:manifest:show**
Inspect a single manifest:

```bash
php artisan ddd-lite:manifest:show 2025-11-24-13-54-01 --json
```
Shows the tracked operations for that run (created files, backups, moves, deletions, etc.).

**6. Doctor & Quality commands**

**ddd-lite:publish:quality**
(Described earlier) – publishes PHPStan, Deptrac, and Pest Arch configuration/stubs into your app.

**ddd-lite:doctor**
Run structural checks on your modules and wiring:

```bash
php artisan ddd-lite:doctor --module=Planner --json
```
Checks things like:
- Module provider registration
- Route/service provider wiring
- PSR-4 inconsistencies
- Missing or mis-wired module components

Flags:
- --module= – limit to a specific module.
- --fix – attempt automatic fixes (provider edits, PSR-4 renames, etc.).
- --json – JSON report for tooling.
- --deep – run doctor:domain and doctor-ci after base checks.
- --prefer=file|class – strategy when class and filename mismatch.
- --rollback=<id> – undo fixes.

**ddd-lite:doctor:domain**
Run domain purity checks via Deptrac:

```bash
php artisan ddd-lite:doctor:domain \
  --config=deptrac.app.yaml \
  --bin=vendor/bin/deptrac \
  --json \
  --fail-on=violations
```

Options:
- --config= – Deptrac YAML config.
- --bin= – path to deptrac executable.
- --json – JSON summary.
- --strict – treat uncovered as failure.
- --stdin-report= – use pre-generated Deptrac JSON report.
- --fail-on= – violations|errors|uncovered|any.

**ddd-lite:doctor-ci**
Run both structural and domain checks in CI:

```bash
php artisan ddd-lite:doctor-ci --json --fail-on=error
```
- --paths= – paths to scan (defaults to modules/ and bootstrap/app.php).
- --fail-on=none|any|error – CI failure policy.
- --json – CI-friendly JSON result.

Use this in your CI pipeline to enforce module health.

**ddd-lite:boundaries**
Alias for `ddd-lite:doctor:domain` to run Deptrac boundary checks with a friendlier name.

**ddd-lite:modules:list**
List modules and (optionally) show health:
```bash
php artisan ddd-lite:modules:list --with-health
```

**ddd-lite:stubs:diff**
Compare package stubs to your customized stubs:
```bash
php artisan ddd-lite:stubs:diff --json
```

**ddd-lite:stubs:sync**
Sync missing or changed stubs into your app:
```bash
php artisan ddd-lite:stubs:sync --mode=missing
```

<a id="safety-rails-manifest--rollback"></a>
### 🧪 Safety Rails: Manifest & Rollback

DDD-Lite never silently edits your app.

For each command run that changes files:
- A **Manifest** is written with:
  - mkdir, create, update, delete, move records
  - Backups of overwritten files
- You can inspect manifests with:
  - `ddd-lite:manifest:list`
  - `ddd-lite:manifest:show {id}`
- You can revert a run by passing `--rollback=<manifest-id>` to the original command
  (e.g. `ddd-lite:module`, `ddd-lite:convert`, `ddd-lite:publish:quality`, `ddd-lite:doctor`).

This makes DDD-Lite safe to use on large, existing codebases.

<a id="package-quality-phpstan-deptrac--pest"></a>
### 🧮 Package Quality: PHPStan, Deptrac & Pest

Inside this package:
- phpstan.neon.dist – strict rules for the package itself.
- deptrac.package.yaml – package-level dependency rules.
- tests/ArchTest.php – baseline architecture checks via Pest.

In your **application,** use:
```bash
php artisan ddd-lite:publish:quality --target=all
```
and then:

```bash
# In your app
vendor/bin/phpstan analyse -c phpstan.app.neon
vendor/bin/deptrac --config=deptrac.app.yaml
php artisan test tests/ArchitectureTest.php
```
Combine this with ddd-lite:doctor-ci in CI for a tight feedback loop.

<a id="common-workflows"></a>
### 🧩 Common Workflows

**Greenfield project**
- Install DDD-Lite.
- Scaffold your first module: `ddd-lite:module`.
- Generate DTOs, Actions, Contracts, Repositories, Controllers, Requests.
- Set up quality tooling with `ddd-lite:publish:quality`.
- Wire `ddd-lite:doctor-ci` into your CI.

**Migrating a legacy app**
- Install DDD-Lite.
- Scaffold a module for a coherent slice (e.g. Planner, Billing, Users).
- Use `ddd-lite:convert` with `--plan-moves` on a subset of `app/*`.
- Iterate with `--apply-moves` and `--review`, keeping an eye on manifests.
- Introduce contracts + repositories for areas you want to harden.
- Run `ddd-lite:doctor` and `ddd-lite:doctor:domain` regularly during the migration.

<a id="testing-philosophy"></a>
### 🧪 Testing Philosophy

The package itself is tested with:
- **Pest** for:
  - Feature tests of console commands
  - Unit tests for internals (filesystem, manifests, planners)
- Architecture tests to protect boundaries.

You’re encouraged to:
- Keep module tests close to modules (under modules/<Module>/tests).
- Use the provided stubs for DTO / Action / Contract / Repository tests to keep patterns consistent.

<a id="design-principles"></a>
### 🔒 Design Principles
- **Domain purity** – Domain/ should know nothing about Laravel.
- **Explicit boundaries** – Domain <-> App contracts are interfaces, not facades.
- **Safety first** – manifests, backups, --dry-run, --rollback.
- **Deterministic generators** – running a command twice should be safe and idempotent.
- **CI-friendly** – all checks and reports can be consumed by automation via JSON / exit codes.

<a id="troubleshooting"></a>
### 🧰 Troubleshooting
- “Nothing seems to happen when I run a command”
  - Check if you passed --dry-run.
  - Inspect manifests using ddd-lite:manifest:list.
- “I messed up my module structure”
  - Find the relevant manifest id: ddd-lite:manifest:list.
  - Rerun the original command with --rollback=<id>.
- “Deptrac or PHPStan fail after publishing quality configs”
  - Make sure you installed the suggested dev dependencies in your app.
  - Tweak phpstan.app.neon / deptrac.app.yaml to match your project’s structure.


<a id="changelog"></a>
### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

<a id="security"></a>
### Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

<a id="credits"></a>
### 🙌 Credits

- [Godspower Oduose](https://github.com/rockblings)
- [All Contributors](../../contributors)

<a id="license"></a>
## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
