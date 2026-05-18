# Laravel ENV encrypter/decrypter

Small tool to manage your .env file encryption/decryption in Laravel projects.  
The idea is to encrypt as many .env files and decrypt it when needed: so you can store your .env files in your repository without any security issue: one for local development, one for staging and one for production. The access to these files is managed through password policies.  
Moreover using automatic deployment you can decrypt the .env file on the server without any manual operation or any developer knowing password decryption.

## Installation

In your `composer.json`, append to the `repositories` array the following:

```json
    {
        "type": "vcs",
        "url": "https://github.com/jashaics/env-encrypter.git"
    }
```

If you don't have a `repositories` array, create one like this:
```json
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/jashaics/env-encrypter.git"
        }
    ]
```

Then run the following command:

```
composer require jashaics/env-encrypter
```

## Usage

### Encrypt file

To encrypt your .env file run

```php artisan env-encrypter:encrypt``` then follow the instructions

### Decrypt file

To decrypt an encrypted .env file (`.env.encrypted`) run

```php artisan env-encrypter:decrypt``` then follow the instructions
