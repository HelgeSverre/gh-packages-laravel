
# Custom Debugging Package for Laravel Octane

This package provides a custom debugging solution for Laravel applications using Octane, where traditional debugging tools like Xdebug might not be available. It allows developers to cache variables and view them in a modern, user-friendly web interface that updates every 5 seconds.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Cache Variables with `_debug()`](#cache-variables-with-_debug)
  - [Remove Cached Variables with `_forget()`](#remove-cached-variables-with-_forget)
  - [View Cached Variables](#view-cached-variables)
- [Full Example](#full-example)
- [Security Considerations](#security-considerations)
- [Customization](#customization)
- [Compatibility](#compatibility)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

---

## Introduction

This package offers a custom debugging solution for Laravel applications running with Octane, allowing developers to cache variables and display them in a modern, user-friendly web interface that automatically updates every 5 seconds.

## Features

- **Cache Variables:** Allows you to cache any variables for debugging purposes.
- **User-Friendly Web Interface:** View cached variables in a modern and easy-to-use web interface.
- **Automatic Refresh:** The interface updates every 5 seconds to display the latest values.
- **Easy Installation:** Simple installation via Composer.
- **Laravel Compatibility:** Supports Laravel 8.x, 9.x, 10.x, and 11.x.

## Installation

**Step 1:** Require the package using Composer.

```bash
composer require mconsult/anfi-debug
```

**Note:** Ensure your `composer.json` includes the repository if necessary.

**Step 2:** Publish the package assets.

```bash
php artisan vendor:publish --provider="ANFI\DebugPackage\DebugServiceProvider" --tag="public" --tag="views"
```

This command will copy the CSS files to your `public` directory and the views to your `resources/views/vendor` directory.

## Configuration

No additional configuration is required. The package automatically registers its Service Provider through Laravel's package discovery.

## Usage

### Cache Variables with `_debug()`

Use the global `_debug()` function to cache variables for debugging.

**Example:**

```php
// Cache variables
$key = _debug([
    'variable1' => $value1,
    'variable2' => $value2,
    // Add as many variables as needed
]);
```

- **Parameters:**
  - `array $variables`: An associative array of variables to cache.
  - `string $key` (optional): A custom key for the cache entry.

- **Returns:**
  - `string`: The key used to store the variables in the cache.

**Using a Custom Key:**

```php
$key = _debug($variables, 'my-custom-key');
```

### Remove Cached Variables with `_forget()`

To remove cached variables, use the global `_forget()` function.

**Example:**

```php
$success = _forget($key);

if ($success) {
    echo "Cache key '{$key}' has been removed.";
} else {
    echo "Cache key '{$key}' does not exist.";
}
```

- **Parameters:**
  - `string $key`: The key of the cached variables to remove.

- **Returns:**
  - `bool`: `true` if the key existed and was removed, `false` otherwise.

### View Cached Variables

Navigate to the following URL in your browser to view the cached variables:

```
http://your-app-url/debug/{key}
```

- Replace `{key}` with the key returned by the `_debug()` function.
  
**Example:**

```
http://localhost:8000/debug/debug-614c1b5e5f8b
```

The interface will display the cached variables and automatically refresh every 5 seconds to reflect any changes.

## Full Example

Here's a complete example of how to use the package:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExampleController extends Controller
{
    public function index()
    {
        $data = [
            'user' => auth()->user(),
            'settings' => config('app.settings'),
        ];

        // Cache variables for debugging
        $key = _debug($data);

        // Now, visit http://your-app-url/debug/{$key} to view the variables

        return view('welcome');
    }

    public function clearDebug()
    {
        $key = 'debug-614c1b5e5f8b2'; // Replace with your actual key

        $success = _forget($key);

        if ($success) {
            return redirect()->back()->with('status', "Debug cache '{$key}' has been cleared.");
        } else {
            return redirect()->back()->with('status', "Debug cache '{$key}' does not exist.");
        }
    }
}
```

## Security Considerations

- **Do Not Use in Production:** Ensure that the debug routes are not accessible in production environments, as they may expose sensitive data.
- **Route Protection:** Consider protecting the debug routes with authentication or by restricting access to certain IP addresses.

## Customization

- **CSS Styling:** You can modify the CSS file located at `public/vendor/debug-package/css/debug.css` to change the appearance of the debug interface.
- **Views:** The views are published to `resources/views/vendor/debug-package`. Feel free to customize them as needed.

## Compatibility

- **Laravel Versions:** This package supports Laravel 8.x, 9.x, 10.x, and 11.x.
- **PHP Versions:** Requires PHP 8.0 or higher.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## Contact

If you have any questions or need support, please open an issue on the [GitHub repository](https://github.com/MillerlandyConsult/anfi-debug).
