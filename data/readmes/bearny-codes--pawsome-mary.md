## 🐻 What is Pawsome Mary?

Developing with Laravel should feel like a walk in the woods—refreshing, powerful, and natural. **Pawsome Mary** is a curated starter kit designed by **BearnyCodes** to bridge the gap between raw functionality and high-end developer experience.

By combining the strength of **Laravel** with the elegance of **MaryUI** and the cutting-edge speed of **Tailwind CSS 4**, this kit provides a "bear-bones" foundation that isn't empty, but expertly structured.

### Why you'll love it:
* **Pawsome DX:** Pre-configured layouts that stay out of your way.
* **Grizzly Performance:** Optimized for the latest PHP 8.3+ and Livewire versions.
* **Modern Styling:** Harnessing the full power of Tailwind 4's CSS-first engine.
* **Bearny-Standard:** Opinionated where it matters, flexible where you need it.
*

# Installation
## Command Line
```bash
# using the laravel installer
laravel new my_app --using=bearny-codes/pawsome-mary

# using composer
composer create-project bearny-codes/pawsome-mary my_app

#final setup steps
cd my_app
npm run build

php artisan db:seed
```

## Clone repository manually
```bash
#clone the repository
https://github.com/bearny-codes/pawsome-mary.git

#change into the project folder
cd pawsome-mary

##prepare it for your own git repository
rm -rf ./.git && git init && git add . && git commit -m 'initial commit'

##create the .env file and modify it if necessary.
cp ./.env.example .env

# setup the project
composer install && npm install && npm run build

# setup an encryption key
php artisan key:generate

#initialize the database
php artisan migrate --seed

```

##Things you may want to adjust


```bash
.env
```
In this file you need to adjust the APP_URL if yxou want to work with passkeys. You may also want to adjust the APP_NAME

```bash
app/database/seeders/PermissionAndRoleSeeder.php
```
You may want to add the permissiosn and roles you Project needs in this file before seeding the database


```bash
app/View/Components/AppBrand.php
```
In this file you can define your Applicaiton Logo

# External Libraries
- MaryUI - https://mary-ui.com
- Livewire Toaster - https://github.com/masmerise/livewire-toaster
- laravel-permissions - https://spatie.be/docs/laravel-permission/v6/introduction
- laravel-passskeys - https://spatie.be/docs/laravel-passkeys/v1/introduction

# Environment Variables

## Toaster / Notifications

- BEARNY_TOASTER_ALIGNMENT: The vertical alignment of the toast container. Supported: "bottom", "middle" or "top", Default: "top"
- BEARNY_TOASTER_CLOSEABLE: Allow users to close toast messages prematurely. Supported: true | false, Default: true
- BEARNY_TOASTER_DURATION: The on-screen duration of each toast. Minimum: 3000 (in milliseconds)
- BEARNY_TOASTER_POSITION: The horizontal position of each toast. Supported: "center", "left" or "right", Default 'right'
- BEARNY_TOASTER_REPLACE: New toasts immediately replace similar ones, ensuring only one toast of a kind is visible at any time. Takes precedence over the "suppress" option. Supported: true | false, Default: false
- BEARNY_TOASTER_SUPPRESS: Prevent the display of duplicate toast messages. Supported: true | false, Default; false
- BEARNY_TOASTER_TRANSLATE: Whether messages passed as translation keys should be translated automatically. Supported: true | false, Default: true

# Support
## I need help
Leave an issue describing the problem as detailed as possible at https://github.com/bearny-codes/pawsome-mary/issues and we try to look into it as quickly as possible.

## Can I support you?
We are not a huge software studio with big budgets but (currently) just a single developer passionate about technology, AI and Laravel. If you like the work and want to help him stay awake at night to work on more, [buy him a coffee](https://buymeacoffee.com/bearny.codes) or give us a star on Github.
