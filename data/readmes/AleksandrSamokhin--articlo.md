<p align="center">
   <a href="https://articlo.aleksandrsamokhin.com" rel="nofollow">
      <img src="https://github.com/AleksandrSamokhin/articlo/blob/main/art/logo.svg" width="200" alt="Articlo Logo" style="max-width: 100%;">
   </a>
</p>

# Articlo

Articlo is a modern social media platform built with Laravel and Livewire, designed for sharing articles and engaging with content through likes, comments, and follows.

## Features

### Core Functionality
- **Posts & Articles**: Create, edit, and manage posts with rich content
- **Categories**: Organize posts by categories for better discoverability
- **User Profiles**: Customizable user profiles with avatars
- **Follow System**: Follow and unfollow other users to curate your feed
- **Likes**: Like posts to show appreciation
- **Comments**: Engage with posts through threaded comments
- **Search**: Full-text search powered by Laravel Scout
- **AI Content Generation**: Generate post content using OpenAI
- **Media Management**: Upload and manage images with automatic thumbnail generation
- **Admin Dashboard**: Administrative interface for content management

### Technical Features
- **Real-time Updates**: Livewire components for dynamic interactions
- **Queue System**: Background job processing for emails and notifications
- **Email Notifications**: Automated emails for new posts and daily recaps
- **File Uploads**: Drag-and-drop file uploads with FilePond
- **Responsive Design**: Modern UI built with Tailwind CSS 4
- **API Support**: Laravel Sanctum for API authentication

## Tech Stack

- **Framework**: Laravel 12
- **Frontend**: Livewire 3, Tailwind CSS 4, Vite
- **PHP**: 8.2+
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)
- **Search**: Laravel Scout
- **Media**: Spatie Media Library
- **Authentication**: Laravel Breeze
- **Testing**: Pest PHP
- **Code Quality**: Laravel Pint

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 20+ and npm
- SQLite (for development) or MySQL/PostgreSQL (for production)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aleksandrsamokhin/articlo.git
   cd articlo
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure your `.env` file**
   - Set up your database connection
   - Add OpenAI API key for content generation (optional)
   - Configure mail settings

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Build assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

   Or use the dev script for concurrent server, queue, and Vite:
   ```bash
   composer run dev
   ```

## Available Scripts

- `composer setup` - Complete setup (install dependencies, generate key, migrate, build assets)
- `composer dev` - Start development server with queue and Vite
- `composer pint` - Run Laravel Pint for code formatting
- `composer test` - Run Pest tests
- `npm run dev` - Start Vite development server
- `npm run build` - Build production assets

## Project Structure

```
articlo/
├── app/
│   ├── Enums/              # Application enums
│   ├── Http/
│   │   ├── Controllers/    # Application controllers
│   │   ├── Middleware/     # Custom middleware
│   │   └── Requests/       # Form request validation
│   ├── Jobs/               # Queue jobs
│   ├── Livewire/           # Livewire components
│   ├── Mail/               # Email templates
│   ├── Models/             # Eloquent models
│   ├── Policies/           # Authorization policies
│   ├── Services/           # Business logic services
│   └── Traits/             # Reusable traits
├── database/
│   ├── factories/          # Model factories
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── resources/
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript
│   └── views/              # Blade templates
└── routes/                 # Application routes
```

## Key Packages

- **Livewire 3.6** - Full-stack framework for dynamic interfaces
- **Laravel Scout 10.14** - Full-text search
- **Spatie Media Library 11.12** - Media management
- **Commentify 3.0** - Comment system
- **Wire Elements Modal 3.0** - Modal dialogs
- **Intervention Image** - Image manipulation
- **Laravel Sanctum 4.0** - API authentication

## Testing

Run tests using Pest:

```bash
composer test
```

## Code Style

This project uses Laravel Pint for code formatting. Run it with:

```bash
composer pint
```

## Deployment

The project includes a GitHub Actions workflow for automated deployment. The workflow:
- Runs code linting with Pint
- Deploys to a VPS via SSH
- Runs migrations and optimizes the application

Configure the following secrets in GitHub:
- `SSH_PRIVATE_KEY` - SSH private key for deployment
- `VPS_HOST` - VPS hostname
- `VPS_USER` - SSH username

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

The Articlo project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
