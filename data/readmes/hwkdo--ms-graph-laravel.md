# Microsoft Graph Laravel

Ein Laravel Package für die Integration mit Microsoft Graph API. Dieses Package bietet eine umfassende Lösung für die Verwaltung von Microsoft 365-Diensten wie Benutzer, E-Mails, OneDrive, Lizenzen und Abwesenheitsvorlagen.

## Installation

Sie können das Package über Composer installieren:

```bash
composer require hwkdo/ms-graph-laravel
```

Sie können die Migrationen veröffentlichen und ausführen:

```bash
php artisan vendor:publish --tag="ms-graph-laravel-migrations"
php artisan migrate
```

Sie können die Konfigurationsdatei veröffentlichen:

```bash
php artisan vendor:publish --tag="ms-graph-laravel-config"
```

### Webhook-Job-Mappings initialisieren

Das Package enthält einen Seeder, um die Standard-Webhook-Job-Mappings zu erstellen:

```bash
php artisan db:seed --class=Hwkdo\\MsGraphLaravel\\Database\\Seeders\\GraphWebhookJobMappingSeeder
```

Alternativ können Sie den Seeder in Ihrem `DatabaseSeeder` registrieren:

```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    $this->call([
        \Hwkdo\MsGraphLaravel\Database\Seeders\GraphWebhookJobMappingSeeder::class,
    ]);
}
```

Der Seeder erstellt automatisch Mappings für folgende Webhook-Typen:
- `intracollect` - Formwerk Mail Webhooks für IntraCollect
- `angebote` - Bestellungen und Angebote Webhooks
- `ntopng` - Ntopng Webhooks
- `onedrive_filer` - OneDrive Filer Webhooks
- `onedrive_filerextern` - Externe OneDrive Filer Webhooks

Die Notification URLs werden automatisch basierend auf der `PORTAL_URL` Umgebungsvariable generiert.

## Konfiguration

Fügen Sie die folgenden Umgebungsvariablen zu Ihrer `.env`-Datei hinzu:

```env
# Microsoft Graph Grundkonfiguration
MSGRAPH_TENTANT_ID=your-tenant-id
MSGRAPH_DEFAULT_SUFFIX=your-domain.com
MICROSOFT_REDIRECT_URI=https://your-app.com/auth/callback

# Standard App Registration
MSGRAPH_APP_ID=your-client-id
MSGRAPH_APP_SECRET_KEY=your-client-secret

# OneDrive App Registration (optional)
MSGRAPH_APP_ID_ONEDRIVE=your-onedrive-client-id
MSGRAPH_APP_SECRET_KEY_ONEDRIVE=your-onedrive-client-secret

# Subscription App Registration (optional)
MSGRAPH_APP_ID_SUBSCRIPTION=your-subscription-client-id
MSGRAPH_APP_SECRET_KEY_SUBSCRIPTION=your-subscription-client-secret

# Subscription Secret
MSGRAPH_SUBSCRIBE_SECRET=your-subscription-secret

# Portal URL für Webhook-Benachrichtigungen
PORTAL_URL=https://portal.hwkdo.com

# Cache Konfiguration
MSGRAPH_CACHE_SECONDS=300
```

### Azure Setup

1. Erstellen Sie eine App-Registrierung im Azure Portal
2. Erstellen Sie einen Client Secret für die App
3. Weisen Sie die erforderlichen Microsoft Graph-Berechtigungen zu:
   - `User.Read.All` - Für Benutzerverwaltung
   - `Mail.Read` - Für E-Mail-Zugriff
   - `Files.Read.All` - Für OneDrive-Zugriff
   - `License.Read.All` - Für Lizenzverwaltung
   - `Presence.Read.All` - Für Anwesenheitsstatus

## Verwendung

### Facade verwenden

```php
use Hwkdo\MsGraphLaravel\Facades\MsGraphLaravel;

// Benutzer abrufen
$user = MsGraphLaravel::getUser('user@domain.com');

// Benutzerpräsenz abrufen
$presence = MsGraphLaravel::getUserPresence('user@domain.com');

// Benutzerteams abrufen
$teams = MsGraphLaravel::getUserTeams('user@domain.com');
```

### Dependency Injection verwenden

```php
use Hwkdo\MsGraphLaravel\Services\UserService;
use Hwkdo\MsGraphLaravel\Services\LicenseService;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
        private LicenseService $licenseService
    ) {}

    public function getUserInfo(string $email)
    {
        $user = $this->userService->getUser($email);
        $licenses = $this->licenseService->getLicenseDetails($email);
        
        return response()->json([
            'user' => $user,
            'licenses' => $licenses
        ]);
    }
}
```

## Verfügbare Services

### UserService

Verwaltung von Microsoft 365-Benutzern:

```php
use Hwkdo\MsGraphLaravel\Services\UserService;

$userService = app(UserService::class);

// Benutzer nach UPN abrufen
$user = $userService->getUserByUpn('user@domain.com');

// Benutzer nach Alias abrufen
$user = $userService->getUserByAlias('user');

// Benutzer aktualisieren
$userService->update('user@domain.com', ['displayName' => 'New Name']);

// Benutzerpräsenz abrufen
$presence = $userService->getUserPresence('user@domain.com');

// Benutzerteams abrufen
$teams = $userService->getUserTeams('user@domain.com');

// Direkte Gruppen abrufen
$groups = $userService->getUserDirectGroups('user@domain.com');

// Transitive Gruppen abrufen
$groups = $userService->getUserTransitiveGroups('user@domain.com');
```

### LicenseService

Verwaltung von Microsoft 365-Lizenzen:

```php
use Hwkdo\MsGraphLaravel\Services\LicenseService;

$licenseService = app(LicenseService::class);

// Lizenzdetails abrufen
$licenses = $licenseService->getLicenseDetails('user@domain.com');
```

### MailboxService

E-Mail-Verwaltung:

```php
use Hwkdo\MsGraphLaravel\Services\MailboxService;

$mailboxService = app(MailboxService::class);

// E-Mails abrufen, senden und verwalten
```

### OneDriveService

OneDrive-Dateiverwaltung:

```php
use Hwkdo\MsGraphLaravel\Services\OneDriveService;

$oneDriveService = app(OneDriveService::class);

// Dateien hochladen, herunterladen und verwalten
```

### OutOfOfficeTemplateService

Abwesenheitsvorlagen-Verwaltung:

```php
use Hwkdo\MsGraphLaravel\Services\OutOfOfficeTemplateService;

$oooService = app(OutOfOfficeTemplateService::class);

// Abwesenheitsvorlagen erstellen und verwalten
```

## Artisan Commands

Das Package stellt folgende Artisan-Befehle zur Verfügung:

```bash
# Abonnements überprüfen
php artisan msgraph:check-subscriptions

# Aktive Benutzer mit Abwesenheits-Cache aktualisieren
php artisan msgraph:refresh-active-users-with-ooo-cache
```

## Webhook-Subscriptions

Das Package unterstützt Microsoft Graph Webhook-Subscriptions für Echtzeit-Updates.

### Webhook-Job-Mappings

Webhook-Subscriptions werden in der Datenbank verwaltet. Jede Subscription ist mit einem Job verknüpft, der ausgeführt wird, wenn ein Webhook empfangen wird.

#### Neue Webhook-Subscription hinzufügen

```php
use Hwkdo\MsGraphLaravel\Models\GraphWebhookJobMapping;
use App\Jobs\ProcessMyWebhook;

GraphWebhookJobMapping::create([
    'webhook_type' => 'my_webhook',
    'name' => 'my_webhook_name',
    'job_class' => ProcessMyWebhook::class,
    'filepath' => storage_path('app/webhooks/'),
    'upn' => 'user@domain.com',
    'resource' => "/users/user@domain.com/mailFolders('inbox')/messages",
    'notification_url' => GraphWebhookJobMapping::generateNotificationUrl('my_webhook'),
    'change_type' => 'created',
    'description' => 'Beschreibung der Subscription',
    'is_active' => true,
]);
```

#### Webhook-Subscription abrufen

```php
use Hwkdo\MsGraphLaravel\Models\GraphWebhookJobMapping;

// Alle aktiven Subscriptions
$subscriptions = GraphWebhookJobMapping::getActiveSubscriptions();

// Subscription nach Typ
$jobClass = GraphWebhookJobMapping::getJobClassForType('intracollect');

// Subscription nach Resource und URL
$subscription = GraphWebhookJobMapping::findByResourceAndNotificationUrl(
    "/users/user@domain.com/mailFolders('inbox')/messages",
    'https://portal.hwkdo.com/api/kunden/ms-graph-subscription/intracollect'
);
```

#### Webhook-Job erstellen

Ihr Webhook-Job sollte die empfangenen Daten verarbeiten:

```php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessMyWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $resource
    ) {}

    public function handle(): void
    {
        // Verarbeite die Webhook-Daten
        // $this->resource enthält die Microsoft Graph Resource ID
    }
}
```

### Webhook-Endpoint

Das Package registriert automatisch einen Webhook-Endpoint unter:

```
POST /api/kunden/ms-graph-subscription/{typ}
```

Microsoft Graph sendet Webhooks an diese URL. Der `{typ}` Parameter bestimmt, welcher Job ausgeführt wird.

## Features

### Microsoft Graph Integration
- **Automatische Token-Verwaltung**: OAuth-Tokens werden automatisch abgerufen, gecacht und erneuert
- **Mehrere App-Registrierungen**: Unterstützung für verschiedene Microsoft Graph-Anwendungen
- **Umfassende API-Abdeckung**: Benutzer, E-Mails, OneDrive, Lizenzen, Teams und mehr

### Services
- **UserService**: Vollständige Benutzerverwaltung mit UPN- und Alias-Suche
- **LicenseService**: Lizenzverwaltung und -überwachung
- **MailboxService**: E-Mail-Verwaltung und -verarbeitung
- **OneDriveService**: Datei-Upload, -Download und -verwaltung
- **OutOfOfficeTemplateService**: Abwesenheitsvorlagen-Management

### Webhooks & Subscriptions
- **Echtzeit-Updates**: Webhook-Subscriptions für E-Mails und OneDrive
- **Automatische Verwaltung**: Subscription-Lebenszyklus wird automatisch verwaltet
- **Mehrere Endpunkte**: Unterstützung für verschiedene Webhook-Endpunkte

### Allgemein
- **Laravel HTTP Client**: Verwendet Laravels eingebauten HTTP-Client für alle Anfragen
- **Umfassendes Logging**: Alle Operationen werden für Debugging-Zwecke geloggt
- **Exception Handling**: Ordnungsgemäße Fehlerbehandlung mit detaillierten Fehlermeldungen
- **Caching**: Konfigurierbare Cache-Zeiten für bessere Performance

## API-Referenz

### UserService

#### `getUser(string $mail): ?User`
Ruft einen Benutzer anhand der E-Mail-Adresse ab.

**Parameter:**
- `$mail`: E-Mail-Adresse des Benutzers

**Rückgabe:** Microsoft Graph User-Objekt oder null

#### `getUserByUpn(string $upn): User`
Ruft einen Benutzer anhand des UPN (User Principal Name) ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Microsoft Graph User-Objekt

#### `getUserByAlias(string $alias): ?User`
Ruft einen Benutzer anhand des Alias ab.

**Parameter:**
- `$alias`: Alias des Benutzers

**Rückgabe:** Microsoft Graph User-Objekt oder null

#### `update(string $upn, array $data): User`
Aktualisiert Benutzerdaten.

**Parameter:**
- `$upn`: UPN des Benutzers
- `$data`: Zu aktualisierende Daten

**Rückgabe:** Aktualisiertes Microsoft Graph User-Objekt

#### `getUserPresence(string $upn): Presence`
Ruft den Anwesenheitsstatus eines Benutzers ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Microsoft Graph Presence-Objekt

#### `getUserTeams(string $upn): array`
Ruft die Teams eines Benutzers ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Array von Microsoft Graph Team-Objekten

#### `getUserDirectGroups(string $upn): array`
Ruft die direkten Gruppen eines Benutzers ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Array von Microsoft Graph Group-Objekten

#### `getUserTransitiveGroups(string $upn): array`
Ruft die transitiven Gruppen eines Benutzers ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Array von Microsoft Graph Group-Objekten

### LicenseService

#### `getLicenseDetails(string $upn): array`
Ruft die Lizenzdetails eines Benutzers ab.

**Parameter:**
- `$upn`: UPN des Benutzers

**Rückgabe:** Array von Microsoft Graph LicenseDetails-Objekten

## Testing

```bash
composer test
```

## Changelog

Bitte sehen Sie [CHANGELOG](CHANGELOG.md) für weitere Informationen zu den letzten Änderungen.

## Contributing

Bitte sehen Sie [CONTRIBUTING](CONTRIBUTING.md) für Details.

## Security Vulnerabilities

Bitte überprüfen Sie [unsere Sicherheitsrichtlinie](../../security/policy), wie Sicherheitslücken gemeldet werden.

## Credits

- [hwkdo](https://github.com/hwkdo)
- [Alle Contributors](../../contributors)

## License

Die MIT-Lizenz (MIT). Bitte sehen Sie [License File](LICENSE.md) für weitere Informationen.