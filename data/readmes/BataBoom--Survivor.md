NFL Survivor + Pickem

```
git clone git@github.com:BataBoom/Survivor.git
cd Survivor
npm install
npm run build
composer install
cp .env.example .env
define .env
php artisan config:clear
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

Login: admin@github.com
Password: YourAdminPassword (or as defined in .env)

Admin panel included on /admin, publish the assets using:
```
php artisan filament:assets
```

If you publish the admin panel, rebuild w/ NPM to fix Livewire (refresh bug)
```
npm run build
```


![](https://i.imgur.com/if0T9Jw.png)
![](https://i.imgur.com/njHpkJD.png)
