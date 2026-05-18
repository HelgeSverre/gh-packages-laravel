# courses-platform
## Description

This project embodies the realization of an online course platform, encompassing authors, categories, courses, posts, and more.

Stack:

* PHP (7.3) + Laravel (8)
* Livewire: full stack framework for Laravel
* HTML (Blade Templates) + CSS (TailwindCSS Framework)

## Installation

Clone the repository

    git clone https://github.com/2Fac3R/courses-platform.git

Switch to the repo folder

    cd courses-platform

Install all the dependencies using composer

    composer install

Rename ".env.example" to ".env" and add your database settings.
    
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=<your-database>
    DB_USERNAME=<your-username>
    DB_PASSWORD=<your-password>

Run migrations

    php artisan migrate

Run seeder

    php artisan db:seed

This will run the following code

    User::factory(5)->create();  // Creates 5 users
    Category::factory(3)->create();  // Creates 3 categories 
    Course::factory(10)->create();  // Creates 10 courses
    Post::factory(90)->create();  // Creates 90 posts

Start the local development server

    php artisan serve

## Usage
    
Last courses list layout

    http://127.0.0.1:8000/

Get a course by its slug

    http://127.0.0.1:8000/course/{course:slug}>
  

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Any feedback is appreciated.
