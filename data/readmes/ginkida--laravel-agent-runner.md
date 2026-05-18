# Agent Runner Laravel SDK

Laravel SDK for the [Agent Runner](https://github.com/ginkida/agent-runner) Go microservice — fluent API for AI agent orchestration with tool-calling, HMAC-signed communication, and real-time SSE streaming.

## How it works

```
Laravel App                          Agent Runner (Go)              LLM
    │                                      │                         │
    ├── POST /v1/sessions ────────────────►│                         │
    ├── POST /v1/sessions/{id}/messages ──►│── prompt ──────────────►│
    ├── GET  /v1/sessions/{id}/stream ────►│◄─ response + tool use ─┤
    │◄──────── SSE events (text, tool_call, thinking, done) ────────┤
    │                                      │                         │
    │◄── POST /tools/{toolName} ──────────┤  (callback)             │
    │── {success, content} ───────────────►│── tool result ─────────►│
    │                                      │                         │
    │◄── POST /sessions/{id}/status ──────┤  (callback)             │
```

The SDK sends requests **to** Agent Runner and receives two types of callbacks **from** it:
- **Tool callbacks** — Agent Runner asks Laravel to execute a registered tool
- **Status callbacks** — Agent Runner notifies about session state changes

All requests in both directions are signed with HMAC-SHA256.

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- ext-curl, ext-json

## Installation

```bash
composer require ginkida/laravel-agent-runner
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=agent-runner-config
```

## Configuration

Add to `.env`:

```env
AGENT_RUNNER_URL=http://localhost:8090
AGENT_RUNNER_HMAC_SECRET=your-shared-secret
AGENT_RUNNER_CLIENT_ID=laravel
AGENT_RUNNER_CALLBACK_URL=https://your-app.test/api/agent-runner
```

All available options with defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_RUNNER_URL` | `http://localhost:8090` | Agent Runner base URL |
| `AGENT_RUNNER_HMAC_SECRET` | _(empty)_ | Shared secret for HMAC-SHA256. Empty = skip verification |
| `AGENT_RUNNER_CLIENT_ID` | `laravel` | Sent as `X-Client-ID` header |
| `AGENT_RUNNER_CALLBACK_URL` | _(empty)_ | Base URL Agent Runner calls back to. Must be reachable from its host |
| `AGENT_RUNNER_CALLBACK_TIMEOUT` | `30` | Callback timeout (seconds) |
| `AGENT_RUNNER_DEFAULT_MODEL` | `gpt-4o-mini` | Default LLM model |
| `AGENT_RUNNER_DEFAULT_MAX_TURNS` | `30` | Max agent loop iterations |
| `AGENT_RUNNER_DEFAULT_MAX_TOKENS` | `0` | Max LLM response tokens (0 = provider default) |
| `AGENT_RUNNER_ROUTE_PREFIX` | `api/agent-runner` | Route prefix for incoming callbacks |
| `AGENT_RUNNER_HTTP_TIMEOUT` | `30` | Outgoing HTTP timeout |
| `AGENT_RUNNER_HTTP_CONNECT_TIMEOUT` | `5` | Outgoing HTTP connect timeout |
| `AGENT_RUNNER_SSE_TIMEOUT` | `600` | SSE stream timeout (10 min default) |

Route middleware defaults to `['api']`. Tool auto-discovery scans `app/AgentTools/` by default.

## Usage

### Entry point

```php
use Ginkida\AgentRunner\Facades\AgentRunner;
```

All operations start with the `AgentRunner` facade, which resolves to `AgentRunnerManager` (singleton).

### Three execution modes

#### 1. `run()` — synchronous, blocking

Creates a session, sends a message, consumes the entire SSE stream, returns the final `done` event.

```php
$result = AgentRunner::agent('assistant')
    ->model('gpt-4o')
    ->systemPrompt('You are a helpful assistant.')
    ->maxTurns(10)
    ->tools(['read_file', 'write_file', 'bash'])
    ->remoteTools(['search_database'])
    ->onText(fn (string $text) => echo $text)
    ->onToolCall(fn (string $name, array $args) => logger()->info("Calling {$name}", $args))
    ->onError(fn (string $message) => logger()->error($message))
    ->run('Summarize the README.md file');

// $result is SseEvent with type=done
$result->doneStatus();     // "completed"
$result->doneOutput();     // final text output
$result->doneTurns();      // number of turns used
$result->doneDurationMs(); // execution time in ms
```

#### 2. `start()` — manual stream control

Returns session ID and an `SseStream` for manual event consumption.

```php
$session = AgentRunner::agent('coder')
    ->systemPrompt('You are a senior developer.')
    ->withAllRemoteTools()
    ->start('Refactor the User model');

$sessionId = $session['session_id'];
$stream = $session['stream']; // SseStream instance

foreach ($stream->events() as $event) {
    match ($event->type) {
        'text'        => $this->handleText($event->textContent()),
        'tool_call'   => $this->handleToolCall($event->toolName(), $event->toolArgs()),
        'tool_result' => $this->handleToolResult($event->toolName(), $event->data['success']),
        'thinking'    => $this->handleThinking($event->textContent()),
        'error'       => $this->handleError($event->errorMessage()),
        'done'        => break,
        default       => null,
    };
}
```

#### 3. `dispatch()` — fire-and-forget

Creates session and sends message. Returns session ID immediately. Results arrive via status callback events.

```php
$sessionId = AgentRunner::agent('worker')
    ->dispatch('Process the uploaded CSV file');

// Listen for results in an event listener (see Events section)
```

### Builder methods

All methods return `$this` for chaining:

| Method | Description |
|--------|-------------|
| `agent(string $name)` | Agent name identifier |
| `model(string $model)` | LLM model override |
| `systemPrompt(string $prompt)` | System prompt |
| `maxTurns(int $n)` | Max agent loop turns |
| `maxTokens(int $n)` | Max LLM response tokens |
| `temperature(float $t)` | Sampling temperature |
| `tools(array $names)` | Built-in tools (e.g. `read_file`, `write_file`, `bash`) |
| `remoteTools(array $names)` | Specific remote tools by name |
| `withAllRemoteTools()` | Include all registered remote tools |
| `sessionId(string $id)` | Custom session ID (1-128 chars, `[a-zA-Z0-9_-]`) |
| `workDir(string $path)` | Working directory for built-in tools |
| `callback(string $baseUrl, ?int $timeout)` | Override callback URL for this session |
| `onText(Closure $cb)` | Callback: `fn(string $text)` |
| `onToolCall(Closure $cb)` | Callback: `fn(string $name, array $args)` |
| `onToolResult(Closure $cb)` | Callback: `fn(string $name, bool $success, string $content)` |
| `onThinking(Closure $cb)` | Callback: `fn(string $text)` |
| `onError(Closure $cb)` | Callback: `fn(string $message)` |
| `onDone(Closure $cb)` | Callback: `fn(array $data)` |

### Low-level client

For direct API access without the builder:

```php
$client = AgentRunner::client();

// Create session
$session = $client->createSession(
    agentDefinition: [
        'name' => 'my-agent',
        'model' => 'gpt-4o',
        'system_prompt' => '...',
        'max_turns' => 30,
        'tools' => [
            'builtin' => ['read_file', 'bash'],
            'remote' => [
                ['name' => 'my_tool', 'description' => '...', 'parameters' => [...]],
            ],
        ],
    ],
    callback: ['base_url' => 'https://...', 'timeout_sec' => 30],
    sessionId: 'optional-custom-id',  // null = auto-generated
    workDir: '/path/to/workdir',      // null = default
);

// Send message (starts the agent)
$client->sendMessage($session['session_id'], 'Hello');

// Stream events
$stream = $client->stream($session['session_id']);

// Get/delete session
$info = $client->getSession($sessionId);
$client->deleteSession($sessionId);
```

## Remote Tools

### Creating a tool

Implement `RemoteToolContract` and place it in `app/AgentTools/` — it will be auto-discovered on boot.

```php
namespace App\AgentTools;

use Ginkida\AgentRunner\Contracts\RemoteToolContract;
use Ginkida\AgentRunner\DTOs\ToolCallbackRequest;

class SearchDatabase implements RemoteToolContract
{
    public function name(): string
    {
        return 'search_database'; // must match [a-zA-Z][a-zA-Z0-9_]*
    }

    public function description(): string
    {
        return 'Search the application database for records matching a query.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'query' => [
                    'type' => 'string',
                    'description' => 'The search query',
                ],
                'limit' => [
                    'type' => 'integer',
                    'description' => 'Max results to return',
                ],
            ],
            'required' => ['query'],
        ];
    }

    public function handle(ToolCallbackRequest $request): array
    {
        $query = $request->argument('query');
        $limit = $request->argument('limit', 10);

        $results = DB::table('records')
            ->where('content', 'like', "%{$query}%")
            ->limit($limit)
            ->get();

        return [
            'success' => true,
            'content' => $results->toJson(),
        ];

        // On failure:
        // return ['success' => false, 'error' => 'Something went wrong'];
    }
}
```

### ToolCallbackRequest

```php
$request->sessionId;              // string — session that triggered the call
$request->toolName;               // string — tool name
$request->arguments;              // array  — all arguments
$request->argument('key');        // mixed  — single argument with optional default
$request->argument('key', 'def'); // mixed  — with default
```

### Manual registration

```php
AgentRunner::tools()->register(new SearchDatabase());

// Registry API
AgentRunner::tools()->has('search_database');   // bool
AgentRunner::tools()->get('search_database');   // ?RemoteToolContract
AgentRunner::tools()->names();                  // string[]
AgentRunner::tools()->all();                    // array<string, RemoteToolContract>
AgentRunner::tools()->definitions();            // array — API payload format
AgentRunner::tools()->definitions(['tool_a']);  // array — only specific tools
```

### Discovery configuration

```php
// config/agent-runner.php
'tools' => [
    'discovery' => [
        'enabled' => true,
        'path' => app_path('AgentTools'),      // directory to scan
        'namespace' => 'App\\AgentTools',       // PSR-4 namespace
    ],
],
```

## SSE Events

The `SseStream` yields `SseEvent` objects. Six event types:

| Type | Data fields | Accessors |
|------|-------------|-----------|
| `text` | `{content}` | `textContent()` |
| `tool_call` | `{tool, args}` | `toolName()`, `toolArgs()` |
| `tool_result` | `{tool, success, content}` | `toolName()`, `data['success']`, `data['content']` |
| `thinking` | `{content}` | `textContent()` |
| `error` | `{message}` | `errorMessage()` |
| `done` | `{status, output, turns, duration_ms}` | `doneStatus()`, `doneOutput()`, `doneTurns()`, `doneDurationMs()` |

Type checkers: `$event->isText()`, `$event->isToolCall()`, `$event->isDone()`, etc.

## Events

Laravel events dispatched on status callbacks. All events have a `public StatusPayload $payload` property.

| Event class | Status | When |
|-------------|--------|------|
| `AgentSessionCreated` | `created` | Session was created |
| `AgentSessionRunning` | `running` | Agent started processing |
| `AgentSessionCompleted` | `completed` | Agent finished successfully |
| `AgentSessionFailed` | `failed` | Agent encountered an error |
| `AgentSessionCancelled` | `cancelled` | Session was cancelled |

### StatusPayload

```php
$payload->sessionId;    // string
$payload->clientId;     // string
$payload->status;       // string: created|running|completed|failed|cancelled
$payload->error;        // ?string (on failed)
$payload->output;       // ?string (on completed)
$payload->turns;        // ?int
$payload->durationMs;   // ?int

// State checkers
$payload->isCompleted();  // bool
$payload->isFailed();     // bool
$payload->isTerminal();   // bool — completed, failed, or cancelled
```

### Listening for events

```php
// In a listener or EventServiceProvider
use Ginkida\AgentRunner\Events\AgentSessionCompleted;
use Ginkida\AgentRunner\Events\AgentSessionFailed;

class HandleAgentCompletion
{
    public function handle(AgentSessionCompleted $event): void
    {
        $output = $event->payload->output;
        $sessionId = $event->payload->sessionId;
        // Process result...
    }
}

class HandleAgentFailure
{
    public function handle(AgentSessionFailed $event): void
    {
        logger()->error('Agent failed', [
            'session' => $event->payload->sessionId,
            'error' => $event->payload->error,
        ]);
    }
}
```

## Security

### HMAC-SHA256 signing

All requests between Laravel and Agent Runner are signed. The implementation mirrors Go's `internal/auth/hmac.go`:

- **Payload format:** `{timestamp}.{nonce}.{body}` (body is empty string for GET/DELETE)
- **Signature format:** `sha256={hex digest}`
- **Headers:** `X-Signature`, `X-Timestamp`, `X-Nonce`, `X-Client-ID`
- **Timestamp freshness:** ±2 minutes
- **Nonce:** 16 random bytes, hex-encoded (32 chars)

### Incoming callback verification

The `VerifyHmacSignature` middleware protects callback routes:

- Validates HMAC signature, timestamp, and nonce
- **Nonce replay protection** via `Cache::add()` with 240s TTL
- If `AGENT_RUNNER_HMAC_SECRET` is empty, verification is skipped

### Exceptions

| Exception | HTTP | When |
|-----------|------|------|
| `HmacVerificationException` | 401 | Invalid/missing signature on callbacks |
| `ToolExecutionException` | 500 | Tool `handle()` throws |
| `SessionNotFoundException` | — | Session not found (404 from API) |
| `AgentRunnerException` | — | Base; any other API error |

## Callback Routes

Registered automatically under the configured prefix (default `api/agent-runner`):

```
POST {prefix}/tools/{toolName}              → ToolCallbackController
POST {prefix}/sessions/{sessionId}/status   → StatusCallbackController
```

Both routes are protected by `VerifyHmacSignature` middleware. Route middleware stack defaults to `['api']`.

Disable auto-registration:

```php
// config/agent-runner.php
'routes' => [
    'enabled' => false,
],
```

## Package structure

```
src/
├── AgentRunnerServiceProvider.php       — bindings, routes, tool discovery, exception rendering
├── AgentRunnerManager.php               — facade target, proxies client + creates builders
├── Builder/AgentBuilder.php             — fluent config → run() / start() / dispatch()
├── Client/
│   ├── AgentRunnerClient.php            — HTTP client (5 endpoints, body-then-sign pattern)
│   ├── HmacSigner.php                   — HMAC-SHA256 sign + verify
│   └── SseStream.php                    — SSE parser via curl_multi (Generator-based)
├── Contracts/RemoteToolContract.php     — tool interface: name, description, parameters, handle
├── DTOs/
│   ├── SseEvent.php                     — readonly, type + data, helper accessors
│   ├── StatusPayload.php                — readonly, fromArray(), state checkers
│   └── ToolCallbackRequest.php          — readonly, fromArray(), argument() accessor
├── Events/AgentSession{Created,Running,Completed,Failed,Cancelled}.php
├── Exceptions/{AgentRunner,HmacVerification,SessionNotFound,ToolExecution}Exception.php
├── Facades/AgentRunner.php              — facade → AgentRunnerManager
├── Http/
│   ├── Controllers/{ToolCallback,StatusCallback}Controller.php
│   └── Middleware/VerifyHmacSignature.php
└── Tools/
    ├── ToolRegistry.php                 — register / get / has / names / definitions
    └── ToolDiscovery.php                — auto-scan directory for RemoteToolContract classes

config/agent-runner.php                  — all settings with env() defaults
routes/agent-runner.php                  — 2 callback POST routes
```

## Testing

```bash
composer test
```

## License

MIT — see [LICENSE](LICENSE).
