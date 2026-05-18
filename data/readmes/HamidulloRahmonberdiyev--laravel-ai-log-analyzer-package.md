# Laravel AI Log Analyzer

AI-powered analysis of Laravel log entries with optional **Telegram** delivery, **queue**-friendly processing, **rate limiting**, and an **AI Debugging Chat** (natural-language questions using recent log output and migration filenames).

**Requirements:** PHP `^8.2`, Laravel `10.x`, `11.x`, or `12.x`.

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Features](#features)
- [Configuration](#configuration)
- [Telegram](#telegram)
- [Telegram webhook (bot replies)](#telegram-webhook-bot-replies)
- [Queue](#queue)
- [AI Debugging Chat](#ai-debugging-chat)
- [Programmatic entry point](#programmatic-entry-point)
- [Security & privacy](#security--privacy)
- [License](#license)

---

## Installation

```bash
composer require hamidullo/laravel-ai-log-analyzer
```

If Composer reports **no stable release** matching `minimum-stability: stable`, either:

- require the development branch explicitly:

  ```bash
  composer require hamidullo/laravel-ai-log-analyzer:dev-main
  ```

- or relax stability (e.g. `minimum-stability: dev` with `prefer-stable: true` in your app’s `composer.json`).

The package auto-registers `Hamidullo\AILogAnalyzer\AILogAnalyzerServiceProvider` via Laravel’s package discovery.

### Publish files (optional)

Configuration (recommended):

```bash
php artisan vendor:publish --tag=ai-log-analyzer-config
```

This copies `config/ai-log-analyzer.php` into your application.

Routes are loaded automatically from the package. To **copy** the route file into your app as a starting point for customization:

```bash
php artisan vendor:publish --tag=ai-log-analyzer-routes
```

This creates `routes/ai-log-analyzer-telegram.php`. The package still registers its own routes, so do not `require` the published file unless you change the package or avoid duplicate paths—use the copy as a reference or after you align registration (e.g. fork/private fork). For most apps the default package routes are enough.

---

## Quick start

1. **Environment** — set at least:

   ```env
   AI_LOG_ANALYZER_ENABLED=true
   AI_PROVIDER=ollama
   ```

   For **OpenAI** (example):

   ```env
   AI_LOG_ANALYZER_ENABLED=true
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   ```

   For **Ollama** (local):

   ```env
   AI_LOG_ANALYZER_ENABLED=true
   AI_PROVIDER=ollama
   OLLAMA_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=phi3
   ```

2. **Telegram** (optional, for notifications and bot features): see [Telegram](#telegram).

3. **Queue** — ensure a queue worker is running if you use a non-`sync` queue driver (see [Queue](#queue)).

4. **Cache** — rate limiting and webhook deduplication use Laravel’s cache; use a **persistent** cache store in production (`file`, `redis`, `database`, etc.—not `array`).

5. **`APP_URL`** — must match your public HTTPS URL if you use [Telegram webhook registration](#telegram-webhook-bot-replies); Telegram rejects invalid URLs.

When `AI_LOG_ANALYZER_ENABLED` is `false`, the package still merges config and registers services, but **does not** listen to log events (no listener overhead).

---

## Features

| Area | What it does |
|------|----------------|
| **Automatic log analysis** | Listens to `MessageLogged` for configured levels (`error`, `critical`, `alert`, `emergency` by default). |
| **AI providers** | OpenAI-compatible APIs, Anthropic, Cohere, Google Gemini, Mistral, xAI, Ollama; optional OpenAI-compatible endpoints for Jina / Voyage / ElevenLabs (see [AI providers](#ai-providers)). |
| **Telegram** | Sends analysis + sanitized context to a chat (configurable, can be disabled). |
| **Queue** | Dispatches analysis as a job; when the queue driver is `sync`, jobs use `afterResponse()` so the HTTP response is not blocked. |
| **Rate limiting** | Reduces duplicate analyses for identical log fingerprints (cache-backed). |
| **Privacy** | Redacts sensitive keys from context before AI/Telegram (passwords, tokens, etc.). |
| **Filters** | Ignores log lines matching configurable regex patterns (e.g. package’s own prefix). |
| **AI Debugging Chat** | Ask questions in plain language; optional log tail + migration basenames are sent to the AI (see [AI Debugging Chat](#ai-debugging-chat)). |

---

## Configuration

Main file: `config/ai-log-analyzer.php` (all keys are overridable via `env()` as in the published file).

### Master switch

| Env | Description |
|-----|-------------|
| `AI_LOG_ANALYZER_ENABLED` | `true` enables log listeners and analysis pipeline. |

### AI response language

| Env / config | Description |
|--------------|-------------|
| `AI_LOG_ANALYZER_LOCALE` | Optional. Defaults to `APP_LOCALE` (then `en`). Controls the primary language for AI replies. |
| `config('ai-log-analyzer.locale')` | Same value; set via env or published config. |

When the locale is **`en`**, the model is still instructed to answer **fully in Uzbek** if the question or log text is clearly in Uzbek. For any other locale (e.g. `uz`), the model answers entirely in that language.

### AI provider

| Env | Description |
|-----|-------------|
| `AI_PROVIDER` | One of: `openai`, `anthropic`, `cohere`, `gemini`, `mistral`, `xai`, `ollama`, `jina`, `voyageai`, `elevenlabs`. |

Provider-specific variables are listed under `providers.*` in the config file (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `XAI_API_KEY`, `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_API_KEY`, `JINA_API_KEY`, `VOYAGEAI_API_KEY`, `ELEVENLABS_API_KEY`, etc.).

### AI providers (summary)

- **OpenAI / Mistral / xAI** — OpenAI-compatible `POST /v1/chat/completions` (set `*_BASE_URL` and `*_API_KEY` as documented in config).
- **Anthropic** — Claude Messages API.
- **Cohere** — Chat API.
- **Gemini** — Google Generative Language API (`generateContent`). Default model: `gemini-2.5-flash` (`GEMINI_MODEL`). Google changes model IDs over time; use `GET https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY` to list IDs that support `generateContent`.
- **Ollama** — Local `/api/generate` for log analysis; `/api/chat` for debugging chat. Optional bearer token for cloud/Ollama setups.
- **Jina / VoyageAI / ElevenLabs** — Treated as **OpenAI-compatible** chat clients: you **must** set `*_BASE_URL` to an endpoint that implements `POST .../v1/chat/completions` (e.g. a gateway or proxy). Keys alone are not enough if those vendors do not expose that API.

### Default models (override with `*_MODEL` env vars)

| Provider | Default model | Notes |
|----------|----------------|--------|
| OpenAI | `gpt-4o-mini` | |
| Anthropic | `claude-sonnet-4-20250514` | Claude Messages API; older IDs still work if your key supports them. |
| Cohere | `command-r-plus-08-2024` | Replaces deprecated `command-r-plus` alias (see [Cohere changelog](https://docs.cohere.com/changelog)). |
| Gemini | `gemini-2.5-flash` | Use Google’s ListModels if you get 404. |
| Mistral | `mistral-small-latest` | Alias to current small model. |
| xAI | `grok-3-mini` | Fast/cheap; use `grok-3` or other IDs from [xAI docs](https://docs.x.ai/) if needed. |
| Ollama | `llama3.2` | Run `ollama pull llama3.2` (or set `OLLAMA_MODEL` to any tag you have). |
| Jina / VoyageAI / ElevenLabs | `gpt-4o-mini` | Placeholder until you point `*_BASE_URL` at an OpenAI-compatible gateway. |

### Log levels & filters

- **`log_levels`** — Which Monolog/Laravel levels trigger analysis (default: `error`, `critical`, `alert`, `emergency`).
- **`redact_context_keys`** — Substrings matched against context **keys**; values are replaced before AI/Telegram.
- **`ignore_message_patterns`** — Regex list; matching messages are skipped.

### Rate limiting

| Env | Description |
|-----|-------------|
| `AI_LOG_ANALYZER_RATE_LIMIT` | Enable/disable fingerprint-based rate limit. |
| `AI_LOG_ANALYZER_RATE_LIMIT_TTL` | Seconds for the cache window. |
| `AI_LOG_ANALYZER_RATE_LIMIT_MAX` | Max analyses per window per fingerprint. |

---

## Telegram

| Env | Description |
|-----|-------------|
| `TELEGRAM_NOTIFICATIONS_ENABLED` | Enable/disable Telegram sending for log analysis notifications. |
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_CHAT_ID` | Target chat ID for notifications. |
| `TELEGRAM_TIMEOUT` | HTTP timeout (seconds). |
| `TELEGRAM_SHARE_BUTTON_ENABLED` | Toggle share button in notification payloads where applicable. |

---

## Telegram webhook (bot replies)

The package registers a **POST** route for Telegram updates (default path: `ai-log-analyzer/telegram/webhook`, `api` middleware). Incoming messages are handled asynchronously via `ProcessTelegramBotMessageJob`.

### Webhook env

| Env | Description |
|-----|-------------|
| `TELEGRAM_WEBHOOK_ENABLED` | Master switch for the webhook route and `setWebhook` behavior. |
| `TELEGRAM_WEBHOOK_PATH` | URL path segment(s) under `APP_URL` (no leading slash). |
| `TELEGRAM_WEBHOOK_SECRET` | Optional. If set, Telegram sends `X-Telegram-Bot-Api-Secret-Token`; the request must match or the app responds `403`. |
| `TELEGRAM_WEBHOOK_REGISTER_ON_BOOT` | When `true`, the app may dispatch `RegisterTelegramWebhookJob` to call Telegram `setWebhook` when configuration changes (see below). |

### How `setWebhook` is registered

- On **HTTP** requests (not Artisan / queue workers), if webhook registration is enabled and the bot token is set, the package compares a hash of `APP_URL`, webhook path, and secret against a cache key (`ai-log-analyzer-telegram-webhook-hash`).
- If the hash differs, it queues `RegisterTelegramWebhookJob`, which calls Telegram’s `setWebhook` and stores the hash on success.

**Important:**

- Webhook registration runs only in **web** context (`runningInConsole()` is false). Queue workers do **not** enqueue registration jobs during bootstrap—this avoids flooding the queue when workers process `RegisterTelegramWebhookJob` itself.
- Ensure **`APP_URL`** is correct and publicly reachable over HTTPS (Telegram requirement).
- If `setWebhook` fails or returns a non-OK response, the cache key is not updated; fix the token, URL, or network, then trigger a web request or clear the cache key so registration can retry.

**Local domains:** Telegram’s servers cannot reach `http://127.0.0.1`, `*.test`, Valet/Homestead hostnames only on your machine, or plain HTTP — the webhook URL must be **public HTTPS**. For local development, run a tunnel such as **[ngrok](https://ngrok.com/)** (`ngrok http <port>`), set **`APP_URL`** to the HTTPS URL ngrok shows (it changes each run on the free tier unless you reserve a domain), open the app once so `setWebhook` runs with that base URL, and keep the tunnel running while you test the bot.

### Queue for Telegram jobs

Telegram-related jobs (`RegisterTelegramWebhookJob`, `ProcessTelegramBotMessageJob`) respect `ai-log-analyzer.queue.*` the same way as log analysis jobs (see [Queue](#queue)).

---

## Queue

| Env | Description |
|-----|-------------|
| `AI_LOG_ANALYZER_QUEUE` | When `true`, package jobs are queued (subject to `sync` handling below). When `false`, dispatches use `afterResponse()`. |
| `AI_LOG_ANALYZER_QUEUE_CONNECTION` | Optional queue connection name. |
| `AI_LOG_ANALYZER_QUEUE_NAME` | Optional queue name. |

Behavior for **log analysis** (`AnalyzeLogEntryJob`):

- If `AI_LOG_ANALYZER_QUEUE` is **disabled**, the job is dispatched with **`afterResponse()`** (non-blocking after the HTTP response).
- If **enabled** and your resolved queue connection uses the **`sync`** driver, the job still uses **`afterResponse()`** so the request thread is not blocked synchronously.
- For **redis**, **database**, **SQS**, etc., run a worker, e.g.:

  ```bash
  php artisan queue:work
  ```

---

## AI Debugging Chat

Interactive debugging: you ask a question; the package sends the question plus (optional) a **tail of log file(s)** and a **list of migration basenames** (newest first) to the configured AI. The model is guided to produce structured hints (possible cause, recent errors, migrations to check).

### Artisan

```bash
php artisan ai-log-analyzer:debug-chat why are orders failing
```

Multi-word questions are supported (`question*` argument).

### Programmatically

```php
use Hamidullo\AILogAnalyzer\AIManager;

app(AIManager::class)->debuggingChat('Why are orders failing?');

// Optional overrides:
app(AIManager::class)->debuggingChat('Why are orders failing?', [
    'log_paths' => [storage_path('logs/laravel.log')],
    'migrations_path' => database_path('migrations'),
]);
```

### Debugging chat env (optional)

| Env | Description |
|-----|-------------|
| `AI_DEBUG_CHAT_ENABLED` | Master switch for the chat service. |
| `AI_DEBUG_CHAT_INCLUDE_LOG` | Include log tail in the prompt. |
| `AI_DEBUG_CHAT_MAX_LOG_CHARS` | Max characters read from log tail(s). |
| `AI_DEBUG_CHAT_LOG_PATHS` | Comma-separated log paths (default: `storage/logs/laravel.log`). |
| `AI_DEBUG_CHAT_INCLUDE_MIGRATIONS` | Include migration filenames. |
| `AI_DEBUG_CHAT_MIGRATIONS_PATH` | Migrations directory. |
| `AI_DEBUG_CHAT_MAX_MIGRATION_FILES` | Max files listed. |

---

## Programmatic entry point

`Hamidullo\AILogAnalyzer\AIManager` is registered as a singleton:

- `config()` — returns the merged `ai-log-analyzer` config array.
- `handleMessageLogged(MessageLogged $event)` — used by the package listener (normally you do not call this directly).
- `debuggingChat(string $question, array $options = [])` — see [AI Debugging Chat](#ai-debugging-chat).

---

## Security & privacy

- Context is **sanitized** using `redact_context_keys`; tune this list for your app.
- Log excerpts in debugging chat may still contain sensitive **values** inside free text — restrict access to debugging chat in production and avoid logging secrets.
- Set `TELEGRAM_WEBHOOK_SECRET` in production so only Telegram can post to your webhook (verify `X-Telegram-Bot-Api-Secret-Token`).

---

## License

MIT. See [LICENSE](LICENSE) if present in the repository.

---

## Author

**Hamidullo Rahmonberdiyev**

Package: [hamidullo/laravel-ai-log-analyzer](https://packagist.org/packages/hamidullo/laravel-ai-log-analyzer)
