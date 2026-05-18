# Lara Verifactu

[![Latest Version on Packagist](https://img.shields.io/packagist/v/aichadigital/lara-verifactu.svg?style=flat-square)](https://packagist.org/packages/aichadigital/lara-verifactu)
[![Total Downloads](https://img.shields.io/packagist/dt/aichadigital/lara-verifactu.svg?style=flat-square)](https://packagist.org/packages/aichadigital/lara-verifactu)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/AichaDigital/lara-verifactu/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/AichaDigital/lara-verifactu/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/AichaDigital/lara-verifactu/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/AichaDigital/lara-verifactu/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![PHPStan Level 8](https://img.shields.io/badge/PHPStan-level%208-brightgreen.svg?style=flat-square)](https://phpstan.org/)
[![codecov](https://codecov.io/gh/AichaDigital/lara-verifactu/branch/main/graph/badge.svg)](https://codecov.io/gh/AichaDigital/lara-verifactu)
[![PHP Version](https://img.shields.io/packagist/php-v/aichadigital/lara-verifactu.svg?style=flat-square)](https://packagist.org/packages/aichadigital/lara-verifactu)
[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-red.svg?style=flat-square)](https://laravel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE.md)

---

> **🚧 PAQUETE EN DESARROLLO ACTIVO - ALPHA**
> 
> Este paquete se encuentra en **fase de desarrollo activo (v0.1.0-alpha)** y **NO está listo para producción**.
> 
> **Progreso actual: 92%** (7 de 9 fases completadas)
> 
> 🔬 **Buscamos colaboradores** para testing en entornos reales antes de la release v1.0.0


---

## 🎯 ¿Qué es Lara Verifactu?

Paquete Laravel para cumplimiento normativo de **Verifactu (AEAT)** con arquitectura agnóstica que permite integración tanto en proyectos nuevos como en sistemas de facturación existentes.

### 📅 Fechas Importantes de la Normativa

- **29 de julio de 2025**: Obligatorio para software de facturación
- **1 de enero de 2026**: Obligatorio para empresas
- **1 de julio de 2026**: Obligatorio para autónomos

## ✨ Características Implementadas

- ✅ **Arquitectura Agnóstica**: Funciona con tus modelos existentes o usa los nativos
- ✅ **Cumplimiento Total AEAT**: Implementación completa según especificaciones
- ✅ **Integración Real AEAT**: Cliente SOAP con certificados digitales (.p12/.pfx)
- ✅ **Firma Digital XAdES-EPES**: Firma XML según normativa
- ✅ **Procesamiento Asíncrono**: Sistema de colas para envíos no bloqueantes
- ✅ **Cadena de Bloques**: Generación y validación de hashes SHA-256
- ✅ **Códigos QR**: Generación automática para validación ciudadana
- ✅ **Eventos Laravel**: Sistema completo de eventos para extensibilidad
- ✅ **PHPStan Nivel 8**: Análisis estático estricto
- ✅ **Laravel 12**: Compatible con la última versión LTS

## 🔧 Requisitos Técnicos

- PHP 8.3 o superior
- Laravel 12.x
- Extensiones: `soap`, `openssl`, `dom`, `libxml`

## 📊 Estado del Desarrollo

```
┌─────────────────────────────────────────────────────────┐
│  PROGRESO TOTAL: 92%                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                         │
│  ✅ Fase 1: Package Skeleton & Architecture    (100%)   │
│  ✅ Fase 2: Core Services                      (100%)   │
│  ✅ Fase 3: Database Layer                     (100%)   │
│  ✅ Fase 4: Service Integration                (100%)   │
│  ✅ Fase 5: Commands & Jobs                    (100%)   │
│  ✅ Fase 6: Events & Listeners                 (100%)   │
│  ✅ Fase 7: AEAT API Integration               (100%)   │
│  🚧 Fase 8: Testing & Documentation            (50%)    │
│  ⏳ Fase 9: Production Hardening               (0%)     │
│                                                         │
│  Tests: 120/120 ✅  |  PHPStan: Level 8 ✅              │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Instalación (Desarrollo Local)

> **⚠️ IMPORTANTE**: Este paquete **NO está publicado en Packagist**. Solo se puede instalar desde el repositorio local para desarrollo y testing.

### Opción 1: Path Repository (Recomendado)

1. **Clona el repositorio en tu workspace local:**

```bash
cd ~/development/packages
git clone https://github.com/AichaDigital/lara-verifactu.git
cd lara-verifactu
composer install
```

2. **En tu proyecto Laravel, añade el repositorio local en `composer.json`:**

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/lara-verifactu",
            "options": {
                "symlink": true
            }
        }
    ],
    "require": {
        "aichadigital/lara-verifactu": "@dev"
    }
}
```

3. **Instala el paquete:**

```bash
composer update aichadigital/lara-verifactu
```

Composer creará un symlink desde `vendor/aichadigital/lara-verifactu` a tu repositorio local.

### Opción 2: Symlink Manual

```bash
# En tu proyecto Laravel
cd vendor
mkdir -p aichadigital
cd aichadigital
ln -s ~/development/packages/lara-verifactu lara-verifactu
```

### Configuración Inicial

```bash
# Publicar configuración y migraciones
php artisan verifactu:install

# Configurar certificado digital en .env
VERIFACTU_ENVIRONMENT=sandbox
VERIFACTU_CERT_PATH=./certificates/tu_certificado.p12
VERIFACTU_CERT_PASSWORD=tu_password

# Probar conexión con AEAT
php artisan verifactu:test-connection
```

## 📚 Documentación

### Instalación y Configuración
- [📦 Guía de Instalación Detallada](INSTALLATION.md)
- [🔧 Configuración Avanzada](config/verifactu.php)

### Uso Básico
- [🚀 Primeros Pasos](CONTRIBUTING.md#desarrollo-local)
- [💡 Ejemplos de Uso](#uso-rápido)
- [📖 Changelog](CHANGELOG.md)

### Para Desarrolladores
- [🤝 Guía de Contribución](CONTRIBUTING.md)
- [🏗️ Arquitectura del Paquete](#arquitectura)
- [🧪 Testing](#testing)

## 💡 Uso Rápido

### Comandos Artisan

```bash
# Probar conexión y certificado AEAT
php artisan verifactu:test-connection
php artisan verifactu:test-connection --cert-info

# Registrar factura en AEAT
php artisan verifactu:register {invoice_id}
php artisan verifactu:register --all

# Reintentar envíos fallidos
php artisan verifactu:retry-failed

# Verificar integridad blockchain
php artisan verifactu:verify-blockchain

# Ver estado del sistema
php artisan verifactu:status
```

### Uso Programático

```php
use AichaDigital\LaraVerifactu\Facades\Verifactu;
use AichaDigital\LaraVerifactu\Models\Invoice;

// Registrar factura
$invoice = Invoice::find(1);
$registry = Verifactu::register($invoice);

// Verificar blockchain
$isValid = Verifactu::verifyBlockchain();

// Obtener registros pendientes
$pending = Verifactu::getPendingRegistries();
```

## 🏗️ Arquitectura

### Principios de Diseño

- **Contract-First**: Interfaces antes que implementaciones
- **Agnostic**: Funciona con cualquier modelo que implemente los contratos
- **SOLID**: Principios aplicados rigurosamente
- **Event-Driven**: Extensible mediante eventos Laravel

### Estructura del Paquete

```
lara-verifactu/
├── src/
│   ├── Contracts/          # Interfaces
│   ├── Models/             # Eloquent models (modo nativo)
│   ├── Services/           # Lógica de negocio
│   ├── Commands/           # Artisan commands
│   ├── Jobs/               # Queue jobs
│   ├── Events/             # Event classes
│   ├── Listeners/          # Event listeners
│   ├── Exceptions/         # Custom exceptions
│   ├── Enums/              # Enumerations
│   └── Support/            # Helper classes
├── tests/
│   ├── Unit/               # Unit tests
│   ├── Feature/            # Feature tests
│   └── Pest.php
├── config/
│   └── verifactu.php       # Configuración
├── database/
│   ├── migrations/         # Database migrations
│   └── factories/          # Model factories
└── resources/
    └── lang/               # Translations
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
composer test

# Tests con cobertura
composer test:coverage

# Análisis estático (PHPStan)
composer analyse

# Formatear código (Laravel Pint)
composer format

# Code quality (PHP Insights)
composer insights
```

### Estado Actual de Tests

- ✅ **120 tests passing**
- ✅ **Coverage: >85%**
- ✅ **PHPStan Level 8**
- ✅ **PSR-12 Code Style**

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este paquete está en desarrollo activo y **buscamos colaboradores** para:

- 🧪 Testing en entornos reales
- 📖 Mejorar documentación
- 🐛 Reportar bugs
- 💡 Sugerir mejoras
- 🔧 Implementar features

**Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md)** para detalles sobre nuestro proceso de desarrollo.

### Áreas que Necesitan Ayuda

1. **Testing en Sandbox AEAT**: Probar envíos reales al sandbox
2. **Casos de Uso**: Documentar diferentes escenarios de integración
3. **Modelos Personalizados**: Testing con modelos existentes en proyectos reales
4. **Performance**: Optimizaciones para alto volumen de facturas
5. **Documentación**: Ejemplos y guías de uso

## 🐛 Reportar Issues

Si encuentras un bug o tienes una sugerencia:

1. Busca si ya existe un [issue similar](https://github.com/AichaDigital/lara-verifactu/issues)
2. Si no existe, [crea uno nuevo](https://github.com/AichaDigital/lara-verifactu/issues/new)
3. Incluye:
   - Versión de Laravel
   - Versión de PHP
   - Descripción detallada del problema
   - Pasos para reproducir
   - Código de ejemplo si es posible

## 📝 Changelog

Consulta [CHANGELOG.md](CHANGELOG.md) para ver todos los cambios del proyecto.

## 🔒 Seguridad

Si descubres alguna vulnerabilidad de seguridad, por favor envía un email a **security@aichadigital.com** en lugar de usar el issue tracker.

## 📄 Licencia

The MIT License (MIT). Por favor, consulta [License File](LICENSE.md) para más información.

## 🙏 Créditos

- [Aicha Digital](https://github.com/AichaDigital)
- Basado en especificaciones de [AEAT Verifactu](https://www.agenciatributaria.es/)
- Inspirado en [Spatie Laravel Packages](https://spatie.be/open-source)
- [Todos los contribuidores](https://github.com/AichaDigital/lara-verifactu/contributors)

## 📞 Soporte

- 📧 Email: support@aichadigital.com
- 🐛 Issues: [GitHub Issues](https://github.com/AichaDigital/lara-verifactu/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AichaDigital/lara-verifactu/discussions)

---

<p align="center">
  <strong>⚠️ Recordatorio: Este paquete está en desarrollo activo y NO debe usarse en producción.</strong><br>
  <em>Release estable (v1.0.0) estimada para Q2 2025</em>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/AichaDigital">Aicha Digital</a>
</p>
