# ЛитРес — Панель издательства

![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-3-4E56A6)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Лицензия](https://img.shields.io/badge/Лицензия-MIT-green)

Локальная панель управления для публикации книг на **ЛитРес Самиздат**. Загрузка книг, отслеживание модерации, управление авторами и сериями.

## Возможности

### Управление книгами
- Полные метаданные: название, аннотация, жанры (до 4), теги, язык, возрастной рейтинг, цена, ISBN
- Классификаторы: УДК, ББК
- Связанные книги (продолжение, приквел, переиздание и др.)

### Загрузка на ЛитРес
- **3-шаговый конвейер**: отправка XML метаданных → загрузка обложки → загрузка файла книги
- Поддержка форматов: FB2 (через HTTP), PDF (через FTP)
- Автоматические повторные попытки при ошибках

### Авторы
- CRUD с поддержкой русских падежных форм (6 падежей: именительный, родительный, дательный, винительный, творительный, предложный)
- Роли: автор, соавтор, переводчик, иллюстратор, составитель, редактор, чтец

### Серии
- Управление сериями с нумерацией книг

### Отслеживание статусов
- Автоматический опрос API каждые 5 минут через планировщик Windows
- Статусы: черновик → на модерации → опубликовано / ошибка / отклонено
- Резервный опрос через `partner_release_status`

### Пакетный импорт
- Загрузка Excel (.xlsx) + ZIP с файлами книг
- Массовое создание черновиков

### Статистика продаж
- Получение статистики из API ЛитРес

### Кэш справочников
- Дерево жанров (из `/genres_list_2/`)
- Список тегов (из `/get_litres_keywords/`)
- Сетка цен (из `/static/ds/price_grid.xml`)

## Установка

### Требования
- PHP 8.2+
- Composer
- SQLite
- Windows (для планировщика задач) или Linux (с cron)

### Шаги

```bash
git clone https://github.com/al-nemirov/litres-publisher-panel.git
cd litres-publisher-panel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

## Настройка

Отредактируйте `.env` — укажите ваши ключи ЛитРес Самиздат:

```env
LITRES_PARTNER_ID=ваш_partner_id
LITRES_SECRET_KEY=ваш_secret_key
LITRES_OWNER_ID=ваш_owner_id
LITRES_BASE_UUID=ваш_base_uuid
LITRES_FTP_USER=ваш_ftp_логин
LITRES_FTP_PASS=ваш_ftp_пароль
```

Получить ключи можно в [Партнёрской панели ЛитРес Самиздат](https://sp.litres.ru).

## Запуск

```bash
php artisan serve
```

Откройте http://localhost:8000 в браузере.

### Автозапуск на Windows

```bash
# Установка задач в планировщик (запустить от имени администратора)
setup-scheduler.bat
```

Устанавливает две задачи:
- **CheckStatuses** — опрос API ЛитРес каждые 5 минут
- **StartPanel** — автозапуск панели при входе в Windows

## Интеграция с API ЛитРес

### Эндпоинты

| Эндпоинт | Назначение |
|----------|------------|
| `partner_object_update` | Создание/обновление книги, автора, серии |
| `partner_cover_upload` | Загрузка обложки |
| `partner_fb2_upload` | Загрузка FB2 файла |
| FTP `ftp.litres.ru` | Загрузка PDF файлов |
| `partner_update_log` | Опрос статусов модерации |
| `partner_release_status` | Проверка статуса конкретной книги |
| `genres_list_2` | Получение дерева жанров |
| `get_litres_keywords` | Получение тегов |
| `partner_stats` | Статистика продаж |

### Аутентификация

Каждый запрос подписывается SHA-256:
```
sha256(timestamp + ':' + secret_key + ':' + partner_id)
```
- Временная метка: ISO 8601, московское время
- Окно валидности: 300 секунд
- Каждая метка одноразовая

### Формат метаданных книги

```xml
<art_to_update name="Название" uuid="..." owner="..." price="149.00" adult="16" type="fb2">
  <title-info>
    <genre>fiction</genre>                    <!-- 1-4 жанра, обязательно -->
    <annotation><p>Текст аннотации</p></annotation>
    <item-relations>
      <person uuid="..." relation="author"/>
    </item-relations>
    <item-series>
      <related-serie uuid="..." number="1"/>
    </item-series>
    <art_tags>
      <tag uuid="..."/>
    </art_tags>
    <lang>ru</lang>
  </title-info>
</art_to_update>
```

> **Важно**: порядок элементов в `<title-info>` строго фиксирован (XSD): genre → annotation → title-relations → item-relations → item-series → art_tags → lang → src-lang → udc → bbk

### Известные особенности API

- `<annotation>` обязательно оборачивать в `<p>`, `<ol>` или `<ul>` — голый текст вызывает ошибку XSD (102032)
- Максимум 4 элемента `<genre>` на книгу
- `price` и `adult` — обязательные атрибуты
- EPUB загрузка не работает на стороне ЛитРес (~1 МБ лимит nginx) — используйте FB2 или PDF
- `partner_update_log` хранит данные 48 часов — для более старых используйте `partner_release_status`
- Теги привязаны к UUID ЛитРес — необходимо кэшировать через `/get_litres_keywords/`

## Архитектура

```
litres-publisher-panel/
├── app/
│   ├── Console/Commands/           # Artisan-команды
│   │   ├── CheckReleaseStatuses    # Опрос статусов модерации
│   │   ├── ProcessUploads          # Пакетная обработка загрузок
│   │   ├── RefreshLitresCache      # Обновление кэша жанров/тегов
│   │   ├── MigrateFromLegacy       # Миграция из MySQL (для перехода со старой системы)
│   │   └── FixBookStatuses         # Коррекция статусов
│   ├── Http/Controllers/           # Веб-контроллеры
│   │   ├── BookController          # CRUD книг + загрузка
│   │   ├── PersonController        # CRUD авторов
│   │   ├── SeriesController        # CRUD серий
│   │   ├── BatchController         # Пакетный импорт Excel+ZIP
│   │   └── StatisticsController    # Статистика продаж
│   ├── Jobs/
│   │   └── ProcessBookUpload       # 3-шаговая асинхронная загрузка
│   ├── Models/                     # Eloquent модели
│   │   ├── Book, Person, Series
│   │   └── LitresGenre, LitresTag, LitresPrice
│   └── Services/                   # Интеграция с API ЛитРес
│       ├── LitresApiService        # HTTP/FTP транспорт + аутентификация
│       ├── LitresApiResponse       # Парсер XML ответов
│       └── LitresXmlBuilder        # Сборщик XML запросов
├── config/litres.php               # Конфигурация API (читает из .env)
├── database/migrations/            # Схема SQLite
└── resources/views/                # Blade шаблоны
```

## Лицензия

[MIT](LICENSE)

## Автор

**Alexander Nemirov** — [GitHub](https://github.com/al-nemirov)
