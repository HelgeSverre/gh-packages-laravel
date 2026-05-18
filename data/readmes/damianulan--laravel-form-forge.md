# Laravel FormForge

[![Laravel](https://img.shields.io/badge/made_with-Laravel-red?style=for-the-badge)](https://laravel.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

Laravel FormForge is a PHP-first form builder for Laravel applications.

It lets you define forms as classes, build fields in PHP, render Bootstrap-friendly markup from Blade, validate with standard Laravel rules, and optionally hydrate Eloquent models from request data.

## Contents

- [Why FormForge](#why-formforge)
- [Requirements](#requirements)
- [Installation](#installation)
- [Published Assets and Resources](#published-assets-and-resources)
- [Front-End Requirements](#front-end-requirements)
- [Quick Start](#quick-start)
- [Rendering in Blade](#rendering-in-blade)
- [Validation](#validation)
- [Hydrating Models From Request Data](#hydrating-models-from-request-data)
- [Form Lifecycle](#form-lifecycle)
- [FormBuilder API](#formbuilder-api)
- [Component Overview](#component-overview)
- [Buttons](#buttons)
- [Configuration](#configuration)
- [Events](#events)
- [Documentation Map](#documentation-map)

## Why FormForge

FormForge is designed for applications where forms are part of your backend domain layer, not just loose Blade markup.

It is useful when you want:

- reusable form classes for create and edit flows,
- one place for field definitions and validation rules,
- request and model autofill behavior,
- consistent rendering across many forms,
- select, date, tooltip, and file helpers out of the box,
- a package that still feels close to normal Laravel conventions.

## Requirements

- PHP `^8.3`
- `illuminate/support` `^9.0|^10.0|^11.0|^12.0`
- `mews/purifier` `^3.4`

## Installation

Install the package:

```bash
composer require damianulan/laravel-form-forge
```

Laravel package discovery registers the service provider automatically.

Publish everything:

```bash
php artisan vendor:publish --tag=formforge
```

Or publish only the parts you need:

```bash
php artisan vendor:publish --tag=formforge-config
php artisan vendor:publish --tag=formforge-langs
php artisan vendor:publish --tag=formforge-views
php artisan vendor:publish --tag=formforge-resources
```

## Published Assets and Resources

Publishing `formforge` or `formforge-resources` copies package front-end files to:

- `resources/vendor/formforge/style`
- `resources/vendor/formforge/js`

Publishing `formforge-config` creates:

- `config/formforge.php`

Publishing `formforge-views` creates:

- `resources/views/vendor/formforge`

Publishing `formforge-langs` creates:

- `lang/vendor/formforge`

The `formforge` tag also publishes the package stub to `stubs/form.stub`.

## Front-End Requirements

FormForge renders server-side HTML, but some components expect front-end helpers for the final experience.

The shipped assets integrate with:

- jQuery
- `chosen-js`
- `flatpickr`
- `tippy.js`
- Bootstrap-style markup/classes
- Bootstrap Icons for tooltip icons

Include the package stylesheet in your main stylesheet:

```scss
@import "resources/vendor/formforge/style/_formforge";
```

You can customize package variables in:

```text
resources/vendor/formforge/style/_variables.scss
```

Before your main JS bundle, print the package runtime variables:

```blade
@formForgeScripts
<script src="{{ asset('themes/js/app.js') }}"></script>
```

This injects localized values used by the package JavaScript, including:

- select placeholders,
- select "no results" text,
- configured date format,
- configured time format,
- configured datetime format.

After publishing or updating package resources, rebuild your front-end assets.

## Quick Start

Generate a form class:

```bash
php artisan make:form CampaignForm
```

Generated form classes live in `App\Forms` and extend `FormForge\Base\Form`.

Example form:

```php
<?php

namespace App\Forms;

use App\Models\Campaign;
use App\Models\ObjectiveTemplate;
use FormForge\Base\Form;
use FormForge\Base\FormComponent;
use FormForge\Components\Button;
use FormForge\Components\Dictionary;
use FormForge\FormBuilder;

class CampaignForm extends Form
{
    public function definition(FormBuilder $builder): FormBuilder
    {
        $isEdit = $this->model instanceof Campaign;

        return $builder
            ->setId($isEdit ? 'campaign_edit_form' : 'campaign_create_form')
            ->setMethod($isEdit ? 'PUT' : 'POST')
            ->setAction($isEdit
                ? route('campaigns.update', $this->model)
                : route('campaigns.store'))
            ->setTemplate('horizontal')
            ->setTitle($isEdit ? 'Edit campaign' : 'Create campaign')
            ->class('campaign-form')
            ->add(FormComponent::hiddenId(default: $this->model))
            ->add(
                FormComponent::text('name', $this->model)
                    ->label('Name')
                    ->placeholder('Enter campaign name')
                    ->required()
                    ->maxlength(120)
            )
            ->add(
                FormComponent::textarea('description', $this->model)
                    ->label('Description')
                    ->col(12)
            )
            ->add(
                FormComponent::select(
                    'template_id',
                    $this->template_id,
                    Dictionary::fromModel(ObjectiveTemplate::class, 'name')
                )
                    ->label('Template')
                    ->required()
                    ->noEmpty()
            )
            ->add(
                FormComponent::datetime('deadline', $this->model)
                    ->label('Deadline')
                    ->info('Choose the deadline for this campaign')
            )
            ->add(
                FormComponent::switch('draft', $this->model)
                    ->label('Draft')
                    ->default(false)
            )
            ->addButton(Button::back())
            ->addSubmit();
    }

    public function validation(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'template_id' => ['required', 'integer'],
            'deadline' => ['nullable', 'date'],
            'draft' => ['boolean'],
        ];
    }
}
```

## Rendering in Blade

In a controller:

```php
public function create()
{
    return view('campaigns.form', [
        'form' => CampaignForm::bootWithRequest()->getDefinition(),
    ]);
}

public function edit(Campaign $campaign)
{
    return view('campaigns.form', [
        'form' => CampaignForm::bootWithModel($campaign)->getDefinition(),
    ]);
}
```

In Blade:

```blade
{{ $form->title() }}

<div class="container-fluid">
    {{ $form->render() }}
</div>

@push('scripts')
    {{ $form->scripts() }}
@endpush
```

`render()` outputs the form markup.

`scripts()` outputs a small form-specific runtime view. It does not replace your compiled package JavaScript bundle.

## Validation

Every form class must define:

- `definition(FormBuilder $builder): FormBuilder`
- `validation(): array`

Validate and redirect back on failure:

```php
$form->validate();
```

Get a structured response instead:

```php
$result = $form->validateJson();

// [
//     'status' => 'ok' | 'error',
//     'messages' => ...
// ]
```

Access the raw Laravel validator:

```php
$validator = $form->validator();

$form->passes();
$form->fails();
```

Override custom messages:

```php
protected function messages(): array
{
    return [
        'name.required' => 'Campaign name is required.',
    ];
}
```

Override custom attributes when needed:

```php
protected function attributes(): array
{
    return [
        'name' => 'campaign name',
    ];
}
```

By default, `attributes()` maps component names to component labels when possible.

## Hydrating Models From Request Data

If you want a model to fill itself from request data, use the `FormForge\Traits\RequestForms` trait:

```php
<?php

namespace App\Models;

use FormForge\Traits\RequestForms;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use RequestForms;

    protected $fillable = [
        'name',
        'description',
        'deadline',
        'draft',
    ];
}
```

Then in your controller:

```php
public function store(CampaignForm $form)
{
    $form->validate();

    $campaign = Campaign::fillFromRequest();
    $campaign->save();

    return redirect()->route('campaigns.index');
}

public function update(Campaign $campaign, CampaignForm $form)
{
    $form->validate();

    $campaign = Campaign::fillFromRequest($campaign->getKey());
    $campaign->save();

    return redirect()->route('campaigns.show', $campaign);
}
```

What `fillFromRequest()` does:

- fills only attributes allowed by `$fillable`,
- stores uploaded files when file handling is enabled,
- converts `'on'` and `'off'` values for checkbox-like inputs,
- respects boolean casts,
- can populate personstamp columns if configured.

## Form Lifecycle

The base form class supports three common boot flows.

### `bootWithRequest()`

Fill the form from the current request:

```php
$form = CampaignForm::bootWithRequest();
```

Or with an explicit request instance:

```php
$form = CampaignForm::bootWithRequest($request);
```

### `bootWithAttributes()`

Fill the form from an array of attributes:

```php
$form = CampaignForm::bootWithAttributes([
    'draft' => true,
]);
```

By default, current request input is merged after those attributes. Disable that when needed:

```php
$form = CampaignForm::bootWithAttributes([
    'draft' => true,
], withRequest: false);
```

### `bootWithModel()`

Fill the form from an Eloquent model:

```php
$form = CampaignForm::bootWithModel($campaign);
```

This is the most common edit-form flow.

Current request input is merged after model attributes by default, so failed validation or partial edits can still repopulate the form correctly.

### Container resolution

If Laravel resolves the form from the container, the service provider automatically:

- calls `boot()`,
- fills the form with current request input,
- builds the definition,
- marks the form as booted.

That means this works:

```php
public function store(CampaignForm $form)
{
    $form->validate();
}
```

## FormBuilder API

`FormForge\FormBuilder` collects form metadata, components, sections, and buttons.

Common methods:

- `setId(string $id)`
- `setMethod(string $method)`
- `setAction(string $action)`
- `setTemplate(string|FormForge\Enums\ForgeTemplate $template)`
- `setTitle(string $title)`
- `class(string ...$classes)`
- `add(?RenderableComponent $component, ?Closure $condition = null)`
- `addSection(string $title, Closure $callback)`
- `addSubmit(string $class = 'btn-primary')`
- `addButton(Button $button)`
- `authorize(Closure $callback)`
- `when(bool $condition, Closure $then)`
- `render()`
- `scripts()`
- `getComponents()`

Conditional composition:

```php
return $builder
    ->when($this->draft === true, function (FormBuilder $builder): void {
        $builder->add(
            FormComponent::text('draft_reason')
                ->label('Draft reason')
        );
    });
```

Authorization:

```php
return $builder
    ->authorize(fn () => auth()->user()?->can('campaigns.manage') ?? false)
    ->addSubmit();
```

If authorization fails, the builder throws `FormForge\Exceptions\FormUnauthorized`.

## Component Overview

Component factories live on `FormForge\Base\FormComponent`.

Available factories:

- `text()`
- `numeric()`
- `decimal()`
- `password()`
- `hidden()`
- `hiddenId()`
- `select()`
- `multiselect()`
- `container()`
- `textarea()`
- `datetime()`
- `time()`
- `date()`
- `daterange()`
- `birthdate()`
- `radio()`
- `checkbox()`
- `switch()`
- `file()`

Common fluent methods shared by most components:

- `label()`
- `key()`
- `required()`
- `disabled()`
- `readonly()`
- `placeholder()`
- `value()`
- `purifyValue()`
- `class()`
- `info()`
- `autocomplete()`
- `col()`
- `when()`

Example:

```php
FormComponent::text('title')
    ->label('Title')
    ->placeholder('Enter title')
    ->required()
    ->maxlength(255);

FormComponent::decimal('budget')
    ->label('Budget')
    ->info('Use a decimal value such as 1000.00');

FormComponent::date('starts_at')
    ->label('Start date')
    ->minDate(now()->format('Y-m-d'));

FormComponent::multiselect(
    'user_ids',
    $selectedIds,
    Dictionary::fromModel(\App\Models\User::class, 'name')
)->label('Users');
```

For deeper component guides, see the docs listed below.

## Buttons

You can add explicit buttons or let the builder create the default submit button.

Helpers on `FormForge\Components\Button`:

- `submit()`
- `back()`
- `reset()`
- `delete()`

Example:

```php
use FormForge\Components\Button;

return $builder
    ->addButton(Button::back())
    ->addButton(Button::reset())
    ->addButton(Button::delete(href: route('campaigns.destroy', $this->model)))
    ->addSubmit();
```

## Configuration

The published config file is `config/formforge.php`.

Main options:

- `default`: default form template
- `templates`: template-specific configuration placeholders
- `date_format`
- `time_format`
- `datetime_format`
- `storage.handling_files`
- `storage.path`
- `dispatches_events`
- `personstamps.fields`
- `personstamps.type`
- `personstamps.table`
- `mews_purifier_setting`

Example:

```php
'default' => env('FORMFORGE_TEMPLATE', 'horizontal'),
'date_format' => env('FORMFORGE_DATE_FORMAT', 'Y-m-d'),
'time_format' => env('FORMFORGE_TIME_FORMAT', 'H:i'),
'datetime_format' => env('FORMFORGE_DATETIME_FORMAT', 'Y-m-d H:i'),
```

Shipped templates:

- `horizontal`
- `vertical`
- `2columns`
- `grid`

Set a form template per form:

```php
$builder->setTemplate('vertical');
```

## Events

When `dispatches_events` is enabled, FormForge can dispatch events during rendering and validation failure flows.

Available events:

- `FormForge\Events\FormRendering`
- `FormForge\Events\FormRendered`
- `FormForge\Events\FormValidationFail`

Use these when you need custom logging, analytics, auditing, or side effects around form rendering and validation behavior.

## Documentation Map

- [Examples](docs/EXAMPLES.md)
- [Docs Index](docs/README.md)
- [Common Component Methods](docs/components/COMPONENTS.md)
- [Text and Numeric Inputs](docs/components/INPUTS.md)
- [Selects and Option Dictionaries](docs/components/SELECTS.md)
- [Dates and Time Inputs](docs/components/DATES.md)
- [Checkboxes, Switches, and Radios](docs/components/CHECKBOXES.md)
- [File Inputs](docs/components/FILE.md)
- [Sections](docs/components/SECTIONS.md)

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).
