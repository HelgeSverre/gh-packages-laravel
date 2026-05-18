
# Termii API for Laravel
This is a laravel package for [Termii API](http://developer.termii.com/docs/)
<hr>


## Requirements

    - Php >= 8.0
    - Laravel 9.0 or higher 

## Installation

```bash
composer require olusegun171/laravel-termii
```
Once the Laravel package is installed, Open your .env file and add the following variables.
Get your API key from https://accounts.termii.com/
```txtƒ√
TERMII_SENDER_ID="N-Alert"
TERMII_API_KEY=""
TERMII_BASE_URL = "https://api.ng.termii.com"
```
## Usage
To use any of the Termii's API, First, add the LaravelTermii\Termii class
```php
  use LaravelTermii\Termii;
```
#### 1. Messaging API
To use the Termii’s Messaging API, first create an instance with
```php
  $messaging = Termii::messaging();
```
-  ##### Send message
 Send message with the default senderID 'N-Alert'. 

```php
  $channel = 'generic';  //default is 'generic' or pass 'dnd' to send dnd message
  $response = $messaging->sendMessage(string $to, string $message, string $channel);
  $response->json();
```
-  ##### Send bulk message
Send bulk message with the default senderID 'N-Alert'.

```php
  $channel = 'generic';  //default is 'generic' or pass 'dnd' to send dnd message
  $messaging->sendBulkMessage($to, string $mesage);
```

- ##### Auto-generated messaging numbers
send messages to customers using Termii's auto-generated messaging numbers that adapt to customers location. For more information visit https://developer.termii.com/number
``` php
  $response = $messaging->sendNumber(string $to, string $message);
  $response->json();
```
- ##### Whatsapp message 
Send whatsapp message with default device name 'N-Alert'

```php
  //The url to the file resource and caption that should be added to the image,
  $media  = ['url' => '','caption' => '' ];
  $device_name = 'N-Alert'; // you can pass another approved device name.
  $response = $messaging->sendWhatapps(string $to, string $device_name, array $media);
  $response->json();
```

- ##### Send Template
Set a template for the one-time-passwords (pins) sent to customers via whatsapp or sms. For more information visit https://developer.termii.com/templates
```php

/* $data = [
         "product_name": "Termii",
         "otp" : 120435,
         "expiry_time": "10 minutes"
] */
  $response = $messaging->sendTemplate(string $to, string $template_id, string $device_id, array $data);
  $response->json();
```

- ##### Phonebook
Create, view & manage phonebooks using these methods. Each phonebook can be identified by a unique ID, which makes it easier to edit or delete a phonebook.
``` php
//get all phonebooks
$response = $messaging->phonebooks(); 
$response->json();

//create phonebook
$response = $messaging->createPhoneBook(string $phonebook_name, string $desc = ''); 
$response->json();

//update phonebook
$response = $messaging->updatePhoneBook(string $phonebook_id, string $phonebook_name);
$response->json();

//Delete phonebook
$response = $messaging->deletePhoneBook(string $phonebook_id);
$response->json();
```
- ##### Contacts
Manage contacts in your phonebook.
``` php
//Fetch contacts by phonebook ID
$response = $messaging->PhonebookContacts(string $phonebook_id);
$response->json();

//Add single contact to a phonebook
  /* $contact = [
        "phone_number" => "8123696237",
        "email_address" => "test@gmail.com",
        "first_name" =>  "test",
        "last_name" =>  "contact",
        "company" => "Termii",
        "country_code" => "234"
   ]; */
$response = $messaging->addContact(string $phonebook_id, array $contact);
$response->json();

//Add multiple contacts to a phonebook
  /* 
    file containing the list of contacts. Supported files include : 'txt', 'xlsx', and 'csv'.
    $contact_file = 'test_names.csv"; 
    $country_code = "234"; 
    */
$response = $messaging->addMutipleContacts(string $phonebook_id, string $contact_file, string $country_code);
$response->json();
//Delete a contact
$response = $messaging->deleteContact(string $contact_id);
$response->json();
```
- ##### Campaigns
View, manage and send a campaign to a phonebook

```php
//Fetch campaigns
$response = $messaging->campaigns();
$response->json();

//Fetch campaign history
$response = $messaging->campaignHistory(string $campaign_id);
$response->json();

//Send a campaign with default senderID 'N-Alert'
/* 
$channel = 'generic';
$schedule = [
    "schedule_sms_status" => "scheduled" // To send a scheduled campaign, pass scheduled as the value
    "schedule_time" => "30-06-2021 6:00", //The date time to send scheduled campaign
]; */

$response = $messaging->sendCampaign(string $phonebook_id, string $message, string $channel, array $schedule = []);
$response->json();
```

-  ##### Request Sender ID
Use this method to request a new sender ID from your Termii account

```php
  $response = $messaging->requestSenderID(string $sender_id, string $usecase, string $company);
  $response->json();
```
-  ##### Fetch Sender ID
Use this method to fetch all sender IDs in your Termii account
```php
  $response = $messaging->fetchSenderID();
  $response->json();
```

#### 2. Token API
To use the Termii’s Token API, first create an instance with the following
```php
  $token = Termii::token(["pin_attempts" => 10,
                            "pin_time_to_live" => 30,
                            "pin_length" => 6,
                            "pin_placeholder" => '< 123 >',
                            'pin_type' => 'ALPHANUMERIC',
                            'message_type' => 'ALPHANUMERIC',
                        ]);
```
- ##### Send Token
Trigger one-time-passwords (OTP) across any available messaging channel on Termii. One-time-passwords created are generated randomly and there's an option to set an expiry time.
``` php
$response = $token->sendToken(string $to, string $from, string $mesage, string  $channel = 'generic');
$response->json();
```
- ##### Send Voice Token 
Generate and trigger one-time passwords (OTP) through the voice channel to a phone number. OTPs are generated and sent to the phone number and can be verified calling *wverifyToken* method
``` php
$response = $token->voiceToken(string $phone_number);
$response->json();
```
- ##### Send Voice Call 
Send messages from your application through our voice channel to a phone number. Only one-time-passwords (OTP) are allowed for now and these OTPs can not be verified 
``` php
$response = $token->voiceCall(string $phone_number,  string $code);
$response->json();
```
- ##### Send Email Token 
Send one-time-passwords from your application through our email channel to an email address. Only one-time-passwords (OTP) are allowed for now and these OTPs can not be verified
``` php
$response = $token->emailToken(string $email,  string $code, $config_id);
$response->json();
```
- #####  Verify Token 
Checks tokens sent to customers and returns a response confirming the status of the token. A token can either be confirmed as verified or expired based on the timer set for the token.
``` php
$response = $token->verifyToken(string $pin_id,  string $pin);
$response->json();
```
- #####  In-App Token 
Returns OTP codes in JSON format which can be used within any web or mobile app. Tokens are numeric or alpha-numeric codes generated to authenticate login requests and verify customer transactions.
``` php
$response = $token->inAppToken(string $phone_number);
$response->json();
```

#### 3.  Insight API
To use the Termii’s Insight API, first create an instance with the following
```php
  $insight = Termii::insights();
```
- ##### Account Balance
Returns your total balance and balance information from your wallet, such as currency.
``` php
$response = $insight->balance();
$response->json();
```

- ##### Search
To verify phone numbers and automatically detect their status as well as current network. It also tells if the number has activated the do-not-disturb settings.
``` php
$response = $insight->search(string $phone_number);
$response->json();
```

- ##### Status
Check if a number is fake or has ported to a new network.
``` php
$response = $insight->status(string $phone_number, string $country_code = 'NG');
$response->json();
```

- ##### History
Returns reports for messages sent across the sms, voice & whatsapp channels. Reports can either display all messages on termii or a single message.
This returns your total balance and balance information from your wallet, such as currency.
``` php
$response = $insight->history();
$response->json();
```

#### Other Response methods
``` php
$response->body() : string;

$response->json($key = null, $default = null) : mixed;

$response->object() : object;

// Returns http status code
$response->status() : int;

// Determine if the status code is >= 200 and < 300...
$response->successful();
 
// Determine if the status code is >= 400...
$response->failed();
 
// Determine if the response has a 400 level status code...
$response->clientError();
 
// Determine if the response has a 500 level status code...
$response->serverError();
```
## License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.


<a href="#top">Back to top</a>