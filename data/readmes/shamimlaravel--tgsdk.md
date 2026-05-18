# Laravel Telegram Hybrid Storage

A Laravel 12 package that implements a custom filesystem driver backed by Telegram channels. Files are uploaded asynchronously through a Python worker (Pyrogram) via a Redis queue, and served back through a streaming proxy with optional CDN support.

**Repository:** https://github.com/shamimlaravel/tgsdk.git

## Features

- **Laravel Storage API** — Use `Storage::disk('telegram')->put()`, `get()`, `url()`, `exists()`, `delete()`, `size()`, `mimeType()` seamlessly.
- **Telegram-backed storage** — Files are stored as messages in Telegram channels via MTProto (Pyrogram).
- **Async upload pipeline** — Laravel enqueues uploads to Redis; a Python worker handles the actual Telegram upload.
- **Unlimited file size** — Intelligent chunking splits files beyond Telegram's 2 GB / 4 GB limits into ordered parts.
- **Channel rotation** — Distributes uploads across multiple Telegram channels (round-robin, least-used, capacity-aware).
- **Multi-account session pooling** — Multiple Pyrogram sessions for parallel uploads and throughput multiplication.
- **Streaming proxy** — Download files through a Laravel controller that streams directly from Telegram.
- **Optional CDN** — Prepend a CDN base URL to download links for edge caching.
- **Signed URLs** — Optional signed download URLs with configurable expiration.
- **Chunk compression** — Optional gzip compression per chunk (skips already-compressed formats).
- **Chunk encryption** — Optional AES-256-GCM encryption per chunk with unique IVs.
- **Integrity verification** — SHA-256 checksums for both whole files and individual chunks.
- **Resumable uploads** — Failed chunks are re-enqueued without re-uploading completed ones.

## Requirements

- PHP 8.4+
- Laravel 12
- Redis
- Python 3.11+ (for the upload worker)

## Installation

### 1. Install the Laravel package

```bash
composer require shamimstack/tgsdk
```

### 2. Publish configuration and migrations

```bash
php artisan vendor:publish --tag=telegram-storage-config
php artisan vendor:publish --tag=telegram-storage-migrations
php artisan migrate
```

### 3. Add the disk to `config/filesystems.php`

```php
'disks' => [
    // ...
    'telegram' => [
        'driver' => 'telegram',
    ],
],
```

### 4. Set environment variables

```env
# Telegram API credentials
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_SESSION_NAME=telegram_storage

# Redis
TELEGRAM_STORAGE_REDIS_CONNECTION=default
TELEGRAM_STORAGE_REDIS_QUEUE=telegram_upload_queue

# Worker callback
TELEGRAM_STORAGE_CALLBACK_URL=https://your-app.com/telegram-storage/callback
TELEGRAM_STORAGE_CALLBACK_SECRET=your_hmac_secret

# Channels (configure in config/telegram-storage.php)
```

### 5. Set up the Python worker

```bash
cd python-worker
cp .env.example .env
# Edit .env with your credentials
pip install -r requirements.txt
python worker.py
```

Or use Docker:

```bash
cd python-worker
docker build -t telegram-worker .
docker run --env-file .env telegram-worker
```

## Usage

### Basic file operations

```php
use Illuminate\Support\Facades\Storage;

// Upload a file
Storage::disk('telegram')->put('documents/report.pdf', $fileContents);

// Upload from a stream
Storage::disk('telegram')->putStream('videos/clip.mp4', fopen('/path/to/file', 'r'));

// Check if file exists
$exists = Storage::disk('telegram')->exists('documents/report.pdf');

// Get file contents (downloads from Telegram)
$contents = Storage::disk('telegram')->get('documents/report.pdf');

// Get a public/signed download URL
$url = Storage::disk('telegram')->url('documents/report.pdf');

// Get file metadata
$size = Storage::disk('telegram')->size('documents/report.pdf');
$mime = Storage::disk('telegram')->mimeType('documents/report.pdf');

// Delete a file
Storage::disk('telegram')->delete('documents/report.pdf');
```

### Event listeners

```php
use Shamimstack\Tgsdk\Events\TelegramUploadCompleted;
use Shamimstack\Tgsdk\Events\TelegramUploadFailed;
```
// In EventServiceProvider or via Event::listen()
Event::listen(TelegramUploadCompleted::class, function ($event) {
    Log::info("File uploaded: {$event->path}", ['file_id' => $event->fileId]);
});

Event::listen(TelegramUploadFailed::class, function ($event) {
    Log::error("Upload failed: {$event->path}", ['error' => $event->error]);
});
```

### Available events

| Event | Triggered When |
|---|---|
| `TelegramUploadQueued` | File upload job dispatched to Redis |
| `TelegramUploadCompleted` | Upload confirmed successful |
| `TelegramUploadFailed` | Upload failed after all retries |
| `TelegramChunkCompleted` | Individual chunk upload confirmed |
| `TelegramChunkFailed` | Individual chunk upload failed |
| `TelegramUploadStalled` | Upload detected as stalled |
| `TelegramFileDeleted` | File record deleted |

## Configuration

Key configuration options in `config/telegram-storage.php`:

| Option | Default | Description |
|---|---|---|
| `channels` | `[]` | List of Telegram channel IDs for storage |
| `rotation_strategy` | `round-robin` | Channel selection: `round-robin`, `least-used`, `capacity-aware` |
| `chunk_threshold` | `1950000000` | File size (bytes) above which chunking activates |
| `chunk_size` | `1950000000` | Size of each chunk |
| `chunk_compression` | `false` | Enable gzip compression per chunk |
| `chunk_encryption` | `false` | Enable AES-256-GCM encryption per chunk |
| `download.signed_urls` | `false` | Enable signed download URLs |
| `download.url_ttl` | `3600` | Signed URL TTL in seconds |
| `cdn.enabled` | `false` | Enable CDN URL prefix |

## Architecture

```
Laravel App                    Python Worker
┌─────────────────┐           ┌──────────────────┐
│ Storage::put()  │           │ worker.py        │
│       │         │           │    │             │
│       ▼         │   Redis   │    ▼             │
│ TelegramStorage ├──────────►│ SessionPool      │
│   Adapter       │   Queue   │    │             │
│       │         │           │    ▼             │
│       ▼         │           │ uploader.py      │
│ Metadata DB     │◄──────────│    │             │
│                 │  Callback  │    ▼             │
└─────────────────┘           │ Telegram API     │
                              └──────────────────┘
```

## Testing

```bash
composer test
```

## License

MIT

