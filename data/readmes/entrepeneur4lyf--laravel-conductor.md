# Laravel Conductor

`entrepeneur4lyf/laravel-conductor` is an Atlas-native workflow orchestration package for Laravel 13.

> **Status — not yet on Packagist.** The package is fully functional and its test suite is green, but it is **not** published to Packagist yet. An example application that exercises the package end-to-end (workflow definition → execution → resume/retry/cancel lifecycle) is being built alongside it, and Packagist publishing is intentionally on hold until that demo app proves the package works in a realistic host application. Until then, depend on it via a VCS repository in your `composer.json` if you want to try it, and expect the public API to change without semver notice.

It is built for declarative multi-step workflows where:

- workflow definitions live in YAML or JSON
- prompts live in Twig templates
- step outputs are validated with JSON Schema
- Atlas agents execute the individual steps
- Conductor owns run state, revisions, transitions, and lifecycle endpoints

The current package surface is real and working. It is not a no-op skeleton anymore.

## What It Does

Today, the package can:

- load workflow definitions from YAML and JSON
- validate workflow structure before execution
- resolve prompt templates and schema files inside a workflow tree
- freeze those assets into a compiled snapshot stored on each run
- persist a database-backed workflow dossier with optimistic concurrency
- execute the current pending step through Atlas structured output
- resolve `context_map` values into prompt variables at runtime
- escalate unmatched failures or explicit `action: escalate` handlers through an Atlas supervisor agent
- enforce failure-handler `delay` values via a persisted `retry_after` window on the run
- advance, retry, skip, wait, resume, fail, cancel, and complete runs through the HTTP lifecycle API
- scaffold, validate, inspect, retry, and cancel runs through artisan commands

## What It Does Not Yet Do Automatically

Important so nobody gets surprised:

- it does not auto-dispatch the first step when you call `start`
- step execution is synchronous (no background queue), though failure-handler retry delays are enforced in-process via `retry_after` — early `/continue` calls short-circuit to a `noop` decision until the deadline passes
- it does not currently implement parallel fan-out execution from `parallel` and `foreach`

Only the parallel/foreach fan-out remains as a future feature; everything else in the definition model is now active. `tools` and `provider_tools` are resolved and forwarded to Atlas at execution time — see the "Tools" section below. `on_fail` is consumed as a fallback transition after failure handlers and escalation are exhausted. Per-step `timeout` is forwarded to Atlas as a per-call HTTP deadline. Workflow `defaults` are merged into individual steps at load time.

## Requirements

- PHP `^8.3`
- Laravel `^13.0`
- [atlas-php/atlas](https://github.com/atlasphp/atlas)

### Windows developers

CI only runs on Ubuntu, but the package installs and runs fine on Windows as long as your PHP build has the `sockets` extension enabled. That's needed because `atlas-php/atlas` transitively depends on `spatie/fork`, which declares `ext-sockets` as a requirement.

Two easy ways to get there:

- **Laravel's `php.new` installer** ([php.new](https://php.new)) — installs a Windows PHP build with `sockets` (and the rest of the common extensions) enabled out of the box. This is the recommended path.
- **WSL2** — if you'd rather just have a Linux dev loop, install WSL2 + Ubuntu and work inside it. Everything the CI matrix tests will apply 1:1.

Note: `spatie/fork` itself uses POSIX `fork()` at runtime, so any future code path that actually exercises parallel fan-out (see the F11 parallel/foreach feature) will not work on native Windows regardless of installed extensions. The rest of the package — the engine, supervisor, persistence, HTTP API, artisan commands — has no Windows-incompatible runtime dependencies.

## Installation

```bash
composer require entrepeneur4lyf/laravel-conductor
php artisan vendor:publish --provider="Entrepeneur4lyf\\LaravelConductor\\LaravelConductorServiceProvider"
php artisan migrate
```

By default, the package:

- looks for workflow definitions in `workflows/`
- exposes routes under `/api/conductor`
- uses the database-backed workflow state store
- registers the `conductor-supervisor` Atlas agent for escalation decisions

## Quick Start

Create a workflow set:

```bash
php artisan conductor:make-workflow content-pipeline
```

Validate it:

```bash
php artisan conductor:validate content-pipeline
```

Start a run:

```bash
curl -X POST http://localhost/api/conductor/start \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "content-pipeline",
    "input": {
      "topic": "Laravel Conductor"
    }
  }'
```

Continue the current pending step:

```bash
curl -X POST http://localhost/api/conductor/runs/{runId}/continue
```

Retrying a failed run is explicit:

```bash
curl -X POST http://localhost/api/conductor/runs/{runId}/retry \
  -H "Content-Type: application/json" \
  -d '{
    "revision": 3
  }'
```

That appends a new pending attempt but does not execute it. Call `/continue` afterward to run the retry.

If the run enters `waiting`, resume it with the stored `resume_token`:

```bash
curl -X POST http://localhost/api/conductor/runs/{runId}/resume \
  -H "Content-Type: application/json" \
  -d '{
    "resume_token": "the-token-from-the-run",
    "payload": {
      "approved": true
    }
  }'
```

Inspect the current dossier:

```bash
curl http://localhost/api/conductor/runs/{runId}
```

## Example Workflow

```yaml
name: content-pipeline
version: 1
description: Content pipeline
defaults:
  timeout: 120

steps:
  - id: research
    agent: research-agent
    prompt_template: prompts/research.md.j2
    output_schema: '@schemas/research-output.json'
    retries: 2
    on_success: approval

  - id: approval
    agent: approval-agent
    prompt_template: prompts/approval.md.j2
    output_schema: '@schemas/approval-output.json'
    wait_for: approval
    retries: 0
    on_success: complete

failure_handlers:
  - match: schema_validation_failed
    action: retry
    delay: 30
    prompt_template: prompts/research.md.j2
```

Example workflow set layout:

```text
workflows/
  content-pipeline.yaml
  prompts/
    research.md.j2
    approval.md.j2
  schemas/
    research-output.json
    approval-output.json
```

## Tools

Steps may declare host-defined Atlas `tools` and provider-native
`provider_tools`. Both are resolved at execution time and forwarded to
the Atlas request via `withTools()` / `withProviderTools()`.

```yaml
steps:
  - id: research
    agent: research-agent
    prompt_template: prompts/research.md.j2
    tools:
      - stock_snapshot             # convention → App\Tools\StockSnapshotTool
      - web_lookup                 # convention → App\Tools\WebLookupTool
      - \App\Custom\SpecialTool    # FQCN passthrough
    provider_tools:
      - web_search                 # Atlas\Providers\Tools\WebSearch
      - type: file_search          # with options
        max_results: 5
```

`tools` identifiers are resolved in three strategies (in precedence
order):

1. An explicit `conductor.tools.map` entry.
2. A fully-qualified class name passed directly.
3. A convention-based lookup under `conductor.tools.namespace`
   (default `App\Tools`). `snake_case` identifiers become
   `StudlyCase` with an optional `Tool` suffix.

All resolved classes must extend `Atlasphp\Atlas\Tools\Tool`.

`provider_tools` can be declared as a bare string (`web_search`) or as
an object with `type` and options (`{ type: web_search, max_results: 5 }`).
Option keys are automatically translated from snake_case to camelCase
constructor parameters.

## Lifecycle Model

Current package behavior:

1. `POST /api/conductor/start` creates a run and stores revision `1`.
2. The run is stored with a compiled snapshot and the first `current_step_id`.
3. `POST /api/conductor/runs/{runId}/continue` executes the current pending step through Atlas.
4. Supervisor evaluation decides whether to advance, retry, wait, fail, cancel, complete, or noop.
5. If the run is `waiting`, `POST /api/conductor/runs/{runId}/resume` completes that waiting step with external payload and re-enters supervisor evaluation.
6. Failed steps with remaining retry budget can escalate through the registered Atlas supervisor agent when no handler matches or when a handler uses `action: escalate`.
7. Failure handler `delay` values are enforced via a `retry_after` timestamp on the run dossier. `/continue` returns a `noop` decision while the backoff is active; the next state transition (or `/resume`, `/retry`, `/cancel`) clears it.

The package is currently explicit and API-driven. Starting a run does not auto-execute the first step.

## Concurrency safety

Concurrent writes against the same run are guarded by a three-layer defense
rather than a single lock:

1. **Cache lock (cheap rejection).** Every mutating endpoint (`/continue`,
   `/resume`, `/retry`, `/cancel`) wraps its work in a Laravel cache lock
   keyed by the run id. Two parallel requests against the same run cannot
   both reach the executor in the common case; the second one blocks briefly
   and, if it cannot acquire the lock, receives HTTP `423 Locked` with the
   body `{"message": "Run is currently locked by another request."}`. The
   default `CONDUCTOR_LOCK_TTL` is 60 seconds and is intentionally short so
   stuck processes recover quickly. This layer is *not* load-bearing for
   correctness — see layers 2 and 3.
2. **Pre-Atlas revision re-check.** Immediately before the (expensive)
   executor call inside `RunProcessor::continueRun`, the run is re-read
   from the state store and its revision is compared against the locally
   held value. If a previous request's lock TTL expired mid-Atlas-call and
   another request advanced the run in the meantime, the current request
   bails with HTTP `409` (`{"message": "Run state advanced while your
   request was processing. Reload and retry."}`) before any LLM tokens are
   burned.
3. **Optimistic concurrency on the final write.** `OptimisticRunMutator`
   uses `WHERE revision = ?` and is the authoritative correctness gate.
   Even if both prior layers were skipped, the final persisted state is
   always consistent.

The lock store, prefix, and TTL are configurable under `conductor.locks` in
`config/conductor.php`. In single-process tests this can be left at the default
in-memory cache, but production deployments running multiple workers should
point `CONDUCTOR_LOCK_STORE` at a shared backend (`redis`, `memcached`, or
`database`) so locks are visible across workers.

## HTTP API

Default route prefix:

```text
/api/conductor
```

Routes currently shipped:

- `POST /start`
- `POST /runs/{runId}/continue`
- `GET /runs/{runId}`
- `POST /runs/{runId}/resume`
- `POST /runs/{runId}/retry`
- `POST /runs/{runId}/cancel`

Deep API docs:

- [HTTP and CLI API](./docs/package/API.md)

## Artisan Commands

Commands currently shipped:

- `php artisan conductor:make-workflow {name}`
- `php artisan conductor:validate {workflow}`
- `php artisan conductor:status {runId}`
- `php artisan conductor:retry {runId} --revision=`
- `php artisan conductor:cancel {runId} --revision=`

## Documentation

- [Getting Started](./docs/package/GETTING_STARTED.md)
- [Workflow Sets](./docs/package/WORKFLOW_SETS.md)
- [HTTP and CLI API](./docs/package/API.md)

## Testing

```bash
composer test
```

Current green verification in this repo:

- `rtk vendor/bin/pest`
