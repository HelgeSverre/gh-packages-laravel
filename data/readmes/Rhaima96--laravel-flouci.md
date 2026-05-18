# Laravel Flouci

[![Tests](https://github.com/Rhaima96/laravel-flouci/actions/workflows/tests.yml/badge.svg)](https://github.com/Rhaima96/laravel-flouci/actions/workflows/tests.yml)
[![Latest Stable Version](https://img.shields.io/packagist/v/rhaima/laravel-flouci.svg)](https://packagist.org/packages/rhaima/laravel-flouci)
[![Total Downloads](https://img.shields.io/packagist/dt/rhaima/laravel-flouci.svg)](https://packagist.org/packages/rhaima/laravel-flouci)
[![License](https://img.shields.io/packagist/l/rhaima/laravel-flouci.svg)](https://packagist.org/packages/rhaima/laravel-flouci)

`rhaima/laravel-flouci` est un package Laravel pour integrer Flouci dans des applications tunisiennes.

## Compatibilite

- Laravel 11
- Laravel 12
- Laravel 13
- PHP 8.2+

## Installation

```bash
composer require rhaima/laravel-flouci
```

Le package utilise l'auto-discovery Laravel. Si tu preferes une declaration manuelle, ajoute le provider suivant:

```php
Flouci\Laravel\FlouciServiceProvider::class,
```

## Configuration

Publier la configuration:

```bash
php artisan vendor:publish --tag=flouci-config
```

Variables attendues:

```env
FLOUCI_BASE_URL=https://developers.flouci.com/api
FLOUCI_PUBLIC_KEY=
FLOUCI_PRIVATE_KEY=
FLOUCI_SUCCESS_LINK=${APP_URL}/payment/success
FLOUCI_FAIL_LINK=${APP_URL}/payment/fail
FLOUCI_CARD_PAYMENT=true
FLOUCI_IMAGE_URL=
```

## Options de configuration

- `base_url`: URL de base de l'API Flouci
- `public_key`: cle publique Flouci
- `private_key`: cle privee Flouci
- `success_link`: URL de retour en cas de succes
- `fail_link`: URL de retour en cas d'echec
- `card_payment`: valeur par defaut envoyee comme `accept_card` lors de `generatePayment()`
- `image_url`: URL d'image par defaut envoyee lors de `generatePayment()`

## Utilisation

```php
use Flouci\Laravel\Facades\Flouci;

$payment = Flouci::generatePayment([
    'amount' => 10000,
    'developer_tracking_id' => 'order_1001',
]);

$verification = Flouci::verifyPayment($payment['result']['payment_id']);
```

Pour forcer des valeurs sur un appel precis:

```php
$payment = Flouci::generatePayment([
    'amount' => 10000,
    'developer_tracking_id' => 'order_1002',
    'accept_card' => false,
    'image_url' => 'https://example.com/logo.png',
]);
```

## Developpement du package

Le depot contient maintenant:

- `src/` pour le code publiable du package
- `config/` pour la configuration publiee
- `routes/` pour les routes du package
- `tests/` pour les tests package-first avec Pest + Testbench
- `workbench/` pour les essais locaux si besoin

Lancer les tests:

```bash
composer test
```

## References Flouci

- Introduction: https://docs.flouci.com/introduction
- Test environment: https://docs.flouci.com/essentials/testing
