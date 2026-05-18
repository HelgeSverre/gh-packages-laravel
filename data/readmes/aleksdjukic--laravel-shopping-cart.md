# Laravel Shopping Cart

![Laravel](https://img.shields.io/badge/Laravel-12-red)
![PHP](https://img.shields.io/badge/PHP-8.4-blue)
![Livewire](https://img.shields.io/badge/Livewire-v3-orange)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

This project is a simple e-commerce shopping cart application built with **Laravel 12** and **Livewire**.

The goal was to demonstrate clean backend logic, proper use of Laravel features, and a pragmatic approach while keeping the implementation simple and focused.

---

## 🧰 Tech Stack

- **Backend:** Laravel 12
- **Frontend:** Livewire (Laravel Breeze starter kit)
- **Styling:** Tailwind CSS
- **Database:** SQLite (for simplicity)
- **Auth:** Laravel Breeze (built-in authentication)
- **Queue / Jobs:** Laravel Jobs
- **Scheduler:** Laravel Scheduler
- **Version Control:** Git / GitHub

---

## 🗂 Project Structure (High level)

```text
app/
├── Models/              # Eloquent models (Product, Cart, Order…)
├── Services/            # Business logic (CartService, CheckoutService)
├── Jobs/                # Async jobs (LowStockNotificationJob)
├── Mail/                # Mailable classes
├── Console/Commands/    # Artisan commands (Daily sales report)
└── Livewire/            # UI components (Products, Cart)
```

---

## ✨ Features

### Products
- Browse list of products
- Each product has:
  - name
  - price
  - stock quantity

### Cart
- Cart is **persisted in the database**
- Cart is **associated with the authenticated user**
- Users can:
  - add products to cart
  - update quantities
  - remove items
- Users **cannot add more items than available stock**

### Checkout
- Checkout creates an order from cart items
- Product stock is reduced on successful checkout
- Cart is cleared after checkout
- Checkout is wrapped in a database transaction
- Business rule violations (e.g. insufficient stock) are handled gracefully

### Low Stock Notification
- When product stock falls below a defined threshold, a **queued job** sends a notification email to a dummy admin user

### Daily Sales Report
- A scheduled command generates a daily sales report
- The report is sent via email to a dummy admin user
- The command is scheduled to run daily at 20:00.
- It can also be executed manually using an Artisan command for testing purposes.

### Testing
- One **feature test** demonstrates the checkout flow:
  - order creation
  - stock reduction
  - cart cleanup

---

## 🛠 Useful Commands

Generate the daily sales report manually:

```bash
php artisan report:daily-sales
```

---

## 🧠 Architectural Notes

- Business logic is kept inside **service classes**
- Controllers / routes act as HTTP boundaries
- Custom **business exceptions** are used instead of system exceptions
- Validation is performed at multiple layers:
  - Cart (UX protection)
  - Checkout (data consistency)

The implementation intentionally avoids over-engineering and focuses on clarity and correctness.

---

## 🚀 Setup Instructions

```bash
git clone https://github.com/aleksdjukic/laravel-shopping-cart.git
cd laravel-shopping-cart

composer install
npm install
npm run build

cp .env.example .env
php artisan key:generate

php artisan migrate --seed
php artisan serve
