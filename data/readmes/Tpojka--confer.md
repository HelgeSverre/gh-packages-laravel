_Prologue_

Package uses abandoned https://github.com/dazzz1er/confer as base point.

# Confer
Add a real-time chat system to your Laravel website/application in a few lines of code.

# Demo
The demo is currently unavailable as the project is being upgraded.

# Requirements
The project currently requires Pusher (php-server and javascript) to allow real-time chat messaging. Service is recommended if you need to do real-time messaging - it's fast, reliable and very easy to implement in your projects.

You can create a free sandbox account at [pusher.com](https://www.pusher.com) which lets you have 1,000,000 messages a day (or 200,000 depending on your plan) and 100 concurrent connections for free. If you need higher limits they offer paid accounts at pretty decent prices.

Other requirements:

 * moment.js (it makes updating the chat timestamps so much easier)
 * jQuery
 * Font Awesome 6

# Installation

Require the package via composer:
`composer require tpojka/confer`

Publish the assets:
`php artisan vendor:publish`

Add the service provider `Tpojka\Confer\ConferServiceProvider::class` to your `bootstrap/providers.php` if needed (standard for Laravel 11+) or `config/app.php` (for older versions).

Add the seed to your database seed caller (typically `database/seeds/DatabaseSeeder.php` or `database/seeders/DatabaseSeeder.php`):

```php
class DatabaseSeeder extends Seeder {

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(ConferSeeder::class); // Laravel 7+ style
        $this->call('ConferSeeder');
    }
}
```

Migrate your database with the seeds in tow:
`php artisan migrate --seed`

Add the trait to your User model:

```php
use Tpojka\Confer\Traits\CanConfer;

class User extends Authenticatable {

  use CanConfer;

}
```

Link to the css file, and import the view partials in whichever pages you wish to have the chat on, or put it in your app/master file (if you are using one) to show on all pages. 

**Note: The JS partial must be wrapped in an `@auth` check since it requires a logged-in user.**

```html
<link href="{{ asset('vendor/confer/css/confer.css') }}" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

@auth
    @include('confer::confer')
@endauth

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://js.pusher.com/7.0/pusher.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

@auth
    @include('confer::js')
@endauth
```

# Configuration
There are a number of options in the confer.php config file which are quite self explanatory, but in short you can:

 * Provide a company avatar (this is the image that will show as your global chat icon should you...)
 * Allow global chat - have a free-for-all open chat, or don't... it's up to you
 * Specify a different loader to the one used (default is a sweet looking .svg by [Sam Herbert](http://samherbert.net/svg-loaders/))
 * Change the directory where avatars are stored
 * Enable some serious grammar enforcing (currently capitals at start of sentences, and refusal to allow the use of numbers between 0-9 without converting them to their word format)

The avatar, loader and company avatar are all relative to your app's /public dir.

Your Pusher app details are not configured in the config file provided, they are instead expected to be provided in your `config/broadcasting.php` file (standard Laravel broadcasting configuration).

## Upgrade to Laravel 12.0
Version 12.0 of the package supports Laravel 12.0 and above.
- Minimum PHP requirement: `>=8.2`
- Dependencies: `illuminate/support: ^12.0`, `pusher/pusher-php-server: ^7.2`

## Upgrade to Laravel 11.0
Version 11.0 of the package supports Laravel 11.0 and above.
- Minimum PHP requirement: `>=8.2`
- Dependencies: `illuminate/support: ^11.0`, `pusher/pusher-php-server: ^7.2`

## Upgrade to Laravel 10.0
Version 10.0 of the package supports Laravel 10.0 and above.
- Minimum PHP requirement: `>=8.1`
- Dependencies: `illuminate/support: ^10.0`, `pusher/pusher-php-server: ^7.2`

## Upgrade to Laravel 9.0
Version 9.0 of the package supports Laravel 9.0 and above.
- Minimum PHP requirement: `>=8.0`
- Dependencies: `illuminate/support: ^9.0`, `pusher/pusher-php-server: ^4.0`

## Upgrade to Laravel 8.0
Version 8.0 of the package supports Laravel 8.0 and above.
- Minimum PHP requirement: `>=7.3`
- Dependencies: `illuminate/support: ^8.0`, `pusher/pusher-php-server: ^4.0`

# Assumptions of the package
The package assumes you have a User model in the App namespace, and that this model has a `name` attribute (hey, if you don't have one already, why not create one with a custom getter?) and an `avatar` attribute - which is simply the filename of the avatar image file (for example `avatar-dan.jpg`) which will be appended to your avatar_dir provided in the config file of the package to find your avatar.

# Optionals
There is an optional facebook messages type bar, which you can include in your project if you'd like that functionality.

Simply put the following inside a suitable containing element (like a dropdown li):

```html
@auth
    @include('confer::barconversationlist')
@endauth
```

If you are using bootstrap this is what I have my bar view inside:
```html
<li>
  <a href="#" data-toggle="dropdown" class="dropdown-toggle" style="position: relative;" id="messages_open_icon"><i class="fa fa-btn fa-envelope"></i></a>
  <ul class="dropdown-menu">
    <li style="width: 400px; min-height: 40px;">
      <ul id="messages_holder_in_bar">
      
      @auth
          @include('confer::barconversationlist')
      @endauth
      
      </ul>
      <!-- Messages -->
    </li>
  </ul>
</li>
```


# Potential updates
Likely updates include adding mentions, sounds and changing conversation names after the initial setup.

What would you like to see?

# Closing
If you use this package in your project it would mean the absolute world to me if you let me know! This is my first package, and my first piece of code shared so really... it's close to me.
That said please feel free to contribute to the project - I think it has a solid foundation for expansion.
