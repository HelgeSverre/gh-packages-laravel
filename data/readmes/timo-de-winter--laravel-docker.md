# Laravel Docker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/timo-de-winter/laravel-docker.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/laravel-docker)
[![Total Downloads](https://img.shields.io/packagist/dt/timo-de-winter/laravel-docker.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/laravel-docker)
[![License](https://img.shields.io/packagist/l/timo-de-winter/laravel-docker.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/laravel-docker)

A comprehensive Laravel package that provides a complete Docker-based development environment for Laravel projects. Inspired by Laravel Sail but with additional services and optimizations for modern Laravel development.

**Note:** This package contains features that I use across almost all my projects. For a more customizable experience, consider Laravel Sail. This package is ideal if you want a full-featured development environment out of the box.

## Features

- 🐳 **Complete Docker Environment** - Pre-configured with all essential services
- 🚀 **One-Command Setup** - Get started with a single installation command  
- 🔧 **Laravel Sail Compatibility** - Familiar commands and workflow
- 📦 **Rich Service Stack** - Database, cache, email testing, search, and storage
- 🛠 **Development Tools** - Xdebug, Laravel Horizon queue processing, and more
- 🤖 **AI Tools Integration** - Optional Claude Code + Laravel Boost MCP server
- 🎯 **Optimized for Performance** - PHP 8.4, Node 22, optimized configurations

## Services Included

| Service | Purpose | Port | Admin Panel |
|---------|---------|------|-------------|
| **Application** | PHP 8.4 + Laravel | 80 | - |
| **MariaDB** | Database | 3306 | - |
| **Redis** | Cache & Sessions | 6379 | - |
| **Mailpit** | Email Testing | 1025 | http://localhost:8025 |
| **MinIO** | S3-compatible Storage | 9000 | http://localhost:8900 |
| **Meilisearch** | Full-text Search | 7700 | http://localhost:7700 |

## Requirements

- Docker & Docker Compose
- PHP 8.3+ (for local Composer operations)
- Laravel 10, 11, or 12

## Installation

### 1. Install the Package

```bash
composer require timo-de-winter/laravel-docker --dev
```

### 2. Run the Installation Command

```bash
php artisan docker:install
```

This interactive command will:
- Ask for your project name
- Ask which database service you want to use (MariaDB, MySQL, or PostgreSQL)
- Ask if you want to enable AI tools (Claude Code + Laravel Boost MCP server)
- Automatically install and configure Laravel Horizon for queue processing
- Publish Docker configuration files
- Create a custom binary script for your project
- Set up all necessary Docker services

### 3. Start Your Environment

After installation, start your development environment:

```bash
./your-project-name up -d
```

Your Laravel application will be available at http://localhost

## Usage

### Container Management

```bash
# Start all services in background
./your-project-name up -d

# Stop all services
./your-project-name down

# View service status
./your-project-name ps

# View logs
./your-project-name logs

# Follow logs for specific service
./your-project-name logs -f application
```

### Laravel Development

```bash
# Run Artisan commands
./your-project-name artisan migrate
./your-project-name artisan make:controller HomeController

# Access Laravel Tinker
./your-project-name tinker

# Run tests
./your-project-name test
./your-project-name pest
./your-project-name phpunit

# Queue processing (via Horizon) 
# Queues are automatically processed in the background via supervisor
```

### Package Management

```bash
# Composer commands
./your-project-name composer install
./your-project-name composer require vendor/package

# Node.js/NPM commands
./your-project-name npm install
./your-project-name npm run dev
./your-project-name npm run build
```

### Code Quality

```bash
# Format code with Laravel Pint
./your-project-name pint

# Run with additional options
./your-project-name pint --test
./your-project-name pint --dirty
```

### Database Operations

```bash
# Access MariaDB CLI
./your-project-name mariadb

# Run migrations
./your-project-name artisan migrate

# Seed database
./your-project-name artisan db:seed
```

### Development Tools

```bash
# Access container shell
./your-project-name shell
./your-project-name bash

# Run PHP commands
./your-project-name php -v
./your-project-name php artisan about

# Access Redis CLI  
./your-project-name redis

# Open application in browser
./your-project-name open
```

### AI Tools Integration

If you chose to enable AI tools during setup, you get access to both Claude Code and Laravel Boost:

```bash
# After starting your containers, complete Laravel Boost setup
./your-project-name artisan boost:install

# Start Claude Code session in container (if installation succeeded)
./your-project-name claude

# Note: Claude Code installation may fail during Docker build.
# If so, you can install it manually in the container:
./your-project-name shell
npm install -g @anthropic-ai/claude-code

# Laravel Boost MCP server runs automatically in the background
# providing AI agents with Laravel-specific tools and documentation
# The MCP server is accessible at the standard Laravel Boost endpoint
```

#### Laravel Boost MCP Server

Laravel Boost provides a Model Context Protocol (MCP) server with specialized Laravel tools:

```bash
# The MCP server runs automatically when AI tools are enabled
# Check supervisor status
./your-project-name shell
supervisorctl status boost-mcp

# Manual MCP server management (if needed)
./your-project-name artisan boost:mcp  # Start manually
./your-project-name artisan boost:install  # Complete Boost setup

# MCP server provides 15+ Laravel-specific tools for AI agents
# Including project inspection, documentation access, and code generation
```

### Queue Management with Horizon

Laravel Horizon is automatically installed and configured during setup:

```bash
# After Horizon installation, restart containers to enable automatic startup
./your-project-name down
./your-project-name up -d

# View Horizon dashboard (access via web browser)
# Navigate to http://localhost/horizon in your browser

# Queue processing runs automatically in the background via supervisor
# Check supervisor status in container
./your-project-name shell
supervisorctl status

# Restart Horizon if needed
./your-project-name artisan horizon:terminate
```

### Debugging with Xdebug

Enable Xdebug for debugging sessions:

```bash
# Run commands with Xdebug enabled
./your-project-name debug tinker
./your-project-name debug artisan your:command

# Or set environment variable
export XDEBUG_MODE=debug
./your-project-name artisan your:command
```

Configure your IDE to connect to `localhost:9003` for Xdebug sessions.

### Sharing Your Site

Expose your local development site using expose.dev:

```bash
# Share your site (requires expose.dev account)
./your-project-name share

# Share with subdomain
TDW_LARAVEL_DOCKER_SHARE_SUBDOMAIN=myapp ./your-project-name share
```

## Environment Configuration

The package respects standard Laravel environment variables and adds a few Docker-specific ones:

```env
# Standard Laravel
APP_PORT=80
DB_PORT=3306

# Redis Configuration (automatically configured)
REDIS_HOST=redis
REDIS_PORT=6379

# Docker-specific
XDEBUG_MODE=off                    # Set to 'debug' to enable Xdebug
VITE_PORT=5174                     # Vite development server port

# Service ports (optional overrides)
FORWARD_DB_PORT=3306
FORWARD_REDIS_PORT=6379
FORWARD_MAILPIT_PORT=1025
FORWARD_MAILPIT_DASHBOARD_PORT=8025
FORWARD_MINIO_PORT=9000
FORWARD_MINIO_CONSOLE_PORT=8900
FORWARD_MEILISEARCH_PORT=7700

# Sharing configuration
TDW_LARAVEL_DOCKER_SHARE_DASHBOARD=4040
TDW_LARAVEL_DOCKER_SHARE_SERVER_HOST="your-domain.com"
TDW_LARAVEL_DOCKER_SHARE_SUBDOMAIN=""
```

## Docker Configuration

### PHP Configuration

The container includes optimized PHP settings:
- **Upload limits**: 100M file uploads
- **OPcache**: Enabled for better performance  
- **Xdebug**: Available for debugging (disabled by default)
- **Extensions**: All common Laravel extensions included

### Container Stack

- **Base Image**: Ubuntu 24.04 LTS
- **PHP**: 8.4 with all Laravel extensions
- **Node.js**: v22 (latest LTS)
- **Composer**: Latest stable version
- **Supervisor**: For background queue processing

### Volume Mounts

- Application code: `/var/www/html`
- Vendor packages: Cached for performance
- Node modules: Cached for performance
- Database data: Persisted in Docker volumes

## Comparison with Laravel Sail

| Feature | Laravel Docker | Laravel Sail |
|---------|---------------|--------------|
| **Services** | 6 pre-configured | Customizable selection |
| **PHP Version** | 8.4 | 8.1, 8.2, 8.3 |
| **Node Version** | 22 | 18, 20 |
| **Queue Processing** | Horizon (auto-start) | Manual setup |
| **Search** | Meilisearch included | Optional |
| **Storage** | MinIO included | Optional |
| **Email Testing** | Mailpit included | Mailhog optional |
| **Setup** | One command | Requires publishing |

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :80

# Stop the service or change APP_PORT in .env
```

**Permission issues:**
```bash
# Fix file permissions
./your-project-name shell
sudo chown -R appuser:appuser /var/www/html
```

**Services not starting:**
```bash
# Check service logs
./your-project-name logs
./your-project-name logs mariadb

# Restart services
./your-project-name down
./your-project-name up -d
```

**Database connection issues:**
```bash
# Ensure database service is running
./your-project-name ps

# Check database credentials in .env
./your-project-name artisan config:show database
```

### Performance Tips

1. **Use Docker Desktop's WSL2 backend** on Windows
2. **Allocate sufficient memory** to Docker (4GB+ recommended)

## Development

### Package Development

If you want to contribute to this package:

```bash
# Clone the repository
git clone https://github.com/timo-de-winter/laravel-docker.git

# Install dependencies
composer install
```

## License

This package is open-sourced software licensed under the [MIT License](LICENSE.md).

## Credits

- **Timo de Winter** - Package author and maintainer
- **Laravel Sail** - Inspiration and base functionality

## Support

- 📧 **Email**: info@timodw.nl  
- 🐛 **Issues**: [GitHub Issues](https://github.com/timo-de-winter/laravel-docker/issues)
- 📖 **Documentation**: This README

---

**Happy coding! 🚀**
