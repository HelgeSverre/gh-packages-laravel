# Laravel Translatable

A Laravel package for translating Eloquent model attributes.

| Branch  | Status | Code Coverage |
| :------------- | :------------- | :------------- |
| Main | ![tests](https://github.com/internetguru/laravel-translatable/actions/workflows/test.yml/badge.svg?branch=main) | ![coverage](https://raw.githubusercontent.com/internetguru/laravel-translatable/refs/heads/badges/main-coverage.svg) |
| Staging | ![tests](https://github.com/internetguru/laravel-translatable/actions/workflows/test.yml/badge.svg?branch=staging) | ![coverage](https://raw.githubusercontent.com/internetguru/laravel-translatable/refs/heads/badges/staging-coverage.svg) |
| Dev | ![tests](https://github.com/internetguru/laravel-translatable/actions/workflows/test.yml/badge.svg?branch=dev) | ![coverage](https://raw.githubusercontent.com/internetguru/laravel-translatable/refs/heads/badges/dev-coverage.svg) |

## Installation

1. Install the package via Composer:

    ```sh
    # First time installation
    composer require internetguru/translatable
    # For updating the package
    composer update internetguru/translatable
    ```

## Run Tests Locally

In Visual Studio Code you can simpy use `Ctrl+Shift+B` to run the tests.

To run the tests manually, you can use the following commands:

```sh
# Build the Docker image
docker build -t laravel-translatable .
# Run the tests
docker run --rm laravel-translatable
# Both steps combined
docker build -t laravel-translatable . && docker run --rm laravel-translatable
```

## Usage

1. Add the `Translatable` trait to your Eloquent model:

    ```php
    use InternetGuru\Translatable\Translatable;

    class Room extends Model
    {
        use Translatable;
    }
    ```
2. Define the translatable attributes in the model. Do not use `$fillable` for translatable attributes:

    ```php
    protected $translatable = ['name'];
    ```
3. Use translatable attributes:

    ```php
    app()->setLocale('en');
    app()->setFallbackLocale('en');

    $room = new Room();
    $room->save();

    // No translation set
    echo $room->name; // null

    $room->name = 'Living Room';
    echo $room->name; // Living Room

    app()->setLocale('cs');
    $room->name = 'Obývací pokoj';
    echo $room->name; // Obývací pokoj

    app()->setLocale('en');
    echo $room->name; // Living Room

    app()->setLocale('cs');
    echo $room->name; // Obývací pokoj

    // Fallback to the fallback locale
    app()->setLocale('de');
    echo $room->name; // Living Room

    // Fallback to the first translation if fallback locale not found
    app()->setFallbackLocale('fr');
    echo $room->name; // Living Room
    ```

## License & Commercial Terms

### License

Copyright © 2026 **Internet Guru**

This software is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](http://creativecommons.org/licenses/by-nc-sa/4.0/) license.

> **Disclaimer:** This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages or other liability.

### Commercial Use

The standard CC BY-NC-SA license prohibits commercial use. If you wish to use this software in a commercial environment or product, we offer **flexible commercial licenses** tailored to:

* Your company size.
* The nature of your project.
* Your specific integration needs.

**Note:** In many instances (especially for startups or small-scale tools), this may result in no fees being charged at all. Please contact us to obtain written permission or a commercial agreement.

**Contact for Licensing:** [info@internetguru.io](mailto:info@internetguru.io)

### Professional Services

Are you looking to get the most out of this project? We are available for:

* **Custom Development:** Tailoring the software to your specific requirements.
* **Integration & Support:** Helping your team implement and maintain the solution.
* **Training & Workshops:** Seminars and hands-on workshops for your developers.

Reach out to us at [info@internetguru.io](mailto:info@internetguru.io) — we are more than happy to assist you!
