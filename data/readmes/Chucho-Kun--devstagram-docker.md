# FullStack Platform LARAVEL / LIVEWIRE 
Social network inspired by Instagram with user profile creation, likes system, comments system and Facebook-like followers. Laravel + MySQL + Livewire + Docker + Tailwindcss + Dropzone - (Full-Stack Social Network)
## 🚀 Tech Stack

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-4E5D94?style=for-the-badge&logo=laravel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Dropzone](https://img.shields.io/badge/Dropzone.js-3A3A3A?style=for-the-badge&logo=dropbox&logoColor=white)
<img width="1108" height="861" alt="Captura de Pantalla 2025-10-03 a la(s) 16 09 24" src="https://github.com/user-attachments/assets/d605a8c1-bdec-4953-95b5-39f6eb2ae01a" />

<img width="1051" height="711" alt="Captura de Pantalla 2025-10-03 a la(s) 16 09 50" src="https://github.com/user-attachments/assets/a8b93d56-9d55-4ed8-9799-5721f63cab5a" />

<img width="1185" height="693" alt="Captura de Pantalla 2025-10-03 a la(s) 16 10 33" src="https://github.com/user-attachments/assets/ef9de037-e31b-477a-8c05-1edd42d777ef" />

## Configuration in Docker
### docker-compose.yml
```
services:
    laravel.test:
        build:
            context: './vendor/laravel/sail/runtimes/8.4'
            dockerfile: Dockerfile
            args:
                WWWGROUP: '${WWWGROUP}'
        image: 'sail-8.4/app'
        extra_hosts:
            - 'host.docker.internal:host-gateway'
        ports:
            - '${APP_PORT:-80}:80'
            - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        environment:
            WWWUSER: '${WWWUSER}'
            LARAVEL_SAIL: 1
            XDEBUG_MODE: '${SAIL_XDEBUG_MODE:-off}'
            XDEBUG_CONFIG: '${SAIL_XDEBUG_CONFIG:-client_host=host.docker.internal}'
            IGNITION_LOCAL_SITES_PATH: '${PWD}'
        volumes:
            - '.:/var/www/html'
        networks:
            - sail
        depends_on:
            - mysql
            - redis
            - meilisearch
            - mailpit
    mysql:
        image: 'mysql/mysql-server:8.0'
        ports:
            - '${FORWARD_DB_PORT:-3306}:3306'
        environment:
            MYSQL_ROOT_PASSWORD: '${DB_PASSWORD}'
            MYSQL_ROOT_HOST: '%'
            MYSQL_DATABASE: '${DB_DATABASE}'
            MYSQL_USER: '${DB_USERNAME}'
            MYSQL_PASSWORD: '${DB_PASSWORD}'
            MYSQL_ALLOW_EMPTY_PASSWORD: 1
            MYSQL_EXTRA_OPTIONS: '${MYSQL_EXTRA_OPTIONS}'
        volumes:
            - 'sail-mysql:/var/lib/mysql'
            - './vendor/laravel/sail/database/mysql/create-testing-database.sh:/docker-entrypoint-initdb.d/10-create-testing-database.sh'
        networks:
            - sail
        healthcheck:
            test:
                - CMD
                - mysqladmin
                - ping
                - '-p${DB_PASSWORD}'
            retries: 3
            timeout: 5s
    redis:
        image: 'redis:alpine'
        ports:
            - '${FORWARD_REDIS_PORT:-6379}:6379'
        volumes:
            - 'sail-redis:/data'
        networks:
            - sail
        healthcheck:
            test:
                - CMD
                - redis-cli
                - ping
            retries: 3
            timeout: 5s
    meilisearch:
        image: 'getmeili/meilisearch:latest'
        ports:
            - '${FORWARD_MEILISEARCH_PORT:-7700}:7700'
        environment:
            MEILI_NO_ANALYTICS: '${MEILISEARCH_NO_ANALYTICS:-false}'
        volumes:
            - 'sail-meilisearch:/meili_data'
        networks:
            - sail
        healthcheck:
            test:
                - CMD
                - wget
                - '--no-verbose'
                - '--spider'
                - 'http://127.0.0.1:7700/health'
            retries: 3
            timeout: 5s
    mailpit:
        image: 'axllent/mailpit:latest'
        ports:
            - '${FORWARD_MAILPIT_PORT:-1025}:1025'
            - '${FORWARD_MAILPIT_DASHBOARD_PORT:-8025}:8025'
        networks:
            - sail
networks:
    sail:
        driver: bridge
volumes:
    sail-mysql:
        driver: local
    sail-redis:
        driver: local
    sail-meilisearch:
        driver: local

```
## Using tinker to try databases conection
### terminal
```
sail artisan tinker
Psy Shell v0.12.12 (PHP 8.4.12 — cli) by Justin Hileman
> $usuario = User::find(2)
[!] Aliasing 'User' to 'App\Models\User' for this Tinker session.
= App\Models\User {#6081
    id: 2,
    name: "Teresa Miope",
    username: "tessy",
    email: "tes@tes.com.mx",
    email_verified_at: null,
    #password: "$2y$12$YijSq0luHKJU1yCZsIdIMuvHzHxX2Giw0RrspIGO3V2hg.sDKMbFy",
    #remember_token: "IvCUY0dnsSwlbZwQwSiirpEM91SgT2w2UOL8sfAp4lUpZPGNtATkPddRe17Q",
    created_at: "2025-09-26 00:04:13",
    updated_at: "2025-09-26 00:04:13",
  }

> \App\Models\Post::factory()->count(10)->create();

//un post y quien es su autor

$post = \App\Models\Post::find(1);
$post->user
```

## Deploy in DOM Cloud
### in website options
```
source: https://github.com/Chucho-Kun/devstagram-docker
features:
  - mysql
  - ssl
  - ssl always
nginx:
  root: public_html/public
  fastcgi: on
  locations:
    - match: /
      try_files: $uri $uri/ /index.php$is_args$args
    - match: ~ \.[^\/]+(?<!\.php)$
      try_files: $uri =404
commands:
  - cp .env.example .env
  - sed -i 's/^#\s*\(DB_HOST=.*\)/\1/' .env
  - sed -i 's/^#\s*\(DB_PORT=.*\)/\1/' .env
  - sed -i 's/^#\s*\(DB_DATABASE=.*\)/\1/' .env
  - sed -i 's/^#\s*\(DB_USERNAME=.*\)/\1/' .env
  - sed -i 's/^#\s*\(DB_PASSWORD=.*\)/\1/' .env
  - sed -i "s/DB_HOST=127.0.0.1/DB_HOST=localhost/g" .env
  - sed -ri "s/DB_DATABASE=.*/DB_DATABASE=${DATABASE}/g" .env
  - sed -ri "s/DB_USERNAME=.*/DB_USERNAME=${USERNAME}/g" .env
  - sed -ri "s/DB_PASSWORD=.*/DB_PASSWORD=${PASSWORD}/g" .env
  - sed -ri "s/APP_URL=.*/APP_URL=http:\/\/${DOMAIN}/g" .env
  - sed -ri "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/g" .env
  - composer install
  - php artisan migrate:fresh || true
  - php artisan key:generate
  - php artisan storage:link
  - php artisan livewire:publish
  - cp -r vendor/livewire/livewire/dist public/livewire
  - npm install
  - npm run build
```
