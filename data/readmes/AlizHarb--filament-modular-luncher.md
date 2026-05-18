# Filament Modular Luncher 🚀

[![Latest Version on Packagist](https://img.shields.io/packagist/v/alizharb/filament-modular-luncher.svg?style=flat-square)](https://packagist.org/packages/alizharb/filament-modular-luncher)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/alizharb/filament-modular-luncher/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/alizharb/filament-modular-luncher/actions?query=workflow%3ATests+branch%3Amain)
[![GitHub PHPStan Action Status](https://img.shields.io/github/actions/workflow/status/alizharb/filament-modular-luncher/phpstan.yml?branch=main&label=phpstan&style=flat-square)](https://github.com/alizharb/filament-modular-luncher/actions?query=workflow%3APHPStan+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/alizharb/filament-modular-luncher.svg?style=flat-square)](https://packagist.org/packages/alizharb/filament-modular-luncher)
[![Licence](https://img.shields.io/packagist/l/alizharb/filament-modular-luncher.svg?style=flat-square)](https://packagist.org/packages/alizharb/filament-modular-luncher)

**Filament Modular Luncher** is the ultimate module management solution for [Laravel Modular](https://github.com/AlizHarb/laravel-modular) applications. Seamlessly integrate module management into your Filament admin panel, allowing you to install, update, backup, and restore modules with a single click.

## ✨ Features

- 📦 **Seamless Integration**: Native Filament resource for managing modules.
- 🔍 **Module Discovery**: Automatically scans and lists all installed modules.
- ⬇️ **Multi-Source Installation**: Install modules from:
    - 📂 **Local ZIP Uploads**
    - 🔗 **Direct URLs** (ZIP)
    - 🐙 **GitHub Repositories** (Private & Public)
    - 🐘 **Composer Packages**
- 🔄 **Updates**: Update modules via Git pull or easy re-installation.
- 💾 **Backups**: Create and restore backups of your modules instantly.
- 🗑️ **Uninstallation**: Safe removal of modules and their assets.
- 🛠️ **Developer Friendly**: Built on strict PHP 8.3+ and Laravel 12 standards.

---

## 🌍 Ecosystem

Enhance your modular application with our official packages:

- **[Laravel Modular](https://github.com/AlizHarb/laravel-modular)**: Review the core package documentation.
- **[Laravel Hooks](https://github.com/AlizHarb/laravel-hooks)**: Specific modular hook system support.
- **[Filament Integration](https://github.com/AlizHarb/laravel-modular-filament)**: Seamless Filament admin panel integration in modules.
- **[Livewire Integration](https://github.com/AlizHarb/laravel-modular-livewire)**: First-class Livewire component support in modules.
- **[Laravel Themer](https://github.com/AlizHarb/laravel-themer)**: Advanced theme management system.

---

## 🚀 Installation

Install the package via Composer:

```bash
composer require alizharb/filament-modular-luncher
```

Register the plugin in your Filament Panel Provider:

```php
use AlizHarb\ModularLuncher\ModularLuncherPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugin(ModularLuncherPlugin::make());
}
```

That's it! You will now see a **Modules** resource in your admin panel.

---

## 🔧 Configuration

Publish the configuration file for customization:

```bash
php artisan vendor:publish --tag="modular-luncher-config"
```

### Configuration Options

- **`installation.git_binary`**: Path to your git binary.
- **`updates.github_token`**: Token for accessing private repositories.
- **`backups.disk`**: Storage disk for backups (default: `local`).

---

## 📖 Usage

### Installing a Module

1. Navigate to the **Modules** resource in your admin panel.
2. Click **Install Module**.
3. Choose your source (ZIP, URL, or Composer).
4. Fill in the required details and click **Install**.

### Managing Modules

- **Update**: Click the update action on any module table row.
- **Backup**: Select a module and click "Backup" to create a ZIP snapshot.
- **Restore**: Restore a module from a previous backup.
- **Uninstall**: Remove a module from your system.

---

## 💖 Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel Modular development. If you are interested in becoming a sponsor, please visit the [Laravel Modular GitHub Sponsors page](https://github.com/sponsors/alizharb).

---

## 🌟 Acknowledgments

- **Laravel**: For creating the most elegant PHP framework.
- **Filament**: For the amazing admin panel builder.
- **Spatie**: For setting the standard on Laravel package development.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🔒 Security

If you discover any security-related issues, please email **Ali Harb** at [harbzali@gmail.com](mailto:harbzali@gmail.com).

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

<p align="center">
    Made with ❤️ by <strong>Ali Harb</strong>
</p>
