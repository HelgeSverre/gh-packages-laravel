# amarwave-laravel

Laravel service provider, facade, and broadcasting driver for [AmarWave](https://github.com/amarwave/amarwave) real-time messaging.

This package wraps [`amarwave/amarwave-php`](../php) and wires it into the Laravel framework.

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

---

## Installation

```bash
composer require amarwave/amarwave-laravel
```

Laravel auto-discovers the service provider and facade. No manual registration needed.

---

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=amarwave-config
```

Add to your `.env`:

```dotenv
AMARWAVE_APP_KEY=your-app-key
AMARWAVE_APP_SECRET=your-app-secret
AMARWAVE_CLUSTER=default
AMARWAVE_TIMEOUT=10
```

---

## Usage

### Facade

```php
use AmarWave\Laravel\AmarWave;

AmarWave::trigger('orders', 'placed', ['order_id' => 42]);

AmarWave::triggerBatch([
    ['channel' => 'chat-1', 'event' => 'message', 'data' => ['text' => 'Hello']],
    ['channel' => 'chat-2', 'event' => 'message', 'data' => ['text' => 'World']],
]);
```

Or with the global alias:

```php
\AmarWave::trigger('orders', 'placed', ['order_id' => 42]);
```

### Dependency Injection

```php
use AmarWave\AmarWave;

class OrderController extends Controller
{
    public function __construct(private readonly AmarWave $aw) {}

    public function store(Request $request): JsonResponse
    {
        $order = Order::create($request->validated());
        $this->aw->trigger('orders', 'placed', $order->toArray());
        return response()->json($order, 201);
    }
}
```

---

## Broadcasting Driver

Use AmarWave as a Laravel broadcasting driver so `broadcast(new YourEvent)` works out of the box.

**1 — Add the connection to `config/broadcasting.php`**

```php
'connections' => [
    'amarwave' => [
        'driver' => 'amarwave',
    ],
],
```

**2 — Set the driver in `.env`**

```dotenv
# Laravel 10
BROADCAST_DRIVER=amarwave
# Laravel 11+
BROADCAST_CONNECTION=amarwave
```

**3 — Create a broadcastable event**

```php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class OrderPlaced implements ShouldBroadcast
{
    public function __construct(public readonly array $order) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
            new PrivateChannel("user.{$this->order['user_id']}"),
        ];
    }

    public function broadcastAs(): string { return 'order.placed'; }

    public function broadcastWith(): array
    {
        return ['order_id' => $this->order['id'], 'total' => $this->order['total']];
    }
}
```

**4 — Dispatch**

```php
broadcast(new OrderPlaced($order));
```

---

## Channel Authorization

In `routes/channels.php`:

```php
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('presence-room.{roomId}', function ($user, $roomId) {
    $room = \App\Models\Room::find($roomId);
    if ($room?->members()->where('user_id', $user->id)->exists()) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    return false;
});
```

---

## License

MIT
