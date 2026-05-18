# Whatsapp Laravel SDK

This Laravel package's goal is to abstract and simplify the integration with the Facebook's Whatsapp Business API through services, facades and methods, as well properly documenting how to work with it, since it is sometimes hard to find the info you need to correctly implement the API.

Check our package on [Packagist](https://packagist.org/packages/42dx/whatsapp-laravel-sdk).

## Project Meta Data

[![All Contributors](https://img.shields.io/github/all-contributors/42dx/whatsapp-laravel-sdk?color=ee8449&flat&label=Contributors)](https://github.com/42dx/whatsapp-laravel-sdk/blob/beta/README.md#contributors)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)

## Project Status (`beta` branch)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=bugs)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=coverage)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=42dx_whatsapp-laravel-sdk&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=42dx_whatsapp-laravel-sdk)

## Table of Contents

- [Composer Scripts](#composer-scripts)
- [Configure Whatsapp Webhook](configure-whatsapp-webhook)
- [Using the Package](#using-the-package)
  - [Migrations](#migrations)
    - [`whatsapp_messages` Table](#whatsapp_messages-table)
    - [Messageable Migration](#messageable-migration)
  - [General Concepts](#general-concepts)
    - [Whatsapp API Entities](#whatsapp-api-entities)
  - [Meta Webhook Validation](#meta-webhook-validation)
  - [Receiving Messages](#receiving-messages)
- [Run and Test](#run-and-test)
- [Tooling](#tooling)
  - [Comitzen](#comitizen)
  - [Pinggy](#pinggy)
    - [How to use Pinggy](#how-to-use-pinggy)
- [Contributors](#contributors)
- [Changelog](#changelog)
- [Roadmap](#roadmap)

## Composer Scripts

We tried to automate as much boring tasks and CLI commands as we could on short `composer` scripts. Below you will find a general description of what each one does:

- `composer commit`: Runs the [`comitzen` binary](https://github.com/lintingzhen/commitizen-go) which opens an interactive CLI to keep commits in a standard that our pipeline can use to generate the package changelog automatically.
- `composer coverage`: Run the tests and generates code coverage. If you are contributing, please make sure you do not lower the current coverage. ;)
- `composer start`: Serves the sample application (through `php artisan serve`) with the package already loaded. It will run the Sample App on port `8000`.
- `composer connect`:  Connects to Pinggy service and expose your local environment to the web. It assumes that the local app is running on port `8000`.
- `composer test`: Run the tests (do not generate coverage report)

## Configure Whatsapp Webhook

[WIP]

## Using the Package

After installing, if the auto discovery did not pick it up right away, just add those 2 lines in your `bootstrap/providers.php` file:

```php
return [
  // [...]
  The42dx\Whatsapp\RouteServiceProvider::class,
  The42dx\Whatsapp\WhatsappServiceProvider::class,
];
```

After making sure the Service Providers are loaded, you will need to adjust the package configs according to your Facebook/Meta application, and run the migrations to create tables and columns the package needs.

Publish the configuration file and adjust it to suit your needs:

```bash
php artisan vendor:publish --tag=whatsapp-business-api-config
```

### Migrations

The package will create a `whatsapp_messages` table to store the messages (both inbound and outbound) handled by the package. It will also create a unique `phone` column on your messageable entity (usually, and by default on the `users` table). If you need to customize this, adjust the `database.*` keys in your `/config/whatsapp.php` file **before running the migrations**.

To keep everything nice and tidy in your project, it is recommended (but not necessary) to publish the default migrations. You can do so by running the following command:

```bash
php artisan vendor:publish --tag=whatsapp-business-api-migrations
```

#### `whatsapp_messages` Table

[WIP]

#### $Messageable Migration

[WIP]

### General Concepts

[WIP]

#### Whatsapp API Entities

[WIP]

### Meta Webhook Validation

[WIP]

### Receiving Messages

[WIP]

### Sending Messages

[WIP]

#### General DB Columns

[WIP]

#### Message-Type Specific columns

[WIP]

## Run and Test

We included a sample fresh Laravel app to help those who want to contribute to the package. To start it just go through the following steps:

1. Clone this repository.
2. Run `composer setup` from the repository root. It will `cd` on sample app's folder, install the dependencies and `cd` back to the root folder.
3. Run `composer start` from the repository root. It will run the sample app through `laravel sail`.
4. With the local server running, from another terminal run `composer connect` from the repository. It will connect to [pinggy](https://pinggy.io) service and expose your local application to the web.
5. Adjust your webhook configuration on the Meta/Facebook dashboard with the generated [pinggy](https://pinggy.io) URI.

## Tooling

There are a few tools we provide alongside with the source code to ease a little bit the burden of following a bunch of patterns and standards we set up, as well as automate some boring processes.

### Comitizen

This CLI helps with writting commit messages in a meaningful and standardized way, so that our automation process can use them to properly write our software changelog.

If you like the tool, [kudo the devs](https://github.com/lintingzhen/commitizen-go) ;)

#### How to use Comitzen

Just run `composer commit` from the repository's root folder instead of the traditional `git commit` and follow the CLI interactive steps :)

### Pinggy

This service allows routing external requests to your local environment. You can use it to test your Watsapp webooks locally while developing.

If you like the tool, [kudos the devs](https://pinggy.io) ;)

#### How to use Pinggy

Just run `composer connect` from the repository's root folder. You will need to have our sample application running so you can receive webhook requests locally. After running the composer command

## Contributors

Kudos to all our dear contributors. Without them, nothing would have been possible :heart:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rafapaulin"><img src="https://avatars.githubusercontent.com/u/13452406?v=4?s=60" width="60px;" alt="Rafael Eduardo Paulin"/><br /><sub><b>Rafael Eduardo Paulin</b></sub></a><br /><a href="https://github.com/42dx/whatsapp-laravel-sdk/commits?author=rafapaulin" title="Code">💻</a> <a href="#design-rafapaulin" title="Design">🎨</a> <a href="https://github.com/42dx/whatsapp-laravel-sdk/commits?author=rafapaulin" title="Documentation">📖</a> <a href="#ideas-rafapaulin" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-rafapaulin" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-rafapaulin" title="Maintenance">🚧</a> <a href="#projectManagement-rafapaulin" title="Project Management">📆</a> <a href="https://github.com/42dx/whatsapp-laravel-sdk/pulls?q=is%3Apr+reviewed-by%3Arafapaulin" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/42dx/whatsapp-laravel-sdk/commits?author=rafapaulin" title="Tests">⚠️</a> <a href="#tool-rafapaulin" title="Tools">🔧</a> <a href="#tutorial-rafapaulin" title="Tutorials">✅</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Would you like to see your profile here? Take a look on our [Code of Conduct](https://github.com/42dx/.github/blob/main/CODE_OF_CONDUCT.md) and our [Contributing](https://github.com/42dx/.github/blob/main/CONTRIBUTING.md) docs, and start coding! We would be thrilled to review a PR of yours! :100:

<p align="right"><em><a href="#table-of-contents">back to top</a></em></p>

## Changelog

All changes made to this package since the start of development can be found either on our [release list](https://github.com/42dx/whatsapp-laravel-sdk/releases) or on the [changelog](CHANGELOG.md).

<p align="right"><em><a href="#table-of-contents">back to top</a></em></p>

## Roadmap

Any planned enhancement to the package will be described and tracked in our [project page](https://github.com/orgs/42dx/projects/3)

<p align="right"><em><a href="#table-of-contents">back to top</a></em></p>
