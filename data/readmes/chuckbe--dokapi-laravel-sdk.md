## Dokapi Laravel SDK

This package consumes the Dokapi API.

### Installation

```
composer require chuckbe/dokapi-laravel-sdk
```

### Publish

Publish the config file with:
```
php artisan vendor:publish --tag="dokapi"
```

### Configuration & Environment

```php
return [
    'api_endpoint' => env('DOKAPI_API_ENDPOINT', 'https://peppol-api.dokapi-stg.io'),
    'oauth2_api_endpoint' => env('DOKAPI_OAUTH2_API_ENDPOINT', 'https://ixordocs.apiable.io/api/oauth2/token'),
    'client_id' => env('DOKAPI_CLIENT_ID'),
    'client_secret' => env('DOKAPI_CLIENT_SECRET'),
];
```
> Make sure to set up your environment variables and modify where necessary.

### Usage

Example:

```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->lookup->find('0208:0553792301');
```

### Endpoints

#### Lookup

This endpoint is to lookup participants in the SML (or SMK - test).

Parameters:
- ```string $value``` :: The participant identifier to lookup.
> For scheme ‘iso6523-actorid-upis’ the values should adhere to the  ‘ISO/IEC 6523’ standard with a semicolon seperator. [See full list of ICD’s](https://docs.peppol.eu/poacc/billing/3.0/codelist/ICD/). The value is a combination of an International Code Designator (ICD) and an organization ID. For instance, for Belgian companies, the ICD value is 0208 and the organization ID is the KBO number. Example: 0208:0123456789
- ```?string $scheme``` :: This parameter specifies the identification scheme. It is optional and defaults to iso6523-actorid-upis.

```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->lookup->find('0208:0553792301');
```

Response:
```Dokapi\Api\Resources\Lookup```

#### Participant registration

This endpoint is to register and deregister participants their business cards and document types.

##### Page

This will a paginated list of participant registrations registered by this client.

Parameters:
- ```?string $from = null``` :: From what key shall participants be returned
- ```?int $limit = null``` :: How many items on a page

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistations->page();
```

Response:
```Dokapi\Api\Resources\ParticipantRegistrationCollection```

##### All

This will get all participant registrations registered by this client.

Parameters:
- ```?string $from = null``` :: From what key shall participants be returned
- ```?int $limit = null``` :: How many items should be returned

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistations->page();
```

Response:
```Dokapi\Api\Resources\ParticipantRegistrationCollection```

##### Find

This will search for a participant registration registered by this client. This will not perform a full lookup.

Parameters:
- ```string $value``` :: The participant identifier to lookup.
> For scheme ‘iso6523-actorid-upis’ the values should adhere to the  ‘ISO/IEC 6523’ standard with a semicolon seperator. [See full list of ICD’s](https://docs.peppol.eu/poacc/billing/3.0/codelist/ICD/). The value is a combination of an International Code Designator (ICD) and an organization ID. For instance, for Belgian companies, the ICD value is 0208 and the organization ID is the KBO number. Example: 0208:0123456789
- ```?string $scheme``` :: This parameter specifies the identification scheme. It is optional and defaults to iso6523-actorid-upis.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistations->find('0208:0553792301');
```

Response:
```Dokapi\Api\Resources\ParticipantRegistrationCollection```

##### Create

This will create a participant registration for this client.

Parameters:
- ```array $data``` :: The array should exist out of the participant identifier, the country code and the business card info.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistrations->create([
    'participantIdentifier' => '0208:0553792301',
    'countryCode' => 'BE',
    'businessCardInfo' => [
        'name' => 'Company Name',
        'iso3166Alpha2CountryCode' => 'BE',
        'registrationDate' => now('UTC')->format('Y-m-d\TH:i:s.v\Z'),
    ]
]);
```

Response:
```Dokapi\Api\Resources\ParticipantRegistration```

##### Business card

This will perform a full replace of a participant's business card.

Parameters:
- ```array $data``` :: The array should exist out of the participant identifier and the business card info.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistrations->businessCard([
    'participantIdentifier' => '0208:0553792301',
    'businessCardInfo' => [
        'name' => 'Company Name',
        'iso3166Alpha2CountryCode' => 'BE',
        'registrationDate' => now('UTC')->format('Y-m-d\TH:i:s.v\Z'),
    ]
]);
```

Response:
```Dokapi\Api\Resources\Status```

##### Register document type

This will register a document type for a participant.

Parameters:
- ```array $data``` :: The array should exist out of the participant identifier, document type identifier and the process identifier.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistrations->registerDocumentType([
    'participantIdentifier' => [
        'scheme' => 'iso6523-actorid-upis', //optional
        'value' => '0208:0553792301'
    ],
    'documentTypeIdentifier' => [
        'scheme' => 'busdox-docid-qns',
        'value' => 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1'
    ],
    'processIdentifier' => [
        'scheme' => 'cenbii-procid-ubl',
        'value' => 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
    ]
]);
```

Response:
```Dokapi\Api\Resources\Status```

##### Deregister document type

This will deregister a document type for a participant.

Parameters:
- ```array $data``` :: The array should exist out of the participant identifier and document type identifier.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->participantRegistrations->deregisterDocumentType([
    'participantIdentifier' => [
        'scheme' => 'iso6523-actorid-upis', //optional
        'value' => '0208:0553792301'
    ],
    'documentTypeIdentifier' => [
        'scheme' => 'busdox-docid-qns',
        'value' => 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1'
    ]
]);
```

Response:
```Dokapi\Api\Resources\Status```

#### Incoming document

##### Confirm download

This endpoint will confirm Dokapi of the download of a file.

Parameters:
- ```string $documentUlid``` :: The document ulid that was given upon receival of the webhook.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->incomingDocuments->confirm($documentUlid);
```

Response:
```Dokapi\Api\Resources\IncomingDocument```

##### Generate presigned url

This endpoint will generate a new pre signed url if the existing one has been expired.

Parameters:
- ```string $documentUlid``` :: The document ulid that was given upon receival of the webhook.

Example:
```php
use Dokapi\Facades\Dokapi;

Dokapi::api()->incomingDocuments->generatePresignedUrl($documentUlid);
```

Response:
```Dokapi\Api\Resources\IncomingDocument```

#### Outgoing document

##### Create

This endpoint will create a new outgoing document.

Parameters:
- ```array $data``` :: Look at example...

Example:
```php
Dokapi::api()->outgoingDocuments->create([
    'sender' => [
        'scheme' => 'iso6523-actorid-upis', //optional
        'value' => '0208:0553792301'
    ],
    'receiver' => [
        'scheme' => 'iso6523-actorid-upis', //optional
        'value' => '0208:0123456789'
    ],
    'c1CountryCode' => 'BE',
    'documentTypeIdentifier' => [
        'scheme' => 'busdox-docid-qns',
        'value' => 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2::Invoice##urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0::2.1'
    ],
    'processIdentifier' => [
        'scheme' => 'cenbii-procid-ubl',
        'value' => 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
    ],
    'externalReference' => $documentToBeSent->id, // this is our internal reference of the document to be sent
]);
```

Response:
```Dokapi\Api\Resources\OutgoingDocument```

#### Webhook

##### All

This endpoint lists all webhooks registered.

Example:
```php
Dokapi::api()->webhooks->all();
```

Response:
```Dokapi\Api\Resources\WebhookCollection```

##### Create

This endpoint creates a webhook, this can be for multiple events. Possible events: 'outgoing-peppol-documents.sent', 'incoming-peppol-documents.received', 'client.cancellation'.

Parameters:
- ```array $data``` :: The data consisting of an url and an array of events.

Example:
```php
Dokapi::api()->webhooks->create([
    'url' => 'https://peppol.com/webhook',
    'events' => ['outgoing-peppol-documents.sent'],
]);
```

Response:
```Dokapi\Api\Resources\Webhook``` :: Response will contain a ulid string; store this, you'll need if you want to remove the webhook.

##### Delete

This endpoint deletes a webhook.

Parameters:
- ```string $ulid``` :: The ulid of the webhook that you want to delete.

Example:
```php
Dokapi::api()->webhooks->delete($ulid);
```

Response:
```Dokapi\Api\Resources\Status```

##### Secret

This endpoint generates a webhook secret. In case you need a new key, rerun this operation to invalidate the previous key and regenerate a new one.

Example:
```php
Dokapi::api()->webhooks->secret();
```

Response:
```Dokapi\Api\Resources\Status``` :: Store the message as the webhook secret key and use to validate webhooks.
