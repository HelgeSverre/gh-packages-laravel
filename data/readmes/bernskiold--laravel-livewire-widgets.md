# A framework for adding self-contained Livewire-powered widgets to your application.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bernskioldmedia/laravel-livewire-widgets.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-livewire-widgets)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/bernskioldmedia/laravel-livewire-widgets/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/bernskioldmedia/laravel-livewire-widgets/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bernskioldmedia/laravel-livewire-widgets.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-livewire-widgets)

## Installation

You can install the package via composer:

```bash
composer require bernskioldmedia/laravel-livewire-widgets
```

After requiring the package, you should import the base styles to your stylesheet. You can do this by importing the
provided `widgets.css` file in your `app.scss` file:

```css
@import "../../vendor/bernskioldmedia/laravel-livewire-widgets/resources/css/widgets.css";

/* Your styles */
```

**Tip:** Your import should be placed above any Tailwind imports to ensure that the styles are applied correctly. We'd
recommend using the `@import` syntax instead of `@tailwind` when loading Tailwind's base, components and utilities.

After installing the package you should review the installation instructions for
the [Laravel Highcharts](https://github.com/bernskioldmedia/laravel-highcharts) package if you plan on using the Chart
Widget.

### Publishing Config and Views

You don't typically need to publish either the config file or the views.

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-livewire-widgets-config"
```

This is the contents of the published config file:

```php
return [
    'livewire' => [
        'views' => [
            'chart-widget' => 'livewire-widgets::chart-widget',
            'statistic-widget' => 'livewire-widgets::statistic-widget',
        ],

        'skeletons' => [
            'base' => 'livewire-widgets::skeletons.widget',
            'chart-widget' => 'livewire-widgets::skeletons.chart-widget',
            'statistic-widget' => 'livewire-widgets::skeletons.statistic-widget',
        ],
    ],
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-livewire-widgets-views"
```

## Usage

### Supported Widget Types

This package supplies two opinionated widget, and one base widget that you can use to build your own.

- **Chart Widget.** A widget that displays a chart using our Laravel Highcharts package (bundled).
- **Statistic Widget.** A widget that displays a statistic with a label, a value and a change indicator.

See below for how to use each of these.

### Creating a Widget

To create a new widget create a new Livewire class that extends either one of the widget type classes, or the
base `Widget` class. A good place to put these is in the `App\Livewire\Widgets` namespace.

**Note:** You do not need to create a view/blade file for your widget if you are using one of the pre-defined widgets (
see the list above).

#### Lazy Loading

Unfortunately we haven't found a good way to default to lazy loading. As such as we recommend that you
add the `#[Lazy]` attribute to your widget classes.

```php
use BernskioldMedia\Laravel\Widgets\Widget;
use Livewire\Attributes\Lazy;

#[Lazy]
class MyWidget extends Widget
{
    //
}
```

#### Rendering a widget

To render a widget, you can use the `livewire` Blade directive as any other Livewire component:

```blade
<livewire:my-widget />
```

#### Chart Widget

Chart widgets are widgets that display a chart. They extend the `ChartWidget` class. To use this widget you must
first set up the [Laravel Highcharts](https://github.com/bernskioldmedia/laravel-highcharts) package. Refer to its
documentation for how to create charts.

To create a chart widget, extend the `ChartWidget` class and implement the `getChart` method.

```php
use BernskioldMedia\Laravel\Widgets\ChartWidget;
use BernskioldMedia\LaravelHighcharts\Data\Chart;
use BernskioldMedia\LaravelHighcharts\Data\Series;

class MyChartWidget extends ChartWidget
{
    protected function getChart(): Chart
    {
        return Chart::create('line', 'highcharts')
            ->setTitle('My Chart')
            ->setSeries(Series::make([
                [1,2,3]
            ]));
    }
}
```

### Statistic Widget

The Statistic Widget is a widget that displays a statistic with a label, a value and a change indicator.

To create a statistic widget, extend the `StatisticWidget` class and implement the `getValue` method.

```php
use BernskioldMedia\Laravel\Widgets\StatisticWidget;

class MyStatisticWidget extends StatisticWidget
{
    protected function getValue(): int|float|null
    {
        return 123;
    }
}
```

To display a change indicator, implement the `ComparesValues` interface and return the previous value from the
`getPreviousValue` method.

```php
use BernskioldMedia\Laravel\Widgets\StatisticWidget;
use BernskioldMedia\Laravel\Widgets\Contracts\ComparesValues;

class MyStatisticWidget extends StatisticWidget implements ComparesValues
{
    protected function getValue(): int|float|null
    {
        return 123;
    }
    
    protected function getPreviousValue(): int|float|null
    {
        return 100;
    }
}
```

There are a few additional properties that you can set on the widget:

- `$showChange` - Default to true. Whether to show the change indicator.
- `$changeAsPercentage` - Default to true. Whether to show the change as a percentage (true) or absolute value (false).
- `$invertedChange` - Default to false. Whether a positive change is good (true) or bad (false).

### Widget Sizes

Widgets are rendered in a responsive grid and can be rendered in different widths and heights.

All widths are available in the `WidgetWidths` enum, which we recommend over hardcoded string values. These equal:

- `1/4` - 25% width
- `1/3` - 33% width
- `1/2` - 50% width
- `2/3` - 66% width
- `3/4` - 75% width
- `1/1` - 100% width

Heights are based on the number of rows the widget should take up. As such, the height is dependent on the height of
surrounding widgets. All heights are available in the `WidgetHeights` enum, which we recommend over hardcoded strings.

The following heights are available:

- `1` - 1 row
- `2` - 2 rows
- `3` - 3 rows
- `4` - 4 rows

**Note:** Rows do not have a base height by themselves.

By default widgets are rendered in a 1/4 width and 1 row height. You can change this by overriding the `width`
and `height` properties on your widget.

```php
class MyWidget extends Widget
{
    protected string $width = WidgetWidths::Half->value;
    protected string $height = WidgetHeights::One->value;
}
```

You can also set the width and height when loading the widget in your view:

```blade
<livewire:my-widget :width="WidgetWidths::Half->value" :height="WidgetHeights::One->value" />
```

### Adding a title

You can add support for a title by implementing the `HasTitle` trait on your widget. The Chart Widget and Statistic
Widget both have this included.

This trait adds a `title` property to your widget. You can set this property when loading the widget in your view, which
offers a simple way of customizing the title on load. You may also provide a default title by returning a string from
the `defaultTitle` method.

```php
use BernskioldMedia\Laravel\Widgets\Concerns\HasTitle;

class MyWidget extends Widget
{
    use HasTitle;
    
    protected static function defaultTitle(): string
    {
        return 'My Widget';
    }
}
```

The title is available in your view as `$widgetTitle`.

### Adding a description

You can add support for a description by implementing the `HasDescription` trait on your widget. The Chart Widget and
Statistic Widget both have this included. This trait adds a `description` property to your widget. You can set this
property when loading the widget in your view, which offers a simple way of customizing the description on load. You may
also provide a default description by returning a string from the `defaultDescription` method.

```php
use BernskioldMedia\Laravel\Widgets\Concerns\HasDescription;

class MyWidget extends Widget
{
    use HasDescription;
    
    protected static function defaultDescription(): string
    {
        return 'My Widget';
    }
}
```

The description is available in your view as `$widgetDescription`.

### Supporting Filters

You can add support for filters by implementing the `Filterable` trait on your widget as well as the `SupportsFilters`
interface. This trait adds
a `filters` property to your widget. You can set this property when loading the widget in your view, which offers a
simple way of customizing the filters on load.

You may also provide default filters by returning an array from the `defaultFilters` method.

```php
use BernskioldMedia\Laravel\Widgets\Concerns\Filterable;
use BernskioldMedia\Laravel\Widgets\Contracts\SupportsFilters;

class MyWidget extends Widget implements SupportsFilters
{
    use Filterable;
    
    protected static function defaultFilters(): array
    {
        return [
            'startDate' => today()->subDays(7),
            'endDate' => today(),
        ];
    }
}
```

The default filters will be overridden with any filters you pass when loading the widget.

You may also provide a list of forced filters which cannot be overridden by the user when loading the widget. You do
this by overriding the `forcedFilters` method.

```php
use BernskioldMedia\Laravel\Widgets\Concerns\Filterable;
use BernskioldMedia\Laravel\Widgets\Contracts\SupportsFilters;

class MyWidget extends Widget implements SupportsFilters
{
    use Filterable;
    
    protected static function forcedFilters(): array
    {
        return [
            'startDate' => today()->subDays(7),
            'endDate' => today(),
        ];
    }
}
```

The trait also adds convenience methods for interacting with filters:

```php

// Get all filters
$this->getFilters();

// Get a specific filter (or null if it doesn't exist)
$this->getFilter('startDate');

// Get a specific filter or return a custom value
$this->getFilter('startDate', today());

// Set a filter
$this->setFilter('startDate', today());

// Set multiple filters
$this->setFilters([
    'startDate' => today(),
    'endDate' => today()->addDays(7),
]);

// Check if a filter exists
$this->hasFilter('startDate');

// Remove a filter
$this->removeFilter('startDate');

// Clear all custom filters.
$this->resetFilters();
```

### Defining a custom view

Because of the helper methods we include, adding a view is slightly different. Instead of using the `render` method, you
define the static `view` method and return the view name.

```php
protected static function view(): string
{
    return 'widgets.my-widget';
}
```

You can pass additional data to the view by returning an array from the `getViewData` method:

```php
protected static function getViewData(): array
{
    return [
        'myData' => 'Test',
    ];
}
```

### Placeholders

The package ships with default placeholders for each widget type, as well as a plain base widget placeholder. To use
your our placeholder view, return the view name from the `placeholderView` method:

```php
protected static function placeholderView(): string
{
    return 'widgets.skeletons.my-widget';
}
```

You can pass data to the placeholder view by returning an array from the `placeholderData` method. You should merge your
data with the parent method's data.

```php
protected static function getPlaceholderData(): array
{
    return array_merge(
        parent::getPlaceholderData(),
        [
            'title' => 'My Widget',
        ]
    );
}
```

### Customizing the Styles

We have tried to make the styles we ship as unopinionated as possible to only provide the structure you most likely will
need regardless of appearance. As such, you will want to apply additional customization to the widget classes to make
them fit your application.

You may customize the widget grid gap and widget padding by using the following CSS variables:

```css
:root {
    --ww-widgets-gap: 1.5rem;
    --ww-widget-padding: 1rem;
}
```

#### Responsive Widget Grid

By default, widgets are rendered in a responsive grid. The grid is based on CSS Grid and is responsive in a slightly
opinionated way. This means that each widget only has a specific width configured, which is the width it will take up on
desktop. On smaller screens, the width is automatically adjusted.

The base grid is:

- 2 columns by default
- 4 columns on `md` screens (and above)
- 12 columns on `lg` screens (and above)

Each Widget Width corresponds to a number of columns:

- `1/4` - 1 column
- `1/3` - 1 column (base), 2 columns (`md`), 4 columns (`lg`)
- `1/2` - 1 column (base), 2 columns (`md`), 6 columns (`lg`)
- `2/3` - 2 columns (base), 8 columns (`lg`)
- `3/4` - 2 columns (base), 3 columns (`md`), 9 columns (`lg`)
- `1/1` - 2 columns (base), 4 columns (`md`), 12 columns (`lg`)

You may customize this setup by overriding the corresponding width classes in your own stylesheet.

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
