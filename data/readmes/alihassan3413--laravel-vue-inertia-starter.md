# Laravel Vue Inertia Starter Kit

A modern Laravel + Vue + Inertia starter kit for building full-stack web applications faster.

This starter kit is designed for personal projects, FYP projects, SaaS dashboards, admin panels, and scalable Laravel applications. It includes a clean backend structure, Vue 3 frontend setup, TypeScript, Tailwind CSS, reusable UI components, auto imports, code formatting, linting, and developer-friendly project conventions.

---

## Tech Stack

### Backend

- **Laravel 12** — PHP backend framework.
- **PHP 8.2+** — Required PHP version.
- **Inertia.js Laravel** — Connects Laravel routes/controllers with Vue pages.
- **Ziggy** — Allows using Laravel route names inside Vue/TypeScript.
- **Spatie Laravel Data** — Creates clean DTO/Data classes for requests, responses, and frontend types.
- **Spatie Laravel Permission** — Role and permission management.
- **Spatie TypeScript Transformer** — Generates TypeScript types from PHP data classes/enums.
- **Laravel Pint** — PHP code formatter.
- **Laravel Boost** — AI-friendly Laravel project context and guidelines.
- **Laravel IDE Helper** — Better IDE autocompletion for Laravel.

### Frontend

- **Vue 3** — Frontend framework.
- **TypeScript** — Type safety for frontend code.
- **Inertia Vue 3** — Vue adapter for Inertia.
- **Vite** — Fast frontend development/build tool.
- **Tailwind CSS 4** — Utility-first CSS framework.
- **Pinia** — State management for Vue.
- **VueUse** — Useful Vue composables.
- **Radix Vue** — Headless UI primitives.
- **Lucide Vue Next** — Icon library.
- **Auto Import** — Automatically imports Vue/Inertia/Pinia helpers.
- **Vue Components Auto Import** — Automatically imports Vue components.
- **Unplugin Icons** — Use icons as Vue components.
- **Prettier** — Frontend code formatter.
- **ESLint** — Frontend linting.
- **Vue TSC** — TypeScript checking for Vue files.
- **Vitest** — Frontend unit testing.

---

## Project Goals

This starter kit is built to make new projects easier by providing:

- A clean Laravel + Vue + Inertia setup.
- Reusable frontend structure.
- Module-based backend structure.
- Auto-imported Vue composables and components.
- Consistent code formatting.
- Beginner-friendly conventions.
- Scalable structure for small and medium projects.
- A base that can be reused for future projects.

---

## Requirements

Make sure these are installed:

```bash
php -v
composer -V
node -v
npm -v


Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/laravel-vue-inertia-starter-kit.git
cd laravel-vue-inertia-starter-kit

Install PHP dependencies:

composer install

Install JavaScript dependencies:

npm install

Copy environment file:

cp .env.example .env

Generate app key:

php artisan key:generate

Create SQLite database file if using SQLite:

touch database/database.sqlite

Run migrations:

php artisan migrate

Run frontend dev server:

npm run dev

Run Laravel backend server in another terminal:

php artisan serve

Open:

http://127.0.0.1:8000
Useful Commands
Run Laravel server
php artisan serve
Run Vite frontend
npm run dev
Build frontend
npm run build
Format frontend files
npm run format
Check formatting
npm run format:check
Lint frontend
npm run lint
Type-check Vue/TypeScript files
npm run typecheck
Run full frontend cleanup
npm run cleanup
Format PHP files
./vendor/bin/pint
Clear Laravel cache
php artisan optimize:clear
Folder Structure
Backend
app/
├── Models/
│   └── User.php
├── Modules/
│   ├── Projects/
│   │   ├── Actions/
│   │   ├── Data/
│   │   ├── Enums/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── routes.php
│   │   └── Support/
│   └── Meetings/
│       ├── Actions/
│       ├── Data/
│       ├── Http/
│       ├── Models/
│       ├── routes.php
│       └── Support/
├── Http/
│   ├── Controllers/
│   └── Middleware/
└── Support/
    └── modules.php
Frontend
resources/js/
├── app.ts
├── types/
│   ├── auto-imports.d.ts
│   ├── components.d.ts
│   └── generated.ts
├── lib/
│   └── utils.ts
├── utils/
├── stores/
├── composables/
├── layouts/
├── components/
│   ├── ui/
│   └── shared/
├── modules/
│   ├── projects/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── forms/
│   │   └── helpers/
│   └── meetings/
└── pages/
Backend Structure Guide

This starter kit supports a module-based backend approach.

A module is a feature area of the application.

Examples:

Projects
Meetings
Tasks
Users
Reports
Notifications

Each module keeps its own logic in one place.

Example:

app/Modules/Projects/
├── Actions/
├── Data/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
├── routes.php
└── Support/
When to Use Each Folder
Controllers

Controllers receive the request and return a response.

Use controllers for:

Receiving form submissions.
Loading Inertia pages.
Calling actions.
Returning redirects/responses.

Example:

public function store(StoreProjectRequest $request, CreateProjectAction $createProject)
{
    $createProject->handle($request->validated());

    return redirect()->route('projects.index');
}

Controllers should stay small.

Actions

Actions contain business logic.

Use actions when something important happens in the system.

Examples:

CreateProjectAction
UpdateProjectAction
StartMeetingAction
GenerateMeetingSummaryAction
InviteTeamMemberAction

Example:

final class CreateProjectAction
{
    public function handle(array $data): Project
    {
        return Project::create($data);
    }
}

Instead of putting all logic in controller, call the action.

Requests

Requests validate incoming form data.

Example:

final class StoreProjectRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
Data Classes

Data classes are used to shape data clearly.

Use them for:

API payloads.
Inertia props.
DTOs.
TypeScript generation.

Example:

use Spatie\LaravelData\Data;

final class ProjectData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
    ) {}
}
Models

Models represent database tables.

Example:

final class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];
}

Shared models like User can stay in:

app/Models/User.php

Feature-specific models can go inside modules:

app/Modules/Projects/Models/Project.php
Middleware

Global middleware should stay in Laravel’s normal middleware folder:

app/Http/Middleware

Only create module-specific middleware if that middleware is only used by one feature.

Frontend Structure Guide
Pages

Pages are Inertia pages.

Example:

resources/js/pages/projects/Index.vue
resources/js/pages/projects/Create.vue
resources/js/pages/Dashboard.vue

Pages should connect data to components.

Components

Reusable components go here:

resources/js/components/

Examples:

Button.vue
Input.vue
Modal.vue
PageHeader.vue
EmptyState.vue
Layouts

Layouts wrap pages.

Examples:

AppLayout.vue
AuthLayout.vue
GuestLayout.vue
Composables

Reusable Vue logic goes here:

resources/js/composables/

Example:

export function useFlash() {
    const page = usePage()

    return computed(() => page.props.flash)
}
Stores

Pinia stores go here:

resources/js/stores/

Example:

export const useSidebarStore = defineStore('sidebar', () => {
    const isOpen = ref(true)

    function toggle() {
        isOpen.value = !isOpen.value
    }

    return {
        isOpen,
        toggle,
    }
})
Modules

Frontend module-specific files go here:

resources/js/modules/projects/

Example:

resources/js/modules/projects/
├── components/
├── composables/
├── forms/
└── helpers/

Use this when a component/helper belongs only to one feature.

Auto Imports

This starter kit uses auto imports to reduce repetitive imports.

You can use these directly without importing manually:

ref()
computed()
watch()
useForm()
usePage()
router
defineStore()
storeToRefs()
useDark()
useLocalStorage()

Example:

<script setup lang="ts">
const form = useForm({
    name: '',
})

function submit() {
    form.post(route('projects.store'))
}
</script>

No need to manually import useForm.

Auto import config is in:

frontend-auto-import.config.mjs

Generated auto-import types are stored in:

resources/js/types/auto-imports.d.ts

Do not manually edit generated files.

Component Auto Imports

Vue components are auto-imported from:

resources/js/components
resources/js/layouts
resources/js/modules

So you can use:

<AppLayout>
    <PageHeader title="Projects" />
    <Button>Create Project</Button>
</AppLayout>

without manually importing those components.

Generated component types are stored in:

resources/js/types/components.d.ts

Do not manually edit generated files.

Tailwind CSS

This starter kit uses Tailwind CSS 4.

Main CSS file:

resources/css/app.css

Use design tokens like:

<div class="rounded-lg border bg-card p-6 text-card-foreground">
    <h1 class="text-primary">Hello</h1>
    <p class="text-muted-foreground">Welcome to the starter kit.</p>
</div>

Common theme classes:

bg-background
text-foreground
bg-card
text-card-foreground
text-muted-foreground
bg-primary
text-primary-foreground
border-border
Code Style
PHP

Use Laravel Pint:

./vendor/bin/pint
Vue/TypeScript

Use Prettier:

npm run format

Use ESLint:

npm run lint

Use TypeScript check:

npm run typecheck

Before pushing code, run:

npm run cleanup
./vendor/bin/pint
Git Workflow Recommendation

Create a new branch for every feature:

git checkout -b feature/projects-module

Commit small changes:

git add .
git commit -m "Add projects module structure"

Push branch:

git push origin feature/projects-module
Recommended Team Rules
Keep controllers small.
Put business logic in actions.
Put validation in request classes.
Keep reusable frontend UI in components.
Keep feature-specific frontend files in resources/js/modules.
Do not manually edit generated type files.
Run format/lint before pushing.
Use meaningful branch names.
Use meaningful commit messages.
