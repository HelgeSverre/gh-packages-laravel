# cashier-transbank

Paquete Laravel tipo **Cashier** para **Transbank Webpay Oneclick Mall** (pagos recurrentes). Permite gestionar enrolamiento de tarjetas, suscripciones y cobros recurrentes sin acoplar UI.

---

## Requisitos

- PHP 8.1+
- Laravel 10, 11 o 12
- Cuenta Transbank con credenciales Oneclick Mall

---

## Instalación

```bash
composer require blackbeta/cashier-transbank
```

### Publicar configuración y migraciones

```bash
php artisan vendor:publish --tag=cashier-transbank-config
php artisan vendor:publish --tag=cashier-transbank-migrations
php artisan migrate
```

---

## Configuración

Agrega las variables en tu `.env`:

```env
TRANSBANK_ENV=integration          # integration | production
TRANSBANK_COMMERCE_CODE=597055555541
TRANSBANK_CHILD_COMMERCE_CODE=597055555542
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENROLLMENT_RETURN_URL=https://tu-app.cl/cashier-transbank/enrollment/finish
```

El archivo publicado `config/cashier-transbank.php` permite personalizar adicionalmente prefijo de rutas, middleware y nombres de tablas.

---

## Marcar un modelo como Billable

Agrega el trait `Billable` al modelo que representará al pagador (típicamente `User`):

```php
use Blackbeta\CashierTransbank\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

---

## Flujos principales

### 1. Enrolamiento de tarjeta (Oneclick)

El enrolamiento vincula la tarjeta del usuario con Transbank para cobros futuros.

#### Paso 1 — Crear el Customer y redirigir a Webpay

```php
use Blackbeta\CashierTransbank\Services\EnrollmentService;

// Crear o recuperar el Customer del usuario
$customer = $user->createOrGetCashierCustomer($user->email);

// Iniciar enrolamiento y redirigir
$enrollment = app(EnrollmentService::class)->start($customer, config('cashier-transbank.enrollment_return_url'));

return redirect()->away($enrollment->urlWebpay . '?TBK_TOKEN=' . $enrollment->token);
```

> O usando la ruta del paquete directamente:
> `POST /cashier-transbank/enrollment/start` con `customer_id`
>
> ⚠️ **Producción:** agrega `'auth'` al `middleware` en `config/cashier-transbank.php` para proteger la ruta de enrolamiento.

#### Paso 2 — Transbank redirige de vuelta

El paquete maneja automáticamente el retorno en:
`GET /cashier-transbank/enrollment/finish?TBK_TOKEN=xxx`

Escucha el evento para acciones adicionales:

```php
// app/Providers/EventServiceProvider.php
use Blackbeta\CashierTransbank\Events\EnrollmentFinished;

protected $listen = [
    EnrollmentFinished::class => [
        \App\Listeners\WelcomeEnrolledUser::class,
    ],
];
```

---

### 2. Crear una suscripción

Requiere que el usuario tenga un Customer con enrolamiento activo.

```php
use Blackbeta\CashierTransbank\Services\SubscriptionService;

$customer = $user->cashierCustomer(); // Customer activo

$subscription = app(SubscriptionService::class)->create(
    customer: $customer,
    name: 'premium',               // identificador del plan
    amount: 9990,                  // monto en CLP
    childCommerceCode: config('cashier-transbank.child_commerce_code'),
    periodDays: 30,                // duración del período
);
```

Verificar si el usuario está suscrito:

```php
if ($user->subscribed('premium')) {
    // acceso activo
}

$sub = $user->subscription('premium');
echo $sub->status;            // active, past_due, canceled
echo $sub->current_period_end->format('Y-m-d');
```

---

### 3. Cancelar suscripción

```php
$subscription = $user->subscription('premium');

// Cancelar al final del período (gracia)
app(SubscriptionService::class)->cancel($subscription);

// Cancelar inmediatamente
app(SubscriptionService::class)->cancel($subscription, immediately: true);
```

---

### 4. Renovación automática (cobro recurrente)

Programa el comando Artisan en tu scheduler:

```php
// app/Console/Kernel.php
$schedule->command('cashier-transbank:renew')->dailyAt('02:00');
```

Comandos útiles:

```bash
# Ver suscripciones por vencer (sin cobrar)
php artisan cashier-transbank:renew --dry-run

# Renovar una suscripción específica
php artisan cashier-transbank:renew --id=42
```

---

### 5. Confirmar estado de un pago

Si necesitas reconciliar el estado de una transacción consultando Transbank:

```php
use Blackbeta\CashierTransbank\Services\SubscriptionService;

$transaction = \Blackbeta\CashierTransbank\Models\Transaction::where('buy_order', $buyOrder)->firstOrFail();

$confirmed = app(SubscriptionService::class)->confirmPayment($transaction);
// Idempotente: si ya estaba autorizada, retorna sin cambios
```

---

### 6. Webhook / notificación externa

El paquete expone `POST /cashier-transbank/webhook` para recibir notificaciones externas. El procesamiento es idempotente.

```json
POST /cashier-transbank/webhook
{ "buy_order": "sub-42-20240101120000-abc1" }
```

---

## Eventos disponibles

Escucha estos eventos en tu app para desacoplar lógica de negocio:

| Evento | Payload |
|--------|---------|
| `EnrollmentStarted` | `$customer`, `$token` |
| `EnrollmentFinished` | `$customer`, `$result` |
| `SubscriptionCreated` | `$subscription`, `$transaction` |
| `SubscriptionCanceled` | `$subscription` |
| `PaymentSucceeded` | `$subscription`, `$transaction` |
| `PaymentFailed` | `$subscription`, `$transaction` |

---

## Consultas para panel de administración

El paquete incluye `CashierRepository` listo para integrar con Filament u otro panel:

```php
use Blackbeta\CashierTransbank\Repositories\CashierRepository;

$repo = app(CashierRepository::class);

$repo->activeSubscriptions();          // paginado
$repo->subscriptionsDueForRenewal();   // collection
$repo->failedTransactions();           // paginado
$repo->stats();                        // array con métricas
```

---

## Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `cashier_customers` | Vincula modelos billable con `tbk_user` de Transbank |
| `cashier_subscriptions` | Suscripciones con estado y períodos |
| `cashier_transactions` | Historial de cobros con respuesta raw de Transbank |

---

## Troubleshooting

**El enrolamiento retorna error de token expirado**
> El token de Transbank tiene TTL de 10 minutos. Asegúrate de que el usuario complete el flujo en ese tiempo. El paquete usa caché para guardar el token; verifica que tu driver de caché esté configurado.

**Cobro rechazado (responseCode != 0)**
> La suscripción pasa a `past_due`. Revisa `cashier_transactions.tbk_response_code` para el detalle. Códigos comunes: `-1` (genérico), `-96` (error timeout), `-97` (error en el monto).

**El comando renew no procesa suscripciones**
> Verifica que `current_period_end` esté en el pasado y que `ends_at` sea null. Usa `--dry-run` para preview sin cobrar.

**Ambiente de integración (sandbox)**
> Con `TRANSBANK_ENV=integration` se usan las credenciales de prueba del SDK oficial de Transbank automáticamente si no defines otras.

---

## Licencia

MIT — [Blackbeta](https://blackbeta.cl)
