# Plentific Coding Test

### Structure
I've created this laravel project just to import and test the composer package `wayneanstey/plentific_code_test`

This package is minus the vendor folder and node_modules, so `composer install` and `npm install` is required, please ensure that the `composer.json` file has the following

```json
    "require": {
        "php": "^8.3",
        "laravel/framework": "^13.0",
        "laravel/tinker": "^3.0",
        "wayneanstey/plentific_code_test": "*"
    },
    "repositories": [
        {
            "type": "path",
            "url": "[path to package]",
            "options": {
                "symlink": true
            }
        }
    ],
```
This should ensure that the package is imported on composer install.

I've made this Laravel project very slim for purposes of testing output only, with some very minimal blade templates and css styles in each template so running `npm run dev` is not required to view the output.
