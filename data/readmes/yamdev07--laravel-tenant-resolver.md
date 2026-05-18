# Laravel Tenant Resolver

Un package Laravel pour la résolution multi-tenant basé sur le middleware.

## Installation

```bash
composer require yamdev07/laravel-tenant-resolver
```

## Configuration

Publiez le fichier de configuration :

```bash
php artisan vendor:publish --provider="Yamdev07\TenantResolver\TenantResolverServiceProvider"
```

## Utilisation

### 1. Enregistrer le middleware

Dans `app/Http/Kernel.php`, ajoutez le middleware :

```php
protected $middlewareGroups = [
    'web' => [
        // ...
        \Yamdev07\TenantResolver\Middleware\ResolveTenantMiddleware::class,
    ],
];
```

### 2. Résolution automatique

Le package détecte automatiquement le tenant via :
- Le sous-domaine de l'URL
- Un header HTTP `X-Tenant-ID`
- La configuration dans `config/tenant.php`

### 3. Accéder au tenant courant

```php
use Yamdev07\TenantResolver\TenantResolver;

$tenant = app(TenantResolver::class)->getCurrentTenant();
```

## Configuration disponible

Dans `config/tenant.php`, vous pouvez configurer :

- `driver` : Le driver de résolution (subdomain, header, custom)
- `header_name` : Nom du header pour la résolution (par défaut: X-Tenant-ID)
- `custom_resolver` : Classe de résolution personnalisée

## Tests

```bash
composer test
```

## Licence

MIT
