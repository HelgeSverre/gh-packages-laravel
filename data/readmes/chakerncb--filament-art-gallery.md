# 🎨 Filament Art Gallery

A modern, multilingual art gallery application built with Laravel, Filament, and the Art Institute of Chicago API. This project showcases artwork from renowned institutions while providing users with personalized features like favorites and image management.

## Features

- **Art Discovery**: Browse and search artwork from the Art Institute of Chicago
- **User Authentication**: Secure user registration and login with Laravel Breeze
- **Favorites System**: Save and manage your favorite artworks
- **Image Management**: Upload and manage personal images
- **Multilingual Support**: Available in English and Arabic with seamless language switching
- **Admin Panel**: Powered by Filament for comprehensive data management
- **Responsive Design**: Built with Tailwind CSS for optimal viewing on all devices
- **API Integration**: Real-time artwork data from the Art Institute of Chicago

## Tech Stack

- **Backend**: Laravel 12.x (PHP 8.2+)
- **Admin Panel**: Filament 4.x
- **Frontend**: Livewire, Alpine.js, Tailwind CSS 4.x
- **Database**: MySQL
- **Authentication**: Laravel Breeze
- **Build Tools**: Vite
- **Language Switch**: Filament Language Switch Package

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js & npm
- MySQL 8.0 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chakerncb/filament-art-gallery.git
   cd filament-art-gallery
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   # Create your MySQL database first.
   # configure your atabase in .env file.
   # then run:
   php artisan migrate
   ```

6. **Set up storage link** 
   ```bash
   php artisan storage:link
   ```

7. **Build assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

## Usage

### Public Features
- Browse and search artwork from the Art Institute of Chicago
- Explore community-uploaded images
- Use the search functionality to find specific pieces
- Switch between English and Arabic languages
- Use the search functionality to find specific pieces
- Switch between English and Arabic languages
- Register for an account to access personalized features

### User Features
- **Favorites**: Click the heart icon on any artwork to save it to your favorites
- **My Images**: Upload and manage your personal image collection
- **Download Images**: Download high-resolution artwork images for offline viewing

## API Integration

This application integrates with the [Art Institute of Chicago API](https://api.artic.edu/docs/) to fetch:
- Artwork metadata (title, artist, date, description)
- High-resolution images
- Museum information and provenance
- Search and filtering capabilities

The API responses are cached for optimal performance and to respect rate limits.

## Project Structure

```
app/
├── Filament/           # Admin panel resources and pages
├── Http/              # Controllers and middleware
├── Livewire/          # Livewire components (Language Switch)
├── Models/            # Eloquent models (User, Image, Favorite)
├── Services/          # API service classes (ArtInstituteService)
└── Traits/            # Reusable traits (HasFavorites)

database/
├── migrations/        # Database schema migrations
└── seeders/          # Database seeders

lang/
├── en/               # English translations
└── ar/               # Arabic translations

resources/
├── css/              # Stylesheets
├── js/               # JavaScript files
└── views/            # Blade templates
```

## Key Components

### Models
- **User**: Extended with favorites functionality
- **Image**: Personal image uploads with metadata
- **Favorite**: Junction table for user-artwork relationships

### Services
- **ArtInstituteService**: Handles API communication with caching and error handling

### Features
- **Multilingual**: Full RTL support for Arabic with Filament Language Switch
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: API response caching and optimized queries

## Security

- CSRF protection on all forms
- SQL injection prevention with Eloquent ORM
- XSS protection with Blade templating
- Secure file upload handling
- Rate limiting on API endpoints

## Configuration

### Environment Variables
Key environment variables to configure:

```env
APP_NAME="Filament Art Gallery"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=art_gallery
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Filament Configuration
The admin panel is configured in `config/filament.php` with:
- Custom branding and colors
- Navigation structure
- User authentication
- Language switching

## Internationalization

The application supports multiple languages:

- **English** (`en`): Default language
- **Arabic** (`ar`): Full RTL support

Language files are located in `lang/{locale}/` and include:
- Layout translations
- Page content
- Form labels and validation messages

Users can switch languages using the language selector in the navigation.


**Made with ❤️ by [Chaker NCB](https://github.com/chakerncb)**
