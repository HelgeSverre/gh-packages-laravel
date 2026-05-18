# Peraly - GCash Transaction Tracker

A modern, full-stack web application for small businesses in the Philippines to track GCash cash-in and cash-out transactions with ease.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel)
![Filament](https://img.shields.io/badge/Filament-3-FBE247?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwind-css)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php)

## Features

### 💰 Transaction Management
- **Comprehensive Transaction Logging**: Track all GCash cash-in and cash-out transactions
- **Automatic Fee Calculation**: Intelligent tiered GCash service fee calculation based on transaction type and amount
- **Category Management**: Organize transactions by custom categories (Sales, Inventory, Rent, etc.)
- **Transaction Filtering**: Filter by date range, category, and transaction type
- **Notes Support**: Add detailed notes to each transaction for record-keeping

### 📊 Financial Dashboard
- **Summary Cards**: At-a-glance view of:
  - Total Cash In (monthly)
  - Total Cash Out (monthly)
  - Total Fees (monthly)
  - Net Profit/Loss (monthly)
- **Cash Flow Charts**: Visual representation of:
  - Daily, weekly, and monthly cash flow trends
  - Inflow vs outflow comparisons
  - 30-day trend analysis
- **Recent Transactions**: Quick view of latest transactions

### 📈 Reports & Exports
- **Flexible Reporting**: Generate reports for:
  - Daily, weekly, monthly summaries
  - Custom date range reports
  - Category-wise breakdowns
- **Export Options**:
  - CSV format for Excel/Sheets
  - PDF format for printing and archiving
- **Filterable Reports**: Filter by date and category before exporting

### 🔐 Authentication & Security
- **Built-in Authentication**: Filament's secure user authentication system
- **Role-based Access**: Admin panel access control
- **User Profiles**: Business information and contact details

### 🎨 User Interface
- **Clean, Modern Design**: Professional interface with Tailwind CSS
- **Responsive Layout**: Fully optimized for desktop and tablet devices
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Intuitive Navigation**: Easy-to-use admin panel with Filament

### 🗄️ Database
- **Relational Schema**: Well-structured MySQL/PostgreSQL or SQLite database
- **Data Integrity**: Foreign key constraints and cascading deletes
- **Optimized Queries**: Efficient data retrieval and calculations

## Technology Stack

### Backend
- **Laravel 11** - Modern PHP framework
- **Filament 3** - Elegant admin panel builder
- **Tailwind CSS** - Utility-first CSS framework
- **SQLite/MySQL/PostgreSQL** - Database

### Frontend
- **Livewire** - Real-time reactive components
- **Blade Templating** - Server-side templating
- **Tailwind CSS** - Responsive styling

## Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 16+ (for npm)

### Installation

1. **Navigate to project directory**
   ```bash
   cd gcash-tracker
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Generate application key**
   ```bash
   php artisan key:generate
   ```

4. **Run migrations and seed database**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Start the development server**
   ```bash
   php artisan serve
   ```

6. **Access the admin panel**
   - URL: `http://localhost:8000/admin`
   - Email: `admin@peraly.com`
   - Password: `password`

## Admin Panel Features

### Dashboard
- **Financial Summary Cards**: Real-time overview of cash-in, cash-out, fees, and net profit
- **Cash Flow Chart**: 30-day visualization of transaction trends
- **Recent Transactions**: Quick access to latest transactions

### Resources

#### Transactions
- Create, read, update, delete transactions
- Automatic fee calculation
- Filter by date, category, and type
- Export to CSV/PDF

#### Categories
- Manage transaction categories
- Separate cash-in and cash-out categories
- Assign multiple transactions to categories

#### Reports
- Generate financial reports
- Daily, weekly, monthly summaries
- Custom date range reports
- View detailed breakdowns

## Database Schema

### Users Table
```
id, name, email, password, phone_number, business_name, email_verified_at, remember_token, created_at, updated_at
```

### Categories Table
```
id, name, type (cash-in/cash-out), created_at, updated_at
```

### Transactions Table
```
id, transaction_date, type (cash-in/cash-out), amount, fee, category_id, notes, created_at, updated_at
```

### Reports Table
```
id, name, period (daily/weekly/monthly), start_date, end_date, total_cash_in, total_cash_out, total_fees, net_profit, user_id, created_at, updated_at
```

## GCash Fee Structure

The application includes automatic tiered fee calculation based on standard GCash rates:

### Cash-In Fees
- Up to ₱5,000: 1%
- ₱5,001 - ₱10,000: 1.5%
- Over ₱10,000: 2%

### Cash-Out Fees
- Up to ₱5,000: 1.5%
- ₱5,001 - ₱10,000: 2%
- Over ₱10,000: 2.5%

Fees can be customized in `app/Models/Transaction.php` under the `calculateFee()` method.

## Color Scheme

- **Primary Blue**: #4A90E2
- **Accent Cyan**: #50E3C2
- **Background**: #F9FAFB
- **Text**: #1F2937
- **Success**: #34D399
- **Danger**: #F87171
- **Warning**: #FBBF24

## File Structure

```
gcash-tracker/
├── app/
│   ├── Filament/Admin/
│   │   ├── Resources/
│   │   │   ├── CategoryResource.php
│   │   │   ├── TransactionResource.php
│   │   │   └── ReportResource.php
│   │   ├── Pages/
│   │   │   └── Dashboard.php
│   │   ├── Widgets/
│   │   │   ├── StatsOverview.php
│   │   │   ├── CashFlowChart.php
│   │   │   └── RecentTransactions.php
│   │   └── AdminPanelProvider.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Transaction.php
│   │   └── Report.php
│   └── ...
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── database.sqlite
├── resources/
│   └── views/
├── routes/
├── .env
└── ...
```

## Common Commands

```bash
# Development
php artisan serve                  # Start dev server
npm run dev                        # Watch CSS/JS

# Database
php artisan migrate                # Run migrations
php artisan db:seed                # Seed sample data
php artisan migrate:refresh --seed # Reset & reseed

# Cache & Config
php artisan config:cache           # Cache configuration
php artisan cache:clear            # Clear cache
```

## Configuration

### Database
Edit `.env` to configure your database:

```env
DB_CONNECTION=sqlite
# or
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=peraly
DB_USERNAME=root
DB_PASSWORD=
```

### Application Settings
- App name: `APP_NAME=Peraly`
- Debug mode: `APP_DEBUG=true` (set to false in production)
- Timezone: `APP_TIMEZONE=Asia/Manila` (optional)

## Authentication

### Default Credentials
- **Email**: admin@peraly.com
- **Password**: password

⚠️ Change these immediately in production!

### Reset Password
```bash
php artisan tinker
>>> App\Models\User::first()->update(['password' => bcrypt('newpassword')])
```

## Troubleshooting

### Server won't start
- Check PHP version: `php -v` (needs 8.2+)
- Clear cache: `php artisan config:clear`
- Regenerate key: `php artisan key:generate`

### Database errors
- Ensure SQLite file exists or MySQL is running
- Run migrations: `php artisan migrate`
- Check .env database configuration

### Resources not showing
- Clear cache: `php artisan config:clear`
- Ensure migrations ran: `php artisan migrate`

## Performance Optimization

```bash
# Production setup
php artisan config:cache
php artisan view:cache
php artisan route:cache
php artisan event:cache
```

## Security Checklist

- [ ] Change admin password
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Use strong `APP_KEY`
- [ ] Configure proper database credentials
- [ ] Set up HTTPS in production
- [ ] Regular database backups
- [ ] Keep Laravel and packages updated

## License

MIT License - See LICENSE file for details

---

**Built for Filipino Small Businesses** 🇵🇭

For detailed setup instructions, see [SETUP.md](SETUP.md)
