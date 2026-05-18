
# 🏪 Inventory System

![Status: Learning](https://img.shields.io/badge/Status-Learning-yellow?style=flat-square)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square)

A simple **Inventory Management System** featuring **user registration and login**, with modules to manage **Products** and **Categories**.
This project was built as part of my learning process with **PHP and Laravel**, mainly to practice **CRUD operations** and parent-child relationships.

---

## 📌 Features

* 👤 User registration and login system
* 📂 Manage product categories
* 🛒 Add, edit, and delete products linked to categories

---

## 🛠 Technologies Used

![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square\&logo=php\&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FD3A2D?style=flat-square\&logo=laravel\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square\&logo=postgresql\&logoColor=white)
![Blade](https://img.shields.io/badge/Blade-F25252?style=flat-square\&logo=laravel\&logoColor=white)

---

## 💻 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yinaojeda/inventory-system.git
   ```
2. Install PHP dependencies:

   ```bash
   composer install
   ```
3. Install Node dependencies:

   ```bash
   npm install
   ```
4. Create your database:

   ```sql
   CREATE DATABASE your_database_name;
   ```
5. Copy the example environment file and configure `.env`:

   ```bash
   cp .env.example .env
   ```
6. Run migrations:

   ```bash
   php artisan migrate
   ```

---

## 🚀 Running the App

* Start the backend server:

  ```bash
  php artisan serve
  ```
* Compile frontend assets with Vite:

  ```bash
  npm run dev
  ```

---

## 📝 Usage

1. **Register an account**
   Create a new user using the registration form.

2. **Log in**
   Access the system using your credentials.

3. **Manage Categories**

   * Add new product categories
   * Edit or delete existing categories

4. **Manage Products**

   * Add new products and assign them to categories
   * Edit product details or delete products

5. **Navigate the interface**
   Use the intuitive UI to browse and organize your inventory efficiently.

---

## 🤝 Contributing

This is a **learning project**, but feedback or suggestions are welcome!

---

## 📄 License

Open source and free to use for learning purposes.

---

