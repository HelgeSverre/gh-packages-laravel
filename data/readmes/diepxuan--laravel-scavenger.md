# Laravel Scavenger

Package web scraper tích hợp cho Laravel.

## Mô tả ngắn gọn

The integrated web scraper package for Laravel. Package cung cấp công cụ thu thập dữ liệu web (web scraping) với tích hợp các extension PHP cần thiết.

## Chức năng chính

- Cung cấp công cụ thu thập dữ liệu web (web scraping).
- Tích hợp với các extension PHP: iconv, json, dom.
- Có sẵn cấu trúc database cho factories và seeders (migration, factory, seeder).
- Helper (hiện chưa có nội dung).
- ServiceProvider (hiện trỏ đến CatalogServiceProvider, có thể nhầm lẫn).

## Cài đặt / Sử dụng

```bash
composer require diepxuan/laravel-scavenger
```

Package sử dụng ServiceProvider từ catalog (có thể nhầm lẫn). Hiện chưa có code chính thức trong src, cần phát triển thêm.

Sau khi cài đặt, có thể sử dụng các helper (nếu có) và cấu trúc database.

## Cấu trúc thư mục

```
laravel-scavenger/
├── config/
│   └── config.php          # Cấu hình package (chỉ có name và namespace)
├── database/
│   ├── factories/          # Factory (chưa có file)
│   ├── migrations/         # Migration (chưa có file)
│   └── seeders/            # Seeder (chưa có file)
├── helpers.php             # Helper (hiện rỗng)
├── .gitignore
├── LICENSE
├── README.md
└── composer.json
```

## Liên kết đến các package liên quan

Không có dependency ngoài các extension PHP (iconv, json, dom).

## Ghi chú

Package này đang trong giai đoạn phát triển, chưa có code chính thức. Cần xem xét bổ sung các class scraping, tích hợp với thư viện như Goutte, Guzzle, hoặc Symfony DomCrawler. ServiceProvider hiện tại trỏ đến `Diepxuan\\Catalog\\Providers\\CatalogServiceProvider` có thể là sai, cần điều chỉnh.