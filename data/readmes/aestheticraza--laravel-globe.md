<div align="center">
    <h1>🌍 LaravelGlobe</h1>
    <p><b>Enterprise-Grade, Fully Independent Geographic & Localization Package for Laravel</b></p>
    <br>
</div>

**LaravelGlobe** is a highly normalized, strictly typed, and independently maintained geographic engine for Laravel. Instead of relying on bloated external APIs (which cause rate limits and slow load times), LaravelGlobe ships with its own proprietary internal JSON datasets for **Countries, States, 150,000+ Cities, Currencies, Timezones, and Postal Codes**.

This package gracefully solves geographical overlap anomalies via **Advanced Many-to-Many Pivot tables** (e.g., countries with multiple timezones, border-cities with dual currencies).

---

## 🚀 Why LaravelGlobe? (The Benefits)

- **Massive Offline Dataset**: 250 Countries, 4,963 States, 148,000+ Cities, 423 Timezones, 162 Currencies, and 5,000+ Postal Codes—all bundled internally!
- **Zero OOM (Out of Memory) & High Performance**: `LaravelGlobeSeeder` imports over 150,000 records without crashing PHP by disabling exact MySQL FK checks, chunking the massive city data into 10 smaller JSON buffers, and using raw batch DB inserts.
- **Advanced M-to-M Pivot Relationships**: 
  - `country_currency` (e.g., Zimbabwe uses USD, ZWL, and ZAR).
  - `country_timezone` (e.g., the United States and Russia span multiple timezones).
  - `city_timezone` & `state_timezone` (Accurate boundary timezone overrides).
  - `city_currency` (Border cities like Geneva accept dual currencies: CHF + EUR).
- **Instant Eloquent Inheritance**: Attach the elegant `HasLocation` Trait across any Model in your system (User, Employee, Order) to inherit massive geographic scopes.
- **Geospatial Proximity Search**: Use trigonometric calculations natively via `scopeNearby($lat, $lng, $radius)`. It utilizes `ST_Distance_Sphere` on MySQL 5.7+ or falls back to a robust Haversine formula automatically.

---

## 💻 Installation

1. **Install the Package via Composer**:
   ```bash
   composer require aestheticraza/laravelglobe
   ```

2. **Run the Automated Master Install Command**:
   This powerful command auto-publishes properties, bindings, caching setups, and migrations. Then it automatically asks to run `migrate` and triggers the chunked data seeders—all within one console execution.
   ```bash
   php artisan globe:install
   ```

---

## 🛠️ Practical Real-World Examples

Here is how you actually use LaravelGlobe's data efficiently in your own application modules.

### Example 1: The `HasLocation` Trait (Users & Orders)
You can assign geographical behavior to any application model instantly. Add `use HasLocation;` to a `User`, `Employee`, or `Order` model.

**Step 1: In your migration**, just ensure your table has `country_id`, `state_id`, and `city_id` columns.
**Step 2: In your Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Aestheticraza\LaravelGlobe\Traits\HasLocation;

class Order extends Model 
{
    use HasLocation;
}
```

**Step 3: Access it in your Controllers!**
```php
$order = Order::find(1);

// Standard Relational Lookups
echo $order->country->name; // e.g. "Pakistan"
echo $order->state->name;   // e.g. "Punjab"
echo $order->city->name;    // e.g. "Lahore"

// Dynamic Virtual Accessors (Provided by the Trait)
echo $order->full_address;           // "Lahore, Punjab, Pakistan"
echo $order->country->emoji;         // "🇵🇰"
echo $order->country->phone_code;    // "+92"
```

### Example 2: Finding Nearby Entities (Spatial SQL Search)
When building food delivery apps, cab services, or store locators, you often need to find objects within an `X` kilometer radius. LaravelGlobe does the heavy math for you.

```php
// Fetch all "active" delivery riders within 25 KM of a customer's drop-off coordinates
$ridersNearMe = Rider::where('status', 'active')
                    ->withinRadius($customerLat, $customerLng, 25)
                    ->get();

// Find the closest branch of a restaurant chain natively!
$closestBranch = RestaurantBranch::withinRadius(31.5204, 74.3587, 10)->first();
```

### Example 3: Pivot Tables (Resolving Currencies & Timezones)
A Country does not always have just 1 Currency or 1 Timezone. LaravelGlobe introduces native Pivot Tables so your app can support enterprise payment architectures logic out of the box.

```php
use Aestheticraza\LaravelGlobe\Models\Country;

$country = Country::where('iso2', 'US')->first();

// Loop through all Official Timezones for the USA (EST, PST, CST, MST, etc.)
foreach ($country->timezones as $timezone) {
    echo $timezone->zone_name . ' (' . $timezone->abbreviation . ')' . PHP_EOL;
}

// Loop through officially accepted Currencies (e.g. Panama uses PAB and USD)
$panama = Country::where('iso2', 'PA')->first();
foreach ($panama->currencies as $currency) {
    echo $currency->code . ' - ' . $currency->symbol; 
}
```

### Example 4: Deep Geography & Postal Codes
Need to know the specific Latitude/Longitude and Postal Codes of a City without an external API request?

```php
use Aestheticraza\LaravelGlobe\Models\City;

$city = City::where('name', 'Karachi')->with('postalCodes')->first();

echo $city->latitude;  // 24.8607
echo $city->longitude; // 67.0011

// Fetch Postal Code arrays!
foreach($city->postalCodes as $postal) {
    echo "Area: " . $postal->area_name . " | Code: " . $postal->code;
}
```

---

## 🖥️ Intelligent CLI Commands

We treat Database Syncing and Control very seriously. LaravelGlobe brings tailored Artisan commands:

```bash
# 1. Dashboard View: Check if all 148k+ cities and 250 countries are fully seeded
php artisan globe:status

# 2. Export local DB geographic custom updates securely as an external JSON backup
php artisan globe:export --only-active

# 3. Upsert custom geographic changes back into DB WITHOUT breaking primary keys
php artisan globe:import --mode=upsert --preserve-user-data

# 4. Safe Total Wiping (To remove all tables, migrations, and pivots safely)
php artisan globe:uninstall
```
*(Note for Uninstall: This permanently wipes all populated geographic package data. A confirmation prompt will prevent accidental data loss.)*

---

## ⚙️ Configuration & Performance Tuning

Toggling massive modules or adjusting the internal caching is just a boolean away in your `config/laravelglobe.php`:

```php
'features' => [
    'enable_postal_codes' => true,
    'enable_border_currencies' => true,
    'enable_geospatial' => true,      // Disable if you don't need Lat/Lng Spatial queries
],
'performance' => [
    'cache_ttl' => 86400,             // Cache lookups for 24 hours
    'chunk_size' => 1000,             // Memory safe insertion batch size
    'nearby_default_radius' => 10,    // Default KM distance for spatial traits
],
```

---

## 🌐 Data Sources & Integrity
All structured underlying JSON buffers (`/data/cities/chunk_*.json`, `custom_countries.json`, etc.) originate from validated `country-state-city` and `REST Countries` data engines. **They are shipped completely offline inside this package**, meaning your production API servers will never be blocked by 3rd party rate limits or downtime.

---

## 🛡️ Author & License
**Developed by:** [Ali Raza (@aestheticraza)](https://github.com/aestheticraza)  
**Email:** aesthetic.raza@gmail.com  

Proprietary & Independent Geographic Engine. Maintained securely for Enterprise scaling Laravel applications.
