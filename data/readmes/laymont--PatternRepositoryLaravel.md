# Laravel Pattern Repository

[![Latest Version on Packagist](https://img.shields.io/packagist/v/laymont/pattern-repository-laravel.svg?style=flat-square)](https://packagist.org/packages/laymont/pattern-repository-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/laymont/pattern-repository-laravel.svg?style=flat-square)](https://packagist.org/packages/laymont/pattern-repository-laravel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHPUnit](https://img.shields.io/badge/PHPUnit-11+-green.svg)](https://phpunit.de)
[![Pest](https://img.shields.io/badge/Pest-3+-green.svg)](https://pestphp.com)

Este paquete de Laravel simplifica la implementación del patrón repositorio, ayudando a crear aplicaciones con una arquitectura limpia, mantenible y escalable.

## ¿Qué es el Patrón Repositorio?

El patrón repositorio actúa como una capa de abstracción entre la lógica de negocio y la capa de acceso a datos. Al usar repositorios, tus controladores y servicios interactúan con los datos a través de interfaces, sin necesidad de conocer la implementación concreta del acceso a datos (por ejemplo, consultas a la base de datos). Esto aporta múltiples ventajas:

- **Desacoplamiento:** Reduce la dependencia entre las diferentes capas de la aplicación.
- **Facilidad de prueba:** Permite realizar pruebas unitarias de la lógica de negocio sin necesidad de una base de datos real (usando mocks).
- **Flexibilidad:** Facilita el cambio de la implementación del acceso a datos (por ejemplo, cambiar de base de datos o usar un ORM diferente) sin afectar la lógica de negocio.
- **Código organizado:** Promueve un código más limpio, estructurado y fácil de mantener.
- **Reutilización:** Facilita la reutilización de la lógica de acceso a datos en diferentes partes de la aplicación.

## Compatibilidad

- **Laravel Framework:** `^13.0`
- **PHP:** `>=8.3`

## Instalación

Puedes instalar el paquete usando Composer:

```bash
composer require laymont/pattern-repository-laravel
```

El paquete se autodescubre, por lo que no es necesario registrar el ServiceProvider.

## Estructura del Paquete

```
src/
├── Actions/
│   ├── CreateAction.php      # Acción para crear registros
│   ├── UpdateAction.php     # Acción para actualizar registros
│   └── DeleteAction.php     # Acción para eliminar registros
├── Concerns/
│   ├── Cacheable.php       # Trait para caché de consultas
│   ├── HasCriteria.php     # Trait para patrón Criteria
│   └── HasEloquentScopes.php # Trait para global scopes
├── Contracts/
│   ├── RepositoryInterface.php           # Interfaz base del repositorio
│   ├── ReadableRepositoryInterface.php   # Interfaz solo lectura
│   ├── WritableRepositoryInterface.php # Interfaz solo escritura
│   └── CriteriaInterface.php          # Interfaz para Criteria
├── Criteria/
│   ├── WhereEqualsCriteria.php       # Criteria para WHERE campo = valor
│   └── SearchWhereLikeCriteria.php   # Criteria para búsqueda LIKE
├── Repositories/
│   └── EloquentRepository.php # Repositorio base con Eloquent
└── Providers/
    └── PatternRepositoryServiceProvider.php
```

## Uso Rápido

### 1. Crear un Repositorio

```php
use Laymont\PatternRepository\Repositories\EloquentRepository;
use App\Models\User;

class UserRepository extends EloquentRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }
}
```

### 2. Usar el Repositorio

```php
// Inyectar en controlador
public function __construct(
    protected UserRepository $users
) {}

// Obtener todos los usuarios
$users = $this->users->all();

// Buscar por ID
$user = $this->users->find($id);

// Crear usuario
$user = $this->users->create($data);

// Actualizar usuario
$this->users->update($id, $data);

// Eliminar usuario
$this->users->delete($id);

// Paginar
$users = $this->users->paginate(15);
```

## Características Avanzadas

### Patrón Criteria

```php
use Laymont\PatternRepository\Criteria\WhereEqualsCriteria;

$repository->pushCriteria(new WhereEqualsCriteria('active', true));
$users = $repository->all();
$repository->resetCriteria();
```

### Caché de Consultas

```php
$repository->enableCache(60); // Habilitar caché con TTL de 60 segundos
$repository->disableCache();    // Deshabilitar caché

// Los resultados se cachean automáticamente
```

### Acciones Atómicas

```php
use Laymont\PatternRepository\Actions\CreateAction;
use App\Models\User;

$action = app(CreateAction::class);
$user = $action->execute(new User(), $data);
```

### Scopes de Eloquent

```php
$repository->withScopes();      // Aplicar todos los global scopes
$repository->withoutScopes();  // Quitar todos los global scopes
```

## Interfaces Separadas

### ReadableRepositoryInterface

```php
use Laymont\PatternRepository\Contracts\ReadableRepositoryInterface;

interface UserReadRepository extends ReadableRepositoryInterface
{
    public function findByEmail(string $email): ?User;
}
```

### WritableRepositoryInterface

```php
use Laymont\PatternRepository\Contracts\WritableRepositoryInterface;

interface UserWriteRepository extends WritableRepositoryInterface
{
    public function firstOrCreate(array $data): User;
    public function updateOrCreate(array $search, array $data): User;
}
```

## Comandos Artisan

```bash
# Generar repositorio
php artisan make:repository User

# Generar con opciones
php artisan make:repository User --abstract --criteria --interfaces=separate
```

## Configuración

Publica el archivo de configuración:

```bash
php artisan vendor:publish --provider="Laymont\PatternRepository\Providers\PatternRepositoryServiceProvider"
```

Edita `config/pattern-repository.php`:

```php
return [
    'namespace' => 'App\\Repositories',
    'path' => app_path('Repositories'),
    'enable_cache' => false,
    'cache_ttl' => 60,
    'pagination' => [
        'default_per_page' => 15,
        'max_per_page' => 100,
    ],
];
```

## Pruebas

El paquete incluye 39 tests con cobertura de:

- Actions (Create, Update, Delete)
- EloquentRepository
- Concerns (Cacheable, HasCriteria, HasEloquentScopes)
- Criteria (WhereEqualsCriteria)
- Contracts (todas las interfaces)

Ver TESTING.md para más detalles.

## Actualizaciones de v4.0.0

- ✅ Soporte para Laravel 13
- ✅ Nuevo `EloquentRepository` base con traits
- ✅ Actions separadas para operaciones CRUD
- ✅ 39 tests automatizados con SQLite en memoria
- ✅ Contratos mejorados (RepositoryInterface, ReadableInterface, WritableInterface)

---

Para una guía detallada, consulta el archivo TESTING.md.

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza cambios y hace commit: `git commit -m "Agregando..."`.
4. Sube: `git push origin feature/nueva-funcionalidad`.
5. Abre un Pull Request.

## Donaciones

Si encuentras útil este paquete y deseas apoyar su desarrollo y mantenimiento, puedes considerar hacer una donación.

### Zinli

- **ID de usuario:** 3-002-58546608-36
- **Recargar:** https://recargas.zinli.com/4nVRQUniFdK8DBfPzzfyzR

### Visa Prepagada Zinli

- **Número:** 4850460061276928

### Binance Pay

- **Binance Pay ID:** 206414132

¡Gracias por tu apoyo!

## Licencia

MIT License. Ver LICENSE para más detalles.