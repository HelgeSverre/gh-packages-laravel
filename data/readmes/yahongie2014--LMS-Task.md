# Mini-LMS: Pro Digital Learning Platform [Reference](https://app.code-quests.com/quest-view/76)

A high-performance, scalable Learning Management System built with **Laravel 11**, **Livewire v3**, **Sanctum**, and **Filament v3**. This project features a robust **Repository Design Pattern**, full **Multi-language support (AR/EN)**, and a production-grade **Mobile API**.

---

## 🏗️ Project Documentation

Detailed insights into our design decisions and system architecture:

- 📐 **[System Architecture](./docs/ARCHITECTURE.md)**: Deep dive into the Repository Pattern, Action classes, and multi-channel (Web/API) layers.
- 📱 **[API Documentation](./docs/API.md)**: Mobile integration guide, unified validation policies, and authentication flows.
- 🎨 **[Product Thinking & Design](./docs/PRODUCT_THINKING.md)**: Logic behind business risk management, metrics that matter, and future scalability.
- 📊 **[Entity Relationship Diagram (ERD)](./docs/ERD.md)**: Full database schema including translatable fields and relationship mappings.

---

## 🚀 Quick Start (Docker Compose)

The environment is pre-configured with **PHP 8.3-FPM**, **Nginx**, **MySQL 8.0**, and **Redis**.

### 1. Bring up the stack
```bash
docker compose up --build -d
```

### 2. Standard Bootstrap
```bash
# Install dependencies
docker compose exec app composer install
docker compose exec app npm install
docker compose exec app npm run build

# Setup application
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

### 3. Accessing the Platform
- **Student Portal**: `http://localhost:8000`
- **Admin Panel**: `http://localhost:8000/admin` (Default: `admin@lms.com` / `12345678`)
- **API Documentation**: Accessible via `routes/api.php` contracts.

---

## 🧪 Testing & Quality Assurance

We maintain a high test coverage across all core features (Authentication, Enrollment, Completion, and API Security).

```bash
docker compose exec app php artisan test
```

---

## ✨ Key Features & Technical Highlights

- 🛡️ **Security-First**: Integrated **Laravel Sanctum** for mobile security and **Policies** to gate premium lesson content.
- 📦 **Clean Code**: Strict **Repository Pattern** implementation with **Dependency Injection** via the `RepositoryServiceProvider`.
- 🔄 **Idempotent Operations**: Database-level unique constraints and atomic `Actions` prevent race conditions during enrollment or certificate issuance.
- 🌍 **Localized Core**: Native support for **Arabic and English** using translatable JSON columns and dynamic locale switching.
- ⚡ **Asynchronous Workflows**: Real-time event broadcasting (e.g., `CourseCompleted`) combined with queued jobs (PDF generation, Email delivery).

---

## 🛠️ Stack Summary
- **Backend:** Laravel 11 (PHP 8.3)
- **Frontend:** Livewire v3 + Alpine.js
- **Admin:** Filament v3
- **Database:** MySQL 8.0
- **Cache/Queue:** Redis
- **Testing:** Pest
