# Filamentum

<p align="center">
<a href="https://github.com/kanekescom/filamentum/actions"><img src="https://github.com/kanekescom/filamentum/actions/workflows/tests.yml/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/kanekescom/filamentum"><img src="https://img.shields.io/packagist/dt/kanekescom/filamentum" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/kanekescom/filamentum"><img src="https://img.shields.io/packagist/v/kanekescom/filamentum" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/kanekescom/filamentum"><img src="https://img.shields.io/github/license/kanekescom/filamentum" alt="License"></a>
</p>

## About Filamentum

Filamentum is a Laravel starter kit with the Filament admin panel and essential packages pre-installed.

### Features

#### **Application Menu**
- [x] Dashboard
- [x] Users management
- [x] Roles management

#### **Development Tools**
- [x] Laravel Debugbar for debugging assistance
- [x] Laravel Telescope for monitoring and debugging

#### **Deployment Tools**
- [x] Laravel Sail for containerized development
- [x] Laravel Octane for high-performance serving

## Installation

You can install Filamentum in two ways:

### 1. Via Laravel Installer *(Recommended)*

Create a new project using Laravel installer with Filamentum as the starter kit:

```bash
laravel new my-app --using=kanekescom/filamentum
```

> **Note:** For more information about Laravel Installer, please refer to the [official Laravel Installer documentation](https://laravel.com/docs/12.x/installation#the-laravel-installer).

### 2. Via Composer

You can install Filamentum in two ways:

a. Using Composer Create-Project:
```bash
composer create-project kanekescom/filamentum my-app
```

b. Clone from GitHub:
```bash
git clone https://github.com/kanekescom/filamentum.git my-app
cd my-app
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

After installation, your application will be ready with all the essential packages and configurations set up.

### Configuration File

These settings are defined in `config/filamentum.php`.

## Creating Users

To access the Filament admin panel, you'll need to create user accounts. The recommended approach is to use database seeding which creates predefined users with specific roles.

### Database Seeding *(Recommended)*

Run the following command to create default users with predefined roles:

```bash
php artisan db:seed
```

This command creates a complete user management system with:

1. **Three predefined roles**:
   - Super Admin (can access Dashboard, Users, and Roles)
   - Admin (can access Dashboard and Users)
   - User (can only access Dashboard)

2. **Three corresponding users** with the following credentials:

| Name                   | Email                     | Role        | Password  |
|------------------------|---------------------------|-------------|-----------|
| Super Admin User       | superadmin@filamentum.com | Super Admin | password  |
| Admin User             | admin@filamentum.com      | Admin       | password  |
| Regular User           | user@filamentum.com       | User        | password  |

Once created, you can log in to the admin panel at `/app` using any of these credentials.

### Interactive Command (Alternative)

If you prefer to create individual users interactively, you can use:

```bash
php artisan make:filament-user
```

This command will prompt you to enter the user's name, email, and password. Note that users created this way will need to be manually assigned roles and permissions.

## Filamentum Configuration

Filamentum provides several configuration options that allow you to customize the admin panel behavior. These settings can be configured through environment variables in your `.env` file.

### Panel Path Configuration

You can change the URL path for the Filament admin panel:

```env
FILAMENTUM_PATH=app
```

The default path is `app`, which makes the admin panel accessible at `/app`. You can change this to any path you prefer, such as `admin` or `dashboard`.

### Feature Toggles

Filamentum allows you to enable or disable various authentication features:

```env
FILAMENTUM_REGISTRATION=true
FILAMENTUM_PASSWORD_RESET=true
FILAMENTUM_EMAIL_VERIFICATION=true
FILAMENTUM_EMAIL_CHANGE_VERIFICATION=true
FILAMENTUM_PROFILE=true
```

- `FILAMENTUM_REGISTRATION`: Enable or disable user registration (default: false)
- `FILAMENTUM_PASSWORD_RESET`: Enable or disable password reset functionality (default: false)
- `FILAMENTUM_EMAIL_VERIFICATION`: Enable or disable email verification (default: false)
- `FILAMENTUM_EMAIL_CHANGE_VERIFICATION`: Enable or disable email change verification (default: false)
- `FILAMENTUM_PROFILE`: Enable or disable user profile management (default: true)

## Laravel Sail

This project comes with Laravel Sail pre-installed for Docker-based development environments. To get started with Sail, you'll need to have Docker installed on your system.

After installing Docker, you can start the Sail environment with:

```bash
./vendor/bin/sail up
```

Once the containers are up, you can access your application in your web browser at http://localhost.

For more information about Laravel Sail configuration and usage, please refer to the [official Laravel Sail documentation](https://laravel.com/docs/12.x/sail).

## Laravel Octane

This project comes with Laravel Octane pre-installed for high-performance serving of your Laravel application. To use Octane with FrankenPHP (the default server for this project), you need to run the installation command:

```bash
php artisan octane:install
```

When prompted, select "frankenphp" as your server.

After installation, you can start your application using Octane with:

```bash
php artisan octane:start
```

> **Note:** For more information about Laravel Octane configuration and usage, please refer to the [official Laravel Octane documentation](https://laravel.com/docs/12.x/octane).

## Running Tests

### PHPUnit Configuration

Before running tests, copy the PHPUnit configuration template:

```bash
cp phpunit.xml.dist phpunit.xml
```

The `phpunit.xml` file is gitignored, allowing you to add custom environment variables (such as API credentials) without committing them to the repository.

### Running the Test Suite

You can run the test suite using Composer:

```bash
composer test
```

This will execute all tests using PestPHP, which is configured as the default testing framework for this project.

Alternatively, you can run tests directly using the Artisan command:

```bash
php artisan test
```

## Installed Packages

Filamentum comes with several pre-installed packages to help you build your application:

- [laravel/framework](https://github.com/laravel/framework) v12 - The core Laravel framework
- [laravel/octane](https://github.com/laravel/octane) v2 - High-performance Laravel application server
- [laravel/sail](https://github.com/laravel/sail) v1 - Docker setup for Laravel applications
- [laravel/telescope](https://github.com/laravel/telescope) v5 - Debug assistant for Laravel
- [filament/filament](https://github.com/filamentphp/filament) v4 - Admin panel & app UI framework
- [bezhansalleh/filament-shield](https://github.com/bezhanSalleh/filament-shield) v4 - Role & permission management
- [spatie/laravel-permission](https://github.com/spatie/laravel-permission) v6 - Roles and permissions management
- [barryvdh/laravel-debugbar](https://github.com/barryvdh/laravel-debugbar) v3 - Debug bar for Laravel

## Recommended Additional Packages

To further enhance your Laravel application, consider adding these recommended packages:

- [laravel/horizon](https://github.com/laravel/horizon) - Dashboard for Laravel queues
- [laravel/nightwatch](https://github.com/laravel/nightwatch) - Application monitoring tool
- [laravel/passport](https://github.com/laravel/passport) - OAuth2 server for API authentication
- [laravel/sanctum](https://github.com/laravel/sanctum) - Authentication for SPAs and APIs
- [laravel/socialite](https://github.com/laravel/socialite) - OAuth authentication with social networks
- [barryvdh/laravel-ide-helper](https://github.com/barryvdh/laravel-ide-helper) v3 - IDE helper files for Laravel

Refer to each package's documentation for specific installation and configuration instructions.

## License

Filamentum is open-sourced software licensed under the [MIT license](LICENSE).
