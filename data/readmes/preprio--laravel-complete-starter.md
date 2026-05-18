# Laravel Complete Starter

Look at the [Complete guide to Laravel and Prepr](https://docs.prepr.io/connecting-front-end-apps/laravel-complete-guide) to learn more.

## Add the environment file

Copy the .env.example file in this directory to .env (which will be ignored by Git) by running the following command:

```
cp .env.example .env
```

## Update the environment file

In the .env file replace `<YOUR-PREPR-ENDPOINT>` with the *API URL* of the Prepr *GraphQL Preview* access token from your Acme Lease Demo environment.

![preview API URL](https://assets-site.prepr.io//35k5a4g45wuy-preview-access-token.png)

## Add the Prepr tracking pixel

Go to the `resources/views/pages/index.blade.php` file and replace the placeholder `<!-- Your Prepr Tracking Code -->` with your own tracking code in Prepr.

![event tracking page](https://assets-site.prepr.io//1j41fnhj1305-tracking-code.png)

## Setup

Make sure to install the dependencies:

```
composer install
```

        
```
npm install
npm run dev
```

### Generate App Key

In a separate terminal, run the following command to generate a new app key.

``` 
php artisan key:generate
```


### Create Database File

Create the SQLite database file used in this project. If you'd like to use a different database, check out the [Laravel docs](https://laravel.com/docs/11.x/database) for more details.

``` 
php artisan migrate
```

## Development Server

Start the development server on http://localhost:8000

```
php artisan serve
```

## Production

Check out the [deployment documentation](https://laravel.com/docs/10.x/deployment) for more information.
