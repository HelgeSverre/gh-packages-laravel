# Crypto Payments for Laravel

<p align="center">
  <a href="https://packagist.org/packages/martin-lechene/crypto-payments"><img src="https://img.shields.io/packagist/v/martin-lechene/crypto-payments?style=flat-square" alt="Latest Version"></a>
  <a href="https://packagist.org/packages/martin-lechene/crypto-payments"><img src="https://img.shields.io/packagist/dt/martin-lechene/crypto-payments?style=flat-square" alt="Total Downloads"></a>
  <a href="https://packagist.org/packages/martin-lechene/crypto-payments"><img src="https://img.shields.io/packagist/l/martin-lechene/crypto-payments?style=flat-square" alt="License"></a>
  <a href="https://packagist.org/packages/martin-lechene/crypto-payments"><img src="https://img.shields.io/packagist/php-v/martin-lechene/crypto-payments?style=flat-square" alt="PHP Version"></a>
  <img src="https://img.shields.io/badge/Laravel-10%20%7C%2011%20%7C%2012-FF2D20?style=flat-square&logo=laravel" alt="Laravel">
</p>

> A Laravel package to accept **Bitcoin** and **Ethereum** payments with exchange-rate conversion, webhook notifications, and a full audit trail.
>
> 🇫🇷 [Voir la documentation en français](#documentation-française)

---

## Table of Contents

- [Requirements](#requirements)
- [Features](#features)
- [Known Limitations](#known-limitations)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [REST API](#rest-api)
- [Webhooks](#webhooks)
- [Artisan Commands](#artisan-commands)
- [Scheduled Jobs](#scheduled-jobs)
- [Security](#security)
- [Testing](#testing)
- [Changelog](#changelog)
- [License](#license)

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.2 |
| Laravel | ^10.0 \| ^11.0 \| ^12.0 |
| Bitcoin Core | ^25.0 (RPC enabled) |
| Ethereum node | Any JSON-RPC compatible node (e.g. Geth, Infura) |

---

## Features

- ✅ Bitcoin & Ethereum support (testnet + mainnet)
- ✅ Unique payment address generation per transaction
- ✅ Blockchain confirmation tracking
- ✅ Fiat ↔ crypto conversion via CoinGecko
- ✅ Webhook system with HMAC-SHA256 signature and automatic retry
- ✅ AES-256 encryption for sensitive data
- ✅ Full audit trail
- ✅ REST API (create / check / list payments)
- ✅ Scheduled jobs for automatic payment verification

---

## Known Limitations

> **Please read before using in production.**

| Area | Status | Notes |
|---|---|---|
| Incoming transaction detection | ⚠️ Stub | `findTransaction()` always returns `null`. You must integrate a blockchain indexer (e.g. [Blockstream API](https://blockstream.info/api/), [Etherscan](https://etherscan.io/apis)) before going live. |
| ETH transaction sending | ⚠️ Not implemented | `EthereumService::sendTransaction()` throws intentionally; private key management must be implemented by the consumer. |
| BIP44 hierarchical addresses | ⚠️ Partial | Falls back to `getnewaddress` — add [bitwasp/bitcoin](https://github.com/Bit-Wasp/bitcoin-php) for full BIP44/49/84 support. |
| `sc0vu/web3.php` (Ethereum library) | ⚠️ Optional | Moved to `suggest` — unmaintained, requires `php ^7.1` on Packagist. Install manually: `composer require sc0vu/web3.php:dev-master`. Without it, ETH regex validation works but RPC calls throw. |
| Test coverage | ⚠️ Minimal | Unit tests cover config, `BitcoinService`, and the service provider. Integration tests (real node) are out of scope. |

---

## Installation

```bash
composer require martin-lechene/crypto-payments
```

### Publish config & migrations

```bash
php artisan vendor:publish --tag=crypto-payments-config
php artisan vendor:publish --tag=crypto-payments-migrations
php artisan migrate
```

---

## Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp vendor/martin-lechene/crypto-payments/.env.example .env
```

### Key environment variables

```env
# "testnet" or "mainnet"
CRYPTO_NETWORK=testnet
CRYPTO_DEFAULT_CURRENCY=BTC

# Bitcoin Testnet
BTC_TESTNET_RPC=http://localhost:18332
BTC_TESTNET_USER=bitcoin
BTC_TESTNET_PASSWORD=secret
# Set to false only on private nodes with self-signed certs
BTC_TESTNET_VERIFY_SSL=true
BTC_CONFIRMATIONS=3

# Ethereum Testnet (Sepolia, chain_id 11155111)
ETH_TESTNET_RPC=https://sepolia.infura.io/v3/YOUR_KEY
ETH_CONFIRMATIONS=12

# Exchange rates
EXCHANGE_RATES_PROVIDER=coingecko
```

> ⚠️ **Never disable `BTC_TESTNET_VERIFY_SSL` on mainnet nodes.**

---

## Usage

### Create a payment request

```php
use MartinLechene\CryptoPayments\Services\PaymentManager;

$payment = app(PaymentManager::class)->createPaymentRequest(
    currency: 'BTC',
    amountFiat: 100.00,
    fiatCurrency: 'USD',
    options: [
        'merchant_id'  => 1,
        'order_id'     => 123,
        'description'  => 'Order #123',
    ]
);

// $payment->wallet_address  → send crypto here
// $payment->amount_crypto   → exact amount expected
// $payment->expires_at      → payment deadline
```

### Check payment status

```php
app(PaymentManager::class)->checkPaymentStatus($payment);
```

---

## REST API

All endpoints are prefixed with `/api/crypto-payments`.

### Create a payment

```http
POST /api/crypto-payments/payments
Content-Type: application/json

{
  "currency": "BTC",
  "amount": 100,
  "fiat_currency": "USD",
  "merchant_id": 1,
  "description": "Order #123"
}
```

### Get payment status

```http
GET /api/crypto-payments/payments/{id}/status
```

### List payments

```http
GET /api/crypto-payments/payments?merchant_id=1&status=pending
```

---

## Webhooks

### Register an endpoint

```http
POST /api/crypto-payments/webhooks
Content-Type: application/json

{
  "merchant_id": 1,
  "url": "https://example.com/webhooks/crypto",
  "events": ["payment_completed", "payment_confirmed"],
  "description": "Main webhook"
}
```

### Verify the signature

Webhooks are signed with HMAC-SHA256. Always verify the signature before processing:

```php
$signature = $request->header('X-Webhook-Signature');
$expected  = 'sha256=' . hash_hmac('sha256', json_encode($request->all()), $yourSecret);

if (!hash_equals($expected, $signature)) {
    abort(401, 'Invalid signature');
}
```

### Available events

| Event | Trigger |
|---|---|
| `payment_created` | A new payment request is created |
| `payment_confirming` | First blockchain confirmation received |
| `payment_confirmed` | Required confirmations reached |
| `payment_completed` | Payment marked as complete |
| `payment_expired` | Payment window expired |

---

## Artisan Commands

```bash
# Generate Bitcoin addresses for a merchant
php artisan crypto:generate-addresses BTC --count=10 --merchant-id=1
```

---

## Scheduled Jobs

Register the Laravel scheduler in your `routes/console.php` (Laravel 11+) or `app/Console/Kernel.php`:

The package auto-registers the following jobs via `callAfterResolving`:

| Job | Schedule |
|---|---|
| `CheckPaymentConfirmations` | Every minute |
| `RefreshExchangeRates` | Every 5 minutes |

Make sure you have a running queue worker:

```bash
php artisan queue:work
```

---

## Security

| Measure | Detail |
|---|---|
| Data encryption | AES-256-CBC for sensitive fields |
| Webhook signing | HMAC-SHA256 (`X-Webhook-Signature` header) |
| Address validation | Strict regex / RPC validation |
| SSL verification | Enabled by default; configurable per network |
| Audit trail | Every status change is logged |

---

## Project Structure

```
src/
├── Console/Commands/   # Artisan commands
├── Events/             # Domain events
├── Exceptions/         # Custom exceptions
├── Helpers/            # Utility helpers
├── Http/
│   ├── Controllers/    # API controllers
│   ├── Requests/       # Form request validation
│   └── Resources/      # API resources (transformers)
├── Jobs/               # Queued jobs
├── Models/             # Eloquent models
└── Services/           # Core business logic
```

---

## Testing

```bash
composer test
# or
./vendor/bin/phpunit --no-coverage
```

The test suite covers:
- Config file correctness (Sepolia chain_id, SSL defaults)
- `BitcoinService` SSL toggle + RPC error handling
- `ServiceProvider` bindings

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

---

# Documentation Française

> 🇬🇧 [English documentation above](#crypto-payments-for-laravel)

## Prérequis

| Dépendance | Version |
|---|---|
| PHP | ^8.2 |
| Laravel | ^10.0 \| ^11.0 \| ^12.0 |
| Bitcoin Core | ^25.0 (RPC activé) |
| Nœud Ethereum | Tout nœud JSON-RPC compatible (Geth, Infura…) |

---

## Fonctionnalités

- ✅ Support Bitcoin & Ethereum (testnet + mainnet)
- ✅ Génération d'une adresse unique par paiement
- ✅ Suivi des confirmations blockchain
- ✅ Conversion fiat ↔ crypto via CoinGecko
- ✅ Système de webhooks signé (HMAC-SHA256) avec retry automatique
- ✅ Chiffrement AES-256 des données sensibles
- ✅ Audit trail complet
- ✅ API REST (création / vérification / liste)
- ✅ Jobs planifiés pour la vérification automatique

---

## Limitations connues

> **À lire avant une mise en production.**

| Fonctionnalité | État | Notes |
|---|---|---|
| Détection des transactions entrantes | ⚠️ Stub | `findTransaction()` retourne toujours `null`. Intégrez un indexeur blockchain ([Blockstream API](https://blockstream.info/api/), [Etherscan](https://etherscan.io/apis)) avant la production. |
| Envoi de transactions ETH | ⚠️ Non implémenté | `EthereumService::sendTransaction()` lève une exception intentionnellement — la gestion des clés privées est à la charge du consommateur. |
| Adresses hiérarchiques BIP44 | ⚠️ Partiel | Se rabat sur `getnewaddress` — ajoutez [bitwasp/bitcoin](https://github.com/Bit-Wasp/bitcoin-php) pour le BIP44/49/84 complet. |
| `sc0vu/web3.php` (bibliothèque Ethereum) | ⚠️ Optionnel | Déplacé dans `suggest` — non maintenu, requiert `php ^7.1` sur Packagist. Installez manuellement : `composer require sc0vu/web3.php:dev-master`. Sans lui, la validation regex ETH fonctionne mais les appels RPC lèvent une exception. |
| Couverture de tests | ⚠️ Partielle | Tests unitaires couvrant la config, `BitcoinService` et le service provider. Les tests d'intégration (nœud réel) sont hors périmètre. |

---

## Installation

```bash
composer require martin-lechene/crypto-payments
```

### Publier la config & les migrations

```bash
php artisan vendor:publish --tag=crypto-payments-config
php artisan vendor:publish --tag=crypto-payments-migrations
php artisan migrate
```

---

## Configuration

Copiez `.env.example` dans `.env` :

```bash
cp vendor/martin-lechene/crypto-payments/.env.example .env
```

### Variables d'environnement principales

```env
CRYPTO_NETWORK=testnet
CRYPTO_DEFAULT_CURRENCY=BTC

BTC_TESTNET_RPC=http://localhost:18332
BTC_TESTNET_USER=bitcoin
BTC_TESTNET_PASSWORD=secret
BTC_TESTNET_VERIFY_SSL=true
BTC_CONFIRMATIONS=3

ETH_TESTNET_RPC=https://sepolia.infura.io/v3/YOUR_KEY
ETH_CONFIRMATIONS=12

EXCHANGE_RATES_PROVIDER=coingecko
```

> ⚠️ **Ne désactivez jamais `BTC_TESTNET_VERIFY_SSL` sur un nœud mainnet.**

---

## Utilisation

### Créer un paiement

```php
use MartinLechene\CryptoPayments\Services\PaymentManager;

$payment = app(PaymentManager::class)->createPaymentRequest(
    currency: 'BTC',
    amountFiat: 100.00,
    fiatCurrency: 'EUR',
    options: [
        'merchant_id' => 1,
        'order_id'    => 123,
        'description' => 'Commande #123',
    ]
);
```

### Vérifier le statut

```php
app(PaymentManager::class)->checkPaymentStatus($payment);
```

---

## Support

Pour toute question ou rapport de bug, ouvrez une [issue GitHub](https://github.com/martin-lechene/crypto-payment-laravel/issues).

