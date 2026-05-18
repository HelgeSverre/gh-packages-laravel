# Laravel MailBridge

[![Tests](https://github.com/ashraful19/laravel-mailbridge/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/ashraful19/laravel-mailbridge/actions/workflows/tests.yml)
[![Docs](https://github.com/ashraful19/laravel-mailbridge/actions/workflows/docs.yml/badge.svg?branch=main)](https://github.com/ashraful19/laravel-mailbridge/actions/workflows/docs.yml)
[![Latest Version](https://img.shields.io/packagist/v/ashraful19/laravel-mailbridge.svg)](https://packagist.org/packages/ashraful19/laravel-mailbridge)
[![PHP Version](https://img.shields.io/badge/php-%5E8.2-777bb4.svg)](composer.json)
[![Laravel Version](https://img.shields.io/badge/laravel-%5E12%7C%5E13-ff2d20.svg)](composer.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE.md)

Provider-neutral transactional and marketing email for Laravel 12+.

MailBridge keeps your application code stable while providers, SDKs, template ids, and marketing APIs vary behind adapters. Your app uses the same MailBridge methods while SendGrid, Amazon SES, Brevo, MailerSend, Resend, Postmark, Mailchimp, Kit, MailerLite, Mailgun, Mailjet, and AutoSend each run through their official SDKs internally.

## Documentation

Full docs: https://ashraful19.github.io/laravel-mailbridge/

Source docs:

- [Installation](docs/guide/installation.md)
- [Provider install](docs/guide/provider-install.md)
- [Laravel mail compatibility](docs/guide/laravel-mail.md)
- [Transactional email](docs/guide/transactional.md)
- [Hosted templates and provider-specific data](docs/guide/templates.md)
- [Marketing email](docs/guide/marketing.md)
- [Response shapes](docs/guide/responses.md)
- [Exception handling](docs/guide/exceptions.md)
- [Fallback](docs/guide/fallback.md)
- [Testing](docs/guide/testing.md)
- [Security](docs/guide/security.md)
- [Capabilities](docs/guide/capabilities.md)
- [Troubleshooting](docs/guide/troubleshooting.md)

## Quick Start

```bash
composer require ashraful19/laravel-mailbridge
php artisan vendor:publish --tag=mailbridge-config
php artisan mailbridge:install
```

`mailbridge:install` opens a terminal checklist so you can install one or more provider SDKs. The base package does not install every SDK.

Set runtime provider settings in `.env`:

```dotenv
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="Example App"
MAILBRIDGE_TRANSACTIONAL=brevo
MAILBRIDGE_MARKETING=mailerlite
BREVO_API_KEY=
SENDGRID_API_KEY=
SENDGRID_MARKETING_SENDER_ID=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
MAILERLITE_API_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_AUDIENCE_ID=
MAILCHIMP_TRANSACTIONAL_API_KEY=
KIT_API_KEY=
MAILJET_API_KEY=
MAILJET_SECRET_KEY=
AUTOSEND_API_KEY=
```

Optional: set provider-level sender defaults in `config/mailbridge.php` (for providers that should use a different sender than global `MAIL_FROM_*`):

```php
'providers' => [
    'postmark' => [
        'server_token' => env('POSTMARK_SERVER_TOKEN'),
        'from' => [
            'address' => env('POSTMARK_FROM_ADDRESS'),
            'name' => env('POSTMARK_FROM_NAME'),
        ],
    ],
],
```

Sender precedence is:
`->from(...)` at runtime -> `mailbridge.providers.<provider>.from` -> `mailbridge.from` (`MAIL_FROM_*`).

Configure template and list mappings in `config/mailbridge.php` (`templates`, `lists`).

## Basic Usage

Existing Laravel mail stays compatible:

```php
Mail::to($user)->send(new WelcomeMail($user));
```

Send a Laravel `Mailable` through MailBridge:

```php
MailBridge::transactional()
    ->to($user->email, $user->name)
    ->send(new WelcomeMail($user));
```

Send a provider-hosted template:

```php
MailBridge::transactional()
    ->template('welcome')
    ->to($user->email)
    ->data(['name' => $user->name])
    ->send();
```

Use provider-specific template data when providers expect different variable names:

```php
MailBridge::transactional()
    ->template('welcome')
    ->to($user->email)
    ->data(['name' => $user->name])
    ->dataFor('brevo', ['FIRSTNAME' => $user->name])
    ->dataFor('postmark', ['name' => $user->name])
    ->send();
```

Send through one provider for this request:

```php
MailBridge::transactional('postmark')
    ->withFallback(false)
    ->to($user->email)
    ->subject('Welcome')
    ->text('Hello')
    ->send();
```

Subscribe a marketing contact:

```php
use Ashraful19\LaravelMailbridge\Data\Subscriber;

MailBridge::marketing()
    ->list('signup')
    ->subscribe(Subscriber::make($user->email)->name($user->name));
```

Work with subscribers and campaigns using the same API across marketing providers:

```php
use Ashraful19\LaravelMailbridge\Data\Campaign;

MailBridge::marketing()
    ->list('signup')
    ->unsubscribe($user->email);

$subscriber = MailBridge::marketing()->getSubscriber($user->email);

$campaign = MailBridge::marketing()
    ->createCampaign(
        Campaign::make('Product Launch')
            ->subject('New release is live')
            ->html('<h1>Launch</h1>')
            ->list('signup')
    );
```

## Return Objects

Transactional send returns `SendResult`:

```php
$result = MailBridge::transactional()
    ->to($user->email)
    ->subject('Welcome')
    ->text('Hello')
    ->send();

$result->provider;  // string, selected provider name
$result->messageId; // ?string, provider message id when available
$result->metadata;  // array, provider-specific extra data
```

Marketing actions return `MarketingResult`:

```php
$result = MailBridge::marketing()
    ->list('signup')
    ->subscribe(Subscriber::make($user->email));

$result->provider;  // string
$result->operation; // string, e.g. subscribe, campaign_create
$result->metadata;  // array, provider-specific fields
```

Subscriber lookup returns `SubscriberRecord|null`:

```php
$record = MailBridge::marketing()->getSubscriber($user->email);

// null when subscriber not found
$record?->provider; // string
$record?->email;    // string
$record?->data;     // array, provider-native payload
```

## Providers

Provider SDKs are installed only when selected, and each install command uses the exact SDK version tested by MailBridge.

| Provider | Lane | Current adapter support | Install |
| --- | --- | --- | --- |
| SendGrid | Transactional + marketing | raw send, hosted templates, categories, custom args, contacts, lists, campaigns | `php artisan mailbridge:install sendgrid` |
| Amazon SES | Transactional | raw send, hosted templates, SES tags, raw MIME attachments | `php artisan mailbridge:install ses` |
| Brevo | Transactional + marketing | raw send, hosted templates, tags, subscribers, campaigns | `php artisan mailbridge:install brevo` |
| MailerSend | Transactional | raw send, hosted templates, personalization, tags | `php artisan mailbridge:install mailersend` |
| Resend | Transactional | raw send, template payload, tags/headers | `php artisan mailbridge:install resend` |
| Postmark | Transactional | raw send, hosted templates, tags, metadata, message streams | `php artisan mailbridge:install postmark` |
| Mailchimp | Transactional + marketing | Mailchimp Transactional sends, audiences, subscribers, tags, campaigns | `php artisan mailbridge:install mailchimp` |
| Kit | Marketing | subscribers, tags/forms/sequences, broadcasts | `php artisan mailbridge:install kit` |
| MailerLite | Marketing | subscribers, groups, fields, campaigns | `php artisan mailbridge:install mailerlite` |
| Mailgun | Transactional | raw send, hosted templates, tags, variables, metadata | `php artisan mailbridge:install mailgun` |
| Mailjet | Transactional + marketing | raw send, hosted templates, subscribers, lists, campaigns | `php artisan mailbridge:install mailjet` |
| AutoSend | Transactional + marketing | raw send, hosted templates, tags, metadata, contacts, lists, campaigns | No SDK required — uses REST API directly |

Run health checks anytime:

```bash
php artisan mailbridge:doctor
```

Smoke-test real provider APIs before releasing:

```bash
php artisan mailbridge:verify --provider=brevo --email=test@example.com --cleanup
```

## Features

Transactional email:

| Feature | Purpose |
| --- | --- |
| Raw HTML/text send | Send simple app-rendered messages without a Laravel `Mailable`. |
| Laravel `Mailable` send | Keep existing Laravel mail classes and route them through MailBridge. |
| Provider-hosted templates | Send by config alias with `template('welcome')` or direct id with `templateId(...)`. |
| Provider-specific template data | Use `data()` for common variables and `dataFor()` for provider overrides. |
| Recipients | Normalize `to`, `cc`, `bcc`, `from`, and `replyTo` across providers. |
| Attachments | Add files or raw data with `attach()` and `attachData()`. |
| Tags/categories | Attach provider analytics tags where supported. |
| Metadata/custom args | Attach safe message metadata for provider analytics and webhook correlation. |
| Provider override | Send one message through a specific provider without changing config. |
| Fallback control | Use `withFallback()` or `withFallback(false)` per send. |
| Testing fake | Assert transactional sends without touching provider APIs. |

Provider note: SendGrid, Brevo, and Mailjet marketing list IDs must be numeric. MailBridge validates these IDs before building provider payloads.

Marketing email currently implemented in the common API:

| Feature | Purpose |
| --- | --- |
| Subscriber subscribe | Create or update contacts where the provider endpoint supports it. |
| Subscriber unsubscribe | Remove a contact from a list or group. |
| Subscriber lookup/delete | Read or delete a marketing contact. |
| List/group subscribe | Subscribe contacts to configured list aliases. |
| Fields/attributes | Sync custom subscriber profile data. |
| Campaigns | Create, send, schedule, get, and delete campaign records where supported. |
| Provider override | Run one marketing operation through a specific provider. |
| Fallback control | Retry transient provider/network failures through configured fallbacks. |
| Testing fake | Assert marketing subscriptions without provider calls. |

## Why MailBridge

| Need | MailBridge behavior |
| --- | --- |
| Keep Laravel `Mailable` classes | `Mail::send()` still works; MailBridge can also send `Mailable` objects. |
| Avoid installing every SDK | Provider SDKs are optional and installed per provider. |
| Prevent surprise SDK breaks | Install commands use tested exact versions. |
| Use hosted templates | Send by `template('welcome')` alias or direct `templateId('...')`. |
| Switch provider per send | Pass provider name: `MailBridge::transactional('postmark')`. |
| Control fallback | Use `withFallback()` or `withFallback(false)` per send. |
| Test safely | Use `MailBridge::fake()` and assertions. |

## Exception Handling

MailBridge throws typed exceptions for common validation and configuration errors.
All validation-focused exceptions extend `MailbridgeValidationException`, so existing broad catches still work.

| Exception | Trigger |
| --- | --- |
| `MissingTransactionalRecipientException` | Transactional send has no `to()` recipient. |
| `TemplatePayloadConflictException` | `template()` + `templateId()` are both set, or template send is combined with a Laravel `Mailable`. |
| `MissingTransactionalContentException` | Non-template send has no `html()`, no `text()`, and no mailable content. |
| `MissingFromAddressException` | No sender address is available from `from()`, `mailbridge.providers.<provider>.from.address`, or `mailbridge.from.address`. |
| `MissingTemplateMappingException` | `template('alias')` has no usable provider mapping in `mailbridge.templates.<alias>.<provider>`. Empty values are treated as missing. |
| `UnknownProviderException` | Selected provider key does not exist in `mailbridge.providers`. |
| `UnknownDriverException` | Provider config uses an unsupported driver value. |

For full guidance and catch examples, see [Exception handling](docs/guide/exceptions.md).

## License

Laravel MailBridge is open-sourced software licensed under the [MIT license](LICENSE.md).
