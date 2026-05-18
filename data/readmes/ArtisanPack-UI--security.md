# ArtisanPack UI Security

[![Latest Version on Packagist](https://img.shields.io/packagist/v/artisanpackui/security.svg?style=flat-square)](https://packagist.org/packages/artisanpackui/security)
[![Total Downloads](https://img.shields.io/packagist/dt/artisanpackui/security.svg?style=flat-square)](https://packagist.org/packages/artisanpackui/security)

A comprehensive security package for Laravel applications, specifically designed for the Digital Shopfront CMS. This package provides essential data sanitization and output escaping functions to protect against common web vulnerabilities like XSS attacks, SQL injection, and data corruption.

## Features

- **Comprehensive Sanitization**: Clean user input with specialized functions for emails, URLs, text, dates, and more
- **Context-Aware Escaping**: Safely escape output for HTML, attributes, URLs, JavaScript, and CSS contexts
- **HTML Filtering**: WordPress-style HTML filtering with `kses()` function
- **Laravel Integration**: Facade and global helper functions for easy usage
- **Battle-Tested**: Built on proven libraries like Laminas Escaper
- **Full Test Coverage**: Extensively tested for reliability

## Quick Start

### Installation

Install the package via Composer:

```bash
composer require ArtisanPackUI/security
```

### Basic Usage

Use the Security facade:
```php
use ArtisanPackUI\Security\Facades\Security;

// Sanitize input
$cleanEmail = Security::sanitizeEmail($userEmail);

// Escape output
echo Security::escHtml($userContent);
```

Or use global helper functions:
```php
// Sanitize input
$cleanEmail = sanitizeEmail($userEmail);

// Escape output
echo escHtml($userContent);
```

## Documentation

📚 **[Complete Documentation](docs/home.md)**

- **[Getting Started](docs/getting-started.md)** - Installation, setup, and basic usage
- **[API Reference](docs/api-reference.md)** - Complete function reference with examples
- **[Security Guidelines](docs/security-guidelines.md)** - Best practices and security considerations
- **[AI Guidelines](docs/ai-guidelines.md)** - Guidelines for AI code generation
- **[Contributing](docs/contributing.md)** - How to contribute to this project
- **[Changelog](docs/changelog.md)** - Version history and changes

## Available Functions

### Sanitization Functions
- `sanitizeEmail()` - Clean email addresses
- `sanitizeUrl()` - Sanitize URLs
- `sanitizeText()` - Remove HTML and clean text
- `sanitizeInt()` - Convert to safe integers
- `sanitizeArray()` - Recursively clean arrays
- And more...

### Escaping Functions
- `escHtml()` - HTML context escaping
- `escAttr()` - HTML attribute escaping
- `escUrl()` - URL escaping
- `escJs()` - JavaScript context escaping
- `escCss()` - CSS context escaping

### HTML Filtering
- `kses()` - WordPress-style HTML filtering

## Security

If you discover any security vulnerabilities, please follow our [security reporting guidelines](docs/contributing.md#security-contributions). Do not open public issues for security vulnerabilities.

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on how to contribute to this project.

## About Digital Shopfront CMS

This package is part of the ArtisanPack UI ecosystem for [Digital Shopfront CMS](https://gitlab.com/jacob-martella-web-design/digital-shopfront/digital-shopfront-core/digital-shopfront). Learn more about the full CMS in our [main documentation](https://gitlab.com/jacob-martella-web-design/digital-shopfront/digital-shopfront-core/digital-shopfront/-/wikis/home).

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).
