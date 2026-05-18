# Telephone Staffing Management System

![Laravel](https://img.shields.io/badge/Laravel-8.x-orange)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-brightgreen)
![SQLite](https://img.shields.io/badge/SQLite-3.x-blue)

## Overview

The **Telephone Staffing Management System** is a comprehensive CRUD application designed to manage staff allocations and assignments for a telephone staffing system. Built with Laravel, this application offers an intuitive user interface powered by the Filament Admin Panel for efficient resource management. It handles the core functionalities related to managing entities, assignments, staff, users, chips, and more.

## Features

- **CRUD Operations**: Full Create, Read, Update, and Delete functionality for managing staff, allocations, assignments, and users.
- **Filament Admin Panel**: Utilizes Filament for an easy-to-use, visually appealing admin panel.
- **Role-based Access**: Access control via policies and middleware to secure user data.
- **Widgets & Resources**: Custom widgets and resources for easier data visualization and manipulation.

## Project Structure

The project follows the Laravel framework structure, with additional components for Filament integration and custom business logic.

```
├───app
│   ├───Console               # Artisan commands
│   ├───Exceptions            # Exception handling
│   ├───Filament              # Filament integration
│   │   ├───Resources         # CRUD resources for each model
│   │   │   ├───AllocationResource   
│   │   │   │   └───Pages     # Filament pages for Allocation
│   │   │   ├───AssignmentResource
│   │   │   │   └───Pages     # Filament pages for Assignment
│   │   │   ├───ChipResource
│   │   │   │   └───Pages     # Filament pages for Chip
│   │   │   ├───EntityResource
│   │   │   │   └───Pages     # Filament pages for Entity
│   │   │   ├───StaffResource
│   │   │   │   └───Pages     # Filament pages for Staff
│   │   │   └───UserResource
│   │   │       └───Pages     # Filament pages for User
│   │   └───Widgets           # Custom Filament widgets
│   ├───Http
│   │   ├───Controllers      # Controllers for routing logic
│   │   ├───Filament
│   │   │   ├───Resources     # Filament resource controllers
│   │   │   └───Widgets       # Custom Filament widgets logic
│   │   └───Middleware       # Middleware for access control
│   ├───Models               # Eloquent models for database entities
│   ├───Policies             # Access control policies for different resources
│   └───Providers            # Service providers for app initialization
├───bootstrap                # App bootstrap files
│   └───cache                # Cache files
├───config                   # Configuration files
├───database
│   ├───factories            # Model factories for testing
│   ├───migrations           # Database migration files
│   └───seeders              # Database seeders
├───public                   # Public assets (CSS, JS, images)
├───resources
│   ├───css                  # CSS files for styling
│   ├───js                   # JS files for interactivity
│   └───views                # Blade views for frontend
│       └───vendor
│           ├───filament     # Filament view components
│           └───filament-breezy # Breezy Filament components for user auth
├───routes                   # Route definitions
├───storage                  # Storage for uploaded files, cache, and logs
│   ├───app
│   │   └───public           # Public files storage
│   ├───framework            # Framework-generated files
│   │   ├───cache            # Cache data
│   │   ├───sessions         # Session files
│   │   ├───testing          # Testing files
│   │   └───views            # View files
│   └───logs                 # Application logs
└───tests                    # Automated tests
    ├───Feature              # Feature tests
    └───Unit                 # Unit tests
```

## Installation

To get started with the **Telephone Staffing Management System**, follow the steps below:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd TTelephone-Staffing-Management-System
   ```

2. **Install dependencies**:
   Run the following command to install the necessary dependencies via Composer and NPM:
   ```bash
   composer install
   npm install
   ```

3. **Set up your environment file**:
   Copy `.env.example` to `.env` and configure the necessary environment variables (e.g., database connection, app URL).

   ```bash
   cp .env.example .env
   ```

4. **Generate application key**:
   ```bash
   php artisan key:generate
   ```

5. **Run migrations**:
   Run the following command to set up your database tables:
   ```bash
   php artisan migrate
   ```

6. **Seed database (optional)**:
   You can seed the database with sample data using:
   ```bash
   php artisan db:seed
   ```

7. **Start the server**:
   You can now start the Laravel development server:
   ```bash
   php artisan serve
   ```

   Your app should now be running at `http://localhost:8000`.

## Testing

The application includes feature and unit tests for ensuring the functionality of the CRUD operations and system logic. You can run the tests with:

```bash
php artisan test
```

## Filament Admin Panel

The system uses Filament for the admin panel. After logging in, users can manage staff, assignments, chips, and more through the intuitive UI. Filament resources handle CRUD operations for each model, making the management of the system easy.

### Pages & Resources

Each key entity in the system (e.g., **Staff**, **Assignments**, **Users**) has its own Filament resource with CRUD operations and corresponding pages for viewing and editing the records.

## Contributing

We welcome contributions! To contribute to this project:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a pull request with a description of your changes

## License

This project is open-source and available under the [MIT License](LICENSE).
