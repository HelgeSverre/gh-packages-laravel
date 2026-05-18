# Laravel Filament Startup Script for full systems and admins

## Packages
filamentphp - https://filamentphp.com/docs/4.x/introduction/overview  
spatie/laravel-permission - https://spatie.be/docs/laravel-permission/v6/introduction  
spatie/laravel-activitylog - https://spatie.be/docs/laravel-activitylog/v4/introduction  
spatie/laravel-medialibrary - https://spatie.be/docs/laravel-medialibrary/v11/introduction  
Laravel Excel - https://docs.laravel-excel.com/3.1/getting-started/  
Laravel DomPdf - https://github.com/barryvdh/laravel-dompdf  
Laravel Debugbar - https://laraveldebugbar.com/installation/  
Laravel IDE Helper - https://github.com/barryvdh/laravel-ide-helper  
Laravel Backup - https://spatie.be/docs/laravel-backup/v9/installation-and-setup  
Laravel Nocaptcha - https://github.com/anhskohbo/no-captcha  

## How to install

Note: This projects was started with docker. Make sure you have docker installed and running in your machine.
But you can run with your local php and mysql enviroments without docker.

### clone the repository
```bash
git clone https://github.com/katalekoweb/laravel-filament-startup-with-essentials-packages.git
cd laravel-filament-startup-with-essentials-packages
```

### Copy the env file 
```bash
cp .env.example .env
```

### Install the dependencies 
```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs
```

### Run the containers with sail
```bash
./vendor/bin/sail up -d
```

### Generate the app key
```bash
./vendor/bin/sail artisan key:generate
```

### Run the migrations and seeders
```bash
./vendor/bin/sail artisan migrate --seed
```

### Install npm dependencies
```bash
./vendor/bin/sail npm i
```

### Buid npm libs
```bash
./vendor/bin/sail npm run build
```

### Open the project in your browser
http://locathost/app  
Login:   
username:admin@admin.com   
password: password