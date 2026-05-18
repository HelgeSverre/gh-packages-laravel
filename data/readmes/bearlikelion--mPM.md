# mPM

![mPM Logo](./mPM_logo.png)

mPM (Mark's Project Management) is an open-source, self-hosted project management app for small teams who want a focused alternative to heavyweight issue trackers.

> **Active development.** Usable for local testing and early self-hosting, but the feature set, schema, UI, and deployment story are still moving. Breaking changes are possible until the first stable release.

## Features

- **Organizations & Projects** - workspaces with member management, roles, and admin tooling
- **Tasks & Epics** - assignment, comments, tags, attachments, and blockers
- **Kanban & Sprints** - board view, sprint creation, sprint defaults, and dashboards
- **Sprint Planning** - realtime attendance, story-point voting, tie resolution, and automatic `split-up` tagging for estimates of 13 or 21 points
- **Notifications** - activity alerts for relevant task events
- **YAML Scaffolding** - import/export projects, tasks, sprints, tags, assignees, and blockers
- **OAuth Login** - Discord and Steam via Laravel Socialite

## Tech Stack

| Layer | Technology |
|---|---|
| Language | [PHP 8.5](https://www.php.net/) |
| Framework | [Laravel 13](https://laravel.com/) |
| UI | [Livewire 4](https://livewire.laravel.com/) · [Flux UI 2](https://fluxui.dev/) · [Filament 5](https://filamentphp.com/) · [Mary UI 2](https://mary-ui.com/) · [Tailwind CSS 4](https://tailwindcss.com/) |
| Realtime | [Laravel Reverb](https://reverb.laravel.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Cache / Queue | [Redis](https://redis.io/) |
| Media | [Spatie Media Library](https://spatie.be/docs/laravel-medialibrary) |
| Auth | [Spatie Permission](https://spatie.be/docs/laravel-permission) · [Laravel Socialite](https://laravel.com/docs/socialite) |
| Testing | [Pest 4](https://pestphp.com/) · [PHPUnit 12](https://phpunit.de/) |
| Local Dev | [Laravel Sail](https://laravel.com/docs/sail) |

## Local Development

```bash
cp .env.example .env
vendor/bin/sail up -d
vendor/bin/sail artisan key:generate
vendor/bin/sail artisan migrate --seed
vendor/bin/sail npm install
vendor/bin/sail npm run dev
```

The queue worker and Reverb websocket server run as dedicated Sail services:

```bash
vendor/bin/sail up -d queue reverb
```

### Useful Commands

| Task | Command |
|---|---|
| Run tests | `vendor/bin/sail artisan test --compact` |
| Format PHP | `vendor/bin/sail bin pint --dirty --format agent` |
| Build assets | `vendor/bin/sail npm run build` |
| Tinker | `vendor/bin/sail artisan tinker` |
| View logs | `vendor/bin/sail artisan pail` |

## Deployment

mPM ships with a production `Dockerfile` and CapRover configuration for single-server self-hosting.

### CapRover

1. Create a new app in CapRover.
2. Mount two persistent volumes:
   - `/config` - place your production `.env` here as `.env`
   - `/app/storage` - persists uploads, logs, and framework cache across deploys
3. Push to `main` and trigger a deploy via CapRover's webhook.

On first boot the entrypoint will:
- Copy `/config/.env` into the app
- Wait for PostgreSQL to be ready
- Seed the storage directory structure if the volume is empty
- Run `php artisan migrate --force`
- Cache config, routes, and views
- Start PHP, queue workers, the scheduler, and Reverb via Supervisor

See `production/.env.example` for a production environment template. Key values to set:

```
APP_URL=https://yourdomain.com
DB_HOST=srv-captain--mpm-db
REDIS_HOST=srv-captain--mpm-redis
REVERB_HOST=yourdomain.com
```

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `QUEUE_WORKERS` | `4` | Number of queue worker processes |
| `QUEUE_NAME` | `default` | Queue name to consume |

## Contributing

Contributions are welcome while the project is active. Keep changes small, tested, and aligned with the self-hosted direction.

Before opening a PR:

- Run the affected Pest tests: `vendor/bin/sail artisan test --compact --filter=YourTest`
- Run Pint on PHP changes: `vendor/bin/sail bin pint --dirty --format agent`
- Avoid introducing paid-service or hosted-SaaS assumptions
- Keep setup and deployment paths friendly to self-hosters

## License & Commercial Use

mPM is intended to be a copyleft, self-hosted open-source project.

You may not use this code to create, operate, resell, or host a paid project-management service or SaaS offering. A commercial hosted version may exist in the future, but it is not implemented in this repository.

Until a complete `LICENSE` file is present, do not assume any commercial rights beyond the restriction above. If package metadata conflicts with this README, treat the README as the source of truth.