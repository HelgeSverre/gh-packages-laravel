# 🎨 Filament Fun - Modern Laravel Admin Panel

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-3.2-F59E0B?style=flat)](https://filamentphp.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat&logo=php)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive learning project exploring Filament PHP's capabilities - featuring multi-tenancy, role management, Stripe payments, and real-time notifications in a beautifully crafted admin interface.

---

## 📸 Screenshots

<details open>
<summary><b> Click to expand/collapse screenshots</b></summary>

<br>

### 📊 Dashboard & Analytics

**Dashboard Overview**  
*Main dashboard with key metrics and charts*

<img width="1423" height="646" alt="Screenshot 2025-11-19 at 20 01 02" src="https://github.com/user-attachments/assets/fd12c0e6-19f4-49b5-a6f1-6a53d287abc2" />

---

### 👥 Employee Management

**Employee List**  
*Employee listing with filters and bulk actions*

<img width="1103" height="591" alt="Screenshot 2025-11-19 at 20 19 34" src="https://github.com/user-attachments/assets/cdbed3f3-ceaf-4fa5-8bbc-1b6bb971f92c" />

<br>

**Employee Create**  
*Employee creation form with department selection*

<img width="1065" height="534" alt="Screenshot 2025-11-19 at 20 20 06" src="https://github.com/user-attachments/assets/796ae3f5-1e8a-4226-a9e7-49a9945b9eff" />

<br>

<img width="1098" height="605" alt="Screenshot 2025-11-19 at 20 20 51" src="https://github.com/user-attachments/assets/031b3bc9-8509-4921-9829-7a2815be9fec" />

<br>

**Employee Details**  
*Detailed employee profile with relationship tabs*

<img width="1082" height="602" alt="Screenshot 2025-11-19 at 20 21 35" src="https://github.com/user-attachments/assets/35a81146-c53f-4280-9d04-237c24701b0b" />

<br>

<img width="1108" height="481" alt="Screenshot 2025-11-19 at 20 22 02" src="https://github.com/user-attachments/assets/b44d5e9b-8036-4266-939b-6b036cbf00d9" />

---

### 📦 Product Management

**Product List**  
*Product catalog with search and categories*

<img width="1074" height="593" alt="Screenshot 2025-11-19 at 20 22 53" src="https://github.com/user-attachments/assets/073632e5-9528-49e5-8485-6d0a20501543" />

<br>

**Product Create**  
*Product creation with inventory management*

<img width="978" height="468" alt="Screenshot 2025-11-19 at 20 23 22" src="https://github.com/user-attachments/assets/63af8830-ae66-488e-9030-ee6aaa9a5f15" />

---

### 🌍 Location Management

**Countries, States & Cities**  
*Country, state, and city management*

<img width="1097" height="583" alt="Screenshot 2025-11-19 at 20 24 15" src="https://github.com/user-attachments/assets/2757e0e0-bb2c-44b3-9a15-8422c010a66d" />

<br>

<img width="1118" height="594" alt="Screenshot 2025-11-19 at 20 25 13" src="https://github.com/user-attachments/assets/32e4e966-1d95-4518-bc49-697337998ce1" />

---

### 💳 Stripe Integration

**Payment Dashboard**  
*Stripe payment overview and management*

<img width="1088" height="469" alt="Screenshot 2025-11-19 at 20 25 59" src="https://github.com/user-attachments/assets/7b7ef33a-f8e8-428f-9320-3e3609d99dc2" />

<br>

**Payment Processing**  
*Stripe payment processing interface*

<img width="822" height="591" alt="Screenshot 2025-11-19 at 20 26 35" src="https://github.com/user-attachments/assets/94bb00fa-0ed3-4ad2-be36-e64365365742" />

---

### 🛡️ Roles & Permissions

**Roles List**  
*Role management with Shield integration*

<img width="1107" height="452" alt="Screenshot 2025-11-19 at 20 28 26" src="https://github.com/user-attachments/assets/f484d684-169d-41b1-b4d4-1f1d9e513f48" />

<br>

**Permission Matrix**  
*Permission assignment interface*

<img width="1101" height="587" alt="Screenshot 2025-11-19 at 20 28 54" src="https://github.com/user-attachments/assets/977c9d4c-c6eb-478c-a65f-6594714dd292" />

<br>

**User Roles**  
*User role assignment*

<img width="1050" height="536" alt="Screenshot 2025-11-19 at 20 29 15" src="https://github.com/user-attachments/assets/9c2c628d-413f-4895-ade2-feb7cc56d3c9" />

</details>

---

## ✨ Key Features

### 🎯 Core Functionality
- **Modern Admin Panel** - Built with Filament 3.2 for exceptional UX
- **Multi-Tenancy** - Team-based data isolation and management
- **Advanced RBAC** - Role & permission system with Filament Shield
- **Employee Management** - Complete HR module with departments and locations
- **Product Catalog** - Full-featured product and inventory management

### 💳 Integrations & Tools
- **Stripe Payments** - Secure payment processing
- **Real-time Notifications** - Powered by Laravel Reverb WebSockets
- **Blog System** - Content management with Firefly Blog
- **Automated Backups** - Scheduled backups with Spatie Laravel Backup
- **Activity Logging** - Complete audit trail of system actions
- **Excel Export** - Data export capabilities

### 🎨 User Experience
- **Dashboard Analytics** - Beautiful charts with Apex Charts
- **Spotlight Search** - Quick navigation (⌘K / Ctrl+K)
- **Multi-language** - Full translation support
- **Dark Mode** - Built-in theme switching

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **PHP** 8.2 or higher
- **Composer** 2.x
- **Node.js** 18+ and npm
- **MySQL** 5.7+ / **PostgreSQL** / **MariaDB** 10.3+
- **PHP Extensions**: `ext-intl`, `ext-gd`, `ext-zip`

### Installation

**1️⃣ Clone & Install Dependencies**
```bash
git clone <repository-url>
cd filament-fun
composer install
npm install
```

**2️⃣ Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

**3️⃣ Configure Database**

Update your `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=filament_fun
DB_USERNAME=root
DB_PASSWORD=your_password
```

**4️⃣ Run Migrations & Seed Data**
```bash
php artisan migrate --seed
php artisan storage:link
```

**5️⃣ Configure Stripe** (Optional)
```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_CURRENCY=usd
```

**6️⃣ Build Frontend Assets**
```bash
npm run build  # Production
# OR
npm run dev    # Development with HMR
```

---

## 🎮 Running the Application

### Option 1: One Command to Rule Them All (Recommended)
```bash
composer dev
```

This starts:
- 🌐 Laravel dev server → `http://localhost:8000`
- 📦 Queue worker (for async jobs)
- 📊 Log viewer (Laravel Pail)
- ⚡ Vite HMR server

### Option 2: Manual Mode

Run in separate terminals:
```bash
# Terminal 1
php artisan serve

# Terminal 2
php artisan queue:work

# Terminal 3
npm run dev
```

### Option 3: Laravel Valet (macOS)
```bash
valet park
# Access at: http://filament-fun.test
```

---

## 👤 Default Credentials

After seeding, login with:
```
Email: Check database/seeders/UserSeeder.php
Password: Check database/seeders/UserSeeder.php
```

> **⚠️ Security Note:** Change default credentials immediately in production!

---

## 📦 Tech Stack

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| Laravel | 11.x | Backend Framework |
| Filament | 3.2 | Admin Panel |
| Livewire | 3.x | Reactive Components |

### Filament Plugins

- **Shield** - Authorization & Permissions
- **Breezy** - Authentication & Profile
- **Excel** - Export Operations
- **Spotlight** - Quick Search (⌘K)
- **Apex Charts** - Data Visualization
- **Blog** - Content Management
- **Translations** - i18n Support
- **Spatie Backup** - Automated Backups

### Additional Tools

- **Spatie Permission** - RBAC System
- **Spatie Media Library** - File Management
- **Laravel Reverb** - WebSocket Server
- **Laravel Trend** - Analytics
- **Stripe PHP SDK** - Payment Processing

---

## 🛠️ Development Commands
```bash
# Code Quality
composer pint              # Format code (Laravel Pint)
composer test              # Run tests

# IDE Support
php artisan ide-helper:generate
php artisan ide-helper:models

# Monitoring
php artisan pail           # Watch logs in real-time
php artisan queue:work     # Process background jobs

# Database
php artisan migrate:fresh --seed  # Fresh start
php artisan db:seed               # Re-seed data

# Cache Management
php artisan optimize:clear        # Clear all caches
php artisan filament:optimize     # Optimize Filament
```

---

## 📁 Project Structure
```
app/
├── Filament/
│   ├── Resources/          # CRUD Resources (Employee, Product, User)
│   ├── Pages/              # Custom Pages (Backups, Payments)
│   ├── Widgets/            # Dashboard Widgets
│   └── Clusters/           # Grouped Resources
├── Models/                 # Eloquent Models
├── Enums/                  # Enum Classes (Role, Status)
├── Casts/                  # Custom Casts (MoneyCast)
└── Providers/              # Service Providers

database/
├── migrations/             # Database Schema
├── seeders/                # Sample Data
└── factories/              # Model Factories

resources/
├── views/                  # Blade Templates
└── js/                     # Frontend Assets
```

---

## 🌍 Multi-language Support

Add new languages:
```bash
php artisan filament:translations
```

Available languages can be managed via the admin panel under **Settings → Translations**.

---

## 🔐 Security Features

- ✅ CSRF Protection
- ✅ SQL Injection Prevention (Eloquent ORM)
- ✅ XSS Protection (Blade Escaping)
- ✅ Role-Based Access Control
- ✅ Secure Password Hashing
- ✅ PCI-Compliant Payments (Stripe)
- ✅ Activity Logging & Audit Trail

---

## 📊 Queue & Background Jobs

### Development
```bash
php artisan queue:work
```

### Production (with Supervisor)

Create `/etc/supervisor/conf.d/filament-fun-worker.conf`:
```ini
[program:filament-fun-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start filament-fun-worker:*
```

---

## 💾 Automated Backups

Backups are managed via **Spatie Laravel Backup**. Access the backup panel at:
```
/admin/backups
```

Configure backup schedule in `config/backup.php` and setup cron:
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🧪 Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
```bash
   git checkout -b feature/amazing-feature
```
3. **Commit** your changes (use [Conventional Commits](https://www.conventionalcommits.org/))
```bash
   git commit -m "feat: add amazing feature"
```
4. **Push** to your branch
```bash
   git push origin feature/amazing-feature
```
5. **Open** a Pull Request

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please [open an issue](https://github.com/yourusername/filament-fun/issues/new) with:

- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Filament PHP](https://filamentphp.com) - Amazing admin panel framework
- [Laravel](https://laravel.com) - The PHP framework for web artisans
- [Spatie](https://spatie.be) - Quality Laravel packages
- All the amazing open-source contributors

---

## 📞 Support

- **Documentation**: [Filament Docs](https://filamentphp.com/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/filament-fun/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/filament-fun/discussions)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ using Filament PHP**

[Report Bug](https://github.com/yourusername/filament-fun/issues) · [Request Feature](https://github.com/yourusername/filament-fun/issues) · [Documentation](https://github.com/yourusername/filament-fun/wiki)

</div>
