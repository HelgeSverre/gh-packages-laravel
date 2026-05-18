# Wompi Laravel

[![Tests](https://github.com/igedeon/laravel-wompi/actions/workflows/tests.yml/badge.svg)](https://github.com/igedeon/laravel-wompi/actions/workflows/tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/igedeon/laravel-wompi.svg)](https://packagist.org/packages/igedeon/laravel-wompi)
[![Total Downloads](https://img.shields.io/packagist/dt/igedeon/laravel-wompi.svg)](https://packagist.org/packages/igedeon/laravel-wompi)
[![PHP Version](https://img.shields.io/packagist/php-v/igedeon/laravel-wompi.svg)](https://packagist.org/packages/igedeon/laravel-wompi)
[![License](https://img.shields.io/packagist/l/igedeon/laravel-wompi.svg)](https://packagist.org/packages/igedeon/laravel-wompi)

Paquete Laravel para integrar [Wompi Colombia](https://wompi.co) en modalidad **Web Checkout**: links de pago, widget embebido, redirección, consulta de transacciones y webhooks con verificación de firma.

## Requisitos

- PHP 8.4+
- Laravel 12+

## Instalación

```bash
composer require igedeon/laravel-wompi
```

Publicar la configuración:

```bash
php artisan vendor:publish --tag=wompi-config
```

## Configuración

Agrega las siguientes variables a tu archivo `.env`:

```env
WOMPI_ENVIRONMENT=sandbox
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=test_events_xxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxxxxxxxxxxxxxxx
```

Para producción, cambia el ambiente y usa las llaves correspondientes:

```env
WOMPI_ENVIRONMENT=production
WOMPI_PUBLIC_KEY=pub_prod_xxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=prod_events_xxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=prod_integrity_xxxxxxxxxxxxxxxx
```

### Opciones adicionales

```env
WOMPI_WEBHOOK_PATH=wompi/webhook    # Ruta del webhook (por defecto: wompi/webhook)
WOMPI_CURRENCY=COP                  # Moneda por defecto
```

## Uso

### Links de pago

#### Crear un link de pago

```php
use IGedeon\WompiLaravel\Facades\Wompi;
use IGedeon\WompiLaravel\DTOs\PaymentLinkData;

$link = Wompi::paymentLinks()->create(new PaymentLinkData(
    name: 'Orden #123',
    description: 'Compra de productos',
    singleUse: true,
    collectShipping: false,
    amountInCents: 5000000, // $50,000 COP
));

// URL para compartir con el cliente
$url = $link->checkoutUrl();
// https://checkout.wompi.co/l/abc-123-def

// ID del link
$id = $link->id;
```

#### Parámetros opcionales

```php
$link = Wompi::paymentLinks()->create(new PaymentLinkData(
    name: 'Orden #456',
    description: 'Suscripción mensual',
    singleUse: false,
    collectShipping: true,
    amountInCents: 15000000,
    currency: 'COP',
    expiresAt: '2026-12-31T23:59:59.000Z',
    redirectUrl: 'https://mitienda.com/gracias',
    imageUrl: 'https://mitienda.com/logo.png',
    sku: 'PROD-456',
    taxes: [
        ['type' => 'VAT', 'amount_in_cents' => 2380952],
    ],
));
```

#### Consultar un link de pago

```php
$link = Wompi::paymentLinks()->find('abc-123-def');

echo $link->name;
echo $link->amountInCents;
echo $link->active; // true o false
```

### Transacciones

#### Consultar una transacción

```php
use IGedeon\WompiLaravel\Enums\TransactionStatus;

$transaction = Wompi::transactions()->find('12345-txn-id');

echo $transaction->id;
echo $transaction->status;          // TransactionStatus enum
echo $transaction->amountInCents;
echo $transaction->reference;
echo $transaction->paymentMethodType;

if ($transaction->status === TransactionStatus::Approved) {
    // Pago exitoso
}

// Verificar si el estado es final
if ($transaction->status->isFinal()) {
    // No cambiará más
}
```

#### Estados de transacción

| Estado | Descripción | Final |
|---|---|---|
| `PENDING` | En proceso | No |
| `APPROVED` | Pago exitoso | Sí |
| `DECLINED` | Rechazada | Sí |
| `VOIDED` | Anulada | Sí |
| `ERROR` | Error interno | Sí |

### Información del comercio

```php
$merchant = Wompi::merchants()->get();

echo $merchant->name;
echo $merchant->legalName;
echo $merchant->acceptanceToken;           // Token de aceptación de términos
echo $merchant->acceptancePersonalAuth;    // Token de autorización de datos personales
```

### Widget de pago (Blade)

Incluye el widget de Wompi directamente en tus vistas Blade. La firma de integridad se genera automáticamente en el servidor.

```blade
<x-wompi::widget
    reference="orden-123"
    :amount-in-cents="5000000"
    currency="COP"
    redirect-url="https://mitienda.com/resultado"
/>
```

#### Con datos del cliente y expiración

```blade
<x-wompi::widget
    reference="orden-456"
    :amount-in-cents="15000000"
    currency="COP"
    redirect-url="https://mitienda.com/resultado"
    expiration-time="2026-06-30T23:59:59.000Z"
    customer-email="cliente@email.com"
    customer-full-name="Juan Pérez"
    customer-phone-number="3001234567"
    :tax-in-cents-vat="2380952"
    :tax-in-cents-consumption="1200000"
/>
```

### Formulario de redirección (Blade)

Si prefieres redirigir al usuario a la página de Wompi en lugar de usar el widget embebido:

```blade
<x-wompi::redirect-form
    reference="orden-789"
    :amount-in-cents="5000000"
    currency="COP"
    redirect-url="https://mitienda.com/resultado"
>
    <button type="submit">Pagar con Wompi</button>
</x-wompi::redirect-form>
```

### Firma de integridad (manual)

Si necesitas generar la firma de integridad manualmente (por ejemplo, para una integración JavaScript personalizada):

```php
$hash = Wompi::integrityHash(
    reference: 'orden-123',
    amountInCents: 5000000,
    currency: 'COP',
);

// Con tiempo de expiración
$hash = Wompi::integrityHash(
    reference: 'orden-123',
    amountInCents: 5000000,
    currency: 'COP',
    expirationTime: '2026-12-31T23:59:59.000Z',
);
```

## Webhooks

El paquete registra automáticamente una ruta POST en `/wompi/webhook` (configurable) que:

1. Verifica la firma SHA-256 del evento
2. Despacha eventos de Laravel según el estado de la transacción

### Configuración en Wompi

En el dashboard de Wompi, configura la URL de eventos apuntando a:

```
https://tudominio.com/wompi/webhook
```

### Escuchar eventos

Registra listeners en tu aplicación para reaccionar a los eventos:

```php
// app/Providers/EventServiceProvider.php o usando el atributo #[Listener]

use IGedeon\WompiLaravel\Events\TransactionApproved;
use IGedeon\WompiLaravel\Events\TransactionDeclined;
use IGedeon\WompiLaravel\Events\TransactionVoided;
use IGedeon\WompiLaravel\Events\TransactionError;
use IGedeon\WompiLaravel\Events\WompiWebhookReceived;
```

```php
// Ejemplo de listener
class ConfirmOrderListener
{
    public function handle(TransactionApproved $event): void
    {
        $transaction = $event->transaction;

        // $transaction->id
        // $transaction->reference
        // $transaction->amountInCents
        // $transaction->status (TransactionStatus::Approved)
        // $transaction->raw (array completo de la respuesta)
    }
}
```

### Eventos disponibles

| Evento | Cuándo se dispara |
|---|---|
| `WompiWebhookReceived` | Siempre (para logging/auditoría) |
| `TransactionApproved` | Transacción aprobada |
| `TransactionDeclined` | Transacción rechazada |
| `TransactionVoided` | Transacción anulada |
| `TransactionError` | Error en la transacción |

### Middleware adicional

Puedes agregar middleware adicional a la ruta del webhook vía configuración:

```php
// config/wompi.php
'webhook' => [
    'path'       => 'wompi/webhook',
    'middleware'  => ['throttle:60,1'],
],
```

## Personalización de vistas

Publica las vistas para personalizarlas:

```bash
php artisan vendor:publish --tag=wompi-views
```

Las vistas se copiarán a `resources/views/vendor/wompi/`.

## Manejo de errores

El paquete lanza excepciones específicas:

```php
use IGedeon\WompiLaravel\Exceptions\ApiException;
use IGedeon\WompiLaravel\Exceptions\InvalidConfigurationException;
use IGedeon\WompiLaravel\Exceptions\InvalidSignatureException;

try {
    $link = Wompi::paymentLinks()->create($data);
} catch (ApiException $e) {
    $e->getMessage();      // Mensaje de error
    $e->statusCode;        // Código HTTP (401, 422, 500, etc.)
    $e->responseBody;      // Array con la respuesta completa de Wompi
} catch (InvalidConfigurationException $e) {
    // Falta una llave en la configuración
}
```

## Testing

```bash
./vendor/bin/pest
```

Para usar en tus propios tests con `Http::fake()`:

```php
use Illuminate\Support\Facades\Http;

Http::fake([
    '*/payment_links' => Http::response([
        'data' => [
            'id' => 'test-link-id',
            'name' => 'Test',
            'description' => 'Test',
            'single_use' => true,
            'collect_shipping' => false,
            'amount_in_cents' => 5000000,
            'currency' => 'COP',
            'active' => true,
        ],
    ]),
]);
```

## Licencia

MIT
