# Larapex Livewire
Laravel wrapper for [ApexCharts javascript plugin](https://apexcharts.com/) advanced features with livewire

> &nbsp;
>### 👉 [Support Livewire 3](#livewire_3_section)
>### 👉 [Support JS Callback Functions](#callback_section)
>### 👉 [Support Light, Dark Themes](#theme_section)
> &nbsp;

**Installation**
```
composer require larawire-garage/larapex-livewire
```


**Publish configurations**
```
php artisan vendor:publish --tag=larapex-livewire-configs
```
**Publish assets**
```
php artisan vendor:publish --tag=larapex-livewire-assets
```
**Add Scripts**

add `@larapexScripts` blade directive end of the body tag and before other scripts in main app layout file
```
// layouts.app.blade.php
<body>
    <!-- Your Layout HTML content -->

    @larapexScripts

    <script>
        // your scripts
    </script>
</body>
```
If you want to use chart only in sub pages or livewire component and need to push scripts to specific stack add stack name to script_section in `larapex-livewire.php` config file

```
// layouts.app.blade.php
<body>
    <!-- Your layout HTML content -->

    @yield('scripts')

    @stack('lw_scripts')
</body> 
```
```
// posts.stats.blade.php [normal or livewire component blade]
<div>
    <!-- Your Sub Page HTML content -->

    @pushOnce('lw_scripts')
        @larapexScripts
    @endPushOnce
</div>
```
```
'script_section' => 'lw_scripts',
```

**Make a chart**
```
php artisan make:larapex YOUR_CHART_CLASS_NAME
```

and Select a Chart Type from
   1. Area Chart
   2. Bar Chart
   3. Brush Chart
   4. Donut Chart
   5. Line Chart
   6. Pie Chart

then its generate a chart class. 


## Fill Data

>Chart class is a normal livewire class and you can use livewire features inside the class. For example event_listeners, parse value through mount() method etc.

Add data generating code in `dataSource()` function and use it to fill data in `build()` method.
```
private function dataSource(){
    // Data generating logic
}

public function build()
{
    $this->chart = (new WireableAreaChart($this->chart_id))
        ->addArea('sample-1', $this->dataSource());
}
```

## Add chart to page

add chart like any other livewire component into the blade file
```
<div>
    @livewire('chart-class-name-in-slug-format')
    <!-- OR -->
    <livewire:chart-class-name-in-slug-format />
</div>
```
>Use chart class namespace in dot notation and all in slug format for chart component name in `@livewire()` blade directive. <br>example:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; app/Http/Livewire/TestChart.php Class can use as 'test-chart'.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;app/Http/Livewire/Charts/TestChart.php Class can use as 'charts.test-chart'.

## Customize Chart

Can use any option except javascript callback functions as a array using `set` functions

- setChart()
- setColors()
- setDataLabels()
- setFill()
- setForecastDataPoints()
- setGrid()
- setLabels()
- setLegend()
- setMarkers()
- setNoData()
- setDataset()
- setStates()
- setStroke()
- setSubtitle()
- setTheme()
- setTitle()
- setTooltip()
- setPlotOptions()
- setXAxis()
- setYAxis()
- setAnnotations()

also ApexChart has few helper functions

- sparklineEnable(bool $enable)
- colors(array $colors)
- randomColors(int $limit)
- showDataLabels(bool $show)
- dataLabelsTextAnchor(string $anchor)
- dataLabelsStyles(array $styles)
- fillColors(array $colors)
- fillType(string $type)
- fillOpacity(float $opacity)
- fillSolid(array $colors)
- fillGradient(array $fromColors, array $toColors, array $others, string $shade, string $direction, array $colorStops, array $customStops)
- showGrid(bool $show)
- setGridInfo(array $info)
- labels(array $labels)
- markers(array $colors,int $width,int $hoverSize, array $others)
- noData($text, string $halign, string $valign, array $others)
- stroke(int $width, array $colors, string $curve, array $others)
- curve(string $curve)
- subtitle(string $subtitle, string $position, array $others)
- theme(string $mode, array $others)
- title(string $title, string $align, array $others)
- showTooltip(bool $show)
- tooltip(bool $show, string $theme, bool $fillSeriesColor, array $others)
- xAxis(array $categories, string $type, string $title, array $others)
- xAxisType(string $type)
- xAxisTickPlacement(string $placement)
- yAxis(bool $show, array $others)
- zoom(bool $enable, string $type, array $others)
- annotations(array $options)

**Overwrite configs**
- background(string $color)
- foreColor(string $color)
- fontFamily(string $fontFamily)
- height(string $height)
- width(string $width)


<a id="livewire_3_section"></a>

## Livewire 3 Support

==================== **New Chart Events** ====================
- `refresh:chart` *- update only data series* 
- `update:chart:options` *- update all options <b>`Experimental`</b>*
- `reset:chart` *- reset zoom etc. <b>`Experimental`</b>*
- `delete:chart` *- remove chart element from DOM*


>   ### This events <u>Simple Chart</u> & <u>Brush Chart</u> both supported. 


<b>Usage :</b>
```
$this->dispatch('refresh:chart', ['min' => rand(1, 5), 'max' => rand(1, 30)])->to(MyChart::class);
$this->dispatch('update:chart:options')->to(MyChart::class);
$this->dispatch('reset:chart')->to(MyChart::class);
$this->dispatch('delete:chart')->to(MyChart::class);
```

<a id="callback_section"></a>

## Js Callback Function Support

If you need to add custom callback functions for something like formatters, you can use ``` jsCallback() ``` function.
In ``` jsCallback() ``` function first Parameter is array key path in dot notation. And JS Callback function string needs to pass as second parameter.

```
public function jsCallback($key, $jsFunc) 
```

>You can also use `heredoc syntax` and `nowdoc syntax` instead of regular string when defined js function

<b>Usage : <b>
```
$this->chart = (new WireableAreaChart($this->chart_id)) 
            ->addArea('sample-1', $this->dataSource())

            /**
             * using String
             */
            ->jsCallback('dataLabels.formatter', "function (val, opts) {
                        return val + 'X'
            }")

             /**
             * using heredoc
             */
            ->jsCallback('yaxis.labels.formatter', <<<HTML
                        function (value){
                            return value+'$'
                        }
            HTML) 
            ->jsCallback('tooltip.y.formatter', <<<HTML
                    function(value,{series,seriesIndex,dataPointIndex,w}){
                        return value;
                    }
            HTML);
```

<a id="theme_section"></a>

## Light, Dark Themes Support

You can change theme of the chart. In the configs you can customize the background and font colors for each light and dark theme. if you set default theme to `"auto"`, chart use OS color scheme [light or dark].

> ⚠ If you migrate from v1.x, you needs to re-publish config file with `--force` option to replace new config file.

```Bash
php artisan vendor:publish --tag=larapex-livewire-configs --force
```

You can change the theme in the chart component using chart's `theme()` function.

```php
// change theme from chart component

$this->chart = (new WireableAreaChart($this->chart_id))
                    ->addArea('sample-1', $this->dataSource())
                    ->theme('auto'); // support: light, dark, auto
```
You can change and customize the theme in the configs

> <br>
> ▶ Only supports light, dark, auto themes.<br>
> ▶ Only supports background_color & font_color attrubutes of the theme. <br>
>  &nbsp;
<br>

```php
// customize theme colors in config

'default_theme'    => 'auto',

'available_themes' => [
    'light' => [
        'background_color' => '#fff',
        'font_color'       => '#000',
    ],
    'dark'  => [
        'background_color' => '#ffffff00',
        'font_color'       => '#f1f1f1',
    ],
],
```

Also chart listening to `themeChanged` javascript custom event.

```javascript
    let theme = 'dark';
    let data = { detail: { theme: theme }, bubble: true, cancellable: true };
    let event = new CustomEvent('themeChanged', data);
    window.dispatchEvent(event);
```

> ⚠ `themeChanged` event listener looking for `event.detail.theme` key for theme string.

## Inspiration
Highly inspired by [Larapex Charts Package](https://github.com/ArielMejiaDev/larapex-charts).


!!! :tada::tada::tada: Enjoy :tada::tada::tada: !!!
