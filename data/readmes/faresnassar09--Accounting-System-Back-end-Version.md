[![tests](https://github.com/faresnassar09/Accounting-System-Back-end-Version/actions/workflows/tests.yml/badge.svg)](https://github.com/faresnassar09/Accounting-System-Back-end-Version/actions/workflows/tests.yml)

# Accounting System – Backend

Enterprise‑grade **Accounting & ERP backend** built with **Laravel**, designed with **SaaS scalability** and **enterprise architecture** in mind.

> This project is not a simple CRUD REST API. It focuses on **domain‑driven design**, **accounting correctness**, and **long‑term scalability** for real‑world business systems.

---

## 🚀 Key Features

* **Modular Monolith Architecture**

  * Clear separation of concerns using independent business modules
  * Scalable codebase suitable for large teams and long‑term maintenance

* **Multi‑Tenancy (Database per Tenant)**

  * Full data isolation between tenants
  * Secure and scalable SaaS‑ready architecture

* **Accounting Core (Double‑Entry Bookkeeping)**

  * Debit / Credit enforcement
  * Journal entries with strict accounting rules
  * Designed for financial accuracy and auditability

* **Multi‑Level Administration**

  * System Admin
  * Super Admin
  * Tenant/User Admin

* **Service & Repository Layers**

  * Clean separation between HTTP, business logic, and data access
  * Testable and maintainable architecture

* **Validation & Security**

  * Form Requests for input validation
  * Mass‑assignment protection
  * Role‑based access control

* **Testing with Pest PHP**

  * Unit & integration tests
  * Test‑driven mindset for critical accounting logic

---

## 🧱 Architecture Overview

The system follows a **Modular Monolith** approach:

```
Modules/
 ├── Accounting/
 ├── Tenancy/
 ├── Users/
 └── ...
```

Each module encapsulates its own:

* Controllers
* Services
* Repositories
* Models
* Routes

This approach provides:

* Strong boundaries between business domains
* Easier refactoring and feature expansion
* A smooth transition path to microservices if needed

---

## 🏗 Multi‑Tenancy Strategy

* Each tenant (company) has its **own database**
* Tenant resolution handled at the application layer
* Prevents data leakage and improves performance at scale

This strategy is commonly used in **enterprise SaaS platforms** where data isolation is critical.

---

## 📊 Accounting Design

* Implements **Double‑Entry Accounting** principles
* Every transaction enforces:

  * Balanced debit and credit entries
  * Clear chart of accounts structure
* Designed to support:

  * Financial reports
  * Auditing
  * Future integrations (tax, invoicing, reporting)

---

## 🧪 Testing

The project uses **Pest PHP** for testing:

* Unit tests for core domain logic
* Integration tests for modules
* Focus on reliability of financial operations

---

## 🛠 Tech Stack

* **PHP 8+**
* **Laravel**
* **MySQL / PostgreSQL**
* **Pest PHP**
* **Laravel Modules (nwidart)**

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/faresnassar09/Accounting-System-Back-end-Version.git

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate
```

---

## 🎯 Project Goals

* Build a **realistic enterprise‑level backend**
* Demonstrate advanced Laravel architecture
* Showcase SaaS‑ready system design
* Focus on correctness over quick CRUD delivery

---

## 📌 Notes

This project is intended as a **portfolio‑grade backend system**, showcasing architectural thinking, not just framework usage.

---

## 👤 Author

**Fares Ahmed Salah**
Back‑End Laravel Developer

* GitHub: [https://github.com/faresnassar09](https://github.com/faresnassar09)
* LinkedIn: [https://www.linkedin.com/in/fares-ahmed](https://www.linkedin.com/in/fares-ahmed)
