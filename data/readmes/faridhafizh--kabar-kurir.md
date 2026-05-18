<p align="center">
  <img src="./public/logo.svg" width="500" alt="KabarKurir Logo">
</p>

# KabarKurir

KabarKurir is a web application acting as a corporate news aggregator and an independent package tracking platform. It provides real solutions for monitoring the performance of delivery networks in Indonesia.

**Pantau Logistik Tanpa Sensor.** (Monitor Logistics Without Censorship.)

## Features
- **Package Tracking**: Track packages using tracking numbers from various couriers independently.
- **News Aggregator**: Stay updated with the latest news regarding package delivery, logistics, and couriers in Indonesia.
- **Lightweight UI**: Built using Alpine.js for interactive components while maintaining a clean corporate-looking interface.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. Install PHP dependencies via Composer:
   ```bash
   composer install
   ```

3. Install NPM dependencies and build frontend assets:
   ```bash
   npm install
   npm run build
   ```

4. Set up the environment file:
   ```bash
   cp .env.example .env
   ```
   *Make sure to configure your database settings and `NEWS_API_KEY` in the `.env` file.*

5. Generate the application key:
   ```bash
   php artisan key:generate
   ```

6. Run the database migrations:
   ```bash
   php artisan migrate
   ```

7. Start the development server:
   ```bash
   php artisan serve
   ```
   *Alternatively, you can run `composer dev` which will run all dev processes concurrently.*

## License

KabarKurir is built upon the Laravel framework, which is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
