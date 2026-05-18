# Laravel Weather MCP Server

A simple, plug-and-play Model Context Protocol (MCP) server package for Laravel. It provides real-time weather data for any city to your AI assistant (Claude, Cursor, etc.) using the free Open-Meteo API. No API keys required.

## Requirements

- PHP 8.2+
- Laravel 12.0+

## Installation

You can install the package via composer:

```bash
composer require mrkiyani001/laravel-weather-mcp
```

The package will automatically register its service provider.

## Usage

Start the MCP server using the following artisan command:

```bash
php artisan mcp:serve weather
```

### Connecting to AI Assistants

#### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "laravel-weather": {
      "command": "php",
      "args": ["C:\\path\\to\\your\\laravel-project\\artisan", "mcp:serve", "weather"]
    }
  }
}
```

#### Cursor IDE
Add this to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "laravel-weather": {
      "command": "php",
      "args": ["artisan", "mcp:serve", "weather"],
      "cwd": "C:\\path\\to\\your\\laravel-project"
    }
  }
}
```

Once connected, simply ask your AI: *"What is the weather in Lahore?"*

## Author

**Farhan Kayani** - Backend Developer
- GitHub: [@Mrkiyani001](https://github.com/Mrkiyani001)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
