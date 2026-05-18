# Ceniver Laravel Blog

API-driven multi-language blog package for Laravel with full SEO support.

Master Panel (BlogPanel) uzerinden makale, kategori ve SEO yonetimi yapilir.
Bu paket, slave (alt) sitelere kurulur ve master panelden gelen verileri otomatik olarak isler.

## Kurulum

```bash
composer require ceniver/laravel-blog
```

```bash
php artisan blog:install
```

Wizard sizden su bilgileri isteyecektir:
- **Master Panel URL** - BlogPanel adresiniz (ornek: `https://panel.example.com`)
- **API Key** - Master panelden alinan API anahtari
- **Varsayilan dil** - Site dili (ornek: `tr`, `en`)

Kurulum otomatik olarak:
- `.env` dosyasini gunceller
- Config dosyasini yayinlar
- Migration'lari calistirir
- Storage link olusturur

## Manuel Kurulum

```bash
# Config yayinla
php artisan vendor:publish --tag=blog-config

# .env'ye ekle
BLOG_MASTER_URL=https://panel.example.com
BLOG_MASTER_API_KEY=your-api-key-here
BLOG_DEFAULT_LOCALE=tr

# Migration
php artisan migrate
```

---

## HeadBuilder - Otomatik SEO Head Olusturucu

Blog sayfalari (liste, kategori, makale) otomatik olarak SEO meta tag'lari
olusturur. Ancak **kendi ozel sayfalariniz** (ana sayfa, hakkimizda, iletisim vb.)
icin de ayni sistemi kullanabilirsiniz.

### Nasil Calisir?

1. **Master Panel** uzerinden her sayfa tipi icin SEO sablonlari tanimlanir
2. `HeadBuilder` servisi bu sablonlari okur ve degiskenleri doldurur
3. Sonuc olarak `<head>` icine yazilacak HTML uretir (title, meta, OG, Twitter, Schema.org, GA4 vb.)

### Sayfa Tiplerini Tanimlama

`config/blog.php` dosyasinda `pages` dizisine yeni sayfa tipleri ekleyin:

```php
'pages' => [
    // Paket ile gelen varsayilanlar
    [
        'page_type' => 'homepage',
        'name'      => 'Ana Sayfa',
        'variables' => ['{site_name}', '{locale}'],
    ],
    [
        'page_type' => 'blog_index',
        'name'      => 'Blog Listesi',
        'variables' => ['{site_name}', '{locale}'],
    ],
    [
        'page_type' => 'blog_category',
        'name'      => 'Kategori Sayfasi',
        'variables' => ['{site_name}', '{category}', '{locale}'],
    ],
    [
        'page_type' => 'blog_article',
        'name'      => 'Makale Detay',
        'variables' => ['{site_name}', '{title}', '{excerpt}', '{locale}'],
    ],

    // Kendi ozel sayfalariniz
    [
        'page_type' => 'about',
        'name'      => 'Hakkimizda',
        'variables' => ['{site_name}', '{locale}'],
    ],
    [
        'page_type' => 'contact',
        'name'      => 'Iletisim',
        'variables' => ['{site_name}', '{locale}'],
    ],
    [
        'page_type' => 'product_detail',
        'name'      => 'Urun Detay',
        'variables' => ['{site_name}', '{product_name}', '{price}', '{locale}'],
    ],
],
```

Bu sayfa tipleri master panelde gorunur ve her biri icin ayri SEO sablonu tanimlanabilir.

> **Not:** `page_type` benzersiz bir anahtar olmalidir. `variables` dizisindeki
> degiskenler, master paneldeki sablon alanlarinda `{site_name}`, `{product_name}`
> gibi yer tutucu olarak kullanilir.

---

### Controller'da Kullanim

`HeadBuilder` singleton olarak kayitlidir. Dependency injection ile kullanabilirsiniz:

```php
<?php

namespace App\Http\Controllers;

use Ceniver\Blog\Services\HeadBuilder;
use Ceniver\Blog\Services\SeoService;

class HomeController extends Controller
{
    public function __construct(
        private HeadBuilder $head,
        private SeoService  $seo,
    ) {}

    public function index()
    {
        $locale = app()->getLocale(); // veya 'tr'

        $headHtml = $this->head->render('homepage', $locale, [
            'site_name' => $this->seo->siteName(),
            'locale'    => $locale,
        ]);

        return view('home', compact('headHtml'));
    }
}
```

### Blade Layout'ta Kullanim

```html
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- HeadBuilder ciktisi: title, meta, OG, Twitter, Schema.org, GA4 --}}
    {!! $headHtml !!}

    {{-- Kendi CSS/JS dosyalariniz --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    @yield('content')
</body>
</html>
```

---

### Detayli Ornekler

#### 1. Ana Sayfa (Homepage)

```php
// app/Http/Controllers/HomeController.php

public function index()
{
    $headHtml = $this->head->render('homepage', 'tr', [
        'site_name' => $this->seo->siteName(),
        'locale'    => 'tr',
    ]);

    return view('home', compact('headHtml'));
}
```

#### 2. Urun Detay Sayfasi

```php
// app/Http/Controllers/ProductController.php

use Ceniver\Blog\Services\HeadBuilder;
use Ceniver\Blog\Services\SeoService;

class ProductController extends Controller
{
    public function __construct(
        private HeadBuilder $head,
        private SeoService  $seo,
    ) {}

    public function show(string $locale, Product $product)
    {
        $headHtml = $this->head->render('product_detail', $locale, [
            'site_name'    => $this->seo->siteName(),
            'product_name' => $product->name,
            'price'        => $product->formatted_price,
            'locale'       => $locale,
        ]);

        return view('products.show', compact('product', 'headHtml'));
    }
}
```

#### 3. Override ile Kullanim

Controller'da master paneldeki sablonu override edebilirsiniz:

```php
$headHtml = $this->head->render('product_detail', $locale, [
    'site_name'    => $this->seo->siteName(),
    'product_name' => $product->name,
    'price'        => $product->formatted_price,
    'locale'       => $locale,
], [
    // Bu degerler master panel sablonlarini override eder
    'title'       => $product->seo_title ?? null,
    'description' => $product->seo_description ?? null,
    'og_image'    => $product->image_url,
    'og_type'     => 'product',
    'canonical'   => url("/products/{$product->slug}"),
    'robots'      => $product->is_draft ? 'noindex, nofollow' : null,
    'schema_json' => json_encode([
        '@context' => 'https://schema.org',
        '@type'    => 'Product',
        'name'     => $product->name,
        'image'    => $product->image_url,
        'offers'   => [
            '@type'         => 'Offer',
            'price'         => $product->price,
            'priceCurrency' => 'TRY',
        ],
    ]),
]);
```

#### 4. Hreflang ile Coklu Dil

```php
$headHtml = $this->head->render('about', $locale, [
    'site_name' => $this->seo->siteName(),
    'locale'    => $locale,
], [
    'hreflang' => [
        'tr' => url('/tr/hakkimizda'),
        'en' => url('/en/about'),
        'de' => url('/de/uber-uns'),
    ],
]);
```

---

### HeadBuilder::render() Parametreleri

```php
$headHtml = $this->head->render(
    string $pageType,    // Sayfa tipi (config'teki page_type)
    string $locale,      // Dil kodu ('tr', 'en', vb.)
    array  $vars = [],   // Sablon degiskenleri
    array  $overrides = [] // Opsiyonel override degerleri
);
```

#### `$vars` - Sablon Degiskenleri

Master paneldeki SEO sablonlarinda kullanilan degiskenler:

| Degisken | Aciklama |
|----------|----------|
| `site_name` | Site adi |
| `locale` | Aktif dil |
| `title` | Sayfa/makale basligi |
| `excerpt` | Kisa aciklama |
| `category` | Kategori adi |
| *ozel* | Config'de tanimladiginiz herhangi bir degisken |

#### `$overrides` - Override Secenekleri

| Anahtar | Tip | Aciklama |
|---------|-----|----------|
| `title` | `?string` | Meta title (null ise sablon kullanilir) |
| `description` | `?string` | Meta description |
| `keywords` | `?string` | Meta keywords |
| `author` | `?string` | Meta author |
| `canonical` | `?string` | Canonical URL |
| `robots` | `?string` | Robots meta (ornek: `'noindex, follow'`) |
| `og_title` | `?string` | Open Graph title |
| `og_description` | `?string` | Open Graph description |
| `og_image` | `?string` | Open Graph image URL |
| `og_type` | `?string` | OG type (`website`, `article`, `product`) |
| `og_locale` | `?string` | OG locale |
| `twitter_title` | `?string` | Twitter card title |
| `twitter_description` | `?string` | Twitter card description |
| `twitter_image` | `?string` | Twitter card image |
| `hreflang` | `array` | Dil alternatifleri `['tr' => 'url', 'en' => 'url']` |
| `schema_json` | `?string` | JSON-LD Schema.org (JSON string) |
| `extra` | `?string` | Ekstra raw HTML |

### HeadBuilder Ciktisi

`render()` metodu su HTML etiketlerini uretir:

```html
<!-- Primary SEO -->
<title>Urun Adi - Site Adi</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta name="author" content="...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="...">

<!-- Open Graph -->
<meta property="og:type" content="product">
<meta property="og:url" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="...">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">

<!-- Hreflang -->
<link rel="alternate" hreflang="tr" href="...">
<link rel="alternate" hreflang="en" href="...">

<!-- RSS -->
<link rel="alternate" type="application/rss+xml" title="..." href="/feed.xml">

<!-- Google Verification -->
<meta name="google-site-verification" content="...">

<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
<script>...</script>

<!-- Schema.org JSON-LD -->
<script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```

---

## Oncelik Sirasi

HeadBuilder deger cozumlerken su oncelik sirasini kullanir:

```
1. override (controller'dan gelen)
2. pageSeo (master panelden gelen sablon)
3. seoConfig (genel SEO ayarlari)
4. fallback (varsayilan deger)
```

Ornegin:
- Master panelde "homepage" icin title sablonu `{site_name} - Anasayfa` olarak tanimliysa
  ve controller'dan override gonderilmediyse, HeadBuilder bu sablonu kullanir.
- Controller'dan `'title' => 'Ozel Baslik'` override gonderilirse, sablon yerine bu deger kullanilir.

---

## View'lari Ozellestirme

Blog view'larini projenize kopyalamak icin:

```bash
php artisan vendor:publish --tag=blog-views
```

Bu komut view dosyalarini `resources/views/vendor/blog/` altina kopyalar.

---

## API Endpoint'leri

Paket su API endpoint'lerini otomatik olarak kaydeder:

| Method | URL | Aciklama |
|--------|-----|----------|
| GET | `/api/articles` | Makale listesi |
| POST | `/api/articles` | Makale olustur/guncelle |
| DELETE | `/api/articles/{id}` | Makale sil |
| GET | `/api/categories` | Kategori listesi |
| POST | `/api/categories` | Kategori olustur/guncelle |
| DELETE | `/api/categories/{id}` | Kategori sil |
| GET | `/api/health-status` | Baglanti durumu |
| GET | `/api/pages` | Sayfa tipi listesi |
| POST | `/api/page-seo` | Sayfa SEO guncelle |
| POST | `/api/seo-config` | Genel SEO ayarlari |
| POST | `/api/site-config` | Site yapilandirmasi |
| POST | `/api/redirects` | Yonlendirmeler |
| POST | `/api/sitemap/generate` | Sitemap olustur |

> Tum API endpoint'leri `BLOG_MASTER_API_KEY` ile korunur.

## Web Route'lari

| URL | Aciklama |
|-----|----------|
| `/{locale}/blog` | Blog ana sayfa |
| `/{locale}/blog/{slug}` | Makale detay |
| `/{locale}/blog/kategori/{slug}` | Kategori sayfasi |
| `/blog/setup` | Kurulum sayfasi |
| `/feed.xml` | RSS Feed |
| `/robots.txt` | Robots.txt |
| `/llms.txt` | LLM Discovery |
| `/llms-full.txt` | LLM Full Content |

---

## Lisans

MIT License. Detaylar icin [LICENSE](LICENSE) dosyasina bakin.
