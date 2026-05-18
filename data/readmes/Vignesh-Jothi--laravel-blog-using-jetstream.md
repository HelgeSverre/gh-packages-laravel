# laravel-blog-using-jetstream

# Laravel Blog Project

[![Laravel Version](https://img.shields.io/badge/Laravel-%3E=10.x-red)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-%3E=8.1-blue)](https://www.php.net/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)
[![Livewire](https://img.shields.io/badge/Livewire-3.0-4B32C3)](https://laravel-livewire.com)
[![Filament](https://img.shields.io/badge/Filament-3.2-orange)](https://filamentphp.com)
[![Jetstream](https://img.shields.io/badge/Jetstream-4.3-blue)](https://jetstream.laravel.com)

## Overview

This is a blog application built with **Laravel 10**, integrating powerful tools such as **Filament**, **Livewire**, and **Jetstream**. The project aims to provide a robust and scalable platform for creating and managing blog posts with a user-friendly interface and real-time features.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contribution](#contribution)
- [License](#license)

## Features

- **User Authentication**: Secure authentication powered by Jetstream.
- **Admin Panel**: Manage blog posts, categories, and users through an intuitive admin panel with Filament.
- **Real-Time Updates**: Dynamic and interactive components utilizing Livewire for a seamless user experience.
- **Blog Management**: Create, update, delete, and publish blog posts.
- **Category Management**: Organize blog posts into categories for easy navigation.
- **User Roles and Permissions**: Role-based access control for different user types (admin, editor, viewer).

## Requirements

- PHP 8.1 or higher
- Composer
- Node.js & npm
- MySQL or any other supported database

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/laravel-blog-using-jetstream.git
    cd laravel-blog-using-jetstream
    ```

2. **Install dependencies**:
    ```bash
    composer install
    npm install
    ```

3. **Set up environment variables**:
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Update the `.env` file with your database credentials and other environment settings.

4. **Generate application key**:
    ```bash
    php artisan key:generate
    ```

5. **Run migrations**:
    ```bash
    php artisan migrate
    ```

6. **Install and configure Jetstream**:
    ```bash
    php artisan jetstream:install livewire
    ```

7. **Build assets**:
    ```bash
    npm run build
    ```

8. **Seed the database** (optional):
    ```bash
    php artisan db:seed
    ```

9. **Serve the application**:
    ```bash
    php artisan serve
    ```

## Usage

- **Admin Panel**: Accessible at `/admin`, where you can manage posts, categories, and users.
- **Blog Frontend**: The blog can be viewed at the root URL. Visitors can browse posts by category and search for content.
- **User Authentication**: Users can register, log in, and manage their profiles using Jetstream's authentication features.

## Testing

Run the automated tests to ensure that everything is working as expected:

```bash
php artisan test
```

For continuous integration, the build status and coverage are tracked using GitHub Actions and Coveralls.

## Deployment

For deploying this application to a production server, ensure you have properly set up your environment variables, configured your web server, and optimized your application:

```bash
php artisan optimize
```

Consider using services like [Laravel Forge](https://forge.laravel.com/) for easy server management and deployment.

## Contribution

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

Please ensure your code follows the PSR-12 coding standard and includes relevant tests.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
