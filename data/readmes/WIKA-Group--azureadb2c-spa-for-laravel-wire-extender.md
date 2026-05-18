# Azure AD B2C single sign-on for Laravel single-page applications

This composer package provides the necessary logic to handle Azure B2C logins with MSAL for [wire-extender](https://github.com/wire-elements/wire-extender) components in the front end (with a pop-up) and back-end validation. It requires Livewire and Wire Extender.

> You must [Enable browser session support](https://wire-elements.dev/blog/embed-livewire-components-using-wire-extender).

## Installation
**Install the package:**
```bash
composer require wika-group/azureadb2c-spa-for-laravel-wire-extender
```

**Publish assets:**
```bash
php artisan vendor:publish --tag=azureb2cspa-assets
```

**Publish migration:**
```bash
php artisan vendor:publish --tag=azureb2cspa-migrations
```

**Extend .env and configure:**
```ini
AADB2C_TENANT_ID=
AADB2C_CLIENT_ID=
AADB2C_DOMAIN=            # {your_domain}.b2clogin.com
AADB2C_CUSTOM_DOMAIN=     # Optional: set to use custom domain e.g. login.contoso.com
AADB2C_POLICY=            # Optional - Default: 'B2C_1_sign-up_and_sign-in_policy'
AADB2C_DEFAULT_ALGORITHM= # Optional: Decoding algorithm JWK key. Default: 'RS256'
AADB2C_OAUTH_COLUMN=      # Optional: Name of the OAuth ID column. Default 'oauth_id'
```

**Optional: Publish config:**
```bash
php artisan vendor:publish --tag=azureb2cspa-config
```

## Usage
### Add scripts to your views
```html
<!-- In main livewire component -->
<livewire:azureB2cWireExtenderScripts/>
```

In order to trigger a Livewire re-render, an event listener is required.  
Therefore, the provided trait can be used inside the main Livewire component.

```php
use \WikaGroup\AzureAdB2cSpa\Traits\LoginLogoutEvents;
```

### Add a button to trigger login or logout
```HTML
@auth
    <button onClick="b2cLogout()">Logout</button>
@endauth
@guest
    <button onClick="b2cPopupLogin()">Login with Azure B2C</button>
@endguest
```

### Hook into the events
You can add custom logic by using the emitted events for login and logout:

```php
#[On('azureb2c-login-succeeded')]
public function azureB2cLoginSucceeded() {
    $userData = session('azureb2c-user-data');
}

#[On('azureb2c-login-failed')]
public function azureB2cLoginFailed(string $msg) {}

#[On('azureb2c-logout-succeeded')]
public function azureB2cLogoutSucceeded() {}

#[On('azureb2c-logout-failed')]
public function azureB2cLogoutFailed(string $msg) {}
```

### Configure Azure B2C
You must add the URL of the SPA in the Azure Portal:

<img src="https://github.com/WIKA-Group/azureadb2c-spa-for-laravel-wire-extender/blob/main/img/AzurePortalAppRegistration.jpg" width="700">
