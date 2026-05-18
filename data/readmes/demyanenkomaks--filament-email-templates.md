# Редактор шаблонов электронных писем для Filament 3.0

## Установка

Установить пакет с помощью Composer.
```bash
composer require maksde/filament-email-templates
```

Выполнение команды установки. Опубликует файлы конфигураций, миграций в ваше приложение.
```bash
php artisan filament-email-templates:install
```

Опубликовать файлы конфигураций.
```bash
php artisan vendor:publish --tag="filament-email-templates-config"
```

Опубликовать файлы переводов.
```bash
 php artisan vendor:publish --tag="filament-email-templates-translations"
```

Опубликовать файлы миграций.
```bash
php artisan vendor:publish --tag="filament-email-templates-migrations"
```

## Добавление плагина

Добавить плагин в панель с помощью метода `plugins()` в `app/Providers/Filament/AdminPanelProvider.php`:

```php
use Maksde\FilamentEmailTemplates\FilamentEmailTemplatesPlugin;
 
public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugins([
            FilamentEmailTemplatesPlugin::make(),
            // ...
        ]);
}
```

## Настройка навигации

В конфигурационном файле `config/filament-email-templates.php` навигацию можно отключить/включить

```php
    /**
     * Параметры навигации панели администратора
     */
    'navigation' => [
        'enabled' => true,
        'templates' => [
            'sort' => 10,
            'label' => 'Шаблоны электронных писем',
            'icon' => 'heroicon-o-envelope',
            'group' => 'Контент',
            'cluster' => false,
            'position' => SubNavigationPosition::Top,
        ],
    ],
```

## Переводы

Каждый шаблон электронного письма идентифицируется ключом и языком:

- **Ключ**: `email-template-key`
- **Язык**: `ru`

Это позволяет выбирать соответствующий шаблон на основе языковых настроек пользователя. Для реализации этой возможности вам потребуется сохранить предпочитаемый пользователем язык.

Обратите внимание, что в локали Laravel по умолчанию установлено значение `en`, а плагине `ru`. Если необходимо разделять британский и американский английский, можно использовать en_GB и en_US, но вы можете задать это значение по своему усмотрению.

Языки, которые должны отображаться в окне выбора языка, можно задать в конфигурации.

```php
    /**
     * Языки для которых будут заводиться шаблоны электронного письма.
     */
    'languages' => [
        'ru' => 'Русский',
        //        'en_GB' => 'British',
        //        'en_US' => 'USA',
    ],
```

## Создание новых почтовых классов

Используем отдельный класс Mailable для каждого типа письма. Это означает, что при создании нового шаблона в панели администратора потребуется новый PHP-класс. Пакет предоставляет действие для создания класса, если файл отсутствует в папке `app/Mail/Maksde/EmailTemplates`.

Созданные классы будут использовать свойство BuildGenericEmail.

```php
<?php

namespace App\Mail\Maksde\EmailTemplates;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Maksde\FilamentEmailTemplates\Traits\BuildGenericEmail;

class EmailTemplateKey extends Mailable
{
    use BuildGenericEmail;
    use Queueable;
    use SerializesModels;

    public string $template = 'email-template-key';

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(
        public array $data
    ) {}
}
```
Содержание шаблона заполняется с помощью [Blade Templates](https://laravel.com/docs/12.x/blade)

По примеру `Mail::to($record->email)->send(new EmailTemplateKey(['record' => $record]));` в шаблоне можно использовать `{{ $record->name }}`, если `$record` объект


## Добавление вложений

Здесь вы можете увидеть, как передать вложение:

Вложение следует передать в класс Mail и сделать общедоступным.
```php
class EmailTemplateKey extends Mailable
{
    use BuildGenericEmail;
    use Queueable;
    use SerializesModels;

    public string $template = 'email-template-key'; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(
        public array $data, 
        public Invoice $invoice
    )
    {
        $this->attachment = $invoice->getPdf(); 
    }
}
```
## Добавление политики доступов при использовании пакета bezhansalleh/filament-shield

Создание политики консольной командой

```bash
php artisan shield:generate --resource=EmailTemplateResource
```

Зарегистрировать поликику в `app/Providers/AppServiceProvider.php`

```php
    public function boot(): void
    {
        Gate::policy(EmailTemplate::class, EmailTemplatePolicy::class);
        // ...
    }
```
