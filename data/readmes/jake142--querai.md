# Querai

**Let anyone on your team ask your database questions in plain language — safely.**

Querai is a Laravel package that turns natural language into **read-only SQL**, runs it against your database, and returns answers a human can actually use. No SQL client, no BI tool, no ad-hoc queries in production.

### What you can use it for

- **Admin & support** — "How many orders did customer X place last month?" without pinging a developer.
- **Internal analytics** — quick counts, lists, and breakdowns from real data, not exports.
- **Multi-tenant SaaS** — one isolated client per customer DB, with its own AI config and domain hints.
- **Embedded in your app** — use the facade in controllers, jobs, or the built-in chat UI behind your existing auth.

### Why Querai

- **Safe by default** — only `SELECT`, blocked DDL/DML, row limits, optional table exclusions.
- **Your schema, your rules** — domain hints in config teach the AI how *your* tables relate.
- **Production-ready** — retries on bad SQL, paginated answers for large result sets, conversation context.
- **Provider-agnostic** — OpenAI, Azure OpenAI, Gemini, or Anthropic.

Ask in Swedish, English, or any language — answers follow the question.

MIT licensed.

## How it works

```
You: "How many orders did we get last month?"
  → AI generates SELECT … (schema-aware)
  → SqlGuard validates (SELECT only, no DDL/DML)
  → Query runs on your DB (with row limit)
  → AI formats the answer for humans
```

If the SQL fails, Querai sends the error back to the AI and retries (configurable).

Without **domain hints**, the AI only sees table/column names and will often guess wrong JOINs (e.g. linking `orders` to the wrong `user_id`). Hints in `config/querai.php` tell it how your app actually works.

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- A database connection Laravel already uses
- An AI API key (OpenAI, Azure OpenAI, Gemini, or Anthropic)

## Installation

```bash
composer require jake142/querai
```

Publish config:

```bash
php artisan vendor:publish --tag=querai-config
```

**Configure domain hints** in `config/querai.php` — this is the most important step for accurate SQL:

```php
'hints' => [
    'enabled' => true,
    'text' => <<<'HINTS'
- A customer is a row in users; find by users.email
- An order belongs to a customer: orders.user_id = users.id
- "Revenue" means SUM(orders.total) where orders.status = 'completed'
- Do NOT use the audit_log table unless the question is about audit events
HINTS,
],
```

Write short, factual rules: entity lookups, how tables relate, business terms, and tables to avoid. Paste a working SQL query from your app if a join is non-obvious.

Add to `.env`:

```env
QUERAI_DB_CONNECTION=mysql

QUERAI_AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Optional
QUERAI_MAX_ROWS=200
QUERAI_MAX_ATTEMPTS=3
QUERAI_CONVERSATION_ENABLED=true
QUERAI_UI_ENABLED=true
```

Extract and cache your schema once (recommended after migrations):

```bash
php artisan querai:schema
# Re-extract after schema changes:
php artisan querai:schema --fresh
```

## Usage

### Facade / client

```php
use Querai\Facades\Querai;

$result = Querai::ask('How many active users do we have?');

echo $result->answer;      // Human-readable reply
echo $result->sql;         // SQL that was executed
echo $result->rowCount;    // Number of rows returned
echo $result->attempts;    // Query attempts (retries on error)
```

### Conversation context

Pass the same `conversation_id` across calls to keep follow-up context (cached, TTL configurable):

```php
$id = 'user-session-abc';

Querai::ask('How many orders last month?', $id);
Querai::ask('Break that down by country', $id);
```

### Large results — continue / load more

When a query returns more rows than `response.threshold` (default 15), the full result set is cached and the answer is split into pages.

```php
$result = Querai::ask('List all products with stock below 10');

if ($result->hasMore) {
    $next = Querai::continue($result->responseId);
    echo $next->answer; // next batch, human-readable
}
```

Response fields:

| Field | Description |
|-------|-------------|
| `response_id` | Use with `continue()` while `has_more` is true |
| `has_more` | More pages available |
| `page` / `total_pages` | Current page of the formatted answer |

```env
QUERAI_RESPONSE_CACHE_ENABLED=true
QUERAI_RESPONSE_THRESHOLD=15
QUERAI_RESPONSE_PAGE_SIZE=15
QUERAI_RESPONSE_TTL=60
```

UI: a **Load more** button appears automatically when `has_more` is true.

### Controller / API

```php
use Querai\Facades\Querai;

$result = Querai::ask($request->input('question'));

return response()->json($result->toArray());
```

### Domain hints

Hints are sent to the AI on every question, together with a compact schema. They prevent wrong guesses when column names are ambiguous (e.g. `users` vs `customers`, or several foreign keys to the same table).

**What to include**

| Topic | Example hint |
|-------|----------------|
| Lookups | find a customer by `users.email` |
| Relationships | `orders.user_id` → `users.id` |
| Business terms | "sale" = `orders` row with `status = 'completed'` |
| Anti-patterns | do not use `legacy_orders` — data lives in `orders` |

**What to avoid**

- Long prose or full API docs — keep under `hints.max_chars` (default 8000)
- Secrets or PII in hints

**Per-tenant** (different DB + hints per customer):

```php
$client = Querai::configure()
    ->namespace('tenant:'.$tenant->id)
    ->connection('tenant_'.$tenant->id)
    ->hints("customer: users.email\norders: orders.user_id = users.id")
    ->make();
```

After changing hints: `php artisan config:clear`. No need to re-run `querai:schema`.

## Isolated clients (multi-tenant / per-customer DB)

The default facade uses `config/querai.php` (one DB + one AI setup). For apps where **each customer has their own database**, build a dedicated client per tenant:

```php
use Querai\Facades\Querai;

$client = Querai::configure()
    ->namespace('tenant:'.$tenant->id)   // isolates conversation/response/schema cache
    ->database([                          // register tenant DB for this request
        'driver' => 'mysql',
        'host' => $tenant->db_host,
        'database' => $tenant->db_name,
        'username' => $tenant->db_user,
        'password' => $tenant->db_password,
    ])
    ->ai([
        'provider' => 'openai',
        'openai' => [
            'api_key' => $tenant->openai_api_key ?? config('querai.ai.openai.api_key'),
            'model' => 'gpt-4o-mini',
        ],
    ])
    ->make();

$result = $client->ask('How many orders this week?');
```

**Use an existing Laravel connection** (if you already register tenant connections in your app):

```php
$client = Querai::configure()
    ->namespace('tenant:'.$tenant->id)
    ->connection('tenant_'.$tenant->id)
    ->ai([/* ... */])
    ->make();
```

Store the client on a service, request attribute, or resolve per request — each instance only talks to **its** DB and **its** AI config. Cache keys are namespaced so tenants never share conversation or paginated results.

Optional per-tenant overrides:

```php
->security(['excluded_tables' => ['internal_audit']])
->conversation(['ttl_minutes' => 30])
```

## AI providers

Set `QUERAI_AI_PROVIDER` to one of: `openai`, `azure`, `gemini`, `anthropic`.

| Provider   | Env vars |
|-----------|----------|
| OpenAI    | `OPENAI_API_KEY`, optional `QUERAI_OPENAI_MODEL`, `OPENAI_BASE_URL` |
| Azure     | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` |
| Gemini    | `GEMINI_API_KEY`, optional `QUERAI_GEMINI_MODEL` |
| Anthropic | `ANTHROPIC_API_KEY`, optional `QUERAI_ANTHROPIC_MODEL` |

## Security (important)

Querai is designed for **read-only analytics**, not arbitrary SQL execution.

### Built-in protections

1. **SqlGuard** – Only `SELECT` is allowed. Blocks `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, multiple statements, etc.
2. **Row limit** – Appends `LIMIT` if missing (`QUERAI_MAX_ROWS`, default 200).
3. **Excluded tables** – Tables never appear in schema or queries:

```php
// config/querai.php
'security' => [
    'excluded_tables' => ['users', 'password_reset_tokens', 'sessions'],
    'excluded_column_patterns' => [
        '/password/i',
        '/secret/i',
        '/token/i',
    ],
],
```

### Recommended hardening

- Use a **read-only database user** for the Querai connection (MySQL: `GRANT SELECT ON db.* TO 'querai'@'%'`).
- Point `QUERAI_DB_CONNECTION` at a **replica** if you have one.
- Never expose the UI without authentication (see below).
- Add **rate limiting** on `/querai/ask` in your app if the UI or API is used heavily.
- Monitor AI API costs; each question uses at least two AI calls (SQL + formatting).

## Admin UI

A minimal chat UI is included at `/querai` (prefix configurable).

It is **not** public by default. Routes use Laravel middleware from config:

```php
'ui' => [
    'enabled' => true,
    'prefix' => 'querai',
    'middleware' => ['web', 'auth'],  // your admin guard
    'gate' => 'viewQuerai',           // optional ability
],
```

### Protect with your existing auth

**Option A – middleware only** (default `web` + `auth`):

```php
'middleware' => ['web', 'auth:admin'],
```

**Option B – Gate / policy** (fine-grained):

In `App\Providers\AuthServiceProvider`:

```php
Gate::define('viewQuerai', fn ($user) => $user->is_admin);
```

Set in config:

```php
'gate' => 'viewQuerai',
```

The package registers a placeholder gate if missing; **override it in your app**.

Disable UI entirely:

```env
QUERAI_UI_ENABLED=false
```

Publish views to customize:

```bash
php artisan vendor:publish --tag=querai-views
```

## Configuration reference

| Key | Description |
|-----|-------------|
| `connection` | Laravel DB connection name |
| `ai.provider` | `openai`, `azure`, `gemini`, `anthropic` |
| `security.excluded_tables` | Tables hidden from AI |
| `security.excluded_column_patterns` | Regex patterns for sensitive columns |
| `security.max_rows` | Max rows per query |
| `security.blocked_keywords` | Extra blocked SQL keywords |
| `retries.max_attempts` | SQL generation retries on error |
| `conversation.enabled` | Multi-turn context cache |
| `conversation.ttl_minutes` | Conversation cache TTL |
| `response.threshold` | Row count before paginating answers |
| `response.page_size` | Rows per page sent to AI |
| `response.ttl_minutes` | Cached result session TTL |
| `schema.cache` | Cache extracted schema |
| `schema.compact` | Compact schema format (fewer tokens) |
| `schema.path` | JSON schema file path |
| `hints.enabled` | Send hints to AI (default true) |
| `hints.text` | Domain knowledge for SQL generation — **configure this** |
| `hints.max_chars` | Max characters sent to AI |
| `ui.middleware` | Route middleware stack |
| `ui.gate` | Optional Gate ability |

## Artisan commands

| Command | Description |
|---------|-------------|
| `php artisan querai:schema` | Extract DB schema to cache |
| `php artisan querai:schema --fresh` | Force re-extraction |

## Error handling & retries

When a generated query fails (syntax, unknown column, etc.), Querai:

1. Captures the database error message
2. Asks the AI to fix the SQL
3. Retries up to `retries.max_attempts` (default 3)

Disable retries:

```php
'retries' => ['enabled' => false],
```

## Conversation cache

When enabled, user/assistant messages are stored in Laravel cache so follow-up questions understand prior context.

```env
QUERAI_CONVERSATION_ENABLED=true
QUERAI_CONVERSATION_TTL=60
QUERAI_CONVERSATION_CACHE_STORE=redis
```

## Things to consider in production

| Topic | Suggestion |
|-------|------------|
| DB access | Read-only DB user + optional replica |
| Secrets | Exclude `users`, tokens, payment tables |
| Auth | `auth` middleware + Gate for UI |
| Rate limits | `throttle` middleware on ask endpoint |
| Schema drift | Run `querai:schema --fresh` after migrations |
| AI costs | Cache schema; limit UI to admins |
| Compliance | Log questions/SQL if your policy requires audit trails (add in your app) |

## License

MIT. See [LICENSE](LICENSE).
