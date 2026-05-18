# Laravel Social Interactions (Save, Votes, Like, Dislike, React)

[![Test & Lint](https://github.com/toneflix/laravel-social-interactions/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/toneflix/laravel-social-interactions/actions/workflows/run-tests.yml)
[![Latest Stable Version](https://img.shields.io/packagist/v/toneflix-code/social-interactions.svg?style=flat-square&label=Latest+Stable+Version)](https://packagist.org/packages/toneflix-code/social-interactions) [![Total Downloads](https://img.shields.io/packagist/dt/toneflix-code/social-interactions.svg?style=flat-square)](https://packagist.org/packages/toneflix-code/social-interactions) [![Latest Unstable Version](https://img.shields.io/packagist/v/toneflix-code/social-interactions.svg?include_prereleases&style=flat-square&label=Latest+Unstable+Version)](https://packagist.org/packages/toneflix-code/social-interactions) [![License](https://img.shields.io/github/license/toneflix/laravel-social-interactions
)](https://packagist.org/packages/toneflix-code/social-interactions) [![PHP Version Require](https://img.shields.io/packagist/dependency-v/toneflix-code/social-interactions/php
)](https://packagist.org/packages/toneflix-code/social-interactions)
[![codecov](https://codecov.io/gh/toneflix/laravel-social-interactions/graph/badge.svg?token=WJfyCnmcZS)](https://codecov.io/gh/toneflix/laravel-social-interactions)

<!-- ![GitHub Actions](https://github.com/toneflix/laravel-social-interactions/actions/workflows/run-tests.yml/badge.svg) -->

Laravel Social Interactions adds to your project the ability to create social interactions like **saves, votes, likes, dislikes, reactions, Etc.** with your models.

## Contents

1.  [**Use Cases**](#use-cases)
2.  [**Installation**](#installation)
3.  [**Package Discovery**](#package-discovery)
4.  [**Configuration**](#configuration)
5.  [**Usage**](#usage)
    -   [Likes](#likes)
    -   [Dislikes](#dislikes)
    -   [Reactions](#reactions)
    -   [Votes](#votes)
    -   [Saving](#saving)
    -   [Accessing the interaction relationship](#accessing-the-interaction-relationship)
    -   [Accessing the interactor relationship](#accessing-the-interactor-relationship)
    -   [Accessing the interaction relationship for the interacting model](#accessing-the-interaction-relationship-for-the-interacting-model)
    -   [Get Model Interaction for a specific Interactor](#get-model-interaction-for-a-specific-interactor)
    -   [Get Interaction Data](#get-interaction-data)
    -   [Accessing saved items relationship](#accessing-saved-items-relationship)
    -   [Accessing saved items relationship for the interacting model](#accessing-saved-items-relationship-for-the-interacting-model)
6.  [**Testing**](#testing)
7.  [**Changelog**](#changelog)
8.  [**Contributing**](#contributing)
9.  [**Security**](#security)
10. [**Credits**](#credits)
11. [**License**](#license)

## Use Cases

1. Voting System (Upvoting and Downvoting)
2. Bookmarking System
3. Liking and Reaction System
4. Anything that requires a third party user to approve or reject.

## Installation

1. Install the package via composer:

    ```bash
    composer require toneflix-code/social-interactions
    ```

2. Publish resources (migrations and config files) \[Optional\]:

    - Config File

        ```shell
        php artisan vendor:publish --tag=social-interactions-config
        ```

        After publishing, the config file can be found in `config/social-interactions.php`

    - Migration Files

        ```shell
        php artisan vendor:publish --tag=social-interactions-migrations
        ```

3. Before running migrations, you may want to take a look at the `tables` config if you want to customize the table names used by the package. Finally. run the migrations with the following command:

    ```shell
    php artisan migrate
    ```

4. Done!

## Package Discovery

Laravel automatically discovers and publishes service providers but optionally after you have installed Laravel Fileable, open your Laravel config file config/app.php and add the following lines.

In the $providers array add the service providers for this package.

```php
ToneflixCode\SocialInteractions\SocialInteractionsServiceProvider::class
```

Add the facade of this package to the $aliases array.

```php
'SocialInteraction' => ToneflixCode\SocialInteractions\Facades\SocialInteraction::class
```

## Configuration

If you published

## Usage

For a model to be able to interact with other models, it has to be using the `ToneflixCode\SocialInteractions\Traits\CanSocialInteract` trait.

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use ToneflixCode\SocialInteractions\Traits\CanSocialInteract;

class User extends Authenticatable
{
    use HasFactory;
    use CanSocialInteract;
}
```

Also the model which is to be intracted with will implement the `ToneflixCode\SocialInteractions\Traits\HasSocialInteractions` trait.

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ToneflixCode\SocialInteractions\Traits\HasSocialInteractions;

class Post extends Model
{
    use HasFactory;
    use HasSocialInteractions;
}
```

At this point you're are ready to begin creating social interactions with your models.

### Likes

To leave a like, call the `leaveReaction` method on the model with the `CanSocialInteract` trait, passing the model with the `HasSocialInteractions` trait as the first parameter and either of `0`, `1`, `false`, `true` as the second.
If a model is already liked, a second call will unlike the model.
Likes are only available if the `enable_reactions` config property is set to `false`, otherwise this will set the reaction to the first reaction defined in the `available_reactions` config property.

1. Like

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $user->leaveReaction($post, true);
    ```

2. Unlike

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $user->leaveReaction($post, false);
    ```

#### Check if a model has been liked

To check if a model has been liked, call the `isLiked` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$liked = $post->isLiked($user);
```

### Dislikes

To leave a dislike, call the `leaveReaction` method on the model with the `CanSocialInteract` trait, passing the model with the `HasSocialInteractions` trait as the first parameter and `dislikee` as the second.
If a model is already disliked, a second call will undislike the model.
Dislikes are only available if the `enable_dislikes` config property is set to `true`.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$reaction = $user->leaveReaction($post, 'dislike');
```

#### Check if a model has been disliked

To check if a model has been disliked, call the `isDisliked` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$disliked = $post->isDisliked($user);
```

### Reactions

Reactions can be enabled and available reactions can be set in the config file.
To leave a reaction, call the `leaveReaction` method on the model with the `CanSocialInteract` trait, passing the model with the `HasSocialInteractions` trait as the first parameter and the desired reaction as the second.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$reaction = $user->leaveReaction($post, 'love');
```

```php
$user = \App\Models\User::find(3);
$post = \App\Models\Post::find(2);

$reaction = $user->leaveReaction($post, 'haha');
```

#### Check if a model has been reacted to

To check if a model has been reacted to, call the `isReacted` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$reacted = $post->isReacted($user);
```

### Votes

To vote for a model, call the `giveVote` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the first parameter and either of `true` or `false` as the second.
If a model is already voted and the `multiple_votes` config property is set to true, subsequent calls will add to the vote count of the model.
By default, voted models can not be unvoted for, to allow unvotes, set the `enable_unvote` config property to `true`.

1. Vote

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->giveVote($user, true);
    ```

1. Unvote

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->giveVote($user, false);
    ```

#### Check if a model has been voted for

To check if a model has been voted for, call the `isVoted` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$voted = $post->isVoted($user);
```

### Saving

To mark a model as saved, call the `toggleSave` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the first parameter and either of `true` or `false` as the second.

1. Save

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->toggleSave($user, true);
    ```

1. Unsave

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->toggleSave($user, false);
    ```

#### Check if a model has been saved

To check if a model has been saved, call the `isSaved` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$saved = $post->isSaved($user);
```

Optionally, you can pass the name of a list as a second parameter to check if the model has been saved to the list.

```php
$user = \App\Models\User::find(1);
$post = \App\Models\Post::find(2);

$saved = $post->isSaved($user, 'default');
```

#### Saving to a list

To save a model to a list, call the `toggleSaveToList` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the first parameter and either of `true` or `false` as the second and the `list name` as the third.

1. Save

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->toggleSaveToList($user, true, 'default');
    $reaction = $post->toggleSaveToList($user, true, 'reusable');
    ```

1. Unsave

    ```php
    $user = \App\Models\User::find(1);
    $post = \App\Models\Post::find(2);

    $reaction = $post->toggleSaveToList($user, false, 'default');
    $reaction = $post->toggleSaveToList($user, false, 'reusable');
    ```

#### Retrieving your lists

To retrieve the names of all your saved lists, access the `saved_social_lists` property on the model with the `CanSocialInteract` trait.
You get a collection with all the names.

```php
$user = \App\Models\User::find(1);

$lists = $user->saved_social_lists;
```

#### Deleting lists

To delete a saved list, call the `deleteSavedSocialList` method on the model with the `CanSocialInteract` trait, passing the name of the desired list to delete as the only parameter or `true` to delete all lists.

```php
$user = \App\Models\User::find(1);

$lists = $user->deleteSavedSocialList('default');
```

OR

```php
$user = \App\Models\User::find(1);

$lists = $user->deleteSavedSocialList(true);
```

### Accessing the interaction relationship

The interaction relationship can be accessed from the `socialInteractions` property or method (if you need finer grain control and access to the Eloquent builder instance) on the model with the `HasSocialInteractions` trait.

```php
$post = \App\Models\Post::find(1);

$interactions = $post->socialInteractions;
```

OR

```php
$post = \App\Models\Post::find(1);

$interactions = $post->socialInteractions()->orderBy('id')->paginate(10);
```

### Accessing the interactor relationship

The interactor relationship which represent the model (or user) that interacted with the model can be accessed from the `interactor` property or method (if you need finer grain control and access to the Eloquent builder instance) on the `SocialInteraction` model.

```php
$post = \App\Models\Post::find(1);

$interactions = $post->socialInteractions;

foreach ($interactions as $interaction) {
    $interactor = $interaction->interactor;
}
```

### Accessing the interaction relationship for the interacting model

The interaction relationship for the interacting model can be accessed from the `socialInteracts` property or method (if you need finer grain control and access to the Eloquent builder instance) on the model with the `CanSocialInteract` trait.

```php
$post = \App\Models\Post::find(1);

$interactions = $post->socialInteracts;
```

OR

```php
$post = \App\Models\Post::find(1);

$interactions = $post->socialInteracts()->orderBy('id')->paginate(10);
```

### Get Model Interaction for a specific Interactor

To get the model interaction, call the `modelInteraction` method on the model with the `HasSocialInteractions` trait, passing the model with the `CanSocialInteract` trait as the only parameter.
Since the package uses a single model for all interactions, this will return the `SocialInteraction` model for the current model with the `HasSocialInteractions` trait.

```php
$post = \App\Models\Post::find(1);
$user = \App\Models\User::find(1);

$interaction = $post->modelInteraction($user);
```

### Get Interaction Data

For convinience, the package also provides the `socialInteractionData` method on the model with the `HasSocialInteractions` trait to help you quickly get the interaction stats for the model as a Laravel collection, passing the model with the `CanSocialInteract` trait as the only parameter will also attach the interaction states for the interacting model.

```php
$post = \App\Models\Post::find(1);

$data = $post->socialInteractionData();
```

Example Output:

```php
Array[
    'votes' => 10,
    'likes' => 5,
    'dislikes' => 1,
    'reactions' => 7,
]
```

With Interactor:

```php
$post = \App\Models\Post::find(1);
$user = \App\Models\User::find(3);

$data = $post->socialInteractionData($user);
```

Example Output:

```php
Array[
    'votes' => 10,
    'likes' => 5,
    'dislikes' => 1,
    'reactions' => 7,
    'saved' => true,
    'voted' => true,
    'liked' => false,
    'reacted' => true,
    'ownvotes' => 1,
    'disliked' => false,
    'reaction' => 'love',
    'reaction_color' => 'red',
    'state_icons' => [
        'saved' => 'fas fa-bookmark',
        'voted' => 'fas fa-thumbs-up',
        'disliked' => 'far fa-thumbs-down',
        'reaction' => 'fas fa-heart',
    ],
]
```

### Accessing saved items relationship

The saved items relationship can be accessed from the `socialInteractionSaves` property or method (if you need finer grain control and access to the Eloquent builder instance) on the model with the `HasSocialInteractions` trait.

```php
$post = \App\Models\Post::find(1);

$saves = $post->socialInteractionSaves;
```

OR

```php
$post = \App\Models\Post::find(1);

$saves = $post->socialInteractionSaves()->whereBetween('created_at', ['2024-00-12 11:22:01', '2024-07-12 11:22:01'])->paginate(10);
```

### Accessing saved items relationship for the interacting model

The saved items relationship for the interacting model can be accessed from the `savedSocialInteracts` property or method (if you need finer grain control and access to the Eloquent builder instance) on the model with the `CanSocialInteract` trait.

```php
$post = \App\Models\Post::find(1);

$saves = $post->savedSocialInteracts;
```

OR

```php
$post = \App\Models\Post::find(1);

$saves = $post->savedSocialInteracts()->whereBetween('created_at', ['2024-00-12 11:22:01', '2024-07-12 11:22:01'])->paginate(10);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email code@toneflix.com.ng instead of using the issue tracker.

## Credits

-   [Toneflix Code](https://github.com/toneflix)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
