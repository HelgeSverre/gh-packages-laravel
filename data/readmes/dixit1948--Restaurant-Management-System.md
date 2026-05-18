# 🚀 DineFlow – Restaurant POS & Ordering System (Laravel 12)

![Laravel](https://img.shields.io/badge/Laravel-12.x-red?style=for-the-badge&logo=laravel)
![Filament](https://img.shields.io/badge/FilamentPHP-v4-gold?style=for-the-badge)
![Livewire](https://img.shields.io/badge/Livewire-Reactive-blue?style=for-the-badge&logo=livewire)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Modern_UI-38B2AC?style=for-the-badge&logo=tailwindcss)

---

## 📌 Overview

**DineFlow** is a modern **Restaurant POS & Online Ordering System** built with **Laravel 12**, focused on **speed, security, and real-world restaurant workflows**.

It combines a **real-time customer ordering interface** with a **powerful Filament admin panel**, supporting **combo-based products**, live carts, and unified order processing.

---

## 🎯 Objective

- Zero page reload ordering experience  
- Support **single items + combo deals**  
- Secure and clean admin management  
- Built using **Laravel 12 + TALL stack best practices**

---

## 🌟 Features

### 🍽 Customer Ordering
- Category-based, mobile-first menu  
- Combo deals (e.g., Burger + Fries + Drink)  
- Live cart updates (no refresh)  
- Dynamic price & quantity calculation  
- Responsive UI (mobile, tablet, kiosk)

### 🛠 Admin Panel (FilamentPHP)
- Sales & order analytics dashboard  
- Product, category & combo CRUD  
- Mixed orders (items + combos)  
- Order lifecycle: Pending → Paid → Completed  
- Soft delete protection  
- Clean resource-based architecture
  
---

## 🧱 System Architecture

| Layer      | Technology     |
| ---------- | -------------- |
| Backend    | Laravel 12     |
| Admin UI   | FilamentPHP v4 |
| Frontend   | Livewire       |
| Styling    | Tailwind CSS   |
| Database   | MySQL          |
| JS Helpers | Alpine.js      |

---

## 📂 Project Structure Highlights

```
app/
 ├── Livewire/
 │    ├── Menu/
 │    ├── Cart/
 │    └── Checkout/
 ├── Filament/
 │    ├── Resources/
 │    └── Widgets/
 ├── Models/
 └── Services/
```

---

## ⚙️ Installation & Setup (Laravel 12)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/tablesprint.git
cd tablesprint
```

---

### 2️⃣ Install Dependencies

```bash
composer install
npm install
npm run build
```

---

### 3️⃣ Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Configure database credentials in `.env`.

---

### 4️⃣ Database Setup

```bash
php artisan migrate
php artisan db:seed
```

---

### 5️⃣ Create Admin User (Filament)

```bash
php artisan make:filament-user
```

---

### 6️⃣ Run Application

```bash
php artisan serve
```

---

## 🌐 Application URLs

* **Customer App:** `http://127.0.0.1:8000`
* **Admin Panel:** `http://127.0.0.1:8000/admin`

---

## 🛣️ Roadmap (Future Scope)

* QR-based table ordering
* Kitchen Display System (KDS)
* Role-based staff access
* GST & invoice reports
* API support for mobile app

---

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a Pull Request

---

## 📄 License

Released under the **MIT License** — free for academic and commercial use.

---

## 👨‍💻 Author

**Dixit Pedhadiya**
Full Stack Developer (Laravel • Livewire • Filament)
Focused on clean UI, scalable backend, and real-world systems
