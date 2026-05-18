# Onfido Laravel

A Laravel wrapper for the Onfido PHP API Client.

## Installation

Install using composer:

```shell
composer require worksome/laravel-onfido
```

Publish the configuration file with the following command:

```shell
php artisan vendor:publish --provider "Worksome\Onfido\OnfidoServiceProvider"
```

## Configuration

Remember to add your Onfido API key to your `.env` file.

```dotenv
ONFIDO_API_KEY=api_sandbox.ABC...
```

## Usage

I would always encourage anyone to use the official PHP package as reference, and this is simply a Laravel wrapper.
However, I will provide an example on how to create an applicant.

Remember to import the Onfido facade, by adding `use Worksome\Onfido\Facades\Onfido;` at the top of your file.

To create an applicant and send a check:

```php
use Onfido\Model\ApplicantBuilder;
use Onfido\Model\CheckBuilder;
use Worksome\Onfido\Facades\Onfido;

$applicant = Onfido::createApplicant(new ApplicantBuilder([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'johndoe@example.org',
]));

$onfidoCheck = Onfido::createCheck(new CheckBuilder([
    'applicant_id' => $applicant['id'],
    'report_names' => ['right_to_work'],
    'applicant_provides_data' => true,
]));
```

The above is all that is required to create an applicant and send the applicant a right to work check via Onfido.

You can then consult the results of the applicant or check:

```php
/** @var \Onfido\Model\ApplicantResponse $applicant */
$applicant->getId();

/** @var \Onfido\Model\CheckResponse $onfidoCheck */
$onfidoCheck->getId();

// The responses can also be accessed as an arrayable.
$applicant['id'];
$onfidoCheck['id'];
$onfidoCheck['status'];
$onfidoCheck['form_uri'];
```

To see all possible return data check the [official PHP package documentation](https://github.com/onfido/onfido-php).
