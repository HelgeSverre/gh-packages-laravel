# Laravel Mapbox

<!-- [![Latest Version on Packagist](https://img.shields.io/packagist/v/thomsult/laravel-mapbox.svg?style=flat-square)](https://packagist.org/packages/thomsult/laravel-mapbox)
[![Total Downloads](https://img.shields.io/packagist/dt/thomsult/laravel-mapbox.svg?style=flat-square)](https://packagist.org/packages/thomsult/laravel-mapbox)
[![License](https://img.shields.io/packagist/l/thomsult/laravel-mapbox.svg?style=flat-square)](https://packagist.org/packages/thomsult/laravel-mapbox) -->

Un package Laravel élégant et typé pour intégrer les APIs Mapbox (geocoding, search, directions) dans vos applications Laravel.

## ✨ Fonctionnalités

- 🎯 **API typée** - Auto-complétion complète et type safety
- 🚀 **Fluent API** - Interface intuitive
- 🔧 **Configuration simple** - Prêt à l'emploi en quelques minutes
- 📍 **Support complet** - Search Box API, Geocoding API
- ⚡ **Laravel intégré** - Service Provider, Facade, Configuration, Cache, Rate Limiting, Lock
- 🧪 **Testé** - Tests unitaires et d'intégration

[![Laravel Package CI](https://github.com/thomsult/laravel-mapbox/actions/workflows/laravel.yml/badge.svg)](https://github.com/thomsult/laravel-mapbox/actions/workflows/laravel.yml)
## 📋 Prérequis

- PHP 8.1+
- Laravel 12.0+
- Token d'accès Mapbox

## 🚀 Installation

Installez le package via Composer :

```bash
composer require thomsult/laravel-mapbox
```

Publiez le fichier de configuration :

```bash
php artisan vendor:publish --provider="Thomsult\LaravelMapbox\Providers\MapboxServiceProvider" --tag="config"
```

Ajoutez votre token Mapbox dans votre fichier `.env` :

```env
MAPBOX_ACCESS_TOKEN=votre_token_mapbox_ici
```

## 🔧 Configuration

Le fichier de configuration `config/mapbox.php` permet de personnaliser :

```php
return [
    'access_token' => env('MAPBOX_ACCESS_TOKEN'),
    'base_uri' => 'https://api.mapbox.com/',
    'debug' => env('MAPBOX_DEBUG', false),
    'cache' => [
        'enabled' => env('MAPBOX_CACHE_ENABLED', true),
        'duration' => env('MAPBOX_CACHE_DURATION', 15),
        'timeout' => env('MAPBOX_CACHE_TIMEOUT', 5)
    ],
    'rate' => [
        'enabled' => env('MAPBOX_RATE_ENABLED', true),
        'limit' => env('MAPBOX_RATE_LIMIT', 60),
        'decay' => env('MAPBOX_RATE_DECAY', 60),
    ],
    'search' => [
        'api_version' => 'v1/',
        'prefix' => 'search/',
        'base_endpoint' => 'searchbox/',
        'forward_endpoint' => 'forward',
        'suggest_endpoint' => 'suggest',
        'retrieve_endpoint' => 'retrieve',
        'category_endpoint' => 'category',
        'category_list_endpoint' => 'list/category',
        'reverse_endpoint' => 'reverse',
    ],
    'geocoding' => [
        'api_version' => 'v6/',
        'prefix' => 'search/',
        'base_endpoint' => 'geocode/',
        'forward_endpoint' => 'forward',
        'reverse_endpoint' => 'reverse',
        'batch_endpoint' => 'batch'
    ]
];
```

## 📖 Utilisation

### Recherche de base

```php
Artisan::command('mapbox:search {query}', function ($query) {
    $this->comment('Mapbox search command');

    $response = MapboxClient::client()
        ->autocomplete(fn($req) => $req
            ->query($query)
            ->options(fn($options) => $options
                ->types([PlaceType::PLACE->value])
                ->limit(2)
                ->country('FR')
                ->language('fr')))
        ->call();
});
dd($response); // Affiche la réponse de l'API
```

### Recherche inversée

```php
Artisan::command('mapbox:search:reverse {longitude} {latitude}', function (string $longitude, string $latitude) {
    $this->comment('Mapbox search command');
    $response = MapboxClient::client()->reverse(
        fn($req) => $req
            ->longitude($longitude)
            ->latitude($latitude)
            ->options(
                fn($options) => $options
                    ->language('fr')
            )
    )
        ->call();
    dd($response);
});
```

### Recherche Groupée

```php
Artisan::command('mapbox:geocoding:batch', function () {
    $this->comment('Mapbox search command');
    $response = MapboxClient::client()->batch(
        fn($req) => $req
            ->body(
                fn($body) => $body
                    ->add(
                        (new ForwardTextRequest())
                            ->query("1600 Pennsylvania Avenue NW, Washington, DC 20500, United States")
                            ->options(
                                fn($options) => $options
                                    ->types("address")
                                    ->bbox("-80, 35, -70, 40")
                                    ->limit(1)
                            )
                    )
                    ->add(
                        (new ForwardTextRequest())
                            ->query("1605 Pennsylvania Avenue NW, Washington, DC 20500, United States")
                            ->options(
                                fn($options) => $options
                                    ->types("address")
                                    ->bbox("-80, 35, -70, 40")
                                    ->limit(1)
                            )
                    )
            )
    )
        ->call();
});
```

### Types de lieux disponibles

```php
use Thomsult\LaravelMapbox\Enums\PlaceType;

    case COUNTRY = 'country';
    case REGION = 'region';
    case POSTCODE = 'postcode';
    case DISTRICT = 'district';
    case PLACE = 'place';
    case CITY = 'city';
    case LOCALITY = 'locality';
    case NEIGHBORHOOD = 'neighborhood';
    case STREET = 'street';
    case ADDRESS = 'address';
    case POI = 'poi';
    case CATEGORY = 'category';
    case UNKNOWN = 'unknown';
```
### Utilisation dans des commandes Artisan

```php
Artisan::command('mapbox:search {query}', function ($query) {
    $this->comment('Mapbox search command');

    $response = MapboxClient::client()
        ->autocomplete(fn($req) => $req
            ->query($query)
            ->options(fn($options) => $options
                ->types([PlaceType::PLACE->value])
                ->limit(2)
                ->country('FR')
                ->language('fr')))
        ->call();
});
```
## 🧪 Tests

### Tests unitaires

```bash
composer test
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Créer une Pull Request

## 📄 Licence

Ce package est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Mapbox](https://www.mapbox.com/) pour leur excellente API
- [Laravel](https://laravel.com/) pour le framework
- La communauté open source

## 📞 Support

- 🐛 [Signaler un bug](https://github.com/thomsult/laravel-mapbox/issues)
- 💡 [Demander une fonctionnalité](https://github.com/thomsult/laravel-mapbox/issues)
- 📖 [Documentation](https://github.com/thomsult/laravel-mapbox/blob/main/README.md)

---

Créé avec ❤️ par [Sultan Thomas](https://github.com/thomsult)
