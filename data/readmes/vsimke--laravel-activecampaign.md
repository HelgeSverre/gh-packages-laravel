# Laravel ActiveCampaign

A Laravel package for the [ActiveCampaign](https://www.activecampaign.com/) API.

<p align="center" dir="auto">
<a href="https://github.com/vsimke/laravel-activecampaign/actions"><img src="https://github.com/vsimke/laravel-activecampaign/workflows/tests/badge.svg" alt="Build Status" style="max-width: 100%;"></a>
<a href="https://packagist.org/packages/vsimke/laravel-activecampaign" rel="nofollow"><img src="https://img.shields.io/packagist/dt/vsimke/laravel-activecampaign" alt="Total Downloads" style="max-width: 100%;"></a>
<a href="https://packagist.org/packages/vsimke/laravel-activecampaign" rel="nofollow"><img src="https://img.shields.io/packagist/v/vsimke/laravel-activecampaign" alt="Latest Stable Version" style="max-width: 100%;"></a>
<a href="https://github.com/vsimke/laravel-activecampaign/releases" rel="nofollow"><img src="https://img.shields.io/github/v/tag/vsimke/laravel-activecampaign" alt="GitHub Tag" style="max-width: 100%;"></a>
<a href="https://packagist.org/packages/vsimke/laravel-activecampaign" rel="nofollow"><img src="https://img.shields.io/packagist/l/vsimke/laravel-activecampaign" alt="License" style="max-width: 100%;"></a>
</p>

> **⚠️ Beta Release**: This is an early release for testing and community feedback. The API is stable but real-world integration testing is ongoing. Expect minor changes before v1.0.0.

## Requirements

- PHP 8.2+ (PHP 8.3+ required for Laravel 13)
- Laravel 10, 11, 12, or 13

## Installation

```bash
composer require vsimke/laravel-activecampaign
```

### Publish the config file

```bash
php artisan vendor:publish --provider="Vsimke\ActiveCampaign\ActiveCampaignServiceProvider" --tag=activecampaign-config
```

### Publish and run the migration

```bash
php artisan vendor:publish --provider="Vsimke\ActiveCampaign\ActiveCampaignServiceProvider" --tag=activecampaign-migrations
php artisan migrate
```

## Configuration

Add your ActiveCampaign credentials to `.env`:

```env
ACTIVECAMPAIGN_URL=https://youraccountname.api-us1.com
ACTIVECAMPAIGN_KEY=your-api-key
```

Then configure lists and tags in `config/activecampaign.php`:

```php
'lists' => [
    ['slug' => 'newsletter', 'id' => 1],
    ['slug' => 'affiliates',  'id' => 2],
],

'tags' => [
    ['slug' => 'new-lead',  'name' => 'New Lead',  'id' => 10],
    ['slug' => 'converted', 'name' => 'Converted', 'id' => 11],
],
```

Slugs are application-level identifiers used throughout the package API. The `id` values come from your ActiveCampaign account.

## Custom Fields

The package stores the mapping of ActiveCampaign custom field IDs to their `perstag` identifiers in the `active_campaign_custom_fields` database table. Populate it by seeding or syncing from the API.

## Usage

### Facade

```php
use Vsimke\ActiveCampaign\Facades\ActiveCampaign;

$contact = ActiveCampaign::contacts()->find('john@example.com');
```

### Dependency injection

```php
use Vsimke\ActiveCampaign\ActiveCampaign;

class MyService
{
    public function __construct(private readonly ActiveCampaign $ac) {}

    public function sync(): void
    {
        $contact = $this->ac->contacts()->find('john@example.com');
    }
}
```

---

### Contacts

#### Find by email

```php
$contact = ActiveCampaign::contacts()->find('john@example.com');
// ['id' => '1', 'email' => 'john@example.com', ...]
```

#### Create or update (sync)

```php
use Vsimke\ActiveCampaign\Requests\CreateContactRequest;

$request = (new CreateContactRequest)
    ->setEmail('john@example.com')
    ->setFirstName('John')
    ->setLastName('Doe')
    ->setPhone('+41791234567')
    ->setFieldValue('COUNTRY', 'Switzerland');   // perstag => value

$contact = ActiveCampaign::contacts()->updateOrCreate($request);
```

> `setFieldValue()` accepts a `perstag` string. The package resolves it to the
> ActiveCampaign field ID at runtime using the `active_campaign_custom_fields` table.

#### Update by ID

```php
$contact = ActiveCampaign::contacts()->update(42, $request);
```

#### Remove

```php
ActiveCampaign::contacts()->remove(42);
```

#### Add to a list

```php
ActiveCampaign::contacts()->addToList($contactId, 'newsletter');
```

---

### Tags

```php
$tags = ActiveCampaign::contacts()->tags();

// Add a tag
$tags->add($contactId, 'new-lead');

// Remove a tag
$tags->remove($contactId, 'new-lead');

// Find a specific tag on a contact
$tag = $tags->find($contactId, 'new-lead');

// List all tags for a contact
$all = $tags->list($contactId);
```

---

### Custom Fields (API)

```php
use Vsimke\ActiveCampaign\Requests\CreateCustomFieldRequest;
use Vsimke\ActiveCampaign\Requests\UpdateCustomFieldRequest;

$fields = ActiveCampaign::contacts()->customFields();

// Create
$field = $fields->create(new CreateCustomFieldRequest([
    'title'   => 'Country',
    'type'    => 'text',
    'perstag' => 'COUNTRY',
]));

// Update
$field = $fields->update(1, new UpdateCustomFieldRequest([
    'title'   => 'Country (updated)',
    'type'    => 'text',
    'perstag' => 'COUNTRY',
]));

// List
$all = $fields->list();

// Remove
$fields->remove(1);

// Relate to a list
$fields->relationship($fieldId, $listId);
```

---

### Bulk import

```php
use Vsimke\ActiveCampaign\Requests\BulkCreateContactRequest;
use Vsimke\ActiveCampaign\Requests\BulkCreateContactsRequest;

$config = config('activecampaign');

$contact1 = (new BulkCreateContactRequest($config))
    ->setEmail('alice@example.com')
    ->setFirstName('Alice')
    ->addTag('new-lead')
    ->addToList('newsletter');

$contact2 = (new BulkCreateContactRequest($config))
    ->setEmail('bob@example.com')
    ->setFirstName('Bob')
    ->addToList('affiliates');

$bulk = (new BulkCreateContactsRequest([$contact1, $contact2]))
    ->setCallbackUrl(route('activecampaign.bulk_import.callback'))
    ->addParam('batch_id', 'abc-123');

$batchId = ActiveCampaign::contacts()->bulkUpdateOrCreate($bulk);
```

---

## Development

### Static analysis

```bash
./vendor/bin/phpstan analyse
```

### Rector

```bash
# Dry run
./vendor/bin/rector process --dry-run

# Apply changes
./vendor/bin/rector process
```

### Tests

```bash
./vendor/bin/pest
```

## License

MIT — see [LICENSE](https://opensource.org/licenses/MIT).
