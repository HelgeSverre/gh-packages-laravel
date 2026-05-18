# Laravel Ajax Builder

[![tests](https://github.com/takielias/laravel-ajax-builder/actions/workflows/tests.yml/badge.svg)](https://github.com/takielias/laravel-ajax-builder/actions/workflows/tests.yml)
[![lint](https://github.com/takielias/laravel-ajax-builder/actions/workflows/lint.yml/badge.svg)](https://github.com/takielias/laravel-ajax-builder/actions/workflows/lint.yml)
[![Latest Version](https://img.shields.io/packagist/v/takielias/lab?color=blue&label=release&style=for-the-badge)](https://packagist.org/packages/takielias/lab)
[![Total Downloads](https://img.shields.io/packagist/dt/takielias/lab.svg?color=rgb%28249%20115%2022%29&style=for-the-badge)](https://packagist.org/packages/takielias/lab)
[![PHP Version](https://img.shields.io/packagist/dependency-v/takielias/lab/php?style=for-the-badge)](https://packagist.org/packages/takielias/lab)
[![Laravel](https://img.shields.io/badge/Laravel-11%20%7C%2012%20%7C%2013-FF2D20?style=for-the-badge&logo=laravel)](https://packagist.org/packages/takielias/lab)
[![License](https://img.shields.io/packagist/l/takielias/lab?style=for-the-badge)](https://github.com/takielias/laravel-ajax-builder/blob/main/LICENSE.md)
[![Stars](https://img.shields.io/github/stars/takielias/laravel-ajax-builder?color=rgb%2806%20189%20248%29&label=stars&style=for-the-badge)](https://github.com/takielias/laravel-ajax-builder)
[![Forks](https://img.shields.io/github/forks/takielias/laravel-ajax-builder?color=rgb%28134%20115%2022%29&style=for-the-badge)](https://github.com/takielias/laravel-ajax-builder)
[![Issues](https://img.shields.io/github/issues/takielias/laravel-ajax-builder?color=rgb%28134%20239%20128%29&style=for-the-badge)](https://github.com/takielias/laravel-ajax-builder)
[![Linkedin](https://img.shields.io/badge/-LinkedIn-black.svg?logo=linkedin&color=rgba(235%2068%2050)&style=for-the-badge)](https://linkedin.com/in/takielias)

### Fluent AJAX response builder for Laravel — fetch + FormData on the client, no jQuery.

For an enhanced user experience, it is highly recommended to integrate this package with the [Laravel Tablar](https://github.com/takielias/tablar) admin dashboard.

## Requirements

| Component | Minimum |
|-----------|---------|
| PHP       | 8.3     |
| Laravel   | 11.x / 12.x / 13.x |
| Node      | 22 LTS (only needed if you bundle the JS helpers) |

## Installation

```bash
composer require takielias/lab
```

```bash
php artisan lab:install
```

Then build assets with your existing pipeline (`npm run build` for Vite,
or copy the published JS into your bundler entrypoint).

## JavaScript usage (no jQuery)

The package ships native `window.ajax*` helpers that wrap `fetch` +
`FormData`. The CSRF token is read from `<meta name="csrf-token">`
automatically.

```html
<form id="ajax-form" action="/products" method="POST">
    @csrf
    <input name="title" required>
    <button type="submit" class="ajax-submit-button">Save</button>
</form>

<script>
    // fired automatically when .ajax-submit-button is clicked, but you
    // can also call the helpers directly:
    document.getElementById('manual-trigger').addEventListener('click', () => {
        const data = new FormData(document.getElementById('ajax-form'));
        window.ajaxPost('/products', data,
            (response) => console.log('saved', response),
            (error)    => console.error('failed', error),
            ()         => console.log('done')
        );
    });
</script>
```

## Usage

Insert `@alert` where you want the alert messages to appear in your Blade file. And put your form submit button
as `@submit`

## Example

```php
<form class="card" action="{{route('product.save')}}" method="post">
    <div class="card-header">
        <h3 class="card-title">Slip form</h3>
    </div>
    <div class="card-body">
        @alert
        
      ...............
      ...............
      
    </div>
    <div class="card-footer text-end">
        @submit
    </div>
</form>

```

## Controller

```php
    function store(SaveProductRequest $saveProductRequest)
    {
        $validated = $saveProductRequest->validated();
        Product::create($validated);
        return Lab::setData(['success' => true])
            ->enableScrollToTop()
            ->setRedirect(route('product.index'))
            ->setSuccess('Product Created Successfully')
            ->setStatus(201)
            ->toJsonResponse();
    }
```

## Request

For request validation

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Takielias\Lab\Facades\Lab;

class SaveProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'price' => ['required', 'gt:0'],
            'name' => ['required']
        ];
    }

    protected function failedValidation($validator)
    {
        // Throw the HttpResponseException with the custom response
        throw new HttpResponseException(Lab::setStatus(422)
            ->enableScrollToTop()
            ->setValidationError($validator)->toJsonResponse());
    }
}

```

## Ajax Call

```js
    const productData = {
    product_name: 'Product Name'
    };
    const postUrl = '{{route('
    product.save
    ')}}';
    ajaxPost(postUrl, productData, function (response) {
        console.log(response.data)
    }, function (error) {
    
    }, function (data) {
    
    })
```

There are also some built in Method ajaxGet, ajaxPost, ajaxPut & ajaxPatch

## Change log

Please see the [changelog](changelog.md) for more information on what has changed recently.

## Testing

```bash
composer test
```

## Contributing

Please see [contributing.md](contributing.md) for details and a todolist.

## Security

If you discover any security related issues, please email taki.elias@email.com instead of using the issue tracker.

## Credits

- [Author Name][link-author]
- [All Contributors][link-contributors]

## License

MIT. Please see the [license file](license.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/takielias/lab.svg?style=flat-square

[ico-downloads]: https://img.shields.io/packagist/dt/takielias/lab.svg?style=flat-square

[ico-travis]: https://img.shields.io/travis/takielias/lab/master.svg?style=flat-square

[ico-styleci]: https://styleci.io/repos/12345678/shield

[link-packagist]: https://packagist.org/packages/takielias/lab

[link-downloads]: https://packagist.org/packages/takielias/lab

[link-travis]: https://travis-ci.org/takielias/lab

[link-styleci]: https://styleci.io/repos/12345678

[link-author]: https://github.com/takielias

[link-contributors]: ../../contributors
