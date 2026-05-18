# Livewire Workflows Testbench

Complete workflow examples for the [pixelworxio/livewire-workflows](https://github.com/pixelworxio/livewire-workflows) package demonstrating multi-step processes in Laravel/Livewire.

## Setup

### Prerequisites
- PHP 8.3+
- Composer
- SQLite (default) or MySQL

### Installation

```bash
git clone https://github.com/pixelworxio/livewire-workflows-testbench.git
cd livewire-workflows-testbench
composer install
npm install
cp .env.example .env
php artisan key:generate
```

If not using SQLite, update .env w/ your database credentials.

```bash
php artisan migrate
php artisan db:seed --class=AppointmentWorkflowSeeder
npm run dev
php artisan serve
```

Visit `http://localhost:8000`

## Workflows

### 1. Registration (`/register-test`)

Four-step user account creation with validation. Start here and demo a registration workflow by registering for a user account.

**Steps:**
1. User credentials (email, password)
2. Business info (name, type)
3. Demographics (age, location)
4. Subscription tier selection

Manual: Navigate `/register-test`, complete each step, submit → redirects to `/login-test`.

---

### 2. Login (`/login-test`)

Four-step authentication with optional MFA.

**Steps:**
1. Account login (email, password)
2. MFA verification
3. Subscription check (create if missing)
4. Payment method validation (add if missing)

Manual: Navigate `/login-test`, enter credentials → complete remaining steps based on your account state.

---

### 3. Appointments (`/book-appointment`)

Four-step appointment scheduling.

**Steps:**
1. Service selection
2. Provider selection
3. Time slot selection
4. Confirmation and booking

Manual: Navigate `/book-appointment`, select service → provider → available time → confirm.

---

### 4. Checkout (`/checkout`)

Five-step e-commerce purchase flow.

**Steps:**
1. Cart review
2. Shipping address
3. Billing address
4. Payment method
5. Order confirmation

Manual: Navigate `/checkout`, review cart → enter shipping → enter billing → payment method → confirm.

---

## Key Files

- `routes/workflows.php` - Workflow definitions
- `app/Guards/` - Step guards (conditional logic)
- `app/Livewire/` - Livewire components
- `resources/views/livewire/` - component views

## References

- [Livewire Workflows Package](https://github.com/pixelworxio/livewire-workflows)
- [Livewire Docs](https://livewire.laravel.com)
- [Laravel Docs](https://laravel.com/docs)
