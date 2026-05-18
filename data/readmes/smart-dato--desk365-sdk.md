# Desk365 SDK for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/smart-dato/desk365-sdk.svg?style=flat-square)](https://packagist.org/packages/smart-dato/desk365-sdk)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/desk365-sdk/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/smart-dato/desk365-sdk/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/smart-dato/desk365-sdk/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/smart-dato/desk365-sdk/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/smart-dato/desk365-sdk.svg?style=flat-square)](https://packagist.org/packages/smart-dato/desk365-sdk)

A Laravel SDK for the [Desk365](https://www.desk365.io/) helpdesk API. Built with [Saloon](https://docs.saloon.dev/).

## Installation

You can install the package via composer:

```bash
composer require smart-dato/desk365-sdk
```

Publish the config file:

```bash
php artisan vendor:publish --tag="desk365-sdk-config"
```

Add your Desk365 credentials to your `.env` file:

```env
DESK365_API_KEY=your-api-key
DESK365_BASE_URL=https://yourcompany.desk365.io/apis/
```

## Usage

### Basic Setup

```php
use SmartDato\Desk365\Desk365;
use SmartDato\Desk365\Facades\Desk365 as Desk365Facade;

// Using the facade
Desk365Facade::connector()->send(new GetTicketsRequest());

// Or resolve from container
$desk365 = app(Desk365::class);
$desk365->connector()->send(new GetTicketsRequest());

// Or instantiate directly (useful for testing or multiple instances)
$desk365 = new Desk365(
    apiKey: 'your-api-key',
    baseUrl: 'https://yourcompany.desk365.io/apis/',
);
```

### Tickets

#### List Tickets

```php
use SmartDato\Desk365\Requests\Tickets\GetTicketsRequest;

$response = $desk365->connector()->send(new GetTicketsRequest());
$tickets = $response->json('tickets');
```

#### Get Ticket Details

```php
use SmartDato\Desk365\Requests\Tickets\GetTicketDetailsRequest;

$response = $desk365->connector()->send(
    new GetTicketDetailsRequest(ticketNumber: 12345)
);
$ticket = $response->json();
```

#### Create Ticket

```php
use SmartDato\Desk365\Data\Tickets\CreateTicketData;
use SmartDato\Desk365\Enums\Ticket\TicketPriority;
use SmartDato\Desk365\Enums\Ticket\TicketStatus;
use SmartDato\Desk365\Enums\Ticket\TicketType;
use SmartDato\Desk365\Requests\Tickets\CreateTicketRequest;

$response = $desk365->connector()->send(
    new CreateTicketRequest(
        new CreateTicketData(
            email: 'customer@example.com',
            subject: 'Help needed',
            description: '<p>I need assistance with...</p>',
            status: TicketStatus::Open,
            priority: TicketPriority::Medium,
            type: TicketType::Question,
        )
    )
);
```

#### Create Ticket with Attachments

```php
use SmartDato\Desk365\Requests\Tickets\CreateTicketWithAttachmentRequest;

$response = $desk365->connector()->send(
    new CreateTicketWithAttachmentRequest(
        data: new CreateTicketData(
            email: 'customer@example.com',
            subject: 'Issue with screenshot',
            description: 'See attached files',
            status: TicketStatus::Open,
            priority: TicketPriority::Low,
        ),
        files: ['/path/to/screenshot.png', '/path/to/log.txt'],
    )
);
```

#### Update Ticket

```php
use SmartDato\Desk365\Data\Tickets\UpdateTicketData;
use SmartDato\Desk365\Requests\Tickets\UpdateTicketRequest;

$response = $desk365->connector()->send(
    new UpdateTicketRequest(
        ticketNumber: 12345,
        data: new UpdateTicketData(
            status: TicketStatus::Resolved,
            priority: TicketPriority::Low,
        ),
    )
);
```

#### Get Ticket Conversations

```php
use SmartDato\Desk365\Enums\ConversationSortBy;
use SmartDato\Desk365\Requests\Tickets\GetTicketConversationsRequest;

$response = $desk365->connector()->send(
    new GetTicketConversationsRequest(
        ticketNumber: 12345,
        sortBy: ConversationSortBy::LatestFirst,
        includePrivateNotes: false,
    )
);
```

#### Add Reply

```php
use SmartDato\Desk365\Requests\Tickets\AddReplyRequest;

$response = $desk365->connector()->send(
    new AddReplyRequest(
        ticketNumber: 12345,
        replyBody: 'Thank you for contacting us. We are looking into this.',
        agentEmail: 'agent@company.com',
    )
);
```

#### Add Note

```php
use SmartDato\Desk365\Enums\Ticket\TicketVisibility;
use SmartDato\Desk365\Requests\Tickets\AddNoteRequest;

$response = $desk365->connector()->send(
    new AddNoteRequest(
        ticketNumber: 12345,
        noteBody: 'Internal note: Customer called about this issue.',
        visibility: TicketVisibility::Private,
    )
);
```

### Contacts

```php
use SmartDato\Desk365\Requests\Contacts\GetContactsRequest;
use SmartDato\Desk365\Requests\Contacts\GetContactDetailsRequest;

// List all contacts
$response = $desk365->connector()->send(new GetContactsRequest());

// Get contact details
$response = $desk365->connector()->send(
    new GetContactDetailsRequest(email: 'customer@example.com')
);
```

### Companies

```php
use SmartDato\Desk365\Requests\Companies\GetCompaniesRequest;
use SmartDato\Desk365\Requests\Companies\GetCompanyDetailsRequest;

// List all companies
$response = $desk365->connector()->send(new GetCompaniesRequest());

// Get company details
$response = $desk365->connector()->send(
    new GetCompanyDetailsRequest(name: 'Acme Corp')
);
```

### Knowledge Base

```php
use SmartDato\Desk365\Requests\KnowledgeBase\Articles\GetArticlesRequest;
use SmartDato\Desk365\Requests\KnowledgeBase\Articles\GetArticleDetailsRequest;
use SmartDato\Desk365\Requests\KnowledgeBase\Categories\GetCategoryDetailsRequest;
use SmartDato\Desk365\Requests\KnowledgeBase\Folders\GetFolderDetailsRequest;

// List all articles
$response = $desk365->connector()->send(new GetArticlesRequest());

// Get article details
$response = $desk365->connector()->send(
    new GetArticleDetailsRequest(articleId: 123)
);
```

### Surveys

```php
use SmartDato\Desk365\Requests\Surveys\GetSurveysRequest;
use SmartDato\Desk365\Requests\Surveys\GetSurveyRatingsRequest;

$response = $desk365->connector()->send(new GetSurveysRequest());
$response = $desk365->connector()->send(new GetSurveyRatingsRequest());
```

### Time Entries

```php
use SmartDato\Desk365\Requests\TimeEntries\GetTimeEntriesRequest;
use SmartDato\Desk365\Requests\TimeEntries\GetTimeEntryDetailsRequest;

$response = $desk365->connector()->send(new GetTimeEntriesRequest());
$response = $desk365->connector()->send(
    new GetTimeEntryDetailsRequest(timeEntryId: 456)
);
```

### Contracts

```php
use SmartDato\Desk365\Requests\Contracts\GetContractsRequest;
use SmartDato\Desk365\Requests\Contracts\GetContractDetailsRequest;

$response = $desk365->connector()->send(new GetContractsRequest());
$response = $desk365->connector()->send(
    new GetContractDetailsRequest(contractId: 789)
);
```

## Enums

The SDK provides enums for type-safe values:

### TicketPriority
- `TicketPriority::Low` (1)
- `TicketPriority::Medium` (5)
- `TicketPriority::High` (10)
- `TicketPriority::Urgent` (20)

### TicketSource
- `TicketSource::Email` (1)
- `TicketSource::MicrosoftTeams` (5)
- `TicketSource::SupportPortal` (6)
- `TicketSource::PhoneOrOther` (7)
- `TicketSource::WebForm` (12)
- `TicketSource::WebWidget` (13)
- `TicketSource::API` (15)

### TicketType
- `TicketType::Question`
- `TicketType::Incident`
- `TicketType::Problem`
- `TicketType::Request`

### ConversationSortBy
- `ConversationSortBy::EarliestFirst`
- `ConversationSortBy::LatestFirst`

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [SmartDato](https://github.com/smart-dato)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
