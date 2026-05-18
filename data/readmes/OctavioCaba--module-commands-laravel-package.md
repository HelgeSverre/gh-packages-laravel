# Module Commands Laravel Package

Este paquete añade comandos Artisan para crear artefactos organizados por módulos dentro de la carpeta `app/Modules/`.

## Comando: make:module-controller

Crear un controlador dentro de un módulo:

```bash
php artisan make:module-controller NombreController nombre_del_modulo
```

Ejemplo:

```bash
php artisan make:module-controller TestController querylog
```

Esto creará el archivo:

```bash
app/Modules/querylog/src/Http/Controllers/TestController.php
```

El namespace dentro del archivo generado sigue la convención:

```bash
Modules\{StudlyModule}\Http\Controllers
```
por ejemplo, para `querylog` será `Modules\Querylog\Http\Controllers`.
Si el archivo destino ya existe, el comando preguntará interactívamente si debe sobrescribirlo. Para evitar la confirmación y forzar la sobrescritura, usa la opción `--force`:

```bash
php artisan make:module-controller TestController querylog --force
```

Comportamiento:
- Si no usas `--force`, y el archivo ya existe, el comando pedirá confirmación (sí/no). Si respondes `no`, el archivo no se modifica.
- Si usas `--force`, el archivo existente será sobrescrito sin pedir confirmación.

### Opción: --namespace-root

Además de la configuración en `config/module-commands.php`, el comando acepta la opción `--namespace-root` para anular la raíz del namespace sólo en la invocación actual. Ejemplo:

```bash
php artisan make:module-controller TestController querylog --namespace-root="MyCompany\\Modules"
```

Prioridad: si se proporciona `--namespace-root` se usa ese valor; si no, se lee `module-commands.module_namespace` y, en ausencia de éste, se utiliza el valor por defecto `Modules`.

Nota: la opción acepta cualquier cadena válida como raíz; al generar se normalizan barras invertidas finales pero no se realizan comprobaciones adicionales sobre el namespace proporcionado.

### Contenido del stub

El stub usado es `src/Console/Commands/stubs/controller-plain.stub` y contiene los marcadores `$CLASS_NAMESPACE$` y `$CLASS$` que son reemplazados por la implementación del comando.

### Tests

El paquete incluye tests que verifican:

- La generación en `app/Modules/...` y el reemplazo del namespace y nombre de clase.
- El comportamiento de sobrescritura (confirmación negativa y `--force`).

Ejecuta los tests con:

```bash
./vendor/bin/phpunit --colors
```

Si necesitas cambiar la convención de namespace (por ejemplo, otro prefijo que no sea `Modules`), puedes publicar y editar la configuración del paquete (`config/module-commands.php`) o usar la variable de entorno `MODULE_COMMANDS_NAMESPACE`.

---

# ModuleCommandsLaravelPackage

Un pequeño paquete para Laravel que agrega comandos Artisan para gestionar una estructura modular dentro de paquetes y aplicaciones Laravel. Simplifica la creación, listado, habilitación/deshabilitación, migraciones y el scaffolding de componentes de módulos (controladores, modelos, migraciones, factories, seeders, rutas y vistas).

## Features

- Crear el scaffold de un nuevo módulo
- Listar módulos registrados
- Habilitar / deshabilitar módulos
- Generar controladores, modelos, requests y resources dentro de un módulo
- Ejecutar migraciones, seeders y rollbacks específicos de un módulo
- Publicar assets y configuraciones del módulo
- Integración con el autoloading y los service providers de Laravel

## Instalación

1. Requerir el paquete vía `composer`:
```bash
composer require octaviocaba/module-commands-laravel-package
```

2. Registrar el service provider en `config/app.php`:
```php
'providers' => [
  OctavioCaba\ModuleCommands\ModuleCommandsServiceProvider::class,
];
```

3. Publicar la configuración y los `stubs` (opcional):
```bash
php artisan vendor:publish --provider="OctavioCaba\ModuleCommands\ModuleCommandsServiceProvider" --tag="config"
php artisan vendor:publish --provider="OctavioCaba\ModuleCommands\ModuleCommandsServiceProvider" --tag="stubs"
```

## Configuración

Después de publicar, edita `config/module-commands.php` para ajustar:
<!-- - directorio de módulos (por defecto: `app/Modules`) -->
- namespace raíz para las clases generadas
<!-- - stubs por defecto y organización de archivos -->
<!-- - almacenamiento para el seguimiento de módulos habilitados (`filesystem`, `config` o base de datos) -->

### Comportamiento por defecto si no hay configuración

Si no publicas el archivo de configuración `module-commands.php` o éste no contiene la clave `module_namespace`, el comando usará el valor por defecto `Modules` como raíz del namespace.

Esto permite que el comando funcione sin configuración adicional, generando por defecto `Modules\\{Module}\\Http\\Controllers`.

## Comandos Disponibles

<!-- - Create module scaffold
```bash
php artisan module:make {name}
```

- List modules
```bash
php artisan module:list
```

- Enable a module
```bash
php artisan module:enable {name}
```

- Disable a module
```bash
php artisan module:disable {name}
``` -->

- Genera `controllers` para el módulo
```bash
php artisan module:make:controller {module} {name} [--resource] [--api]
```

<!-- - Generate model inside a module
```bash
php artisan module:make:model {module} {name} [-m|--migration]
```

- Create migration for a module
```bash
php artisan module:make:migration {module} {name}
```

- Run module migrations
```bash
php artisan module:migrate {module}
```

- Rollback module migrations
```bash
php artisan module:migrate:rollback {module}
```

- Seed a module
```bash
php artisan module:db:seed {module} [--class=SeederClass]
```

- Publish module assets
```bash
php artisan module:publish {module}
``` -->

<!-- (Use `php artisan help {command}` for per-command options and examples.) -->

## Estructura de directorios y ficheros

Contenido típico de un módulo:
```
Modules/
└── blog/
  ├── src/
  │   ├── Http/
  │   │   ├── Controllers/
  │   ├── Models/
  │   ├── Database/
  │   │   ├── Migrations/
  │   │   └── Seeders/
  │   ├── Providers/
  │   └── routes.php
  ├── resources/
  │   └── views/
  └── composer.json
```

<!-- ## Best practices

- Create a service provider for each module to register bindings, routes and views.
- Use module namespace configuration to keep autoloading consistent.
- Keep migrations and seeders inside the module's Database folder for portability. -->

## Testing

Correr tests:
```bash
composer test
# or
vendor/bin/phpunit
```

<!-- ## Contributing

1. Fork the repository
2. Create a feature branch
3. Send a PR with tests and descriptive changelog

Thanks for helping improve the package. -->

## Licencia

MIT — consulta el fichero LICENSE para más detalle.
