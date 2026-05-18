A package to integrate Laravel with the Docker daemon
---

[![Latest Version on Packagist](https://img.shields.io/packagist/v/dominion-solutions/docker-minion.svg?style=flat-square)](https://packagist.org/packages/dominion-solutions/docker-minion)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/dominion-solutions/docker-minion/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/dominion-solutions/docker-minion/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/dominion-solutions/docker-minion/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/dominion-solutions/docker-minion/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/dominion-solutions/docker-minion.svg?style=flat-square)](https://packagist.org/packages/dominion-solutions/docker-minion)

- [Features](#features)
  - [Monitoring](#monitoring)
  - [Control](#control)
  - [Listing Containers](#listing-containers)
    - [List Filter Json](#list-filter-json)
      - [Available Filters](#available-filters)
- [Support us](#support-us)
- [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
  - [Changelog](#changelog)
  - [Contributing](#contributing)
  - [Security Vulnerabilities](#security-vulnerabilities)
  - [Credits](#credits)
  - [License](#license)

# Features
## Monitoring
Monitors the docker socket in order to be able to provide data about what containers are running.

## Control
Allows starting / stopping / restarting of containers.

## Listing Containers
```php
use DominionSolutions\DockerMinion\Facades\DockerMinion;
...
DockerMinion::listContainers(['all'=>true|false,'filters'=>'<filter JSON>'])
```
### List Filter Json
Formatted such as
```json
{
  "<filter_name>": [ "<filter_value_0>", "<filter_value_1>", ...]
}
```
#### Available Filters
- `ancestor`=(`<image-name>[:<tag>]`, `<image id>`, or `<image@digest>`)
- `before`=(`<container id>` or `<container name>`)
- `expose`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
- `exited=<int>` containers with exit code of `<int>`
- `health`=(`starting`|`healthy`|`unhealthy`|`none`)
- `id=<ID>` a container's ID
- `isolation=`(`default`|`process`|`hyperv`) (Windows daemon only)
- `is-task=`(`true`|`false`)
- `label=key` or `label="key=value"` of a container label
- `name=<name>` a container's name
- `network`=(`<network id>` or `<network name>`)
- `publish`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
- `since`=(`<container id>` or `<container name>`)
- `status=`(`created`|`restarting`|`running`|`removing`|`paused`|`exited`|`dead`)
- `volume`=(`<volume name>` or `<mount point destination>`)

# Support us

<!-- [<img src="https://github-ads.s3.eu-central-1.amazonaws.com/docker-minion.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/docker-minion) -->

We invest a lot of resources into creating [best in class open source packages](https://dominion.solutions/open-source?utm_source=docker_minion&utm_medium=readme&utm_campaign=open_source&utm_content=textlink). You can support us by [hiring us or buying one of our paid products](https://dominion.solutions/products?utm_source=docker_minion&utm_medium=readme&utm_campaign=open_source&utm_content=textlink).

# Installation

You can install the package via composer:

```bash
composer require dominion-solutions/docker-minion
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="docker-minion-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="docker-minion-config"
```

This is the contents of the published config file:

```php
return [
    'watch-docker' => env('WATCH_DOCKER', true),
];

```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="docker-minion-views"
```

## Usage

```php
$dockerMinion = new DominionSolutions\DockerMinion();
echo $dockerMinion->echoPhrase('Hello, DominionSolutions!');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Mark J. Horninger](https://github.com/dominion-solutions)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
