# Conductor

Orchestration layer for building AI features in Laravel — agents, workflows, RAG, tool calling. You bring your API keys, Conductor handles the plumbing.

```php
$response = Conductor::agent('support-bot')
    ->using('anthropic', 'claude-sonnet-4-20250514')
    ->withSystemPrompt('You are a helpful support agent.')
    ->withTools([new SearchKnowledgeBase, new CreateTicket])
    ->run('I need help resetting my password');

echo $response->text();
```

Under the hood, all LLM calls go through [Prism](https://github.com/prism-php/prism). Whatever provider Prism supports (Anthropic, OpenAI, Ollama, Mistral, etc.), Conductor supports.

## Requirements

PHP 8.2+, Laravel 11 or 12.

## Installation

```bash
composer require conductor-php/conductor
```

Then publish config + migrations:

```bash
php artisan vendor:publish --provider="Conductor\ConductorServiceProvider"
php artisan migrate
```

In your `.env`, set your provider, model, and the matching API key:

```env
CONDUCTOR_PROVIDER=anthropic
CONDUCTOR_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=your-key-here
```

Each provider has its own key variable:

| Provider | API Key Variable | Example Model |
|----------|-----------------|---------------|
| `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| `mistral` | `MISTRAL_API_KEY` | `mistral-large-latest` |
| `groq` | `GROQ_API_KEY` | `llama-3.1-70b-versatile` |
| `gemini` | `GEMINI_API_KEY` | `gemini-1.5-pro` |
| `xai` | `XAI_API_KEY` | `grok-2` |
| `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| `ollama` | none (runs locally) | `llama3` |

See [Prism's docs](https://github.com/prism-php/prism) for more provider config options like custom URLs and org IDs.

## Agents

You can define agents inline with the builder or as standalone classes. The builder is great for one-offs, classes are better when you're reusing the same agent across your app.

### Builder

```php
use Conductor\Facades\Conductor;

$response = Conductor::agent('summarizer')
    ->using('anthropic', 'claude-sonnet-4-20250514')
    ->withSystemPrompt('Summarize the given text in 2-3 sentences.')
    ->withTokenBudget(1000)
    ->run('Long article text here...');

$response->text();             // "The article discusses..."
$response->promptTokens();     // 342
$response->completionTokens(); // 87
$response->costUsd();          // 0.0018
```

Chain whatever you need — order doesn't matter:

```php
Conductor::agent('research-assistant')
    ->using('openai', 'gpt-4o')
    ->withSystemPrompt('You help with research tasks.')
    ->withTools([new WebSearch, new ExtractData])
    ->withMemory('conversation-123')
    ->withFallback('anthropic', 'claude-sonnet-4-20250514')
    ->withMaxSteps(5)
    ->withTokenBudget(4000)
    ->run('Find recent papers on transformer architectures');
```

### Streaming

```php
$stream = Conductor::agent('writer')
    ->withSystemPrompt('Write creative fiction.')
    ->stream('Tell me a story about a cat');

foreach ($stream as $chunk) {
    echo $chunk;
}
```

### Class-based agents

```bash
php artisan make:conductor-agent SupportAgent
```

Creates `app/Agents/SupportAgent.php`:

```php
use Conductor\Agents\Agent;

final class SupportAgent extends Agent
{
    protected string $name = 'support-agent';
    protected string $provider = 'anthropic';
    protected string $model = 'claude-sonnet-4-20250514';
    protected ?int $tokenBudget = 2000;

    public function systemPrompt(): string
    {
        return 'You are a customer support agent. Be helpful and concise.';
    }

    public function tools(): array
    {
        return [
            new SearchFaq,
            new CreateTicket,
        ];
    }

    public function memory(): ?string
    {
        return null; // return a conversation ID to enable memory
    }
}
```

Then just call it:

```php
$response = SupportAgent::run('How do I cancel my subscription?');
```

### Structured output

If you need typed data back instead of free text, pass a schema:

```php
$response = Conductor::agent('extractor')
    ->withSystemPrompt('Extract contact info from text.')
    ->withSchema([
        'type' => 'object',
        'properties' => [
            'name' => ['type' => 'string'],
            'email' => ['type' => 'string'],
            'phone' => ['type' => 'string'],
        ],
        'required' => ['name', 'email'],
    ])
    ->run('Reach me at jane@example.com, my name is Jane Park');

$response->structured();
// ['name' => 'Jane Park', 'email' => 'jane@example.com', 'phone' => null]
```

## Tools

Tools give agents the ability to call your code. Extend `Tool` and fill in the blanks:

```php
use Conductor\Tools\Tool;

final class GetWeather extends Tool
{
    public function name(): string
    {
        return 'get-weather';
    }

    public function description(): string
    {
        return 'Get the current weather for a city';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'city' => [
                    'type' => 'string',
                    'description' => 'City name',
                ],
            ],
            'required' => ['city'],
        ];
    }

    public function execute(array $arguments): string|array
    {
        return Weather::forCity($arguments['city'])->toArray();
    }
}
```

Or scaffold one: `php artisan make:conductor-tool GetWeather`

## Workflows

For anything multi-step. Steps can depend on each other, run conditionally, run in parallel, or require human approval before continuing.

```php
use Conductor\Facades\Conductor;

$result = Conductor::workflow('content-pipeline')
    ->step('research', function ($state) {
        $response = Conductor::agent('researcher')
            ->withSystemPrompt('Research the given topic.')
            ->run($state->input());

        return $response->text();
    })
    ->step('draft', function ($state) {
        return Conductor::agent('writer')
            ->withSystemPrompt('Write an article based on this research.')
            ->run($state->get('research'));
    }, dependsOn: ['research'])
    ->step('review', function ($state) {
        return Conductor::agent('editor')
            ->withSystemPrompt('Review and improve this draft.')
            ->run($state->get('draft'));
    }, dependsOn: ['draft'])
    ->start('The future of renewable energy');

$result->output()->text(); // the final edited article
$result->totalTokens();
$result->totalCostUsd();
```

### Conditionals

Only run a step if a condition is met:

```php
->when(
    name: 'translate',
    condition: fn ($state) => $state->get('needs_translation') === true,
    callable: fn ($state) => Conductor::agent('translator')->run($state->get('draft')),
    dependsOn: ['draft']
)
```

### Human approval gates

Sometimes you want a person to sign off before the workflow continues. `humanApproval` pauses execution and persists the run so you can resume it later.

```php
$result = Conductor::workflow('publish-flow')
    ->step('draft', fn ($state) => /* ... */)
    ->humanApproval('review', fn ($state) => $state->get('draft'), dependsOn: ['draft'])
    ->step('publish', fn ($state) => /* ... */, dependsOn: ['review'])
    ->start('Write a blog post');

$result->status();  // 'paused'
$result->runId();   // 'abc-123'

// later, when the reviewer approves:
$final = Conductor::workflow('publish-flow')
    ->resume($result->runId(), ['approved' => true, 'feedback' => 'Looks good']);
```

### Parallel steps

```php
->parallel([
    'seo-check' => fn ($state) => /* ... */,
    'grammar-check' => fn ($state) => /* ... */,
    'tone-check' => fn ($state) => /* ... */,
], dependsOn: ['draft'])
```

### Retries

Steps automatically retry on failure. The defaults live in config (`workflows.default_retry_attempts`), but you can override per step:

```php
->step('flaky-api', fn ($state) => /* ... */, retries: 5, backoffMs: 2000)
```

You can also generate workflow classes: `php artisan make:conductor-workflow ContentPipeline`

## RAG

Ingest documents, chunk them up, generate embeddings, then query by similarity. Nothing fancy — just the basics done right.

```php
use Conductor\Rag\RagPipeline;

$pipeline = app(RagPipeline::class);

// ingest a document
$chunks = $pipeline
    ->using('openai', 'text-embedding-3-small')
    ->withChunking(size: 500, overlap: 50)
    ->ingest(
        content: file_get_contents('docs/guide.md'),
        documentId: 'guide-v2',
        metadata: ['source' => 'docs']
    );

// query it
$results = $pipeline->query('How do I configure authentication?', limit: 5);
```

To wire RAG into an agent:

```php
$retriever = app(\Conductor\Contracts\RetrieverInterface::class);

Conductor::agent('docs-bot')
    ->withSystemPrompt('Answer questions using the provided context.')
    ->withRag($retriever, limit: 5)
    ->run('How do I reset my password?');
```

For vector storage, the default is `memory` which is fine for dev and tests. For production you'll want `pgvector` (needs the pgvector Postgres extension):

```env
CONDUCTOR_VECTOR_STORE=pgvector
```

## Memory

Give an agent a conversation ID and it'll remember previous messages:

```php
Conductor::agent('chat')
    ->withSystemPrompt('You are a helpful assistant.')
    ->withMemory('user-42-session')
    ->run('My name is Alex');

// next request, same session
Conductor::agent('chat')
    ->withSystemPrompt('You are a helpful assistant.')
    ->withMemory('user-42-session')
    ->run('What is my name?');
// "Your name is Alex."
```

Three drivers available:

- **database** — permanent storage, good for production
- **cache** — TTL-based, good for ephemeral sessions
- **array** — in-memory only, mostly useful in tests

Set via `CONDUCTOR_MEMORY_DRIVER=database` in your `.env`. You can also cap how many messages are stored per conversation with `memory.max_messages` in the config (defaults to 50).

## Monitoring

Usage tracking is on by default. Every agent call gets logged to `conductor_usage_logs` with token counts, cost, duration, and which provider/model was used.

### Cost calculation

There's a built-in calculator with pricing for common models:

```php
use Conductor\Monitoring\CostCalculator;

$cost = CostCalculator::calculate(
    model: 'claude-sonnet-4-20250514',
    promptTokens: 1000,
    completionTokens: 500
);
```

### Budgets

You can cap spending at different levels:

```env
CONDUCTOR_BUDGET_PER_REQUEST=0.50
CONDUCTOR_BUDGET_PER_WORKFLOW=5.00
CONDUCTOR_BUDGET_PER_HOUR=20.00
```

Hit a limit and you get a `TokenBudgetExceededException`. A `TokenBudgetExceeded` event fires too, so you can hook into it with a listener if you want alerts.

### Pulse

If you're running [Laravel Pulse](https://pulse.laravel.com), Conductor registers a recorder automatically. Shows up as a card on your Pulse dashboard.

## Testing

`Conductor::fake()` swaps out the real thing for a fake that never hits any APIs. Works the same way as Laravel's built-in fakes.

```php
use Conductor\Facades\Conductor;

Conductor::fake([
    'support-agent' => 'I can help you with that!',
    'summarizer' => 'This is a summary.',
]);

// your code runs against the fakes
$response = Conductor::agent('support-agent')
    ->withSystemPrompt('...')
    ->run('Help me');

$response->text(); // "I can help you with that!"
```

Then assert:

```php
Conductor::assertAgentCalled('support-agent');
Conductor::assertAgentCalled('support-agent', times: 1);
Conductor::assertAgentNotCalled('translator');
Conductor::assertToolUsed('search-faq');
Conductor::assertTokensBelow(5000);
Conductor::assertWorkflowCompleted('content-pipeline');
```

Use `'*'` as a catch-all:

```php
Conductor::fake(['*' => 'default response for any agent']);
```

For agents called multiple times, use sequences:

```php
use Conductor\Testing\ConductorFake;

Conductor::fake([
    'chat' => ConductorFake::sequence([
        'First response',
        'Second response',
        fn () => 'Dynamic third response',
    ]),
]);
```

## Artisan Commands

```
php artisan make:conductor-agent MyAgent         # app/Agents/MyAgent.php
php artisan make:conductor-tool MyTool            # app/Tools/MyTool.php
php artisan make:conductor-workflow MyWorkflow     # app/Workflows/MyWorkflow.php
```

## Events

Everything fires events you can listen to. All in the `Conductor\Events` namespace:

- `AgentStarted` / `AgentCompleted` / `AgentFailed`
- `ToolExecuted`
- `TokenBudgetExceeded`
- `WorkflowStarted` / `WorkflowStepCompleted` / `WorkflowPaused` / `WorkflowCompleted` / `WorkflowFailed`

Standard Laravel listeners:

```php
Event::listen(AgentCompleted::class, function ($event) {
    Log::info("Agent {$event->agentName} finished in {$event->durationMs}ms");
});
```

## Configuration

Published to `config/conductor.php`. The important env vars:

| Variable | Default | What it does |
|----------|---------|-------------|
| `CONDUCTOR_PROVIDER` | `anthropic` | Default LLM provider |
| `CONDUCTOR_MODEL` | `claude-sonnet-4-20250514` | Default model |
| `CONDUCTOR_MEMORY_DRIVER` | `database` | Where conversation history is stored |
| `CONDUCTOR_VECTOR_STORE` | `memory` | Vector store backend for RAG |
| `CONDUCTOR_BUDGET_PER_REQUEST` | `null` | Spending cap per agent call |
| `CONDUCTOR_BUDGET_PER_WORKFLOW` | `null` | Spending cap per workflow |
| `CONDUCTOR_BUDGET_PER_HOUR` | `null` | Hourly spending cap |

Check the config file itself for the full list of options.

## License

MIT — see [LICENSE](LICENSE).
