# Помощник для Laravel

[![Packagist Version](https://img.shields.io/packagist/v/maksde/support)](https://packagist.org/packages/maksde/support)
[![Packagist Downloads](https://img.shields.io/packagist/dt/maksde/support)](https://packagist.org/packages/maksde/support)
[![Packagist Dependency Version](https://img.shields.io/packagist/dependency-v/maksde/support/php)](https://packagist.org/packages/maksde/support)
[![Packagist Dependency Version](https://img.shields.io/packagist/dependency-v/maksde/support/laravel%2Fframework)](https://packagist.org/packages/maksde/support)
[![Packagist License](https://img.shields.io/packagist/l/maksde/support)](https://packagist.org/packages/maksde/support)

## Содержание

* [Установка](#установка)
* [Правила валидации для форм](#правила-валидации-для-форм)
  * [EmailValidate](#emailvalidate) - валидация почты
  * [PhoneValidate](#phonevalidate) - валидация российского телефона
  * [PhoneInternationalValidate](#phoneinternationalvalidate) - валидация международного телефона
  * [NameValidate](#namevalidate) - валидация имени/фамилии/отчества
  * [QuantityValidate](#quantityvalidate) - валидация количества
  * [DateValidate](#datevalidate) - валидация даты
  * [TimeValidate](#timevalidate) - валидация времени
  * [DateTimeValidate](#datetimevalidate) - валидация даты и времени
  * [ImageValidate](#imagevalidate) - валидация изображений
  * [VideoValidate](#videovalidate) - валидация видео
  * [DocumentValidate](#documentvalidate) - валидация документов
* [Форматирование даты и времени (TemporalFormat)](#форматирование-даты-и-времени-temporalformat)
* [Вспомогательные функции](#вспомогательные-функции)
* [Тестирование](#тестирование)

## Установка

Установить пакет с помощью Composer:
```bash
composer require maksde/support
```

Опубликовать файлы конфигурации:
```bash
php artisan vendor:publish --tag="support-config"
```

Опубликовать файлы перевода:
```bash
php artisan vendor:publish --tag="support-translations"
```

## Правила валидации для форм

Пакет предоставляет набор валидаторов для проверки различных типов данных с детальными сообщениями об ошибках на русском и английском языках.

### EmailValidate

Валидация адреса электронной почты с поддержкой латиницы и кириллицы.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\EmailValidate;

'email' => ['required', new EmailValidate],
```

**Регулярное выражение:**
```regex
/^(?!\.)(?!.*\.\.)([A-Za-zА-Яа-яЁё0-9_'+\-\.]*)([A-Za-zА-Яа-яЁё0-9_+-])@([A-Za-zА-Яа-яЁё0-9]([A-Za-zА-Яа-яЁё0-9-]*[A-Za-zА-Яа-яЁё0-9])?\.)+[A-Za-zА-Яа-яЁё]{2,}$/u
```

**Что проверяет регулярное выражение:**

1. **Структура и базовые правила:**
   - `(?!\.)` - не должен начинаться с точки
   - `(?!.*\.\.)` - не должно быть двух точек подряд (в любом месте)
   - `@` - обязательный разделитель между локальной и доменной частью

2. **Локальная часть (до @):**
   - `([A-Za-zА-Яа-яЁё0-9_'+\-\.]*)`  - может содержать:
     - Латинские буквы: `A-Z`, `a-z`
     - Кириллические буквы: `А-Я`, `а-я`, `Ё`, `ё`
     - Цифры: `0-9`
     - Специальные символы: `_`, `'`, `+`, `-`, `.`
   - `([A-Za-zА-Яа-яЁё0-9_+-])` - должна заканчиваться буквой, цифрой или `_`, `+`, `-` (НЕ точкой)

3. **Доменная часть (после @):**
   - `([A-Za-zА-Яа-яЁё0-9]([A-Za-zА-Яа-яЁё0-9-]*[A-Za-zА-Яа-яЁё0-9])?\.)+` - каждый уровень домена:
     - Должен начинаться с буквы или цифры
     - Должен заканчиваться буквой или цифрой (НЕ дефисом)
     - Может содержать дефисы только в середине
     - Заканчивается точкой (для разделения уровней)
     - Может повторяться для поддоменов (`mail.example.com`)

4. **Доменная зона (TLD):**
   - `[A-Za-zА-Яа-яЁё]{2,}` - минимум 2 буквы (латиница или кириллица)

5. **Дополнительные проверки длины:**
   - Общая длина email ≤ 255 символов
   - Локальная часть ≤ 64 символа
   - Доменная часть ≤ 253 символа

6. **Проверка валидности доменной зоны (TLD):**
   - Проверка осуществляется через класс `DomainZone`
   - Поддерживаются все официальные TLD (более 1300 зон)
   - Включая кириллические: `.рф`, `.бел`, `.срб`, `.укр`, `.рус`

> 📖 **Детальная документация:**  
> - [Анализ валидации Email](docs/EMAIL_VALIDATION_ANALYSIS.md) - разбор регулярного выражения и результаты тестирования  
> - [Тестовые случаи Email](docs/EMAIL_TEST_CASES.md) - полный список валидных и невалидных email (~350 примеров)

---

### PhoneValidate

Валидация российского номера телефона.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\PhoneValidate;

'phone' => ['required', new PhoneValidate],
```

**Проверки:**
- Должен начинаться с `+7`
- Содержать ровно 11 цифр (настраивается в конфиге)
- Формат: `+71234567890`

**Типы ошибок:**
- `phone.start` - номер не начинается с +7
- `phone.length` - неверное количество цифр
- `phone.format` - неверный формат номера

---

### PhoneInternationalValidate

Валидация международного номера телефона.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\PhoneInternationalValidate;

'international_phone' => ['required', new PhoneInternationalValidate],
```

**Проверки:**
- Должен начинаться с `+`
- Содержать от 7 до 15 цифр (настраивается в конфиге)
- Формат: `+1234567890`

**Типы ошибок:**
- `phone_international.start` - номер не начинается с +
- `phone_international.min` - меньше минимального количества цифр
- `phone_international.max` - больше максимального количества цифр
- `phone_international.format` - неверный формат номера

---

### NameValidate

Валидация имени, фамилии, отчества.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\NameValidate;

'first_name' => ['required', new NameValidate],
'last_name' => ['required', new NameValidate],
'middle_name' => ['nullable', new NameValidate],
```

**Проверки:**
- Максимальная длина: 50 символов (настраивается в конфиге)
- Разрешены: кириллица, латиница, дефис `-`, пробел, апостроф `'`
- Запрещены: цифры и другие спецсимволы
- Не может содержать только пробелы, дефисы или апострофы

**Типы ошибок:**
- `name.max_length` - превышена максимальная длина
- `name.invalid_characters` - недопустимые символы
- `name.empty` - содержит только пробелы/дефисы/апострофы

---

### QuantityValidate

Валидация количества (целое число с возможностью указания минимального и максимального значения).

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\QuantityValidate;

// По умолчанию: min = 0, max = без ограничения
'quantity' => ['required', new QuantityValidate()],

// Количество от 1 до 100
'items_count' => ['required', new QuantityValidate(min: 1, max: 100)],

// Только минимальное значение (от 10 и выше)
'age' => ['required', new QuantityValidate(min: 10)],

// Только максимальное значение (до 1000)
'discount' => ['required', new QuantityValidate(max: 1000)],

// Без минимального ограничения (можно отрицательные числа)
'temperature' => ['required', new QuantityValidate(min: null, max: 100)],
```

**Проверки:**
- Должно быть целым числом
- Не должно содержать символы `e`, `E`, `+`, `-`
- Если указан `min` - значение должно быть >= min (по умолчанию min = 0)
- Если указан `max` - значение должно быть <= max (по умолчанию без ограничения)

**Параметры конструктора:**
- `min` (int|null) - минимальное значение (по умолчанию `0`). Если `null`, то минимальное ограничение отсутствует
- `max` (int|null) - максимальное значение (по умолчанию `null` - без ограничения)

**Типы ошибок:**
- `quantity.forbidden_characters` - содержит запрещенные символы (e, E, +, -)
- `quantity.not_integer` - не является целым числом
- `quantity.min` - значение меньше минимального
- `quantity.max` - значение больше максимального

---

### DateValidate

Валидация даты с возможностью ограничения по времени (прошлое/будущее).

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\DateValidate;

// Любая дата (по умолчанию)
'date' => ['required', new DateValidate],

// Только будущие даты (например, дата события)
'event_date' => ['required', new DateValidate('future')],

// Только прошлые даты (например, дата рождения)
'birth_date' => ['required', new DateValidate('past')],

// С указанием опорной даты для сравнения (вместо текущей)
'deadline' => ['required', new DateValidate('future', '2025-06-01')],
// Дата должна быть позже 2025-06-01

'archive_date' => ['required', new DateValidate('past', '2025-12-31')],
// Дата должна быть раньше 2025-12-31
```

**Проверки:**
- Дата должна соответствовать формату из конфига (по умолчанию `Y-m-d`)
- Формат: `2025-04-16`
- Если указан параметр `'future'` - дата должна быть в будущем (строго больше опорной)
- Если указан параметр `'past'` - дата должна быть в прошлом (строго меньше опорной)
- Если параметр не указан (`null`) - любая корректная дата допустима

**Параметры конструктора:**
- `timeConstraint` (string|null) - ограничение по времени: `'future'` (будущее), `'past'` (прошлое), `null` (любая дата)
- `referenceDate` (string|null) - опорная дата для сравнения (формат `Y-m-d`). Если `null`, используется текущая дата

**Типы ошибок:**
- `date.format` - неверный формат даты
- `date.future` - дата не в будущем (при использовании ограничения `'future'`)
- `date.past` - дата не в прошлом (при использовании ограничения `'past'`)

---

### TimeValidate

Валидация времени с возможностью ограничения (прошлое/будущее относительно опорного момента).

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\TimeValidate;

// Любое время (по умолчанию)
'time' => ['required', new TimeValidate],

// Только будущее время (позже текущего времени)
'meeting_time' => ['required', new TimeValidate('future')],

// Только прошлое время (раньше текущего времени)
'completed_time' => ['required', new TimeValidate('past')],

// С указанием опорного времени для сравнения (вместо текущего)
'appointment_time' => ['required', new TimeValidate('future', '14:00:00')],
// Время должно быть позже 14:00:00

'break_time' => ['required', new TimeValidate('past', '18:00:00')],
// Время должно быть раньше 18:00:00
```

**Проверки:**
- Время должно соответствовать формату из конфига (по умолчанию `H:i:s`)
- Формат: `23:59:59`
- Если указан параметр `'future'` - время должно быть в будущем (строго больше опорного времени)
- Если указан параметр `'past'` - время должно быть в прошлом (строго меньше опорного времени)
- Если параметр не указан (`null`) - любое корректное время допустимо

**Параметры конструктора:**
- `timeConstraint` (string|null) - ограничение по времени: `'future'` (будущее), `'past'` (прошлое), `null` (любое время)
- `referenceTime` (string|null) - опорное время для сравнения (формат `H:i:s`). Если `null`, используется текущее время

**Типы ошибок:**
- `time.format` - неверный формат времени
- `time.future` - время не в будущем (при использовании ограничения `'future'`)
- `time.past` - время не в прошлом (при использовании ограничения `'past'`)

---

### DateTimeValidate

Валидация даты и времени с возможностью ограничения (прошлое/будущее).

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\DateTimeValidate;

// Любая дата и время (по умолчанию)
'datetime' => ['required', new DateTimeValidate],

// Только будущие дата и время (например, время начала мероприятия)
'start_datetime' => ['required', new DateTimeValidate('future')],

// Только прошлые дата и время (например, время завершения задачи)
'completed_at' => ['required', new DateTimeValidate('past')],

// С указанием опорной даты-времени для сравнения (вместо текущей)
'event_start' => ['required', new DateTimeValidate('future', '2025-06-15 12:00:00')],
// Дата-время должны быть позже 2025-06-15 12:00:00

'log_entry' => ['required', new DateTimeValidate('past', '2025-12-31 23:59:59')],
// Дата-время должны быть раньше 2025-12-31 23:59:59
```

**Проверки:**
- Дата и время должны соответствовать формату из конфига (по умолчанию `Y-m-d H:i:s`)
- Формат: `2025-04-16 23:59:59`
- Если указан параметр `'future'` - дата и время должны быть в будущем (строго больше опорного момента)
- Если указан параметр `'past'` - дата и время должны быть в прошлом (строго меньше опорного момента)
- Если параметр не указан (`null`) - любые корректные дата и время допустимы

**Параметры конструктора:**
- `timeConstraint` (string|null) - ограничение по времени: `'future'` (будущее), `'past'` (прошлое), `null` (любая дата и время)
- `referenceDateTime` (string|null) - опорная дата-время для сравнения (формат `Y-m-d H:i:s`). Если `null`, используется текущий момент

**Типы ошибок:**
- `datetime.format` - неверный формат даты и времени
- `datetime.future` - дата и время не в будущем (при использовании ограничения `'future'`)
- `datetime.past` - дата и время не в прошлом (при использовании ограничения `'past'`)

---

### ImageValidate

Валидация загружаемых изображений. Проверяет расширение файла, MIME-тип и размер.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\ImageValidate;

// Использование с настройками по умолчанию из конфига
'image' => ['required', 'file', new ImageValidate],

// Переопределение параметров
'avatar' => ['required', 'file', new ImageValidate(
    extensions: ['jpg', 'png'],           // только JPG и PNG
    mimes: ['image/jpeg', 'image/png'],   // соответствующие MIME-типы
    maxSize: 5120                         // 5 MB в килобайтах
)],
```

**Проверки:**
- Расширение файла должно быть одним из разрешенных (по умолчанию: `jpg`, `jpeg`, `png`, `heic`, `webp`)
- MIME-тип файла должен соответствовать одному из разрешенных (по умолчанию: `image/jpeg`, `image/png`, `image/heic`, `image/webp`)
- Размер файла не должен превышать максимальный (по умолчанию: 10 МБ / 10240 KB)
- Проверка MIME-типа гарантирует, что расширение файла соответствует его реальному содержимому

**Параметры конструктора:**
- `extensions` (array|null) - массив разрешенных расширений файла. Если `null`, берутся значения из конфига
- `mimes` (array|null) - массив разрешенных MIME-типов. Если `null`, берутся значения из конфига
- `maxSize` (int|null) - максимальный размер файла в килобайтах. Если `null`, берется значение из конфига

**Настройки в конфиге:**
```php
'validate' => [
    'file' => [
        'image' => [
            'extensions' => ['jpg', 'jpeg', 'png', 'heic', 'webp'],
            'mimes' => ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
            'max_size' => 10240, // KB (10 MB)
        ],
    ],
],
```

**Типы ошибок:**
- `image.extension` - файл имеет недопустимое расширение
- `image.mime` - MIME-тип файла не соответствует разрешенным (файл не является изображением или подделан)
- `image.size` - размер файла превышает максимально допустимый

---

### VideoValidate

Валидация загружаемых видеофайлов. Проверяет расширение файла, MIME-тип и размер.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\VideoValidate;

// Использование с настройками по умолчанию из конфига
'video' => ['nullable', 'file', new VideoValidate],

// Переопределение параметров
'promo_video' => ['required', 'file', new VideoValidate(
    extensions: ['mp4'],                  // только MP4
    mimes: ['video/mp4'],                 // только video/mp4
    maxSize: 51200                        // 50 MB в килобайтах
)],
```

**Проверки:**
- Расширение файла должно быть одним из разрешенных (по умолчанию: `mp4`, `webm`, `hevc`)
- MIME-тип файла должен соответствовать одному из разрешенных (по умолчанию: `video/mp4`, `video/webm`, `video/h265`)
- Размер файла не должен превышать максимальный (по умолчанию: 20 МБ / 20480 KB)
- Проверка MIME-типа гарантирует, что расширение файла соответствует его реальному содержимому

**Параметры конструктора:**
- `extensions` (array|null) - массив разрешенных расширений файла. Если `null`, берутся значения из конфига
- `mimes` (array|null) - массив разрешенных MIME-типов. Если `null`, берутся значения из конфига
- `maxSize` (int|null) - максимальный размер файла в килобайтах. Если `null`, берется значение из конфига

**Настройки в конфиге:**
```php
'validate' => [
    'file' => [
        'video' => [
            'extensions' => ['mp4', 'webm', 'hevc'],
            'mimes' => ['video/mp4', 'video/webm', 'video/h265'],
            'max_size' => 20480, // KB (20 MB)
        ],
    ],
],
```

**Типы ошибок:**
- `video.extension` - файл имеет недопустимое расширение
- `video.mime` - MIME-тип файла не соответствует разрешенным (файл не является видео или подделан)
- `video.size` - размер файла превышает максимально допустимый

---

### DocumentValidate

Валидация загружаемых документов. Проверяет расширение файла, MIME-тип и размер.

**Пример использования:**
```php
use Maksde\Support\Contracts\Validation\DocumentValidate;

// Использование с настройками по умолчанию из конфига
'document' => ['nullable', 'file', new DocumentValidate],

// Переопределение параметров
'contract' => ['required', 'file', new DocumentValidate(
    extensions: ['pdf'],                  // только PDF
    mimes: ['application/pdf'],           // только application/pdf
    maxSize: 20480                        // 20 MB в килобайтах
)],

// Только Excel файлы
'report' => ['required', 'file', new DocumentValidate(
    extensions: ['xlsx'],
    mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    maxSize: 15360  // 15 MB
)],
```

**Проверки:**
- Расширение файла должно быть одним из разрешенных (по умолчанию: `docx`, `xlsx`, `pdf`)
- MIME-тип файла должен соответствовать одному из разрешенных (по умолчанию: MIME-типы для Word, Excel и PDF)
- Размер файла не должен превышать максимальный (по умолчанию: 10 МБ / 10240 KB)
- Проверка MIME-типа гарантирует, что расширение файла соответствует его реальному содержимому

**Параметры конструктора:**
- `extensions` (array|null) - массив разрешенных расширений файла. Если `null`, берутся значения из конфига
- `mimes` (array|null) - массив разрешенных MIME-типов. Если `null`, берутся значения из конфига
- `maxSize` (int|null) - максимальный размер файла в килобайтах. Если `null`, берется значение из конфига

**Настройки в конфиге:**
```php
'validate' => [
    'file' => [
        'document' => [
            'extensions' => ['docx', 'xlsx', 'pdf'],
            'mimes' => [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // XLSX
                'application/pdf',                                                          // PDF
            ],
            'max_size' => 10240, // KB (10 MB)
        ],
    ],
],
```

**Типы ошибок:**
- `document.extension` - файл имеет недопустимое расширение
- `document.mime` - MIME-тип файла не соответствует разрешенным (файл не является документом поддерживаемого типа или подделан)
- `document.size` - размер файла превышает максимально допустимый

**Поддерживаемые типы документов:**
- **DOCX** - Microsoft Word документы (.docx)
- **XLSX** - Microsoft Excel таблицы (.xlsx)
- **PDF** - PDF документы (.pdf)

---

## Форматирование даты и времени (TemporalFormat)

Класс `Maksde\Support\Formation\TemporalFormat` переводит дату/время между timezone и форматами при сохранении в БД и при выводе (в т.ч. в API). Форматы задаются в конфиге: `support.storage.format.*`, `support.view.format.*`, `support.api.format.*`.

### Сохранение (forStorage)

Подготовка значения к записи в БД. Для **date** применяется только форматирование (календарная дата без timezone). Для **time** и **datetime** значение из указанной timezone переводится в UTC.

```php
use Maksde\Support\Formation\TemporalFormat;

// Дата — только формат, timezone не используется
TemporalFormat::forStorage('2025-12-31', 'date', 'Europe/Moscow'); // '2025-12-31'

// Время и datetime — из timezone приложения в UTC
TemporalFormat::forStorage('10:00:00', 'time', config('app.timezone'));
TemporalFormat::forStorage('2025-12-31 10:00:00', 'datetime', config('app.timezone'));
```

**Сигнатура:** `forStorage(?string $value, 'date'|'time'|'datetime' $type, string $fromTimezone = 'UTC'): ?string`

### Вывод (forOutput)

Подготовка значения из БД к показу или к отдаче в API. Для **date** — только форматирование. Для **time** и **datetime** — перевод из UTC в целевую timezone и формат.

```php
use Maksde\Support\Formation\TemporalFormat;

// Дата — только формат
TemporalFormat::forOutput('2025-12-31', 'date', 'UTC', config('support.api.format.date'));

// Время и datetime — из UTC в нужную timezone и формат
TemporalFormat::forOutput($timeFromDb, 'time', 'UTC', 'H:i:s');
TemporalFormat::forOutput($datetimeFromDb, 'datetime', 'UTC', config('support.api.format.datetime'));
```

**Сигнатура:** `forOutput(?string $value, 'date'|'time'|'datetime' $type, string $toTimezone = 'UTC', ?string $format = null): ?string`

Для типа **time** значение в БД хранится как время с якорной датой; при разборе используется та же логика, что и в `forStorage`.

---

## Вспомогательные функции

### urlFront($path)

Формирование полного пути к файлу из storage для использования на фронтенде.

**Пример использования:**
```php
$imageUrl = urlFront('images/avatar.jpg');
// Вернёт полный URL: https://example.com/storage/images/avatar.jpg
```

---

## Тестирование

Пакет содержит полный набор unit-тестов для всех валидаторов.

### Запуск тестов

```bash
# Все тесты
composer test

# Конкретный тест
./vendor/bin/phpunit tests/Unit/EmailValidateTest.php

# С отчетом о покрытии кода
composer test:coverage
```

### Структура тестов

```
tests/
└── Unit/
    ├── EmailValidateTest.php
    ├── PhoneValidateTest.php
    ├── PhoneInternationalValidateTest.php
    ├── NameValidateTest.php
    ├── QuantityValidateTest.php
    ├── DateValidateTest.php
    ├── TimeValidateTest.php
    ├── DateTimeValidateTest.php
    ├── ImageValidateTest.php
    ├── VideoValidateTest.php
    └── DocumentValidateTest.php
```

Подробнее о тестах см. в [tests/README.md](tests/README.md).

---

## Лицензия

Этот пакет является открытым программным обеспечением, лицензированным по [лицензии MIT](LICENSE.md).