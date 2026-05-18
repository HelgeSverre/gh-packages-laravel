# Spam Guard

Extensible spam detection for Laravel with a rules pipeline, built-in heuristics, and optional database-backed learned patterns.

## Installation

```bash
composer require turtlebytes/spam-guard
```

The service provider and facade are auto-discovered by Laravel.

### Publish the config

```bash
php artisan vendor:publish --provider="TurtleBytes\SpamGuard\SpamGuardServiceProvider"
```

### Enable learned patterns (optional)

If you want database-backed pattern learning, publish and run the migration:

```bash
php artisan vendor:publish --provider="TurtleBytes\SpamGuard\SpamGuardServiceProvider" --tag="spam-guard-migrations"
php artisan migrate
```

Then enable it in `config/spam-guard.php`:

```php
'learned_patterns' => [
    'enabled' => true,
    'table'   => 'spam_patterns',
],
```

And add the rule to your pipeline:

```php
'rules' => [
    // ... other rules ...
    TurtleBytes\SpamGuard\Rules\LearnedPatternRule::class,
],
```

## Usage

### Quick Check

```php
use TurtleBytes\SpamGuard\Facades\SpamGuard;

$result = SpamGuard::check([
    'email'      => 'spammer@mailinator.com',
    'name'       => 'SEO Expert',
    'message'    => 'Buy backlinks now! Visit https://bit.ly/spam',
    'subject'    => 'Link exchange opportunity',
    'ip_address' => '1.2.3.4',
]);

$result->isSpam();    // true
$result->isSuspect(); // true
$result->getScore();  // 85.0
$result->getReasons();
// [
//     '[+40.0] Disposable email domain: mailinator.com',
//     '[+15.0] Contains spam keyword: backlinks',
//     '[+20.0] Contains spam keyword: link exchange',
//     '[+10.0] Contains URL shortener: bit.ly',
// ]
$result->getSummary();
// '[SPAM] Score: 85.0/100.0 (spam >= 70.0, suspect >= 40.0) - ...'
```

### Using the Fluent Builder

```php
use TurtleBytes\SpamGuard\SpamGuard;

$result = SpamGuard::make()
    ->addRule(new MyCustomRule())
    ->removeRule(\TurtleBytes\SpamGuard\Rules\MessageLengthRule::class)
    ->check([
        'email'   => $request->email,
        'name'    => $request->name,
        'message' => $request->message,
    ]);

if ($result->isSpam()) {
    // reject or flag the submission
}
```

### In a Controller

```php
use TurtleBytes\SpamGuard\Facades\SpamGuard;

class ContactController extends Controller
{
    public function store(ContactRequest $request)
    {
        $spam = SpamGuard::check($request->validated());

        if ($spam->isSpam()) {
            return back()->with('error', 'Your message was flagged as spam.');
        }

        // Store the contact with spam metadata
        Contact::create([
            ...$request->validated(),
            'spam_score' => $spam->getScore(),
            'is_spam'    => false,
        ]);

        return back()->with('success', 'Message sent!');
    }
}
```

## Architecture

### How It Works

Spam Guard runs input through a **pipeline of rules**. Each rule inspects the data and adds to a cumulative score (0-100). The final score determines if the input is spam, suspect, or clean.

```
Input Data → [Rule 1] → [Rule 2] → ... → [Rule N] → SpamAnalysis
                ↓           ↓                ↓
            +score       +score          +score
            +reason      +reason         +reason
```

### Built-in Rules

| Rule | What It Checks | Max Score |
|---|---|---|
| `DisposableEmailRule` | Throwaway email domains (mailinator, guerrillamail, etc.) | 40 |
| `SpamKeywordRule` | Weighted keyword matching in message and subject | 50 |
| `UrlAnalysisRule` | URL shorteners, multiple URLs, known spam domains | ~35 |
| `EmailPatternRule` | Suspicious email patterns (numbered suffixes, outreach+seo) | ~20 |
| `NameAnalysisRule` | Short names, ALL CAPS, HTML chars, URLs in name | ~40 |
| `MessageLengthRule` | Very short/long messages, excessive caps, bullet lists | ~25 |
| `NameEmailMismatchRule` | Generic email that doesn't match the sender's name | 8 |
| `LearnedPatternRule` | Database-backed patterns from past spam reports | ~50 |

### SpamAnalysis Object

The result of `check()` is a `SpamAnalysis` value object:

| Method | Returns | Description |
|---|---|---|
| `getScore()` | `float` | Current score (0-100) |
| `isSpam()` | `bool` | Score >= spam threshold (default 70) |
| `isSuspect()` | `bool` | Score >= suspect threshold (default 40) |
| `getReasons()` | `array` | List of scoring reasons with point values |
| `getSummary()` | `string` | Human-readable status summary |
| `getEmail()` | `string` | The analyzed email |
| `getName()` | `string` | The analyzed name |
| `getMessage()` | `string` | The analyzed message |
| `getSubject()` | `?string` | The analyzed subject |
| `getIpAddress()` | `?string` | The analyzed IP address |

## Custom Rules

Create your own rule by implementing the `Rule` contract:

```php
use TurtleBytes\SpamGuard\Contracts\Rule;
use TurtleBytes\SpamGuard\SpamAnalysis;

class HoneypotRule implements Rule
{
    public function analyze(SpamAnalysis $analysis): void
    {
        $honeypot = $analysis->getMetadata()['honeypot_field'] ?? '';

        if (!empty($honeypot)) {
            $analysis->addScore(100, 'Honeypot field was filled');
        }
    }
}
```

Register it globally in config:

```php
// config/spam-guard.php
'rules' => [
    \TurtleBytes\SpamGuard\Rules\DisposableEmailRule::class,
    \TurtleBytes\SpamGuard\Rules\SpamKeywordRule::class,
    // ...
    \App\SpamRules\HoneypotRule::class,
],
```

Or add it per-check:

```php
SpamGuard::make()
    ->addRule(new HoneypotRule())
    ->check($data);
```

## Learned Patterns

When enabled, the `LearnedPatternRule` uses a database table to track known spam patterns that improve over time.

### Teaching the system

```php
use TurtleBytes\SpamGuard\Models\SpamPattern;

// Learn from a spam report
SpamPattern::learn('email_domain', 'spammer.com', weight: 30);
SpamPattern::learn('ip_address', '1.2.3.4', weight: 20);
SpamPattern::learn('phrase', 'buy backlinks', weight: 10);

// Subsequent reports increment hit_count automatically
SpamPattern::learn('email_domain', 'spammer.com'); // hit_count → 2
```

### Pattern types

| Type | Example Pattern | Description |
|---|---|---|
| `email_domain` | `spammer.com` | Matches email domain |
| `ip_address` | `1.2.3.4` | Matches sender IP |
| `phrase` | `buy backlinks` | Matches text in message |

### Querying patterns

```php
use TurtleBytes\SpamGuard\Models\SpamPattern;

SpamPattern::blacklist()->ofType('email_domain')->get();
SpamPattern::whitelist()->get();
```

## Configuration

```php
// config/spam-guard.php

return [
    'threshold_spam'    => 70,    // Score >= this = spam
    'threshold_suspect' => 40,    // Score >= this = suspect
    'scale'             => 100,   // Maximum possible score

    'rules' => [
        // Rules run in order. Remove or reorder as needed.
        TurtleBytes\SpamGuard\Rules\DisposableEmailRule::class,
        TurtleBytes\SpamGuard\Rules\SpamKeywordRule::class,
        TurtleBytes\SpamGuard\Rules\UrlAnalysisRule::class,
        TurtleBytes\SpamGuard\Rules\EmailPatternRule::class,
        TurtleBytes\SpamGuard\Rules\NameAnalysisRule::class,
        TurtleBytes\SpamGuard\Rules\MessageLengthRule::class,
        TurtleBytes\SpamGuard\Rules\NameEmailMismatchRule::class,
    ],

    'learned_patterns' => [
        'enabled' => false,       // Requires migration
        'table'   => 'spam_patterns',
    ],

    'disposable_domains' => [
        // 20 known throwaway email providers
    ],

    'spam_keywords' => [
        // 50+ weighted keywords (score values on 0-100 scale)
        'seo' => 12.5,
        'backlink' => 15.0,
        'casino' => 20.0,
        // ...
    ],

    'suspicious_url_domains' => [
        // 15 known URL shorteners
    ],
];
```

## Testing

```bash
composer test
```

## License

MIT
