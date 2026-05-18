<a id="readme-top"></a>

# Laravel Passport

A lightweight and scalable PHP API request verification and response signature extension package.

[![GitHub Tag][GitHub Tag]][GitHub Tag URL]
[![Total Downloads][Total Downloads]][Packagist URL]
[![Packagist Version][Packagist Version]][Packagist URL]
[![Packagist PHP Version Support][Packagist PHP Version Support]][Repository URL]
[![Packagist License][Packagist License]][Repository URL]

<!-- TABLE OF CONTENTS -->
<details>
    <summary>Table of Contents</summary>
    <ol>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
        <li><a href="#contributing">Contributing</a></li>
        <li><a href="#contributors">Contributors</a></li>
        <li><a href="#license">License</a></li>
    </ol>
</details>

<!-- INSTALLATION -->

## Installation

You can install the package via [Composer]:

```bash
composer require jundayw/passport
```

### Publish Resources

Your users can also publish all publishable files defined by your package's service provider using the `--provider` flag:

```shell
php artisan vendor:publish --provider="Jundayw\Passport\PassportServiceProvider"
```

You may wish to publish only the configuration files:

```shell
php artisan vendor:publish --tag=passport-config
```

You may wish to publish only the migration files:

```shell
php artisan vendor:publish --tag=passport-migrations
```

### Run Migrations

```shell
php artisan migrate --path=database/migrations/2026_03_01_000000_create_passport_table.php
```

<p align="right">[<a href="#readme-top">back to top</a>]</p>

<!-- USAGE EXAMPLES -->

## Usage

### Passport

```php
$appId     = '202603161735';
$appSecret = '2f7b50c39cb5f4cf061b0ea433634287';
```

### Verification

```php
use Jundayw\Passport\Facades\Passport;

$passport = Passport::query(['foo' => 'bar']);

$passport->header($request->header());
$passport->query($request->query());
$passport->request($request->post());
$passport->request(['signature' => '51864429c137b125833e8969649e8371a97b61af875ddd09366676e7df236966']);

$passport->check($appId, 'sha256', 'signature', 'hash_hmac'); // true
```

### Signature

```php
use Jundayw\Passport\Facades\Passport;

$passport = Passport::response(['foo' => 'bar']);

// $passport->response(['signature' => null]);

$passport->signature($appId, 'sha256', 'signature', 'hash_hmac'); // 51864429c137b125833e8969649e8371a97b61af875ddd09366676e7df236966
$passport->withSignature($appId, 'sha256', 'signature', 'hash_hmac')->getResponse();
// [
//     'foo'       => 'bar',
//     'signature' => '51864429c137b125833e8969649e8371a97b61af875ddd09366676e7df236966',
// ];
```

### Extended custom signature

```php
use Jundayw\Passport\Contracts\Signer;
use Jundayw\Passport\Facades\Passport;

Passport::extend('AES', function () {
    return new class implements Signer {
        public function sign(string $algo, array $data, string $secret): string
        {
            // TODO: Implement sign() method.
        }

        public function verify(string $algo, array $data, string $signatureValue, string $secret): bool
        {
            // TODO: Implement verify() method.
        }
    };
});

$passport = Passport::request($request->post());
$passport->check($appId, 'AES-256-CBC', 'signature', 'AES'); // bool
```

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">[<a href="#readme-top">back to top</a>]</p>

<!-- CONTRIBUTORS -->

## Contributors

Thanks goes to these wonderful people:

<a href="https://github.com/jundayw/laravel-passport/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jundayw/laravel-passport" alt="contrib.rocks image" />
</a>

Contributions of any kind are welcome!

<p align="right">[<a href="#readme-top">back to top</a>]</p>

<!-- LICENSE -->

## License

Distributed under the MIT License (MIT). Please see [License File] for more information.

<p align="right">[<a href="#readme-top">back to top</a>]</p>

[GitHub Tag]: https://img.shields.io/github/v/tag/jundayw/laravel-passport

[Total Downloads]: https://img.shields.io/packagist/dt/jundayw/passport?style=flat-square

[Packagist Version]: https://img.shields.io/packagist/v/jundayw/passport

[Packagist PHP Version Support]: https://img.shields.io/packagist/php-v/jundayw/passport

[Packagist License]: https://img.shields.io/github/license/jundayw/laravel-passport

[GitHub Tag URL]: https://github.com/jundayw/laravel-passport/tags

[Packagist URL]: https://packagist.org/packages/jundayw/passport

[Repository URL]: https://github.com/jundayw/laravel-passport

[GitHub Open Issues]: https://github.com/jundayw/laravel-passport/issues

[Composer]: https://getcomposer.org

[License File]: https://github.com/jundayw/laravel-passport/blob/main/LICENSE
