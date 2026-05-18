# Laravel Scenarios

This little package helps you set your Laravel application into a given state/scenario. 

Let's say that you want to finally fix that pesky edge case bug and for that you need to have 
your application in a very specific state. Example:
* you need to have a user with role X
* your user needs to have bought two products
* the payment for the second product needs to have status Y
* Another condition
* Extra condition
* Last condition

With this package you can create a new Scenario, write the code needed to have the application in the state above,
and run the command to set the scenario.

Voilá! Now you have a nice file descriptive file that sets your application into the right state so you can easily
develop against and reset everytime you need it.

Not only that, but it also makes it easy for other people to quickly check which scenarios are available, and use them.

## Installation

You can install the package via composer:

```bash
composer require flipjms/laravel-scenarios
```

Go to you `composer.json` and add the following:

```json
"autoload": {
    "psr-4": {
      "Database\\Scenarios\\": "database/scenarios/"
    }
},
```

## Usage

**To create a new scenario:**
```bash
php artisan make:scenario NewScenarioName
```
Be descriptive with your names. Do not be afraid of long names.

The file will be created at `./database/scenarios/`

Set an alias and a nice description for it. Then on the `execute` method add the necessary code to place your
application into the desired state. Usually you do that by running factories, seeders, etc...

The `output` method allows you to output information to the console once the scenario has been set. This is useful to
display information that you might need, like a user login, or an url that you might need to visit.
All the [Laravel Output IO commands](https://laravel.com/docs/9.x/artisan#writing-output) are available apart from the 
progress bar.
You can also use [Termwind](https://github.com/nunomaduro/termwind) for a prettier output.

**To set a scenario**
```bash
php artisan scenarios:set

or

php artisan scenarios:set scenario-alias
```

More often than not, you want to clean your database. If that's the case, you can use the `--fresh` option:

```bash
php artisan scenarios:set --fresh

or

php artisan scenarios:set scenario-alias --fresh
```

## Questions

* Why not just use seeders?
  * IMHO seeders are nice to put your application into a default state not specific ones.
* Why not use commands?
  * You can definitely use commands. I've certainly done so. Nonetheless, I like to see commands as business logic, whereas scenarios is something you need while developing/debugging. This way I can keep my commands folder clean, and my scenarios neatly organized in their own folder.

## Credits

- [Filipe Santos](https://github.com/flipjms)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
