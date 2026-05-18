# laravel-n1-detector

**Production-safe N+1 query detector for Laravel.**

Detects N+1 patterns in live traffic using probabilistic sampling and SQL fingerprinting — no query logging, no privacy risk, no measurable overhead.

---

## The problem

Telescope and Debugbar catch N+1s in development. But what about the N+1 that slipped through in last Tuesday's deploy? Or the one that only manifests on large tenants with 500+ records? This package watches real production traffic and tells you when it finds one.

---

## How it works

1. On a sampled subset of requests, it hooks into `DB::listen()`.
2. Each query's literal values are stripped, leaving only its structural shape (the *fingerprint*).
3. If the same fingerprint fires ≥ N times in a single request, it's flagged as an N+1.
4. After the response is sent (`app()->terminating()`), alerts are dispatched — Slack, log, or your own handler.

Your SQL values never leave the process. Only fingerprints and counts are tracked.

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

---

## Installation

```bash
composer require mostafaarafat/laravel-n1-detector
```

Publish the config:

```bash
php artisan vendor:publish --tag=n1detector-config
```

---

## Configuration

Add to your `.env`:

```env
# Master switch. Defaults to true only in local environment.
N1_DETECTOR_ENABLED=true

# How many times the same query shape must fire to count as N+1.
N1_DETECTOR_THRESHOLD=5

# Fraction of requests to instrument. 0.05 = 5% in production.
N1_DETECTOR_SAMPLE_RATE=0.05

# Comma-separated alert channels: log, slack, null, custom
N1_DETECTOR_CHANNELS=log,slack

# Optional: Slack incoming webhook URL
N1_DETECTOR_SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Optional: Slack mention on alerts
N1_DETECTOR_SLACK_MENTION=@here
```

Full config reference is in `config/n1detector.php`.

---

## Usage

### Automatic (default)

The package auto-instruments all HTTP requests via the ServiceProvider. Zero code changes needed.

### Route-level middleware (selective)

```php
// routes/api.php
Route::middleware([\Mostafaarafat\N1Detector\Middleware\DetectN1Queries::class])
    ->group(function () {
        Route::get('/posts', [PostController::class, 'index']);
    });
```

### Queue jobs

Opt in via config:

```php
// config/n1detector.php
'watch_queue' => true,
```

### Artisan commands

```bash
# Check current configuration
php artisan n1:status

# Scan a model for N+1 (great for CI)
php artisan n1:scan "App\Models\Post" --limit=50 --threshold=3

# Simulate N+1 by intentionally lazy-loading a relation
php artisan n1:scan "App\Models\Post" --relation=comments --threshold=3
```

---

## Testing

Add the `AssertsNoN1Queries` trait to catch N+1s in your test suite — your first line of defence before production.

### With Pest

```php
uses(\Mostafaarafat\N1Detector\Testing\AssertsNoN1Queries::class);

it('loads posts index without N+1 queries', function () {
    Post::factory(20)->hasComments(5)->create();

    $this->assertNoN1Queries(
        fn() => $this->getJson('/api/posts'),
        threshold: 3,
    );
});

it('is fixed after adding eager loading', function () {
    Post::factory(20)->hasComments(5)->create();

    $this->assertNoN1Queries(function () {
        Post::with('comments')->get();
    });
});
```

### With PHPUnit

```php
use Mostafaarafat\N1Detector\Testing\AssertsNoN1Queries;

class PostIndexTest extends TestCase
{
    use AssertsNoN1Queries;

    public function test_no_n1_on_posts_index(): void
    {
        Post::factory(20)->hasComments(5)->create();

        $this->assertNoN1Queries(
            fn() => $this->getJson('/api/posts'),
            threshold: 3,
        );
    }
}
```

### Lower-level: inspect detections directly

```php
$detections = $this->runAndDetect(function () {
    $this->getJson('/api/posts');
}, threshold: 3);

expect($detections)->toHaveCount(0);
// or inspect each DetectionResult for custom assertions
```

---

## Custom alert channel

Implement `AlertChannelInterface` and register it:

```php
use Mostafaarafat\N1Detector\Contracts\AlertChannelInterface;
use Mostafaarafat\N1Detector\Data\DetectionResult;

class PagerDutyChannel implements AlertChannelInterface
{
    public function send(DetectionResult $detection): void
    {
        // fire your PagerDuty alert
        Http::post('https://events.pagerduty.com/v2/enqueue', [
            'routing_key'  => config('services.pagerduty.key'),
            'event_action' => 'trigger',
            'payload'      => [
                'summary'  => "N+1 detected: {$detection->fingerprint()}",
                'severity' => 'warning',
                'source'   => $detection->callerDescription(),
            ],
        ]);
    }
}
```

Then in `.env`:

```env
N1_DETECTOR_CHANNELS=log,custom
N1_DETECTOR_CUSTOM_CHANNEL=App\Alerting\PagerDutyChannel
```

---

## What it detects

```
# BEFORE — triggers N+1
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->author->name; // 1 query per post
}

# AFTER — no N+1
$posts = Post::with('author')->get();
foreach ($posts as $post) {
    echo $post->author->name; // 0 extra queries
}
```

The fingerprints for the bad case:
```
select * from `posts`                                   → 1 query
select * from `users` where `id` = ?                   → N queries  ← flagged
```

The fingerprint for the good case:
```
select * from `posts`                                   → 1 query
select * from `users` where `id` in (?)                → 1 query  ← safe
```

---

## Artisan scan output example

```
$ php artisan n1:scan "App\Models\Post" --threshold=3

Scanning App\Models\Post (limit: 50, threshold: 3)...

+---------------------+-------+
| Metric              | Value |
+---------------------+-------+
| Total queries fired | 53    |
| Unique query shapes | 3     |
| N+1 detections      | 1     |
| Threshold used      | 3     |
+---------------------+-------+

1 N+1 pattern(s) detected:

  [1] Fired 50x (threshold: 3)
       Shape:  select * from `users` where `id` = ?
       From:   App\Http\Controllers\PostController@index — app/Http/Controllers/PostController.php:34
       Fix:    Add ->with('user') to your query
```

---

## Production recommendations

| Environment | `sample_rate` | `threshold` | `channels`  |
|-------------|---------------|-------------|-------------|
| local       | `1.0`         | `2`         | `log`       |
| staging     | `1.0`         | `3`         | `log,slack` |
| production  | `0.05`        | `5`         | `log,slack` |

Set `deduplicate=true` (the default) in production. Without it, a single hot route with an N+1 will flood your Slack channel.

---

## Architecture

```
DB::listen()
    └── QueryFingerprinter      strips values → structural SQL shape
    └── RequestQueryStore       increments count per fingerprint (in-memory, no I/O)

app()->terminating()
    └── ThresholdAnalyzer       checks counts against threshold
    └── AlertDispatcher         fans out to LogChannel / SlackChannel / CustomChannel
```

The `record()` call is synchronous but does no I/O. All alerting happens after the response is sent.

---

## License

MIT
