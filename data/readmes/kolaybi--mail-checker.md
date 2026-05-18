# KolayBi Mail Checker

A Laravel package providing comprehensive e-mail validation for better email delivery.

## Features

- Validate email format and structure
- Check against disposable email domains
- Blacklist and whitelist domain support
- Integration with external validation services
    - [AbstractAPI](https://abstractapi.com/)
    - [Bouncer](https://usebouncer.com/)
    - [Emailable](https://emailable.com/)
    - [Hunter](https://hunter.io/)
    - [Kickbox](https://kickbox.com/)
    - [MailboxLayer](https://mailboxlayer.com/)
    - [Mailgun](https://mailgun.com/)
    - [NeverBounce](https://neverbounce.com/)
- Flexible configuration
- Detailed exception handling

## Installation

You can install the package via composer:

```bash
composer require kolaybi/mail-checker
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="KolayBi\Validation\Mail\ServiceProvider"
```

This will create a `mail-checker.php` configuration file in your application's config directory.

### Environment Variables

Configure the following environment variables in your `.env` file:

```env
# Local domain lists paths
MAIL_CHECKER_WHITELIST_STORAGE_PATH=data/domains/whitelisted_domains.json
MAIL_CHECKER_BLACKLIST_STORAGE_PATH=data/domains/blacklisted_domains.json
MAIL_CHECKER_DISPOSABLE_STORAGE_PATH=data/domains/disposable_domains.json
MAIL_CHECKER_DISPOSABLE_URL=https://rawgit.com/andreis/disposable-email-domains/master/domains.json

# Cache configuration
MAIL_CHECKER_LOCAL_CACHE_ENABLED=true
MAIL_CHECKER_LOCAL_CACHE_TTL=604800
MAIL_CHECKER_LOCAL_CACHE_STORE=file
MAIL_CHECKER_EXTERNAL_CACHE_ENABLED=true
MAIL_CHECKER_EXTERNAL_CACHE_TTL=86400
MAIL_CHECKER_EXTERNAL_CACHE_STORE=file

# External provider configuration
MAIL_CHECKER_FAIL_IF_NO_PROVIDERS=true
MAIL_CHECKER_EXTERNAL_PROVIDER_PRIORITY=abstract_api,mailboxlayer,mailgun
MAIL_CHECKER_EXTERNAL_TIMEOUT=10

# AbstractAPI configuration
ABSTRACT_API_EMAIL_ENDPOINT=https://emailvalidation.abstractapi.com/v1/
ABSTRACT_API_EMAIL_API_KEY=your_api_key
ABSTRACT_API_EMAIL_TIMEOUT=10

# Bouncer configuration
BOUNCER_ENDPOINT=https://api.usebouncer.com/v1.1/email/verify
BOUNCER_API_KEY=your_api_key
BOUNCER_TIMEOUT=10

# Emailable configuration
EMAILABLE_ENDPOINT=https://api.emailable.com/v1/verify
EMAILABLE_API_KEY=your_api_key
EMAILABLE_TIMEOUT=10

# Hunter configuration
HUNTER_VALIDATION_ENDPOINT=https://api.hunter.io/v2/email-verifier
HUNTER_API_KEY=your_api_key
HUNTER_TIMEOUT=10

# Kickbox configuration
KICKBOX_ENDPOINT=https://api.kickbox.com/v2/verify
KICKBOX_API_KEY=your_api_key
KICKBOX_TIMEOUT=10

# MailboxLayer configuration
MAILBOX_LAYER_ENDPOINT=https://apilayer.net/api/check
MAILBOX_LAYER_ACCESS_KEY=your_access_key
MAILBOX_LAYER_TIMEOUT=10

# Mailgun configuration
MAILGUN_VALIDATION_ENDPOINT=https://api.mailgun.net/v4/address/validate
MAILGUN_API_KEY=your_api_key
MAILGUN_TIMEOUT=10

# NeverBounce configuration
NEVER_BOUNCE_VALIDATION_ENDPOINT=https://api.neverbounce.com/v4/single/check
NEVER_BOUNCE_API_KEY=your_api_key
NEVER_BOUNCE_TIMEOUT=10
```

## Usage

### Basic Validation

```php
use KolayBi\Validation\Mail\MailChecker;
use KolayBi\Validation\Mail\Exceptions\AbstractMailException;

try {
    MailChecker::check('user@example.com');
    // Email is valid
} catch (AbstractMailException $e) {
    // Handle specific validation errors
    echo $e->getMessage();
}
```

### Simplified Boolean Check

```php
if (MailChecker::isValid('user@example.com')) {
    // Email is valid
} else {
    // Email is invalid
}
```

### Skip External Validation

```php
// Perform only local validation checks
MailChecker::check('user@example.com', skipExternalControl: true);
```

```php
// Perform only local validation checks
if (MailChecker::isValid('user@example.com', skipExternalControl: true)) {
    // Email is valid
} else {
    // Email is invalid
}
```

### Advanced Validation Methods

The package provides granular validation methods for specific checks:

```php
// Check individual validation aspects
if (MailChecker::isWhitelisted('user@example.com')) {
    // Email domain is in whitelist - trusted domain
}

if (MailChecker::isBlacklisted('user@example.com')) {
    // Email domain is explicitly blocked
}

if (MailChecker::isDisposable('user@example.com')) {
    // Email is from a temporary/disposable email provider
}

if (MailChecker::isValidFormat('user@example.com')) {
    // Email format passes validation checks
}

// Inverse methods for negative checks
if (MailChecker::isNotWhitelisted('user@example.com')) {
    // Email requires validation (not in trusted whitelist)
}

if (MailChecker::isNotBlacklisted('user@example.com')) {
    // Email is not explicitly blocked
}

if (MailChecker::isNotDisposable('user@example.com')) {
    // Email is from a permanent email provider
}

if (MailChecker::isInvalidFormat('user@example.com')) {
    // Email format is invalid
}
```

## Exception Types

The package throws specific exceptions for different validation scenarios:

- `EmptyMailException` - Email address is empty
- `InvalidMailException` - Email format is invalid
- `BlacklistedMailException` - Domain is blacklisted
- `DisposableMailException` - Domain is from a disposable email provider
- `InaccessibleMailException` - Failed external validation
- `ExternalMailProviderException` - External validation error

## Command Line Interface

Manage domain lists using artisan commands:

```bash
# Update disposable domain list from configured URL
php artisan mail-checker:update-disposable-domains

# Whitelist operations
php artisan mail-checker:update-domains --type=whitelist --add=kolaybi.com --add=newdomain.com
php artisan mail-checker:update-domains --type=whitelist --remove=oldomain.com
php artisan mail-checker:update-domains --type=whitelist --list
php artisan mail-checker:update-domains --type=whitelist --add=kolaybi.com --add=newdomain.com --remove=oldomain.com --list

# Blacklist operations  
php artisan mail-checker:update-domains --type=blacklist --add=spam.com
php artisan mail-checker:update-domains --type=blacklist --remove=notspam.com
php artisan mail-checker:update-domains --type=blacklist --list
php artisan mail-checker:update-domains --type=blacklist --add=spam.com --add=fraud.com --remove=notspam.com --list

# Cache management
php artisan mail-checker:cache-clear                            # Clear all caches
php artisan mail-checker:cache-clear --type=local               # Clear only local validation cache
php artisan mail-checker:cache-clear --type=external            # Clear only external validation cache
php artisan mail-checker:cache-clear --type=local --domain-type=whitelist  # Clear only whitelist domain cache
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/kolaybi/.github/blob/master/CONTRIBUTING.md) for details.

## License

Please see [License File](LICENSE.md) for more information.
