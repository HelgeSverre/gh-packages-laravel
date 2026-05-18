# PlanForge

> AI-powered project planning: from idea to PRD to Tech Spec to Tasks in minutes.

[![CI](https://github.com/MujahidAbbas/planforge/actions/workflows/ci.yml/badge.svg)](https://github.com/MujahidAbbas/planforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

PlanForge is a self-hosted project planning tool that uses AI to generate comprehensive project documentation from a simple idea. It creates Product Requirements Documents (PRDs), Technical Specifications, and actionable tasks - all organized in a Kanban board.

## Features

- **AI-Powered Generation** - Transform project ideas into structured documentation
- **Multi-Provider AI** - Support for Anthropic Claude, OpenAI GPT, and Google Gemini
- **PRD Generation** - Automatic Product Requirements Document creation
- **Tech Spec Generation** - Detailed technical specifications based on the PRD
- **Task Generation** - Break down tech specs into actionable development tasks
- **Version History** - Browse, preview, and restore previous document versions
- **Markdown Preview** - Write/Preview/Split editor modes with syntax highlighting
- **Kanban Board** - Drag-and-drop task management with Flowforge
- **User Authentication** - Secure login with email/password
- **Regeneration** - Regenerate individual documents or the entire pipeline
- **Export** - Download project kit as ZIP (PRD, Tech Spec, Tasks, metadata)
- **Rate Limit Resilience** - Graceful handling of API rate limits with automatic retries
- **GitHub Integration** - Two-way sync between tasks and GitHub Issues

## Tech Stack

- **Backend**: Laravel 12, PHP 8.3+
- **Frontend**: Livewire 3, Alpine.js, Tailwind CSS
- **AI**: PrismPHP (Anthropic Claude, OpenAI, Google Gemini)
- **Auth**: Laravel Breeze
- **Kanban**: Filament 4 + Flowforge
- **Database**: SQLite (default) or MySQL/PostgreSQL
- **Queue**: Database driver (Redis optional)

## Quick Start

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+
- An API key from one of: [Anthropic](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/), or [Google AI](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/MujahidAbbas/planforge.git
cd planforge

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure your AI provider in .env (see Configuration section)

# Create database and run migrations
touch database/database.sqlite
php artisan migrate

# Build frontend assets
npm run build

# Seed demo data (optional)
php artisan db:seed --class=DemoSeeder
```

### Running the Application

```bash
# Start all services (server, queue, logs, vite)
composer dev

# Or run individually:
php artisan serve          # Web server
php artisan queue:listen   # Queue worker (required for AI generation)
npm run dev               # Vite dev server
```

Visit `http://localhost:8000` to create an account and get started.

## Usage

1. **Create Account** - Register with email/password
2. **Create a Project** - Enter your project idea and any constraints
3. **Generate** - Click "Generate All" to create PRD, Tech Spec, and Tasks
4. **Review & Edit** - Edit the generated documents in the PRD and Tech tabs
5. **Version History** - Click the clock icon to browse and restore previous versions
6. **Manage Tasks** - Drag tasks between columns in the Kanban board
7. **Regenerate** - Use the Regenerate dropdown to refresh specific documents
8. **Export** - Download your project kit as a ZIP file

## Testing

```bash
# Run all tests
./vendor/bin/pest

# Run specific test file
./vendor/bin/pest tests/Feature/ExportTest.php

# Run with coverage
./vendor/bin/pest --coverage
```

## Configuration

### AI Provider

PlanForge supports multiple AI providers. Configure your preferred provider in `.env`:

**Anthropic Claude (default):**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

**OpenAI GPT:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o  # Optional, defaults to gpt-4o
```

**Google Gemini:**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash  # Optional
```

### Queue Driver

For production, consider using Redis:

```env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
```

## Roadmap

- [x] ~~Task generation from Tech Spec~~ (v0.2.0)
- [x] ~~Multiple AI provider support~~ (v0.3.0)
- [x] ~~User authentication~~ (v0.4.0)
- [x] ~~Version history~~ (v0.5.0)
- [x] ~~GitHub Issues integration~~ (v0.6.0)
- [x] ~~Markdown preview with syntax highlighting~~ (v0.7.0)
- [ ] Team collaboration
- [ ] Project templates
- [ ] Diff comparison for versions

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for reporting instructions.

## License

PlanForge is open-source software licensed under the [MIT license](LICENSE).
