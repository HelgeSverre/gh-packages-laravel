# CMS Bootstrap for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/voorhof/cms.svg?style=flat-square)](https://packagist.org/packages/voorhof/cms)
[![Run tests](https://github.com/voorhof/cms/actions/workflows/run-test.yml/badge.svg)](https://github.com/voorhof/cms/actions/workflows/run-test.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/voorhof/cms/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/voorhof/cms/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/voorhof/cms.svg?style=flat-square)](https://packagist.org/packages/voorhof/cms)

This is a CMS template for Laravel 12 using [Bootstrap 5](https://getbootstrap.com/) as the frontend toolkit.  
It includes all routes, controllers, requests, policies, views, ...  
for User and Role management, together with a Post model and all it's CRUD functionality.  
An excellent basic starting point for every application not using React, Vue, Livewire, ...  
only Blade and a little KISS 💋

## Installation

You can install the package via composer.

```bash
composer require voorhof/cms
```

Run the artisan command to install the CMS structure,  
this will copy all necessary files to your app and update existing ones (a backup option is available).

```bash
php artisan cms:install
```

After installation, the database will automatically be refreshed and seeded with factory data;  
you can always customize the **CmsSeeder** file to your development needs.

Although it is not required for installing this CMS package,  
ideally a user authentication for registering, login,... should be present in your project.  
If you don't have auth scaffolding installed,
[Voorhof Bries](https://github.com/voorhof/bries) is available in this package.   
When you choose to use Bries, be sure to execute this artisan command before calling cms:install

```bash
php artisan bries:install
```

To make things even easier, you can install both Bries and CMS with one single command.  
Please take note this uses the default installation options for both Bries and CMS.  
If you want to customize the Bries installation using your preferred options,  
install the packages separately as described above.

```bash
php artisan cms:bries
```

Under the hood [Laravel Permission](https://spatie.be/docs/laravel-permission/v6) from Spatie is used for authorization.  
Everything needed for this template is already in place after installation,  
but if you feel the need to re-publish the config file and database migration in the future, do so with this command.  
Keep in mind that the default Spatie [Role model has been extended](https://spatie.be/docs/laravel-permission/v6/advanced-usage/extending), 
so you will probably have to update that again in the permissions.php config file.

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

## Testing

After installation there will be a new set of test files present in your project.  
Make sure you run the composer tests and check everything is working properly.

```bash
php artisan test
```


## Credits

- [David Carton](https://github.com/voorhof)
- [All Contributors](https://github.com/voorhof/cms/contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
