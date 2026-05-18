# Laravel NPS

A simple, focused NPS (Net Promoter Score) package for Laravel applications. Collect user feedback on a 0-10 scale with survey campaigns, cooldown logic, and dismissal tracking.

## Installation

```bash
composer require multek/laravel-nps
```

Publish the config and migrations:

```bash
php artisan vendor:publish --tag=nps-config
php artisan vendor:publish --tag=nps-migrations
php artisan migrate
```

## Setup

Add the `HasNpsResponses` trait to your User model:

```php
use Multek\Nps\Traits\HasNpsResponses;

class User extends Authenticatable
{
    use HasNpsResponses;
}
```

## Usage

### Creating a Survey

```php
use Multek\Nps\Models\NpsSurvey;

$survey = NpsSurvey::create([
    'name' => 'Q1 2026',
    'description' => 'Quarterly NPS survey',
    'is_active' => true,
]);
```

### Checking Eligibility

```php
$user->canAnswerNps(); // checks cooldown, dismissals, eligibility
$user->canAnswerNps($survey); // for a specific survey
```

### Recording Responses

```php
$response = $user->answerNps($survey, 9, 'Great service!', ['source' => 'web']);
```

### Dismissals

```php
$user->dismissNps($survey); // records dismissal with attempt tracking
```

### Using the Facade

```php
use Multek\Nps\Facades\Nps;

Nps::currentSurvey();           // active survey or null
Nps::forUser($user);            // survey data if eligible, null otherwise
Nps::respond($surveyId, 9);     // record response for auth user
Nps::score($survey);            // NPS score (-100 to 100)
Nps::stats($survey);            // {score, total, promoters, passives, detractors}
```

### Inertia Integration

Share NPS data via your `HandleInertiaRequests` middleware:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'nps' => fn () => \Multek\Nps\Facades\Nps::forUser($request->user()),
    ];
}
```

In your React component:

```tsx
const { nps } = usePage().props;
if (nps) {
    // Show NPS modal with nps.survey_id, nps.name, nps.description
}
```

### API Routes

Routes are disabled by default. Enable them in `config/nps.php`:

```php
'routes_enabled' => true,
```

| Method | URI | Description |
|--------|-----|-------------|
| GET | `/api/nps/current` | Get active survey for auth user |
| POST | `/api/nps/{survey}/respond` | Submit response |
| POST | `/api/nps/{survey}/dismiss` | Record dismissal |

### Events

| Event | When |
|-------|------|
| `NpsResponseSubmitted` | User submits a response |
| `NpsSurveyDismissed` | User dismisses the NPS prompt |
| `NpsSurveyCompleted` | Survey reaches end date (dispatch manually) |

```php
use Multek\Nps\Events\NpsResponseSubmitted;

Event::listen(NpsResponseSubmitted::class, function ($event) {
    if ($event->response->is_detractor) {
        // Alert customer success team
    }
});
```

## Configuration

See `config/nps.php` for all options including:

- `cooldown_days` — days between surveys (default: 90)
- `max_attempts` — max times to show after dismissals (default: 3)
- `attempt_intervals` — days between re-shows (default: [3, 7])
- `eligibility_check` — custom closure for additional eligibility logic

## License

MIT
