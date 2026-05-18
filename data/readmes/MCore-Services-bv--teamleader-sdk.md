# Teamleader Focus SDK for Laravel

[![Latest Version](https://img.shields.io/github/v/release/MCore-Services-bv/teamleader-sdk)](https://github.com/MCore-Services-bv/teamleader-sdk/releases)
[![Total Downloads](https://img.shields.io/packagist/dt/mcore-services/teamleader-sdk)](https://packagist.org/packages/mcore-services/teamleader-sdk)
[![PHP Version](https://img.shields.io/packagist/php-v/mcore-services/teamleader-sdk)](https://packagist.org/packages/mcore-services/teamleader-sdk)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%20%7C%2011%20%7C%2012-blue)](https://laravel.com)
[![License](https://img.shields.io/github/license/MCore-Services-bv/teamleader-sdk)](https://github.com/MCore-Services-bv/teamleader-sdk/blob/main/LICENSE.md)

A comprehensive, production-ready Laravel package for integrating with the Teamleader Focus API. Built with modern Laravel best practices, featuring automatic token management, intelligent rate limiting, resource sideloading, and complete coverage of all Teamleader Focus API endpoints.

**Quick Links:**
- 📦 **Packagist:** [packagist.org/packages/mcore-services/teamleader-sdk](https://packagist.org/packages/mcore-services/teamleader-sdk)
- 💻 **GitHub:** [github.com/MCore-Services-bv/teamleader-sdk](https://github.com/MCore-Services-bv/teamleader-sdk)
- 📖 **Full Docs:** [/docs folder](https://github.com/MCore-Services-bv/teamleader-sdk/tree/main/docs)

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Complete OAuth 2.0 Flow** — Authorization URL generation and secure callback handling
- **Automatic Token Management** — Smart token refresh with database and cache layers
- **Concurrent Request Safety** — Distributed locking prevents token refresh race conditions

### 🚀 Performance & Reliability
- **Intelligent Rate Limiting** — Built-in sliding window rate limiter with automatic throttling (200 req/min)
- **Response Caching** — Configurable caching for static data endpoints
- **Connection Pooling** — Optimized HTTP client with configurable timeouts
- **Retry Logic** — Automatic retry with exponential backoff for transient failures

### 📦 Developer Experience
- **Resource-Based Architecture** — Intuitive, organized access to all API endpoints
- **Fluent Sideloading Interface** — Reduce API calls by including related resources
- **Comprehensive Validation** — Request validation before API calls
- **Rich Error Handling** — Detailed, actionable error messages
- **Extensive Logging** — Debug-friendly logging with configurable levels
- **Resource Introspection** — Query capabilities of any resource programmatically

### 🎯 Complete API Coverage

**CRM Resources**
- Companies (incl. logo upload, marketing consent, price list sideload), Contacts (incl. avatar upload), Business Types, Tags, Addresses

**Deals & Sales**
- Deals, Quotations (incl. rich text content), Orders (incl. order number, project/group/purchase price on line items), Pipelines, Phases, Sources, Lost Reasons

**Invoicing**
- Invoices (incl. delivery date, PEPPOL status), Credit Notes (incl. PEPPOL status), Payment Methods, Payment Terms, Tax Rates, Withholding Tax Rates, Commercial Discounts, Subscriptions (incl. PEPPOL sending method)

**Expenses**
- Expenses (incl. payment filters & status), Incoming Invoices (full payment management), Incoming Credit Notes (full payment management), Receipts (full payment management), Bookkeeping Submissions

**Projects & Time Tracking**
- Projects (v1 & v2), Project Tasks, Milestones, Materials (incl. estimated quantity), Time Tracking (incl. nextgenProject filter), Timers

**Planning** *(new in v1.2.0)*
- Reservations, User Availability, Plannable Items

**Calendar & Activities**
- Meetings (incl. group field), Calls, Call Outcomes, Calendar Events, Activity Types

**Products & Services**
- Products, Product Categories, Unit of Measures, Work Types

**General Management**
- Users, Departments, Custom Fields (incl. create), Currencies, Notes, Files (incl. temporary subject type)

**System & Migration**
- Webhooks (incl. PEPPOL events), Cloud Platforms, Accounts, Migration Utilities

---

## 📋 Requirements

- **PHP**: 8.2 or higher
- **Laravel**: 10.x, 11.x, or 12.x
- **Extensions**: ext-json, ext-mbstring
- **Database**: MySQL 5.7+, PostgreSQL 10+, or SQLite 3.8+

---

## 🚀 Installation

### 1. Install via Composer

```bash
composer require mcore-services/teamleader-sdk
```

### 2. Publish the Configuration

```bash
php artisan vendor:publish --provider="McoreServices\TeamleaderSDK\TeamleaderServiceProvider"
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
TEAMLEADER_CLIENT_ID=your_client_id
TEAMLEADER_CLIENT_SECRET=your_client_secret
TEAMLEADER_REDIRECT_URI=https://your-app.com/teamleader/callback
```

### 4. Set Up OAuth Routes

```php
// routes/web.php
use McoreServices\TeamleaderSDK\Facades\Teamleader;

Route::get('/teamleader/auth', function () {
    return redirect(Teamleader::getAuthorizationUrl());
});

Route::get('/teamleader/callback', function (Request $request) {
    Teamleader::handleCallback($request->code, $request->state);
    return redirect('/dashboard')->with('success', 'Connected to Teamleader!');
});
```

> **Note:** No `php artisan migrate` is required. The SDK automatically creates the `teamleader_tokens` table on first use.

---

## 🔑 Authentication

```php
use McoreServices\TeamleaderSDK\Facades\Teamleader;

// 1. Redirect user to Teamleader for authorization
$authUrl = Teamleader::getAuthorizationUrl();
return redirect($authUrl);

// 2. Handle the callback (tokens are stored automatically)
Teamleader::handleCallback($code, $state);

// 3. Check authentication status
if (Teamleader::isAuthenticated()) {
    // Ready to make API calls
}
```

---

## 📖 Basic Usage

### Companies

```php
use McoreServices\TeamleaderSDK\Facades\Teamleader;

// List companies with filters and sideloading
$companies = Teamleader::companies()->list(
    filters: ['status' => 'active'],
    includes: ['primary_address', 'price_list']
);

// Get a single company
$company = Teamleader::companies()->info('company-uuid');

// Create a company
$company = Teamleader::companies()->create([
    'name' => 'Acme Corp',
    'email' => [['type' => 'primary', 'email' => 'info@acme.com']],
    'marketing_mails_consent' => true,
]);

// Upload a company logo
Teamleader::companies()->uploadLogo('company-uuid', 'file-uuid');
```

### Contacts

```php
// List contacts with price list sideload
$contacts = Teamleader::contacts()->list(
    filters: ['marketing_mails_consent' => true],
    includes: ['primary_address', 'price_list']
);

// Upload a contact avatar
Teamleader::contacts()->uploadAvatar('contact-uuid', 'file-uuid');
```

### Invoices

```php
// Create a draft invoice with delivery date
$invoice = Teamleader::invoices()->draft([
    'invoicee' => ['type' => 'company', 'id' => 'company-uuid'],
    'delivery_date' => '2026-03-15',
    'grouped_lines' => [...]
]);

// List invoices (includes peppol_status, delivery_date)
$invoices = Teamleader::invoices()->list(
    filters: ['status' => 'outstanding']
);
```

### Expenses & Payment Management

```php
// List expenses with payment filters
$expenses = Teamleader::expenses()->list(filters: [
    'payment_statuses' => ['not_paid', 'partially_paid'],
    'department_ids'   => ['dept-uuid'],
    'paid_at'          => ['from' => '2026-01-01', 'to' => '2026-03-31'],
]);

// Manage payments on an incoming invoice
Teamleader::incomingInvoices()->registerPayment(
    id: 'invoice-uuid',
    payment: ['amount' => ['amount' => 250.00, 'currency' => 'EUR']],
    paidAt: '2026-03-11',
    paymentMethodId: 'method-uuid',
    remark: 'Partial payment'
);

$payments = Teamleader::incomingInvoices()->listPayments('invoice-uuid');

// Same API available for incoming credit notes and receipts
Teamleader::incomingCreditnotes()->registerPayment(...);
Teamleader::receipts()->registerPayment(...);
```

### Planning (New in v1.2.0)

```php
// List reservations
$reservations = Teamleader::reservations()->list(
    filters: ['user_id' => 'user-uuid'],
    options: ['page' => ['size' => 20]]
);

// Create a reservation
Teamleader::reservations()->create([
    'user_id'    => 'user-uuid',
    'starts_on'  => '2026-03-20',
    'ends_on'    => '2026-03-21',
]);

// Check user availability
$availability = Teamleader::userAvailability()->daily([
    'user_id' => 'user-uuid',
    'from'    => '2026-03-01',
    'to'      => '2026-03-31',
]);

// List plannable items
$items = Teamleader::plannableItems()->list(['type' => 'task']);
```

### Custom Field Definitions (New endpoint)

```php
// Create a custom field definition
$field = Teamleader::customFieldDefinitions()->create([
    'context'   => 'company',
    'type'      => 'text',
    'label'     => 'VAT Number',
    'required'  => false,
    'trackable' => false,
]);
```

---

## ⚡ Rate Limiting & Caching

```php
// Check rate limit status
$stats = Teamleader::getRateLimitStats();
echo "Remaining: {$stats['remaining']} / {$stats['limit']}";

// Configure caching per resource
$companies = Teamleader::companies()
    ->withCache(ttl: 3600)
    ->list();
```

---

## 🔗 Resource Sideloading

```php
// Include related resources to reduce API calls
$deals = Teamleader::deals()->list(
    filters: ['status' => 'open'],
    includes: ['lead.customer', 'responsible_user', 'phase']
);

// Validate available includes for a resource
$available = Teamleader::companies()->getAvailableIncludes();
```

---

## 🪝 Webhooks

```php
// Register a webhook
Teamleader::webhooks()->create([
    'url'    => 'https://your-app.com/webhooks/teamleader',
    'types'  => [
        'invoice.created',
        'invoice.peppolSubmissionSucceeded',
        'invoice.peppolSubmissionFailed',
        'creditNote.peppolSubmissionSucceeded',
        'creditNote.peppolSubmissionFailed',
    ],
]);
```

---

## 🛠️ Error Handling

```php
use McoreServices\TeamleaderSDK\Exceptions\TeamleaderApiException;
use McoreServices\TeamleaderSDK\Exceptions\TeamleaderAuthException;

try {
    $company = Teamleader::companies()->info('invalid-uuid');
} catch (TeamleaderApiException $e) {
    logger()->error('Teamleader API error', [
        'message' => $e->getMessage(),
        'status'  => $e->getStatusCode(),
        'errors'  => $e->getErrors(),
    ]);
} catch (TeamleaderAuthException $e) {
    // Token expired and refresh failed — re-authenticate
    return redirect('/teamleader/auth');
}
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`composer test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please follow PSR-12 coding standards and write tests for new features.

---

## 🔒 Security

If you discover any security-related issues, please email **security@mcore-services.be** instead of using the issue tracker.

---

## 📝 Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for information on what has changed recently.

---

## 📜 License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.

---

## 🙏 Credits

- **MCore Services** — [https://mcore-services.be](https://mcore-services.be)
- Built with ❤️ for the Laravel and Teamleader communities

## 💬 Support

- **Documentation**: [/docs folder](https://github.com/MCore-Services-bv/teamleader-sdk/tree/main/docs)
- **Email**: help@mcore-services.be
- **Issues**: [GitHub Issues](https://github.com/mcore-services-bv/teamleader-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mcore-services-bv/teamleader-sdk/discussions)
- **Teamleader API**: [developer.focus.teamleader.eu](https://developer.focus.teamleader.eu/)

## 🗺️ Roadmap

- [ ] Bulk operations helper
- [ ] Enhanced caching strategies with tag-based invalidation
- [ ] Laravel Pulse integration
- [ ] CLI tool for quick API exploration

---

**Made with ❤️ by [MCore Services](https://mcore-services.be)**
