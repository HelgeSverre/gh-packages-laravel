# 🎓 Tutorha – Laravel-Based Online Tutorial Platform

Tutorha is a full-stack online learning platform inspired by platforms like Udemy and Coursera. It allows instructors to upload video courses and students to purchase and view tutorials in a structured, secure environment.

Built with Laravel, this project demonstrates a monolithic backend architecture with Docker-based environments, and clean code practices.

---

## ⚙️ Tech Stack

- **Backend Framework:** Laravel 11
- **Frontend Templating:** Blade (with Livewire components)
- **Database:** MySQL
- **Cache & Queue:** Redis
- **Containerization:** Docker + Docker Compose
- **Testing:** PHPUnit
- **Authentication:** Custom authentication service that supports multiple login methods (e.g., email/password, phone-based login, etc.)

---

## 📁 Project Features

- ✅ Instructor and student user roles
- ✅ Upload and manage video-based courses
- ✅ Secure course access (only for enrolled students)
- ✅ Course reviews and ratings
- ✅ Enrollment and purchase workflows
- ✅ Dockerized environment for consistent local setup
- ✅ Unit and feature tests with PHPUnit
- ✅ Clean architecture using service/repository pattern


## 🧱 Architecture & Design Patterns

Tutorha follows a **Service-Oriented Architecture (SOA)** to separate business logic from controllers and models, making the app more modular and testable.
