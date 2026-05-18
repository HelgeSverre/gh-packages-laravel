# Utils Package

[![codecov](https://codecov.io/gh/patrikjak/utils/graph/badge.svg?token=NOL0Y1NB2S)](https://codecov.io/gh/patrikjak/utils)

The **Utils** package is a versatile utility toolkit designed to enhance Laravel applications. It provides a variety of reusable classes and functions to streamline development, including CSS and JavaScript assets to support frontend components like buttons, modals, and tables. Easily integrate the package into your project, publish assets, and selectively include only the styles and functions you need for a highly customizable setup. Perfect for Laravel developers seeking to simplify their workflow with ready-to-use utilities.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
    - [CSS](#css)
    - [JavaScript](#javascript)
        - [Auto-initialization](#auto-initialization)
        - [Programmatic API](#programmatic-api)
        - [TypeScript](#typescript)
---

What's included:
- **CSS** - A collection of reusable styles for buttons, modals, tables, and more.
- **JavaScript** - A variety of functions to enhance user experience and streamline development.
- **Forms** - A set of form components to simplify form creation.
- **Tables** - A collection of table components to enhance data presentation.
- **Modals** - A set of modal components to display content in a modal window.
- **Notifications** - A collection of notification components to display messages to users.

### You can find the full documentation [here](https://utils.patrikjakab.sk).

## Installation

Install the package via Composer:

```bash
composer require patrikjak/utils
```

## Setup
After installing the package, add the package provider to the providers array in bootstrap/providers.php.

```php
use Patrikjak\Utils\UtilsServiceProvider;
 
return [
    ...
    UtilsServiceProvider::class,
];
```

Next, publish the pre-built assets:

```bash
php artisan vendor:publish --tag="pjutils-assets" --force
```

This copies the compiled CSS and JS files to `public/vendor/pjutils/`. Re-run it with `--force` after every package update.

If you want to customize the SCSS or TypeScript source files, publish them separately:

```bash
php artisan vendor:publish --tag="pjutils-sources"
```

## Usage
The Utils package offers a variety of useful classes and functions.

### CSS
To include all component styles, add the main.css file:
    
```html
<link rel="stylesheet" href="{{ asset('vendor/pjutils/assets/main.css') }}">
```

You need to set border-box box-sizing for all elements in your CSS file to prevent layout issues:

```css
* {
    box-sizing: border-box;
}
```

### JavaScript

The package ships a pre-built ES module bundle. Include it as a `<script>` tag **before** your own scripts:

```html
<script src="{{ asset('vendor/pjutils/assets/main.js') }}" defer type="module"></script>
```

`type="module"` is required. The bundle auto-initializes all components and exposes a `window.pjutils` global.

#### Auto-initialization

These components initialize automatically on page load — no manual calls needed:
password visibility switch, table functions (pagination, sorting, filtering, search), dropdowns, file uploaders, accordions, tabs, clipboard, number inputs, comboboxes, tag inputs, repeaters.

#### Programmatic API

| Symbol | Type | Description |
|--------|------|-------------|
| `Form` | class | AJAX form submission with validation error handling |
| `Modal` | class | Programmatic modal creation and control |
| `notify` | function | Show notification messages |
| `getData` | function | Read HTML data attributes from elements |
| `doAction` | function | Bind custom row actions on a table |

```javascript
window.pjutils.notify('Saved', 'Success', 'success');

new window.pjutils.Form().bindSubmit();

const modal = new window.pjutils.Modal();
modal.setTitle('Hello').setBody('<p>Content</p>').open();
```

#### TypeScript

Add a declaration file at `resources/js/pjutils.d.ts` for full type safety — the `import type` imports are erased at build time, nothing from the vendor directory gets bundled:

```typescript
import type Form from '../../vendor/patrikjak/utils/resources/assets/js/form/Form';
import type notify from '../../vendor/patrikjak/utils/resources/assets/js/utils/notification';
import type Modal from '../../vendor/patrikjak/utils/resources/assets/js/utils/Modal';
import type {getData} from '../../vendor/patrikjak/utils/resources/assets/js/helpers/general';
import type {doAction} from '../../vendor/patrikjak/utils/resources/assets/js/table/actions';

export {};

declare global {
    interface Window {
        pjutils: {
            Form: typeof Form;
            notify: typeof notify;
            Modal: typeof Modal;
            getData: typeof getData;
            doAction: typeof doAction;
        };
    }
}
```

Make sure `resources/js` is included in your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "noEmit": true,
        "skipLibCheck": true
    },
    "include": [
        "resources/js/**/*"
    ]
}
```

To load the correct language for JS components, set the `lang` attribute on the `<html>` tag:

```html
<html lang="{{ config('app.locale') }}">
```

Currently supported languages: `en`, `sk`.

Your `vite.config.js` must target **esnext**:

```javascript
export default defineConfig({
    ...
    build: {
        target: 'esnext',
    },
});
```
