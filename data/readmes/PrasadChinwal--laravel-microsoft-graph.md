# Laravel Microsoft Graph

[![Latest Version on Packagist](https://img.shields.io/packagist/v/prasadchinwal/microsoft-graph.svg?style=flat-square)](https://packagist.org/packages/prasadchinwal/microsoft-graph)
[![Total Downloads](https://img.shields.io/packagist/dt/prasadchinwal/microsoft-graph.svg?style=flat-square)](https://packagist.org/packages/prasadchinwal/microsoft-graph)
[![License](https://img.shields.io/packagist/l/prasadchinwal/microsoft-graph.svg?style=flat-square)](https://packagist.org/packages/prasadchinwal/microsoft-graph)

A comprehensive Laravel wrapper for Microsoft Graph API that provides an elegant, fluent interface for interacting with Microsoft 365 services including users, calendars, events, mail, and more.

## Features

- 🚀 **Easy Integration** - Simple, Laravel-style fluent API
- ⚡ **Performance** - Automatic OAuth token caching with expiry handling
- 🔒 **Type Safe** - Full support for PHP 8.2+ with strict types and return type declarations
- 🎯 **Data Objects** - Strongly-typed responses using Spatie Laravel Data
- 🛡️ **Error Handling** - Custom exceptions with clear, actionable error messages
- 📧 **Email & Calendar** - Full support for Outlook, calendars, events, and mail
- 👥 **User Management** - Complete user CRUD operations with license management
- 🖼️ **Profile Photos** - Upload, download, and delete user profile photos
- 📎 **Attachment Management** - Upload, download, and manage file, item, and reference attachments
- 📝 **Query Filters** - OData query filtering for events and calendars
- 🔧 **Laravel 10-12** - Supports Laravel 10.x, 11.x, and 12.x

## Requirements

- PHP 8.2 or higher
- Laravel 10.0, 11.0, or 12.0
- Microsoft Azure App Registration with appropriate permissions

## Installation

Install the package via Composer:

```bash
composer require prasadchinwal/microsoft-graph
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=microsoft-graph-config
```

This will create a `config/microsoft-graph.php` file in your application.

## Configuration

### 1. Azure App Registration

Before using this package, you need to register an application in the [Azure Portal](https://portal.azure.com):

1. Navigate to **Azure Active Directory** > **App registrations**
2. Click **New registration**
3. Give your app a name and select supported account types
4. Click **Register**
5. Note down the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** > **New client secret**
7. Create a new secret and note down its value
8. Go to **API permissions** and add the required Microsoft Graph permissions:
   - `User.Read.All`
   - `User.ReadWrite.All`
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `Mail.Read`
   - `Mail.Send`
   - Grant admin consent for your organization

### 2. Environment Configuration

Add the following to your `.env` file:

```env
MICROSOFT_GRAPH_TENANT_ID=your-tenant-id
MICROSOFT_GRAPH_CLIENT_ID=your-client-id
MICROSOFT_GRAPH_CLIENT_SECRET=your-client-secret
```

### 3. Configuration File

The `config/microsoft-graph.php` file contains:

```php
return [
    'tenant_id' => env('MICROSOFT_GRAPH_TENANT_ID', null),
    'client_id' => env('MICROSOFT_GRAPH_CLIENT_ID', null),
    'client_secret' => env('MICROSOFT_GRAPH_CLIENT_SECRET', null),
    'timezone' => env('APP_TIMEZONE', 'UTC'),
];
```

**Note:** The package will validate configuration on boot and throw a `ConfigurationException` if required values are missing.

## Usage

### Initialization

The package can be used via the Facade or by instantiating the class:

```php
use PrasadChinwal\MicrosoftGraph\Facades\MicrosoftGraph;

// Via Facade
$graph = app('graph');

// Or direct instantiation
$graph = new \PrasadChinwal\MicrosoftGraph\MicrosoftGraph();
```

---

## User Management

### Get All Users

Retrieve all users in your organization.

**API Reference:** [List Users](https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http)

```php
use PrasadChinwal\MicrosoftGraph\Facades\MicrosoftGraph;

$users = MicrosoftGraph::users()->get();

foreach ($users as $user) {
    echo $user->displayName . ' - ' . $user->mail;
}
```

### Get a Specific User

Retrieve a user by their email address (User Principal Name).

**API Reference:** [Get User](https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http)

```php
$user = MicrosoftGraph::users()->find('john.doe@company.com');

echo $user->displayName;        // John Doe
echo $user->jobTitle;           // Software Engineer
echo $user->department;         // Engineering
echo $user->mobilePhone;        // +1 234 567 8900
```

### Update a User

Update user properties using the User builder.

**API Reference:** [Update User](https://learn.microsoft.com/en-us/graph/api/user-update?view=graph-rest-1.0&tabs=http)

```php
use PrasadChinwal\MicrosoftGraph\Builder\User\User;

$userUpdate = new User();
$userUpdate->displayName = 'Jane Smith';
$userUpdate->jobTitle = 'Senior Software Engineer';
$userUpdate->department = 'Engineering';
$userUpdate->mobilePhone = '+1 234 567 8901';

MicrosoftGraph::users()->update('jane.smith@company.com', $userUpdate);
```

### Get User Licenses

Retrieve license details for a user.

**API Reference:** [List License Details](https://learn.microsoft.com/en-us/graph/api/user-list-licensedetails?view=graph-rest-1.0&tabs=http)

```php
$licenses = MicrosoftGraph::users()
    ->withEmail('john.doe@company.com')
    ->getLicenses();

foreach ($licenses as $license) {
    echo $license->skuPartNumber;
    foreach ($license->servicePlans as $plan) {
        echo $plan->servicePlanName;
    }
}
```

### Assign License to User

Assign one or more licenses to a user.

**API Reference:** [Assign License](https://learn.microsoft.com/en-us/graph/api/user-assignlicense?view=graph-rest-1.0&tabs=http)

```php
use PrasadChinwal\MicrosoftGraph\Builder\License\AssignLicenseBuilder;
use PrasadChinwal\MicrosoftGraph\Builder\License\NewLicense;
use PrasadChinwal\MicrosoftGraph\Builder\License\NewLicenseCollection;

$license = new NewLicense();
$license->skuId = 'sku-guid-here';

$licenseCollection = new NewLicenseCollection([$license]);

$builder = new AssignLicenseBuilder(
    addLicenses: $licenseCollection,
    removeLicenses: []
);

$updatedUser = MicrosoftGraph::users()
    ->withEmail('john.doe@company.com')
    ->assignLicense($builder);
```

---

## Profile Photos

### Get User Profile Photo

Download a user's profile photo.

**API Reference:** [Get Photo](https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http)

```php
$response = MicrosoftGraph::users()
    ->withEmail('john.doe@company.com')
    ->getPhoto();

// Save to file
file_put_contents('profile.jpg', $response->body());

// Or return as response
return response($response->body())
    ->header('Content-Type', 'image/jpeg');
```

### Update User Profile Photo

Upload a new profile photo for a user.

**API Reference:** [Update Photo](https://learn.microsoft.com/en-us/graph/api/profilephoto-update?view=graph-rest-1.0&tabs=http)

```php
$imageData = file_get_contents('/path/to/photo.jpg');

MicrosoftGraph::users()
    ->withEmail('john.doe@company.com')
    ->updatePhoto($imageData);
```

### Delete User Profile Photo

Remove a user's profile photo.

**API Reference:** [Delete Photo](https://learn.microsoft.com/en-us/graph/api/profilephoto-delete?view=graph-rest-1.0&tabs=http)

```php
MicrosoftGraph::users()
    ->withEmail('john.doe@company.com')
    ->deletePhoto();
```

---

## Calendar Management

### Get User Calendars

Retrieve all calendars for a user.

**API Reference:** [List Calendars](https://learn.microsoft.com/en-us/graph/api/user-list-calendars?view=graph-rest-1.0&tabs=http)

```php
$calendars = MicrosoftGraph::calendar()
    ->for('john.doe@company.com')
    ->get();

foreach ($calendars as $calendar) {
    echo $calendar->name;
}
```

### Get User Schedule

Get free/busy schedule information for one or more users.

**API Reference:** [Get Schedule](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0&tabs=http)

```php
use Carbon\Carbon;

$users = ['john.doe@company.com', 'jane.smith@company.com'];

$schedule = MicrosoftGraph::calendar()
    ->for('requester@company.com')
    ->schedule(
        users: $users,
        from: Carbon::now(),
        to: Carbon::now()->addDays(7),
        timezone: 'America/Chicago',
        interval: 60
    );
```

### Get Calendar View

Get calendar events within a specific time range.

**API Reference:** [List Calendar View](https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0&tabs=http)

```php
use Carbon\Carbon;

$events = MicrosoftGraph::calendar()
    ->for('john.doe@company.com')
    ->view(
        start: Carbon::now()->toIso8601String(),
        end: Carbon::now()->addMonth()->toIso8601String()
    );
```

---

## Event Management

### Get User Events

Retrieve calendar events for a user.

**API Reference:** [List Events](https://learn.microsoft.com/en-us/graph/api/user-list-events?view=graph-rest-1.0&tabs=http)

```php
$events = MicrosoftGraph::event()
    ->for('john.doe@company.com')
    ->get();

foreach ($events as $event) {
    echo $event->subject;
    echo $event->start->dateTime;
    echo $event->end->dateTime;
}
```

### Filter Events

Use OData filters to query specific events.

**API Reference:** [Filter Query Parameter](https://learn.microsoft.com/en-us/graph/filter-query-parameter?tabs=http)

```php
// Get events within a date range
$events = MicrosoftGraph::event()
    ->for('john.doe@company.com')
    ->where('start/dateTime', 'ge', '2024-01-01')
    ->where('end/dateTime', 'le', '2024-12-31')
    ->get();

// Use OR conditions
$events = MicrosoftGraph::event()
    ->for('john.doe@company.com')
    ->where('subject', 'eq', 'Team Meeting')
    ->orWhere('subject', 'eq', 'All Hands')
    ->get();
```

### Create an Event

Create a new calendar event using a CalendarEvent class.

**API Reference:** [Create Event](https://learn.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0&tabs=http)

**Step 1:** Generate an event class:

```bash
php artisan make:graph-event TeamMeetingEvent
```

**Step 2:** Configure the event class:

```php
<?php

namespace App\Mail;

use PrasadChinwal\MicrosoftGraph\Calendar\Event\CalendarEvent;
use PrasadChinwal\MicrosoftGraph\Calendar\Event\Eventable\Envelope;
use PrasadChinwal\MicrosoftGraph\Calendar\Event\Eventable\Attendee;
use PrasadChinwal\MicrosoftGraph\Calendar\Event\Eventable\Enums\CalendarEventImportance;
use Illuminate\Mail\Mailables\Content;
use Carbon\Carbon;

class TeamMeetingEvent extends CalendarEvent
{
    public function envelope(): Envelope
    {
        return new Envelope(
            from: 'organizer@company.com',
            subject: 'Weekly Team Sync',
            attendees: [
                new Attendee('john.doe@company.com', 'John Doe', required: true),
                new Attendee('jane.smith@company.com', 'Jane Smith', required: false),
            ],
            start: Carbon::parse('2024-12-20 10:00:00'),
            end: Carbon::parse('2024-12-20 11:00:00'),
            location: 'Conference Room A',
            importance: CalendarEventImportance::HIGH->value,
            isOnlineMeeting: true,
            reminder: true
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.team-meeting',
            with: ['agenda' => 'Sprint planning and retrospective']
        );
    }
}
```

**Step 3:** Create the event:

```php
use App\Mail\TeamMeetingEvent;

$response = MicrosoftGraph::event()->create(new TeamMeetingEvent());
```

### Update an Event

Update an existing calendar event.

**API Reference:** [Update Event](https://learn.microsoft.com/en-us/graph/api/event-update?view=graph-rest-1.0&tabs=http)

```php
$response = MicrosoftGraph::event()->update(
    eventId: 'AAMkAGI2...',
    mailable: new TeamMeetingEvent()
);
```

### Accept an Event

Accept a meeting invitation.

**API Reference:** [Accept Event](https://learn.microsoft.com/en-us/graph/api/event-accept?view=graph-rest-1.0&tabs=http)

```php
MicrosoftGraph::event()
    ->for('john.doe@company.com')
    ->accept(
        eventId: 'AAMkAGI2...',
        message: 'Looking forward to it!'
    );
```

### Decline an Event

Decline a meeting invitation.

**API Reference:** [Decline Event](https://learn.microsoft.com/en-us/graph/api/event-decline?view=graph-rest-1.0&tabs=http)

```php
MicrosoftGraph::event()
    ->for('john.doe@company.com')
    ->decline(
        eventId: 'AAMkAGI2...',
        message: 'Unable to attend due to conflict.'
    );
```

### Cancel an Event

Cancel a meeting (organizer only).

**API Reference:** [Cancel Event](https://learn.microsoft.com/en-us/graph/api/event-cancel?view=graph-rest-1.0&tabs=http)

```php
MicrosoftGraph::event()
    ->for('organizer@company.com')
    ->cancel(
        eventId: 'AAMkAGI2...',
        message: 'Meeting cancelled due to unforeseen circumstances.'
    );
```

---

## Mail Management

### Get User Messages

Retrieve email messages for a user.

**API Reference:** [List Messages](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0&tabs=http)

```php
$messages = MicrosoftGraph::mail()
    ->for('john.doe@company.com')
    ->top(50)
    ->get();
```

### Filter Messages

Apply OData filters to retrieve specific messages.

```php
// Get unread messages
$messages = MicrosoftGraph::mail()
    ->for('john.doe@company.com')
    ->where('isRead', '!=', 'true')
    ->top(25)
    ->get();

// Get messages from a specific sender
$messages = MicrosoftGraph::mail()
    ->for('john.doe@company.com')
    ->where('from/emailAddress/address', '=', 'sender@example.com')
    ->get();

// Filter by received date
$messages = MicrosoftGraph::mail()
    ->for('john.doe@company.com')
    ->where('receivedDateTime', '>=', '2024-01-01T00:00:00Z')
    ->top(100)
    ->get();
```

---

## Sending Email

### Send Email via Outlook

Send an email on behalf of a user.

**API Reference:** [Send Mail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=http)

```php
// Send to a single recipient
MicrosoftGraph::outlook()
    ->for('sender@company.com')
    ->sendEmail(
        subject: 'Project Update',
        message: 'The project is progressing well...',
        to: 'recipient@company.com'
    );

// Send to multiple recipients
MicrosoftGraph::outlook()
    ->for('sender@company.com')
    ->sendEmail(
        subject: 'Team Announcement',
        message: 'Please review the attached document...',
        to: [
            'john.doe@company.com',
            'jane.smith@company.com',
            'team@company.com'
        ]
    );
```

---

## Team Configuration

### Get User Team Configuration

**API Reference:** [User Team Configuration](https://learn.microsoft.com/en-us/graph/api/teamsadministration-teamsadminroot-list-userconfigurations?view=graph-rest-beta&tabs=http)

```php
use PrasadChinwal\MicrosoftGraph\Facades\MicrosoftGraph;
$data = MicrosoftGraph::teamConfiguration()
        ->where(field: 'id', operator: '=', value: '109c9587-bdf8-4f84-ba53-01c7ab2efa22')
        ->get();
    dd($data->first()->telephoneNumbers->pluck('telephoneNumber'));
```

### Helper Methods

Check is users Enterprise Voice is enabled:

```php
use PrasadChinwal\MicrosoftGraph\Facades\MicrosoftGraph;
$data = MicrosoftGraph::teamConfiguration()
        ->where(field: 'id', operator: '=', value: '109c9587-bdf8-4f84-ba53-01c7ab2efa22')
        ->get();
    dd($data->first()->hasEnterpriseVoiceEnabled());
```

---

## Number Assignments

### List numberAssignments

**API Reference:** [List numberAssignments](https://learn.microsoft.com/en-us/graph/api/teamsadministration-telephonenumbermanagementroot-list-numberassignments?view=graph-rest-beta&tabs=http)

```php
use PrasadChinwal\MicrosoftGraph\Facades\MicrosoftGraph;
$data = MicrosoftGraph::numberAssignement()
        // ->where(field: 'assignmentStatus', operator: '=', value: 'unassigned')
        // ->where('telephoneNumber', '=', '+222222222')
        ->get();
    dd($data);
```

---

## Attachment Management

Microsoft Graph API supports three types of attachments:
- **File Attachments** - Binary files (up to 3MB)
- **Item Attachments** - Embedded contacts, events, or messages
- **Reference Attachments** - Links to files on OneDrive, Dropbox, etc.

### List Attachments

Get all attachments for a message or event.

**API Reference:** [List Attachments](https://learn.microsoft.com/en-us/graph/api/message-list-attachments?view=graph-rest-1.0&tabs=http)

```php
// List message attachments
$attachments = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->list();

foreach ($attachments as $attachment) {
    echo $attachment->name;
    echo $attachment->contentType;
    echo $attachment->size;
}

// List event attachments
$attachments = MicrosoftGraph::attachments()
    ->forEvent('john.doe@company.com', 'eventId')
    ->list();
```

### Get Attachment Metadata

Retrieve metadata for a specific attachment.

**API Reference:** [Get Attachment](https://learn.microsoft.com/en-us/graph/api/attachment-get?view=graph-rest-1.0&tabs=http)

```php
$attachment = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->get('attachmentId');

echo $attachment->id;
echo $attachment->name;
echo $attachment->contentType;
echo $attachment->size;
echo $attachment->lastModifiedDateTime;
```

### Download Attachment Content

Download the raw binary content of a file attachment.

```php
$response = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->getRaw('attachmentId');

// Save to file
file_put_contents('downloaded_file.pdf', $response->body());

// Or return as HTTP response
return response($response->body())
    ->header('Content-Type', $response->header('Content-Type'));
```

### Add File Attachment

Upload a file attachment (up to 3MB).

**API Reference:** [Add Attachment](https://learn.microsoft.com/en-us/graph/api/message-post-attachments?view=graph-rest-1.0&tabs=http)

**From File Path:**

```php
use PrasadChinwal\MicrosoftGraph\Builder\Attachment\FileAttachmentBuilder;

// Create attachment from file
$builder = FileAttachmentBuilder::fromFile('/path/to/document.pdf');

$attachment = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->addFile($builder);

echo $attachment->id;  // Use this ID for future operations
```

**From Binary Data:**

```php
use PrasadChinwal\MicrosoftGraph\Builder\Attachment\FileAttachmentBuilder;

$imageData = file_get_contents('/path/to/image.jpg');

$builder = FileAttachmentBuilder::fromData(
    data: $imageData,
    name: 'profile-photo.jpg',
    contentType: 'image/jpeg'
);

$attachment = MicrosoftGraph::attachments()
    ->forEvent('john.doe@company.com', 'eventId')
    ->addFile($builder);
```

**Inline Attachment (for emails):**

```php
use PrasadChinwal\MicrosoftGraph\Builder\Attachment\FileAttachmentBuilder;

$builder = FileAttachmentBuilder::fromFile('/path/to/logo.png')
    ->asInline('logo-cid');

$attachment = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'draftMessageId')
    ->addFile($builder);

// Reference in HTML body as: <img src="cid:logo-cid">
```

### Add Reference Attachment

Add a link to a file stored on OneDrive, Dropbox, or other cloud storage.

```php
use PrasadChinwal\MicrosoftGraph\Builder\Attachment\ReferenceAttachmentBuilder;

$builder = ReferenceAttachmentBuilder::fromUrl(
    url: 'https://contoso.sharepoint.com/documents/report.xlsx',
    name: 'Q4 Financial Report'
)
->setProvider('oneDriveBusiness')
->setPermission('edit')
->setThumbnail('https://contoso.sharepoint.com/thumbnails/report_thumb.png');

$attachment = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->addReference($builder);
```

**Available Providers:**
- `oneDriveBusiness`
- `oneDriveConsumer`
- `dropbox`

**Available Permissions:**
- `view` - Read-only access
- `edit` - Read and write access
- `anonymousView` - Public read-only
- `anonymousEdit` - Public read and write
- `organizationView` - Organization read-only
- `organizationEdit` - Organization read and write

### Add Custom Attachment

Add an attachment using custom array data for advanced scenarios.

```php
$attachmentData = [
    '@odata.type' => '#microsoft.graph.fileAttachment',
    'name' => 'custom-document.txt',
    'contentBytes' => base64_encode('Hello, World!'),
    'contentType' => 'text/plain',
];

$attachment = MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->create($attachmentData);
```

### Delete Attachment

Remove an attachment from a message or event.

**API Reference:** [Delete Attachment](https://learn.microsoft.com/en-us/graph/api/attachment-delete?view=graph-rest-1.0&tabs=http)

```php
MicrosoftGraph::attachments()
    ->forMessage('john.doe@company.com', 'messageId')
    ->delete('attachmentId');

// Or for events
MicrosoftGraph::attachments()
    ->forEvent('john.doe@company.com', 'eventId')
    ->delete('attachmentId');
```

### Complete Example: Sending Email with Attachments

```php
use PrasadChinwal\MicrosoftGraph\Builder\Attachment\FileAttachmentBuilder;

// 1. Create a draft message
$message = MicrosoftGraph::mail()->createDraft([
    'subject' => 'Project Report',
    'body' => [
        'contentType' => 'HTML',
        'content' => '<p>Please find attached the project report.</p>'
    ],
    'toRecipients' => [
        ['emailAddress' => ['address' => 'manager@company.com']]
    ]
]);

// 2. Add attachments
$pdfBuilder = FileAttachmentBuilder::fromFile('/reports/project-report.pdf');
$excelBuilder = FileAttachmentBuilder::fromFile('/reports/data.xlsx');

MicrosoftGraph::attachments()
    ->forMessage('sender@company.com', $message['id'])
    ->addFile($pdfBuilder);

MicrosoftGraph::attachments()
    ->forMessage('sender@company.com', $message['id'])
    ->addFile($excelBuilder);

// 3. Send the message
MicrosoftGraph::mail()->send($message['id']);
```

### Size Limitations

**Important:** The direct attachment API supports files up to **3MB**. For larger files (3-150MB), use the upload session method:

```php
// Files larger than 3MB throw an exception
try {
    $builder = FileAttachmentBuilder::fromFile('/large-file.zip');
} catch (\InvalidArgumentException $e) {
    // Handle large file - use upload session instead
    // (Upload session not yet implemented in this package)
}
```

### Attachment Types Reference

| Type | Use Case | Max Size | Properties |
|------|----------|----------|----------|
| **fileAttachment** | Documents, images, files | 3 MB | `contentBytes`, `contentType`, `name` |
| **itemAttachment** | Embedded contacts, events, messages | 3 MB | `item` (nested object) |
| **referenceAttachment** | OneDrive, SharePoint, Dropbox links | N/A | `sourceUrl`, `providerType`, `permission` |

---

## Error Handling

The package includes custom exceptions for better error handling:

### Exception Classes

- `MicrosoftGraphException` - Base exception class
- `AuthenticationException` - OAuth/token errors
- `InvalidEmailException` - Invalid email format
- `ConfigurationException` - Missing or invalid configuration

### Example Usage

```php
use PrasadChinwal\MicrosoftGraph\Exceptions\InvalidEmailException;
use PrasadChinwal\MicrosoftGraph\Exceptions\ConfigurationException;
use Illuminate\Http\Client\RequestException;

try {
    $user = MicrosoftGraph::users()->find('invalid-email');
} catch (InvalidEmailException $e) {
    // Handle invalid email format
    return response()->json(['error' => $e->getMessage()], 400);
} catch (ConfigurationException $e) {
    // Handle configuration issues
    Log::error('Microsoft Graph configuration error: ' . $e->getMessage());
    return response()->json(['error' => 'Service unavailable'], 503);
} catch (RequestException $e) {
    // Handle API request failures
    Log::error('Microsoft Graph API error: ' . $e->getMessage());
    return response()->json(['error' => 'External service error'], 502);
}
```

### Configuration Validation

The package automatically validates configuration on boot:

```php
// If configuration is missing or invalid, a ConfigurationException will be thrown
// Example error messages:
// "Microsoft Graph configuration 'TENANT_ID' is not set. Please ensure MICROSOFT_GRAPH_TENANT_ID is set in your .env file."
// "Microsoft Graph configuration 'timezone' is invalid: Invalid timezone identifier"
```

---

## Advanced Features

### Token Caching

Access tokens are automatically cached with a 5-minute buffer before expiry. This significantly improves performance by preventing redundant OAuth requests.

To manually clear the token cache (useful for testing):

```php
$graph = new MicrosoftGraph();
$graph->clearTokenCache();
```

### Custom Timezone

Set a custom timezone for calendar operations in your `.env`:

```env
APP_TIMEZONE=America/New_York
```

Or directly in the config file:

```php
'timezone' => 'Europe/London',
```

### Data Transfer Objects

All responses are returned as strongly-typed Spatie Data objects:

```php
$user = MicrosoftGraph::users()->find('john.doe@company.com');

// Full IDE autocomplete support
$user->displayName;      // string
$user->accountEnabled;   // bool
$user->businessPhones;   // array
$user->interests;        // array|null
```

---

## Testing

The package includes factories and helpers for testing. You can mock the Microsoft Graph API in your tests:

```php
use Illuminate\Support\Facades\Http;

public function test_user_retrieval()
{
    Http::fake([
        'graph.microsoft.com/*' => Http::response([
            'value' => [
                [
                    'displayName' => 'Test User',
                    'mail' => 'test@example.com',
                    // ... other fields
                ]
            ]
        ], 200)
    ]);

    $users = MicrosoftGraph::users()->get();

    $this->assertCount(1, $users);
    $this->assertEquals('Test User', $users->first()->displayName);
}
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security-related issues, please email the package author instead of using the issue tracker.

## Credits

- [Prasad Chinwal](https://github.com/prasadchinwal)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Support

For support, please open an issue on GitHub or contact the maintainer.

## Links

- **Microsoft Graph API Documentation:** https://learn.microsoft.com/en-us/graph/
- **Azure Portal:** https://portal.azure.com
- **Package Repository:** https://github.com/prasadchinwal/microsoft-graph
