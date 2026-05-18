# Laravel MAX Bot

Laravel-пакет для удобной работы с **MAX Bot API** в приложениях на Laravel.

Пакет предоставляет:
- HTTP-клиент для запросов к MAX Bot API;
- удобную обёртку для отправки сообщений пользователям и в чаты;
- сервис для управления webhook-подписками;
- сервис для ответа на callback-события;
- встроенный webhook-роут для приёма входящих обновлений;
- artisan-команды для генерации handler-класса и регистрации webhook;
- базовую интеграцию с контейнером Laravel через Service Provider и Facade.

> Пакет находится в активной разработке. API может расширяться в следующих версиях.

---

## Требования

- PHP 8.2+
- Laravel 10 / 11 / 12

---

## Установка

Установите пакет через Composer:

```bash
composer require blacky0892/laravel-max-bot
```

Опубликуйте конфигурационный файл:

```bash
php artisan vendor:publish --tag=max-config
```

---

## Настройка

Добавьте переменные в `.env`:

```env
MAX_BOT_TOKEN=your_token
MAX_BASE_URL=https://platform-api.max.ru
MAX_WEBHOOK_SECRET=super-secret
MAX_ROUTE_ENABLED=true
MAX_ROUTE_PATH=/max/webhook
MAX_WEBHOOK_HANDLER=App\Services\Max\MaxWebhookHandler
```

---

## Конфигурация

После публикации будет создан файл `config/max.php`.

Пример:

```php
return [
    'token' => env('MAX_BOT_TOKEN'),

    'base_url' => env('MAX_BASE_URL', 'https://platform-api.max.ru'),

    'timeout' => (int) env('MAX_TIMEOUT', 30),

    'connect_timeout' => (int) env('MAX_CONNECT_TIMEOUT', 10),

    'retry_times' => (int) env('MAX_RETRY_TIMES', 0),

    'retry_sleep' => (int) env('MAX_RETRY_SLEEP', 200),

    'webhook_secret' => env('MAX_WEBHOOK_SECRET'),

    'route' => [
        'enabled' => (bool) env('MAX_ROUTE_ENABLED', true),
        'path' => env('MAX_ROUTE_PATH', '/max/webhook'),
        'middleware' => ['api'],
    ],

    'webhook' => [
        'handler' => env('MAX_WEBHOOK_HANDLER', 'App\\Services\\Max\\MaxWebhookHandler'),
    ],
];
```

### Описание параметров

- `token` — токен вашего бота MAX.
- `base_url` — базовый URL API.
- `timeout` — таймаут HTTP-запросов.
- `connect_timeout` — таймаут соединения.
- `retry_times` — количество повторных попыток при ошибках.
- `retry_sleep` — задержка между повторами в миллисекундах.
- `webhook_secret` — секрет для проверки входящих webhook-запросов.
- `route.enabled` — включить автоматическую регистрацию webhook-роута.
- `route.path` — путь для webhook.
- `webhook.handler` — класс обработчика входящих обновлений.

---

## Быстрый старт

### Обработка входящих обновлений

Чтобы обрабатывать входящие webhook-запросы, создайте класс-обработчик, реализующий интерфейс `HandlesMaxUpdates`.


И укажите этот класс в `.env`:

```env
MAX_WEBHOOK_HANDLER=App\Services\Max\MaxWebhookHandler
```

После изменения конфигурации очистите кэш:

```bash
php artisan config:clear
```

Можно воспользоваться командой для генерации демо-версии обработчика

```bash
php artisan make:max-webhook-handler
```

Это создаст файл `app/Services/Max/MaxWebhookHandler.php`.

Можно указать своё имя или путь:

```bash
php artisan make:max-webhook-handler Services/Bots/MainMaxHandler
```

### Регистрация webhook одной командой

Когда приложение уже доступно по HTTPS и роут webhook включён, можно зарегистрировать подписку прямо из artisan:

```bash
php artisan max:webhook-register
```

По умолчанию команда:
- берёт `APP_URL` из `.env`;
- добавляет к нему `MAX_ROUTE_PATH`;
- использует `MAX_WEBHOOK_SECRET`;
- подписывает на `message_created,message_callback,bot_started`.

Можно передать свои параметры:

```bash
php artisan max:webhook-register \
  --url="https://example.com/max/webhook" \
  --types="message_created,message_callback,bot_started" \
  --secret="super-secret" \
  --version=1
```

Если нужно сначала посмотреть, что будет отправлено, а не выполнять запрос:

```bash
php artisan max:webhook-register --dry-run
```

### Получение информации о боте

```php
use Blacky0892\Max\Facades\Max;

$me = Max::client()->getMe();
```

### Отправка сообщения пользователю

```php
use Blacky0892\Max\Facades\Max;

Max::client()->sendMessageToUser(
    userId: 123456,
    text: 'Привет из Laravel-пакета!',
    format: 'markdown'
);
```

### Отправка сообщения в чат

```php
use Blacky0892\Max\Facades\Max;

Max::client()->sendMessageToChat(
    chatId: 987654,
    text: 'Сообщение в чат',
    format: 'html'
);
```

### Редактирование сообщения

```php
Max::client()->editMessage(
    messageId: 1001,
    text: 'Обновлённый текст',
    format: 'markdown'
);
```

### Удаление сообщения

```php
Max::client()->deleteMessage(1001);
```

### Получение сообщений

```php
$messages = Max::client()->getMessages(
    chatId: 987654,
    count: 20
);
```

---

## Работа с вложениями

### Загрузка файла по пути

```php
$upload = Max::client()->uploadFromPath(
    path: storage_path('app/public/file.pdf'),
    type: 'file'
);
```

### Загрузка файла из UploadedFile

```php
$upload = Max::client()->uploadFromUploadedFile(
    file: $request->file('document'),
    type: 'file'
);
```

### Отправка видео в чат

```php
$upload = Max::client()->uploadFromPath(
    path: storage_path('app/public/video.mp4'),
    type: 'video'
);

Max::client()->sendVideoToChat(
    chatId: 987654,
    videoToken: $upload['token'],
    caption: 'Видео готово'
);
```

> Сейчас в пакете есть готовый метод `sendVideoToChat()`. Поддержку остальных типов вложений можно добавить аналогичным образом.

---

## Работа с webhook-подписками

### Получить список подписок

```php
$subscriptions = Max::subscriptions()->all();
```

### Создать подписку

```php
use Blacky0892\Max\Facades\Max;

Max::subscriptions()->create(
    url: 'https://example.com/max/webhook',
    updateTypes: ['message_created', 'message_callback'],
    secret: config('max.webhook_secret'),
    version: 1,
);
```

### Удалить подписку

```php
Max::subscriptions()->delete('https://example.com/max/webhook');
```

---

## Callback-события

Если пользователь нажал на кнопку и MAX прислал callback, на него можно ответить так:

```php
use Blacky0892\Max\Facades\Max;

Max::callbacks()->answer(
    callbackId: 'callback-id',
    notification: 'Действие выполнено'
);
```

Также пакет умеет извлекать `callback_id` из update-массива:

```php
$callbackId = Max::callbacks()->callbackIdFromUpdate($update);
```

---

## Встроенный webhook-роут

Если `MAX_ROUTE_ENABLED=true`, пакет автоматически регистрирует POST-роут:

```text
/max/webhook
```

Путь можно изменить через `MAX_ROUTE_PATH`.

### Проверка секрета

Если задан `MAX_WEBHOOK_SECRET`, пакет проверяет заголовок:

```text
X-Max-Bot-Api-Secret
```

Если секрет не совпадает, запрос будет отклонён с HTTP 403.

---

## Объект Update

Пакет содержит вспомогательный объект `Blacky0892\Max\Support\Update`, который упрощает работу с входящими payload.

### Основные методы

```php
$update->raw();
$update->type();
$update->timestamp();
$update->chatId();
$update->userId();
$update->text();
$update->callbackId();
$update->messageId();
$update->get('message.body.text');
$update->isMessageCreated();
$update->isMessageCallback();
```

---

## Пример сценария запуска webhook

1. Установить пакет.
2. Настроить `.env`.
3. Опубликовать конфиг.
4. Создать handler-класс.
5. Убедиться, что роут доступен по HTTPS.
6. Выполнить `php artisan max:webhook-register`.
7. Начать принимать события.

---

## Лицензия

MIT

---

## Автор

Blacky0892 <anton@anton-mironov.ru>

---

## Ссылки

- [MAX Messenger](https://max.ru/)
- [MAX Bot API Documentation](https://platform-api.max.ru/docs/)

