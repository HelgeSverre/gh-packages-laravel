# Creopse - A Hybrid Content Management System (CMS)

Welcome to **Creopse**, a powerful and hybrid Content Management System (CMS) built to empower your Laravel web applications. Follow this detailed guide to install and set up Creopse seamlessly.

---

## 🚀 Features

- **Hybrid CMS**: Combines simplicity and flexibility for managing content.
- **Built on Laravel**: Fully leverages Laravel's modern features.
- **Developer-Friendly**: Easy installation and configuration process.

---

## 📋 Requirements

Before starting, ensure your environment meets the following prerequisites:

- **Laravel**: Version 10, 11, 12, or 13 is required.
- **PHP**:
  - Laravel 10: minimum version 8.1
  - Laravel 11 & 12: minimum version 8.2
  - Laravel 13: minimum version 8.3
- **Composer**: To manage dependencies.
- **pnpm**: Required to manage and build frontend assets.

---

## 🛠️ Installation Guide

### 1. Install Laravel

Create a new Laravel project:

**Laravel 10:**

```bash
composer create-project laravel/laravel:^10.0 project-name
```

**Laravel 11:**

```bash
composer create-project laravel/laravel:^11.0 project-name
```

**Laravel 12:**

```bash
composer create-project laravel/laravel:^12.0 project-name
```

**Laravel 13:**

```bash
composer create-project laravel/laravel:^13.0 project-name
```

---

### 2. Add Creopse to your project

Add the Creopse package via Composer:

```bash
composer require creopse/creopse
```

---

### 3. Install Creopse files

Run the install command to publish the configuration files and initialize the frontend
structure of your project.

#### If [Creopse CLI](https://github.com/creopse/cli) is installed globally

```bash
creopse install
```

#### Otherwise, via Artisan

For a **Vue** frontend:

```bash
php artisan creopse:install -t vue
```

For a **React** frontend:

```bash
php artisan creopse:install -t react
```

> [!NOTE]
> This command also generates an `install.lock` file in `public/creopse`,
> which activates the configuration wizard on first access to `/creopse/`.

---

### 4. Start the development server

Regardless of the configuration approach chosen (automatic or manual below),
this step is required to compile assets and start rendering the site:

```bash
pnpm dev
```

---

### 5. Configuration

Two approaches are available. **Choose one or the other**, not both.

#### Option A — Automatic configuration (recommended)

Navigate to the administration interface:

```text
http://your-domain/creopse/
```

The wizard will guide you through configuring:

- The server URL.
- The database connection.
- The administrator account.

Once configuration is complete, the `install.lock` file is deleted automatically.

#### Option B — Manual configuration

**5.1. Configure the database**

Update your `.env` file:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Then run the migrations and seeders:

```bash
php artisan migrate --seed
```

**5.2. Delete the `install.lock` file**

Delete `public/creopse/install.lock` to unlock access to the administration interface.
As long as this file is present, any visit to `/creopse/` is redirected to the
installation wizard.

```bash
rm public/creopse/install.lock
```

**5.3. Update `public/creopse/config.jsonc`**

Set the `apiBaseUrl` value to match your backend URL:

```jsonc
{
  "apiBaseUrl": "https://your-domain"
}
```

**5.4. Access the administration interface**

```text
http://your-domain/creopse/
```

Log in with the default credentials:

- **Username**: `admin`
- **Password**: `admin`

> [!WARNING]
> Change these credentials immediately after your first login.

## 🎉 You're Ready to Go

Creopse is now fully installed and ready for development. Explore its hybrid CMS capabilities and build amazing applications effortlessly.

---

## 📖 Additional Resources

For detailed documentation and advanced configurations, check out:

- [Official Documentation](https://creopse.github.io/docs/)
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia Documentation](https://inertiajs.com/)

For support, feel free to contact us or open an issue in the repository.
