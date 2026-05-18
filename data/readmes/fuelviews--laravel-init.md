# Laravel Init Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-init.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-init)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-init/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-init/actions/workflows/run-tests.yml?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-init/php-cs-fixer.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-init/actions/workflows/php-cs-fixer.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-init.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-init)
[![PHP Version](https://img.shields.io/badge/PHP-^8.3-blue.svg?style=flat-square)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-^10|^11|^12-red.svg?style=flat-square)](https://laravel.com)

A comprehensive Laravel initialization toolkit that streamlines the setup of Laravel applications with modern frontend tooling, SEO optimization, and the complete Fuelviews ecosystem.

## Requirements

- PHP ^8.3
- Laravel ^10.0 || ^11.0 || ^12.0  
- Node.js (for frontend tooling)
- Composer

## Installation

Install the package via Composer:

```bash
cd test
```

## Quick Start

### Complete Setup (Recommended)

Initialize your entire Laravel application with one command:

```bash
php artisan init:install --force
```

## Available Commands

### Core Commands

| Command | Description | Flags |
|---------|-------------|-------|
| `init:install` | Complete Laravel application setup | `--force`, `--dev` |
| `init:status` | Check installation status | None |

### Individual Component Commands

| Command | Description | What it installs/configures |
|---------|-------------|------------------------------|
| `init:changelog` | Create project changelog | `CHANGELOG.md` with project details |
| `init:composer-packages` | Install Composer packages | Fuelviews ecosystem + SEO packages |
| `init:env` | Configure environment | `.env` with Herd integration |
| `init:git-dot-files` | Setup Git configuration | `.gitattributes`, `.gitignore` |
| `init:images` | Optimize images | Process `public/images/` directory |
| `init:prettier` | Install Prettier | Code formatting with Blade support |
| `init:tailwindcss` | Install TailwindCSS | Complete CSS framework setup |
| `init:vite` | Install Vite | Modern build tool configuration |

All individual commands support `--force` and `--dev` flags.

## What Gets Installed

### Composer Packages

**Fuelviews Ecosystem:**
- `fuelviews/laravel-sabhero-wrapper` - Blog management
- `fuelviews/laravel-cloudflare-cache` - CDN integration  
- `fuelviews/laravel-robots-txt` - SEO robots management
- `fuelviews/laravel-sitemap` - XML sitemap generation

**Third-Party Packages:**
- `ralphjsmit/laravel-seo` - Advanced SEO features
- `ralphjsmit/laravel-glide` - Image manipulation
- `livewire/livewire` - Full-stack framework
- `spatie/laravel-google-fonts` - Font optimization
- `spatie/image-optimizer` - Image optimization

### Node.js Packages

**Build Tools:**
- Vite with Laravel plugin
- PostCSS with Autoprefixer

**TailwindCSS Ecosystem:**
- TailwindCSS v3.4.17
- Forms and Typography plugins
- Custom Fuelviews color scheme

**Development Tools:**
- Prettier with Blade and Tailwind plugins
- Format scripts for automated code styling

### Configuration Files

| File | Purpose | Customizations |
|------|---------|----------------|
| `vite.config.js` | Build configuration | Laravel integration, hot reload |
| `tailwind.config.js` | CSS framework | Fuelviews branding, Ubuntu fonts |
| `postcss.config.js` | CSS processing | TailwindCSS + Autoprefixer |
| `resources/css/app.css` | Base styles | Tailwind imports, Alpine.js ready |
| `.prettierrc` | Code formatting | Blade template support |
| `.env` | Environment | Laravel Herd integration |
| `CHANGELOG.md` | Project changelog | Auto-generated with project info |

## Development vs Production Mode

### Standard Mode (Default)
```bash
php artisan init:install
```

- Installs stable versions of all packages
- Production-ready configuration
- Stable version constraints (e.g., `^1.0`, `^0.0`)

### Development Mode
```bash  
php artisan init:install --dev
```
- Installs `dev-main` versions of **Fuelviews packages only**
- Other packages remain at stable versions
- Uses `--prefer-source` for easier contribution
- Ideal for Fuelviews package development

## Advanced Usage

### Status Checking

Check your installation status anytime:

```bash
php artisan init:status
```

This provides a comprehensive report showing:
- ✓Installed packages and versions
- ✓Configuration file status  
- ✓Node package installation
- ✓Available stub files

### Image Optimization

Process and optimize images in your `public/images/` directory:

```bash
php artisan init:images
```

Features:
- Fixes file extensions based on actual MIME types
- Converts filenames to lowercase  
- Optimizes file sizes (reports savings)
- Creates backups when using `--force`
- Skips optimization if savings < 3KB

Optional: Install image optimization binaries on macOS:

```bash
brew install jpegoptim optipng pngquant gifsicle webp libavif
npm install -g svgo
```

### Selective Installation

Use Laravel's publishing system for selective installation:

```bash
# Publish only Vite configuration
php artisan vendor:publish --tag=init-vite

# Publish only TailwindCSS configuration  
php artisan vendor:publish --tag=init-tailwind

# Publish all configuration files
php artisan vendor:publish --tag=init-all
```

## Laravel Herd Integration

This package is optimized for Laravel Herd development:

- Automatically configures `.test` domain URLs
- Sets up HTTPS with `herd secure`
- Configures proper environment variables
- Works seamlessly with Herd's PHP version management

## Configuration

### TailwindCSS Customization

The package includes a custom TailwindCSS configuration with Fuelviews branding:

```js
// Custom color scheme
colors: {
  prime: '#991b1b',      // Primary brand color
  alt: '#059669',        // Alternative accent  
  cta: '#dc2626',        // Call-to-action
  background: '#f8fafc', // Page background
  // ... plus all default Tailwind colors
}

// Custom fonts  
fontFamily: {
  sans: ['Ubuntu', 'ui-sans-serif', 'system-ui'],
}
```

### Vite Configuration

Includes Laravel-optimized Vite setup:

```js
// Hot reload paths
input: [
  'resources/css/app.css',
  'resources/js/app.js',
  'resources/views/**/*.blade.php',
  'app/Livewire/**/*.php',
  'app/Filament/**/*.php'
],

// Environment detection
server: {
  host: '0.0.0.0',
  hmr: { host: 'localhost' },
  https: detectTLS(),
}
```

## Package Architecture

### Commands Structure
- **BaseInitCommand**: Abstract base with common functionality
- **Traits**: Shared functionality (shell commands, Node packages, file publishing)
- **Service Provider**: Laravel integration and command registration
- **Facade**: Easy access to package functionality

### Design Patterns
- **Command Pattern**: Each installation component as separate command
- **Template Method**: Base command with customizable steps
- **Facade Pattern**: Simplified API access
- **Strategy Pattern**: Different installation modes (dev vs production)

## Testing

The package includes comprehensive tests:

```bash
composer test
```

Test coverage includes:
- Command functionality and flags
- Package version logic (dev vs stable)
- Service integration
- Configuration file generation
- Installation status validation

## Troubleshooting

### Common Issues

**Memory exhaustion during testing:**
- Tests use lightweight integration approach
- Complex mocking is avoided to prevent memory issues

**Node packages not installing:**
- Ensure Node.js is installed and accessible
- Check that `package.json` exists in project root
- Run `npm install` manually if needed

**Permission errors:**
- Ensure write permissions for project directory
- Use `--force` flag to overwrite protected files

**Laravel Herd integration:**
- Ensure Herd is installed and running
- Check that project is in Herd's directory
- Verify `.test` domain resolution

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Joshua Mitchener](https://github.com/thejmitchener) - Lead Developer
- [Daniel Clark](https://github.com/sweatybreeze) - Contributor
- [Fuelviews](https://github.com/fuelviews) - Organization
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
