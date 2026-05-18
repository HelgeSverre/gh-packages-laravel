# nl-rdo-laravel-logging

This package extends the [minvws/audit-logger](https://github.com/minvws/nl-rdo-php-audit-logger) package and provides a generic logging service for Laravel applications for
the RDO platform. It allows to easily log events to the database, syslog or other destinations.

## Installation

### Composer

You can install the package via the composer package manager:

```bash
composer require minvws/laravel-logging
```

### Configuration

The package can be configured in the `logging.php` file. The following options are available:

| Option                             | Description                                          |
|------------------------------------|------------------------------------------------------|
| dblog_enabled                      | Enable logging to the database                       |
| rabbitmq_enabled                   | Enable logging to RabbitMQ                           |
| auditlog_model                     | The model to use for logging to the database         |
| log_full_request                   | Log the full HTTP request                            |
| syslog_enabled                     | Enable logging to syslog                             |
| syslog_base64_encode_enabled       | Enable base64 encoding for syslog, cannot be disabled when syslog encrypt is enabled, default is `true` |
| syslog_encrypt                     | Encrypt the data before sending to syslog            |
| syslog_pubkey                      | The public key to use for encryption                 |
| syslog_secret                      | The private key to use for encryption                |
| rabbitmq_additional_allowed_events | Additional events that can be logged to RabbitMQ     |
| rabbitmq_log_pii                   | Log PII data to RabbitMQ                             |

There are currently three logging destinations available: the database, syslog and rabbitmq.

#### Database logging

The basic `AuditLog` model is available and by default configured. If a different model is
preferred to use, the `auditlog_model` option can be set to the actual class to use.

The default model can be created in pgsql with the following statement:

```sql
CREATE TABLE public.audit_logs
(
    email              character varying(320),
    request            json,
    pii_request        text,
    created_at         timestamp(0) without time zone,
    event_code         character varying(255),
    action_code        character varying(255),
    source             character varying(255),
    allowed_admin_view boolean,
    failed             boolean,
    failed_reason      text
);
```

When logging to the database
To log to the database, there needs to be a (eloquent) model like the `AuditLog` model.
Note that this model is just an example, you can use your own model that might encrypt the
actual data for instance.

To "connect" your model to the logging service, you need to set the `auditlog_model` option
to the actual class to use.

See [minvws/audit-logger](https://github.com/minvws/nl-rdo-php-audit-logger) for more information.

### Usage:

To use the logger, inject or resolve the `LogService` class. This class has a single method:

```php
  use MinVWS\Logging\Laravel\LogService;
  
  $logger = app(LogService::class);
  $logger->log((new UserLoginLogEvent())
      ->asExecute()
      ->withActor($user)
      ->withData(['foo' => 'bar'])
      ->withPiiData(['bar' => 'baz'])
      ->withFailed(true, 'invalid login')
  );

```

## Creating custom events

Creating a custom event is easy. You can create a new class that extends the `MinVWS\AuditLogger\Events\Logging\GeneralLogEvent` class. 

```php
  use MinVWS\AuditLogger\Events\Logging\GeneralLogEvent;
  
  class MyCustomEvent extends GeneralLogEvent
  {
      public const EVENT_CODE = '991414';
      public const EVENT_KEY = 'my_custom_event';
  }

```

## Contributing
If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on the GitHub repository of this package.

## License
This package is open-source and released under the European Union Public License version 1.2. You are free to use, modify, and distribute the package in accordance with the terms of the license.

## Part of iCore
This package is part of the iCore project.
