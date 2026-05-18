<p align="center"><a href="https://fresns.org" target="_blank"><img src="https://assets.fresns.com/images/logos/fresns.png" width="300"></a></p>

<p align="center">
<img src="https://img.shields.io/badge/PHP-%5E7.0%7C%5E8.0-green" alt="PHP">
<img src="https://img.shields.io/badge/License-Apache--2.0-blue" alt="License">
</p>

## About DTO

Fresns **data transfer object** extension package for easy generation of data rules and inspection of transfer data. Works with **Laravel** projects.

- Guide: [https://pm.fresns.org/dto/](https://pm.fresns.org/dto/)

## Sponsors

Fresns is an Apache-2.0-licensed open source project with its ongoing development made possible entirely by the support of these awesome backers. If you'd like to join them, please consider [sponsoring Fresns development](https://github.com/sponsors/fresns).

## Install

To install through Composer, by run the following command:

```bash
composer require fresns/dto
```

## Generate DTO

```php
// Generate a new DTO (path: /app/DTO/)
php artisan make:dto BaseDTO

// Generate a new DTO(to the specified path)
php artisan make:dto BaseDTO --path /app/Fresns/Panel
```

See the Laravel documentation for the rules that can be used for validation.

- [https://laravel.com/docs/9.x/validation#available-validation-rules](https://laravel.com/docs/9.x/validation#available-validation-rules)
- [https://laravel.com/docs/10.x/validation#available-validation-rules](https://laravel.com/docs/10.x/validation#available-validation-rules)
- [https://laravel.com/docs/11.x/validation#available-validation-rules](https://laravel.com/docs/11.x/validation#available-validation-rules)

## Contributing

You can contribute in one of three ways:

1. File bug reports using the [issue tracker](https://github.com/fresns/dto/issues).
2. Answer questions or fix bugs on the [issue tracker](https://github.com/fresns/dto/issues).
3. Contribute new features or update the wiki.

*The code contribution process is not very formal. You just need to make sure that you follow the PSR-0, PSR-1, and PSR-2 coding guidelines. Any new code contributions must be accompanied by unit tests where applicable.*

## License

Fresns DTO is open-sourced software licensed under the [Apache-2.0 license](https://github.com/fresns/dto/blob/main/LICENSE).
