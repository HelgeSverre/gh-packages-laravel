# Contact Form

Reusable Laravel package for storing contact form submissions with a status workflow, spam metadata, and soft deletes.

## Installation

```bash
composer require turtlebytes/contact-form
```

The service provider and facade are auto-discovered by Laravel.

### Publish config

```bash
php artisan vendor:publish --provider="TurtleBytes\ContactForm\ContactFormServiceProvider" --tag="contact-form-config"
```

### Publish migration

```bash
php artisan vendor:publish --provider="TurtleBytes\ContactForm\ContactFormServiceProvider" --tag="laravel-migrations"
php artisan migrate
```

## Basic Usage

### Submit a contact entry

```php
use TurtleBytes\ContactForm\ContactForm;

$submission = ContactForm::submit([
    'name' => 'Jane Doe',
    'email' => 'jane@example.com',
    'phone' => '555-1234',
    'subject' => 'Question about pricing',
    'message' => 'Can you share your team plan options?',
    'source' => 'website',
]);
```

### Submit via facade

```php
use TurtleBytes\ContactForm\Facades\ContactForm;

$submission = ContactForm::submit([
    'name' => 'John Smith',
    'email' => 'john@example.com',
    'message' => 'I need support with onboarding.',
]);
```

## Model

The package provides `TurtleBytes\ContactForm\Models\ContactSubmission` with:

- Status enum casting (`ContactStatus`)
- Spam tracking (`spam_score`, `spam_reasons`, `is_spam`)
- Lifecycle timestamps (`read_at`, `responded_at`)
- Soft deletes

### Stored fields

- `name`, `email`, `phone`, `subject`, `message`
- `status` (`new`, `read`, `responded`, `archived`, `spam`)
- `ip_address`, `user_agent`, `source`
- `spam_score`, `spam_reasons`, `is_spam`
- `internal_notes`
- `read_at`, `responded_at`, `responded_by`

## Status Workflow

`ContactStatus` values:

- `new`
- `read`
- `responded`
- `archived`
- `spam`

Workflow helpers on `ContactSubmission`:

```php
$submission->markAsRead();
$submission->markAsResponded(userId: 42);
$submission->markAsSpam();
$submission->archive();

if ($submission->isNew()) {
    // Handle unread submission
}
```

Behavior notes:

- `markAsRead()` only works when status is `new`.
- `markAsResponded()` sets `responded_at`, stores optional `responded_by`, and ensures `read_at` is set.
- `markAsSpam()` sets both status and `is_spam`.

## Query Scopes

```php
use TurtleBytes\ContactForm\Models\ContactSubmission;

$new = ContactSubmission::query()->new()->get();
$unresponded = ContactSubmission::query()->unresponded()->get();
$notSpam = ContactSubmission::query()->notSpam()->get();
$spam = ContactSubmission::query()->spam()->get();
```

## Spam Guard Integration Example

```php
use TurtleBytes\ContactForm\ContactForm;
use TurtleBytes\SpamGuard\Facades\SpamGuard;

$spam = SpamGuard::check([
    'email' => $request->string('email')->toString(),
    'name' => $request->string('name')->toString(),
    'message' => $request->string('message')->toString(),
    'subject' => $request->string('subject')->toString(),
    'ip_address' => $request->ip(),
]);

$submission = ContactForm::submit([
    'name' => $request->string('name')->toString(),
    'email' => $request->string('email')->toString(),
    'subject' => $request->string('subject')->toString(),
    'message' => $request->string('message')->toString(),
    'ip_address' => $request->ip(),
    'user_agent' => $request->userAgent(),
    'source' => 'website',
    'spam_score' => $spam->getScore(),
    'spam_reasons' => $spam->getReasons(),
    'is_spam' => $spam->isSpam(),
]);

if ($spam->isSpam()) {
    $submission->markAsSpam();
}
```

## Configuration

`config/contact-form.php`:

```php
return [
    'table' => 'contact_submissions',
];
```

## Testing

```bash
composer install
vendor/bin/pest
```

## License

MIT
