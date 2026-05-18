<p align="center">
  <a href="https://laravel.com" target="_blank">
    <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo">
  </a>
</p>

<p align="center">
  <a href="https://github.com/system-intelligence/Jirrum_Laravel_Starter"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"></a>
  <a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Jirrum Laravel Starter

A ready-to-use Laravel starter pack for rapid application development. This package provides a clean foundation with essential configurations to kickstart your Laravel projects.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** (latest version)
- **Node.js** >= 18.x & **NPM**
- **Git**
- A database server (MySQL, PostgreSQL, or SQLite)

---

## 🚀 Installation

Follow these steps to clone and set up the starter pack:

### Step 1: Clone the Repository

```bash
git clone https://github.com/system-intelligence/Jirrum_Laravel_Starter.git
```

### Step 2: Navigate to the Project Directory

```bash
cd Jirrum_Laravel_Starter
```

### Step 3: Install PHP Dependencies

```bash
composer install
```

### Step 4: Install JavaScript Dependencies

```bash
npm install
```

### Step 5: Configure Environment

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Then update the `.env` file with your database credentials and other settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jirrum_laravel
DB_USERNAME=root
DB_PASSWORD=
```

### Step 6: Generate Application Key

```bash
php artisan key:generate
```

### Step 7: Run Database Migrations

```bash
php artisan migrate
```

### Step 8: Build Frontend Assets

**For development (with hot reload):**

```bash
npm run dev
```

**For production build:**

```bash
npm run build
```

---

## ▶️ Running the Application

### Start the Development Server

Open a new terminal window and run:

```bash
php artisan serve
```

Your application will be available at: **http://localhost:8000**

---

## 📁 Project Structure

```
Jirrum_Laravel_Starter/
├── app/              # Application core code
├── bootstrap/        # Framework bootstrapping
├── config/           # Configuration files
├── database/         # Migrations, seeders, factories
├── public/           # Entry point & public assets
├── resources/        # Views, CSS, JS, raw assets
├── routes/           # Route definitions
├── tests/            # Test files
└── ...
```

---

## 🛠️ Useful Commands

| Command | Description |
|---------|-------------|
| `php artisan serve` | Start the development server |
| `npm run dev` | Compile assets with Vite (watch mode) |
| `npm run build` | Build assets for production |
| `php artisan migrate` | Run database migrations |
| `php artisan migrate:fresh --seed` | Fresh migrate with seeders |
| `php artisan key:generate` | Generate a new app key |
| `php artisan test` | Run the test suite |

---

## 📄 License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🔗 Links

- [Laravel Documentation](https://laravel.com/docs)
- [Laracasts](https://laracasts.com)
- [Laravel News](https://laravel.com/news)
