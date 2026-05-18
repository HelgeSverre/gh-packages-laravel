# Laravel Forge SDK

A modern PHP SDK for the Laravel Forge API, built with Saloon v3.

## Installation

```bash
composer require team-nifty/forge-sdk
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="TeamNifty\Forge\ForgeServiceProvider"
```

Add your Forge API token to your `.env` file:

```env
FORGE_API_TOKEN=your-api-token-here
FORGE_DEFAULT_ORGANIZATION=your-org-slug
```

## Usage

### Basic Usage

The SDK provides a fluent interface for interacting with the Forge API:

```php
use function TeamNifty\Forge\forge;

// Get all servers for an organization
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->json('data');

// Get a specific server
$server = forge()
    ->servers()
    ->organizationsServersShowRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->json('data');
```

### Available Methods

All paginated requests support these convenient methods:

#### `send()` - Send the request and get the Response object
```php
$response = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->send();

$statusCode = $response->status();
$headers = $response->headers();
```

#### `json()` - Get JSON response data
```php
// Get all data
$data = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->json();

// Get specific key
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->json('data');
```

#### `collect()` - Get response as Laravel Collection
```php
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->collect('data');

// Use Collection methods
$activeServers = $servers->filter(fn($server) => $server['status'] === 'active');
```

#### `paginate()` - Iterate through all pages automatically
```php
$paginator = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->paginate();

// Iterate through all pages
foreach ($paginator as $server) {
    echo $server['name'] . PHP_EOL;
}

// Or collect all results at once
$allServers = $paginator->collect();
```

### Pagination

The SDK automatically handles Forge's cursor-based pagination. All paginated endpoints implement the `Paginatable` interface:

```php
// Automatically fetch all pages
$paginator = forge()
    ->sites()
    ->organizationsSitesIndexRequest(organization: 'team-nifty')
    ->paginate();

foreach ($paginator as $site) {
    // Process each site
    echo "Site: {$site['name']}\n";
}

// Get all items as a collection
$allSites = $paginator->collect();

// Get specific number of items
$firstTenSites = $paginator->take(10)->collect();
```

### Resource Examples

#### Servers
```php
// List all servers
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->json('data');

// Get server details
$server = forge()
    ->servers()
    ->organizationsServersShowRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->json('data');

// List server events
$events = forge()
    ->servers()
    ->organizationsServersEventsIndexRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->paginate()
    ->collect();
```

#### Sites
```php
// List all sites
$sites = forge()
    ->sites()
    ->organizationsSitesIndexRequest(organization: 'team-nifty')
    ->paginate()
    ->collect();

// List sites on a specific server
$sites = forge()
    ->sites()
    ->organizationsServersSitesIndexRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->json('data');

// Get site details
$site = forge()
    ->sites()
    ->organizationsServersSitesShowRequest(
        organization: 'team-nifty',
        server: 12345,
        site: 67890
    )
    ->json('data');
```

#### Deployments
```php
// List deployments
$deployments = forge()
    ->deployments()
    ->organizationsServersSitesDeploymentsIndexRequest(
        organization: 'team-nifty',
        server: 12345,
        site: 67890
    )
    ->paginate()
    ->collect();

// Deploy a site
$deployment = forge()
    ->deployments()
    ->organizationsServersSitesDeploymentsStoreRequest(
        organization: 'team-nifty',
        server: 12345,
        site: 67890
    )
    ->send();
```

#### Databases
```php
// List database schemas
$schemas = forge()
    ->databases()
    ->organizationsServersDatabaseSchemasIndexRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->json('data');

// List database users
$users = forge()
    ->databases()
    ->organizationsServersDatabaseUsersIndexRequest(
        organization: 'team-nifty',
        server: 12345
    )
    ->paginate()
    ->collect();
```

#### Recipes
```php
// List organization recipes
$recipes = forge()
    ->recipes()
    ->organizationsRecipesIndexRequest(organization: 'team-nifty')
    ->paginate()
    ->collect();

// List Forge-provided recipes
$forgeRecipes = forge()
    ->recipes()
    ->forgeRecipesIndexRequest()
    ->json('data');
```

### Filtering and Sorting

Many endpoints support filtering and sorting:

```php
// Filter servers by name
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(
        organization: 'team-nifty',
        filtername: 'production'
    )
    ->json('data');

// Sort servers by creation date (descending)
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(
        organization: 'team-nifty',
        sort: '-created_at'
    )
    ->json('data');

// Combine filters and sorting
$servers = forge()
    ->servers()
    ->organizationsServersIndexRequest(
        organization: 'team-nifty',
        filterprovider: 'digitalocean',
        sort: 'name'
    )
    ->json('data');
```

### Error Handling

The SDK uses Saloon's exception handling:

```php
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\ClientException;
use Saloon\Exceptions\Request\ServerException;

try {
    $servers = forge()
        ->servers()
        ->organizationsServersIndexRequest(organization: 'team-nifty')
        ->json('data');
} catch (ClientException $e) {
    // 4xx errors (client errors)
    echo "Client error: " . $e->getMessage();
    echo "Status: " . $e->getResponse()->status();
} catch (ServerException $e) {
    // 5xx errors (server errors)
    echo "Server error: " . $e->getMessage();
} catch (FatalRequestException $e) {
    // Connection errors, timeouts, etc.
    echo "Fatal error: " . $e->getMessage();
}
```

### Testing

The SDK includes full support for testing with mocked responses:

```php
use TeamNifty\Forge\Forge;
use Saloon\Laravel\Facades\Saloon;

// Mock all requests
Saloon::fake([
    '*' => Saloon::response(['data' => ['id' => 1, 'name' => 'Test Server']], 200),
]);

// Your test code
$server = forge()
    ->servers()
    ->organizationsServersShowRequest(
        organization: 'team-nifty',
        server: 1
    )
    ->json('data');

$this->assertEquals('Test Server', $server['name']);
```

## Available Resources

The SDK provides access to all Forge API resources:

- **Organizations** - Manage organizations and credentials
- **Servers** - Server management and configuration
- **Sites** - Website and application management
- **Deployments** - Deployment management and webhooks
- **Databases** - Database and user management
- **Recipes** - Recipe management and execution
- **SSL Certificates** - SSL certificate management
- **Scheduled Jobs** - Cron job management
- **Daemons** - Background process management
- **Firewall Rules** - Firewall configuration
- **Security Rules** - Security rule management
- **Redirect Rules** - URL redirect management
- **Teams** - Team and member management
- **Roles** - Role and permission management
- **SSH Keys** - SSH key management
- **Providers** - Cloud provider information
- **Monitors** - Server monitoring
- **Nginx** - Nginx template management

## Advanced Usage

### Custom Base URL

If you're using a custom Forge instance:

```php
$forge = new Forge(
    bearerToken: 'your-token',
);

// The base URL is hardcoded to https://forge.laravel.com/api
// If you need a different base URL, you'll need to extend the Forge class
```

### OAuth Authentication

For OAuth-based authentication:

```php
$forge = new Forge(
    bearerToken: 'your-access-token',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
);
```

### Request Customization

You can customize individual requests:

```php
$response = forge()
    ->servers()
    ->organizationsServersIndexRequest(organization: 'team-nifty')
    ->send()
    ->throw(); // Throw exception on error

// Access raw response
$json = $response->body();
$array = $response->json();
$status = $response->status();
```

## Requirements

- PHP 8.2 or higher
- Laravel 11 or higher

## License

This package is open-sourced software licensed under the MIT license.

## Credits

Built with [Saloon](https://docs.saloon.dev/) by Sammyjo20.
