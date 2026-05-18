# Circvort Brick

`circvort/brick` es un paquete para Laravel que convierte el studio en el punto central para manejar:

- formularios
- tablas
- relaciones
- CRUDs
- joins
- etiquetas embebibles
- presentacion visual de formularios y CRUDs

## Instalacion

```bash
composer require circvort/brick
php artisan cv-brick:install
```

Despues abre:

```text
/cv-brick/demo
```

## Instalacion directa desde GitHub

Si el paquete todavia no esta publicado en Packagist, en un proyecto Laravel puedes instalarlo desde GitHub con:

```bash
composer config repositories.circvort-brick vcs https://github.com/TU-USUARIO/circvort-brick.git
composer require circvort/brick:dev-main
php artisan cv-brick:install
```

Cuando el repositorio tenga tags estables o este publicado en Packagist, bastara con:

```bash
composer require circvort/brick
php artisan cv-brick:install
```

## Pensado para proyectos nuevos y existentes

Circvort Brick puede trabajar en dos escenarios:

- proyectos que recien comienzan
- proyectos que ya tienen tablas en la base de datos

Si el proyecto ya tiene tablas, el studio puede detectarlas y cargarlas como base para formularios administrados sin duplicar migraciones por defecto.

## Etiquetas embebibles

El studio genera etiquetas listas para usar en cualquier Blade del proyecto.

Ejemplos:

```html
<div id="cvb-form-datos_personales"></div>
<div id="cvb-crud-1"></div>
```

Si la pagina aun no carga el script del paquete:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
<script src="{{ asset('vendor/cv-brick/js/cv-brick.js') }}"></script>
```

## Archivos oficiales incluidos en el paquete

- Contexto oficial para Codex u otra IA:
  `vendor/circvort/brick/resources/docs/codex-context.md`
- Guia de instalacion:
  `vendor/circvort/brick/INSTALL.md`
- Archivo de licencia:
  `vendor/circvort/brick/LICENSE`

## Archivo de prueba publicado por el instalador

El comando `php artisan cv-brick:install` publica:

```text
resources/views/cv-brick-playground.blade.php
```

Ese archivo queda listo para probar etiquetas generadas por el studio.

## Comandos

```bash
php artisan cv-brick:install
php artisan cv-brick:crud nombre_tabla
```

## Enfoque recomendado

Usa Circvort Brick para:

- estructura de formularios
- sincronizacion de esquema
- deteccion de tablas existentes
- CRUDs del studio

Usa Laravel normal para:

- reglas de negocio
- modulos
- autorizacion
- dashboards
- integraciones del proyecto
