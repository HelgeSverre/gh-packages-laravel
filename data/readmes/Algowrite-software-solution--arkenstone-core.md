# Arkenstone Core
Laravel based E Commerce Feature targetted Web Application.

##  Requirements

- PHP >= 8.2
- Laravel >= 10.0 (automatically handled via Orchestra Testbench)

## Installation

### 1. Install via Composer

```bash
composer require arkenstone/core
```

### 2. Publish Configuration (Recommended for production )

```bash
php artisan vendor:publish --tag=arkenstone-config
```

This creates `config/arkenstone.php` in your Laravel app.

### 3. Publish Migrations (Recommended for production )

```bash
php artisan vendor:publish --tag=arkenstone-migrations
```

This copies all migration files to `database/migrations/` in your Laravel app.

### 4. Publish everything Just one command (Recommended for development)

# Publish everything

```bash
php artisan vendor:publish --provider="Arkenstone\Core\CoreServiceProvider"
```

# Or by tag
```bash
php artisan vendor:publish --tag=arkenstone
```
### 5. Run Migrations

```bash
php artisan migrate
```

This creates the following tables:
- `brands`
- `categories`
- `taxonomy_types`
- `taxonomies`
- `products`
- `product_images`
- `product_categories`
- `product_taxonomies`

### 6. Configure Environment Variables

Add to your `.env`:

```env
ARKENSTONE_CORE_ENABLED=true
ARKENSTONE_CORE_PREFIX=api/v1
ARKENSTONE_IMAGE_DISK=public
ARKENSTONE_IMAGE_PATH=products/images
ARKENSTONE_IMAGE_MAX_SIZE=5120
```

### 7. Setup Storage

```bash
php artisan storage:link
```

