# XSS Shield 🛡️

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kd/xss-shield.svg?style=flat-square)](https://packagist.org/packages/kd/xss-shield)
[![Total Downloads](https://img.shields.io/packagist/dt/kd/xss-shield.svg?style=flat-square)](https://packagist.org/packages/kd/xss-shield)
[![License](https://img.shields.io/packagist/l/kd/xss-shield.svg?style=flat-square)](https://packagist.org/packages/kd/xss-shield)

**XSS Shield** is a premium, high-performance security package designed to protect your Laravel applications from Cross-Site Scripting (XSS) attacks. Unlike other packages, XSS Shield uses a **Zero-Dependency**, custom-built engine optimized for speed and context-aware sanitization.

---

## 🚀 Why XSS Shield?

### 1. 🛡️ Zero External Dependencies (Custom Engine)
We do **NOT** rely on heavy third-party libraries or legacy sanitizers.
- **Lighter**: No bloat added to your `vendor` folder.
- **Faster**: Our custom regex engine is significantly optimized for speed.
- **Secure**: Audited specifically for modern XSS vectors (polyglots, obscure protocols).

### 2. ⚡ Intelligent & Context-Aware
Most filters are "all or nothing". XSS Shield understands context:
- **Strict**: For usernames/fields (No HTML allowed).
- **Moderate**: For comments/bios (Safe HTML like `<b>`, `<i>`, `<img>` allowed).
- **Relaxed**: For CMS/Admin areas (Almost all HTML allowed, scripts blocked).

### 3. 📊 Real-Time Threat Intelligence
Includes a built-in **dashboard** to visualize attacks effectively.
- **Monitor**: See live attack attempts.
- **Analyze**: Identify which IPs and users are targeting you.
- **Block**: Logs the exact malicious payload for forensic analysis.

---

## 🛠️ Installation

```bash
composer require kd/xss-shield
```

Publish the configuration and assets:

```bash
php artisan xss-shield:install
```

---

## � Comprehensive Usage Guide

### 1. Middleware Protection (The "Set & Forget" Method)
Protect your routes automatically. The middleware scans `POST`, `PUT`, `PATCH` requests.

#### Single Route
```php
Route::post('/comment', [CommentController::class, 'store'])
    ->middleware('xss.shield:moderate');
```

#### Route Groups (Recommended)
Apply to entire feature areas with different policies.

```php
// Public Area - Strict Protection (No HTML)
Route::middleware(['xss.shield:strict'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/contact', [ContactController::class, 'send']);
});

// User Area - Moderate Protection (Basic Formatting Allowed)
Route::middleware(['auth', 'xss.shield:moderate'])->group(function () {
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::post('/posts', [PostController::class, 'store']);
});
```

---

### 2. Blade Directives (Safe Output)
Sanitize data right before displaying it.

#### A. `@xss($var)` - Strict Output
Removes **ALL** HTML tags. Use for names, titles, inputs.

```blade
<!-- Input: <script>alert('XSS')</script> John -->
Hello, @xss($user->name)
<!-- Output: alert('XSS') John -->
```

#### B. `@xssHtml($var)` - Safe HTML (Moderate)
Allows safe formatting tags (`<b>`, `<i>`, `<p>`) but strips scripts/iframes.

```blade
<!-- Input: <b>Bold</b> and <script>malicious()</script> -->
<div class="bio">
    @xssHtml($user->bio)
</div>
<!-- Output: <b>Bold</b> and malicious() -->
```

#### C. `@safeHtml($var)` - Trusted HTML (Relaxed)
Allows images, tables, and links. Perfect for detailed content.

```blade
<article>
    @safeHtml($article->content)
</article>
```

---

### 3. Validation Rules
Validate input *before* it hits your controller logic.

```php
use Illuminate\Http\Request;

public function store(Request $request)
{
    $request->validate([
        // Reject if contains XSS (Strict)
        'username' => 'required|string|xss:strict',

        // Clean and allow if safe (Moderate)
        'bio' => 'required|string|xss:moderate',
        
        // Custom policy validation
        'content' => 'required|xss:custom,policy:blog_post',
    ]);
}
```

---

### 4. Manual Usage (Facades & Helpers)
For granular control in your code.

```php
use KD\XssShield\Facades\XssShield;

// Clean a string
$clean = XssShield::clean($input, 'moderate');

// Check if input contains XSS
if (XssShield::detect($input)) {
    abort(403, 'Malicious content detected');
}

// Helper Function
$clean_bio = xss_clean($dirty_bio, 'moderate');
```

---

## 🔒 Content Security Policy (CSP)
XSS Shield automates CSP header management, a critical security layer.

1.  **Enable in Config**: Set `'enabled' => true` in `config/xss-shield.php`.
2.  **Automatic Nonces**: The package generates a unique `nonce` for every request.

**Using Nonces in Blade:**
Allow inline scripts securely by adding the nonce:

```html
<script nonce="{{ csp_nonce() }}">
    var appData = { ... }; // This allowed
</script>

<script>
    alert('blocked'); // This BLOCKED by browser
</script>
```

---

## 📊 Dashboard & Monitoring

Access the dashboard at: `http://your-app.test/xss-shield/dashboard`

### Inspecting Logs
Below the charts is the **Recent Blocked Attacks** table. Click "View All Logs" to see detailed records:

| View | Visible Columns |
| :--- | :--- |
| **Dashboard Overview** | Time, IP Address, Attack Type, **Target URL**, Method |
| **Full Logs View** | Date, IP Address, Attack Type, Method, **Payload Snippet**, User Agent |

> **Note**: Hover over the "Payload Snippet" in the detailed logs to see the full malicious string.

---

## 📘 Cookbook & Advanced Examples

### 1. Protect Logic in Controllers
Sometimes you need to clean data *inside* a controller without middleware.

```php
public function updateProfile(Request $request)
{
    // 1. Clean a specific field
    $cleanBio = xss_clean($request->input('bio'), 'moderate');

    // 2. Check if input is malicious before processing
    if (XssShield::detect($request->input('website'))) {
        return back()->withErrors(['website' => 'Security alert: Malicious content detected.']);
    }

    $user->update(['bio' => $cleanBio]);
}
```

### 2. Handling JSON API Requests
XSS Shield automatically works with JSON bodies. No extra config needed.

**Request:**
```json
POST /api/comments
Content-Type: application/json

{
    "comment": "Nice post! <script>stealCookies()</script>",
    "author_id": 5
}
```

**Result (Moderate Policy):**
The middleware automatically cleans the JSON input before it reaches your controller:
```json
{
    "comment": "Nice post! stealCookies()",
    "author_id": 5
}
```

### 3. Custom Policy for Specific Feature
Add this to your `AppServiceProvider::boot()` method to create a reusable policy for a Forum feature.

```php
// App\Providers\AppServiceProvider.php

public function boot()
{
    app('xss-shield')->registerPolicy('forum_post', [
        'strip_tags' => false,
        'allowed_tags' => ['b', 'i', 'u', 'img', 'blockquote', 'code', 'pre'],
        'allowed_attributes' => [
            'img' => ['src', 'alt', 'width', 'height'],
            'code' => ['class'], // Allow syntax highlighting classes
            'global' => ['style'], // NOT recommended usually, but possible
        ],
        'blocked_tags' => ['script', 'iframe', 'applet'],
    ]);
}
```

**Usage:**
```php
Route::post('/forum/topic', [TopicController::class, 'store'])
    ->middleware('xss.shield:custom,policy:forum_post');
```

---

## ⚙️ Configuration Reference

You can publish the config file with `php artisan vendor:publish --tag=xss-shield-config`.

### 1. Protection Layers & Advanced Vectors
By default, all protection layers are enabled. You can toggle them in `config/xss-shield.php`.

```php
'protection_layers' => [
    'input_sanitization' => true, // Global middleware cleaning
    'pattern_detection' => [
        'enabled' => true,
        'patterns' => 'comprehensive', // 'basic' | 'moderate' | 'comprehensive'
    ],
],

'advanced_vectors' => [
    'svg_xss' => true,       // Block malicious SVG uploads
    'css_injection' => true, // Block malicious CSS (e.g., expression())
    'polyglot_detection' => true, // Detect complex polyglots
],
```
> **Tip**: If you strictly sanitize inputs, you might disable `output_encoding` to rely on Blade's `{{ }}` escaping.

### 2. Exclusions (Webhooks & Passwords)
Prevent the middleware from modifying specific requests.

```php
'excluded_routes' => [
    'api/webhook/*',      // Webhooks need raw payloads
    'admin/settings',     // Trusted admin routes
],

'excluded_keys' => [
    'password',           // Common exclusion
    'password_confirmation',
    'api_key',            // Don't modify API keys
],
```

### 3. Content Security Policy (CSP)
Configure CSP headers to prevent script execution from unauthorized sources.

```php
'csp' => [
    'enabled' => true,
    'directives' => [
        'default-src' => ["'self'"],
        'script-src' => ["'self'", "'nonce'"], // 'nonce' handles inline scripts
        'style-src' => ["'self'", "'nonce'", 'https://fonts.googleapis.com'],
        'img-src' => ["'self'", 'data:', 'https://cdn.example.com'],
    ],
    'auto_nonce' => true, // Automatically generate/inject nonce
],
```

### 4. Logging & Monitoring
Choose how to store attack logs.

```php
'logging' => [
    'enabled' => true,
    'driver' => 'database', // 'database' for Dashboard, 'file' for logs/laravel.log
    'level' => 'all',       // 'critical' (blocked only) or 'all' (all attempts)
    'retention_days' => 90, // Auto-delete old logs
],
```

### 5. Performance Tweaks
Optimize for high-load environments.

```php
'performance' => [
    'cache' => [
        'enabled' => true,  // Caches compiled regex patterns
        'driver' => 'file',
    ],
    'lazy_evaluation' => true, // Only load detectors when attack potential is found
],
```

### 6. Dashboard Customization
Secure and customize the dashboard URL.

```php
'dashboard' => [
    'enabled' => true,
    'route_prefix' => 'security/xss', // Changes: /xss-shield/dashboard -> /security/xss/dashboard
    'middleware' => ['web', 'auth', 'can:manage_security'], // Add custom permissions
],
```

### 7. Custom Policies
Register reusable policies in `AppServiceProvider`.

```php
// config/xss-shield.php (or dynamic)
'policies' => [
    'blog' => [
        'allowed_tags' => ['h1', 'p', 'b', 'i', 'img'],
        'allowed_attributes' => ['img' => ['src', 'alt']],
    ],
],
```

---

## 🧪 Security Benchmarking
We include tools to test your own application.

```bash
# 1. Scan your routes for coverage
php artisan xss-shield:scan-routes

# 2. Benchmark sanitization speed
php artisan xss-shield:benchmark

# 3. Simulate an attack on a specific policy
php artisan xss-shield:test --policy=moderate --payload="<img src=x onerror=alert(1)>"
```

---

## 🛠️ Artisan Commands

XSS Shield includes several commands to help you manage security.

### 1. Test Protection
Simulate attacks to verify your policy settings.
```bash
# Basic test (moderate policy)
php artisan xss-shield:test

# Detailed output showing every payload
php artisan xss-shield:test --detailed

# Test a specific policy
php artisan xss-shield:test --policy=strict
```

### 2. Update Threat Intelligence
Update local threat definitions (clears pattern cache).
```bash
# Update patterns
php artisan xss-shield:update-threats

# Force update even if disabled in config
php artisan xss-shield:update-threats --force
```

### 3. Scan Routes
Find which of your routes are protected and which are vulnerable.
```bash
php artisan xss-shield:scan-routes
```

### 4. Benchmark Performance
Check the speed overhead of the sanitization engine.
```bash
php artisan xss-shield:benchmark
```

---

## 📄 License
The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Developed with ❤️ by **KD**.
