# 📸 StagePhoto.ru

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![Livewire Version](https://img.shields.io/badge/Livewire-4.x-purple.svg)](https://livewire.laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.4+-blue.svg)](https://php.net)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4.svg)](https://tailwindcss.com)

**StagePhoto.ru** is a professional platform for concert and theater photography, connecting photographers with fans, bands, and event organizers. Built with Laravel 13 and Livewire 4.

![StagePhoto site prototype](./docs/images/site-index.png)

🌐 **Live Site**: [stagephoto.ru](https://stagephoto.ru)

---

## ✨ Features

### 🎭 For Everyone

- **Entity Pages** - Dedicated pages for theaters, bands, and individual artists
- **Multi-entity Support** - Theaters, musical groups, and individuals each have their own profile pages
- **Rich Profiles** - Bios, stories, contact information, social links, and media galleries
- **Hierarchical Relationships** - See which individuals belong to which bands/theaters
- **Privacy Controls** - Contact information visibility based on user role (public, registered, photographers only)
- **Multi-language** - Entity profiles support Russian, English, and Esperanto

### 🖼️ For Visitors
- **Full-width responsive album grid** - No containers, pure masonry layout
- **Dark mode** - System preference detection with manual toggle
- **Multi-language support** - Russian, English, and Esperanto
- **Album browsing** - Filter by genre, type, and sort options
- **Photo viewing** - Lightbox modal with full-size images
- **Comments** - Threaded comments on albums and individual photos
- **Rating system** - 5-star ratings with user persistence
- **Like system** - Like/unlike comments
- **Album browsing** - Browse published albums with grid/list views
- **Photographer portfolios** - Each photographer has a dedicated albums page

### 📸 For Photographers
- **Album management** - Create, edit, publish/unpublish, and delete albums with soft delete
- **Photo upload** - Single and multiple photo uploads with drag-and-drop support
- **Image processing** - Automatic WebP conversion and optimization (Intervention Image v4)
- **EXIF extraction** - Automatic camera settings, capture date, and GPS data extraction
- **Status workflow** - Albums go through pending → approved → published workflow
- **Album covers** - Auto-generates square (800×800) and hero (2000×800) covers
- **Unsorted album** - Default album for unorganized uploads with bulk organization
- **Trash management** - Soft delete with restore and permanent delete options
- - **Multi-level albums** - Create sub-albums under parent albums (unlimited nesting)
- **Visual hierarchy** - Tree structure display with indentation (📁 for root, └─ for sub-albums)
- **Parent selection** - Choose parent album when creating new albums
- **Automatic organization** - Upload directly to any level in the hierarchy

### 🎯 For Bands & Organizers
- **Photographer requests** - Request specific photographers
- **High-res downloads** - Request high-resolution photos
- **Print permissions** - Request print rights
- **Commercial licensing** - Request commercial usage rights

## 📋 Approval Workflow

### Album Status Flow
1. **Pending** - Album submitted, waiting for admin review
2. **Approved** - Album approved by admin, ready for publication
3. **Published** - Album visible to public
4. **Rejected** - Album rejected with feedback comments
5. **Blocked** - Album blocked due to policy violation

### Status History
All status changes are tracked with:
- Who changed the status
- When the change occurred
- Comments/reasons for the change

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Laravel 13, PHP 8.4+ |
| **Frontend** | Livewire 4, Alpine.js 3, Tailwind CSS 4 |
| **Database** | SQLite / MySQL / PostgreSQL |
| **Image Processing** | Intervention Image |
| **Queue** | Laravel Queue (Redis/Database) |
| **Cache** | Laravel Cache (Redis/File) |

---

## 📦 System Requirements

- PHP >= 8.4
- Composer
- Node.js & NPM (for Vite)
- SQLite / MySQL / PostgreSQL
- GD or Imagick PHP extension

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/SirAndrewGotham/StagePhoto.git
cd StagePhoto
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Environment configuration

```bash
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`:

```env
DB_CONNECTION=sqlite
# or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=stagephoto
# DB_USERNAME=root
# DB_PASSWORD=
```

### 4. Run migrations and seeders

```bash
php artisan migrate:fresh --seed
```

### 5. Build assets

```bash
npm run build
# or for development:
npm run dev
```

### 6. Start the server

```bash
php artisan serve
```

Visit `http://localhost:8000`

---

## 📁 Project Structure

```
app/
├── Livewire/                 # Livewire components
├── Models/                   # Eloquent models
│   ├── Entity.php           # Polymorphic entity model
│   ├── EntityProfile.php    # Multi-language entity profiles
│   ├── EntityContact.php    # Contact info with visibility
│   ├── EntityMembership.php # Relationships (individuals in bands/theaters)
│   ├── Band.php             # Band-specific attributes
│   ├── Theater.php          # Theater-specific attributes
│   ├── Individual.php       # Individual-specific attributes
│   └── ...
├── Services/
└── Http/

database/
├── factories/               # Model factories
├── migrations/              # Database migrations
│   ├── create_entities_table.php
│   ├── create_entity_profiles_table.php
│   ├── create_entity_contacts_table.php
│   ├── create_entity_memberships_table.php
│   ├── create_entity_album_table.php
│   └── create_entity_photos_table.php
└── seeders/

resources/views/
├── components/
│   └── frontend/
│       └── pages/
│           └── persona/
│               └── ⚡show.blade.php   # Entity page component
└── ...

lang/                        # Multi-language files (RU, EN, EO)
├── en.json
├── ru.json
└── eo.json
```

## 🎭 Entity System (Theaters, Bands, Individuals)

StagePhoto.ru supports dedicated pages for theaters, musical groups, and individual artists.

### Entity Types

| Type | Description | URL Example |
|------|-------------|-------------|
| **Theater** | Performance venues with capacity, founded year, artistic director | `/persona/bolshoi-theatre` |
| **Band** | Musical groups with genre, formed year, record label | `/persona/kino` |
| **Individual** | Artists, musicians, actors with biographical information | `/persona/viktor-tsoi` |

### Key Features

- **Multi-language Profiles** - Each entity has profiles in Russian, English, and Esperanto
- **Contact Privacy** - Contact information visibility based on user role:
    - `public` - Visible to everyone
    - `registered` - Visible to logged-in users only
    - `photographers` - Visible only to verified photographers
    - `admin` - Visible only to administrators
- **Relationships** - Track which individuals belong to which bands or theaters
- **Media Integration** - Link albums and tag individual photos to entities
- **SEO-friendly URLs** - Clean slugs like `/persona/band-name`

### Database Schema

```sql
-- Main entity table (polymorphic)
entities:
  - id
  - entityable_id (references band/theater/individual)
  - entityable_type (class name)
  - slug (unique)
  - type (theater/band/individual)
  - is_published
  - settings (JSON for privacy preferences)

-- Multi-language profiles
entity_profiles:
  - entity_id
  - locale (ru/en/eo)
  - name, bio, story
  - website, social_links (JSON)
  - email, phone, address
  - founded_year, genre
  - avatar_path, cover_path

-- Contact visibility
entity_contacts:
  - entity_id
  - contact_type (email/phone/telegram/vk/instagram)
  - value
  - visibility (public/registered/photographers/admin)

-- Relationships (individuals in bands/theaters)
entity_memberships:
  - entity_id (individual)
  - parent_entity_id (band/theater)
  - role, joined_at, left_at

-- Media links
entity_album (pivot): entity_id, album_id, relationship_type
entity_photos (pivot): entity_id, photo_id
```

### Routes

```php
// Main entity route
Route::livewire('/persona/{entity:slug}', 'frontend.pages.persona.⚡show')
    ->name('persona.show');

// Convenience redirects
Route::get('/theater/{entity:slug}', fn($slug) => redirect()->route('persona.show', $slug));
Route::get('/band/{entity:slug}', fn($slug) => redirect()->route('persona.show', $slug));
Route::get('/artist/{entity:slug}', fn($slug) => redirect()->route('persona.show', $slug));
```


---

## 🖼️ Image Processing (Intervention Image v4)

All uploaded images are automatically processed using Intervention Image v4:

| Variant | Dimensions | Format | Quality | Usage |
|---------|------------|--------|---------|-------|
| Original | User-uploaded | Preserved | 100% | Archival |
| Full-size | 1600px max side | WebP | 85% | Photo modal |
| Thumbnail | 600×600 (center crop) | WebP | 80% | Grid preview |
| Cover Square | 800×800 (center crop) | WebP | 85% | Album cards |
| Cover Hero | 2000×800 (cover crop) | WebP | 85% | Album header |

### EXIF Data Extracted
- Camera make and model
- Lens model
- Focal length, aperture, shutter speed, ISO
- Capture date/time
- GPS coordinates (if available)

### Storage Structure
```
storage/app/public/stagephoto/
├── originals/{user_id}/{album_id}/{photo_id}_original.{ext}
├── webp/{user_id}/{album_id}/
│ ├── {photo_id}_full.webp
│ └── {photo_id}_thumb.webp
└── albums/{user_id}/{album_id}/
├── cover_square.webp
└── cover_hero.webp
```

---

## 📤 Upload System

### Single Photo Upload
Photographers can upload single photos with:
- **Album selection** - Choose existing album or create a new one
- **Title & description** - Optional metadata for better organization
- **EXIF data extraction** - Automatically captures camera make/model, lens, settings, and GPS
- **WebP conversion** - All images are converted to WebP format with optimized quality
- **Automatic thumbnails** - 600×600 center-cropped thumbnails for grid display
- **Full-size optimization** - 1600px max dimension for modal viewing

### Upload Workflow
1. Select or create an album
2. Choose a photo file (JPG, PNG, GIF, WebP, max 50MB)
3. Add optional title and description
4. Submit - system processes and stores all variants
5. First photo in album automatically becomes the album cover

---

## 🌍 Multi-Language Support

Supported languages:
- 🇷🇺 Russian (default)
- 🇬🇧 English
- 🌐 Esperanto

Language switching uses Laravel's localization with JSON files in `/lang`.

### What's Translated

- **UI Elements** - Buttons, labels, navigation, modals
- **Entity Profiles** - Names, bios, stories for all entities
- **Legal Pages** - Terms, privacy, guidelines, copyright, cookie settings
- **Info Pages** - For Bands, For Theaters, Photographer Guide
- **Upload Components** - All upload interfaces and messages

---

## 🎨 Design Principles

- **Full-width layout** - No `container` or `max-w-*` constraints on main content
- **Responsive grid** - `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- **Dark mode** - CSS class-based with system preference detection
- **Mobile-first** - Responsive breakpoints from 640px to 1920px

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=AlbumTest

# Run Livewire component tests
php artisan test --filter=Livewire
```

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Author

**Andrew Gotham**

- 📧 Email: [andrewgotham@mail.ru](mailto:andrewgotham@mail.ru)
- 💬 Telegram: [@AndrewGotham](https://t.me/AndrewGotham)
- 📱 Phone: +7 (991) 873-9137
- 🌐 VK: [vk.com/AndrewGotham](https://vk.com/AndrewGotham)

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP framework
- [Livewire](https://livewire.laravel.com) - Full-stack framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Alpine.js](https://alpinejs.dev) - Lightweight JavaScript framework
- [Intervention Image](https://image.intervention.io) - Image processing library

---

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Album grid | ✅ Complete |
| Filter bar | ✅ Complete |
| Album show page | ✅ Complete |
| Photo modal | ✅ Complete |
| Comments | ✅ Complete |
| Rating system | ✅ Complete |
| Like system | ✅ Complete |
| Request system | ✅ Complete |
| Multi-language | ✅ Complete |
| Dark mode | ✅ Complete |
| Image upload | ✅ Complete |
| Image processing | ✅ Complete |
| Soft deletes | ✅ Complete |
| Trash manager | ✅ Complete |
| Unsorted albums | ✅ Complete |
| Admin dashboard | ⏳ Planned |

---

## 🤝 Contributing

This is a private project. For suggestions or bug reports, please contact the author directly.

---

## 📄 Changelog

### v1.0.0 (Current)
- Initial release
- Full album management system
- Multi-language support (RU, EN, EO)
- Image processing with WebP conversion
- Comment, rating, and like systems
- Photographer request system
- Soft delete with trash management

---

**Built with ❤️ in Moscow**
```

---

## Additional Files to Consider

### `CONTRIBUTING.md`

```markdown
# Contributing to StagePhoto.ru

This is a private project. Please contact Andrew Gotham directly for any contributions.

**Contact Information:**
- Email: andrewgotham@mail.ru
- Telegram: @AndrewGotham
- VK: vk.com/AndrewGotham
```

### `CHANGELOG.md`

```markdown
# Changelog

## [1.0.0] - 2026-04-15

### Added
- Initial release
- Album grid with infinite scroll
- Filter bar with genre, type, and sort options
- Album show page with photo grid
- Photo modal with lightbox navigation
- Comment system (albums and photos)
- Rating system (5-star)
- Like system for comments
- Tag system for albums
- Category system with translations
- Request system for photographers
- Image upload (single, multiple, ZIP)
- WebP conversion and optimization
- Watermark application
- Soft deletes for albums and photos
- Trash manager
- Unsorted albums
- Multi-language support (RU, EN, EO)
- Dark mode
```

### `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: SirAndrewGotham

---

## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., macOS]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 22]

## Additional Context
Add any other context here.
```

### `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: SirAndrewGotham

---

## Is your feature request related to a problem?
A clear description of what the problem is.

## Solution
A clear description of what you want to happen.

## Alternatives
Any alternative solutions you've considered.

## Additional Context
Add any other context here.
```

# GitHub Badges

[![Laravel](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![Livewire](https://img.shields.io/badge/Livewire-4.x-purple.svg)](https://livewire.laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.4+-blue.svg)](https://php.net)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-06B6D4.svg)](https://tailwindcss.com)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-3.x-8BC0D0.svg)](https://alpinejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
