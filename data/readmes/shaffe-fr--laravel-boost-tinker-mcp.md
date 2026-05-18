# Laravel Boost Tinker MCP

Adds the Tinker MCP tool back to [Laravel Boost](https://github.com/laravel/boost). This tool was included in Boost 1.x but removed in 2.x. It lets you execute PHP code in your Laravel application context via MCP, just like `artisan tinker`.

## Installation

```bash
composer require shaffe/laravel-boost-tinker-mcp --dev
```

The service provider is auto-discovered. The Tinker tool will be automatically registered with Boost.

## Usage

Once installed, the `tinker` tool is available in your MCP client. It accepts:

- `code` — PHP code to execute (without `<?php` tags)
- `timeout` — Maximum execution time in seconds

## License

MIT
