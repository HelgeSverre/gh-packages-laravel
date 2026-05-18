# Photons
> [!NOTE]
> This project is unfinished and lacks in security in some aspects.
> 
> Notably, the RBAC does not check permissions everywhere yet as that was not finished being refactored.

An open source social media platform built with the TALL stack (Tailwind CSS, Alpine.js, Laravel, Livewire) featuring hierarchical discussions, media handling, and comprehensive user interactions.

## About

Photons is a social media discussion forum that focuses on the core principles of social platforms: meaningful discussions and community building. This project explores the fundamental technical challenges of creating a modern social platform, from user authentication and permissions to nested replies and real-time updates.

Built as somewhat of a side project for exploration, this platform demonstrates practical implementation of modern web development practices and architectural patterns.

## Features

### Core Functionality
- **Hierarchical Discussions**: Nested replies with parent-child relationships
- **Media Management**: Upload and manage images with automatic file cleanup
- **User Profiles**: Customizable profiles with avatars, banners, and bio
- **Social Interactions**: Follow users, like posts, and pin favorite content
- **Full-Text Search**: Search across posts, users, and media using Laravel Scout
- **Authentication**: Secure login with 2FA support and OAuth integration

### Security Features
- **Two-Factor Authentication (2FA)**: Enhanced account security via Laravel Fortify
- **Argon2id Password Hashing**: Modern, secure password storage
- **Input Sanitization**: XSS prevention using HTML Purifier
- **OAuth Integration**: Google Sign-In via Laravel Socialite

### Administration
- **Role-Based Access Control**: Admin, Moderator, and User roles using Spatie Permission
- **Admin Dashboard**: User statistics and system management
- **Artisan Commands**: CLI tools for user and role management
- **Email Verification**: Account verification process

## Tech Stack

### Backend
- **Laravel 12**: PHP framework for backend logic and database management
- **MariaDB (Preferred)**: Relational database for data storage
- **Laravel Fortify**: Authentication system with 2FA support
- **Laravel Scout**: Full-text search functionality
- **Spatie Laravel Permission**: Role and permission management

### Frontend
- **Livewire**: Reactive components without writing JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Alpine.js**: Lightweight JavaScript framework for interactivity
- **Livewire Flux**: UI component library

### Security & Tools
- **HTML Purifier**: User input sanitization
- **Argon2id**: Secure password hashing
- **Laravel Socialite**: OAuth integration
- **Debugbar**: Development tools

## Installation

### Prerequisites
- PHP 8.2 or higher (Extensions: pdo, pdo_mysql)
- Composer
- Node.js and NPM
- MariaDB or MySQL
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/LiamGingsjo/photons.git
cd photons
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install Node dependencies:
```bash
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Configure your database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=photons
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

7. Run migrations and seeders:
```bash
php artisan migrate --seed
```

8. Create storage symbolic link:
```bash
php artisan storage:link
```

9. Build frontend assets:
```bash
npm run build
```

10. Start the development server:
```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## Usage

### Artisan Commands

Create a new user:
```bash
php artisan app:user:make email@example.com
```

Delete a user:
```bash
php artisan app:user:delete email@example.com
```

Verify user email:
```bash
php artisan app:user:verify-email email@example.com
```

Assign role to user:
```bash
php artisan app:user:assign-role admin email@example.com
```

Unassign role from user:
```bash
php artisan app:user:unassign-role admin email@example.com
```

## Architecture

### Key Design Patterns

**MVC (Model-View-Controller)**: Separation of concerns for better organization and maintainability.

**Observer Pattern**: Handles model events for automatic cleanup and side effects (e.g., deleting physical files when media records are deleted).

**Manager Pattern**: Event-driven state management for nested components to prevent race conditions.

**Component-Based Design**: Reusable Livewire components following DRY principles.

### Database Structure

Main models and relationships:
- `User`: User accounts and authentication
- `UserProfile`: Extended profile information (one-to-one with User)
- `Post`: Forum posts with self-referencing parent-child relationships
- `Media`: Uploaded files with polymorphic relationships
- `Role` & `Permission`: Authorization system

## Project Scope

This project focuses on core discussion forum functionality. The following features are **not** included:
- Real-time notifications
- Direct messaging between users
- Advanced AI-powered content moderation
- Mobile app (web interface only)

## Development Timeline

The project was developed over approximately 4 months (September-December 2025):
1. **Basic Implementation**: Database structure and MVC setup
2. **Media-handling & Post-functionality**: File uploads and post creation
3. **Nested Replies & Refactoring**: Hierarchical discussions
4. **User-interactions**: Follow, like, and profile features
5. **Search & Admin**: Search functionality and admin panel
6. **Security & Authentication**: 2FA and security features
7. **Integration & Polish**: OAuth, email templates, and UX improvements

## Future Improvements
> [!NOTE]
> These may or may not be implemented due to the unfinished state of and unsure future of this project.

### Planned Features
- Content moderation tools
- Rate limiting for anti-spam
- Image resizing for better performance

### Technical Improvements
- CDN integration for media files
- Comprehensive unit and feature testing
- Caching strategy for popular posts
- Enhanced permission system implementation

### UX Improvements
- Rich text editor
- Enhanced mobile responsiveness

## Contributing

This is an exploratory project I used to learn and is not actively accepting contributions. However, feel free to fork the repository and build upon it for your own projects.

## Acknowledgments

- Laravel and Livewire communities for excellent documentation
- Spatie for the permission package

---

*This project was created as an exploratory project to explore the fundamental principles behind social media platforms and modern web development practices.*
