# mtr/laravel-test-chat

## Install

- Add repository to `composer.json`:

```json
{
  "repositories": [
    {
      "type": "git",
      "url": "https://github.com/Concept-Labs/laravel-test-chat"
    }
  ]
}
```


- Install package + host auth (example with Breeze):

```bash
composer require mtr/laravel-test-chat:dev-main
composer require laravel/breeze --dev
php artisan breeze:install
npm install && npm run build
php artisan migrate
php artisan test-chat:install --seed
```

- Configure `.env` for Redis + Reverb:

```dotenv
BROADCAST_CONNECTION=reverb

QUEUE_CONNECTION=redis

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

REVERB_APP_ID=local
REVERB_APP_KEY=local
REVERB_APP_SECRET=local
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY=${REVERB_APP_KEY}
VITE_REVERB_HOST=${REVERB_HOST}
VITE_REVERB_PORT=${REVERB_PORT}
VITE_REVERB_SCHEME=${REVERB_SCHEME}
```

- Start services:

```bash
php artisan reverb:start
php artisan queue:work
```

- Open chat UI:

`/tchat`

- available users:
  `oleg@test.com`
  `serzh@test.com`
  `ruslan@test.com`

  All have password: `password`

All are protected by `web` + `auth` by default.


## Broadcast Channel

Private channel format:

`test-chat.user.{id}`
