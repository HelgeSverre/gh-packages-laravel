
<div align="left">
    <a href="https://github.com/putheakhem/laravel-camdigi-key">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/img/laravel-camdigi-key.png">
        <img alt="Logo for Laravel CamDigi Key" src="docs/img/laravel-camdigi-key.png">
      </picture>
    </a>
<h1>Laravel CamDigiKey Package</h1>

[![Latest Stable Version](https://img.shields.io/packagist/v/putheakhem/laravel-camdigi-key.svg?style=flat-square)](https://packagist.org/packages/putheakhem/laravel-camdigi-key)
[![Total Downloads](https://img.shields.io/packagist/dt/putheakhem/laravel-camdigi-key.svg?style=flat-square)](https://packagist.org/packages/putheakhem/laravel-camdigi-key)
</div>

> ⚠️ **DISCLAIMER**: This is an **unofficial community package** and is **not affiliated with, endorsed by, or supported by the official CamDigiKey Platform** or the Cambodian government. This package is maintained independently. For official support, please contact the official CamDigiKey Platform directly.
A Laravel wrapper for the [CamDigiKey Node.js Client](https://github.com/Techo-Startup-Center/camdigikey-client-library-node).
>
---

<div align="center">

## 🇰🇭 Stand with Cambodia • កម្ពុជា

### 🕊️ Cambodia Needs Peace 🕊️

With heavy hearts, we stand with our brave soldiers defending Cambodia’s land and dignity.
We seek no conflict—only peace, justice, and respect for our sovereignty.

**🙏 កម្ពុជាត្រូវការសន្តិភាព • Together to protect Cambodia’s sovereignty.**
</div>

---

## 📦 Installation

You can install the package via [Packagist](https://packagist.org/packages/putheakhem/laravel-camdigi-key):

```bash
composer require putheakhem/laravel-camdigi-key
```

---

## ⚙️ Setup

After installation:

```bash
php artisan vendor:publish --tag=config
```
This will publish the `config/camdigikey.php` file.

Run `php artisan camdigikey:setup`. The package also automatically clones the Node.js SDK into:

```
vendor/putheakhem/laravel-camdigi-key/node-lib/
```

For package maintainers using a local symlinked package during development, the SDK resolves from the local package directory.

---

## 🌐 .env Configuration

Set your CamDigiKey credentials in `.env`:

```env
CAMDIGIKEY_CLIENT_ID=your_client_id
CAMDIGIKEY_HMAC_KEY=your_hmac_key
CAMDIGIKEY_AES_SECRET_KEY=your_aes_secret
CAMDIGIKEY_AES_IV_PARAMS=your_iv
CAMDIGIKEY_CLIENT_DOMAIN=https://your-app.test
CAMDIGIKEY_SERVER_BASED_URL=https://camdigikey.serveo.net
CAMDIGIKEY_CLIENT_KEYSTORE_FILE=storage/app/camdigi-key/client_keystore.p12
CAMDIGIKEY_CLIENT_KEYSTORE_FILE_PASSWORD=your_password
CAMDIGIKEY_CLIENT_TRUST_STORE_FILE=storage/app/camdigi-key/trust_keystore.p12
CAMDIGIKEY_CLIENT_TRUST_STORE_FILE_PASSWORD=your_password
CAMDIGIKEY_REDIRECT_URI=https://your-app.test/callback
```

> ✅ Store `.p12` files securely in `storage/app/camdigi-key/`

---

## 🧪 Usage

Example route to get a login token:

```php
Route::get('/camdigikey/login-token', function () {
    return CamDigiKey::getLoginToken();
});
```

Or in a controller:

```php
$token = CamDigiKey::getLoginToken();
$access = CamDigiKey::getUserAccessToken($authToken);
```

All supported methods:
- `getLoginToken()`
- `getUserAccessToken($authToken)`
- `refreshAccessToken($accessToken)`
- `logoutAccessToken($accessToken)`
- `validateJwt($accessToken)`
- `lookupUserProfile($accessToken, $personalCode)`
- `verifyAccountToken($accountToken)`
- `getOrganizationAccessToken()`
- `getUserFace($accessToken)`

---

## 🧹 Artisan Setup Command (Optional)

Automatically run during install:
```bash
php artisan camdigikey:setup
```
This clones the CamDigiKey Node.js SDK into the expected path.

---

## 🔐 Security
- Never expose `.p12` files in public directories
- `.gitignore` all private keystores
- If you discover any security issues, please email puthea.khem at gmail.com instead of using the issue tracker.

---

## Support Me

If you find this package useful, consider supporting my work:
- [Buy me a coffee](https://www.buymeacoffee.com/iamputhea)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

---

Built with ❤️ by [Puthea khem](mailto:puthea.khem@gmail.com)
