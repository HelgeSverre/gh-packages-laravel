# Laravel Markdown Emails

A Laravel package for generating beautiful emails using Markdown with dynamic content support, styled buttons, and comprehensive security features.

## Features

- =� **Markdown to HTML Email Conversion**: Convert Markdown content to beautifully styled HTML emails
- <� **Styled Button Components**: Pre-configured button types (Primary, Secondary, Success, Danger, Warning, Custom)
- = **Security First**: Built-in XSS protection, URL validation, and CSS sanitization
- =� **Database Integration**: Store and manage email templates in your database
- � **Laravel Integration**: Seamless integration with Laravel's mail system
- <� **Dynamic Content**: Support for variable substitution and Blade templating
- >� **Well Tested**: Comprehensive test suite with Pest

## Requirements

- PHP 8.1 or higher
- Laravel 10.0, 11.0, or 12.0
- League CommonMark 2.0+

## Installation

Install the package via Composer:

```bash
composer require uglydawg/laravel-markdown-emails
```

Publish the configuration and migration files:

```bash
php artisan vendor:publish --provider="uglydawg\LaravelMarkdownEmails\MarkdownEmailsServiceProvider"
```

Run the migrations:

```bash
php artisan migrate
```

## Quick Start

### 1. Create a Markdown Email Template

```php
use uglydawg\LaravelMarkdownEmails\MarkdownEmail;

$email = MarkdownEmail::create([
    'name' => 'welcome-email',
    'subject' => 'Welcome to Our Platform!',
    'content' => '# Welcome!

Thank you for joining us. Click below to get started:

{{ primary_button }}

If you have questions, feel free to reach out.

Best regards,  
The Team'
]);
```

### 2. Render and Send Email

```php
use uglydawg\LaravelMarkdownEmails\MarkdownEmailRenderer;
use uglydawg\LaravelMarkdownEmails\Enums\ButtonType;

$renderer = new MarkdownEmailRenderer(config('markdown-emails'));

// Create buttons
$primaryButton = $renderer->createButton(
    'Get Started', 
    'https://example.com/dashboard', 
    ButtonType::PRIMARY
);

// Render the email
$html = $renderer->render($email, [
    'primary_button' => $primaryButton
]);

// Send using Laravel's mail system
Mail::html($html, function ($message) {
    $message->to('user@example.com')
            ->subject('Welcome to Our Platform!');
});
```

## Button Types

The package includes several pre-styled button types:

```php
use uglydawg\LaravelMarkdownEmails\Enums\ButtonType;

// Available button types
ButtonType::PRIMARY    // Default primary action button
ButtonType::SECONDARY  // Secondary action button
ButtonType::SUCCESS    // Success/confirmation button
ButtonType::DANGER     // Destructive action button
ButtonType::WARNING    // Warning button
ButtonType::CUSTOM     // Custom styled button
```

### Button Usage Examples

```php
// Create different button types
$primaryBtn = $renderer->createButton('Sign Up', '/signup', ButtonType::PRIMARY);
$secondaryBtn = $renderer->createButton('Learn More', '/about', ButtonType::SECONDARY);
$successBtn = $renderer->createButton('Confirm', '/confirm', ButtonType::SUCCESS);
$dangerBtn = $renderer->createButton('Delete Account', '/delete', ButtonType::DANGER);
$warningBtn = $renderer->createButton('Proceed with Caution', '/warning', ButtonType::WARNING);

// Use in your markdown template
$variables = [
    'signup_button' => $primaryBtn,
    'learn_more_button' => $secondaryBtn,
    'user_name' => 'John Doe'
];

$html = $renderer->render($emailTemplate, $variables);
```

## Configuration

The package configuration file `config/markdown-emails.php` allows you to customize:

- Button styling for each button type
- Default email templates
- Markdown parsing options
- Security settings

### Button Styling Configuration

```php
'buttons' => [
    'primary' => [
        'background_color' => '#007bff',
        'text_color' => 'white',
        'padding' => '12px 24px',
        'border_radius' => '5px',
        'font_weight' => 'bold',
        'margin' => '10px 0',
    ],
    'custom' => [
        'background_color' => '#ff6b6b',
        'text_color' => '#ffffff',
        'padding' => '16px 32px',
        'border_radius' => '8px',
        'font_weight' => 'normal',
        'margin' => '15px 0',
    ]
]
```

## Security Features

This package includes comprehensive security protections:

### URL Validation
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`, `file:`, `about:`
- Allows safe protocols: `https:`, `http:`, `mailto:`, `tel:`, relative paths, anchors
- Automatically replaces unsafe URLs with `#`

### CSS Sanitization
- Prevents CSS injection in button styling
- Length limits on CSS values to prevent DoS attacks
- Whitelist-based approach for CSS properties

### XSS Protection
- HTML escaping for all user-provided content
- Safe rendering of dynamic variables
- Protection against script injection

## Database Schema

The package creates a `markdown_emails` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | string | Unique template identifier |
| subject | string | Email subject line |
| content | text | Markdown content |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

## Testing

Run the test suite:

```bash
# Run all tests
composer test

# Run tests with coverage
composer test-coverage

# Run tests in parallel
composer test-parallel
```

## Advanced Usage

### Custom Email Templates

You can create custom Blade templates for different email types:

```php
// Create a custom template
$renderer = new MarkdownEmailRenderer(config('markdown-emails'));
$html = $renderer->render($email, $variables, 'custom-email-template');
```

### Extending Button Types

Add custom button configurations in your config file:

```php
'buttons' => [
    'brand' => [
        'background_color' => '#your-brand-color',
        'text_color' => 'white',
        'padding' => '14px 28px',
        'border_radius' => '6px',
        'font_weight' => '600',
        'margin' => '12px 0',
    ]
]
```

## Contributing

Contributions are welcome! Please ensure that:

1. All tests pass: `composer test`
2. Code follows PSR-12 standards
3. New features include tests
4. Security considerations are addressed

## License

This package is open-sourced software licensed under the [GNU LGPL v3 license](LICENSE).

## Security

If you discover any security vulnerabilities, please send an email to the package maintainer. All security vulnerabilities will be promptly addressed.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Credits

- Package Author
- All Contributors

---

**Made with d for the Laravel community**