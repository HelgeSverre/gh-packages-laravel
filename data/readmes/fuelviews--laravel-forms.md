# Laravel forms package

Laravel forms package with built-in spam protection and optional Cloudflare Turnstile support.

## Installation

You can require the package via composer:

```bash
composer require fuelviews/laravel-forms
```

You can install the package with:

```bash
php artisan forms:install
```

You can manually publish the config file with:

```bash
php artisan vendor:publish --tag="forms-config"
```

You can publish the view files with:

```bash
php artisan vendor:publish --tag="forms-views"
```

## Cloudflare Turnstile Setup (Optional)

This package includes built-in support for Cloudflare Turnstile CAPTCHA to protect your forms from spam.

### 1. Get Your Turnstile Keys

1. Sign up for a free [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one
2. Go to the [Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
3. Create a new site and get your Site Key and Secret Key

### 2. Configure Your Environment

Add these to your `.env` file:

```env
FORMS_TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### Configuration Options

The package configuration in `config/forms.php` supports flexible environment variables:

```php
    'turnstile' => [
        'enabled' => env('FORMS_TURNSTILE_ENABLED', false),
        'site_key' => env('TURNSTILE_SITE_KEY','1x00000000000000000000AA'),
        'secret_key' => env('TURNSTILE_SECRET_KEY','1x0000000000000000000000000000000AA'),
    ],
```

## Form Usage (basic)

Include form method type, form method route, spam strap in the start and end of the form, form key, fake submit button, and a real submit button.

```php
<form method="POST" action="{{ route('forms.validate') }}">
    <input type="text" name="isSpam" style="display:none" />
    
    /* Form fields here */
    
    <x-forms::meta />
    <input type="hidden" name="form_key" value="contact_us" />
    <input type="text" name="gotcha" class="hidden" />
    
    <x-forms::buttons.fake-button :buttonText="'Submit'" />
    <x-forms::buttons.submit-button :buttonText="'Submit'" />
</form>
```

## Form Usage (advanced)

```bladehtml
<form method="POST" action="{{ route('forms.validate') }}" class="mt-16">
    <div class="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        <input type="text" name="gotcha" style="display:none" />
        <div>
            <label for="firstName" class="block text-sm font-semibold leading-6 text-gray-900">
                First name
            </label>
            <div class="mt-1">
                <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    wire:model="firstName"
                    value="{{ old('firstName') }}"
                    autocomplete="given-name"
                    class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    pattern="[A-Za-z]{2,}"
                    title="First name must be at least 2 letters and only contain letters." />
                @error('firstName')
                    <span class="flex pl-1 pt-2 text-sm text-red-600">{{ $message }}</span>
                @enderror
            </div>
        </div>
        <div>
            <label for="lastName" class="block text-sm font-semibold leading-6 text-gray-900">
                Last name
            </label>
            <div class="mt-1">
                <input
                    type="text"
                    name="first-name"
                    id="lastName"
                    wire:model="lastName"
                    value="{{ old('lastName') }}"
                    autocomplete="family-name"
                    class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    pattern=".{2,}"
                    title="Last name must be at least 2 characters." />
                @error('lastName')
                    <span class="flex pl-1 pt-2 text-sm text-red-600">{{ $message }}</span>
                @enderror
            </div>
        </div>
        <div class="sm:col-span-2">
            <label for="email" class="block text-sm font-semibold leading-6 text-gray-900">
                Email
            </label>
            <div class="mt-1">
                <input
                    id="email"
                    name="email"
                    type="email"
                    wire:model="email"
                    value="{{ old('email') }}"
                    autocomplete="email"
                    class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                @error('email')
                    <span class="flex pl-1 pt-2 text-sm text-red-600">{{ $message }}</span>
                @enderror
            </div>
        </div>
        <div class="sm:col-span-2">
            <div class="flex justify-between text-sm leading-6">
                <label for="phone" class="block font-semibold text-gray-900">Phone</label>
            </div>
            <div class="mt-1">
                <input
                    type="tel"
                    name="phone"
                    id="phone"
                    wire:model="phone"
                    value="{{ old('phone') }}"
                    autocomplete="tel"
                    aria-describedby="phone-description"
                    class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    pattern="[\s\d\-\(\)]*?(\d[\s\d\-\(\)]*?){7,11}"
                    title="Phone number must have 7 to 11 digits and may include parentheses, spaces, and hyphens."
                    />
                @error('phone')
                    <span class="flex pl-1 pt-2 text-sm text-red-600">{{ $message }}</span>
                @enderror
            </div>
        </div>
        <div class="sm:col-span-2">
            <div class="flex justify-between text-sm leading-6">
                <label for="message" class="block text-sm font-semibold leading-6 text-gray-900">
                    How can we help you?
                </label>
                <p id="message-description" class="text-gray-400">Max 255 characters</p>
            </div>
            <div class="mt-1">
                <textarea
                    id="message"
                    name="message"
                    wire:model="message"
                    value="{{ old('messsage') }}"
                    rows="4"
                    aria-describedby="message-description"
                    class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
                @error('message')
                    <span class="flex pl-1 pt-2 text-sm text-red-600">{{ $message }}</span>
                @enderror
            </div>
        </div>
    </div>

    <x-forms::meta />
    <input type="hidden" name="form_key" value="contact_us" />
    <input type="text" name="gotcha" class="hidden" />

    <div class="mt-10 flex justify-end border-t border-gray-900/10 pt-8">
        <x-forms::buttons.fake-button :buttonText="'Submit'" />
        <x-forms::buttons.submit-button :buttonText="'Submit'" />
    </div>
</form>
```

## Form Modal Usage

Include ```forms-modal``` into your ```layouts.app.blade.php``` file, trigger with a button.
You can customize which layout blade file is used in the ```config/forms.php``` file

```php
<button onclick="Livewire.dispatch('openModal')">Show Modal</button>
@livewire('forms-modal')
```

## Tailwindcss classes

Add laravel-forms to your tailwind.config.js file.

```javascript
content: [
    './vendor/fuelviews/laravel-forms/resources/**/*.blade.php',
]
```

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

- [Joshua Mitchener](https://github.com/thejmitchener)
- [Daniel Clark](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
- [All Contributors](../../contributors)

## Support us

Fuelviews is a web development agency based in Portland, Maine. You'll find an overview of all our projects [on our website](https://fuelviews.com).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
