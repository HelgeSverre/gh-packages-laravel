# Laravel UI Lockout

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-10%20%7C%2011%20%7C%2012-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-blue.svg)](https://php.net)

## Project Description

A simple Laravel package that shows a lockout screen to block users from accessing your app. Built specifically to help agencies and developers manage clients who haven't paid their invoices - preventing them from using the app until payment is complete.

**Works only with Laravel 10.x upto latest** 

## ads 
[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=sticknologic/laravel-ui-lockout@github)](https://gitads.dev/v1/ad-track?source=sticknologic/laravel-ui-lockout@github)


## Project Use Cases

This package is perfect for:

**Main Purpose:** Stop clients who haven't paid from accessing the source code or using your Laravel application.

- **Subscription Expired** - Block access when a client's subscription ends
- **Trial Period Ended** - Lock the app after the free trial finishes  
- **Maintenance Mode** - Show a custom maintenance page during updates
- **Protect Sensitive Data** - Use gibberish mode to completely obscure confidential information


## How to Use

### Basic Usage

**1. Install the package**

```bash
composer require sticknologic/laravel-ui-lockout
```

**2. Publish the config file** (optional)

```bash
php artisan vendor:publish --tag=ui-lockout-config
```

**3. Wrap your content with the component**

```blade
<x-snl-ui-lockout expires-at="2026-12-31">
    {{-- Your main app content goes here --}}
    <div class="container">
        <h1>Welcome to Your App</h1>
        <p>This content shows normally until the expiration date.</p>
    </div>
</x-snl-ui-lockout>
```

That's it! Your content shows normally until the expiration date, then the lockout screen takes over.

---

### Configuration Reference

All available configuration options in `config/ui-lockout.php`:

```php
<?php

return [
    // Default expiration date (YYYY-MM-DD format)
    'expires_at' => '2026-12-31',
    
    // Expiration type: 'normal' or 'progressive'
    'default_expiration_type' => 'progressive',
    
    // Number of days for progressive fade-in
    'progressive_days' => 7,
    
    // Display mode: 'blur' or 'solid'
    'default_mode' => 'blur',
    
    // Enable gibberish mode globally
    'is_gibberish' => false,
    
    // Custom component tag name (use 'lockout' instead of 'snl-ui-lockout')
    'component_tag' => 'snl-ui-lockout',
    
    // Custom lockout screen view
    'custom_view' => null,
    
    // Lockout screen title
    'title' => 'Access Restricted',
    
    // Lockout screen message
    'message' => 'Your subscription has expired. Please contact support.',
    
    // API configuration for dynamic messages
    'enable_api' => false,
    'api_url' => null,
    'api_timeout' => 5,        // seconds
    'api_retries' => 2,
    'cache_duration' => 600,   // seconds (10 minutes)
];
```

---

### Advanced Usage

#### 1. Progressive Lockout (Gradual Fade-In)

Show the lockout message gradually as the deadline approaches.

**Component Attribute:**

```blade
<x-snl-ui-lockout 
    expires-at="2026-03-01" 
    type="progressive"
>
    {{-- Your main content --}}
    <div class="app-content">
        <h1>Your Application</h1>
        <p>Regular content here...</p>
    </div>
</x-snl-ui-lockout>
```

**How it works:** 
- **7+ days before:** Content displays normally (0% lockout overlay)
- **7 days before:** Lockout overlay starts fading in
- **Each day:** Overlay becomes more visible
- **Expiration date:** Lockout fully blocks access (100% opacity)

**Config:** Set `progressive_days` in your config file (see [Configuration Reference](#configuration-reference)).

#### 2. Display Modes

Choose between two visual styles.

**Component Attributes:**

*Blur Mode (Default)*

```blade
<x-snl-ui-lockout expires-at="2026-12-31" mode="blur">
    <div>Your content</div>
</x-snl-ui-lockout>
```

Shows a blurred backdrop with a centered card containing the lockout message.

*Solid Mode*

```blade
<x-snl-ui-lockout expires-at="2026-12-31" mode="solid">
    <div>Your content</div>
</x-snl-ui-lockout>
```

Shows a solid color background covering the entire screen.

**Config:** Set `default_mode` to `'blur'` or `'solid'` (see [Configuration Reference](#configuration-reference)).

#### 3. Gibberish Mode (Content Obfuscation)

Convert background content into gibberish to completely obscure sensitive information.

**Component Attribute:**

```blade
<x-snl-ui-lockout 
    expires-at="2026-12-31" 
    is-gibberish="true"
>
    <div>Your sensitive content</div>
</x-snl-ui-lockout>
```

**How it works:**
- Replaces all text content with random characters
- Maintains exact length and spacing for visual consistency
- Preserves HTML structure and tags
- Useful for protecting sensitive data even in blur mode

**Config:** Set `is_gibberish` to `true` to enable globally (see [Configuration Reference](#configuration-reference)).

#### 4. Custom Title and Message

Customize the lockout screen title and message by setting `title` and `message` in your config file (see [Configuration Reference](#configuration-reference)).

**Note:** Title and message cannot be set per component instance - only globally via config.

#### 5. Using API for Dynamic Messages

Fetch lockout messages from your API for real-time updates.

**Step 1: Set up your API endpoint**

Your API should return JSON with a `message` field:

```json
{
    "message": "Payment overdue. Please update your billing information."
}
```

**Step 2: Configure the API**

Set the API configuration options in your config file: `enable_api`, `api_url`, `api_timeout`, `api_retries`, and `cache_duration` (see [Configuration Reference](#configuration-reference)).

The message is cached to prevent excessive API calls. If the API fails, the fallback message is shown.

#### 6. Customize the Component Tag Name

Change `<x-snl-ui-lockout>` to something shorter by setting `component_tag` in your config file (see [Configuration Reference](#configuration-reference)).

**Component Usage:**

```blade
<x-lockout expires-at="2026-12-31">
    <div>Your content</div>
</x-lockout>
```

#### 7. Custom Lockout Screen Design

Create a custom Blade view:

```blade
{{-- resources/views/lockout/custom.blade.php --}}
<div style="text-align:center; padding:3rem;">
    <h1 style="color:#dc2626; font-size:3rem;">🔒 Access Denied</h1>
    <p style="font-size:1.2rem; margin-top:1rem;">{{ $message }}</p>
    @if($title)
        <p>{{ $title }}</p>
    @endif
</div>
```

**Component Attribute:**

```blade
<x-snl-ui-lockout expires-at="2026-12-31" custom-view="lockout.custom">
    <div>Your content</div>
</x-snl-ui-lockout>
```

**Note:** Use `custom-view` (with hyphen) in the component tag.

**Config:** Set `custom_view` to your view path to use it globally (see [Configuration Reference](#configuration-reference)).

**Example with gibberish content:**

```blade
{{-- resources/views/lockout/with-gibberish.blade.php --}}
<div class="lockout-overlay">
    <div class="message-card">
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
    </div>
    @if($isGibberish)
        <div class="gibberish-background">
            {{ $htmlToGibberish($slot) }}
        </div>
    @else
        <div class="blurred-background">
            {{ $slot }}
        </div>
    @endif
</div>
```

**Available variables in custom views:**

All of these variables are accessible in your custom view:

**Properties:**
- `$message` (string) - The lockout message from config
- `$title` (?string) - The lockout title from config, may be null
- `$opacity` (float) - Current opacity value (0.0 to 1.0), useful for progressive mode styling
- `$expiresAt` (?string) - The expiration date string (e.g., '2026-12-31'), may be null
- `$isExpired` (bool) - Whether the lockout has expired (true if currently locked)
- `$expirationType` (string) - Either `'normal'` or `'progressive'`
- `$mode` (string) - Display mode, either `'blur'` or `'solid'`
- `$isGibberish` (bool) - Whether gibberish mode is enabled
- `$slot` - The wrapped content (only visible when not locked)

**Methods:**
- `$shouldDisplay()` (bool) - Returns true if the lockout overlay should be displayed
- `$getLockoutMessage()` (?string) - Fetches message from API if configured, otherwise returns fallback
- `$htmlToGibberish($html)` (HtmlString) - Converts HTML text content to gibberish while preserving structure (returns safe HTML, use with `{{ }}` not `{!! !!}`)

#### 8. Component Attributes Reference

All available component attributes:

```blade
<x-snl-ui-lockout 
    expires-at="2026-12-31"    {{-- Expiration date (YYYY-MM-DD) --}}
    type="progressive"          {{-- 'normal' or 'progressive' --}}
    mode="blur"                 {{-- 'blur' or 'solid' --}}
    is-gibberish="true"         {{-- Enable content obfuscation --}}
    id="main-lockout"           {{-- Custom ID for wrapper div --}}
    class="custom-wrapper"      {{-- Custom CSS classes --}}
    customview="lockout.custom" {{-- Custom view path (no hyphen!) --}}
>
    <div>Your content</div>
</x-snl-ui-lockout>
```

**Security Notes:**
- `id` and `class` values are sanitized to prevent XSS attacks
- `customview` paths are validated to prevent path traversal attacks
- All attributes are optional and fall back to config values

**Attribute Details:**
- `expires-at`: Expiration date for the lockout
- `type`: Controls expiration behavior (immediate vs gradual)
- `mode`: Visual presentation style
- `is-gibberish`: Converts content to random characters for added security
- `id`: Must be alphanumeric with hyphens only
- `class`: CSS classes for the wrapper div
- `customview`: Blade view path (validated for security)

#### 9. Global Configuration

Set default values globally using the configuration file (see [Configuration Reference](#configuration-reference)).

With global configuration set, you can use the component without attributes:

```blade
<x-snl-ui-lockout>
    <div>Your content</div>
</x-snl-ui-lockout>
```

## Contributing

Want to help improve this package?

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

We welcome all contributions - bug fixes, new features, or documentation improvements!

## Who's Using This Package?

Are you using Laravel UI Lockout in your project? **We'd love to showcase your work!**

If you're using this package in your application or website, feel free to add it to the list below by creating a pull request.

**Format:**
```markdown
- [Your App/Website Name](https://your-website.com) - Brief description of your project
```

**Current Users:**
- [STICKnoLOGIC](https://sticknologic.is-a.dev) - Developer tools and solutions provider
- *Add your project here by creating a pull request!*

## Security

Found a security issue? Please **do not** open a public issue.

Email security concerns to: **johnaerial.azcune@sticknologic.is-a.dev**

For more details, see [SECURITY.md](SECURITY.md)

## Maintainer

**John Aerial J. Azcune**  
Email: johnaerial.azcune@sticknologic.is-a.dev  
Website: https://sticknologic.is-a.dev

## License

This package is open-source software licensed under the [MIT License](LICENSE).
<!-- GitAds-Verify: 9V2BN5V58N9HPQLZSJCT3HRCEPI2FTOS -->