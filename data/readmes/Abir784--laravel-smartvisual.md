# SmartVisual

SmartVisual is a Laravel visualization package built from scratch by AbirCodes.
It renders charts using a custom SVG engine and does not depend on Chart.js.

## Features

- Custom SVG rendering engine
- Bar, Line, Radar, Pie, Doughnut charts
- AI chart auto-detection
- JSON and SVG export out of the box
- Optional PNG export (requires Imagick)
- Optional PDF export (requires dompdf)
- Live dashboard friendly output

## Requirements

- PHP 8.1+
- Laravel 9, 10, 11, or 12

## Installation (Step by Step)

### 1) Install package

```bash
composer require abircode/smartvisual
```

### 2) Publish package config

```bash
php artisan vendor:publish --provider="Apack\SmartVisual\SmartVisualServiceProvider"
```

### 3) Clear cached config

```bash
php artisan optimize:clear
```

## Basic Usage

```php
use Apack\SmartVisual\Facades\Chart;

$chart = Chart::bar()
    ->setTitle('Monthly Sales')
    ->setLabels(['Jan', 'Feb', 'Mar', 'Apr'])
    ->addDataset('Revenue', [120, 180, 160, 210]);

$svg = $chart->render();
```

## Example Controller

Create `app/Http/Controllers/ChartController.php`:

```php
<?php

namespace App\Http\Controllers;

use Apack\SmartVisual\Facades\Chart;

class ChartController extends Controller
{
    public function index()
    {
        $barChart = Chart::bar()
            ->setTitle('Monthly Sales Report')
            ->setLabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'])
            ->addDataset('2024', [65, 59, 80, 81, 56, 55])
            ->addDataset('2023', [45, 39, 60, 61, 36, 35]);

        $lineChart = Chart::line()
            ->setTitle('Website Traffic')
            ->setLabels(['Week 1', 'Week 2', 'Week 3', 'Week 4'])
            ->addDataset('Visitors', [1200, 1900, 1500, 2200])
            ->addDataset('Page Views', [2100, 2400, 2100, 2800])
            ->setFillArea(true);

        $radarChart = Chart::radar()
            ->setTitle('Skills Assessment')
            ->setLabels(['PHP', 'JS', 'SQL', 'DevOps', 'UI/UX'])
            ->addDataset('Dev A', [85, 90, 78, 82, 88])
            ->addDataset('Dev B', [78, 85, 92, 75, 80]);

        $pieChart = Chart::pie()
            ->setTitle('Market Share')
            ->setLabels(['Product A', 'Product B', 'Product C', 'Product D'])
            ->addDataset('Share', [30, 25, 25, 20]);

        return view('charts.index', [
            'barSvg' => $barChart->render(),
            'lineSvg' => $lineChart->render(),
            'radarSvg' => $radarChart->render(),
            'pieSvg' => $pieChart->render(),
        ]);
    }
}
```

## Example Blade View

Create `resources/views/charts/index.blade.php`:

```blade
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartVisual Demo</title>
    <style>
        body { font-family: Georgia, serif; margin: 0; padding: 24px; background: #f8fafc; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 16px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
        .card h2 { margin: 0 0 8px 0; font-size: 18px; }
        .chart svg { width: 100%; height: auto; display: block; }
    </style>
</head>
<body>
    <h1>SmartVisual Charts</h1>

    <div class="grid">
        <div class="card">
            <h2>Bar Chart</h2>
            <div class="chart">{!! $barSvg !!}</div>
        </div>

        <div class="card">
            <h2>Line Chart</h2>
            <div class="chart">{!! $lineSvg !!}</div>
        </div>

        <div class="card">
            <h2>Radar Chart</h2>
            <div class="chart">{!! $radarSvg !!}</div>
        </div>

        <div class="card">
            <h2>Pie Chart</h2>
            <div class="chart">{!! $pieSvg !!}</div>
        </div>
    </div>
</body>
</html>
```

## Example Route

Add this in `routes/web.php`:

```php
use App\Http\Controllers\ChartController;

Route::get('/charts-demo', [ChartController::class, 'index']);
```

## Export Examples

```php
$chart = Chart::pie()
    ->setTitle('Segment Mix')
    ->setLabels(['Enterprise', 'Growth', 'Mid-Market', 'Starter'])
    ->addDataset('Mix', [34, 26, 22, 18]);

$svgPath = $chart->export('svg');
$jsonPath = $chart->export('json');

// Requires Imagick
// $pngPath = $chart->export('png');

// Requires dompdf/dompdf
// $pdfPath = $chart->export('pdf');
```

## Demo Dashboard Screenshots

These snapshots are generated from the live demo dashboard endpoint.

### Revenue Momentum

![Revenue Momentum](docs/screenshots/performance.svg)

### Delivery Capacity

![Delivery Capacity](docs/screenshots/capacity.svg)

### Segment Mix

![Segment Mix](docs/screenshots/mix.svg)

### Operational Health

![Operational Health](docs/screenshots/health.svg)

## Local Development Test

```bash
php test_package.php
```

## Notes

- If you use local path installation for testing, set a Composer path repository in your Laravel app.
- If export to PNG or PDF fails, install the required optional dependencies listed above.
- For interactive dashboards, use periodic AJAX refresh and swap rendered SVG blocks.
