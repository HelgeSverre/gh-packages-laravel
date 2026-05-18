# Eloquent UI

![Logo](eloquent-ui-png-nobg-horizontal.png)

![Static Badge](https://img.shields.io/badge/bricknpc-eloquent--ui-blue)
![GitHub License](https://img.shields.io/github/license/bricknpc/eloquent-ui)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bricknpc/eloquent-ui/ci.yml)
![Codecov](https://img.shields.io/codecov/c/github/bricknpc/eloquent-ui)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/bricknpc/eloquent-ui)
![GitHub Release](https://img.shields.io/github/v/release/bricknpc/eloquent-ui)

## Full-stack UI components for Laravel

**Build complete, accessible Laravel user interfaces with less code and fewer compromises.**

Eloquent UI is a full-stack, PHP-first UI framework for Laravel. It goes beyond frontend components by integrating
deeply with the backend, so common concerns are handled once and handled correctly.

Instead of assembling forms, validation, accessibility, and error handling yourself, Eloquent UI provides
production-ready components that manage the entire flow for you. It includes backend components like validation rules, 
model casts, database schema macros, request helpers, and more.

## Companion Package

This is a companion package to [Eloquent Tables](https://github.com/bricknpc/eloquent-tables), which provides powerful 
table components for Laravel. Together, they form a complete solution for building data-driven applications. Eloquent UI 
focuses on forms, input elements and frontend components, while Eloquent Tables handles data display and table 
interactions.

## Framework Support

Eloquent UI is built on top of [Bootstrap 5](https://getbootstrap.com) and [Laravel](https://laravel.com). Although 
there are plans to support other frontend UI frameworks in the future, Bootstrap is currently the only supported 
framework.

## Installation

```bash
composer require bricknpc/eloquent-ui
```

## Requirements

- PHP `^8.4|^8.5`
- Laravel `^12.0`
- Bootstrap 5

## Usage

### Publishing assets

```bash
php artisan vendor:publish --tag=eloquent-ui-config
php artisan vendor:publish --tag=eloquent-ui-views
php artisan vendor:publish --tag=eloquent-ui-translations
php artisan vendor:publish --tag=eloquent-ui-assets
```

You will need to publish at least the assets because those contain the JavaScript and CSS required to render the 
components. Include the assets in your layout and add the custom meta tag:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- Other head elements -->
        {{ BrickNPC\EloquentUI\meta() }}
        <link rel="stylesheet" href="{{ asset('vendor/eloquent-ui/eloquent-ui.css') }}" />
    </head>
    <body>
        <!-- body contents -->
        <script src="{{ asset('vendor/eloquent-ui/eloquent-ui.js') }}"></script>
    </body>
</html>
```

### View namespace

All views are available under the `eloquent-ui::` namespace.

```html
<x-eloquent-ui::confirmation />
```

## Documentation

Documentation is available at [https://bricknpc.github.io/eloquent-ui](https://bricknpc.github.io/eloquent-ui).

## Local development

### Clone and install the project

This project has a simple docker setup for local development. To start local development, download the project
and start the docker container. You need to have Docker installed on your local machine for this.

First, clone the project.

```bash
git clone https://github.com/bricknpc/eloquent-ui.git
cd eloquent-ui
```

Up the docker container and install the dependencies.

```bash
docker compose up -d
docker compose exec php composer install
docker compose exec php npm ci
```

### Executing commands in the container

You can execute commands in the container using the exec option.

```bash
docker compose exec php <your command>
```

If you rather log in to the container and execute commands manually, you can use this:

```bash
docker compose exec php bash
```

### Stopping the container

```bash
docker compose down
```

### Build frontend assets

```bash
docker compose exec php npm run build
```

The build will automatically run anytime you change anything as long as the container is running. Make sure to commit 
and publish the build files when creating new versions. It may take a few minutes for changes to take effect.

### Adding new components

When adding new components, please keep in mind the following guidelines:

- Always define every variable in either the `@props` directive or the `@aware` directive. This way you can quickly see which variables a component expects, and you don't need to write a lot of `ìf` statements checking if a variable is set or exists.
- You can use some PHP in an anonymous component, but when it starts getting complex, please create an actual class-based component so it is easier to test.
- The goal of a component is always to write as little boilerplate code as possible while still allowing for maximum customisation. This can be a bit contradictory, but it is important to keep in mind that the goal is to make it as easy as possible to use the components in any project.

### Documentation

When starting the docker container, the documentation site will automatically be started as well and will be available
on http://localhost:3001/eloquent-ui. The documentation is built using [Docusaurus](https://docusaurus.io/). When
adding new features or making changes, please also update the documentation. Do not use separate pull requests to 
update the documentation and the code.

## Running tests

You can run the tests using the following command.

```bash
docker compose exec php composer test
```

### Test coverage

Unfortunately, PHP Unit cannot create test coverage for blade views, and since most of the components in Eloquent UI
are anonymous components that only consist of a blade view, test coverage is not possible for most of the components.
However, you can still generate test coverage for the rest of the code base, and we expect test coverage to be at 
100% at all times.

## Code quality tools

Eloquent UI uses PHP CS Fixer and PHPStan to ensure a high-quality code base. You can run the tools locally
using the following commands.

**PHP CS Fixer:**
```bash
docker compose exec php composer cs
```

**PHPStan:**
```bash
docker compose exec php composer ps
```

## Community showcase

Are you using Eloquent UI in your project? Let us know by opening a pull request to add your project to the
[community showcase](https://github.com/bricknpc/eloquent-ui/blob/main/docs/src/pages/showcase.js). We love seeing
what people are building with Eloquent UI.

## Contributing

Pull requests are welcome. When creating a pull request, please include what you changed and why in the description of
the pull request. When fixing a bug, please include a test that reproduces the bug and describe how to test the bug
manually.

Before creating a pull request, please run the tests and code quality tools locally.

## MIT License

Copyright (c) 2025 BrickNPC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.