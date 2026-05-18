# Laravel Registry

TODO: yet to publish  
[![Latest Version on Packagist](https://img.shields.io/packagist/v/talp1/laravel-registry.svg)](https://packagist.org/packages/talp1/laravel-registry)
[![Total Downloads](https://img.shields.io/packagist/dt/talp1/laravel-registry.svg)](https://packagist.org/packages/talp1/laravel-registry)  

[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/Talpx1/laravel-registry/run-tests.yml?branch=main&label=tests)](https://github.com/Talpx1/laravel-registry/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/Talpx1/laravel-registry/fix-php-code-style-issues.yml?branch=main&label=code%20style)](https://github.com/Talpx1/laravel-registry/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)  

[![Hire Me](https://img.shields.io/badge/hire_me-available!-lime)](mailto:hello@simonecerruti.com)
[![Support](https://img.shields.io/badge/support-thanks_<3-magenta)](https://buymeacoffee.com/talp1)

Easy registry management for Laravel

No need to create your own registry management anymore!  
Laravel Registry ships with many features to help you profile companies, customers and people with all the necessary data such as email, phone number, socials...

```php
//TODO
Registry::create([
    'type' => RegistryTypes::CUSTOMER
])
```

## Support

[<img src="https://martinaway.com/wp-content/uploads/2023/08/Buy-me-a-coffee.png" />](https://buymeacoffee.com/talp1)

I'm a self-employed solo developer, trying to make cool and hopefully useful pieces of software.  
If you are a company or you used this package in one of your projects, please consider [supporting me](https://buymeacoffee.com/talp1)!  
Thanks <3

## Installation

You can install the package via composer:

```bash
composer require talp1/laravel-registry
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-registry-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-registry-config"
```

This is the contents of the published config file:

```php
return [
    //TODO
];
```

## Usage

```php
//TODO
```
## Phone number advanced support

This package does NOT include any phone number validation or formatting functionality.  
If you need to validate, format or perform more advanced checks on phone numbers, consider using a separate package such as [`propaganistas/laravel-phone`](https://github.com/Propaganistas/Laravel-Phone).
This decision was made to keep the package focused on its primary purpose of providing a registry system, and to avoid adding functionality that could be better handled by a separate package.

Example of how to use `propaganistas/laravel-phone` with this package:
```php
$phone_number = $person->phone_numbers->first()->prefixed;

//helper phone() is form propaganistas/laravel-phone
phone($phone_number)->formatE164();
phone($phone_number)->formatForCountry(Countries::ITALY->iso3166Alpha2Code());
phone($phone_number, Countries::ITALY->iso3166Alpha2Code())->formatInternational();
```
This package only offers a basic `prefixed` attribute that formats a phone number with a country phone prefix, if any is specified. Like so: `+{country_prefix} {phone_number}`. This may be useful to better integrate with `propaganistas/laravel-phone`.

## Database Design Choices

### Primitive Types vs Foreign Keys/Enum Type Columns

Some db columns like `phone_numbers.line_type`, `social_network_profiles.social_network`, ... are of primitive types.  
One could argue that, since their possible values are a finite set of values, they could be a separate table with a foreign key, or an enum type column, better enforcing db strictness and integrity.
While that's true:
- solution 1 (tables with FK) would generate A LOT of tables, causing the consumer application to have a rather messy and noisy db.  
- solution 2 (enum type column) is not considered a best practice for scalability and future proofing. And since this package aims to be highly customizable and rather flexible, this seemed not the right way to go.  

The chosen solution relies on the fact that database consistency can be enforced at the application level, with proper validation, such as Laravel's [`enum` rule](https://laravel.com/docs/validation#rule-enum) or [`in` rule](https://laravel.com/docs/validation#rule-in).  
Example:  
```php
//enum rule
$input = ['social_network' => 'instagram'];

Validator::make($input, [    
    'social_network' => ['required', 'string', Rule::enum(SocialNetworks::class)],
]);

//in rule
$input = ['phone_number_prefix' => '39'];

Validator::make($input, [    
    'phone_number_prefix' => ['required', 'numeric', Rule::in(Countries::allPhonePrefixes())],
]);
```
### Violation of Normal Form Best Practices
The addresses table is NOT in normal form, as one could deduce the city and country from the postal code.  
But this would mean to create a table with all the postal codes for each city, and it would be HUGE and noisy. The same is true for an enum type column.  
Plus it's possible, for the enum case, that there are 2 equals postal codes for different city, maybe in different countries, causing even more troubles. Not to mention performance etc.  
So in this case may be ok to violate NF best practices and enforce a good application-side validation on postal codes. In such case [`axlon/laravel-postal-code-validation`](https://github.com/axlon/laravel-postal-code-validation) may be of interest.

### Purpose Aware Addresses
Even if the addresses table should only know about addresses and not their function/"purpose", in the schema they still have the responsibility to store this info.  
Let's take as an example a person residence address: this info could be stored in a dedicated column of the `people` table, maybe called `residence_address_id`, which would be a FK to the `addresses` table.  
Theoretically everything would work, but this design would also introduce inefficiencies, a potential risk of inconsistent data input and, consequently, the associated added complexity for validation to avoid this possibility.  
This scenario arises from the fact that the addresses are tied to the "owner" via a polymorphic relationship.  
Suppose we have an address table already populated with data. Nothing prevents us from assigning in our `residence_address_id` column of a person X, the id of an address belonging to a person Y who has nothing to do with our person X. The cause of this is the dual possibility of assigning a correlation between `address` and `person`, once via the polymorphic relationship in the `addresses` table (address belongs to person), another time in the `residence_address_id` column of the `people` table (the person has a residential address, although at a relationship level it would be more correct to say that the person belongs to the address)
We should therefore take the trouble, at a software validation level, to make sure that the address belongs to person X before assigning it to him.  
Now that we have analyzed the problems of inconsistency and complexity, let's look at the problem of inefficiency.
To create the record for the residential address in the `addresses` table, we need to define who owns that address (due to the polymorphic relationship). So first we should create the person, with the `residence_address_id` column set to null. Now we can create the address, then edit the person record and insert the id of the newly created address into the `residence_address_id` column. For a total of 3 steps.  
The solution adopted, that is to make the addresses aware of their purpose (such as a residence), solves the problems mentioned.
In fact, now there is no longer the possibility of defining a double correlation between `address` and `person`, as the `residence_address_id` column does not exist. Consequently, once the person has been created, we can create their residential address, specifying the purpose of this address, precisely, as a residence, without worrying about having to carry out complex validation checks. For a total of 2 steps.  
In addition we had an advantage in scalability and flexibility, as we can now define new addresses with different purposes for that person (e.g. a private office) without having to modify the migration of the `people` table and add a column for each 'purpose' of address.  
The disadvantage is that, to ensure that a person cannot have multiple residential addresses assigned, we will have to do some validation on the software side.  
By having the `purpose` column of the address table `nullable` (in case an address has no particular purpose), this design should be robust and flexible enough for most cases. For more advanced eventualities, it is always possible to modify the migration.

## Testing

```bash
composer test
```

## Changelog 

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Simone Cerruti (Talp1)](https://github.com/Talpx1)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
