![GitHub branch check runs](https://img.shields.io/github/check-runs/yannelli/schematic/main?style=flat-square) ![Packagist Version](https://img.shields.io/packagist/v/yannelli/schematic?style=flat-square) 

# Schematic

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
    - [JSON Schema Defaults](#json-schema-defaults)
    - [Custom Models](#custom-models)
- [Creating Templates](#creating-templates)
    - [Adding Sections](#adding-sections)
    - [Defining Fields](#defining-fields)
    - [Array & Object Fields](#array-and-object-fields)
- [Ephemeral Templates](#ephemeral-templates)
    - [Creating Ephemeral Templates](#creating-ephemeral-templates)
    - [Ephemeral Schema & Rendering](#ephemeral-schema-and-rendering)
- [JSON Schema Generation](#json-schema-generation)
    - [Template Schemas](#template-schemas)
    - [Section Schemas](#section-schemas)
    - [Using With Anthropic](#using-with-anthropic)
    - [Using With OpenAI](#using-with-openai)
- [Managing Sections](#managing-sections)
    - [Enabling & Disabling Sections](#enabling-and-disabling-sections)
    - [Reordering Sections](#reordering-sections)
    - [Iterating Sections](#iterating-sections)
    - [Adding & Removing Fields](#adding-and-removing-fields)
- [Rendering Templates](#rendering-templates)
    - [Full Template Rendering](#full-template-rendering)
    - [Previewing With Examples](#previewing-with-examples)
- [Template Syntax](#template-syntax)
- [Custom Macros](#custom-macros)
- [Extending Models](#extending-models)
- [License](#license)

<a name="introduction"></a>
## Introduction

Schematic is a templating engine for Laravel that generates JSON Schema definitions from your templates. It is designed for use with LLM structured output APIs such as those provided by OpenAI and Anthropic, allowing you to define templates with typed fields and automatically produce valid JSON Schema for tool use and structured responses. Templates can be persisted to the database or created as [ephemeral (in-memory) templates](#ephemeral-templates) for on-the-fly use without any database overhead.

<a name="installation"></a>
## Installation

Install Schematic via Composer:

```bash
composer require yannelli/schematic
```

After installing, publish and run the migrations:

```bash
php artisan vendor:publish --tag=schematic-migrations
php artisan migrate
```

You may optionally publish the configuration file:

```bash
php artisan vendor:publish --tag=schematic-config
```

<a name="configuration"></a>
## Configuration

The Schematic configuration file is located at `config/schematic.php`. Each configuration option is documented below.

<a name="json-schema-defaults"></a>
### JSON Schema Defaults

The `schema` options control the defaults used when generating JSON Schema output:

| Option | Environment Variable | Default | Description |
|---|---|---|---|
| `schema.draft` | — | `https://json-schema.org/draft/2020-12/schema` | The JSON Schema draft URI included in schema documents. |
| `schema.strict` | — | `true` | When enabled, all generated schemas include `additionalProperties: false`. |

<a name="custom-models"></a>
### Custom Models

If you need to extend the base Schematic models, you may specify your custom model classes in the `models` configuration array. See [Extending Models](#extending-models) for details.

<a name="creating-templates"></a>
## Creating Templates

To create a new template, use the `Schematic` facade's `create` method:

```php
use Yannelli\Schematic\Facades\Schematic;

$template = Schematic::create(
    slug: 'psychiatric-evaluation',
    name: 'Psychiatric Evaluation Note',
    description: 'Standard psychiatric evaluation template for initial patient encounters',
);
```

<a name="adding-sections"></a>
### Adding Sections

Once a template has been created, you may add sections to it using the `addSection` method. Each section defines a portion of the template with its own content, fields, and optional example data:

```php
$template->addSection(
    slug: 'chief-complaint',
    name: 'Chief Complaint',
    description: 'The primary reason the patient is seeking treatment',
    content: 'Chief Complaint: {{ complaint }}',
    fields: [
        [
            'name' => 'complaint',
            'type' => 'string',
            'description' => 'The patient\'s primary complaint in their own words',
            'required' => true,
            'nullable' => false,
        ],
    ],
    examples: [
        'complaint' => 'Patient reports increasing anxiety over the past 3 months',
    ],
);
```

<a name="defining-fields"></a>
### Defining Fields

Each field in a section requires a `name`, `type`, and `description`. You may also specify whether the field is `required` or `nullable`:

```php
$template->addSection(
    slug: 'mental-status-exam',
    name: 'Mental Status Exam',
    description: 'Structured mental status examination findings',
    content: <<<'TPL'
## Mental Status Exam
- Appearance: {{ appearance }}
- Mood: {{ mood }}
- Affect: {{ affect }}
- Thought Process: {{ thought_process }}
@if(suicidal_ideation)
- **Suicidal Ideation: {{ suicidal_ideation }}**
@endif
TPL,
    fields: [
        ['name' => 'appearance', 'type' => 'string', 'description' => 'General appearance and grooming'],
        ['name' => 'mood', 'type' => 'string', 'description' => 'Patient\'s self-reported mood'],
        ['name' => 'affect', 'type' => 'enum', 'description' => 'Observed affect', 'enum' => ['flat', 'blunted', 'constricted', 'full', 'labile']],
        ['name' => 'thought_process', 'type' => 'string', 'description' => 'Organization and flow of thoughts'],
        ['name' => 'suicidal_ideation', 'type' => 'string', 'description' => 'Details of suicidal ideation if present', 'required' => false, 'nullable' => true],
    ],
    examples: [
        'appearance' => 'Well-groomed, appropriately dressed, good hygiene',
        'mood' => 'Anxious',
        'affect' => 'constricted',
        'thought_process' => 'Linear and goal-directed',
        'suicidal_ideation' => null,
    ],
);
```

When a field's `type` is set to `enum`, you should provide an `enum` array containing the allowed values. Fields are required by default; set `required` to `false` and `nullable` to `true` for optional fields.

<a name="array-and-object-fields"></a>
### Array & Object Fields

For more complex data structures, you may define fields with `array` and `object` types. Array fields require an `items` key describing the structure of each element:

```php
$template->addSection(
    slug: 'diagnoses',
    name: 'Diagnoses',
    content: <<<'TPL'
## Diagnoses
@foreach(diagnoses as dx)
- {{ dx.code }}: {{ dx.description }}
@endforeach
TPL,
    fields: [
        [
            'name' => 'diagnoses',
            'type' => 'array',
            'description' => 'List of ICD-10 diagnoses',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'code' => ['type' => 'string', 'description' => 'ICD-10 code'],
                    'description' => ['type' => 'string', 'description' => 'Diagnosis description'],
                ],
                'required' => ['code', 'description'],
            ],
        ],
    ],
    examples: [
        'diagnoses' => [
            ['code' => 'F41.1', 'description' => 'Generalized anxiety disorder'],
            ['code' => 'F32.1', 'description' => 'Major depressive disorder, single episode, moderate'],
        ],
    ],
);
```

<a name="ephemeral-templates"></a>
## Ephemeral Templates

Ephemeral templates are in-memory templates that are **not persisted to the database**. They are useful for one-off or dynamic templates that you build at runtime — no migrations or database queries required.

Ephemeral templates support the same core features as database-backed templates: sections, fields, JSON Schema generation, rendering, and previewing.

<a name="creating-ephemeral-templates"></a>
### Creating Ephemeral Templates

Use the `ephemeral` method on the `Schematic` facade to create an in-memory template:

```php
use Yannelli\Schematic\Facades\Schematic;

$template = Schematic::ephemeral(
    slug: 'intake-form',
    name: 'Patient Intake Form',
    description: 'A quick intake form built on the fly',
);

$template->addSection(
    slug: 'demographics',
    name: 'Demographics',
    content: '{{ patient_name }}, Age: {{ age }}',
    fields: [
        ['name' => 'patient_name', 'type' => 'string', 'description' => 'Full name'],
        ['name' => 'age', 'type' => 'integer', 'description' => 'Patient age'],
    ],
    examples: ['patient_name' => 'Jane Doe', 'age' => 34],
);
```

You may also create ephemeral templates directly via the `EphemeralTemplate` class:

```php
use Yannelli\Schematic\Ephemeral\EphemeralTemplate;

$template = EphemeralTemplate::make('quick-note', 'Quick Note');
$section = $template->addSection('body', 'Body', content: '{{ note }}');
$section->addField('note', 'string', 'The note content');
```

Sections on ephemeral templates support the same fluent methods as database-backed sections, including `addField`, `removeField`, `enable`, `disable`, and `setExamples`. All mutations happen in memory.

<a name="ephemeral-schema-and-rendering"></a>
### Ephemeral Schema & Rendering

Ephemeral templates generate JSON Schema and render content exactly like their database-backed counterparts:

```php
// JSON Schema generation
$schema = $template->toJsonSchema();
$doc = $template->toJsonSchemaDocument();
$sectionSchema = $template->sectionSchema('demographics');

// Rendering with data
$output = $template->render([
    'demographics' => ['patient_name' => 'Alice Smith', 'age' => 28],
]);

// Preview using example data
$preview = $template->preview();
```

Section management works identically — you can iterate, reorder, enable, and disable sections:

```php
$template->section('demographics')->disable();
$template->reorderSections(['body', 'demographics']);

foreach ($template->iterateSections() as $section) {
    // Only enabled sections
}
```

<a name="json-schema-generation"></a>
## JSON Schema Generation

Schematic generates JSON Schema definitions from your templates, ready for use with LLM structured output APIs.

<a name="template-schemas"></a>
### Template Schemas

To generate a JSON Schema for an entire template, use the `toJsonSchema` method on a template instance. For a full schema document including the `$schema` header, use `toJsonSchemaDocument`:

```php
use Yannelli\Schematic\Facades\Schematic;

// Schema object
$schema = $template->toJsonSchema();

// Full document with $schema header
$doc = $template->toJsonSchemaDocument();

// Via facade
$schema = Schematic::schema('psychiatric-evaluation');
$doc = Schematic::schemaDocument('psychiatric-evaluation');
```

<a name="section-schemas"></a>
### Section Schemas

You may also generate a schema for a single section:

```php
$mseSchema = $template->sectionSchema('mental-status-exam');

// Via facade
$sectionSchema = Schematic::sectionSchema('psychiatric-evaluation', 'chief-complaint');
```

The generated schema for the `mental-status-exam` section would look like the following:

```json
{
  "type": "object",
  "properties": {
    "appearance": {
      "type": "string",
      "description": "General appearance and grooming"
    },
    "mood": {
      "type": "string",
      "description": "Patient's self-reported mood"
    },
    "affect": {
      "type": "string",
      "enum": ["flat", "blunted", "constricted", "full", "labile"],
      "description": "Observed affect"
    },
    "thought_process": {
      "type": "string",
      "description": "Organization and flow of thoughts"
    },
    "suicidal_ideation": {
      "type": ["string", "null"],
      "description": "Details of suicidal ideation if present"
    }
  },
  "required": ["appearance", "mood", "affect", "thought_process", "suicidal_ideation"],
  "description": "Structured mental status examination findings",
  "additionalProperties": false
}
```

<a name="using-with-anthropic"></a>
### Using With Anthropic

To use a Schematic template with the Anthropic API, pass the generated schema as a tool's `input_schema`:

```php
use Anthropic\Anthropic;
use Yannelli\Schematic\Facades\Schematic;

$schema = Schematic::schema('psychiatric-evaluation');

$response = Anthropic::messages()->create([
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 4096,
    'messages' => [
        ['role' => 'user', 'content' => $transcriptText],
    ],
    'tools' => [
        [
            'name' => 'generate_note',
            'description' => 'Generate a structured psychiatric evaluation note',
            'input_schema' => $schema,
        ],
    ],
    'tool_choice' => ['type' => 'tool', 'name' => 'generate_note'],
]);
```

<a name="using-with-openai"></a>
### Using With OpenAI

When using OpenAI's structured output, pass the schema document to the `response_format` parameter:

```php
use OpenAI\Laravel\Facades\OpenAI;
use Yannelli\Schematic\Facades\Schematic;

$schema = Schematic::schemaDocument('psychiatric-evaluation');

$response = OpenAI::chat()->create([
    'model' => 'gpt-4o',
    'messages' => [
        ['role' => 'user', 'content' => $transcriptText],
    ],
    'response_format' => [
        'type' => 'json_schema',
        'json_schema' => [
            'name' => 'psychiatric_evaluation',
            'strict' => true,
            'schema' => $schema,
        ],
    ],
]);
```

> [!NOTE]
> OpenAI's structured output requires the full schema document (via `schemaDocument`), while Anthropic's tool use expects the schema object (via `schema`).

<a name="managing-sections"></a>
## Managing Sections

<a name="enabling-and-disabling-sections"></a>
### Enabling & Disabling Sections

You may enable or disable individual sections on a template. Disabled sections are excluded from both schema generation and rendering:

```php
$template->section('diagnoses')->disable();

// Only enabled sections are included
$schema = $template->toJsonSchema();
$output = $template->render($data);

$template->section('diagnoses')->enable();
```

<a name="reordering-sections"></a>
### Reordering Sections

To change the order in which sections appear, pass an array of section slugs to the `reorderSections` method:

```php
$template->reorderSections([
    'chief-complaint',
    'diagnoses',
    'mental-status-exam',
]);
```

<a name="iterating-sections"></a>
### Iterating Sections

To iterate over a template's sections, use the `iterateSections` method. By default, only enabled sections are returned in their defined order:

```php
foreach ($template->iterateSections() as $section) {
    echo "{$section->name}: " . ($section->is_enabled ? 'ON' : 'OFF') . "\n";
    echo json_encode($section->toJsonSchema(), JSON_PRETTY_PRINT) . "\n\n";
}
```

To include disabled sections, use `iterateAllSections`:

```php
foreach ($template->iterateAllSections() as $section) {
    // ...
}
```

<a name="adding-and-removing-fields"></a>
### Adding & Removing Fields

You may add or remove fields from an existing section:

```php
$section = $template->section('chief-complaint');

$section->addField(
    name: 'onset',
    type: 'string',
    description: 'When symptoms first appeared',
    required: false,
);

$section->removeField('onset');
```

<a name="rendering-templates"></a>
## Rendering Templates

<a name="full-template-rendering"></a>
### Full Template Rendering

To render a template with data, pass an associative array keyed by section slug to the `render` method:

```php
$data = [
    'chief-complaint' => [
        'complaint' => 'Increasing anxiety and panic attacks',
    ],
    'mental-status-exam' => [
        'appearance' => 'Casually dressed, fidgeting',
        'mood' => 'Anxious',
        'affect' => 'constricted',
        'thought_process' => 'Circumstantial at times',
    ],
    'diagnoses' => [
        'diagnoses' => [
            ['code' => 'F41.0', 'description' => 'Panic disorder'],
        ],
    ],
];

echo $template->render($data);

// Via facade
echo Schematic::render('psychiatric-evaluation', $data);
```

<a name="previewing-with-examples"></a>
### Previewing With Examples

When you have defined example data on your sections, you may preview the rendered output without providing data manually. To set example data on a section, use the `setExamples` method:

```php
$template->section('chief-complaint')->setExamples([
    'complaint' => 'Patient reports difficulty sleeping for the past 2 weeks',
]);
```

To preview a single section or the entire template using its example data:

```php
// Preview a single section
echo $template->section('chief-complaint')->preview();

// Preview the entire template
echo $template->preview();

// Via facade
echo Schematic::preview('psychiatric-evaluation');
```

<a name="template-syntax"></a>
## Template Syntax

Schematic provides a lightweight template syntax for defining section content:

| Syntax | Description |
|---|---|
| `{{ variable }}` | Variable substitution. |
| `{{ nested.key }}` | Dot-notation access for nested values. |
| `@if(var) ... @endif` | Conditional block; renders content only when `var` is truthy. |
| `@if(var) ... @else ... @endif` | Conditional with an else branch. |
| `@foreach(items as item) ... @endforeach` | Iterate over an array. |
| `@macroName("arg1", "arg2")` | Invoke a registered custom macro. |

<a name="custom-macros"></a>
## Custom Macros

You may register custom macros to extend the template syntax. Macros should be registered in a service provider's `boot` method:

```php
use Yannelli\Schematic\Facades\Schematic;

public function boot(): void
{
    Schematic::macro('component', fn (string $name) => view("components.{$name}")->render());
    Schematic::macro('timestamp', fn () => now()->toDateTimeString());
    Schematic::macro('badge', fn (string $label, string $color) => "<span class=\"badge badge-{$color}\">{$label}</span>");
}
```

Once registered, macros may be used in any template content:

```
@component("vital-signs")
Generated at: @timestamp()
Status: @badge("Active", "green")
```

<a name="extending-models"></a>
## Extending Models

If you need to add custom behavior to the Schematic models, you may extend the base `Template` and `Section` classes and register them in the configuration:

```php
// config/schematic.php
'models' => [
    'template' => App\Models\CustomTemplate::class,
    'section' => App\Models\CustomSection::class,
],
```

Your custom models should extend the corresponding base classes:

```php
use Yannelli\Schematic\Models\Template;

class CustomTemplate extends Template
{
    // Add your custom logic
}
```

<a name="credis"></a>

## Credits
- [Ryan Yannelli](https://ryanyannelli.com)
  - [Website](https://ryanyannelli.com)
  - [GitHub](https://github.com/yannelli)
- [Nextvisit AI](https://nextvisit.ai)
- [All Contributors](../../contributors)


<a name="license"></a>
## License

Schematic is open-sourced software licensed under the [MIT license](LICENSE).
