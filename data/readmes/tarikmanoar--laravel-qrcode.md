Laravel QrCode
========================

![Tests](https://github.com/tarikmanoar/laravel-qrcode/actions/workflows/run-tests.yml/badge.svg)
[![Latest Stable Version](https://poser.pugx.org/tarikmanoar/laravel-qrcode/v/stable.svg)](https://packagist.org/packages/tarikmanoar/laravel-qrcode)
[![License](https://poser.pugx.org/tarikmanoar/laravel-qrcode/license.svg)](https://packagist.org/packages/tarikmanoar/laravel-qrcode)


[![GitHub stars](https://img.shields.io/github/stars/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub forks](https://img.shields.io/github/forks/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub watchers](https://img.shields.io/github/watchers/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub contributors](https://img.shields.io/github/contributors/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub issues](https://img.shields.io/github/issues/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub license](https://img.shields.io/github/license/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub last commit](https://img.shields.io/github/last-commit/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/tarikmanoar/laravel-qrcode?style=social)](https://github.com/tarikmanoar/laravel-qrcode)

## Installation

Compatible with **Laravel 8 – 13** on **PHP 8.0 – 8.5**

Run the following command to install the package:

```bash
composer require tarikmanoar/laravel-qrcode
```

## [Bangla](https://tarikmanoar.github.io/laravel-qrcode/docs/bn) | [Deutsch](https://tarikmanoar.github.io/laravel-qrcode/docs/de) | [Español](https://tarikmanoar.github.io/laravel-qrcode/docs/es) | [Français](https://tarikmanoar.github.io/laravel-qrcode/docs/fr) | [Italiano](https://tarikmanoar.github.io/laravel-qrcode/docs/it) | [Português](https://tarikmanoar.github.io/laravel-qrcode/docs/pt-br) | [Русский](https://tarikmanoar.github.io/laravel-qrcode/docs/ru) | [日本語](https://tarikmanoar.github.io/laravel-qrcode/docs/ja) | [한국어](https://tarikmanoar.github.io/laravel-qrcode/docs/kr) | [हिंदी](https://tarikmanoar.github.io/laravel-qrcode/docs/hi) | [简体中文](https://tarikmanoar.github.io/laravel-qrcode/docs/zh-cn) | [العربية](https://tarikmanoar.github.io/laravel-qrcode/docs/ar)

## Introduction

Laravel QrCode is an easy to use wrapper for the popular Laravel framework based on the great work provided by [Bacon/BaconQrCode](https://github.com/Bacon/BaconQrCode). We created an interface that is familiar and easy to install for Laravel users.

## Official Documentation

Documentation for Laravel QrCode can be found on our [website.](https://tarikmanoar.github.io/laravel-qrcode/docs/en)

## What's New

- **Laravel 13 & PHP 8.5** support (backward-compatible with Laravel 8–12 and PHP 8.0–8.4)
- **Hex color helpers** — `colorHex('#FF0000')`, `backgroundColorHex('#FFFFFF')`, `eyeColorHex(0, '#000', '#FFF')`
- **Base64 / Data URI output** — `generateBase64($text)` and `generateDataUri($text)` for inline `<img>` embedding
- **`reset()`** — restore the generator to its default state without reinstantiating
- **New data types** — `VCard`, `MeCard`, `Calendar`, `WhatsApp`, `OTP` (see docs for full details)

## Examples

![Example 1](docs/imgs/example-1.png) ![Example 2](docs/imgs/example-2.png)


## Contributing

Please submit all issues and pull requests to the [tarikmanoar/laravel-qrcode](https://github.com/tarikmanoar/laravel-qrcode) repository!

## License

This software is released under the [MIT license.](https://opensource.org/licenses/MIT)
