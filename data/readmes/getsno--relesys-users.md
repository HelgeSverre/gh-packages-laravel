# Relesys User Management API client for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/getsno/relesys-users.svg?style=flat-square)](https://packagist.org/packages/getsno/relesys-users)
[![Total Downloads](https://img.shields.io/packagist/dt/getsno/relesys-users.svg?style=flat-square)](https://packagist.org/packages/getsno/relesys-users)
[![Made in Ukraine](https://img.shields.io/badge/made_in-ukraine-ffd700.svg?labelColor=0057b7)](https://stand-with-ukraine.pp.ua)

This Laravel package provides a simple and crisp way to access the [Relesys](https://api.relesysapp.net/docs/v1.1/intro) User Management API endpoints, query data and update existing entries.
## Installation

This version requires PHP ^8.1 and supports Laravel 10.

1. Install the package via composer:
   ```bash
   composer require getsno/relesys-api
   ```

2. Get your Relesys API access credentials like explained in their [documentation](https://api.relesysapp.net/docs/v1.1/intro/access)
   _(to work with User Management API you must have access to `relesys.api.users` scope)_.

3. Add to your .env file:
   ```dotenv
    RELESYS_CLIENT_ID=""
    RELESYS_CLIENT_SECRET=""
   ```

## Usage

The package supports all the endpoints from "User Management" documentation section 
_(including sorting, filtering and pagination)_. 

The package interface is very similar to documentation sections (`customFields`, `departments`, `userGroups`, `users`, `communication`), 
method names are the same as endpoint names.

#### Examples

```php
use \Relesys;
use \Getsno\Relesys\Api\UserManagement\Entities\User;
use \Getsno\Relesys\Api\UserManagement\Enums\UserStatus;
use \Getsno\Relesys\Api\ApiQueryParams;
use \Getsno\Relesys\Api\UserManagement\Entities\Patches\UserPatch;

// create user
$user = User::fromArray([
    'name'                => 'Anton',
    'primaryDepartmentId' => '0956339c-f3db-4a58-b6b3-d04a56dc85f6',
    'phoneNumber'         => [
        'countryCode' => 47,
        'number'      => '777777',
    ],
    'userGroups'          => [
        [
            'id': 'bfab8670-b3a4-4a6b-bc3a-1d1c7c13a636',
            'dataSource': 'RelesysAPI',
        ],
        [
            'id': 'a213e04f-0860-4449-80a3-5e19771ae57b',
            'dataSource': 'RelesysAPI',
        ]
    ],
]);
$newUser = Relesys::users()->createUser($newUser);

// get user
$user = Relesys::users()->getUser('1cb8e33e-32d6-4353-9b15-93115d96580a');

// change user status
Relesys::users()->changeUserStatus(UserStatus::Disabled);

// get users (with filtering, sorting and pagination)
$queryParams = (new ApiQueryParams)
    ->addFilter('status', UserStatus::Activated->value)
    ->sortBy('name')
    ->limit(10);
$usersBatchResponse = Relesys::users()->getUsers(queryParams: $queryParams, page: 2);

// update user
$userPatch = (new UserPatch())
    ->title('Test title')
    ->birthDate(Carbon::parse('05-02-1991'))
    ->secondaryPhoneNumber(PhoneNumber::fromArray(['countryCode' => 47, 'number' => '777777']));
$user = Relesys::users()->updateUser('1cb8e33e-32d6-4353-9b15-93115d96580a', $userPatch);

// get department
Relesys::departments()->getDepartment('ef6a9dfe-b216-4303-829f-cf2e64bf72a1');

// get user group
Relesys::userGroups()->getUserGroup('f2610cc5-8466-4c9f-aa07-0175290e4f37');

// get custom fields
$customFieldsBatchResponse = Relesys::customFields()->getCustomFields();
```

You can find even more usage examples by checking out the package tests in the `/tests` directory.

## Testing

Tests are based on [testbench](https://github.com/orchestral/testbench) package, 
which means that the tests can be run right away, with Laravel automatically bootstrapped.

Tests support two modes: in isolation _(faking requests)_ or with real credentials
_(real requests to the API)_.
By default, tests are running in isolation, 
to use real requests: copy `phpunit.xml.dist` to `phpunit.xml`, uncomment lines with `RELESYS_CLIENT_ID`
`RELESYS_CLIENT_SECRET` and set the correspondent values there.

There's a docker configuration available here. I highly recommend using it for running the tests.

```bash
cd docker

docker compose up -d

docker exec -it relesys bash

# (optional) to debug a test with xdebug - there's an alias to activate it
# call the alias again to disable it 
xdebug_cli_toggle

composer test
```

### Changelog

Please see [RELEASES](https://github.com/getsno/relesys-users/releases) for more information what has changed recently.

### Credits

- [Anton Samofal](https://github.com/asamofal)

### License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
