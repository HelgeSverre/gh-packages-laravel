# Laravel Support

Package hỗ trợ và tiện ích cho Laravel.

## 📚 Documentation

- **Project Docs:** [Serve:Dev Commands](../../docs/project/serve-dev-commands.md) - Development server commands
- **Project Docs:** [Package Namespace Conventions](../../docs/project/package-namespace-conventions.md)

## Mô tả ngắn gọn

Cung cấp các công cụ hỗ trợ cho developer trong hệ thống DX, bao gồm:
- Mở rộng Collection với tiện ích markdown
- Command quản lý npm tự động
- **Hệ thống serve:dev commands** để quản lý development server (Laravel + Vite)

## Chức năng chính

### 1. Collection Extension
- Class `Collection` mở rộng từ `Illuminate\Support\Collection`
- Phương thức `toMarkdownTable` chuyển collection thành bảng markdown (hỗ trợ UTF-8, căn chỉnh cột)

### 2. NPM Management Command
- Command `app:dev:npm` tự động chạy `npm install` (nếu thiếu node_modules)
- Khởi động `npm run watch` ở background
- Quản lý PID file tránh trùng lặp process
- Tích hợp với Laravel scheduling (tự động chạy mỗi phút)

### 3. Serve:Dev Commands (Development Server)
- `serve:dev` - Start Laravel + Vite development servers
- `serve:dev:stop` - Stop development servers
- `serve:dev:status` - Check server status
- `serve:dev:health` - Health check với auto-recovery
- `serve:dev:service` - Systemd service management
- `serve:dev:logs` - View logs real-time

**Xem chi tiết:** [docs/SERVE-DEV-COMMANDS.md](docs/SERVE-DEV-COMMANDS.md)

### 4. Charset Support
- Hỗ trợ xử lý charset thông qua dependency php-charset

## Cài đặt / Sử dụng

```bash
composer require diepxuan/laravel-support
```

Package không có ServiceProvider, cần đăng ký command thủ công trong `app/Console/Kernel.php`:

```php
protected $commands = [
    \Diepxuan\Support\Commands\Npm::class,
    \Diepxuan\Support\Commands\ServeDev::class,
    \Diepxuan\Support\Commands\ServeDevStop::class,
    \Diepxuan\Support\Commands\ServeDevStatus::class,
    \Diepxuan\Support\Commands\ServeDevHealth::class,
    \Diepxuan\Support\Commands\ServeDevService::class,
    \Diepxuan\Support\Commands\ServeDevLogs::class,
];
```

### Sử dụng Collection

```php
use Diepxuan\Support\Collection;

$collection = new Collection([['name' => 'John', 'age' => 30], ...]);
echo $collection->toMarkdownTable(['name' => 'Tên', 'age' => 'Tuổi']);
```

### Sử dụng NPM Command

```bash
php artisan app:dev:npm
```

Command sẽ kiểm tra node_modules, cài đặt nếu cần, và khởi chạy npm run watch với PID lưu tại `storage/watch.pid`.

### Sử dụng Serve:Dev Commands

```bash
# Start development server
php artisan serve:dev

# Check status
php artisan serve:dev:status

# Health check with auto-fix
php artisan serve:dev:health --fix

# Install as systemd service
sudo php artisan serve:dev:service install

# Stop servers
php artisan serve:dev:stop
```

**Xem chi tiết:** [docs/SERVE-DEV-COMMANDS.md](docs/SERVE-DEV-COMMANDS.md)

## Cấu trúc thư mục

```
laravel-support/
├── config/
│   └── config.php                 # Cấu hình package
├── src/
│   ├── Collection.php             # Class Collection mở rộng
│   └── Commands/
│       ├── Npm.php                # Command npm tự động
│       ├── ServeDev.php           # Main serve:dev command
│       ├── ServeDevStop.php       # Stop command
│       ├── ServeDevStatus.php     # Status command
│       ├── ServeDevHealth.php     # Health check
│       ├── ServeDevService.php    # Service management
│       └── ServeDevLogs.php       # Log viewer
├── docs/
│   ├── CODE-STYLE-AND-FORMATTING.md
│   └── SERVE-DEV-COMMANDS.md      # Serve:dev documentation
├── .editorconfig
├── .gitignore
├── .php-cs-fixer.dist.php
├── LICENSE
├── README.md
└── composer.json
```

## Liên kết đến các package liên quan

- diepxuan/php-charset (xử lý charset)
- diepxuan/laravel-core (core chung)

## Tài liệu

- [Code Style & Formatting](docs/CODE-STYLE-AND-FORMATTING.md)
- [Serve:Dev Commands](docs/SERVE-DEV-COMMANDS.md)

## Ghi chú

Package hỗ trợ các tiện ích nhỏ nhưng hữu ích cho quá trình phát triển:
- Command npm tự động giúp duy trì watch mode cho frontend assets
- Collection markdown table hữu ích cho việc generate report trong console
- Serve:dev commands thay thế hoàn toàn external scripts, tích hợp đầy đủ development server management