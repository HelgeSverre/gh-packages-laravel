# Staff Management Portal Project

The company in view is an Amazon Fright Partner. They handle logistics using haulage vans for Amazon and now have a need to technologically manage the schedule of their staff.

This project features a management portal for scheduling duties and rota for the business. It would capture regular shift hours and overtiming working, also allowing users to check in when their shifts starts and end.


# Database Schema
The database Schema can be found [here](https://lucid.app/lucidchart/7ee42ce5-497f-4d5c-9d5e-db3845351781/edit?viewport_loc=1133%2C-561%2C3149%2C1417%2C0_0&invitationId=inv_170204d3-8094-421a-8708-a31e0c4494b0) 

# To Build the Api

Be sure to be in rotas Directory cd rotas

Run cp .env.example .env

Run composer install

Run php artisan key:generate

Run php artisan migrate:fresh --seed to remove all tables, migrate it again then seed superadmin.

Run php artisan passport:install --force to generate Encryption keys and Personal access client for O2auth by passport

Run php artisan composer dump-autoload

Run php artisan composer config:clear

# Admin Access Details

email: superadmin@rotas.com
password: password

# API URLs

API endpoints are found in the API documentation here https://documenter.getpostman.com/view/21415916/2s8Z6u5usG

# Admin URL

http://127.0.0.1:8000/dashboard
