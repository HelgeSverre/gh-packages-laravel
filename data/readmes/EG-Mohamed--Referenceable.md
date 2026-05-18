# Referenceable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/eg-mohamed/referenceable.svg?style=flat-square)](https://packagist.org/packages/eg-mohamed/referenceable)
[![Total Downloads](https://img.shields.io/packagist/dt/eg-mohamed/referenceable.svg?style=flat-square)](https://packagist.org/packages/eg-mohamed/referenceable)

An advanced Laravel package for making models referenceable with customizable reference numbers, flexible formats, sequential numbering, template-based generation, and comprehensive configuration options.

## ✨ Features

- **Multiple Generation Strategies**: Random, sequential, and template-based reference generation
- **Highly Configurable**: Extensive configuration options for prefixes, suffixes, separators, and more
- **Template System**: Use placeholders like `{YEAR}`, `{MONTH}`, `{SEQ}`, `{RANDOM}` for complex formats
- **Sequential Numbering**: Auto-incrementing sequences with reset options (daily, monthly, yearly)
- **Validation & Verification**: Built-in reference validation and uniqueness checking
- **Collision Handling**: Automatic collision detection and resolution
- **Multi-Tenancy Support**: Tenant-aware reference generation
- **Artisan Commands**: Comprehensive CLI tools for management and maintenance
- **Performance Optimized**: Caching, batch processing, and database transactions
- **Laravel 10-13 Ready**: Full compatibility with the latest Laravel versions

## 🚀 Installation

Install the package via Composer:

```bash
composer require eg-mohamed/referenceable
```

Install the package (creates necessary tables and publishes config):

```bash
php artisan referenceable:install
```

## 📋 Quick Start

### 1. Add Reference Column to Migration

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('reference')->unique()->index(); // Add reference column
    $table->timestamps();
});
```

### 2. Use the Trait in Your Model

```php
use MohamedSaid\Referenceable\Traits\HasReference;

class Order extends Model
{
    use HasReference;
    
    protected $fillable = ['total', 'customer_id'];
}
```

### 3. Generate References Automatically

```php
$order = Order::create([
    'customer_id' => 1,
    'total' => 99.99,
]);

echo $order->reference; // Outputs: "AB12CD34" (random strategy)
```

## 🛠 Configuration

### Generation Strategies

Choose from three powerful generation strategies:

#### Random Strategy (Default)
```php
// In your model
protected $referenceStrategy = 'random';
protected $referencePrefix = 'ORD';
protected $referenceLength = 6;
protected $referenceCase = 'upper';

// Generates: ORD-AB12CD
```

#### Sequential Strategy
```php
// In your model
protected $referenceStrategy = 'sequential';
protected $referencePrefix = 'INV';
protected $referenceSequential = [
    'start' => 1000,
    'min_digits' => 6,
    'reset_frequency' => 'yearly', // never, daily, monthly, yearly
];

// Generates: INV-001000, INV-001001, INV-001002...
```

#### Template Strategy
```php
// In your model
protected $referenceStrategy = 'template';
protected $referenceTemplate = [
    'format' => '{PREFIX}{YEAR}{MONTH}{SEQ}',
    'sequence_length' => 4,
];
protected $referencePrefix = 'ORD';

// Generates: ORD20240001, ORD20240002...
```

### Available Template Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{PREFIX}` | Custom prefix | `ORD` |
| `{SUFFIX}` | Custom suffix | `2024` |
| `{YEAR}` | 4-digit year | `2024` |
| `{YEAR2}` | 2-digit year | `24` |
| `{MONTH}` | 2-digit month | `03` |
| `{DAY}` | 2-digit day | `15` |
| `{SEQ}` | Sequential number | `0001` |
| `{RANDOM}` | Random string | `AB12` |
| `{MODEL}` | Model class name | `Order` |
| `{TIMESTAMP}` | Unix timestamp | `1640995200` |

### Model-Level Configuration

```php
class Order extends Model
{
    use HasReference;
    
    // Basic configuration
    protected $referenceColumn = 'order_number';     // Column name
    protected $referenceStrategy = 'template';       // random, sequential, template
    protected $referencePrefix = 'ORD';              // Prefix
    protected $referenceSuffix = '';                 // Suffix
    protected $referenceSeparator = '-';             // Separator
    
    // Random strategy options
    protected $referenceLength = 8;                  // Random part length
    protected $referenceCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    protected $referenceExcludedCharacters = '01IOL'; // Avoid confusing chars
    protected $referenceCase = 'upper';              // upper, lower, mixed
    
    // Sequential strategy options
    protected $referenceSequential = [
        'start' => 1,
        'min_digits' => 6,
        'reset_frequency' => 'yearly', // never, daily, monthly, yearly
    ];
    
    // Template strategy options
    protected $referenceTemplate = [
        'format' => '{PREFIX}{YEAR}{MONTH}{SEQ}',
        'random_length' => 4,
        'sequence_length' => 4,
    ];
    
    // Validation options
    protected $referenceValidation = [
        'pattern' => '/^ORD-\d{4}-\w{6}$/', // Custom regex pattern
        'min_length' => 8,
        'max_length' => 20,
    ];
    
    // Advanced options
    protected $referenceUniquenessScope = 'model';   // global, model, tenant
    protected $referenceTenantColumn = 'company_id'; // For tenant-aware uniqueness
    protected $referenceCollisionStrategy = 'retry'; // retry, fail, append
    protected $referenceMaxRetries = 100;
}
```

### Global Configuration

Configure defaults in `config/referenceable.php`:

```php
return [
    'strategy' => 'random',
    'column_name' => 'reference',
    
    // Random generation options
    'length' => 6,
    'prefix' => '',
    'suffix' => '',
    'separator' => '-',
    'characters' => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'excluded_characters' => '01IOL',
    'case' => 'upper',
    
    // Sequential generation options
    'sequential' => [
        'start' => 1,
        'min_digits' => 6,
        'reset_frequency' => 'never',
        'counter_table' => 'model_reference_counters',
    ],
    
    // Template generation options
    'template' => [
        'format' => '{PREFIX}{YEAR}{MONTH}{SEQ}',
        'random_length' => 4,
        'sequence_length' => 4,
    ],
    
    // Validation options
    'validation' => [
        'enabled' => true,
        'min_length' => 3,
        'max_length' => 50,
    ],
    
    // Uniqueness and collision handling
    'uniqueness_scope' => 'model', // global, model, tenant
    'collision_strategy' => 'retry',
    'max_retries' => 100,
    
    // Performance options
    'performance' => [
        'cache_config' => true,
        'cache_ttl' => 60,
        'use_transactions' => true,
        'batch_size' => 100,
    ],
];
```

## 🔧 Advanced Usage

### Manual Reference Generation

```php
// Generate without saving
$reference = $order->generateReference();

// Regenerate existing reference
$newReference = $order->regenerateReference(save: true);

// Check if model has reference
if ($order->hasReference()) {
    echo "Reference: " . $order->reference;
}
```

### Reference Validation

```php
// Validate current reference
if ($order->validateReference()) {
    echo "Valid reference";
}

// Validate specific reference
if ($order->validateReference('ORD-123456')) {
    echo "Valid format";
}
```

### Query Scopes

```php
// Find by reference
$order = Order::findByReference('ORD-123456');

// Models with references
$ordersWithRefs = Order::withReference()->get();

// Models without references
$ordersWithoutRefs = Order::withoutReference()->get();

// References starting with prefix
$todayOrders = Order::referenceStartsWith('ORD-2024')->get();
```

### Batch Operations

```php
use MohamedSaid\ModelReference\ModelReference;

$modelReference = app(ModelReference::class);

// Generate multiple references
$references = $modelReference->generateBatch(Order::class, 100);

// Validate multiple references
$results = $modelReference->validateBulk($references->toArray());

// Get statistics
$stats = $modelReference->getStats(Order::class);
```

## 🎯 Artisan Commands

### Installation & Setup

```bash
# Install package and create tables
php artisan referenceable:install

# Force reinstallation
php artisan referenceable:install --force
```

### Reference Management

```bash
# Generate references for records without them
php artisan referenceable:generate "App\Models\Order"
php artisan referenceable:generate "App\Models\Order" --dry-run
php artisan referenceable:generate "App\Models\Order" --batch=500

# Validate existing references
php artisan referenceable:validate "App\Models\Order"
php artisan referenceable:validate "App\Models\Order" --fix

# Regenerate references (use with caution!)
php artisan referenceable:regenerate "App\Models\Order" --id=123
php artisan referenceable:regenerate "App\Models\Order" --all --dry-run

# Show reference statistics
php artisan referenceable:stats "App\Models\Order"
php artisan referenceable:stats "App\Models\Order" --json
```

### Package Information

```bash
# Show available commands
php artisan referenceable
php artisan referenceable --list
```

## 📊 Multi-Tenancy Support

For multi-tenant applications:

```php
class Order extends Model
{
    use HasReference;
    
    protected $referenceUniquenessScope = 'tenant';
    protected $referenceTenantColumn = 'company_id';
    
    // References will be unique per company
}
```

## ⚡ Performance Optimization

### Database Indexes

```php
Schema::table('orders', function (Blueprint $table) {
    $table->index('reference');
    $table->index(['company_id', 'reference']); // For multi-tenant
});
```

### Configuration Caching

```php
// In config/referenceable.php
'performance' => [
    'cache_config' => true,  // Cache model configurations
    'cache_ttl' => 60,       // Cache for 60 minutes
    'use_transactions' => true, // Use DB transactions
    'batch_size' => 100,     // Batch size for bulk operations
],
```

## 🏗 Migration Guide

### From v1.x to v2.x

1. Run the installation command:
```bash
php artisan referenceable:install
```

2. Update your models to use new configuration format:
```php
// Old format
protected $referenceLength = 8;

// New format (still supported for backward compatibility)
protected $referenceLength = 8;

// Or use new configuration array
protected $referenceTemplate = [
    'format' => '{PREFIX}{RANDOM}',
    'random_length' => 8,
];
```

3. Test your references:
```bash
php artisan referenceable:validate "App\Models\Order"
```

## 🧪 Testing

```bash
composer test
```

## 📈 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## 🤝 Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## 🔒 Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## 🏆 Credits

- [Mohamed Said](https://github.com/EG-Mohamed)
- [All Contributors](../../contributors)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
