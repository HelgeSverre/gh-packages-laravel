# Laravel Livewire Multi-Step Form Wizard
<!--
Laravel Livewire form wizard, multi-step form wizard, laravel multi step form, livewire wizard component, laravel blade wizard, tailwindcss laravel form
-->

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red?logo=laravel)](https://laravel.com)
[![Livewire](https://img.shields.io/badge/Livewire-3.6-blueviolet)](https://livewire.laravel.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/github/license/Codegenie-BE/laravel-livewire-multistep-form)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Codegenie-BE/laravel-livewire-multistep-form)](https://github.com/Codegenie-BE/laravel-livewire-multistep-form/commits/main)
[![Issues](https://img.shields.io/github/issues/Codegenie-BE/laravel-livewire-multistep-form)](https://github.com/Codegenie-BE/laravel-livewire-multistep-form/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Codegenie-BE/laravel-livewire-multistep-form)](https://github.com/Codegenie-BE/laravel-livewire-multistep-form/pulls)

A lightweight, customizable form wizard built with **Laravel Livewire 3** and **Tailwind CSS**. Ideal for onboarding flows, multi-step forms, or split form logic.

🚀 **Live Demo:** [https://laravel-livewire.codegenie.be](https://laravel-livewire.codegenie.be)

## Features

- Multi-step navigation with real-time validation
- Livewire 3 compatible (using `wire:submit`, lifecycle hooks)
- Blade + Tailwind-based layout
- Custom color theming
- Loading indicators per step
- Feature test included (Pest)

## Installation

### For Linux / macOS

```bash
git clone https://github.com/Codegenie-BE/laravel-livewire-multistep-form.git
cd laravel-livewire-multistep-form

composer install
npm install && npm run build

cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```
### For Windows (PowerShell)
```bash
git clone https://github.com/Codegenie-BE/laravel-livewire-multistep-form.git
cd laravel-livewire-multistep-form

composer install
npm install; npm run build

Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File -Path "database/database.sqlite"
php artisan migrate
php artisan serve
```

> Tip: Use only ASCII characters in `.env` for `APP_NAME` (e.g., `LivewireWizard`)

## Usage

Open `http://localhost:8000` in your browser.

## File Overview

```
app/Livewire/MultiStepForm.php               # Livewire logic
resources/views/livewire/multi-step-form.blade.php
resources/views/layouts/app.blade.php
resources/views/home.blade.php
resources/views/thankyou.blade.php
config/ui.php
tests/Feature/Livewire/MultiStepFormTest.php
```

## Run Tests

```bash
./vendor/bin/pest
```

## Why use this package?

Most multi-step wizards are either too bloated or not Livewire 3 compatible.

This package is:
- 🧼 Clean and minimal — no unnecessary dependencies
- 🧠 Built with Laravel conventions
- ⚡ Livewire 3.x ready (including lifecycle, wire:navigate)
- 🎨 Fully customizable via Tailwind

## Contributing

- Fork the repo
- Create a new branch:
  ```bash
  git checkout -b feature/my-feature
  ```
- Commit and push your changes
- Submit a pull request

## License

MIT © Codegenie-BE

🧙‍♂️ Created with passion by [Jordy L’oeuille](https://github.com/Codegenie-BE) — [www.codegenie.be](https://www.codegenie.be)  
💬 Questions or ideas? [Open an issue](https://github.com/Codegenie-BE/laravel-livewire-multistep-form/issues)  
⭐ If you find this useful, give it a star to support the project!