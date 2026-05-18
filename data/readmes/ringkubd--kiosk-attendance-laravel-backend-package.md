# kiosk-attendance-sync

## Configurable User Relationship

The `AttendanceEmployee` model can be configured to have a relationship with a User model. This is useful if you want to link an employee to a user in your application.

To enable this feature, you need to publish the `attendance-sync-config` configuration file:

```bash
php artisan vendor:publish --tag=attendance-sync-config
```

This will create a `config/attendance-sync.php` file in your application. You can then edit this file to specify the User model and the relationship name.

By default, the configuration looks like this:

```php
<?php

return [
    'user' => [
        'model' => env('ATTENDANCE_USER_MODEL', null),
    ],
    'employee' => [
        'relations' => env('ATTENDANCE_EMPLOYEE_RELATIONS', ''),
    ],
];
```

You can set the `ATTENDANCE_USER_MODEL` environment variable to the fully qualified class name of your User model, and the `ATTENDANCE_EMPLOYEE_RELATIONS` environment variable to the name of the relationship.

For example, if your User model is `App\Models\User` and you want to load the `user` relationship, you would add the following to your `.env` file:

```
ATTENDANCE_USER_MODEL=App\Models\User
ATTENDANCE_EMPLOYEE_RELATIONS=user
```
