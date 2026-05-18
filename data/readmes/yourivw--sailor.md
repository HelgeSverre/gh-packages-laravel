<p align="center"><img src="https://raw.githubusercontent.com/yourivw/sailor/main/art/logo.svg" width="400"></p>

<p align="center">
<a href="https://github.com/yourivw/sailor/actions/workflows/run-tests.yml"><img src="https://github.com/yourivw/sailor/actions/workflows/run-tests.yml/badge.svg" alt="Testing status"></a>
<a href="https://github.com/yourivw/sailor/actions/workflows/coverage.yml"><img src="https://raw.githubusercontent.com/yourivw/sailor/gh-pages/badge-coverage.svg" alt="Code coverage"></a>
<a href="https://packagist.org/packages/yourivw/sailor"><img src="https://img.shields.io/packagist/v/yourivw/sailor" alt="Latest stable version"></a>
<a href="https://packagist.org/packages/yourivw/sailor"><img src="https://img.shields.io/packagist/l/yourivw/sailor" alt="License"></a>
</p>

## Introduction

This package is an extension to Laravel Sail, enabling the user to install additional services to the Sail installation. The idea behind this, is that this enables you to create an additional package which defines your services which can then be easily installed in your new project consistenly and quickly. The package also gives the options to overwrite which Sail packages are used as default, and how the Laravel service is named.

My own services are available as well, and can be used by installing [yourivw/sailor-services](https://github.com/yourivw/sailor-services).

## Installation

Install this package as a dev dependency using composer:

```composer require yourivw/sailor --dev```

## Defining Sailor services

Services can be defines in two ways: fluently using ```SailorService::create()```, and by defining a new class implementing the Serviceable interface. After defining, register the service to the manager using ```Sailor::register()``` on the Sailor Facade. Alternatively, the SailorService class has a register function, so that the service can be fluently registered.

In both examples, the callbacks can be used for further setup. For example, dynamically adding something to the docker-compose files through the ```$compose``` argument, using the ```$command``` argument to write to the output, copying extra files when publishing etc.

Like in these examples, I would advise to check whether the app is running in the console, in order not to uselessly register these services unless your application is running in console.

### Fluent example

```php
if ($this->app->runningInConsole()) {
    SailorService::create('example', __DIR__ . '/../stubs/example.stub')
        ->useDefault()
        ->withVolume()
        ->withPublishable([__DIR__ . '/../example-files' => $this->app->basePath('docker/sailor/example-files')])
        ->callAfterAdding(function (Command $command, array &$compose) {
            $compose['services']['example']['environment']['HELLO'] = 'WORLD';
        })
        ->callAfterPublishing(function (Command $command) {
            $command->info('Successfully published example service files.');
        })
        ->register();
}
```

### Interface example
```php
class ExampleService implements Serviceable
{
    public function name(): string
    {
        return 'example';
    }

    public function stubFilePath(): string
    {
        return __DIR__.'/../stubs/example.stub';
    }

    // Other interface functions similair to the fluent example.
}
```
```php
if ($this->app->runningInConsole()) {
    Sailor::register(new ExampleService());
}
```

### Other configuration

```php
// Set which Sail services are checked by default.
Sailor::setSailDefaultServices(['mysql', 'redis']);

// Set the default name for the Laravel service.
Sailor::setDefaultServiceName('laravel-example.local');
```

### Note on volumes

Sailor will automatically add a volume when your service has defined it required a volume, in the same way Sail does this. However, these volumes are prefixed with 'sailor-' in the docker-compose file. Be sure to refer to these volumes correctly in your stub file. The volume is named after your service name, plus the sailor- prefix. See example:

```php
SailorService::create('redisinsight', __DIR__ . '/../stubs/redisinsight.stub')
    ->withVolume()
    ->register();
```
```yml
services:
    redisinsight:
        image: '...'
        volumes:
            - 'sailor-redisinsight:/data'
...
volumes:
    sailor-redisinsight:
        driver: local
```

## Usage

### Installation command

The installation command can be used in a similar fashion to the default Sail installation command. Additionally, a check is performed whether a docker-compose file already exists, and if so, an error will be shown. To add a service, use the add command instead. Also, there is an option to directly rename the Laravel service. In the background, Sail's install command will run to handle the installation of the standard services, and this package will handle the custom services. See ```sailor:install --help``` for more information on usage.

### Add command

The add command can be used in a similar fashion to the default Sail add command. Additionally, a check is performed whether a docker-compose file already exists, and if not, an error will be shown. To create a new intallation, use the install command instead. In the background, Sail's add command will run to handle the standard services, and this package will handle the custom services. See ```sailor:add --help``` for more information on usage.

### Rename command

The rename command can be used to rename the Laravel service. It will find the service in the existing Docker file, and rename it. A line it added to, or edited in the .env file, specifying the new service name. Your Laravel instance will now be reachable on this URL. Ensure this URL points to the correct address for it to work, e.g. by adding it to your Windows hosts file. See ```sailor:rename --help``` for more information on usage.

Renaming the installation will cause the Sail commands to not find the Laravel installation anymore. It's advised to use only the Sailor commands to add packages to prevent this.

### Publish command

To further ease your workflow when modifying services, your new service can also specify what it should publish, when this is required. An example: the PHP runtimes which Sail can publish for you, in order to customize these. It's not required to define this, and can be skipped all together. When running the publish command, specific services can be chosen using the ```--services``` option to limit which service files get publishes. See ```sailor:publish --help``` for more information on usage.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information about recent changes.

## Contributing

Contributions are more than welcome. Please read the information on issues and PR's below. 

### Issues

* Make sure the issue is reproduceable.
* Make sure the issue has not already been raised.
* Give as much information about the problem as possible.

### Pull requests

* Make sure additional features add to the functionality of this package.
* Ensure all tests pass, and if required, add tests.
* Do not make PR's adding pre-defined services to this package, these will be closed. This package is purely an interface between Sail and custom services.
* Upon submitting a PR, testing and formatting actions will run automatically.

## Testing

The package uses PHPUnit tests and PHPStan for static analysis.

```
vendor/bin/phpunit
vendor/bin/phpstan
```

Or using Sail:
```
sail bin phpunit
sail bin phpstan
```

## License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).
