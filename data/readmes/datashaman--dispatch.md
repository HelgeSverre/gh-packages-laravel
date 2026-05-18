# Dispatch

A self-hosted webhook server that receives events from GitHub, GitLab, and other sources, then dispatches them to AI agents based on configurable rules.

## What is Dispatch?

Dispatch sits between your event sources and your AI agents. When a webhook event arrives (issue opened, PR commented on, label added, etc.), Dispatch auto-detects the source, matches the event against your rules, renders a prompt with the event data, and runs an AI agent in an isolated environment to handle it.

```
Webhook Event (GitHub, GitLab, ...)
     │
     ▼
POST /api/webhook
     │  (source detected, signature verified)
     ▼
Rule Matching Engine
     │  (filters: field, operator, value)
     ▼
Agent Job (queued)
     │  (worktree isolated)
     ▼
Executor  ──────────────────────────────────────
     │   laravel-ai (Laravel AI SDK)             │
     │   claude-cli (Claude CLI)                 │
     ▼                                           │
Agent Tools: Read · Edit · Write · Bash · Glob · Grep
     │
     ▼
Output Routing
     │  GitHub comment · reaction · log
     ▼
```

## Features

- **Multi-source webhooks** — receive events from GitHub, GitLab, and any future source via pluggable `EventSource` adapters
- **Rule-based dispatch** — match any event field with operators: `equals`, `contains`, `not_contains`, `regex`, `starts_with`, `ends_with`
- **Multi-agent pipelines** — chain agents with `depends_on` for sequential workflows
- **Two executors** — `laravel-ai` (Laravel AI SDK) or `claude-cli` (Claude CLI subprocess)
- **Agent tools** — Read, Edit, Write, Bash, Glob, Grep — the same tools used to build Dispatch itself
- **Worktree isolation** — each agent run gets its own git worktree so concurrent jobs don't interfere
- **`dispatch.yml`** — define rules in a YAML file in your repo; sync bidirectionally with the database
- **Visual config editor** — build and edit rules with a form UI, live YAML preview, and mtime conflict detection
- **Rule templates** — start from pre-built templates for common workflows (triage, review, implementation)
- **GitHub App integration** — automated webhook setup, installation tokens, repo picker UI
- **Prompt injection defense** — structural separation of untrusted webhook content from agent instructions
- **Live agent streaming** — watch agent execution in real time via Laravel Reverb
- **Agent run diff view** — see exactly what files an agent changed
- **Agent quality feedback** — rate agent outputs to improve future runs
- **Mission control dashboard** — at-a-glance stats (webhooks, runs, success rate, spend), recent activity, budget health bars, quick actions, and fresh-install onboarding — all scoped per user
- **Cost dashboard** — track token usage, set budgets, auto-pricing per model
- **Webhook log UI** — inspect every inbound event, matched rule, rendered prompt, and agent output
- **Docker deployment** — run Dispatch in containers with Docker Compose
- **Laravel Horizon** — queue dashboard at `/horizon` for monitoring agent jobs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.4 |
| UI | Livewire 4, Volt, Flux UI, Tailwind CSS v4 |
| AI | Laravel AI SDK (`laravel/ai`) |
| Queue | Redis + Laravel Horizon |
| Database | SQLite (dev) / any Laravel-supported DB |
| GitHub | `GitHubApiClient` (HTTP with installation tokens) |
| Testing | Pest 4 |

## Quick Start

```bash
git clone https://github.com/your-org/dispatch.git
cd dispatch
composer run setup
```

Then start the development server (Laravel + queue worker + log tail + Vite):

```bash
composer run dev
```

Open `http://localhost:8000`, register an account, and follow the setup wizard.

See **[docs/setup.md](docs/setup.md)** for full installation, GitHub App configuration, and your first rule.

## dispatch.yml

Drop a `dispatch.yml` at the root of any repository to define rules for that project:

```yaml
version: 1
agent:
  executor: laravel-ai
  provider: anthropic
  model: claude-sonnet-4-6
  secrets:
    api_key: ANTHROPIC_API_KEY

rules:
  - id: triage
    event: issues.opened
    name: Triage new issues
    prompt: |
      Analyse issue #{{ event.issue.number }}: {{ event.issue.title }}
      {{ event.issue.body }}
      Apply appropriate labels and post a triage comment.
    agent:
      tools: [Read, Glob, Grep, Bash]
    output:
      github_comment: true
      github_reaction: eyes
```

The `dispatch.yml` in this repository is a fully-working example with four rules: **analyze**, **implement**, **interactive Q&A**, and **code review responder**.

## Documentation

- **[Setup Guide](docs/setup.md)** — installation, GitHub App config, first rule
- **[Design System](DESIGN.md)** — typography, color, spacing, component patterns
- **[Agent Instructions](AGENTS.md)** — instructions for AI agents working on this codebase

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
