# EnviroHub

A web application for monitoring and visualizing environmental sensor data from IoT devices. EnviroHub ingests readings from distributed sensor nodes and displays temperature, humidity, pressure, and CO2 levels on an interactive dashboard.

## Features

- **Live dashboard** — visualize sensor readings per home and node with Chart.js charts
- **Multi-location support** — manage multiple homes, each with multiple sensor nodes
- **REST API** — ingest sensor data from IoT devices using bearer token authentication
- **Auto node provisioning** — nodes are created automatically on first data submission

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Laravel 12, PHP 8.2+ |
| Frontend | Livewire 4, Alpine.js, Tailwind CSS 4 |
| Charts | Chart.js 4 |
| Build | Vite 7 |
| Database | SQLite (default) |
| Testing | PHPUnit 11 |

## Getting Started

### Requirements

- PHP 8.2+
- Composer
- Node.js & npm

### Installation

```bash
composer run setup
```

This single command will:
1. Install PHP dependencies
2. Copy `.env.example` to `.env`
3. Generate an application key
4. Run database migrations
5. Install Node dependencies and build frontend assets

### Local Development

```bash
composer run dev
```

Starts all development processes concurrently:
- Laravel development server (`php artisan serve`)
- Queue worker (`php artisan queue:listen`)
- Log viewer (`php artisan pail`)
- Vite watch mode (`npm run dev`)

### Seed Development Data

```bash
php artisan db:seed
```

Seeds 3 homes with 72 hours of realistic sensor readings at 15-minute intervals, simulating daily temperature cycles, inverse humidity, and CO2 variations based on occupancy hours.

## Configuration

Copy `.env.example` to `.env` and set the following:

```env
# Required for API authentication
API_BEARER_TOKEN=your-secret-token-here

# Database (defaults to SQLite)
DB_CONNECTION=sqlite
```

## API

### `POST /api/v1/sensor-data`

Stores a sensor reading from a node. Requires a bearer token.

**Headers**
```
Authorization: Bearer your-secret-token-here
Content-Type: application/json
```

**Request body**
```json
{
    "node_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "temperature": 22.5,
    "humidity": 45.3,
    "pressure": 1013,
    "carbon_dioxide": 420,
    "measured_at": "2024-01-01T12:00:00Z"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `node_uuid` | string (UUID) | yes | valid UUID format |
| `temperature` | numeric | yes | between -100 and 100 |
| `humidity` | numeric | yes | between 0 and 100 |
| `pressure` | integer | yes | min 0 |
| `carbon_dioxide` | integer | no | min 0 |
| `measured_at` | datetime | yes | valid date string |

**Responses**

`201 Created`
```json
{
    "message": "Sensor data stored successfully.",
    "data": { }
}
```

`401 Unauthorized` — missing or invalid bearer token

`422 Unprocessable Entity` — validation failed

> Nodes are provisioned automatically. If the submitted `node_uuid` is not yet known, a new Node record is created. Subsequent submissions reuse the existing node.

## Testing

```bash
composer run test
```

Tests run against an in-memory SQLite database. The suite covers:
- API authentication (valid/invalid tokens)
- Request validation (all fields, boundary values)
- Sensor data persistence and node resolution logic

## Project Structure

```
app/
├── Http/
│   ├── Controllers/Api/    # API controllers
│   ├── Middleware/         # API token authentication
│   └── Requests/           # Form request validation
├── Livewire/               # Livewire components (dashboard)
├── Models/                 # Eloquent models (Home, Node, SensorData)
└── Services/               # Business logic (SensorDataService)
resources/
├── js/                     # Alpine.js components, Chart.js setup
├── css/                    # Tailwind CSS
└── views/                  # Blade templates and Livewire views
tests/
├── Feature/Api/            # HTTP endpoint tests
└── Unit/Services/          # Service layer unit tests
```

## Version

Current version: `v0.1.0` — see `VERSION.txt`
