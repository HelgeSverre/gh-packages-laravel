# A Laravel and Livewire implementation of Highcharts.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bernskioldmedia/laravel-highcharts.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-highcharts)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/bernskioldmedia/laravel-highcharts/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/bernskioldmedia/laravel-highcharts/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bernskioldmedia/laravel-highcharts.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-highcharts)

## Prerequisites

- Laravel 10 or higher
- PHP 8.2 or higher
- Highcharts, available on `window.Highcharts`.
- Livewire 2 or higher

## Installation

You can install the package via composer:

```bash
composer require bernskioldmedia/laravel-highcharts
```

After installing the package you need to import the Alpine JS component which
is used to display the chart. You can do this by adding the following to your
`resources/app.js` file:

```js
import Chart from '../../vendor/bernskioldmedia/laravel-highcharts/resources/js/chart';

Alpine.data('highchartsChart', Chart); // Note that the Alpine component is expected to be named 'highchartsChart'.
```

If you are using Livewire 3, you need
to [manually bundle AlpineJS](https://livewire.laravel.com/docs/installation#manually-bundling-livewire-and-alpine) per
the Livewire documentation. Your `resources/app.js` file should then look like this:

```js
import {Livewire, Alpine} from '../../vendor/livewire/livewire/dist/livewire.esm';
import Chart from '../../vendor/bernskioldmedia/laravel-highcharts/resources/js/chart';

Alpine.data('highchartsChart', Chart); // Note that the Alpine component is expected to be named 'highchartsChart'.

Livewire.start();
```

### Publishing config and views

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-highcharts-config"
```

This is the contents of the published config file:

```php
<?php

return [

    /**
     * Default options to be used for all charts.
     */
    'defaults' => [],

    /**
     * Default options to be used for all charts of a specific type.
     */
    'defaultsForType' => [
//        'line' => [
//            'title' => [
//                'text' => 'My Line Chart'
//            ]
//        ]
    ],

    /**
     * Defaults for chart labels.
     */
    'chartLabels' => [

        /**
         * CSS styles to be applied to the label.
         */
        'styles' => [
//            'fontWeight' => 'bold',
//            'fontSize' => '13px',
        ],

        /**
         * Additional Highchart drawing object attributes.
         */
        'attributes' => [
            'align' => 'center',
        ],
    ],

    /**
     * Defaults for chart lines.
     */
    'chartLines' => [

        /**
         * Highchart drawing object attributes.
         */
        'attributes' => [],
    ],

    /**
     * Defaults for chart quadrants.
     */
    'chartQuadrants' => [

        /**
         * Highchart drawing object attributes.
         */
        'attributes' => [],
    ],
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-highcharts-views"
```

## Usage

### Building a chart

The package provides a series of convenience classes that provide fluent methods for adding data and customizing basic
Highcharts options. These are not meant to be a complete implementation of the Highcharts API, but rather a convenient
way to build charts in your Laravel application.

The following example shows how to build a simple bar chart:

```php
use BernskioldMedia\LaravelHighcharts\Data\DataPoint;
use BernskioldMedia\LaravelHighcharts\Data\Series;
use BernskioldMedia\LaravelHighcharts\Data\Chart;

$chart = Chart::make('test-chart')
    ->title('Example Bar Chart')
    ->bar()
    ->series([
        Series::make([
            DataPoint::make(
                x: '2021-01-01',
                y: 10
            ),
            DataPoint::make(
                x: '2022-01-01',
                y: 20
            ),
            DataPoint::make(
                x: '2023-01-01',
                y: 30
            )
        ])    
    ]);
```

As we don't intend to add fluent methods for all Highcharts options, you can use `set` and `setMany` methods to add any
options you need. The option nesting and keys are the same as in the Highcharts API. The key supports dot notation for
nesting.

For example, to disable animations, you can do:

```php
$chart = Chart::make('test-chart')
    ->title('Example Bar Chart')
    ->bar()
    ->set('chart.animation', false)
    ->setMany();
```

### Rendering a chart in your Livewire component

This package supports one chart per Livewire component. To render a chart there are three steps involved:

- Building the chart with the data, from the `Data\Chart` class (see below)
- Implementing the `InteractsWithChart` trait in your Livewire component.
- Rendering the Blade component in your Livewire component's view.

Your Livewire component should look something like this:

```php
<?php

namespace App\Livewire;

use BernskioldMedia\LaravelHighcharts\Concerns\Livewire\InteractsWithCharts;
use BernskioldMedia\LaravelHighcharts\Data\DataPoint;
use BernskioldMedia\LaravelHighcharts\Data\Series;
use Livewire\Component;

class MyChartComponent extends Component
{
    use InteractsWithChart;
    
    protected function getChart(): Chart
    {
        return Chart::make('test-chart')
            ->title('Example Bar Chart')
            ->bar()
            ->series([
                Series::make([
                    DataPoint::make(
                        x: '2021-01-01',
                        y: 10
                    ),
                    DataPoint::make(
                        x: '2022-01-01',
                        y: 20
                    ),
                    DataPoint::make(
                        x: '2023-01-01',
                        y: 30
                    )
                ])    
            ]);
    }

    public function render()
    {
        return view('livewire.my-chart-component');
    }
}
```

The Blade part of your Livewire component should look something like this:

```blade
<div>
    <x-highcharts::chart chart-key="test-chart" />
</div>
```

**Note:** The `chart-key` attribute is required and must match the key you used when building the chart.

### Drawing on the chart with "Chart Extras"

The package provides a way to draw on the chart using "Chart Extras". These are classes that create a fluent interface
to the data required to draw common non-data elements on the chart: Quadrants, lines and labels.

#### Drawing a quadrant

The following example draws a black quadrant on the chart from the origin to the point (10, 10):

```php
use BernskioldMedia\LaravelHighcharts\Data\Chart;
use BernskioldMedia\LaravelHighcharts\Data\ChartExtras;
use BernskioldMedia\LaravelHighcharts\Data\ChartQuadrant;

$chart = Chart::make('test-chart')
    ->bar()
    ->extras(function(ChartExtras $extras) {
        $extras->addQuadrant(
            ChartQuadrant::make()
            ->from(0, 0)
            ->to(10, 10)
            ->attributes([
                'fill' => '#000000',
            ])
        );
    });
```

#### Drawing a line

The following example draws a black line on the chart from the origin to the point (100, 100):

```php
use BernskioldMedia\LaravelHighcharts\Data\Chart;
use BernskioldMedia\LaravelHighcharts\Data\ChartExtras;
use BernskioldMedia\LaravelHighcharts\Data\ChartLine;

$chart = Chart::make('test-chart')
    ->bar()
    ->extras(function(ChartExtras $extras) {
        $extras->addLine(
            ChartLine::make()
            ->from(0, 0)
            ->to(10, 10)
            ->attributes([
                'stroke' => '#000000',
            ])
        );
    });
```

#### Adding a label

The following example adds a black, centered, label to the chart at the point (75, 75):

```php
use BernskioldMedia\LaravelHighcharts\Data\Chart;
use BernskioldMedia\LaravelHighcharts\Data\ChartExtras;
use BernskioldMedia\LaravelHighcharts\Data\ChartLabel;

$chart = Chart::make('test-chart')
    ->bar()
    ->extras(function(ChartExtras $extras) {
        $extras->addLabel(
            ChartLabel::make()
                ->coordinates(75, 75)
                ->styles([
                    'color' => '#000000',
                ])
                ->attributes([
                    'align' => 'center',
                ])
        );
    });
```

### Exporting a chart

Each chart will listen to the `export-chart` event on the `window` object. By triggering this with the appropriate
details, any chart can be exported either from JavaScript or from Livewire.

The detail object must contain the `chartId` and `type` keys. The `chartId` must match the key you used when building
the chart. The `type` must be a valid type for the Highcharts `exportChartLocal` method.

The `exportSettings` can take an object with settings for the export per the Highcharts `exportChartLocal` method.
The `options` take an object with chart options to customize the chart before exporting.

The following example shows how to export a chart from JavaScript:

```js
window.dispatchEvent(new CustomEvent('export-chart', {
    detail: {
        chartId: 'test-chart',
        type: 'image/png',
        exportSettings: {}, // Optional.
        options: {}, // Optional.
    }
}));
```

Using Livewire, you can either use the `dispatch` method, or use the bundled `ExportsChart` trait.

```php

// Using the trait.
use BernskioldMedia\LaravelHighcharts\Concerns\Livewire\ExportsChart;

$this->exportChart(
    type: 'image/png',
    chartKey: 'test-chart',
    exportSettings: [], // Optional.
    options: [], // Optional.
);

// Using Livewire 3's dispatch method.
$this->dispatch(
    'exportChart',
    chartId: 'test-chart',
    type: 'image/png',
    exportSettings: [], // Optional.
    options: [], // Optional.
);
```

If you are using the `ExportsChart` trait, you can also customize the export settings and options by adding the 
the `getChartExportSettings` and ? `getChartOptionsForExport` methods to your Livewire component. To ensure their signature,
we suggest implementing the bundled `CustomizesChartExportOptions` and `CustomizesChartExportSettings` interfaces.

If you are using the trait on the same component as the `InteractsWithChart` trait you don't have to provide the chart key, and can use the minimal syntax:

```php
use BernskioldMedia\LaravelHighcharts\Concerns\Livewire\ExportsChart;

$this->exportChart('image/png');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Bernskiold Media](https://github.com/bernskioldmedia)
- [Erik Bernskiold](https://github.com/erikbernskiold)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
