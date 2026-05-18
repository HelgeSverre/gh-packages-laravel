# laravel-composer-package-development

## About
This package contains Laravel CLI commands to help develop composer packages.
All commands are optional, but they reduce the risk of typos.

## Installation
```bash
composer require totocsa01/laravel-composer-package-development
```

## Commands

### dev:composer-package-type-path-on
Development a package. type: path

**Usage**
```bash
php artisan dev:composer-package-type-path-on [options] <package>
```

This will run these commands. {vendor} and {repository} are determined from the \<package\> and do not need to be specified. :
```bash
# Only if --git-clone option is present
git clone -b main git@github.com:<package>.git packages/<package>

composer config repositories.{vendor}-{repository} {"name":"{vendor}-{repository}","type":"path","url":"packages/<package>","options":{"symlink":true}}
composer require <package>:dev-main --no-interaction --prefer-source
```

```bash
# This command clones the totocsa01/laravel-composer-package-development package in the packages/totocsa01/laravel-composer-package-development directory. You can then continue developing it. 
php artisan dev:composer-package-type-path-on --git-clone totocsa01/laravel-composer-package-development
```

### dev:composer-package-type-path-off
Closing development of a compose package. It deletes the symlink from the vendor directory, but does not delete the package from the packages directory.

**Usage**
```bash
php artisan dev:composer-package-type-path-off <package>
```

This will run these commands. {vendor} and {repository} are determined from the \<package\> and do not need to be specified. You can also specify a tag in \<package\>. This will be used by composer require.:
```bash
composer config --unset 'repositories.{vendor}-{repository}'
composer remove '{vendor}/{repository}'
composer require '<package>'
```

```bash
# This command clones the totocsa01/laravel-composer-package-development package in the packages/totocsa01/laravel-composer-package-development directory. You can then continue developing it. 
php artisan dev:composer-package-type-path-off totocsa01/laravel-composer-package-development
```

