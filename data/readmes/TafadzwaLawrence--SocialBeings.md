# Laravel-Socialbeings

[![Latest Version on Packagist](https://img.shields.io/packagist/v/tafadzwa/socialbeings.svg?style=flat-square)](https://packagist.org/packages/tafadzwa/socialbeings)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/tafadzwa/socialbeings/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/tafadzwa/socialbeings/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/tafadzwa/socialbeings/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/tafadzwa/socialbeings/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/tafadzwa/socialbeings.svg?style=flat-square)](https://packagist.org/packages/tafadzwa/socialbeings)

A powerful and flexible package designed to streamline and enhance user engagement within your Laravel applications. This package provides seamless integration for features such as **likes**, **favorites**, **subscriptions**, and **follows**, allowing you to easily implement and manage user interactions.

## Key Features

- **Likes**: Enable users to express their appreciation for content.
- **Favorites**: Allow users to save and revisit their preferred items.
- **Subscriptions**: Keep users updated with the latest content through notifications.
- **Follows**: Facilitate user connections and community building.

Elevate your application’s functionality and keep your users engaged with our comprehensive solution!

## Installation

You can install the package via composer:

```bash
composer require tafadzwa/socialbeings
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="socialbeings-migrations"
php artisan migrate
```

You can publish the config file with:s

```bash
php artisan vendor:publish --tag="socialbeings-config"
```

This is the contents of the published config file:

```php
return [
    'use_uuids' => false, // Default to false, can be set to true by the user

    'user_table' => env('USER_TABLE', 'users'), // Default to 'users'
];
```

## Following

You can follow any model by using import the CanFollow Trait which enable a trait to follow another model

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use TafadzwaLawrence\SocialBeings\Traits\CanFollow;

class User extends Authenticatable
{
    use CanFollow;
    // Other model properties and methods...
}
```

Then the model you want to follow add the following trait

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TafadzwaLawrence\SocialBeings\Traits\Followable;

class Post extends Model
{
    use Followable;

    // Other model properties and methods...
}
```

Use Cases

```php

    $user = User::find(1);
    $post = Post::find(1);

    $user->follow($post);
    $user->unfollow($post);
    $user->isFollowedBy($post);

    $post->followers(); //Retrieve all the followers
    $post->getFollowersCountAttribute();  // Count the number of followers
    $post->getFormattedFollowersCountAttribute();  // Formats using 10K if count is > 1000

```

## Likes

You can like any model by using import the CanFollow Trait which enable a trait to follow another model

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use TafadzwaLawrence\SocialBeings\Traits\CanLike;

class User extends Authenticatable
{
    use CanLike;
    // Other model properties and methods...
}
```

Then the model you want to follow add the following trait

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TafadzwaLawrence\SocialBeings\Traits\Likeable;

class Post extends Model
{
    use Likeable;

    // Other model properties and methods...
}
```

Use case

```php

    $user = User::find(1);
    $post = Post::find(1);

    $user->like($post);
    $post->unlike($user->id);
    $post->isLikedBy($user->id)

```

## Favourites

You can favor any model by using import the CanFavor Trait which enable a trait to favor another model

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use TafadzwaLawrence\SocialBeings\Traits\CanFavor;

class User extends Authenticatable
{
    use CanFavor;
    // Other model properties and methods...
}
```

Then the model you want to favour add the following trait

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TafadzwaLawrence\SocialBeings\Traits\Favourable;

class Post extends Model
{
    use Favourable;

    // Other model properties and methods...
}
```

Use case

```php

    $user = User::find(1);
    $post = Post::find(1);

    $user->favour($post);
    $post->unfavour($user->id);
    $post->isFavouredBy($user->id)

    $post->favorites;
    $post->favorites_count; // K format for > 1000 favourites

```

## Subscriptions

You can favour any model by using import the CanFavor Trait which enable a trait to follow another model

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use TafadzwaLawrence\SocialBeings\Traits\CanSubscribe;

class User extends Authenticatable
{
    use CanSubscribe;
    // Other model properties and methods...
}
```

Then the model you want to favour add the following trait

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TafadzwaLawrence\SocialBeings\Traits\Subscribable;

class Post extends Model
{
    use Subscribable;

    // Other model properties and methods...
}
```

Use case

```php

    $user = User::find(1);
    $post = Post::find(1);

    $user->subscribe($post);
    $post->unsubscribe($user->id);
    $post->isSubscribedBy($user->id)

    $post->subscriptions;
    $post->subscribers_count; // K format for > 1000 favourites

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

- [Tafadzwa Lawrence](https://github.com/Tafadzwa)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
