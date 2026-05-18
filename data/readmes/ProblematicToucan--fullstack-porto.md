# Fullstack Portfolio & Blog

This is a modern, high-performance, full-stack portfolio and blog platform built to showcase projects, share insights, and interact with visitors via an AI-powered assistant. Recently upgraded to **Laravel 13**.

## Platform Features

- **Project Showcase**: Display projects with rich media (`ProjectMedia`), categories, and tech stack information.
- **Blog System**: Built-in blogging capabilities (`Post`) to share technical articles and updates.
- **Advanced Performance & Caching**: Robust caching mechanisms store lightweight raw attributes (instead of monolithic models). Includes automatic intelligent cache invalidation via Eloquent Observers across the main views (Landing page, About page).
- **Admin Dashboard**: A secure and elegant backend control panel powered by Filament v5 for managing content directly.
- **Extensible Storage**: Pre-configured support for local, AWS S3, and Cloudflare R2 object storage for project assets.

### AI Guest Assistant & Search
Features a sophisticated conversational assistant (`GuestAssistant`) that acts as an interactive guide for visitors.
- **Hybrid Search Architecture**: Combines semantic structure extraction alongside PostgreSQL `pg_trgm` fuzzy matching and Full-Text Search.
- **Flexible Local Development**: Built-in automatic SQLite fallback for FTS! This allows you to rapidly build and develop locally without needing a PostgreSQL `pgvector` extension configured immediately.
- **AI Safety & Quality Guardrails**: Embedded `GuestAssistantGuardrails` middleware automatically evaluates, limits, categorizes, and blocks unwanted untrusted prompts, complete with moderation caching to heavily enhance output safety and API performance. 
- **Tailored Interactions**: Assistant natively leverages real-time project models and About profiles, and output is gracefully handled via an aesthetically pleasing Markdown-rendered chat UI.

## Tech Stack

- **Framework**: [Laravel 13](https://laravel.com) / PHP 8.2+
- **Frontend**: Blade Templating, [Tailwind CSS v4](https://tailwindcss.com), Vite
- **Admin Panel**: [Filament v5](https://filamentphp.com)
- **High Performance**: Optimized with [Laravel Octane](https://laravel.com/docs/octane) (FrankenPHP) and dynamic caching.
- **AI Integration**: [Laravel AI SDK](https://github.com/laravel/ai) providing intelligent capabilities.
- **Database**: PostgreSQL (recommended for production `pgvector` & GIN index support) / SQLite (supported for rapid local development).

## Getting Started

### Prerequisites
- PHP 8.4+
- Composer
- Node.js & NPM

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fullstack-porto
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**
   Copy the example environment file and generate an application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   *Note: For production, you can configure your `.env` to connect to PostgreSQL to take full advantage of AI vector search. For local development, the default SQLite works immediately thanks to our generic database fallback.*

5. **Run Database Migrations:**
   ```bash
   php artisan migrate
   ```

6. **Build Frontend Assets:**
   ```bash
   npm run build
   ```
   *(Or run `npm run dev` for hot module replacement during development).*

7. **Start the Application:**
   For local development:
   ```bash
   php artisan serve
   ```
   For high-performance execution using Octane:
   ```bash
   php artisan octane:start --server=frankenphp
   ```

## Development

- Access the backend management interface via `/admin`.
- Make sure that if you are contributing new components, you utilize Tailwind core utilities and follow standard Filament conventions for administrative pages.
