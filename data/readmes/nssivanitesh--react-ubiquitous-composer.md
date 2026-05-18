# react-ubiquitous-composer

[![PHP](https://img.shields.io/badge/PHP-8.1+-blue)](https://php.net)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Laravel/PHP Composer package providing standardized DTOs and helper functions for the [`react-ubiquitous`](https://www.npmjs.com/package/react-ubiquitous) UI Config API.

> **The backend produces a `UIStageConfig` JSON tree; the `react-ubiquitous` frontend renders it without any code changes.**

---

## Requirements

- PHP **8.1+**
- Composer

---

## Installation

```bash
composer require nssivanitesh/react-ubiquitous-composer
```

If you are using Laravel, the `ReactUbiquitousServiceProvider` is auto-discovered via the `extra.laravel` section of `composer.json`.

---

## Core Concepts

The JSON object hierarchy is:

```
UIStageConfig
 └─ UIPageConfig[]
     └─ UISectionConfig[]   (flex | grid | hero | table | chart | …)
         └─ UIElementConfig[]  (input | select | button | …)
```

Every class implements `toArray()` which returns the exact JSON shape expected by the frontend.

---

## Quick Start

```php
use ReactUbiquitous\Helpers\UIHelper;
use ReactUbiquitous\DTOs\Sections\FlexSectionConfig;
use ReactUbiquitous\DTOs\Sections\TableSectionConfig;
use ReactUbiquitous\DTOs\Elements\InputElementConfig;
use ReactUbiquitous\DTOs\Elements\ButtonElementConfig;
use ReactUbiquitous\DTOs\Supporting\TableColumn;
use ReactUbiquitous\Enums\UITheme;

// Build a stage with one page containing a flex section
$stage = UIHelper::stage('my-app')
    ->title('My Application')
    ->theme(UITheme::Light)
    ->addPage(
        UIHelper::page('home', 'Home', 1)
            ->addSection(new FlexSectionConfig(
                id: 'search-bar',
                elements: [
                    new InputElementConfig(
                        id: 'q',
                        name: 'q',
                        inputType: 'text',
                        placeholder: 'Search…',
                        label: 'Search',
                    ),
                    new ButtonElementConfig(
                        id: 'btn-search',
                        name: 'btn-search',
                        text: 'Search',
                        buttonType: 'submit',
                    ),
                ],
                gap: '1rem',
            ))
            ->build()
    )
    ->build();

// Serialize to JSON
return response()->json($stage->toArray());
```

---

## Validation Builder

```php
use ReactUbiquitous\Helpers\UIHelper;
use ReactUbiquitous\DTOs\Elements\InputElementConfig;

$validations = UIHelper::validation()
    ->required()
    ->email('Please enter a valid email address.')
    ->build();

$emailField = new InputElementConfig(
    id: 'email',
    name: 'email',
    inputType: 'email',
    label: 'Email',
    validations: $validations,
);
```

---

## DTOs Reference

| Namespace | Classes |
|---|---|
| `ReactUbiquitous\DTOs` | `UIStageConfig`, `UIPageConfig` |
| `ReactUbiquitous\DTOs\Sections` | `FlexSectionConfig`, `GridSectionConfig`, `HeroSectionConfig`, `CardSectionConfig`, `TableSectionConfig`, `ChartSectionConfig`, `IframeSectionConfig`, `AlertSectionConfig`, `ModalSectionConfig`, `DrawerSectionConfig`, `ToastSectionConfig`, `ProgressSectionConfig`, `SkeletonSectionConfig`, `AccordionSectionConfig`, `TabsSectionConfig`, `StepperSectionConfig`, `PaginationSectionConfig`, `NavbarSectionConfig`, `SidebarSectionConfig`, `BreadcrumbsSectionConfig`, `TooltipSectionConfig`, `PopoverSectionConfig`, `CollapseSectionConfig`, `DividerSectionConfig`, `BadgeSectionConfig`, `AvatarSectionConfig`, `TimelineSectionConfig`, `StatSectionConfig`, `EmptyStateSectionConfig`, `CodeBlockSectionConfig`, `MediaSectionConfig`, `ListDetailSectionConfig`, `TreeViewSectionConfig`, `ChatSectionConfig` |
| `ReactUbiquitous\DTOs\Elements` | `InputElementConfig`, `CheckboxElementConfig`, `RadioElementConfig`, `TextareaElementConfig`, `SelectElementConfig`, `ButtonElementConfig`, `LabelElementConfig`, `FieldsetElementConfig`, `DatalistElementConfig`, `OutputElementConfig`, `DatePickerElementConfig`, `MultiSelectElementConfig`, `AutocompleteElementConfig`, `FileUploadElementConfig`, `ColorPickerElementConfig`, `RangeSliderElementConfig`, `RatingElementConfig`, `OtpInputElementConfig`, `PhoneInputElementConfig`, `CustomElementConfig` |
| `ReactUbiquitous\DTOs\Supporting` | `RadioOption`, `SelectOption`, `SelectOptGroup`, `PhoneCountryOption`, `NavLink`, `SidebarItem`, `BreadcrumbItem`, `StepperStep`, `TabItem`, `AccordionPanel`, `ListDetailItem`, `ListEndpointConfig`, `FilterEndpointConfig`, `DetailEndpointConfig`, `DetailPage`, `TreeViewNode`, `MediaItem`, `TableColumn`, `BadgeItem`, `AvatarItem`, `TimelineEvent`, `StatItem`, `ChatMessage`, `ChatConversation`, `ChartDataPoint`, `ChartSeries` |
| `ReactUbiquitous\DTOs\Validation` | `ValidationRule` |
| `ReactUbiquitous\Enums` | `UITheme`, `UIPageTransition`, `InputType`, `ResizeBehaviour`, `ButtonVariant`, `ButtonSize` |
| `ReactUbiquitous\Builders` | `StageBuilder`, `PageBuilder`, `ValidationBuilder` |
| `ReactUbiquitous\Helpers` | `UIHelper` |

---

## Testing

```bash
composer install
./vendor/bin/phpunit
```

---

## Local Development with Laravel Sail

This package ships with a Docker Compose configuration that gives you a PHP 8.2 environment without needing PHP installed on your host machine — similar to how [Laravel Sail](https://laravel.com/docs/sail) works for full Laravel applications.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### First-time setup

```bash
# Build the image and install Composer dependencies
docker compose build
docker compose run --rm php composer install
```

### Running tests

```bash
docker compose run --rm php ./vendor/bin/phpunit
```

### Opening an interactive shell

```bash
docker compose run --rm php bash
```

### Running any Composer command

```bash
docker compose run --rm php composer <command>
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT — see [LICENSE](LICENSE).
