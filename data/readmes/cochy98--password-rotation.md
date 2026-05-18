# cosmoferrigno/password-rotation

Laravel package per la rotazione obbligatoria delle password. Intercetta le richieste degli utenti autenticati e li reindirizza alla pagina di cambio password quando la scadenza è stata superata. Supporta sia applicazioni **Blade** sia applicazioni **Inertia.js/React**, con un pannello amministrativo integrato per la gestione delle scadenze.

---

## Requisiti

- PHP `^8.1`
- Laravel `^10.0 | ^11.0 | ^12.0`

---

## Installazione

### 1. Aggiungi la sorgente in `composer.json`

**Da path locale (monorepo):**
```json
"repositories": [
    {
        "type": "path",
        "url": "packages/cosmoferrigno/password-rotation",
        "options": { "symlink": true }
    }
],
"require": {
    "cosmoferrigno/password-rotation": "@dev"
}
```

**Da repository VCS:**
```json
"repositories": [
    {
        "type": "vcs",
        "url": "https://github.com/cochy98/password-rotation"
    }
],
"require": {
    "cosmoferrigno/password-rotation": "^1.0"
}
```

### 2. Installa il package

```bash
composer update cosmoferrigno/password-rotation
```

Il service provider e la facade vengono scoperti automaticamente tramite Laravel Package Discovery. Non occorre registrarli manualmente.

### 3. Pubblica e applica la migration

```bash
php artisan vendor:publish --tag=password-rotation-migrations
php artisan migrate
```

La migration aggiunge la colonna `password_expires_at` (nullable timestamp, posizionata dopo `password`) alla tabella `users`. Se la colonna esiste già, la migration non fa nulla.

### 4. Aggiungi il trait al modello `User`

```php
use Cosmoferrigno\PasswordRotation\Traits\HasPasswordRotation;

class User extends Authenticatable
{
    use HasPasswordRotation;
}
```

Il trait registra automaticamente il cast `datetime` e aggiunge `password_expires_at` al `$fillable`.

### 5. Applica il middleware alle route protette

Il service provider registra l'alias `password.rotation`. Aggiungilo a tutti i gruppi di route che richiedono autenticazione:

```php
// routes/web.php
Route::middleware(['auth', 'password.rotation'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    // ...
});
```

> **Redirect loop**: le route di cambio password devono essere escluse dal middleware. Il modo più sicuro è aggiungerle alla lista `excluded_routes` nella configurazione (vedi sezione [Route escluse](#route-escluse-dal-controllo)).

---

## Route registrate automaticamente

Il package registra le seguenti route nel boot del service provider (disabilitabili via config):

### Route utente

| Metodo | URL | Nome | Middleware |
|--------|-----|------|------------|
| `GET` | `/password/change` | `password.change` | `web`, `auth` |
| `POST` | `/password/change` | `password.change.update` | `web`, `auth` |

Il controller incluso (`PasswordChangeController`) rileva automaticamente se Inertia è installato:
- **Inertia**: esegue `Inertia::render('Auth/ChangePassword', ['daysUntilExpiry' => …])`
- **Blade**: esegue `view('password-rotation::change-password', ['daysUntilExpiry' => …])`

### Route amministratore

| Metodo | URL | Nome | Gate richiesto |
|--------|-----|------|----------------|
| `GET` | `/password-rotation/users` | `password-rotation.users.index` | `manage-password-rotation` |
| `POST` | `/password-rotation/users/{user}/force-reset` | `password-rotation.users.force-reset` | `manage-password-rotation` |

Il pannello admin mostra tutti gli utenti con stato password (scaduta / in scadenza / valida) e permette di forzare il reset al prossimo login.

---

## Pubblicazione delle risorse

| Tag | Contenuto |
|-----|-----------|
| `password-rotation-config` | `config/password-rotation.php` |
| `password-rotation-migrations` | Migration `add_password_expires_at_to_users_table.php` in `database/migrations/` |
| `password-rotation-react` | Componenti Inertia/React: `Pages/Auth/ChangePassword.tsx` e `Pages/PasswordRotation/Users.tsx` |
| `password-rotation-views` | Blade view in `resources/views/vendor/password-rotation/` |

Per pubblicare tutto in una volta:
```bash
php artisan vendor:publish --provider="Cosmoferrigno\PasswordRotation\PasswordRotationServiceProvider"
```

---

## Configurazione

Pubblica il file di configurazione per personalizzarlo:
```bash
php artisan vendor:publish --tag=password-rotation-config
```

### Riferimento completo `config/password-rotation.php`

```php
return [

    // Abilita/disabilita l'intero meccanismo di rotazione.
    // Se false, il middleware non esegue alcun controllo.
    'enabled' => env('PASSWORD_ROTATION_ENABLED', true),

    // Giorni di validità della password.
    // 0 = rotazione disabilitata per tutti gli utenti.
    'days' => env('PASSWORD_ROTATION_DAYS', 90),

    // Nome della tabella utenti (default: 'users').
    'users_table' => 'users',

    // Mappatura colonne per il pannello admin.
    // 'name'    — può essere un accessor Eloquent (es. 'full_name') o una colonna reale.
    // 'sort_by' — array di colonne DB reali usate nell'ORDER BY (non accessor).
    'user_columns' => [
        'id'      => 'id',
        'name'    => 'full_name',
        'email'   => 'email',
        'sort_by' => ['first_name', 'last_name'],
    ],

    // Nome della route a cui reindirizzare quando la password è scaduta.
    'change_route' => env('PASSWORD_ROTATION_CHANGE_ROUTE', 'password.change'),

    // Configurazione route utente.
    // 'enabled' => false per disabilitare le route del package e definirle nell'host app.
    'routes' => [
        'enabled'    => env('PASSWORD_ROTATION_ROUTES', true),
        'middleware' => ['web', 'auth'],
        'prefix'     => '',
    ],

    // Route a cui reindirizzare dopo un cambio password riuscito.
    'redirect_after_change' => env('PASSWORD_ROTATION_REDIRECT', '/'),

    // Route escluse dal controllo del middleware (per nome route).
    'excluded_routes' => [
        // 'password.change',
        // 'logout',
    ],

    // Nome del Gate che protegge le route di amministrazione.
    'gate' => env('PASSWORD_ROTATION_GATE', 'manage-password-rotation'),

    // Configurazione route admin.
    // 'inertia_component' — componente Inertia da renderizzare (default: 'PasswordRotation/Users').
    'admin_routes' => [
        'enabled'           => env('PASSWORD_ROTATION_ADMIN_ROUTES', true),
        'inertia_component' => env('PASSWORD_ROTATION_INERTIA_COMPONENT', 'PasswordRotation/Users'),
    ],
];
```

### Variabili ENV disponibili

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `PASSWORD_ROTATION_ENABLED` | `true` | Abilita/disabilita il controllo |
| `PASSWORD_ROTATION_DAYS` | `90` | Giorni di validità della password |
| `PASSWORD_ROTATION_CHANGE_ROUTE` | `password.change` | Route di cambio password |
| `PASSWORD_ROTATION_REDIRECT` | `/` | Redirect dopo cambio riuscito |
| `PASSWORD_ROTATION_ROUTES` | `true` | Abilita le route utente del package |
| `PASSWORD_ROTATION_ADMIN_ROUTES` | `true` | Abilita le route admin del package |
| `PASSWORD_ROTATION_GATE` | `manage-password-rotation` | Nome del Gate admin |
| `PASSWORD_ROTATION_INERTIA_COMPONENT` | `PasswordRotation/Users` | Componente Inertia del pannello admin |

---

## Comportamento del middleware

Il middleware `CheckPasswordRotation` intercetta ogni richiesta autenticata. Se `needsRotation()` ritorna `true`:

- **Request Blade / standard**: redirect 302 alla route configurata in `change_route`.
- **Request Inertia (header `X-Inertia` presente)**: risposta `409` con header `X-Inertia-Location` che forza una navigazione full-page verso la route di cambio password. Questo garantisce che l'utente Inertia veda il componente corretto senza che il router client-side intercetti la navigazione.

Il middleware non esegue alcun controllo se:
- L'utente non è autenticato.
- `enabled` è `false` nella configurazione.
- La route corrente è nella lista `excluded_routes`.

---

## Come viene calcolata la scadenza

La logica è centralizzata in `PasswordRotationService::resolveExpiresAt()`:

| Stato di `password_expires_at` | Scadenza calcolata |
|--------------------------------|--------------------|
| `null` (mai impostata) | `created_at + rotation_days` |
| Valorizzata | Il valore memorizzato nella colonna |

Dopo ogni cambio password riuscito, `markPasswordChanged()` scrive `now() + rotation_days`. Se `days` è `0`, scrive `null` e `needsRotation()` ritorna sempre `false`.

---

## Gate di amministrazione

Il service provider definisce il Gate `manage-password-rotation` con questo comportamento di default:

- Se il modello `User` espone il metodo `hasPermission()`, delega a `$user->hasPermission('manage-password-rotation')`.
- Altrimenti ritorna `false`.

Per personalizzare la logica, ridefinisci il Gate nel tuo `AuthServiceProvider` **prima** del boot del package (il service provider non sovrascrive un Gate già definito):

```php
// app/Providers/AuthServiceProvider.php
use Illuminate\Support\Facades\Gate;

Gate::define('manage-password-rotation', function ($user): bool {
    return $user->is_admin;
});
```

---

## Route escluse dal controllo

Per evitare redirect loop, aggiungi le route di cambio password agli `excluded_routes`:

```php
// config/password-rotation.php
'excluded_routes' => [
    'password.change',
    'password.change.update',
    'logout',
],
```

---

## Componenti React/Inertia

Il package include due stub React pronti all'uso, pubblicabili con:

```bash
php artisan vendor:publish --tag=password-rotation-react
```

### `Pages/Auth/ChangePassword.tsx`

Form di cambio password con shadcn/ui (`Input`, `Label`, `Button`). Riceve la prop `daysUntilExpiry: number` dal controller e mostra un messaggio contestuale (scaduta vs. in scadenza). Il layout viene rimosso (`ChangePassword.layout = page => <>{page}</>`) per permettere l'uso di un `AuthLayout` dedicato.

### `Pages/PasswordRotation/Users.tsx`

Pannello admin con:
- Statistiche (totale utenti, password scadute, in scadenza entro 14 giorni).
- Tabella con ricerca per nome/email, data di scadenza e badge di stato colorati.
- Azione "Forza reset" con dialog di conferma: imposta `password_expires_at` a ieri, forzando il cambio al prossimo accesso.

I componenti usano esclusivamente shadcn/ui. Sono pubblicati come punto di partenza e possono essere modificati liberamente.

---

## API della Facade / Service

```php
use Cosmoferrigno\PasswordRotation\Facades\PasswordRotation;

// true se la password è scaduta e deve essere cambiata
PasswordRotation::needsRotation(Authenticatable $user): bool

// Giorni rimanenti alla scadenza.
// 0 = scaduta. PHP_INT_MAX = rotazione disabilitata (days = 0).
PasswordRotation::daysUntilExpiry(Authenticatable $user): int

// Data di scadenza effettiva (Carbon).
// Usa password_expires_at se valorizzata, altrimenti created_at + days.
PasswordRotation::resolveExpiresAt(Authenticatable $user): Carbon

// Giorni di rotazione letti dalla configurazione.
PasswordRotation::getRotationDays(): int

// Calcola e salva la nuova password_expires_at dopo un cambio riuscito.
PasswordRotation::markPasswordChanged(Authenticatable $user): void
```

### Helper del trait `HasPasswordRotation`

Gli stessi metodi sono disponibili direttamente sull'istanza `User`:

```php
$user->needsPasswordRotation(): bool
$user->daysUntilPasswordExpiry(): int
$user->passwordExpiresAt(): Carbon
$user->markPasswordChanged(): void
```

---

## Forzare il reset di un utente (da codice)

Il pannello admin gestisce questa operazione via UI, ma puoi farlo anche manualmente:

```php
// Forza il cambio al prossimo login
$user->forceFill(['password_expires_at' => now()->subDay()])->save();
```

---

## Disabilitare le route del package

Se hai bisogno di personalizzare URL o controller, disabilita le route del package e definiscile nell'applicazione host:

```php
// config/password-rotation.php
'routes' => [
    'enabled' => false,
    // ...
],
'admin_routes' => [
    'enabled' => false,
    // ...
],
```

Poi registra le route manualmente puntando ai controller del package o ai tuoi:

```php
use Cosmoferrigno\PasswordRotation\Http\Controllers\PasswordChangeController;
use Cosmoferrigno\PasswordRotation\Http\Controllers\UserPasswordStatusController;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/my-custom-path/change', [PasswordChangeController::class, 'show'])
        ->name('password.change');
    Route::post('/my-custom-path/change', [PasswordChangeController::class, 'update'])
        ->name('password.change.update');
});
```

---

## Applicazioni Blade (senza Inertia)

Se Inertia non è installato, i controller fanno automaticamente il fallback a Blade. La view inclusa è minimal (CSS inline, zero dipendenze) e può essere personalizzata pubblicandola:

```bash
php artisan vendor:publish --tag=password-rotation-views
```

La view viene pubblicata in `resources/views/vendor/password-rotation/` e caricata con namespace `password-rotation::change-password`.
