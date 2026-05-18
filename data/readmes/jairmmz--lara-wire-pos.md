# 🏪 Sistema POS Laravel V1.0

<div align="center">
  <img src="https://github.com/jairmmz/lara-wire-pos/blob/master/public/images/web-shots/lara-pos-wire_screamshot_4.png" 
     alt="Lara Wire POS V1.0" />

  
  <h3>Sistema de Punto de Venta Moderno y Eficiente</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel">
    <img src="https://img.shields.io/badge/Livewire-3.x-4E56A6?style=flat-square&logo=livewire&logoColor=white" alt="Livewire">
    <img src="https://img.shields.io/badge/Alpine.js-3.x-8BC34A?style=flat-square&logo=alpine.js&logoColor=white" alt="Alpine.js">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Flux_UI-Latest-9333EA?style=flat-square" alt="Flux UI">
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP">
    <img src="https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL">
    <img src="https://img.shields.io/badge/Docker-Compatible-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  </p>
</div>

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📦 Requisitos del Sistema](#-requisitos-del-sistema)
- [🔧 Instalación](#-instalación)
  - [Con Laravel Sail (Recomendado)](#con-laravel-sail-recomendado)
  - [Instalación Manual](#instalación-manual)
- [📚 Documentación](#-documentación)
- [🤝 Contribuciones](#-contribuciones)
- [📄 Licencia](#-licencia)
- [👥 Créditos](#-créditos)

## 🚀 Características

### 👥 Gestión de Clientes
- Registro de clientes de forma individual o importación mediante csv
- Inhabilitación de clientes: Permite desactivar temporalmente un cliente, manteniendo su información e historial en el sistema para futuras consultas o reactivaciones.
- Eliminación permanente: Opción para borrar definitivamente un cliente y toda su información asociada, sin posibilidad de recuperación.  

### 📦 Gestión de Productos
- Listado completo con información detallada
- Gestión de Categorías
- Unidades de Medida: Sistema flexible de medidas (kg, unidades, litros, etc.)
- Gestión de Marcas: Control de marcas y fabricantes

### 💰 Módulo de Ventas
- Nueva Venta: Punto de venta intuitivo y rápido
- Ventas Realizadas: Historial completo de todas las transacciones
- Notas de Crédito: Gestión de devoluciones y ajustes
- Notas de Débito: Cargos adicionales y ajustes
- Anulación de Comprobantes: Control de anulaciones con justificación

### 📊 Sistema de Reportes
- Reportes de Ventas: Análisis detallado por período y vendedor
- Reportes de Inventario: Estado actual y movimientos de stock
- Reportes de Compras: Análisis de adquisiciones y proveedores
- Reportes por Cliente: Análisis de comportamiento de clientes
- Reporte de productos: Productos más vendidos, por categoría, etc

### 👤 Roles y Usuarios
- Sistema de Roles: Permisos granulares por funcionalidad
- Gestión de Usuarios: Creación y administración de usuarios
- Permisos Personalizados: Asignación flexible de accesos
- Auditoria de Usuarios: Registro de actividades por usuario

### ⚙️ Configuración del Sistema
- Datos de Empresa: Configuración de RUC, razón social, dirección, etc
- SUNAT: Configuración credenciales SUNAT para facturación electrónica

## 🛠️ Tecnologías Utilizadas

### Backend
- **Laravel 12.x** - Framework PHP moderno y elegante
- **PHP 8.2+** - Lenguaje de programación
- **MySQL 8.0+** - Base de datos relacional

### Frontend
- **Livewire 3.x** - Framework full-stack para Laravel
- **Alpine.js 3.x** - Framework JavaScript minimalista
- **Tailwind CSS 3.x** - Framework CSS utility-first
- **Flux UI** - Componentes UI modernos

### Desarrollo y Despliegue
- **Laravel Sail** - Entorno de desarrollo con Docker
- **Docker** - Contenedorización
- **Composer** - Gestor de dependencias PHP
- **NPM** - Gestor de paquetes JavaScript

## 📦 Requisitos del Sistema

### Para Instalación con Laravel Sail (Recomendado)
- **Docker Desktop** 4.0+
- **Docker Compose** 2.0+
- **Git**
- **4GB RAM** mínimo
- **5GB** espacio en disco

### Para Instalación Manual
- **PHP** 8.3 o superior
- **Composer** 2.0+
- **Node.js** 18+ y NPM/Yarn
- **MySQL** 8.0+

## 🔧 Instalación

### Con Laravel Sail (Recomendado)

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/jairmmz/lara-wire-pos
cd lara-wire-pos
```

#### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```

#### 3. Instalar Dependencias con Sail
```bash
# Instalar Composer dependencies
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/var/www/html \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

#### 4. Levantar el Entorno
```bash
# Iniciar contenedores
./vendor/bin/sail up -d

# Generar clave de aplicación
./vendor/bin/sail artisan key:generate

# Ejecutar migraciones
./vendor/bin/sail artisan migrate --seed
```

#### 5. Instalar Dependencias Frontend
```bash
# Instalar dependencias NPM
./vendor/bin/sail npm install

# Compilar assets
./vendor/bin/sail npm run build
```

#### 6. Configurar Storage
```bash
./vendor/bin/sail artisan storage:link
```

### Instalación Manual

#### 1. Clonar y Configurar
```bash
git clone https://github.com/jairmmz/lara-wire-pos.git
cd lara-wire-pos
cp .env.example .env
```

#### 2. Instalar Dependencias
```bash
# Instalar dependencias PHP
composer install

# Instalar dependencias JavaScript
npm install
```

#### 3. Configurar Base de Datos
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE sistema_pos;
EXIT;

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate --seed
```

#### 4. Compilar Assets
```bash
npm run build
```

#### 5. Configurar Permisos
```bash
# Linux/Mac
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Crear enlace simbólico
php artisan storage:link
```

#### 6. Iniciar Servidor
```bash
php artisan serve
```

## 📚 Documentación

### Primeros Pasos
1. **Acceso al Sistema**: Usa las credenciales por defecto
   - Email: `admin@example.com`
   - Password: `123456789`

2. **Configuración Inicial**:
   - Configura la información de la empresa
   - Configurar de la SUNAT para facturación electrónica
   - Crea categorías de productos, marcas, unidad de productos y productos

### Comandos Útiles

```bash
# Limpiar cache
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan view:clear

# Ejecutar tests
./vendor/bin/sail test

# Generar backup
./vendor/bin/sail artisan backup:run

# Optimizar para producción
./vendor/bin/sail artisan optimize
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Feat: Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Guías de Contribución
- Sigue los estándares de código PSR-12
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Usa commits descriptivos

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Jairo Muñoz Miranda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Créditos

### Desarrollador Principal
- **Jairo Muñoz Miranda** - *Desarrollo Full Stack* - [GitHub](https://github.com/jairmmz)

### Tecnologías y Frameworks
- [Laravel](https://laravel.com/) - Framework PHP
- [Livewire](https://livewire.laravel.com/) - Framework Full-Stack
- [Alpine.js](https://alpinejs.dev/) - Framework JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Flux UI](https://fluxui.dev/) - Componentes UI

### Inspiración y Recursos
- [Laravel Sail](https://laravel.com/docs/sail) - Entorno de desarrollo
- [Mailpit](https://mailpit.axllent.org) - Servidor de correos
- [Heroicons](https://heroicons.com/) - Iconos
- [Lucide](https://lucide.dev/) - Iconos

---

<div align="center">
  <p>⭐ Si te gusta este proyecto, no olvides darle una estrella en GitHub</p>
  <p>🐛 ¿Encontraste un bug? <a href="https://github.com/jairmmz/lara-wire-pos/issues">Repórtalo aquí</a></p>
  <p>💡 ¿Tienes una idea? <a href="https://github.com/jairmmz/lara-wire-pos/discussions">Compártela con nosotros</a></p>
</div>

---

<div align="center">
  <sub>Desarrollado con ❤️ por <a href="https://github.com/jairmmz">Jairmmz</a></sub>
</div>
