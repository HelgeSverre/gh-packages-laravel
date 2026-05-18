<img src="https://banners.beyondco.de/Laravel%20Beekeeper.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-beekeeper&pattern=architect&style=style_1&description=An+opinionated+way+to+integrate+Beekeeper+with+Laravel&md=1&showWatermark=0&fontSize=100px&images=cloud">



[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-beekeeper.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-beekeeper)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-beekeeper.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-beekeeper)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/run-tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/fix-php-code-style-issues.yml)
[![PHPStan](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/phpstan.yml/badge.svg)](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/phpstan.yml)
[![Dependency Review](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/codebar-ag/laravel-beekeeper/actions/workflows/dependency-review.yml)

This package was developed to give you a quick start to communicate with the
Beekeeper API using token-based authentication. It provides a clean, type-safe
interface to query the most common Beekeeper endpoints including artifacts,
files, streams, and posts.

## Navigation
<!-- TOC -->
  * [Navigation](#navigation)
  * [🛠 Requirements](#-requirements)
  * [Installation](#installation)
  * [Usage](#usage)
    * [Get the connector](#get-the-connector)
    * [Get The Status Of The Authenticated User](#get-the-status-of-the-authenticated-user)
    * [List Artifacts](#list-artifacts)
    * [Upload A File](#upload-a-file)
    * [Create A Child To An Artifact](#create-a-child-to-an-artifact)
    * [Delete An Artifact](#delete-an-artifact)
    * [Create A Post In A Given Stream](#create-a-post-in-a-given-stream)
  * [DTO Showcase](#dto-showcase)
  * [Available Enums](#available-enums)
  * [Testing](#testing)
  * [Changelog](#changelog)
  * [Contributing](#contributing)
  * [Security Vulnerabilities](#security-vulnerabilities)
  * [Credits](#credits)
  * [License](#license)
<!-- TOC -->

## 🛠 Requirements

| Version | PHP Version | Laravel Version |
|---------|-------------|-----------------|
| v12.0.0 | ^8.2 - ^8.4 | ^12.*           |

## Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-beekeeper
```

Then:

```bash
php artisan beekeeper:install
```


Or:

You can publish the config file with:

```bash
php artisan vendor:publish --tag="beekeeper-config"
```

This is the contents of the published config file:

```php
<?php

return [
    'api_token' => env('BEEKEEPER_API_TOKEN'),
    'endpoint_prefix' => env('BEEKEEPER_ENDPOINT_PREFIX'),
    'cache_store' => env('BEEKEEPER_CACHE_STORE')
];
```

You should finally add the following to your .env file:

```env
BEEKEEPER_API_TOKEN=your-api-token
BEEKEEPER_ENDPOINT_PREFIX=codebar.us
BEEKEEPER_CACHE_STORE=file
```

## Usage

### Authentication

This package uses token-based authentication with the Beekeeper API. You'll need to:

1. Obtain an API token from your Beekeeper admin panel
2. Set the `BEEKEEPER_API_TOKEN` environment variable
3. Set your Beekeeper subdomain in `BEEKEEPER_ENDPOINT_PREFIX`

### Get the connector

```php
use CodebarAg\LaravelBeekeeper\Connectors\BeekeeperConnector;

// Using the env variables
$connector = new BeekeeperConnector;

// Passing the credentials manually
$connector = new BeekeeperConnector(
    apiToken: $yourApiToken,
    endpointPrefix: 'foobar.us',
);
```

### Get The Status Of The Authenticated User

```php
use CodebarAg\LaravelBeekeeper\Requests\GetStatusOfAuthenticatedUserRequest;

$response = $connector->send(new GetStatusOfAuthenticatedUserRequest);
````

### List Artifacts

```php
use CodebarAg\LaravelBeekeeper\Requests\ListArtifacts;

$response = $connector->send(new ListArtifacts(
    type: Type::FOLDER,
    sort: Sort::NAME_ASC,
    limit: 20,
));
```

### Upload A File

```php
use CodebarAg\LaravelBeekeeper\Requests\UploadAFileRequest;

$fileContent = file_get_contents('path-to/foobar.pdf');
$fileName = 'foobar.pdf';

$response = $connector->send(new UploadAFileRequest(
    fileContent: $fileContent,
    fileName: $fileName,
    usageType: 'attachment_file',
));
```

### Create A Child To An Artifact

```php
use CodebarAg\LaravelBeekeeper\Requests\CreateAChildToAnArtifact;
use CodebarAg\LaravelBeekeeper\Enums\Artifacts\Type;

$response = $connector->send(new CreateAChildToAnArtifact(
    artifactId: '12345678-abcd-efgh-9012-de00edbf7b0b',
    name: 'foobar.pdf',
    type: Type::FILE,
    parentId: '12345678-abcd-efgh-9012-de00edbf7b0b',
    metadata: [
        'mimeType' => 'image/png',
        'url' => 'https://foobar.us.beekeeper.io/api/2/files/key/12345678-abcd-efgh-9012-de00edbf7b0b',
        'userId' => '12345678-abcd-efgh-9012-de00edbf7b0b',
        'key' => '12345678-abcd-efgh-9012-de00edbf7b0b',
        'id' => 12345678,
        'size' => 123456,
    ],
    adjustArtifactName: false,
    expand: []
));
```

### Delete An Artifact

```php
use CodebarAg\LaravelBeekeeper\Requests\DeleteAnArtifact;

$response = $connector->send(new DeleteAnArtifact(
    artifactId: '12345678-abcd-efgh-9012-de00edbf7b0b'
));

// Returns a 204 No Content response on success
```

### Create A Post In A Given Stream

```php
use CodebarAg\LaravelBeekeeper\Requests\CreateAPostInAGivenStream;

// Basic post creation
$response = $connector->send(new CreateAPostInAGivenStream(
    streamId: '6002',
    text: 'Please indicate your preferred dates for next team event in the poll below. Thanks!'
));

// Advanced post with all options
$fileData = [
    'updated' => '2016-10-07T12:49:21',
    'name' => 'fair_play_rules.pdf',
    'created' => '2016-10-07T12:49:21',
    'url' => 'https://mytenant.beekeeper.io/file/665987/original/fair_play_rules.pdf',
    'userid' => '5cb9v45d-8i78-4v65-b5fd-81cgfac3ef17',
    'height' => 619,
    'width' => 700,
    'duration' => 315,
    'key' => 'f4fdaab0-d198-49b4-b1cc-dd85572d72f1',
    'media_type' => 'image/png',
    'usage_type' => 'attachment_image',
    'id' => 66598,
    'size' => 85
];

$response = $connector->send(new CreateAPostInAGivenStream(
    streamId: '6002',
    text: 'Please indicate your preferred dates for next team event in the poll below. Thanks!',
    html: '<p>Please <b>indicate</b> your preferred dates below.</p><p>Thanks!</p>',
    title: 'Hello guys!',
    labels: ['food', 'poll', 'events'],
    sticky: true,
    locked: true,
    reactionsDisabled: true,
    scheduledAt: '2019-08-24T14:15:22',
    files: [$fileData],
    media: [$fileData],
    options: [
        ['text' => 'This Friday'],
        ['text' => 'Monday next week']
    ],
    expand: ['user', 'stream']
));

$post = $response->dto(); // Returns a Post DTO
```

## DTO Showcase

```php
CodebarAg\LaravelBeekeeper\Data\Artifacts\Artifact {
    +id: "12345678-abcd-efgh-9012-de00edbf7b0b"                         // string
    +tenantId: "12345"                                                  // string
    +name: "Documents"                                                  // string
    +type: CodebarAg\LaravelBeekeeper\Enums\Artifacts\Type              // Type
    +parentId: null                                                     // string|null
    +metadata: Illuminate\Support\Collection                            // Collection
    +createdAt: Carbon\CarbonImmutable                                  // CarbonImmutable
    +updatedAt: Carbon\CarbonImmutable                                  // CarbonImmutable
    +breadcrumbs: Illuminate\Support\Collection                         // Collection
    +children: Illuminate\Support\Collection                            // Collection
    +acl: Illuminate\Support\Collection                                 // Collection
    +filterData: Illuminate\Support\Collection                          // Collection
}
```

```php
CodebarAg\LaravelBeekeeper\Data\Configs\AuthenticatedUserStatus {
    +maxFileSize: 262144000                                             // int|null
    +maxFilesOnPost: 8                                                  // int|null
    +maxPhotoSize: 15728640                                             // int|null
    +maxMediaOnPost: 50                                                 // int|null
    +maxVideoSize: 524288000                                            // int|null
    +maxVideoSizeForAdmins: 2147483648                                  // int|null
    +maxVoiceRecordingLength: 900                                       // int|null
    +maxUsersInGroupChat: 200                                           // int|null
    +featureFlags: Illuminate\Support\Collection                        // Collection|null
    +integrations: Illuminate\Support\Collection                        // Collection|null
    +styling: Illuminate\Support\Collection                             // Collection|null
    +tracking: Illuminate\Support\Collection                            // Collection|null   
    +general: CodebarAg\LaravelBeekeeper\Data\Configs\General           // General|null
}
```

```php
CodebarAg\LaravelBeekeeper\Data\Configs\General {
    +id: 12345                                                          // int
    +companyAccount: "12345678-abcd-efgh-9012-de00edbf7b0b"             // string
    +name: "foobar"                                                     // string
    +language: "en"                                                     // string
    +created: Carbon\CarbonImmutable                                    // CarbonImmutable
    +url: "https://foobar.us.beekeeper.io/"                             // string
    +tagline: "Welcome to Beekeeper!"                                   // string
    +fqdn: "foobar.us.beekeeper.io"                                     // string
    +supportEmail: ""                                                   // string
    +isDataSecurityContactSet: false                                    // bool
    +timezone: "Europe/London"                                          // string    
    +subdomain: "foobar"                                                // string
}
```


```php
CodebarAg\LaravelBeekeeper\Data\Files\File {
    +name: "test-1.pdf"                                                                               // string
    +status: CodebarAg\LaravelBeekeeper\Enums\Files\Status                                            // Status|null
    +created: Carbon\CarbonImmutable                                                                  // CarbonImmutable
    +updated: Carbon\CarbonImmutable                                                                  // CarbonImmutable
    +url: "https://foobar.us.beekeeper.io/api/2/files/key/12345678-abcd-efgh-9012-de00edbf7b0b"       // string
    +userId: "12345678-abcd-efgh-9012-de00edbf7b0b"                                                   // string
    +height: null                                                                                     // int|null
    +width: null                                                                                      // int|null
    +key: "12345678-abcd-efgh-9012-de00edbf7b0b"                                                      // string
    +duration: null                                                                                   // int|null
    +mediaType: "application/pdf"                                                                     // string
    +usageType: CodebarAg\LaravelBeekeeper\Enums\Files\UsageType                                      // UsageType
    +id: 22268153                                                                                     // int                                 
    +size: 8570                                                                                       // int
    +versions: Illuminate\Support\Collection                                                          // Collection
}
```

```php
CodebarAg\LaravelBeekeeper\Data\Files\FileVersion {
    +name: "test-1.pdf"                                                                               // string
    +url: "https://foobar.us.beekeeper.io/api/2/files/key/12345678-abcd-efgh-9012-de00edbf7b0b"      // string
    +height: null                                                                                     // int|null
    +width: null                                                                                      // int|null
}
```
    
```php
CodebarAg\LaravelBeekeeper\Data\Streams\Post {
    +id: 2234                                                                                         // int
    +text: "Please indicate your preferred dates for next team event in the poll below. Thanks!"     // string|null
    +html: "<p>Please <b>indicate</b> your preferred dates below.</p><p>Thanks!</p>"                  // string|null
    +title: "Hello guys!"                                                                             // string|null
    +labels: Illuminate\Support\Collection                                                            // Collection
    +sticky: true                                                                                     // bool
    +likeCount: 42                                                                                    // int
    +streamId: 6002                                                                                   // int
    +digest: 1                                                                                        // int
    +userId: "5cb9v45d-8i78-4v65-b5fd-81cgfac3ef17"                                                  // string
    +uuid: "731b28bc-7f10-4b68-a089-fc672abc9955"                                                    // string
    +commentCount: 2                                                                                  // int
    +reportCount: 0                                                                                   // int
    +source: "beekeeper"                                                                              // string
    +voteCount: 12                                                                                    // int
    +moderated: true                                                                                  // bool
    +photo: "https://d6698txzbomp3.cloudfront.net/72e3b7d4-c6a4-47e9-8f81-7b7d10bdd84a"              // string|null
    +languageConfidence: 0.86                                                                         // float|null
    +type: "post"                                                                                     // string
    +metadata: "string"                                                                               // string|null
    +profile: "peter_smith"                                                                           // string|null
    +edited: true                                                                                     // bool
    +displayNameExtension: "General Manager"                                                          // string|null
    +subscribedByUser: true                                                                           // bool
    +reportable: true                                                                                 // bool
    +anonymous: true                                                                                  // bool
    +displayName: "John Smith"                                                                        // string|null
    +unread: true                                                                                     // bool
    +locked: true                                                                                     // bool
    +reactionsDisabled: true                                                                          // bool
    +name: "Peter Smith"                                                                              // string|null
    +language: "en"                                                                                   // string|null
    +languageInformation: array                                                                       // array|null
    +created: Carbon\CarbonImmutable                                                                  // CarbonImmutable|null
    +postedByUser: true                                                                               // bool
    +avatar: "https://dz343oy86h947.cloudfront.net/business/neutral/normal/05.png"                    // string|null
    +reportedByUser: true                                                                             // bool
    +likedByUser: true                                                                                // bool
    +mentions: Illuminate\Support\Collection                                                          // Collection
    +mentionsDetails: array                                                                           // array|null
    +scheduledAt: Carbon\CarbonImmutable                                                              // CarbonImmutable|null
    +status: "published"                                                                              // string|null
    +files: Illuminate\Support\Collection                                                             // Collection
    +photos: Illuminate\Support\Collection                                                            // Collection
    +videos: Illuminate\Support\Collection                                                            // Collection
    +media: Illuminate\Support\Collection                                                             // Collection
    +options: Illuminate\Support\Collection                                                           // Collection
    +stateId: "2017-06-19T08:49:53"                                                                  // string|null
}
```

```php
CodebarAg\LaravelBeekeeper\Data\Streams\Stream {
    +id: "12345678-abcd-efgh-9012-de00edbf7b0b"                                                      // string
    +tenantId: "12345"                                                                                // string
    +name: "General Discussion"                                                                       // string
    +description: "General discussion stream for all team members"                                    // string|null
    +type: CodebarAg\LaravelBeekeeper\Enums\Streams\Type                                             // Type|null
    +isPublic: true                                                                                   // bool
    +isArchived: false                                                                                // bool
    +createdAt: Carbon\CarbonImmutable                                                                // CarbonImmutable|null
    +updatedAt: Carbon\CarbonImmutable                                                                // CarbonImmutable|null
    +createdBy: "12345678-abcd-efgh-9012-de00edbf7b0b"                                               // string|null
    +updatedBy: "12345678-abcd-efgh-9012-de00edbf7b0b"                                               // string|null
    +posts: Illuminate\Support\Collection                                                             // Collection
    +subscribers: Illuminate\Support\Collection                                                       // Collection
    +permissions: Illuminate\Support\Collection                                                       // Collection
    +metadata: Illuminate\Support\Collection                                                          // Collection
}
```

## Available Enums

The package provides several enums for type safety and better code organization:

### Artifact Enums

```php
use CodebarAg\LaravelBeekeeper\Enums\Artifacts\Type;
use CodebarAg\LaravelBeekeeper\Enums\Artifacts\Sort;

// Artifact types
Type::FOLDER
Type::FILE

// Sorting options
Sort::NAME_ASC
Sort::NAME_DESC
Sort::CREATED_ASC
Sort::CREATED_DESC
```

### File Enums

```php
use CodebarAg\LaravelBeekeeper\Enums\Files\Status;
use CodebarAg\LaravelBeekeeper\Enums\Files\UsageType;

// File status
Status::PROCESSING
Status::READY
Status::ERROR

// Usage types
UsageType::ATTACHMENT_IMAGE
UsageType::ATTACHMENT_FILE
UsageType::ATTACHMENT_VIDEO
UsageType::AVATAR
UsageType::COVER_IMAGE
UsageType::LOGO
// ... and more
```

### Stream Enums

```php
use CodebarAg\LaravelBeekeeper\Enums\Streams\Type;

// Stream types
Type::PUBLIC
Type::PRIVATE
Type::ANNOUNCEMENT
Type::DISCUSSION
Type::PROJECT
Type::DEPARTMENT
Type::TEAM
```

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

- [Rhys Lees](https://github.com/RhysLees)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
