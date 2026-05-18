# 🗃️ Laravel State History

A Laravel package for managing **enum-based model states** with enforced transitions and automatic history tracking.

## Features

- **Native PHP Enums** (PHP 8.2+)
- **Enforced Transitions** with a pluggable state machine
- **Automatic History** with metadata
- **Smart Casting** of historical `from`/`to` values (enums, dates, primitives, custom casts)
- **Atomic Operations** – state change + history in one transaction
- **Current State Columns** (`current_{field}`) for indexing & querying
- **Events, Guards & Effects** for lifecycle hooks
- **Laravel 11–13 Support**

## Installation

```bash
composer require nathandunn/laravel-state-history
php artisan vendor:publish --provider="NathanDunn\StateHistory\StateHistoryServiceProvider" --tag="migrations"
php artisan migrate
```

## Quick Start

### 1. Define States

```php
enum ArticleState: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
```

### 2. Create a State Machine

```php
use NathanDunn\StateHistory\Contracts\StateMachine;
use NathanDunn\StateHistory\TransitionMap;

class ArticleStateMachine implements StateMachine
{
    public function getTransitions(): TransitionMap
    {
        return TransitionMap::build(ArticleState::class)
            ->allowFromNull(ArticleState::Draft)
            ->allow(ArticleState::Draft, ArticleState::Published)
            ->allow(ArticleState::Published, ArticleState::Archived)
            ->allowAnyTo(ArticleState::Draft);
    }
}
```

### 3. Configure Your Model

```php
use NathanDunn\StateHistory\Traits\HasState;

class Article extends Model
{
    use HasState;

    protected $casts = [
        'state' => ArticleState::class,
    ];

    protected function stateMachine(): array
    {
        return ['state' => ArticleStateMachine::class];
    }
}
```

## Usage

### Transitions

```php
$article = Article::create(['state' => ArticleState::Draft]);

$article->transitionTo('state', ArticleState::Published, meta: [
    'editor' => 'alice'
]);
```

### Querying

```php
$published = Article::whereState('state', ArticleState::Published)->get();

if ($article->isInState('state', ArticleState::Published)) {
    // published
}

$allowed = $article->getAllowedTransitions('state');
```

### Current State

```php
$state = $article->getState('state');     // ArticleState::Published
$raw   = $article->getCurrentState('state'); // "published"
```

### History

```php
$history = $article->states('state');

foreach ($history as $h) {
    $from = $h->from; // Enum instance
    $to   = $h->to;
    $meta = $h->meta;
}
```

## Advanced

### Multiple State Fields

```php
class Order extends Model
{
    use HasState;

    protected $casts = [
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
    ];

    protected function stateMachine(): array
    {
        return [
            'status' => OrderStateMachine::class,
            'payment_status' => PaymentStateMachine::class,
        ];
    }
}
```

### Guards

```php
use NathanDunn\StateHistory\Contracts\Guard;

class PublishedArticleGuard implements Guard
{
    public function allows($model, $from, $to): bool
    {
        if ($to === ArticleState::Archived &&
            $model->published_at < now()->subDays(30)) {
            throw new \Exception('Must be published 30 days before archiving');
        }
        return true;
    }
}
```

### Effects

```php
use NathanDunn\StateHistory\Contracts\Effect;

class PublishEffect implements Effect
{
    public function execute($model, $from, $to): void
    {
        if ($to === ArticleState::Published) {
            $model->update(['published_at' => now()]);
        }
    }
}
```

### Events

- `StateTransitioning` – fired before a transition
- `StateTransitioned` – fired after success

```php
use NathanDunn\StateHistory\Events\StateTransitioned;

Event::listen(StateTransitioned::class, function ($event) {
    Log::info("Model {$event->model->id} {$event->from} → {$event->to}");
});
```

## Current State Columns

Optional `current_{field}` columns improve indexing & analytics.

```php
Schema::table('articles', function (Blueprint $t) {
    $t->string('current_state')->nullable()->index();
});
```

Config (`config/state-history.php`):

```php
return [
    'use_current_columns' => true,
    'prefix' => 'current_',
    'model' => \App\Models\CustomStateHistory::class,
];
```

## State Casting

History values auto-cast to configured types:

```php
foreach ($article->states('state') as $h) {
    $from = $h->from; // Enum
    $to   = $h->to;
}
```

Supports: **enums, dates, primitives, custom casts**.
