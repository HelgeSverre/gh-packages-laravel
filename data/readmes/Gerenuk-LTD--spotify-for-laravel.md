<img src="https://banners.beyondco.de/Spotify%20for%20Laravel.png?theme=light&packageManager=composer+require&packageName=gerenuk%2Fspotify-for-laravel&pattern=brickWall&style=style_1&description=A+Laravel+wrapper+for+the+Spotify+Web+API&md=1&showWatermark=0&fontSize=100px&images=https%3A%2F%2Flaravel.com%2Fimg%2Flogomark.min.svg" alt="Project banner">

# Spotify for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gerenuk/spotify-for-laravel.svg?style=flat-square)](https://packagist.org/packages/gerenuk/spotify-for-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/gerenuk-ltd/spotify-for-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/gerenuk-ltd/spotify-for-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/gerenuk-ltd/spotify-for-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/gerenuk-ltd/spotify-for-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/gerenuk/spotify-for-laravel.svg?style=flat-square)](https://packagist.org/packages/gerenuk/spotify-for-laravel)

Spotify for Laravel is an easy-to-use [Spotify Web API](https://developer.spotify.com/documentation/web-api) wrapper for Laravel, providing methods for each endpoint and a fluent interface for optional parameters. It is based on [aerni/laravel-spotify](https://github.com/aerni/laravel-spotify) adding support for the ['Authorization Code Flow'](https://developer.spotify.com/documentation/web-api/tutorials/code-flow).

> [!NOTE]
> This package is still under development and may not support all endpoints.

## Table of Contents
1. [Introduction](#spotify-for-laravel)
2. [Version Compatability](#version-compatability)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Optional Parameters](#optional-parameters)
6. [Spotify API Reference](#spotify-api-reference)
   - [Albums](#albums)
   - [Artists](#artists)
   - [Audiobooks](#audiobooks)
   - [Categories](#categories)
   - [Chapters](#chapters)
   - [Episodes](#episodes)
   - [Markets](#markets)
   - [Player](#player)
   - [Playlists](#playlists)
   - [Search](#search)
   - [Shows](#shows)
   - [Tracks](#tracks)
   - [Users](#users)
7. [Testing](#testing)
8. [Changelog](#changelog)
9. [Contributing](#contributing)
10. [Security Vulnerabilities](#security-vulnerabilities)
11. [Credits](#credits)
12. [License](#license)

## Version Compatability

| Plugin | PHP |
|--------|-----|
| 1.x    | 8.x |
| 2.x    | 8.x |

## Installation

You can install the package via composer:

```bash
composer require gerenuk/spotify-for-laravel
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="spotify-for-laravel-config"
```

This is the contents of the published config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | API Base URL
    |--------------------------------------------------------------------------
    |
    | Here you may define the base URL of the Spotify API.
    |
    */

    'api_url' => 'https://api.spotify.com/v1',

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | Here you may define the required settings depending on which auth flow
    | you are using.
    |
    */

    'auth' => [
        'client_id' => env('SPOTIFY_CLIENT_ID'),
        'client_secret' => env('SPOTIFY_CLIENT_SECRET'),
        'redirect_uri' => '',
        'scope' => [],
        'show_dialog' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Config
    |--------------------------------------------------------------------------
    |
    | You may define a default country, locale and market that will be used
    | for your Spotify API requests.
    |
    */

    'default_config' => [
        'country' => null,
        'locale' => null,
        'market' => null,
    ],
];

```

Set the `Client ID` and `Client Secret` of your [Spotify App](https://developer.spotify.com/dashboard) in your `.env` file.

```env
SPOTIFY_CLIENT_ID=********************************
SPOTIFY_CLIENT_SECRET=********************************
```

> [!NOTE]
> You will need to set the 'scope' and 'redirect_uri' if using endpoints that access user data.

## Usage

Before using the methods in this package you will need to generate an `access_token`.

```php
using Gerenuk\SpotifyForLaravel\Facades\SpotifyAuth;

// Using the 'Authorization Code Flow'.
SpotifyAuth::authorize();
SpotifyAuth::generateAccessToken('code'); // redirect_uri?code=

// Using the 'Credentials Flow'.
SpotifyAuth::generateCredentialsToken();
```

Once the `access_token` has expired you will need to generate a new one, this can be done by:

```php
using Gerenuk\SpotifyForLaravel\Facades\SpotifyAuth;

// Using the 'Authorization Code Flow'.
SpotifyAuth::refreshAccessToken();

// Using the 'Credentials Flow'.
SpotifyAuth::generateCredentialsToken();
```

Below is a simple example of searching for tracks with the name `Closed on Sunday`:

```php
use Gerenuk\SpotifyForLaravel\Facades\Spotify;

Spotify::searchTracks('Closed on Sunday')->get();
```

**Important:** The `get()` method acts as the final method of the fluent interface. Make sure to always call it last in the method chain to execute a request to the Spotify Web API.

## Optional Parameters
You may pass optional parameters to your requests using the fluent interface provided by this package. A common use case is to set a `limit` and `offset` to your request.

```php
Spotify::searchTracks('Closed on Sunday')->limit(50)->offset(50)->get();
```

### Parameter Methods API Reference
Consult the [Spotify Web API Reference Documentation](https://developer.spotify.com/documentation/web-api/reference/) to check which parameters are available to what endpoint.

```php
// Limit the response to a particular geographical market.
Spotify::artistAlbums('artist_id')->country('US')->get();

// Filter the query using the provided string.
Spotify::playlist('playlist_id')->fields('description, uri')->get();

// Include any relevant content that is hosted externally.
Spotify::searchTracks('query')->includeExternal('audio')->get();

// Filter the response using the provided string.
Spotify::artistAlbums('artist_id')->includeGroups('album, single, appears_on, compilation')->get();

// Set the number of track objects to be returned.
Spotify::searchTracks('query')->limit(10)->get();

// Set the index of the first track to be returned.
Spotify::searchTracks('query')->offset(10)->get();

// Limit the response to a particular geographical market.
Spotify::searchAlbums('query')->market('US')->get();

// Limit the response to a particular language.
Spotify::category('category_id')->locale('en_US')->get();
```

### Resetting Defaults
You may want to reset the default setting of `country`, `locale` or `market` for a given request. You may do so by calling the corresponding parameter method with an empty argument.

```php
// This will reset the default market to nothing.
Spotify::searchTracks('query')->market()->get();
```

### Response Key
Some API responses are wrapped in a top level object like `artists` or `tracks`. If you want to directly access the content of a given top level object, you may do so by passing its key as a string to the `get()` method.

```php
// This will return the content of the tracks object.
Spotify::searchTracks('query')->get('tracks');
```

## Spotify API Reference

**Note:** Any parameter that accepts multiple values can either receive a string with comma-separated values or an array of values.

```php
// Pass a string with comma-separated values
Spotify::albums('album_id, album_id_2, album_id_3')->get();

// Or pass an array of values
Spotify::albums(['album_id', 'album_id_2', 'album_id_3'])->get();
```

### Albums

```php
// Get an album by ID.
Spotify::album('album_id')->get();

// Get several albums by IDs. Provide a string or array of IDs.
Spotify::albums('album_id, album_id_2, album_id_3')->get();

// Get the tracks of an album by ID.
Spotify::albumTracks('album_id')->get();

// Get the currently authenticated users saved albums.
Spotify::currentUsersSavedAlbums()->get();

// Save one or more albums to the currently authenticated users' library.
Spotify::currentUsersSavedAlbums()->add('album_id', 'album_id_2', 'album_id_3')->save();

// Remove one or more albums to the currently authenticated users' library.
Spotify::currentUsersSavedAlbums()->remove('album_id', 'album_id_2', 'album_id_3')->save();

// Check if one or more albums are saved by the currently authenticated user.
Spotify::currentUsersSavedAlbums()->contains('album_id', 'album_id_2', 'album_id_3')->check();

// Get new album releases shown in the Spotify browse tab.
Spotify::newReleases()->get();
```

### Artists

```php
// Get an artist by ID.
Spotify::artist('artist_id')->get();

// Get several artists by IDs. Provide a string or array of IDs.
Spotify::artists('artist_id, artist_id_2, artist_id_3')->get();

// Get albums of an artist by ID.
Spotify::artistAlbums('artist_id')->get();

// Get the artist's top tracks by ID.
Spotify::artistTopTracks('artist_id')->get();
```

### Audiobooks

```php
// Get an audiobook by ID.
Spotify::audiobook('audiobook_id')->get();

// Get several audiobooks by IDs. Provide a string or array of IDs.
Spotify::audiobooks('audiobook_id, audiobook_id_2, audiobook_id_3')->get();

// Get chapters of an audiobook by ID.
Spotify::audiobookChapters('audiobook_id')->get();

// Get the currently authenticated users saved audiobooks.
Spotify::currentUsersSavedAudiobooks()->get();

// Save one or more audiobooks to the currently authenticated users' library.
Spotify::currentUsersSavedAudiobooks()->add('audiobook_id, audiobook_id_2, audiobook_id_3')->save();

// Remove one or more audiobooks to the currently authenticated users' library.
Spotify::currentUsersSavedAudiobooks()->remove('audiobook_id, audiobook_id_2, audiobook_id_3')->save();

// Check if one or more audiobooks are saved by the currently authenticated user.
Spotify::currentUsersSavedAudiobooks()->contains('audiobook_id, audiobook_id_2, audiobook_id_3')->check();
```

### Categories

```php
// Get a category by ID.
Spotify::category('category_id')->get();

// Get a list of categories.
Spotify::categories()->get();
```

### Chapters

```php
// Get a chapter by ID.
Spotify::chapter('chapter_id')->get();

// Get several chapters by IDs. Provide a string or array of IDs.
Spotify::chapters('chapter_id, chapter_id_2, chapter_id_3')->get();
```

### Episodes

```php
// Get an episode by ID.
Spotify::episode('episode_id')->get();

// Get several episodes by IDs. Provide a string or array of IDs.
Spotify::episodes('episode_id, episode_id_2, episode_id_3')->get();

// Get the currently authenticated users saved episodes.
Spotify::currentUsersSavedEpisodes()->get();

// Save one or more episodes to the currently authenticated users' library.
Spotify::currentUsersSavedEpisodes()->add('episode_id, episode_id_2, episode_id_3')->save();

// Remove one or more episodes to the currently authenticated users' library.
Spotify::currentUsersSavedEpisodes()->remove('episode_id, episode_id_2, episode_id_3')->save();

// Check if one or more episodes are saved by the currently authenticated user.
Spotify::currentUsersSavedEpisodes()->contains('episode_id, episode_id_2, episode_id_3')->check();
```

### Markets

```php
// Get available markets.
Spotify::markets()->get();
```

### Player

```php
// Get the currently authenticated users playback state.
Spotify::playbackState()->get();

// Get the currently authenticated users available devices.
Spotify::availableDevices()->get();

// Get the currently authenticated users currently playing track.
Spotify::currentlyPlayingTrack()->get();

// Get the currently authenticated users recently played tracks.
Spotify::recentlyPlayedTracks()->get();

// Get the currently authenticated users track queue.
Spotify::currentUsersQueue()->get();
```

### Playlists

```php
// Get a playlist by ID.
Spotify::playlist('playlist_id')->get();

// Get a playlist's tracks by ID.
Spotify::playlistTracks('playlist_id')->get();

// Get the currently authenticated users playlists.
Spotify::currentUsersPlaylists()->get();

// Get a users playlists by  user ID.
Spotify::usersPlaylists('user_id')->get();

// Get a playlist's cover image by ID.
Spotify::playlistCoverImage('playlist_id')->get();
```

### Search

```php
// Search items by query. Provide a string or array to the first parameter.
Spotify::searchItems('album, artist, playlist, track, show, episode, audiobook', 'query')->get();

// Search albums by query.
Spotify::searchAlbums('query')->get();

// Search artists by query.
Spotify::searchArtists('query')->get();

// Search playlists by query.
Spotify::searchPlaylists('query')->get();

// Search tracks by query.
Spotify::searchTracks('query')->get();

// Search shows by query.
Spotify::searchShows('query')->get();

// Search episodes by query.
Spotify::searchEpisodes('query')->get();

// Search audiobooks by query.
Spotify::searchAudiobooks('query')->get();
```

### Shows

```php
// Get a show by ID.
Spotify::show('show_id')->get();

// Get several shows by IDs. Provide a string or array of IDs.
Spotify::shows('show_id, show_id_2, show_id_3')->get();

// Get the episodes of a show by ID.
Spotify::showEpisodes('show_id')->get();

// Get the currently authenticated users saved shows.
Spotify::currentUsersSavedShows()->get();

// Save one or more shows to the currently authenticated users' library.
Spotify::currentUsersSavedShows()->add('show_id, show_id_2, show_id_3')->save();

// Remove one or more shows to the currently authenticated users' library.
Spotify::currentUsersSavedShows()->martket('GB')->remove('show_id, show_id_2, show_id_3')->save();

// Check if one or more shows are saved by the currently authenticated user.
Spotify::currentUsersSavedShows()->contains('show_id, show_id_2, show_id_3')->check();
```

### Tracks

```php
// Get a track by ID.
Spotify::track('track_id')->get();

// Get several tracks by IDs. Provide a string or array of IDs.
Spotify::tracks('track_id, track_id_2, track_id_3')->get();

// Get the currently authenticated users saved tracks.
Spotify::currentUsersSavedTracks()->get();

// Save one or more tracks to the currently authenticated users' library.
Spotify::currentUsersSavedTracks()->add('track_id, track_id_2, track_id_3')->save();

// Remove one or more tracks to the currently authenticated users' library.
Spotify::currentUsersSavedTracks()->remove('track_id, track_id_2, track_id_3')->save();

// Check if one or more tracks are saved by the currently authenticated user.
Spotify::currentUsersSavedTracks()->contains('track_id, track_id_2, track_id_3')->check();
```

### Users

```php
// Get the currently authenticated users profile.
Spotify::currentUsersProfile()->get();

// Get the currently authenticated users top items.
Spotify::currentUsersTopItems('item_type')->get();

// Get a user's profile
Spotify::user('user_id')->get();

// Get the currently authenticated users followed artists.
Spotify::followedArtists()->get();
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

- Modified version of [laravel-spotify](https://github.com/aerni/laravel-spotify) from [aerni](https://github.com/aerni)
- [Kieran Proctor](https://github.com/KieranLProctor)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
