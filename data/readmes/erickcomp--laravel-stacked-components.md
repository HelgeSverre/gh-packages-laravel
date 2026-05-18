<p align="center">
    <a href="https://packagist.org/packages/erickcomp/laravel-stacked-components"><img src="https://img.shields.io/packagist/v/erickcomp/laravel-stacked-components" alt="Latest Stable Version"></a>
    <a href="https://packagist.org/packages/erickcomp/laravel-stacked-components"><img src="https://img.shields.io/packagist/dt/erickcomp/laravel-stacked-components" alt="Total Downloads"></a>
    <a href="https://packagist.org/packages/erickcomp/laravel-stacked-components"><img src="https://img.shields.io/packagist/l/erickcomp/laravel-stacked-components" alt="License"></a>
</p>

# Use Blade Components syntax to insert (push/prepend) content to stacks

This package provides some blade components that you can use to insert content into stacks, most notably, scripts and styles.

## The vanilla-Blade way

To push some JS file/code to a stack, you have to ([from Laravel docs](https://laravel.com/docs/11.x/blade#stacks)):
```blade
@push('scripts')
    <script src="{{ asset("/example.js") }}"></script>
@endpush
```

or, for inline JS:

```blade
@push('scripts')
    <script>
        document.addEventListener("DOMContentLoaded", (event) => {
            alert("Alert 2!!!");
        });
    </script>
@endpush
```

It, of course, works. But when using Blade Components, the intention is stay closer to HTML whenever possible

## The Stacked Components Ways
####JS component:
```blade
<x-js src="/example.js" stack="scripts"/>
```

or, for inline JS:

```blade
<x-js stack="scripts">
    document.addEventListener("DOMContentLoaded", (event) => {
        alert("Alert 2!!!");
    });
</x-js>
```

This package automatically calls Laravel's ```asset``` function by default. You can override this behavior to call you own callable or to call nothing at all.
To do either of these, you can set the environment variable
```ini
STACKED_ASSETS_COMPONENTS_DEFAULT_ASSET_FUNCTION
```
or the config value
```ini
stacked-components.asset-function
```

To call any callable, you can use one of the following options the [PHP's callable syntax](https://www.php.net/manual/en/language.types.callable.php) or the Laravel's "@" syntax (```MyNamespace\MyClass@myAssetFunction```).
To call no function by default you must set the config value or the environment variable with the value <b><u>false</u></b>.

Note that if decide to use objects (anonoymous functions, invokable objects, first-class callables), you won't be able to use Laravel's config cache,
since it does not support cache for these types of config values.


#### Content component:
```blade
<x-stacked-component stack="scripts">
    <script src="/example.js"></script>
</x-stacked-component>
```
or, for inline JS:

```blade
<x-stacked-content stack="scripts">
    <script src="/example.js">
                  document.addEventListener("DOMContentLoaded", (event) => {
                          alert("Alert 2!!!");
                  });
    </script>
</x-stacked-content >
```
#### Other components
This package provides 4 components

* js
* css
* stacked-div
* stacked-content

For the CSS and JS components, you can set a default stack in config/env and omit it when using the component, like this:

.env file:
```ìni
STACKED_ASSETS_COMPONENTS_DEFAULT_STACK_JS="scripts"
STACKED_ASSETS_COMPONENTS_DEFAULT_STACK_CSS="styles"
```

and in your view file:
```blade
<x-js src="/example.js" />
```

### Resolving name collisions with other components
This package provides the js and the css components. If your app already defined this, or even a library you're using did this, you have 2 options:

1 - Register a namespace for the components of this package. To do so, you can set the environment variable
```ini
STACKED_ASSETS_COMPONENTS_COMPONENT_NAMESPACE
```
or the config value
```ini
stacked-components.component-namespace
```

If you set the namespace with the bool value "true", it will use the namespace "stacked". If you set it to any string, the set string will be used as the blade components namespace. For more information on components namespaces check the [Laravel docs](https://laravel.com/docs/packages#autoloading-package-components)

2 - Set the config values
```ini
stacked-components.component-name-js
stacked-components.component-name-css
```
or the environment variables
```ini
STACKED_ASSETS_COMPONENTS_COMPONENT_NAME_JS
STACKED_ASSETS_COMPONENTS_COMPONENT_NAME_CSS
```
To specify alternate names for the js and css components

Remember to clear the views caches when changing any of these values.
To clear the view cache run the view:cache artisan command:

```shell
php artisan view:clear
```

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
