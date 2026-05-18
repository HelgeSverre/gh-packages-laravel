<p align="center">
    <h1 align="center">🛍️ Web Shop</h1>
</p>

<p align="center">
    A modern e-commerce platform built with Laravel 12, Livewire, and Stripe integration.
</p>

------

**Welcome to Web Shop!** This is a full-featured e-commerce application that demonstrates modern Laravel development practices. Built with Laravel 12, Livewire 3, and Flux UI components, this project showcases a complete shopping experience from browsing products to secure checkout with Stripe.

## ✨ Features

- 🛒 **Shopping Cart** - Session-based cart that migrates to user account on login
- 💳 **Stripe Integration** - Secure payment processing with Stripe Checkout
- 📦 **Order Management** - Complete order history and tracking
- 👤 **User Authentication** - Full authentication system with email verification
- ⚙️ **User Settings** - Profile management, password updates, and appearance preferences
- 🎨 **Modern UI** - Built with Livewire Flux components and Tailwind CSS

## 🚀 Getting Started

These instructions will guide you through setting up the project on your local machine for development and testing.

### Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2 or higher** - with SQLite, GD, and other common extensions
- **Composer 2.0+** - [Download Composer](https://getcomposer.org)
- **Node.js 16+** - [Download Node.js](https://nodejs.org)
- **Stripe Account** - [Sign up for Stripe](https://stripe.com) (for payment processing)
- **Stripe CLI** - [Install Stripe CLI](https://stripe.com/docs/stripe-cli) (for webhook testing)

### Installation

Follow these steps to set up a development environment:

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/web-shop-v1.git
cd web-shop-v1
```

#### 2. Install dependencies

Install PHP dependencies using Composer:

```bash
composer install
```

Install Node.js dependencies:

```bash
npm install
```

#### 3. Set up environment variables

Copy the example environment file and configure it:

```bash
# On macOS/Linux
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env

# On Windows (Command Prompt)
copy .env.example .env
```

#### 4. Generate application key

```bash
php artisan key:generate
```

#### 5. Configure Stripe

Add your Stripe credentials to the `.env` file:

```env
STRIPE_KEY=your_stripe_publishable_key
STRIPE_SECRET=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

> **Note**: You can find your Stripe keys in your [Stripe Dashboard](https://dashboard.stripe.com/apikeys). For local development, you'll generate the webhook secret using Stripe CLI (see step 8).

#### 6. Set up the database

Create the SQLite database file:

```bash
# On macOS/Linux
touch database/database.sqlite

# On Windows (PowerShell)
New-Item database/database.sqlite -ItemType File

# On Windows (Command Prompt)
type nul > database\database.sqlite
```

Run the migrations and seed the database:

```bash
php artisan migrate --seed
```

```bash
php artisan db:seed
```

#### 7. Link storage

Create a symbolic link from `public/storage` to `storage/app/public`:

```bash
php artisan storage:link
```

#### 8. Start the development servers

You'll need to run multiple commands in **separate terminal windows/tabs**:

**Terminal 1** - Start the Laravel development server:

```bash
php artisan serve
```

**Terminal 2** - Start the Vite development server (for frontend assets):

```bash
npm run dev
```

**Terminal 3** - Start the queue worker (for background jobs):

```bash
php artisan queue:listen --tries=1
```

**Terminal 4** - Start Stripe webhook listener (for payment webhooks):

```bash
stripe listen --forward-to http://localhost:8000/stripe/webhook --format JSON
```

> **Tip**: When you start the Stripe CLI listener, it will output a webhook signing secret. Copy this value and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

**Alternative**: Use the built-in dev command to run all servers at once:

```bash
composer dev
```

This will start the Laravel server, queue worker, and Vite dev server concurrently. You'll still need to run Stripe CLI separately in another terminal.

#### 9. Access the application

Open your browser and navigate to:

```
http://localhost:8000
```

> **Note**: By default, emails are sent to the `log` driver. You can check sent emails in `storage/logs/laravel.log`. To use a real email service, update the `MAIL_*` settings in your `.env` file.

## 🧪 Testing - WIP

This project uses [Pest PHP](https://pestphp.com) for testing. To run the test suite:

```bash
# Run all tests
composer test

# Run tests with coverage (requires Xdebug)
php artisan test --coverage
```

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows Laravel coding standards (use Pint)
- Includes tests for new features
- Passes all existing tests

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- Built as part of the [Laracasts](https://laracasts.com/series/build-a-web-shop-from-a-z) learning series
- UI components powered by [Livewire Flux](https://flux.laravel.com)
- Payment processing by [Stripe](https://stripe.com)

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Laravel Documentation](https://laravel.com/docs)
2. Check the [Livewire Documentation](https://livewire.laravel.com/docs)
3. Review existing issues in the repository
4. Create a new issue with detailed information

---

**Happy Coding!**
