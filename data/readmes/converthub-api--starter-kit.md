# ConvertHub Starter Kit

**Launch your own white-label file conversion site** using Laravel, Tailwind CSS, and Livewire - fully powered by the [ConvertHub API](https://converthub.com/api)

![Laravel](https://img.shields.io/badge/Laravel-v12-FF2D20?style=flat-square&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=flat-square&logo=php)
![Livewire](https://img.shields.io/badge/Livewire-v3-FB70A9?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

## 🚀 What is this?

This is a white-label frontend + backend starter kit for developers and startups looking to offer file conversion services (PDF, audio, video, images, etc.)

Live Demo: [ConvertHub.dev](https://converthub.dev)

## ✨ Features

- 🎯 **Simple 3-Step Process**: Select file → Choose format → Download
- 📁 **Drag & Drop Interface**: Intuitive file upload with visual feedback
- 🔍 **Smart Format Search**: Quickly find target formats with categorized dropdown
- 📊 **Real-time Progress**: Live conversion status updates
- 🚀 **800+ Format Pairs Supported**: Images, documents, videos, audio, and more
- 🔒 **Privacy-First**: Files are processed securely and deleted after conversion
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Fast Conversions**: Powered by ConvertHub's high-performance API

## 🖼️ Screenshots

### File Upload
Drag and drop or click to select files

![File Upload](screenshots/select-files.png)

### Format Selection
Choose from categorized formats with search functionality

![Format Selection](screenshots/format-selection.gif)

### Conversion Progress
Real-time progress tracking with status updates

![Conversion Process](screenshots/conversion.gif)

## 🛠️ Tech Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: Livewire 3, Alpine.js, Tailwind CSS 4
- **API**: ConvertHub v2 API
- **Database**: SQLite (configurable to MySQL/PostgreSQL)
- **Testing**: Pest PHP
- **Assets**: Vite

## 📋 Requirements

- PHP 8.2 or higher
- Composer 2.x
- Node.js 20.x or higher
- NPM or Yarn
- SQLite/MySQL/PostgreSQL
- ConvertHub API key (get one at [converthub.com/api](https://converthub.com/api))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/converthub-api/starter-kit.git
cd starter-kit
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install JavaScript Dependencies

```bash
npm install
# or
yarn install
```

### 4. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your ConvertHub API credentials:

```env
# ConvertHub API Configuration
CONVERTHUB_API_KEY="your_api_key_here"
CONVERTHUB_API_URL=https://api.converthub.com/v2
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Database Setup

Run migrations to create the database tables:

```bash
php artisan migrate
```

### 7. Fetch Supported Formats

Fetch the latest supported formats from ConvertHub:

```bash
php artisan conversion:fetch-formats
```

### 8. Build Assets

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
```

### 9. Start the Application

```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## 🔧 Configuration

### API Configuration

The ConvertHub API settings are configured in `config/services.php`:

```php
'converthub' => [
    'api_key' => env('CONVERTHUB_API_KEY'),
    'api_url' => env('CONVERTHUB_API_URL', 'https://api.converthub.com/v2'),
    'webhook_url' => env('CONVERTHUB_WEBHOOK_URL'),
    'chunk_size' => env('CONVERTHUB_CHUNK_SIZE', 5242880), // 5MB
    'max_file_size' => env('CONVERTHUB_MAX_FILE_SIZE', 52428800), // 50MB
],
```

### Storage Configuration (S3/R2)

You can optionally configure AWS S3 or Cloudflare R2 to store converted files in your own bucket. This requires:

1. **Configure your storage in `.env`:**

```env
# For AWS S3
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-bucket.s3.amazonaws.com

# For Cloudflare R2
FILESYSTEM_DISK=r2
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=your-bucket-name
R2_ENDPOINT=https://account.r2.cloudflarestorage.com
R2_URL=https://your-custom-domain.com  # Optional custom domain
```

2. **Configure ConvertHub API:**
   - Log into your ConvertHub developer account
   - Go to Bucket Integrations
   - Add your S3/R2 bucket credentials

3. **Privacy Cleanup:**
   The application includes automatic cleanup of old files from your bucket (see Commands section below).

### Scheduled Tasks

Add the following to your crontab to automatically update supported formats:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or run manually:
```bash
php artisan conversion:fetch-formats
```

## 🛡️ Privacy & Cleanup

### Automatic Cleanup Command

The application includes a privacy-focused cleanup command that automatically deletes old conversions and their associated files:

```bash
# Delete conversions older than 24 hours (default)
php artisan conversions:cleanup

# Delete conversions older than 48 hours
php artisan conversions:cleanup --hours=48

# Preview what will be deleted (dry run)
php artisan conversions:cleanup --dry-run

# Force deletion without confirmation
php artisan conversions:cleanup --force
```

**Features:**
- Automatically deletes database records older than specified time
- Removes files from S3/R2 buckets if configured
- Supports AWS S3, Cloudflare R2, and custom domains
- Detailed logging of all operations
- Scheduled to run daily at 2 AM automatically

**Note:** External ConvertHub URLs are automatically skipped during cleanup as they're managed by ConvertHub's retention policy.

## 📁 Project Structure

```
starter-kit/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── CleanupOldConversions.php   # Privacy cleanup command
│   │       └── FetchConversionFormats.php  # Fetches supported formats
│   ├── Livewire/
│   │   └── FileConverter.php               # Main conversion component
│   ├── Models/
│   │   └── Conversion.php                  # Conversion tracking model
│   └── Services/
│       ├── ConversionService.php           # ConvertHub API integration
│       └── FormatService.php               # Format management service
├── resources/
│   └── views/
│       ├── home.blade.php                  # Homepage
│       └── livewire/
│           └── file-converter.blade.php    # Conversion UI component
├── storage/
│   └── app/
│       └── private/
│           └── converthub/                 # Cached format data
└── tests/                                  # Pest tests
```

## 🧪 Testing

Run the test suite:

```bash
php artisan test
# or
./vendor/bin/pest
```

## 🔌 API Integration

The application integrates with ConvertHub API v2. Key features include:

- **Direct Upload**: Files up to 50MB
- **Chunked Upload**: For larger files (coming soon)
- **Status Polling**: Real-time conversion progress
- **Format Detection**: Automatic source format detection
- **Error Handling**: Detailed error messages

### Available API Methods

```php
// Convert a file
$result = $conversionService->convertFile($file, $targetFormat);

// Check conversion status
$status = $conversionService->getJobStatus($jobId);

// Get download URL
$download = $conversionService->getDownloadUrl($jobId);
```

## 🎨 Customization

### Styling

This web app uses Tailwind CSS 4. To customize styles, modify the CSS variables in your stylesheets or use Tailwind's built-in utilities directly in your components.

### Adding New Features

1. **New Conversion Options**: Extend `ConversionService.php`
2. **UI Components**: Add Livewire components in `app/Livewire`
3. **Format Filters**: Modify `FormatService.php`

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `CONVERTHUB_API_KEY` | Your ConvertHub API key | Yes | - |
| `CONVERTHUB_API_URL` | API endpoint URL | No | `https://api.converthub.com/v2` |
| `CONVERTHUB_WEBHOOK_URL` | Webhook for notifications | No | - |
| `CONVERTHUB_CHUNK_SIZE` | Chunk size for large files | No | `5242880` (5MB) |
| `CONVERTHUB_MAX_FILE_SIZE` | Maximum file size | No | `52428800` (50MB) |
| `FILESYSTEM_DISK` | Storage driver (local/s3/r2) | No | `local` |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | If using S3 | - |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key | If using S3 | - |
| `AWS_BUCKET` | S3 bucket name | If using S3 | - |
| `R2_ACCESS_KEY_ID` | R2 access key | If using R2 | - |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | If using R2 | - |
| `R2_BUCKET` | R2 bucket name | If using R2 | - |
| `R2_ENDPOINT` | R2 endpoint URL | If using R2 | - |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
composer install
npm install

# Run development servers
npm run dev
php artisan serve
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ConvertHub](https://converthub.com) for providing the conversion API
- [Laravel](https://laravel.com) for the amazing framework
- [Livewire](https://livewire.laravel.com) for reactive components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/converthub-api/starter-kit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/converthub-api/starter-kit/discussions)
- **API Documentation**: [ConvertHub Docs](https://converthub.com/api/docs)

## 🚦 Status

![Last Commit](https://img.shields.io/github/last-commit/converthub-api/starter-kit?style=flat-square)
![Open Issues](https://img.shields.io/github/issues/converthub-api/starter-kit?style=flat-square)

---
