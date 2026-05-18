# CodeSnip

Full documentation for sections **[docs/README.md](docs/README.md)**. (as presented in the git wiki)

CodeSnip is a Laravel + Livewire application for storing, editing, searching, sharing, and versioning code snippets.

The project is focused on practical developer workflows:
- fast snippet creation/editing with CodeMirror
- revision history with rollback and diff
- advanced search with saved searches
- public read-only snippet page with line-level actions

## Tech Stack

- PHP `^8.4`
- Laravel `^12`
- Livewire + Flux UI
- Vite + Tailwind CSS
- CodeMirror 6 (editor + readonly preview)
- Laravel Scout + Meilisearch (search-ready setup)
- PHPUnit (feature testing)

## Main Features

### Snippets
- Create, edit, delete snippets
- Language selection and tag support
- Public/private visibility
- Public page at `/p/snippets/{uuid}`

### Editor Experience
- Keyboard save (`Ctrl/Cmd+S`)
- Draft persistence (`localStorage`)
- Optional autosave on edit page
- Format (JSON pretty print + safe whitespace normalization)
- Wrap toggle, copy actions
- Inline diagnostics:
  - JSON parse errors
  - trailing whitespace warnings

### Revisioning
- Automatic snapshots on meaningful updates
- No new snapshot when nothing changed
- Revision list and diff modes:
  - selected vs current
  - selected vs previous
- One-click rollback

### Search
- Full-text style filters over title/code
- Filters:
  - query
  - language
  - tags
  - visibility
  - created/updated date ranges
- Sort:
  - updated/created/title/language
  - relevance (when query is provided)
- Saved searches per user

### Notifications
- Global top-center toast notifications
- Queue support (messages shown sequentially)
- Manual close button

## Installation (Docker / Sail)

This project is intended to run in Docker via `compose.yaml` (Laravel Sail-style workflow).

1. Clone repository
2. Create environment file:

```bash
cp .env.example .env
```

3. Build and start containers:

```bash
docker compose up -d --build
```

4. Install PHP dependencies inside container:

```bash
docker compose exec laravel.test composer install
```

5. Install frontend dependencies inside container:

```bash
docker compose exec laravel.test npm install
```

6. Generate app key:

```bash
docker compose exec laravel.test php artisan key:generate
```

7. Run migrations:

```bash
docker compose exec laravel.test php artisan migrate
```

8. Start Vite dev server:

```bash
docker compose exec laravel.test npm run dev -- --host
```

App URLs and ports are controlled via `.env` (`APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`, etc.).

## Running Locally

Bring up full stack:

```bash
docker compose up -d
```

Stop stack:

```bash
docker compose down
```

Open shell in app container:

```bash
docker compose exec laravel.test bash
```

Queue worker is started automatically by `laravel.queue` service.

## Testing

Run all tests:

```bash
docker compose exec laravel.test php artisan test
```

Run focused suites:

```bash
docker compose exec laravel.test php artisan test --filter=SnippetRevisionTest
docker compose exec laravel.test php artisan test --filter=SnippetSearchTest
```

## Search Notes

The repository supports SQL filtering and relevance-like ordering.
Scout/Meilisearch is installed and can be used for larger-scale search workloads.

If you enable Meilisearch in `.env`, ensure indexing is configured for `Snippet`.

## Roadmap

Completed:
- Revisioning + diff + rollback
- Advanced search + saved searches
- Editor practical improvements + public preview line actions

Next:
- **Import wizard** — import code from local/git into snippet library ([docs/feature-import-wizard.md](docs/feature-import-wizard.md))

## License

MIT
