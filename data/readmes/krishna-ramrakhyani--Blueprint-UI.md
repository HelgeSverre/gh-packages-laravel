# UiScaffold (Blueprint UI)

A Laravel package that turns a **simple YAML resource definition** into:

- Models
- Migrations
- Controllers
- Server-side DataTables
- And a **runtime UI engine** (buttons, inputs, forms, modals, layouts)

No Blade spaghetti.  
No hard-coded HTML.  
No repeated CRUD boilerplate.

---

## ✨ What is UiScaffold?

UiScaffold is **not just a CRUD generator**.

It is a **resource-driven scaffold + runtime UI engine** for Laravel.

You define your domain once (in YAML), and UiScaffold:

- Generates backend code (models, migrations, controllers)
- Generates DataTables (PHP + JS + Blade)
- Registers everything into a runtime registry
- Gives you a **component-based UI API** like:

```blade
{{ datatable('activities') }}

{!! 
form('/save')
    ->with(
        input('email'),
        select('role')->options(['admin'=>'Admin','user'=>'User']),
        button('Save')->submit()
    )
!!}
````

Think **Laravel + declarative UI + runtime composition**.

---

## 🚀 Installation

---
#### Initial Step: Clone the Repo

---

### 1. Open Composer.json and Require the package

If using locally (recommended during development) turn "minimum-stability" to -> "dev" , then:

```json
"repositories": [
  {
    "type": "path",
    "url": "../ui-scaffold"
  }
]
```

Then:

```bash
composer require framework/ui-scaffold:*
```

---

### 2. Register the Service Provider

If auto-discovery is disabled, add:

```php
Framework\UiScaffold\UiScaffoldServiceProvider::class,
```

to `config/app.php`.

---

## 🎨 Publish UI templates

UiScaffold ships with **Bootstrap and Tailwind UI templates**.

Publish them:

```bash
php artisan vendor:publish --tag=ui-scaffold-ui
```

This creates:

```
resources/views/vendor/ui-scaffold/
├── bootstrap/
│   ├── button.blade.php
│   ├── input.blade.php
│   ├── form.blade.php
│   └── ...
└── tailwind/
    └── ...
```

You are free to customize these.

---

## 🧬 Defining resources (YAML)

Create a YAML file (for example `config/ui.yaml`):

```yaml
resources:
  - name: activity
    model: UserActivity
    table: user_activities

    generate:
      model: true
      migration: true
      controller: true
      datatable: true

    schema:
      - name: user_id
        type: integer
      - name: action
        type: string
      - name: subject_type
        type: string
      - name: subject_id
        type: integer
      - name: created_at
        type: datetime

    datatable:
      columns:
        - name: user_id
        - name: action
        - name: subject_type
        - name: created_at
```

> ⚠️ YAML only describes **domain & intent**
> UI layout and styling are handled by the runtime, not YAML.

---

## ⚙️ Generate code from YAML

Run:

```bash
php artisan ui:generate config/ui.yaml
```

This generates:

* `app/Models/UserActivity.php`
* migration for `user_activities`
* controller
* DataTable class (Yajra)
* JS for DataTables
* Blade index page
* Runtime registry (`app/UiScaffold/registry.php`)

---

## 📊 Rendering a DataTable

In any Blade view:

```blade
@section('styles')
    {{ datatable('activities')->styles() }}
@endsection

@section('main-content')
    {{ datatable('activities') }}
@endsection

@section('scripts')
    {{ datatable('activities')->scripts() }}
@endsection
```

That’s it.

No manual JS wiring.
No duplicated markup.

---

## 🧩 Runtime UI Components (no YAML)

UiScaffold also provides **runtime UI components** that work like a UI language.

### Available components

* `button()`
* `input()`
* `textarea()`
* `select()`
* `checkbox()`
* `form()`
* `modal()`
* `row()`
* `alert()`

### Example

```blade
{!! 
form('/save')
    ->with(
        input('email')->class('form-control'),
        textarea('bio'),
        select('role')->options([
            'admin' => 'Admin',
            'user' => 'User'
        ]),
        checkbox('terms', 'Accept Terms')->checked(),
        row()->right(
            button('Save')->submit()
        )
    )
!!}
```

This renders a fully styled, aligned form — no HTML written by hand.

---

## 🧠 How it works (high level)

```
YAML
  ↓
Generators
  ↓
PHP registry (compiled)
  ↓
Runtime components
  ↓
Blade views
  ↓
JS / Server-side rendering
```

* YAML is **compile-time**
* Registry is **runtime**
* UI components are **objects**, not includes

---

## 🧪 Requirements

* PHP 8.1+
* Laravel 9+
* Yajra DataTables (for datatables)
* jQuery + DataTables (loaded automatically)

---

## 🤝 Contributing

This project is **actively evolving**.

Contributions welcome in:

* New UI components
* Tailwind themes
* Better generators
* Documentation
* Tests
* DX improvements

Ideas, discussions, and PRs are all welcome.

---

## 🧭 Roadmap

* Grid / column layout components
* Field validation bindings
* Enum support
* Action buttons in datatables
* Headless UI mode
* Docs site

---

## 💬 Why this exists

Laravel is amazing at backend structure.
UI scaffolding is still fragmented.

UiScaffold tries to bridge that gap by combining:

* declarative resources
* compiled scaffolding
* and a runtime UI engine

If you like building systems instead of repeating code — this is for you.
