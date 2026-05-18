# Devstagram

This project is a clone of Instagram built with Laravel, where users can create an account, share images, and comment on and like the posts of other users.

## Built With

*   [Laravel](https://laravel.com/) - The web application framework used.
*   [Livewire](https://laravel-livewire.com/) - For dynamic interfaces.
*   [Tailwind CSS](https://tailwindcss.com/) - For styling.
*   [MySQL](https://www.mysql.com/) - The database used.

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

*   PHP >= 8.1
*   Composer
*   NPM
*   MySQL or another compatible database.

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/andresjimenez11/devstagram-project.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd devstagram-project
    ```
3.  **Install PHP dependencies**
    ```sh
    composer install
    ```
4.  **Create a copy of your .env file**
    ```sh
    cp .env.example .env
    ```
5.  **Generate an app encryption key**
    ```sh
    php artisan key:generate
    ```
6.  **Configure your database credentials in the `.env` file**
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=your_database_name
    DB_USERNAME=your_database_user
    DB_PASSWORD=your_database_password
    ```
7.  **Run the database migrations**
    ```sh
    php artisan migrate
    ```
8.  **Install NPM dependencies**
    ```sh
    npm install
    ```
9.  **Build assets for production**
    ```sh
    npm run build
    ```

## Usage

To start the local development server, run the following command:

```sh
php artisan serve
```

Then, open your browser and navigate to `http://127.0.0.1:8000`.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Contact

Andrés Felipe Jiménez - [@andresjimenez11](https://github.com/andresjimenez11)

Project Link: [https://github.com/andresjimenez11/devstagram-project.git](https://github.com/andresjimenez11/devstagram-project.git)