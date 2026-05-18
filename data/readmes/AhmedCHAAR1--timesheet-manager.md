# Timesheet Manager

A full-stack web application for managing project timesheets. Track work hours across work packages, record digital signatures, and export monthly reports to Excel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 20 + Angular Material |
| Backend | Laravel 12 (PHP 8.2+) |
| Database | MySQL (SQLite for dev) |
| Auth | Laravel Sanctum |
| Export | Maatwebsite Excel |

## Features

- **Project management** — create and manage projects with grant numbers, beneficiaries, and date ranges
- **Work packages** — organize each project into work packages with codes and descriptions
- **Timesheet entries** — log daily hours per work package with decimal precision
- **Signatures** — record digital signatures (signer name, role, date) per project
- **Excel export** — generate formatted monthly timesheet reports filtered by person, month, and year
- **People directory** — list all unique persons across projects for quick lookup

## Project Structure

```
timesheet-manager/
├── backend/        # Laravel REST API
└── frontend/       # Angular SPA
```

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- MySQL (or use the included SQLite database for development)

---

### Backend — `backend`

```bash
cd backend

# Install dependencies
composer install

# Copy and configure environment
cp .env.example .env
php artisan key:generate

# Configure your database in .env, then run migrations
php artisan migrate

# Start the development server
php artisan serve
```

The API will be available at `http://localhost:8000`.

---

### Frontend — `frontend`

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:4200`.

> Make sure the API URL in `frontend/src/environments/environment.ts` points to your running Laravel server.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/{id}` | Get a project |
| PUT | `/api/projects/{id}` | Update a project |
| DELETE | `/api/projects/{id}` | Delete a project |
| GET | `/api/projects/{id}/wps` | List work packages |
| POST | `/api/projects/{id}/wps` | Add a work package |
| PUT | `/api/work-packages/{id}` | Update a work package |
| DELETE | `/api/work-packages/{id}` | Delete a work package |
| GET | `/api/projects/{id}/timesheets` | List timesheet entries |
| POST | `/api/projects/{id}/timesheets` | Add a timesheet entry |
| PUT | `/api/timesheets/{id}` | Update an entry |
| DELETE | `/api/timesheets/{id}` | Delete an entry |
| POST | `/api/timesheets/export` | Export to Excel |
| GET | `/api/projects/{id}/signatures` | List signatures |
| POST | `/api/projects/{id}/signatures` | Add a signature |
| PUT | `/api/signatures/{id}` | Update a signature |
| DELETE | `/api/signatures/{id}` | Delete a signature |
| GET | `/api/people` | List all persons |
| POST | `/api/projects/find-by-person-and-month` | Find projects by person & month |

## License

MIT
