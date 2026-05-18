## About SeatSync

SeatSync is a modern cinema seat reservation system built with Laravel 12 and Livewire. It provides a seamless movie-going experience with real-time seat selection, secure payment processing, and comprehensive theater management capabilities.


<img width="1919" height="942" alt="SeatSync - Screenshots (1)" src="https://github.com/user-attachments/assets/6f647fd3-b36b-4fb9-bed4-de0f796cfcd5" />


### Project Motivation

Built to demonstrate advanced backend architecture, real-world booking workflows, and scalable Laravel design patterns.
Implementation inspired from Roadmap.sh https://roadmap.sh/projects/movie-reservation-system


### Key Features

- **🎬 Movie Management**: Browse movies with detailed information, posters, and genres
- **🎭 Theater Management**: Multiple theaters with customizable seating layouts
- **🔒 Seat Holding System**: Temporary seat reservations to prevent conflicts
- **💳 Payment Integration**: Mock payment system for testing and development
- **📱 Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **⚡ High Performance**: Optimized database queries with minimal load times

### Technology Stack

- **Backend**: Laravel 12, PHP 8.5
- **Frontend**: Livewire 4, Tailwind CSS 4
- **Database**: MySQL/PostgreSQL with Eloquent ORM
- **Authentication**: Laravel Fortify
- **Testing**: Pest PHP for unit and feature tests

## Performance Optimizations

SeatSync implements advanced performance optimizations to ensure a smooth user experience:

- **Query Optimization**: Reduced from 209+ queries to 5-8 queries per page load
- **N+1 Query Elimination**: Pre-fetching strategies for seat status data
- **Efficient Data Loading**: Bulk operations for seat reservations and holds
- **Memory Management**: Optimized data structures for large theaters

## Our System Demo




https://github.com/user-attachments/assets/1f91bc76-b105-483e-a576-8feec93cdab5


<img width="1919" height="942" alt="SeatSync - Screenshots (2)" src="https://github.com/user-attachments/assets/cc874f57-b0ad-4808-bbf0-8d27eb8f23d5" />
<img width="1919" height="884" alt="SeatSync - Screenshots (3)" src="https://github.com/user-attachments/assets/a8650974-8c62-4015-b758-9e70f2ddbb3a" />
<img width="1499" height="926" alt="SeatSync - Screenshots (4)" src="https://github.com/user-attachments/assets/4ea80ae7-5bc9-4bc2-b6c4-2b90ad030948" />
<img width="1918" height="925" alt="SeatSync - Screenshots (5)" src="https://github.com/user-attachments/assets/7d5dc1c5-6858-41e4-bb57-07ab1568b19c" />
<img width="1919" height="941" alt="SeatSync - Screenshots (6)" src="https://github.com/user-attachments/assets/472d4c41-3a8a-4f04-a9d9-72823eebcad5" />
<img width="1919" height="890" alt="SeatSync - Screenshots (7)" src="https://github.com/user-attachments/assets/1c473698-da4d-42ed-9744-34a30056b49b" />
<img width="1911" height="920" alt="SeatSync - Screenshots (8)" src="https://github.com/user-attachments/assets/4e37ca00-5db1-4c9a-93a2-7b0cbe61b0ee" />


## Installation

### Prerequisites

- PHP 8.5 or higher
- Composer
- Node.js and NPM
- Database (MySQL/PostgreSQL/SQLite)

### Setup Instructions

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd seatsync
    ```

2. **Install dependencies**

    ```bash
    composer install
    npm install
    ```

3. **Environment configuration**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Database setup**

    ```bash
    php artisan migrate
    php artisan db:seed
    ```

5. **Build assets**

    ```bash
    npm run build
    ```

6. **Start the development server**
    ```bash
    php artisan serve
    ```

## Configuration

### Environment Variables

Key environment variables to configure:

```env
APP_NAME=SeatSync
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=seatsync
DB_USERNAME=root
DB_PASSWORD=
```

### Redis Configuration (Optional)

For enhanced performance with seat holding:

```env
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Usage

### For Users

1. Browse available movies and showtimes
2. Select a screening and view theater layout
3. Choose seats interactively
4. Complete the reservation process
5. Receive confirmation with booking details

### For Administrators

1. Manage movies, theaters, and screenings
2. Monitor seat reservations and holds
3. View analytics and reporting
4. Configure pricing and seating layouts

## Architecture

### Core Components

- **Movie Management**: CRUD operations for movies and genres
- **Theater System**: Theater layouts with configurable seat arrangements
- **Screening System**: Showtime management with pricing
- **Seat Selection**: Interactive seat map with real-time status
- **Reservation System**: Booking workflow with payment integration
- **User Management**: Authentication and user profiles

### Database Schema

Key tables and relationships:

- `movies` - Movie information and metadata
- `theaters` - Theater configurations
- `screens` - Individual screens within theaters
- `seats` - Seat layouts and pricing
- `screenings` - Movie showtimes
- `reservations` - User bookings
- `seat_holds` - Temporary seat reservations

## Testing

Run the test suite:

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/SeatSelectionTest.php

# Generate coverage report
php artisan test --coverage
```

## Deployment

### Traditional Hosting

For traditional server deployment:

1. Configure web server (Nginx/Apache)
2. Set up SSL certificates
3. Configure queue workers
4. Set up scheduled tasks

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines

- Follow PSR-12 coding standards
- Write tests for all new features
- Document complex logic
- Optimize database queries
- Maintain backward compatibility

## Security

### Security Features

- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- Rate limiting
- Secure session management

### Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately to the maintainers.

## Performance Monitoring

### Key Metrics

- Page load times
- Database query counts
- Memory usage
- Response times

### Optimization Techniques

- Query optimization
- Caching strategies
- Database indexing
- Asset optimization

## Support

### Getting Help

- Create an issue for bug reports
- Start a discussion for questions
- Check existing documentation

## Acknowledgments

- Laravel Framework and ecosystem
- Livewire for reactive components
- Tailwind CSS for styling
- The open-source community
