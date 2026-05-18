![alt text][logo]

[logo]: http://www.redooor.com/assets/img/redminportal_logo_sm.png "RedminStore"

# RedminStore by Redooor

A Laravel 5.1 package as a **frontend** theme for Ecommerce sites using RedminPortal as backend administrating tool. Serves as an example for developers who wish to build an online store with RedminPortal.

# Table of Content
1. [Compatibility](#compatibility)
2. [Models and Features](#models-and-features)
3. [Installation guide for Users](#installation-guide-for-users)
4. [Installation guide for Contributors](#installation-guide-for-contributors)
5. [Testing](#testing)
6. [Versioning](#versioning)
7. [Contributing](#contributing)
8. [Creator](#creator)
9. [License](#license)
10. [External Libraries Used](#external-libraries-used)
11. [Change log](#change-log)
12. [Upgrade Guide](#upgrade-guide)

#Compatibility

| Laravel | RedminStore |
|:-------:|:------------:|
| 5.1     | 0.1.x        |

# Models and Features

Refer to [RedminPortal](https://github.com/redooor/redminportal) for the list of supported models and features.

# Installation guide for Users

You can install Laravel version 5.1 using the command:

    composer create-project laravel/laravel myproject 5.1.*

1. Add Redminstore to composer.json of a new Laravel application, under "require". Like this:

        "require": {
            "laravel/framework": "5.1.*",
            "redooor/redminportal": "0.3.*",
            "redooor/redminstore": "0.1.*"
        },

Due to the use of getID3 package, we need to set the minimum-stability to "dev" but prefer-stable to "true". Like this:

        "minimum-stability": "dev",
        "prefer-stable": true

**This package is dependent on [RedminPortal](https://github.com/redooor/redminportal), refer to the installation guide [HERE](https://github.com/redooor/redminportal/blob/master/README.md).**

2. Then run `php composer update` in a terminal.
3. Now, edit your [root]\config\app.php providers and alias array like this:

        'providers' => array(
            Illuminate\Foundation\Providers\ArtisanServiceProvider::class,
            ... omitted ...
            
            // Add this line
            Redooor\Redminstore\RedminstoreServiceProvider::class,
        ),

4. Then run `php composer dump-autoload` in a terminal.
5. Run the following commands in a terminal to perform database migration for Redminstore:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="migrations" --force
        ?> php artisan migrate --path=/database/migrations/vendor/redooor/redminstore

    **NOTE: using --force will overwrite existing files**
    
6. Run the following in a terminal to seed the database with initial admin username and password:

        ?> php artisan db:seed --class="RedminSeeder"
        
        Username/password: admin@admin.com/admin

7. Publish package assets by running this in a terminal:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="public" --force
        
    **NOTE: using --force will overwrite existing files**

8. Publish package config by running this in a terminal:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="config" --force
        
    **NOTE: using --force will overwrite existing files**
    

# Installation guide for Contributors

It is recommended that contributors use Laravel Homestead for development because it will provide the same development environment for all of us. Read more about Laravel Homestead [here](http://laravel.com/docs/master/homestead).

1. Install Laravel 5.1 using [this guide](http://laravel.com/docs/5.1/installation). We'll call this the [root].

You can install Laravel version 5.1 using the command:

    composer create-project laravel/laravel myproject 5.1.*

**This package is dependent on [RedminPortal](https://github.com/redooor/redminportal), refer to the installation guide [HERE](https://github.com/redooor/redminportal/blob/master/README.md).**

2. Create a folder named "packages" inside the [root] folder.
3. Clone the Redooor\Redminstore repository into [root]\packages\redooor\redminstore folder.
4. Open a terminal, cd to [root]\packages\redooor\redminstore folder then run:
    
    `composer update --prefer-dist -vvv --profile`
    
5. Then add Redooor\Redminstore source to [root]'s composer.json under "autoload" like this:

        "autoload": {
            "classmap": [
                "database"
            ],
            "psr-4": {
                "App\\": "app/",
                "Redooor\\Redminstore\\": "packages/redooor/redminstore/src"
            }
        },

6. Due to the use of getID3 package, we need to set the minimum-stability to "dev" but prefer-stable to "true". Like this:

        "minimum-stability": "dev",
        "prefer-stable": true

7. Then cd to [root]'s folder and run:

    `composer update --prefer-dist -vvv --profile --no-dev`

    **NOTE: the [root]'s phpunit dependency will clash with the package's phpunit. "`--no-dev`" ensures that it is not installed on [root]. You can also choose to remove phpunit from `require` inside the [root]'s composer.json.**
    
8. Now, edit your [root]\config\app.php providers and alias array like this:

        'providers' => array(
            Illuminate\Foundation\Providers\ArtisanServiceProvider::class,
            ... omitted ...
            
            // Add this line
            Redooor\Redminstore\RedminstoreServiceProvider::class,
        ),

9. Run the following commands in a terminal to perform database migration for Redminstore inside the [root] folder:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="migrations" --force
        ?> php artisan migrate --path=/database/migrations/vendor/redooor/redminstore
        
    **NOTE: using --force will overwrite existing files**

10. Run the following in a terminal to seed the database with initial admin username and password:

        ?> php artisan db:seed --class="RedminSeeder"
        
        Username/password: admin@admin.com/admin

11. Publish package assets by running this in a terminal:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="public" --force
        
    **NOTE: using --force will overwrite existing files**

12. Publish package config by running this in a terminal:

        ?> php artisan vendor:publish --provider="Redooor\Redminstore\RedminstoreServiceProvider" --tag="config" --force
        
    **NOTE: using --force will overwrite existing files**

        
## Install Grunt and Bower dependencies

1. You need to have nodejs installed
3. cd to workbench/redooor/redminstore
2. Run _npm install_
3. Run _bower install_
4. To build all assets, run _grunt_
5. To compile just the less css, run _grunt less-compile_

# Testing

* In packages\redooor\redminstore folder, run 

        ?> composer update --prefer-dist -vvv --profile
        ?> vendor/bin/phpunit

    **NOTE: If you run out of memory while running the full tests, try running the tests by sub-folders.**
    
        ?> vendor/bin/phpunit tests/models/
        ?> vendor/bin/phpunit tests/controllers/
        ?> vendor/bin/phpunit tests/relationships/

# Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Redooor RedminStore will adhere to the [Semantic Versioning guidelines](http://semver.org/) whenever possible.

# Contributing

Thank you for considering contributing to RedminStore.
Before any submission, please spend some time reading through the [CONTRIBUTING.md](CONTRIBUTING.md) document.

# Creator

Andrews Ang

* [http://twitter.com/kongnir](http://twitter.com/kongnir)
* [http://github.com/kongnir](http://github.com/kongnir)

# License

RedminStore is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).

# External Libraries Used

* Bootstrap v3.3.5
* jQuery v2.1.3

# Change log

Refer to [CHANGELOG.md](CHANGELOG.md)

# Upgrade Guide

Refer to [UPGRADE.md](UPGRADE.md)
