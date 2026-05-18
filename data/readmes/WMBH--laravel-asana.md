# Laravel Asana

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wmbh/laravel-asana.svg?style=flat-square)](https://packagist.org/packages/wmbh/laravel-asana)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wmbh/laravel-asana/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wmbh/laravel-asana/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wmbh/laravel-asana/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wmbh/laravel-asana/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wmbh/laravel-asana.svg?style=flat-square)](https://packagist.org/packages/wmbh/laravel-asana)

A comprehensive Laravel package for the Asana REST API, built with [Saloon](https://docs.saloon.dev/) and [Spatie Laravel Data](https://spatie.be/docs/laravel-data).

## Installation

```bash
composer require wmbh/laravel-asana
```

Publish the config file:

```bash
php artisan vendor:publish --tag="asana-config"
```

Config contents:

```php
return [
    'token' => env('ASANA_TOKEN'),
    'timeout' => env('ASANA_TIMEOUT', 30),
    'retry' => [
        'attempts' => env('ASANA_RETRY_ATTEMPTS', 3),
        'sleep' => env('ASANA_RETRY_SLEEP', 1000),
    ],
];
```

Add your Asana Personal Access Token to `.env`:

```
ASANA_TOKEN=your-asana-pat-here
```

## Quick Start

```bash
# Verify your token works
php artisan asana:test
```

```php
use WMBH\Asana\Facades\Asana;

$me = Asana::users()->me();
$tasks = Asana::tasks()->getForProject('project_gid');
$task = Asana::tasks()->create([
    'name' => 'My task',
    'workspace' => 'workspace_gid',
]);
```

---

## API Reference

All methods are accessed through the `Asana` facade. Each resource returns typed DTOs (Spatie laravel-data objects) or `PaginatedResponse` for collections.

### Table of Contents

- [Tasks](#tasks)
- [Task Search (Query Builder)](#task-search-query-builder)
- [Projects](#projects)
- [Sections](#sections)
- [Users](#users)
- [Workspaces](#workspaces)
- [Teams](#teams)
- [Tags](#tags)
- [Stories (Comments)](#stories-comments)
- [Attachments](#attachments)
- [Custom Fields](#custom-fields)
- [Portfolios](#portfolios)
- [Goals](#goals)
- [Webhooks](#webhooks)
- [Batch Requests](#batch-requests)
- [Error Handling](#error-handling)
- [Pagination](#pagination)

---

### Tasks

Access via `Asana::tasks()` — returns `TaskResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `TaskData` | Get a single task |
| `getForProject` | `string $projectGid`, `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List tasks in a project |
| `getForSection` | `string $sectionGid`, `array $optFields = []` | `PaginatedResponse` | List tasks in a section |
| `getSubtasks` | `string $taskGid`, `array $optFields = []` | `PaginatedResponse` | List subtasks of a task |
| `create` | `array $data` | `TaskData` | Create a new task |
| `update` | `string $gid`, `array $data` | `TaskData` | Update a task |
| `delete` | `string $gid` | `bool` | Delete a task |
| `search` | `string $workspaceGid`, `array $params = []` | `TaskQueryBuilder` or `PaginatedResponse` | Search tasks (see [Query Builder](#task-search-query-builder)) |
| `addTag` | `string $taskGid`, `string $tagGid` | `void` | Add a tag to a task |
| `removeTag` | `string $taskGid`, `string $tagGid` | `void` | Remove a tag from a task |
| `addFollowers` | `string $taskGid`, `array $followers` | `void` | Add followers to a task |
| `addProject` | `string $taskGid`, `string $projectGid`, `?string $sectionGid = null`, `?string $insertBefore = null`, `?string $insertAfter = null` | `void` | Add task to a project |
| `removeProject` | `string $taskGid`, `string $projectGid` | `void` | Remove task from a project |
| `setParent` | `string $taskGid`, `string $parentGid` | `TaskData` | Set a task's parent |
| `getDependencies` | `string $taskGid` | `PaginatedResponse` | Get task dependencies |
| `getDependents` | `string $taskGid` | `PaginatedResponse` | Get task dependents |
| `addDependencies` | `string $taskGid`, `array $dependencyGids` | `void` | Add dependencies to a task |
| `addDependents` | `string $taskGid`, `array $dependentGids` | `void` | Add dependents to a task |

```php
use WMBH\Asana\Facades\Asana;

// Get a task with specific fields
$task = Asana::tasks()->get('task_gid', ['name', 'due_on', 'assignee']);

// List tasks in a project with pagination
$page = Asana::tasks()->getForProject('project_gid', limit: 25);
// $page->data contains TaskData[]
// $page->hasNextPage() / $page->nextPageToken

// Create a task
$task = Asana::tasks()->create([
    'name' => 'My new task',
    'workspace' => 'workspace_gid',
    'assignee' => 'me',
    'due_on' => '2025-03-01',
    'notes' => 'Task description here',
]);

// Update a task
$task = Asana::tasks()->update('task_gid', [
    'name' => 'Updated name',
    'completed' => true,
]);

// Delete a task
Asana::tasks()->delete('task_gid');

// Relationships
Asana::tasks()->addTag('task_gid', 'tag_gid');
Asana::tasks()->removeTag('task_gid', 'tag_gid');
Asana::tasks()->addFollowers('task_gid', ['user_gid_1', 'user_gid_2']);
Asana::tasks()->addProject('task_gid', 'project_gid', sectionGid: 'section_gid');
Asana::tasks()->removeProject('task_gid', 'project_gid');
Asana::tasks()->setParent('task_gid', 'parent_task_gid');

// Dependencies
Asana::tasks()->addDependencies('task_gid', ['blocker_task_1', 'blocker_task_2']);
Asana::tasks()->addDependents('task_gid', ['blocked_task_1']);
$deps = Asana::tasks()->getDependencies('task_gid');
```

#### TaskData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"task"` |
| `name` | `?string` | Task name |
| `resource_subtype` | `?string` | `"default_task"`, `"milestone"`, `"section"`, or `"approval"` |
| `assignee` | `?CompactResource` | Assigned user (`->gid`, `->name`) |
| `assignee_section` | `?CompactResource` | Assignee's board column |
| `completed` | `?bool` | Whether the task is completed |
| `completed_at` | `?string` | Completion timestamp |
| `created_at` | `?string` | Creation timestamp |
| `due_on` | `?string` | Due date (`YYYY-MM-DD`) |
| `due_at` | `?string` | Due datetime (ISO 8601) |
| `start_on` | `?string` | Start date |
| `start_at` | `?string` | Start datetime |
| `modified_at` | `?string` | Last modified timestamp |
| `notes` | `?string` | Plain-text description |
| `html_notes` | `?string` | HTML description |
| `num_hearts` | `?int` | Number of hearts |
| `num_likes` | `?int` | Number of likes |
| `is_rendered_as_separator` | `?bool` | Rendered as separator in list view |
| `parent` | `?CompactResource` | Parent task |
| `workspace` | `?CompactResource` | Workspace |
| `permalink_url` | `?string` | URL to the task in Asana |
| `tags` | `?array` | Tags on the task |
| `projects` | `?array` | Projects the task belongs to |
| `memberships` | `?array` | Project memberships |
| `followers` | `?array` | Users following the task |
| `custom_fields` | `?array` | Custom field values |

---

### Task Search (Query Builder)

Calling `search()` with no params returns a fluent `TaskQueryBuilder`:

```php
$tasks = Asana::tasks()->search('workspace_gid')
    ->assignee('me')
    ->completed(false)
    ->dueAfter('2025-01-01')
    ->dueBefore('2025-12-31')
    ->sortBy('due_on')
    ->fields('name', 'due_on', 'assignee')
    ->limit(50)
    ->get();
```

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `where` | `string $field`, `mixed $value` | `static` | Set an arbitrary search param |
| `assignee` | `string $assigneeGid` | `static` | Filter by assignee (`'me'` or user GID) |
| `project` | `string $projectGid` | `static` | Filter by project |
| `section` | `string $sectionGid` | `static` | Filter by section |
| `tag` | `string $tagGid` | `static` | Filter by tag |
| `completed` | `bool $completed = true` | `static` | Filter by completion status |
| `modifiedSince` | `string $datetime` | `static` | Tasks modified after datetime |
| `dueOn` | `string $date` | `static` | Tasks due on date (`YYYY-MM-DD`) |
| `dueBefore` | `string $date` | `static` | Tasks due before date |
| `dueAfter` | `string $date` | `static` | Tasks due after date |
| `sortBy` | `string $field`, `bool $ascending = true` | `static` | Sort results (`due_on`, `created_at`, `completed_at`, `likes`, `modified_at`) |
| `fields` | `string ...$fields` | `static` | Specify which fields to return (`opt_fields`) |
| `limit` | `int $limit` | `static` | Max results to return |
| `get` | — | `Collection` | Execute search, return `Collection` of `TaskData` |
| `paginate` | — | `PaginatedResponse` | Execute search, return paginated response |

You can also pass params directly to skip the builder:

```php
$results = Asana::tasks()->search('workspace_gid', [
    'assignee.any' => 'me',
    'completed' => false,
    'opt_fields' => 'name,due_on',
]);
// Returns PaginatedResponse directly
```

---

### Projects

Access via `Asana::projects()` — returns `ProjectResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `ProjectData` | Get a project |
| `list` | `string $workspaceGid`, `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List projects in a workspace |
| `getForTeam` | `string $teamGid`, `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List projects for a team |
| `create` | `array $data` | `ProjectData` | Create a project |
| `update` | `string $gid`, `array $data` | `ProjectData` | Update a project |
| `delete` | `string $gid` | `bool` | Delete a project |
| `duplicate` | `string $gid`, `array $data` | `array` | Duplicate a project (returns job) |
| `getTaskCounts` | `string $gid` | `array` | Get task count breakdown |

```php
// List projects in a workspace
$projects = Asana::projects()->list('workspace_gid');

// Get a project
$project = Asana::projects()->get('project_gid');

// Create a project
$project = Asana::projects()->create([
    'name' => 'Q1 Sprint',
    'workspace' => 'workspace_gid',
    'team' => 'team_gid',
    'notes' => 'Sprint planning project',
    'default_view' => 'board',
]);

// Update a project
$project = Asana::projects()->update('project_gid', [
    'name' => 'Q1 Sprint (Updated)',
    'archived' => true,
]);

// Delete a project
Asana::projects()->delete('project_gid');

// Duplicate a project
$job = Asana::projects()->duplicate('project_gid', [
    'name' => 'Copy of Q1 Sprint',
    'include' => ['members', 'task_notes', 'task_assignee', 'task_subtasks'],
]);

// Get task counts
$counts = Asana::projects()->getTaskCounts('project_gid');
// ['num_tasks' => 42, 'num_completed_tasks' => 10, ...]

// List projects for a team
$projects = Asana::projects()->getForTeam('team_gid');
```

#### ProjectData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"project"` |
| `name` | `?string` | Project name |
| `archived` | `?bool` | Whether the project is archived |
| `color` | `?string` | Color of the project |
| `created_at` | `?string` | Creation timestamp |
| `current_status` | `?array` | Deprecated project status |
| `current_status_update` | `?array` | Latest status update |
| `default_view` | `?string` | `"list"`, `"board"`, `"calendar"`, or `"timeline"` |
| `due_on` | `?string` | Due date |
| `due_date` | `?string` | Due date (alias) |
| `start_on` | `?string` | Start date |
| `modified_at` | `?string` | Last modified timestamp |
| `notes` | `?string` | Plain-text description |
| `html_notes` | `?string` | HTML description |
| `public` | `?bool` | Whether visible to workspace |
| `owner` | `?CompactResource` | Project owner |
| `team` | `?CompactResource` | Team the project belongs to |
| `workspace` | `?CompactResource` | Workspace |
| `permalink_url` | `?string` | URL to the project in Asana |
| `custom_fields` | `?array` | Custom field values |
| `members` | `?array` | Project members |
| `followers` | `?array` | Project followers |

---

### Sections

Access via `Asana::sections()` — returns `SectionResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `SectionData` | Get a section |
| `getForProject` | `string $projectGid`, `array $optFields = []` | `PaginatedResponse` | List sections in a project |
| `create` | `string $projectGid`, `array $data` | `SectionData` | Create a section in a project |
| `update` | `string $gid`, `array $data` | `SectionData` | Update a section |
| `delete` | `string $gid` | `bool` | Delete a section |
| `addTask` | `string $sectionGid`, `string $taskGid` | `void` | Add a task to a section |
| `insertSection` | `string $projectGid`, `array $data` | `void` | Reorder a section within a project |

```php
// List sections in a project
$sections = Asana::sections()->getForProject('project_gid');

// Create a section
$section = Asana::sections()->create('project_gid', [
    'name' => 'In Progress',
]);

// Move a task into a section
Asana::sections()->addTask('section_gid', 'task_gid');

// Reorder a section
Asana::sections()->insertSection('project_gid', [
    'section' => 'section_gid',
    'before_section' => 'other_section_gid',
]);

// Rename a section
Asana::sections()->update('section_gid', ['name' => 'Done']);

// Delete a section
Asana::sections()->delete('section_gid');
```

#### SectionData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"section"` |
| `name` | `?string` | Section name |
| `created_at` | `?string` | Creation timestamp |
| `project` | `?CompactResource` | Parent project |

---

### Users

Access via `Asana::users()` — returns `UserResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `UserData` | Get a user |
| `list` | `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List all users |
| `getForWorkspace` | `string $workspaceGid`, `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List users in a workspace |
| `getForTeam` | `string $teamGid`, `array $optFields = []` | `PaginatedResponse` | List users in a team |
| `me` | `array $optFields = []` | `UserData` | Get the authenticated user |

```php
// Get the authenticated user
$me = Asana::users()->me();
echo $me->name;  // "John Doe"
echo $me->email; // "john@example.com"

// Get a specific user
$user = Asana::users()->get('user_gid');

// List users in a workspace
$users = Asana::users()->getForWorkspace('workspace_gid');

// List users in a team
$users = Asana::users()->getForTeam('team_gid');
```

#### UserData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"user"` |
| `name` | `?string` | User's full name |
| `email` | `?string` | User's email address |
| `photo` | `?array` | Photo URLs at various sizes |
| `workspaces` | `?array` | Workspaces the user belongs to |

---

### Workspaces

Access via `Asana::workspaces()` — returns `WorkspaceResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `WorkspaceData` | Get a workspace |
| `list` | `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List all workspaces |
| `update` | `string $gid`, `array $data` | `WorkspaceData` | Update a workspace |
| `addUser` | `string $workspaceGid`, `string $userGid` | `void` | Add a user to a workspace |
| `removeUser` | `string $workspaceGid`, `string $userGid` | `void` | Remove a user from a workspace |

```php
// List all workspaces
$workspaces = Asana::workspaces()->list();

// Get a workspace
$workspace = Asana::workspaces()->get('workspace_gid');
echo $workspace->name;
echo $workspace->is_organization; // true/false

// Update a workspace
Asana::workspaces()->update('workspace_gid', ['name' => 'New Name']);

// Manage members
Asana::workspaces()->addUser('workspace_gid', 'user_gid');
Asana::workspaces()->removeUser('workspace_gid', 'user_gid');
```

#### WorkspaceData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"workspace"` |
| `name` | `?string` | Workspace name |
| `is_organization` | `?bool` | Whether it's an organization |
| `email_domains` | `?array` | Email domains for the workspace |

---

### Teams

Access via `Asana::teams()` — returns `TeamResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `TeamData` | Get a team |
| `getForWorkspace` | `string $workspaceGid`, `array $optFields = []`, `?string $offset = null`, `?int $limit = null` | `PaginatedResponse` | List teams in a workspace |
| `getForUser` | `string $userGid`, `string $organizationGid`, `array $optFields = []` | `PaginatedResponse` | List teams for a user in an org |
| `create` | `array $data` | `TeamData` | Create a team |
| `addUser` | `string $teamGid`, `string $userGid` | `void` | Add a user to a team |
| `removeUser` | `string $teamGid`, `string $userGid` | `void` | Remove a user from a team |

```php
// List teams in a workspace
$teams = Asana::teams()->getForWorkspace('workspace_gid');

// Get teams for a user
$teams = Asana::teams()->getForUser('user_gid', 'organization_gid');

// Create a team
$team = Asana::teams()->create([
    'name' => 'Engineering',
    'organization' => 'org_gid',
    'description' => 'The engineering team',
]);

// Manage members
Asana::teams()->addUser('team_gid', 'user_gid');
Asana::teams()->removeUser('team_gid', 'user_gid');
```

#### TeamData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"team"` |
| `name` | `?string` | Team name |
| `description` | `?string` | Plain-text description |
| `html_description` | `?string` | HTML description |
| `organization` | `?CompactResource` | Parent organization |
| `permalink_url` | `?string` | URL to the team in Asana |

---

### Tags

Access via `Asana::tags()` — returns `TagResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `TagData` | Get a tag |
| `getForTask` | `string $taskGid`, `array $optFields = []` | `PaginatedResponse` | List tags on a task |
| `getForWorkspace` | `string $workspaceGid`, `array $optFields = []` | `PaginatedResponse` | List tags in a workspace |
| `create` | `array $data` | `TagData` | Create a tag |
| `createForWorkspace` | `string $workspaceGid`, `array $data` | `TagData` | Create a tag in a workspace |
| `update` | `string $gid`, `array $data` | `TagData` | Update a tag |
| `delete` | `string $gid` | `bool` | Delete a tag |

```php
// List tags in a workspace
$tags = Asana::tags()->getForWorkspace('workspace_gid');

// List tags on a task
$tags = Asana::tags()->getForTask('task_gid');

// Create a tag
$tag = Asana::tags()->create([
    'name' => 'Priority',
    'workspace' => 'workspace_gid',
    'color' => 'red',
]);

// Or create directly in a workspace
$tag = Asana::tags()->createForWorkspace('workspace_gid', [
    'name' => 'Urgent',
    'color' => 'hot-pink',
]);

// Update a tag
Asana::tags()->update('tag_gid', ['name' => 'High Priority']);

// Delete a tag
Asana::tags()->delete('tag_gid');
```

#### TagData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"tag"` |
| `name` | `?string` | Tag name |
| `color` | `?string` | Color (`"dark-pink"`, `"dark-green"`, `"red"`, etc.) |
| `notes` | `?string` | Description |
| `created_at` | `?string` | Creation timestamp |
| `followers` | `?array` | Followers |
| `workspace` | `?CompactResource` | Workspace |
| `permalink_url` | `?string` | URL to the tag in Asana |

---

### Stories (Comments)

Access via `Asana::stories()` — returns `StoryResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `StoryData` | Get a story |
| `getForTask` | `string $taskGid`, `array $optFields = []` | `PaginatedResponse` | List stories on a task |
| `create` | `string $taskGid`, `array $data` | `StoryData` | Add a comment to a task |
| `update` | `string $gid`, `array $data` | `StoryData` | Update a comment |
| `delete` | `string $gid` | `bool` | Delete a comment |

```php
// List comments/activity on a task
$stories = Asana::stories()->getForTask('task_gid');
foreach ($stories->data as $story) {
    echo "{$story->created_by->name}: {$story->text}\n";
}

// Add a comment
$story = Asana::stories()->create('task_gid', [
    'text' => 'This looks good, shipping it!',
]);

// Add a rich-text comment
$story = Asana::stories()->create('task_gid', [
    'html_text' => '<body><strong>Done!</strong> See <a href="https://example.com">results</a>.</body>',
]);

// Pin a comment
Asana::stories()->update('story_gid', ['is_pinned' => true]);

// Delete a comment
Asana::stories()->delete('story_gid');
```

#### StoryData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"story"` |
| `text` | `?string` | Plain-text content |
| `html_text` | `?string` | HTML content |
| `type` | `?string` | `"comment"` or `"system"` |
| `resource_subtype` | `?string` | Specific story type |
| `created_at` | `?string` | Creation timestamp |
| `created_by` | `?CompactResource` | Author |
| `target` | `?CompactResource` | Target resource (task, project, etc.) |
| `is_pinned` | `?bool` | Whether the story is pinned |
| `is_edited` | `?bool` | Whether the story was edited |
| `sticker_name` | `?string` | Sticker name if applicable |

---

### Attachments

Access via `Asana::attachments()` — returns `AttachmentResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `AttachmentData` | Get an attachment |
| `getForTask` | `string $taskGid`, `array $optFields = []` | `PaginatedResponse` | List attachments on a task |
| `create` | `string $parentGid`, `array $data` | `AttachmentData` | Create an attachment |
| `delete` | `string $gid` | `bool` | Delete an attachment |

```php
// List attachments on a task
$attachments = Asana::attachments()->getForTask('task_gid');

// Get attachment details (includes download URL)
$attachment = Asana::attachments()->get('attachment_gid');
echo $attachment->download_url;
echo $attachment->name;
echo $attachment->size; // bytes

// Create an external attachment
$attachment = Asana::attachments()->create('task_gid', [
    'resource_subtype' => 'external',
    'name' => 'Design Spec',
    'url' => 'https://example.com/spec.pdf',
]);

// Delete an attachment
Asana::attachments()->delete('attachment_gid');
```

#### AttachmentData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"attachment"` |
| `name` | `?string` | File name |
| `resource_subtype` | `?string` | `"asana"`, `"dropbox"`, `"gdrive"`, `"onedrive"`, `"box"`, `"vimeo"`, or `"external"` |
| `created_at` | `?string` | Creation timestamp |
| `download_url` | `?string` | URL to download the file (temporary) |
| `host` | `?string` | Service hosting the attachment |
| `parent` | `?CompactResource` | Parent task |
| `permanent_url` | `?string` | Permanent link |
| `size` | `?int` | File size in bytes |
| `view_url` | `?string` | URL to view in browser |

---

### Custom Fields

Access via `Asana::customFields()` — returns `CustomFieldResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `CustomFieldData` | Get a custom field |
| `getForWorkspace` | `string $workspaceGid`, `array $optFields = []` | `PaginatedResponse` | List custom fields in a workspace |
| `create` | `array $data` | `CustomFieldData` | Create a custom field |
| `update` | `string $gid`, `array $data` | `CustomFieldData` | Update a custom field |
| `delete` | `string $gid` | `bool` | Delete a custom field |

```php
// List custom fields in a workspace
$fields = Asana::customFields()->getForWorkspace('workspace_gid');

// Get a custom field
$field = Asana::customFields()->get('custom_field_gid');
echo $field->name;
echo $field->type; // "text", "number", "enum", "multi_enum", "date", "people"

// Create a number field
$field = Asana::customFields()->create([
    'name' => 'Story Points',
    'resource_subtype' => 'number',
    'workspace' => 'workspace_gid',
    'precision' => 0,
]);

// Create an enum field
$field = Asana::customFields()->create([
    'name' => 'Priority',
    'resource_subtype' => 'enum',
    'workspace' => 'workspace_gid',
    'enum_options' => [
        ['name' => 'Low', 'color' => 'green'],
        ['name' => 'Medium', 'color' => 'yellow'],
        ['name' => 'High', 'color' => 'red'],
    ],
]);

// Update a custom field
Asana::customFields()->update('field_gid', ['name' => 'Effort Points']);

// Delete a custom field
Asana::customFields()->delete('field_gid');
```

#### CustomFieldData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"custom_field"` |
| `name` | `?string` | Field name |
| `resource_subtype` | `?string` | `"text"`, `"number"`, `"enum"`, `"multi_enum"`, `"date"`, or `"people"` |
| `type` | `?string` | Field type (deprecated, use `resource_subtype`) |
| `description` | `?string` | Field description |
| `enabled` | `?bool` | Whether the field is enabled |
| `enum_options` | `?array` | Options for enum fields |
| `precision` | `?int` | Decimal precision for number fields |
| `format` | `?string` | Display format (`"none"`, `"currency"`, `"custom"`, `"percentage"`) |
| `currency_code` | `?string` | ISO 4217 currency code |
| `custom_label` | `?string` | Custom label text |
| `custom_label_position` | `?string` | `"prefix"` or `"suffix"` |
| `is_global_to_workspace` | `?bool` | Available across the workspace |
| `has_notifications_enabled` | `?bool` | Notifications on change |

---

### Portfolios

Access via `Asana::portfolios()` — returns `PortfolioResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `PortfolioData` | Get a portfolio |
| `list` | `string $workspaceGid`, `string $ownerGid`, `array $optFields = []` | `PaginatedResponse` | List portfolios |
| `getItems` | `string $portfolioGid`, `array $optFields = []` | `PaginatedResponse` | List items in a portfolio |
| `addItem` | `string $portfolioGid`, `string $itemGid` | `bool` | Add a project to a portfolio |
| `removeItem` | `string $portfolioGid`, `string $itemGid` | `bool` | Remove a project from a portfolio |
| `create` | `array $data` | `PortfolioData` | Create a portfolio |
| `update` | `string $gid`, `array $data` | `PortfolioData` | Update a portfolio |
| `delete` | `string $gid` | `bool` | Delete a portfolio |

```php
// List portfolios owned by a user
$portfolios = Asana::portfolios()->list('workspace_gid', 'owner_gid');

// Get a portfolio
$portfolio = Asana::portfolios()->get('portfolio_gid');

// Create a portfolio
$portfolio = Asana::portfolios()->create([
    'name' => 'Q1 Projects',
    'workspace' => 'workspace_gid',
    'color' => 'light-green',
]);

// Manage items (projects) in a portfolio
$items = Asana::portfolios()->getItems('portfolio_gid');
Asana::portfolios()->addItem('portfolio_gid', 'project_gid');
Asana::portfolios()->removeItem('portfolio_gid', 'project_gid');

// Update a portfolio
Asana::portfolios()->update('portfolio_gid', ['name' => 'Q1 Projects (Final)']);

// Delete a portfolio
Asana::portfolios()->delete('portfolio_gid');
```

#### PortfolioData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"portfolio"` |
| `name` | `?string` | Portfolio name |
| `color` | `?string` | Color |
| `created_at` | `?string` | Creation timestamp |
| `created_by` | `?CompactResource` | Creator |
| `due_on` | `?string` | Due date |
| `start_on` | `?string` | Start date |
| `owner` | `?CompactResource` | Owner |
| `workspace` | `?CompactResource` | Workspace |
| `permalink_url` | `?string` | URL to the portfolio in Asana |
| `public` | `?bool` | Whether visible to workspace |
| `members` | `?array` | Portfolio members |
| `custom_fields` | `?array` | Custom field values |
| `custom_field_settings` | `?array` | Custom field settings |

---

### Goals

Access via `Asana::goals()` — returns `GoalResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid`, `array $optFields = []` | `GoalData` | Get a goal |
| `list` | `array $params = []` | `PaginatedResponse` | List goals (filter by `workspace`, `team`, `project`, etc.) |
| `create` | `array $data` | `GoalData` | Create a goal |
| `update` | `string $gid`, `array $data` | `GoalData` | Update a goal |
| `delete` | `string $gid` | `bool` | Delete a goal |
| `getSubgoals` | `string $goalGid` | `PaginatedResponse` | List subgoals |
| `addSubgoal` | `string $goalGid`, `string $subgoalGid` | `bool` | Add a subgoal |
| `getRelationships` | `string $goalGid` | `PaginatedResponse` | List supporting work (projects/portfolios) |
| `updateMetric` | `string $goalGid`, `array $data` | `GoalData` | Update the goal's progress metric |

```php
// List goals in a workspace
$goals = Asana::goals()->list(['workspace' => 'workspace_gid']);

// List goals for a team
$goals = Asana::goals()->list([
    'workspace' => 'workspace_gid',
    'team' => 'team_gid',
]);

// Get a goal
$goal = Asana::goals()->get('goal_gid');

// Create a goal
$goal = Asana::goals()->create([
    'name' => 'Ship v2.0',
    'workspace' => 'workspace_gid',
    'due_on' => '2025-06-30',
    'notes' => 'Release the next major version',
]);

// Manage subgoals
$subgoals = Asana::goals()->getSubgoals('goal_gid');
Asana::goals()->addSubgoal('goal_gid', 'subgoal_gid');

// Update progress metric
Asana::goals()->updateMetric('goal_gid', [
    'current_number_value' => 75,
]);

// Get supporting work
$relationships = Asana::goals()->getRelationships('goal_gid');

// Delete a goal
Asana::goals()->delete('goal_gid');
```

#### GoalData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"goal"` |
| `name` | `?string` | Goal name |
| `owner` | `?CompactResource` | Goal owner |
| `due_on` | `?string` | Due date |
| `start_on` | `?string` | Start date |
| `html_notes` | `?string` | HTML notes |
| `notes` | `?string` | Plain-text notes |
| `status` | `?string` | `"green"`, `"yellow"`, `"red"`, or `"missed"` |
| `is_workspace_level` | `?bool` | Workspace-level goal |
| `liked` | `?bool` | Whether you liked it |
| `likes` | `?array` | Users who liked |
| `metric` | `?array` | Progress metric config and values |
| `team` | `?CompactResource` | Team |
| `workspace` | `?CompactResource` | Workspace |
| `followers` | `?array` | Goal followers |
| `num_likes` | `?int` | Number of likes |

---

### Webhooks

Access via `Asana::webhooks()` — returns `WebhookResource`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get` | `string $gid` | `WebhookData` | Get a webhook |
| `getForWorkspace` | `string $workspaceGid`, `?string $resourceGid = null` | `PaginatedResponse` | List webhooks (optionally filter by resource) |
| `create` | `array $data` | `WebhookData` | Create a webhook |
| `update` | `string $gid`, `array $data` | `WebhookData` | Update a webhook |
| `delete` | `string $gid` | `bool` | Delete a webhook |

```php
// List all webhooks in a workspace
$webhooks = Asana::webhooks()->getForWorkspace('workspace_gid');

// List webhooks for a specific resource
$webhooks = Asana::webhooks()->getForWorkspace('workspace_gid', 'project_gid');

// Create a webhook
$webhook = Asana::webhooks()->create([
    'resource' => 'project_gid',
    'target' => 'https://your-app.com/asana/webhook',
    'filters' => [
        ['resource_type' => 'task', 'action' => 'changed', 'fields' => ['completed']],
    ],
]);

// Update webhook filters
Asana::webhooks()->update('webhook_gid', [
    'filters' => [
        ['resource_type' => 'task', 'action' => 'added'],
        ['resource_type' => 'task', 'action' => 'removed'],
    ],
]);

// Delete a webhook
Asana::webhooks()->delete('webhook_gid');
```

#### WebhookData Properties

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Always `"webhook"` |
| `active` | `?bool` | Whether the webhook is active |
| `resource` | `?CompactResource` | Watched resource |
| `target` | `?string` | Delivery target URL |
| `created_at` | `?string` | Creation timestamp |
| `last_failure_at` | `?string` | Last failure timestamp |
| `last_failure_content` | `?string` | Last failure details |
| `last_success_at` | `?string` | Last success timestamp |
| `filters` | `?array` | Event filters |

---

### Batch Requests

Access via `Asana::batch()` — returns `BatchResource`.

Send up to 10 API requests in a single HTTP call. Each action specifies a `relative_path`, `method`, and optionally `data` or `options`.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `submit` | `array $actions` | `array` | Submit batch of actions (max 10) |

Each action is an array with:
- `relative_path` (string) — API path, e.g. `/tasks/123`
- `method` (string) — `GET`, `POST`, `PUT`, `DELETE`
- `data` (array, optional) — Request body for POST/PUT
- `options` (array, optional) — Query params like `opt_fields`

Each result in the response contains its own `status_code` and `body`.

```php
// Fetch multiple tasks at once
$results = Asana::batch()->submit([
    ['relative_path' => '/tasks/task_gid_1', 'method' => 'GET'],
    ['relative_path' => '/tasks/task_gid_2', 'method' => 'GET'],
    ['relative_path' => '/tasks/task_gid_3', 'method' => 'GET'],
]);
// $results[0]['status_code'] => 200
// $results[0]['body']['data'] => { task data }

// Update multiple tasks at once
$results = Asana::batch()->submit([
    [
        'relative_path' => '/tasks/task_1',
        'method' => 'PUT',
        'data' => ['completed' => true],
    ],
    [
        'relative_path' => '/tasks/task_2',
        'method' => 'PUT',
        'data' => ['completed' => true],
    ],
]);

// Mix different operations
$results = Asana::batch()->submit([
    ['relative_path' => '/users/me', 'method' => 'GET'],
    ['relative_path' => '/tasks/task_gid', 'method' => 'GET', 'options' => ['opt_fields' => 'name,completed']],
    ['relative_path' => '/tasks', 'method' => 'POST', 'data' => ['name' => 'New task', 'workspace' => 'ws_gid']],
]);
```

---

### Error Handling

All API errors throw typed exceptions. Exceptions bubble up like any PHP exception — handle them with try-catch at whatever level makes sense (controller, service, or global handler).

| Exception | HTTP Status | Extra Methods |
|-----------|------------|---------------|
| `ValidationException` | 400 | `getErrors(): array` |
| `AuthenticationException` | 401 | — |
| `ForbiddenException` | 403 | — |
| `NotFoundException` | 404 | — |
| `RateLimitException` | 429 | `getRetryAfter(): int` |
| `AsanaException` | any other | — |

All exceptions extend `AsanaException` and provide:
- `getMessage()` — error message from Asana
- `getCode()` — HTTP status code
- `getResponseBody()` — full response array

```php
use WMBH\Asana\Exceptions\AsanaException;
use WMBH\Asana\Exceptions\NotFoundException;
use WMBH\Asana\Exceptions\RateLimitException;
use WMBH\Asana\Exceptions\ValidationException;

try {
    $task = Asana::tasks()->get('invalid_gid');
} catch (NotFoundException $e) {
    // 404 - task doesn't exist
    Log::warning("Task not found: {$e->getMessage()}");
} catch (RateLimitException $e) {
    // 429 - retry after N seconds
    $retryAfter = $e->getRetryAfter();
    Log::info("Rate limited, retry after {$retryAfter}s");
} catch (ValidationException $e) {
    // 400 - invalid data
    $errors = $e->getErrors();
    // [['message' => 'workspace: Missing input', 'help' => '...']]
} catch (AsanaException $e) {
    // Catch-all for any other API error
    Log::error("Asana error: {$e->getMessage()}", $e->getResponseBody());
}
```

You can also handle exceptions globally in your exception handler:

```php
// app/Exceptions/Handler.php (or bootstrap/app.php in Laravel 11+)
$exceptions->render(function (RateLimitException $e) {
    return response()->json(['error' => 'Rate limited'], 429);
});
```

---

### Pagination

Methods that return collections use `PaginatedResponse`:

```php
$page = Asana::tasks()->getForProject('project_gid', limit: 25);

// Access data
$tasks = $page->data; // TaskData[]

// Check for more pages
if ($page->hasNextPage()) {
    $nextPage = Asana::tasks()->getForProject(
        'project_gid',
        offset: $page->nextPageToken,
        limit: 25,
    );
}

// Iterate all pages
$allTasks = [];
$offset = null;

do {
    $page = Asana::tasks()->getForProject('project_gid', offset: $offset, limit: 100);
    $allTasks = array_merge($allTasks, $page->data);
    $offset = $page->nextPageToken;
} while ($page->hasNextPage());
```

#### PaginatedResponse Properties

| Property | Type | Description |
|----------|------|-------------|
| `data` | `array` | Array of typed DTOs |
| `nextPageToken` | `?string` | Offset token for next page |
| `nextPageUri` | `?string` | Full URI for next page |

#### CompactResource (nested references)

Many DTOs contain nested references to other objects (assignee, workspace, project, etc.). These are represented as `CompactResource` with three properties:

| Property | Type | Description |
|----------|------|-------------|
| `gid` | `string` | Globally unique identifier |
| `resource_type` | `?string` | Type of the resource |
| `name` | `?string` | Name of the resource |

```php
$task = Asana::tasks()->get('task_gid');
echo $task->assignee->gid;   // "12345"
echo $task->assignee->name;  // "Jane Doe"
echo $task->workspace->name; // "My Workspace"
```

---

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

- [WMBH](https://github.com/WMBH)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
