# Laravel Power BI

[![Latest Version on Packagist](https://img.shields.io/packagist/v/interworks/laravel-powerbi.svg?style=flat-square)](https://packagist.org/packages/interworks/laravel-powerbi)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/interworks/laravel-powerbi/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/interworks/laravel-powerbi/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/interworks/laravel-powerbi/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/interworks/laravel-powerbi/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/interworks/laravel-powerbi.svg?style=flat-square)](https://packagist.org/packages/interworks/laravel-powerbi)

A comprehensive Laravel package for interacting with the Microsoft Power BI REST API. Built on [Saloon v4](https://docs.saloon.dev/) with type-safe responses, automatic caching, and multiple OAuth2 authentication flows.

## Features

- **Multiple Authentication Flows**: Service Principal, Admin Service Principal, and Azure User (authorization code)
- **Type-Safe DTOs**: Immutable response objects with full IDE autocomplete
- **Automatic Caching**: Configurable response caching via Saloon's cache plugin
- **Account Type Restrictions**: Automatic enforcement of API access restrictions
- **Pagination Support**: Automatic handling of continuation tokens
- **Comprehensive API Coverage**: Groups, Reports, Dashboards, Embed Tokens, and Admin endpoints

## Requirements

- PHP 8.1+
- Laravel 9.x, 10.x, 11.x, or 12.x
- Microsoft Power BI Pro or Premium account
- Azure AD application with Power BI API permissions

## Installation

```bash
composer require interworks/laravel-powerbi
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="laravel-powerbi-config"
```

Add your Power BI credentials to your `.env` file:f

```env
# Azure AD Configuration
POWER_BI_TENANT=your-tenant-id

# Service Principal (Client Credentials)
POWER_BI_CLIENT_ID=your-client-id
POWER_BI_CLIENT_SECRET=your-client-secret

# Admin Service Principal (Optional)
POWER_BI_ADMIN_CLIENT_ID=your-admin-client-id
POWER_BI_ADMIN_CLIENT_SECRET=your-admin-client-secret

# Azure User OAuth Redirect (Optional)
POWER_BI_REDIRECT_URI=https://your-app.com/auth/powerbi/callback

# Caching Configuration
POWER_BI_CACHE_ENABLED=true
POWER_BI_CACHE_EXPIRY_SECONDS=3600
```

## Quick Start

```php
use InterWorks\PowerBI\Facades\PowerBI;

// Authenticate
$token = PowerBI::getAccessToken();
PowerBI::authenticate($token);

// Get groups and reports
$groups = PowerBI::getGroups();
$reports = PowerBI::getReportsInGroup('group-id');
$report = PowerBI::getReportInGroup('group-id', 'report-id');

// Generate embed token
use InterWorks\PowerBI\Requests\EmbedToken\ReportsGenerateTokenInGroup;

$embedToken = PowerBI::send(new ReportsGenerateTokenInGroup(
    groupId: 'group-id',
    reportId: 'report-id',
    accessLevel: 'View'
));
```

## Authentication

The package supports three authentication flows:

### Service Principal (Client Credentials)
Best for backend automation and server-to-server communication.

```php
$token = PowerBI::getAccessToken();
PowerBI::authenticate($token);
```

**Restriction**: Cannot access individual resource endpoints (`/reports/{id}`). Use group-scoped endpoints.

### Admin Service Principal
For tenant-wide administration with elevated permissions.

```php
$adminConnector = PowerBI::adminServicePrincipal();
PowerBI::setConnector($adminConnector);
```

### Azure User (Authorization Code)
For user-delegated permissions with browser-based consent.

```php
$connector = PowerBI::azureUser(redirectUri: 'https://your-app.com/callback');
$authUrl = $connector->getAuthorizationUrl();
// Redirect user, then exchange code for token
```

## Available Endpoints

The package provides request classes for Power BI API endpoints:

**Groups**: [`GetGroups`](src/Requests/Groups/GetGroups.php), [`GetGroupsAsAdmin`](src/Requests/Admin/Groups/GetGroupsAsAdmin.php)

**Reports**: [`GetReportsInGroup`](src/Requests/Reports/GetReportsInGroup.php), [`GetReportInGroup`](src/Requests/Reports/GetReportInGroup.php), [`GetReport`](src/Requests/Reports/GetReport.php)

**Dashboards**: [`GetDashboardsInGroup`](src/Requests/Dashboards/GetDashboardsInGroup.php), [`GetDashboardInGroup`](src/Requests/Dashboards/GetDashboardInGroup.php)

**Embed Tokens**: [`ReportsGenerateTokenInGroup`](src/Requests/EmbedToken/ReportsGenerateTokenInGroup.php), [`DashboardsGenerateTokenInGroup`](src/Requests/EmbedToken/DashboardsGenerateTokenInGroup.php)

**Admin**: [`GetUserArtifactAccessAsAdmin`](src/Requests/Admin/Users/GetUserArtifactAccessAsAdmin.php)

Browse all available requests in [`src/Requests`](src/Requests).

## Response DTOs

All responses are transformed into type-safe DTOs with readonly properties:

**Collections**: [`Groups`](src/DTO/Groups.php), [`Reports`](src/DTO/Reports.php), [`Dashboards`](src/DTO/Dashboards.php), [`ArtifactAccessResponse`](src/DTO/ArtifactAccessResponse.php)

**Resources**: [`Group`](src/DTO/Group.php), [`Report`](src/DTO/Report.php), [`Dashboard`](src/DTO/Dashboard.php), [`EmbedToken`](src/DTO/EmbedToken.php), [`ArtifactAccessEntry`](src/DTO/ArtifactAccessEntry.php)

```php
$groups = PowerBI::getGroups();

// Laravel Collections with full IDE support
$groups->groups->each(function ($group) {
    echo $group->name; // Fully typed properties
});
```

## Caching

Responses are automatically cached using Laravel's cache system:

```env
POWER_BI_CACHE_ENABLED=true
POWER_BI_CACHE_EXPIRY_SECONDS=3600
```

Check cache status:

```php
if ($groups->response()->isCached()) {
    // Response served from cache
}
```

## Account Type Restrictions

Power BI API enforces different access levels by authentication type:

| Endpoint Type | Service Principal | Admin SP | Azure User |
|--------------|------------------|----------|-----------|
| Group-scoped (`/groups/{id}/reports`) | ✅ | ✅ | ✅ |
| Individual (`/reports/{id}`) | ❌ | ✅ | ✅ |
| Admin (`/admin/*`) | ❌ | ✅ | ❌ |

Restrictions are enforced automatically with clear exceptions.

## Troubleshooting

**Authentication failures**: Verify Azure AD credentials and Power BI API permissions in your app registration.

**Account type restrictions**: Service Principal cannot access individual resource endpoints - use group-scoped endpoints or switch to Azure User.

**Admin endpoint 401s**: Ensure Service Principal has Power BI Administrator role assigned.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for release history.

## Security

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [mrkbingham](https://github.com/mrkbingham)
- [All Contributors](../../contributors)

Built with [Saloon v4](https://docs.saloon.dev/).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
