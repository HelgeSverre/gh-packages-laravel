# Statify

A dark-themed analytics dashboard built with Laravel 12, Livewire 3, and Bootstrap 5. Statify provides a clean and modern interface for monitoring traffic, revenue, and user behavior.

### Home
![Home](./public/img/home.png)

### Login
![Login](./public/img/login.png)

### Dashboard
![Dashboard](./public/img/dashboard.png)

### Settings
![Settings](./public/img/settings.png)



## Features

- **Dark theme** — modern navy/indigo color palette with Inter font
- **Analytics dashboard** — stat cards, traffic chart, top sources, recent events
- **Authentication** — login, register, forgot password, email verification
- **User settings** — profile, password, appearance, account deletion
- **Responsive** — mobile-friendly with collapsible sidebar
- **Docker ready** — includes Dockerfile and docker-compose for easy deployment

## Tech Stack

- **Backend** — Laravel 12, Livewire 3
- **Frontend** — Bootstrap 5.3, Bootstrap Icons, Chart.js, Sass
- **Database** — SQLite (default), MySQL compatible
- **Build tool** — Vite 6

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- npm

## Installation

### Local

```bash
# 1. Clone repository
git clone https://github.com/frizennwave/statify.git
cd statify

# 2. Install dependencies
composer install
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Setup database
touch database/database.sqlite
php artisan migrate
php artisan db:seed

# 5. Build assets
npm run build

# 6. Start server
php artisan serve
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### Development Mode

Run Laravel and Vite simultaneously with hot reload:

```bash
composer run dev
```

Or separately:

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

### Docker

```bash
# 1. Copy environment file
cp .env.example .env
# Edit .env as needed, then generate a key:
php artisan key:generate

# 2. Build and run
docker compose up --build

# 3. Open in browser
# http://localhost:8000
```

See [`docker/README-DOCKER.md`](docker/README-DOCKER.md) for more Docker details.

## Project Structure

```
statify/
├── app/                    # Laravel application logic
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── docker/                 # Docker configuration files
├── resources/
│   ├── css/
│   │   └── app.scss        # Main stylesheet (dark theme variables)
│   ├── js/
│   └── views/
│       ├── components/
│       │   └── layouts/
│       │       ├── app.blade.php       # Main layout (with sidebar)
│       │       └── auth.blade.php      # Auth layout
│       ├── livewire/
│       │   ├── dashboard.blade.php     # Dashboard page
│       │   └── settings/              # Settings pages
│       └── welcome.blade.php           # Landing page
└── routes/
    └── web.php             # Application routes
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public landing page with feature overview |
| Dashboard | `/dashboard` | Analytics overview with charts and stats |
| Profile | `/settings/profile` | Update name and email |
| Password | `/settings/password` | Change password |
| Appearance | `/settings/appearance` | Theme preferences |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |

## Customization

### Colors

Edit the CSS variables in `resources/css/app.scss`:

```scss
$body-bg: #0f1117;       // Main background
$card-bg: #1a1d2e;       // Card/sidebar background
$primary: #6366f1;       // Accent color (indigo)
$info: #22d3ee;          // Secondary accent (cyan)
```

### App Name

Update in your `.env` file:

```env
APP_NAME=Statify
```

### Database

Default is SQLite. To switch to MySQL, update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=statify
DB_USERNAME=root
DB_PASSWORD=
```

## License

This project is open-sourced under the [MIT license](LICENSE).

## Credits

Based on [bootstrap-starter-kit](https://github.com/flightsadmin/bootstrap-starter-kit) by flightsadmin.
