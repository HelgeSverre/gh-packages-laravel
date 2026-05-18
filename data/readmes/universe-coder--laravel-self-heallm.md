# Laravel Self-HeaLLM

[![Latest Version](https://img.shields.io/packagist/v/self-heallm/laravel-self-heallm.svg?style=flat-square)](https://packagist.org/packages/self-heallm/laravel-self-heallm)
[![License](https://img.shields.io/packagist/l/self-heallm/laravel-self-heallm.svg?style=flat-square)](LICENSE)
[![PHP Version](https://img.shields.io/packagist/dependency-v/self-heallm/laravel-self-heallm/php.svg?style=flat-square)](https://packagist.org/packages/self-heallm/laravel-self-heallm)
[![Laravel](https://img.shields.io/packagist/dependency-v/self-heallm/laravel-self-heallm/illuminate%2Fsupport.svg?label=laravel&style=flat-square)](https://packagist.org/packages/self-heallm/laravel-self-heallm)
[![Total Downloads](https://img.shields.io/packagist/dt/self-heallm/laravel-self-heallm.svg?style=flat-square)](https://packagist.org/packages/self-heallm/laravel-self-heallm)
[![Monthly Downloads](https://img.shields.io/packagist/dm/self-heallm/laravel-self-heallm.svg?style=flat-square)](https://packagist.org/packages/self-heallm/laravel-self-heallm)
[![GitHub Stars](https://img.shields.io/github/stars/universe-coder/laravel-self-heallm.svg?style=flat-square)](https://github.com/universe-coder/laravel-self-heallm/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/universe-coder/laravel-self-heallm.svg?style=flat-square)](https://github.com/universe-coder/laravel-self-heallm/commits/main)
[![Open Issues](https://img.shields.io/github/issues/universe-coder/laravel-self-heallm.svg?style=flat-square)](https://github.com/universe-coder/laravel-self-heallm/issues)

Open-source Laravel package that detects recent application errors, asks an LLM for a fix proposal (OpenAI, Anthropic, Hugging Face, or Ollama), validates safety rules, applies fixes in hybrid mode, and sends healing reports.

## What It Does

- Detects recent app errors and builds a repair context.
- Requests a fix proposal from a configured LLM provider.
- Validates proposed changes against strict safety rules.
- Applies validated fixes in `dry-run` or auto-apply mode.
- Sends reports to chat/monitoring channels.

## Quick Start

### 1) Install

```bash
composer require self-heallm/laravel-self-heallm
php artisan vendor:publish --tag=self-heal-config
```

### 2) Configure

Main config file: `config/self-heal.php`

Supported sections:

- Provider selector: `llm.provider` (`openai`, `anthropic`, `huggingface`, `ollama`)
- OpenAI: `openai.base_url`, `openai.token`, `openai.model`, `openai.timeout`
- Anthropic: `anthropic.base_url`, `anthropic.token`, `anthropic.model`, `anthropic.timeout`, `anthropic.version`
- Hugging Face (OpenAI-compatible endpoint): `huggingface.base_url`, `huggingface.token`, `huggingface.model`, `huggingface.timeout`
- Ollama (OpenAI-compatible endpoint): `ollama.base_url`, `ollama.token`, `ollama.model`, `ollama.timeout`
- Telegram: `telegram.bot_token`, `telegram.user_id`, `telegram.enabled`
- Slack: `slack.enabled`, `slack.webhook_url`
- Generic webhook: `webhook.enabled`, `webhook.url`, `webhook.token`
- Sentry: `sentry.enabled`, `sentry.dsn`, `sentry.environment`
- Modes: `enabled`, `auto_apply`, `dry_run`
- Safety: `allowed_paths`, `forbidden_paths`, `max_files_per_fix`
- Deduplication: `deduplication.enabled`, `deduplication.ttl_seconds`, `deduplication.store_path`
- Model context size: `context.max_file_chars`
- Reporting: JSONL fallback path via `reporting.json_path`

Example `.env` values:

```dotenv
SELF_HEAL_ENABLED=true
SELF_HEAL_AUTO_APPLY=false
SELF_HEAL_DRY_RUN=true
SELF_HEAL_LLM_PROVIDER=openai
SELF_HEAL_OPENAI_BASE_URL=https://api.openai.com/v1
SELF_HEAL_OPENAI_TOKEN=sk-...
SELF_HEAL_OPENAI_MODEL=gpt-4.1-mini
SELF_HEAL_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
SELF_HEAL_ANTHROPIC_TOKEN=
SELF_HEAL_ANTHROPIC_MODEL=claude-3-5-sonnet-latest
SELF_HEAL_HUGGINGFACE_BASE_URL=https://router.huggingface.co/v1
SELF_HEAL_HUGGINGFACE_TOKEN=
SELF_HEAL_HUGGINGFACE_MODEL=openai/gpt-oss-120b
SELF_HEAL_OLLAMA_BASE_URL=http://localhost:11434/v1
SELF_HEAL_OLLAMA_TOKEN=
SELF_HEAL_OLLAMA_MODEL=llama3.1
SELF_HEAL_TELEGRAM_BOT_TOKEN=123:abc
SELF_HEAL_TELEGRAM_USER_ID=123456789
SELF_HEAL_SLACK_ENABLED=false
SELF_HEAL_SLACK_WEBHOOK_URL=
SELF_HEAL_WEBHOOK_ENABLED=false
SELF_HEAL_WEBHOOK_URL=
SELF_HEAL_WEBHOOK_TOKEN=
SELF_HEAL_SENTRY_ENABLED=false
SELF_HEAL_SENTRY_DSN=
SELF_HEAL_DEDUP_ENABLED=true
SELF_HEAL_DEDUP_TTL_SECONDS=600
SELF_HEAL_CONTEXT_MAX_FILE_CHARS=12000
```

Provider notes:

- `openai`: default provider, no migration needed for existing setups.
- `anthropic`: uses native Anthropic Messages API.
- `huggingface`: in this version, use an OpenAI-compatible Hugging Face endpoint.
- `ollama`: in this version, use Ollama's OpenAI-compatible endpoint (`/v1/chat/completions`).

### 3) Run

```bash
php artisan self-heal:run
```

## Security Model

- Accepts fixes only for whitelisted paths.
- Rejects forbidden paths even if suggested by the model.
- Rejects empty replacement targets.
- Applies validated patches automatically only with `dry_run=false` and `auto_apply=true`.
- Skips duplicate error fingerprints during deduplication TTL.

## Reporting Channels

- Telegram notifications.
- Slack incoming webhook notifications.
- Generic webhook (`POST`) notifications.
- Sentry envelope event reporting.
- JSON fallback report when enabled.
