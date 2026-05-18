# Cnd API Maker (Monorepo)

Monorepo containing multiple Composer packages used to generate APIs and project scaffolding across frameworks.

Packages:
- `cnd-api-maker/core` — shared generator/runtime
- `cnd-api-maker/laravel` — Laravel integration (Artisan commands, generators, API Platform Laravel support)
- `cnd-api-maker/symfony` — Symfony integration (Bundle/commands, generators)

## Repository layout

```

cnd-api-maker/
	composer.json
	packages/
		cnd-api-maker/
		core/
			composer.json
			src/
		laravel/
			composer.json
			src/
		symfony/
			composer.json
			src/

````

## Requirements
- PHP 8.2+
- Composer 2.x
- Git

## Install (monorepo)

From repository root:

```bash
composer install
````

## Local development (use packages in a consumer project)

In a Laravel app (consumer), reference packages using `path` repositories:

```json
{
  "repositories": [
    { "type": "path", "url": "../cnd-api-maker/packages/cnd-api-maker/core" },
    { "type": "path", "url": "../cnd-api-maker/packages/cnd-api-maker/laravel" }
  ],
  "require": {
    "cnd-api-maker/laravel": "*"
  },
  "minimum-stability": "dev",
  "prefer-stable": true
}
```

Then:

```bash
composer update cnd-api-maker/core cnd-api-maker/laravel
```

## Public distribution (Packagist)

Packagist.org publishes **one package per repository** (expects `composer.json` at repository root).
This monorepo uses **subtree split** to publish each package as its own repository.

Recommended published repositories:

* `cnd-api-maker-core`
* `cnd-api-maker-laravel`
* `cnd-api-maker-symfony`

### Initial publish (manual)

From the monorepo root:

```bash
git subtree split --prefix=packages/cnd-api-maker/core -b split-core
git push git@github.com:coundia/cnd-api-maker-core.git split-core:main
git branch -D split-core

git subtree split --prefix=packages/cnd-api-maker/laravel -b split-laravel
git push git@github.com:coundia/cnd-api-maker-laravel.git split-laravel:main
git branch -D split-laravel

git subtree split --prefix=packages/cnd-api-maker/symfony -b split-symfony
git push git@github.com:coundia/cnd-api-maker-symfony.git split-symfony:main
git branch -D split-symfony
```

### Release workflow (tag + publish)

1. Tag the monorepo:

```bash
git tag v0.1.0
git push origin v0.1.0
```

2. Propagate the tag to split repositories:

Core:

```bash
git subtree split --prefix=packages/cnd-api-maker/core -b split-core
git push git@github.com:coundia/cnd-api-maker-core.git split-core:main
git tag -f v0.1.0 split-core
git push -f git@github.com:coundia/cnd-api-maker-core.git v0.1.0
git branch -D split-core
```

Laravel:

```bash
git subtree split --prefix=packages/cnd-api-maker/laravel -b split-laravel
git push git@github.com:coundia/cnd-api-maker-laravel.git split-laravel:main
git tag -f v0.1.0 split-laravel
git push -f git@github.com:coundia/cnd-api-maker-laravel.git v0.1.0
git branch -D split-laravel
```

Symfony:

```bash
git subtree split --prefix=packages/cnd-api-maker/symfony -b split-symfony
git push git@github.com:coundia/cnd-api-maker-symfony.git split-symfony:main
git tag -f v0.1.0 split-symfony
git push -f git@github.com:coundia/cnd-api-maker-symfony.git v0.1.0
git branch -D split-symfony
```

### Submit to Packagist

Submit the split repositories (not the monorepo):

* `https://github.com/coundia/cnd-api-maker-core`
* `https://github.com/coundia/cnd-api-maker-laravel`
* `https://github.com/coundia/cnd-api-maker-symfony`

## Working on packages

Each package has its own README:

* `packages/cnd-api-maker/core/README.md`
* `packages/cnd-api-maker/laravel/README.md`
* `packages/cnd-api-maker/symfony/README.md`


## Configuration


## Quick start (Laravel)

### 1) Create a JDL file

Create a `.jdl` file describing your entities and relationships.

Example: `example.jdl`

```jdl
entity Employee {
  firstName String required
  lastName String required
  email String
  phoneNumber String
  hireDate Instant
  salary Long
  commissionPct Long
}

entity Ticket {
  title String required
  due Long
}

relationship OneToMany {
  Employee to Ticket{employee}
}
```

Generate JDL using **JHipster JDL Studio**:

* [https://start.jhipster.tech/jdl-studio/](https://start.jhipster.tech/jdl-studio/)

### 2) Install the generator (one-time)

```bash
php artisan cnd:api-maker:install --force
```

### 3) Generate from JDL

```bash
php artisan cnd:api-maker:generate --file=example.jdl
```

Common options (depending on your implementation):

* `--force` overwrite generated files
* `--dry-run` preview without writing
* `--module=...` generate into a specific module/namespace (if supported)

### 4) Run database + tests

```bash
php artisan migrate
php artisan test
```

## Generated output (example: multi-tenant + RBAC starter)

### API / Config

* `app/ApiResource/Health.php`
* `config/api-platform.php`
* `bootstrap/app.php`
* `bootstrap/providers.php`

### Console / Providers

* `app/Console/Commands/GeneratePermissionsCommand.php`
* `app/Providers/TenancyServiceProvider.php`

### Tenancy

* `app/Tenancy/TenantContext.php`
* `app/Models/Concerns/TenantOwned.php`
* `app/Tenancy/Http/Middleware/Authenticate.php`
* `app/Tenancy/Http/Middleware/ResolveTenant.php`

### Security / Auth / RBAC

* RBAC:

	* `app/Security/Rbac/PermissionChecker.php`
	* `app/Security/Rbac/GrantsRbacPermissions.php`
	* `app/Security/Rbac/GrantsRbacPermissionsTenant.php`
* Auth API:

	* `app/Models/AuthResource.php`
	* `app/Dto/Auth/*`
	* `app/State/Auth/*`
	* `tests/Feature/Security/AuthApiTest.php`

### CRUD API (DTO + State layer)

* DTOs:

	* `app/Dto/{Tenant,Role,Permission,RolePermission,UserRole}/*`
* State:

	* `app/State/{Tenant,Role,Permission,RolePermission,UserRole}/*`

### Eloquent Models + Factories

* Models:

	* `app/Models/{Tenant,Role,Permission,RolePermission,User,UserRole}.php`
* Factories:

	* `database/factories/{Tenant,Role,Permission,RolePermission,UserRole}Factory.php`

### Database

* Migrations:

	* `database/migrations/0001...0006_*`
* Seeders:

	* `database/seeders/{SecuritySeederTenant,DatabaseSeeder}.php`

### Tests

* `tests/Support/BaseApiTestCase.php`
* `tests/Feature/*ApiTest.php`

## Notes

### API Platform endpoints

If you generate API Platform resources, your documentation and endpoints depend on your `api-platform` configuration.
Check `config/api-platform.php` and the generated resources under `app/ApiResource`.

### Regenerating code

* Use `--dry-run` to preview changes.
* Use `--force` to overwrite files when you intentionally want to regenerate.

## Versioning

SemVer tags: `vMAJOR.MINOR.PATCH`

## License

See `composer.json`.

```
::contentReference[oaicite:0]{index=0}
```
