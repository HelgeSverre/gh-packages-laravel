# 🏢 Controle Aluguel (SaaS)

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-3-4e56a6?style=for-the-badge&logo=livewire&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-PestPHP-purple?style=for-the-badge&logo=php&logoColor=white)

> **Note:** This project is a SaaS developed to modernize rental management, focusing on scalability, security, and user experience.

---

## 🚀 About the Project

**Controle Aluguel** is a SaaS (Software as a Service) platform designed to facilitate property management for owners and real estate agencies. The system solves common pain points such as delinquency control, contract management, and automatic renewals.

The technical differentiator of this project lies in its robust architecture, designed for high availability and simplified maintenance, utilizing the power of the modern Laravel ecosystem.

### ✨ Main Features
- **Property and Tenant Management**: Complete CRUD with complex relationships.

- **Financial Dashboard**: Real-time payment tracking.

- **Collection Automation**: Dynamic generation of invoices.

- **Multi-tenancy**: Prepared to serve multiple clients independently.

---

## 🛠️ Tech Stack & Tools

The technology choices reflect a commitment to performance and agile development:

- **Backend/Fullstack**: PHP 8.4, Laravel 12.
- **Interactive Frontend**: Laravel Livewire 3 + Alpine.js (SPA feel without the complexity of a separate API).

- **Styling**: TailwindCSS + DaisyUI/MaryUI.

- **Database**: PostgreSQL.

- **Development Environment**: Docker, Laravel Sail.

- **Infrastructure**: Deployment-ready configuration with Nginx, PHP-FPM, Oracle.

---

## 🏗️ Architecture and Design Patterns

This project is not just "code that works," it's code designed to last. I have rigorously adopted **Clean Code** practices and **SOLID** principles.

### Software Engineering Highlights:
* **Actions**: Complex business logic is isolated in *Actions*, keeping *Controllers* and *Components* lean and focused only on HTTP response/Rendering.

* **Repository Pattern (Optional)**: Abstraction of the data layer to facilitate testing and future migrations.

* **DTOs (Data Transfer Objects)**: Guarantee of strong typing and data integrity across layers.

* **Policy Objects**: Native Laravel granular authorization control to ensure security between users.

* **CI/CD**: Automated deployment via GitHub actions on Oracle VPS

---

## 🧪 Code Quality and Testing

Reliability is ensured through a robust test suite and static analysis tools.

- **Pest PHP**: Testing framework used for Unit and Feature testing. Pest's expressive syntax facilitates live code documentation.

- **Laravel Pint**: Automatic code style standardization (PSR-12).

### Starting the Project
```bash
yarn run services:up
```
### Running the tests
```bash
yarn run test
```
### Running tests with code coverage yarn run test:coverage
```bash
yarn run test:coverage
```
