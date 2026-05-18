# Laravel Blueprint
<p align="center">
  <img src="public/images/img.png" width="2543" alt="filament admin">
</p>
Opinionated Laravel starter kit built for scalable, maintainable and production-ready applications.

> This repository contains my preferred stack, structure, tooling and architectural decisions for starting new Laravel projects.

---

## 🚀 Goals

- Start projects faster
- Keep architecture clean and scalable
- Avoid repeating setup steps
- Enforce consistent development standards
- Production-ready from day one

---

## 🧱 Stack

- Laravel
- React (if included)
- Filament (if included)
- Docker
- MySQL
- Redis
- Mailhog
- PHPUnit / Pest
- PHPStan
- Laravel Pint

---

## 📐 Architectural Decisions

This project follows an opinionated structure:

- Service Layer for business logic
- Form Requests for validation
- DTOs for structured data transfer
- Action classes where needed
- Enum usage instead of magic values
- Separation of concerns
- SOLID principles

Folder structure is organized to improve long-term maintainability.

---

## 🐳 Docker Setup

Make sure Docker is installed.

Run:

```bash
make up
```

Other useful commands:

```bash
make down
make migrate
make seed
make test
make fresh
```

---

## ⚙️ Installation

```bash
git clone <repo-url> project-name
cd project-name
cp .env.example .env
composer install
php artisan key:generate
```

If using Docker:

```bash
make up
```

---

## 🧪 Testing

```bash
make test
```

or

```bash
php artisan test
```

---

## 🧹 Code Quality

- Laravel Pint for formatting
- PHPStan for static analysis
- Strict typing enabled where possible

Run:

```bash
./vendor/bin/pint
./vendor/bin/phpstan analyse
```

---

## 🌍 Internationalization

- English (LTR)
- Persian (RTL)
- Configured for easy language extension

---

## 🔐 Environment Philosophy

- Environment-driven configuration
- No hardcoded secrets
- Clear separation between local, staging and production

---

## 📦 Packages Included

(List your installed packages here with short explanation)

Example:

- Telescope – debugging
- Filament – admin panel
- Sanctum – API authentication

---

## 🧠 Why This Exists

After working on multiple Laravel projects, I noticed repeated setup tasks and inconsistent structure decisions.

This blueprint represents my evolving engineering standards and preferred development workflow.

It will continue to improve over time.

---

## 🛠 Roadmap

- [ ] Improve Docker optimization
- [ ] Add CI configuration
- [ ] Add deployment template
- [ ] Improve test coverage
- [ ] Performance baseline setup

---

## 👤 Author

Mohamadreza Rezaei

---

## 📄 License

Private use only (for now).
