# LaravelTestPackage
trying out laravel package

_____

## installing the package
in your laravel app's `composer.json` add
```json
"repositories": [
        {
            "type":"vcs",
            "url": "https://github.com/Yogesh-B/LaravelTestPackage.git"
        }
    ],
```
then,
`composer require yogeshb/laraveltestpackage:dev-main --prefer-dist`

and then package is ready to use

____
- defined alias successfully....anyways..!!
## how to use it?
```php
TestPackage::getPattern(3,'&');
```
____
## further improvements
- we have not utilized the `ServiceProvider`(Not yet to its full potential). 
- Get the print_character from the config/env.


### Note: This is a test package, meant solely for learning how to develop a package(at least some basics of it)[here](./developing.md) is readme for what I tried.