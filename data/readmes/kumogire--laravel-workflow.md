# Laravel Workflow

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kumogire/laravel-workflow.svg?style=flat-square)](https://packagist.org/packages/kumogire/laravel-workflow)
[![Total Downloads](https://img.shields.io/packagist/dt/kumogire/laravel-workflow.svg?style=flat-square)](https://packagist.org/packages/kumogire/laravel-workflow)
[![License](https://img.shields.io/packagist/l/kumogire/laravel-workflow.svg?style=flat-square)](https://packagist.org/packages/kumogire/laravel-workflow)


A flexible, database-driven workflow system for Laravel applications.

## Installation

```bash
composer require kumogire/laravel-workflow
```

Run the installation command:

```bash
php artisan workflow:install
```

This will publish the configuration file and run the database migrations.

## Configuration

The configuration file is published to `config/workflow.php`. You can customize:

- User model
- Route prefixes and middleware
- Action handlers
- Queue settings
- Cache settings

To manually publish the configuration:

```bash
php artisan vendor:publish --tag=workflow-config
```

## Basic Usage

### Using the Workflow Facade

The package automatically registers the `Workflow` facade for convenient access.

```php
use Kumogire\Workflow\Facades\Workflow;
use Kumogire\Workflow\Models\Workflow as WorkflowModel;

// Get a workflow
$workflow = WorkflowModel::find(1);
$user = auth()->user();

// Start a workflow instance
$instance = Workflow::startWorkflow($workflow, $user);

// Complete the current step
$instance = Workflow::completeStep($instance, $user, [
    'answer' => 'yes',
    'score' => 85,
]);

// Get current step details
$details = Workflow::getCurrentStepDetails($instance, $user);

// Manage workflow state
Workflow::pauseWorkflow($instance);
Workflow::resumeWorkflow($instance);
Workflow::abandonWorkflow($instance);
```

### Using Dependency Injection

You can also inject the service directly into your controllers or classes:

```php
use Kumogire\Workflow\Services\WorkflowService;

class OnboardingController extends Controller
{
    public function __construct(
        protected WorkflowService $workflowService
    ) {}
    
    public function start(Workflow $workflow)
    {
        $instance = $this->workflowService->startWorkflow(
            $workflow, 
            auth()->user()
        );
        
        return response()->json($instance);
    }
    
    public function completeStep(WorkflowInstance $instance, Request $request)
    {
        $instance = $this->workflowService->completeStep(
            $instance,
            auth()->user(),
            $request->validated()
        );
        
        return response()->json($instance);
    }
}
```

### Creating Workflows

Create workflows programmatically or through your admin interface:

```php
use Kumogire\Workflow\Models\Workflow;
use Kumogire\Workflow\Models\WorkflowStep;

$workflow = Workflow::create([
    'name' => 'Employee Onboarding',
    'description' => 'Complete onboarding process for new employees',
    'type' => 'onboarding',
    'is_active' => true,
]);

// Add steps
WorkflowStep::create([
    'workflow_id' => $workflow->id,
    'order' => 1,
    'title' => 'Complete Profile',
    'description' => 'Fill out your employee profile',
    'type' => 'form',
    'configuration' => [
        'fields' => ['name', 'phone', 'address']
    ],
    'can_complete_roles' => ['employee'],
]);

WorkflowStep::create([
    'workflow_id' => $workflow->id,
    'order' => 2,
    'title' => 'Manager Approval',
    'description' => 'Wait for manager to approve your profile',
    'type' => 'approval',
    'can_complete_roles' => ['manager', 'admin'],
]);
```

## Advanced Features

### Conditional Steps

Steps can be conditionally executed or skipped based on data:

```php
WorkflowStep::create([
    'workflow_id' => $workflow->id,
    'order' => 3,
    'title' => 'Additional Training',
    'condition_type' => 'if_data_equals',
    'condition_config' => [
        'field' => 'department',
        'value' => 'engineering'
    ],
    'skip_if_condition_false' => true,
]);
```

**Available condition types:**
- `always` - Always execute (default)
- `if_data_equals` - Check if field equals value
- `if_data_contains` - Check if array field contains value
- `if_role` - Check if user has specific role

### Step Permissions

Control who can view and complete each step:

```php
WorkflowStep::create([
    'workflow_id' => $workflow->id,
    'order' => 1,
    'title' => 'HR Review',
    'can_view_roles' => ['hr', 'admin'],
    'can_complete_roles' => ['hr', 'admin'],
]);
```

Empty role arrays mean any authenticated user can access the step.

### Workflow Actions

Actions trigger automatically when steps start or complete:

```php
use Kumogire\Workflow\Models\WorkflowAction;

WorkflowAction::create([
    'workflow_step_id' => $step->id,
    'type' => 'email',
    'trigger' => 'on_step_complete',
    'configuration' => [
        'to' => '{{user.email}}',
        'template' => 'onboarding-welcome',
        'subject' => 'Welcome aboard!',
    ],
]);
```

**Built-in action types:**
- `email` - Send email notifications
- `sms` - Send SMS messages
- `webhook` - Call external webhooks
- `data_save` - Save data to database

**Trigger points:**
- `on_step_start` - When step begins
- `on_step_complete` - When step is completed

## Customization

### Custom Action Handlers

Create custom action handlers for specific integrations:

```php
namespace App\Workflow\Actions;

use Kumogire\Workflow\Contracts\ActionHandler;
use Kumogire\Workflow\Models\WorkflowAction;
use Kumogire\Workflow\Models\WorkflowInstance;

class SlackNotificationHandler implements ActionHandler
{
    public function handle(WorkflowAction $action, WorkflowInstance $instance): void
    {
        $config = $action->configuration;
        $channel = $config['channel'] ?? '#general';
        $message = $config['message'] ?? 'Workflow notification';
        
        // Send to Slack
        // \Slack::send($channel, $message);
    }
}
```

Register your custom handler in `config/workflow.php`:

```php
'action_handlers' => [
    'email' => \Kumogire\Workflow\Actions\Handlers\EmailActionHandler::class,
    'sms' => \Kumogire\Workflow\Actions\Handlers\SmsActionHandler::class,
    'webhook' => \Kumogire\Workflow\Actions\Handlers\WebhookActionHandler::class,
    'data_save' => \Kumogire\Workflow\Actions\Handlers\DataSaveActionHandler::class,
    'slack' => \App\Workflow\Actions\SlackNotificationHandler::class, // Your custom handler
],
```

### Events

The package dispatches events you can listen to:

- `WorkflowStarted` - When a workflow instance begins
- `StepStarted` - When a step is entered
- `StepCompleted` - When a step is finished
- `WorkflowCompleted` - When all steps are done
- `WorkflowPaused` - When a workflow is paused
- `WorkflowAbandoned` - When a workflow is cancelled

Example listener:

```php
namespace App\Listeners;

use Kumogire\Workflow\Events\WorkflowCompleted;

class SendCompletionNotification
{
    public function handle(WorkflowCompleted $event)
    {
        $instance = $event->instance;
        $user = $instance->user;
        
        // Send notification
        $user->notify(new WorkflowCompletedNotification($instance));
    }
}
```

### Extending Models

You can extend the package models if needed:

```php
namespace App\Models;

use Kumogire\Workflow\Models\Workflow as BaseWorkflow;

class Workflow extends BaseWorkflow
{
    // Add custom methods or relationships
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
```

Then update `config/workflow.php`:

```php
'models' => [
    'workflow' => \App\Models\Workflow::class,
],
```

## Workflow Action Examples

### Email Action

```
use Kumogire\Workflow\Models\WorkflowAction;

WorkflowAction::create([
    'workflow_step_id' => $step->id,
    'type' => 'email',
    'trigger' => 'on_step_complete',
    'configuration' => [
        'to' => '{{user.email}}',
        'subject' => 'Welcome to {{workflow.name}}!',
        'template' => 'emails.workflow.welcome',
        'data' => [
            'user_name' => '{{user.name}}',
            'workflow_name' => '{{workflow.name}}',
        ],
    ],
]);
```

### SMS Action

```
WorkflowAction::create([
    'workflow_step_id' => $step->id,
    'type' => 'sms',
    'trigger' => 'on_step_start',
    'configuration' => [
        'to' => '{{user.phone}}',
        'message' => 'Hi {{user.name}}, your next step is ready!',
    ],
]);
```

### Webhook Action

```
WorkflowAction::create([
    'workflow_step_id' => $step->id,
    'type' => 'webhook',
    'trigger' => 'on_step_complete',
    'configuration' => [
        'url' => 'https://api.example.com/workflow-notifications',
        'method' => 'POST',
        'headers' => [
            'Authorization' => 'Bearer YOUR_API_KEY',
            'Content-Type' => 'application/json',
        ],
        'payload' => [
            'user_id' => '{{user.id}}',
            'workflow_id' => '{{workflow.id}}',
            'step_completed' => true,
        ],
    ],
]);
```

### Data Save Action

```
WorkflowAction::create([
    'workflow_step_id' => $step->id,
    'type' => 'data_save',
    'trigger' => 'on_step_complete',
    'configuration' => [
        'model' => 'App\Models\UserProfile',
        'find_by' => [
            'user_id' => '{{user.id}}',
        ],
        'attributes' => [
            'onboarding_completed' => true,
            'completed_at' => now(),
        ],
    ],
]);
```

## API Endpoints

The package provides RESTful API endpoints (configurable via `config/workflow.php`):

```
GET    /api/workflows                    - List available workflows
GET    /api/workflows/{workflow}          - Get workflow details
POST   /api/workflow-instances            - Start a new workflow instance
GET    /api/workflow-instances/{instance} - Get instance details
POST   /api/workflow-instances/{instance}/complete-step - Complete current step
GET    /api/workflow-instances/user/{user} - List user's workflows
```

## API Usage Examples

### Start a Workflow

```
POST /api/workflows/instances
{
    "workflow_id": 1,
    "metadata": {
        "department": "engineering"
    }
}
```

### Get Current Step

```
GET /api/workflows/instances/1
Response:
json{
    "instance_id": 1,
    "status": "in_progress",
    "current_step": {
        "id": 2,
        "title": "Complete Profile",
        "description": "Fill out your details",
        "type": "form",
        "configuration": {
            "fields": ["name", "phone", "address"]
        },
        "can_view": true,
        "can_complete": true
    },
    "workflow": {
        "id": 1,
        "name": "Employee Onboarding",
        "type": "onboarding"
    }
}
```

### Complete Step

```
POST /api/workflows/instances/1/complete-step
{
    "data": {
        "name": "John Doe",
        "phone": "555-1234",
        "address": "123 Main St"
    }
}
```

### Admin: Create Workflow

```
POST /admin/workflows/workflows
{
    "name": "Employee Onboarding",
    "description": "Complete onboarding process",
    "type": "onboarding",
    "is_active": true
}
```

### Admin: Create Step

```
POST /admin/workflows/steps
{
    "workflow_id": 1,
    "order": 1,
    "title": "Complete Profile",
    "type": "form",
    "configuration": {
        "fields": ["name", "email", "phone"]
    },
    "can_complete_roles": ["employee"]
}
```

## API Documentation

Full API documentation is available in multiple formats:

- [Markdown Documentation](docs/API.md)
- [OpenAPI Specification](docs/openapi.yaml) - Import into Swagger UI
- [Postman Collection](docs/postman_collection.json) - Import into Postman

### Quick Start with Postman

1. Download the [Postman collection](docs/postman_collection.json)
2. Import into Postman
3. Set your `base_url` and `bearer_token` variables
4. Start making requests!


## Admin View Components

### Example: Dashboard with widgets

```
{{-- In project's resources/views/admin/dashboard.blade.php --}}
@extends('layouts.admin')

@section('content')
    <div class="space-y-6">
        {{-- Statistics --}}
        <x-workflow::workflow-stats />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {{-- Recent workflows --}}
            <x-workflow::recent-workflows :limit="5" />

            {{-- User's active workflows --}}
            <x-workflow::user-workflows status="in_progress" :limit="5" />
        </div>
    </div>
@endsection
```

### Example: Workflow management page

```
{{-- In parent project's resources/views/admin/workflows.blade.php --}}
@extends('layouts.admin')

@section('content')
    {{-- List all workflows --}}
    <x-workflow::workflow-list />

    {{-- Or filter by type --}}
    <x-workflow::workflow-list type="onboarding" />

    {{-- Show inactive workflows too --}}
    <x-workflow::workflow-list :show-inactive="true" />
@endsection
```

### Example: Create workflow form

```
{{-- In parent project's resources/views/admin/create-workflow.blade.php --}}
@extends('layouts.admin')

@section('content')
    <div class="max-w-2xl">
        <h1 class="text-2xl font-bold mb-6">Create Workflow</h1>
        
        <x-workflow::workflow-form>
            {{-- Custom cancel button in the slot --}}
            <a href="/admin/workflows" class="text-sm text-gray-600 hover:text-gray-900">
                Cancel
            </a>
        </x-workflow::workflow-form>
    </div>
@endsection
```

### Example: View workflow with steps

```
{{-- In parent project's resources/views/admin/view-workflow.blade.php --}}
@extends('layouts.admin')

@section('content')
    <div class="space-y-6">
        {{-- Workflow details --}}
        <div class="bg-white shadow rounded-lg p-6">
            <h1 class="text-2xl font-bold">{{ $workflow->name }}</h1>
            <p class="text-gray-600">{{ $workflow->description }}</p>
        </div>

        {{-- Steps with actions --}}
        <x-workflow::workflow-steps :workflow="$workflow" :show-actions="true" />
    </div>
@endsection
```

## Tests

# Run all tests
composer test

# Run specific test suite
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --testsuite Feature

# Run with coverage
composer test-coverage# Run all tests
composer test

# Run specific test suite
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --testsuite Feature

# Run with coverage
composer test-coverage

## Requirements

- PHP 8.1 or higher
- Laravel 10.x or 11.x

## License

MIT
