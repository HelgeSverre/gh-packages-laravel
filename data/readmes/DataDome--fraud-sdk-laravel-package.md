# DataDome Fraud Protection - PHP Laravel integration

Module for supporting DataDome Fraud Protection in Laravel PHP applications.

## Installation

This package can be installed through composer by running the following command:

```
composer require datadome/fraud-sdk-laravel
```

Then proceed to run the below command to generate an autoloader containing the main class and options:

```
composer dump-autoload
```

When the above processes are completed, add the DataDomeServiceProvider to the list of ServiceProviders found in the ``config/app.php``.
Then run ``php artisan vendor:publish`` to publish the DataDomeServiceProvider. This should publish the required ``datadome.php`` config file to the ``config`` folder.

## Usage

Update the .env files with your preferred configuration.
Please note that the `DATADOME_FRAUD_API_KEY` is mandatory, while the other two settings are optional.

```
DATADOME_FRAUD_API_KEY=my-datadome-fraud-api-key
DATADOME_TIMEOUT=1500
DATADOME_ENDPOINT='https://account-api.datadome.co'
```

To make use of the DataDome SDK in your controller, first add the required imports:

```php
use DataDome\FraudSdkSymfony\Models\Address;
use DataDome\FraudSdkSymfony\Models\LoginEvent;
use DataDome\FraudSdkSymfony\Models\StatusType;
use DataDome\FraudSdkSymfony\Models\RegistrationEvent;
use DataDome\FraudSdkSymfony\Models\Session;
use DataDome\FraudSdkSymfony\Models\User;
use DataDome\FraudSdkSymfony\Models\ResponseAction;
```

Then, invoke the validate and collect methods as required:

```php
if ($this->validateLogin("account_guid_to_check")) {
    $loginEvent = new LoginEvent("account_guid_to_check", StatusType::Succeeded);
    $loginResponse = app("DataDome")->validate($request, $loginEvent);

    if ($loginResponse != null && $loginResponse->action == ResponseAction::Allow->jsonSerialize()) {
        // Valid login attempt
        return response()->json([true]);
    } else {
        // Business Logic here
        // MFA
        // Challenge
        // Notification email
        // Temporarily lock account
        return response()->json(["Login denied"]);
    }
}
else {
    $loginEvent = new LoginEvent("account_guid_to_check", StatusType::Failed);
    app("DataDome")->collect($request, $loginEvent);
}

return response()->json([false]);
```