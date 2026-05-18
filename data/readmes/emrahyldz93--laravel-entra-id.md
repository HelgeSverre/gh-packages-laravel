# Laravel Entra ID Integration

A Laravel package for seamless Microsoft Entra ID (Azure AD) authentication integration using Laravel Socialite.

## Features

- Easy installation via Artisan command
- Configurable user model and database table
- Support for custom claims (e.g., samaccountname, student ID)
- Automatic user registration or restriction
- Flexible configuration through environment variables
- Standard and advanced installation modes

## Requirements

- PHP 8.2 or higher
- Laravel 10.0, 11.0, or 12.0
- Laravel Socialite
- Microsoft Entra ID Application

## Installation

### 1. Install the Package

Add the package to your Laravel project:

```bash
composer require entegration/laravel-entra-id
```

### 2. Run the Installation Command

Run the installation wizard:

```bash
php artisan entra:install
```

This command will:
- Publish configuration and migration files
- Guide you through the setup process
- Update your `.env` file with necessary settings
- Optionally run migrations

### 3. Configure Azure AD

Add your Azure AD credentials to your `.env` file:

```env
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_REDIRECT_URI=http://localhost/oauth/login
AZURE_TENANT_ID=your-tenant-id
```

### 4. Set Up Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration or use an existing one
4. Add a redirect URI: `http://your-domain/oauth/login`
5. Note your Application (client) ID, Directory (tenant) ID, and create a client secret

## Configuration

The package configuration is stored in `config/entra.php`. You can customize the following settings:

### Environment Variables

```env
# Model and Table Configuration
ENTRA_MODEL=App\Models\User
ENTRA_TABLE=users
ENTRA_IDENTIFIER=email

# Column Names
ENTRA_COL_ID=entra_id
ENTRA_COL_TOKEN=entra_token
ENTRA_COL_EMAIL=email
ENTRA_CUSTOM_COLUMN=dir_username
ENTRA_CUSTOM_CLAIM=samaccountname

# Routes
ENTRA_ROUTES_MIDDLEWARE=web

# Auto Registration
ENTRA_AUTO_REGISTER=true
```

### Configuration Options

- `table_name`: Database table name (default: `users`)
- `model`: User model class (default: `App\Models\User`)
- `columns`: Column configuration for Azure ID, token, email, and custom fields
- `routes.middleware`: Middleware for authentication routes (default: `web`)
- `auto_register`: Allow automatic user registration (default: `true`)

## Usage

### Routes

The package automatically registers the following routes:

- `GET /login/microsoft` - Redirects to Microsoft login
- `GET /oauth/login` - Callback route for Azure AD

### Basic Authentication

Add a login button to your view:

```blade
<a href="{{ route('entraid.login') }}" class="btn btn-primary">
    Login with Microsoft
</a>
```

### Custom Redirect After Login

You can customize the redirect URL in `EntraAuthController`:

```php
// In callback method
return redirect('/dashboard'); // Change this to your desired route
```

### Custom Claims

To extract custom claims from Azure AD (e.g., student ID, employee number):

1. Configure the claim name and column in `.env`:
   ```env
   ENTRA_CUSTOM_CLAIM=samaccountname
   ENTRA_CUSTOM_COLUMN=dir_username
   ```

2. Ensure the migration includes the custom column (this is handled automatically)

3. The custom data will be automatically saved to the specified column

### Disable Auto Registration

To restrict login to existing users only:

```env
ENTRA_AUTO_REGISTER=false
```

When disabled, users not found in the system will receive a 403 error.

## Database Migration

The package adds the following columns to your users table:

- `entra_id` - Azure AD Object ID (unique)
- `entra_token` - OAuth access token
- `avatar` - User profile picture URL
- `{custom_column}` - Custom data column (if configured)

Run migrations:

```bash
php artisan migrate
```

## Advanced Configuration

### Custom User Model

If you're using a different user model:

1. Set `ENTRA_MODEL` in `.env`:
   ```env
   ENTRA_MODEL=App\Models\Staff
   ```

2. Ensure your model extends `Illuminate\Foundation\Auth\User`

### Custom Table Name

To use a different table:

```env
ENTRA_TABLE=staff_users
```

### Multiple Custom Claims

Currently, the package supports one custom claim. For multiple claims, you may need to extend the `EntraIdService` class.

## Troubleshooting

### Common Issues

**Issue: "Login Failed" error**
- Verify your Azure AD credentials in `.env`
- Check that redirect URI matches Azure AD configuration
- Ensure the user has appropriate permissions in Azure AD

**Issue: "Your account was not found in the system"**
- Set `ENTRA_AUTO_REGISTER=true` if you want automatic registration
- Or manually create the user account first

**Issue: Custom claim not being saved**
- Verify the claim name exists in your Azure AD token
- Check that the column exists in your database table
- Review the migration file to ensure the column was created

## Security Considerations

- Never commit your `.env` file to version control
- Keep your Azure AD client secret secure
- Use HTTPS in production
- Regularly rotate your Azure AD client secrets
- Review and limit OAuth scopes to minimum required

## Support

For issues, questions, or contributions, please open an issue on the package repository.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Author

**Emrah Yıldız**
- Email: emrahyldz93@gmail.com

