# Joy VoyagerUserSettings

This [Laravel](https://laravel.com/)/[Voyager](https://voyager.devdojo.com/) module adds VoyagerUserSettings support to Voyager.

By 🐼 [Ramakant Gangwar](https://github.com/rxcod9).

[![Screenshot](https://raw.githubusercontent.com/rxcod9/joy-voyager-user-settings/main/cover.jpg)](https://joy-voyager.kodmonk.com/)

[![Latest Version](https://img.shields.io/github/v/release/rxcod9/joy-voyager-user-settings?style=flat-square)](https://github.com/rxcod9/joy-voyager-user-settings/releases)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/rxcod9/joy-voyager-user-settings/run-tests.yml?branch=main&label=tests)
[![Total Downloads](https://img.shields.io/packagist/dt/joy/voyager-user-settings.svg?style=flat-square)](https://packagist.org/packages/joy/voyager-user-settings)

---

## Prerequisites

*   Composer Installed
*   [Install Laravel](https://laravel.com/docs/installation)
*   [Install Voyager](https://github.com/the-control-group/voyager)

---

## Installation

```bash
# 1. Require this Package in your fresh Laravel/Voyager project
composer require joy/voyager-user-settings

# 2. Publish
php artisan vendor:publish --provider="Joy\VoyagerUserSettings\VoyagerUserSettingsServiceProvider" --force
# 3. Migrate
php artisan migrate
# 4. Generate Permissions
php artisan db:seed --class="\Joy\VoyagerUserSettings\Database\Seeders\UserSettingsPermissionsTableSeeder"
# 5. Attach Permissions with roles
php artisan db:seed --class=PermissionRoleTableSeeder
# 6. Seed user setting types
php artisan db:seed --class="\Joy\VoyagerUserSettings\Database\Seeders\UserSettingsTableSeeder"
```

---


## Working Example

You can try laravel demo here [https://joy-voyager.kodmonk.com/admin/users/1/user-settings](https://joy-voyager.kodmonk.com/admin/users/1/user-settings).

## Documentation

Find yourself stuck using the package? Found a bug? Do you have general questions or suggestions for improving the joy voyager-user-settings? Feel free to [create an issue on GitHub](https://github.com/rxcod9/joy-voyager-user-settings/issues), we'll try to address it as soon as possible.

If you've found a bug regarding security please mail [gangwar.ramakant@gmail.com](mailto:gangwar.ramakant@gmail.com) instead of using the issue tracker.

## Testing

You can run the tests with:

```bash
vendor/bin/phpunit
```

## Upgrading

Please see [UPGRADING](UPGRADING.md) for details.

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email [gangwar.ramakant@gmail.com](mailto:gangwar.ramakant@gmail.com) instead of using the issue tracker.

## Credits

- [Ramakant Gangwar](https://github.com/rxcod9)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
