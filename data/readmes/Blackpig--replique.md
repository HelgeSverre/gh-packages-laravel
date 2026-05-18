# Réplique

[![Latest Version on Packagist](https://img.shields.io/packagist/v/blackpigcreatif/replique.svg?style=flat-square)](https://packagist.org/packages/blackpigcreatif/replique)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/blackpigcreatif/replique/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/blackpigcreatif/replique/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/blackpigcreatif/replique.svg?style=flat-square)](https://packagist.org/packages/blackpigcreatif/replique)

Réplique adds a fully-featured, polymorphic comment system to any Laravel/Filament application. Attach threaded comments, reactions, and a moderation workflow to any Eloquent model — with a Livewire front-end component and a complete Filament admin resource out of the box.

- **Polymorphic** — any model can accept comments; commentators and reactors are likewise polymorphic
- **Threaded replies** — configurable nesting depth (flat, one level, or unlimited)
- **Reactions** — configurable reaction types (like/dislike, or any custom set)
- **Moderation** — pending/approved/rejected/spam workflow with Filament resource, relation manager, and dashboard widget
- **Anonymous support** — optional unauthenticated commenting with name and email capture
- **Text modes** — plain, escaped HTML, or Markdown (via `league/commonmark`)
- **Security** — honeypot integration, per-IP rate limiting, IP blocking, and prompt-injection sanitisation
- **Atelier integration** — optional page-builder block for Réplique's sister package [Atelier](https://github.com/blackpig-creatif/atelier)

## Requirements

- PHP 8.2+
- Laravel 11 or 12
- Filament v5
- Livewire v3 or v4
- `spatie/laravel-honeypot` ^4.0

Optional:
- `league/commonmark` ^2.0 — required for the Markdown text mode

## Installation

```bash
composer require blackpig-creatif/replique
```

> **Important:** If you haven't already created a custom Filament theme, follow the [Filament theming docs](https://filamentphp.com/docs/styling/overview#creating-a-custom-theme) before proceeding. Réplique ships Blade views that must be picked up by Tailwind.

Add the package views to your theme's CSS source:

```css
@source '../../../../vendor/blackpig-creatif/replique/resources/**/*.blade.php';
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="replique-migrations"
php artisan migrate
```

Publish the config:

```bash
php artisan vendor:publish --tag="replique-config"
```

Optionally publish the views to customise the front-end:

```bash
php artisan vendor:publish --tag="replique-views"
```

Published views land in `resources/views/vendor/replique/livewire/`.

## Plugin Registration

Register `RepliquePlugin` in your Filament panel provider:

```php
use BlackpigCreatif\Replique\RepliquePlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            RepliquePlugin::make(),
        ]);
}
```

**Available plugin options:**

```php
RepliquePlugin::make()
    ->navigationGroup('Moderation')   // default: 'Comments'
    ->withDashboardWidget(),          // enable the pending-comments stats widget
```

## Making a Model Commentable

Add the `#[Commentable]` attribute and `HasComments` trait to any model:

```php
use BlackpigCreatif\Replique\Attributes\Commentable;
use BlackpigCreatif\Replique\Concerns\HasComments;

#[Commentable(label: 'Blog Post')]
class Post extends Model
{
    use HasComments;
}
```

The `label` parameter is optional and used for human-readable display in the admin panel. It falls back to the class basename if omitted.

Réplique automatically discovers commentable models at boot time by scanning `app_path()` for the `#[Commentable]` attribute. The result is cached indefinitely and cleared on `php artisan optimize:clear`.

**Models outside `app_path()`** (e.g. in a package) can be registered manually in the config:

```php
// config/replique.php
'commentable_models' => [
    \Some\Package\Article::class => 'Article',
],
```

To refresh the cache manually:

```bash
php artisan replique:discover
```

## Displaying Comments

Drop the Livewire component into any Blade view:

```blade
<livewire:replique::comments :model="$post" />
```

All parameters are optional and override their `config/replique.php` equivalents:

```blade
<livewire:replique::comments
    :model="$post"
    title="Leave a comment"
    :depth="2"
    :allow-anonymous="true"
    :require-auth="false"
    :require-approval="false"
    text-mode="markdown"
    :reaction-types="['like', 'dislike']"
    sort-order="desc"
    sort-by="created_at"
    :per-page="10"
/>
```

| Parameter | Type | Default (config) | Description |
|---|---|---|---|
| `model` | `Model` | — | **Required.** The commentable model instance |
| `title` | `string` | `'Comments'` | Section heading |
| `depth` | `int\|null` | `nesting_depth` | `0` = flat, `1` = one reply level, `null` = unlimited; omit to use config |
| `allow-anonymous` | `bool` | `allow_anonymous` | Allow unauthenticated submissions |
| `require-auth` | `bool` | `require_auth` | Force login before commenting |
| `require-approval` | `bool` | `require_approval` | Hold new comments for moderation |
| `text-mode` | `string` | `text_mode` | `plain`, `escaped_html`, or `markdown` |
| `reaction-types` | `array` | `reaction_types` | Reaction labels; empty array disables reactions |
| `sort-order` | `string` | `sort_order` | `asc` or `desc` |
| `sort-by` | `string` | `sort_by` | `created_at` or `reaction_count` |
| `per-page` | `int` | `per_page` | Pagination page size |

## Configuration

```php
// config/replique.php

return [

    // Anonymous commenting
    'allow_anonymous' => true,
    'require_auth'    => false,

    // Threaded replies: 0 = flat, 1 = one reply level, null = unlimited
    'nesting_depth' => 1,

    // Text processing: plain | escaped_html | markdown
    'text_mode' => 'escaped_html',

    // Moderation: hold all comments pending approval before display
    'require_approval' => false,

    // Reactions: empty array disables the feature entirely
    'reaction_types' => ['like', 'dislike'],

    // Rate limiting: max new comments per IP per minute
    'rate_limit' => 5,

    // Default sort
    'sort_order' => 'asc',  // asc | desc
    'sort_by'    => 'created_at',  // created_at | reaction_count

    // Pagination
    'per_page' => 20,

    // Strip prompt-injection patterns from submitted text
    'sanitise_injection' => true,

    'user_model'   => \App\Models\User::class,
    'table_prefix' => 'replique_',

    'filament_navigation_group' => 'Comments',

    // Manual registry supplement (see "Making a Model Commentable")
    'commentable_models' => [],

    'notifications' => [
        'on_new_comment'      => false,
        'on_approval_required' => false,
    ],

];
```

## Text Modes

| Mode | Behaviour |
|---|---|
| `plain` | `strip_tags()` — no formatting whatsoever |
| `escaped_html` | Tags stripped, special characters HTML-encoded — safe for output in any context |
| `markdown` | Converted via `league/commonmark`; raw HTML stripped; external links get `rel="nofollow ugc"` |

The `markdown` mode requires `league/commonmark`:

```bash
composer require league/commonmark
```

If the package is absent at runtime, Réplique falls back to `escaped_html`.

## Threaded Comments

Set `nesting_depth` in the config or override per-component:

```blade
{{-- flat thread --}}
<livewire:replique::comments :model="$post" :depth="0" />

{{-- one reply level (default) --}}
<livewire:replique::comments :model="$post" :depth="1" />

{{-- unlimited nesting --}}
<livewire:replique::comments :model="$post" :depth="null" />
```

Depth is stored on the comment record and enforced by the Livewire component — the reply button is hidden once the maximum depth is reached.

## Anonymous Comments

When `allow_anonymous` is `true` and the visitor is not authenticated, the comment form captures an optional name and email address alongside the comment text. The `require_auth` flag takes precedence: if set to `true`, anonymous posting is blocked regardless of `allow_anonymous`.

```php
// config/replique.php
'allow_anonymous' => true,
'require_auth'    => false,
```

To post a comment programmatically as anonymous:

```php
$post->comment('Nice article!', email: 'reader@example.com', name: 'A Reader');
```

## Reactions

Reactions are toggled by the Livewire component automatically. Each reaction type is a toggle: clicking once adds the reaction, clicking again removes it. One reaction per type per reactor is enforced at the database level.

To configure the available types:

```php
// config/replique.php
'reaction_types' => ['like', 'dislike'],  // default
'reaction_types' => ['heart'],            // single toggle reaction
'reaction_types' => [],                   // disable entirely
```

**Programmatic access:**

```php
$comment->react('like');               // toggle (adds if absent, removes if present)
$comment->reactionCount('like');       // int
$comment->reactionSummary();           // ['like' => 5, 'dislike' => 1]
```

### Reaction Icons

The config value (`'like'`, `'heart'`, etc.) is purely a database identifier. The rendered icon is controlled by the publishable `reaction-icon` Blade component. Four types ship with built-in Heroicon SVGs (outline when inactive, filled when active):

| Key | Icon |
|---|---|
| `like` | Hand thumb up |
| `dislike` | Hand thumb down |
| `star` | Star |
| `heart` | Heart |

Any type not in this list falls back to `ucfirst($type)` as text — so existing string-only configs continue to work.

**To use a custom SVG**, publish the component and add your type to the `$icons` map:

```bash
php artisan vendor:publish --tag="replique-views"
```

Then edit `resources/views/vendor/replique/components/reaction-icon.blade.php`:

```php
$icons = [
    'like'   => ['outline' => '<path .../>', 'solid' => '<path .../>'],
    'dislike' => [...],
    'fire'   => [
        'outline' => '<path stroke-linecap="round" stroke-linejoin="round" d="..." />',
        'solid'   => '<path d="..." />',
    ],
];
```

All SVGs use `currentColor` for both fill and stroke, so they inherit whatever text colour you apply to the button in `reactions.blade.php`. The active/inactive visual distinction is handled by swapping between the solid and outline variants — no additional CSS required.

## Posting Comments Programmatically

The `HasComments` trait exposes a `comment()` method:

```php
// Authenticated user (auto-resolved from Auth::user())
$post->comment('Great read.');

// Specific user
$post->comment('Great read.', $user);

// Anonymous
$post->comment('Great read.', email: 'anon@example.com', name: 'Anonymous');

// Reply to an existing comment
$post->comment('I agree!', parentId: $comment->id);

// Override text mode
use BlackpigCreatif\Replique\Enums\TextMode;

$post->comment('**Bold claim.**', textMode: TextMode::Markdown);
```

**Querying:**

```php
$post->comments;                          // all comments (MorphMany)
$post->comments()->approved()->get();
$post->comments()->topLevel()->get();     // excludes replies
$post->comments()->pending()->get();
```

## Moderation

### CommentResource

Réplique registers a full Filament resource at `Comments` (or whichever navigation group you configure). It provides:

- **Table** with status badge, text excerpt, commentator, reaction summary, IP address (hidden by default), and sortable timestamps
- **Filters** by status, commentable type, date range, and pending-only toggle; trashed filter for soft-deleted records
- **Row actions** — Approve, Reject, Mark as Spam, Reply (modal), Block IP (modal), Edit, Restore, Delete — grouped in an action menu
- **Bulk actions** — Approve, Reject, Mark as Spam, Restore, Delete all selected
- **Global search** across comment text, email, name, and IP

### CommentsRelationManager

Add inline comment management to any Filament resource that owns a commentable model:

```php
use BlackpigCreatif\Replique\Filament\RelationManagers\CommentsRelationManager;

public static function getRelations(): array
{
    return [
        CommentsRelationManager::class,
    ];
}
```

The relation manager exposes the same moderation actions as the main resource in a compact inline table.

### PendingCommentsWidget

Enable the dashboard stats widget via the plugin:

```php
RepliquePlugin::make()->withDashboardWidget()
```

The widget shows **Pending Review**, **Approved Today**, and **Spam Caught** counts and polls every 60 seconds.

### Comment Status Lifecycle

```
pending → approved
pending → rejected
pending → spam
approved → rejected
approved → spam
```

Moderation methods are available directly on the model:

```php
$comment->approve();
$comment->reject();
$comment->markAsSpam();
```

Each triggers the corresponding event (see [Events](#events)).

## IP Blocking

Block an IP address via the Filament admin (row action on any comment) or programmatically:

```php
use BlackpigCreatif\Replique\Facades\Replique;

Replique::blockIp('1.2.3.4', reason: 'Persistent spammer');
Replique::isBlocked('1.2.3.4'); // bool
```

Blocked IPs receive a generic error on any submission attempt. The `IpBlocked` event is dispatched when a block is created.

## Notifications

Réplique can notify a model's owner when a new comment is posted. Disabled by default:

```php
'notifications' => [
    'on_new_comment'       => true,
    'on_approval_required' => false,
],
```

When `on_new_comment` is `true`, Réplique resolves a notifiable via one of two mechanisms:

**1. Add `notifyOnComment()` to your model:**

```php
class Post extends Model
{
    use HasComments;

    public function notifyOnComment(): ?User
    {
        return $this->author; // notify whoever authored the post
    }
}
```

**2. Use a config resolver callable:**

```php
// config/replique.php
'notifications' => [
    'on_new_comment' => true,
    'notifiable_resolver' => fn ($commentable) => $commentable->owner,
],
```

If neither is present, no notification is sent.

## Events

| Event | Payload | Fired when |
|---|---|---|
| `CommentPosted` | `$comment` | Comment saved (any status) |
| `CommentApproved` | `$comment` | `$comment->approve()` called |
| `CommentRejected` | `$comment` | `$comment->reject()` called |
| `CommentMarkedAsSpam` | `$comment` | `$comment->markAsSpam()` called |
| `ReactionToggled` | `$comment`, `$type` | Reaction added or removed |
| `IpBlocked` | `$ip`, `$reason` | IP address blocked |

All events are in the `BlackpigCreatif\Replique\Events` namespace and implement `SerializesModels`.

## Security

**Honeypot** — the comment form includes a hidden honeypot field via `spatie/laravel-honeypot`. Bot submissions are silently marked as spam rather than rejected, to avoid tipping off scanners.

**Rate limiting** — Réplique uses Laravel's `RateLimiter` to cap submissions per IP. Default is 5 per minute, configurable via `rate_limit`.

**IP blocking** — blocked IPs are checked on every submission. Admins can block from any comment row in the Filament resource.

**Prompt injection sanitisation** — when `sanitise_injection` is `true`, known prompt-injection patterns (`ignore previous instructions`, `system:`, `[INST]`, etc.) are silently stripped before text is stored. This guards against attempts to poison any AI-assisted moderation or search features in your application.

**HTML safety** — all text modes guard against XSS. `escaped_html` encodes output; `plain` strips all tags; `markdown` runs `league/commonmark` with `html_input: strip` and the `DisallowedRawHtmlExtension` enabled.

## Artisan Commands

```bash
# Refresh the commentable model registry cache
php artisan replique:discover
```

Run this after adding a new `#[Commentable]` model if you want the admin panel to reflect the change without waiting for `optimize:clear`.

## Atelier Integration

If [Atelier](https://github.com/blackpig-creatif/atelier) is installed, Réplique automatically registers a **Comments (Réplique)** page-builder block. This lets editors drop a comments section onto any Atelier-managed page without touching a template.

See [docs/atelier-integration.md](docs/atelier-integration.md) for full details.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Blackpig Creatif](https://github.com/blackpig-creatif)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
