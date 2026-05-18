# SlickText Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bilalhaidar/laravel-slicktext.svg?style=flat-square)](https://packagist.org/packages/bilalhaidar/laravel-slicktext)
[![Total Downloads](https://img.shields.io/packagist/dt/bilalhaidar/laravel-slicktext.svg?style=flat-square)](https://packagist.org/packages/bilalhaidar/laravel-slicktext)
[![License](https://img.shields.io/packagist/l/bilalhaidar/laravel-slicktext.svg?style=flat-square)](https://packagist.org/packages/bilalhaidar/laravel-slicktext)

A comprehensive, feature-rich Laravel wrapper for the SlickText SMS Marketing API v2. This package provides an elegant, fluent interface for managing SMS campaigns, contacts, lists, and all SlickText features directly from your Laravel application.

## Features

- 🚀 **Full API Coverage** - Complete support for all SlickText API v2 endpoints
- 💬 **Contact Management** - Create, update, delete, and manage SMS contacts
- 📱 **Campaign Management** - Send SMS/MMS campaigns, schedule messages
- 📋 **List Management** - Organize contacts into lists and segments
- 📊 **Analytics** - Track campaign performance and contact engagement
- 💼 **Multi-Brand Support** - Easily switch between multiple SlickText brands
- 🎯 **Inbox Conversations** - Manage one-on-one SMS conversations
- ⚡ **Laravel Integration** - Facade support, service container binding
- 🔒 **Exception Handling** - Granular exceptions for different error types
- ✅ **Fully Tested** - Comprehensive test suite included

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x, or 12.x
- A SlickText account with API access

## Installation

### Step 1: Install via Composer

```bash
composer require bilalhaidar/laravel-slicktext
```

### Step 2: Publish Configuration (Optional)

The package auto-discovers the service provider. Optionally publish the config file:

```bash
php artisan vendor:publish --tag=slicktext-config
```

This creates `config/slicktext.php`.

### Step 3: Add Credentials to .env

Add your SlickText API credentials to your `.env` file:

```env
SLICKTEXT_API_KEY=your_api_key_here
SLICKTEXT_BRAND_ID=your_brand_id_here
SLICKTEXT_BASE_URL=https://dev.slicktext.com/v1
```

**Where to find your credentials:**
- API Key: https://app.slicktext.com/settings/api
- Brand ID: Visible in your SlickText dashboard URL

### Step 4: Verify Installation

Test the integration in `tinker`:

```bash
php artisan tinker
```

```php
use BilalHaidar\SlickText\Facades\SlickText;

SlickText::brands()->get();
```

If you see your brand information, you're all set! 🎉

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=slicktext-config
```

Add your credentials to `.env`:

```env
SLICKTEXT_API_KEY=your_api_key_here
SLICKTEXT_BRAND_ID=your_brand_id_here
```

## Quick Start

### Using the Facade

```php
use BilalHaidar\SlickText\Facades\SlickText;

// Get brand information
$brand = SlickText::brands()->get();

// Create a contact
$contact = SlickText::contacts()->create([
    'mobile_number' => '+16155553338',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'john@example.com',
    'opt_in_status' => 'subscribed',
]);

// Send a campaign
$campaign = SlickText::campaigns()->sendNow(
    'Hello! Check out our sale today!',
    ['list_id_1', 'list_id_2']
);
```

### Using Dependency Injection (Recommended)

```php
use BilalHaidar\SlickText\SlickText;

class SmsController extends Controller
{
    public function __construct(
        protected SlickText $slickText
    ) {}

    public function sendMessage()
    {
        $campaign = $this->slickText->campaigns()->sendNow(
            'Your message here',
            ['list_id']
        );
    }
}
```

## Working with Multiple Brands

```php
// Switch to a different brand
$otherBrand = SlickText::forBrand('other_brand_id');
$contacts = $otherBrand->contacts()->all();

// Or in one line
$contacts = SlickText::forBrand('brand_id')->contacts()->all();
```

## Resources

### Contacts

```php
// List all contacts with pagination
$contacts = SlickText::contacts()->all([
    'page' => 0,
    'pageSize' => 50,
]);

// Iterate through results
foreach ($contacts as $contact) {
    echo $contact['first_name'];
}

// Check for more pages
if ($contacts->hasMore()) {
    $nextPage = SlickText::contacts()->all([
        'page' => $contacts->nextPage(),
    ]);
}

// Find a contact by ID
$contact = SlickText::contacts()->find('contact_id');

// Find by mobile number
$contact = SlickText::contacts()->findByMobile('+16155553338');

// Find by email
$contact = SlickText::contacts()->findByEmail('john@example.com');

// Create a new contact
$contact = SlickText::contacts()->create([
    'mobile_number' => '+16155553338',
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'john@example.com',
    'birthdate' => '1990-01-15',
    'city' => 'Nashville',
    'state' => 'TN',
    'zip' => '37201',
    'country' => 'US',
    'timezone' => 'America/Chicago',
    'opt_in_status' => 'subscribed',
    'favorite_color' => 'blue', // Custom field
]);

// Update a contact
$contact = SlickText::contacts()->update('contact_id', [
    'first_name' => 'Jane',
    'email' => 'jane@example.com',
]);

// Subscribe/unsubscribe
SlickText::contacts()->subscribe('contact_id');
SlickText::contacts()->unsubscribe('contact_id');

// Delete a contact
SlickText::contacts()->delete('contact_id');

// Upsert (create or update) by mobile
$contact = SlickText::contacts()->upsertByMobile('+16155553338', [
    'first_name' => 'Updated Name',
]);

// Bulk create contacts
$results = SlickText::contacts()->bulkCreate([
    ['mobile_number' => '+16155553331', 'first_name' => 'John'],
    ['mobile_number' => '+16155553332', 'first_name' => 'Jane'],
    ['mobile_number' => '+16155553333', 'first_name' => 'Bob'],
]);
```

### Campaigns

```php
// List campaigns
$campaigns = SlickText::campaigns()->all();

// Get specific campaign
$campaign = SlickText::campaigns()->find('campaign_id');

// Send immediately
$campaign = SlickText::campaigns()->sendNow(
    'Your message here',
    ['list_id_1', 'list_id_2'],
    ['name' => 'Flash Sale Campaign']
);

// Schedule for later
$campaign = SlickText::campaigns()->schedule(
    'Your scheduled message',
    ['list_id'],
    '2025-02-01T10:00:00Z',
    ['name' => 'Scheduled Campaign']
);

// Send to segments
$campaign = SlickText::campaigns()->sendToSegments(
    'Message for segment',
    ['segment_id_1', 'segment_id_2']
);

// Send MMS with media
$campaign = SlickText::campaigns()->sendMms(
    'Check out this image!',
    'https://example.com/image.jpg',
    ['list_id']
);

// Get sent campaigns
$sent = SlickText::campaigns()->sent();

// Get scheduled campaigns
$scheduled = SlickText::campaigns()->scheduled();

// Get draft campaigns
$drafts = SlickText::campaigns()->drafts();

// Update an unsent campaign
SlickText::campaigns()->update('campaign_id', [
    'body' => 'Updated message content',
]);

// Delete a campaign
SlickText::campaigns()->delete('campaign_id');
```

### Lists

```php
// Get all lists
$lists = SlickText::lists()->all();

// Create a list
$list = SlickText::lists()->create([
    'name' => 'VIP Customers',
    'description' => 'Our most valued customers',
]);

// Find or create a list
$list = SlickText::lists()->firstOrCreate('Newsletter Subscribers');

// Get contacts in a list
$contacts = SlickText::lists()->getContacts('list_id');

// Get contact count
$count = SlickText::lists()->getContactCount('list_id');

// Add contacts to lists
SlickText::lists()->addContacts(
    ['contact_id_1', 'contact_id_2'],
    ['list_id_1', 'list_id_2']
);

// Add single contact
SlickText::lists()->addContact('contact_id', 'list_id');

// Remove contacts from lists
SlickText::lists()->removeContacts(['contact_id'], ['list_id']);

// Remove single contact
SlickText::lists()->removeContact('contact_id', 'list_id');

// Update a list
SlickText::lists()->update('list_id', ['name' => 'Updated Name']);

// Delete a list
SlickText::lists()->delete('list_id');
```

### Messages

```php
// Get all messages
$messages = SlickText::messages()->all();

// Get a specific message
$message = SlickText::messages()->find('message_id');

// Get messages sent after a date
$messages = SlickText::messages()->sentAfter('2025-01-01');

// Get messages sent before a date
$messages = SlickText::messages()->sentBefore('2025-01-31');

// Get messages in a date range
$messages = SlickText::messages()->betweenDates('2025-01-01', '2025-01-31');

// Get messages for a specific contact
$messages = SlickText::messages()->forContact('contact_id');
```

### Segments

```php
// Get all segments
$segments = SlickText::segments()->all();

// Get a specific segment
$segment = SlickText::segments()->find('segment_id');

// Get contacts in a segment
$contacts = SlickText::segments()->getContacts('segment_id');

// Get contact count
$count = SlickText::segments()->getContactCount('segment_id');

// Update a segment
SlickText::segments()->update('segment_id', ['name' => 'Updated Segment']);

// Delete a segment
SlickText::segments()->delete('segment_id');
```

### Custom Fields

```php
// Get all custom fields
$fields = SlickText::customFields()->all();

// Create a custom field
$field = SlickText::customFields()->create([
    'name' => 'favorite_product',
    'type' => 'text',
]);

// Update a custom field
SlickText::customFields()->update('field_id', ['name' => 'preferred_product']);

// Delete a custom field
SlickText::customFields()->delete('field_id');
```

### Links (Trackable Short Links)

```php
// Get all links
$links = SlickText::links()->all();

// Create a short link
$link = SlickText::links()->shorten('https://example.com/sale', 'Summer Sale');

// Update a link
SlickText::links()->update('link_id', ['name' => 'Updated Link Name']);

// Delete a link
SlickText::links()->delete('link_id');
```

### Workflows

```php
// Get all workflows
$workflows = SlickText::workflows()->all();

// Get a specific workflow
$workflow = SlickText::workflows()->find('workflow_id');

// Enable a workflow
SlickText::workflows()->enable('workflow_id');

// Disable a workflow
SlickText::workflows()->disable('workflow_id');

// Delete a workflow
SlickText::workflows()->delete('workflow_id');
```

### Analytics

```php
// Get contact counts
$counts = SlickText::analytics()->contactCounts();

// Get contact growth
$growth = SlickText::analytics()->contactGrowth();

// Get campaign analytics
$analytics = SlickText::analytics()->campaigns();

// Get specific campaign analytics
$campaignAnalytics = SlickText::analytics()->campaign('campaign_id');

// Get message analytics
$messageAnalytics = SlickText::analytics()->messages();

// Get message credit usage
$credits = SlickText::analytics()->messageCredits();

// Get workflow analytics
$workflowAnalytics = SlickText::analytics()->workflow('workflow_id');
```

### Inbox (One-on-One Conversations)

```php
// Get all conversations
$conversations = SlickText::inbox()->conversations();

// Get open conversations
$open = SlickText::inbox()->openConversations();

// Get closed conversations
$closed = SlickText::inbox()->closedConversations();

// Get unassigned conversations
$unassigned = SlickText::inbox()->unassignedConversations();

// Get a specific conversation
$conversation = SlickText::inbox()->findConversation('conversation_id');

// Close a conversation
SlickText::inbox()->closeConversation('conversation_id');

// Reopen a conversation
SlickText::inbox()->reopenConversation('conversation_id');

// Assign a conversation
SlickText::inbox()->assignConversation('conversation_id', 'user_id');

// Unassign a conversation
SlickText::inbox()->unassignConversation('conversation_id');

// Get inbox tags
$tags = SlickText::inbox()->tags();

// Add tags to conversation
SlickText::inbox()->addTagsToConversation('conversation_id', ['tag_id_1', 'tag_id_2']);
```

### Brands

```php
// Get current brand info
$brand = SlickText::brands()->get();

// Get all accessible brands
$brands = SlickText::brands()->all();

// Get credit usage
$usage = SlickText::brands()->getCreditUsage();
```

### Keywords

```php
// Get all keywords
$keywords = SlickText::keywords()->all();

// Get a specific keyword
$keyword = SlickText::keywords()->find('keyword_id');

// Delete a keyword
SlickText::keywords()->delete('keyword_id');
```

### Popups

```php
// Get all popups
$popups = SlickText::popups()->all();

// Get a specific popup
$popup = SlickText::popups()->find('popup_id');

// Update a popup
SlickText::popups()->update('popup_id', ['status' => 'active']);

// Delete a popup
SlickText::popups()->delete('popup_id');
```

## Pagination

All list methods return a `PaginatedResponse` object:

```php
$contacts = SlickText::contacts()->all(['page' => 0, 'pageSize' => 50]);

// Get items
$items = $contacts->items();

// Check if there are more pages
if ($contacts->hasMore()) {
    $nextPageNumber = $contacts->nextPage();
}

// Get current page info
$currentPage = $contacts->currentPage();
$perPage = $contacts->perPage();

// Count items on current page
$count = count($contacts);

// Iterate directly
foreach ($contacts as $contact) {
    // ...
}

// Check if empty
if ($contacts->isEmpty()) {
    // No results
}

// Get first/last item
$first = $contacts->first();
$last = $contacts->last();
```

## Error Handling

```php
use YourVendor\SlickText\Exceptions\SlickTextException;
use YourVendor\SlickText\Exceptions\AuthenticationException;
use YourVendor\SlickText\Exceptions\NotFoundException;
use YourVendor\SlickText\Exceptions\ValidationException;
use YourVendor\SlickText\Exceptions\RateLimitException;

try {
    $contact = SlickText::contacts()->find('invalid_id');
} catch (NotFoundException $e) {
    // Contact not found (404)
    echo $e->getMessage();
} catch (AuthenticationException $e) {
    // Invalid API key or forbidden (401/403)
    echo $e->getMessage();
} catch (ValidationException $e) {
    // Validation error (422)
    echo $e->getMessage();
    print_r($e->getErrors());
} catch (RateLimitException $e) {
    // Rate limit exceeded (429)
    echo "Retry after: " . $e->getRetryAfter() . " seconds";
} catch (SlickTextException $e) {
    // Other API errors
    echo $e->getMessage();
    echo $e->getStatusCode();
}
```

## Rate Limiting

The API has a default rate limit of 8 requests per second (480 per minute). You can check your current rate limit status:

```php
$slickText = app('slicktext');
$rateLimitInfo = $slickText->getHttpClient()->getRateLimitInfo();

// Returns:
// [
//     'limit' => 480,
//     'remaining' => 479,
//     'reset_in_seconds' => 55,
// ]
```

## Webhooks

SlickText supports webhooks for various events. Configure your webhook URL in the SlickText dashboard and handle incoming webhooks:

```php
// In your routes/api.php
Route::post('/webhooks/slicktext', [SlickTextWebhookController::class, 'handle']);

// In your controller
class SlickTextWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        $event = $payload['event'] ?? null;

        switch ($event) {
            case 'contact.created':
                // Handle new contact
                break;
            case 'contact.edited':
                // Handle contact update
                break;
            case 'contact.deleted':
                // Handle contact deletion
                break;
            case 'campaign.sent':
                // Handle campaign sent
                break;
            case 'inbox.message.received':
                // Handle incoming message
                break;
            // Add more event handlers as needed
        }

        return response()->json(['received' => true]);
    }
}
```

## Testing

Run the test suite:

```bash
composer test
```

Or with coverage:

```bash
composer test-coverage
```

## Using This Package as a Template

This package can serve as an excellent example for building your own Laravel API wrappers. Here's how to use it as a reference:

### Architecture Overview

```
src/
├── Exceptions/          # Custom exception classes for API errors
├── Http/               # HTTP client handling authentication & requests
├── Resources/          # API resource classes (Contacts, Campaigns, etc.)
├── Support/            # Helper classes (PaginatedResponse)
├── Facades/            # Laravel facade
├── SlickText.php       # Main client class
└── SlickTextServiceProvider.php  # Laravel service provider
```

### Key Patterns Used

1. **Resource-Based Architecture**: Each API endpoint group has its own Resource class
2. **Fluent Interface**: Chainable methods for readable code
3. **Lazy Loading**: Resources are instantiated only when accessed
4. **Immutable Brand Switching**: `forBrand()` returns a new instance
5. **Exception Hierarchy**: Specific exceptions for different HTTP status codes
6. **Pagination Support**: Custom `PaginatedResponse` class for paginated results

### To Build Your Own API Wrapper

1. **Fork or clone this repository**
2. **Replace** the SlickText-specific code with your API
3. **Keep** the architectural patterns:
   - `Http/HttpClient.php` - Modify base URL and authentication
   - `Resources/BaseResource.php` - Adapt endpoint building logic
   - `Exceptions/` - Use same exception hierarchy
   - `Support/PaginatedResponse.php` - Reuse if your API paginates

4. **Update** the service provider and facades
5. **Write tests** using the same structure in `tests/`

### Example: Creating a New Resource

```php
namespace YourVendor\YourPackage\Resources;

use YourVendor\YourPackage\Support\PaginatedResponse;

class YourResource extends BaseResource
{
    public function all(array $options = []): PaginatedResponse
    {
        return $this->http->getPaginated(
            'your-endpoint',
            $this->buildListParams($options)
        );
    }

    public function find(string $id): array
    {
        return $this->http->get("your-endpoint/{$id}");
    }

    public function create(array $data): array
    {
        return $this->http->post('your-endpoint', $data);
    }
}
```

## Development & Contributing

We welcome contributions! This section explains how to set up the development environment.

### Setting Up Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/laravel-slicktext.git
   cd laravel-slicktext
   ```

3. **Install dependencies:**
   ```bash
   composer install
   ```

4. **Create a `.env` file for testing:**
   ```bash
   cp .env.example .env
   ```
   Add your test credentials:
   ```env
   SLICKTEXT_API_KEY=your_test_api_key
   SLICKTEXT_BRAND_ID=your_test_brand_id
   ```

5. **Run tests to verify setup:**
   ```bash
   composer test
   ```

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the existing code style

3. **Write tests** for new features:
   ```bash
   # Create test in tests/Unit/ or tests/Feature/
   # Run tests
   composer test
   ```

4. **Update documentation** if needed (README.md, docblocks)

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

### Coding Standards

- Follow PSR-12 coding standards
- Use PHP 8.1+ features (typed properties, constructor promotion)
- Write descriptive docblocks for public methods
- Use Laravel conventions (camelCase methods, snake_case config)
- Add type hints to all parameters and return values

### Running Code Quality Tools

```bash
# Run PHP CS Fixer (if configured)
composer format

# Run PHPStan (if configured)
composer analyse
```

## How to Fork and Add Features

### Forking for Your Own Use

If you want to customize this package for your specific needs:

1. **Fork the repository** to your GitHub account

2. **Update the package name** in `composer.json`:
   ```json
   {
       "name": "your-vendor/laravel-slicktext",
       "description": "Your custom SlickText integration"
   }
   ```

3. **Update namespaces** throughout the codebase:
   - Replace `BilalHaidar\SlickText` with `YourVendor\YourPackage`
   - Update in all PHP files
   - Update in `composer.json` autoload section
   - Update in tests

4. **Install from your fork:**
   ```json
   // In your Laravel app's composer.json
   {
       "repositories": [
           {
               "type": "vcs",
               "url": "https://github.com/your-username/laravel-slicktext"
           }
       ],
       "require": {
           "your-vendor/laravel-slicktext": "dev-main"
       }
   }
   ```

5. **Add your custom features** in new Resource classes or methods

### Adding New API Endpoints

Example: Adding a hypothetical "Templates" resource:

1. **Create the resource class:**
   ```bash
   # Create src/Resources/TemplateResource.php
   ```

   ```php
   <?php

   namespace BilalHaidar\SlickText\Resources;

   class TemplateResource extends BaseResource
   {
       public function all(array $options = []): PaginatedResponse
       {
           return $this->http->getPaginated(
               $this->brandEndpoint('templates'),
               $this->buildListParams($options)
           );
       }

       public function create(array $data): array
       {
           return $this->http->post(
               $this->brandEndpoint('templates'),
               $data
           );
       }
   }
   ```

2. **Register in main client** (`src/SlickText.php`):
   ```php
   protected ?TemplateResource $templates = null;

   public function templates(): TemplateResource
   {
       return $this->templates ??= new TemplateResource($this->http, $this->brandId);
   }
   ```

3. **Add to facade docblock** (`src/Facades/SlickText.php`):
   ```php
   /**
    * @method static TemplateResource templates()
    */
   ```

4. **Write tests** (`tests/Unit/TemplateResourceTest.php`)

5. **Update README** with usage examples

## Troubleshooting

### Common Issues

**"Class 'SlickText' not found"**
```bash
# Clear config cache
php artisan config:clear

# Regenerate autoload files
composer dump-autoload
```

**"Brand ID is required for this operation"**
- Ensure `SLICKTEXT_BRAND_ID` is set in `.env`
- Or explicitly set: `SlickText::forBrand('your_brand_id')`

**"Unauthenticated" or 401 errors**
- Verify your API key is correct in `.env`
- Check the key has proper permissions in SlickText dashboard

**Rate limit errors (429)**
- SlickText has a default limit of 8 requests/second
- Implement backoff/retry logic in your application
- Check rate limit info: `$client->getHttpClient()->getRateLimitInfo()`

**SSL Certificate errors**
- Update CA certificates: `composer update`
- Or set in config: `'verify' => false` (not recommended for production)

### Getting Help

- **Documentation**: https://api.slicktext.com/docs/v2/overview
- **Issues**: https://github.com/bhaidar/laravel-slicktext/issues
- **Email**: bhaidar@gmail.com

## Examples

See the `CreateContactAndSendInboxMessage.php` file for real-world examples including:
- Creating contacts and sending messages
- Building an SMS service class
- Controller integration
- MMS messages with media
- Inbox conversation management

## API Documentation

For complete SlickText API documentation:
- **API Overview**: https://api.slicktext.com/docs/v2/overview
- **Authorization**: https://api.slicktext.com/docs/v2/overview
- **Rate Limits**: https://api.slicktext.com/docs/v2/overview

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Credits

- **Author**: [Bilal Haidar](https://github.com/bilalhaidar)
- **SlickText API**: [SlickText](https://www.slicktext.com/)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
