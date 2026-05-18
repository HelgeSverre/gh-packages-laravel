# Shipment Tracker API

Sistema de tracking de envíos con gestión de estados, notificaciones asíncronas y webhooks seguros.

## Tecnologías

- **Framework**: Laravel 12
- **PHP**: 8.2+
- **Base de Datos**: SQLite
- **Cola de Jobs**: Database driver
- **Caché**: File driver

## Requisitos del Sistema

- PHP 8.2 o superior
- Composer
- Extensiones PHP: `sqlite3`, `pdo_sqlite`, `mbstring`, `xml`, `curl`

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd shipment-tracker
```

### 2. Instalar dependencias

```bash
composer install
```

### 3. Configurar entorno

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Crear base de datos

```bash
touch database/database.sqlite
```

### 5. Ejecutar migraciones

```bash
php artisan migrate
```

### 6. Crear tabla de jobs

```bash
php artisan queue:table
php artisan migrate
```

## Configuración

### Variables de Entorno Importantes

Editar `.env` con los siguientes valores:

```env
# URL donde se enviarán notificaciones de cambios de estado
WEBHOOK_URL=https://your-webhook-endpoint.com/notifications

# Secret compartido para validar webhooks entrantes del carrier
CARRIER_WEBHOOK_SECRET=your-secret-key-here

# Driver de cola (database recomendado para desarrollo)
QUEUE_CONNECTION=database

# Driver de caché (file recomendado para desarrollo)
CACHE_STORE=file
```

## Ejecución

### Servidor de desarrollo

```bash
php artisan serve
```

La API estará disponible en `http://localhost:8000`

### Worker de colas (requerido para webhooks salientes)

En una terminal separada, ejecutar:

```bash
php artisan queue:work
```

Este proceso debe estar corriendo para que se envíen las notificaciones asíncronas.

### Ejecutar tests

```bash
php artisan test
```

## API Endpoints

### 1. Crear Envío

**POST** `/api/packets`

```json
{
  "tracking_code": "CL-2024-001",
  "recipient_name": "Juan Pérez",
  "recipient_email": "juan.perez@test.cl",
  "destination_address": "Av. Providencia 1234, Providencia, Santiago",
  "weight_grams": 2500
}
```

**Respuesta**: `201 Created`

```json
{
  "data": {
    "id": 1,
    "tracking_code": "CL-2024-001",
    "recipient_name": "Juan Pérez",
    "recipient_email": "juan.perez@test.cl",
    "destination_address": "Av. Providencia 1234, Providencia, Santiago",
    "weight_grams": 2500,
    "status": "created",
    "created_at": "2026-03-20T10:00:00.000000Z",
    "updated_at": "2026-03-20T10:00:00.000000Z"
  }
}
```

### 2. Listar Envíos

**GET** `/api/packets`

Filtro opcional por estado:

**GET** `/api/packets?status=in_transit`

**Paginación**: 15 elementos por página

**GET** `/api/packets?page=2`

**Respuesta**: `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "tracking_code": "CL-2024-001",
      "status": "in_transit",
      ...
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/packets?page=1",
    "last": "http://localhost:8000/api/packets?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/packets?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

### 3. Ver Detalle de Envío

**GET** `/api/packets/{id}`

**Respuesta**: `200 OK` o `404 Not Found`

### 4. Cambiar Estado

**PUT** `/api/packets/{id}/status`

```json
{
  "status": "in_transit"
}
```

**Transiciones válidas:**
- `created` → `in_transit`
- `in_transit` → `delivered`
- `in_transit` → `failed`

Cualquier otra transición retorna `422 Unprocessable Entity`.

**Respuesta**: `200 OK`

**Efecto secundario**: Se envía una notificación asíncrona a `WEBHOOK_URL`.

### 5. Webhook Entrante (Carrier)

**POST** `/api/webhooks/carrier`

```json
{
  "tracking_code": "CL-2024-001",
  "status": "delivered",
  "timestamp": "2026-03-20T15:30:00Z",
  "signature": "sha256=abc123..."
}
```

**Validación de firma HMAC**:

El carrier debe generar la firma así:

```php
$payload = json_encode([
  'tracking_code' => 'CL-2024-001',
  'status' => 'delivered',
  'timestamp' => '2026-03-20T15:30:00Z'
]);
$signature = 'sha256=' . hash_hmac('sha256', $payload, 'CARRIER_WEBHOOK_SECRET');
```

**Respuestas**:
- `200 OK`: Procesado correctamente
- `401 Unauthorized`: Firma inválida
- `404 Not Found`: Tracking code no existe
- `422 Unprocessable Entity`: Transición de estado inválida
- `429 Too Many Requests`: Rate limit excedido (máx 60 requests/minuto)

**Rate Limiting**: Este endpoint está protegido con rate limiting de 60 requests por minuto para prevenir abuso.

## Decisiones de Diseño

### 1. Service Layer Pattern

**Decisión**: Toda la lógica de negocio vive en servicios (`PacketService`, `WebhookSignatureService`).

**Razón**:
- **Testabilidad**: Servicios fáciles de mockear y testear aisladamente
- **Reutilización**: Misma lógica desde múltiples controllers
- **Mantenibilidad**: Un solo lugar para reglas de negocio
- **SOLID**: Responsabilidad única bien definida

**Alternativa rechazada**: Lógica en controllers o modelos (fat controllers/models).

### 2. Cache Strategy: Cache-Aside Pattern

**Decisión**: Cache de 5 minutos (TTL 300s) en endpoints GET con invalidación eager.

**Implementación**:
- **Keys**: `packets:list:{status}`, `packets:{id}`
- **TTL**: 300 segundos
- **Invalidación**: Al crear o actualizar, limpiamos caches relacionados
- **Driver**: File (simple, sin dependencias externas)

**Razón**:
- Balance entre performance y consistencia
- Invalidación eager evita datos stale críticos
- File driver suficiente para volumen esperado

**Alternativa considerada**: Cache tags (no soportado por driver file).

### 3. HMAC Signature Validation

**Decisión**: Usar `hash_equals()` para comparar firmas, no `===`.

**Razón**:
- **Seguridad**: Previene timing attacks
- `hash_equals()` hace comparación en tiempo constante
- `===` permite medir tiempos de respuesta para adivinar firma byte a byte

**Código**:
```php
return hash_equals($expectedSignature, $receivedSignature);
```

### 4. Jobs con ShouldBeUnique

**Decisión**: `SendPacketStatusWebhookJob` implementa `ShouldBeUnique`.

**Razón**:
- Previene envío duplicado si el job se encola múltiples veces
- `uniqueId()` basado en `{tracking_code}-{new_status}`
- Importante para idempotencia de webhooks

**Configuración**:
- `tries = 2` (1 reintento)
- `backoff = 30` (30 segundos entre reintentos)

### 5. No Observers/Events para Business Logic

**Decisión**: No usar Observers de Eloquent para disparar webhooks.

**Razón**:
- **Visibilidad**: Explícito > Mágico
- **Testing**: Sin `createQuietly()` hacks
- **Debugging**: Stack traces claros
- **Control**: Fácil condicionar o desactivar

**Implementación**:
```php
// En PacketService::updateStatus()
SendPacketStatusWebhookJob::dispatch(...);
```

### 6. State Machine en Enum

**Decisión**: `PacketStatus` enum con método `canTransitionTo()`.

**Razón**:
- Type-safety en PHP 8.2+
- Lógica de transiciones co-localizada con estados
- IDE autocomplete
- Imposible valores inválidos

**Código**:
```php
enum PacketStatus: string {
    case CREATED = 'created';
    case IN_TRANSIT = 'in_transit';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';

    public function canTransitionTo(PacketStatus $new): bool { ... }
}
```

### 7. FormRequests para Validación

**Decisión**: Toda validación en clases `FormRequest` separadas.

**Razón**:
- Separation of Concerns
- Reutilizable
- Testeable independientemente
- Controllers delgados

**Ejemplos**:
- `StorePacketRequest`
- `UpdatePacketStatusRequest`
- `CarrierWebhookRequest`

### 8. API Resources para Transformación

**Decisión**: `PacketResource` transforma modelos a JSON.

**Razón**:
- Consistencia en respuestas API
- Control sobre qué campos exponer
- Fácil agregar campos calculados
- Versionado futuro simplificado

### 9. Paginación

**Decisión**: Paginar GET /api/packets con 15 elementos por página.

**Razón**:
- **Escalabilidad**: Previene memory overflow con miles/millones de packets
- **Performance**: Queries más rápidas, menos datos transferidos
- **UX**: Mejor experiencia en frontend con datos manejables
- **Estándar**: Formato Laravel estándar con links y meta

**Implementación**:
```php
$packets = $this->packetService->list($status)->paginate(15);
```

**Alternativa considerada**: Cursor-based pagination (mejor para streams infinitos, pero más complejo).

### 10. Rate Limiting en Webhooks

**Decisión**: Limitar POST /api/webhooks/carrier a 60 requests/minuto.

**Razón**:
- **Seguridad**: Previene DDoS y abuso del endpoint
- **Recursos**: Protege base de datos y workers de sobrecarga
- **Buenas prácticas**: Estándar de industria para webhooks públicos
- **Producción**: Protección necesaria en ambientes reales con tráfico externo

**Implementación**:
```php
Route::post('/webhooks/carrier', ...)->middleware('throttle:60,1');
```

**Por qué 60/min**: Balance entre flexibilidad para carriers legítimos y protección contra abuso.

## Testing

### Cobertura

**64 tests**, **159 assertions**

### Feature Tests

- **PacketTest**: Creación de packets, validaciones
- **PacketStatusTest**: Transiciones de estado válidas/inválidas
- **PacketListTest**: Listado, filtros, paginación
- **PacketShowTest**: Detalle individual, cache, 404
- **PacketWebhookTest**: Notificaciones salientes
- **CarrierWebhookTest**: Webhooks entrantes, HMAC
- **RateLimitingTest**: Rate limiting en webhooks

### Unit Tests

- **PacketServiceTest**: Lógica de negocio aislada
- **WebhookSignatureServiceTest**: Generación y validación HMAC
- **SendPacketStatusWebhookJobTest**: Retry logic, uniqueness

### Ejecutar tests

```bash
# Todos los tests
php artisan test

# Tests específicos
php artisan test --filter=PacketTest

# Con coverage (requiere xdebug)
php artisan test --coverage
```

## Herramientas de Calidad

### Pint (Code Style - PSR-12)

```bash
# Revisar estilo sin modificar
./vendor/bin/pint --test

# Auto-formatear código
./vendor/bin/pint
```

### PHPStan (Static Analysis - Level 5)

```bash
# Analizar código
./vendor/bin/phpstan analyse

# Con más memoria si es necesario
./vendor/bin/phpstan analyse --memory-limit=512M
```

## Estructura del Proyecto

```
app/
├── Enums/
│   └── PacketStatus.php          # Estados con lógica de transición
├── Exceptions/
│   └── InvalidPacketTransitionException.php
├── Http/
│   ├── Controllers/Api/
│   │   ├── CarrierWebhookController.php
│   │   └── PacketController.php
│   ├── Requests/
│   │   ├── CarrierWebhookRequest.php
│   │   ├── StorePacketRequest.php
│   │   └── UpdatePacketStatusRequest.php
│   └── Resources/
│       └── PacketResource.php
├── Jobs/
│   └── SendPacketStatusWebhookJob.php
├── Models/
│   └── Packet.php
└── Services/
    ├── PacketService.php         # Lógica de negocio principal
    └── WebhookSignatureService.php
```

## Arquitectura

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       v
┌─────────────────┐
│  FormRequest    │ ← Validación
│  (validation)   │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│   Controller    │ ← Orquestación (delgado)
└──────┬──────────┘
       │
       v
┌─────────────────┐
│    Service      │ ← Lógica de negocio
└──────┬──────────┘
       │
       v
┌─────────────────┐
│     Model       │ ← Persistencia
└──────┬──────────┘
       │
       v
┌─────────────────┐
│   Resource      │ ← Transformación JSON
└──────┬──────────┘
       │
       v
┌─────────────────┐
│    Response     │
└─────────────────┘
```

## Flujos Principales

### 1. Creación de Packet

```
POST /api/packets
  → StorePacketRequest valida
  → PacketController::store()
  → PacketService::create()
  → Packet guardado en DB
  → Cache de listas invalidado
  → PacketResource retornado (201)
```

### 2. Cambio de Estado

```
PUT /api/packets/{id}/status
  → UpdatePacketStatusRequest valida
  → PacketController::updateStatus()
  → PacketService::updateStatus()
  → Valida transición (throw si inválida)
  → Actualiza packet en DB
  → Dispatch SendPacketStatusWebhookJob
  → Cache invalidado (packet + listas)
  → PacketResource retornado (200)

  [Async]
  → SendPacketStatusWebhookJob::handle()
  → POST a WEBHOOK_URL
  → Retry si falla (1 vez, 30s backoff)
```

### 3. Webhook Entrante

```
POST /api/webhooks/carrier
  → CarrierWebhookRequest valida campos
  → CarrierWebhookController::handle()
  → WebhookSignatureService::validate()
    → 401 si firma inválida
  → Buscar packet por tracking_code
    → 404 si no existe
  → PacketService::updateStatus()
    → 422 si transición inválida
  → Trigger webhook saliente (async)
  → 200 OK
```

## Licencia

Este proyecto es una prueba técnica.
