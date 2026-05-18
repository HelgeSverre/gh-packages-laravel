# SPINEN's Halo PHP Client

[![Latest Stable Version](https://poser.pugx.org/spinen/halo-php-client/v/stable)](https://packagist.org/packages/spinen/halo-php-client)
[![Latest Unstable Version](https://poser.pugx.org/spinen/halo-php-client/v/unstable)](https://packagist.org/packages/spinen/halo-php-client)
[![Total Downloads](https://poser.pugx.org/spinen/halo-php-client/downloads)](https://packagist.org/packages/spinen/halo-php-client)
[![License](https://poser.pugx.org/spinen/halo-php-client/license)](https://packagist.org/packages/spinen/halo-php-client)

PHP package to interface with [Halo Service Solutions](https://haloservicesolutions.com/). We strongly encourage you to review Halo's API docs to get a feel for what this package can do, as we are just wrapping their API.

We solely use [Laravel](https://www.laravel.com) for our applications, so this package is written with Laravel in mind. We have tried to make it work outside of Laravel. If there is a request from the community to split this package into 2 parts, then we will consider doing that work.

## Build Status

| Branch | Status | Coverage | Code Quality |
| ------ | :----: | :------: | :----------: |
| Develop | [![Build Status](https://github.com/spinen/halo-php-client/workflows/CI/badge.svg?branch=develop)](https://github.com/spinen/halo-php-client/workflows/CI/badge.svg?branch=develop) | [![Code Coverage](https://scrutinizer-ci.com/g/spinen/halo-php-client/badges/coverage.png?b=develop)](https://scrutinizer-ci.com/g/spinen/halo-php-client/?branch=develop) | [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/spinen/halo-php-client/badges/quality-score.png?b=develop)](https://scrutinizer-ci.com/g/spinen/halo-php-client/?branch=develop) |
| Master | [![Build Status](https://github.com/spinen/halo-php-client/workflows/CI/badge.svg?branch=master)](https://github.com/spinen/halo-php-client/workflows/CI/badge.svg?branch=master) | [![Code Coverage](https://scrutinizer-ci.com/g/spinen/halo-php-client/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/spinen/halo-php-client/?branch=master) | [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/spinen/halo-php-client/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/spinen/halo-php-client/?branch=master) |

## Table of Contents
 * [Installation](#installation)
 * [Laravel Setup](#laravel-setup)
    * [Configuration](#configuration)
 * [Generic PHP Setup](#generic-php-setup)
    * [Examples](#examples)
 * [Authentication](#authentication)
    * [Authorization Code](#authorization-code)
    * [Client Credentials](#client-credentials)
 * [Usage](#usage)
    * [Supported Actions](#supported-actions)
    * [Using the Client](#using-the-client)
        * [Getting the Client object](#getting-the-client-object)
        * [Models](#models)
        * [Relationships](#relationships)
        * [Collections](#collections)
        * [Filtering using "where"](#filtering-using-where)
        * [Search](#search)
        * [Limit records returned](#limit-records-returned)
        * [Order By](#order-by)
        * [Pagination](#pagination)
    * [More Examples](#more-examples)
 * [Known Issues](#known-issues)

## Installation

Install Halo PHP Package via Composer:

```bash
$ composer require spinen/halo-php-client
```

## Laravel Setup

1. You will need to make your `User` object implement includes the `Spinen\Halo\Concerns\HasHalo` trait which will allow it to access the Client as an attribute like this: `$user->halo`

    ```php
    <?php

    namespace App;

    use Illuminate\Contracts\Auth\MustVerifyEmail;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Spinen\Halo\Concerns\HasHalo;

    class User extends Authenticatable
    {
        use HasHalo, Notifiable;

        // ...
    }
    ```

2. Add the appropriate values to your ```.env``` file

    #### Keys
    ```bash
    HALO_RESOURCE_SERVER=<API Resource Server>
    HALO_TENANT=<Optional Tenant>
    HALO_AUTHORIZATION_CODE_CLIENT_ID=<Needed if using Authorization Code>
    HALO_CLIENT_CREDENTIALS_CLIENT_ID=<Needed if using Client Credentials>
    HALO_CLIENT_CREDENTIALS_CLIENT_SECRET=<Needed if using Client Credentials>
    ```

3. _[Optional]_ Publish config & migration

    #### Config
    A configuration file named ```halo.php``` can be published to ```config/``` by running...

    ```bash
    php artisan vendor:publish --tag=halo-config
    ```

    #### Migration
    Migrations files can be published by running...

    ```bash
    php artisan vendor:publish --tag=halo-migrations
    ```

    You'll need the migration to set the Halo API token on your `User` model.

## Generic PHP Setup

1. You need to build up an array of configs to pass into the Halo object.  You review the `halo.php` file in the `configs` directory.  All of the properties are documented in the file.

2. Depending on your needs, you can either work with the Halo client or the Builder

    #### To get a `Spinen\Halo\Api\Client` instance for Client Credentials...

    ```bash
    $ psysh
    Psy Shell v0.11.14 (PHP 8.2.4 — cli) by Justin Hileman
    > $configs = [
        "oauth" => [
            "authorization_server" => "https://some.host.tld/auth",
            "client_credentials" => [
                "id" => "client_id",
                "secret" => "client_secret",
            ],
        ],
        "resource_server" => "https://some.host.tld/api",
    ]

    > $halo = new Spinen\Halo\Api\Client(configs: $configs);
    = Spinen\Halo\Api\Client {#2744}
    ```

    The `$halo` instance will work exactly like all of the examples below where `halo` is the property.

    ####  To get a `Spinen\Halo\Support\Builder` instance...

    ```bash
    $ psysh
    Psy Shell v0.11.12 (PHP 8.2.4 — cli) by Justin Hileman
    New version is available at psysh.org/psysh (current: v0.11.12, latest: v0.11.13)
    > // Get a $halo instance from above

    > $builder = (new Spinen\Halo\Support\Builder)->setClient($halo);
    = Spinen\Halo\Support\Builder {#2757}

    >
    ```

    The `$builder` instance will work exactly like all of the examples below where `halo()` is a method.

## Authentication

Halo has four ways to authenticate when making API calls. With this package we are focusing on the following two: 1) `Authorization Code` or 2) `Client Credentials`.  The `Authorization Code` method is used to make API calls to the API as specific users.  If you are using Laravel to interact with this package, then the authorization flow is built out for you.  If you are not, then review `Http\Middleware\Filter` to see how we redirect the user to the Halo server to request a code and `Http\Controllers\HaloController` to see how we convert the code into a token.  The flow is protected with PKCE.  The `Client Credentials` method is used to make API calls as a specific user and is useful for background processes.

> NOTE: You can use either method or both methods in the same project.

### Authorization Code

There is a middleware named `Halo` that you can apply to any route that verifies that the user has a `halo_token`, and if the user does not, then it redirects the user to Halo's OAuth page with the `client_id` where the user selects the team(s) to link with your application.  Upon selecting the team(s), the user is redirected to the named route `halo.sso.redirect_uri` where the system converts the `code` to a token & saves it to the user.  Upon saving the `halo_token`, the user is redirected to the initial page that was protected by the middleware.

> NOTE: You will need to have the `auth` middleware on the routes as the `User` is needed to see if there is a `halo_token`.

> NOTE: At this time, there is not a way to remove a token that has been invalidated, so you will need to delete the `halo_token` on the user to restart the flow.

### Client Credentials

When using `Client Credentials`, you can make API calls without needing any user interface or requiring any user interaction.

```bash
php artisan tinker
Psy Shell v0.11.14 (PHP 8.2.4 — cli) by Justin Hileman
> $halo = app(Spinen\Halo\Api\Client::class);
= Spinen\Halo\Api\Client {#4013}

> $halo->get('tenant')
= [
    "id" => 0,
    "key" => "some_key",
    "hostname" => "some.host.tld",
    "api_root" => "https://some.host.tld/api",
    "alias" => "",
    "linked_instance_id" => 0,
    "has_linked_instances" => false,
    "isportal" => false,
  ]
```

## Usage

### Supported Actions for `Spinen\Halo\Api\Client`

* `delete(string $path)` - Shortcut to the `request()` method with 'DELETE' as the last parameter

* `generateProofKey(int $length = 30)` - Generate keys need for PKCE

* `get(string $path)` - Shortcut to the `request()` method with 'GET' as the last parameter

* `getToken()` - Get, return, or refresh the token

* `oauthRequestTokenUsingAuthorizationCode(string $code, string $uri, ?string $verifier = null, ?string $scope = null)` - Convert OAuth code to scoped token for user

* `oauthRequestTokenUsingClientCredentials(?string $scope = null)` - Request a scoped token via client credentials

* `oauthUri($url)` - Build the URI to the OAuth page with the redirect_url set to `$url`

* `post(string $path, array $data)` - Shortcut to the `request()` method with 'POST' as the last parameter

* `put(string $path, array $data)` - Shortcut to the `request()` method with 'PUT' as the last parameter

* `request(?string $path, ?array $data = [], ?string $method = 'GET')` - Make an [API call to Halo](https://haloservicedesk.com/apidoc/info) to `$path` with the `$data` using the JWT for the logged in user.

* `setConfigs(array $configs` - Validate & set the configs

* `setDebug(bool $debug)` - Set Guzzle to debug

* `setToken(Token $token)` - Set the token for the Halo API

* `uri(?string $path = null, ?string $url = null)` - Generate a full uri for the path to the Halo API.

* `validToken(?string $scope = null)` - Is the token valid & if provided a scope, is the token approved for the scope

### Using the Client

The Client is meant to emulate [Laravel's models with Eloquent](https://laravel.com/docs/master/eloquent#retrieving-models). When working with Halo resources, you can access properties and relationships [just like you would in Laravel](https://laravel.com/docs/master/eloquent-relationships#querying-relations).

#### Getting the Client object


#### When using `Authorization Code`

By running the migration included in this package, your `User` class will have a `halo_token` column on it. When you set the user's token, it is encrypted in your database with [Laravel's encryption methods](https://laravel.com/docs/master/encryption#using-the-encrypter). After setting the Halo API token, you can access the Client object through `$user->halo`.

```php
php artisan tinker
Psy Shell v0.11.14 (PHP 8.2.4 — cli) by Justin Hileman
> $user = App\Models\User::find(1)
= App\Models\User {#4344
    id: 1,
    name: "Jimmy",
    email: "jimmy.puckett@spinen.com",
    email_verified_at: null,
    ...
> $user->halo;
= Spinen\Halo\Api\Client {#4748}

> $user->halo();
= Spinen\Halo\Support\Builder {#4706}
```

#### Models

The API responses are cast into models with the properties cast into the types as defined in the [Halo API documentation](https://haloservicedesk.com/apidoc/info).  You can review the models in the `src/` folder.  There is a property named `casts` on each model that instructs the Client on how to cast the properties from the API response.  If the `casts` property is empty, then the properties are not defined in the API docs, so an array is returned.

> NOTE: The documented properties on the models are likely to get stale as Halo is in active development

```php
> $user->halo()->teams->first()
= Spinen\Halo\Team {#4967
    +exists: true,
    +incrementing: false,
    +parentModel: null,
    +wasRecentlyCreated: false,
    +timestamps: false,
  }

> $user->halo()->teams->first()->toArray()
= [
    "id" => 1,
    "guid" => "<masked>",
    "name" => "1st Line Support",
    "sequence" => 10,
    "forrequests" => true,
    "foropps" => false,
    "forprojects" => false,
    "ticket_count" => 0,
    "department_id" => 3,
    "department_name" => "SPINEN - Support",
    "inactive" => false,
    "override_column_id" => 0,
    "teamphotopath" => "",
    "use" => "team",
  ]
```

#### Relationships

Some of the responses have links to the related resources.  If a property has a relationship, you can call it as a method and the additional calls are automatically made & returned.  The value is stored in place of the original data, so once it is loaded it is cached.

```php

```

You may also call these relationships as attributes, and the Client will return a `Collection` for you (just like Eloquent).

```php

```

#### Collections

Results are wrapped in a `Spinen\Halo\Support\Collection`, which extends `Illuminate\Support\Collection`, so you can use any of the collection helper methods documented  [Laravel Collection methods](https://laravel.com/docs/master/collections).

#### Filtering using "where"

You can do filters by using `where` on the models.  The first parameter is the property being filtered.  The second is optional, and is the value to filter the property.  If it is left null, then is it true, so it becomes `where('<property', true)`.  All of these values are passed in the query string.

There are a few "helper" methods that are aliases to the `where` filter, to make the calls more expressive.

* `whereId('<id>')` is an alias to `where('id', '<id>')`
* `whereNot('<property>')` is an alias to `where('<property', false)`

> NOTE: Halo's API need the string "true"/"false" for boolean values, which is automatically convert at time of building the query string.

```php

```

#### Search

There is a simple search that you can preform on the endpoints using the `search`.  There are some of the endpoints that allow searching specific fields, which you can access via `search_some_field('<for>')` or `searchSomeField('<for>')`.

```php
> $user->halo()->clients->count()
= 9

// Only clients with a "y" in the name
> $user->halo()->clients()->search('y')->get()->pluck('name')
// Same as: $user->halo()->clients()->where('search', 'y')->get()->pluck('name')
= Spinen\Halo\Support\Collection {#5136
    all: [
      "Terry's Chocolates",
      "Tony's Tyre Emporium",
    ],
  }
```

#### Limit records returned

You can call the `take` or `limit` methods (take is an alias to limit) on the builder to limit the records returned to the count parameter.

```php
> $builder->tickets()->take(7)->get()
= Spinen\Halo\Support\Collection {#4999
    all: [
      Spinen\Halo\Ticket {#4991
        +exists: true,
        +incrementing: false,
        +parentModel: null,
        +wasRecentlyCreated: false,
        +timestamps: false,
      },
      // more...
    ],
  }

> $tickets->count()
= 7
```

#### Order By

You can order the results of the API by using the `orderBy` and `orderByDesc` methods.  Pass in the column you wish to order the results as the first parameter.  `orderByDesc('<column>')` is an alias to `orderBy('<column>', 'desc')`.  Additionally, you can use `latest` or `oldest` to apply `orderBy` or `orderByDesc` with the default of the column in the model that represents when the record was created.  You can pass a different column to either of the methods to override the default column.

```php
// Running through map to convert date to string
> $builder->tickets()->take(5)->oldest()->get()->pluck('dateoccurred', 'id')->map(fn($d) => (string)$d)
= Spinen\Halo\Support\Collection {#4983
    all: [
      1125 => "2019-12-14 13:30:00",
      1128 => "2019-12-14 13:30:00",
      1131 => "2019-12-14 13:30:00",
      1134 => "2019-12-14 13:30:00",
      1137 => "2019-12-14 13:30:00",
    ],
  }

> $builder->tickets()->take(5)->latest()->get()->pluck('dateoccurred', 'id')->map(fn($d) => (string)$d)
= Spinen\Halo\Support\Collection {#4763
    all: [
      2205 => "2021-03-24 11:35:40",
      2206 => "2021-03-24 10:23:47",
      2200 => "2021-03-23 16:44:00",
      2186 => "2021-03-23 14:17:57",
      2187 => "2021-03-23 14:17:57",
    ],
  }
```

> NOTE: The column to use for the `latest` is controlled by the `CREATED_AT` `const` on the models.

#### Pagination

Several of the endpoints support pagination.  You can use simple pagination by chaining `pagination` or `pageination` with an optional size value to the builder.  You can get a specific page with the `page` method that takes page number as a parameter.  You can condense the call by passing pagination size as the second parameter to the `page` method.

```php
// Could have been $builder->users()->paginate(2)->page(2)->get()
> $builder->users()->page(3, 2)->get()
= Spinen\Halo\Support\Collection {#4761
    all: [
      Spinen\Halo\User {#4763
        +exists: true,
        +incrementing: false,
        +parentModel: null,
        +wasRecentlyCreated: false,
        +timestamps: false,
      },
      // more...
    ],
  }

> $users->count()
= 2
```

### More Examples

```php
> $user->halo()->quotes->count()
= 4

$user->halo()->statuses->pluck('name', 'id')->sort()
= Spinen\Halo\Support\Collection {#4959
    all: [
      3 => "Action Required",
      18 => "Approved",
      17 => "Awaiting Approval",
      9 => "Closed",
      15 => "Closed Item",
      13 => "Closed Order",
      20 => "Completed",
      2 => "In Progress",
      16 => "Invoiced",
      1 => "New",
      21 => "On Hold",
      14 => "Open Item",
      12 => "Open Order",
      19 => "Rejected",
      22 => "Updated",
      10 => "With CAB",
      5 => "With Supplier",
      4 => "With User",
    ],
  }
```

## Open Items

* Setup the relationships in the models
* Add getters to models
* Add scopes on models

## Known Issues
