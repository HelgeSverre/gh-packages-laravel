# Inertia Form Generator

A small Laravel package that transforms your Laravel FormRequest validation rules into type-safe TypeScript definitions and ready-to-use Inertia useForm initializers.

The package parses FormRequest classes in app/Http/Requests, maps validation rules to TypeScript types (with support for class-based validation rules, enums and custom mappings), and exports a single TypeScript file with exported types and useForm instances for your front-end.

### Features

- Generates TypeScript type definitions from Laravel FormRequest rules.
- Generates Inertia useForm initializers for Vue, React or Svelte.
- Supports PHP 8.x enums used with the Enum validation rule.
- Allows custom type mappings via configuration.
- Command-line generator: php artisan inertia-form-generator:generate

### Requirements

- PHP: ^8.4 (as declared in composer.json)
- Laravel 9/10/11 compatible components (package depends on illuminate/* components via composer)

### Installation

1. Install with Composer:

```bash
composer require robtesch/inertia-form-generator --dev
```

2. Publish the configuration file (so you can change output path, front-end provider, custom mappings, etc.):

You can publish the config using either the provider or the package tag:

```bash
# By provider
php artisan vendor:publish --provider="RobTesch\InertiaFormGenerator\InertiaFormGeneratorServiceProvider" --tag="config"

# Or by tag (some projects may prefer this tag name)
php artisan vendor:publish --tag="inertia-form-generator-config"
```

### Configuration

The published config file config/inertia-form-generator.php contains the key options:

- output-file-path: string — Path where the generated TypeScript file will be written. Default: resources/js/formRequests.ts
- front-end-provider: string — One of: 'vue', 'react', 'svelte4', 'svelte5' (controls which useForm import is used). Default: 'vue'
- user-model: string|null — Fully qualified user model used to create a fake user when FormRequests rely on an authenticated user. Default: 'App\\Models\\User'
- custom_mappings: array — Map validation rule class names or string rule names to custom TypeScript type strings. Example: ['App\\Rules\\YourCustomRule' => 'string | null']

See config/inertia-form-generator.php for the exact defaults shipped with the package.

### Usage

1. Create or ensure you have FormRequest classes under app/Http/Requests with rules() defined as usual.

2. Run the generator command to produce the TypeScript file:

```bash
php artisan inertia-form-generator:generate
```

By default the command writes to the path configured in config/inertia-form-generator.php (resources/js/formRequests.ts by default) and prints the resulting path.

#### What gets generated

For each FormRequest found, the package will export a TypeScript type and a useForm initializer. Example output (illustrative):

```ts
import { useForm } from '@inertiajs/vue3';

export const exampleRequestForm = useForm({
  name: '' as string,
  age: null as number | null,
} satisfies ExampleRequest);
```

Once you have generated your TypeScript file, you can simply import the form you need in your front-end code.

```vue
// ExampleComponent.vue
<script setup lang="ts">
import { exampleRequestForm } from '@/js/formRequests';
import { usePage } from '@inertiajs/vue3';

const page = usePage();
//Optionally set default values
exampleRequestForm.defaults({
  name: page.props.auth.user.name,
  age: page.props.auth.user.age,
});
</script>

<template>
  <form @submit.prevent="exampleRequestForm.post('/example-request')">
    <input v-model="exampleRequestForm.name" type="text" />
    <input v-model="exampleRequestForm.age" type="number" />
    <button type="submit">Submit</button>
  </form>
</template>
```

You will benefit from type-safety and all of Inertia's amazing useForm features.

### Notes and behavior

- The generator maps common validation rules (string, integer, numeric, boolean, array, file, etc.) to TypeScript types. Complex or custom rule objects can be mapped by adding entries to custom_mappings in the config.
- Enum validation rules are supported; the generator will attempt to map PHP enums to a TypeScript string literal union and will set an initial value using the first enum case when possible.
- If a FormRequest needs an authenticated user, set the user-model config to a model that has a factory so the generator can instantiate a fake user during parsing. If you don't need this behavior, set user-model to null.
- The package uses auto-discovery (service provider is registered via composer extra) and registers a single Artisan command: inertia-form-generator:generate.

### Extending and Custom Mappings

Add mappings for custom rule classes or rule names in config/inertia-form-generator.php under the custom_mappings key. The key should be the validation rule string or the full class name of the rule, and the value should be the TypeScript type string you want to emit.

```php
'custom_mappings' => [
    App\Rules\GeoPoint::class => 'CustomPointInterface | null',
    'binary' => 'Blob',
],
```

### Excluding FormRequests

You can exclude FormRequests from being parsed by adding them to the exclude array in the config. This can be useful in cases where the validation is particularly complex and this generator is not able to parse it correctly.

```php
'exclude' => [
    \App\Http\Requests\ExampleRequest::class,
],
```

### Testing

Run the package tests with:

```bash
composer test
```

### Development notes

- Primary PHP entrypoint: src/InertiaFormGenerator.php
- Artisan command implementation: src/Commands/InertiaFormGeneratorCommand.php
- Package service provider: src/InertiaFormGeneratorServiceProvider.php
- Default config: config/inertia-form-generator.php

### License

This package is open-source under the MIT License — see LICENSE.md for details.

### Contributing

This package has primarily been developed and tested with my specific use case in mind. Fixes and improvements are welcome. Please open issues or pull requests on the project repository and follow the coding standards and test suites included in the package.

### Credits

- Author: Robert Teschmacher
