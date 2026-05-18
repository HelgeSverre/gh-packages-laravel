# Video Processing - Generates lower-resolution variants

A minimal Laravel app that accepts video uploads and generates lower-resolution variants (e.g., 4K -> 2K, 1080p, 720p, 480p).

## Features

- Upload videos via API
- Background job processing to generate multiple resolution variants
- Video and VideoVariant models with policies
- Queue-driven processing using Redis and Laravel Jobs

## Tech stack

- PHP 8.4
- Laravel 12
- Livewire 3.6
- Tailwind CSS
- SQLite (default local DB)
- Redis (queues & cache)
- Docker + Sail (local development)
- FFmpeg (for video transcoding)

## How to install

These instructions assume you're on a Linux machine with composer installed and want to run the app locally using Laravel Sail (Docker). If you prefer to run services on the host, adjust the steps accordingly.

1. Clone the repository

```shell
git clone git@github.com:delabon/video-proccessing.git
cd video-proccessing
```

2. Install dependencies

```shell
composer install
```

3. Build the docker image

```shell
vendor/bin/sail up -d
```

4. Copy environment file and set app key

```shell
cp .env.example .env
# If using Sail, you can generate the key after starting Sail. Otherwise run locally:
vendor/bin/sail artisan key:generate
```

5. Install Node dependencies

```shell
vendor/bin/sail npm install
vendor/bin/sail npm run build
```

6. Database & migrations

```shell
# By default the app uses SQLite for local development. Create the storage/database file:
touch database/database.sqlite
vendor/bin/sail artisan migrate --step
```

7. Storage link

```shell
   vendor/bin/sail artisan storage:link
```

8. Redis & Queues

```shell
vendor/bin/sail artisan queue:work --tries=3
```

9. Open the app

The app will be available at http://localhost when Sail is running.

## Usage

- Register or login
- Upload a video via the API
- A background job will process the video and generate variants. Monitor jobs via Horizon.

## Next steps / Caveats

- Add support for large files (chunk upload) and other video formats.
- Add cloud storage (S3) for large files.
- Add more robust retry, monitoring and failure handling for long-running transcodes.

---
