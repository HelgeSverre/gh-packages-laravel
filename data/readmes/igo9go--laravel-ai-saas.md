# Laravel AI SaaS

A full-featured AI SaaS boilerplate built with Laravel 12, Livewire 3, and Tailwind CSS. 

## Features

- **Authentication**: Laravel Fortify + Socialite (Google, GitHub OAuth)
- **RBAC**: Spatie Permission with wildcard support (`admin.*`, `*`)
- **Payment**: Multi-provider support (Stripe, PayPal, Creem)
- **AI Integration**: Multi-provider support (Replicate, OpenAI)
- **Storage**: Multi-provider support (S3, Cloudflare R2)
- **Credits System**: FIFO consumption with database locking
- **Real-time UI**: Livewire 3 + Alpine.js
- **Internationalization**: English and Chinese support
- **Admin Dashboard**: User, Order, Subscription, Credit management

## Tech Stack

- **Framework**: Laravel 12
- **Frontend**: Livewire 3 + Alpine.js
- **CSS**: Tailwind CSS v4
- **Database**: PostgreSQL (SQLite for development)
- **Auth**: Laravel Fortify + Socialite
- **RBAC**: Spatie Permission
- **API**: Laravel Sanctum

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL or SQLite

## Installation

### 1. Clone and Install Dependencies

```bash
cd laravel-ai-saas

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

Edit `.env` file with your configuration:

```env
APP_NAME="Laravel AI SaaS"
APP_URL=http://localhost:8000

# Database (SQLite for quick start)
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

# Or use PostgreSQL
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=laravel_ai_saas
# DB_USERNAME=postgres
# DB_PASSWORD=

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Payment Providers
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_MODE=sandbox

# AI Providers
REPLICATE_API_TOKEN=
OPENAI_API_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
```

### 3. Database Setup

```bash
# Create SQLite database (if using SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Initialize RBAC (roles and permissions)
php artisan rbac:init

# Assign super_admin role to a user (optional)
php artisan rbac:init --admin-email=admin@example.com
```

### 4. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 5. Start the Server

```bash
php artisan serve
```

Visit `http://localhost:8000`

## Project Structure

```
laravel-ai-saas/
├── app/
│   ├── Contracts/          # Interfaces (Payment, AI, Storage)
│   ├── Extensions/         # Provider implementations
│   │   ├── AI/            # AIManager, Replicate, OpenAI
│   │   ├── Payment/       # PaymentManager, Stripe, PayPal
│   │   └── Storage/       # StorageManager, S3, R2
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/       # API controllers
│   ├── Livewire/          # Livewire components
│   │   ├── Admin/         # Admin management
│   │   ├── Chat/          # Chat interface
│   │   ├── Credits/       # Credits history
│   │   ├── Dashboard/     # Dashboard widgets
│   │   ├── Generator/     # AI generators
│   │   ├── Landing/       # Landing page sections
│   │   └── Settings/      # User settings
│   ├── Models/            # Eloquent models
│   ├── Providers/         # Service providers
│   └── Services/          # Business logic
├── config/                # Configuration files
├── database/
│   └── migrations/        # Database migrations
├── lang/
│   ├── en/               # English translations
│   └── zh/               # Chinese translations
├── resources/
│   ├── css/              # Tailwind CSS
│   ├── js/               # JavaScript (Alpine.js)
│   └── views/
│       ├── layouts/      # Blade layouts
│       ├── livewire/     # Livewire component views
│       └── pages/        # Page views
└── routes/
    ├── api.php           # API routes
    └── web.php           # Web routes
```

## Commands

```bash
# Development
php artisan serve          # Start development server
npm run dev               # Start Vite dev server

# Database
php artisan migrate        # Run migrations
php artisan migrate:fresh  # Fresh migration
php artisan db:seed       # Run seeders

# RBAC
php artisan rbac:init     # Initialize roles/permissions
php artisan rbac:assign   # Assign roles to users

# Cache
php artisan cache:clear   # Clear application cache
php artisan config:clear  # Clear config cache
php artisan view:clear    # Clear view cache

# Production
npm run build             # Build assets
php artisan optimize      # Optimize for production
```

## API Endpoints

### Authentication (Sanctum)

All authenticated routes require Bearer token.

### User API
- `POST /api/user/get-user-info` - Get user information
- `POST /api/user/get-user-credits` - Get user credits
- `POST /api/user/credit-history` - Get credit history
- `POST /api/user/update-profile` - Update profile
- `POST /api/user/api-keys` - Get API keys
- `POST /api/user/create-api-key` - Create API key

### Payment API
- `GET /api/payment/providers` - Get available providers
- `POST /api/payment/checkout` - Create checkout session
- `POST /api/payment/subscribe` - Create subscription
- `POST /api/payment/orders` - Get user orders
- `POST /api/payment/notify/{provider}` - Webhook handler

### AI API
- `GET /api/ai/models` - Get available models
- `POST /api/ai/generate` - Generate content
- `POST /api/ai/query` - Query AI
- `POST /api/ai/stream` - Stream response
- `POST /api/ai/tasks` - Get AI tasks

### Chat API
- `POST /api/chat` - Send chat message
- `POST /api/chat/new` - Create new chat
- `POST /api/chat/list` - List chats
- `POST /api/chat/messages` - Get chat messages
- `POST /api/chat/delete` - Delete chat

## Default Roles

| Role | Permissions |
|------|-------------|
| super_admin | `*` (all permissions) |
| admin | `admin.*` |
| editor | `admin.posts.*`, `admin.pages.*` |
| viewer | `admin.posts.read`, `admin.pages.read` |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| APP_KEY | Application encryption key | Yes |
| DB_CONNECTION | Database driver | Yes |
| STRIPE_KEY | Stripe publishable key | For payments |
| STRIPE_SECRET | Stripe secret key | For payments |
| REPLICATE_API_TOKEN | Replicate API token | For AI |
| OPENAI_API_KEY | OpenAI API key | For AI |

## License

MIT License

