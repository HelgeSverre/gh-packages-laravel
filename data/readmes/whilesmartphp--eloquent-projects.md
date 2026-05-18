# Eloquent Projects

Polymorphic project container for Laravel applications.

## Features

- **Polymorphic Ownership**: Any model can own projects (workspaces, teams, orgs, users)
- **Polymorphic Creator**: Track who or what created a project (users, agents, systems)
- **Polymorphic Assignments**: Assign any entity to a project with a role
- **Configurable Statuses**: Define project lifecycle states via database
- **Archiving**: Soft archive/unarchive without deletion
- **Lifecycle Events**: Hooks for created, updated, deleted, archived, assigned, etc.
- **Middleware Hooks**: Before/after hooks on all controller actions
- **Customizable Models**: Override Project, ProjectStatus, ProjectAssignment via config
- **Child Model Support**: Any model can belong to a project via `BelongsToProject` trait
- **Laravel 10+, 11+, 12+ Support**

## Installation

```bash
composer require whilesmart/eloquent-projects
```

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=projects-config
```

### Run Migrations

```bash
php artisan migrate
```

## Quick Start

### Owning Projects

Add the `HasProjects` trait to any model that should own projects:

```php
use Whilesmart\Projects\Traits\HasProjects;

class Workspace extends Model
{
    use HasProjects;
}
```

```php
$workspace->createProject('My Design', $user);
$workspace->createProject('Campaign Q2', $aiAgent, 'Q2 marketing assets');
$workspace->projects; // all projects owned by this workspace
```

### Child Models

Add `BelongsToProject` to models that live inside a project:

```php
use Whilesmart\Projects\Traits\BelongsToProject;

class DesignVersion extends Model
{
    use BelongsToProject;
}
```

```php
$version->project;                           // parent project
DesignVersion::forProject($projectId)->get(); // all versions for a project
```

### Assignments

Assign any entity (user, agent, team) to a project with a role:

```php
use Whilesmart\Projects\Traits\AssignableToProject;

class User extends Model
{
    use AssignableToProject;
}
```

```php
// Assign
$project->assign($user, 'editor');
$project->assign($aiAgent, 'generator', $admin);
$project->assign($team, 'stakeholder', null, ['notify' => true]);

// Query
$project->assignments;                    // all assignments
$project->assignees('editor')->get();     // editors only
$project->isAssigned($user, 'editor');    // true

// From the assignable side
$user->assignedProjects()->get();            // all projects
$user->assignedProjects('editor')->get();    // projects where user is editor
$user->isAssignedToProject($project);        // true

// Unassign
$project->unassign($user, 'editor');   // remove specific role
$project->unassign($user);            // remove all roles
```

### Statuses

```php
use Whilesmart\Projects\Models\ProjectStatus;

ProjectStatus::create(['name' => 'Active', 'slug' => 'active', 'color' => '#22c55e']);
ProjectStatus::create(['name' => 'Paused', 'slug' => 'paused', 'color' => '#f59e0b']);
ProjectStatus::create(['name' => 'Completed', 'slug' => 'completed', 'color' => '#3b82f6']);

$project->update(['status_id' => $status->id]);
$project->status->name; // "Active"

Project::withStatus('active')->get();
```

### Archiving

```php
$project->archive();
$project->isArchived();  // true
$project->unarchive();

Project::active()->get();    // non-archived
Project::archived()->get();  // archived only
```

### Metadata

```php
$project = Project::create([
    'owner_type' => Workspace::class,
    'owner_id' => $ws->id,
    'title' => 'Campaign',
    'metadata' => ['budget' => 5000, 'deadline' => '2026-04-01'],
]);

$project->getMetadata('budget');              // 5000
$project->getMetadata('missing', 'default');  // 'default'
$project->setMetadata('priority', 'high');
$project->save();
```

## Events

| Event | Fired when |
|---|---|
| `ProjectCreated` | Project is created |
| `ProjectUpdated` | Project is updated |
| `ProjectDeleted` | Project is deleted |
| `ProjectArchived` | Project is archived |
| `ProjectUnarchived` | Project is unarchived |
| `ProjectAssigned` | Entity is assigned to a project |
| `ProjectUnassigned` | Entity is unassigned from a project |

## Configuration

```php
// config/projects.php
return [
    'models' => [
        'project' => \Whilesmart\Projects\Models\Project::class,
        'project_status' => \Whilesmart\Projects\Models\ProjectStatus::class,
        'project_assignment' => \Whilesmart\Projects\Models\ProjectAssignment::class,
    ],

    'register_routes' => true,
    'route_prefix' => '',
    'route_middleware' => ['auth:sanctum'],

    'middleware_hooks' => [],
];
```

### Custom Models

```php
class Project extends \Whilesmart\Projects\Models\Project
{
    // custom logic, relationships, scopes
}
```

```php
// config/projects.php
'models' => [
    'project' => App\Models\Project::class,
],
```

### Middleware Hooks

```php
use Whilesmart\Projects\Interfaces\MiddlewareHookInterface;

class ProjectHook implements MiddlewareHookInterface
{
    public function before(Request $request, string $action): ?Request
    {
        return $request;
    }

    public function after(Request $request, JsonResponse $response, string $action): JsonResponse
    {
        return $response;
    }
}
```

## API Routes

```
GET    /projects                List projects (filter: ?owner_type=, ?owner_id=, ?status=, ?archived=)
POST   /projects                Create project
GET    /projects/{id}           Show project
PUT    /projects/{id}           Update project
DELETE /projects/{id}           Delete project
POST   /projects/{id}/archive   Archive project
POST   /projects/{id}/unarchive Unarchive project
```

## Database Schema

### projects

| Column | Type | Description |
|---|---|---|
| owner_type / owner_id | morph | Polymorphic owner |
| creator_type / creator_id | morph (nullable) | Polymorphic creator (immutable) |
| status_id | FK (nullable) | References project_statuses |
| title | string | Project title |
| description | text (nullable) | Description |
| thumbnail_url | string (nullable) | Preview image |
| metadata | JSON (nullable) | Flexible data |
| archived_at | timestamp (nullable) | Archive timestamp |

### project_statuses

| Column | Type | Description |
|---|---|---|
| name | string | Display name |
| slug | string (unique) | Identifier |
| description | string (nullable) | Description |
| color | string (nullable) | Hex color |
| sort_order | integer | Display ordering |

### project_assignments

| Column | Type | Description |
|---|---|---|
| project_id | FK | References projects |
| assignable_type / assignable_id | morph | Entity assigned |
| role | string | Assignment role |
| assigned_by_type / assigned_by_id | morph (nullable) | Who assigned |
| metadata | JSON (nullable) | Flexible data |

Unique constraint: `(project_id, assignable_type, assignable_id, role)`

## Testing

```bash
make test       # Run tests via Docker
make pint       # Run code formatter
make check      # Run all checks (pint + tests)
```

## Requirements

- PHP 8.2+
- Laravel 10.0, 11.0, or 12.0

## License

MIT License

## Credits

Developed by the Whilesmart Team
