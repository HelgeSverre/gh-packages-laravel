# Laravel ZATCA Invoice

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mirzahaseebbaig/laravel-zatca-invoice.svg?style=flat-square)](https://packagist.org/packages/mirzahaseebbaig/laravel-zatca-invoice)
[![Total Downloads](https://img.shields.io/packagist/dt/mirzahaseebbaig/laravel-zatca-invoice.svg?style=flat-square)](https://packagist.org/packages/mirzahaseebbaig/laravel-zatca-invoice)
[![GitHub Stars](https://img.shields.io/github/stars/mirzahaseebbaig/laravel-zatca-invoice?style=flat-square)](https://github.com/mirzahaseebbaig/laravel-zatca-invoice/stargazers)
[![Tests](https://github.com/mirzahaseebbaig/laravel-zatca-invoice/actions/workflows/tests.yml/badge.svg)](https://github.com/mirzahaseebbaig/laravel-zatca-invoice/actions)
[![License](https://img.shields.io/github/license/mirzahaseebbaig/laravel-zatca-invoice?style=flat-square)](LICENSE)

---

## 🇸🇦 About

**Laravel ZATCA Invoice** is an **independent, open-source Laravel package** that provides  
**ZATCA-ready B2C (Simplified) e-invoicing core utilities** for Saudi Arabia (KSA).

It focuses on **clean architecture**, **reusability**, and **integration-friendly design**, making it suitable for:

- SaaS platforms
- POS systems
- Gyms / SMEs
- ERP-lite applications
- API-first backends

> ⚠️ **Disclaimer:**  
> This package is **NOT officially affiliated with ZATCA**.  
> It provides **ZATCA-ready utilities** and sandbox-level helpers, not certified production compliance.

---

## ✨ Features

- ✅ B2C (Simplified) invoice data contracts (DTOs)
- ✅ VAT & totals validation (Saudi-standard)
- ✅ QR Code generation (TLV → Base64)
- ✅ Laravel 10 / 11 / 12 support
- ✅ Clean, testable, package-first architecture
- 🛠 UBL XML generator (in progress)
- 🛠 Sandbox API client scaffolding (planned)

---

## 📦 Installation

```bash
composer require mirzahaseebbaig/laravel-zatca-invoice
```

### Publish configuration (optional):
```bash
php artisan vendor:publish --tag=zatca-invoice-config
```

## 🧩 Requirements
- PHP 8.1+
- Laravel 10+

## 🚀 Usage (B2C QR – Simplified Invoice)
```bash
use Zatca\Invoice\DTO\{
    SellerDTO,
    MoneyDTO,
    SimplifiedInvoiceDTO
};
use Zatca\Invoice\Validators\SimplifiedInvoiceValidator;
use Zatca\Invoice\Qr\SimplifiedInvoiceQr;

$invoice = new SimplifiedInvoiceDTO(
    seller: new SellerDTO('Gym X', '123456789012345'),
    issuedAt: new DateTimeImmutable('now', new DateTimeZone('Asia/Riyadh')),
    totalWithVat: new MoneyDTO(230.00, 'SAR'),
    vatTotal: new MoneyDTO(30.00, 'SAR'),
);

SimplifiedInvoiceValidator::validate($invoice);

$qrBase64 = SimplifiedInvoiceQr::generate($invoice);

```

```bash
use Zatca\Invoice\DTO\{SellerDTO, MoneyDTO, SimplifiedInvoiceDTO, LineItemDTO};
use Zatca\Invoice\Ubl\UblSimplifiedInvoiceXml;

$invoice = new SimplifiedInvoiceDTO(
  seller: new SellerDTO('Gym X', '123456789012345'),
  issuedAt: new DateTimeImmutable('now', new DateTimeZone('Asia/Riyadh')),
  totalWithVat: new MoneyDTO(115.00, 'SAR'),
  vatTotal: new MoneyDTO(15.00, 'SAR')
);

$lines = [
  new LineItemDTO('Membership', 1, 100.00, 0.15)
];

$xml = UblSimplifiedInvoiceXml::generate($invoice, $lines);
```

## 🛣 Roadmap
- VAT calculator helpers
- UBL XML generator (Simplified Invoice)
- Signing & hash-chain hooks
- ZATCA sandbox API client
- Example Laravel demo app

## 🤝 Contributing
Contributions are welcome.
- Fork the repo
- Add tests for new features
- Submit a PR

## 📜 License
MIT License © Mirza Haseeb Baig