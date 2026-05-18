# Stocker

Sistema de gestión para pequeños negocios y tiendas. Permite administrar inventario, ventas, clientes, deudas y sucursales desde una sola interfaz.

## Stack

- **Backend:** Laravel + Sanctum + Jetstream + Spatie Permissions
- **Frontend:** React (TSX) + Inertia.js + TanStack Table + Framer Motion
- **Estilos:** Tailwind CSS
- **Rutas:** Ziggy

## Funcionalidades

- **Ventas** — punto de venta con búsqueda de productos por nombre, SKU o código de barras
- **Inventario** — gestión de productos y categorías con exportación a PDF
- **Kardex** — registro de movimientos de stock con soporte de devoluciones
- **Clientes** — gestión de clientes y su historial
- **Deudas** — seguimiento de deudas y pagos por cliente
- **Facturas** — generación de facturas y exportación a PDF.
- **Reportes** — estadísticas de ventas y rentabilidad por categoría
- **Sucursales** — soporte multi-sucursal por negocio
- **Staff** — gestión de personal con roles y permisos
- **SRI** — integración con el Servicio de Rentas Internas para emisión de comprobantes electrónicos.

## Requisitos

- PHP 8.1+
- Composer
- Node.js 18+ / pnpm
- MySQL / SQLite

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/arielfernando1/stocker.git
cd stocker

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias frontend
pnpm install

# 4. Configurar entorno
cp .env.example .env
php artisan key:generate

# 5. Configurar base de datos en .env, luego migrar y seedear
php artisan migrate --seed

# 6. Compilar assets
pnpm run build

# 7. Iniciar servidor
php artisan serve
```

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu feature o fix: `git checkout -b feature/mi-feature`
3. Commitea tus cambios: `git commit -m "feat: descripción del cambio"`
4. Haz push a tu rama: `git push origin feature/mi-feature`
5. Abre un Pull Request hacia la rama `stable`

Para reportar bugs o sugerir mejoras, abre un [issue](https://github.com/arielfernando1/stocker/issues).
