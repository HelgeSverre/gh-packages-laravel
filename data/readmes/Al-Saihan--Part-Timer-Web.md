<div align="center">

# 🏢 Part-Timer-Web

### *Connecting Part-Time Job Seekers with Recruiters*

![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-3.x-FB70A9?style=for-the-badge&logo=livewire&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern Laravel + Livewire application featuring a role-based job marketplace with job postings, applications, in-app messaging, and user ratings.

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Screenshots](#-screenshots) •
[Testing](#-testing)

</div>

---

## 📋 Course Information

| Field | Details |
|-------|---------|
| **Course** | CSE391 |
| **Name** | Al-Saihan Tajvi |
| **Student ID** | 23301219 |
| **Email** | al.saihan.tajvi@g.bracu.ac.bd |

---

## 📑 Table of Contents

- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Requirements](#-requirements)
- [⚡ Getting Started](#-getting-started)
- [📸 Screenshots](#-screenshots)
- [🧪 Testing](#-testing)
- [🐛 Known Issues](#-known-issues)
- [📚 Resources](#-online-resources-used)
- [🔮 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🚀 Features

<table>
<tr>
<td>

**👥 User Management**
- Role-based access (`Job Seeker` / `Recruiter`)
- User profiles & account management
- Reputation tracking with ratings

</td>
<td>

**💼 Job System**
- Post jobs with descriptions & requirements
- Requirements-based validation
- Quick-apply flow for seekers

</td>
</tr>
<tr>
<td>

**💬 Communication**
- In-app chat system
- Application status tracking
- Notification support

</td>
<td>

**⚡ Modern UI**
- Livewire-driven reactive interface
- Minimal frontend JavaScript
- Responsive design with Tailwind

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" width="48" height="48" alt="PHP" />
<br><strong>PHP 8.2</strong>
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" width="48" height="48" alt="Laravel" />
<br><strong>Laravel 12</strong>
</td>
<td align="center" width="96">
<img src="https://avatars.githubusercontent.com/u/51960834?s=200&v=4" width="48" height="48" alt="Livewire" />
<br><strong>Livewire</strong>
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br><strong>Tailwind CSS</strong>
</td>
<td align="center" width="96">
<img src="https://vitejs.dev/logo.svg" width="48" height="48" alt="Vite" />
<br><strong>Vite</strong>
</td>
</tr>
</table>

| Category | Technologies |
|----------|-------------|
| **Backend** | PHP 8.2, Laravel 12, Livewire (Flux & Volt) |
| **Authentication** | Laravel Fortify, Laravel Sanctum |
| **Frontend** | Tailwind CSS, Vite |
| **Package Managers** | Composer, npm |

---

## 📦 Requirements

Before you begin, ensure you have the following installed:

| Requirement | Version |
|-------------|---------|
| PHP | 8.2+ |
| Composer | Latest |
| Node.js | 18+ |
| npm | Latest |
| Database | MySQL / PostgreSQL |
| Redis | Optional (for sessions/queues) |

---

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/Part-Timer-Web.git
cd Part-Timer-Web
```

### 2️⃣ Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 3️⃣ Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4️⃣ Database Setup

```bash
# Run migrations
php artisan migrate

# (Optional) Seed the database
php artisan db:seed
```

### 5️⃣ Start Development Server

```bash
# Start the Laravel development server
php artisan serve

# In a separate terminal, start Vite
npm run dev
```

🎉 Visit `http://localhost:8000` to see the application!

---

## 📸 Screenshots

<details>
<summary><strong>🏠 Landing Page</strong></summary>
<br>

![Landing page](documentaiton/LandingPage.png)

</details>

<details>
<summary><strong>🔐 Sign-in Page</strong></summary>
<br>

![Sign-in page](documentaiton/signinPage.png)

</details>

<details>
<summary><strong>📋 Job Detail</strong></summary>
<br>

![Job detail](documentaiton/jobDetail.png)

</details>

<details>
<summary><strong>📝 Posted Jobs (Recruiter)</strong></summary>
<br>

![Posted jobs](documentaiton/postedJobs.png)

</details>

<details>
<summary><strong>📊 Recruiter Dashboard</strong></summary>
<br>

![Recruiter dashboard](documentaiton/recruiterDashboard.png)

</details>

<details>
<summary><strong>👤 Profile Section</strong></summary>
<br>

![Profile section](documentaiton/profileSection.png)

</details>

<details>
<summary><strong>📄 Seeker Extra Profile</strong></summary>
<br>

![Seeker extra profile](documentaiton/seekerExtraProfileSection.png)

</details>

<details>
<summary><strong>⭐ Ratings View</strong></summary>
<br>

![Ratings](documentaiton/ratings.png)

</details>

---

## 🧪 Testing

Run the test suite using PHPUnit:

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/DashboardTest.php
```

---

## 🐛 Known Issues

> ⚠️ This project is a work-in-progress for learning and prototyping purposes.

- Chat system is not real-time (requires page refresh)
- Some edge cases in job application flow may not be handled
- Mobile responsiveness may need improvements in some areas

---

## 📚 Online Resources Used

- [Laravel Documentation](https://laravel.com/docs)
- [Livewire Documentation](https://livewire.laravel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Laravel Fortify](https://laravel.com/docs/fortify)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

---

## 🔮 Future Enhancements

- [ ] Real-time chat using WebSockets (Laravel Echo + Pusher)
- [ ] Email notifications for job applications
- [ ] Advanced job search with filters
- [ ] Resume/CV upload functionality
- [ ] Admin dashboard for platform management
- [ ] Job bookmarking/favorites feature
- [ ] Application status timeline

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open-sourced for educational purposes.

---

<div align="center">

**Made with ❤️ using Laravel & Livewire**

⭐ Star this repo if you find it helpful!

</div>