# Proofread

> The only eval package native to the official Laravel AI stack.

[![Latest Release](https://img.shields.io/github/v/release/mosaiqo/proofread?style=flat-square&label=release)](https://github.com/mosaiqo/proofread/releases)
[![Tests](https://img.shields.io/github/actions/workflow/status/mosaiqo/proofread/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/mosaiqo/proofread/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/mosaiqo/proofread?style=flat-square&color=blue)](LICENSE)
[![PHP](https://img.shields.io/badge/php-8.4-blue.svg?style=flat-square)](https://www.php.net)
[![Laravel](https://img.shields.io/badge/laravel-13.x-red.svg?style=flat-square)](https://laravel.com)

> **Status:** Early development — pre-1.0, API unstable.

## What it does

Modern Laravel apps increasingly ship AI agents, prompts, and MCP tools straight
to production. The official `laravel/ai` SDK makes building them easy, but the
feedback loop for *evaluating* them has lived outside the framework in
language-agnostic tools like Promptfoo. Proofread brings that loop home: a
Laravel-native way to measure whether your agents actually do what you think
they do, from Pest, from CI, and from production traffic.

Three things make Proofread different:

- **Agent classes are first-class eval subjects.** Point an eval at an FQCN,
  an instance, or a callable — `SubjectResolver` normalizes all of them, and
  `laravel/ai` fakes plug in automatically.
- **Pest-native expectations.** Write evals as `expect($agent)->toPassEval(...)`
  instead of learning a new YAML DSL. Rubrics, JSON schemas, cost ceilings, and
  golden snapshots are all `expect()` extensions.
- **Shadow evals in production.** Capture real traffic via middleware,
  evaluate it asynchronously against registered assertions, alert on
  pass-rate drops, and promote failing captures into regression datasets.

## Installation

```bash
composer require mosaiqo/proofread
```

Requires PHP 8.4 and Laravel 13.x.

Optional MCP integration (expose eval tools to MCP-compatible editors
and assistants):

```bash
composer require laravel/mcp
```

Publish the config and migrations:

```bash
php artisan vendor:publish --tag=proofread-config
php artisan vendor:publish --tag=proofread-migrations
php artisan migrate
```

## Quick start

### 1. Define an agent with `laravel/ai`

```php
namespace App\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class SentimentAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
            You are a sentiment classifier.
            Classify the user message as exactly one of: positive, negative, neutral.
            Respond with a single lowercase word. No punctuation, no explanation.
            PROMPT;
    }
}
```

### 2. Write a Pest eval

```php
use App\Agents\SentimentAgent;
use Mosaiqo\Proofread\Assertions\CostLimit;
use Mosaiqo\Proofread\Assertions\RegexAssertion;
use Mosaiqo\Proofread\Assertions\Rubric;
use Mosaiqo\Proofread\Support\Dataset;

it('classifies sentiment reliably and cheaply', function (): void {
    $dataset = Dataset::make('sentiment', [
        ['input' => 'I love this product!', 'expected' => 'positive'],
        ['input' => 'This is terrible.', 'expected' => 'negative'],
        ['input' => 'It works as described.', 'expected' => 'neutral'],
    ]);

    expect(SentimentAgent::class)->toPassEval($dataset, [
        RegexAssertion::make('/^(positive|negative|neutral)$/'),
        Rubric::make('response is a single lowercase sentiment label'),
        CostLimit::under(0.01),
    ]);
});
```

### 3. Or wrap it in an `EvalSuite` and run from Artisan

```php
namespace App\Evals;

use App\Agents\SentimentAgent;
use Mosaiqo\Proofread\Assertions\RegexAssertion;
use Mosaiqo\Proofread\Suite\EvalSuite;
use Mosaiqo\Proofread\Support\Dataset;

final class SentimentSuite extends EvalSuite
{
    public function dataset(): Dataset
    {
        return Dataset::make('sentiment', [
            ['input' => 'I love this product!', 'expected' => 'positive'],
            ['input' => 'This is terrible.', 'expected' => 'negative'],
        ]);
    }

    public function subject(): mixed
    {
        return SentimentAgent::class;
    }

    public function assertions(): array
    {
        return [
            RegexAssertion::make('/^(positive|negative|neutral)$/'),
        ];
    }
}
```

```bash
php artisan evals:run "App\\Evals\\SentimentSuite"
```

## Core concepts

### EvalSuite

A suite bundles a dataset, a subject, and a list of assertions. Extend
`Mosaiqo\Proofread\Suite\EvalSuite` and implement three methods:

```php
abstract public function dataset(): Dataset;
abstract public function subject(): mixed;
abstract public function assertions(): array;
```

See `src/Suite/EvalSuite.php` for the full contract.

Suites can optionally override `setUp()` and `tearDown()` for
database-dependent setup, and `assertionsFor(array $case)` to vary
assertions per case based on metadata. Both `toPassSuite()` in Pest
and the `evals:run` Artisan command drive the full lifecycle
automatically.

### Subjects

Three shapes are accepted:

- **Callable** — a closure or any `callable`, receives `(mixed $input, array $case)`.
- **Agent FQCN** — a class-string implementing `Laravel\Ai\Contracts\Agent`.
  Resolved from the container on each case.
- **Agent instance** — useful when you want to pre-configure the agent.

`Mosaiqo\Proofread\Runner\SubjectResolver` normalizes all three into a uniform
closure and captures token usage, model, provider, latency, and derived cost
into assertion metadata.

### Assertions

| Assertion | Kind | Example |
|---|---|---|
| `ContainsAssertion` | deterministic | `ContainsAssertion::make('positive')` |
| `RegexAssertion` | deterministic | `RegexAssertion::make('/^\d+$/')` |
| `LengthAssertion` | deterministic | `LengthAssertion::between(5, 200)` |
| `CountAssertion`     | deterministic | `CountAssertion::between(1, 10)`                       |
| `JsonSchemaAssertion` | deterministic | `JsonSchemaAssertion::fromAgent(MyAgent::class)` |
| `TokenBudget` | operational | `TokenBudget::maxTotal(1000)` |
| `CostLimit` | operational | `CostLimit::under(0.01)` |
| `LatencyLimit` | operational | `LatencyLimit::under(3000)` |
| `Rubric` | semantic (LLM-as-judge) | `Rubric::make('polite and concise')` |
| `Similar` | semantic (embeddings) | `Similar::to('reference text')->minScore(0.8)` |
| `HallucinationAssertion` | semantic (LLM-as-judge) | `HallucinationAssertion::against($groundTruth)` |
| `LanguageAssertion` | semantic (LLM-as-judge) | `LanguageAssertion::matches('en')` |
| `Trajectory` | trajectory | `Trajectory::callsTool('search')` |
| `GoldenSnapshot` | snapshot | `GoldenSnapshot::fromContext()` |
| `StructuredOutputAssertion` | structured | `StructuredOutputAssertion::conformsTo(MyAgent::class)` |
| `PiiLeakageAssertion` | safety | `PiiLeakageAssertion::make()` |

All assertions live under `Mosaiqo\Proofread\Assertions\`. Each one returns an
`AssertionResult` with a `passed` bool, a human-readable `reason`, an optional
numeric `score`, and arbitrary `metadata`.

### Pest expectations

| Expectation | Subject | Usage |
|---|---|---|
| `toPassAssertion` | any output | `expect($output)->toPassAssertion(ContainsAssertion::make('x'))` |
| `toPassEval` | callable / Agent | `expect($agent)->toPassEval($dataset, $assertions)` |
| `toPassSuite`            | EvalSuite         | `expect($suite)->toPassSuite()`                       |
| `toPassRubric` | string output | `expect($output)->toPassRubric('polite tone')` |
| `toMatchSchema` | JSON output | `expect($json)->toMatchSchema($schemaArray)` |
| `toCostUnder` | `EvalRun` | `expect($run)->toCostUnder(0.05)` |
| `toMatchGoldenSnapshot` | any output | `expect($output)->toMatchGoldenSnapshot()` |

Both `toPassEval` and `toPassSuite` assign the resulting `EvalRun`
to the expectation's `->value` after the assertion passes, so
callers can chain post-run inspection:

```php
$run = expect($agent)->toPassEval($dataset, $assertions)->value;

expect($run->total_cost_usd)->toBeLessThan(0.05);
expect($run->failures())->toBeEmpty();
```

Expectations are loaded via `Mosaiqo\Proofread\Testing\expectations.php`; wire
it up from your `tests/Pest.php`:

```php
require_once __DIR__.'/../vendor/mosaiqo/proofread/src/Testing/expectations.php';
```

A bundled PHPStan extension teaches static analysis about these dynamic
expectations — no stub files to maintain.

### Artisan commands

| Command | Purpose |
|---|---|
| `evals:run {suites*}` | Run one or more `EvalSuite` classes. Flags: `--persist`, `--fail-fast`, `--filter`, `--junit`, `--queue`, `--commit-sha`, `--fake-judge`, `--concurrency`, `--gate-pass-rate`, `--gate-cost-max`. |
| `evals:benchmark {suite}` | Run a suite N times and report pass-rate variance, duration percentiles, cost, and per-case flakiness. Flags: `--iterations`, `--concurrency`, `--fake-judge`, `--flakiness-threshold`, `--format`. |
| `evals:compare {base} {head}` | Structured diff between two persisted runs. Flags: `--format=table\|json\|markdown`, `--only-regressions`, `--max-cases`, `--output`. |
| `evals:dataset:diff {dataset}` | Compare two versions of a dataset. Accepts `--base`, `--head`, `--format`. |
| `evals:providers {suite}` | Run a `MultiSubjectEvalSuite` and render a matrix of cases × subjects. Flags: `--persist`, `--commit-sha`, `--concurrency`, `--provider-concurrency`, `--fake-judge`, `--format`. |
| `evals:export {id}` | Export a persisted run or comparison as self-contained Markdown or HTML. `id` accepts a ULID, a commit SHA prefix, or `latest` (resolves to the most recent run). Use `--type=comparison` to target comparisons. Flags: `--format`, `--output`, `--type=run\|comparison`. |
| `evals:cluster` | Cluster failures by embedding similarity |
| `evals:cost-simulate {agent}` | Project cost against alternative models using shadow capture data. Flags: `--days`, `--model`, `--format`. |
| `evals:coverage {agent} {dataset}` | Analyze dataset coverage against shadow captures using embeddings. Flags: `--days`, `--threshold`, `--max-captures`, `--embedding-model`, `--format`. |
| `proofread:lint {agents*}` | Static analysis of Agent `instructions()`. Flags: `--format`, `--severity`, `--with-judge`. |
| `shadow:evaluate` | Evaluate captured shadow traffic against registered assertions |
| `shadow:alert` | Check pass-rate alerts against thresholds |
| `dataset:generate` | Generate synthetic cases from a schema via an LLM |
| `dataset:import {file}` | Import a CSV or JSON file into a PHP dataset file. Flags: `--name`, `--output`, `--force`. |
| `dataset:export {dataset}` | Export a persisted dataset version as CSV or JSON. Flags: `--format`, `--output`, `--dataset-version`. |
| `proofread:make-suite {name}` | Scaffold a new `EvalSuite`. Flag: `--multi`. |
| `proofread:make-assertion {name}` | Scaffold a new `Assertion` class. |
| `proofread:make-dataset {name}` | Scaffold a dataset PHP file. Flag: `--path`. |

Each command supports `--help` for the full flag list.

## Running cases in parallel

`EvalRunner::runSuite($suite, concurrency: 5)` executes up to 5 cases
in parallel via Laravel's process-based concurrency driver. The
`evals:run --concurrency=N` flag exposes the same capability from the
CLI.

Concurrency is beneficial for I/O-bound subjects (LLM and HTTP calls)
where parallel wait dominates. For deterministic in-memory subjects
the per-task overhead of child-process spawning and closure
serialization makes sequential execution faster — leave `concurrency`
at its default of `1` in that case.

Subjects must be serializable. Agent class-string FQCNs and static
closures serialize cleanly. Ad-hoc closures that capture test-local
state by reference (`use (&$x)`) cannot cross the process boundary
and should only be used with `concurrency: 1`.

> **Note:** concurrency > 1 is unsafe for subjects that write to
> SQLite. SQLite serializes writers, so parallel SQLite writes will
> hit "database is locked" errors. Use concurrency for LLM and HTTP
> subjects, or subjects that only read from the database.

## Shadow evals

Shadow evals let you measure agent quality on real production traffic without
affecting the user-facing response path.

The flow is:

1. Apply `Mosaiqo\Proofread\Shadow\EvalShadowMiddleware` to routes that call
   your agent. It samples a configurable fraction of requests, sanitizes PII,
   and persists a `ShadowCapture` row.
2. A queued job (or `shadow:evaluate` on a schedule) runs the registered
   assertions for that agent over new captures and records a `ShadowEval`.
3. `shadow:alert` checks the pass rate over a sliding window and dispatches
   a notification (mail, Slack webhook, etc.) when it drops below the
   configured threshold.
4. From the dashboard you can promote any failing capture straight into a
   regression dataset.

Register the assertions you want to evaluate per agent in a service provider:

```php
use App\Agents\SentimentAgent;
use Mosaiqo\Proofread\Assertions\RegexAssertion;
use Mosaiqo\Proofread\Shadow\ShadowAssertionsRegistry;

public function boot(ShadowAssertionsRegistry $registry): void
{
    $registry->register(SentimentAgent::class, [
        RegexAssertion::make('/^(positive|negative|neutral)$/'),
    ]);
}
```

And enable shadow capture in `config/proofread.php`:

```php
'shadow' => [
    'enabled' => true,
    'sample_rate' => 0.1,
    'queue' => 'default',
    'alerts' => [
        'enabled' => true,
        'pass_rate_threshold' => 0.85,
        'window' => '1h',
        'channels' => ['mail', 'slack'],
    ],
],
```

See `src/Shadow/` for the full surface.

## Multi-provider comparison

Compare the same dataset against multiple subjects — typically
different models, providers, or prompt variations — in a single
invocation. Extend `MultiSubjectEvalSuite` and declare
`subjects(): array<string, mixed>`:

```php
final class SentimentMatrixSuite extends MultiSubjectEvalSuite
{
    public function name(): string
    {
        return 'sentiment-matrix';
    }

    public function dataset(): Dataset
    {
        return Dataset::make('sentiment', [...]);
    }

    public function subjects(): array
    {
        return [
            'haiku'  => SentimentAgentHaiku::class,
            'sonnet' => SentimentAgentSonnet::class,
            'opus'   => SentimentAgentOpus::class,
        ];
    }

    public function assertions(): array
    {
        return [Rubric::make('Must classify correctly.')->minScore(0.8)];
    }
}
```

Run it:

```bash
php artisan evals:providers App\\Evals\\SentimentMatrixSuite --persist --provider-concurrency=3
```

Output is a matrix of cases × subjects with pass/fail status and
per-subject aggregate stats. The persisted comparison is browsable
at `/evals/comparisons/{id}` in the dashboard, exportable via
`evals:export {id}`, and queryable via the `EvalComparison` model.

Helper methods on `EvalComparison`: `bestByPassRate()`, `cheapest()`,
`fastest()`. No opinionated overall winner — the three axes are
surfaced separately.

## Dashboard

A Livewire-powered dashboard ships with the package at `/evals` (configurable).
Routes:

- `/evals/overview` — home with trend chart and recent regressions
- `/evals/runs` — run history with filters and stats
- `/evals/runs/{ulid}` — per-case drill-down
- `/evals/runs/{ulid}/export?format=md|html` — download the run as a self-contained Markdown or HTML document
- `/evals/datasets` — dataset explorer with sparklines
- `/evals/compare` — side-by-side diff between two runs
- `/evals/comparisons` — multi-provider comparison history with filters and stats
- `/evals/comparisons/{id}` — matrix detail with winner cards and drill-down drawer
- `/evals/comparisons/{id}/export?format=md|html` — download the comparison as a self-contained Markdown or HTML document
- `/evals/costs` — cost breakdown by model and dataset
- `/evals/shadow` — captures, evals, and promote-to-dataset workflow

Access is controlled by the `viewEvals` Gate. The default definition allows
the `local` environment only; override it in your `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('viewEvals', fn ($user) => $user?->isAdmin() === true);
}
```

## Dataset versioning

Every persisted run is linked to an `EvalDatasetVersion` snapshot
capturing the exact `cases` that were evaluated. When a dataset's
checksum changes between runs, Proofread automatically records a
new version without losing the old one. Use `evals:dataset:diff` to
see what changed between any two versions.

## Pricing table

Proofread ships approximate pricing for common models (Claude 4.x, GPT-4o,
o1 series, Gemini 1.5, OpenAI embeddings). Pricing covers input, output,
cache reads, cache writes, and reasoning tokens. `CostLimit`, the dashboard
cost view, and shadow capture cost tracking all work out of the box for
supported models.

Override or extend the table in `config/proofread.php`:

```php
'pricing' => [
    'models' => [
        'claude-sonnet-4-6' => [
            'input_per_1m' => 3.00,
            'output_per_1m' => 15.00,
            'cache_read_per_1m' => 0.30,
            'cache_write_per_1m' => 3.75,
        ],
        // ...
    ],
],
```

Any model absent from the table reports a null cost — `CostLimit` fails
closed on missing data rather than silently passing.

## MCP integration

When `laravel/mcp` is installed, Proofread exposes four tools:

- `list_eval_suites` — list registered `EvalSuite` classes
- `run_eval_suite` — run a suite and return the structured result
- `get_eval_run_diff` — diff two persisted runs by ULID
- `run_provider_comparison` — run a `MultiSubjectEvalSuite` and return per-subject aggregate stats

Register them from your own `Server` subclass:

```php
use Laravel\Mcp\Server;
use Mosaiqo\Proofread\Mcp\McpIntegration;

class ProofreadMcpServer extends Server
{
    protected array $tools = McpIntegration::tools();
}
```

And declare which suites are discoverable via the tool in
`config/proofread.php`:

```php
'mcp' => [
    'suites' => [
        \App\Evals\SentimentSuite::class,
    ],
],
```

## GitHub Actions

Proofread ships a ready-to-use workflow template. Publish it to your
project and customize the suite FQCN:

```bash
php artisan vendor:publish --tag=proofread-workflows
```

The workflow lands at `.github/workflows/proofread.yml` and runs your
suites on every PR and push to `main`. It uploads JUnit XML as an
artifact and renders a per-case report directly in the PR via
`mikepenz/action-junit-report`.

Required repository secrets if your suites use LLM-backed assertions
(`Rubric`, `Hallucination`, `Similar`, `Language`):

- `ANTHROPIC_API_KEY` — if your judge or agents use Anthropic.
- `OPENAI_API_KEY` — if they use OpenAI.

For deterministic CI runs without real LLM calls, add
`--fake-judge=pass` to the `evals:run` command in the workflow.

### PR comments

`evals:compare --format=markdown` renders the diff as a
PR-friendly Markdown document. Regressions lead, improvements
follow, stable cases collapse into a `<details>` block for
readability. Pair it with an `--output` path and post the result
via `peter-evans/create-or-update-comment` or similar:

```bash
php artisan evals:compare "$BASE_RUN_ID" "$HEAD_RUN_ID" \
    --format=markdown \
    --output=storage/evals/pr-comment.md
```

The published workflow template includes commented scaffolding
for this step. Activate it by implementing your own baseline
strategy (artifact, shared DB, or branch comparison) to resolve
the two run IDs.

## Laravel Telescope integration

If your project has `laravel/telescope` installed, Proofread
automatically records persisted eval runs as Telescope entries.
They appear under Events tagged with `proofread_eval` alongside
your queries, jobs, and requests. Filter by the `proofread_eval`
tag (or by `dataset:...`, `suite:...`, `commit:...`) to inspect
recent runs without leaving your debugging workflow.

Registration is conditional — Proofread checks for Telescope at
boot time and wires up the listener only when it is available.
No configuration required.

## Laravel Pulse integration

If your project uses `laravel/pulse`, Proofread automatically
records persisted eval runs as Pulse metrics. Each run emits a
`proofread_eval` counter keyed by `dataset::passed|failed`, a
`proofread_eval_duration` gauge (avg + max, in ms), and a
`proofread_eval_cost` sum (in micro-dollars) when cost data is
available. They surface alongside your queries, jobs, and
requests in the Pulse dashboard.

Publish the optional dashboard card:

```bash
php artisan vendor:publish --tag=proofread-pulse
```

Then add it to your Pulse dashboard view
`resources/views/vendor/pulse/dashboard.blade.php`:

```blade
<x-pulse>
    @include('vendor.pulse.cards.proofread', ['cols' => 4, 'rows' => 2])
</x-pulse>
```

Registration is conditional on Pulse being installed and bound in
the container — no action needed if you don't use Pulse.

## OpenTelemetry integration

If your project has `open-telemetry/api` installed (with a
configured `TracerProvider`), Proofread emits a span tree for
every persisted eval run:

- Root span `proofread.eval.run` covers the full run duration.
- Child span `proofread.eval.case` per case, parented to the root.
- Each case span carries its assertion outcomes as OTel events
  named `assertion`.

Attributes are prefixed with `proofread.*` (`run.id`,
`dataset.name`, `suite.class`, `run.passed`, `case.duration_ms`,
etc.). Spans propagate to whatever exporter the host app has
configured — Jaeger, Grafana Tempo, Honeycomb, an OTLP collector,
and so on.

Registration is conditional on the OpenTelemetry API being
available. Proofread does not require it as a hard dependency;
install `open-telemetry/api` (or the full SDK) in your project and
wire a `TracerProvider` via `OpenTelemetry\API\Globals` to
activate tracing.

## Laravel Boost integration

If your project uses `laravel/boost`, publish Proofread's AI
guidelines so Boost-powered editors can generate idiomatic
suites, assertions, and tests:

```bash
php artisan vendor:publish --tag=proofread-boost-guidelines
```

The guidelines land at `.ai/guidelines/proofread.md`. They cover
suite structure, assertion selection, testing patterns, and CLI
workflow. If your Boost setup expects a different path, move the
file after publishing.

## CLI subjects (subscription-friendly evaluation)

Most LLM providers bill per-token via their APIs. If you already
pay a flat-rate subscription (Max, Pro, etc.), you may not want to
rack up API charges on top of what you are already paying.
Proofread lets you evaluate against headless CLI tools that run
under your subscription.

### Claude Code

```php
use Mosaiqo\Proofread\Cli\Subjects\ClaudeCodeCliSubject;
use Mosaiqo\Proofread\Runner\EvalRunner;

$subject = ClaudeCodeCliSubject::make()
    ->withModel('claude-sonnet-4-6')
    ->withTimeout(60);

$run = (new EvalRunner)->run($subject, $dataset, $assertions);
```

The CLI must be installed and authenticated in the environment
where evals run. `claude --output-format json` is parsed to extract
the response text plus token usage, cost, and model metadata.
`LatencyLimit`, `TokenBudget`, and `CostLimit` assertions work
unchanged — tokens come from the CLI's reported usage, and cost is
whatever the CLI reports (0 for subscription mode).

### Extending for other CLIs

Subclass `CliSubject` and implement three methods:

```php
use Mosaiqo\Proofread\Cli\CliResponse;
use Mosaiqo\Proofread\Cli\CliSubject;

final class MyCliSubject extends CliSubject
{
    public function binary(): string
    {
        return 'mycli';
    }

    public function args(string $prompt): array
    {
        return ['--prompt', $prompt, '--json'];
    }

    public function parseOutput(string $stdout, string $stderr): CliResponse
    {
        $decoded = json_decode($stdout, true);

        return new CliResponse(
            output: $decoded['response'] ?? '',
            metadata: [
                'tokens_in' => $decoded['tokens']['in'] ?? null,
                'tokens_out' => $decoded['tokens']['out'] ?? null,
                'model' => $decoded['model'] ?? null,
            ],
        );
    }
}
```

Optional overrides: `timeout()`, `workingDirectory()`, `env()`,
`usesStdin()`, `estimateTokens()`.

### Limitations

- Subprocess spawning is heavier than HTTP. Avoid
  `--concurrency > 1` with CLI subjects.
- CI environments need the CLI pre-installed and authenticated.
- `StructuredOutputAssertion` and `Trajectory` assertions require
  API-level data that headless CLIs may not expose.
- Maintenance burden: CLI output formats change between versions.
  Proofread maintains `ClaudeCodeCliSubject`; community
  implementations for other CLIs are welcome.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=proofread-config
```

Key sections (see `config/proofread.php` for the annotated full file):

- `judge` — default model and retries for LLM-as-judge (`Rubric`)
- `similarity` — default embedding model for `Similar` and clustering
- `pricing.models` — per-model token rates (input, output, cache, reasoning)
- `snapshots` — `GoldenSnapshot` storage path and update mode
- `dashboard` — enable/disable, path, middleware stack
- `shadow` — capture sampling, PII sanitization, alerts, queue connection
- `queue` — async eval execution connection and queue
- `webhooks` — regression alerts (Slack, Discord, generic JSON)
- `mcp` — suites exposed through MCP tools

## Testing the package itself

```bash
composer test       # Pest v4 against Testbench
composer analyse    # PHPStan
composer format     # Pint
```

All three must pass on every commit to `main`.

## Contributing

Contributions are welcome. The development workflow is:

- **TDD always.** Red, green, refactor.
- **Work directly on `main`** while the package is pre-v1. Every commit must
  be green (`composer test`, `composer format`, `composer analyse`).
- Commits in English, imperative mood (`Add X`, not `Added X`).

See [CLAUDE.md](CLAUDE.md) for the full set of conventions.

## License

The MIT License (MIT). See [LICENSE](LICENSE) for details.

## Credits

- [Boudy de Geer](https://github.com/boudy) / [Mosaiqo](https://mosaiqo.com)
