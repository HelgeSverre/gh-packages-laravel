# LanguageTypos Laravel Edition
Пакет для Laravel, позволяющий проводить исправление в тексте опечаток из-за неверной раскладки клавиатуры для русского и английского языка. 
Т.е. исправление скрытых латинских букв среди кириллических и наоборот.

Исходный пакет: https://github.com/rin-nas/language-typos

## Установка
```shell
composer require "coolycow/laravel-language-typos"
```
Далее:
```shell
php artisan vendor:publish --provider="Coolycow\LaravelLanguageTypos\LanguageTyposServiceProvider"
```

## Примеры использования
```shell
use Coolycow\LanguageTypos\LanguageTypos;
...
LanguageTypos::keyboardLayoutConvert($searchQuery, 'ru', 'en');
LanguageTypos::keyboardLayoutConvert($searchQuery, 'en', 'ru');
```

## Примеры исправлений
```text
RU => EN:
'Руддщ' => 'Hello',
'Руддщ цщкдв' => 'Hello world',

EN => RU:
'~;br' => 'Ёжик',
'Djn ghbvth ckjdjcjxtnfybz' => 'Вот пример словосочетания'
```