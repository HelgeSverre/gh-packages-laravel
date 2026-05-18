# Statamic Starter Kit

A Statamic starter kit based in [Statamic Peak](https://statamic.com/starter-kits/studio1902/peak) 


[![version](https://img.shields.io/badge/version-0.4.3-blue.svg)](https://semver.org)


## Installation instructions

1. run `composer install`
2. run `php please make:user`
3. run `npm i` && `npm run dev`


---

## Compilation errors

### Vite Error

If there is a Vite Error when running
```bash
➜  npm run build

> build
> vite build

failed to load config from /data/webs/artform.localhost/vite.config.js
error during build:
TypeError: Cannot read properties of undefined (reading 'startsWith')
```

**Solution**

It can be due a wrong value in .env
`APP_URL="http://wrongsite.co.uk"`

Or a wrong hot file in public, in that case delete it
```bash
rm public/hot
```

### Valet Error

```bash
➜ npm run watch

> watch
> vite

error when starting dev server:
Error: Unable to find Valet certificate files for your host [artform.localhost]. Ensure you have run "valet secure".
```

**Solution**

This is because the local server has a SSL certificate not recognizable by Laravel. Probably the server is managed by MAMP and Laravel was expecting Valet.

In that case simply remove the SSL from youyr local server and use HTTP instead of HTTPS.

---

## Tailwind Configuration

Tailwind has been updated to v4 in January 2025. 

[Update from Tailwind Docs:](https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration)

One of the biggest changes in Tailwind CSS v4.0 is the shift from configuring your project in JavaScript to configuring it in CSS.

Instead of a `tailwind.config.js` file, you can configure all of your customizations directly in the CSS file where you import Tailwind, giving you one less file to worry about in your project: 

```css
@import "tailwindcss";
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}
```

The new CSS-first configuration lets you do just about everything you could do in your tailwind.config.js file, including configuring your design tokens, defining custom utilities and variants, and more.

To learn more about how it all works, read the new [theme variables documentation](https://tailwindcss.com/docs/theme).

However, you can still create a file similar to `tailwind.config.js` file if you need custom configurations.


### Manually Add a `tailwind.site.js` File

If you need to customize Tailwind (e.g., extend plugins), you can still create a **`js`** file.


   ```sh
   touch resources/js/tailwind.site.js
   ```

2. **Edit `tailwind.config.js`** to ensure Tailwind scans your Statamic views and JS files:
   ```js
   import plugin from 'tailwindcss/plugin'

    export default {
        plugins: [
            // Custom base for this particular site.
            plugin(function({ addBase, theme }) {
                addBase({...})
            }),

            // Custom components for this particular site.
            plugin(function({ addComponents, theme }) {
                addComponents({...})
            }),

            // Custom utilities for this particular site.
            plugin(function({ addUtilities, theme, variants }) {
                addUtilities({...})
            }),
            // Custom variants for this particular site.
            plugin(function ({ addVariant }) {
                addVariant(...);
            }),
        ],
    }
   ```
3. Import the file in the CSS file `resources/css/site.css`:
   ```css
   @config '../js/tailwind.site.js';
   ...
   ```

4. Restart Vite:
   ```sh
   npm run dev
   ```

---

## SCSS


###  1. Install Sass & Dependencies

```sh
npm install -D sass
```

### 2. Update `vite.config.js`

Modify your `vite.config.js` file to include SCSS support.

```js
...
        plugins: [
            laravel({
                refresh: true,
                input: [
                    'resources/css/site.css',
                    'resources/scss/app.scss', // Add SCSS file here
                    'resources/js/site.js',
                ]
            })
        ],
...
```


### 3. Create a SCSS File

Make sure you have an SCSS file in `resources/scss/`. If it doesn’t exist, create it:

```sh
mkdir -p resources/scss
touch resources/scss/app.scss
```

Then, open `resources/scss/app.scss` and add:

```scss
@use "child_files/*";

/* Your custom SCSS styles */
body {
    background-color: #f8f9fa;
}
```

### **4. Restart Vite**

```sh
npm run dev
```


---

## Add JS Libraries

### 1. Example: Install Tiny Slider

```sh
npm install tiny-slider
```

### 2. Add custom JS

Edit `resources/js/site.js`

```js
...
import tinyslider from './modules/tinyslider';
...

// Call custom modules.
const CDG = {

    onreadyFunctions: function() {
        //consoleHello('CDG is ready');
        //preloader();
        tinyslider();

        window.addEventListener("resize", function(){
            //consoleHello('window has resized');
            if(window.innerWidth < 768){
                //consoleHello('narrow');
            }
            else{
                //consoleHello('wide');
            }
         });
    },

    onloadFunctions: function() {
        //consoleHello('CDG is loaded');
    }
};

CDG.onreadyFunctions();

window.onload = function(event) {
    CDG.onloadFunctions();
};

```

---

## Create Collections

To add a **"Projects"** link to your **navigation menu** in Statamic, follow these steps:

### 1. Create a new collection "Projects"

 - Create the **content** file `content/collections/projects.yaml` or use the CMS to create a new Collection

 - Create the blueprint file `resources/blueprints/collections/projects/projects.yaml` or use the CMS to create a new Blueprint

 - Create taxonomies if needed

### 2. Create an Index Page for "Projects"

Since a **Collection** doesn't automatically generate an index page, you need to create one:

1. **Go to** `resources/views/` and create a new template:
   ```
   resources/views/projects/index.antlers.html
   ```
2. **Add basic code** to display your projects:
   ```antlers
   {{ collection:projects }}
       <h2><a href="{{ url }}">{{ title }}</a></h2>
   {{ /collection }}
   ```

3. **Ensure a route exists** in `routes/web.php`:
   ```php
   Route::statamic('projects', 'projects.index', ['title' => 'Projects']);
   ```
   - This makes `/projects` load the `projects/index.antlers.html` template.



### 3. Add "Projects" to Navigation

#### **Option 1: Using Statamic’s Navigation UI**
1. **Go to** Statamic Control Panel → **Navigation**.
2. Click on the **Primary Navigation (or your nav set)**.
3. Click **"Add Item"** → Select **"Entry"**.
4. Choose **"Manual URL"** and enter `/projects` as the URL.
5. Set the **label** to `"Projects"`, then **Save**.

#### **Option 2: Add It Manually in Your Template**
If you're manually rendering the navigation, modify your nav template (`resources/views/partials/navigation.antlers.html`):

```antlers
<ul>
    {{ nav from="main_navigation" }}
        <li><a href="{{ url }}">{{ title }}</a></li>
    {{ /nav }}
    <li><a href="/projects">Projects</a></li>  {# Manually add the Projects link #}
</ul>
```

---

## Add Addons

### Example: Install Statamic Tabs

```sh
composer require eminos/statamic-tabs
```

### Current Addons

- [Tabs](https://statamic.com/addons/kiwikiwi/tabs)
- [Bard Text Color](https://statamic.com/addons/xndbogdan/Statamic-3-Bard-Text-Color)

---

## Additional commands

### Clear cache and static files

```bash
php please stache:clear
php please static:clear
php please cache:clear
php artisan cache:clear
```
Reference to [Statamic Cache](https://statamic.dev/static-caching#by-force)



## Environment file contents


### Local

```env
Dump your .env values here with sensitive data removed. The following is a production example that uses full static caching:
APP_NAME="Statamic Starter Kit"
APP_ENV=local
APP_KEY="base64:NOmJ6oP6y2BQ6Pf93ObOHMC0B/Tfws+m6oYAFNTX6Kc="
APP_DEBUG=true
DEBUGBAR_ENABLED=true
APP_TIMEZONE="Europe/London"
APP_URL="http://statamic.test.localhost"

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME="${APP_NAME}"
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

STATAMIC_LICENSE_KEY=""
STATAMIC_THEME=business
STATAMIC_PRO_ENABLED=false
STATAMIC_STACHE_WATCHER=auto
STATAMIC_STATIC_CACHING_STRATEGY=null
STATAMIC_CACHE_TAGS_ENABLED=false
STATAMIC_REVISIONS_ENABLED=false
STATAMIC_GRAPHQL_ENABLED=false
STATAMIC_API_ENABLED=false
STATAMIC_GIT_ENABLED=false
STATAMIC_GIT_PUSH=false
STATAMIC_GIT_DISPATCH_DELAY=5

IMAGE_MANIPULATION_DRIVER=imagick

#STATAMIC_CUSTOM_CMS_NAME=
#STATAMIC_CUSTOM_LOGO_NAV_URL=
#STATAMIC_CUSTOM_DARK_LOGO_URL=
STATAMIC_CUSTOM_LOGO_OUTSIDE_URL="/visuals/statamic-peak-logo.svg"
#STATAMIC_CUSTOM_FAVICON_URL=
#STATAMIC_CUSTOM_CSS_URL=

```

## NGINX config

Add the following to your NGINX config __inside the server block__ enable static resource caching:
```
expires $expires;
```

And this __outside the server block__:
```
map $sent_http_content_type $expires {
    default    off;
    text/css    max;
    ~image/    max;
    application/javascript    max;
    application/octet-stream    max;
}
```

## Deploy script Ploi

```bash
if [[ {COMMIT_MESSAGE} =~ "[BOT]" ]] && [[ {DEPLOYMENT_SOURCE} == "quick-deploy" ]]; then
    echo "Automatically committed on production. Nothing to deploy."
    {DO_NOT_NOTIFY}
    exit 0
fi

cd {SITE_DIRECTORY}
git pull origin {BRANCH}
{SITE_COMPOSER} install --no-interaction --prefer-dist --optimize-autoloader --no-dev

npm ci
npm run build

{RELOAD_PHP_FPM}

{SITE_PHP} artisan cache:clear
{SITE_PHP} artisan config:cache
{SITE_PHP} artisan route:cache
{SITE_PHP} artisan statamic:stache:warm
{SITE_PHP} artisan queue:restart
{SITE_PHP} artisan statamic:search:update --all
{SITE_PHP} artisan statamic:static:clear
{SITE_PHP} artisan statamic:static:warm --queue

echo "🚀 Application deployed!"
```

## Deploy script Forge

```bash
if [[ $FORGE_QUICK_DEPLOY == 1 ]]; then
    if [[ $FORGE_DEPLOY_MESSAGE =~ "[BOT]" ]]; then
        echo "Automatically committed on production. Nothing to deploy."
        exit 0
    fi
fi

cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH
$FORGE_COMPOSER install --no-interaction --prefer-dist --optimize-autoloader --no-dev

npm ci
npm run build

( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service $FORGE_PHP_FPM reload ) 9>/tmp/fpmlock

$FORGE_PHP artisan cache:clear
$FORGE_PHP artisan config:cache
$FORGE_PHP artisan route:cache
$FORGE_PHP artisan statamic:stache:warm
$FORGE_PHP artisan queue:restart
$FORGE_PHP artisan statamic:search:update --all
$FORGE_PHP artisan statamic:static:clear
$FORGE_PHP artisan statamic:static:warm --queue
```

---

## Instagram

[Statamic Instagram Plugin](https://statamic.com/addons/marcorieser/statamic-instagram)

This new plugin will replace the old one `nineteensquared/instagram`, which has been abandoned.

### Features

- Fetch Instagram posts via Meta's Instagram Business API  
- Auto-refreshing of Access Tokens  


### How to Install

First, remove the old package:

```bash
composer remove nineteensquared/instagram
```

Then, install the new one:

```bash
composer require marcorieser/statamic-instagram
...
Using version ^2.0 for marcorieser/statamic-instagram
```


### How to Use

#### Installation Steps

1. Install the addon  
2. Publish the addon config by running:  

   ```bash
   php artisan vendor:publish --tag=statamic-instagram-config
   ```

3. A new file `config/statamic-instagram.php` will be created  
4. Add your Access Token to the account section in the published config file  

```php
return [
    'limit' => 12,

    'include_child_posts' => false,

    'cache' => [
        'key_prefix' => 'instagram',
        'duration' => 60 * 60 * 24, // 1 day
    ],

    'accounts' => [
        [
            'handle' => 'default',
            'access_token' => 'YOUR TOKEN HERE',
        ],
    ]
];
```

If you do not have a token, follow the instructions below.


### Creating a Meta App / Access Token

Create an Access Token for the API with these steps:

1. Log in with your Instagram credentials at [Facebook Developers](https://developers.facebook.com)  
2. Create a new app (choose **Other** as the use case and **Business** as the app type)  
3. Add **Instagram** as a product to your app  
4. Link your Instagram account at **Generate access tokens** in the API setup with the Instagram login section of your app  
5. Generate a token and add it to the config in Statamic  

Further information is available in [Meta's documentation](https://developers.facebook.com/docs/).



### Display the Feed

You can use the `{{ instagram:feed }}` tag to fetch media from the API and return them as an array.

---

## Updating Statamic

[UPDATING.md](https://github.com/pablorica/statamic_starter_kit/blob/main/UPDATING.md)


## Acknowledgements

* [Statamic Peak](https://statamic.com/starter-kits/studio1902/peak) 

## Copyright and License

Copyright 2025 **Statamic Starter Kit** released under the [MIT](https://github.com/pablorica/statamic_starter_kit/blob/main/LICENSE) license.

## Versioning

We use [SemVer](https://semver.org/) for versioning.

### Changelog

[CHANGELOG.md](https://github.com/pablorica/statamic_starter_kit/blob/main/CHANGELOG.md)
