# Laravel Social Share

Smart Open Graph & multi-platform social sharing engine for Laravel.

Automatically generates optimized Open Graph (OG) metadata and provides ready-to-use share links for Facebook, X (Twitter), WhatsApp, and LinkedIn.

---

## ✨ Features

- ✅ Automatic Open Graph meta generation
- ✅ Zero-configuration setup (works out of the box)
- ✅ Multi-platform sharing (Facebook, X, WhatsApp, LinkedIn)
- ✅ Smart fallback system (no broken previews)
- ✅ Clean, extensible architecture (DTO + Generators + Engines)

---

## 📦 Installation

Install via Composer:

```bash
composer require peal/laravel-social-share
```

Laravel will auto-discover the package.

---

## ⚙️ Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=social-share
```

This creates:

```bash
config/social-share.php
```

---

## 🚀 Basic Usage

### 1. Add Open Graph Meta (Blade)

Inside your main layout `<head>`:

```blade
@include('social-share::meta', ['share' => $share ?? null])
```

---

### 2. Use in Controller

```php
use Share;

public function show(Product $product)
{
    $share = Share::for($product);

    return view('product.show', compact('product', 'share'));
}
```

---

### 3. Add Share Buttons

```blade
<a href="{{ Share::facebook(url()->current()) }}" target="_blank">Facebook</a>

<a href="{{ Share::twitter(url()->current(), $product->name) }}" target="_blank">X</a>

<a href="{{ Share::whatsapp(url()->current(), $product->name) }}" target="_blank">WhatsApp</a>

<a href="{{ Share::linkedin(url()->current()) }}" target="_blank">LinkedIn</a>
```

---

## 🔥 Zero Configuration Mode (Auto OG Injection)

If enabled, the package can automatically inject meta tags.

### Add Middleware

In `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'web' => [
        \Peal\SocialShare\Middleware\AutoShareMetaMiddleware::class,
    ],
];
```

👉 Now **no Blade or controller changes required**

---

## 🧠 How It Works

The package automatically:

1. Detects page context
2. Generates share data:
   - title
   - description
   - image
   - URL

3. Injects Open Graph tags
4. Provides share URLs

---

## ⚙️ Configuration

```php
return [
    'default_image' => '/default-share.png',
];
```

---

## 🛒 Example: Product Share

```php
$share = Share::for($product);
```

Auto generates:

- Product name → title
- Description → trimmed
- Image → primary image
- URL → product page

---

## 🧩 Extending (Custom Generator)

Create your own generator:

```php
class BlogShareGenerator implements ShareGenerator
{
    public function generate($post): ShareData
    {
        return ShareData::make([
            'title' => $post->title,
            'description' => $post->excerpt,
            'image' => $post->image,
            'url' => route('blog.show', $post->slug),
        ]);
    }
}
```

---

## 🌍 Supported Platforms

- Facebook
- X (Twitter)
- WhatsApp
- LinkedIn

---

## ⚠️ Important Notes

- Facebook uses Open Graph tags only
- Content preview is cached by Facebook
- Use Facebook Debugger to refresh cache

---

## 🚀 Laravel (Inertial, vue, react ect.)

```php
use Share;
use Inertia\Inertia;

public function show(Product $product)
{
    $share = Share::for($product);

    return Inertia::render('Product/Show', [
        'product' => $product,
        'share' => $share,
    ]);
}
```

```REACTJS(Inertial)
import { Head } from '@inertiajs/react'

export default function Show({ product, share }) {
  return (
    <>
      <Head>
        <title>{share.title}</title>

        <meta property="og:title" content={share.title} />
        <meta property="og:description" content={share.description} />
        <meta property="og:image" content={share.image} />
        <meta property="og:url" content={share.url} />
        <meta property="og:type" content="website" />
      </Head>

      <h1>{product.name}</h1>

      {/* Share buttons */}
      <a href={`/share/facebook?url=${share.url}`}>Facebook</a>
    </>
  )
}
```

```VUE(Inertial)
<script setup>
import { Head } from '@inertiajs/vue3'

defineProps({
  product: Object,
  share: Object
})
</script>

<template>
  <Head>
    <title>{{ share.title }}</title>

    <meta property="og:title" :content="share.title" />
    <meta property="og:description" :content="share.description" />
    <meta property="og:image" :content="share.image" />
    <meta property="og:url" :content="share.url" />
    <meta property="og:type" content="website" />
  </Head>

  <h1>{{ product.name }}</h1>
</template>
```

<a href={`https://www.facebook.com/sharer/sharer.php?u=${share.url}`} target="\_blank">
Facebook
</a>

<a href={`https://twitter.com/intent/tweet?url=${share.url}&text=${share.title}`}>
X
</a>

<a href={`https://wa.me/?text=${share.title} ${share.url}`}>
WhatsApp
</a>

<a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share.url}`}>
LinkedIn
</a>

```Share Buttons (Multi-platform)

```

## 🧪 Testing

```bash
composer test
```

---

## 🤝 Contributing

Pull requests are welcome.

---

## 📄 License

MIT License
