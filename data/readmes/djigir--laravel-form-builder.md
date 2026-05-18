# Laravel Form Builder

A Laravel form builder package similar to FormCollective with essential form building functionality.

## Installation

You can install the package via Composer:

```bash
composer require djigir/laravel-form-builder
```

For Laravel 11+ the package will be auto-discovered. For older versions, add the service provider and facade to your `config/app.php`:

```php
// config/app.php

'providers' => [
    // ...
    Djigir\LaravelFormBuilder\FormServiceProvider::class,
],

'aliases' => [
    // ...
    'Form' => Djigir\LaravelFormBuilder\Facades\Form::class,
],
```

## Usage

### Opening and Closing Forms

```php
// Basic form
{!! Form::open(['action' => 'UserController@store']) !!}
{!! Form::close() !!}

// Form with route
{!! Form::open(['route' => 'users.store']) !!}
{!! Form::close() !!}

// Form with route parameters
{!! Form::open(['route' => ['users.update', $user->id], 'method' => 'PUT']) !!}
{!! Form::close() !!}

// Form with model binding
{!! Form::model($user, ['route' => ['users.update', $user->id], 'method' => 'PUT']) !!}
{!! Form::close() !!}
```

### Input Fields

```php
// Text input
{!! Form::text('username') !!}
{!! Form::text('username', 'Default Value') !!}
{!! Form::text('username', null, ['class' => 'form-control']) !!}

// Email input
{!! Form::email('email') !!}

// Password input
{!! Form::password('password') !!}

// Number input
{!! Form::number('age') !!}

// Tel input
{!! Form::tel('phone') !!}

// Date inputs
{!! Form::date('birth_date') !!}
{!! Form::datetime('created_at') !!}
{!! Form::time('meeting_time') !!}

// Color picker
{!! Form::color('favorite_color') !!}

// Range slider
{!! Form::range('volume', 50) !!}

// File upload
{!! Form::file('avatar') !!}

// Hidden input
{!! Form::hidden('user_id', 1) !!}
```

### Textarea

```php
{!! Form::textarea('description') !!}
{!! Form::textarea('description', 'Default content') !!}
{!! Form::textarea('description', null, ['rows' => 5, 'cols' => 40]) !!}
```

### Select Dropdowns

```php
// Basic select
$options = ['1' => 'Option 1', '2' => 'Option 2'];
{!! Form::select('choice', $options) !!}

// Select with pre-selected value
{!! Form::select('choice', $options, '2') !!}

// Select with attributes
{!! Form::select('choice', $options, null, ['class' => 'form-control']) !!}

// Select range (useful for numbers)
{!! Form::selectRange('quantity', 1, 10) !!}

// Select year dropdown
{!! Form::selectYear('year') !!}
{!! Form::selectYear('year', 1990, 2030) !!}

// Select month dropdown
{!! Form::selectMonth('month') !!}
```

### Checkboxes and Radio Buttons

```php
// Checkbox
{!! Form::checkbox('active', 1) !!}
{!! Form::checkbox('active', 1, true) !!} // checked
{!! Form::checkbox('active', 1, false, ['class' => 'form-check-input']) !!}

// Radio buttons
{!! Form::radio('gender', 'male') !!}
{!! Form::radio('gender', 'female', true) !!} // selected
```

## Features

- **Model Binding**: Automatically populate form fields from Eloquent models
- **Old Input**: Automatically repopulate fields with old input data after validation errors
- **CSRF Protection**: Automatic CSRF token inclusion for POST forms
- **Method Spoofing**: Support for PUT, PATCH, DELETE methods via method spoofing
- **Flexible Options**: Support for HTML attributes and CSS classes
- **Type Safety**: All methods return `HtmlString` instances for safe output

## Available Methods

### Form Methods
- `Form::open($options)` - Open a form
- `Form::model($model, $options)` - Open a form with model binding
- `Form::close()` - Close a form

### Input Methods
- `Form::text($name, $value, $options)`
- `Form::email($name, $value, $options)`
- `Form::password($name, $options)`
- `Form::tel($name, $value, $options)`
- `Form::number($name, $value, $options)`
- `Form::date($name, $value, $options)`
- `Form::datetime($name, $value, $options)`
- `Form::time($name, $value, $options)`
- `Form::color($name, $value, $options)`
- `Form::range($name, $value, $options)`
- `Form::file($name, $options)`
- `Form::hidden($name, $value, $options)`

### Other Elements
- `Form::textarea($name, $value, $options)`
- `Form::select($name, $options, $selected, $attributes)`
- `Form::selectRange($name, $start, $end, $selected, $attributes)`
- `Form::selectYear($name, $startYear, $endYear, $selected, $attributes)`
- `Form::selectMonth($name, $selected, $attributes)`
- `Form::checkbox($name, $value, $checked, $options)`
- `Form::radio($name, $value, $checked, $options)`

## Requirements

- PHP 8.2+
- Laravel 11.0+

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).