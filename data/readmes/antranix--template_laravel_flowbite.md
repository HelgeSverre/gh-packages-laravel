# Laravel + Livewire + Tailwind + Flowbite Template

A base template to start projects with **Laravel 12**, **Livewire**, **Tailwind CSS**, **Flowbite**, permissions via **Spatie**, and common development utilities. It’s meant to be cloned and used as a starting point.

---

## 🧰 Main Features

* Laravel ^12.0
* Livewire ^3.6
* Tailwind CSS ^4.1
* Flowbite for easy-to-use UI components
* Role and permission management with **spatie/laravel-permission**
* Power Components via **livewire-powergrid** for dynamic tables and advanced grids
* Development tools included (faker, testing with Pest, mockery, Pint, etc.)

---

## 📦 Included Packages

These are the most important packages already configured:

**Composer / Backend:**

| Package                               | What it’s for                       |
| ------------------------------------- | ----------------------------------- |
| `php ^8.2`                            | Minimum PHP version required        |
| `laravel/framework ^12.0`             | Core framework                      |
| `laravel/tinker`                      | Interactive console tool            |
| `livewire/livewire`                   | Reactive UI without much JavaScript |
| `power-components/livewire-powergrid` | Powerful tables/grids with Livewire |
| `spatie/laravel-permission`           | Roles and permissions management    |

**Require-dev (backend, only for development/testing):**

* fakerphp/faker (fake data)
* laravel/pint (code formatting)
* laravel/sail (local Docker environment)
* mockery/mockery, nunomaduro/collision (testing, error handling)
* pestphp/pest & pestphp/pest-plugin-laravel (more pleasant testing experience)

**Node / Frontend:**

* tailwindcss, postcss, autoprefixer
* vite + laravel-vite-plugin
* flowbite
* dev dependencies such as concurrently, etc.

---

## 🚀 How to Use

Here are the steps to get started with your copy of the template:

1. **Clone the repository**

   ```bash
   git clone https://github.com/antranix/template_laravel_flowbyte.git project-name
   cd project-name
   ```

2. **Install PHP dependencies**

   ```bash
   composer install
   ```

3. **Copy the environment file and configure**

   ```bash
   cp .env.example .env
   ```

   * Set up the database (`DB_…`)
   * Adjust other environment variables like `APP_NAME`, `APP_URL`, etc.

4. **Generate application key**

   ```bash
   php artisan key:generate
   ```

5. **Migrations and seeders (if applicable)**

   ```bash
   php artisan migrate
   ```

   If you have seeders or initial users, run:

   ```bash
   php artisan db:seed
   ```

6. **Install Node dependencies and compile assets**

   ```bash
   npm install
   npm run dev
   ```

   When you’re ready for production:

   ```bash
   npm run build
   ```

7. **Serve the application**

   You can use:

   ```bash
   php artisan serve
   ```

   Or with Sail (if you use it):

   ```bash
   ./vendor/bin/sail up
   ```

---

## 🔧 Using Livewire, Powergrid, and Permissions

* Use Livewire for reusable components and reactive UI.
* Powergrid makes creating tables with search, filters, pagination, etc., easier.
* `spatie/laravel-permission` allows defining roles and permissions. In production, make sure to migrate its tables and assign proper roles.

---

## 🧪 Testing

The template includes:

* **Pest** + plugin for Laravel
* Mockery for mocks/stubs in tests
* Faker for generating fake/test data

You can run tests with:

```bash
./vendor/bin/pest
```

---

## 🏗 Suggested Structure

Here are some conventions and structure you might follow:

* Livewire Components in `app/Http/Livewire/`
* Blade views for Livewire components in `resources/views/livewire/`
* Custom styles in `resources/css` and Tailwind configuration in `tailwind.config.js`
* JS / Vite assets in `resources/js`

---

## ⚙️ Best Practices

* Don’t expose sensitive logic in Livewire components (use protected properties, form requests, etc.)
* Always validate user input
* Use roles/permissions correctly
* Keep assets optimized and compiled for production
* Do frequent testing

---

## 📄 License

This project will be under the **MIT** license (or whichever you decide). You may use it freely, adapt it, but preserve the original copyright if you publish it publicly.

---

## 🙌 Contributions

If someone wants to use this as a base or contribute:

* Fork the repo
* Create branches for each feature/new change
* Keep the README updated
* Make sure tests pass before merging

---

## 📝 Version Details

| Component         | Minimum Version Used in Template |
| ----------------- | -------------------------------- |
| PHP               | 8.2+                             |
| Laravel           | 12+                              |
| Livewire          | 3.6+                             |
| TailwindCSS       | 4.1+                             |
| Flowbite          | 3.1.2                            |
| PowerGrid         | 6.6                              |
| Spatie Permission | 6.21                             |

---

## 🧾 Contact / Support

If you find bugs or have suggestions, open an *issue* in the repository. All collaboration is welcome!

---

Thanks for using this template! 🛠️

---

