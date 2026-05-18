# Laravel Currency

Package định dạng tiền tệ cho Blade.

## Mô tả

Một Laravel package để định dạng tiền tệ trong Blade (lấy từ composer.json).

## Chức năng chính

- Cung cấp class Formatter để định dạng số tiền theo currency và locale.
- Đăng ký Blade directive `@currency` để sử dụng trực tiếp trong view.
- Hỗ trợ các currency như VND, USD, ...
- Sử dụng Symfony Intl để định dạng chuẩn.

## Cài đặt / Sử dụng

```bash
composer require diepxuan/laravel-currency
```

Package tự động đăng ký ServiceProvider.

Trong Blade:

```blade
{{-- Định dạng mặc định VND --}}
@currency(1000000)

{{-- Hoặc sử dụng trực tiếp Formatter --}}
{{\Diepxuan\Currency\Formatter::format(1000000, 'USD')}}
```

## Cấu trúc thư mục

```
laravel-currency/
├── src/
│   ├── Formatter.php
│   └── Providers/
│       └── CurrencyServiceProvider.php
└── composer.json
```

## Liên kết đến các package liên quan

- symfony/intl (dependency)

## Ghi chú

Package nhỏ gọn, chuyên biệt cho việc định dạng tiền tệ, hữu ích trong các ứng dụng thương mại điện tử.