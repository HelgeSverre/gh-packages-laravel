# Laravel Multiple Choice
Package that provides multiple choice questions and answers

## Installation

1. Run `composer require jord-jd/laravel-multiple-choice`.
2. Add `JordJD\LaravelMultipleChoice\Providers\LMCServiceProvider::class` to `providers` array in `config/app.php`.
3. Run `php artisan vendor:publish --provider="JordJD\LaravelMultipleChoice\Providers\LMCServiceProvider" --tag="migrations" --force`.

