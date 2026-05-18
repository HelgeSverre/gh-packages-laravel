# Yekdev Country Seeder

A reusable Laravel package to **seed countries** into your database with **auto migration and seeding**.  
Works for Laravel 9+.

---

## 📦 Installation

### Step 1: Install the package via Composer
composer require yekdev/country-seeder

### Step 2: Install the package via Composer
php artisan migrate

### step 3: (Optional) Re-run the seeder manually
php artisan db:seed --class="Yekdev\CountrySeeder\Seeders\CountrySeeder"
