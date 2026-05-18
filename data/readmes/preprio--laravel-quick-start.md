## Laravel Quick Start

The Laravel quick start project launches a blog app with content from Prepr.

Look at the [Laravel Quick start guide](https://docs.prepr.io/connecting-front-end-apps/laravel-quick-start-guide) to learn more.

## Add the environment file

Copy the .env.example file in this directory to .env (which will be ignored by Git) by running the following command:

```
cp .env.example .env
```

## Update the environment file

In the .env file replace the value for the `PREPR_ENDPOINT` with the Prepr *API URL* from the *GraphQL Production* access token in your environment with Demo content.

## Setup

Make sure to install the dependencies:

```
composer install
```

### Generate App Key

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

## The end result

![Laravel Blog site end result](https://assets-site.prepr.io/762yqmjtwcuu//laravel-blog-site.png)


