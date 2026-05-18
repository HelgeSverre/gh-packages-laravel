# anpi-gabon/laravel-sso

Package Laravel pour l'intégration du SSO ANPI-Gabon (OAuth 2.0 Authorization Code Flow).  
Utilisez ce package pour que vos applications Laravel s'authentifient via **investingabon.ga**.

---

## Installation

```bash
composer require anpi-gabon/laravel-sso
```

Le service provider est enregistré automatiquement via Laravel Package Discovery.

---

## Configuration

### 1. Variables d'environnement

Ajoutez dans votre `.env` les credentials fournis par l'administrateur ANPI :

```env
ANPI_SSO_CLIENT_ID=5
ANPI_SSO_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUv...
ANPI_SSO_URL=https://investingabon.ga
```

### 2. `config/services.php`

Ajoutez le bloc `anpi` :

```php
'anpi' => [
    'client_id'     => env('ANPI_SSO_CLIENT_ID'),
    'client_secret' => env('ANPI_SSO_CLIENT_SECRET'),
    'redirect'      => env('APP_URL') . '/auth/anpi/callback',
    'base_uri'      => env('ANPI_SSO_URL', 'https://investingabon.ga'),
],
```

---

## Publication des ressources

```bash
# Tout publier d'un coup
php artisan vendor:publish --tag=anpi-sso

# Ou individuellement :
php artisan vendor:publish --tag=anpi-sso-config       # config/anpi-sso.php
php artisan vendor:publish --tag=anpi-sso-migration    # migration users
php artisan vendor:publish --tag=anpi-sso-controller   # ANPIAuthController
php artisan vendor:publish --tag=anpi-sso-routes       # routes/anpi.php
php artisan vendor:publish --tag=anpi-sso-views        # bouton blade
```

---

## Mise en place rapide

### Étape 1 — Migration

```bash
php artisan vendor:publish --tag=anpi-sso-migration
php artisan migrate
```

Cela ajoute les colonnes `anpi_id`, `anpi_token`, `anpi_refresh_token`, `avatar`, `token_expires_at` à la table `users`.

### Étape 2 — Modèle User

Ajoutez dans `app/Models/User.php` :

```php
protected $fillable = [
    // ... existant ...
    'anpi_id', 'anpi_token', 'anpi_refresh_token', 'avatar', 'token_expires_at',
];

protected $hidden = [
    // ... existant ...
    'anpi_token', 'anpi_refresh_token',
];

protected function casts(): array
{
    return [
        // ... existant ...
        'token_expires_at' => 'datetime',
    ];
}
```

### Étape 3 — Controller et routes

```bash
php artisan vendor:publish --tag=anpi-sso-controller
php artisan vendor:publish --tag=anpi-sso-routes
```

Puis dans `routes/web.php` :

```php
require base_path('routes/anpi.php');
```

### Étape 4 — Bouton de connexion

Dans votre vue de login :

```blade
@include('vendor.anpi-sso.button')
```

Ou avec un texte personnalisé :

```blade
@include('vendor.anpi-sso.button', ['slot' => 'Accéder à l\'espace investisseur'])
```

---

## Utilisation du driver directement

```php
use Laravel\Socialite\Facades\Socialite;

// Rediriger vers le SSO
return Socialite::driver('anpi')
    ->scopes(['profile', 'email', 'investor'])
    ->redirect();

// Récupérer l'utilisateur après callback
$user = Socialite::driver('anpi')->user();

$user->getId();       // sub (identifiant ANPI)
$user->getName();     // nom complet
$user->getEmail();    // email
$user->getAvatar();   // URL avatar
$user->token;         // access token
$user->refreshToken;  // refresh token
$user->expiresIn;     // durée de validité (secondes)
```

---

## Scopes disponibles

| Scope | Données accessibles |
|---|---|
| `profile` | Nom, avatar |
| `email` | Adresse email |
| `investor` | Espace investisseur |
| `partner` | Espace partenaires |
| `admin` | Administration ANPI |

---

## Compatibilité

| Laravel | PHP | Version du package |
|---|---|---|
| 10.x | 8.1+ | 1.x |
| 11.x | 8.2+ | 1.x |
| 12.x | 8.2+ | 1.x |

---

## Publication sur Packagist

1. Créez un dépôt GitHub : `anpi-gabon/laravel-sso`
2. Poussez ce code dessus
3. Connectez-vous sur [packagist.org](https://packagist.org) et soumettez l'URL du dépôt
4. Les applications pourront alors installer avec :

```bash
composer require anpi-gabon/laravel-sso
```

---

## Licence

MIT — © ANPI-Gabon, Direction des Systèmes d'Information
