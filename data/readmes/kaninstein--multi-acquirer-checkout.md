# kaninstein/multi-acquirer-checkout

[![CI](https://github.com/kaninstein/multi-acquirer-checkout/actions/workflows/ci.yml/badge.svg)](https://github.com/kaninstein/multi-acquirer-checkout/actions/workflows/ci.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/kaninstein/multi-acquirer-checkout.svg)](https://packagist.org/packages/kaninstein/multi-acquirer-checkout)
[![Total Downloads](https://img.shields.io/packagist/dt/kaninstein/multi-acquirer-checkout.svg)](https://packagist.org/packages/kaninstein/multi-acquirer-checkout)
[![PHP Version](https://img.shields.io/packagist/php-v/kaninstein/multi-acquirer-checkout.svg)](https://packagist.org/packages/kaninstein/multi-acquirer-checkout)
[![License](https://img.shields.io/packagist/l/kaninstein/multi-acquirer-checkout.svg)](https://packagist.org/packages/kaninstein/multi-acquirer-checkout)

Headless Laravel package for **multi-acquirer payments** with a **fallback gateway pipeline** and **fee calculation**.

- Multiple gateways with priority + optional preferred gateway
- Card / PIX / boleto (per-gateway support)
- Deterministic fee breakdown (platform fee + gateway fee + financing cost)
- Optional published HTTP routes (API-first)
- Optional package migrations (or pure-config/in-memory mode)

## Requirements

- PHP `^8.2`
- Laravel `^10|^11|^12`

## Installation (Packagist)

```bash
composer require kaninstein/multi-acquirer-checkout:^1.0
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=multi-acquirer-config
```

Enable routes (optional):

```env
MULTI_ACQUIRER_ROUTES_ENABLED=true
MULTI_ACQUIRER_ROUTES_PREFIX=api/multi-acquirer
```

Enable package migrations (optional):

```env
MULTI_ACQUIRER_DATABASE_USE_PACKAGE_MIGRATIONS=true
```

Then publish and run:

```bash
php artisan vendor:publish --tag=multi-acquirer-migrations
php artisan migrate
```

## API routes (optional)

When `MULTI_ACQUIRER_ROUTES_ENABLED=true`, these routes are available under `MULTI_ACQUIRER_ROUTES_PREFIX` (default: `api/multi-acquirer`):

- `POST /api/multi-acquirer/checkout`
- `POST /api/multi-acquirer/fees`
- `GET /api/multi-acquirer/boleto/barcode`

### `POST /checkout`

Creates a payment attempt using the gateway pipeline and returns:

- payment snapshot (status + metadata)
- fee breakdown
- gateway response payload (normalized)

Request body:

```json
{
  "amount_cents": 10000,
  "currency": "BRL",
  "payment_method": "pix",
  "installments": 1,
  "customer": { "name": "John Doe", "email": "john@example.com", "document": "123.456.789-00" },
  "gateway": "pagarme",
  "platform_fee_rate": 0.06,
  "merchant_absorbs_financing": false,
  "fee_responsibility": "buyer",
  "metadata": { "order_id": 123, "description": "Product X", "item_code": "product_123" }
}
```

Notes:

- `platform_fee_rate` is optional. If omitted, the package uses `multi-acquirer.fees.platform.default_rate`.
- `merchant_absorbs_financing` controls who pays installment financing.
- `fee_responsibility` controls gross-up behavior (`buyer` vs `merchant`).

### `POST /fees`

Computes the fee breakdown without creating a gateway payment (useful for checkout previews).

Request body:

```json
{
  "amount_cents": 10000,
  "payment_method": "card",
  "installments": 3,
  "gateway": "pagarme",
  "platform_fee_rate": 0.06,
  "merchant_absorbs_financing": false,
  "fee_responsibility": "buyer"
}
```

Response contains `fees` with fields like:

- `platform_fee_amount_cents`
- `gateway_fee_cents`
- `financing_cost_cents`
- `amount_paid_by_customer_cents`
- `merchant_net_amount_cents`

## Using the package services (no routes)

If you prefer, call the services directly:

- `Kaninstein\MultiAcquirerCheckout\Application\Services\CheckoutService`
- `Kaninstein\MultiAcquirerCheckout\Domain\Fee\Services\FeeCalculator`

The main input DTO is:

- `Kaninstein\MultiAcquirerCheckout\Application\DTOs\PaymentRequest`

## Multi-tenant / SaaS setup

This package reads gateway and fee settings from `config('multi-acquirer')`. In a SaaS, you typically store a JSON blob per tenant/producer in your own database and hydrate Laravel config at runtime (middleware/service provider) before calling the package.

Recommended approach:

- Store tenant payload under one key (e.g. `multi_acquirer`) in your app settings table.
- On each request, set `config(['multi-acquirer' => $payload])` (or merge the relevant portions).
- Keep the payment domain inside this package; keep only project-specific mapping in your app.

## Development

```bash
composer test
composer phpstan
composer format
```
