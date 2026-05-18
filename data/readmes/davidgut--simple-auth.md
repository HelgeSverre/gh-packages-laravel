# Simple Auth for Laravel

A flexible, drop-in authentication package for Laravel applications, featuring Magic Links and standard Password authentication. No JavaScript required.

## Features

- **Magic Link Authentication**: Secure, passwordless login via email.
- **Password Authentication**: Traditional email/password flow with Forgot Password functionality.
- **Security First**: Rate limiting, timing attack protection, and secure URL signing.
- **Agnostic Views**: Clean, unstyled Blade views (Tailwind-ready classes) that inherit your app's design.
- **Internationalization**: Fully translatable UI strings.
- **Configurable**: Extensive configuration for methods, redirects, and user models.

## Installation

```bash
composer require davidgut/simple-auth
```

### Configuration

To customize `config/simple-auth.php`, publish the configuration file:

```bash
php artisan vendor:publish --tag="simple-auth-config"
```

### Views

To customize the login and signup pages, publish the views:

```bash
php artisan vendor:publish --tag="simple-auth-views"
```

### Translations

To customize the text strings, publish the language files:

```bash
php artisan vendor:publish --tag="simple-auth-lang"
```

### Assets

To ensure the login pages are styled correctly, publish the package assets (compiled Tailwind CSS):

```bash
php artisan vendor:publish --tag="simple-auth-assets"
```

### Auth Methods

### Environment Variables

You can configure the package by adding the following variables to your `.env` file:

```env
SIMPLE_AUTH_DEFAULT_METHOD=password
SIMPLE_AUTH_MAGIC_LINK_ENABLED=true
SIMPLE_AUTH_MAGIC_LINK_TTL=15
SIMPLE_AUTH_PASSWORD_ENABLED=true
SIMPLE_AUTH_REDIRECT_AFTER_LOGIN=/
SIMPLE_AUTH_REDIRECT_AFTER_LOGOUT=/
```

## Usage

### Routes

The package registers the following routes automatically:

- `GET /login` - Login page
- `POST /login/{method}` - Process login
- `GET /signup` - Signup page
- `POST /signup` - Process signup
- `POST /logout` - Logout
- `GET /forgot-password` - Request password reset link
- `POST /forgot-password` - Send password reset link
- `GET /reset-password/{token}` - Reset password form
- `POST /reset-password` - Update password

### Views

The views are available at `resources/views/vendor/simple-auth` after publishing. They use standard Tailwind CSS classes and link to the published `simple-auth.css`.

### Translations

All text strings are translatable. After publishing, you can find them in `resources/lang/vendor/simple-auth`.

## Testing

Run the test suite:

```bash
./vendor/bin/pest
```

## License

The MIT License (MIT).
