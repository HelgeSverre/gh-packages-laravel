# TingTing Laravel API Package

A robust Laravel package for integrating with the [TingTing AI-powered telephony system](https://tingting.io). Send programmed voice calls and SMS in Nepali with ease.

## Features

- **Authentication**: JWT Login, Refresh, Static API Token support, and User Details.
- **Phone Numbers**: List active broker and account-assigned phone numbers.
- **Campaign Management**: Full CRUD for campaigns, run campaigns, and add specific voice assistance.
- **Contact Management**: Add individual or bulk contacts, manage custom attributes, and update information.
- **Error Handling**: Custom exception handling for API errors.
- **OTP Services**: Send OTPs via voice/text and retrieve logs of sent OTPs.

## Installation
Add from composer

```bash
composer require tingting/laravel
```

OR


Add manually the repository to your `composer.json`:

```json
"repositories": [
    {
        "type": "path",
        "url": "../TingTingAPI"
    }
],
"require": {
    "tingting/laravel": "*"
}
```

Then run:

```bash
composer update tingting/laravel
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="tingting-config"
```

Configure your credentials in `.env`:

```env
TINGTING_BASE_URL=https://app.tingting.io/api/v1/
TINGTING_API_TOKEN=your_static_api_token
TINGTING_EMAIL=your_email
TINGTING_PASSWORD=your_password
```

## Available Methods

The package provides a `TingTing` facade with the following capabilities:

### Authentication
- `login(string $email, string $password)`
- `refreshToken(string $refresh)`
- `generateApiKeys()` (Generate static token)
- `getApiKeys()` (Retrieve static token)
- `userDetail()`
- `setToken(string $token)` (Manual token override)
- `setApiToken(string $token)` (Alias for setToken)

### Phone Numbers
- `activeBrokerPhones()`
- `activeUserPhones()`

### Campaigns
- `listCampaigns(array $filters = [])`
- `createCampaign(array $data)`
- `updateCampaign(int $campaignId, array $data)`
- `deleteCampaign(int $campaignId)`
- `runCampaign(int $campaignId)`
- `addVoiceAssistance(int $campaignId, array $data)`
- `downloadReport(int $campaignId)`

### Contact Management
- `addContact(int $campaignId, array $data)`
- `addBulkContacts(int $campaignId, mixed $bulkData)`
- `listContacts(int $campaignId, array $filters = [])`
- `deleteContact(int $contactId)`
- `getContactAttributes(int $contactId)`
- `editContactAttributes(int $contactId, array $attributes)`
- `updateContactNumber(int $contactId, string $number)`

### OTP Services
- `sendOtp(array $data)`
- `listSentOtps(array $filters = [])`

## Error Handling

The package throws `TingTing\Laravel\Exceptions\TingTingApiException` when an API request fails. You can catch this exception to handle errors gracefully:

```php
use TingTing\Laravel\Exceptions\TingTingApiException;
use TingTing\Laravel\Facades\TingTing;

try {
    $response = TingTing::userDetail();
} catch (TingTingApiException $e) {
    echo "Error: " . $e->getMessage();
    $data = $e->getData(); // Get raw error data from the API
}
```

## Basic Usage

```php
use TingTing\Laravel\Facades\TingTing;

// User Detail Example
$user = TingTing::userDetail();

// Send OTP Example
$response = TingTing::sendOtp([
    'number' => '9800000000',
    'message' => 'तपाईको रिसेटिंग कोड १२३४ हो',
    'sms_send_options' => 'voice',
    'otp_length' => 4,
    'otp_options' => 'generated',
]);

//list campaigns with filters limit|offset|status
$campaigns = TingTing::listCampaigns([
            'limit' => 5,
            'offset' => 0,
            'status' => 'Not Started',
        ]);
```

## API reference document from TingTing
https://tingting-api.readthedocs.io/en/latest/

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
