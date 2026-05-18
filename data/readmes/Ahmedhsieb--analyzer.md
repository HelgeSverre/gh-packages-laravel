# Analyzer

This is a Laravel dev tool package that analyzes your app and builds a graph of routes, controllers, services, and more.
Analyzer is a Laravel developer tool that scans your architecture and visualizes route-to-code flow as an interactive graph.

It is designed for monorepos and modular codebases where routes may live in `packages`, `modules`, `extensions`, microservices, or any custom folder naming convention.

## Attribution

This project is based on and references the original Laravel Brain project:
`https://github.com/laramint/laravel-brain`

Analyzer includes my own updates and additional features on top of that foundation.

## Highlights

- Full request lifecycle tracing: route -> controller -> service -> repository -> model -> events/jobs
- Monorepo-aware route discovery across nested Laravel roots
- Interactive viewer under `/_analyzer`
- Command and schedule discovery
- Broadcast channel discovery
- Query tracing (Eloquent + raw)
- Per-route tabs, source view, flow view, export (PNG/Mermaid)
- Watch mode
- Scoped analysis filters by path, route, group, and controller

## Installation

```bash
composer require --dev ahmedhsieb/analyzer
```

## Commands

### Analyze full project

```bash
php artisan analyzer:analyze
```

### Setup login (secure viewer)

```bash
php artisan analyzer:setup-auth
```

Or non-interactive:

```bash
php artisan analyzer:setup-auth --username=admin --password=secret
```

Then open:

```text
/_analyzer/login
```

### Change login credentials

```bash
php artisan analyzer:change-auth
```

Or non-interactive:

```bash
php artisan analyzer:change-auth --current-username=admin --current-password=oldpass --username=newadmin --password=newpass
```

### Watch mode

```bash
php artisan analyzer:analyze --watch
php artisan analyzer:analyze --watch --interval=5
```

### Filter by path

```bash
php artisan analyzer:analyze --path=modules/Billing
php artisan analyzer:analyze --path=packages/Shared/src/Routes/web.php
```

### Analyze specific route(s)

```bash
php artisan analyzer:analyze --route=/api/orders
php artisan analyzer:analyze --route="GET /api/orders,POST /api/orders"
```

### Analyze specific group/prefix

```bash
php artisan analyzer:analyze --group=api
php artisan analyzer:analyze --group="admin,v1"
```

### Analyze specific controller

```bash
php artisan analyzer:analyze --controller=OrderController
php artisan analyzer:analyze --controller="Modules\\Billing\\Http\\Controllers\\InvoiceController"
```

Notes:
- Alias: `analyzer:scan`
- Filters can be combined.

## Viewer URL

Open:

```text
/_analyzer
```

## Registered routes

```text
GET  /_analyzer/api/source
POST /_analyzer/api/scan
GET  /_analyzer/{any?}
```

## Output files

Analysis output is written to:

```text
storage/app/analyzer/
```

Files:

```text
.graph-manifest.json
.graph-all.json
.graph-{tab-id}.json
```

## Security

The package routes/commands are loaded only in local environment by default.

## Development

```bash
composer install
cd frontend && npm install && npm run build
```



