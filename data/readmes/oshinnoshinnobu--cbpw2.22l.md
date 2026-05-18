# Cyberpunkwaifus (cbpw) — gallery & blog engine

A lightweight gallery / blog engine built with Laravel and Livewire that lets you create albums, upload images and videos, manage users and permissions, and display content with a modern responsive frontend.

<p>
    <img src="https://raw.githubusercontent.com/kuronneko/kuronneko.github.io/master/assets/img/portfoliocbpw.png" alt="Cyberpunkwaifus preview" width="450" />
</p>

This README expands on the original project notes: full description, features, requirements, install steps (normal and with Laravel Sail), and how to enable S3 object storage for uploads and serving.

## Quick overview

-   Create albums and upload images/videos
-   Thumbnail generation for images and videos (Intervention Image + FFMPEG integrations)
-   Upload UI using Dropzone and Livewire async uploads
-   Masonry layout, FancyBox lightbox and Infinite Scroll on the frontend
-   Admin panel and permission system to manage users, tags, likes and stats
-   Docker / Laravel Sail compatible for easy local development and CI

## Features

-   Albums with images & video support
-   Automatic thumbnail generation for images (Intervention Image) and videos (FFMPEG + Lakshmaji-Thumbnail)
-   Uploads via Dropzone + Livewire temporary uploads
-   User roles and permissions with admin panel (set user type to 5 for admin)
-   Tagging, likes, comments and basic stats collection
-   Responsive frontend with Masonry, FancyBox and Infinite Scroll
-   Local filesystem and S3-compatible storage support

## Requirements

-   PHP 7.4 - 8.2 (project prepared for PHP 8.x — branch `php82`)
-   Composer
-   A supported database: MySQL / MariaDB (or configured DB in `.env`)
-   Node.js and npm (for frontend build tooling)
-   GD or Imagick (for image processing)
-   FFMPEG (optional, required to generate thumbnails from videos)
-   Required PHP extensions: fileinfo, mbstring, openssl, pdo, tokenizer, xml, ctype, json, zip, gd/imagick
-   Optional: Docker and Docker Compose (or Laravel Sail)

## Quick links (project layout)

-   `composer.json` — PHP dependencies
-   `package.json` — Node dependencies and build scripts
-   `webpack.mix.js` — frontend build config
-   `routes/web.php` & `routes/api.php` — routes
-   `app/Http/Livewire/` — Livewire components
-   `app/Services/ImageService.php` — image processing helpers
-   `config/filesystems.php` — filesystem disks (local, s3)
-   `config/myconfig.php` — app specific options

## Installation — Local (non-Docker)

1. Copy the example env and install PHP deps:

```bash
cp .env.example .env
composer install --no-interaction --optimize-autoloader
```

2. Generate app key and storage link:

```bash
php artisan key:generate
php artisan storage:link
```

3. Configure your database in `.env` (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD), then run migrations and seeders:

```bash
php artisan migrate --seed
```

4. (Optional) Install node modules and build assets for dev:

```bash
npm install
npm run dev
```

5. Create an admin account and set it to admin-level (type 5) via tinker or the database.

Example using tinker (creates a user with the fields from the schema and hashes the password):

```bash
php artisan tinker
>>> use App\Models\User; use Illuminate\Support\Facades\Hash;
>>> $u = User::create([
...     'name' => 'Admin User',
...     'email' => 'admin@example.com',
...     'password' => Hash::make('secret'),
...     'type' => 5,                    // admin user (integer)
...     'avatar' => 'avatars/default.png',
...     'last_login_ip' => '127.0.0.1',
...     'last_login_at' => now(),
... ]);
>>> $u
```

Notes:
- Replace the example values with real ones for your environment.
- The `type` integer is used by this app to indicate user roles; by convention `5` is an admin.

6. Run the app locally:

```bash
php artisan serve
# or serve with your webserver pointing to `public/`
```

## Installation — Docker / Laravel Sail

1. Copy env and install PHP deps (locally first):

```bash
cp .env.example .env
composer install
```

2. (If you don't have Sail installed) require it and install Sail configuration:

```bash
composer require laravel/sail --dev
php artisan sail:install
# choose services you want (mysql, redis, etc.) when prompted
```

3. Build and start the containers (use `--no-cache` if you need a full rebuild):

```bash
./vendor/bin/sail build --no-cache
./vendor/bin/sail up -d
```

4. Run artisan commands inside Sail:

```bash
./vendor/bin/sail php artisan key:generate
./vendor/bin/sail php artisan storage:link
./vendor/bin/sail php artisan migrate --seed
```

5. Build frontend assets inside Sail if desired:

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

6. Create an admin user (as above) or adjust seeds to create an admin automatically.

Notes for Sail + S3: ensure your `AWS_*` environment variables are set in `.env` and available inside the Sail containers (Sail will propagate `.env` values into containers by default).

## Enabling S3 (object storage) for uploads

The project supports S3-compatible object storage (Amazon S3, DigitalOcean Spaces, MinIO, etc.). Below are notes and step-by-step instructions.

1. Install the Flysystem S3 driver and AWS SDK (if not already installed):

```bash
composer require league/flysystem-aws-s3-v3 aws/aws-sdk-php
```

2. Update `.env` with your S3 credentials and preferred driver:

```ini
# Use s3 as the default filesystem (optional)
FILESYSTEM_DRIVER=public
# To use S3 as default, set:
# FILESYSTEM_DRIVER=s3

AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=us-east-1
AWS_ENDPOINT=
AWS_BUCKET=your_bucket_name=
AWS_UPLOAD_FOLDER=
```

3. Configure `config/filesystems.php` if you need a custom disk. Typical S3 disk configuration already exists in a default Laravel install, but confirm it contains something like:

```php
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'upload_folder' => env('AWS_UPLOAD_FOLDER'),
        ],
```

4. Make the application use the S3 disk for uploads

-   Option A: Make `FILESYSTEM_DRIVER=s3` to switch the default disk to S3. Then Laravel's `Storage::put()` and related methods will use S3.
-   Option B: Explicitly call the S3 disk in code: `Storage::disk('s3')->put($path, $content, 'public');`

5. Notes about URLs and public access

-   For public web access, ensure objects are uploaded with public visibility (e.g., `'visibility' => 'public'` or `'ACL' => 'public-read'`).
-   You can configure a CDN (CloudFront) or custom `AWS_URL` to serve files faster.

6. Running with Sail (containers)

-   Add the AWS env vars to your `.env`. Sail picks them up automatically when building container runtime env.
-   If using a shared credentials file (`~/.aws/credentials`), you can mount it into the container by editing `docker-compose.yml` (or Sail's published compose file). Example service mount:

```yaml
services:
	laravel.test:
		volumes:
			- '~/.aws:/home/sail/.aws:ro'
```

-   For MinIO or other self-hosted S3 endpoints, set `AWS_ENDPOINT` and `AWS_USE_PATH_STYLE_ENDPOINT=true`.

7. IAM / Bucket policy

-   Ensure the IAM user/credentials you're using have permissions for PutObject/GetObject/ListBucket on your bucket. Example minimal policy actions: `s3:PutObject`, `s3:GetObject`, `s3:ListBucket`, `s3:DeleteObject`.

## What changes when you enable S3

-   Files are stored remotely, so `php artisan storage:link` remains useful for local `public/storage` links if you keep some local files.
-   You should update backups and deployment docs to remember object storage is external.

## Configuration & environment

-   `config/myconfig.php` contains project-specific flags (e.g., video thumbnailing, watermarking). Review and set them in `.env` where applicable.
-   `config/filesystems.php` controls the disk names. You can add a dedicated `images` disk that points to `s3` but exposes a different root path.

## Developer notes

-   Livewire components are under `app/Http/Livewire/` and handle most UI upload flows.
-   Image/video processing and thumbnail generation live in `app/Services/ImageService.php`.
-   Adjust queue settings (Redis, database) to handle heavy/async work if you generate thumbnails in background jobs.

## Troubleshooting

-   Uploads failing:
    -   Check `FILESIZE` limits in PHP and `post_max_size` / `upload_max_filesize` in php.ini.
    -   Verify `config/livewire.php` temporary disk and allowed file types.
-   Missing thumbnails:
    -   Ensure `ffmpeg` is installed and reachable in PATH for video thumbnails.
    -   Ensure `GD` or `Imagick` extension is available for image resizing.
-   S3 errors:
    -   Verify `.env` AWS\_\* credentials and `AWS_ENDPOINT` if using a custom endpoint.
    -   Check IAM policy and bucket permissions.

## Commands and maintenance

-   Clear caches:

```bash
php artisan cache:clear
php artisan view:clear
php artisan config:clear
```

-   Run test suite:

```bash
php artisan test
# or inside Sail
./vendor/bin/sail test
```

## Contributing

-   Fork the repository, create a feature branch, and open a pull request. Provide tests for new behaviors.

## License

This project uses the Laravel framework (MIT). See the LICENSE information in this repository. The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
