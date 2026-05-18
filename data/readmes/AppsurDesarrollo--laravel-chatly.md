# Laravel Chatly

Paquete Laravel para integrar WhatsApp Business a traves de la API de [Chatly](https://chatly.es). Permite enviar plantillas (templates), mensajes de texto libre (ventana 24h), recibir mensajes entrantes via webhook, y almacenar el historial de conversaciones.

## Requisitos

- PHP 8.2+
- Laravel 11, 12 o 13
- Una cuenta en [Chatly](https://chatly.es) con un chat de WhatsApp Business configurado
- Plantillas aprobadas en Meta Business Manager (para envio de templates)

---

## Instalacion

### 1. Instalar el paquete

```bash
composer require appsur/laravel-chatly
```

El Service Provider se registra automaticamente via auto-discovery.

### 2. Publicar configuracion y migraciones

```bash
php artisan vendor:publish --tag=chatly-config
php artisan vendor:publish --tag=chatly-migrations
php artisan migrate
```

### 3. Configurar variables de entorno

Anade estas variables a tu `.env`:

```env
CHATLY_ENABLED=true
CHATLY_API_URL=https://chatly.es/api
CHATLY_API_KEY=tu_api_key_de_chatly
CHATLY_EXTERNAL_USER_ID=1
CHATLY_WEBHOOK_SECRET=un_secreto_seguro_de_64_caracteres
CHATLY_WEBHOOK_ROUTE=api/webhook/chatly
```

---

## Configuracion en Chatly (Panel de administracion)

Estos pasos se hacen en el panel de Chatly, NO en Laravel:

### Paso 1: Obtener credenciales

1. Entra en el panel de Chatly
2. Ve a la seccion de integraciones de tu chat
3. Copia el **API Key** → `CHATLY_API_KEY`
4. Copia el **ID de la integracion** o usa el ID del usuario externo → `CHATLY_EXTERNAL_USER_ID`

### Paso 2: Configurar el webhook

En la tabla `integration_data` de Chatly (o via su API/panel), configura:

| Campo | Valor |
|-------|-------|
| `data_name` | `webhook_url` |
| `data_value` | `https://tu-dominio.com/api/webhook/chatly` |

| Campo | Valor |
|-------|-------|
| `data_name` | `webhook_secret` |
| `data_value` | El mismo valor que `CHATLY_WEBHOOK_SECRET` en tu `.env` |

### Paso 3: Registrar usuario externo

En `integration_data` de Chatly, crea un mapping del usuario de tu aplicacion:

| Campo | Valor |
|-------|-------|
| `data_name` | `user_{id_usuario_en_tu_app}` |
| `data_value` | ID interno del usuario en Chatly |

El `external_user_id` que uses en `.env` debe coincidir con este mapping.

### Paso 4: Crear plantillas en Meta Business Manager

Las plantillas se crean en [Meta Business Manager](https://business.facebook.com/) > WhatsApp Manager > Plantillas. Cada plantilla debe ser aprobada por Meta antes de poder usarse.

Ejemplo de plantilla `reserva_confirmada`:
- **Header**: Texto (sin variables) — ej: "Reserva confirmada"
- **Body**: Con variables `{{1}}` a `{{5}}` — ej: "Hola {{1}}, tu reserva en {{2}} para el {{3}} a las {{4}} ({{5}} personas) esta confirmada."
- **Button**: URL con variable — ej: `https://tu-dominio.com/booking/manage/{{1}}`

---

## Uso basico

### Inyeccion de dependencias

```php
use Appsur\Chatly\ChatlyService;

class ReservationController extends Controller
{
    public function __construct(
        private ChatlyService $chatly,
    ) {}
}
```

### Facade

```php
use Appsur\Chatly\Facades\Chatly;

Chatly::sendTemplate('34600000000', 'reserva_confirmada', 'es', $components);
```

### Enviar una plantilla

```php
$result = $this->chatly->sendTemplate(
    phone: '34600000000',           // Telefono con codigo de pais, solo digitos
    templateName: 'reserva_confirmada',  // Nombre de la plantilla en Meta
    language: 'es',                 // Idioma de la plantilla
    components: [
        // Header (si la plantilla tiene header con variables)
        ['type' => 'header', 'parameters' => []],
        // Body
        ['type' => 'body', 'parameters' => [
            ['type' => 'text', 'text' => 'Juan'],           // {{1}}
            ['type' => 'text', 'text' => 'Mi Restaurante'],  // {{2}}
            ['type' => 'text', 'text' => '15 de abril'],     // {{3}}
            ['type' => 'text', 'text' => '14:00'],           // {{4}}
            ['type' => 'text', 'text' => '2'],               // {{5}}
        ]],
        // Button URL (si la plantilla tiene boton con variable)
        ['type' => 'button', 'sub_type' => 'url', 'index' => '0', 'parameters' => [
            ['type' => 'text', 'text' => 'token_confirmacion_aqui'],
        ]],
    ],
    fullText: 'Reserva confirmada: Juan en Mi Restaurante, 15 abril 14:00 (2 pax)', // Texto legible para el historial
    tenantId: 1, // ID del tenant/restaurante (opcional, para multi-tenant)
);

if ($result['success']) {
    // Plantilla enviada correctamente
} else {
    // Error: $result['error'] o $result['message']
}
```

### Enviar mensaje de texto libre

Solo funciona dentro de la ventana de 24h (despues del ultimo mensaje del cliente):

```php
$result = $this->chatly->sendText('34600000000', 'Hola, tu mesa esta lista!');

if ($result['success']) {
    // Mensaje enviado
} else {
    // $result['error'] puede ser "Ventana de 24h cerrada. Usa una plantilla."
}
```

### Obtener mensajes de una conversacion

```php
$result = $this->chatly->getMessages('34600000000', limit: 50, offset: 0);
// $result['data'] contiene los mensajes
```

---

## Webhook: recibir mensajes entrantes

El paquete registra automaticamente la ruta `POST /api/webhook/chatly` (configurable via `CHATLY_WEBHOOK_ROUTE`).

Cuando llega un mensaje, se:
1. Verifica el `X-Webhook-Secret`
2. Crea un registro en `chatly_messages`
3. Dispara el evento `ChatlyMessageReceived`

### Escuchar mensajes entrantes

Crea un listener en tu aplicacion:

```php
// app/Listeners/HandleChatlyMessage.php
namespace App\Listeners;

use Appsur\Chatly\Events\ChatlyMessageReceived;

class HandleChatlyMessage
{
    public function handle(ChatlyMessageReceived $event): void
    {
        $message = $event->message;      // ChatlyMessage model
        $rawData = $event->rawData;      // Array original del webhook

        $phone = $message->phone;
        $text = $message->message_text;
        $contactName = $message->contact_name;

        // Tu logica: buscar cliente, crear notificacion, etc.
        $customer = Customer::where('phone', 'like', '%' . substr($phone, -9))->first();

        if ($customer) {
            $message->update([
                'customer_id' => $customer->id,
                'tenant_id' => $customer->restaurant_id,
            ]);
        }

        // Crear notificacion admin, etc.
    }
}
```

Registra el listener en `EventServiceProvider` o con atributo:

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    \Appsur\Chatly\Events\ChatlyMessageReceived::class => [
        \App\Listeners\HandleChatlyMessage::class,
    ],
];
```

---

## Modelo ChatlyMessage

La tabla `chatly_messages` almacena el historial local de conversaciones:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | bigint | Primary key |
| `tenant_id` | bigint nullable | ID del tenant (restaurante, empresa, etc.) |
| `customer_id` | bigint nullable | ID del cliente en tu app |
| `phone` | varchar(20) | Telefono (solo digitos, con codigo pais) |
| `message_text` | text nullable | Contenido del mensaje |
| `message_type` | varchar(20) | `text`, `template`, `image`, etc. |
| `is_from_customer` | boolean | `true` = entrante, `false` = saliente |
| `is_read` | boolean | Para badges de "no leido" |
| `whatsapp_message_id` | varchar nullable | ID del mensaje en WhatsApp |
| `contact_name` | varchar nullable | Nombre del contacto en WhatsApp |
| `sent_at` | timestamp | Fecha/hora del mensaje |

### Extender el modelo

Si necesitas relaciones o logica adicional:

```php
// app/Models/WhatsAppMessage.php
namespace App\Models;

use Appsur\Chatly\Models\ChatlyMessage;

class WhatsAppMessage extends ChatlyMessage
{
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class, 'tenant_id');
    }
}
```

Luego en `config/chatly.php`:

```php
'message_model' => \App\Models\WhatsAppMessage::class,
```

---

## Estructura de components para plantillas

Los `components` deben coincidir EXACTAMENTE con la estructura de la plantilla en Meta.

### Reglas importantes

1. **Header sin variables**: NO incluir `['type' => 'header', 'parameters' => []]` — omitirlo
2. **Header con variables**: Incluir los parametros correspondientes
3. **Body**: Incluir un parametro por cada `{{N}}` en el body de la plantilla
4. **Button URL con variable**: El `text` es SOLO la parte variable de la URL (no la URL completa)
5. **Button sin variable**: No incluir el componente button

### Ejemplos por tipo de plantilla

**Solo body (sin header ni boton):**
```php
$components = [
    ['type' => 'body', 'parameters' => [
        ['type' => 'text', 'text' => 'Juan'],
        ['type' => 'text', 'text' => 'Mi Restaurante'],
    ]],
];
```

**Header texto + body + boton URL:**
```php
$components = [
    ['type' => 'header', 'parameters' => []], // Solo si el header tiene variables
    ['type' => 'body', 'parameters' => [
        ['type' => 'text', 'text' => 'Juan'],
        ['type' => 'text', 'text' => 'Mi Restaurante'],
        ['type' => 'text', 'text' => '15 de abril de 2026'],
        ['type' => 'text', 'text' => '14:00'],
        ['type' => 'text', 'text' => '2'],
    ]],
    ['type' => 'button', 'sub_type' => 'url', 'index' => '0', 'parameters' => [
        ['type' => 'text', 'text' => 'token_o_path_variable'],
    ]],
];
```

---

## Errores comunes y solucion

| Error | Causa | Solucion |
|-------|-------|----------|
| `Session has expired` | Token de Meta expirado | Renovar el token en Meta Business Manager > WhatsApp > Configuracion de API |
| `Template not found` | Nombre de plantilla incorrecto o no aprobada | Verificar nombre exacto y estado en Meta |
| `Invalid components` | Estructura de components no coincide con la plantilla | Revisar numero de variables, no enviar header vacio si el header no tiene variables |
| `Ventana de 24h cerrada` | Intentas enviar texto libre fuera de la ventana | Usar `sendTemplate` en su lugar |
| `401 Unauthorized` (webhook) | Webhook secret no coincide | Verificar que el secret en `.env` coincide con el configurado en Chatly |

---

## API de Chatly — Endpoints utilizados

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/external/send_template` | Enviar plantilla de WhatsApp |
| `POST` | `/external/conversations/{phone}/send` | Enviar texto libre (ventana 24h) |
| `GET`  | `/external/conversations/{phone}/messages` | Obtener historial de mensajes |
| `POST` | Webhook configurado | Recibir eventos (nuevo mensaje) |

### Headers requeridos

```
X-Api-Key: {tu_api_key}
Accept: application/json
Content-Type: application/json
```

### Payload del webhook entrante

```json
{
    "event": "new_message",
    "data": {
        "phone": "34600000000",
        "message_text": "Hola, quiero reservar",
        "message_type": "text",
        "message_id": "wamid.xxxxx",
        "contact_name": "Juan Garcia"
    }
}
```

---

## Integracion con tu aplicacion: ejemplo completo

### 1. Enviar WhatsApp al confirmar una reserva

```php
// app/Http/Controllers/ReservationController.php

use Appsur\Chatly\ChatlyService;

public function store(Request $request)
{
    // ... crear reserva ...

    // Enviar WhatsApp
    $chatly = app(ChatlyService::class);
    $phone = $customer->phone_prefix . $customer->phone; // ej: "+34625607119" → limpiar
    $phone = preg_replace('/[^0-9]/', '', $phone);       // → "34625607119"

    $date = $reservation->date->locale('es')->isoFormat('D [de] MMMM [de] YYYY');
    $time = substr($reservation->time, 0, 5);

    $result = $chatly->sendTemplate($phone, 'reserva_confirmada', 'es', [
        ['type' => 'body', 'parameters' => [
            ['type' => 'text', 'text' => $customer->first_name],
            ['type' => 'text', 'text' => $restaurant->name],
            ['type' => 'text', 'text' => $date],
            ['type' => 'text', 'text' => $time],
            ['type' => 'text', 'text' => (string) $reservation->pax],
        ]],
        ['type' => 'button', 'sub_type' => 'url', 'index' => '0', 'parameters' => [
            ['type' => 'text', 'text' => $reservation->confirmation_token],
        ]],
    ], "Reserva confirmada: {$customer->first_name} en {$restaurant->name}", $restaurant->id);

    if ($result['success']) {
        Communication::create([
            'type' => 'whatsapp',
            'trigger' => 'reservation_confirmed',
            'reservation_id' => $reservation->id,
            'customer_id' => $customer->id,
            'sent_at' => now(),
        ]);
    }
}
```

### 2. Listener para mensajes entrantes

```php
// app/Listeners/HandleChatlyMessage.php

use Appsur\Chatly\Events\ChatlyMessageReceived;

class HandleChatlyMessage
{
    public function handle(ChatlyMessageReceived $event): void
    {
        $message = $event->message;

        // Buscar cliente por telefono (ultimos 9 digitos)
        $customer = Customer::where('phone', 'like', '%' . substr($message->phone, -9))->first();

        // Buscar tenant via cliente
        $tenant = $customer?->restaurants()->first() ?? Restaurant::first();

        // Actualizar mensaje con relaciones
        $message->update([
            'customer_id' => $customer?->id,
            'tenant_id' => $tenant?->id,
        ]);

        // Notificacion al admin
        AdminNotification::create([
            'restaurant_id' => $tenant->id,
            'type' => 'whatsapp_message',
            'title' => 'Nuevo mensaje WhatsApp',
            'body' => ($customer?->full_name ?? $message->contact_name ?? $message->phone)
                     . ': ' . mb_substr($message->message_text ?? '(multimedia)', 0, 100),
            'link' => '/admin/messages',
        ]);
    }
}
```

### 3. Chat UI en panel admin (controlador)

```php
// app/Http/Controllers/Admin/MessageController.php

use Appsur\Chatly\ChatlyService;
use Appsur\Chatly\Models\ChatlyMessage;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->restaurant_id;

        $conversations = ChatlyMessage::where('tenant_id', $tenantId)
            ->selectRaw('phone, MAX(id) as last_id, MAX(sent_at) as last_at, COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN is_from_customer = 1 AND is_read = 0 THEN 1 ELSE 0 END) as unread')
            ->groupBy('phone')
            ->orderByDesc('last_at')
            ->get();

        return view('admin.messages.index', compact('conversations'));
    }

    public function show(string $phone)
    {
        $messages = ChatlyMessage::where('phone', $phone)->orderBy('sent_at')->get();

        // Marcar como leidos
        ChatlyMessage::where('phone', $phone)
            ->where('is_from_customer', true)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['messages' => $messages]);
    }

    public function send(Request $request, string $phone)
    {
        $chatly = app(ChatlyService::class);
        $result = $chatly->sendText($phone, $request->input('message'));

        if ($result['success'] ?? false) {
            ChatlyMessage::create([
                'tenant_id' => $request->user()->restaurant_id,
                'phone' => $phone,
                'message_text' => $request->input('message'),
                'message_type' => 'text',
                'is_from_customer' => false,
                'sent_at' => now(),
            ]);
        }

        return response()->json($result);
    }
}
```

---

## Pendiente tras instalar (configuracion manual en Chatly)

Despues de instalar el paquete y configurar las variables de entorno, hay que hacer estos pasos manuales en el sistema de Chatly:

1. **Actualizar `webhook_url`** en `integration_data` de Chatly para que apunte a `https://tu-dominio.com/api/webhook/chatly`
2. **Configurar `webhook_secret`** en `integration_data` con el mismo valor que `CHATLY_WEBHOOK_SECRET`
3. **Registrar el `external_user_id`** en `integration_data` mapeando el usuario de tu app al usuario de Chatly
4. **Renovar el token de Meta** si ha expirado (en Meta Business Manager > WhatsApp > Configuracion de API). El token expira periodicamente y debe renovarse manualmente
5. **Crear y aprobar plantillas** en Meta Business Manager si aun no existen. Los nombres de plantilla deben coincidir exactamente con los usados en `sendTemplate()`
6. **Verificar que el chat de Chatly esta activo** y conectado al numero de WhatsApp Business

---

## Licencia

MIT
