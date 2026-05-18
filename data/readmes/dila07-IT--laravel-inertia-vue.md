Laravel Inertia Vue Starter 🚀

Laravel Inertia Vue Starter is a developer-friendly package designed to simplify the integration of Inertia.js with Vue 3 in Laravel applications. It automates dependency installation, scaffolds essential files, and provides a smooth setup experience with intelligent features like safe file handling, overwrite prompts, middleware auto-registration, and setup guidance when conflicts occur.

Features:
- Automatic installation of Inertia.js (Laravel adapter)
- Vue 3 + Inertia frontend setup
- Vite configuration ready to use
- Smart dependency detection (no duplicate installs)
- Safe file handling (no unwanted overwrites)
- Interactive overwrite confirmation
- --force option for full overwrite
- Auto-generated setup guide when files are skipped
- Automatic Inertia middleware creation and registration
- Clean and beginner-friendly setup

Installation:
composer require dilansabah/laravel-inertia-vue
php artisan inertia-vue:install
npm run dev

What the Package Does:
- Installs inertiajs/inertia-laravel
- Installs npm packages: vue, @inertiajs/vue3, @vitejs/plugin-vue
- Creates or updates:
  resources/js/app.js
  resources/js/Pages/Home.vue
  resources/views/app.blade.php
  vite.config.js
- Creates HandleInertiaRequests middleware
- Registers middleware automatically in bootstrap/app.php
- Adds helpful comment in routes/web.php
- Generates setup guide if files are skipped

Skipped Files Handling:
If important files already exist, the package:
- Asks before overwriting
- Skips if declined
- Generates inertia-vue-setup.md with instructions

Force Overwrite:
php artisan inertia-vue:install --force

Generated Structure:
resources/js/app.js
resources/js/Pages/Home.vue
resources/views/app.blade.php
vite.config.js
app/Http/Middleware/HandleInertiaRequests.php

