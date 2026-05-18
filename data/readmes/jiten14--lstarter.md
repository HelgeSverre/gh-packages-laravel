
# Lstarter

**Lstarter** is a Laravel package designed to streamline the process of **generating migrations, models, factories, seeders, controllers, routes & views** all at once, in addition to copying a `layout.blade.php` file with Bootstrap 5.3 integration. The package includes prepacked layouts that can be easily copied to your Laravel application's `resources/views/layouts` directory.This package simplifies the development process, allowing you to quickly set up essential parts of your Laravel application.
**Latest Release supports FillamentPhp. Documentation will be updated soon.**

## Installation

To install the Lstarter package, you can use Composer:

```bash
composer require jiten14/lstarter
```

## Usage

### Generate All at Once

After installing the package, you can generate the **migration, model, factory, seeder, controller, routes and views** files all at once by running the following simple Artisan command:

```bash
php artisan generate:package {model}
```
Replace `{model}` with the name of your model without curly bracket. This command will automatically create all the necessary files and set up your package.

### Individual File Generation

If you prefer to generate files one by one, you can still do so. Use the following commands:

- To generate a migration:
```bash
php artisan generate:migration {model}
```
- Note:- you can use --mo flag to add modifier to table column.

- To generate a model:
```bash
php artisan generate:model {model}
```

- To add relation to model:
```bash
php artisan generate:relation {model}
```

- To generate a controller:
```bash
php artisan generate:controller {model}
```

- To generate a factory with seeder:
```bash
php artisan generate:factory {model}
```

- To generate a routes:
```bash
php artisan generate:routes {model}
```

- To generate a index view:
```bash
php artisan generate:view-index {model}
```

- To generate a create view:
```bash
php artisan generate:view-create {model}
```

- To generate a edit view:
```bash
php artisan generate:view-edit {model}
```

- To generate a show view:
```bash
php artisan generate:view-show {model}
```

### Generate Layout

To generate and copy the layout.blade.php file, which includes Bootstrap 5.3 integration, run the following command:

```bash
php artisan generate:layout
```

## What the Command Does

### generate:package

- Creates a migration file in the `database/migrations` directory.
- Generates a model with appropriate relationships in the `app/Models` directory.
- Sets up the factory and seeder classes in the `database/factories` and `database/seeders` directories, respectively.
- Generates a controller file in the `app/Http/Controllers` directory.
- Add resource routes in `routes/web.php` file.
- Copies the `layout.blade.php` file to `resources/views/layouts` directory.
- Create a folder in plural form of model name in `resources/views/` directory and Generates views blade files (index,create,edit & show) in the that directory.

### generate:layout

- Copies the `layout.blade.php` file from the package's vendor directory to the `resources/views/layouts` directory of your Laravel application.
- The layout includes Bootstrap 5.3 integration and sections for displaying success and error messages.

## Layout Overview

The generated `layout.blade.php` file includes:

- **Bootstrap 5.3 Integration**: The layout is styled using Bootstrap 5.3, providing a responsive and modern design.
- **Session Messages**: It includes sections to display error and success messages using Laravel's session handling.

Here is an example of how the generated layout looks:

```blade
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Layout</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <!-- Success Message -->
        @if(session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

        <!-- Error Message -->
        @if(session('error'))
            <div class="alert alert-danger">
                {{ session('error') }}
            </div>
        @endif

        <!-- Content -->
        @yield('content')
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

## Customization

Although the generate:package command will generate the **migration, model, factory, seeder, controller, routes and views** files with prefilled data, you can also customize these files to suit your specific requirements. The generated files are located in the following directories:

- Migrations: `database/migrations`
- Models: `app/Models`
- Controllers: `app/Http/Controllers`
- Factories: `database/factories`
- Seeders: `database/seeders`
- Routes: `routes/web.php`
- Layouts: `resources/views/layouts`
- views: `resources/views/{models}`

You can modify the code within these files to add custom fields, validation rules, relationships, or any other specific logic needed for your application.

## Contribution

If you'd like to contribute to this package:

1. Fork the repository on GitHub.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a Pull Request on GitHub.

## Versioning

Lstarter follows semantic versioning:

- **v1.0.0**: Initial release.
- **v1.0.1**: Minor Fixes & refactor the code.
- **v1.1.0**: Added features to Generate Migration, Model, Controller, Factory & Seeder.
- **v1.1.1**: Minor Fixes to Controller Generator.
- **v1.1.2**: Bug Fixes, Refactor the Code & Menu Generation.
- **v1.2.0**: Features added to Generate Routes & Views.
- **v1.2.1**: Add support for Laravel 11.
- **v1.2.2**: Add support for Fillamentphp.
- **v1.3.0**: Upcoming features or improvements will be released in this version.

### How to Update

To update the package to a newer version:

```bash
composer update jiten14/lstarter
```

### Downgrading

If you need to revert to a previous version:

```bash
composer require jiten14/lstarter:1.1.2
```

## Support & Contact

If you encounter any issues or bugs, or if you need support with this package, feel free to reach out. I am happy to help you!

**Author**: Jitendriya Tripathy  
**Email**: [Jiten's email](mailto:jitendriya14@gmail.com)

## License

This package is open-source software licensed under the [MIT license](LICENSE).
