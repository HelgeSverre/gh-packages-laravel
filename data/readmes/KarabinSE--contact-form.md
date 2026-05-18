
<!-- [<img src="https://github-ads.s3.eu-central-1.amazonaws.com/support-ukraine.svg?t=1" />](https://supportukrainenow.org) -->
# 🇺🇦

# Basic contact message used for public facing contact forms

[![Latest Version on Packagist](https://img.shields.io/packagist/v/karabinse/contact-form.svg?style=flat-square)](https://packagist.org/packages/karabinse/contact-form)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/karabinse/contact-form/run-tests?label=tests)](https://github.com/karabinse/contact-form/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/karabinse/contact-form.svg?style=flat-square)](https://packagist.org/packages/karabinse/contact-form)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require karabinse/contact-form
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="contact-form-config"
```

Publish the migration files with:

```bash
php artisan vendor:publish --tag="contact-form-migrations"
```

This is the contents of the published config file:

```php

return [
    'recipients' => [
        'example@example.com'
    ],

    'bcc_recipients' => ['fopper@ss.com'],

    'include_app_name' => true,

    'subject' => 'Nytt meddelande från hemsidan',

    'mail_view' => 'contact-form::emails.contact_plain',

    'mailable' => \KarabinSE\ContactForm\Mail\ContactMessage::class,

    'form_request_class' => \KarabinSE\ContactForm\Http\Requests\ContactMessageRequest::class,

    'validation_rules' => [
        'name' => 'required|max:125',
        'email' => 'required|max:125',
        'phone' => 'max:30',
        'message' => 'required|max:3000'
    ]
];

```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="contact-form-views"
```

## Testing

```bash
composer test
```

## Credits

- [Albin N](https://github.com/KarabinSE)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
