# Step Validator for Laravel

[![PHPUnit, PHPCS, PHPStan Tests](https://github.com/lexalium/laravel-step-validator/actions/workflows/tests.yml/badge.svg)](https://github.com/lexalium/laravel-step-validator/actions/workflows/tests.yml)

This package validates step data on the `BeforeHandleStep` event from [Stepped Form](https://github.com/lexalium/stepped-form).

## Requirements

**PHP:** >=8.2

**Laravel:** ^11.0 || ^12.0

## Installation

Via Composer

```
composer require lexal/laravel-step-validator
```

## Usage

Implement `ValidatableStepInterface` on your step and the the listener will validate step data before the step is handled.
The validator passes `RulesDefinition` data directly to Laravel's validator factory method.

```php
use Lexal\LaravelStepValidator\RulesDefinition;
use Lexal\LaravelStepValidator\Steps\ValidatableStepInterface;
use Lexal\SteppedForm\Steps\RenderStepInterface;

final class CustomerStep implements RenderStepInterface, ValidatableStepInterface
{
    public function getRulesDefinition(mixed $entity): RulesDefinition
    {
        return new RulesDefinition(
            /* rules */,
            /* messages (default - empty array) */,
            /* custom attributes (default - empty array) */,
        );
    }
}
```

---

## License

Laravel Step Validator is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
