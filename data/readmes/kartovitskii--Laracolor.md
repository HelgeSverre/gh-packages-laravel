# 🎨 Laracolor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kartovitskii/laracolor.svg?style=flat-square)](https://packagist.org/packages/kartovitskii/laracolor)
[![Total Downloads](https://img.shields.io/packagist/dt/kartovitskii/laracolor.svg?style=flat-square)](https://packagist.org/packages/kartovitskii/laracolor)
[![License](https://img.shields.io/packagist/l/kartovitskii/laracolor.svg?style=flat-square)](https://packagist.org/packages/kartovitskii/laracolor)
[![PHP Version](https://img.shields.io/packagist/php-v/kartovitskii/laracolor.svg?style=flat-square)](https://packagist.org/packages/kartovitskii/laracolor)

**Laracolor** - это элегантный пакет для Laravel, который генерирует консистентные цвета на основе любой строки. Идеально подходит для создания цветных аватарок, тегов, категорий и других элементов интерфейса.

## ✨ Особенности

- 🎯 **Консистентная генерация** - одинаковый ввод всегда дает одинаковый цвет
- 🎨 **8 готовых палитр** - от пастельных до ярких
- ⚙️ **Гибкая настройка** - кастомные диапазоны saturation и lightness
- 🌈 **HSL и RGB поддержка** - работайте с цветами в любом формате
- 🎭 **Контрастные цвета** - автоматический подбор цвета текста
- 📊 **Генерация градиентов** - создавайте цветовые схемы
- 🚀 **Кэширование** - оптимизация производительности
- 🔧 **Configurable** - настройка через .env и конфиг

## 📦 Установка

Установите пакет через Composer:

```bash
composer require kartovitskii/laracolor
```

### Публикация конфигурации

```bash
php artisan vendor:publish --provider="Kartovitskii\Laracolor\ColorServiceProvider" --tag="laracolor-config"
```

## 🚀 Быстрый старт

### Базовое использование
```php
use Kartovitskii\Laracolor\Facades\Laracolor;

// Генерация цвета для пользователя
$color = Laracolor::fromString('john.doe@example.com');
// Результат: #d4b8b8 (пастельно-розовый)

// Для аватарок пользователей
$userColor = Laracolor::fromString(auth()->user()->email);
```

### В Blade шаблонах
```php
<div class="user-avatar" style="background-color: {{ Laracolor::fromString($user->email) }}">
    {{ substr($user->name, 0, 1) }}
</div>

<!-- С контрастным текстом -->
<div class="user-avatar" style="background-color: {{ Laracolor::fromString($user->email) }}; 
    color: {{ Laracolor::getContrastColor($user->email) }}">
    {{ substr($user->name, 0, 1) }}
</div>
```

## 🎨 Палитры

Laracolor поддерживает 8 различных палитр:

| Палитра | Описание                             | Пример |
|---------|--------------------------------------| ----- |
| `pastel` | Мягкие, приглушенные тона            | 🎨 `#d4b8b8`, `#b8d4c8` |
| `vibrant` | Насыщенные, яркие цвета              | 🎨 `#ff6b6b`, `#4ecdc4` |
| `dark` | Темные, глубокие оттенки             | 	🎨 `#2c3e50`, `#34495e` |
| `light` | Светлые, воздушные тона              | 🎨 `#f8f9fa`, `#e9ecef` |
| `muted` | Спокойные, неброские цвета           | 🎨 `#95a5a6`, `#7f8c8d` |
| `warm` | Теплые оттенки (красные, оранжевые)  | 	🎨 `#e67e22`, `#d35400` |
| `cold` | Холодные тона (синие, фиолетовые) | 🎨 `#3498db`, `#9b59b6` |
| `random` | Полностью случайные цвета | |

### Использование палитр

```php
// Пастельные тона (по умолчанию)
$pastel = Laracolor::fromString('user1');

// Яркие цвета
$vibrant = Laracolor::setPalette('vibrant')->fromString('user2');

// Теплые оттенки
$warm = Laracolor::setPalette('warm')->fromString('user3');
```

## 📚 Документация

#### `fromString(string $string): string`

Генерирует HEX-цвет на основе строки.
```php
$hex = Laracolor::fromString('hello world'); // #c4d4b8
```

#### `toRgb(string $string): array`

Возвращает RGB значения.
```php
$rgb = Laracolor::toRgb('hello world');
// ['red' => 196, 'green' => 212, 'blue' => 184]
```

#### `toHsl(string $string): array`

Возвращает HSL значения.
```php
$hsl = Laracolor::toHsl('hello world');
// ['hue' => 85.71, 'saturation' => 45.5, 'lightness' => 82.5]
```

### Дополнительные методы

#### `getContrastColor(string $string): string`

Возвращает черный или белый цвет для контрастного текста.
```php
$bgColor = Laracolor::fromString('user');
$textColor = Laracolor::getContrastColor('user');
// Используйте $textColor для текста на фоне $bgColor
```

#### `getGradient(string $string, int $steps = 5): array`

Генерирует градиент из указанного количества цветов.
```php
$gradient = Laracolor::getGradient('brand', 5);
// ['#8ba3c7', '#9bb3d7', '#abc3e7', '#bbd3f7', '#cbe3ff']
```

### Настройка палитр

#### Через методы
```php
$customColor = Laracolor::setSaturationRange(40, 60)
    ->setLightnessRange(50, 70)
    ->setHueOffset(120) // смещение оттенка
    ->fromString('custom');
```

#### Через конфигурацию

```php
// config/laracolor.php
'custom_ranges' => [
    'saturation' => [
        'min' => 40,
        'max' => 60,
    ],
    'lightness' => [
        'min' => 50,
        'max' => 70,
    ],
],
```

## ⚡ Кэширование

Включите кэширование для улучшения производительности:
```dotenv
LARACOLOR_CACHE_ENABLED=true
LARACOLOR_CACHE_TTL=3600
```