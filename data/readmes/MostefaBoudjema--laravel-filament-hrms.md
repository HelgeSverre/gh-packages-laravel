# HRMS - Laravel 13 & Filament 5

A comprehensive Human Resource Management System (HRMS) built with **Laravel 13**, **Filament 5 (TALL Stack)**, and **Livewire**. This system provides a multi-tenant structure supporting Superadmin, Company, and Employee panels.

## 🚀 Features

### 🏢 Multi-Panel Architecture
- **Superadmin Panel**: Manage companies, subscription-level configurations, and global settings.
- **Company Panel**: Complete HR management for a specific organization.
- **Employee Panel**: Self-service portal for staff to manage requests, view payslips, and track attendance.

### 🛠️ Core Modules
- **Employee Management**: Detailed profiles, positions, departments, and document management.
- **Attendance & Time Tracking**: Track daily attendance, shifts, and working hours.
- **Payroll System**: Automated payroll processing, payroll periods, and payslip generation (PDF).
- **Leave Management**: Leave types, balances, and request workflow.
- **Self-Service**: Letter requests, permission requests, and salary advances.
- **Violations & Rules**: Track employee violations based on configurable rules.
- **Reporting**: Export data to Excel (Attendance, Employee, Payroll) and generate PDF reports.

## 💻 Tech Stack
- **Backend**: Laravel 13 (PHP 8.3+)
- **Admin UI**: Filament v5 (Livewire, Alpine.js, Tailwind CSS)
- **Permissions**: Spatie Laravel Permission
- **Exports/Imports**: Maatwebsite Excel
- **PDF Generation**: Barryvdh Laravel DomPDF
- **Translations**: Filament Language Switch (Supports Arabic/English)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd L30-laravel13-hrms
   ```

2. **Run the setup command** (Recommended):
   This custom script handles composer install, .env creation, key generation, migrations, and frontend build.
   ```bash
   composer run setup
   ```

3. **Alternative Manual Setup**:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   npm install
   npm run dev
   ```

## 📜 Available Scripts

- `composer run dev`: Start the development server (Laravel Serve, Vite, Queue, and Pail logs concurrently).
- `composer run test`: Run PHPUnit tests.
- `php artisan filament:upgrade`: Keep Filament assets up to date.

## 📂 Project Structure

- `app/Filament`: Contains the three panel definitions (Superadmin, Company, Employee) and their respective resources.
- `app/Exports`: Excel export classes for Attendance, Employees, and Payroll.
- `database/migrations`: HRMS schema including self-service, leave balances, and core HR tables.
- `resources/views/pdf`: Templates for PDF payslips and reports.

## 📄 License
This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
