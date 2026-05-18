# Nicxon SEO
**A professional, Yoast-like SEO toolkit for Laravel.**

Developed by **Robert Nicjoo** ([dev@nicxonsolutions.com](mailto:dev@nicxonsolutions.com)) at [PT. Nicxon International Solutions](https://nicxonsolutions.com)

---

## 🚀 Installation

### 1. Require the Package

Run the following commands in your terminal from the root of your Laravel project:

```bash
composer require nicxonsolutions/nicxon-seo
php artisan migrate
php artisan storage:link
```

### 2. Publish Configuration (Optional)

To customize the route middlewares (e.g., adding admin-only access), publish the config file:

```bash
php artisan vendor:publish --tag=nicxon-config
```

Then, edit `config/nicxon-seo.php` to add your own middlewares (e.g., `admin`, `permission:manage-seo`).


## 🛠 Usage

### 1. Prepare your Models

Add the `HasNicxonSeo` trait to any model you want to have SEO capabilities (e.g., Post, Page, Product).

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Nicxon\Seo\Traits\HasNicxonSeo;

class Post extends Model
{
    use HasNicxonSeo;
}
```

### 2. Global SEO Settings

Nicxon SEO comes with a built-in management panel for your website's main SEO (Home page fallback and site-wide defaults). You can access it at:

`YOUR_URL/admin/seo`

This is where you set the default meta title, description, and social sharing image that will be used when no specific model data is available.


### 3. Display the Form Fields

Include the Nicxon SEO component inside your admin create/edit forms. **Note:** Ensure your form has `enctype="multipart/form-data"` to support image uploads.

```html
<form action="{{ route('posts.store') }}" method="POST" enctype="multipart/form-data">
    @csrf
    
    <input type="text" name="title" value="{{ $post->title ?? '' }}">

    @include('nicxon-seo::form-fields', ['model' => $post ?? null])

    <button type="submit">Save Post</button>
</form>
```

### 4. Handle the Controller Logic

Save the SEO metadata using the provided `updateSeo` helper method.

```php
public function store(Request $request)
{
    // 1. Create/Update your primary model
    $post = Post::create($request->all());

    // 2. Handle Social Image Upload
    $imgPath = null;
    if ($request->hasFile('nicxon_og_image')) {
        $imgPath = $request->file('nicxon_og_image')->store('seo', 'public');
    }

    // 3. Save SEO Metadata via the Nicxon Trait
    $post->updateSeo([
        'nicxon_seo_title'       => $request->nicxon_seo_title,
        'nicxon_seo_description' => $request->nicxon_seo_description,
        'nicxon_og_image'        => $imgPath
    ]);

    return redirect()->back()->with('success', 'Post and SEO data saved!');
}
```

### 5. Frontend Integration (Zero-Config)

Add the `@nicxonSeo` directive to the `<head>` of your `app.blade.php` layout. It automatically detects if a model (like `$post`, `$page`, or `$product`) is present in the current view. If no model is found, it intelligently falls back to your Global SEO settings.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        @nicxonSeo
    </head>
    <body>
        @yield('content')
    </body>
</html>
```

**Note on Title Suffix:** You can customize how your brand appears across all sub-pages (e.g., `Post Title | YourBrand`) by modifying the `title_suffix` in your `config/nicxon-seo.php`.


### 💻 Console Commands

Monitor your SEO health directly from the terminal with the built-in stats command:

```bash
php artisan nicxon:seo-stats
```

This command provides a summary of how many models are optimized and whether your Global SEO settings are configured correctly.


---

## ✨ Features

- **Zero-Configuration:** Simply drop @nicxonSeo in your head. It intelligently detects content models or uses Global defaults.
- **Global SEO Panel:** Dedicated interface at /admin/seo to manage site-wide titles, descriptions, and share images.
- **Polymorphic Storage:** One centralized table handles SEO for all models without modifying your existing database schema.
- **Real-time Preview:** Live Google search snippet preview with dynamic "Traffic Light" feedback.
- **SEO Scoring:** Visual indicators (Green/Yellow/Red) based on industry-standard character lengths.
- **Social Ready:** Automatic generation of OpenGraph (OG) tags and Twitter Cards.
- **Pro-Grade Rendering Engine:**
    - **XSS Protection:** All metadata is automatically escaped using Laravel's `e()` helper to prevent Cross-Site Scripting.
    - **HTML Integrity:** Special characters (like `"`, `&`, and `<`) are converted to HTML entities, ensuring meta tags never break your layout.
    - **Crawler Reliability:** Standardized rendering ensures your site is perfectly readable by Googlebot, Facebook, and Twitter scrapers.


## 📄 License

Created by PT. Nicxon International Solutions. All rights reserved.