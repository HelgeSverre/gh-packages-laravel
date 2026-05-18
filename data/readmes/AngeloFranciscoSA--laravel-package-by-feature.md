# Study Project — Laravel Modular (Package by Feature)

A study project focused on the **Package by Feature** architecture (modular monolith) using Laravel 12. The main domain is a car catalog with CRUD, pagination, and SPA frontend via Inertia.js + Vue 3.

> **Status:** Actively in development.

> **Note:** This project uses [Claude](https://claude.ai) (Anthropic) as an assistant for hands-on practice and for writing business rule documentation as new features are added over time.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Backend  | PHP 8.2+, Laravel 12                          |
| Frontend | Vue 3, Inertia.js, Tailwind CSS 4             |
| Build    | Vite 6                                        |
| Database | SQLite (default)                              |
| Testing  | PHPUnit 11, Mockery, ParaTest                 |
| JS       | Inertia.js, Pinia, VueUse, Axios, SweetAlert2 |

---

## Documentation

Detailed docs are available in the [`/docs`](./docs) folder:

| File                                             | Description                                                     |
|--------------------------------------------------|-----------------------------------------------------------------|
| [`docs/architecture.md`](./docs/architecture.md) | Layer responsibilities, request flow, why Inertia over REST API |
| [`docs/modules.md`](./docs/modules.md)           | How to create and register a new module                         |
| [`docs/frontend.md`](./docs/frontend.md)         | Inertia page resolver, Vue pages, flash, pagination, Pinia      |
| [`docs/seeding.md`](./docs/seeding.md)           | Factory, seeder, and image caching flow                         |
| [`docs/testing.md`](./docs/testing.md)           | Patterns for unit, feature and Inertia tests                    |

---

## Architecture — Package by Feature

Each feature lives in its own module under `app/Modules/`, containing everything it needs to work independently — including its own Vue pages.

```
app/
├── Modules/
│   ├── Car/                         # Main module
│   │   ├── Interfaces/
│   │   │   ├── Http/
│   │   │   │   ├── Action/          # Invokable controllers (ListCar, ShowCar, UpdateCar, DestroyCar)
│   │   │   │   └── Requests/        # Form Requests with validation
│   │   │   └── Routes/
│   │   │       ├── api.php          # JSON routes (/api/cars)
│   │   │       └── web.php          # Inertia routes (/cars)
│   │   ├── Models/
│   │   │   └── Car.php
│   │   ├── Providers/
│   │   │   └── CarServicesProvider.php
│   │   ├── Repositories/
│   │   │   ├── Contracts/
│   │   │   │   └── CarRepositoryInterface.php
│   │   │   └── CarRepository.php
│   │   ├── Resources/
│   │   │   └── Pages/               # Vue pages owned by this module
│   │   │       ├── Index.vue
│   │   │       └── Show.vue
│   │   └── Services/
│   │       └── CarService.php
│   └── Comms/
│       └── Providers/
│           └── PaginationServiceProvider.php
└── Console/Commands/
    ├── MakeModulesCommand.php        # Artisan: scaffold a new module
    └── MakeTestModule.php            # Artisan: scaffold tests for a module
```

### Why Inertia.js fits Package by Feature

With Inertia, each module owns its Vue pages inside `Resources/Pages/`. The module is truly self-contained: routes, controller, service, repository, model, and UI all live together.

A custom resolver in `app.js` maps page names to module paths:

```
Inertia::render('Car/Index')
    └── app/Modules/Car/Resources/Pages/Index.vue
```

### Request flow

```
HTTP Request
    └── Action (Inertia::render or JSON response)
            └── Service (business logic)
                    └── Repository (data access)
                            └── Eloquent Model
```

---

## Features

- Car listing with pagination (Inertia SPA)
- View and edit a single car
- Delete with confirmation dialog (SweetAlert2)
- REST API still available via `Accept: application/json`
- Flash messages shared globally via `HandleInertiaRequests`
- Car images cached locally from loremflickr during seeding

---

## Installation

```bash
# 1. Clone and install dependencies
git clone <repo>
cd laravel-package-by-feature
composer install
npm install

# 2. Set up environment
cp .env.example .env
php artisan key:generate

# 3. Create storage symlink (required for car images)
php artisan storage:link

# 4. Run migrations and seed
php artisan migrate --seed

# 5. Start all servers in parallel
composer run dev
```

> On first seed, ~20 car images are downloaded from loremflickr and cached in `storage/app/public/cars/`. Subsequent seeds reuse the cache.

The `composer run dev` command starts concurrently: Laravel server, Vite, queue worker, and log viewer (Pail).

### Frontend structure

```
resources/js/
├── app.js           # Entry point — initializes Inertia + Vue + Pinia
├── bootstrap.js     # Axios setup
├── components/      # Reusable Vue components
└── stores/          # Pinia stores

app/Modules/{Module}/Resources/Pages/
└── *.vue            # Pages belong to their module, not a central folder
```

---

## Testing

```bash
# All tests
php artisan test

# Unit only
php artisan test --testsuite=Unit

# In parallel
php artisan test --parallel
```

**Current coverage:**

| Layer   | File                | Tests                                         |
|---------|---------------------|-----------------------------------------------|
| Unit    | `CarRepositoryTest` | list, show, insert, update, delete            |
| Unit    | `CarServiceTest`    | paginated list, show, edit, delete            |
| Feature | `ListCarActionTest` | returns view, returns JSON, handles exception |
| Feature | `ShowCarActionTest` | returns one car                               |
| Feature | `EditCarActionTest` | in progress                                   |

The test database uses an in-memory SQLite (`:memory:`) configured in `phpunit.xml`.

---

## Custom Artisan Commands

```bash
# Scaffold a new module
php artisan make:module ModuleName

# Scaffold tests for a module
php artisan make:test-module ModuleName
```

---

## Available Routes

| Method | URI              | Response           |
|--------|------------------|--------------------|
| GET    | `/cars`          | Inertia page (SPA) |
| GET    | `/cars/{id}`     | Inertia page (SPA) |
| PUT    | `/cars/{id}`     | Redirect           |
| DELETE | `/cars/{id}`     | Redirect           |
| GET    | `/api/cars`      | JSON               |
| GET    | `/api/cars/{id}` | JSON               |

---

## Test Structure

```
tests/
└── Modules/
    └── Car/
        ├── Feature/
        │   └── Actions/
        │       ├── ListCarActionTest.php
        │       ├── ShowCarActionTest.php
        │       └── EditCarActionTest.php
        └── Unit/
            ├── Repositories/
            │   └── CarRepositoryTest.php
            └── Services/
                └── CarServiceTest.php
```

---

## Learning Goals

- Structure a Laravel project with **Package by Feature** instead of flat MVC
- Apply the **Repository Pattern** with contracts (interfaces)
- Separate concerns with **Service Layer** and **Action Classes**
- Integrate **Inertia.js** to keep Vue pages co-located with their module
- Write unit and feature tests with mocks (Mockery)
- Use content negotiation to serve Inertia or JSON from the same action
