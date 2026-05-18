# AfriPay - Unified Payment Gateway for Africa

**Accept payments from Wave, Orange Money, PayDunya, PayTech, Stripe & PayPal in your Laravel app with a single, clean API.**

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sunucode/afripay.svg)](https://packagist.org/packages/sunucode/afripay)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.2-8892BF.svg)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-11%20%7C%2012%20%7C%2013-FF2D20.svg)](https://laravel.com)

---

[Français](#francais) | [English](#english)

---

<a name="francais"></a>
## Français

### Pourquoi AfriPay ?

Les développeurs en Afrique de l'Ouest intègrent manuellement chaque passerelle de paiement dans chaque projet. Wave, Orange Money, PayDunya, PayTech... chacun avec son API, ses webhooks, ses signatures.

**AfriPay unifie tout ca en une seule interface :**

```php
// Payer via Wave
$payment = AfriPay::via('wave')->charge([
    'amount'      => 15000,
    'currency'    => 'XOF',
    'description' => 'Abonnement Premium',
    'success_url' => route('payment.success'),
    'error_url'   => route('payment.error'),
]);

return redirect($payment['redirect_url']);
```

Changer de passerelle ? Une seule ligne :

```php
AfriPay::via('stripe')->charge([...]);
AfriPay::via('paydunya')->charge([...]);
AfriPay::via('orange_money')->charge([...]);
```

### Passerelles supportées

| Passerelle | Pays | Type | Statut |
|------------|------|------|--------|
| **Wave** | SN, CI, ML, BF | Mobile Money | Production |
| **Orange Money** | SN, CI, ML, BF, CM, GN | Mobile Money | Beta |
| **PayDunya** | SN, CI, BJ, TG, BF, ML | Multi-canal | Production |
| **PayTech** | SN | Multi-canal | Production |
| **Stripe** | Global | Carte bancaire | Production |
| **PayPal** | Global | International | Production |

### Installation

```bash
composer require sunucode/afripay
```

#### Installation rapide (recommandé)

Une seule commande génère tout le nécessaire :

```bash
php artisan afripay:install
php artisan migrate
```

La commande crée :
- `config/afripay.php` — configuration des passerelles
- `app/Http/Controllers/AfriPayController.php` — controller avec `success()` et `error()`
- `resources/views/payment/{success,pending,error}.blade.php` — vues de retour (HTML simple, à intégrer dans votre layout)
- Les routes `/payment/success/{reference}` et `/payment/error/{reference}` dans `routes/web.php`
- Les event listeners dans `AppServiceProvider::boot()`

Par défaut, le controller est créé dans `app/Http/Controllers/`. Pour le placer ailleurs :

```bash
# Exemple : app/Http/Controllers/Payment/AfriPayController.php
php artisan afripay:install --controller-path=Http/Controllers/Payment
```

#### Installation manuelle

```bash
php artisan vendor:publish --tag=afripay-config
php artisan migrate
```

Puis suivez les sections [Écouter les événements](#écouter-les-événements-le-plus-important) et [Gestion du retour](#gestion-du-retour-success-url) ci-dessous.

### Configuration

Ajoutez vos clés dans `.env` :

```env
# Passerelle par défaut
AFRIPAY_DEFAULT_GATEWAY=wave
AFRIPAY_CURRENCY=XOF

# Sécurité : seuls les webhooks peuvent confirmer un paiement (recommandé)
# Mettre à false en dev si les webhooks ne peuvent pas atteindre votre serveur
AFRIPAY_TRUST_WEBHOOK_ONLY=true

# Activer/désactiver les passerelles individuellement
AFRIPAY_WAVE_ENABLED=true
AFRIPAY_STRIPE_ENABLED=true
AFRIPAY_PAYDUNYA_ENABLED=true
AFRIPAY_PAYTECH_ENABLED=true
AFRIPAY_ORANGE_MONEY_ENABLED=false
AFRIPAY_PAYPAL_ENABLED=false

# Wave
WAVE_API_KEY=wave_sn_...
# WAVE_API_SECRET (signing secret) : OPTIONNEL
# Renseigner UNIQUEMENT si "Request Signing" est activé sur la clé API Wave.
# Si non activé, laisser vide.
WAVE_API_SECRET=
# WAVE_WEBHOOK_SECRET : OBLIGATOIRE en production si AFRIPAY_TRUST_WEBHOOK_ONLY=true
WAVE_WEBHOOK_SECRET=wave_sn_WHS_...

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayDunya
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
PAYDUNYA_MODE=test

# Orange Money
ORANGE_MONEY_CLIENT_ID=...
ORANGE_MONEY_CLIENT_SECRET=...
ORANGE_MONEY_MERCHANT_KEY=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# PayTech
PAYTECH_API_KEY=...
PAYTECH_API_SECRET=...
PAYTECH_ENV=test
```

### Utilisation

#### Initier un paiement

```php
use SunuCode\AfriPay\Facades\AfriPay;

$payment = AfriPay::via('wave')->charge([
    'amount'      => 25000,
    'currency'    => 'XOF',
    'description' => 'Commande #1234',
    'success_url' => route('orders.payment.success'),
    'error_url'   => route('orders.payment.error'),
    'metadata'    => [
        'order_id' => 1234,
        'user_id'  => auth()->id(),
    ],
]);

// $payment['redirect_url']  -> URL de paiement (rediriger l'utilisateur)
// $payment['transaction']   -> Instance Transaction (sauvegardée en DB)

return redirect($payment['redirect_url']);
```

#### Lier à un modèle (polymorphic)

Passez `payable_type` et `payable_id` pour lier la transaction à n'importe quel modèle de votre application. C'est ce lien qui permet de router la logique métier dans vos listeners (voir section suivante).

```php
// Abonnement
$payment = AfriPay::via('wave')->charge([
    'amount'        => 9900,
    'success_url'   => route('payment.success'),
    'error_url'     => route('payment.error'),
    'payable_type'  => Subscription::class,
    'payable_id'    => $subscription->id,
]);

// Commande e-commerce
$payment = AfriPay::via('paydunya')->charge([
    'amount'        => 25000,
    'success_url'   => route('payment.success'),
    'error_url'     => route('payment.error'),
    'payable_type'  => Order::class,
    'payable_id'    => $order->id,
]);

// Recharge de wallet (sans modèle lié)
$payment = AfriPay::via('orange_money')->charge([
    'amount'        => 5000,
    'success_url'   => route('payment.success'),
    'error_url'     => route('payment.error'),
    'metadata'      => ['user_id' => auth()->id(), 'type' => 'wallet_topup'],
]);
```

#### Écouter les événements (le plus important)

> **Important :** Laravel auto-découvre uniquement les listeners pour les events dans `App\Events\*`.
> Les events d'un package vendor comme AfriPay (`SunuCode\AfriPay\Events\*`) ne sont **jamais auto-découverts**.
> Vous devez les enregistrer manuellement.

Si vous avez utilisé `php artisan afripay:install`, les listeners sont déjà enregistrés avec des `// TODO` à compléter. Sinon, ajoutez-les dans `AppServiceProvider::boot()`.

**Cas simple** — une seule logique de paiement :

```php
Event::listen(PaymentCompleted::class, function ($event) {
    $order = $event->transaction->payable;
    $order->markAsPaid();
});
```

**Cas courant** — plusieurs logiques (abonnement, commande, recharge...) :

Le `payable_type` que vous passez au `charge()` permet de router automatiquement vers la bonne logique. Utilisez `match()` sur le type polymorphique :

```php
// app/Providers/AppServiceProvider.php

use Illuminate\Support\Facades\Event;
use SunuCode\AfriPay\Events\PaymentCompleted;
use SunuCode\AfriPay\Events\PaymentFailed;
use SunuCode\AfriPay\Events\PaymentRefunded;

public function boot(): void
{
    Event::listen(PaymentCompleted::class, function ($event) {
        $transaction = $event->transaction;
        $payable = $transaction->payable; // Le modèle lié (Order, Subscription...)

        match ($transaction->payable_type) {
            \App\Models\Subscription::class => $payable->activate(),
            \App\Models\Order::class        => $payable->markAsPaid(),
            default                         => $this->handleGenericPayment($transaction),
        };
    });

    Event::listen(PaymentFailed::class, function ($event) {
        $transaction = $event->transaction;

        match ($transaction->payable_type) {
            \App\Models\Order::class => $transaction->payable->cancel(),
            default                  => null,
        };

        // Notifier l'utilisateur dans tous les cas
        // Notification::send($transaction->payable?->user, new PaymentFailedNotification($transaction));
    });

    Event::listen(PaymentRefunded::class, function ($event) {
        // $event->reason contient le motif du remboursement
    });
}
```

**Avec des classes Listener dédiées** (recommandé pour les gros projets) :

```php
Event::listen(PaymentCompleted::class, HandleCompletedPayment::class);
Event::listen(PaymentFailed::class, HandleFailedPayment::class);
```

#### Gestion du retour (success URL)

Quand l'utilisateur est redirigé vers votre `success_url` après le paiement, le webhook n'est pas forcément encore arrivé. Vous **devez** appeler `verifyAndProcess()` dans votre controller de retour pour confirmer le paiement :

Si vous avez utilisé `php artisan afripay:install`, le controller est déjà généré avec cette logique. Sinon, voici le code à ajouter dans votre controller de retour :

```php
use SunuCode\AfriPay\Facades\AfriPay;
use SunuCode\AfriPay\Models\Transaction as AfriPayTransaction;

public function success(string $reference)
{
    $transaction = AfriPayTransaction::where('reference', $reference)->firstOrFail();

    // Vérifie auprès de la passerelle ET dispatche PaymentCompleted si confirmé
    $transaction = AfriPay::verifyAndProcess($transaction);

    if ($transaction->status->isCompleted()) {
        return view('payment.success', compact('transaction'));
    }

    // Le paiement n'est pas encore confirmé (webhook en attente)
    return view('payment.pending', compact('transaction'));
}
```

> **Sans cet appel**, si le webhook arrive en retard (ou jamais en dev local),
> l'utilisateur verra une page de succès mais votre logique métier ne sera jamais exécutée.

#### Rembourser

```php
$transaction = AfriPay::refund($transaction, 'Client insatisfait');
// Dispatche PaymentRefunded
```

#### Lister les passerelles actives

```php
// Toutes les passerelles activées via .env
$gateways = AfriPay::enabledGateways();
// ['wave', 'stripe', 'paydunya', 'paytech']

// Vérifier si une passerelle est active
if (AfriPay::isEnabled('orange_money')) {
    // ...
}
```

#### Mode webhook-only vs fallback (trust_webhook_only)

```env
# PRODUCTION (recommandé) — seul le webhook peut confirmer un paiement
AFRIPAY_TRUST_WEBHOOK_ONLY=true

# DÉVELOPPEMENT — l'URL de retour peut aussi confirmer
AFRIPAY_TRUST_WEBHOOK_ONLY=false
```

Quand `trust_webhook_only=true`, `verifyAndProcess()` vérifie le statut auprès de la passerelle mais ne dispatche **aucun événement**. Seul le webhook déclenche `PaymentCompleted`. C'est plus sûr car ça empêche un utilisateur de forger une URL de succès.

⚠️ **Exigence de sécurité** : avec `trust_webhook_only=true`, configurez le secret webhook de chaque passerelle active (ex: `WAVE_WEBHOOK_SECRET`) ; sinon la confirmation de paiement par webhook ne pourra pas être validée.

Quand `trust_webhook_only=false`, les deux chemins (webhook ET URL de retour) peuvent déclencher les événements. Utile en dev local quand les webhooks ne peuvent pas atteindre votre machine.

> **Piège courant en développement :** Si vous développez en local sans tunnel (ngrok, Expose...),
> les webhooks ne peuvent pas atteindre votre machine. Avec `AFRIPAY_TRUST_WEBHOOK_ONLY=true` (défaut),
> `verifyAndProcess()` ne déclenchera **aucun event** et vos paiements resteront en `pending`.
>
> **Solution :** Mettez `AFRIPAY_TRUST_WEBHOOK_ONLY=false` dans votre `.env` local.
> N'oubliez pas de remettre `true` en production.

#### Ajouter une passerelle personnalisée

```php
// Dans un ServiceProvider
use SunuCode\AfriPay\PaymentManager;

PaymentManager::extend('cinetpay', function (array $config) {
    return new CinetPayGateway($config);
});

// Utilisation
AfriPay::via('cinetpay')->charge([...]);
```

### Webhooks

Les webhooks sont automatiquement enregistrés à :

```
POST /afripay/webhooks/wave
POST /afripay/webhooks/stripe
POST /afripay/webhooks/paydunya
POST /afripay/webhooks/orange-money
POST /afripay/webhooks/paytech
POST /afripay/webhooks/paypal
```

Le chemin est configurable via `AFRIPAY_WEBHOOK_PATH`.

**Chaque webhook :**
- Vérifie la signature (HMAC-SHA256 pour Wave/Stripe/PayTech, master_key pour PayDunya)
- Vérifie le montant (tolérance +/- 1 unité)
- Utilise `lockForUpdate()` pour éviter les doublons
- Dispatche `PaymentCompleted` ou `PaymentFailed`

### Sécurité

- **Idempotence** : Le champ `processed_at` empêche le double-traitement
- **Verrouillage DB** : `lockForUpdate()` sur chaque transaction pendant le webhook
- **Vérification de montant** : Tolérance +/- 1 unité avant d'accepter
- **Anti-replay** : Timestamps vérifiés (Wave, Stripe) avec tolérance de 5 min
- **Zero-decimal** : XOF/XAF gérés automatiquement (pas de x100 pour Stripe)
- **Orange Money** : Contre-vérification API obligatoire (pas de signature webhook)

### Événements disponibles

| Événement | Quand | Données |
|-----------|-------|---------|
| `PaymentInitiated` | Après `charge()` | `$transaction`, `$gateway` |
| `PaymentCompleted` | Webhook confirmé | `$transaction` |
| `PaymentFailed` | Webhook échoué | `$transaction` |
| `PaymentRefunded` | Après `refund()` | `$transaction`, `$reason` |

---

<a name="english"></a>
## English

### Why AfriPay?

West African developers manually integrate each payment gateway in every project. Wave, Orange Money, PayDunya, PayTech... each with its own API, webhooks, and signatures.

**AfriPay unifies everything into a single interface:**

```php
$payment = AfriPay::via('wave')->charge([
    'amount'      => 15000,
    'currency'    => 'XOF',
    'description' => 'Premium Subscription',
    'success_url' => route('payment.success'),
    'error_url'   => route('payment.error'),
]);

return redirect($payment['redirect_url']);
```

### Installation

```bash
composer require sunucode/afripay

# Quick setup (recommended) — scaffolds controller, views, routes, and listeners
php artisan afripay:install
php artisan migrate
```

To place the controller in a custom directory:

```bash
php artisan afripay:install --controller-path=Http/Controllers/Payment
```

Or set up manually: `php artisan vendor:publish --tag=afripay-config` and follow the sections below.

### Listening to Events

> **Important:** Laravel only auto-discovers listeners for events in `App\Events\*`.
> Events from a vendor package like AfriPay (`SunuCode\AfriPay\Events\*`) are **never auto-discovered**.
> You must register them manually.

If you used `php artisan afripay:install`, listeners are already registered with `// TODO` placeholders. Otherwise, add them in `AppServiceProvider::boot()`.

Use the `payable_type` set during `charge()` to route to the right business logic:

```php
use Illuminate\Support\Facades\Event;
use SunuCode\AfriPay\Events\PaymentCompleted;
use SunuCode\AfriPay\Events\PaymentFailed;

public function boot(): void
{
    Event::listen(PaymentCompleted::class, function ($event) {
        $transaction = $event->transaction;
        $payable = $transaction->payable;

        match ($transaction->payable_type) {
            \App\Models\Subscription::class => $payable->activate(),
            \App\Models\Order::class        => $payable->markAsPaid(),
            default                         => null,
        };
    });

    Event::listen(PaymentFailed::class, function ($event) {
        // Notify user, log failure, etc.
    });
}
```

### Handling the Success URL

When the user is redirected to your `success_url`, the webhook may not have arrived yet. You **must** call `verifyAndProcess()` in your return controller:

```php
use SunuCode\AfriPay\Facades\AfriPay;
use SunuCode\AfriPay\Models\Transaction as AfriPayTransaction;

public function success(string $reference)
{
    $transaction = AfriPayTransaction::where('reference', $reference)->firstOrFail();
    $transaction = AfriPay::verifyAndProcess($transaction);

    if ($transaction->status->isCompleted()) {
        return view('payment.success', compact('transaction'));
    }

    return view('payment.pending', compact('transaction'));
}
```

### AFRIPAY_TRUST_WEBHOOK_ONLY

> **Common pitfall in development:** Without a tunnel (ngrok, Expose...), webhooks can't reach
> your local machine. With `AFRIPAY_TRUST_WEBHOOK_ONLY=true` (default), `verifyAndProcess()` will
> **not dispatch any events** and your payments will stay `pending`.
>
> **Fix:** Set `AFRIPAY_TRUST_WEBHOOK_ONLY=false` in your local `.env`.
> Remember to set it back to `true` in production.

### Custom Gateways

Extend AfriPay with your own gateways:

```php
use SunuCode\AfriPay\Contracts\GatewayInterface;
use SunuCode\AfriPay\PaymentManager;

class CinetPayGateway implements GatewayInterface
{
    // Implement the 4 methods: charge(), handleWebhook(), verify(), verifySignature()
}

PaymentManager::extend('cinetpay', fn($config) => new CinetPayGateway($config));
```

### Security

- **Idempotent processing** via atomic `processed_at` flag
- **Database locking** (`lockForUpdate`) prevents race conditions
- **Amount verification** with configurable tolerance
- **Replay protection** with timestamp validation (Wave, Stripe)
- **Zero-decimal currencies** (XOF, XAF) handled automatically
- **Orange Money**: Mandatory API counter-verification (no webhook signature)

---

## Requirements

- PHP >= 8.2
- Laravel 11, 12, or 13
- A database supporting `lockForUpdate()` (MySQL, PostgreSQL)

## Contributing

Contributions are welcome! Please submit pull requests to the `main` branch.

## Credits

- Built by [Sunu Code](https://sunucode.com) — Software agency based in Dakar, Senegal
- Extracted from [Semplio](https://semplio.com) — Business management SaaS for African SMEs

## License

MIT License. See [LICENSE](LICENSE) for details.
