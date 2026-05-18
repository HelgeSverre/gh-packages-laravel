# Lara Enum

Laravel custom enum utilities that add helpful attributes and helpers to your native PHP 8.1+ enums. Provides:

- A Description attribute you can place on enum cases for human-friendly labels
- A Translatable attribute to localize labels via a translation key (uses Laravel's __() helper)
- A HasEnumAttributes trait that gives you convenient helpers like label(), values(), and asOptions()


## Requirements
- PHP: ^8.4
- Illuminate Support: ^12.0 or ^13.0 (works in Laravel applications using these versions)


## Installation
Install via Composer:

```bash
composer require mahmudul/lara-enum
```

The package uses Laravel package auto-discovery. No manual provider registration is needed.


## Usage

### 1) Define your enum
Add the Description or Translatable attribute to cases and use the HasEnumAttributes trait to gain helpers.

```php
<?php

namespace App\Enums;

use Mahmudul\LaraEnum\Attributes\Description;
use Mahmudul\LaraEnum\Traits\HasEnumAttributes;

enum Status: string
{
    use HasEnumAttributes;

    #[Description('Draft')]
    case DRAFT = 'draft';

    #[Description('Published')]
    case PUBLISHED = 'published';

    // If no Description is provided, label() falls back to a humanized case name
    case IN_REVIEW = 'in_review';
}
```

#### Using Translatable (for localized labels)

```php
<?php

namespace App\Enums;

use Mahmudul\LaraEnum\Attributes\Translatable;
use Mahmudul\LaraEnum\Traits\HasEnumAttributes;

enum PaymentStatus: string
{
    use HasEnumAttributes;

    #[Translatable('enums.payment_status.pending')]
    case PENDING = 'pending';

    #[Translatable('enums.payment_status.paid')]
    case PAID = 'paid';
}

// resources/lang/en/enums.php
return [
    'payment_status' => [
        'pending' => 'Pending',
        'paid' => 'Paid',
    ],
];

// Usage (will call Laravel's __() helper under the hood):
PaymentStatus::PAID->label(); // "Paid"
```

Note: Translatable uses Laravel's __() helper, so ensure your translation keys exist.

#### Label resolution order

The label() method resolves the display label in the following priority order:

1) Translatable attribute key via __()
2) Description attribute text
3) Humanized enum value (Str::headline)

### 2) Helpers

- label(): string

```php
Status::DRAFT->label(); // "Draft"
Status::IN_REVIEW->label(); // "In Review"
```

- values(bool $asArray = false): Collection|array

```php
Status::values(); // Illuminate\Support\Collection of ["draft", "published", "in_review"]
Status::values(asArray: true); // ["draft", "published", "in_review"]
```

- asOptions(string $labelKey = 'label', string $valueKey = 'value', bool $asArray = false): Collection|array

```php
Status::asOptions();
/* Collection like:
[
    ['label' => 'Draft', 'value' => 'draft'],
    ['label' => 'Published', 'value' => 'published'],
    ['label' => 'In Review', 'value' => 'in_review'],
]
*/

Status::asOptions(labelKey: 'text', valueKey: 'id', asArray: true);
/* Array like:
[
    ['text' => 'Draft', 'id' => 'draft'],
    ['text' => 'Published', 'id' => 'published'],
    ['text' => 'In Review', 'id' => 'in_review'],
]
*/
```

These can be fed directly into form selects, API responses, etc.


## Laravel Integration
- Auto-discovered service provider: Mahmudul\LaraEnum\LaraEnumServiceProvider
- No configuration is required


## Development
- Minimum stability is set to "dev" with prefer-stable to allow framework version ranges.


## License
MIT License. See the LICENSE file (or the package metadata) for details.
