# SB-ATS Project

## Requirements

* Docker
* Docker Compose

## Setup

### 1 Clone Repository

```bash
git clone https://github.com/jisan25/sb-ats.git
cd sb-ats
```

### 2 Install `make` (Ubuntu Only)

```bash
sudo apt update
sudo apt install -y build-essential
```

### 3 Start Containers

```bash
make up
```

### 4 Install Dependencies (vendor)
You have two ways to install Laravel dependencies (the vendor folder):


Option 1 — Using local Composer (on your host machine)

```bash
cd backend
composer install --no-interaction --prefer-dist --optimize-autoloader
cd ../
```

### 5 Restart Containers

```bash
make restart-d
```


### 6 Environment Setup

```bash
cp backend/.env.example backend/.env
make artisan cmd="key:generate"
```

### 7 Fresh Migration (Optional)

```bash
make fresh
```

### 8 Application Running Port

Run Frontend
```bash
http://localhost:5173
```
Backend Api
```bash
http://localhost:8000
```