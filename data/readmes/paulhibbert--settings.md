# A Laravel Settings package

This package is mainly for personal use, not on packagist, but feel free to fork, copy etc for your own projects. No warranty offered, its here mainly as an example.

Phpstan is set to max and test coverage is 100% (I use pcov, have zero idea why others use XDEBUG for coverage).

![coverage](https://github.com/user-attachments/assets/b40414d0-cc6e-44db-958d-bcfc9d189b1e)

## Summary


Settings here are just records in the DB for storing values (enabled/disabled) that can be retreived in much the same way as you would retrieve values from the config. As they are in the DB, optionally cached, they cannot be leaked in the repo.

This is not to say there is anything wrong with storing things in the config, it works, its super quick when optimised, and there are plenty of options for protecting sensitive data in .env files. On the other hand, if you ever find yourself in a situation where an api token needs to change and for whatever reason a deployment is not possible or will take time, this approach is one potential option. Since they are just database records there is no limit to how flexibly they can be used in the application.

Instead of using `config('some.config.key')` you can use the following pattern to explicitly allow for the functionality of overriding the config with a settings value when or if needed.

```php
$key = 'some.config.key'
Setting::value($key, fn() => config($key));
```

## Database table

- name of course must be unique.
- there is an enable/disable flag so settings can be turned on and off and so can be treated like simple features, enabled on local but disabled on production perhaps, but easy to emulate production locally with the flip of a setting.
  Or perhaps there is a setting for holidays and weekends and a different behaviour on weekdays, keep the logic of whether and how the setting is on or off separate from the business logic by scheduling updates to the setting while retaining the ability to very simply turn the setting on or off manually.
- the value column in the database is a text type, so it can handle pretty much anything from 'normal settings' like short strings, urls, and numerics, to substantial JSON structures.

## Blade directive

- similarly to the features package a blade directive is provided which is an `@if` extension and checks if the setting is enabled

```php
@setting('AllowRegistration')
    <a href="">Register</a>
@endsetting
```

## Data Object

A data mapper for the model.

## Facade

Provides convenience methods for interacting with settings. 

- CRUD methods, create and update require a data object, find and delete require name only. Create, find and update return a model instance as you'd expect. List returns an Eloquent Collection of all models.
- `Setting::isEnabled('settingName')` returns true if setting exists and is enabled or false if does not exist or exists and is disabled.
- `Setting::value('settingName)` returns null if disabled or non-existent or value is null, will cast the value as appropriate if its present, type hint of the return is mixed by necessity.
- There are `integerValue` and `floatValue` methods wrapping the `value` method for type safe returns. (todo? stringValue etc useful?).
- `Setting::retrieveSetting('name')` returns null or a data object (not a model, see the CRUD methods above for that).

The SettingsManager class accessed via the Facade is where caching is implemented if configured. Clearly if the application cache itself is using the database driver it might be a little odd to configure
caching enabled for settings which are also in the DB, but its up to the user of the package to determine this. What is cached is an instance of the data object. The cache is written (no ttl) on first retrieval
whether the setting is enabled or disabled. The cache for the setting is cleared when the setting is updated or removed, so a very simple strategy.

## Artisan Commands

Commands are provided for adding, updating (will also create if does not exist) and updating as well as listing settings - these map to the CRUD methods on the facade.

There is also a command to import a JSON structure as a setting from a URL (presumably external, but this is not enforced). With third party integrations there are often fixed or relatively fixed account 
settings, daily balances. The example used in the package tests is the UK public holidays JSON, or it could be an hourly import of exchange rates. When using the command the JSON content, if returned and valid
JSON is saved to the DB prettified (mostly for the sake of the artisan list command which whose output would otherwise be unusable).
