# Import package

## Publishing file groups

### Publish all files (config, migrations, translations)
```shell
php artisan vendor:publish --tag=import
```

### Publish configurations only
```shell
php artisan vendor:publish --tag=import-config
```

### Publish translations only
```shell
php artisan vendor:publish --tag=import-translations
```

## Tests

```shell
./vendor/bin/pest
```
```shell
./vendor/bin/pint
```

```shell
./vendor/bin/pint --test
```

```shell
./vendor/bin/phpstan analyse --memory-limit=2G
```