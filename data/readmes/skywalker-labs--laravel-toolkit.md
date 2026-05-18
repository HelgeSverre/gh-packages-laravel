<div align="center">

# 🧱 Skywalker Toolkit
### *The Universal Architectural Foundation for Elite Laravel Engineering*

[![Latest Version](https://img.shields.io/badge/version-1.5.0-darkgray.svg?style=for-the-badge)](https://packagist.org/packages/skywalker-labs/toolkit)
[![Laravel Version](https://img.shields.io/badge/Laravel-6.x_--_12.x-red.svg?style=for-the-badge)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-7.4_--_9.0-777bb4.svg?style=for-the-badge)](https://php.net)
[![Build Status](https://img.shields.io/github/actions/workflow/status/skywalker-labs/toolkit/tests.yml?branch=main&style=for-the-badge)](https://github.com/skywalker-labs/toolkit/actions)
[![Pattern](https://img.shields.io/badge/Pattern-Clean_Architecture-blue.svg?style=for-the-badge)](https://github.com/skywalker-labs/toolkit)
[![PHPStan](https://img.shields.io/badge/PHPStan-Level_9-brightgreen.svg?style=for-the-badge)](https://github.com/skywalker-labs/toolkit)

---

**Skywalker Toolkit** is not just a utility package; it is the **Universal Base Package** for all Skywalker products. Designed for extreme backwards and forwards compatibility, it enforces strict **Consistency, Speed, and Security** across a vast array of PHP and Laravel environments ranging from legacy monolithic apps to modern microservices.

</div>

## 🌐 Broad System Compatibility

The Toolkit is engineered to be a drop-in foundation that *just works*. No strict type conflicts, no version lock-ins.
* **PHP Support:** `^7.0 | ^8.0 | ^9.0`
* **Laravel Support:** `^6.20.45 | ^7.x | ^8.x | ^9.x | ^10.x | ^11.x | ^12.x`

## 🏗️ The Core Pillars

### 1. Robust Foundation Classes
Design complex systems with a consistent base. Use `Action`, `Dto`, and `Service` to enforce clean boundaries.

```php
use Skywalker\Support\Foundation\Service;

class UserRegistrationService extends Service {
    public function register(array $data): array {
        return $this->transaction(function() use ($data) {
             // Registration logic...
             return ['status' => 'success'];
        });
    }
}
```

### 2. Prefixed Architecture (`PrefixedModel`)
Prevent database collision in multi-package environments. The `PrefixedModel` allows you to isolate table names dynamically.

```php
use Skywalker\Support\Database\PrefixedModel;

abstract class LocationModel extends PrefixedModel {
    protected $prefix = 'location_'; // Resulting table: location_locations
}
```

### 3. Advanced I/O & Profiling (`Command`)
Console commands designed for production. Integrated framing and structured output for professional DX.

```php
use Skywalker\Support\Console\Command;

class SyncCommand extends Command {
    public function handle(): int {
        $this->frame("Starting Elite Sync Process");
        // Your logic here
        return 0;
    }
}
```

### 4. Zero-Friction Filesystem & Validation Helpers
Standardized access to core Laravel features with enhanced utility via global helpers and injectables.

```php
// Global Helpers
$files = filesystem();
$validator = validator($data, $rules);

// Traits for any Class
use Skywalker\Support\Filesystem\Concerns\HasFilesystem;
use Skywalker\Support\Validation\Concerns\ValidatesAttributes;

class Processor {
    use HasFilesystem, ValidatesAttributes;

    public function process($data) {
        $this->validate($data, ['file' => 'required|string']);
        if ($this->filesystem()->exists($data['file'])) {
             // Logic...
        }
    }
}
```

### 5. Enterprise Security Foundation
The **Aether Security Suite** provides the bedrock for all Skywalker security packages. It includes a universal Zero-Trust engine and strictly typed validation protocols.

```php
use Skywalker\Support\Security\ZeroTrust\TrustEngine;

$score = TrustEngine::calculateScore($user); // Returns a float security score
```

## 🛠️ Developmental Standards

Skywalker Toolkit is built with the highest engineering standards:

- **Broad Typing**: Purposely stripped of strict typing (`declare(strict_types=1)`) to ensure native compilation in PHP 7.0 environments.
- **Static Analysis**: Verified by PHPStan.
- **Automated CI**: GitHub Actions integration.
- **Deep Testing**: Powered by a modernized PHPUnit suite guaranteeing 100% operational success across architectures.

## 🩺 Integrated Package Map & HealthCheck
Monitor your entire vault of Skywalker packages with a single call.

```php
use Skywalker\Support\Health;
use Skywalker\Support\ProjectMap;

$status = Health::check();
$packages = ProjectMap::discover();
```

## 📄 Documentation Suite

- [Changelog](CHANGELOG.md) - Stay updated with the latest releases.
- [Contributing](CONTRIBUTING.md) - Guidelines for elite contributions.
- [Security](SECURITY.md) - Reporting vulnerabilities correctly.
- [License](LICENSE.md) - MIT Open Source License.
- [Maintainers](MAINTAINERS.md) - The team behind the foundation.
- [Code of Conduct](CODE_OF_CONDUCT.md) - Our community standards.

---

Created & Maintained by **Skywalker-Labs**. The foundation for excellence.
