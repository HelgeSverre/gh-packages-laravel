# Помощник для Filament

[![Packagist Version](https://img.shields.io/packagist/v/maksde/helpers)](https://packagist.org/packages/maksde/helpers)
[![Packagist Downloads](https://img.shields.io/packagist/dt/maksde/helpers)](https://packagist.org/packages/maksde/helpers)
[![Packagist Dependency Version](https://img.shields.io/packagist/dependency-v/maksde/helpers/php)](https://packagist.org/packages/maksde/helpers)
[![Packagist Dependency Version](https://img.shields.io/packagist/dependency-v/maksde/helpers/filament%2Ffilament)](https://packagist.org/packages/maksde/helpers)
[![Packagist License](https://img.shields.io/packagist/l/maksde/helpers)](https://packagist.org/packages/maksde/helpers)


Шаблоны для Resource FilamentPhp которые помогут сократить код для базово используемых компонентов форм, просмотра записи, таблиц и фильтров таблиц.

## Установка

Установить пакет с помощью Composer:
```bash
composer require maksde/helpers
```

Опубликовать файл конфигурации:
```bash
php artisan vendor:publish --tag="helpers-config"
```

Опубликовать файлы перевода:
```bash
php artisan vendor:publish --tag="helpers-translations"
```

## Шаблоны:

* [Форм](documentation/forms.md)
* [Просмотр записи](documentation/infolists.md)
* [Таблиц](documentation/tables.md)
* [Действий таблицы](documentation/table-actions.md)
* [Фильтров таблиц](documentation/table-filters.md)
