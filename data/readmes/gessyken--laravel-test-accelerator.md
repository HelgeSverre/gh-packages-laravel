# Laravel Test Accelerator

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gessyken/laravel-test-accelerator.svg?style=flat-square)](https://packagist.org/packages/gessyken/laravel-test-accelerator)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/gessyken/laravel-test-accelerator/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/gessyken/laravel-test-accelerator/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/gessyken/laravel-test-accelerator.svg?style=flat-square)](https://packagist.org/packages/gessyken/laravel-test-accelerator)

A Laravel package that accelerates test development by automatically generating tests, analyzing code coverage, and providing performance insights.

## Features

-   **Automatic Test Generation** - Generate unit and feature tests automatically
-   **Code Coverage Analysis** - Analyze test coverage with detailed reports
-   **Performance Benchmarking** - Identify slow tests and performance bottlenecks
-   **AI Integration** - Generate intelligent test cases using AI (OpenAI, Anthropic)
-   **CLI Commands** - Easy-to-use Artisan commands for all features

## Installation

```bash
composer require gessyken/laravel-test-accelerator --dev
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="laravel-test-accelerator-config"
```

## Usage

### Generate Tests

```bash
# Generate tests for a specific file
php artisan test:generate app/Models/User.php

# Generate tests for a directory
php artisan test:generate app/Services/

# Use AI to generate smarter tests
php artisan test:generate app/Models/User.php --ai
```

### Analyze Coverage

```bash
# Basic coverage analysis
php artisan test:coverage

# Generate HTML report
php artisan test:coverage --report

# Set minimum threshold
php artisan test:coverage --threshold=80
```

### Performance Benchmark

```bash
# Analyze test performance
php artisan test:benchmark

# Custom thresholds
php artisan test:benchmark --slow-threshold=2000 --memory-threshold=2048
```

## Configuration

Add these variables to your `.env` file for AI features:

```env
TEST_ACCELERATOR_AI_PROVIDER=openai
TEST_ACCELERATOR_AI_API_KEY=your_api_key_here
TEST_ACCELERATOR_AI_MODEL=gpt-4
```

## Requirements

-   PHP 8.4+
-   Laravel 12+
-   Composer 2+

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Author

**Aurel KENNE**

-   GitHub: [@gessyken](https://github.com/gessyken)
-   Email: gessyken@gmail.com
