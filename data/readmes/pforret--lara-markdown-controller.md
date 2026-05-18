# Laravel Markdown Folder Controller

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pforret/lara-markdown-controller.svg?style=flat-square)](https://packagist.org/packages/pforret/lara-markdown-controller)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/pforret/lara-markdown-controller/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/pforret/lara-markdown-controller/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/pforret/lara-markdown-controller/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/pforret/lara-markdown-controller/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/pforret/lara-markdown-controller.svg?style=flat-square)](https://packagist.org/packages/pforret/lara-markdown-controller)

Use this controller to easily map a folder full of Markdown documents to a web route, via a simple Controller. No database needed (no migrations). 

## Installation

You can install the package via composer:

```bash
composer require pforret/lara-markdown-controller
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="lara-markdown-controller-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="lara-markdown-controller-views"
```

## Usage

```php
// create a new ContentController that extends Pforret\LaraMarkdownController
namespace App\Http\Controllers
class FaqController extends Pforret\LaraMarkdownController
{
	public function __construct(){
		$this->setMarkdownRoot("pages/faq"); // relative to project root i.e. base_path()
		$this->setTitle("Frequently Asked Questions");
	}
}

// and add this to your routes/web.php
Route::resource('faq', FaqController::class)
    ->only(['index', 'show'])
    ->names("faq");

// now the /faq route will list all files and /faq/why will render the pages/faq/why.md with FrontMatter and Markdown->HTML conversion

```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Peter Forret](https://github.com/pforret)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
