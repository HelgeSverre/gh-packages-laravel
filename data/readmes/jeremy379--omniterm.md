> [!NOTE]
> ⚠️ **This package is no longer needed.** The original author [David Philip](https://github.com/pdphilip) has returned and the package is back under active maintenance on GitLab at [`pdphilip/omniterm`](https://gitlab.com/pdphilip/omniterm). Please use the official package: `composer require pdphilip/omniterm`
>
> This repository was created as a temporary mirror when the original returned a 404. It will be archived shortly.

---

<div align="center">

<img src="https://cdn.snipform.io/pdphilip/omniterm/omni-term-banner.png" alt="OmniTerm" />

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pdphilip/omniterm.svg?style=flat-square)](https://packagist.org/packages/pdphilip/omniterm)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/pdphilip/omniterm/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/pdphilip/omniterm/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/pdphilip/omniterm.svg?style=flat-square)](https://packagist.org/packages/pdphilip/omniterm)

**Terminal UI toolkit for Laravel**

Rich CLI output using HTML and Tailwind CSS classes, rendered as ANSI in your terminal.

![Progress Bars](docs/gifs/progress-bars.gif)

</div>

---

## About

OmniTerm is a terminal rendering engine for Laravel. Write your CLI output as HTML with Tailwind CSS classes and OmniTerm compiles it to ANSI escape sequences.

The Tailwind-for-terminal concept was pioneered by [Termwind](https://github.com/nunomaduro/termwind). OmniTerm builds on that idea with its own rendering engine that adds:

- **16 million color support** - full RGB truecolor, with automatic 256-color fallback for older terminals
- **Gradients** - `bg-gradient-to-r`, `from-{color}`, `via-{color}`, `to-{color}` for smooth per-character color transitions
- **Arbitrary RGB classes** - `text-[R,G,B]` and `bg-[R,G,B]` for computed/dynamic colors
- **Content repeat** - `content-repeat-[char]` to fill widths with box-drawing characters

On top of the rendering engine, OmniTerm ships with a set of pre-built components for common CLI patterns: status messages, data tables, progress bars, spinners, live tasks, and an interactive split-pane browser.

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12

## Installation

```bash
composer require pdphilip/omniterm
```

---

## Built-in Components

Add the `HasOmniTerm` trait to any Artisan command:

```php
use OmniTerm\HasOmniTerm;

class MyCommand extends Command
{
    use HasOmniTerm;

    public function handle()
    {
        $this->omni->success('Ready');
    }
}
```

### Status Messages

One-line status badges:

```php
$this->omni->success('Task completed');     // Green GOOD badge
$this->omni->error('Something went wrong'); // Red FAIL badge
$this->omni->warning('Check your config');  // Amber WARN badge
$this->omni->info('Processing...');         // Blue INFO badge
$this->omni->disabled('Feature off');       // Gray OFF badge
```

Detailed status blocks with title, message, and help lines:

```php
$this->omni->statusSuccess('Migration Complete', 'All 42 records processed', ['Run cache:clear']);
$this->omni->statusError('Connection Failed', 'Could not reach database', ['Check .env', 'Ensure MySQL is running']);
```

![Status Messages](./docs/gifs/status-messages.gif)

### Data Tables

Key-value rows with status indicators:

```php
$this->omni->tableHeader('Setting', 'Value', 'Notes');
$this->omni->tableRow('Database', 'mysql', 'Production server');
$this->omni->tableRowSuccess('Connection', 'Active');
$this->omni->tableRowError('SSL Certificate', 'Expired');
$this->omni->tableRowWarning('Memory', '85% used');
```

![Data Tables](./docs/gifs/data-tables.gif)

### Visual Elements

Title bars, boxes, and horizontal rules:

```php
$this->omni->titleBar('My Application', 'sky');
$this->omni->roundedBox('Welcome', 'text-cyan-500', 'text-white');
$this->omni->hr();
$this->omni->hrSuccess();
```

![Visual Elements](./docs/gifs/visual-elements.gif)

### Progress Bars

Fluent builder API with three styles: simple, framed, and gradient. Color steps transition from rose through amber to emerald as progress increases.

```php
$bar = $this->omni->progressBar(100)->framed()->steps();
$bar->start();

foreach ($items as $item) {
    // work...
    $bar->advance();
}

$bar->finish();
```

Other variants:

```php
$this->omni->progressBar(50);                              // Simple bar (sky)
$this->omni->progressBar(50)->steps();                     // Simple with color steps
$this->omni->progressBar(50)->framed()->color('indigo');   // Framed with custom color
$this->omni->progressBar(50)->gradient();                  // Gradient (amber → emerald)
$this->omni->progressBar(50)->framed()->gradient('rose', 'sky'); // Custom gradient
```

![Progress Bars](./docs/gifs/progress-bars.gif)

### Live Tasks

Run a callback in a background process with an animated spinner:

```php
use OmniTerm\Async\Spinner;

$this->omni->newLoader(Spinner::Sand);

$result = $this->omni->runTask('Processing data...', function () {
    sleep(3);
    return ['state' => 'success', 'message' => 'Done'];
});
```

One-liner with `task()`:

```php
$this->omni->task('Processing batch job', function () {
    sleep(3);
    return ['state' => 'success', 'message' => 'Batch complete', 'details' => '500 records'];
}, Spinner::DotsCircle, ['text-indigo-500', 'text-violet-500']);
```

For fine-grained control with live-updating counters:

```php
$task = $this->omni->liveTask('Processing records', spinner: Spinner::Dots3)
    ->row('Created', 0, 'text-sky-500')
    ->row('Updated', 0, 'text-emerald-500')
    ->row('Skipped', 0, 'text-amber-500')
    ->row('Failed', 0, 'text-rose-500');

// Simulate 5 chunked batches
for ($batch = 0; $batch < 5; $batch++) {
    $result = $task->run(function () {
        usleep(800000);

        return [
            'created' => rand(10, 50),
            'updated' => rand(5, 20),
            'skipped' => rand(0, 5),
            'failed' => rand(0, 2),
        ];
    });

    $task->increment('Created', $result['created']);
    $task->increment('Updated', $result['updated']);
    $task->increment('Skipped', $result['skipped']);
    $task->increment('Failed', $result['failed']);
}

$task->finish('Processing complete');
```

The `Spinner` enum provides 10 animation types: `Dots`, `Dots2`, `Dots3`, `DotsCircle`, `Sand`, `Clock`, `Material`, `Pong`, `Progress`, `ProgressLoader`.

### Interactive Browser

Split-pane TUI: scrollable list on the left, detail view on the right. Items can be closures (rendered with full omni output), associative arrays (auto-formatted), or plain arrays.

```
+-- Server Dashboard ---------------+-----------------------------------+
| > web-01                          |  ✓ GOOD  Healthy                  |
|   web-02                          |  All checks passing               |
|   db-primary                      |                                   |
|   cache-01                        |  Metric    Value                  |
+-----------------------------------+  CPU        23%                   |
                                    +-----------------------------------+
  ↑/↓ Navigate  Enter Select  q/Esc Exit
```

```php
use OmniTerm\OmniTerm;

$selected = $this->omni->browse('Server Dashboard', [
    'web-01' => function (OmniTerm $omni) {
        $omni->statusSuccess('Healthy', 'All checks passing');
        $omni->tableHeader('Metric', 'Value');
        $omni->tableRowSuccess('CPU', '23%');
        $omni->tableRow('Memory', '4.2 GB / 8 GB');
    },
    'db-primary' => ['status' => 'running', 'cpu' => '45%', 'memory' => '28 GB / 32 GB'],
]);
// Returns selected key, or null on Esc
```

### Interactive Prompts

```php
$name = $this->omni->ask('What is your name?');
$color = $this->omni->ask('Choose a color:', ['red', 'green', 'blue']);
```

---

## DIY - The Rendering Engine

The built-in components are just Blade templates compiled through OmniTerm's rendering engine. You can use the same engine directly to build anything.

### `render()`

Write HTML with Tailwind classes, get ANSI output:

```php
$this->omni->render('<div class="flex">
    <span class="bg-emerald-600 text-white font-bold px-1">PASS</span>
    <span class="flex-1 text-zinc-400 px-1">Database connection verified</span>
    <span class="text-zinc-600 text-right w-12">12ms</span>
</div>');
```

### `liveView()`

Redraws in place, for live-updating displays:

```php
$live = $this->omni->liveView('<div>Starting...</div>');

for ($i = 1; $i <= 100; $i++) {
    $live->reRender("<div>Progress: {$i}%</div>");
    usleep(50000);
}

$this->omni->endLiveView();
```

### `parse()`

Convert HTML to an ANSI string without printing:

```php
$ansi = $this->omni->parse('<span class="text-sky-500">Hello</span>');
```

### `terminal()`

Terminal dimensions:

```php
$width = $this->omni->terminal()->getWidth();
$height = $this->omni->terminal()->getHeight();
```

### Supported Classes

![Tailwind Classes](docs/gifs/tailwind-classes.gif)

#### Layout

| Class         | Effect                    |
|---------------|---------------------------|
| `flex`        | Horizontal layout         |
| `flex-1`      | Fill remaining space      |
| `w-{n}`       | Fixed width in characters |
| `space-x-{n}` | Gap between children      |

#### Spacing

| Class                        | Effect                        |
|------------------------------|-------------------------------|
| `px-{n}`, `pl-{n}`, `pr-{n}` | Horizontal padding            |
| `mx-{n}`, `ml-{n}`, `mr-{n}` | Horizontal margin             |
| `mt-{n}`, `mb-{n}`           | Vertical margin (blank lines) |

#### Typography

| Class         | Effect       |
|---------------|--------------|
| `font-bold`   | Bold         |
| `text-center` | Center-align |
| `text-right`  | Right-align  |

#### Colors

All [Tailwind colors](https://tailwindcss.com/docs/customizing-colors) with shades 50-950: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink,
rose.

| Class                  | Effect                                       |
|------------------------|----------------------------------------------|
| `text-{color}-{shade}` | Text color, e.g. `text-sky-500`              |
| `bg-{color}-{shade}`   | Background color, e.g. `bg-red-600`          |
| `text-[R,G,B]`         | Arbitrary RGB text, e.g. `text-[255,100,50]` |
| `bg-[R,G,B]`           | Arbitrary RGB background                     |

#### Gradients

Per-character color interpolation across an element's width.

| Class                  | Effect                 |
|------------------------|------------------------|
| `bg-gradient-to-r`     | Left-to-right gradient |
| `bg-gradient-to-l`     | Right-to-left gradient |
| `from-{color}-{shade}` | Start color            |
| `via-{color}-{shade}`  | Midpoint color         |
| `to-{color}-{shade}`   | End color              |

```php
$this->omni->render('<div class="flex">
    <span class="flex-1 bg-gradient-to-r from-indigo-800 via-purple-500 to-pink-400 text-white text-center">
        Smooth gradient
    </span>
</div>');
```

#### Content

| Class                   | Effect                         |
|-------------------------|--------------------------------|
| `content-repeat-[char]` | Repeat character to fill width |

### Color Mode Detection

OmniTerm auto-detects your terminal's color capability:

- **Truecolor (16M)** - full RGB. iTerm2, Kitty, WezTerm, most modern terminals.
- **256-color** - automatic fallback for older terminals (e.g. Apple Terminal). Colors mapped to nearest match.

No configuration needed.

### Using Blade Templates

Since OmniTerm is a Laravel package, you can write your CLI output as Blade views and render them through the engine. This is how all the built-in components work:

```php
// resources/views/cli/deploy-status.blade.php
<div class="flex">
    <span class="bg-{{ $color }}-600 text-white font-bold px-1">{{ $badge }}</span>
    <span class="flex-1 text-zinc-400 px-1">{{ $message }}</span>
</div>

// In your command
$this->omni->view('cli.deploy-status', [
    'badge' => 'DEPLOY',
    'color' => 'emerald',
    'message' => 'Production updated',
]);
```

---

## Samples

OmniTerm includes sample commands for every feature. Copy them into your app:

```bash
mkdir -p app/Console/Commands/OmniTermSamples
cp vendor/pdphilip/omniterm/samples/Commands/*.php app/Console/Commands/OmniTermSamples/
```

Update the namespace in each file to `App\Console\Commands\OmniTermSamples`, then:

```bash
php artisan omniterm:full-demo          # One of every feature
php artisan omniterm:status-messages    # Status messages
php artisan omniterm:data-tables        # Key-value tables
php artisan omniterm:visual-elements    # Boxes and horizontal rules
php artisan omniterm:title-bars         # Title bar colors
php artisan omniterm:progress-bars      # All progress bar styles
php artisan omniterm:spinners           # All 10 spinner animations
php artisan omniterm:async-tasks        # Async task execution
php artisan omniterm:live-task-demo     # LiveTask with feedback rows
php artisan omniterm:browser-demo       # Interactive split-pane browser
php artisan omniterm:tailwind-classes   # Every supported CSS class
php artisan omniterm:interactive        # Interactive prompts
php artisan omniterm:custom-colors      # Custom color schemes
php artisan omniterm:global-functions   # Render & live view functions
```

---

## Testing

```bash
composer test        # Lint + PHPStan + Pest
composer test:unit   # Pest only
composer types       # PHPStan only
composer format      # Laravel Pint
```

## License

MIT. See [License File](LICENSE.md).
