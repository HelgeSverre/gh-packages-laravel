# 🚀 Laravel + FrankenPHP + Docker - Generador de Proyectos

Generador **profesional** de proyectos Laravel con **puertos dinámicos**, **aislamiento completo** y soporte para **MySQL + phpMyAdmin** o **PostgreSQL**.

## ✨ Características

- 🚀 **FrankenPHP + PHP 8.4** - Servidor moderno y rápido
- 🔄 **Proyectos simultáneos** - Sin conflictos de puertos
- 🗃️ **MySQL con phpMyAdmin** o **PostgreSQL** a elección
- 🔴 **Redis** incluido (cache + sesiones)
- 📦 **Aislamiento completo** - Contenedores, redes y volúmenes únicos
- 🎯 **Puertos dinámicos** - Automáticos basados en nombre del proyecto

## 📁 Estructura

```
generador-laravel/
├── Makefile                      # 🛠️ Comandos principales
├── docker-compose.mysql.yml      # 🐬 Template MySQL + phpMyAdmin  
├── docker-compose.postgresql.yml # 🐘 Template PostgreSQL
├── Dockerfile.mysql              # 🐬 Imagen para MySQL
├── Dockerfile.postgres           # 🐘 Imagen para PostgreSQL
├── .env.example.mysql            # 🐬 Variables MySQL
├── .env.example.postgres         # 🐘 Variables PostgreSQL
├── README.md                     # 📖 Esta guía
├── tienda_mysql/                 # 🛒 Proyecto con MySQL
│   ├── app/, routes/, database/
│   ├── docker-compose.yml        # (copiado del template)
│   └── .env                      # (configurado automáticamente)
└── blog_postgres/                # 📝 Proyecto con PostgreSQL
    ├── app/, routes/, database/
    ├── docker-compose.yml        # (copiado del template)
    └── .env                      # (configurado automáticamente)
```

---

## 🚀 Guía Completa: De Cero a Producción

### **Paso 1: Crear un Proyecto**

Elige tu base de datos favorita:

```bash
# 🐬 MySQL + phpMyAdmin (recomendado para desarrollo)
make new-project-mysql PROJECT_NAME=mi_tienda

# 🐘 PostgreSQL (recomendado para producción)
make new-project-postgres PROJECT_NAME=mi_blog

# ⚡ Generic (MySQL por defecto)
make new-project PROJECT_NAME=mi_app
```

**🎯 Resultado:**
- ✅ Directorio `mi_tienda/` creado
- ✅ Proyecto Laravel instalado
- ✅ Archivos Docker configurados
- ✅ Variables de entorno (.env) listas

### **Paso 2: Configuración Inicial**

```bash
make setup PROJECT_NAME=mi_tienda
```

**🔄 Proceso automático:**
1. ⚡ **Build** - Construye imagen FrankenPHP + PHP 8.4 + Redis
2. 🚀 **Up** - Levanta MySQL, phpMyAdmin, Redis y Laravel
3. ⏳ **Wait** - Espera que MySQL esté completamente listo
4. 📦 **Install** - Instala dependencias Composer
5. 🔑 **Key** - Genera clave de aplicación Laravel
6. 🗃️ **Migrate** - Ejecuta migraciones iniciales

**🌐 Acceso a tu proyecto:**
- **Laravel**: http://localhost:XXXX (puerto dinámico)
- **phpMyAdmin**: http://localhost:XXXX (si usas MySQL)
- **Credenciales DB**: `laravel` / `laravel_password`

### **Paso 3: Desarrollo y Migraciones**

```bash
# 📊 Ver estado actual
make status PROJECT_NAME=mi_tienda

# 🗃️ Crear modelo con migración
make artisan PROJECT_NAME=mi_tienda cmd="make:model Product -m"

# ✏️ Editar migración
# vim mi_tienda/database/migrations/*_create_products_table.php

# 🚀 Ejecutar migración
make migrate PROJECT_NAME=mi_tienda

# 🔍 Verificar en la base de datos
make db-cli PROJECT_NAME=mi_tienda
```

### **Paso 4: Gestión Avanzada**

```bash
# 🐚 Acceso directo al contenedor
make shell PROJECT_NAME=mi_tienda

# 📋 Ver todos los proyectos
make list-projects

# 🔄 Reiniciar servicios
make restart PROJECT_NAME=mi_tienda

# 📝 Ver logs en tiempo real
make logs PROJECT_NAME=mi_tienda
```

---

## 🌐 Puertos Dinámicos

Cada proyecto obtiene **puertos únicos** automáticamente:

| Proyecto | Laravel | MySQL | phpMyAdmin | PostgreSQL | Redis |
|----------|---------|--------|------------|------------|-------|
| `tienda` | 8156 | 8157 | 8158 | 8159 | 8160 |
| `blog` | 8245 | 8246 | 8247 | 8248 | 8249 |
| `api` | 8334 | 8335 | 8336 | 8337 | 8338 |

**🧮 Algoritmo**: Hash del nombre → Puerto base (8100-8999)

## 📋 Comandos de Referencia

### **🆕 Creación de Proyectos**
```bash
make new-project-mysql PROJECT_NAME=nombre      # MySQL + phpMyAdmin
make new-project-postgres PROJECT_NAME=nombre   # PostgreSQL  
make list-projects                               # Ver todos los proyectos
```

### **⚙️ Ciclo de Vida**
```bash
make setup PROJECT_NAME=nombre     # Primera configuración completa
make build PROJECT_NAME=nombre     # Reconstruir imágenes
make up PROJECT_NAME=nombre        # Levantar contenedores
make down PROJECT_NAME=nombre      # Detener contenedores
make restart PROJECT_NAME=nombre   # Reinicio completo
make status PROJECT_NAME=nombre    # Estado detallado
```

### **🐚 Laravel**
```bash
make shell PROJECT_NAME=nombre                        # Bash dentro del contenedor
make tinker PROJECT_NAME=nombre                       # Laravel Tinker
make artisan PROJECT_NAME=nombre cmd="comando"        # Cualquier comando artisan
make composer PROJECT_NAME=nombre cmd="comando"       # Cualquier comando composer
make migrate PROJECT_NAME=nombre                      # Ejecutar migraciones
make fresh PROJECT_NAME=nombre                        # Reset + migrate + seed
make test PROJECT_NAME=nombre                         # Ejecutar tests
make cache-clear PROJECT_NAME=nombre                  # Limpiar caches
```

### **🗃️ Base de Datos**
```bash
make db-cli PROJECT_NAME=nombre        # Conectar a BD (detecta MySQL/PostgreSQL automáticamente)
make mysql-cli PROJECT_NAME=nombre     # Conectar específicamente a MySQL
make psql PROJECT_NAME=nombre          # Conectar específicamente a PostgreSQL
make redis-cli PROJECT_NAME=nombre     # Conectar a Redis
```

### **📝 Logs**
```bash
make logs PROJECT_NAME=nombre          # Logs de Laravel (Ctrl+C para salir)
make logs-all PROJECT_NAME=nombre      # Logs de todos los servicios
```

### **🧹 Limpieza**
```bash
make clean PROJECT_NAME=nombre         # Detener y borrar volúmenes (¡borra DB!)
make nuke PROJECT_NAME=nombre          # + borrar imágenes del proyecto
make clean-all                         # ⚠️ PELIGRO: Borrar TODO Docker
```

---

## 🆘 Solución de Problemas

### **❌ Error: "No application encryption key has been specified"**

**Síntoma:**
```
Illuminate\Encryption\MissingAppKeyException
No application encryption key has been specified.
```

**Causa:** El archivo .env no tiene APP_KEY configurado o está vacío.

**Solución inmediata:**
```bash
make artisan PROJECT_NAME=tu_proyecto cmd="key:generate --force"
```

**Verificación:**
```bash
# Verificar que la clave se generó
grep "APP_KEY" tu_proyecto/.env
# Debe mostrar: APP_KEY=base64:...

# Probar que Laravel funciona
curl -I http://localhost:PUERTO
# Debe retornar: HTTP/1.1 200 OK
```

### **❌ Error: "Class Redis not found"**

**Síntoma:**
```
Internal Server Error: Class "Redis" not found
```

**Causa:** Extensión PHP Redis no instalada en el contenedor.

**Solución:**
```bash
# Ya está resuelto en las imágenes actuales
# Pero si aparece, reconstruir:
make build PROJECT_NAME=tu_proyecto
make restart PROJECT_NAME=tu_proyecto
```

### **❌ Error: "invalid project name"**

**Síntoma:**
```
invalid project name "MiTienda": must consist only of lowercase alphanumeric characters
```

**Solución:** Automática - El sistema normaliza nombres (`MiTienda` → `mitienda`)

### **❌ Error: "MySQL not ready"**

**Síntoma:**
```
Error: MySQL no está listo
```

**Soluciones:**
```bash
# 1. Verificar estado
make status PROJECT_NAME=tu_proyecto

# 2. Esperar más tiempo (MySQL puede tardar 1-2 minutos)
# 3. Reintentar setup
make setup PROJECT_NAME=tu_proyecto

# 4. Si persiste, reconstruir
make clean PROJECT_NAME=tu_proyecto
make setup PROJECT_NAME=tu_proyecto
```

### **❌ Conflictos de puertos**

**Síntoma:**
```
Port already in use
```

**Solución:** Imposible con este sistema - cada proyecto usa puertos únicos automáticamente.

### **❌ Error: "SQLSTATE[HY000] [2002] Connection refused"**

**Síntoma:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Causa:** Laravel intenta conectar a MySQL antes de que esté listo.

**Solución:**
```bash
# Verificar que MySQL está corriendo
make status PROJECT_NAME=tu_proyecto

# Si MySQL está "healthy", esperar 30 segundos y reintentar
make restart PROJECT_NAME=tu_proyecto

# Si persiste, verificar logs de MySQL
make logs PROJECT_NAME=tu_proyecto
```

### **❌ Error: "Permission denied" al crear archivos**

**Síntoma:**
```
Permission denied writing to storage/logs/laravel.log
```

**Causa:** Permisos incorrectos en directorios de Laravel.

**Solución:**
```bash
# Acceder al contenedor y arreglar permisos
make shell PROJECT_NAME=tu_proyecto
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
exit
```

### **❌ Error: "Port already in use"**

**Síntoma:**
```
Error: Port 8000 is already in use
```

**Causa:** Otro proyecto o servicio usando el puerto.

**Solución:**
```bash
# Este sistema usa puertos dinámicos, esto NO debería pasar
# Pero si ocurre:

# Ver qué está usando el puerto
sudo netstat -tlnp | grep :8000

# Detener el servicio conflictivo o usar otro puerto manualmente
# en docker-compose.yml: "8001:8000"
```

### **🔍 Diagnóstico General**

```bash
# Ver todos los proyectos y sus estados
make list-projects

# Verificar estado específico
make status PROJECT_NAME=tu_proyecto

# Ver logs para errores
make logs-all PROJECT_NAME=tu_proyecto

# Verificar conectividad de servicios
make artisan PROJECT_NAME=tu_proyecto cmd="tinker --execute='echo \"✓ Laravel OK\";'"

# Test completo de servicios
make artisan PROJECT_NAME=tu_proyecto cmd="tinker --execute='
  echo \"DB: \" . (DB::connection()->getPdo() ? \"✓\" : \"✗\");
  echo \"Redis: \" . (Redis::connection()->ping() ? \"✓\" : \"✗\");
  echo \"Cache: \" . (Cache::put(\"test\", \"ok\") ? \"✓\" : \"✗\");
'"
```

---

## 💡 Casos de Uso Avanzados

### **🏢 Múltiples Proyectos Simultáneos**

```bash
# Crear proyectos diferentes
make new-project-mysql PROJECT_NAME=ecommerce
make new-project-postgres PROJECT_NAME=blog_api
make new-project-mysql PROJECT_NAME=admin_panel

# Levantar todos
make setup PROJECT_NAME=ecommerce    # → http://localhost:8156
make setup PROJECT_NAME=blog_api     # → http://localhost:8245
make setup PROJECT_NAME=admin_panel  # → http://localhost:8334

# Trabajar en paralelo sin conflictos
make shell PROJECT_NAME=ecommerce &
make logs PROJECT_NAME=blog_api &
make db-cli PROJECT_NAME=admin_panel
```

### **📊 Workflow Completo: Post-Build hasta Migraciones**

#### **1. Verificación Post-Build (OBLIGATORIO)**
```bash
# ✅ Verificar que Laravel carga sin errores
curl -I http://localhost:PUERTO

# ❌ Si falla con "APP_KEY missing":
make artisan PROJECT_NAME=tu_proyecto cmd="key:generate --force"

# ❌ Si falla con "Redis not found": 
make build PROJECT_NAME=tu_proyecto
make restart PROJECT_NAME=tu_proyecto

# ❌ Si falla con "Connection refused":
make status PROJECT_NAME=tu_proyecto  # Verificar MySQL
```

#### **2. Primera Migración Personalizada**
```bash
# 1. Crear modelo + migración
make artisan PROJECT_NAME=tienda cmd="make:model Product -m"

# 2. Editar migración (agregar campos)
# vim tienda/database/migrations/*_create_products_table.php

# 3. Configurar modelo (fillable, casts, relaciones)
# vim tienda/app/Models/Product.php

# 4. Ejecutar migración
make migrate PROJECT_NAME=tienda

# 5. Verificar estado de migraciones
make artisan PROJECT_NAME=tienda cmd="migrate:status"
```

#### **3. Seeders y Datos de Prueba**
```bash
# 1. Crear seeder
make artisan PROJECT_NAME=tienda cmd="make:seeder ProductSeeder"

# 2. Configurar datos de ejemplo
# vim tienda/database/seeders/ProductSeeder.php

# 3. Registrar en DatabaseSeeder
# vim tienda/database/seeders/DatabaseSeeder.php

# 4. Ejecutar seeders
make artisan PROJECT_NAME=tienda cmd="db:seed"

# 5. Verificar datos
make artisan PROJECT_NAME=tienda cmd="tinker --execute='echo App\Models\Product::count();'"
```

#### **4. Verificación Final**
```bash
# Acceder a todos los servicios
echo "🌐 Laravel: http://localhost:$(make status PROJECT_NAME=tienda | grep Laravel | cut -d: -f3)"
echo "🗃️ phpMyAdmin: http://localhost:$(make status PROJECT_NAME=tienda | grep phpMyAdmin | cut -d: -f3)"

# Test completo en base de datos
make db-cli PROJECT_NAME=tienda
# SHOW TABLES; SELECT * FROM products LIMIT 3;
```

### **📊 Workflow de Migración Típico**

```bash
# 1. Crear migración
make artisan PROJECT_NAME=tienda cmd="make:migration create_products_table"

# 2. Editar archivo
# vim tienda/database/migrations/*_create_products_table.php

# 3. Ejecutar migración
make migrate PROJECT_NAME=tienda

# 4. Si hay error, rollback
make artisan PROJECT_NAME=tienda cmd="migrate:rollback"

# 5. Corregir y volver a ejecutar
make migrate PROJECT_NAME=tienda

# 6. Verificar en BD
make db-cli PROJECT_NAME=tienda
# SHOW TABLES; (MySQL) o \dt (PostgreSQL)
```

### **🧪 Testing y CI/CD**

```bash
# Setup proyecto para testing
make new-project-postgres PROJECT_NAME=test_suite
make setup PROJECT_NAME=test_suite

# Ejecutar tests
make test PROJECT_NAME=test_suite

# Para CI/CD, usar puertos fijos:
# Override en .env: APP_PORT=8000, MYSQL_PORT=3306, etc.
```

---

## 🎯 Próximos Pasos

1. **📝 Personaliza** los templates en el directorio raíz
2. **🔧 Extiende** el Makefile con comandos específicos de tu workflow  
3. **📦 Agregar** servicios (Elasticsearch, RabbitMQ, etc.)
4. **🚀 Deploy** usando docker-compose.prod.yml

**¡Happy coding!** 🎉