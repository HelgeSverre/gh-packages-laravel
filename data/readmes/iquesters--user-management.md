# Laravel User Management Package – Iquesters <img src="https://avatars.githubusercontent.com/u/7593318?s=200&v=4" alt="Iquesters Logo" width="40" style="vertical-align: middle;"/>

A robust and reusable **User Management package** for Laravel applications, developed and maintained by **[Iquesters](https://github.com/iquesters)**.

This package provides authentication, role management, Google OAuth integration, and reCAPTCHA support. It also comes with configurable layouts, logos, and default behaviors for new users.

---

## ⚙️ Purpose

The **User Management Package** helps Laravel applications:

* Handle authentication and user roles
* Integrate Google login and One Tap authentication
* Customize login/register views with your own layout and branding
* Protect forms with reCAPTCHA
* Set default routes and roles for new users

It acts as a **foundation for secure and modular user handling**, which can be extended or used by other Iquesters packages.

---

## 🚀 Installation

1. Install the package using Composer:

```bash
composer require iquesters/user-management
```

2. Run migrations to create required database tables:

```bash
php artisan migrate
```

3. Seed:

```bash
php artisan user-management:seed
```

---

## 🔧 Configuration

The configuration file is published at `config/user-management.php`. You can override settings via this file or using `.env` variables.

### Layouts

Control which Blade templates are used for auth pages and the main app:

```env
USER_MANAGEMENT_AUTH_LAYOUT=usermanagement::layouts.package
USER_MANAGEMENT_APP_LAYOUT=usermanagement::layouts.app
```

* `layout_auth` → Layout used for login/register pages
* `layout_app` → Layout used for the main application

---

### Logo

Set your application logo for auth pages:

```env
USER_MANAGEMENT_LOGO=/images/logo.png
```

You can use:

* Full URL: `https://example.com/logo.png`
* Absolute path: `/images/logo.png`
* Package asset: `img/logo.png`
* Package namespace: `usermanagement::img.logo.png`

---

### reCAPTCHA

Protect your forms using Google reCAPTCHA:

```env
USER_MANAGEMENT_RECAPTCHA_SITE_KEY=your-site-key
USER_MANAGEMENT_RECAPTCHA_SECRET_KEY=your-secret-key
```

---

### Google OAuth

Enable Google login or One Tap authentication:

```env
USER_MANAGEMENT_GOOGLE_CLIENT_ID=your-client-id
USER_MANAGEMENT_GOOGLE_CLIENT_SECRET=your-client-secret
USER_MANAGEMENT_GOOGLE_REDIRECT_URI=https://your-app.com/auth/google/callback
```

---

### Default Auth Behavior

Set default redirect routes and new user roles:

```env
USER_MANAGEMENT_DEFAULT_AUTH_ROUTE=dashboard
USER_MANAGEMENT_DEFAULT_USER_ROLE=user
```

* `default_auth_route` → The route where users are redirected after login
* `default_user_role` → Default role for new users registering via Google OAuth

---
