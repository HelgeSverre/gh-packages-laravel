# NovaAjaxSelect

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gabrielesbaiz/nova-ajax-select.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-ajax-select)
[![Total Downloads](https://img.shields.io/packagist/dt/gabrielesbaiz/nova-ajax-select.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/nova-ajax-select)

Ajax select / child select package for Laravel Nova.

Original code from [alexwenzel/nova-ajax-select](https://github.com/alexwenzel/nova-ajax-select)

## Features

- ✅ Ajax populated select fields based on the values of other fields and when they change

## Installation

You can install the package via composer:

```bash
composer require gabrielesbaiz/nova-ajax-select
```

## Usage

```php
$novaAjaxSelect = new Gabrielesbaiz\NovaAjaxSelect();
echo $novaAjaxSelect->echoPhrase('Hello, Gabrielesbaiz!');
```

Specify a request url & optionally the `parent($attribute)` to watch & trigger the ajax select:

```php
use Gabrielesbaiz\NovaAjaxSelect\NovaAjaxSelect;;
```

```php
BelongsTo::make('Company'),

NovaAjaxSelect::make('User')
    ->get('/api/company/{company}/users')
    ->parent('company'),
```

Add the field for index & detail views display. NovaAjaxSelect is for forms only

```php
BelongsTo::make('User')->exceptOnForms(),
```

### Request Url:

In the above example, we say `company` is the parent.

The `{company}` url parameter will equal the selected `Company` field value.

### Response Format:

The select field expects a `value` & `display`. Map your results like so:

```php
Route::get('api/company/{company}/users', function($company_id) {

    $company = \App\Company::find($company_id);

    return $company->users->map(function($user) {
        return [ 'value' => $user->id, 'display' => $user->name ];
    });
})->middleware(['nova']);
```

### Make children depend on other children

`City` makes a request based on `State`, which makes a request based on `Country`:

```php
Select::make('Country')
    ->options([]),

NovaAjaxSelect::make('State')
    ->get('/api/country/{country}/states')
    ->parent('country'),

NovaAjaxSelect::make('City')
    ->get('/api/state/{state}/cities')
    ->parent('state'),
```

### Make multiple children depend on one parent

`File` & `Comment` will both make a request based on `Project`

```php
BelongsTo::make('Project'),

NovaAjaxSelect::make('File')
    ->get('/{project}/files')
    ->parent('project'),

NovaAjaxSelect::make('Comment')
    ->get('/{project}/comments')
    ->parent('project'),
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

- [alexwenzel](https://github.com/alexwenzel)
- [dillingham](https://github.com/dillingham)
- [Gabriele Sbaiz](https://github.com/gabrielesbaiz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
