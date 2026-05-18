# Asset Optimise for Laravel

Asset Optimise is a powerful and lightweight Laravel package designed to enhance the performance of your web applications by optimizing front-end assets. This package automatically minifies HTML, CSS, and JavaScript code to reduce file sizes, improve page load times and save bandwidth.

## Key Features:

1. Minifies HTML, CSS, and JavaScript for faster loading. [Read More...](#enable)
2. Configurable to skip minification for [inline CSS](#skip-inline-css), [inline JavaScript](#skip-inline-javascript) and [HTML comments](#skip-html-comments).
3. Supports excluding specific sections of code from being minified using custom HTML comments. [Read More...](#skip-specific-sections-of-code)
4. Supports excluding specific routes urls paths from being minified. [Read More...](#skip-or-ignore-specific-routes-urls)
5. Configurable to skip minification for specific application Environment. [Read More...](#allowed-environments)
6. Easy integration with Laravel's middleware system. [Read More...](#register-the-middleware)
7. Supports Email (HTML, CSS, and JavaScript) minification. [Read More...](#enable-email-optimise)
8. JavaScript encryption with domains support for more security. [Read More...](#javascript-encrypt-domains)
9. Support multiple assets (CSS or JavaScript) merge and minify. [Read More...](#merge-and-minify-multiple-assets-css-or-javascript)
10. Support asset (CSS or JavaScript) minification. [Read More...](#minify-asset-css-or-javascript)
11. Provides an Artisan command to clear generated minified assets for storage management. [Read More...](#clear-minified-assets)
12. Configurable hashing strategy (filemtime or content-based) for reliable cache invalidation.
13. Extensible for future updates, including image compression and CDN integration.

## Installation

Asset Optimise for Laravel requires PHP 8.0 or higher. This particular version supports Laravel 9.x, 10.x, 11.x, 12.x and 13.x.

To get the latest version, simply require the project using [Composer](https://getcomposer.org):

```sh
composer require debjyotikar001/asset-optimise
```

## Configuration

Asset Optimise for Laravel supports optional configuration. To get started, you'll need to publish all vendor assets:

```sh
php artisan vendor:publish --provider="Debjyotikar001\AssetOptimise\AssetOptimiseServiceProvider"
```

This will create a `config/assetoptimise.php` file in your app that you can modify to set your configuration. Also, make sure you check for changes to the original config file in this package.

## Register the Middleware
In order to add asset optimization functionality in Laravel, you need to add the Minifier middleware.

### (Laravel 10 or older)
In `app/Http/Kernel.php` file:

```php
protected $middleware = [
  // other middleware
  \Debjyotikar001\AssetOptimise\Middleware\Minifier::class,
];
```
or 
```php
protected $middleware = [
  // other middleware
  'assetOptimise',
];
```
You can use the middleware class or middleware alias `assetOptimise` in web middleware or route.

### (Laravel 11 or newer)
In `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware) {
  $middleware->web(append: [
    // other middleware
    \Debjyotikar001\AssetOptimise\Middleware\Minifier::class,
  ]);
})
```
or 
```php
->withMiddleware(function (Middleware $middleware) {
  $middleware->web(append: [
    // other middleware
    'assetOptimise',
  ]);
})
```
You can use the middleware class or middleware alias `assetOptimise` in web middleware or route.

## Usage
This is how you can use AssetOptimise for Laravel in your project.

### Enable
You must set `true` on `enabled` in the `config/assetoptimise.php` file enable asset optimization functionality. For example:

```php
'enabled' => env('ASSETOPTIMISE_ENABLED', true),
```

### Allowed Environments
If you want to disable it in specific environments such as during local development or testing to simplify debugging. Then set environments values in a comma (`,`) separated string in the `config/assetoptimise.php` file, default `local,production,staging`. For example:

```php
'allowed_envs' => env('ASSETOPTIMISE_ALLOWED_ENVS', 'local,production,staging'),
```

### Skip specific sections of code
If you want to skip specific sections of code from being minified using `<!-- no-optimise --> ... <!-- /no-optimise -->` HTML comments. This sections supports HTML, CSS and JavaScript code. For example:

```html
<!-- no-optimise -->
<style>
  /* Don't optimise this CSS code */
  h1 {
    color: black;
    font-size: 40px;
  }

  p {
    color: red;
    font-size: 24px;
  }
</style>

<h1>Asset Optimise</h1>
<p>Don't optimise this HTML code</p>

<script>
  // Don't optimise this JavaScript code
  alert("Asset Optimise: Don't optimise this JavaScript code");
</script>
<!-- /no-optimise -->
```

### Skip Inline CSS
If you want to skip inline CSS (within `<style>` tags in your HTML) optimization. Then set `true` on `skip_css` in the `config/assetoptimise.php` file, default `false`. For example:

```php
'skip_css' => env('ASSETOPTIMISE_SKIP_CSS', true),
```

### Skip Inline JavaScript
If you want to skip inline JavaScript (within `<script>` tags in your HTML) optimization. Then set `true` on `skip_js` in the `config/assetoptimise.php` file, default `false`. For example:

```php
'skip_js' => env('ASSETOPTIMISE_SKIP_JS', true),
```

### Skip HTML Comments
If you want to skip all HTML comments from the output. Then set `true` on `skip_comment` in the `config/assetoptimise.php` file, default `false`. For example:

```php
'skip_comment' => env('ASSETOPTIMISE_SKIP_COMMENT', true),
```

### Skip or Ignore specific Routes Urls
If you want to skip or ignore specific routes urls, then you have to set paths in the `config/assetoptimise.php` file. You can use '*' as wildcard. For example:

```php
'skip_urls' => [
    '/',
    'about',
    'user/*',
    '*_dashboard',
    '*/download/*',
  ],
```
#### Example URLs:
- `/`: Home URL will be excluded from minification.
- `about`: This exact URL will be excluded from minification.
- `user/*`: Any URL starting with `user/` (like `user/profile`, `user/settings`) will be excluded.
- `*_dashboard`: Any URL ending with `_dashboard` (like `admin_dashboard`, `user_dashboard`) will be excluded.
- `*/download/*`: Any URL has `download` (like `pdf/download/001`, `image/download/debjyotikar001`) will be excluded.

### Enable Email Optimise
You must set `true` on `email_enabled` in the `config/assetoptimise.php` file to enable asset optimization functionality for emails. For example:

```php
'email_enabled' => env('ASSETOPTIMISE_EMAIL_ENABLED', true),
```

### JavaScript Encrypt Domains
Add domains in the `config/assetoptimise.php` file for more security, then encrypted JavaScript code will only work on those domains. For example:

```php
'js_encrypt_domains' => [
    'example.com',
    'example1.com',
    'example2.com',
  ],
```
#### Please Note:
- JavaScript encryption may slow down application performance.
- Large scripts can take longer to process.
- This may cause an error if the code is not written properly. Please use with caution!
- Although this can provide a high security level, a potentially thief can try to de-obfuscate and reach a closer code to the original one due to the public and open architecture of JavaScript.
- So it's not recommended to use this to protect sensitive information.

### Strict Hash Mode

This option controls how asset file hashes are generated.

When enabled, Asset Optimise will generate hashes based on the actual file contents using `md5_file()`. This guarantees that any change in file content will always produce a new optimized file, making it highly reliable across all environments. However, this approach requires reading file contents to generate hashes, which makes it slower than filemtime-based hashing.

When disabled (default), the package generates hashes using the file path and last modified time (`filemtime`). This approach is faster and reduces disk I/O, but may not detect changes in certain deployment environments where file timestamps are preserved (e.g., CI/CD pipelines, Docker builds, or zip deployments).

#### Example:

```php
'strict_hash' => env('ASSETOPTIMISE_STRICT_HASH', true),
```
#### Please Note:
- Use `false` (default) for local development and small projects where performance is preferred.
- Use `true` for production environments to ensure accurate cache invalidation and avoid stale assets, even though it introduces a slight performance overhead due to content-based hashing.

### Merge and Minify multiple assets (CSS or JavaScript)
You can use `minifyAssets()` helper function that allows you to merge and minify your multiple CSS or JavaScript files. This function will handle both `public` and `resources` directories, storing the final output file in your storage folder for optimized use. It reduces the number of HTTP requests and speeds up the loading of assets.

#### How It Works
The `minifyAssets()` helper function accepts three parameters:
- **File paths (array):** A list of CSS or JavaScript files that you want to merge and minify. The paths can be from both the `public` and `resources` directories.
- **File type (string):** Either `css` or `js`, specifying the type of files being merged.
- **Options (array, Optional):** This options array accepts several data:
  - **JavaScript encrypt (`'jsEncrypt'`):** Whether to encrypt JavaScript for extra security. Default is `false`.
  - **Cache time (`'ttl'`):** Time after which the merged file will be refreshed. Default is `7` days. [Learn More](#cache-time)
  - **Output File name (`'name'`):** The name of the final output file (without extension) that will be generated and stored. Default auto-generated File name.
  - **Version (`'version'`):** The version can be number (like `2`, `1.0.1`) or string (like `beta`, `testing`). Or it can be null.

##### Cache Time
Cache time can be in `minutes`, `hours`, `days`, `years`.
- **Format:** `{number}{unit}`
- **Units:**
  - `m` = minutes (max `1440` → `1` day)
  - `h` = hours   (max `720`  → `30` days)
  - `d` = days    (max `365`  → `1` year)
  - `y` = years   (max `5`    → `5` years)
- **Example:** `7d` → regenerates every `7` days

#### Example (CSS)

```html
<link rel="stylesheet" href="{{ minifyAssets(
  [
    'assets/css/custom.css',
    'core.css',
  ],
  'css',
  [
    'ttl' => '7d',
    'name' => 'merged-css',
    'version' => '1.0.1',
  ]
) }}"/>
```
The file paths can be from both the `public` and `resources/css` directories. It returns `merged-css_v101.min.css` file url.

#### Example (JS)

```html
<script src="{{ minifyAssets(
  [
    'assets/js/custom.js',
    'core.js',
  ],
  'js',
  [
    'jsEncrypt' => true,
    'ttl' => '1y',
    'name' => 'merged-js',
    'version' => 'beta',
  ]
) }}"></script>
```
The file paths can be from both the `public` and `resources/js` directories. It returns `merged-js_beta.min.js` file url. And it also encrypt the JavaScript code.

### Clear Minified Assets

Asset Optimise stores generated and merged minified assets inside the `storage/app/public/minified` directory. Over time, older or unused minified files may accumulate and increase storage usage. To clean up these files, Asset Optimise provides an Artisan command that allows you to remove minified assets safely.

#### Clear All Minified Assets

This command removes all generated minified assets (both CSS and JavaScript):

```sh
php artisan asset-optimise:clear-minified
```
#### Clear Only CSS Minified Assets

If you want to remove only minified CSS files:

```sh
php artisan asset-optimise:clear-minified css
```

#### Clear Only JavaScript Minified Assets

If you want to remove only minified JavaScript files:

```sh
php artisan asset-optimise:clear-minified js
```

This command is useful for periodic cleanup, storage management, or when deploying new versions of your assets.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.

## License

Asset Optimise is licensed under the [MIT license](LICENSE).

## Credits

This package uses the [hexydec/htmldoc](https://github.com/hexydec/htmldoc) library for HTML, CSS and JavaScript minification.

## Support

If you are having general issues with this package, feel free to contact us on [debjyotikar001@gmail.com](mailto:debjyotikar001@gmail.com)
