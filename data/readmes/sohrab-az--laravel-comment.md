# 📦 Laravel Comment Package

A lightweight and flexible comment system for Laravel with support for nested replies, polymorphic relations, and status workflow.

## ✨ Features

- Nested comments (threaded replies)
- Polymorphic support (commentable)
- User or guest commenting
- Status workflow (pending, approved, rejected)
- Configurable max reply depth
- Clean service layer (CommentManager, CommentQuery)
- Fluent query builder for comments
- Simple trait integration

## 📦 Installation

Install via Composer:

```bash 
composer require sohrab-azinfar/comment
```

⚙️ Publish Config & Migrations

```bash
php artisan vendor:publish --tag=comment-config
php artisan migrate
```

⚙️ Configuration

`config/comment.php`

```php
return [
    'default_status' => \SohrabAzinfar\Comment\Enums\CommentStatusEnum::Pending->value,

    // Maximum depth of nested replies
    'depth' => 5,
];
```

## 🧠 Usage

Add Trait to your Model

```php
use SohrabAzinfar\Comment\Traits\HasComments;

class Post extends Model
{
    use HasComments;
}
```

## 💬 Creating Comments

### Create comment

```php
$post->addComment(
    body: 'This is a comment',
    author: auth()->user()
);
```

### Guest comment

```php
$post->addComment(
    body: 'Hello world',
    author: null,
    guest: [
        'name' => 'John',
        'email' => 'john@example.com'
    ]
);
```

## 🔁 Reply to a Comment

```php
$post->replyTo($comment, 'This is a reply', auth()->user());
```

## 🔍 Query Comments

```php
$comments = $post->queryComment()
    ->approved()
    ->roots()
    ->withReplies()
    ->get();
```

### Pagination

```php
$comments = $post->queryComment()->paginate(10);
```

## 🧾 Comment Status

```php
use SohrabAzinfar\Comment\Enums\CommentStatusEnum;

CommentStatusEnum::Pending;
CommentStatusEnum::Approved;
CommentStatusEnum::Rejected;
```

## ⚙️ Approve / Reject

```php
$post->approve($comment);
$post->reject($comment);
```

## 🧹 Delete Comment (with descendants)

```php
$post->deleteComment($comment);
```

## 🧱 Database Structure

The package creates a `comments` table with:

- Polymorphic relation (`commentable`)
- Optional author morph (`author`)
- Nested set support (tree structure)
- Status management
- Soft-style timestamps

## 🧠 Architecture

- `CommentManager` → write operations (create, reply, approve, reject, delete)
- `CommentQuery` → read/query layer
- `HasComments` → model integration layer
- `Comment` → core entity model
- `NestedSet` → tree handling (Kalnoy package)

## 🚀 Example

```php
$post = Post::find(1);

$comment = $post->addComment('Nice post!', auth()->user());

$post->replyTo($comment, 'Thanks!');
```

## 📌 Requirements

- PHP 8.1+
- Laravel 10+

## 📄 License

MIT License. Use freely in personal and commercial projects.