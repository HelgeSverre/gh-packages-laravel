# Toolkit for creating Laravel packages

[![Latest Version](https://img.shields.io/packagist/v/porifa/laravel-package-kit.svg?style=flat-square)](https://packagist.org/packages/porifa/laravel-package-kit)
[![GitHub Tests Action Status](<https://img.shields.io/github/workflow/status/porifa/laravel-package-kit/pest?label=Tests%20(Pest)>)](https://github.com/porifa/laravel-package-kit/actions?query=workflow%3Apest+branch%3Amain)
[![GitHub Code Style Action Status](<https://img.shields.io/github/workflow/status/porifa/laravel-package-kit/Pint?label=Code%20Style%20(Pint)>)](https://github.com/porifa/laravel-package-kit/actions?query=workflow%3Apint+branch%3Amain)
[![Quality Score](https://img.shields.io/scrutinizer/g/porifa/laravel-package-kit.svg?style=flat-square)](https://scrutinizer-ci.com/g/porifa/laravel-package-kit)
[![Downloads](https://img.shields.io/packagist/dt/porifa/laravel-package-kit.svg?style=flat-square)](https://packagist.org/packages/porifa/laravel-package-kit)
[![License](https://img.shields.io/packagist/l/porifa/laravel-package-kit.svg?style=flat-square)](https://packagist.org/packages/porifa/laravel-package-kit)

This package contains a `PackageServiceProvider` that you can use in your packages to easily register config files, commands, migrations and more.

## Usage
In your package you should let your service provider extend `Porifa\LaravelPackageKit\PackageServiceProvider`.

```php
use Porifa\LaravelPackageKit\PackageServiceProvider;
use Porifa\LaravelPackageKit\Package;

class YourPackageServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('your-package-name')
            ->hasConfigFiles()
            ->hasViews();
    }
}
```
Passing the package name to `name` is mandatory.

### Working with a config file

To register a config file, you should create a php file with your package name in the `config` directory of your package. In this example it should be at `<package root>/config/your-package-name.php`.

To register that config file, call `hasConfigFiles()` on `$package` in the `configurePackage` method.

```php
$package
    ->name('your-package-name')
    ->hasConfigFiles();
```


If no parameter is passed in `hasConfigFiles` method then we use a convension, if your package name starts with `laravel-`, we expect that your config file does not contain that prefix. So if your package name is `laravel-cool-package`, the config file should be named `cool-package.php`.

The `hasConfigFiles` method will also make the config file publishable. Users of your package will be able to publish the config file with this command.

```bash
php artisan vendor:publish --tag=your-package-name-config
```

If your package have multiple config files then you can pass their names as an array to `hasConfigFiles`

```php
$package
    ->name('your-package-name')
    ->hasConfigFiles(['config-file1', 'config-file2']);
```

### Working with commands

You can register any command you package provides with the `hasCommands` method.

```php
$package
    ->name('your-package-name')
    ->hasCommands(YourPackageCommand::class);
```

If your package provides multiple commands, you can pass an array to `hasCommands` method.

```php
$package
    ->name('your-package-name')
    ->hasCommands([
        YourPackageCommand::class,
        YourOtherPackageCommand::class,
    ]);
```

### Working with migrations


To register your migration(s), you should create `php` OR `php.stub` file(s) in the `database/migrations` directory of your package. In this example it should be at `<package root>/database/migrations`. 

To register migrations, call `hasMigrations()` on `$package` in the `configurePackage` method and you should pass its name without the extension to the `hasMigrations` method.

If your migration file is called `create_my_package_tables.php.stub` you can register them like this:

```php
$package
    ->name('your-package-name')
    ->hasMigrations('create_my_package_tables');
```

If your package provides multiple migration files, you can pass an array to `hasMigrations` method.

```php
$package
    ->name('your-package-name')
    ->hasMigrations(['my_package_tables', 'some_other_migration']);
```

Calling `hasMigrations` will also make migrations publishable. Users of your package will be able to publish the
migrations with this command:

```bash
php artisan vendor:publish --tag=your-package-name-migrations
```

Like you might expect, published migration files will be prefixed with the current datetime.

You can also enable the migrations to be registered without needing the users of your package to publish them:

```php
$package
    ->name('your-package-name')
    ->hasMigrations(['my_package_tables', 'some_other_migration'])
    ->runsMigrations();
```

### Working with views


To register your views, you should create `.blade.php` file(s) in the `resources/views` directory of your package. In this example it should be at `<package root>/resources/views`. 

To register views, call `hasViews()` on `$package` in the `configurePackage` method.

```php
$package
    ->name('your-package-name')
    ->hasViews();
```

Calling `hasViews` will also make views publishable. Users of your package will be able to publish the
views with this command:

```bash
php artisan vendor:publish --tag=your-package-name-views
```
If you have a view `<package root>/resources/views/myView.blade.php`, you can use it like
this: `view('your-package-name::myView')`. Of course, you can also use subdirectories to organise your views. A view
located at `<package root>/resources/views/subdirectory/myOtherView.blade.php` can be used
with `view('your-package-name::subdirectory.myOtherView')`.

If you want to use custom namespace then pass it to the `hasViews` method.
If your custom namespace is `cool-namespace` you can use like this:

```php
$package
    ->name('your-package-name')
    ->hasViews('cool-namespace');
```
Now you can use it like this

```php
view('cool-namespace::myView');
```

Like you might expect, views are also registered without needing the users of your package to publish them.


### Sharing global data with views

You can share data with all views using the `sharesDataWithAllViews` method. This will make the shared variable
available to all views.

```php
$package
    ->name('your-package-name')
    ->sharesDataWithAllViews('companyName', 'Porifa');
```

### Working with Blade view components

Any Blade view components that your package provides should be placed in the `<package root>/src/Components` directory.

You can register these views with the `hasViewComponents` command.

```php
$package
    ->name('your-package-name')
    ->hasViewComponents('foobar', Cool::class);
```

This will register your view components with Laravel. In the case of `Cool::class`, it can be referenced in views
as `<x-foobar-cool />`, where `foobar` is the prefix you provided during registration.

Calling `hasViewComponents` will also make view components publishable, and will be published
to `app/Views/Components/vendor/<package name>`.

Users of your package will be able to publish the view components with this command:

```bash
php artisan vendor:publish --tag=your-package-name-components
```

### Working with view composers

You can register any view composers that your project uses with the `hasViewComposers` method. You may also register a
callback that receives a `$view` argument instead of a classname.

To register a view composer with all views, use an asterisk as the view name `'*'`.

```php
$package
    ->name('your-package-name')
    ->hasViewComposer('viewName', MyViewComposer::class)
    ->hasViewComposer('*', function($view) { 
        $view->with('sharedVariable', 123); 
    });
```

### Using lifecycle hooks

According to your package needs, You can put any custom logic in these methods:

-   `packageRegistering`: will be called at the start of the `register` method of `PackageServiceProvider`
-   `packageRegistered`: will be called at the end of the `register` method of `PackageServiceProvider`
-   `packageBooting`: will be called at the start of the `boot` method of `PackageServiceProvider`
-   `packageBooted`: will be called at the end of the `boot` method of `PackageServiceProvider`

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/porifa/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Aamir Sohail KmAs](https://github.com/AamirSohailKmAs)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
