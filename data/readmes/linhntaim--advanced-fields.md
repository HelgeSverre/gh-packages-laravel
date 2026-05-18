# Advanced Fields for Filament's Form Builders

[![Latest Version on Packagist](https://img.shields.io/packagist/v/linhntaim/advanced-fields.svg?style=flat-square)](https://packagist.org/packages/linhntaim/advanced-fields)
[![Total Downloads](https://img.shields.io/packagist/dt/linhntaim/advanced-fields.svg?style=flat-square)](https://packagist.org/packages/linhntaim/advanced-fields)

Multiple Choice Grid/Radio Grid, Checkbox Grid, ... and more.

## Installation

You can install the package via composer:

```bash
composer require linhntaim/advanced-fields
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="advanced-fields-views"
```

## Usage

### Grid Fields

Supports: `RadioGrid`, `CheckboxGrid`.

```php
use Filament\Schemas\Schema;
use LinhntAim\AdvancedFields\RadioGrid;
use LinhntAim\AdvancedFields\CheckboxGrid;

public function mount(): void
{
    $this->form->fill([

        // format of the state used for RadioGrid
        'filled_radio_grid' => [
            'row_1' => 'column_c',
            'row_2' => 'column_b',
            'row_3' => 'column_a',
        ],

        // format of the state used for CheckboxGrid
        'filled_checkbox_grid' => [
            'row_1' => [
                'column_c',
                'column_a',
            ],
            'row_2' => [
                'column_b',
                'column_c',
            ],
            'row_3' => [
                'column_a',
                'column_b',
            ],
        ],

    ]);
}

public function form(Schema $schema): Schema
{
    return $schema->components([

        ...,

        RadioGrid::make('radio_grid')
            ->options([
                'column_a' => 'Column A',
                'column_b' => 'Column B',
                'column_c' => 'Column C',
            ])
            ->rows([
                'row_1' => 'Row 1',
                'row_2' => 'Row 2',
                'row_3' => 'Row 3',
            ])
            // optionally, (one) radio must be checked in each row
            ->required()
            // optionally, disable specific column option(s)
            ->disableOptionWhen(fn($value) => $value == 'column_b')
            // optionally, set the label of the "Clear selection" button
            // - note: the button will be shown after checking any radio if not required
            ->clearButtonLabel('X'),

        ...,

        CheckboxGrid::make('checkbox_grid')
            ->options([
                'column_a' => 'Column A',
                'column_b' => 'Column B',
                'column_c' => 'Column C',
            ])
            ->rows([
                'row_1' => 'Row 1',
                'row_2' => 'Row 2',
                'row_3' => 'Row 3',
            ])
            // optionally, at least one checkbox must be checked in each row 
            ->required()
            // optionally, disable specific column option(s)
            ->disableOptionWhen(fn($value) => $value == 'column_b'),

        ...,

    ]);
}


```

![Sample light theme](./docs/assets/images/usage-light.png)

![Sample dark theme](./docs/assets/images/usage-dark.png)

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
