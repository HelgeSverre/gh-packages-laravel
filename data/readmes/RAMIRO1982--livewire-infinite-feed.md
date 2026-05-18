# Livewire Infinite Feed

A reusable Livewire component that provides **infinite scroll** functionality for any Eloquent model.

Ideal for feeds, post-listings, news pages, and more.

---

## 🚀 Installation

You can install the package via Composer:

```bash
composer require ramiro1982/livewire-infinite-feed:^0.4.3
```

## 🧑‍💻 Basic Usage

```blade
<livewire:infinite-feed 
    model="App\\Models\\Post"
    item-view="components.post" 
    per-page="10" 
/>
```

## 🛠️ Required Parameters
- `model` (string): Fully qualified class name of the Eloquent model.
- `item-view` (string): Blade partial used to render each item in the feed.

When rendering, the component will include your partial like this:
```blade
@include($this->itemView, ['post' => $item])
```
ℹ️ The variable name (e.g., `post`) is derived from the model name in lowercase.

## ⚙️ Optional Parameters
- `per-page` *(int)*: Number of items per scroll (default: 10)
- `placeholder` *(string)*: View shown as placeholder during lazy loading — requires using the `lazy` attribute
- `with` *(array)*: Relationships to eager load

⚠️ Use the `:` prefix in Blade to pass the with parameter as a PHP array:
```blade
<livewire:infinite-feed 
    model="App\\Models\\Post" 
    item-view="components.post"
    :with="['author', 'tags']"
/>
```

## 🕳️ Placeholder View
To show a placeholder while the component loads, provide a custom view and use `lazy`:
```blade
<livewire:infinite-feed 
    model="App\\Models\\Post"
    item-view="components.post"
    placeholder="components.feed-placeholder"
    lazy
/>
```

## 🧩 Overriding the Default View and Placeholder
To customize the default views, publish them with:

```bash
php artisan vendor:publish --tag=views
```
This will copy the files to:
- `resources/views/vendor/infinite-feed/feed.blade.php`
- `resources/views/vendor/infinite-feed/placeholder.blade.php`

The default view uses [Tailwind CSS](https://tailwindcss.com/) and [Flux UI](https://fluxui.dev) components.

## ⚙️ Requirements
This component requires Alpine.js to handle scroll detection.

### Via CDN:

```html
<script src="https://unpkg.com/alpinejs" defer></script>
```

### Or via NPM (Vite):
```bash
npm install alpinejs
```

```javascript
// app.js
import Alpine from 'alpinejs'
window.Alpine = Alpine
Alpine.start()
```

## 🔄 Refreshing the Feed
If your application allows creating new items via another component, you can automatically refresh the feed by dispatching the `item-added` event.

## 🙌 Created by

Made with 💻 and ☕ by [Ramiro Rimoldi](https://github.com/RAMIRO1982)

## 🤝 Contributing

Pull requests and suggestions are welcome! If you find a bug or want to add a feature, feel free to open an issue or PR.

---
## 📄 License
MIT © [RAMIRO1982](https://github.com/RAMIRO1982)
