# Laravel SQL Logger

A lightweight package to log SQL queries in your Laravel application; perfect for debugging and performance analysis during development.

## Installation

Install via Composer:

```bash
composer require hesamrad/laravel-sql-logger --dev
```

The package will automatically register its service provider.

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="HesamRad\LaravelSqlLogger\LaravelSqlLoggerServiceProvider"
```

This will create `config/sql-logger.php` config file.

## Usage

Once installed and configured, SQL logging will automatically start based on your configuration.

### Viewing Logs

SQL queries are logged to `storage/logs/sql.log` by default. You can view them with:

```bash
# Tail the log file (Linux/Mac)
tail -f storage/logs/sql.log

# View entire log
cat storage/logs/sql.log
```

### Example Output

```
[2024-01-15 10:30:45] [2.5ms] select * from `users` where `email` = ? ["user@example.com"]
[2024-01-15 10:30:45] [1.2ms] select * from `posts` where `user_id` = ? [1]
[2024-01-15 10:30:45] [0.8ms] select * from `comments` where `post_id` in (?, ?, ?) [1, 2, 3]
------------------------------------------------------------
[2024-01-15 10:31:12] [3.1ms] insert into `users` (`name`, `email`) values (?, ?) ["John Doe", "john@example.com"]
[2024-01-15 10:31:12] [1.5ms] select * from `users` where `id` = ? [42]
------------------------------------------------------------
```

## Troubleshooting

### Log file not created
1. Check `storage/logs` directory permissions:
   ```bash
   chmod 775 storage/logs
   chown www-data:www-data storage/logs
   ```
2. Verify `APP_DEBUG=true` in your `.env`
3. Check current environment is in `allowed_envs`
4. Ensure not running in console mode

### Empty or incomplete logs
1. Try disabling file locking:
   ```php
   'file_lock' => false,
   ```
2. Check disk space
3. Verify PHP has write permissions

### Performance issues
1. Set `file_lock' => false`
2. Only enable in specific environments
3. Monitor log file size

### Multiple separator lines
This indicates the service provider is being instantiated multiple times. Ensure:
- You're using the latest version
- `static $attached` property is working correctly
- Only one instance of the provider exists

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never enable in production** unless absolutely necessary
2. **SQL logs may contain sensitive data** (emails, passwords, personal info)
3. **Secure the log file:**
   ```bash
   chmod 640 storage/logs/sql.log
   chown www-data:www-data storage/logs/sql.log
   ```
4. **Regularly rotate and delete old logs**

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search [existing issues](https://github.com/hesamzakerirad/laravel-sql-logger/issues)
3. Create a [new issue](https://github.com/hesamzakerirad/laravel-sql-logger/issues/new)

## License

This package is open-source software licensed under the MIT license.

## Credits

- [Hesam Rad](https://github.com/hesamzakerirad)
- [All Contributors](../../contributors)
