# SprintFlow

Laravel Package for speed up your project development

## Version Compatibility

| Laravel | Livewire | SprintFlow |
|:--------|:---------|:-----------|
| 10.x    | 2.x      | 1.x        |
| 10.x    | 3.x      | 2.x        |
| 11.x    | 3.x      | 3.x        |
| 12.x    | 3.x      | 4.x        |
| 12.x    | 4.x      | 5.x        |
| 13.x    | 4.x      | 5.x        |

## Installation

You can install the package via composer:

```bash
composer require ades4827/sprintflow
```

when used in tailwind is required to add this in config to load correct css class
```
module.exports = {
    content: [
        "./vendor/ades4827/sprintflow/resources/**/*.php",
    ],
}
```

For customization, you can publish with:

```bash
php artisan vendor:publish --tag=sprintflow-config
php artisan vendor:publish --tag=sprintflow-views
php artisan vendor:publish --tag=sprintflow-lang
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## General Features

- [Models](examples/Models/README.md)
- Blade utils [See usage example](examples/Blade/README.md)
- Ready to use [Casts](src/Casts)
- API generator for WireUi select [See usage example](examples/API/README.md)
- Permission management [See usage example](examples/Permission/README.md)
- Crud system [See usage example](examples/Crud/README.md)
- Datatable extension [See usage example](examples/Datatable/README.md)
- Log Monthly rotate [See usage example](examples/LogRotate/README.md)
- Make PDF from blade [See usage example](examples/ToPDF/README.md)

## Livewire Features

- Livewire validation for file upload [See usage example](examples/LivewireFileValidationTrait/README.md)
- Settings component [See usage example](examples/Setting/README.md)
- Livewire components [See usage example](examples/LivewireComponents/README.md)
- Media serve routing [See usage example](examples/Media/README.md)
- Livewire Media upload [See usage example](examples/LivewireUpload/README.md)


## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email michele@lucchina.com instead of using the issue tracker.

## Credits

-   [Michele Lucchina](https://github.com/ades4827)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
