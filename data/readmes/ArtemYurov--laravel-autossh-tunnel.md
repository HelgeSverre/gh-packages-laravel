# Laravel AutoSSH Tunnel

Modern SSH Tunnel Manager for Laravel with autossh support and automatic lifecycle management.

## Features

- 🚀 Automatic tunnel lifecycle management via callback pattern
- 🔄 AutoSSH support for automatic reconnection
- 🛡️ Comprehensive error handling with detailed messages
- 🔌 Port availability checking
- 🗄️ Laravel Database connections integration
- ⚙️ Flexible configuration (env, config files or direct parameters)
- ✅ Configuration validation
- 📝 Detailed logging
- 🎯 Multiple simultaneous tunnels support

## Installation

```bash
composer require artemyurov/laravel-autossh-tunnel
```

### Publish Configuration

```bash
# Publish config and .env example
php artisan vendor:publish --tag=tunnel

# Or publish separately
php artisan vendor:publish --tag=tunnel-config  # config/tunnel.php only
php artisan vendor:publish --tag=tunnel-env     # .env.example.tunnel only
```

After publishing, copy the tunnel environment variables to your `.env`:

```bash
cat .env.example.tunnel >> .env
# Then edit .env with your actual credentials
```

## Configuration

### Environment Variables

The configuration uses a clear logical order:
1. **SSH Connection** - How to connect to the SSH server
2. **Remote/Local** - What to forward and where
3. **SSH Options** - Connection behavior settings

```env
# Default tunnel connection
TUNNEL_CONNECTION=remote_db
TUNNEL_DEBUG=false
TUNNEL_AUTOSSH_ENABLED=true

# SSH Connection (how to connect)
TUNNEL_SSH_USER=your_ssh_user
TUNNEL_SSH_HOST=your_server.com
TUNNEL_SSH_PORT=22
TUNNEL_SSH_KEY=/path/to/ssh/key

# Remote Target (what to forward on SSH server)
TUNNEL_REMOTE_HOST=localhost
TUNNEL_REMOTE_PORT=5432

# Local Bind (where to bind locally)
TUNNEL_LOCAL_HOST=127.0.0.1
TUNNEL_LOCAL_PORT=15432

# SSH Options
TUNNEL_SSH_STRICT_HOST_KEY_CHECKING=false
TUNNEL_SSH_SERVER_ALIVE_INTERVAL=60
TUNNEL_SSH_SERVER_ALIVE_COUNT_MAX=3
TUNNEL_SSH_EXIT_ON_FORWARD_FAILURE=true
TUNNEL_SSH_TCP_KEEP_ALIVE=true
TUNNEL_SSH_CONNECT_TIMEOUT=10

# Database connection using tunnel
TUNNEL_DB_CONNECTION=pgsql
TUNNEL_DB_HOST="${TUNNEL_LOCAL_HOST}"
TUNNEL_DB_PORT="${TUNNEL_LOCAL_PORT}"
TUNNEL_DB_DATABASE=database_name
TUNNEL_DB_USERNAME=db_user
TUNNEL_DB_PASSWORD=db_password
```

### Configuration File

After publishing the config, edit `config/tunnel.php`:

```php
return [
    // Default tunnel name
    'default' => env('TUNNEL_CONNECTION', 'remote_db'),

    // Enable detailed logging
    'debug' => env('TUNNEL_DEBUG', env('APP_DEBUG', false)),

    // AutoSSH configuration
    'autossh' => [
        'enabled' => env('TUNNEL_AUTOSSH_ENABLED', true),
    ],

    // Retry configuration for database operations
    'retry' => [
        'max_attempts' => env('TUNNEL_RETRY_MAX_ATTEMPTS', 3),
        'delay' => env('TUNNEL_RETRY_DELAY', 2),
        'exponential' => env('TUNNEL_RETRY_EXPONENTIAL', false),
    ],

    // Connection validation settings
    'validation' => [
        'port_timeout' => env('TUNNEL_VALIDATION_PORT_TIMEOUT', 1),
        'database_timeout' => env('TUNNEL_VALIDATION_DATABASE_TIMEOUT', 5),
        'database_max_attempts' => env('TUNNEL_VALIDATION_DATABASE_MAX_ATTEMPTS', 5),
        'database_retry_delay' => env('TUNNEL_VALIDATION_DATABASE_RETRY_DELAY', 2),
    ],

    // Signal handling (SIGINT, SIGTERM)
    'signals' => [
        'enabled' => env('TUNNEL_SIGNALS_ENABLED', true),
        'handlers' => ['SIGINT', 'SIGTERM'],
    ],

    // Tunnel reuse settings
    'reuse' => [
        'use_pid_file' => env('TUNNEL_REUSE_PID_FILE', true),
        'use_port_scan' => env('TUNNEL_REUSE_PORT_SCAN', true),
        'pid_directory' => env('TUNNEL_PID_DIRECTORY', sys_get_temp_dir() . '/laravel-autossh-tunnel'),
    ],

    'connections' => [
        'remote_db' => [
            'type' => 'forward',
            // SSH Connection
            'user' => env('TUNNEL_SSH_USER'),
            'host' => env('TUNNEL_SSH_HOST'),
            'port' => env('TUNNEL_SSH_PORT', 22),
            'identity_file' => env('TUNNEL_SSH_KEY'),
            // Remote Target
            'remote_host' => env('TUNNEL_REMOTE_HOST', 'localhost'),
            'remote_port' => env('TUNNEL_REMOTE_PORT', 5432),
            // Local Bind
            'local_host' => env('TUNNEL_LOCAL_HOST', '127.0.0.1'),
            'local_port' => env('TUNNEL_LOCAL_PORT', 15432),
            // SSH Options (all optional, defaults shown)
            'ssh_options' => [
                'StrictHostKeyChecking' => env('TUNNEL_SSH_STRICT_HOST_KEY_CHECKING', false),
                'ServerAliveInterval' => env('TUNNEL_SSH_SERVER_ALIVE_INTERVAL', 60),
                'ServerAliveCountMax' => env('TUNNEL_SSH_SERVER_ALIVE_COUNT_MAX', 3),
                'ExitOnForwardFailure' => env('TUNNEL_SSH_EXIT_ON_FORWARD_FAILURE', true),
                'TCPKeepAlive' => env('TUNNEL_SSH_TCP_KEEP_ALIVE', true),
                'ConnectTimeout' => env('TUNNEL_SSH_CONNECT_TIMEOUT', 10),
            ],
        ],

        'local_webhooks' => [
            'type' => 'reverse',
            'user' => env('WEBHOOK_SSH_USER'),
            'host' => env('WEBHOOK_SSH_HOST'),
            'port' => env('WEBHOOK_SSH_PORT', 22),
            'identity_file' => env('WEBHOOK_SSH_KEY'),
            'remote_host' => env('WEBHOOK_REMOTE_HOST', 'localhost'),  // Or 0.0.0.0 for public access
            'remote_port' => env('WEBHOOK_REMOTE_PORT', 8080),
            'local_host' => env('WEBHOOK_LOCAL_HOST', '127.0.0.1'),
            'local_port' => env('WEBHOOK_LOCAL_PORT', 8000),
            'ssh_options' => [
                'StrictHostKeyChecking' => env('WEBHOOK_SSH_STRICT_HOST_KEY_CHECKING', false),
                'ServerAliveInterval' => env('WEBHOOK_SSH_SERVER_ALIVE_INTERVAL', 60),
                'ServerAliveCountMax' => env('WEBHOOK_SSH_SERVER_ALIVE_COUNT_MAX', 3),
                'ExitOnForwardFailure' => env('WEBHOOK_SSH_EXIT_ON_FORWARD_FAILURE', true),
                'TCPKeepAlive' => env('WEBHOOK_SSH_TCP_KEEP_ALIVE', true),
                'ConnectTimeout' => env('WEBHOOK_SSH_CONNECT_TIMEOUT', 10),
            ],
        ],
    ],
];
```

### Multiple Connections Example

For multiple tunnel connections, use unique prefixes for each connection:

```env
# PostgreSQL Development Server
REMOTE_DEV_SSH_USER=www-backend
REMOTE_DEV_SSH_HOST=dev.example.com
REMOTE_DEV_SSH_PORT=22
REMOTE_DEV_SSH_KEY=
REMOTE_DEV_REMOTE_HOST=localhost
REMOTE_DEV_REMOTE_PORT=5432
REMOTE_DEV_LOCAL_HOST=127.0.0.1
REMOTE_DEV_LOCAL_PORT=16432

REMOTE_DEV_DB_DATABASE=project_db
REMOTE_DEV_DB_USERNAME=db_user
REMOTE_DEV_DB_PASSWORD=secret

# MySQL Legacy Database
LEGACY_SSH_USER=root
LEGACY_SSH_HOST=legacy.example.com
LEGACY_SSH_PORT=22
LEGACY_REMOTE_HOST=127.0.0.1
LEGACY_REMOTE_PORT=3306
LEGACY_LOCAL_HOST=127.0.0.1
LEGACY_LOCAL_PORT=13306

LEGACY_DB_DATABASE=legacy_db
LEGACY_DB_USERNAME=legacy_user
LEGACY_DB_PASSWORD=secret
```

```php
// config/tunnel.php
'connections' => [
    'remote_dev_db' => [
        'type' => 'forward',
        'user' => env('REMOTE_DEV_SSH_USER'),
        'host' => env('REMOTE_DEV_SSH_HOST'),
        'port' => env('REMOTE_DEV_SSH_PORT', 22),
        'identity_file' => env('REMOTE_DEV_SSH_KEY'),
        'remote_host' => env('REMOTE_DEV_REMOTE_HOST', 'localhost'),
        'remote_port' => env('REMOTE_DEV_REMOTE_PORT', 5432),
        'local_host' => env('REMOTE_DEV_LOCAL_HOST', '127.0.0.1'),
        'local_port' => env('REMOTE_DEV_LOCAL_PORT', 16432),
    ],

    'legacy_db' => [
        'type' => 'forward',
        'user' => env('LEGACY_SSH_USER'),
        'host' => env('LEGACY_SSH_HOST'),
        'port' => env('LEGACY_SSH_PORT', 22),
        'identity_file' => env('LEGACY_SSH_KEY'),
        'remote_host' => env('LEGACY_REMOTE_HOST', '127.0.0.1'),
        'remote_port' => env('LEGACY_REMOTE_PORT', 3306),
        'local_host' => env('LEGACY_LOCAL_HOST', '127.0.0.1'),
        'local_port' => env('LEGACY_LOCAL_PORT', 13306),
    ],
],
```

## Tunnel Types

The package supports two types of SSH tunnels:

### Forward Tunnel (`-L`) - Access Remote Services

Forward tunnels allow you to access remote services from your local machine.

```
┌─────────────┐         SSH Tunnel          ┌─────────────┐
│   Local     │ ──────────────────────────> │   Remote    │
│  Machine    │  localhost:15432            │   Server    │
│             │                             │             │
│             │                             │ PostgreSQL  │
│             │  <───────────────────────── │ :5432       │
└─────────────┘                             └─────────────┘
```

**SSH Command:**
```
ssh -L 15432:localhost:5432 user@server.com
        │      │        │
        │      │        └─ remote_port (порт на удалённом сервере)
        │      └────────── remote_host (хост на удалённом сервере)
        └───────────────── local_port (порт на локальной машине)
```

**Use Cases:**
- Access production/staging databases for debugging
- Connect to internal APIs not exposed to the internet
- Access remote services (Redis, Elasticsearch, etc.)
- Secure connection to remote development environments

**Example:**
```php
use ArtemYurov\Autossh\Facades\Tunnel;

// Access remote database
Tunnel::connection('remote_db')->execute(function() {
    // Connect to remote PostgreSQL via localhost:15432
    $users = DB::connection('pgsql_remote')->table('users')->get();
});
```

### Reverse Tunnel (`-R`) - Expose Local Services

Reverse tunnels expose your local application to a remote server, making it accessible from the internet.

```
┌─────────────┐         SSH Tunnel          ┌─────────────┐
│   Local     │ <────────────────────────── │   Remote    │
│  Machine    │                             │   Server    │
│             │                             │             │
│ Laravel     │                             │ Public IP   │
│ :8000       │  ───────────────────────>   │ :8080       │
└─────────────┘                             └─────────────┘
                                                    │
                                             Webhooks from:
                                             • Stripe
                                             • GitHub
                                             • Telegram
                                             • PayPal
```

**SSH Command:**
```
ssh -R 8080:localhost:8000 user@server.com
        │      │        │
        │      │        └─ local_port (порт локальной машины)
        │      └────────── remote_host (bind адрес на удалённом сервере)
        └───────────────── remote_port (порт на удалённом сервере)
```

**Important:** `remote_host` is the bind address **on the remote server**:
- `localhost` - tunnel accessible only locally on remote server (127.0.0.1:8080)
- `0.0.0.0` - tunnel publicly accessible (your-server.com:8080 from internet)

**Use Cases:**
- Test webhooks locally (Stripe, PayPal, GitHub, Telegram)
- Demo local application to clients without deployment
- Temporary public access to development environment
- Receive callbacks from external services

**Example:**
```php
use ArtemYurov\Autossh\Facades\Tunnel;

// Expose local Laravel app for webhook testing
Tunnel::connection('local_webhooks')->execute(function() {
    $this->info('Local app is now accessible at http://your-server.com:8080');
    $this->info('Configure webhooks to point to this URL');

    // Keep tunnel open while testing
    sleep(3600); // 1 hour
});
```

## Usage

### Callback Pattern (Recommended)

Automatic tunnel closure after execution:

```php
use ArtemYurov\Autossh\Facades\Tunnel;

// Using configuration from config/tunnel.php
Tunnel::connection('remote_db')->execute(function() {
    // Tunnel is active, you can work with remote service
    // Tunnel will automatically close after execution
});
```

### With Laravel Database Integration

```php
use ArtemYurov\Autossh\Facades\Tunnel;
use Illuminate\Support\Facades\DB;

Tunnel::connection('remote_db')
    ->withDatabaseConnection('pgsql_remote', [
        'driver' => 'pgsql',
        'database' => env('REMOTE_DB_DATABASE'),
        'username' => env('REMOTE_DB_USERNAME'),
        'password' => env('REMOTE_DB_PASSWORD'),
    ])
    ->execute(function() {
        // Now you can use the connection
        $users = DB::connection('pgsql_remote')->table('users')->get();

        // Tunnel will automatically close after execution
    });
```

### Manual Management

```php
use ArtemYurov\Autossh\Facades\Tunnel;

$connection = Tunnel::connection('remote_db')->start();

try {
    // Work with tunnel
    $pid = $connection->getPid();
    $isRunning = $connection->isRunning();
} finally {
    // Must close the tunnel
    $connection->stop();
}
```

### Multiple Tunnels Simultaneously

```php
use ArtemYurov\Autossh\Tunnel;

// PostgreSQL tunnel
$pgTunnel = Tunnel::connection('pgsql')->start();

// MySQL tunnel
$mysqlTunnel = Tunnel::connection('mysql')->start();

try {
    // Work with both tunnels
} finally {
    $pgTunnel->stop();
    $mysqlTunnel->stop();
}
```

### Using in Artisan Commands

```php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use ArtemYurov\Autossh\Facades\Tunnel;
use Illuminate\Support\Facades\DB;

class SyncDatabase extends Command
{
    protected $signature = 'db:sync';

    public function handle(): int
    {
        return Tunnel::connection('remote_db')
            ->withDatabaseConnection('remote_db', [
                'driver' => 'pgsql',
                'database' => env('REMOTE_DB_DATABASE'),
                'username' => env('REMOTE_DB_USERNAME'),
                'password' => env('REMOTE_DB_PASSWORD'),
            ])
            ->execute(function() {
                $this->info('Syncing database...');

                // Your sync logic
                $tables = DB::connection('remote_db')
                    ->select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");

                $this->info('Found tables: ' . count($tables));

                return Command::SUCCESS;
            });
    }
}
```

## Long-Running Tunnels

For persistent tunnels that stay active (similar to ngrok), use the Artisan commands:

### Start with Live Monitoring

Start a tunnel with real-time status updates (like ngrok):

```bash
php artisan tunnel:start
# or specify connection
php artisan tunnel:start remote_db
```

This will show a live dashboard with tunnel information:
```
╔════════════════════════════════════════════════════════════════╗
║                     SSH Tunnel Monitor                         ║
╠════════════════════════════════════════════════════════════════╣
║ Connection: remote_db                                          ║
║ Local Port: 15432                                              ║
║ Remote:     localhost:5432                                     ║
║ SSH:        user@example.com                                   ║
║ PID:        12345                                              ║
╠════════════════════════════════════════════════════════════════╣
║ Press Ctrl+C to stop the tunnel                                ║
╚════════════════════════════════════════════════════════════════╝

Status: ● ACTIVE | Uptime: 2m 34s | PID: 12345
```

Press `Ctrl+C` to gracefully stop the tunnel.

### Start in Background (Daemon Mode)

Run tunnel in background without monitoring (detached daemon mode):

```bash
php artisan tunnel:start --detach
# or
php artisan tunnel:start remote_db --detach
```

### Check Tunnel Status

View status of running tunnels:

```bash
# Check specific tunnel
php artisan tunnel:status
php artisan tunnel:status remote_db

# Check all running tunnels
php artisan tunnel:status --all
```

### Stop Tunnel

Stop a running tunnel:

```bash
php artisan tunnel:stop
php artisan tunnel:stop remote_db

# Stop all tunnels
php artisan tunnel:stop --all
```

### Run as System Service

For production environments, you can run the tunnel as a persistent systemd service.

**📖 See detailed guide:** [SYSTEMD.md](SYSTEMD.md)

Quick example:
```bash
# Create service file
sudo nano /etc/systemd/system/ssh-tunnel.service

# Enable and start
sudo systemctl enable ssh-tunnel
sudo systemctl start ssh-tunnel
```

### Related Resources

- **[Running as systemd Service](SYSTEMD.md)** - Complete guide for production deployments
- [Self-hosted ngrok alternative](https://jerrington.me/posts/2019-01-29-self-hosted-ngrok.html) - Building your own tunnel infrastructure

## AutoSSH

The package automatically detects `autossh` availability and uses it instead of regular `ssh` to provide automatic reconnection on connection loss.

### Installing autossh

**macOS:**
```bash
brew install autossh
```

**Ubuntu/Debian:**
```bash
apt-get install autossh
```

The package uses `command -v autossh` to detect autossh automatically. No additional configuration needed.

### Disable AutoSSH

If you want to use regular SSH even when autossh is available:

```env
TUNNEL_AUTOSSH_ENABLED=false
```

## Docker & DDEV

SSH tunnels work inside containers — you need access to SSH keys and `autossh` installed.

### DDEV (Docker Desktop)

DDEV runs on Docker Desktop, which provides built-in
[SSH agent forwarding](https://docs.docker.com/desktop/features/networking/networking-how-tos/#ssh-agent-forwarding)
through the socket `/run/host-services/ssh-auth.sock`.

1. Add `autossh` to `config.yaml`:

```yaml
webimage_extra_packages: [autossh]
```

2. Create `.ddev/docker-compose.ssh-auth-socket.yaml` for SSH agent forwarding:

```yaml
services:
  web:
    volumes:
      - type: bind
        source: /run/host-services/ssh-auth.sock
        target: /run/host-services/ssh-auth.sock
    environment:
      SSH_AUTH_SOCK: /run/host-services/ssh-auth.sock
```

3. Restart and verify:

```bash
ddev restart
ddev exec ssh-add -l          # should list your SSH keys
ddev exec php artisan tunnel:start
```

### Docker Compose (Server / Docker Engine)

On servers there is no Docker Desktop, so SSH agent forwarding via
`/run/host-services/ssh-auth.sock` is not available. Instead, mount the host's
`~/.ssh` directory directly into the container (read-only).

1. Add `openssh-client autossh` to your Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y openssh-client autossh
```

2. Create `docker-compose.ssh-keys.yaml`:

```yaml
services:
  app:
    volumes:
      - ~/.ssh:/root/.ssh:ro
```

> **Note:** Adjust the target path (`/root/.ssh`) to match the user running the
> application inside the container (e.g. `/home/www-data/.ssh` or `/var/www/.ssh`).

3. Include it via `COMPOSE_FILE` in `.env`:

```bash
COMPOSE_FILE=docker-compose.yaml:docker-compose.ssh-keys.yaml
```

4. Rebuild and verify:

```bash
docker compose up -d --build
docker compose exec app ssh-add -l          # should list your SSH keys
docker compose exec app php artisan tunnel:start
```

## Error Handling

```php
use ArtemYurov\Autossh\Facades\Tunnel;
use ArtemYurov\Autossh\Exceptions\TunnelConnectionException;
use ArtemYurov\Autossh\Exceptions\TunnelConfigException;

try {
    Tunnel::connection('remote_db')->execute(function() {
        // Your code
    });
} catch (TunnelConfigException $e) {
    // Configuration error (invalid port, missing key, etc.)
    Log::error('Tunnel configuration error: ' . $e->getMessage());
} catch (TunnelConnectionException $e) {
    // Connection error (port occupied, SSH failed, etc.)
    Log::error('Tunnel connection error: ' . $e->getMessage());
}
```

## Important Notes

### MySQL/MariaDB: localhost vs 127.0.0.1

**Critical:** In MySQL and MariaDB, `localhost` has a special hardcoded meaning - it **always** represents a Unix socket connection, **not** a TCP/IP connection. This behavior cannot be changed.

#### The Difference

- **`localhost`** → Unix socket connection (`/var/run/mysqld/mysqld.sock`)
- **`127.0.0.1`** → TCP/IP connection over loopback interface

When using SSH tunnels with MySQL/MariaDB:

```php
// ❌ WRONG - Will attempt Unix socket, not tunnel
Tunnel::connection('mysql_tunnel')
    ->withDatabaseConnection('mysql_remote', [
        'driver' => 'mysql',
        'host' => 'localhost',  // ❌ Unix socket
        'port' => 13306,
    ]);

// ✅ CORRECT - Will use TCP/IP through tunnel
Tunnel::connection('mysql_tunnel')
    ->withDatabaseConnection('mysql_remote', [
        'driver' => 'mysql',
        'host' => '127.0.0.1',  // ✅ TCP/IP
        'port' => 13306,
    ]);
```

#### Configuration Example

**Environment Variables:**
```env
# Remote database credentials
MYSQL_REMOTE_HOST=127.0.0.1  # ✅ Use 127.0.0.1, not localhost
MYSQL_REMOTE_PORT=3306
MYSQL_REMOTE_DATABASE=mydb
MYSQL_REMOTE_USERNAME=myuser
MYSQL_REMOTE_PASSWORD=secret

# SSH Tunnel settings
MYSQL_SSH_USER=sshuser
MYSQL_SSH_HOST=remote-server.com
MYSQL_SSH_PORT=22

# Local tunnel bind
MYSQL_LOCAL_HOST=127.0.0.1  # ✅ Bind to specific IPv4 address
MYSQL_LOCAL_PORT=13306
```

**Tunnel Configuration:**
```php
// config/tunnel.php
'mysql_remote' => [
    'type' => 'forward',
    'user' => env('MYSQL_SSH_USER'),
    'host' => env('MYSQL_SSH_HOST'),
    'port' => env('MYSQL_SSH_PORT', 22),

    // ✅ IMPORTANT: Use 127.0.0.1 for MySQL/MariaDB
    'remote_host' => env('MYSQL_REMOTE_HOST', '127.0.0.1'),
    'remote_port' => env('MYSQL_REMOTE_PORT', 3306),
    'local_host' => env('MYSQL_LOCAL_HOST', '127.0.0.1'),
    'local_port' => env('MYSQL_LOCAL_PORT', 13306),
],
```

#### Database User Permissions

MySQL/MariaDB treat `user@localhost` and `user@127.0.0.1` as **different users**:

```sql
-- Unix socket access (localhost means socket)
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'password';

-- TCP/IP access (required for SSH tunnels)
CREATE USER 'myuser'@'127.0.0.1' IDENTIFIED BY 'password';

-- Grant permissions
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'127.0.0.1';
FLUSH PRIVILEGES;
```

**Important:** When using SSH tunnels to access remote MySQL/MariaDB:
1. Create database user with `@127.0.0.1` host (not `@localhost`)
2. Set `remote_host` to `127.0.0.1` in tunnel config
3. Use `'host' => '127.0.0.1'` in database connection config

#### Why This Matters

This issue commonly occurs when:
- Remote server's `localhost` resolves to IPv6 (`::1`)
- Database user only has `@localhost` (Unix socket) permissions
- Database rejects connections: "Host '::1' is not allowed to connect"

**Solution:** Always use `127.0.0.1` for both `remote_host` in tunnel config and database connection host when working with MySQL/MariaDB over SSH tunnels.

## Advanced Features

### Tunnel Reuse

The package can automatically detect and reuse existing SSH tunnels instead of creating new ones. This is useful for:
- Avoiding "port already in use" errors
- Sharing tunnels between multiple processes
- Faster command execution (no tunnel startup time)

#### Smart Tunnel Discovery

The package uses two methods to find existing tunnels:
1. **PID file** - Fastest method, stores tunnel PID in temp directory
2. **Port scan** - Uses `lsof`/`netstat` to find processes by port

```php
use ArtemYurov\Autossh\Tunnel;

// Automatically reuse existing tunnel or create new one
$tunnel = Tunnel::connection('remote_db')->reuseOrCreate();

// Or explicitly find existing tunnel by port
$pid = $tunnel->findExistingByPort();
if ($pid) {
    echo "Found existing tunnel with PID: $pid";
}
```

#### Reuse Command

Find and reuse existing tunnel from command line:

```bash
# Find and reuse existing tunnel
php artisan tunnel:reuse remote_db

# Reuse tunnel and register database connection
php artisan tunnel:reuse remote_db \
    --db-connection=pgsql_remote \
    --db-database=mydb \
    --db-username=user \
    --db-password=pass
```

### Retry Logic

Execute database operations with automatic retry on connection errors:

```php
use ArtemYurov\Autossh\Tunnel;

$tunnel = Tunnel::connection('remote_db')
    ->withDatabaseConnection('pgsql_remote', [...])
    ->start();

// Execute with automatic retry on connection loss
$result = $tunnel->executeWithRetry(function() {
    return DB::connection('pgsql_remote')->table('users')->count();
}, $maxAttempts = 3);
```

If the operation fails due to connection error, the tunnel will automatically reconnect and retry the operation.

#### Configuration

Configure retry behavior in `config/tunnel.php`:

```php
'retry' => [
    'max_attempts' => 3,           // Maximum retry attempts
    'delay' => 2,                  // Delay between retries (seconds)
    'exponential' => false,        // Use exponential backoff (2s, 4s, 8s...)
],
```

Or use environment variables:

```env
TUNNEL_RETRY_MAX_ATTEMPTS=3
TUNNEL_RETRY_DELAY=2
TUNNEL_RETRY_EXPONENTIAL=false
```

### Database Validation

Verify that database is actually accessible through tunnel (not just port checking):

```php
use ArtemYurov\Autossh\Tunnel;

$connection = Tunnel::connection('remote_db')
    ->withDatabaseConnection('pgsql_remote', [...])
    ->start();

// Simple validation (SELECT 1 query)
if ($connection->validateDatabase('pgsql_remote')) {
    echo "Database is accessible";
}

// Wait for database with retries
if ($connection->waitForDatabase('pgsql_remote', $maxAttempts = 5, $delaySeconds = 2)) {
    echo "Database became available";
}

// Full tunnel validation (process + port + database)
$result = $connection->validate('pgsql_remote');
if ($result['valid']) {
    echo "Tunnel is fully operational";
} else {
    foreach ($result['errors'] as $error) {
        echo "Error: $error\n";
    }
}
```

### Signal Handling

Tunnels can automatically handle system signals for graceful shutdown:

```php
use ArtemYurov\Autossh\Tunnel;

$connection = Tunnel::connection('remote_db')
    ->start()
    ->setupSignalHandlers();  // Handle SIGINT, SIGTERM

// Tunnel will be properly closed when receiving Ctrl+C or kill signal
```

Requires `pcntl` extension. Configure in `config/tunnel.php`:

```php
'signals' => [
    'enabled' => true,
    'handlers' => ['SIGINT', 'SIGTERM'],
],
```

### Keep-Alive Tunnels

Create tunnels that persist after script ends:

```php
use ArtemYurov\Autossh\Tunnel;

$connection = Tunnel::connection('remote_db')
    ->start()
    ->withKeepAlive(true);

// Tunnel will stay alive even after script finishes
echo "Tunnel PID: " . $connection->getPid();
```

To stop keep-alive tunnel, use the stop command:

```bash
php artisan tunnel:stop remote_db
```

### Diagnostic Tools

#### Diagnose Command

Comprehensive tunnel health check:

```bash
# Basic diagnostics
php artisan tunnel:diagnose remote_db

# Include database check
php artisan tunnel:diagnose remote_db --db-connection=pgsql_remote

# Verbose output
php artisan tunnel:diagnose remote_db --verbose
```

The diagnostic tool checks:
- ✓ Configuration existence
- ✓ Process running (PID file + port scan)
- ✓ Process is SSH
- ✓ Port accessibility
- ✓ Database accessibility (optional)

### ManagesTunnel Trait for Commands

Convenient trait for managing tunnels in Laravel commands:

```php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use ArtemYurov\Autossh\Console\Traits\ManagesTunnel;
use Illuminate\Support\Facades\DB;

class SyncRemoteData extends Command
{
    use ManagesTunnel;

    protected $signature = 'data:sync';

    public function handle(): int
    {
        // Setup tunnel with automatic reconnection and validation
        $this->setupTunnel('remote_db', [
            'connection_name' => 'pgsql_remote',
            'driver' => 'pgsql',
            'database' => env('REMOTE_DB_DATABASE'),
            'username' => env('REMOTE_DB_USERNAME'),
            'password' => env('REMOTE_DB_PASSWORD'),
        ], $keepAlive = false, $validateDb = true);

        try {
            // Execute with automatic retry on connection errors
            $this->withTunnelRetry(function() {
                $data = DB::connection('pgsql_remote')
                    ->table('users')
                    ->get();

                $this->info("Synced " . count($data) . " records");
            });

            return Command::SUCCESS;

        } finally {
            // Graceful tunnel closure
            $this->closeTunnel();
        }
    }
}
```

#### ManagesTunnel Methods

- `setupTunnel($connection, $dbConfig, $keepAlive, $validateDb)` - Initialize tunnel
- `ensureTunnelConnected($maxAttempts)` - Check and reconnect if needed
- `withTunnelRetry($operation, $maxAttempts)` - Execute with retry
- `validateTunnelDatabase($connection, $timeout, $wait)` - Validate database
- `validateTunnel($connection)` - Full validation
- `closeTunnel()` - Graceful shutdown
- `isTunnelRunning()` - Check status
- `getTunnel()` / `getTunnelConnection()` - Get instances

## API Reference

### Artisan Commands

- `tunnel:start {connection?} {--detach}` - Start tunnel with live monitoring (or in background with --detach)
- `tunnel:stop {connection?} {--all}` - Stop tunnel (or all tunnels with --all)
- `tunnel:status {connection?} {--all}` - Show tunnel status (or all tunnels with --all)
- `tunnel:reuse {connection?} {--db-connection=} {--db-driver=} {--db-database=} {--db-username=} {--db-password=}` - Find and reuse existing tunnel
- `tunnel:diagnose {connection?} {--db-connection=} {--verbose}` - Diagnose tunnel health

### Tunnel

#### Static Methods

- `Tunnel::connection(?string $name = null): Tunnel` - Create from config/tunnel.php
- `Tunnel::fromConfig(TunnelConfig $config): Tunnel` - Create from config object

#### Instance Methods

- `withDatabaseConnection(string $name, array $config): self` - Register Laravel DB connection
- `start(): TunnelConnection` - Start tunnel
- `reuseOrCreate(): TunnelConnection` - Smart tunnel reuse or creation
- `findExistingByPort(): ?int` - Find existing tunnel by port using lsof
- `ensureConnected(int $maxAttempts = 3): bool` - Ensure tunnel is active, reconnect if needed
- `execute(callable $callback): mixed` - Execute callback with automatic tunnel management
- `getConfig(): TunnelConfig` - Get configuration
- `getConnection(): ?TunnelConnection` - Get active connection

### TunnelConnection

- `isRunning(): bool` - Check if tunnel is running
- `getPid(): ?int` - Get process PID
- `stop(): void` - Stop tunnel
- `verifyConnection(): bool` - Verify tunnel availability
- `ensureConnected(int $maxAttempts = 3): bool` - Reconnect if tunnel is down
- `withKeepAlive(bool $keepAlive = true): self` - Set keep-alive flag
- `setupSignalHandlers(): self` - Setup SIGINT/SIGTERM handlers
- `validateDatabase(string $connectionName, int $timeout = 5): bool` - Validate database accessibility
- `waitForDatabase(string $connectionName, int $maxAttempts = 5, int $delaySeconds = 2): bool` - Wait for database with retries
- `executeWithRetry(callable $operation, ?int $maxAttempts = null): mixed` - Execute with automatic retry
- `validate(?string $connectionName = null): array` - Full validation (process + port + database)

### TunnelManager

- `saveTunnel(string $name, TunnelConnection $connection): void` - Save tunnel info to storage
- `getTunnelInfo(string $name): ?array` - Get tunnel information
- `stopTunnel(string $name): bool` - Stop tunnel by name
- `getAllTunnels(): array` - Get all running tunnels
- `getUptime(array $info): int` - Get tunnel uptime in seconds
- `formatUptime(int $seconds): string` - Format uptime as human-readable string

## Logging

The package uses standard Laravel Log facade. For detailed logging:

```env
TUNNEL_DEBUG=true
```

Or in `config/tunnel.php`:

```php
'debug' => true,
```

## Requirements

- PHP ^8.2
- Laravel ^10.0|^11.0|^12.0
- SSH client installed on the system
- AutoSSH (optional, for auto-reconnection)

## License

MIT License

## Author

Artem Yurov (artem@yurov.org)
