# My Personal Blog

A Laravel 12 personal blog with an admin panel, categories/tags, comments moderation, live search, and basic SEO (robots + sitemap). Built with Tailwind CSS + Vite
<img width="1861" height="926" alt="Screenshot from 2026-02-17 22-18-49" src="https://github.com/user-attachments/assets/d6111804-61dd-4891-b71d-888dc4dcc86e" />

## Features

- Public blog:
  - Published posts with Markdown rendering
  - Categories and tags pages
  - Search page + live search dropdown (AJAX)
  - Comments with spam protection + moderation
- Admin:
  - Admin dashboard
  - Post/category/tag CRUD
  - Role-based access control (Spatie Permission)
  - Two-factor verification flow
    <img width="1862" height="926" alt="image" src="https://github.com/user-attachments/assets/1c17b221-7156-4bde-b613-538eabc70448" />

- SEO:
  - `robots.txt`
  - Dynamic `sitemap.xml`
  - (Optional) RSS feed (`/feed.xml`) for subscribers/readers
- Performance:
  - Cached queries for common pages
  - Cached sitemap/feed responses
    <img width="1862" height="926" alt="image" src="https://github.com/user-attachments/assets/9906e855-26de-4590-b930-aa7dd41e8842" />
    <img width="1862" height="926" alt="image" src="https://github.com/user-attachments/assets/e1cf4586-713f-4484-a2c5-3dca1c7b4587" />


## Tech Stack

- Backend: Laravel 12, PHP 8.2+
- Frontend: Tailwind CSS, Alpine.js, Axios
- Build: Vite
- Database: MySQL (local via Sail / production via MySQL service)
- Cache/Queue/Session: Redis supported (Sail includes Redis)

## Local Development

### Requirements
- PHP 8.2+
- Composer
- Node.js + npm
- MySQL (or Docker via Laravel Sail)

### Setup (non-Docker)
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
php artisan serve

