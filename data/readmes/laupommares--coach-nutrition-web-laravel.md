## 🚀 Iniciar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/laupommares/coach-nutrition-web-laravel.git
```

### 2. Copiar el archivo `.env`
Asegurate de duplicar el archivo `.env.example` y nombrarlo `.env`.

### 3. Instalar dependencias con Composer (usando Sail)
```bash
docker run --rm \
    -v $(pwd):/opt \
    -w /opt \
    laravelsail/php83-composer:latest \
    composer install
```

### 4. Generar la APP_KEY
```bash
./vendor/bin/sail artisan key:generate
```

### 5. Instalar dependencias de npm
```bash
./vendor/bin/sail npm install
```

---

## ▶️ Levantar el proyecto

### Arrancar los servicios
```bash
./vendor/bin/sail up -d
```

### Compilar los assets
```bash
./vendor/bin/sail npm run dev
```
