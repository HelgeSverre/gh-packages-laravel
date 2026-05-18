# Ensemble Calendar

A modern, GDPR-compliant rehearsal calendar application built with Laravel 12 and Filament v4. Designed for orchestras, choirs, bands, and other musical ensembles to manage and share rehearsal schedules with their members.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Local Development with DDEV (Recommended)](#local-development-with-ddev-recommended)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [License](#license)

## About

Ensemble Calendar is a comprehensive solution for managing rehearsal schedules in musical ensembles. It provides a clean, mobile-first interface for members to view upcoming rehearsals, download rehearsal plans, and subscribe to calendar feeds. The admin panel, powered by Filament v4, makes it easy to create and manage rehearsals with multi-day support.

### What Makes It Special

- **Multi-Day Rehearsals**: Support for weekend intensives and multi-day rehearsal blocks with individual start/end times per day
- **Calendar Sync**: ICS feed support for automatic synchronization with Apple Calendar, Google Calendar, and Outlook
- **Secure Plan Distribution**: Upload rehearsal plans as PDFs, accessible only to authenticated members
- **GDPR Compliant**: Built-in privacy pages, cookie consent, and data deletion workflows
- **Mobile-First**: Responsive design optimized for smartphones and tablets
- **Multilingual**: German and English translations included (easily extensible to other languages)

## Features

### For Ensemble Members

- 📅 **Public Calendar View**: Clean, card-based layout showing all upcoming rehearsals
- 📱 **Mobile Optimized**: Works seamlessly on phones, tablets, and desktops
- 🔄 **Calendar Subscription**: ICS feed for automatic sync with personal calendars
- 📄 **Rehearsal Plans**: Download PDF plans for each rehearsal block
- 🌍 **Multilingual**: Available in German and English
- 🔐 **Secure Access**: Login-protected content with shared or personal accounts

### For Administrators

- ⚡ **Modern Admin Panel**: Powered by Filament v4 with an intuitive interface
- 📝 **Easy Rehearsal Management**: Create multi-day rehearsals with individual times per day
- 📊 **Filter Tabs**: View all, upcoming, or past rehearsals at a glance
- 📤 **PDF Upload**: Attach rehearsal plans directly to rehearsal entries
- 👥 **Role Management**: Separate admin and ensemble member roles
- 🎯 **Smart Visibility**: Past rehearsals automatically hidden from public calendar
- 🔔 **Publishing Control**: Draft rehearsals until ready to publish

### Technical Features

- 🚀 **Modern Stack**: Laravel 12 + Filament v4 + Tailwind CSS
- 🔒 **Security**: Token-protected ICS feeds, private file storage
- 🌐 **GDPR Ready**: Privacy policy, imprint, data deletion pages
- 🧪 **Tested**: Feature test suite included
- 🎨 **Customizable**: Easy to adapt to your ensemble's branding
- 🗄️ **Flexible Database**: SQLite by default, supports MySQL/PostgreSQL

## Requirements

### Option 1: Using DDEV (Recommended)

- **Docker Desktop**: Latest version
- **DDEV**: Latest version

With DDEV, you don't need to install PHP, Composer, Node.js, or database software directly on your machine.

### Option 2: Manual Installation

- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **Node.js**: 18.x or higher (for asset compilation)
- **NPM**: Latest version
- **Database**: SQLite (default), MySQL 8.0+, or PostgreSQL 13+
- **Web Server**: Apache or Nginx

## Installation

> **💡 Tip**: For the easiest setup, skip to [Local Development with DDEV](#local-development-with-ddev-recommended). The instructions below are for manual installation.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ensemble-calendar.git
cd ensemble-calendar
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install frontend dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Environment Variables

Edit the `.env` file and configure the following:

```env
# Application Settings
APP_NAME="Ensemble Calendar"
APP_URL=http://localhost:8000
APP_LOCALE=en  # or 'de' for German
APP_TIMEZONE=Europe/Berlin  # or your timezone

# Database (SQLite by default)
DB_CONNECTION=sqlite

# Admin Account (created during seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password-here

# Ensemble Member Account (created during seeding)
ENSEMBLE_EMAIL=ensemble@example.com
ENSEMBLE_PASSWORD=secure-password-here

# ICS Feed Token (use a strong random string)
ICS_FEED_TOKEN=your-secure-random-token-here
```

### 5. Database Setup

```bash
# Create SQLite database file
touch database/database.sqlite

# Run migrations and seed default users
php artisan migrate --seed
```

### 6. Storage Setup

```bash
# Create symbolic link for storage
php artisan storage:link
```

### 7. Compile Assets

```bash
# For development
npm run dev

# For production
npm run build
```

### 8. Start the Application

```bash
# Development server
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## Local Development with DDEV (Recommended)

[DDEV](https://ddev.com) is a Docker-based development environment that simplifies local setup. It's the recommended way to develop this application locally as it provides:

- Consistent development environment across all platforms (macOS, Linux, Windows)
- Pre-configured PHP, database, and web server
- No need to install PHP, MySQL, or other dependencies directly on your machine
- Easy switching between PHP versions
- Built-in database management tools

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [DDEV](https://ddev.readthedocs.io/en/stable/users/install/) installed

### DDEV Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ensemble-calendar.git
cd ensemble-calendar

# Initialize DDEV with PHP 8.2
ddev config --project-type=laravel --php-version=8.2

# Start DDEV
ddev start

# Install Composer dependencies
ddev composer install

# Copy environment file
ddev exec cp .env.example .env

# Generate application key
ddev artisan key:generate

# Create database and run migrations with seeding
ddev artisan migrate --seed

# Create storage link
ddev artisan storage:link

# Install Node dependencies and build assets
ddev npm install
ddev npm run build

# Open the application in your browser
ddev launch
```

### DDEV Commands

Once DDEV is set up, use these commands for development:

```bash
# Start the project
ddev start

# Stop the project
ddev stop

# Run Artisan commands
ddev artisan [command]

# Run Composer commands
ddev composer [command]

# Run NPM commands
ddev npm [command]

# Watch for asset changes
ddev npm run dev

# Access the database
ddev mysql

# View logs
ddev logs

# SSH into the web container
ddev ssh

# Generate ICS feed token
ddev artisan tinker
>>> Str::random(64)

# Run tests
ddev artisan test

# Open the application
ddev launch

# Open database management tool
ddev launch -p
```

### DDEV URLs

After running `ddev start`, your application will be available at:

- **Web**: `https://ensemble-calendar.ddev.site`
- **PHPMyAdmin**: `https://ensemble-calendar.ddev.site:8037`

### Customizing DDEV

You can customize DDEV settings in `.ddev/config.yaml`:

```yaml
# Example customizations
php_version: "8.2"
webserver_type: nginx-fpm
database:
  type: mysql
  version: "8.0"
nodejs_version: "20"
```

After making changes, restart DDEV:

```bash
ddev restart
```

### Troubleshooting DDEV

If you encounter issues:

```bash
# Restart DDEV
ddev restart

# Rebuild the containers
ddev rebuild

# Delete and recreate everything
ddev delete
ddev start

# Check DDEV status
ddev describe
```

## Configuration

### ICS Feed Token

Generate a secure random token for the ICS feed:

```bash
php artisan tinker
>>> Str::random(64)
```

Add this to your `.env` file as `ICS_FEED_TOKEN`.

### Timezone

Set your ensemble's timezone in `.env`:

```env
APP_TIMEZONE=Europe/Berlin  # Germany
APP_TIMEZONE=America/New_York  # USA East Coast
APP_TIMEZONE=Europe/London  # UK
```

### Locale

Choose your default language:

```env
APP_LOCALE=en  # English
APP_LOCALE=de  # German
```

### Database

For production, consider using MySQL or PostgreSQL:

**MySQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ensemble_calendar
DB_USERNAME=root
DB_PASSWORD=
```

**PostgreSQL:**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ensemble_calendar
DB_USERNAME=postgres
DB_PASSWORD=
```

## Usage

### Access Points

- **Public Calendar**: `http://yourdomain.com/calendar`
- **Login Page**: `http://yourdomain.com/login`
- **Admin Panel**: `http://yourdomain.com/admin`
- **ICS Feed**: `http://yourdomain.com/calendar/feed/{ICS_FEED_TOKEN}`

### Default Accounts

After running `php artisan migrate --seed`, two accounts are created:

1. **Admin Account**
   - Email: From `ADMIN_EMAIL` in `.env`
   - Password: From `ADMIN_PASSWORD` in `.env`
   - Access: Full admin panel access

2. **Ensemble Account**
   - Email: From `ENSEMBLE_EMAIL` in `.env`
   - Password: From `ENSEMBLE_PASSWORD` in `.env`
   - Access: View calendar and download plans

### Creating a Rehearsal

1. Log in to the admin panel at `/admin`
2. Navigate to "Rehearsals" in the sidebar
3. Click "Create"
4. Fill in the rehearsal details:
   - **Title**: Name of the rehearsal (e.g., "Spring Concert Rehearsal")
   - **Location**: Venue name
   - **Address**: Optional full address
   - **Published**: Toggle to make visible to members
   - **Rehearsal Days**: Add one or more days with individual times
   - **Notes**: General information for the ensemble
   - **Rehearsal Plan PDF**: Upload optional PDF file
5. Click "Save"

### Subscribing to the Calendar

Members can subscribe to the ICS feed in their calendar apps:

**Apple Calendar (iOS/macOS):**
1. Copy the ICS feed URL from the calendar page
2. Open Calendar app
3. Go to File → New Calendar Subscription
4. Paste the URL and click Subscribe

**Google Calendar:**
1. Copy the ICS feed URL
2. Open Google Calendar settings
3. Click "Add calendar" → "From URL"
4. Paste the URL

**Outlook:**
1. Copy the ICS feed URL
2. In Outlook, go to Calendar
3. Click "Add calendar" → "Subscribe from web"
4. Paste the URL

## Development

### Project Structure

```
ensemble-calendar/
├── app/
│   ├── Filament/           # Admin panel resources
│   │   └── Resources/
│   │       └── Rehearsals/ # Rehearsal resource
│   ├── Http/
│   │   └── Controllers/    # Web controllers
│   └── Models/             # Eloquent models
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── resources/
│   ├── lang/               # Translations (en, de)
│   └── views/              # Blade templates
├── routes/
│   └── web.php             # Web routes
└── tests/
    └── Feature/            # Feature tests
```

### Adding Translations

To add a new language:

1. Create a new directory in `resources/lang/` (e.g., `fr` for French)
2. Copy `resources/lang/en/app.php` to the new directory
3. Translate all strings in the new file
4. Update `.env` to use the new locale: `APP_LOCALE=fr`

### Customizing the Design

The application uses Tailwind CSS. To customize:

1. Edit `tailwind.config.js` for theme customization
2. Modify Blade templates in `resources/views/`
3. Rebuild assets: `npm run build`

### Running in Development Mode

**Using DDEV (Recommended):**

```bash
# Start DDEV
ddev start

# Watch for asset changes
ddev npm run dev

# Open the application
ddev launch
```

**Using PHP's Built-in Server:**

```bash
# Start the development server
php artisan serve

# In another terminal, watch for asset changes
npm run dev
```

## Testing

The application includes a feature test suite using PHPUnit.

### Run All Tests

```bash
# Using DDEV (Recommended)
ddev artisan test

# Or using PHP directly
php artisan test
```

### Run Specific Test

```bash
# Using DDEV
ddev artisan test --filter=CalendarFeedTest

# Or using PHP directly
php artisan test --filter=CalendarFeedTest
```

### Run with Coverage

```bash
# Using DDEV
ddev artisan test --coverage

# Or using PHP directly
php artisan test --coverage
```

### Writing Tests

Tests are located in `tests/Feature/`. Example:

```php
public function test_calendar_shows_only_upcoming_rehearsals(): void
{
    // Test implementation
}
```

## Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Clone your fork and set up the development environment:
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/ensemble-calendar.git
   cd ensemble-calendar

   # Set up with DDEV (Recommended)
   ddev config --project-type=laravel --php-version=8.2
   ddev start
   ddev composer install
   ddev exec cp .env.example .env
   ddev artisan key:generate
   ddev artisan migrate --seed
   ```
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Write or update tests as needed
6. Ensure all tests pass: `ddev artisan test` (or `php artisan test`)
7. Run code style fixes: `ddev composer pint` (or `./vendor/bin/pint`)
8. Commit your changes: `git commit -m 'Add amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Code Style

This project follows Laravel coding standards:

- Use PSR-12 coding style
- Run PHP CS Fixer before committing:
  ```bash
  # Using DDEV
  ddev composer pint

  # Or using PHP directly
  ./vendor/bin/pint
  ```
- Follow Laravel best practices
- Write descriptive commit messages

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure tests pass
- Update documentation if needed

### Reporting Bugs

If you find a bug, please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (PHP version, Laravel version, etc.)

### Feature Requests

Feature requests are welcome! Please open an issue describing:

- The feature you'd like to see
- Why it would be useful
- How it should work

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Use a strong `APP_KEY`
- [ ] Use a secure database (MySQL/PostgreSQL)
- [ ] Set a strong `ICS_FEED_TOKEN`
- [ ] Configure proper file permissions
- [ ] Enable HTTPS
- [ ] Set up regular backups
- [ ] Configure proper logging
- [ ] Optimize assets: `npm run build`
- [ ] Cache configuration: `php artisan config:cache`
- [ ] Cache routes: `php artisan route:cache`
- [ ] Cache views: `php artisan view:cache`

### Server Configuration

**Nginx Example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ensemble-calendar/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**Apache Example:**

The `.htaccess` file in the `public` directory is already configured for Apache.

### Environment Variables

Ensure these are set in production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

ICS_FEED_TOKEN=your-very-secure-random-token
```

## License

This project is open-source software. Please add your chosen license here (e.g., MIT, GPL, Apache 2.0).

Example MIT License:

```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Support

If you need help:

- 📖 Check the [Laravel Documentation](https://laravel.com/docs)
- 📖 Check the [Filament Documentation](https://filamentphp.com/docs)
- 🐛 Open an issue for bugs or feature requests
- 💬 Start a discussion for general questions

---

Made with ❤️ for musical ensembles everywhere.
