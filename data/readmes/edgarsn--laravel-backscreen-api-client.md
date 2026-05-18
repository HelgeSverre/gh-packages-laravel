# Laravel Backscreen API Client

This package helps you to make API calls to Backscreen (a.k.a: Videosher, TET Media Services) API v5.

https://api.cloudycdn.services/api/v5/docs

## Upgrade

If you were using 1.x before, follow UPGRADE.md to update your code properly since it contains many breaking changes.

## Requirements
- Laravel 11.0+, 12.0+, 13.0+
- PHP 8.2+

For laravel versions 9.0, 10.0, see 1.x branch.

## Installation
Require the package via Composer:

```bash
composer require newman/laravel-tms-api-client
```

Copy config file to your `config` directory.
```bash
php artisan vendor:publish --tag=backscreen-api-config
```

Add environment variables to your `.env` file.

```dotenv
BACKSCREEN_DEFAULT_USERNAME="API Key"
BACKSCREEN_DEFAULT_PASSWORD="API Secret"
```

At last, you can add extra client to your `backscreen-api.php` config file with other credentials or different default settings.

# :book: Documentation & Usage

## Clients

### Access client from config

```php
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

TmsApi::client('default')->run(...);
```

### Create a client dynamically

We recommend to do this on your `AppServiceProvider`, inside `boot` function.

```php
use Newman\LaravelBackscreenApiClient\Auth\BasicAuthMethod;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$client = TmsApi::createClient('live', new BasicAuthMethod('api key', 'api secret'));

// and from now on you can access using client() as well
// TmsApi::client('live')->run(...);
```

### Authenticate via Bearer token

There are some endpoints (e.g. `/User/Login`) which doesn't require any authentication at all.

```php
use Newman\LaravelBackscreenApiClient\Auth\BearerAuthMethod;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// 1) Retrieve Bearer token without any authentication.
$response = TmsApi::nullClient()->run(new Login('my@email.com', 'mypassword'));

$bearerToken = $response->json('data.auth_token');

// ... you may want to cache this token for some time

// 2) Override default client dynamically with other auth method.
TmsApi::createClient('default', new BearerAuthMethod($bearerToken));

// 3) now all calls on default client will use Bearer token as auth method.
// TmsApi::client('default')->run(...);
```

### Configure request

**Note:** These parameters will be present only for a single (upcoming) request and then will reset to defaults.

#### `timeout` and `connectTimeout`

```php
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

TmsApi::client('default')->timeout(30)->connectTimeout(45)->run(...);
```

#### `withMiddleware`

Append HTTP middleware to this client upcoming requests.

https://laravel.com/docs/12.x/http-client#guzzle-middleware

```php
use GuzzleHttp\Middleware;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

TmsApi::client('default')
    ->withMiddleware(
        Middleware::mapRequest(function (RequestInterface $request) {
            $request = $request->withHeader('X-Example', 'Value');

            return $request;
        })
    )
    ->run(....);
```

## Response

Response of the request is `\Illuminate\Http\Client\Reponse` object.

# Endpoints

We created this package with only few implementations of TMS endpoints. PRs are welcome to add more.

For each endpoint argument (except required ones) you'll find a correspoding setter function.

Here is the list of implemented endpoints:

## `/Token`

### Endpoint: `/Token/Generate`

https://api.cloudycdn.services/api/v5/docs#/operations/Token/Generate

Generates a new token.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Token\Generate as TokenGenerate;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new TokenGenerate(123456, TokenGenerate\ItemTypeEnum::MEDIA);

// Optional
$endpoint->allowedCountries(['lv', 'lt', 'ee']);
$endpoint->allowedIp('85.110.62.99');

$endpoint->expireTime(1674074046);
$endpoint->expireTime('2023-01-18 12:34:56');
$endpoint->expireTime(\Carbon\Carbon::now()->addHour());

$endpoint->subitemId(5);
$endpoint->subitemType(TokenGenerate\SubitemTypeEnum::PLAYBACK_HLS);

$response = TmsApi::client('default')->run($endpoint);
```

## `/Media`

### Endpoint: `/Media/List`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/List

Retrieve a list of media.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\MediaList;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Enums\OrderDirectionEnum;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new MediaList();

// Optional
$endpoint->ids([123]); // media IDs
$endpoint->assetIds(['asset_id']);
$endpoint->categoryIds([5]);
$endpoint->onlyAvailable(true);
$endpoint->published(true);
$endpoint->search('lorem ipsum');
$endpoint->tags(['archive']);
$endpoint->return(['embed_player_codes', 'sources']);
$endpoint->imagesFallback(false);

$endpoint->publisherStatus(MediaList\PublisherStatusEnum::PUBLISHED);

$endpoint->status(MediaList\StatusEnum::INGESTED);
$endpoint->status([MediaList\StatusEnum::INGESTED, MediaList\StatusEnum::PLAYABLE]);

$endpoint->createdFrom(1674074046);
$endpoint->createdFrom('2023-01-18 12:34:56');
$endpoint->createdFrom(\Carbon\Carbon::now()->addHour());

$endpoint->createdTo(1674074046);
$endpoint->createdTo('2023-01-18 12:34:56');
$endpoint->createdTo(\Carbon\Carbon::now()->addHour());

$endpoint->updatedFrom(1674074046);
$endpoint->updatedFrom('2023-01-18 12:34:56');
$endpoint->updatedFrom(\Carbon\Carbon::now()->addHour());

$endpoint->updatedTo(1674074046);
$endpoint->updatedTo('2023-01-18 12:34:56');
$endpoint->updatedTo(\Carbon\Carbon::now()->addHour());

$endpoint->limit(5);
$endpoint->offset(10);

$endpoint->orderBy(MediaList\OrderByEnum::CREATED_AT);
$endpoint->orderDir(OrderDirectionEnum::ASC);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Create`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Create

Create media.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create as MediaCreate;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Availability;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Embed;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Enums\EncryptionMethodEnum;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Enums\TokenDurationEnum;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Files;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Images;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Security;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Tags;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\TranscodeInfo;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new MediaCreate('123');

// Optional
$endpoint->catId(542);
$endpoint->name('Name of media');
$endpoint->description('Description of media');
$endpoint->pgRating('PG-13');
$endpoint->autoTranscode(1);
$endpoint->embedPlayerId(123);
$endpoint->embedAdId(234);
$endpoint->embedProtectionId(345);
$endpoint->metadata(['key' => 'value']);
$endpoint->timezone('Europe/Riga');

$files = new Files();
$files->url('https://mysite.com');
$files->username('username');
$files->password('secret');
$files->bitrate(3000);
$files->lang('LV');
$endpoint->files([$files]); // accepts array of Files objects

$tags = new Tags();
$tags->set(['tag1', 'tag2']);
$tags->add(['tag3']);
$endpoint->tags($tags);

$images = new Images();
$images->thumbnail(base64_encode('THUMBNAIL_CONTENTS'));
$images->placeholder(base64_encode('PLACEHOLDER_CONTENTS'));
$endpoint->images($images);

$embed = new Embed();
$embed->enablePublic(1);
$embed->publicPassword('password');
$embed->enablePreview(1);
$endpoint->embed($embed);

$security = new Security();
$security->encryptionMethod(EncryptionMethodEnum::AES);
$security->useToken(1);
$security->tokenDuration(TokenDurationEnum::ONE_HOUR);
$endpoint->security($security);

$availability = new Availability();
$availability->published(1);
$availability->expireTime('2026-12-31 23:59:59');
$endpoint->availability($availability);

$transcodeInfo = new TranscodeInfo();
$transcodeInfo->presetId(10);
$endpoint->transcodeInfo($transcodeInfo);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Update`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Update

Update media.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\EndpointSupport\Callback;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Enums\CallbackHttpMethodEnum;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Availability;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Enums\EncryptionMethodEnum;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Files;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\Security;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Create\TranscodeInfo;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update as MediaUpdate;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\ByAssetId;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\ByMediaId;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\Embed;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\Images;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\Tags;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Update\UpdateManifest;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// Select by which identifier to update
// by media ID
$endpoint = new MediaUpdate(new ByMediaId(123));
// by asset ID
$endpoint = new MediaUpdate(new ByAssetId('99_asset_id'));

// Optional
$endpoint->catId(542);
$endpoint->name('Name of media');
$endpoint->description('Description of media');
$endpoint->pgRating('PG-13');
$endpoint->autoTranscode(1);
$endpoint->embedPlayerId(123);
$endpoint->embedAdId(234);
$endpoint->embedProtectionId(345);
$endpoint->metadata(['key' => 'value']);
$endpoint->timezone('Europe/Riga');

$files = new Files();
$files->url('https://mysite.com');
$files->username('username');
$files->password('secret');
$files->bitrate(3000);
$files->lang('LV');
$endpoint->files([$files]); // accepts array of Files objects

$images = new Images();
$images->thumbnail(base64_encode('THUMBNAIL_CONTENTS'));
$images->placeholder(base64_encode('PLACEHOLDER_CONTENTS'));
$endpoint->images($images);

$embed = new Embed();
$embed->enablePublic(1);
$embed->publicPassword('password');
$embed->enablePreview(1);
$endpoint->embed($embed);

$security = new Security();
$security->encryptionMethod(EncryptionMethodEnum::AES);
$security->useToken(1);
$endpoint->security($security);

$availability = new Availability();
$availability->published(1);
$availability->expireTime('2026-12-31 23:59:59');
$endpoint->availability($availability);

$transcodeInfo = new TranscodeInfo();
$transcodeInfo->presetId(10);
$endpoint->transcodeInfo($transcodeInfo);

$tags = new Tags();
$tags->set(['tag1', 'tag2']);
$tags->add(['tag3']);
$tags->remove(['tag4']);
$endpoint->tags($tags);

$manifest = new UpdateManifest();
$manifest->id(85291);
$manifest->startAt(1000);
$manifest->endAt(60000);
$endpoint->updateManifests([$manifest]);

$endpoint->callback([new Callback('https://mysite.com', CallbackHttpMethodEnum::POST)]);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Delete`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Delete

Delete media by ID/s.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Delete as MediaDelete;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// Multiple IDs.
$endpoint = new MediaDelete([1234, 5678]);

$response = TmsApi::client('default')->run($endpoint);

// Single ID.
$endpoint = new MediaDelete(1234);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Clone`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Clone

Clone media by ID.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\CloneMedia;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new CloneMedia(1234, 'asset_id_for_the_new_asset');

// Optional
$endpoint->name('Name for the new asset');

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Trim`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Trim

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Trim;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new Trim(1234, '00:00:10', '00:59:59', Trim\TypeEnum::NEW);

// Optional
$endpoint->name('Name');

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Generateimage`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Generateimage

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\GenerateImage;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new GenerateImage(1234);

// Optional
$endpoint->mediaFileId(1902);
$endpoint->thumbnail('01:20:39');
$endpoint->placeholder('00:05:30');

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Reset`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Reset

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Reset;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new Reset(1234));
```

### Endpoint: `/Media/Transcode`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Transcode

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Transcode;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new Transcode(1234));
```

### Endpoint: `/Media/Canceltranscode`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Canceltranscode

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\CancelTranscode;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new CancelTranscode(1234));
```

### Endpoint: `/Media/Updatesubtitlesfromsource`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Updatesubtitlesfromsource

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\UpdateSubtitlesFromSource;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new UpdateSubtitlesFromSource(1234));
```

### Endpoint: `/Media/Regeneratepackages`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Regeneratepackages

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\RegeneratePackages;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new RegeneratePackages(1234);

// Optional
$endpoint->packageId([10, 15]);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Publish`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Publish

Publish or unpublish media by ID/s.

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Publish as MediaPublish;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// Publish a single media item (1 = publish, 0 = unpublish)
$endpoint = new MediaPublish(1234, 1);

// Publish multiple media items
$endpoint = new MediaPublish([1234, 5678], 1);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Uploadtoexternal`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Uploadtoexternal

Upload media files to an external destination.

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\UploadToExternal as MediaUploadToExternal;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\UploadToExternal\CustomFile;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\UploadToExternal\PackageFile;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// Single media ID and upload destination ID
$endpoint = new MediaUploadToExternal(1234, 10);

// Multiple media IDs
$endpoint = new MediaUploadToExternal([1234, 5678], 10);

// Optional
$endpoint->path('/uploads/');
$endpoint->catDir(1);  // 0 or 1
$endpoint->assetDir(1); // 0 or 1

$endpoint->packageFiles([
    new PackageFile(package_id: 4020, file_id: 582),
]);

$endpoint->customFiles([
    new CustomFile(file_id: 900, filename: 'custom_file.mp4'),
]);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Validate`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Validate

Validate media by ID/s.

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Validate as MediaValidate;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

// Single ID
$endpoint = new MediaValidate(1234);

// Multiple IDs
$endpoint = new MediaValidate([1234, 5678]);

// Optional
$endpoint->transcode(1);          // 0 or 1
$endpoint->transcodePriority(1);  // 0 = normal, 1 = top priority
$endpoint->transcodingPresetId(10);

$response = TmsApi::client('default')->run($endpoint);
```

## `/Media/Manifest`

### Endpoint: `/Media/Manifest/List`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Manifest/List

Retrieve list of manifests.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Manifest\List\OrderByEnum;
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Manifest\ManifestList;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Enums\OrderDirectionEnum;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new ManifestList();

// Optional
$endpoint->ids([1, 2]); // manifest IDs
$endpoint->limit(10);
$endpoint->mediaIds([1234]);
$endpoint->offset(10);
$endpoint->orderBy(OrderByEnum::NAME);
$endpoint->orderDir(OrderDirectionEnum::DESC);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Manifest/Create`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Manifest/Create

Create a new media manifest.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Manifest\Create as MediaManifestCreate;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new MediaManifestCreate(1234); // media ID

// Optional
$endpoint->name('Name of the manifest');
$endpoint->default(true);
$endpoint->startAt(1000);
$endpoint->endAt(60000);
$endpoint->files([582, 583]);
$endpoint->packageId(4020);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Manifest/Update`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Manifest/Update

Update media manifest by manifest ID.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Manifest\Update as MediaManifestUpdate;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new MediaManifestUpdate(85291); // manifest ID

// Same optional functions as "/Media/Manifest/Create" endpoint.

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Media/Manifest/Delete`

https://api.cloudycdn.services/api/v5/docs#/operations/Media/Manifest/Delete

Delete media manifest by manifest ID.

**Accepted Auth Methods:** `Basic`, `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Media\Manifest\Delete as MediaManifestDelete;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new MediaManifestDelete(85291)); // manifest ID
```

## `/User`

### Endpoint: `/User/Get`

https://api.cloudycdn.services/api/v5/docs#/operations/User/Get

Return current user info. Returns the same values as login action, but without auth_token.

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\User\Get as UserGet;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new UserGet();

// Optional
$endpoint->return(['client.limits']);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/User/Login`

https://api.cloudycdn.services/api/v5/docs#/operations/User/Login

Login user by email & password to retrieve Bearer token.

**Accepted Auth Methods:** `Null`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\User\Login as UserLogin;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new UserLogin('my@email.com', 'password');

// Optional
$endpoint->twoFaCode('123456');
$endpoint->return(['client.limits']);

$response = TmsApi::nullClient()->run($endpoint);
```

### Endpoint: `/User/Logout`

https://api.cloudycdn.services/api/v5/docs#/operations/User/Logout

Logout currently authenticated user.

**Accepted Auth Methods:** `Bearer token`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\User\Logout as UserLogout;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$response = TmsApi::client('default')->run(new UserLogout());
```

## `/Live`

### Endpoint: `/Live/List`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/List

Retrieve a list of livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\LiveList;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Enums\OrderDirectionEnum;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new LiveList();

$endpoint->id(123);
$endpoint->id([123, 456]);
$endpoint->id('123');

$endpoint->idFrom(123);
$endpoint->idTo(123);
$endpoint->imagesFallback(true);
$endpoint->limit(123);
$endpoint->name('name');
$endpoint->offset(123);

$endpoint->createdFrom(1674074046);
$endpoint->createdFrom('2023-01-18 12:34:56');
$endpoint->createdFrom(\Carbon\Carbon::now()->addHour());

$endpoint->createdPeriod(LiveList\PeriodEnum::LAST_HOUR);

$endpoint->createdTo(1674074046);
$endpoint->createdTo('2023-01-18 12:34:56');
$endpoint->createdTo(\Carbon\Carbon::now()->addHour());

$endpoint->orderBy(LiveList\OrderByEnum::CREATED_AT);
$endpoint->orderDir(OrderDirectionEnum::ASC);

$endpoint->return(LiveList\ReturnEnum::CATEGORY);
$endpoint->return([LiveList\ReturnEnum::CATEGORY, LiveList\ReturnEnum::PREVIEW]);

$endpoint->updatedFrom(1674074046);
$endpoint->updatedFrom('2023-01-18 12:34:56');
$endpoint->updatedFrom(\Carbon\Carbon::now()->addHour());

$endpoint->updatedPeriod(LiveList\PeriodEnum::LAST_HOUR);

$endpoint->updatedTo(1674074046);
$endpoint->updatedTo('2023-01-18 12:34:56');
$endpoint->updatedTo(\Carbon\Carbon::now()->addHour());

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Live/Create`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/Create

Create a livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\Create;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Images;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new Create('New Livestream');

$endpoint->name('Different Livestream');
$endpoint->catId(1);
$endpoint->multiLanguages(true);
$endpoint->customOrigin('https://example.com');

$publish = new Create\Publish();
$publish->prefix('prefix');
$endpoint->publish($publish);

$endpoint->embedPlayerId(1);
$endpoint->embedAdId(1);
$endpoint->embedProtectionId(1);

$embed = new Create\Embed();
$embed->enablePublic(true);
$embed->publicPassword('password');
$embed->enablePreview(true);
$endpoint->embed($embed);

$security = new Create\Security();
$security->encryptionMethod(Create\Enums\EncryptionMethodEnum::AES);
$security->useToken(true);
$security->tokenDuration(Create\Enums\TokenDurationEnum::ONE_HOUR);
$endpoint->security($security);

$recording = new Create\Recording\Recording();
$recording->autoDelete(true);
$recording->autoDeleteMedia(true);
$recording->savePassed(true);
$recording->deleteAfterHours(1);
$recording->marginStartSeconds(1);
$recording->marginEndSeconds(1);
$recording->fileNamingPattern('pattern');

$nimbus = new Create\Recording\Nimbus();
$nimbus->syncInterval(1);
$nimbus->channelId(1);
$nimbus->manifestId(1);
$recording->nimbus($nimbus);

$epg = new Create\Recording\EPG();
$epg->hoursBefore(1);
$epg->hoursAfter(1);
$epg->round(0);
$recording->epg($epg);

$endpoint->recording($recording);

$images = new Images();
$images->thumbnail(base64_encode('FILE_CONTENTS'));
$images->placeholder(base64_encode('FILE_CONTENTS'));
$images->playbutton(base64_encode('FILE_CONTENTS'));
$images->logo(base64_encode('FILE_CONTENTS'));
$endpoint->images($images);

$availability = new Create\Availability();
$availability->scheduleStart(1674074046);
$availability->scheduleStart('2023-01-18 12:34:56');
$availability->scheduleStart(\Carbon\Carbon::now()->addHour());
$availability->scheduleEnd(1674074046);
$availability->scheduleEnd('2023-01-18 12:34:56');
$availability->scheduleEnd(\Carbon\Carbon::now()->addHour());
$endpoint->availability($availability);

$input = new Create\Input\Input();
$input->transcode(true);
$input->trancoderId(1);
$input->protocol(Create\Enums\ProtocolEnum::SRT);
$input->srtPassPhrase('passphrase');
$input->srtKeyLength(16);
$input->serverPort(443);
$input->serverApp('app');
$input->autoShutdown(1);
$input->videoPid('videoPID123');

$latvianLanguage = new Create\Input\AudioLanguage();
$latvianLanguage->language('lat');
$latvianLanguage->pid('123');
$latvianLanguage->languageName('Latvian');
$input->audioLanguages([$latvianLanguage]);

$endpoint->input($input);
$endpoint->timezone('Europe/Riga');

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Live/Update`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/Update

Update an existing livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\Update;
use Newman\LaravelBackscreenApiClient\Endpoints\Live\Create;
use Newman\LaravelBackscreenApiClient\EndpointSupport\Images;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new Update(123);

$endpoint->id(1234);
$endpoint->name('Different Livestream');
$endpoint->catId(1);
$endpoint->multiLanguages(true);
$endpoint->customOrigin('https://example.com');

$publish = new Create\Publish();
$publish->prefix('prefix');
$endpoint->publish($publish);

$endpoint->embedPlayerId(1);
$endpoint->embedAdId(1);
$endpoint->embedProtectionId(1);

$embed = new Create\Embed();
$embed->enablePublic(true);
$embed->publicPassword('password');
$embed->enablePreview(true);
$endpoint->embed($embed);

$security = new Create\Security();
$security->encryptionMethod(Create\Enums\EncryptionMethodEnum::AES);
$security->useToken(true);
$security->tokenDuration(Create\Enums\TokenDurationEnum::ONE_HOUR);
$endpoint->security($security);

$recording = new Create\Recording\Recording();
$recording->autoDelete(true);
$recording->autoDeleteMedia(true);
$recording->savePassed(true);
$recording->deleteAfterHours(1);
$recording->marginStartSeconds(1);
$recording->marginEndSeconds(1);
$recording->fileNamingPattern('pattern');

$nimbus = new Create\Recording\Nimbus();
$nimbus->syncInterval(1);
$nimbus->channelId(1);
$nimbus->manifestId(1);
$recording->nimbus($nimbus);

$epg = new Create\Recording\EPG();
$epg->hoursBefore(1);
$epg->hoursAfter(1);
$epg->round(0);
$recording->epg($epg);

$endpoint->recording($recording);

$images = new Images();
$images->thumbnail(base64_encode('FILE_CONTENTS'));
$images->placeholder(base64_encode('FILE_CONTENTS'));
$images->playbutton(base64_encode('FILE_CONTENTS'));
$images->logo(base64_encode('FILE_CONTENTS'));
$endpoint->images($images);

$availability = new Create\Availability();
$availability->scheduleStart(1674074046);
$availability->scheduleStart('2023-01-18 12:34:56');
$availability->scheduleStart(\Carbon\Carbon::now()->addHour());
$availability->scheduleEnd(1674074046);
$availability->scheduleEnd('2023-01-18 12:34:56');
$availability->scheduleEnd(\Carbon\Carbon::now()->addHour());
$endpoint->availability($availability);

$input = new Create\Input\Input();
$input->transcode(true);
$input->trancoderId(1);
$input->protocol(Create\Enums\ProtocolEnum::SRT);
$input->srtPassPhrase('passphrase');
$input->srtKeyLength(1);
$input->serverPort(443);
$input->serverApp('app');
$input->autoShutdown(1);
$input->videoPid('videoPID123');

$latvianLanguage = new Create\Input\AudioLanguage();
$latvianLanguage->language('lat');
$latvianLanguage->pid('123');
$latvianLanguage->languageName('Latvian');
$input->audioLanguages([$latvianLanguage]);

$endpoint->input($input);
$endpoint->timezone('Europe/Riga');

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Live/On`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/On

Turn on an existing livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\On;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new On(123);

$endpoint->id(1234);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Live/Off`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/Off

Turn Off an existing livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\Off;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new Off(123);

$endpoint->id(1234);

$response = TmsApi::client('default')->run($endpoint);
```

### Endpoint: `/Live/Record`

https://api.cloudycdn.services/api/v5/docs#/operations/Live/Record

Start recording an existing livestream.

**Accepted Auth Methods:** `Basic`, `Bearer token`, `API Key`

```php
use Newman\LaravelBackscreenApiClient\Endpoints\Live\Record;
use Newman\LaravelBackscreenApiClient\Support\Facades\TmsApi;

$endpoint = new Record(123);

$endpoint->id(1234);

$response = TmsApi::client('default')->run($endpoint);
```

# :handshake: Contributing

We'll appreciate your collaboration to this package.

When making pull requests, make sure:
* All tests are passing: `composer test`
* Test coverage is not reduced: `composer test-coverage`
* There are no PHPStan errors: `composer phpstan`
* Coding standard is followed: `composer lint` or `composer fix-style` to automatically fix it. 
