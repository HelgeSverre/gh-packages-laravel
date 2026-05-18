# Laravel Snelstart

A Laravel package for the [Snelstart B2B API v2](https://b2bapi.snelstart.nl/v2) with an Eloquent-like interface. Query, create, update, and delete Snelstart resources using familiar Laravel syntax.

## Requirements

- PHP 8.2+
- Laravel 11, 12, or 13

## Installation

```bash
composer require jitso/laravel-snelstart
```

The service provider and facade are auto-discovered.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=snelstart-config
```

Add the following to your `.env`:

```dotenv
SNELSTART_SUBSCRIPTION_KEY=your-subscription-key
SNELSTART_CLIENT_KEY=your-oauth2-client-id
SNELSTART_CLIENT_SECRET=your-oauth2-client-secret
```

### Authentication type

The package supports two authentication methods. Set `SNELSTART_AUTH_TYPE` in your `.env`:

**OAuth2 (default)** -- uses `client_credentials` grant with client key + secret:

```dotenv
SNELSTART_AUTH_TYPE=oauth
SNELSTART_CLIENT_KEY=your-client-id
SNELSTART_CLIENT_SECRET=your-client-secret
```

**Client Key** -- uses the simpler `clientkey` grant with only a client key:

```dotenv
SNELSTART_AUTH_TYPE=clientkey
SNELSTART_CLIENT_KEY=your-client-key
```

### All config options

| Key | Env variable | Default |
|-----|-------------|---------|
| `subscription_key` | `SNELSTART_SUBSCRIPTION_KEY` | — |
| `authentication_type` | `SNELSTART_AUTH_TYPE` | `oauth` |
| `client_key` | `SNELSTART_CLIENT_KEY` | — |
| `client_secret` | `SNELSTART_CLIENT_SECRET` | — (only for `oauth`) |
| `base_url` | `SNELSTART_BASE_URL` | `https://b2bapi.snelstart.nl/v2` |
| `token_url` | `SNELSTART_TOKEN_URL` | `https://auth.snelstart.nl/b2b/token` |
| `cache_token` | `SNELSTART_CACHE_TOKEN` | `true` |

## Usage

### Basic CRUD

```php
use Jitso\LaravelSnelstart\Models\Artikel;

// Get all
$artikelen = Artikel::all();

// Find by ID
$artikel = Artikel::find('550e8400-e29b-41d4-a716-446655440000');

// Create
$artikel = Artikel::create([
    'artikelcode' => 'PROD-001',
    'omschrijving' => 'Voorbeeld product',
    'verkoopprijs' => 29.95,
]);

// Update
$artikel->update(['omschrijving' => 'Nieuwe omschrijving']);

// Delete
$artikel->delete();
```

### Query builder (OData)

Resources with OData support can be queried with a familiar builder syntax. Operators are automatically translated to OData filter expressions.

```php
use Jitso\LaravelSnelstart\Models\Relatie;

// Where clause (translates to $filter=naam eq 'Jitso')
$relaties = Relatie::where('naam', 'Jitso')->get();

// Comparison operators
$relaties = Relatie::where('krediettermijn', '>', 30)->get();

// Contains / starts with / ends with
$relaties = Relatie::query()
    ->whereContains('naam', 'holding')
    ->get();

// Pagination with $top and $skip
$relaties = Relatie::take(10)->skip(20)->get();

// Get the first result
$relatie = Relatie::where('naam', 'Jitso')->first();

// Combine multiple filters (joined with 'and')
$artikelen = Artikel::where('isNonActief', false)
    ->where('verkoopprijs', '>', 10)
    ->take(25)
    ->get();

// Raw OData filter
$artikelen = Artikel::filter("contains(omschrijving, 'test')")->get();

// Lazy pagination (automatically fetches all pages)
$alleRelaties = Relatie::query()->paginate(500);
```

**Supported operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, or pass OData operators directly (`eq`, `ne`, `gt`, `ge`, `lt`, `le`).

**Numeric OData filters (e.g. artikelcode):** PHP strings are sent as OData string literals (`artikelcode eq '1'`). If the API treats the field as a number and returns HTTP 400, use an integer or `whereInteger`:

```php
Artikel::query()->where('artikelcode', (int) $code)->first();
Artikel::whereInteger('artikelcode', (int) $code)->first();
```

You can also pass a raw filter: `Artikel::filter('artikelCode eq 1')->first();` (confirm field names and casing in the Snelstart API documentation).

#### HTTP 400 and `ValidationException`

The client maps **every** HTTP 400 response to `Jitso\LaravelSnelstart\Exceptions\ValidationException`. That includes OData/`$filter` problems on **GET** requests, not only validation on POST/PUT bodies. If the message looks generic, read the full API response:

```php
use Jitso\LaravelSnelstart\Exceptions\ValidationException;

try {
    Artikel::where('artikelcode', $code)->first();
} catch (ValidationException $e) {
    logger()->error('Snelstart 400', [
        'message' => $e->getMessage(),
        'errors' => $e->errors,
        'body' => $e->response?->body(),
        'json' => $e->response?->json(),
    ]);
    throw $e;
}
```

The exception message now includes `detail` / raw body snippets when the API omits a clear `message` or `title`.

#### Resolving artikel IDs without OData (workaround)

If lookup by code keeps failing, cache fixed UUIDs in your app config (example pattern):

```php
// config/snelstart_order.php — example only
'artikel_id_overrides' => [
    '1' => '00000000-0000-0000-0000-000000000001',
    '2' => '00000000-0000-0000-0000-000000000002',
],
```

```php
$id = config('snelstart_order.artikel_id_overrides')[$code] ?? null;
if ($id !== null) {
    return $id;
}
return Artikel::whereInteger('artikelcode', (int) $code)->first()?->id;
```

### firstOrCreate / updateOrCreate

Find-or-create and upsert patterns, just like Eloquent:

```php
use Jitso\LaravelSnelstart\Models\Relatie;
use Jitso\LaravelSnelstart\Models\Artikel;

// Find by attributes, or create with extra data
$relatie = Relatie::firstOrCreate(
    ['naam' => 'Jitso B.V.'],
    ['email' => 'info@jitso.nl', 'telefoon' => '0612345678'],
);

// Find by attributes, update if found, create if not
$artikel = Artikel::updateOrCreate(
    ['artikelcode' => 'PROD-001'],
    ['omschrijving' => 'Updated product', 'verkoopprijs' => 39.95],
);

// Get an unsaved instance if not found (useful for forms)
$artikel = Artikel::firstOrNew(['artikelcode' => 'NIEUW']);
$artikel->omschrijving = 'Handmatig ingevuld';
$artikel->save();

// Find by ID with fallback to empty instance
$artikel = Artikel::findOrNew('possibly-invalid-uuid');

// Also works via the query builder
$relatie = Relatie::where('naam', 'Jitso B.V.')
    ->firstOrCreate(['email' => 'info@jitso.nl']);

$artikel = Artikel::where('artikelcode', 'PROD-001')
    ->updateOrCreate(['verkoopprijs' => 49.95]);
```

### Sub-resources

Some models expose related resources as methods:

```php
$relatie = Relatie::find('uuid');

$inkoopboekingen = $relatie->inkoopboekingen();
$verkoopboekingen = $relatie->verkoopboekingen();
$machtigingen = $relatie->doorlopendeIncassomachtigingen();

// Custom fields (read & update)
$fields = $relatie->customFields();
$relatie->updateCustomFields([
    ['name' => 'MijnVeld', 'value' => 'waarde'],
]);
```

```php
$artikel = Artikel::find('uuid');

$fields = $artikel->customFields();
$artikel->updateCustomFields([...]);

// Article price agreements
$afspraken = Artikel::prijsafspraken();
$afspraken = Artikel::prijsafsprakenQuery()
    ->where('artikelCode', 'PROD-001')
    ->get();
```

### Special models

**CompanyInfo** -- singleton resource:

```php
use Jitso\LaravelSnelstart\Models\CompanyInfo;

$info = CompanyInfo::get();
$info->update(['bedrijfsnaam' => 'Nieuwe Naam B.V.']);
```

**Rapportage:**

```php
use Jitso\LaravelSnelstart\Models\Rapportage;

$balans = Rapportage::kolommenbalans();
$periode = Rapportage::periodebalans(['boekjaar' => 2025]);
```

**Documents & export (werkbon, pakbon, orderbevestiging, factuur):**

The B2B API exposes attachments and generated files under `documenten/{documentType}/{parentId}`. The exact path segment for each parent type and the POST body for creating or regenerating a document **must match the [Snelstart B2B developer portal](https://b2bapi-developer.snelstart.nl/)** for your subscription.

```php
use Jitso\LaravelSnelstart\Enums\DocumentParentType;
use Jitso\LaravelSnelstart\Enums\OrderDocumentSoort;
use Jitso\LaravelSnelstart\Models\Document;

$doc = Document::find('uuid');
$docs = Document::forParent('VerkoopBoeking', 'parent-uuid');
$docs = Document::forParentType(DocumentParentType::VerkoopBoeking, 'parent-uuid');

$doc = Document::createForType('VerkoopBoeking', [
    'parentIdentifier' => 'parent-uuid',
    'fileName' => 'factuur.pdf',
    'content' => base64_encode($pdfContent),
]);

// Verkooporder / offerte: merge extra fields from the API spec (document kind, template, etc.)
Document::createForVerkooporder($orderId, [
    // e.g. fields required to create a werkbon / pakbon / orderbevestiging — see portal
    // 'someDocumentKindField' => OrderDocumentSoort::Werkbon->value,
]);
Document::createForVerkoopBoeking($verkoopBoekingId, [...]);
Document::createForInkoopBoeking($inkoopBoekingId, [...]);
```

`Document::forParent` accepts a JSON array, OData `{ "value": [ ... ] }`, or a single document object; all are normalized to a collection of `Document` models.

**Models with document helpers:**

```php
$order = Verkooporder::find('uuid');
foreach ($order->documents() as $document) {
    $binary = $document->decodedContent(); // base64 → string, or null
}

$offerte = Offerte::find('uuid');
$offerte->documents();

// Relatie and Verkoopboeking / Inkoopboeking expose a `documents` attribute (identifiers); file rows from documenten/ use:
$relatie->documentFiles();
Verkoopboeking::find('uuid')->documentFiles();
Inkoopboeking::find('uuid')->documentFiles();
Memoriaalboeking::find('uuid')->documentFiles();
Bankboeking::find('uuid')->documentFiles();
Kasboeking::find('uuid')->documentFiles();
```

**Verkoopfactuur — UBL, PDF, and documenten:**

```php
$factuur = Verkoopfactuur::find('uuid');
$ubl = $factuur->ubl();              // JSON when the API returns application/json
$ublXml = $factuur->ublXml();        // raw XML when /ubl returns XML instead of JSON
$pdf = $factuur->pdf();              // raw bytes if GET …/pdf exists for your API version
$files = $factuur->documents();      // Document models via documenten/VerkoopFactuur/{id}
```

**Raw HTTP body (e.g. custom export endpoints):**

```php
use Jitso\LaravelSnelstart\Facades\Snelstart;

$bytes = Snelstart::getBody('some/path', [], ['Accept' => 'application/pdf']);
```

**Verkooporder processtatus:**

```php
use Jitso\LaravelSnelstart\Models\Verkooporder;

$order = Verkooporder::find('uuid');
$order->updateProcesStatus('Uitgevoerd');
```

**Inkoopboeking -- UBL & attachment import:**

```php
use Jitso\LaravelSnelstart\Models\Inkoopboeking;

Inkoopboeking::createFromUbl('factuur.xml', $xmlContent);
Inkoopboeking::createFromAttachment('scan.pdf', base64_encode($pdf));
```

**BTW aangifte:**

```php
use Jitso\LaravelSnelstart\Models\BtwAangifte;

$aangifte = BtwAangifte::find('uuid');
$aangifte->externAangeven(true);
```

### Using the Facade

For direct API access without models:

```php
use Jitso\LaravelSnelstart\Facades\Snelstart;

$response = Snelstart::get('artikelen', ['$top' => 10]);
$raw = Snelstart::getBody('custom/export/path');
$response = Snelstart::post('artikelen', ['artikelcode' => 'NEW']);
$response = Snelstart::put('artikelen/uuid', [...]);
Snelstart::delete('artikelen/uuid');
```

### Validation

Write models validate attributes at runtime. Each model defines which fields are `$fillable` (allowed) and which are `$required` (mandatory on create). A `ValidationException` is thrown when constraints are violated.

```php
use Jitso\LaravelSnelstart\Models\Verkoopboeking;
use Jitso\LaravelSnelstart\Exceptions\ValidationException;

try {
    // Missing required fields → ValidationException
    Verkoopboeking::create([
        'omschrijving' => 'Test',
    ]);
} catch (ValidationException $e) {
    // "Verkoopboeking: missing required fields: factuurnummer, klant, boekingsregels"
    $e->errors; // ['factuurnummer' => ['This field is required.'], ...]
}

try {
    // Unknown field → ValidationException
    Verkoopboeking::create([
        'factuurnummer' => 'F-001',
        'klant' => ['id' => '...'],
        'boekingsregels' => [...],
        'nietBestaandVeld' => 'oops',
    ]);
} catch (ValidationException $e) {
    // "Verkoopboeking: unknown fields: nietBestaandVeld"
}
```

Validation runs on both `create()` and `update()`. The `update()` method only checks fillable (not required), since partial updates are common.

All models expose their fields via `@property` PHPDoc annotations, so your IDE will autocomplete available field names when constructing arrays for `create()` and `update()`.

### Error handling

The package throws specific exceptions based on HTTP status codes:

```php
use Jitso\LaravelSnelstart\Exceptions\AuthenticationException;
use Jitso\LaravelSnelstart\Exceptions\NotFoundException;
use Jitso\LaravelSnelstart\Exceptions\ValidationException;
use Jitso\LaravelSnelstart\Exceptions\SnelstartException;

try {
    $artikel = Artikel::find('non-existent-uuid');
} catch (NotFoundException $e) {
    // 404
} catch (ValidationException $e) {
    // 400 or local validation -- access field errors via $e->errors
} catch (AuthenticationException $e) {
    // 401 / 403
} catch (SnelstartException $e) {
    // Any other API error
}
```

## Available models

Each model only exposes the methods its API endpoint actually supports. Your IDE autocompletion will only show relevant methods.

| Capability | Traits | Methods |
|---|---|---|
| Read | `CanRead` | `all()`, `find()`, `findOrNew()`, `query()`, `where()`, `take()`, `skip()`, `filter()` |
| Create | `CanCreate` | `create()`, `firstOrCreate()`, `firstOrNew()` |
| Update | `CanUpdate` | `update()` |
| Delete | `CanDelete` | `delete()` |
| Upsert | `CanUpsert` | `updateOrCreate()` |

### Full CRUD + OData

`Artikel`, `Bankboeking`, `Kasboeking`, `Relatie`, `Verkoopboeking`, `Verkooporder`, `Offerte`

### Full CRUD

`Kostenplaats`, `Inkoopboeking`, `Memoriaalboeking`

### Read + Create

`Grootboek`

### Read-only + OData

`GrootboekMutatie`, `Inkoopfactuur`, `Prijsafspraak`, `ArtikelPrijsafspraak`, `Verkoopfactuur`, `BtwAangifte`, `Actieprijzen`, `VatRate`, `VatRateDefinition`

### Read-only

`ArtikelOmzetgroep`, `Dagboek`, `Land`, `Verkoopordersjabloon`, `BtwTarief`

### Special

`CompanyInfo`, `Document`, `Rapportage`, `Bankafschriftbestand`, `Authorization`, `Echo`

## License

MIT
