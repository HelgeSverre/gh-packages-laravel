# Laravel Migration Preflight

A Laravel package that validates migrations before execution to prevent schema-related failures. Catch migration errors early before they partially execute and corrupt your database.

## Why Use This?

The common problem with Laravel migrations:
- **Migration fails mid-way** → Database is half-migrated
- **Foreign keys reference non-existent tables** → Migration crashes
- **Indexes created on missing columns** → Partial table state
- **No visibility into what will break** → Costly database rollbacks

**Migration Preflight prevents all of this** by validating your migrations before execution.

## Installation

```bash
composer require samody/laravel-migration-preflight
```

## Quick Start

```bash
# Validate all pending migrations
php artisan migrate:preflight

# Get detailed error info with code context
php artisan migrate:preflight --verbose
```

## Features

### Core Validation (Original)
- ✅ **Foreign Key Validation**: Detect missing referenced tables for `foreignId()->constrained()` and `foreign()->references()->on()`
- ✅ **Table Existence Checks**: Ensure tables exist when using `Schema::table()`
- ✅ **Column Existence Checks**: Verify columns exist when using `after()`, `dropColumn()`, `renameColumn()`, `change()`
- ✅ **Smart Pluralization**: Correctly guesses referenced table names using Laravel's `Str::plural()`
- ✅ **Zero-Migration Safety**: Handles fresh databases and empty migration folders without errors

### Phase 1 Enhancements
- ✨ **Index Constraint Validation**: Detect indexes created on non-existent columns
- ✨ **Unique Constraint Validation**: Validate unique constraints reference existing columns
- ✨ **Full-Text Index Validation**: Check fullText() constraints before migration
- ✨ **Spatial Index Validation**: Validate spatialIndex() constraints
- ✨ **Line Number Tracking**: Know exactly where in your migration file the issue is
- ✨ **Verbose Mode** (`--verbose`): See code context around each error
- ✨ **Better Error Categorization**: Errors typed as `foreign_key`, `missing_table`, `index_constraint`, etc.

### Phase 2 Refinement (NEW)
- 🚀 **Block-Based Validation**: Scopes validation to individual `Schema` closures for high-precision checks
- 🎯 **Up-Method Focus**: Focuses exclusively on the `up()` method to prevent false positives in `down()` methods
- 🧱 **In-Block Creation Awareness**: Tracks columns created in the same block to avoid false errors in `after()`
- 📦 **Multi-Column Support**: Validates array-based operations like `$table->dropColumn(['col1', 'col2'])`
- 🏷️ **Closure Variable Agnosticism**: Detects and uses any closure variable name (e.g., `$table`, `$t`, `$blueprint`)
- 🔍 **Robust Table Detection**: Advanced detection handles multi-line calls and complex formatting variations

## Usage

### Basic Check
```bash
php artisan migrate:preflight
```

**Output:**
```
Running migration preflight...
Checking: 2024_01_15_123456_create_orders_table
Checking: 2024_01_15_123457_add_indexes_to_orders

Checked: 2 migrations
✓ All migrations passed preflight checks.
```

### Verbose Mode with Context
```bash
php artisan migrate:preflight --verbose
```

**Output with code context:**
```
Running migration preflight...
Verbose mode enabled

Checking: 2024_01_15_123456_create_orders_table

Preflight FAILED:

2024_01_15_123456_create_orders_table
 - [Line 18] Missing referenced table 'customers' for 'customer_id'
   ─────────────────────────────
   15: $table->decimal('amount', 10, 2);
   16: $table->timestamps();
   17:
   > 18: $table->foreignId('customer_id')->constrained();
   19: });
   ─────────────────────────────

Total errors found: 1
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=preflight-config
```

**config/preflight.php:**
```php
return [
    'strict' => true,

    'checks' => [
        'missing_tables' => true,         // Check for missing tables
        'missing_columns' => true,        // Check for missing columns
        'foreign_keys' => true,           // Check foreign key references
        'index_constraints' => true,      // Check index constraints
        'unique_constraints' => true,     // Check unique constraints
    ],
];
```

## What Gets Validated

### Supported Patterns

#### Foreign Keys ✅
```php
// Automatically pluralizes table name
$table->foreignId('user_id')->constrained();  // Looks for 'users' table

// Explicit table name
$table->foreignId('owner_id')->constrained('users');

// Manual foreign key
$table->foreign('customer_id')->references('id')->on('customers');
```

#### Constraints & Indexes ✅
```php
// Single column index
$table->index('email');

// Unique constraint
$table->unique('email');

// Multi-column unique
$table->unique(['email', 'username']);

// Full-text index
$table->fullText(['title', 'description']);

// Spatial index (MySQL)
$table->spatialIndex('coordinates');
```

#### Column Operations ✅
```php
$table->string('email')->after('name');              // Column must exist
$table->dropColumn('old_field');                     // Column must exist
$table->renameColumn('old_name', 'new_name');        // Column must exist
$table->string('email')->change();                   // Column must exist
```

#### Table Modifications ✅
```php
Schema::table('users', function ($table) {           // Table must exist
    $table->string('new_field')->default('N/A');
});
```

## Example Output

### Scenario: Multiple Errors
```
Preflight FAILED:

2024_01_15_create_orders_table
 - [Line 12] Table 'customers' does not exist
 - [Line 15] Column 'user_id' does not exist on table 'orders' (used in unique())
 - [Line 18] Missing referenced table 'companies' for 'company_id'

2024_01_15_add_indexes
 - [Line 8] Column 'email' does not exist on table 'users' (used in index())

Total errors found: 4
```

## Exit Codes

- **0**: Success - All migrations passed preflight checks
- **1**: Failure - Validation errors found

## CI/CD Integration

```bash

#!/bin/bash
php artisan migrate:preflight
if [ $? -ne 0 ]; then
    echo "❌ Migration validation failed!"
    exit 1
fi
echo "✅ All migrations validated successfully"
```

## Testing

```bash
vendor/bin/phpunit tests/ --no-coverage
```

**Test Coverage:**
- 30 tests covering all validation scenarios
- Unit tests for constraint parsing
- Feature tests for end-to-end validation
- Reproduction tests for reported issues

## Limitations & Future Enhancements

### Current Limitations
- Does not validate data type compatibility between foreign keys
- Does not detect circular foreign key dependencies
- Does not validate cascading delete implications
- Does not check database-specific constraints

### Roadmap
- [ ] Phase 2: JSON/CSV export formats
- [ ] Phase 3: Data type compatibility checks
- [ ] Phase 4: Migration dependency detection
- [ ] Phase 5: CI/CD GitHub Actions integration

## Real-World Benefits

### Development
✅ Catch migration errors before they cause issues
✅ Know exact line number of the problem
✅ See code context immediately
✅ Iterate faster without database rollbacks

### Staging/Production
✅ Validate migrations before production deployments
✅ Prevent partial database state corruption
✅ CI/CD pipeline integration
✅ Zero downtime verification

### Team Collaboration
✅ Code reviewers can run preflight checks
✅ Catch common mistakes in PRs
✅ Standardize migration best practices
✅ Reduce back-and-forth on deployment issues

## License

MIT - See LICENSE.md for details

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/samody/laravel-migration-preflight/issues)
- 📧 Email: samody2006@gmail.com
- ⭐ Please star if this package helps you!

---

**Made with ❤️ to prevent database nightmares**


