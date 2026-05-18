# WYDATKOMIERZ

## About app
Wydatkomierz is a expenses tracker app build in Laravel with Livewire framework. It using Sqlite database and Tailwind CSS.

## How to run on local host
1. Git clone repository
2. composer install
3. cp .env.example .env 
4. php artisan key:generate
5. php artisan migrate:fresh --seed
6. npm install
7. npm run build
8. php artisan serve

## How to run on Docker
1. git clone repository
2. docker-compose build --no-cache
3. docker-compose up -d 
4. check localhost:8080
