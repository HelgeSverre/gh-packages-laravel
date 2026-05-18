# laravel-nbvcxz

A Laravel password strength package.

## Acknowledgements

This package draws inspiration from the following projects:

- https://github.com/ziming/laravel-zxcvbn
- https://github.com/GoSimpleLLC/nbvcxz

## Pre-Release Status

This package is currently in alpha (`0.1.0-alpha.1`).

- Public repository: yes
- API stability guarantee: not yet
- Recommended use: evaluation and early feedback

Breaking changes may occur until `1.0.0`.

## Current Scope

- Offline checks only (no HIBP integration yet)
- Matchers: dictionary, sequence, repeat
- English feedback only
- Laravel integration: service provider, dependency injection, validation rule

## Installation

### Option A: Early testing from GitHub (recommended during alpha)

Add a VCS repository entry in your application's `composer.json`:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "https://github.com/khattaksd/laravel-nbvcxz"
    }
  ]
}
```

Then require the package from the main branch:

```bash
composer require khattaksd/laravel-nbvcxz:dev-main
```

### Option B: Tagged alpha releases

Once tags are published and indexed, install with an alpha constraint:

```bash
composer require khattaksd/laravel-nbvcxz:^0.1@alpha
```

Publish config:

```bash
php artisan vendor:publish --tag=nbvcxz-config
```

## Usage

### Dependency Injection (Recommended)

```php
use Khattaksd\Nbvcxz\Nbvcxz;

class PasswordController {
    public function __construct(private Nbvcxz $nbvcxz) {}

    public function validate(Request $request) {
        $result = $this->nbvcxz->estimate($request->password);

        $result->score;     // 0..4
        $result->entropy;   // float
        $result->feedback;  // array of feedback keys
        $result->matches;   // array of PasswordMatch objects with message metadata
    }
}
```

### Validation Rule

```php
use Khattaksd\Nbvcxz\Rules\Strength;

// Default failure message key: nbvcxz.feedback.weak
'password' => ['required', 'string', new Strength(minScore: 3)]

// Or provide a host-translated message directly:
'password' => ['required', 'string', new Strength(minScore: 3, message: trans('validation.custom.password.weak'))]
```

The `Strength` rule is intentionally generic: it indicates the password failed the strength requirement, while exact matcher-specific reasons are exposed through `Nbvcxz::estimate()`.

Use `estimate()` to inspect `feedback` keys and `matches` if you need the precise weak-pattern diagnosis.

### Manual Estimation (Alternative)

```php
$result = app(\Khattaksd\Nbvcxz\Nbvcxz::class)->estimate('MyPassword123');

$result->score;   // 0..4
$result->entropy; // float
$result->feedback;
```

## Config

```php
return [
    'minimum_score' => 3,
    'enabled_matchers' => ['dictionary', 'sequence', 'repeat'],
    'active_dictionaries' => ['passwords', 'english_words'],
];
```

## Testing
 see `TESTING.md`

## Agent Guidance

This repository’s `README.md` is the primary human-facing guide and is also a useful reference for developer assistants or GitHub Copilot workflows. For consistent behavior across machines, keep essential test/run instructions and project conventions in version-controlled docs such as this file or `TESTING.md`.

If you use GitHub Copilot instructions or other tool-specific config, store those files inside the repo (`.github/`, `.vscode/`, or a dedicated docs file) so they travel with the repository and remain available across sessions.

## Roadmap

- `0.2.x`: Date/Year/Spatial matchers and larger dictionaries
- `0.3.x`: optional HIBP module (k-anonymity range checks)
- `1.0.0`: API freeze after alpha/beta feedback cycle
