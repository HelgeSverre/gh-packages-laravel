# AgentOps for Laravel

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

AI Agent monitoring, tracking, and analytics for **Laravel AI SDK**. Track sessions, agent calls, tool usage, costs, and conversation history — automatically.

> Inspired by [AgentOps](https://github.com/AgentOps-AI/agentops), built natively for Laravel.

## Requirements

- PHP 8.2+
- Laravel 12.x
- [Laravel AI SDK](https://laravel.com/docs/12.x/ai-sdk) (`laravel/ai`)

## Installation

```bash
composer require alidaaer/laravel-agentops
php artisan agentops:install
```

## Quick Start

### Automatic Tracking (Zero-Config)

AgentOps automatically listens to Laravel AI SDK events and tracks all agent prompts, streaming responses, and tool invocations. Just install and go:

```php
use App\Ai\Agents\SalesCoach;

// This is automatically tracked ✨
$response = (new SalesCoach)->prompt('Analyze this transcript...');
```

### Session Middleware (Recommended)

Add the `TrackAgentOps` middleware to your agents for automatic session lifecycle management. Conversational agents keep sessions open across requests; one-shot agents auto-close:

```php
use LaravelAgentOps\Middleware\TrackAgentOps;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, Conversational, HasMiddleware
{
    use Promptable, RemembersConversations;

    public function instructions(): string
    {
        return 'You are a sales coach...';
    }

    public function middleware(): array
    {
        return [
            app(TrackAgentOps::class),
        ];
    }
}
```

### Conversation Session Continuity

For multi-turn conversations, use `forConversation()` to ensure all messages share a single AgentOps session across HTTP requests:

```php
use LaravelAgentOps\Facades\AgentOps;

// Bind conversation to AgentOps session (restores existing or creates new)
AgentOps::forConversation($conversationId, tags: ['chat']);

// First message
$response = (new SalesCoach)->forUser($user)->prompt('Hello!');
$conversationId = $response->conversationId;

// Subsequent messages — same AgentOps session is reused
AgentOps::forConversation($conversationId);
$response = (new SalesCoach)->continue($conversationId, as: $user)->prompt('Tell me more');
```

### Manual Session Management

```php
use LaravelAgentOps\Facades\AgentOps;

$session = AgentOps::startSession(
    tags: ['production', 'sales'],
    metadata: ['user_id' => auth()->id()],
);

// ... your agent calls are tracked within this session ...

AgentOps::endSession($session);
```

### Prompt Templates

Manage and version your agent prompts centrally:

```php
use LaravelAgentOps\Facades\AgentOps;

// Create a prompt template
AgentOps::prompts()->create([
    'name' => 'Sales Instructions',
    'slug' => 'sales-instructions',
    'content' => 'You are a {role} specializing in {domain}.',
    'agent' => 'SalesCoach',
    'variables' => ['role', 'domain'],
]);

// Render with variables
$instructions = AgentOps::prompt('sales-instructions', [
    'role' => 'senior coach',
    'domain' => 'B2B SaaS',
]);

// List all prompts for an agent
$prompts = AgentOps::prompts()->all(agent: 'SalesCoach');
```

### Tagging

```php
AgentOps::tag('experiment-v2');
AgentOps::tag('customer-onboarding');
```

### Enable / Disable

```php
AgentOps::disable();  // Pause tracking
AgentOps::enable();   // Resume tracking
```

## What Gets Tracked

| Feature | Events | Auto |
|---------|--------|------|
| Agent Prompts | `PromptingAgent` → `AgentPrompted` | ✅ |
| Agent Streaming | `StreamingAgent` → `AgentStreamed` | ✅ |
| Tool Invocations | `InvokingTool` → `ToolInvoked` | ✅ |
| Provider Tools | WebSearch, WebFetch, FileSearch | ✅ |
| Cost Calculation | Per-model token pricing (span + session) | ✅ |
| Session Lifecycle | Start → Complete / Fail | Via Middleware |
| Conversation Linking | `conversationId` → session metadata | ✅ |
| Prompt Versioning | Content changes auto-increment version | ✅ |

## Configuration

```bash
php artisan vendor:publish --tag=agentops-config
```

Key settings in `config/agentops.php`:

```php
'enabled' => env('AGENTOPS_ENABLED', true),

'tracking' => [
    'agents' => true,
    'tools' => true,
    'streaming' => true,
],

'recording' => [
    'input' => true,
    'output' => true,
    'max_input_length' => 10000,
    'max_output_length' => 10000,
],

'cost' => [
    'enabled' => true,
    'currency' => 'USD',
],

// Built-in pricing for OpenAI, DeepSeek, Anthropic, xAI, Google
'models' => [
    'deepseek-chat' => ['input' => 0.27, 'output' => 1.10],
    'gpt-4o'        => ['input' => 2.50, 'output' => 10.00],
    // ...
],
```

## Artisan Commands

```bash
# Terminal statistics
php artisan agentops:stats --period=week

# Prune old data
php artisan agentops:prune --days=30

# Install (publish config + migrate)
php artisan agentops:install
```

## Custom Model Pricing

```php
use LaravelAgentOps\Facades\AgentOps;

AgentOps::registry()->register('my-custom-model', inputPer1M: 1.00, outputPer1M: 5.00);
```

## License

MIT
