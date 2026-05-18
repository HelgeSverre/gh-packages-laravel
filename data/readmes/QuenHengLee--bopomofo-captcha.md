# Bopomofo Captcha · 注音符號驗證碼

> Maintained by [@QuenHengLee](https://github.com/QuenHengLee).
> Released on Packagist as `hengineer/bopomofo-captcha`.

A Laravel CAPTCHA package that renders **Taiwan Bopomofo (注音符號 / Zhuyin)** glyphs instead of Latin characters. Adapted from [`mews/captcha`](https://github.com/mewebstudio/captcha) for users with a Zhuyin IME — they simply type back the ㄅㄆㄇㄈ they see.

針對台灣使用者打造的 Laravel 驗證碼套件，使用 **注音符號** 取代英數字。改寫自 [`mews/captcha`](https://github.com/mewebstudio/captcha)，使用者只要用注音輸入法把看到的 ㄅㄆㄇㄈ 打回去即可。

---

## English

### Requirements

- PHP **8.1+**
- Laravel **10 / 11 / 12**
- PHP extensions: `gd`, `mbstring`, `fileinfo`
- A CJK TTF/OTF font that covers the Bopomofo block (`U+3105`–`U+3129`) — **not bundled**, see [Font setup](#font-setup) below.

### Installation

```bash
composer require hengineer/bopomofo-captcha
```

Publish the config (optional — sensible defaults are already merged):

```bash
php artisan vendor:publish --tag=bopomofo-captcha-config
```

### Font setup

The package ships **without** a font to keep its size small. Drop any CJK TTF/OTF into the package's `assets/fonts/` directory. Recommended free options:

| Font | License | Link |
|------|---------|------|
| Noto Sans TC | SIL OFL | https://fonts.google.com/noto/specimen/Noto+Sans+TC |
| Source Han Sans TC | SIL OFL | https://github.com/adobe-fonts/source-han-sans |
| jf-openhuninn (粉圓) | SIL OFL | https://justfont.com/huninn/ |

To shrink a full CJK font to just the 37 Bopomofo glyphs:

```bash
pyftsubset NotoSansTC-Regular.otf \
    --unicodes=U+3105-3129 \
    --output-file=NotoSansTC-Bopomofo.ttf
```

You can also point the captcha at fonts elsewhere at runtime:

```php
bopomofo_captcha()->setFonts([storage_path('fonts/NotoSansTC-Bopomofo.ttf')]);
```

### Usage

**In a Blade view:**

```blade
<form method="POST" action="/register">
    @csrf

    {!! bopomofo_captcha_img() !!}
    <input name="captcha" placeholder="請用注音輸入法輸入上方符號">

    <button>送出</button>
</form>
```

**Validating the input:**

```php
$request->validate([
    'captcha' => 'required|bopomofo_captcha',
]);
```

**Using a named profile (defined in `config/bopomofo-captcha.php`):**

```blade
{!! bopomofo_captcha_img('flat') !!}
```

```php
$request->validate(['captcha' => 'required|bopomofo_captcha:flat']);
```

### Stateless / API mode

For SPAs or mobile clients where you can't rely on a session, fetch the captcha as JSON and pass the returned `key` back when validating:

```http
GET /bopomofo-captcha/api/default
→ { "key": "bopomofo_captcha_xxx", "img": "data:image/png;base64,…" }
```

```php
$request->validate([
    'captcha' => 'required|bopomofo_captcha_api:' . $request->input('key'),
]);
```

### Available helpers & facade

| Helper | Facade | Returns |
|--------|--------|---------|
| `bopomofo_captcha()` | `BopomofoCaptcha` | the singleton |
| `bopomofo_captcha_src($profile)` | `BopomofoCaptcha::src()` | image URL |
| `bopomofo_captcha_img($profile, $attrs)` | `BopomofoCaptcha::img()` | `<img>` tag |
| `bopomofo_captcha_check($value)` | `BopomofoCaptcha::check()` | bool — session check |
| — | `BopomofoCaptcha::check_api($value, $key)` | bool — stateless check |

### Config profiles

The default config provides four ready-made profiles: `default`, `flat`, `mini`, `inverse`. Each one is shallow-merged on top of `default`, so you only override what you need. See `config/bopomofo-captcha.php` for the full list of knobs (`length`, `width`, `height`, `lines`, `angle`, `bgImage`, `bgColor`, `contrast`, `sharpen`, `blur`, `invert`, `expire`, `encrypt`, …).

### How it works (at a glance)

1. `generate()` picks `length` glyphs at random from the 37-character pool (聲母 + 韻母, no tones).
2. The answer is bcrypt-hashed and stored in the session (or in cache, with a random key, in API mode).
3. `create()` renders each glyph onto a canvas at random size / color / angle, draws noise lines, and returns a PNG response.
4. `check()` re-hashes the user's UTF-8 input and compares against the stored hash via `Hash::check`. On success the session entry is wiped (single-use).

### License

The package code is released under the **MIT License**. See [`LICENSE`](LICENSE) for the full text.

### Acknowledgements

This package is a Bopomofo (注音符號) adaptation of
**[mews/captcha](https://github.com/mewebstudio/captcha)** by Muharrem ERİN
(MeWebStudio), used under the MIT License. The architecture
(DI signature, persistence schema, validator / route / helper conventions)
is inherited from mews/captcha; this fork adapts it to multi-byte Bopomofo
input and adds one-shot validation, timing-leak protection in `check_api()`,
and per-route throttling.

The bundled `assets/fonts/NotoSansTC-VariableFont_wght.ttf` is
© Google and licensed separately under the
**[SIL Open Font License v1.1](https://scripts.sil.org/OFL)** — full text at
[`assets/fonts/OFL.txt`](assets/fonts/OFL.txt). OFL § 1 explicitly permits
bundling the font with software under a different licence, so the MIT
licence on the code is unaffected.

---

## 繁體中文

### 系統需求

- PHP **8.1 以上**
- Laravel **10 / 11 / 12**
- PHP 擴充模組：`gd`、`mbstring`、`fileinfo`
- 一個涵蓋注音 Unicode 區段（`U+3105`–`U+3129`）的 CJK TTF/OTF 字型 —— **套件本身不附字型**，請參考下方 [字型設定](#字型設定) 章節。

### 安裝

```bash
composer require hengineer/bopomofo-captcha
```

發佈設定檔（選擇性，預設值已自動載入）：

```bash
php artisan vendor:publish --tag=bopomofo-captcha-config
```

### 字型設定

為了讓套件保持輕量，安裝後 **沒有** 內建字型，請自行把 CJK TTF/OTF 字型丟到套件的 `assets/fonts/` 目錄。建議的免費字型：

| 字型 | 授權 | 連結 |
|------|------|------|
| Noto Sans TC（思源黑體 TC） | SIL OFL | https://fonts.google.com/noto/specimen/Noto+Sans+TC |
| Source Han Sans TC | SIL OFL | https://github.com/adobe-fonts/source-han-sans |
| jf-openhuninn 粉圓 | SIL OFL | https://justfont.com/huninn/ |

如果想把完整的 CJK 字型只精簡成 37 個注音字元，可以用 `pyftsubset`：

```bash
pyftsubset NotoSansTC-Regular.otf \
    --unicodes=U+3105-3129 \
    --output-file=NotoSansTC-Bopomofo.ttf
```

也可以在執行時改用別的位置：

```php
bopomofo_captcha()->setFonts([storage_path('fonts/NotoSansTC-Bopomofo.ttf')]);
```

### 使用方式

**在 Blade 樣板中：**

```blade
<form method="POST" action="/register">
    @csrf

    {!! bopomofo_captcha_img() !!}
    <input name="captcha" placeholder="請用注音輸入法輸入上方符號">

    <button>送出</button>
</form>
```

**在 Controller 中驗證：**

```php
$request->validate([
    'captcha' => 'required|bopomofo_captcha',
]);
```

**使用 `config/bopomofo-captcha.php` 裡定義的命名 profile：**

```blade
{!! bopomofo_captcha_img('flat') !!}
```

```php
$request->validate(['captcha' => 'required|bopomofo_captcha:flat']);
```

### 無狀態 / API 模式

若是 SPA 或行動端、無法依賴 session，可以用 API 模式：先打 JSON 端點拿到 `key` 與 base64 圖片，驗證時把 `key` 一起送回：

```http
GET /bopomofo-captcha/api/default
→ { "key": "bopomofo_captcha_xxx", "img": "data:image/png;base64,…" }
```

```php
$request->validate([
    'captcha' => 'required|bopomofo_captcha_api:' . $request->input('key'),
]);
```

### 可用 Helper 與 Facade

| Helper | Facade | 回傳 |
|--------|--------|------|
| `bopomofo_captcha()` | `BopomofoCaptcha` | singleton 實例 |
| `bopomofo_captcha_src($profile)` | `BopomofoCaptcha::src()` | 圖片網址 |
| `bopomofo_captcha_img($profile, $attrs)` | `BopomofoCaptcha::img()` | `<img>` 標籤 |
| `bopomofo_captcha_check($value)` | `BopomofoCaptcha::check()` | 布林 — Session 驗證 |
| — | `BopomofoCaptcha::check_api($value, $key)` | 布林 — 無狀態驗證 |

### 預設 Profile

預設提供四組：`default`、`flat`、`mini`、`inverse`。每個 profile 都會跟 `default` 做淺層合併，所以你只需要覆寫想改的欄位即可。完整可調參數（`length`、`width`、`height`、`lines`、`angle`、`bgImage`、`bgColor`、`contrast`、`sharpen`、`blur`、`invert`、`expire`、`encrypt`…）請參考 `config/bopomofo-captcha.php`。

### 運作原理

1. `generate()` 從 37 個注音符號（聲母 + 韻母，不含聲調）中隨機抽 `length` 個組成答案。
2. 答案以 bcrypt 雜湊後存進 session；若是 API 模式則改存進 Cache 並回傳一組隨機 key。
3. `create()` 把每個符號以隨機大小、顏色、角度畫到畫布上，再疊加干擾線，最後回傳 PNG。
4. `check()` 把使用者輸入（UTF-8）重新比對 hash，比中後立刻把 session 紀錄清掉（一次性使用）。

### 授權

本套件的 code 採 **MIT License**。完整條款見 [`LICENSE`](LICENSE)。

### 致謝

本套件是 **[mews/captcha](https://github.com/mewebstudio/captcha)**（作者
Muharrem ERİN / MeWebStudio）的注音符號衍生版本，並依其 MIT 授權繼續釋出。
原版的核心架構（DI 簽章、Session/Cache 儲存格式、Validator / Route / Helper
命名慣例）來自 mews/captcha；本 fork 主要做的事是換成多 byte 注音字元、
加入一次性驗證、`check_api()` 的時序洩漏防護、以及路由級的 throttle。

打包進來的字型 `assets/fonts/NotoSansTC-VariableFont_wght.ttf` 是
Google 的 Noto Sans TC，採 **[SIL Open Font License v1.1](https://scripts.sil.org/OFL)**
授權（完整條款見 [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt)）。OFL § 1
明文允許將字型打包進不同授權的軟體裡，所以這個套件的 code 仍為 MIT。
