# Laravel Modules With Livewire

Using [Laravel Livewire](https://github.com/livewire/livewire) in [Laravel Modules](https://github.com/nWidart/laravel-modules) package with automatically registered livewire components for every modules.

<p align="center">
    <img src="https://dev.mhmiton.com/laravel-modules-livewire-example/public/assets/images/laravel-modules-livewire.png" alt="laravel-modules-livewire">
</p>

<p align="left">
    <strong>Example Source Code: </strong><a href="https://github.com/mhmiton/laravel-modules-livewire-example" target="_blank">https://github.com/mhmiton/laravel-modules-livewire-example</a>
</p>

<p align="left">
    <strong>Example Live Demo: </strong> <a href="https://dev.mhmiton.com/laravel-modules-livewire-example" target="_blank">https://dev.mhmiton.com/laravel-modules-livewire-example</a>
</p>

### Installation:

Install through composer:

```
composer require mhmiton/laravel-modules-livewire
```

Publish the package's configuration file:

```
php artisan vendor:publish --tag=modules-livewire:config
```

### Creating Single File Components (SFC):

**Command Signature:**

`php artisan module:make-livewire {component} {module} {--sfc} {--force} {--emoji=} {--stub=}`

**Example:**

```
php artisan module:make-livewire sfc.post.create Core --sfc
```

**Force create component if the component already exists:**

```
php artisan module:make-livewire sfc.post.create Core --sfc --force
```

**Output:**

```
COMPONENT CREATED - SFC  🤙

VIEW:  modules/Core/resources/views/livewire/sfc/post/⚡create.blade.php
TAG: <livewire:core::sfc.post.create />
```

**Option (--emoji):**

Use emoji (⚡) in file/directory names (true or false)

```
php artisan module:make-livewire sfc.post.create Core --sfc --emoji=false
```

**Modifying Stubs:**

Check the [Modifying Stubs](#modifying-stubs) section for the `--stub` option.

### Creating Multi File Components (MFC):

**Command Signature:**

`php artisan module:make-livewire {component} {module} {--mfc} {--force} {--emoji=} {--test} {--js} {--stub=}`

**Example:**

```
php artisan module:make-livewire mfc.post.create Core --mfc
```

**Force create component if the component already exists:**

```
php artisan module:make-livewire mfc.post.create Core --mfc --force
```

**Output:**

```
COMPONENT CREATED - MFC  🤙

CLASS:  modules/Core/resources/views/livewire/mfc/post/⚡create/create.php
VIEW:  modules/Core/resources/views/livewire/mfc/post/⚡create/create.blade.php
TAG: <livewire:core::mfc.post.create />
```

**Option (--emoji):**

Use emoji (⚡) in file/directory names (true or false)

```
php artisan module:make-livewire mfc.post.create Core --mfc --emoji=false
```

**Option (--test): Create MFC with test file.:**

```
php artisan module:make-livewire mfc.post.create Core --mfc --test
```

**Option (--js): Create MFC with js file:**

```
php artisan module:make-livewire mfc.post.create Core --mfc --js
```

**Modifying Stubs:**

Check the [Modifying Stubs](#modifying-stubs) section for the `--stub` option.

### Creating Class-based Components:

**Command Signature:**

`php artisan module:make-livewire {component} {module} {--class} {--view=} {--force} {--inline} {--stub=}`

**Example:**

```
php artisan module:make-livewire Pages/AboutPage Core --class
```

```
php artisan module:make-livewire Pages\\AboutPage Core --class
```

```
php artisan module:make-livewire pages.about-page Core --class
```

**Force create component if the class already exists:**

```
php artisan module:make-livewire Pages/AboutPage Core --class --force
```

**Output:**

```
COMPONENT CREATED - CLASS BASED  🤙

CLASS: Modules/Core/app/Livewire/Pages/AboutPage.php
VIEW:  Modules/Core/resources/views/livewire/pages/about-page.blade.php
TAG: <livewire:core::pages.about-page />
```

**Inline Component:**

```
php artisan module:make-livewire Pages/AboutPage Core --class --inline
```

**Output:**

```
COMPONENT CREATED - CLASS BASED  🤙

CLASS: Modules/Core/app/Livewire/Pages/AboutPage.php
TAG: <livewire:core::pages.about-page />
```

**Extra Option (--view):**

**You're able to set a custom view path for component with (--view) option.**

**Example:**

```
php artisan module:make-livewire Pages/AboutPage Core --class --view=pages/about
```

```
php artisan module:make-livewire Pages/AboutPage Core --class --view=pages.about
```

**Output:**

```
COMPONENT CREATED - CLASS BASED  🤙

CLASS: Modules/Core/app/Livewire/Pages/AboutPage.php
VIEW:  Modules/Core/resources/views/livewire/pages/about.blade.php
TAG: <livewire:core::pages.about-page />
```

### Rendering Components:

`<livewire:{module-lower-name}::component-class-kebab-case />`

**Example:**

```
<livewire:core::pages.about-page />
```

### Modifying Stubs:

Publish the package's stubs:

```
php artisan vendor:publish --tag=modules-livewire:stub
```

After publishing the stubs, will create these files. And when running the make command, will use these stub files by default.

```
// For Single File Component (SFC)
stubs/modules-livewire/livewire-sfc.stub

// For Multi File Component (MFC)
stubs/modules-livewire/livewire-mfc-class.stub
stubs/modules-livewire/livewire-mfc-view.stub
stubs/modules-livewire/livewire-mfc-test.stub
stubs/modules-livewire/livewire-mfc-js.stub

// For Class-based Component
stubs/modules-livewire/livewire.inline.stub
stubs/modules-livewire/livewire.stub
stubs/modules-livewire/livewire.view.stub

// For Volt
stubs/modules-livewire/volt-component-class.stub
stubs/modules-livewire/volt-component.stub
```

**You're able to set a custom stub directory for component with (--stub) option.**

```
php artisan module:make-livewire Pages/AboutPage Core --class --stub=about
```

```
php artisan module:make-livewire Pages/AboutPage Core --class --stub=modules-livewire/core
```

```
php artisan module:make-livewire Pages/AboutPage Core --class --stub=./
```

### Creating Form Components:

**Command Signature:**

`php artisan module:make-livewire-form {component} {module} {--force} {--stub=}`

**Example:**

```
php artisan module:make-livewire-form Forms/PostForm Core
```

```
php artisan module:make-livewire-form Forms\\PostForm Core
```

```
php artisan module:make-livewire-form forms.post-form Core
```

**Force create component if the class already exists:**

```
php artisan module:make-livewire-form Forms/PostForm Core --force
```

**Output:**

```
COMPONENT CREATED  🤙

CLASS: Modules/Core/app/Livewire/Forms/PostForm.php
```

### Volt:

### Creating Volt Components:

**Command Signature:**

`php artisan module:make-volt {component} {module} {--view=} {--class} {--functional} {--force} {--stub=}`

**Example:**

```
php artisan module:make-volt volt.counter Core
```

**Force create component if the view already exists:**

```
php artisan module:make-volt volt.counter Core --force
```

**Output:**

```
VOLT COMPONENT CREATED  🤙

VIEW:  modules/Core/resources/views/livewire/volt/counter.blade.php
TAG: <livewire:core::volt.counter />
```

**Option (--view):**

**You're able to set a registered view namespace for component with (--view) option.**

```
php artisan module:make-volt volt.counter Core --view=livewire
```

```
php artisan module:make-volt volt.counter Core --view=pages
```
Note: Only registered view namespace will be support from the "volt_view_namespaces" config. By default registered view namespaces are 'livewire' and 'pages' in the config.

```
/*
|--------------------------------------------------------------------------
| View namespaces for volt
|--------------------------------------------------------------------------
|
*/

'volt_view_namespaces' => ['livewire', 'pages'],
```

**Option (--class):**

**You're able to create class based volt component with (--class) option.**

```
php artisan module:make-volt volt.counter Core --class
```

**Option (--functional):**

**You're able to create functional (API style) volt component with (--functional) option.**

```
php artisan module:make-volt volt.counter Core --functional
```

Note:: By default will be create class based or functional component by registered view namespace's files. If any class based component exists on the view namespace, then will be create class based component.

**Modifying Stubs:**

Check the [Modifying Stubs](#modifying-stubs) section for the `--stub` option.

### Rendering Volt Components:

`<livewire:{module-lower-name}::component-view />`

**Tag:**

```
<livewire:core::volt.counter />
```

**Route:**

```
use Livewire\Volt\Volt;

Volt::route('/volt-counter', 'core::volt.counter');
```

### Custom Module:

**To create components for the custom module, should be add custom modules in the config file.**

The config file is located at `config/modules-livewire.php` after publishing the config file.

Remove comment for these lines & add your custom modules.

```
/*
|--------------------------------------------------------------------------
| Custom modules setup
|--------------------------------------------------------------------------
|
*/

'custom_modules' => [
    // 'Chat' => [
    //     'name_lower' => 'chat',
    //     'path' => base_path('libraries/Chat'),
    //     'app_path' => 'src',
    //     'module_namespace' => 'Libraries\\Chat',
    //     'namespace' => 'Livewire',
    //     'view' => 'resources/views/livewire',
    //     'views_path' => 'resources/views',
    //     'volt_view_namespaces' => ['livewire', 'pages'],
    // ],
],
```

**Custom module config details**

> **name_lower:** Module name in lower case (required).
>
> **path:** Add module full path (required).
>
> **module_namespace:** Add module namespace (required).
>
> **namespace:** By default using `config('modules-livewire.namespace')` value. You can set a different value for the specific module.
>
> **view:** By default using `config('modules-livewire.view')` value. You can set a different value for the specific module.
>
> **views_path:** Module resource view path (required).
>
> **volt_view_namespaces:** By default using `config('modules-livewire.volt_view_namespaces')` value. You can set a different value for the specific module.
>

### License

Copyright (c) 2021 Mehediul Hassan Miton <mhmiton.dev@gmail.com>

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
