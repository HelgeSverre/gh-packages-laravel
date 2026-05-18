# Infile PHP Laravel Adapter

[![Packagist Version](https://img.shields.io/packagist/v/rodmarzavala/infile-php-laravel)](https://packagist.org/packages/rodmarzavala/infile-php-laravel)
[![PHP Version Require](https://img.shields.io/packagist/php-v/rodmarzavala/infile-php-laravel)](https://packagist.org/packages/rodmarzavala/infile-php-laravel)
[![License](https://img.shields.io/packagist/l/rodmarzavala/infile-php-laravel)](https://packagist.org/packages/rodmarzavala/infile-php-laravel)

El adaptador nativo para Laravel del SDK `infile-php` para facturación electrónica en línea (FEL) en Guatemala.

> **Nota:** Este repositorio es una división de solo lectura (read-only split) del monorepo principal `infile-php`. Por favor, envía tus *issues* y *pull requests* al [repositorio principal](https://github.com/rodmarzavala/infile-php).

## Instalación

```bash
composer require rodmarzavala/infile-php-laravel
```

Publica el archivo de configuración:

```bash
php artisan fel:install
```

## Documentación

Para acceder a la documentación completa, opciones de configuración y referencia de la API, por favor visita nuestro sitio:

**👉 [Documentación del SDK (rodmarzavala.github.io/infile-php)](https://rodmarzavala.github.io/infile-php/)**

## Ejemplo de Uso

Utiliza el *Facade* intuitivo `Fel` directamente en tus controladores o *jobs*:

```php
use InfilePhp\Laravel\Facades\Fel;
use InfilePhp\Core\Dte\Invoice;
use InfilePhp\Core\Dte\Recipient;
use InfilePhp\Core\Dte\Item;

$response = Fel::issue(
    Invoice::create()
        ->for(Recipient::withTaxId('12345678')->name('Juan Pérez')->address('Ciudad'))
        ->add(Item::product('Laptop')->quantity(1)->unitPrice(8500.00))
);

echo $response->uuid();
```

## FEL Studio (Herramientas para Desarrolladores)

A partir de la versión v1.1.0, el adaptador incluye **FEL Studio**, un entorno visual enfocado exclusivamente en mejorar la experiencia del desarrollador (DX) durante la integración del SDK. Al igual que herramientas como Laravel Telescope, opera **únicamente en tu entorno local** y no requiere configurar bases de datos adicionales (utiliza SQLite en memoria o archivos locales de forma transparente).

### Acceder al Studio

1. Asegúrate de estar en tu entorno `local` (`APP_ENV=local`).
2. Publica los *assets* del frontend:

```bash
php artisan vendor:publish --tag=fel-studio-assets
```

### Funciones del Studio

- **Visualizador de XML (Builder):** Construye comprobantes en un formulario web y previsualiza el XML en tiempo real o valida la estructura contra las reglas de SAT sin consumir créditos de tu cuenta.
- **Timeline en vivo:** Todas las transacciones (exitosas y fallidas) disparadas por tu código Laravel se guardan en la línea de tiempo del Studio. Se captura el Payload completo, el UUID, la Serie, y el tiempo de respuesta.
- **Modo Interceptor:** El Studio traduce automáticamente las llamadas a Infile de tu código en *fixtures* para tus pruebas. Con un click, puedes generar bloques de código como `FelFake::assertIssued(1);` listos para pegar en tus Unit Tests.

> **Nota de Seguridad:** El acceso a `/fel-studio` y a las APIs asociadas está estrictamente bloqueado en cualquier entorno que no sea `local` o `testing`. No expone rutas ni consume memoria en tu entorno de producción.
