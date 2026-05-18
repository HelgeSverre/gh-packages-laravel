# CRM System - Version 1

A Customer Relationship Management (CRM) system built with Laravel 11 and Livewire, featuring a dynamic node-based data structure for flexible customer information management.

## Description

This is the first iteration of a CRM system that introduces a novel approach to managing customer data through a flexible "Node" system. Instead of rigid database schemas, it uses a dynamic xfields system that allows storing arbitrary key-value pairs, providing flexibility for different types of customer data.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: Livewire 3.0 + Volt
- **UI**: Tailwind CSS with @tailwindcss/forms
- **Authentication**: Laravel Breeze
- **Database**: SQLite (configurable to MySQL/PostgreSQL)
- **Build Tool**: Vite 5

## Key Features

- Dynamic Node-based data structure
- Flexible xfields system for custom data attributes
- User authentication and authorization
- Dashboard with real-time updates via Livewire
- Responsive UI with Tailwind CSS
- Node creation and management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/stukenov/crm-v1.git
cd crm-v1
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install JavaScript dependencies:
```bash
npm install
```

4. Copy the environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Create SQLite database:
```bash
touch database/database.sqlite
```

7. Run migrations:
```bash
php artisan migrate
```

8. Build assets:
```bash
npm run build
```

9. Start the development server:
```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## Development

For local development with hot module replacement:

```bash
npm run dev
```

In a separate terminal:
```bash
php artisan serve
```

## Node System

The Node model implements a flexible data storage system:
- `setXField($fieldName, $fieldValue)` - Add or update custom fields
- `getXField($fieldName)` - Retrieve custom field values
- Fields are stored in a serialized format: `field1|value1||field2|value2`

This allows for dynamic data structures without database migrations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Saken Tukenov

## Development Timeline

This is Version 1 (July-August 2024) - Initial implementation with Node-based architecture.
