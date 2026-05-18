# aledaas-packages

Reusable PHP and Laravel packages built by **Alejandro Daas**.

This monorepo hosts infrastructure adapters, SDKs, and integrations focused on
clean architecture (DDD), financial infrastructure, payment rails, blockchain
anchors, and real-world fintech use cases.

## Packages

- **bridge-rails** — Bridge.xyz driver for Laravel (API client, webhook verification)
- **anchor-sdk** — Blockchain anchor integrations (existing)
- *(coming soon)* metamap-kyc, alliance-fiat

## Philosophy

- Clean Architecture & DDD-friendly design
- Provider-agnostic cores with replaceable adapters
- Production-grade concerns (idempotency, retries, webhooks, signatures)
- Safe defaults and explicit configuration

## Installation

Packages can be installed individually via Composer.

Example:
```bash
composer require aledaas/bridge-rails
