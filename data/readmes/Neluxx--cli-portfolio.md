# CLI Portfolio

This is my personal portfolio — but not your typical one.  
Instead of scrolling through a static page, you interact with it through a terminal interface running directly in your browser.  
Type commands to
find out who I am, what I have built, and how to get in touch.

---

## Features

- **Interactive terminal UI** — a fully functional browser-based command-line interface
- **Command history** — navigate previous commands with ↑ / ↓ arrow keys
- **Tab autocomplete** — press Tab to complete a command
- **Multi-language support** — switch language with the `lang` command
- **Easter eggs** — hidden commands for the curious
- **Docker ready** — Production Docker setup included
---

## Tech Stack

| Layer      | Technology                 |
|------------|----------------------------|
| Backend    | PHP 8.2, Laravel 12        |
| Frontend   | Livewire 4, Tailwind CSS 4 |
| Database   | SQLite                     |
| Build Tool | Vite 7                     |
| Testing    | PHPUnit 11, Mockery        |

---

## Available Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `help`       | List all available commands        |
| `about`      | Learn about me                     |
| `skills`     | View my technical skills           |
| `experience` | View my work experience            |
| `education`  | View my educational background     |
| `projects`   | Browse my projects                 |
| `socials`    | Find me on social media            |
| `lang`       | Switch the display language        |
| `clear`      | Clear the terminal                 |
| `welcome`    | Show the welcome message again     |

There are also a few hidden easter egg commands — type carefully.

---

## Getting Started

### Prerequisites

- PHP 8.4+
- Composer
- Node.js & npm
- SQLite

### Installation

```bash
git clone https://github.com/neluxx/cli-portfolio.git
cd cli-portfolio
composer run setup
```

This will install all dependencies, set up the `.env` file, generate an application key, run migrations, and build the frontend assets.

---

## Running the Application

```bash
composer run dev
```

This starts all services concurrently: the Laravel dev server, queue listener, log watcher, and the Vite HMR dev server. Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Production (Docker)

Copy and configure the production environment file:

```bash
cp .env.prod.example .env
```

Then start the production stack:

```bash
docker compose up -d
```

The app will be available on port **8080**. The stack includes a PHP-FPM application container and an Nginx reverse proxy.

To rebuild and restart after code changes:

```bash
docker compose up -d --build
```

---

## Running Tests

```bash
composer run test
```
