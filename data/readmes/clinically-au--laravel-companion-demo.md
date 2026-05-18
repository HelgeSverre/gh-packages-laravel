# Laravel Companion Demo

Demo and test bed for the [clinically/laravel-companion](https://github.com/clinically-au/laravel-companion) package. This app demonstrates and tests every feature of the package.

**Live demo: [companion-demo.clindev.au](https://companion-demo.clindev.au)**

## What's Inside

- **Laravel 13** + Livewire 4 + Flux UI (free edition)
- **clinically/laravel-companion v0.0.1** fully integrated
- **121 passing tests** (88 companion + 33 auth/settings)
- **API Explorer** page at `/explorer` — browse all companion features in-browser
- **Swagger UI** at `/companion/api/docs` — full OpenAPI 3.1 spec
- **Admin Dashboard** at `/companion/dashboard` — manage agents, audit logs, features

## Features Demonstrated

| Feature | How It's Demonstrated |
|---------|----------------------|
| Agent Authentication | Token auth with scopes, IP allowlists, expiry, revocation |
| Model Browser | 4 models (User, Post, Comment, Tag) with relationships and CompanionSerializable |
| Route Introspection | Web routes + API routes (`/api/v1/posts`, `/api/v1/tags`) |
| Command Execution | Whitelisted commands including `inspire`, blacklist enforcement |
| Queue Management | Database queue driver, ProcessPostAnalytics job |
| Cache Inspection | Database cache driver info, key read/forget/flush |
| Config Viewer | Full config tree with automatic redaction |
| Log Viewer | Structured parsing with level filtering and SSE streaming |
| Schedule Viewer | `inspire` (hourly), `cache:prune-stale-tags` (daily) |
| Migration History | 10 migrations across multiple batches |
| Event Map | PostPublished event with 2 listeners (1 queued, 1 sync) |
| Admin Dashboard | Overview, agents, audit log, features pages |
| Audit Logging | Read + write logging enabled |
| Custom Features | `demo-stats` endpoint via `Companion::registerFeature()` |
| HasCompanionAccess | User trait for agent management |
| Rate Limiting | API (120/min), SSE (5/min) |
| OpenAPI Spec | Full spec at `/companion/api/docs/openapi.yaml` |

## Demo Models

| Model | CompanionSerializable | Relationships | Notable |
|-------|----------------------|---------------|---------|
| User | No | posts, comments, companionAgents | HasCompanionAccess trait |
| Post | Yes | user, comments, tags | SoftDeletes, published/draft scopes |
| Comment | No | post, user | approved scope |
| Tag | Yes | posts (many-to-many) | Minimal serialization |

## Setup

```bash
git clone https://github.com/clinically-au/laravel-companion-demo.git
cd laravel-companion-demo
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed
npm install && npm run build
```

### Laravel 13 Note

The companion package depends on `mateffy/laravel-introspect` which doesn't yet officially support Laravel 13. This demo uses a [fork](https://github.com/clinically-au/laravel-introspect) with the `illuminate/contracts` constraint relaxed to include `^13.0`, referenced as a VCS repository in `composer.json`. This is handled automatically by `composer install` — no manual steps needed.

On **Laravel 11 or 12**, this fork is not needed — remove the `repositories` block and `mateffy/laravel-introspect` line from `composer.json`.

## Running Tests

```bash
php artisan test
```

Or just the companion tests:

```bash
php artisan test --filter=Companion
```

## Test Files

All 21 test files under `tests/Feature/Companion/`:

- AuthenticationTest — token auth (missing/invalid/revoked/expired/IP allowlist)
- ScopeEnforcementTest — scope validation, wildcards (`*`, `*:read`)
- EnvironmentTest — environment info endpoint
- ModelDiscoveryTest — model listing, metadata, relationships
- ModelBrowsingTest — record pagination, filtering, sorting, search, scopes
- RouteIntrospectionTest — route listing with filters
- CommandTest — command listing, whitelist/blacklist, execution
- QueueTest — queue info, failed jobs CRUD, retry/flush
- CacheTest — cache info, read/write/forget/flush, prefix allowlist
- ConfigTest — config tree, specific keys, redaction rules
- LogTest — log file listing, parsed entries
- ScheduleTest — scheduled commands listing
- MigrationTest — migration history by batch
- EventTest — event/listener map
- DashboardTest — dashboard pages load
- AuditTest — audit logging of API requests
- CapabilitiesTest — capabilities matrix, scope reflection
- RateLimitTest — rate limiting enforcement
- CustomFeatureTest — custom feature registration and endpoint
- HasCompanionAccessTest — user trait methods
- ArtisanCommandTest — companion CLI commands

## Pages

| URL | Description |
|-----|-------------|
| `/` | Welcome page with feature overview |
| `/dashboard` | Feature cards linking to companion pages |
| `/explorer` | API Explorer — browse all 10 API features in-browser |
| `/companion/dashboard` | Admin dashboard (overview, agents, audit, features) |
| `/companion/api/docs` | Swagger UI with full OpenAPI spec |
| `/api/v1/posts` | Demo JSON API (public) |
| `/api/v1/tags` | Demo JSON API (public) |

## License

MIT
