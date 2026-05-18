Laravel Model Status [![required php version](https://img.shields.io/packagist/php-v/open-southeners/laravel-model-status)](https://www.php.net/supported-versions.php) [![codecov](https://codecov.io/gh/open-southeners/laravel-model-status/branch/main/graph/badge.svg?token=39VRADWADD)](https://codecov.io/gh/open-southeners/laravel-model-status) [![Edit on VSCode online](https://img.shields.io/badge/vscode-edit%20online-blue?logo=visualstudiocode)](https://vscode.dev/github/open-southeners/laravel-model-status)
===

A very simple yet very integrated Laravel status package (now using native enums, no database required)

## Getting started

```
composer require open-southeners/laravel-model-status
```

### Create status enum

Imaging you've a `Post` model, you should then create an enum like `PostStatus` that might look like this one:

```php
use OpenSoutheners\LaravelModelStatus\ModelStatus;

enum PostStatus: int implements ModelStatus
{
    case Draft = 1;

    case Published = 2;

    case Hidden = 3;
}
```

Now remember to import `ModelStatus` interface and use it in the enum.

### Setup your model

Adding 3 things: The `ModelStatuses` PHP attribute, implementing `Statusable` interface to your class and using `HasStatuses` trait. 

```php
use OpenSoutheners\LaravelModelStatus\Attributes\ModelStatuses;
use OpenSoutheners\LaravelModelStatus\HasStatuses;
use OpenSoutheners\LaravelModelStatus\Statusable;

// Remember to replace PostStatus::class with whatever the enum you are using
// Also second option is a boolean that enable/disable events
#[ModelStatuses(PostStatus::class, true)]
class Post extends Model implements Statusable
{
    use HasStatuses;
}
```

### Available methods

#### setStatus

```php
$post = new Post();

// Set status to post instance
$post->setStatus(PostStatus::Published);

// Set status to post instance and persist to DB
$post->setStatus(PostStatus::Published, true);
```

#### setStatusWhen

```php
// Set status to post instance only when current status is "Draft"
$post->setStatusWhen(PostStatus::Draft, PostStatus::Published);

// Set status to post instance and persist to DB only when current status is "Draft"
$post->setStatusWhen(PostStatus::Draft, PostStatus::Published, true);
```

#### hasStatus

```php
// Check current status is "Published"
$post->hasStatus(PostStatus::Published);

// Check current status is "Published" as string (type sensitive)
$post->hasStatus('Published');
```

#### withoutStatusEvents

```php
// Whenever you save the model updates and don't want to trigger events
Post::withoutStatusEvents(fn () => $post->setStatus(PostStatus::Published));
```

### Model events

Right now this package offers a `OpenSoutheners\LaravelModelStatus\Events\StatusSwapped` event that you can use to get changes performed with `setStatusWhen` method.
