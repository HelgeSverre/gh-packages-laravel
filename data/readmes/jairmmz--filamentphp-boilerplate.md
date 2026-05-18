 # FilamentPHP Boilerplate
 
 A modern Laravel starter kit with FilamentPHP 5, designed to accelerate development with a pre-configured admin panel, authentication, roles & permissions, and a curated set of plugins ready to use out of the box.
 
  ## 📋 Requirements
 
 - PHP >= 8.2
 - Composer >= 2.x
 - Node.js >= 18.x
 - MySQL >= 8.0 / PostgreSQL >= 13 / SQLite
 
 ---
 
 ## 🧰 Stack
 
 | Technology | Version |
 |---|---|
 | PHP | ^8.2 |
 | Laravel | ^12.0 |
 | FilamentPHP | ^5.0 |
 | Livewire | ^4.0 |
 | Alpine.js | Bundled with Livewire |
 | Tailwind CSS | ^4.1 |
 
 ---
 
 ## 📦 Packages Included
 
 | Package | Description |
 |---|---|
 | `filament/filament` | Admin panel core |
 | `bezhansalleh/filament-shield` | Role & permission management for Filament |
 | `jeffgreco13/filament-breezy` | Authentication, profile & 2FA for Filament |
 | `laravel/fortify` | Backend authentication scaffolding |
 | `livewire/livewire` | Full-stack component framework |
 | `livewire/flux` | Official Livewire UI component library |
 | `livewire/blaze` | Livewire performance utilities |
 | `openplain/filament-shadcn-theme` | Shadcn-inspired theme for Filament |
 | `pxlrbt/filament-environment-indicator` | Visual environment indicator in the panel |
 | `swisnl/filament-backgrounds` | Customizable backgrounds for auth screens |
 | `achyutn/filament-log-viewer` | Log viewer integrated in the admin panel |
 | `laravel-lang/common` | Translations for common Laravel packages |
 
 ---
 
 ## 🚀 Installation
 
 ### 1. Clone the repository
 ```bash
 git clone https://github.com/jairmmz/filamentphp-boilerplate.git
 cd filamentphp-boirlerplate
 ```
 
 ### 2. Install PHP dependencies
 ```bash
 composer install
 ```
 
 ### 3. Install Node dependencies
 ```bash
 npm install
 ```
 
 ### 4. Environment setup
 ```bash
 cp .env.example .env
 php artisan key:generate
 ```
 
 ### 5. Configure your database
 
 Edit the `.env` file and set your database credentials:
 ```env
 DB_CONNECTION=mysql
 DB_HOST=127.0.0.1
 DB_PORT=3306
 DB_DATABASE=your_database
 DB_USERNAME=your_username
 DB_PASSWORD=your_password
 ```
 
 ### 6. Run migrations
 ```bash
 php artisan migrate
 ```
 
 ### 7. Run seeders
 ```bash
 php artisan db:seed
 ```
 
 ### 8. Storage link
 ```bash
 php artisan storage:link
 ```
 
 ### 9. Compile assets
 ```bash
 npm run build
 ```
 
 > For development with hot reload:
 > ```bash
 > npm run dev
 > ```
 
 ---
 
 ## 👤 Default Credentials
 
 After running the seeders, you can log in with:
 
 | Field | Value |
 |---|---|
 | Email | `admin@example.com` |
 | Password | `123456789` |
 
 > ⚠️ Change these credentials immediately in a production environment.
 
---
 
## 🧠 Laravel IDE Helper

Generate IDE helper files for better autocompletion support:
```bash
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```
---
  
 ## 🌐 Localization
 
 This boilerplate includes `laravel-lang/common` for multi-language support. To publish and install a language:
 ```bash
 php artisan lang:add es
 ```
 
 Set your application locale in `.env`:
 ```env
 APP_LOCALE=es
 ```
 
 ---
 
 ## 🖥️ Running the Application
 ```bash
 php artisan serve
 ```
 
 Access the admin panel at: [http://localhost:8000/admin](http://localhost:8000/admin)
 
 ---
 
 ## ⚙️ Useful Commands
 ```bash
 php artisan optimize:clear         # Clear all cached files
 php artisan filament:upgrade       # Upgrade Filament assets
 php artisan shield:generate --all  # Regenerate all permissions
 ```
 
 ---
  
 ## 🛡️ Shield — Roles & Permissions
 
 After seeding, generate the Shield policies and register permissions:
 ```bash
 php artisan shield:generate --all
 ```
