# Codemetry

Codemetry analyzes a Git repository and produces a **metrics-based "mood proxy"** (bad/medium/good) for each day or time window. It does **not** infer emotions. Instead it estimates *quality/strain/risk* using measurable signals such as churn, scatter, follow-up fixes, and optional static-analysis totals, and reports a confidence score plus human-readable reasons.

**[Documentation](https://albertoarena.github.io/codemetry)** | **[Getting Started](https://albertoarena.github.io/codemetry/getting-started/installation/)**

## Requirements

- PHP 8.2+
- Git

## Installation

Codemetry is a development/analysis tool and should be installed as a dev dependency.

### Laravel adapter

```bash
composer require codemetry/laravel --dev
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=codemetry-config
```

### WordPress (WP-CLI)

```bash
wp package install codemetry/wordpress
# or
composer require codemetry/wordpress --dev
```

### Core (framework-agnostic)

```bash
composer require codemetry/core --dev
```

## Usage

### Laravel

```bash
# Table output (one row per day)
php artisan codemetry:analyze --days=7

# JSON output
php artisan codemetry:analyze --days=7 --format=json

# Filter by author or branch
php artisan codemetry:analyze --days=7 --author="Jane Doe" --branch=main

# Enable AI-powered explanations (requires API keys in config)
php artisan codemetry:analyze --days=7 --ai=1
```

### WordPress (WP-CLI)

```bash
# Table output (one row per day)
wp codemetry analyze --days=7

# JSON output
wp codemetry analyze --days=7 --format=json

# Filter by author or branch
wp codemetry analyze --days=7 --author="Jane Doe" --branch=main

# Enable AI-powered explanations
wp codemetry analyze --days=7 --ai=1

# View current configuration
wp codemetry config
```

### Core PHP API

```php
use Codemetry\Core\Analyzer;
use Codemetry\Core\Domain\AnalysisRequest;

$analyzer = new Analyzer();
$request = new AnalysisRequest(
    days: 7,
    branch: 'main',
);

$result = $analyzer->analyze('/path/to/repo', $request);

foreach ($result->windows as $mood) {
    echo "{$mood->windowLabel}: {$mood->moodLabel} ({$mood->moodScore}/100)\n";
}
```

## Signal Providers

Built-in providers that generate metrics for each analysis window:

| Provider | Signals |
|---|---|
| **ChangeShape** | Additions, deletions, churn, commit count, files touched, churn per commit, scatter |
| **CommitMessage** | Fix/revert/wip keyword counts, fix ratio |
| **FollowUpFix** | Commits touching the same files within a configurable horizon, fix density |

Optional tool-based providers (best-effort, skip gracefully if tools are unavailable):

| Provider | Tool |
|---|---|
| **PhpQuality** | phpstan / psalm |
| **JsTsQuality** | eslint / tsc |
| **CssQuality** | stylelint |

## Extending

Add a custom signal provider by implementing the `SignalProvider` interface:

```php
use Codemetry\Core\Signals\SignalProvider;
use Codemetry\Core\Domain\RepoSnapshot;
use Codemetry\Core\Domain\SignalSet;
use Codemetry\Core\Signals\ProviderContext;

class MyProvider implements SignalProvider
{
    public function id(): string
    {
        return 'my_provider';
    }

    public function provide(RepoSnapshot $snapshot, ProviderContext $ctx): SignalSet
    {
        // Compute and return signals
    }
}
```

Register it in the provider list — no pipeline changes required.

## AI Engines

AI integration is **opt-in** and **metrics-only**. Engines never receive raw code or diffs.

Supported engines:

- OpenAI
- Anthropic (Claude)
- DeepSeek
- Google (optional)

Configure in `config/codemetry.php`:

```php
'ai' => [
    'enabled' => true,
    'engine' => 'openai', // openai, anthropic, deepseek, google
    'api_key' => env('CODEMETRY_AI_KEY'),
],
```

When AI is requested but unavailable (missing keys, API failure), analysis continues normally with an `ai_unavailable` confounder added to the result.

## Privacy

- The AI engine abstraction receives **aggregated metrics only** — never raw source code, full diffs, or file contents.
- All analysis runs locally via Git commands against your repository.
- No data is sent to external services unless AI engines are explicitly enabled.

## License

MIT
