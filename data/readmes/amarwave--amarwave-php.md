# amarwave-php

Official PHP client for [AmarWave](https://github.com/amarwave/amarwave-php) real-time messaging.

Works in **any PHP environment** — raw PHP, Symfony, or any other framework.

For Laravel projects, install the dedicated [`amarwave/amarwave-laravel`](../amarwave-laravel) package which adds a service provider, facade, and broadcasting driver.

---

## Requirements

- PHP 8.1+
- `ext-curl`
- `ext-json`

---

## Installation

```bash
composer require amarwave/amarwave-php
```

---

## Usage — Raw PHP

```php
<?php

require 'vendor/autoload.php';

use AmarWave\AmarWave;
use AmarWave\AmarWaveException;

$aw = new AmarWave(
    appKey:    'your-app-key',
    appSecret: 'your-app-secret',
    cluster:   'default',
);

// Trigger a single event
$aw->trigger('orders', 'placed', ['order_id' => 42]);

// Trigger multiple events in one request
$aw->triggerBatch([
    ['channel' => 'chat-1', 'event' => 'message', 'data' => ['text' => 'Hello']],
    ['channel' => 'chat-2', 'event' => 'message', 'data' => ['text' => 'World']],
]);

// Error handling
try {
    $aw->trigger('channel', 'event', $data);
} catch (AmarWaveException $e) {
    echo "HTTP {$e->getStatusCode()}: {$e->getMessage()}";
    echo $e->getResponseBody();
}
```

---

## Usage — Symfony

### Register as a service

```yaml
# config/services.yaml
services:
    AmarWave\AmarWave:
        arguments:
            $appKey:    '%env(AMARWAVE_APP_KEY)%'
            $appSecret: '%env(AMARWAVE_APP_SECRET)%'
            $cluster:   '%env(default:default:AMARWAVE_CLUSTER)%'
            $timeout:   '%env(int:default:10:AMARWAVE_TIMEOUT)%'
```

```dotenv
# .env
AMARWAVE_APP_KEY=your-app-key
AMARWAVE_APP_SECRET=your-app-secret
AMARWAVE_CLUSTER=default
AMARWAVE_TIMEOUT=10
```

### Inject into a controller

```php
<?php

namespace App\Controller;

use AmarWave\AmarWave;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class OrderController extends AbstractController
{
    public function __construct(private readonly AmarWave $aw) {}

    #[Route('/orders', methods: ['POST'])]
    public function store(Request $request): JsonResponse
    {
        // ... create order ...

        $this->aw->trigger('orders', 'placed', ['order_id' => $order->getId()]);

        return $this->json($order, 201);
    }
}
```

### Inject into a service

```php
<?php

namespace App\Service;

use AmarWave\AmarWave;

class NotificationService
{
    public function __construct(private readonly AmarWave $aw) {}

    public function notifyUser(int $userId, string $message): void
    {
        $this->aw->trigger("private-user.{$userId}", 'notification', [
            'message' => $message,
        ]);
    }
}
```

---

## Usage — Slim 4

```php
<?php

use AmarWave\AmarWave;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require 'vendor/autoload.php';

$app = AppFactory::create();

// Register AmarWave in the container
$container = new \DI\Container();
$container->set(AmarWave::class, fn() => new AmarWave(
    appKey:    $_ENV['AMARWAVE_APP_KEY'],
    appSecret: $_ENV['AMARWAVE_APP_SECRET'],
));
AppFactory::setContainer($container);

// Use in a route
$app->post('/orders', function (Request $request, Response $response) {
    $aw = $this->get(AmarWave::class);
    $body = (array) $request->getParsedBody();

    // ... create order ...

    $aw->trigger('orders', 'placed', ['order_id' => $body['id']]);

    $response->getBody()->write(json_encode(['status' => 'ok']));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
```

---

## Usage — CodeIgniter 4

### Create a helper or library

```php
<?php
// app/Libraries/AmarWaveClient.php

namespace App\Libraries;

use AmarWave\AmarWave;

class AmarWaveClient extends AmarWave
{
    public function __construct()
    {
        parent::__construct(
            appKey:    env('amarwave.app_key'),
            appSecret: env('amarwave.app_secret'),
            cluster:   env('amarwave.cluster', 'default'),
        );
    }
}
```

```php
// app/Config/AmarWave.php
<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class AmarWave extends BaseConfig
{
    public string $appKey    = '';
    public string $appSecret = '';
    public string $cluster   = 'default';
    public int    $timeout   = 10;
}
```

### Use in a controller

```php
<?php

namespace App\Controllers;

use App\Libraries\AmarWaveClient;
use CodeIgniter\Controller;

class OrderController extends Controller
{
    public function create(): string
    {
        $aw = new AmarWaveClient();

        // ... create order ...

        $aw->trigger('orders', 'placed', ['order_id' => 42]);

        return $this->response->setJSON(['status' => 'ok']);
    }
}
```

---

## Usage — Laminas / Mezzio

### Register in a factory

```php
<?php
// src/App/AmarWaveFactory.php

namespace App;

use AmarWave\AmarWave;
use Psr\Container\ContainerInterface;

class AmarWaveFactory
{
    public function __invoke(ContainerInterface $container): AmarWave
    {
        $config = $container->get('config')['amarwave'] ?? [];

        return new AmarWave(
            appKey:    $config['app_key']   ?? '',
            appSecret: $config['app_secret'] ?? '',
            cluster:   $config['cluster']   ?? 'default',
            timeout:   $config['timeout']   ?? 10,
        );
    }
}
```

```php
// config/autoload/amarwave.global.php
<?php

return [
    'amarwave' => [
        'app_key'    => getenv('AMARWAVE_APP_KEY'),
        'app_secret' => getenv('AMARWAVE_APP_SECRET'),
        'cluster'    => getenv('AMARWAVE_CLUSTER') ?: 'default',
        'timeout'    => 10,
    ],
    'dependencies' => [
        'factories' => [
            \AmarWave\AmarWave::class => \App\AmarWaveFactory::class,
        ],
    ],
];
```

### Use in a handler

```php
<?php

namespace App\Handler;

use AmarWave\AmarWave;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;

class OrderHandler implements RequestHandlerInterface
{
    public function __construct(private readonly AmarWave $aw) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // ... create order ...

        $this->aw->trigger('orders', 'placed', ['order_id' => 42]);

        return new JsonResponse(['status' => 'ok'], 201);
    }
}
```

---

## Channel Authentication

For private and presence channels, generate an auth token server-side:

```php
// Private channel
$auth = $aw->authenticate($socketId, 'private-orders');
// returns: "appKey:hmac-signature"

// Presence channel
$auth = $aw->authenticatePresence($socketId, 'presence-room.42', [
    'user_id'   => '99',
    'user_info' => ['name' => 'Alice'],
]);
// returns: ['auth' => '...', 'channel_data' => '...']
```

---

## Constructor Options

| Parameter   | Type   | Default     | Description                                   |
|-------------|--------|-------------|-----------------------------------------------|
| `appKey`    | string | —           | Your AmarWave app key                         |
| `appSecret` | string | —           | Your AmarWave app secret (keep server-side)   |
| `cluster`   | string | `'default'` | `default`, `eu`, `us`, `ap1`, `ap2`          |
| `timeout`   | int    | `10`        | HTTP request timeout in seconds               |

---

## Laravel

Use the dedicated Laravel package for full framework integration (service provider, facade, broadcasting driver):

```bash
composer require amarwave/amarwave-laravel
```

See [amarwave-laravel](../amarwave-laravel/README.md) for setup.

---

## License

MIT
