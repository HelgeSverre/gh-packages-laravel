

# ![Tnextpay](https://Technonextpay.com.bd/dev/images/Technonextpay.png) PHP example application using Sp-plugin-php

#### _-Technonextpay integration example with sp-plugin-php_
 _Powered  by:_ [Technonext Pay Limited](https://Technonextpay.com.bd/)
 
##### This is an example application made with  PHP programing language which is using tnextPay-plugin-php to integrate Technonextpay payment system to the application.

## 📖 Developer Guide

For a comprehensive understanding of how the plugin works and how to integrate it into your application, see the **[Developer Guide](DEVELOPER_GUIDE.md)**.

The guide covers:
- Architecture overview and component purposes
- Complete payment flow explanation
- Step-by-step integration instructions
- API reference and examples
- Best practices and troubleshooting

## ⚡ Quick Start

New to the plugin? Get up and running in 5 minutes with the **[Quick Start Guide](QUICK_START.md)**.

Perfect for:
- First-time integration
- Testing the plugin quickly
- Understanding basic payment flow

## Security & Best Practices

### ✅ Implemented Improvements (2026)
- **Input Validation**: All user inputs are now sanitized and validated before processing
- **Proper Error Handling**: Validation methods return appropriate boolean values instead of always true
- **Secure Logging**: Replaced `print_r` with `error_log` for better security
- **Environment Variables**: Credentials loaded from environment variables instead of hardcoded values
- **Unit Tests**: Basic test suite added for validation functions
- **HTTP Security**: Improved cURL configuration with proper SSL verification and timeouts

### ⚠️ Security Notes
- Never use `configaration.php` in production - it contains example credentials
- Always load configuration from environment variables using `TechnonextpayEnvReader`
- Ensure SSL verification is enabled in production
- Regularly update dependencies and monitor for security vulnerabilities

## How to Run in Windows:
Follow below instruction to run "php-app-php-plugin" example application:

- Clone/Download repository to your local directory.
- Place downloaded folder to xampp/htdocs.
- Open XAMPP control Panel and start Apache.
- To run the project type http://localhost/php-app-php-plugin in any browser.

php-app-php-plugin application will run in Windows.

## How to Run in Linux:
Follow below instruction to run "php-app-php-plugin" example application:

- Clone/Download repository to your local directory.
- You must have PHP and Apache server in your system.
- Place downloaded folder to var/www/html.
- To run the project type http://localhost/php-app-php-plugin in any browser.

php-app-php-plugin application will run in Linux.

## Testing

The plugin includes a comprehensive test suite to ensure code quality and reliability.

### Run Tests
```bash
php tests/run_tests.php
```

See `tests/README.md` for detailed testing information.

## References
```bash
1. [PHP sample project](https://github.com/tnextpay-plugins/tnextpay-plugin-usage-examples/tree/main/php-app-plugin) showing usage of the PHP plugin.
2. [Sample applications and projects](https://github.com/tnextpay-plugins/tnextpay-plugin-usage-examples) in many different languages and frameworks showing Technonextpay integration.
3. [Technonextpay Plugins](https://github.com/tnextpay-plugins) home page on github
```
## License

This code is under the [MIT open source License](http://www.opensource.org/licenses/mit-license.php).

#### Please [contact](https://Technonextpay.com.bd/#contacts) with Technonextpay team for more detail.

Copyright ©️2026 [TechnonexPay Limited](https://::).
