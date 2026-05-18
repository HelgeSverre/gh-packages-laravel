![logo](https://github.com/user-attachments/assets/20d605e0-07d5-4e93-9ba0-634f7d02ae98)
![Screenshot 2025-06-24 165013](https://github.com/user-attachments/assets/b6f99206-6f37-4ad9-8ab1-8423680ed7c5)

# Laravel DreamSMS Package Documentation

Comprehensive reference for every method provided by the `dreamsms/laravel-dreamsms` package.

---

## 1. Installation & Configuration

### 1.1 Install via Composer

```bash
composer require dreamsms/laravel-dreamsms
```

### 1.2 Publish Configuration

```bash
php artisan vendor:publish --provider="DreamSms\LaravelDreamSms\DreamSmsServiceProvider" --tag=config
```

### 1.3 Environment Variables

Add these to your `.env`:

```ini
DREAMSMS_BASE_URL=https://www.dreams.sa/index.php/api
DREAMSMS_USER=your_username
DREAMSMS_SECRET_KEY=your_api_secret_key
DREAMSMS_CLIENT_ID=your_oauth_client_id
DREAMSMS_CLIENT_SECRET=your_api_secret_key # as DREAMSMS_SECRET_KEY
DREAMSMS_SENDER_NAME=your_sender_name
```

### 1.4 Config File (`config/dreamsms.php`)

```php
return [
    'base_url'      => env('DREAMSMS_BASE_URL'),
    'account_username'          => env('DREAMSMS_USER'),
    'secret_key'    => env('DREAMSMS_SECRET_KEY'),
    'client_id'     => env('DREAMSMS_CLIENT_ID'),
    'client_secret' => env('DREAMSMS_CLIENT_SECRET'),
    'sender_name'  => env('DREAMSMS_SENDER_NAME'),
];
```

# How To Get Sender Name, Account Username, client\_secret, and client\_id

## 1. Account Username

Your **Account Username** is the username you use to log in to your Dreams account.

## 2. client\_id

To obtain your **client\_id**:

* Visit the following URL:

  * [https://www.dreams.sa/user/ClientCredentials](https://www.dreams.sa/user/ClientCredentials)
* Copy the displayed **client\_id**.

## 3. client\_secret

To retrieve your **client\_secret**:

* Go to your profile page:

  * [https://www.dreams.sa/user/myprofile](https://www.dreams.sa/user/myprofile)
* Copy your **client\_secret** from the information displayed there.

## 4. Sender Name

To get your default **Sender Name**:

* Navigate to:

  * [https://www.dreams.sa/user/senders](https://www.dreams.sa/user/senders)
* Identify and copy the default Sender Name from your listed sender names.



---

# 2. Service Usage

Use the Facade or inject the `DreamSms` service.

```php
use DreamSms; // Facade

// OR via DI
public function __construct(DreamSms\LaravelDreamSms\DreamSms $sms)
{
    $this->sms = $sms;
}
```

---

# 3. API Methods Reference

Each section details endpoint, parameters, expected response, and Laravel usage.

---

## 3.1 `register(array $user): array`

**Description:** Register a new DreamSMS user account.

| HTTP Method | Endpoint    |
| ----------- | ----------- |
| POST        | `/Register` |

### Parameters

| Name     | Type   | Required | Description                  |
| -------- | ------ | -------- | ---------------------------- |
| user     | string | yes      | Desired username             |
| password | string | yes      | Password (min 6 chars)       |
| name     | string | yes      | Full name                    |
| mobile   | string | yes      | Mobile number (e.g. 9665...) |
| email    | string | yes      | Valid e‑mail address         |

### Example Request

```php
$response = DreamSms::register([
    'user'     => 'newuser',
    'password' => 'pass1234',
    'name'     => 'John Doe',
    'mobile'   => '966512345678',
    'email'    => 'john@example.com',
]);
```

### Success Response

```json
{
  "code": 999,
  "message": "Success register user",
  "data": { /* user details */ }
}
```

### Error Codes

* `100`: Missing parameters
* `110`: Username already used
* `111`: Mobile already used
* `112`: Email already used
* `120`: Username contains invalid characters
* `121`: Password too short (<6)
* `122`: Invalid username
* `123`: Invalid password

---

## 3.2 `generateToken(): array`

**Description:** Obtain OAuth2 Bearer token.

| HTTP Method | Endpoint          |
| ----------- | ----------------- |
| POST        | `/token/generate` |

### Parameters

| Name           | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| grant\_type    | string | yes      | Must be `client_credentials` |
| client\_id     | string | yes      | OAuth client ID              |
| client\_secret | string | yes      | OAuth client secret          |

### Example Request

```php
$tokenData = DreamSms::generateToken();
```

### Success Response

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "eyJ0e..."
}
```

### Error Responses

* `401 invalid_client`: Authentication failed
* `400 unsupported_grant_type`: Wrong grant type

---

## 3.3 `activate(string $user, string $code): array`

**Description:** Activate a newly registered account.

| HTTP Method | Endpoint    |
| ----------- | ----------- |
| POST        | `/activate` |

### Parameters

| Name        | Type   | Required | Description     |
| ----------- | ------ | -------- | --------------- |
| user        | string | yes      | Username        |
| secret\_key | string | yes      | API secret key  |
| code        | string | yes      | Activation code |

### Example Request

```php
DreamSms::activate('newuser', '123456');
```

### Response Codes

* `999`: Success
* `100`: Missing parameters
* `110`: Invalid username or secret\_key
* `111`: Wrong activation code

---

## 3.4 `checkUser(): array`

**Description:** Verify account credentials and activation status.

| HTTP Method | Endpoint    |
| ----------- | ----------- |
| POST        | `/chk_user` |

### Parameters

| Name        | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| user        | string | yes      | Username    |
| secret\_key | string | yes      | API key     |

### Success Response

```json
{ "code": 999, "message": "Valid account" }
```

### Error Codes

* `-100`: Missing parameters
* `-110`: Account not exist or wrong credentials
* `-111`: Account not activated
* `-112`: Blocked account

---

## 3.5 `balance(): array`

**Description:** Retrieve SMS credit balance.

| HTTP Method | Endpoint       |
| ----------- | -------------- |
| POST        | `/chk_balance` |

### Parameters

| Name        | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| user        | string | yes      | Username    |
| secret\_key | string | yes      | API key     |

### Success Response

```json
{ "balance": 123.45 }
```

### Error Codes

* `-100`: Missing parameters
* `-110`: Invalid credentials

---

## 3.6 `addSender(string $sender): array`

**Description:** Create a new sender name.

| HTTP Method | Endpoint     |
| ----------- | ------------ |
| POST        | `/newsender` |

### Parameters

| Name        | Type   | Required | Description                |
| ----------- | ------ | -------- | -------------------------- |
| user        | string | yes      | Username                   |
| secret\_key | string | yes      | API key                    |

### Error Codes

* `-113`: Duplicate sender
* `-114`: Invalid sender name (chars or length)

---

## 3.7 `senderStatus(string $sender): array`

**Description:** Check activation status of a sender.

| HTTP Method | Endpoint        |
| ----------- | --------------- |
| POST        | `/senderstatus` |

### Parameters

| Name        | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| user        | string | yes      | Username    |
| secret\_key | string | yes      | API key     |

### Status Values

* `Active`, `UnActive`, `Rejected`

---

## 3.8 `userSenders(): array`

**Description:** List all senders for your account.

| HTTP Method | Endpoint      |
| ----------- | ------------- |
| POST        | `/usersender` |

### Success Response (XML)

```xml
<usersender>
  <sender>
    <id>52</id>
    <text>MySender</text>
    <status>Active</status>
    <default>false</default>
    <date>2025-06-01</date>
    <notes>...</notes>
  </sender>
</usersender>
```

---

## 3.9 `sendSms(string $to, string $message, string $sender, array $options = []): array`

**Description:** Send a single SMS, optionally with calendar reminder.

| HTTP Method | Endpoint   |
| ----------- | ---------- |
| POST        | `/sendsms` |

### Required Parameters

| Name        | Type   | Description             |
| ----------- | ------ | ----------------------- |
| user        | string | Username                |
| secret\_key | string | API key                 |
| to          | string | Recipient mobile number |
| message     | string | Message body            |

### Optional Calendar Fields (`is_calander = 1`)

| Name           | Description          |
| -------------- | -------------------- |
| calander\_date | YYYY-MM-DD           |
| calander\_time | HH\:MM               |
| reminder       | Minutes before event |
| reminder\_text | Reminder message     |
| location\_url  | Google Maps URL      |

### Example Usage

```php
DreamSms::sendSms(
    '966512345678',
    'Meeting at 5pm',
    [
        'is_calander'   => 1,
        'calander_date' => '2025-07-01',
        'calander_time' => '17:00',
        'reminder'      => 30,
        'reminder_text' => 'Don’t forget!',
    ]
);
```

### Response

* `SMS_ID:mobileNumber` on success
* Negative codes for errors (`-113` insufficient balance, `-119` invalid datetime, etc.)

---

## 3.10 `sendMulti(array $toWithMsg, string $sender): array`

**Description:** Send different messages to multiple recipients in one request.

| HTTP Method | Endpoint         |
| ----------- | ---------------- |
| POST        | `/sendsms_multi` |

### Parameters

| Name        | Type   | Description                                 |
| ----------- | ------ | ------------------------------------------- |
| user        | string | Username                                    |
| secret\_key | string | API key                                     |
| to          | string | JSON: `{"9665...":"Msg1","9665...":"Msg2"}` |

### Example Usage

```php
DreamSms::sendMulti([
    '966512345678' => 'Hello Alice',
    '966512345679' => 'Hello Bob',
]);
```

### Response

Same format as single `sendSms` response.

---

# 4. Error Handling

Catch `DreamSms\LaravelDreamSms\Exceptions\DreamSmsException` to manage HTTP or API errors:

```php
try {
    DreamSms::sendSms(...);
} catch (DreamSmsException $e) {
    report($e);
    // handle or display $e->getMessage()
}
```



---

# 6. Contributions

1. Fork and clone
2. Create a branch `feature/your-feature`
3. Write tests & code
4. Submit a PR

Please follow PSR-12 and include tests for new methods.

---

# 7. License

MIT. See [LICENSE](LICENSE).
