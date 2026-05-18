# Filament Modular Permissions

[![Latest Version on Packagist](https://img.shields.io/packagist/v/abdulrahim/filament-modular-permissions.svg?style=flat-square)](https://packagist.org/packages/abdulrahim/filament-modular-permissions)
[![Total Downloads](https://img.shields.io/packagist/dt/abdulrahim/filament-modular-permissions.svg?style=flat-square)](https://packagist.org/packages/abdulrahim/filament-modular-permissions)
[![License](https://img.shields.io/packagist/l/abdulrahim/filament-modular-permissions.svg?style=flat-square)](https://packagist.org/packages/abdulrahim/filament-modular-permissions)

A professional Laravel package for modular roles and permissions in **Filament v5**. Supporting multi-panel, auto-syncing, and **Global Zero-Config Protection**.

> **Latest Stable Version**: v1.5.5
> **Requirements**: PHP 8.2+, Laravel 11+, Filament 5.x, spatie/laravel-permission ^6|^7

---

[English Documentation](#english-documentation) | [التوثيق العربي](#التوثيق-العربي)

---

<a name="english-documentation"></a>
# English Documentation

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Initial User (Seeding)](#initial-user-seeding)
- [Configuration](#configuration)
  - [Custom Permissions](#custom-permissions)
  - [Excluding Panels](#excluding-panels)
- [Advanced Features](#advanced-features)
  - [Widget Auto-Protection](#widget-auto-protection)
  - [Diagnostics](#diagnostics)
  - [Advanced Concepts](#advanced-concepts)
- [Manual Control](#manual-control)
- [Available Commands](#available-commands)
- [Contact](#contact)

---

## Features

- **Global Zero-Config Shield**: Protect and hide all resources **and widgets** automatically — no traits needed on any file.
- **Smart Sync**: Sync all resources, widgets, and custom permissions with Spatie in one command.
- **Custom Permissions**: Define standalone permissions (e.g. `export_reports`) directly in config.
- **Multi-panel Support**: Publish and manage permissions for each panel independently.
- **Panel Exclusion**: Exclude specific panels from automatic syncing via config; override explicitly with `--panel`.
- **Super Admin Gate**: Automatically grants full access to the `super_admin` role via `Gate::before`.
- **Interactive CLI**: Select your target panel via an interactive CLI menu.
- **Safe Publishing**: Publish commands skip existing files by default; use `--force` to overwrite.
- **Diagnostics**: Inspect any user's roles and permissions with `permissions:check`.
- **Panel User Management**: Pre-configured PanelUserResource with role management and automatic guard-based filtering.
- **Separated Widget Permissions**: Widget permissions appear in a dedicated section in the Role form.
- **Dynamic Resource Labels**: Role permissions sections automatically use the resource's `getNavigationLabel()`.
- **Multi-Panel Isolation**: Resource labels are prioritized by current panel to avoid cross-panel naming conflicts.

## Installation

**Step 1** — Install via Composer:

```bash
composer require abdulrahim/filament-modular-permissions
```

**Step 2** — Register the plugin in your Panel Provider:

```php
use Abdulrahim\FilamentModularPermissions\FilamentModularPermissionsPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentModularPermissionsPlugin::make(),
        ]);
}
```

**Step 3** — Run the installer:

```bash
php artisan permissions:install
```

This command does three things automatically:

1. Publishes the **Role Management** Resource
2. Publishes the **Panel User Management** Resource
3. Syncs all permissions from your Filament panels to the database

Then register both published resources in your Filament panel.

> Or run each step individually if you need more control:
>
> ```bash
> php artisan permissions:publish-role-resource  # Step 1: publish Role Resource
> php artisan permissions:publish-user-resource  # Step 2: publish User Resource
> php artisan permissions:sync                   # Step 3: sync permissions
> ```

> [!IMPORTANT]
> Re-run `php artisan permissions:sync` every time you add a new Resource or Widget to register its permissions in the database.

> [!TIP]
> To publish to a specific panel, or to re-publish and overwrite existing files:
>
> ```bash
> php artisan permissions:install --panel=admin --force
> ```

## Initial User (Seeding)

To create your first Super Admin user, add this to your `DatabaseSeeder.php`:

```php
use App\Models\User;
use Spatie\Permission\Models\Role;

public function run(): void
{
    Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

    $admin = User::firstOrCreate(
        ['email' => 'admin@admin.com'],
        [
            'name' => 'Admin',
            'password' => bcrypt('12345678'),
        ]
    );

    $admin->assignRole('super_admin');
}
```

## Configuration

### Custom Permissions

To add standalone permissions not tied to any resource, define them in your config:

```php
// config/filament-modular-permissions.php
'custom_permissions' => [
    'export_reports',
    'access_api',
    'view_dashboard',
],
```

Then run `php artisan permissions:sync` to register them.

### Excluding Panels from Sync

Exclude specific panels from automatic syncing — useful for API panels, customer portals, or any panel that manages its own permissions separately:

```php
// config/filament-modular-permissions.php
'excluded_panels' => [
    'api',
    'customer_portal',
],
```

Excluded panels are skipped by default; use `--panel` to bypass the exclusion explicitly:

```bash
# Normal sync — skips excluded panels
php artisan permissions:sync

# Force-sync a specific panel (bypasses exclusion)
php artisan permissions:sync --panel=api

# Same via the installer
php artisan permissions:install --panel=api
```

## Advanced Features

### Widget Auto-Protection

Widgets are automatically hidden from users who don't have the required permission — **no trait needed on any widget class**.

The package uses a `Filament::serving()` hook to filter the widget list per-panel before rendering. The permission name follows the pattern `view_{snake_widget_name}`.

Run `php artisan permissions:sync` to register widget permissions, then assign them to roles via the Role form.

In the Role form, widget permissions are displayed in a **dedicated section** below the resource sections, with a wider horizontal layout (4 columns) for easy scanning.

> [!NOTE]
> If you set `auto_hide_resources => false` in config, widget auto-protection is also disabled. You can then use the `HandlesWidgetPermissions` trait manually on each widget.

### Diagnostics

Inspect a user's roles and effective permissions:

```bash
php artisan permissions:check --user=1
php artisan permissions:check --user=1 --guard=admin
```

### Advanced Concepts

#### 1. Multi-Guard Architecture
The package handles multi-panel environments where each panel uses a different Auth Guard. Permissions are always isolated per guard.

#### 2. Intelligent Super Admin
The `super_admin` role is granted full access via a global `Gate::before` check. This hook returns `null` (not `false`) when denying, so your own Policies always remain active.

#### 3. Policy Compatibility
The `Gate::before` hook only intercepts known Filament abilities (`viewAny`, `view`, `create`, `update`, `delete`, etc.) on Eloquent models. All other policy checks are unaffected.

#### 4. Model Instance Support
The gate check handles both class strings (used by `viewAny`/`create`) and model instances (used by `update`/`delete`/`restore`), ensuring all permission types are enforced correctly across all actions.

## Manual Control

Disable the global shield in `config/filament-modular-permissions.php`:

```php
'auto_hide_resources' => false,
```

Then use the traits manually in each Resource or Widget:

```php
use Abdulrahim\FilamentModularPermissions\Traits\HandlesResourcePermissions;
use Abdulrahim\FilamentModularPermissions\Traits\HandlesWidgetPermissions;
```

## Available Commands

| Command | Description |
| :--- | :--- |
| `permissions:install [--panel=] [--force] [--skip-user]` | All-in-one installer (publish + sync) |
| `permissions:sync [--panel=]` | Sync permissions (skips excluded panels unless `--panel` is set) |
| `permissions:publish-role-resource [--panel=] [--force]` | Publish Role Resource files |
| `permissions:publish-user-resource [--panel=] [--force]` | Publish User Resource files |
| `permissions:publish-config [--force]` | Publish the package config file |
| `permissions:publish-lang [--force] [--lang=]` | Publish translation files (optionally one language only) |
| `permissions:check [--user=] [--guard=]` | Diagnose user roles and permissions |

## Contact

Email: [info@abaad.dev](mailto:info@abaad.dev)  
Website: [abaad.dev](https://abaad.dev)

---

<a name="التوثيق-العربي"></a>
# التوثيق العربي

> **آخر إصدار مستقر**: v1.5.5
> **المتطلبات**: PHP 8.2+، Laravel 11+، Filament 5.x، spatie/laravel-permission ^6|^7

## فهرس المحتويات
- [المميزات الرئيسية](#المميزات-الرئيسية)
- [التثبيت](#التثبيت-1)
- [إنشاء المستخدم الأول](#إنشاء-المستخدم-الأول)
- [الإعدادات](#الإعدادات-1)
  - [الصلاحيات المخصصة](#الصلاحيات-المخصصة-1)
  - [استثناء اللوحات](#استثناء-اللوحات)
- [المميزات المتقدمة](#المميزات-المتقدمة-1)
  - [الحماية التلقائية للويدجت](#الحماية-التلقائية-للويدجت-1)
  - [تشخيص الأذونات](#تشخيص-الأذونات-1)
- [التحكم اليدوي](#التحكم-اليدوي-1)
- [الأوامر المتاحة](#الأوامر-المتاحة-1)
- [التواصل](#التواصل-1)

---

## المميزات الرئيسية

- **الحماية الشاملة التلقائية**: حماية المسارات وإخفاء الموارد **والويدجت** من القائمة الجانبية تلقائياً — دون الحاجة لأي Trait.
- **نظام مزامنة ذكي**: أمر واحد لمزامنة جميع الموارد والويدجت والصلاحيات المخصصة.
- **صلاحيات مخصصة**: تعريف صلاحيات مستقلة مثل `export_reports` من الـ config مباشرةً.
- **دعم تعدد اللوحات**: إدارة الصلاحيات لكل لوحة تحكم بشكل مستقل تماماً.
- **استثناء اللوحات**: استثناء لوحات معينة من المزامنة التلقائية مع إمكانية تجاوز الاستثناء بـ `--panel`.
- **السوبر أدمن**: نظام `Gate::before` يعطي كافة الصلاحيات لدور `super_admin` تلقائياً.
- **نشر آمن**: أوامر النشر تتجاوز الملفات الموجودة افتراضياً؛ استخدم `--force` للكتابة فوقها.
- **تشخيص الأذونات**: فحص أدوار وصلاحيات أي مستخدم عبر `permissions:check`.
- **إدارة المستخدمين**: مورد إدارة مستخدمين جاهز مع إمكانية ربط الأدوار.
- **قسم منفصل للويدجت**: صلاحيات الويدجت تُعرض في قسم خاص بها في نموذج إنشاء الأدوار.

## التثبيت

**الخطوة الأولى** — تحميل المكتبة عبر Composer:

```bash
composer require abdulrahim/filament-modular-permissions
```

**الخطوة الثانية** — تسجيل الإضافة في مسببات اللوحة (Panel Provider):

```php
use Abdulrahim\FilamentModularPermissions\FilamentModularPermissionsPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentModularPermissionsPlugin::make(),
        ]);
}
```

**الخطوة الثالثة** — تشغيل المثبت:

```bash
php artisan permissions:install
```

يقوم هذا الأمر بثلاثة أشياء تلقائياً:

1. نشر **واجهة إدارة الأدوار**
2. نشر **واجهة إدارة مستخدمي اللوحة**
3. مزامنة جميع الصلاحيات من لوحات Filament إلى قاعدة البيانات

بعد ذلك، سجّل الـ Resources المنشورة في لوحة Filament الخاصة بك.

> أو نفّذ كل خطوة بشكل منفرد:
>
> ```bash
> php artisan permissions:publish-role-resource  # الخطوة 1: نشر واجهة الأدوار
> php artisan permissions:publish-user-resource  # الخطوة 2: نشر واجهة المستخدمين
> php artisan permissions:sync                   # الخطوة 3: مزامنة الصلاحيات
> ```

> [!IMPORTANT]
> أعد تشغيل `php artisan permissions:sync` في كل مرة تضيف فيها مورداً (Resource) أو ويدجت (Widget) جديداً.

> [!TIP]
> للنشر على لوحة محددة أو لإعادة النشر فوق الملفات الموجودة:
>
> ```bash
> php artisan permissions:install --panel=admin --force
> ```

## إنشاء المستخدم الأول

لإنشاء مستخدم "سوبر أدمن" أول، أضف الكود التالي لملف `DatabaseSeeder.php`:

```php
use App\Models\User;
use Spatie\Permission\Models\Role;

Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

$admin = User::firstOrCreate(['email' => 'admin@admin.com'], [
    'name' => 'Admin',
    'password' => bcrypt('12345678'),
]);

$admin->assignRole('super_admin');
```

## الإعدادات

### الصلاحيات المخصصة

لإضافة صلاحيات مستقلة غير مرتبطة بمورد معين، قم بتعريفها في ملف الإعدادات:

```php
// config/filament-modular-permissions.php
'custom_permissions' => [
    'export_reports',
    'access_api',
],
```

ثم شغّل: `php artisan permissions:sync`

### استثناء اللوحات

مفيد للوحات API أو البوابات الخارجية التي تدير صلاحياتها بشكل مستقل:

```php
// config/filament-modular-permissions.php
'excluded_panels' => [
    'api',
    'customer_portal',
],
```

```bash
# مزامنة عادية — يتخطى اللوحات المستثناة
php artisan permissions:sync

# إجبار مزامنة لوحة محددة (يتجاوز الاستثناء)
php artisan permissions:sync --panel=api

# نفس الشيء عبر المثبت
php artisan permissions:install --panel=api
```

## المميزات المتقدمة

### الحماية التلقائية للويدجت

يتم إخفاء الويدجت تلقائياً عن المستخدمين غير المصرح لهم — **بدون أي Trait** على الويدجت. تعمل الحماية عبر `Filament::serving()` الذي يفلتر قائمة الويدجت لكل لوحة قبل العرض.

اسم الصلاحية: `view_{اسم_الويدجت_بـ_snake_case}` — شغّل `permissions:sync` لتسجيلها.

في نموذج الأدوار، تظهر صلاحيات الويدجت في **قسم منفصل** أسفل صلاحيات الأقسام بتخطيط أفقي (4 أعمدة).

### تشخيص الأذونات

لفحص أدوار وصلاحيات مستخدم معين:

```bash
php artisan permissions:check --user=1
php artisan permissions:check --user=1 --guard=admin
```

## التحكم اليدوي

إذا أردت تعطيل الحماية التلقائية واستخدام الـ Traits يدوياً:

```php
// في ملف config/filament-modular-permissions.php
'auto_hide_resources' => false,

// ثم استخدم الـ Traits في الموارد أو الويدجت
use Abdulrahim\FilamentModularPermissions\Traits\HandlesResourcePermissions;
use Abdulrahim\FilamentModularPermissions\Traits\HandlesWidgetPermissions;
```

## الأوامر المتاحة

| الأمر | الوصف |
| :--- | :--- |
| `permissions:install [--panel=] [--force] [--skip-user]` | المثبت الموحد (نشر + مزامنة) |
| `permissions:sync [--panel=]` | مزامنة الصلاحيات (يتخطى المستثناة ما لم يُحدد `--panel`) |
| `permissions:publish-role-resource [--panel=] [--force]` | نشر ملفات إدارة الأدوار |
| `permissions:publish-user-resource [--panel=] [--force]` | نشر ملفات إدارة المستخدمين |
| `permissions:publish-config [--force]` | نشر ملف الإعدادات (config) |
| `permissions:publish-lang [--force] [--lang=]` | نشر ملفات الترجمة (اختياريًا لغة محددة فقط) |
| `permissions:check [--user=] [--guard=]` | تشخيص أدوار وصلاحيات مستخدم |

## التواصل

البريد الإلكتروني: [info@abaad.dev](mailto:info@abaad.dev)  
الموقع الإلكتروني: [abaad.dev](https://abaad.dev)

## License

MIT License.
