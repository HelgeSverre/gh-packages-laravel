# Livewire Poll App

A simple and clean poll application built with **Laravel** and **Livewire**, allowing users to **create polls** and **vote on existing polls** with real-time updates.  

![App Screenshot](public/screenshots/poll-ui.png)

The UI is inspired by the modern design used in the **Livewire 3 documentation**, keeping everything minimal, responsive, and fast.

---

## 🚀 Features

- Create new polls with multiple options  
- Vote on existing polls  
- Live updates powered by Livewire  
- Lightweight UI and smooth UX  
- Zero page reloads for voting/results

---

## 📦 Tech Stack

- **Laravel**
- **Livewire**
- **TailwindCSS** (optional depending on your setup)
- **MySQL / SQLite** (or any Laravel-supported DB)

---

## 🛠️ Installation

```bash
git clone https://github.com/DarlanSchmeller/livewire-poll-app.git
cd livewire-poll-app

composer install

cp .env.example .env
php artisan key:generate

php artisan migrate

php artisan serve

Visit
http://localhost:8000
```

---

## 🗂️ Project Overview

```
app/
 ├─ Models/           # Poll, Option, Vote
 ├─ Http/Livewire/    # Poll listing, creation form, voting components
resources/
 ├─ views/            # Blade + Livewire templates
database/
 ├─ migrations/       # Polls, options, votes tables
routes/
 ├─ web.php           # Application routes
```

---

## ⚙️ Usage

1. Create a new poll by providing a title/question and add options.
2. Users can vote for one of the options.
3. Results update live, once a vote is cast, all users viewing the poll will see updated counts.

---

## 💬 Acknowledgements

Thanks to the Laravel and Livewire communities for the tools that made this project possible.

