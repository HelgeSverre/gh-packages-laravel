
# Webauthn - Laravel - Hello Passkeys, Bye-Bye Passwords

![PHP Version](https://img.shields.io/packagist/php-v/livewirez/webauthn-laravel)
![Laravel Version](https://img.shields.io/packagist/dependency-v/livewirez/webauthn-laravel/illuminate/support)
![License](https://img.shields.io/github/license/Livewirez/webauthn-laravel)
![Downloads](https://img.shields.io/packagist/dt/livewirez/webauthn-laravel)
![Stars](https://img.shields.io/github/stars/Livewirez/webauthn-laravel)

Webauthn defines an API enabling the creation and use of strong, attested, scoped, public key-based credentials by web applications, for the purpose of strongly authenticating users.

A laravel package for authenticating with webauthn passkeys on laravel applications. This makes it easier to integrate passkeys for authenticating users.

- [**Sources**](#sources)
- [**Info**](#info)
- [**Installation**](#installation)
- [**Usage**](#usage)
  - [***Basic Usage***](#basic-usage)
    - [**Retrieving a users' passkeys**](#retrieving-passkeys-for-user)
    - [**Creating a Passkey**](#creating-a-passkey)
    - [**Logging in with a Passkey**](#logging-in-with-a-passkey)
- [**Config**](#config)
- [**Events**](#events)
- [**License**](#license)

## Sources

- [Web Authenitcation Guide](https://w3c.github.io/webauthn/#sctn-intro)

- [Web Authentication Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

- [Webauthn Guide](https://webauthn.guide/#about-webauthn)

- [Webauthn PHP](https://github.com/lbuchs/WebAuthn)

## Info

- under the hood this package is a wrapper for [Webauthn PHP package](https://github.com/web-auth/webauthn-framework) using [This Documentation](https://webauthn-doc.spomky-labs.com)

## Installation

You can install the package via composer:

```bash
composer require livewirez/webauthn-laravel
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="webauthn-laravel-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="webauthn-laravel-config"
```

Add the `Livewirez\Webauthn\PasskeyAuthenticatable` and `Livewirez\Webauthn\PasskeyAuthenticatableTrait` to any `User` model that implements the `Illuminate\Contracts\Auth\Authenticatable` interface.

Add this package from [Simple Webauthn](https://simplewebauthn.dev/docs/packages/browser)

```bash
npm install @simplewebauthn/browser
```

which provides to the front end a specific collection of values that the hardware authenticator will understand for "registration" and "authentication".

## Usage

### `Livewirez\Webauthn\PasskeyAuthenticatable` interface

This interface has methods used to configure the  [user entity](https://w3c.github.io/webauthn/#dictionary-user-credential-params)—which is used to generate a pass key during the [`Attestation` phase](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion#attestation).

```php
<?php

namespace Livewirez\Webauthn;

use Illuminate\Contracts\Auth\Authenticatable;

interface PasskeyAuthenticatable extends Authenticatable
{
    public function getName(): string;

    public function getDisplayName(): string;

    public function getId(): string;

    public function getIcon(): ?string;

    public function getPasskeys(): array;
}
```

The user model

```php
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Notifications\Notifiable;
use Livewirez\Webauthn\PasskeyAuthenticatableTrait;
use Livewirez\Webauthn\PasskeyAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements PasskeyAuthenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatableTrait;
    
    // ...
}
```

### Basic usage

#### Retrieving passkeys for user

you can use the `passkeys` method on the user object to get the users saved passkeys and display them on their profile

using inertia

```php
<?php

namespace App\Http\Controllers\Settings;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Livewirez\Webauthn\Passkey;
use Symfony\Component\Uid\Uuid;
use App\Http\Controllers\Controller;

class PasskeyController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('settings/Passkeys', [
            'passkeys' => $request->user()->passkeys()->get()->map(static function (Passkey $source) {
                $data = $source->only(['id', 'name', 'public_key_credential_id', 'counter', 'aaguid', 'user_handle', 'backup_status', 'backup_eligible', 'usage_count']);
                $data['aaguid'] = Uuid::fromString($source->data->aaguid)->toRfc4122();
                $data['public_key_credential_id_hex'] = bin2hex($data['public_key_credential_id']);
                $data['last_used_at'] = $source->last_used_at ? (new \DateTimeImmutable($source->last_used_at))->format('j M Y, g:i a') : null;

                return (object) $data;
            }),
            'status' => $request->session()->get('status'),
        ]);
    }
}
```

or using blade

```php

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
            'passkeys' => $request->user()->passkeys()->get()->map(static function (Passkey $source) {
                $data = $source->only(['id', 'name', 'usage_count']);
                $data['aaguid'] = Uuid::fromString($source->data->aaguid)->toRfc4122();
                $data['last_used_at'] = $source->last_used_at?->format('j M Y, g:i a');
    
                return (object) $data;
            })
        ]);
    }
}
```

or in the case of laravel jetstream override the show method of `Laravel\Jetstream\Http\Controllers\Inertia\UserProfileController`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Jetstream\Agent;
use Laravel\Fortify\Features;
use Illuminate\Support\Carbon;
use Livewirez\Webauthn\Passkey;
use Symfony\Component\Uid\Uuid;
use Laravel\Jetstream\Jetstream;
use Illuminate\Support\Facades\DB;
use Laravel\Jetstream\Http\Controllers\Inertia\UserProfileController as BaseUserProfileController;

class UserProfileController extends BaseUserProfileController
{
    /**
     * Show the general profile settings screen.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    #[\Override]
    public function show(Request $request)
    {
        $this->validateTwoFactorAuthenticationState($request);

        return Jetstream::inertia()->render($request, 'Profile/Show', [
            'confirmsTwoFactorAuthentication' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
            'sessions' => $this->sessions($request)->all(),
            'passkeys' => $request->user()->passkeys()->get()->map(static function (Passkey $source) {
                $data = $source->only(['id', 'name', 'usage_count']);
                $data['aaguid'] = Uuid::fromString($source->data->aaguid)->toRfc4122();
                $data['last_used_at'] = $source->last_used_at?->format('j M Y, g:i a');
    
                return (object) $data;
            })
        ]);
    }
}
```

and add the routes

- Inertia

```php
<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::get('settings/passkeys', [PasskeyController::class, 'index'])->name('passkeys');

});
```

- Blade

```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('settings/passkeys', [PasskeyController::class, 'index'])->middleware('auth')->name('passkeys');
```

- Jetstream

```php
<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserProfileController;

Route::group(['middleware' => config('jetstream.middleware', ['web'])], function () {

    $authMiddleware = config('jetstream.guard')
    ? 'auth:'.config('jetstream.guard')
    : 'auth';

    $authSessionMiddleware = config('jetstream.auth_session', false)
        ? config('jetstream.auth_session')
        : null;

    Route::group(['middleware' => array_values(array_filter([$authMiddleware, $authSessionMiddleware]))], function () {
        
        Route::get('/user/profile', [UserProfileController::class, 'show'])
        ->name('profile.show');
    });

});
```

#### Creating a passkey

using the different javascript templates from the [`js` folder](js) `(PasskeyCreate component for frameworks and  app.js / profile -> partials -> handle-user-passkeys.blade.php for blade_alipnejs)`, you will need to first fetch the credential creation options from `'/passkeys/generate-registration-options'` route from your frontend and pass them to the `startRegistration` function from `'@simplewebauthn/browser'`

```js
import { startRegistration } from '@simplewebauthn/browser';
```

```js
axios.get('/passkeys/generate-registration-options') 
```

or

```js
fetch('/passkeys/generate-registration-options')
```

then if everything is ok it will use the `attResp` to post a json string of it to
`'/passkeys/verify-registration'`. if everything is ok the passkey should be created successfully

```js
axios.get('/passkeys/generate-registration-options')
            .then(async (response) => {
                try {
                    // Parse the public key credential creation options
                    const publicKeyCredentialCreationOptions = JSON.parse(response.data.publicKeyCredentialCreationOptions);
                    
                    // Start registration process
                    const attResp = await startRegistration({ optionsJSON: publicKeyCredentialCreationOptions });

                      const verificationResponse = await axios.post('/passkeys/verify-registration', { name: '', credentials: JSON.stringify(attResp) });

                      window.location.reload()
                } catch (error) {
                    // handle startRegistration Error
                }
            })
            .catch(error => {
                // handle network error
            })

```

#### Logging in with a passkey

like creating a passkey, you will net to get the options that the server will use for verification

using the different javascript templates from the [`js` folder](js) `(PasskeyLogin component for frameworks and  app.js / auth -> partials -> passkeys-login.blade.php for blade_alipnejs)`,

```js
import { startAuthentication } from '@simplewebauthn/browser';
```

```js
axios.get('/passkeys/generate-authentication-options') 
```

or

```js
fetch('/passkeys/generate-authentication-options')
```

then if everything is ok it will use the `attResp` to post a json string of it to
`'/passkeys/verify-authentication'`. if everything is ok the passkey should be created successfully

```js
axios.get('/passkeys/generate-registration-options')
            .then(async (response) => {
                try {
                     const publicKeyCredentialRequestOptions = JSON.parse(
                        response.data.publicKeyCredentialRequestOptions
                    );

                    // Start authentication process
                    const authResponse = await startAuthentication(
                        publicKeyCredentialRequestOptions
                    );

                    // Verify authentication with server
                    const verificationResponse = await axios.post('/passkeys/verify-authentication', {
                        credentials: JSON.stringify(authResponse),
                        credentials_id: authResponse.id
                    });

                    // Handle successful login
                    if (verificationResponse.data.redirect) {
                        window.location.href = verificationResponse.data.redirect;
                    }

                } catch (error) {
                    // handle startRegistration Error
                }
            })
            .catch(error => {
                // handle network error
            })

```

if successfull it will return a json response with a redirect url in the redirect key or just redirect if the requests were made normally

## Laravel 12 update

if you're using the new starter kits for react or vue using inertia, you can use the router function to make requests, but if you want to use axios, which may not be installed,
you can in install it

```bash
npm i axios
```

then create a `bootstrap.ts` file

```js
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

and then in `app.ts`

```js
import './bootstrap';
import { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
    }
}
```

## Laravel 13 update and Wayfinder

You can use laravel wayfinder if installed, for example manaing a passkey

```js
import { 
    create, store, update, destroy
} from "@/actions/Livewirez/Webauthn/Http/Controllers/PasskeyController";

create.url(); // generate-registration-options
store.url(); // verify-registration
update(1); // passkey/1/update
update({ passkey: 1 });
delete(1); // passkey/1/delete
delete({ passkey: 1 });

```

or

```js
import PasskeyController from "@/actions/Livewirez/Webauthn/Http/Controllers/PasskeyController";

PasskeyController.create();               // generate-registration-options
PasskeyController.store();               // verify-registration
PasskeyController.update(1);             // passkey/1/update
PasskeyController.update({ passkey: 1 });
PasskeyController.delete(1);             // passkey/1/delete
PasskeyController.delete({ passkey: 1 });
```

Logging in with a passkey

```js
import { 
    create, store
} from "@/actions/Livewirez/Webauthn/Http/Controllers/PasskeyAuthenticatedSessionController"; 

create.url()  // generate-authentication-options
store.url()   // verify-authentication
```

Importing methods directly

```js
import { 
    register_request_options,
    login, register_creation_options,
    store, update_passkey,
    delete_passkey 
} from "@/routes/passkeys/webauthn/passkeys";

register_request_options.url() // or register_request_options()
login.url() // or login()

register_creation_options.url() // or register_creation_options()
store.url() // or store()
update_passkey.url() // or update_passkey()
delete_passkey.url() // or delete_passkey()
```

### Custom Reuest using XMLHttpRequest

In case axios is unavailable

```js
export class JWT
{
    static parse(token: string): Record<string, any>
    {
        const parts = token.split('.');

        if (parts.length !== 3) throw new Error('Invalid JWT token format');

        // JWTs use Base64URL encoding, so convert to standard Base64 first
        const base64 = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Decode Base64 string and parse the payload
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    }

    static parse2(token: string): Record<string, any>
    {
        const parts = token.split('.');

        if (parts.length !== 3) throw new Error('Invalid JWT token format');

        return JSON.parse(atob(parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/'))
        );
    }
}

export class HttpResponse
{
    public readonly data: any;

    public readonly headers: Record<string, any>;

    public readonly _headers: Headers;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/ok) */
    public  readonly ok: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/redirected) */
    public  readonly redirected: boolean;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/status) */
    public  readonly status: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/statusText) */
    public  readonly statusText: string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/type) */
    public  readonly type: ResponseType;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/url) */
    public  readonly url: string;

    constructor(private response: Response, data: string) {
        try {
            this.data = JSON.parse(data)
        } catch (e) {
            this.data = data
        }
       

        this._headers = response.headers;
        this.headers = this.headersToRecord(response.headers)
        this.ok = response.ok;
        this.redirected = response.redirected;
        this.statusText = response.statusText;
        this.status = response.status;
        this.type = response.type;
        this.url = response.url;
    }

    private headersToRecord(headers: Headers): Record<string, any> {
        const record: Record<string, any> = {};
        headers.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }
}


export class HttpError extends Error {
    public response: HttpResponse;

    constructor(message: string, response: HttpResponse, options?: ErrorOptions) {
        super(message, options);
        this.response = response;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

type HttpRequestCallbacks = Omit<Partial<{
    [K in keyof XMLHttpRequestEventTargetEventMap]:
        (this: XMLHttpRequest, ev: XMLHttpRequestEventTargetEventMap[K]) => any;
}>, 'error' | 'timeout'>;


export class HttpRequest {
    static async fetch(input: RequestInfo | URL, init?: RequestInit,  callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Handle URL properly
            const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
            const method = init?.method || 'GET';
            
            xhr.open(method, url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.withCredentials = true;
            
            // Set additional headers from init
            if (init?.headers) {
                const headers = new Headers(init.headers);
                headers.forEach((value, key) => {
                    xhr.setRequestHeader(key, value);
                });
            }
    
            for (const event in callbacks) {
                const callback = callbacks[event as keyof Omit<XMLHttpRequestEventTargetEventMap, 'error' | 'timeout'>];
                if (typeof callback === 'function') {
                    xhr.addEventListener(event, callback as EventListener);
                }
            }
            
            xhr.onreadystatechange = function (ev: Event) {
                
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const resHeaders = xhr.getAllResponseHeaders()
                        .split('\r\n')
                        .map(v => v.trim().split(':').map(s => s.trim()))
                        .filter(a => a.length === 2 && a[0] !== '') as [string, string][];

                    if (xhr.status >= 200 && xhr.status < 300) {
                        const headers = new Headers(resHeaders);

                        const response = new Response(xhr.responseText, {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: headers
                        });

                        const http_reponse = new HttpResponse(
                            response,
                            xhr.responseText
                        );

                        resolve(http_reponse);
                    
                    } else if (xhr.status >= 300 && xhr.status < 400) {

                        console.log('Rediecting.......')

                        const headers = new Headers(resHeaders);

                        const response = new Response(xhr.responseText, {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: headers
                        });

                        const http_reponse = new HttpResponse(
                            response,
                            xhr.responseText
                        );

                        resolve(http_reponse);
                    } else {
                        console.error('Request failed:', xhr.status, xhr.statusText);

                        const error = new HttpError(
                            `HTTP Error: ${xhr.status} ${xhr.statusText}`, 
                            new HttpResponse(new Response(xhr.responseText, {
                                status: xhr.status,
                                statusText: xhr.statusText,
                                headers: new Headers(resHeaders)
                            }), xhr.responseText),
                            { cause: xhr.statusText }
                        );

                        reject(error);
                    }
                }
            };
            
            xhr.onerror = function () {
                
                let error = null;

                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const resHeaders = xhr.getAllResponseHeaders()
                        .split('\r\n')
                        .map(v => v.trim().split(':').map(s => s.trim()))
                        .filter(a => a.length === 2 && a[0] !== '') as [string, string][];
                    
                    error = new HttpError(
                        `HTTP Error: ${xhr.status} ${xhr.statusText}`, 
                        new HttpResponse(new Response(xhr.responseText, {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: new Headers(resHeaders)
                        }), xhr.responseText),
                        { cause: xhr.statusText }
                    );
                } else {
                    error = new Error('Network error occurred');
                }

                reject(error);
            };
            
            xhr.ontimeout = function () {
                console.error('Request timeout.');
                reject(new Error('Request timeout'));
            };
            
            // Handle request body
            let body: XMLHttpRequestBodyInit | null = null;
            if (init?.body) {
                if (
                    typeof init.body === 'string' ||
                    init.body instanceof Blob ||
                    init.body instanceof FormData ||
                    init.body instanceof URLSearchParams ||
                    init.body instanceof ArrayBuffer 
                ) {
                    body = init.body;
                } else {
                    throw new Error('Unsupported body type for XMLHttpRequest');
                }
            }
            
            xhr.send(body);
        });
    }
    
    static async get(url: string, init?: Omit<RequestInit, 'method'>, callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        return HttpRequest.fetch(url, { ...init, method: 'GET' }, callbacks);
    }
    
    static async post(url: string, data?: BodyInit | Record<string, any> | null, init?: Omit<RequestInit, 'method' | 'body'>, callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        let body: BodyInit | null = null;
        const headers = new Headers(init?.headers);
        
        if (data) {
            if (data instanceof FormData) {
                body = data;
            } else if (typeof data === 'object') {
                body = JSON.stringify(data);
                headers.set('Content-Type', 'application/json');
            } else {
                body = String(data);
            }
        }
        
        return HttpRequest.fetch(url, {
            ...init,
            method: 'POST',
            headers,
            body
        }, callbacks);
    }
    
    static async put(url: string, data?: BodyInit | Record<string, any> | null, init?: Omit<RequestInit, 'method' | 'body'>, callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        let body: BodyInit | null = null;
        const headers = new Headers(init?.headers);
        
        if (data) {
            if (data instanceof FormData) {
                body = data;
            } else if (typeof data === 'object') {
                body = JSON.stringify(data);
                headers.set('Content-Type', 'application/json');
            } else {
                body = String(data);
            }
        }
        
        return HttpRequest.fetch(url, {
            ...init,
            method: 'PUT',
            headers,
            body
        }, callbacks);
    }

     static async patch(url: string, data?: BodyInit | Record<string, any> | null, init?: Omit<RequestInit, 'method' | 'body'>, callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        let body: BodyInit | null = null;
        const headers = new Headers(init?.headers);
        
        if (data) {
            if (data instanceof FormData) {
                body = data;
            } else if (typeof data === 'object') {
                body = JSON.stringify(data);
                headers.set('Content-Type', 'application/json');
            } else {
                body = String(data);
            }
        }
        
        return HttpRequest.fetch(url, {
            ...init,
            method: 'PATCH',
            headers,
            body
        }, callbacks);
    }
    
    static async delete(url: string, init?: Omit<RequestInit, 'method'>, callbacks: HttpRequestCallbacks = {}): Promise<HttpResponse> {
        return HttpRequest.fetch(url, { ...init, method: 'DELETE' }, callbacks);
    }
}
```

## Config

you can customize the configuration

```php
// config/webauthn.php

<?php

use Cose\Algorithms;
use Livewirez\Webauthn\Webauthn;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\PublicKeyCredentialRequestOptions;

return [

    'guard' => ['web'],

    'override_listeners' => false,

    'middleware' => ['web'],

    'passkeys_table' => env('WEBAUTHN_PASSKEYS_TABLE', 'passkeys'),

    'credential_creation_options' => [
        'rp_entity' => [
            'name' => env('WEBAUTHN_RP_NAME', env('APP_NAME', 'Laravel')),
            'id' => env('WEBAUTHN_RP_HOST', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
            'icon' => null
        ],
    
        'challenge_length' => env('WEBAUTH_CHALLENGE_LENGTH', 32), // $challenge = random_bytes(32);
    
        'pub_key_cred_params' => [
            Algorithms::COSE_ALGORITHM_ES256K,    // More interesting algorithm
            Algorithms::COSE_ALGORITHM_ES256,     //      ||
            Algorithms::COSE_ALGORITHM_RS256,     //      || 
            Algorithms::COSE_ALGORITHM_EDDSA,     //      ||
            // Algorithms::COSE_ALGORITHM_PS256,  //      \/
            // Algorithms::COSE_ALGORITHM_ED256,  // Less interesting algorithm
        ],
    
        'authenticator_selection_creation_criteria' => [
            'authenticator_attachment' => AuthenticatorSelectionCriteria::AUTHENTICATOR_ATTACHMENT_NO_PREFERENCE, // null | "platform" | "cross-platform"
            'user_verification' => AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED,
            'resident_key' => AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_PREFERRED,
        ],
    
        'attestation' => env('WEBAUTHN_ATTESTATION', 'none') , // "direct" | "enterprise" | "indirect" | "none",
    
        'timeout' => env('WEBAUTHN_CREDENTIAL_CREATION_TIMEOUT', 120000),
        
        'extensions' => [
            'uvm' => true
        ]
    ],

    'credential_request_options' => [
        'challenge_length' => env('WEBAUTH_CHALLENGE_LENGTH', 32), // $challenge = random_bytes(32);

        'rp_id' => env('WEBAUTHN_RP_HOST', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)),

        'user_verification' => env('WEBAUTHN_USER_VERIFICATION' , PublicKeyCredentialRequestOptions::USER_VERIFICATION_REQUIREMENT_PREFERRED), // "discouraged" | "preferred" | "required";,

        'timeout' => 300,

        'extensions' => [
            ['name' => 'loc', 'value' => true ],
            ['name' => 'txAuthSimple', 'value' => 'Please log in with a registered authenticator'],
        ]
    ],

    
    // In case you want 2FA with Laravel Fortify, you can disable the default login route and use the one provided by this package, which will work alongside 2FA.
    // stops users bypassing 2FA if thy have stolen passkeys
    'enable_login_route' => class_exists(\Laravel\Fortify\Features::class) && \Laravel\Fortify\Features::enabled(\Laravel\Fortify\Features::twoFactorAuthentication()) ? 
            env('WEBAUTHN_ENABLE_LOGIN_ROUTE', false) : true,
    ];

```

## Events

You can listen for events fired from the base package in `AppServiceProvider`

```php
<?php

namespace App\Providers;

use Livewirez\Webauthn\WebauthnConfig;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
       $this->registerWebauthnCustomEventListeners();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
    }

    protected function registerWebauthnCustomEventListeners()
    {
        WebauthnConfig::$assertionResponseValidationFailedListeners = [
            fn ($event) => \Illuminate\Support\Facades\Log::error(var_export(['event' => $event, 'e_name' => class_basename($event)], true), ['__assertionResponseValidationFailedListeners__Closure'])
        ];

        WebauthnConfig::$assertionResponseValidationSucceededListeners = [
            fn ($event) => \Illuminate\Support\Facades\Log::info(var_export(['event' => $event, 'e_name' => class_basename($event)], true), ['__assertionResponseValidationSucceededListeners__Closure'])
        ];

        WebauthnConfig::$attestationResponseValidationFailedListeners = [
            fn ($event) => \Illuminate\Support\Facades\Log::error(var_export(['event' => $event, 'e_name' => class_basename($event)], true), ['__attestationResponseValidationFailedListeners__Closure'])
        ];

        WebauthnConfig::$attestationResponseValidationSucceededListeners = [
            fn ($event) => \Illuminate\Support\Facades\Log::info(var_export(['event' => $event, 'e_name' => class_basename($event)], true), ['__attestationResponseValidationSucceededListeners__Closure'])
        ];
    }
}

```

There are eventd fired for when passkey registration is successful or has failed , and when logging in with a passkey is successful or has failed.

you can choose to not use the default listeners by setting the `override_listeners` to true in `config/webauthn.php`

## License

Webauthn - Laravel is open-source software released under the MIT license. See [LICENSE](LICENSE) for more information.
