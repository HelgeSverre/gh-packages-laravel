# Laravel Module Architecture Package

This package contains everything you need to implement a clean, maintainable, and scalable module architecture in your Laravel application.

## What's Included

- **MODULE_ARCHITECTURE.md** - Complete documentation with best practices
- **MakeModuleCommand.php** - Artisan command to generate modules
- **Stub files** - Templates for all module components

## Installation

### 1. Copy Files to Your Laravel Project

```bash
# Copy the command
cp app/Console/Commands/MakeModuleCommand.php your-project/app/Console/Commands/

# Copy the stubs
cp -r stubs/module your-project/stubs/

# Copy the documentation
cp MODULE_ARCHITECTURE.md your-project/
```

### 2. Create Modules Directory

```bash
mkdir your-project/Modules
```

### 3. Update Composer Autoload

Add to your `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Modules\\": "Modules/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    }
}
```

Then run:

```bash
composer dump-autoload
```

## Usage

### Create a New Module

```bash
php artisan make:module Product
```

### Command Options

```bash
# Specify a different model name
php artisan make:module Catalog --model=Product

# Skip certain files
php artisan make:module Blog --skip-migration
php artisan make:module Comment --skip-factory --skip-seeder
php artisan make:module Post --skip-tests
```

### What Gets Generated

Each module includes:

- ✅ Model with proper casts and relationships
- ✅ Repository interface and implementation
- ✅ Service class for business logic
- ✅ Action classes for complex operations
- ✅ API Controller (versioned)
- ✅ Web Controller
- ✅ Form Requests (Store & Update)
- ✅ API Resources (Resource & Collection)
- ✅ Policy for authorization
- ✅ Event and Listener
- ✅ Routes (API & Web)
- ✅ Blade Views (index, show, form)
- ✅ Service Provider
- ✅ Migration
- ✅ Factory with states
- ✅ Seeder
- ✅ Feature Tests

## Quick Start

### 1. Generate Module

```bash
php artisan make:module Product
```

### 2. Register Service Provider

Add to `bootstrap/providers.php`:

```php
return [
    App\Providers\AppServiceProvider::class,
    Modules\Product\ProductServiceProvider::class,
];
```

### 3. Update Migration

Edit the generated migration in `Modules/Product/Database/migrations/`:

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->string('status')->default('active');
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('status');
});
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Test Your Module

```bash
php artisan test --filter=Product
```

### 6. Access Your API

```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

## Module Structure

```
Modules/Product/
├── Actions/
│   └── CreateProduct.php
├── Database/
│   ├── Factories/
│   │   └── ProductFactory.php
│   ├── migrations/
│   │   └── xxxx_create_products_table.php
│   └── Seeders/
│       └── ProductSeeder.php
├── Enums/
│   └── ProductStatus.php
├── Events/
│   └── ProductCreated.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/V1/
│   │   │   └── ProductController.php
│   │   └── Web/
│   │       └── ProductWebController.php
│   └── Requests/
│       ├── StoreProductRequest.php
│       └── UpdateProductRequest.php
├── Listeners/
│   └── HandleProductCreated.php
├── Models/
│   └── Product.php
├── Policies/
│   └── ProductPolicy.php
├── Repositories/
│   ├── ProductRepositoryInterface.php
│   └── EloquentProductRepository.php
├── Resources/
│   ├── ProductResource.php
│   └── ProductCollection.php
├── Services/
│   └── ProductService.php
├── Views/
│   ├── index.blade.php
│   ├── show.blade.php
│   └── form.blade.php
├── routes/
│   ├── api.php
│   └── web.php
└── ProductServiceProvider.php
```

## Architecture Principles

### 1. Separation of Concerns

- **Models** - Data structure and relationships
- **Repositories** - Data access layer
- **Services** - Business logic orchestration
- **Actions** - Single-purpose operations
- **Controllers** - HTTP request handling
- **Policies** - Authorization logic

### 2. Dependency Injection

All classes use constructor injection for dependencies:

```php
public function __construct(
    protected ProductRepositoryInterface $productRepository,
    protected CreateProduct $createProduct
) {}
```

### 3. Interface-Based Design

Repositories use interfaces for flexibility:

```php
interface ProductRepositoryInterface
{
    public function findById(int $id): ?Product;
    public function create(array $data): Product;
    // ...
}
```

### 4. Single Responsibility

Each class has one clear purpose:

```php
class CreateProduct
{
    public function execute(array $data): Product
    {
        // Only handles product creation
    }
}
```

## Best Practices

### Code Quality

- Run Pint before committing: `vendor/bin/pint`
- Use type hints everywhere
- Add PHPDoc blocks for complex methods
- Follow SOLID principles

### Testing

- Test all happy paths, failure paths, and edge cases
- Use factories for test data
- Run tests after every change
- Aim for high code coverage

### Performance

- Queue long-running operations
- Use eager loading to prevent N+1 queries
- Add database indexes for frequently queried columns
- Cache frequently accessed data

### Security

- Always validate user input
- Use policies for authorization
- Hash passwords properly
- Rate limit sensitive endpoints

## Documentation

For complete documentation, see `MODULE_ARCHITECTURE.md` which includes:

- Detailed best practices for each component
- Code examples and patterns
- Testing strategies
- Performance optimization tips
- Security guidelines
- Complete module checklist

## Requirements

- PHP 8.2+
- Laravel 12+
- Composer

## Support

For issues or questions, refer to the MODULE_ARCHITECTURE.md documentation.

## License

This architecture package is open-source and free to use in your projects.
