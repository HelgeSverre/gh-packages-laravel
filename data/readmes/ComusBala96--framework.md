# This is an OrianSoft Framework Package


---
This repo can be used to scaffold a Laravel package. Follow these steps to get started:

1. Press the "Use this template" button at the top of this repo to create a new repo with the contents of this skeleton.
2. Run "php ./configure.php" to run a script that will replace all placeholders throughout all the files.
3. Have fun creating your package.
4. If you need help creating a package, consider picking up our <a href="https://laravelpackage.training">Laravel Package Training</a> video course.
---


## Installation

You can install the package via composer:

```bash
composer require orians/framework
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="framework-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="framework-config"
```

## Credits

- [Comus Bala](https://github.com/comusbala96)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
