![Zen Foundation](https://raw.githubusercontent.com/zenphporg/.github/main/img/zenphp.png)

<p align="center">
	<a href="https://github.com/zenphporg/zorah/actions"><img src="https://img.shields.io/github/actions/workflow/status/zenphporg/zorah/main.yml?branch=main&label=tests" alt="Build Status"></a>
  <a href="https://github.com/zenphporg/zorah/blob/main/clover.xml"><img src="https://img.shields.io/badge/dynamic/xml?color=success&label=coverage&query=round%28%2F%2Fcoverage%2Fproject%2Fmetrics%2F%40coveredelements%20div%20%2F%2Fcoverage%2Fproject%2Fmetrics%2F%40elements%20%2A%20100%29&suffix=%25&url=https%3A%2F%2Fraw.githubusercontent.com%2Fzenphporg%2Fzorah%2Fmain%2Fclover.xml" alt="Coverage"></a>
	<a href="https://packagist.org/packages/zenphp/zorah"><img src="https://img.shields.io/packagist/dt/zenphp/zorah" alt="Total Downloads"></a>
  <a href="https://packagist.org/packages/zenphp/zorah"><img src="https://img.shields.io/packagist/v/zenphp/zorah" alt="Latest Stable Version"></a>
  <a href="https://packagist.org/packages/zenphp/zorah"><img src="https://img.shields.io/packagist/l/zenphp/zorah" alt="License"></a>
</p>

<a name="introduction"></a>

## About Zorah

With **Zorah** you can add your Laravel language translations to your asset pipeline for use in JavaScript packages like Vue or React.

Zorah provides two `__()` and `trans()` translation helper functions that work like Laravel's, making it easy to use your Laravel translations in JavaScript. Written in TypeScript with full type definitions included.

The package works similar to [Ziggy](https://github.com/tightenco/ziggy) for routing, but **without** the Blade directive.

Zorah supports all versions of Laravel from `11.x` onwards, and all modern browsers.

- [About Zorah](#about-zorah)
- [Installation](#installation)
- [Setup](#setup)
  - [JavaScript Frameworks](#javascript-frameworks)
  - [Vue](#vue)
  - [SSR with Vite](#ssr-with-vite)
  - [TypeScript with Inertia](#typescript-with-inertia)
  - [Svelte](#svelte)
- [Usage](#usage)

## Installation

Install Zorah into your Laravel app via composer:

```bash
composer require zenphp/zorah
```

### Vue Version Compatibility

| Vue Version | Zorah Version | Install Command |
|-------------|---------------|-----------------|
| 3.5+        | 2.x (latest)  | `composer require zenphp/zorah` |
| 3.0 - 3.4   | 1.0.7         | `composer require zenphp/zorah:1.0.7` |

> **Note:** As of v2.1, the CommonJS build is now `dist/index.cjs`. ESM users (Vite, etc.) are unaffected.

## Setup

#### JavaScript Frameworks

Zorah provides an Artisan command to output its config and translations to a file: `php artisan zorah:generate`. By default this command generates a TypeScript file at `resources/js/zorah.ts`.

```bash
# Generate TypeScript (default)
php artisan zorah:generate

# Generate JavaScript instead
php artisan zorah:generate --js

# Custom path
php artisan zorah:generate ./resources/js/translations.ts
```

Alternatively, you can compile the translations in your dev and build steps in package.json:

```bash
"build:assets": "php artisan zorah:generate",
```

The generated TypeScript file will look something like this:

```ts
// zorah.ts
import type { ZorahConfig } from 'zorah-js'

const Zorah: ZorahConfig = {
  translations: {"en": {"php": {}, "json": {}}}
};

if (typeof window !== 'undefined' && typeof window.Zorah !== 'undefined') {
  Object.assign(Zorah.translations, window.Zorah.translations);
}

export { Zorah }
```

Create an alias to make importing Zorah's core source files easier:

```js
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      'zorah-js': resolve(__dirname, 'vendor/zenphp/zorah/dist/index.js'),
    },
  },
});
```

```js
// webpack.mix.js

// Mix v6
const path = require('path');

mix.alias({
  'zorah-js': path.resolve(__dirname, 'vendor/zenphp/zorah/dist/index.js'),
});

// Mix v5
const path = require('path');

mix.webpackConfig({
  resolve: {
    alias: {
      'zorah-js': path.resolve(__dirname, 'vendor/zenphp/zorah/dist/index.js'),
    },
  },
});
```

Add the following to your app.blade.php so that translation functions will use the current locale.

```js
<script>
  window.locale = '{{ app()->getLocale() }}';
</script>
```

Finally, import and use Zorah like any other JavaScript library.

```ts
import { trans, type ZorahConfig } from 'zorah-js'
import { Zorah } from './zorah'

// Use the trans function directly
trans(key: string, replace?: Record<string, string | number>, config?: ZorahConfig): string

// Or use the __ alias (available when using the Vue plugin)
__(key: string, replace?: Record<string, string | number>, config?: ZorahConfig): string
```

#### Vue

Zorah includes a Vue plugin to make it easy to use `trans()` or `__()` helpers throughout your app:

```ts
import { ZorahVue } from 'zorah-js'
import { Zorah } from './zorah'
```

Then use it in your app (register Zorah plugin):

```ts
createApp(App)
  .use(ZorahVue, Zorah)
  .mount('#app')
```

#### SSR with Vite

When using Server-Side Rendering with Vite, you'll need to set the `VITE_LOCALE` environment variable since `window.locale` is not available on the server.

Add this to your `.env` file:

```env
VITE_LOCALE="${APP_LOCALE}"
```

Or set it dynamically in your SSR entry point before rendering:

```ts
import.meta.env.VITE_LOCALE = locale;
```

For webpack/Node.js environments, use `process.env.LOCALE` instead. Zorah automatically detects which environment you're in and uses the appropriate method.

#### TypeScript with Inertia

If you're using TypeScript with Laravel Inertia, add the `__` and `trans` methods to your `globals.d.ts` file for proper type support in Vue components:

```diff
// resources/js/globals.d.ts

+import type { ZorahConfig, ReplacementValues } from 'zorah-js'

declare module 'vue' {
  interface ComponentCustomProperties {
    $inertia: typeof Router;
    $page: Page;
    $headManager: ReturnType<typeof createHeadManager>;
+   __: (key: string, replace?: ReplacementValues, config?: ZorahConfig) => string;
+   trans: (key: string, replace?: ReplacementValues, config?: ZorahConfig) => string;
  }
}
```

This enables full type checking for `__()` and `trans()` in your Vue components.

#### Svelte

There is no built-in integration for Svelte, however to avoid passing in the Zorah configuration object you can create a translation helper file.

```svelte
// i18n.svelte

<script context="module" lang="ts">
  import { trans as t, type ZorahConfig, type ReplacementValues } from 'zorah-js'
  import { Zorah } from '../zorah'

  // window.locale = document.documentElement.lang; // optional if not set in app.blade.php

  export function __(key: string, replace?: ReplacementValues, config: ZorahConfig = Zorah) {
    return t(key, replace, config);
  }

  export function trans(key: string, replace?: ReplacementValues, config: ZorahConfig = Zorah) {
    return t(key, replace, config);
  }
</script>


// Dashboard.svelte
<script lang="ts">
  import { __ } from "@/i18n.svelte";
</script>

<div>{__("key")}</div>
```

## Usage

#### The `trans()` helper

Both `trans()` or `__()` helper function works like Laravel's - You can pass the key of one of your translations, and a key-pair object for replacing the placeholders as the second argument.

**Basic usage**

```php
// lang/en/messages.php
return [
  'welcome' => 'Welcome to our application!',
]
```

```js
// Dashbaord.js
__('messages.welcome'); // Welcome to our application!
```

**With parameters**

```php
// lang/en/messages.php
return [
  'welcome' => 'Welcome, :name',
]
```

```js
// Dashbaord.js
__('messages.welcome', { name: 'Zorah' }); // Welcome, Zorah
```

**With multiple parameters**

```php
// lang/en/messages.php
return [
  'welcome' => 'Welcome, :name! There are :count apples.',
]
```

```js
// Dashbaord.js
__('messages.welcome', { name: 'Zorah', count: 8 }); // Welcome, Zorah! There are 8 apples.
```

## Maintenance Branches

Zorah follows semantic versioning using maintenance branches:

- `main` - Latest development version
- `N.x` - Maintenance branches for major versions (e.g., `1.x`, `2.x`)

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](https://github.com/zenphporg/zorah/security/policy) on how to report security vulnerabilities.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
