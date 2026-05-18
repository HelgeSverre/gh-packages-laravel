# 🎮 Game Top Up Website (Laravel)

A web-based Game Top Up Website built using Laravel and Vite, designed to simulate a real-world digital game top-up platform.
This project is created for learning, academic, and portfolio purposes, showcasing backend logic, database design, and frontend integration.

---

# ✨ Features

- Game listing page
- Game detail & top-up form
- Package selection per game
- Transaction processing (simulation)
- Search game functionality
- Database migrations & seeders
- Modern Laravel + Vite workflow

---

# 🛠 Tech Stack

- Backend: Laravel 12
- Frontend: Blade Template, CSS (Vite)
- Database: MySQL
- Package Managers: Composer, NPM
- Runtime: PHP 8.2+

---

# 📁 Project Structure (Simplified)

<img width="161" height="394" alt="image" src="https://github.com/user-attachments/assets/d0fa21aa-ce68-453f-a076-5756d7488fb0" />

---

# 🚀 Installation & Setup Guide

## 1️⃣ Clone Repository

Run in Command Prompt / Terminal / VS Code Terminal:

```bash
git clone https://github.com/Kenny-as23/Game-Top-Up-Website.git
cd Game-Top-Up-Website
```

## 2️⃣ Install Backend Dependencies (Laravel)

Make sure Composer is installed.

```bash
composer install
```

## 3️⃣ Install Frontend Dependencies (Vite)

```bash
npm install
```

This installs Vite and frontend dependencies required for styling.

## 4️⃣ Setup Environment File

Create .env file from example:

```bash
copy .env.example .env
```

Generate Laravel application key:

```bash
php artisan key:generate
```

---

# 5️⃣ Database Configuration

Edit .env file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=topup_game
DB_USERNAME=root
DB_PASSWORD=
```

Adjust credentials according to your local MySQL setup.

---

# 🗄 Database Setup (Choose ONE Method)
✅ Option A — Import SQL File (Recommended for Reviewers)

1. Open phpMyAdmin

2. Create a database:

```sql
CREATE DATABASE topup_game;
```

3. Import file:

```pgsql
topup_game.sql
```

✔ Database and sample data will be ready instantly.

---

# ✅ Option B — Laravel Migration & Seeder

```bash
php artisan migrate --seed
```

⚠️ This command will reset existing tables.

# ▶️ Running the Application (IMPORTANT)

This project uses Laravel + Vite, so TWO terminals must be running at the same time.

## 🖥 Terminal 1 — Start Laravel Server

```bash
php artisan serve
```

Laravel will run at:

```cpp
http://127.0.0.1:8000
```

---

# 🖥 Terminal 2 — Start Vite Dev Server

Open a new terminal (do NOT stop the first one):

```bash
npm run dev
```

Vite handles frontend assets (CSS & JS).
Without this, styles and UI will not load correctly.

---

# ⚠️ Why Two Terminals?
### Service	Purpose
php artisan serve	 Runs Laravel backend
npm run dev	Serves   frontend assets via Vite

Both must be running simultaneously for the application to work properly.

---

# 🧪 Sample Data

Included via:

- SQL file (topup_game.sql)
- Laravel seeders

Contains:

- Games (Mobile Legends, PUBG Mobile, Genshin Impact)
- Packages per game
- Transaction-ready tables

---

# 🔐 Security Notes

- .env file is NOT committed to GitHub
- No real payment gateway
- No real API keys or credentials
- Database contains dummy/sample data only
- Safe for portfolio & academic use

---

# 🧩 Common Issues & Solutions

## Styles Not Loading?

✔ Make sure:

```bash
npm run dev
```

is running.

---

# Database Error?

✔ Ensure:

- MySQL is running
- Database name matches .env
- SQL file is imported OR migrations are run

---

# 📌 Project Status

- Not deployed to production
- No real payment integration
- Intended for:

    - Academic submission
    - Portfolio showcase
    - Technical demonstration

---

# 👨‍💻 Author

Kenny Adrian Setiabudi
Laravel Game Top Up Website
Portfolio Project
