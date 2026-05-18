# AmarShop — Full-Stack E-Commerce Platform

A premium, CMS-driven e-commerce platform built with **Laravel 13** (backend) and **React + Vite** (frontend). Features a Filament admin panel, role-based access control, dynamic product management, and a stunning mobile-first storefront.

---

## 🧠 CMS Rendering Engine (Dynamic UI)

AmarShop features a powerful, component-driven CMS engine that decouples the UI from the code. Administrators can build entire pages using a visual Page Builder in the Filament dashboard.

### Key Concepts
- **Pages**: Managed via `DynamicPage.tsx`. Each page has a unique slug and is composed of multiple sections.
- **Sections**: Reusable blocks (Hero, Product Grid, Rich Text, etc.) registered in `ComponentRegistry.ts`.
- **Layouts**: Global shells that control Header/Footer visibility, container widths, and custom CSS variables per page.
- **Section Renderer**: Handles dynamic rendering, error boundaries, and skeleton loaders for each CMS block.
- **Style & Visibility Engines**: Control block-level CSS overrides and role-based visibility (e.g., "Guest Only" banners).
- **Theme Settings**: A centralized design system management interface for controlling brand colors, typography, and spacing globally.

---

## 🏗️ Architecture Overview

```
package_lapack5/
├── backend/             # Laravel 13 API + Filament Admin Panel
│   ├── app/
│   │   ├── Filament/    # Admin resources (Pages, Layouts, Products, Orders)
│   │   ├── Http/        # API Controllers (PageBuilderController, OrderController)
│   │   └── Models/      # Eloquent models (Page, PageSection, Layout, Product, etc.)
│   ├── database/
│   │   ├── migrations/  # CMS schema (layouts, sections, etc.)
│   │   └── seeders/     # CMSHomepageSeeder (Mandatory for initial setup)
│   └── routes/api.php   # RESTful API + CMS endpoints
│
├── src/                 # React + Vite Frontend
│   ├── cms/             # Dynamic CMS Engine (Renderer, Registry, Sections)
│   ├── components/      # Core UI components & CMS section wrappers
│   ├── pages/           # Home.tsx (CMS-driven) & DynamicPage.tsx
│   ├── lib/             # React Query hooks & API client
│   └── data/            # Local data fallbacks
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

| Tool        | Version    | Notes                          |
|-------------|------------|--------------------------------|
| PHP         | ≥ 8.2      | With `pdo_mysql`, `gd`, `mbstring` extensions |
| Composer    | ≥ 2.x      |                                |
| Node.js     | ≥ 20.x     |                                |
| MySQL       | ≥ 8.0      | Or MariaDB ≥ 10.6             |
| Laragon     | Latest     | Recommended for Windows        |

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
composer install

# Install frontend dependencies
cd ..
npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
cd backend
php artisan key:generate
```

Edit `backend/.env` and set your database credentials.

```bash
# Frontend
cp .env.example .env
```

### 3. Database Setup (Crucial for CMS)

```bash
cd backend

# 1. Run migrations
php artisan migrate

# 2. Seed CMS data (Required for Homepage rendering)
php artisan db:seed --class=CMSHomepageSeeder

# 3. Create admin user
php artisan make:filament-user
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
npm run dev
```

| Service       | URL                           |
|---------------|-------------------------------|
| Frontend      | http://localhost:3000          |
| Backend API   | http://localhost:8000/api/v1   |
| Admin Panel   | http://localhost:8000/admin    |

---

## 🛡️ Admin Panel (Filament)

Access: `http://localhost:8000/admin`

### Key Resources

- **Pages** — Visual Page Builder with draggable sections and advanced visibility/animation controls.
- **Theme Settings** — **[NEW]** Centralized Design System interface for managing brand colors, fonts, and UI tokens with live preview.
- **Activity Logs** — **[NEW]** Comprehensive audit trail with detailed "Old vs New" property change tracking.
- **Tracking Scripts** — Dynamic injection of Meta Pixel, GTM, and custom marketing scripts.
- **Products & Orders** — Full lifecycle management for e-commerce operations.
- **Layouts** — Global page shells and style overrides.

---

## 🎨 Design System & UI/UX

AmarShop uses a "Luxury Editorial" aesthetic defined by:
- **High White Space**: Generous padding and margin scales.
- **Modern Typography**: Inter and Outfit families for a premium feel.
- **Dynamic Animations**: Framer Motion integration for smooth CMS section transitions.
- **Glassmorphism**: Subtle blurs and translucent surfaces in the admin panel and storefront.

---

## 🔌 API Endpoints

### CMS & Frontend Endpoints

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/cms/homepage`         | Full dynamic homepage data |
| GET    | `/cms/pages/{slug}`     | Single dynamic page data |
| GET    | `/settings`             | Site-wide settings       |
| GET    | `/categories`           | Hierarchical categories  |
| GET    | `/products`             | Products (filterable)    |

---

## 📧 Email Notifications

The platform sends automated emails for:

1. **Order Confirmation** → Sent to customer after checkout
2. **Contact Form** → Sent to admin (from `site_email` setting)

### Configuration

In `backend/.env`, configure your mail driver:

```env
# Development (writes to storage/logs)
MAIL_MAILER=log

# Production (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@mg.yourdomain.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@amarshop.com.bd"
MAIL_FROM_NAME="AmarShop"
```

---

## 🔍 SEO & Tracking

- **JSON-LD Structured Data**: Automated schema injection for Organization, Product, and Breadcrumbs.
- **Meta Pixel**: Integrated via the CMS Tracking Scripts resource.
- **Performance**: Optimized images and lazy-loaded CMS blocks to ensure high Core Web Vitals.
- **Dynamic Meta Tags**: Managed per-page via the Page Builder SEO tab.

---

## 🚀 Production Deployment

### Backend
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting
```

---

## 📝 License

This project is proprietary. All rights reserved.
