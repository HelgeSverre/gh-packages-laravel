# Make Eloquent models translatable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/esign/laravel-helpermodel-translatable.svg?style=flat-square)](https://packagist.org/packages/esign/laravel-helpermodel-translatable)
[![Total Downloads](https://img.shields.io/packagist/dt/esign/laravel-helpermodel-translatable.svg?style=flat-square)](https://packagist.org/packages/esign/laravel-helpermodel-translatable)
![GitHub Actions](https://github.com/esign/laravel-helpermodel-translatable/actions/workflows/main.yml/badge.svg)

This package allows you to make eloquent models translatable by using a seperate model for storing translations, e.g. `Post` and `PostTranslation`.

## Installation

You can install the package via composer:

```bash
composer require esign/laravel-helpermodel-translatable
```

The package will automatically register a service provider.

Next up, you can publish the configuration file:
```bash
php artisan vendor:publish --provider="Esign\HelperModelTranslatable\HelperModelTranslatableServiceProvider" --tag="config"
```

The config file will be published as `config/helpermodel-translatable.php` with the following content:
```php
return [
    /**
     * These are the default namespaces where the HelperModelTranslatable
     * looks for the helper models. You may pass in either a string
     * or an array, they are tried in order and the first match is used.
     */
    'model_namespaces' => ['App', 'App\\Models'],
];
```

## Usage

### Preparing your model
To make your model translatable you need to use the Esign\HelperModelTranslatable\HelperModelTranslatable trait on the model. Next up, you should define which fields are translatable by adding a public $translatable property.

```php
use Esign\HelperModelTranslatable\HelperModelTranslatable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HelperModelTranslatable;

    public $translatable = ['title'];
}
```

Next up, you may create a helper model just like you're used to:

```php
use Illuminate\Database\Eloquent\Model;

class PostTranslation extends Model
{
    ...
}
```

### Retrieving translations
To retrieve a translation in the current locale you may use the attribute you have defined in the `translatable` property. Or you could use the `getTranslation` method:
```php
$post->title
$post->getTranslation('title')
```

To retrieve a translation in a specific locale you may use the fully suffixed attribute or pass the locale to the `getTranslation` method:
```php
$post->getTranslation('title', 'nl')
```

To check if a translated attribute exists, you may use the `hasTranslation` method:
```php
PostTranslation::create(['language' => 'en', 'title' => 'Test en', 'tags' => ['🍎', '🍐', '🍋']]);
PostTranslation::create(['language' => 'nl', 'title' => null, 'tags' => []]);
PostTranslation::create(['language' => 'fr', 'title' => '']);

$post->hasTranslation('title', 'en'); // returns true
$post->hasTranslation('title', 'nl'); // returns false
$post->hasTranslation('title', 'fr'); // returns false
$post->hasTranslation('tags', 'en'); // returns true
$post->hasTranslation('tags', 'nl'); // returns false
```

In case you need to check if the actual translation model exists, you may use the `hasTranslationModel` method:
```php
PostTranslation::create(['language' => 'en']);

$post->hasTranslationModel('en'); // returns true
$post->hasTranslationModel('nl'); // returns false
```

To retrieve the actual translation model you may use the `getTranslationModel` method:
```php
$post->getTranslationModel();
$post->getTranslationModel('nl');
```

In case you do not supply a locale, the current locale will be used.

### Using a fallback
This package allows you to return the value of an attribute's `fallback_locale` defined in the `config/app.php` of your application.

The third `useFallbackLocale` parameter of the `getTranslation` method may be used to control this behaviour:
```php
PostTranslation::create(['language' => 'en', 'title' => 'Your first translation']);
PostTranslation::create(['language' => 'nl', 'title' => null]);

$post->getTranslation('title', 'nl', true); // returns 'Your first translation'
$post->getTranslation('title', 'nl', false); // returns null
```

Or you may use dedicated methods for this:
```php
PostTranslation::create(['language' => 'en', 'title' => 'Your first translation']);
PostTranslation::create(['language' => 'nl', 'title' => null]);

$post->getTranslationWithFallback('title', 'nl'); // returns 'Your first translation'
$post->getTranslationWithoutFallback('title', 'nl'); // returns null
```

You may configure the fallback locale by overwriting the `getFallbackLocale` method from the `HelperModelTranslatable` trait. The locale that was requested initially is passed as a parameter:
```php
use Esign\HelperModelTranslatable\HelperModelTranslatable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HelperModelTranslatable;

    public $translatable = ['title'];

    public function getFallbackLocale(?string $locale = null): ?string
    {
        return 'fr';
    }
}
```

### Customizing the relationship
By convention, this package assumes your helper model follows the same name of your main model suffixed by `Translation`, e.g. `Post` and `PostTranslation`.
This model is used to load the `translations` relationship that you may customize by either defining the model / foreign key or by overwriting the relationship alltogether.

```php
use Esign\HelperModelTranslatable\HelperModelTranslatable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HelperModelTranslatable;

    public $translatable = ['title'];

    protected function getHelperModelClass(): string
    {
        return CustomPostTranslation::class;
    }

    protected function getHelperModelForeignKey(): string
    {
        return 'custom_post_id';
    }
}
```

```php
use Esign\HelperModelTranslatable\HelperModelTranslatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HelperModelTranslatable;

    public $translatable = ['title'];

    public function translations(): HasMany
    {
        return $this->hasMany(PostTranslation::class);
    }
}
```

In case you need to customize the default relationship name you may do so by overwriting the `helperModelRelation` property on your model:

```php
use Esign\HelperModelTranslatable\HelperModelTranslatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HelperModelTranslatable;

    protected $helperModelRelation = 'otherTranslations';
    public $translatable = ['title'];
}
```

It's also possible to use a different relationship dynamically by using the `useHelperModelRelation` method:
```php
$post->useHelperModelRelation('secondaryTranslations')->getTranslation('title');
```

### Scopes
This package also ships with a few scopes that allow you to set constraints for the translations relationship:
```php
Post::whereTranslation('title', 'Post about dogs');
Post::whereTranslation('title', 'like', '%dogs%');
Post::whereTranslation('title', 'like', '%dogs%', 'nl');
Post::whereTranslation('title', 'like', '%dogs%', ['nl', 'en']);
Post::whereTranslation('title', 'like', '%dogs%')->orWhereTranslation('title', 'like', '%cats%');

Post::translatedIn('nl');
Post::translatedIn(['nl', 'en']);
Post::translatedIn('nl')->orTranslatedIn('en');
```

### Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
