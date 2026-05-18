Tu as parfaitement raison ! Version 1.x, pas de migration dans le README, et le changelog est l'endroit approprié pour les instructions de mise à jour. Voici le README corrigé :

# Laravel FCM Notifications

[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%2F11%2F12-orange)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Laravel FCM Notifications** est un package Laravel puissant et élégant qui intègre Firebase Cloud Messaging (FCM) au système de notifications natif de Laravel. Construit sur la base du package [andydefer/push-notifier](https://github.com/andydefer/push-notifier), il offre une solution complète pour envoyer des notifications push à vos utilisateurs sur Android, iOS et le web.

Ce package suit les principes SOLID et les bonnes pratiques de Laravel, avec une architecture orientée contrat (interfaces) qui le rend extrêmement flexible et testable.

---

## ✨ Fonctionnalités

- **Intégration native** avec le système de notifications de Laravel
- **Gestion automatique des tokens** : enregistrement, validation, invalidation
- **Support multi-appareils** : un utilisateur peut avoir plusieurs tokens
- **Token primaire dynamique** : le token le plus récemment utilisé est automatiquement considéré comme primaire
- **Nettoyage automatique** des tokens expirés ou inutilisés (basé sur `last_used_at`)
- **File d'attente** par défaut pour ne pas bloquer vos requêtes
- **Logging détaillé** pour faciliter le débogage
- **Tests exhaustifs** : plus de 50 tests unitaires et fonctionnels
- **Traductions** : support multilingue (français, anglais)
- **Commandes artisan** pour la maintenance et les tests

---

## 📦 Installation

### Étape 1 : Installer le package

```bash
composer require andydefer/laravel-fcm-notifications
```

### Étape 2 : Publier les fichiers nécessaires

```bash
# Publier la migration
php artisan vendor:publish --provider="Andydefer\FcmNotifications\FcmNotificationServiceProvider" --tag="fcm-migrations"

# Publier la configuration (optionnel)
php artisan vendor:publish --provider="Andydefer\FcmNotifications\FcmNotificationServiceProvider" --tag="fcm-config"

# Publier les traductions (optionnel)
php artisan vendor:publish --provider="Andydefer\FcmNotifications\FcmNotificationServiceProvider" --tag="fcm-translations"
```

### Étape 3 : Exécuter les migrations

```bash
php artisan migrate
```

### Étape 4 : Configurer Firebase

Placez votre fichier de credentials Firebase (fichier JSON du compte de service) dans un emplacement sécurisé, par exemple `storage/app/firebase-credentials.json`.

Ajoutez ensuite le chemin dans votre fichier `.env` :

```env
FIREBASE_CREDENTIALS=/chemin/absolu/vers/firebase-credentials.json
```

---

## ⚙️ Configuration

Le fichier de configuration `config/fcm.php` vous permet de personnaliser le comportement du package :

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials
    |--------------------------------------------------------------------------
    |
    | Définit comment le package s'authentifie auprès de Firebase Cloud Messaging.
    | Vous pouvez soit fournir un chemin vers le fichier JSON des credentials,
    | soit définir la variable d'environnement FIREBASE_CREDENTIALS.
    |
    */
    'credentials' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase-credentials.json')),

    /*
    |--------------------------------------------------------------------------
    | Token Management
    |--------------------------------------------------------------------------
    |
    | Configure la gestion du cycle de vie des tokens FCM :
    | - Durée de validité des tokens inactifs
    | - Limite de tokens par utilisateur/entité notifiable
    | - Nettoyage automatique des tokens expirés
    |
    */
    'tokens' => [
        'expire_inactive_days' => 30,
        'max_per_notifiable' => 10,
        'auto_clean' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Paramètres de journalisation des notifications FCM.
    | Permet de tracer l'envoi des notifications et les éventuelles erreurs.
    |
    */
    'logging' => [
        'enabled' => env('FCM_LOGGING_ENABLED', true),
        'channel' => env('FCM_LOG_CHANNEL', 'stack'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Channel Name
    |--------------------------------------------------------------------------
    |
    | Nom du canal à utiliser dans la méthode via() des notifications.
    | Ce nom doit correspondre à celui défini dans config/services.php
    | pour le driver FCM.
    |
    */
    'channel_name' => 'fcm',

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration de la file d'attente pour les notifications FCM.
    | L'utilisation de la queue est recommandée pour ne pas bloquer
    | la réponse HTTP lors de l'envoi de nombreuses notifications.
    |
    */
    'queue' => [
        'enabled' => env('FCM_QUEUE_ENABLED', true),
        'connection' => env('FCM_QUEUE_CONNECTION', 'redis'),
        'queue' => env('FCM_QUEUE_NAME', 'default'),
    ],
];
```

---

## 🚀 Utilisation

### 1. Préparer votre modèle

Ajoutez l'interface `HasFcmToken` et le trait `HasFcmNotifications` à tous les modèles qui peuvent recevoir des notifications push (généralement `User`).

```php
<?php

namespace App\Models;

use Andydefer\FcmNotifications\Contracts\HasFcmToken;
use Andydefer\FcmNotifications\Traits\HasFcmNotifications;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements HasFcmToken
{
    use HasFcmNotifications, Notifiable;

    // ... votre code existant
}
```

### 2. Enregistrer les tokens des appareils

Quand un utilisateur se connecte avec un nouvel appareil, enregistrez son token FCM :

```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_info' => 'sometimes|array',
        ]);

        /** @var User $user */
        $user = auth()->user();

        $fcmToken = $user->registerFcmToken(
            token: $request->token,
            metadata: $request->input('device_info', [])
        );

        return response()->json([
            'success' => true,
            'message' => trans('fcm::messages.token_registered'),
            'token' => $fcmToken,
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        /** @var User $user */
        $user = auth()->user();

        $user->invalidateFcmToken($request->token);

        return response()->json([
            'success' => true,
            'message' => trans('fcm::messages.token_invalidated'),
        ]);
    }
}
```

### 3. Créer une notification compatible FCM

Créez une notification Laravel classique en implémentant l'interface `ShouldFcm` et en ajoutant la méthode `toFcm()` :

```php
<?php

namespace App\Notifications;

use Andydefer\FcmNotifications\Contracts\ShouldFcm;
use Andydefer\PushNotifier\Dtos\FcmMessageData;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldFcm
{
    use Queueable;

    public function __construct(
        protected string $message,
        protected array $sender
    ) {}

    /**
     * Définit les canaux de notification
     */
    public function via($notifiable): array
    {
        return ['database', 'fcm'];
    }

    /**
     * Prépare la notification pour FCM
     */
    public function toFcm($notifiable): FcmMessageData
    {
        return FcmMessageData::info(
            title: 'Nouveau message',
            body: "Vous avez reçu un message de {$this->sender['name']}",
            data: [
                'sender_id' => (string) $this->sender['id'],
                'message_preview' => substr($this->message, 0, 100),
                'type' => 'new_message',
            ]
        );
    }

    /**
     * Version pour la base de données (optionnel)
     */
    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
            'sender' => $this->sender,
        ];
    }
}
```

### 4. Envoyer la notification

```php
<?php

use App\Notifications\NewMessageNotification;
use App\Models\User;

$user = User::find(1);
$user->notify(new NewMessageNotification(
    message: 'Bonjour, comment allez-vous ?',
    sender: ['id' => 2, 'name' => 'Jean']
));
```

La notification sera automatiquement envoyée à tous les appareils valides de l'utilisateur via FCM.

---

## 📊 Gestion des tokens

### Méthodes disponibles sur les modèles

```php
// Enregistrer un nouveau token
$user->registerFcmToken(
    token: 'device-token-123',
    metadata: ['device' => 'iPhone 15', 'os' => 'iOS 17']
);

// Obtenir tous les tokens valides (triés du plus récent au plus ancien)
$tokens = $user->getFcmTokens(); // ['token-2', 'token-1']

// Obtenir le token principal (le plus récemment utilisé)
$primaryToken = $user->getPrimaryFcmToken();

// Vérifier si l'utilisateur a des tokens
if ($user->hasFcmTokens()) {
    // ...
}

// Invalider un token spécifique
$user->invalidateFcmToken('token-1');

// Invalider tous les tokens
$user->invalidateAllFcmTokens();

// Marquer un token comme utilisé (met à jour last_used_at)
$token = $user->fcmTokens()->first();
$token->markAsUsed();

// Invalider un token directement
$token->invalidate();

// Relation avec les tokens
$tokens = $user->fcmTokens()->get();
```

### Token primaire dynamique

Le token primaire n'est plus un champ statique en base de données. Il est déterminé dynamiquement comme étant le token valide le plus récemment utilisé (basé sur `last_used_at`). Cela signifie que :

- Vous n'avez plus besoin de gérer manuellement quel token est primaire
- L'attribut `is_primary` est maintenant un accesseur dynamique sur le modèle `FcmToken`
- La gestion des tokens est plus simple et plus intuitive

### Gestion automatique des tokens

Le canal FCM invalide automatiquement les tokens quand Firebase retourne une erreur `UNREGISTERED`. Les tokens sont également automatiquement nettoyés selon la limite configurée (LRU - Least Recently Used) : quand un utilisateur dépasse le nombre maximum de tokens autorisé, les tokens les plus anciens sont automatiquement supprimés.

---

## 🎛 Commandes Artisan

### Nettoyer les tokens expirés

```bash
# Nettoyer les tokens inactifs depuis plus de 30 jours
php artisan fcm:clean-tokens

# Spécifier une durée personnalisée
php artisan fcm:clean-tokens --days=15

# Simuler le nettoyage sans invalider
php artisan fcm:clean-tokens --dry-run
```

### Tester la connexion Firebase

```bash
# Tester avec un token réel
php artisan fcm:test-connection device-token-123

# Avec titre et corps personnalisés
php artisan fcm:test-connection device-token-123 --title="Test" --body="Ceci est un test"

# Mode verbeux pour plus de détails
php artisan fcm:test-connection device-token-123 --verbose
```

---

## 🔍 Gestion des erreurs

Le package gère différents types d'erreurs avec des exceptions spécifiques :

```php
use Andydefer\PushNotifier\Exceptions\FcmSendException;
use Andydefer\PushNotifier\Exceptions\FirebaseAuthException;
use Andydefer\PushNotifier\Exceptions\InvalidConfigurationException;

try {
    $user->notify(new NewMessageNotification($message, $sender));
} catch (FcmSendException $e) {
    // Erreur lors de l'envoi FCM
    Log::error('Erreur FCM', [
        'code' => $e->getErrorCode(),
        'message' => $e->getMessage(),
        'status' => $e->getStatusCode(),
    ]);
} catch (FirebaseAuthException $e) {
    // Problème d'authentification Firebase
    Log::critical('Authentification Firebase échouée', [
        'message' => $e->getMessage(),
    ]);
} catch (InvalidConfigurationException $e) {
    // Configuration Firebase invalide
    Log::error('Configuration Firebase invalide', [
        'message' => $e->getMessage(),
    ]);
}
```

---

## 📝 Logs

Si le logging est activé, vous trouverez des entrées utiles dans vos logs :

```
[info] FCM notification sent successfully: {"notifiable_type":"App\Models\User","notifiable_id":1,"token":"device-123","message_id":"projects/.../messages/msg-123"}
[info] FCM token invalidated and removed: {"notifiable_type":"App\Models\User","notifiable_id":1,"token":"device-456"}
[info] FCM multicast notification completed: {"notifiable_type":"App\Models\User","notifiable_id":1,"total_tokens":5,"successful_sends":4,"failed_sends":1,"invalidated_tokens":1}
[error] FCM authentication failed: {"notifiable_type":"App\Models\User","notifiable_id":1,"notification":"App\Notifications\NewMessageNotification"}
```

---

## 🔧 Architecture

### Contrats (Interfaces)

- `HasFcmToken` : contrat que vos modèles doivent implémenter
- `ShouldFcm` : contrat que vos notifications doivent implémenter

### Composants principaux

- `FcmChannel` : le canal de notification Laravel
- `FcmToken` : modèle Eloquent pour stocker les tokens
- `HasFcmNotifications` : trait pour vos modèles
- `CleanExpiredTokensCommand` : commande de nettoyage
- `TestFcmConnectionCommand` : commande de test

---

## 🧪 Tests

```bash
# Exécuter tous les tests
composer test

# Exécuter un test spécifique
./vendor/bin/phpunit --filter test_can_register_fcm_token_with_metadata
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. **Forkez** le projet
2. **Créez une branche** (`git checkout -b feature/ma-fonctionnalite`)
3. **Commitez** vos changements (`git commit -m 'feat: ajoute une fonctionnalité'`)
4. **Poussez** la branche (`git push origin feature/ma-fonctionnalite`)
5. **Ouvrez une Pull Request**

---

## 📄 Licence

Ce package est open-source et disponible sous la licence [MIT](LICENSE).

---

**Laravel FCM Notifications** - La façon élégante d'ajouter les notifications push à vos applications Laravel. 🚀📱