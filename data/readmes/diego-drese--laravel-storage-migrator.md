# Laravel Storage Migrator

A Laravel package to migrate files between storage disks preserving paths.

---

## 🚀 Features

- Migrate files between any Laravel disks
- Preserve original file paths
- Optional overwrite existing files
- Dry-run mode
- Works with S3, Spaces, MinIO, FTP, Local, etc.

---

## 📦 Installation
```bash
  composer require deployfy/laravel-storage-migrator
```

## 📘 Publish config
```bash
  php artisan vendor:publish --tag=storage-migrator-config
```
## ⚙️ Configuration .env
```bash
  STORAGE_MIGRATOR_FROM=old_storage
  STORAGE_MIGRATOR_TO=new_storage
```
## ▶️ Usage Basic migration
```bash
  php artisan storage:migrate old_storage new_storage
```
## ▶️ Using config defaults
```bash
  php artisan storage:migrate
```
## ▶️ Using Migrate a specific path
```bash
  php artisan storage:migrate --path=tickets/2024
```
## ▶️ Using Replace existing files
```bash
  php artisan storage:migrate --replace
```
## ▶️ Using Dry run
```bash
  php artisan storage:migrate --dry-run
```
