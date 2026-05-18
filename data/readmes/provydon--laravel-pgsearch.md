# 🔍 Laravel PostgreSQL Search

**Smart PostgreSQL search for Laravel with text normalization and relationship support.**

[![PHP Version](https://img.shields.io/badge/PHP-8.1%2B-blue)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%2B|11%2B|12%2B|13%2B-red)](https://laravel.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Compatible-336791)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](tests)

## ✨ Why This Package?

- 🎯 **Smart matching**: Find "Jane Doe" even when stored as "Jane-Doe"
- 📱 **Phone numbers**: Search "1234567890" matches "(123) 456-7890"
- 🔗 **Relationships**: Search across related models seamlessly
- ⚡ **PostgreSQL optimized**: Uses ILIKE and REGEXP_REPLACE for performance
- 🛡️ **Safe fallback**: Works on non-PostgreSQL databases (no-op)

## 🚀 Quick Start

### Install
```bash
composer require provydon/laravel-pgsearch
```

### Use Immediately
```php
// Search users
User::query()->pgSearch('john doe', ['name', 'email'])->get();

// Search with relationships  
Post::query()->pgSearch('jane', ['title', 'user.name'])->get();

// Phone number search
User::query()->pgSearch('1234567890', ['phone'])->get();

// Or use the helper function
pg_search(User::query(), 'john doe', ['name', 'email'])->get();
```

That's it! No configuration needed.

## 💖 Support

If this package helped you, consider supporting its development:

<a href="https://buymeacoffee.com/provydon" target="_blank" rel="noopener noreferrer">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50">
</a>

## 📖 Usage Examples

### Basic Search
```php
// Single column
User::query()->pgSearch('john', ['name'])->get();

// Multiple columns
User::query()->pgSearch('example', ['name', 'email'])->get();
```

### Relationship Search
```php
// Search posts by author name
Post::query()->pgSearch('jane doe', ['title', 'user.name'])->get();

// Search orders by customer info
Order::query()->pgSearch('smith', ['number', 'customer.name', 'customer.email'])->get();
```

### Advanced Options
```php
// Disable text normalization
User::query()->pgSearch('exact-match', ['name'], ['normalize' => false])->get();

// Disable best-match ordering (default: true)
User::query()->pgSearch('office', ['name'], ['order_by_best_match' => false])->get();

// Chain with other query methods
User::query()
    ->where('active', true)
    ->pgSearch('john', ['name'])
    ->orderBy('created_at')
    ->paginate(15);
```

### Ordering and Custom Sort

When `order_by_best_match` is enabled (default), results are ranked by relevance: exact phrase match (100) > normalized match (50) > word token match (10). This prevents generic words (e.g. "office") from returning the wrong row when multiple rows match.

**Custom ordering**: Chain your `orderBy` **after** `pgSearch()` so relevance is primary and your column is the tiebreaker:

```php
// ✓ Relevance first, then created_at
User::query()->pgSearch('john', ['name'])->orderBy('created_at', 'desc')->get();

// ✗ Your order wins; relevance only as tiebreaker
User::query()->orderBy('created_at')->pgSearch('john', ['name'])->get();
```

To disable best-match ordering entirely, pass `['order_by_best_match' => false]` or set it in config.

### Helper Function
For convenience, you can also use the `pg_search()` helper function:

```php
// Using the helper function
$users = pg_search(User::query(), 'john doe', ['name', 'email'])->get();

// With options
$users = pg_search(User::query(), 'john', ['name'], ['normalize' => false])->get();

// In controllers
public function search(Request $request)
{
    $query = User::query()->where('active', true);
    
    if ($request->has('search')) {
        $query = pg_search($query, $request->search, ['name', 'email']);
    }
    
    return $query->paginate(15);
}
```

## 🔧 Configuration (Optional)

Publish config to customize behavior:

```bash
php artisan vendor:publish --tag=pgsearch-config
```

```php
// config/pgsearch.php
return [
    'normalize' => true, // Enable smart text matching (punctuation-stripped)

    'order_by_best_match' => true, // Order results by relevance (exact match > normalized > word matches)

    // Word-based matching (on normalized text)
    // When enabled, the search term is split into tokens and each
    // significant word is also searched individually. This lets
    // "Lagos State" match a record that only contains "Lagos", etc.
    'word_based_matching' => true,

    // NEW: Common suffixes ignored as standalone tokens when doing
    // word-based matching. Useful for geographic names:
    // "Lagos State" → token "lagos" (since "state" is ignored).
    'ignore_suffixes' => [
        'state',
        'province',
        'region',
        'territory',
        'city',
        'town',
        'municipality',
    ],
];
```

## 🧠 How It Works

The package performs intelligent PostgreSQL searches:

| Search Type | SQL Example | Matches |
|-------------|-------------|---------|
| **Direct** | `name ILIKE '%john doe%'` | "John Doe", "JOHN DOE" |
| **Normalized** | `REGEXP_REPLACE(phone, '[^a-zA-Z0-9]', '', 'g') ILIKE '%1234567890%'` | "(123) 456-7890", "123-456-7890" |

### Real-World Examples

```php
// These all find the same user:
User::query()->pgSearch('Jane Doe', ['name'])->get();      // Direct match
User::query()->pgSearch('jane doe', ['name'])->get();      // Case insensitive  
User::query()->pgSearch('janedoe', ['name'])->get();       // Normalized match

// Phone number variations:
User::query()->pgSearch('1234567890', ['phone'])->get();   // Finds all these:
// "(123) 456-7890", "123-456-7890", "123.456.7890", "123 456 7890"
```

## 📋 Requirements

- **Laravel**: 10.0+, 11.0+, 12.0+, or 13.0+
- **PHP**: 8.1+
- **Database**: PostgreSQL (graceful fallback for others)

## ⚡ Performance Tips

For frequently searched columns, add expression indexes to speed up normalized searches:

```sql
-- For phone number searches
CREATE INDEX users_phone_normalized_idx 
ON users (REGEXP_REPLACE(phone::text, '[^a-zA-Z0-9]', '', 'g'));

-- For name searches  
CREATE INDEX users_name_normalized_idx 
ON users (REGEXP_REPLACE(name::text, '[^a-zA-Z0-9]', '', 'g'));
```

**Important**: Use the exact same expression as in the search query for optimal performance.

## 🧪 Testing

```bash
# Create test database
createdb pg-search

# Run tests
composer test
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
<strong>Made with ❤️ for the Laravel community</strong>
</p>