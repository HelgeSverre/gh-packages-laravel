# WireTier

A self-hosted ZeroTier controller UI built with Laravel and Livewire.

WireTier provides a team-based interface for sharing access to ZeroTier controller tokens, managing virtual networks, and controlling network membership — all from a clean, modern UI.

## Screenshots

| | |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.jpg) | ![Networks](docs/screenshots/networks.jpg) |
| *Dashboard — overview of networks, team members, and devices* | *Networks — manage ZeroTier networks on your controllers* |
| ![Members](docs/screenshots/members.jpg) | ![Peers](docs/screenshots/peers.jpg) |
| *Members — authorise devices and view live status* | *Peers — view node status and peer connections* |

![Controllers](docs/screenshots/controllers.jpg)
*Controllers — connect to self-hosted ZeroTier instances*

## What is ZeroTier?

[ZeroTier](https://www.zerotier.com/) is a software-defined networking tool that creates secure, peer-to-peer virtual networks. Devices running the ZeroTier client can join virtual networks and communicate directly with each other regardless of their physical location or network topology, as if they were on the same local network.

A ZeroTier **controller** manages the membership and configuration of networks. WireTier connects to one or more self-hosted ZeroTier controllers via their API, giving teams a shared interface to manage those networks.

## Features

### Team Management
- Create and manage multiple teams, each with isolated ZeroTier resources
- Invite users to teams by email
- Role-based access control with three roles:
  - **Admin** — full control over team settings, tokens, networks, and members
  - **Member** — can manage networks and members within the team
  - **Viewer** — read-only access to networks and peers
- Fine-grained permissions: `manage_networks`, `create_networks`, `delete_networks`, `manage_members`, `manage_tokens`, `view_peers`
- Team switching from the sidebar
- Grace period handling when the last team member would be removed

### ZeroTier Controller Tokens (Admin Only)
- Add ZeroTier controller API tokens — globally available to all teams
- Token values, host addresses, and node addresses are never exposed to non-admin users
- Automatically detect the controller's node address on save
- Test connectivity to the controller from the UI
- Deletion blocked when a controller has active networks

### Network Management
- Each team sees only their own networks, enriched with live data from the controller API
- Admins can discover untracked networks on controllers and import them to any team
- Create new networks with subnet suggestions and IP pool configuration
- Edit network settings: name, privacy, routes, and IP assignment pools

### Member Management
- List all members on a network with live status: IP addresses, latency, client version, last seen
- Authorise and deauthorise members directly from the UI
- Auto-refreshes every 60 seconds to keep member status current

### Peer Topology
- View peer connections for each controller node
- Inspect connectivity between nodes in the network

### Audit Log
- Records all write actions and significant reads across the application
- Searchable by user, action category, date range, and free text
- Team admins see their team's logs; system admins see all logs
- Color-coded action badges by category (auth, team, network, member, controller)

### Authentication & Security
- Email/password authentication with email verification
- Two-factor authentication (TOTP) via Laravel Fortify
- Password reset via email
- Session management and account deletion
- Security headers (X-Frame-Options, HSTS, Content-Type-Options)
- Per-user rate limiting on API calls and routes
- Encrypted sessions by default

## Tech Stack

- **Backend:** Laravel 13, PHP 8.3+
- **Authentication:** Laravel Fortify
- **Frontend:** Livewire 4, Flux UI components, Tailwind CSS 4, Vite
- **Database:** MySQL (SQLite supported for local development)
- **Queue / Cache / Sessions:** Redis-backed

---

## Installing WireTier

### Requirements

- PHP 8.3+
- Composer
- Node.js 20+ and npm
- MySQL 8+ (or SQLite for local development)
- Redis 6+
- A running ZeroTier controller with API access

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd wiretier

# Install PHP dependencies
composer install

# Install frontend dependencies
npm install

# Copy and configure the environment file
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your database connection:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wiretier
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

Then run the migrations and build the frontend:

```bash
php artisan migrate
npm run build
php artisan serve
```

The application will be available at `http://localhost:8000`.

### Development Mode

For local development with hot module replacement:

```bash
# In one terminal
php artisan serve

# In another terminal
npm run dev
```

### Configuration

Key `.env` options:

| Variable | Description |
|---|---|
| `APP_URL` | Public URL of your WireTier instance |
| `DB_CONNECTION` | Database driver (`mysql` or `sqlite`) |
| `ADMIN_TEAM_UUID` | UUID of the team with system-wide admin privileges |
| `MAIL_MAILER` | Mailer for invitations and notifications (e.g. `smtp`, `log`) |

Additional configuration (team roles, permissions, grace periods) is in `config/wiretier.php`.

---

## Configuring the Admin Team

WireTier uses an **admin team** to control access to controller management (the Controllers and Peers pages). Only members of the admin team can add ZeroTier controller tokens and view peer topology.

### Steps

1. Register an account and create a team via **Settings → Teams**
2. Copy the team's UUID from the URL when viewing its settings page — it will look like `settings/team/019d33ec-ddc7-7394-b098-29c2f34d9b4f`
3. Set that UUID as `ADMIN_TEAM_UUID` in your `.env`:

```env
ADMIN_TEAM_UUID=019d33ec-ddc7-7394-b098-29c2f34d9b4f
```

4. Restart your application (or clear config cache with `php artisan config:clear`)

Members of that team will now see the **Controllers** and **Peers** items in the sidebar and have access to link ZeroTier controller API tokens.

> Controller tokens are shared across all teams — non-admin teams see them by name only and can use them to manage their own networks. Admins can discover untracked networks on controllers and import them to any team.

---

## Setting Up ZeroTier

### What is a ZeroTier Controller?

A ZeroTier controller is not a special piece of software — it is simply a regular ZeroTier node, the same client you would install on any machine to join a network. What makes it a controller is that the ZeroTier service exposes a local HTTP API on every node it runs on, which can be used to create and manage networks and authorise members.

WireTier connects to that local API using a token, giving your node its controller superpowers through a shared, team-based web interface. Any machine running ZeroTier can act as a controller; you just need to point WireTier at it.

Visit the [ZeroTier download page](https://www.zerotier.com/download/) for official installation instructions for all platforms.

### Connecting Devices to a ZeroTier Network

Once your controller is running and you have created a network in WireTier, other devices can join that network by installing the ZeroTier client.

#### macOS

1. Download and install the ZeroTier client from [zerotier.com/download](https://www.zerotier.com/download/)
2. Once installed, the ZeroTier icon will appear in the menu bar
3. Click the icon and choose **Join Network...**
4. Enter your network ID and click **Join**
5. Approve the device in WireTier (authorise the new member on the network)

You can also join from the terminal:

```bash
sudo zerotier-cli join <network-id>
```

Check status:

```bash
zerotier-cli status
zerotier-cli listnetworks
```

#### Linux

Install the ZeroTier client using the instructions at [zerotier.com/download](https://www.zerotier.com/download/), then join a network:

```bash
sudo zerotier-cli join <network-id>
```

Check status and list joined networks:

```bash
sudo zerotier-cli status
sudo zerotier-cli listnetworks
```

The ZeroTier service can be managed with systemd:

```bash
sudo systemctl enable zerotier-one
sudo systemctl start zerotier-one
```

After a device joins, it will appear in WireTier's member list for that network. An Admin or Member with the appropriate permissions can then authorise it to allow full network access.

---

## License

[GNU General Public License v3.0](LICENSE)
