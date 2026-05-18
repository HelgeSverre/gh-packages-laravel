<img src="./assets/github-preview.png" alt="OI Laravel TypeScript Generator" width="100%" />

# OiLab Laravel Documentation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/oi-lab/oi-laravel-documentation.svg)](https://packagist.org/packages/oi-lab/oi-laravel-documentation)
[![Total Downloads](https://img.shields.io/packagist/dt/oi-lab/oi-laravel-documentation.svg)](https://packagist.org/packages/oi-lab/oi-laravel-documentation)
[![Tests](https://img.shields.io/github/actions/workflow/status/oi-lab/oi-laravel-documentation/tests.yml?label=tests)](https://github.com/oi-lab/oi-laravel-documentation/actions)
[![License](https://img.shields.io/github/license/oi-lab/oi-laravel-documentation)](LICENSE)

A Laravel package for managing markdown-based documentation with hierarchical navigation and full-text search.

## Features

- **Markdown-based** - Write documentation in simple markdown files
- **Hierarchical navigation** - Organize content with sections and subsections
- **Full-text search** - Search across all documentation with scoring
- **Auto-generated navigation** - Build navigation from file structure and frontmatter
- **YAML frontmatter** - Add metadata to documentation pages
- **Table of contents** - Automatically extract headings
- **Link transformation** - Convert relative markdown links to route URLs
- **Adjacent page navigation** - Previous/Next page links
- **React components** - Pre-built Inertia.js + React components for documentation UI, installed into a configurable directory
- **Syntax highlighting** - Code blocks with Shiki syntax highlighting
- **Interactive installation** - Installation wizard with package manager detection (pnpm/npm/yarn) and access control prompts

## Requirements

- PHP 8.3 or higher
- Laravel 11.x, 12.x or 13.x
- Inertia.js with React
- Node.js with a JS package manager (pnpm, npm or yarn)

## Installation

### 1. Install via Composer

```bash
composer require oi-lab/oi-laravel-documentation
```

### 2. Run the Installation Wizard

```bash
php artisan doc:install
```

The interactive installation wizard will:
- ✓ Publish the configuration file to `config/oi-laravel-documentation.php`
- ✓ Publish routes to `routes/documentation.php`
- ✓ Ask whether the documentation is public or restricted by a middleware
- ✓ Create `resources/markdown/docs/` with sample documentation (customizable path)
- ✓ Install React components (layouts, pages, components) into a configurable directory
- ✓ Detect and install missing JS packages with your package manager
- ✓ Install ShadCN UI components (sonner for toast notifications)
- ✓ Guide you through the setup process

**Documentation Access:**

When the config file is published, the wizard asks how the documentation should be reached:
- **Public** - keeps the route on the `web` middleware only.
- **Authenticated users only** - adds the `auth` middleware.
- **Custom middleware** - prompts for one or more middleware names (comma separated).

Your choice is written to `route.middleware` in `config/oi-laravel-documentation.php`; you can edit it there anytime.

**Package Manager:**

When JS dependencies (or ShadCN components) need to be installed, the wizard asks which package manager to use and lets you pick between `pnpm`, `npm` and `yarn`. The one detected in your project is preselected by default:
- the `packageManager` field in `package.json`, if present;
- otherwise the lockfile found in the project (`pnpm-lock.yaml`, `yarn.lock` or `package-lock.json`);
- falling back to `npm`.

The corresponding commands are used under the hood (`pnpm add` / `npm install` / `yarn add` for dependencies, `pnpm dlx` / `npx` / `yarn dlx` for ShadCN).

**Installation Options:**
- Use `--force` to overwrite existing files
- Skip individual steps if already installed
- Choose which files to overwrite when conflicts occur

## Configuration

### Publishing the Configuration File

If you need to customize the configuration, you can publish the config file separately:

```bash
php artisan vendor:publish --tag=oi-documentation-config
```

This will create `config/oi-laravel-documentation.php` in your application.

### Configuration Options

The configuration file `config/oi-laravel-documentation.php` allows you to customize:

```php
return [
    // Path to documentation files (relative to base_path())
    // You can customize this to store docs anywhere, e.g., 'resources/docs'
    'docs_path' => 'resources/markdown/docs',

    // Where the published React components are installed (keep it under resources/js/)
    'components_path' => 'resources/js/components/documentation',

    // Navigation and search index filenames
    'navigation_file' => 'navigation.json',
    'search_index_file' => 'search-index.json',

    // Route configuration
    'route' => [
        'enabled' => true,
        'prefix' => 'documentation',
        'middleware' => ['web'], // e.g. ['web', 'auth'] to require authentication
    ],

    // Search settings
    'search' => [
        'min_query_length' => 2,
        'excerpt_length' => 150,
        'excerpt_context' => 50,
    ],
];
```

### Custom Documentation Path

You can customize the location of your documentation files by changing the `docs_path` setting:

```php
// config/oi-laravel-documentation.php
'docs_path' => 'resources/docs', // Custom path
```

All commands (`doc:gen-nav`, `doc:gen-index`) will automatically use your custom path.

## Documentation Structure

### Directory Layout

```
resources/markdown/docs/
├── meta.json                    # Root metadata
├── navigation.json              # Auto-generated navigation
├── search-index.json            # Auto-generated search index
└── getting-started/
    ├── meta.json                # Section metadata
    ├── _index.md                # Section introduction
    └── installation.md          # Page
```

### Section meta.json

Each section directory should contain a `meta.json` file:

```json
{
    "title": "Getting Started",
    "description": "Introduction and basic concepts",
    "order": 1,
    "type": "section"
}
```

### Markdown Frontmatter

Each markdown file should have YAML frontmatter:

```markdown
---
title: Installation
description: How to install and configure
section: getting-started
order: 2
---

# Installation

Your content here...
```

### 3. Register Routes

Add the documentation routes to your `bootstrap/app.php`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('web')
            ->group(base_path('routes/documentation.php'));
    },
)
```

### 4. Build Frontend Assets

After installation, build your frontend assets:

```bash
npm run build
# or for development
npm run dev
```

## PHP Dependencies

The package requires these Composer packages (automatically resolved):

```json
{
  "illuminate/support": "^11.0|^12.0|^13.0",
  "symfony/yaml": "^6.0|^7.0"
}
```

## JS Dependencies

The package requires these JS packages (automatically installed by the wizard, using the package manager you select — `pnpm`, `npm` or `yarn`):

```json
{
  "@inertiajs/react": "^2.0.0",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "rehype-raw": "^7.0.0",
  "rehype-sanitize": "^6.0.0",
  "slugify": "^1.6.6",
  "shiki": "^1.0.0",
  "lucide-react": "^0.460.0",
  "usehooks-ts": "^3.1.1",
  "class-variance-authority": "^0.7.0"
}
```

## ShadCN UI Components

The package uses ShadCN UI components for the user interface. The installation wizard automatically installs the required components using the ShadCN CLI, run through your selected package manager:

```bash
# pnpm
pnpm dlx shadcn@latest add sonner

# npm
npx shadcn@latest add sonner

# yarn
yarn dlx shadcn@latest add sonner
```

**Currently installed components:**
- `sonner` - Toast notifications for flash messages

**Adding more components:**

To add additional ShadCN UI components to the installation, edit the `$shadcnComponents` array in `src/Console/Commands/InstallDocumentation.php`:

```php
private array $shadcnComponents = [
    'sonner',
    'button',
    'dialog',
    // Add more components as needed
];
```

The wizard will automatically install them when running `php artisan doc:install`.

## Commands

### Add a Documentation Page

Create a new markdown page interactively. The command asks which folder the page
belongs to (with a selection prompt) and lets you create a new folder on the fly:

```bash
php artisan doc:add-page

# Regenerate navigation and search index automatically afterwards
php artisan doc:add-page --regenerate
```

It writes a markdown file with frontmatter into the chosen folder (and creates a
`meta.json` for any new folder), then optionally runs `doc:gen-nav` and `doc:gen-index`.

### Generate Navigation

Generate the navigation structure from your documentation files:

```bash
php artisan doc:gen-nav
```

This scans `resources/markdown/docs/` and creates `navigation.json`.

### Generate Search Index

Generate the search index for full-text search:

```bash
php artisan doc:gen-index
```

This creates `search-index.json` from all documentation pages.

### Install Documentation

Install the package with the interactive wizard:

```bash
php artisan doc:install

# Force overwrite existing files
php artisan doc:install --force
```

## Routes

The package registers these routes (with configurable prefix):

```php
GET /documentation              # Index page
GET /documentation/search       # Search endpoint
GET /documentation/{slug}       # Show documentation page
```

## Usage in Controllers

Inject the `DocumentationService`:

```php
use OiLab\LaravelDocumentation\Services\DocumentationService;

class CustomController extends Controller
{
    public function __construct(
        public DocumentationService $documentationService
    ) {}

    public function index()
    {
        $navigation = $this->documentationService->getNavigation();
        $document = $this->documentationService->getDocument('getting-started');
        $adjacent = $this->documentationService->getAdjacentPages('getting-started');

        // ...
    }
}
```

## React Components

The installation wizard automatically installs these React components:

### Components (`resources/js/components/documentation/`)
- `documentation-markdown-content.tsx` - Renders markdown with syntax highlighting
- `documentation-navigation.tsx` - Hierarchical navigation sidebar
- `documentation-search.tsx` - Search interface with live results
- `documentation-toc.tsx` - Table of contents sidebar
- `documentation-heading.tsx` - Typography component with `size` variants (`xs`, `sm`, `default`, `lg`) built with `cva`, the same way ShadCN UI components are
- `documentation-header.tsx` - Sticky header (logo, search, navigation links)
- `documentation-footer.tsx` - Footer
- `sign.tsx` - Signature SVG component

> The components directory is configurable. Change `components_path` in `config/oi-laravel-documentation.php` to install them elsewhere (keep it under `resources/js/` so the `@/` import alias keeps working — the wizard rewrites the imports accordingly).

### Layouts (`resources/js/layouts/`)
- `documentation-layout.tsx` - Main documentation layout wrapper (composes `documentation-header.tsx` + `documentation-footer.tsx`, mirroring the Laravel React starter kit layout structure)

### Pages (`resources/js/pages/documentation/`)
- `index.tsx` - Documentation homepage
- `show.tsx` - Documentation page viewer

### Props Available

**Index page:**
```typescript
{
    navigation: NavigationStructure
}
```

**Show page:**
```typescript
{
    document: {
        frontmatter: Record<string, any>,
        markdown: string,
        tableOfContents: Array<{level: number, title: string, slug: string}>
    },
    navigation: NavigationStructure,
    slug: string,
    previousPage: PageItem | null,
    nextPage: PageItem | null
}
```

### Hooks (`resources/js/hooks/`)
- `use-flash-messages.tsx` - Hook for displaying flash messages using Sonner toasts

**Note:** The components use ShadCN UI. The installation wizard automatically installs the required components (`sonner`). If you need additional ShadCN UI components, you can install them manually:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add separator
```

### Using Toast Notifications

The package includes a `useFlashMessages` hook that automatically displays Laravel flash messages as toast notifications using Sonner. The hook is already integrated in the `documentation-layout.tsx`.

To send flash messages from your Laravel controllers:

```php
return redirect()->route('documentation.show', $slug)
    ->with('success', 'Documentation updated successfully!');

return redirect()->back()
    ->with('error', 'Failed to update documentation');

return redirect()->back()
    ->with('info', 'Documentation is being processed');
```

The toast notifications will automatically appear with the appropriate styling (success, error, info).

## Workflow

1. Write markdown files in `resources/markdown/docs/`
2. Add `meta.json` files for sections
3. Run `php artisan doc:gen-nav` to generate navigation
4. Run `php artisan doc:gen-index` to generate search index
5. Access documentation at `/documentation`

## Link Transformation

The package automatically transforms relative markdown links:

```markdown
[Installation](installation.md)
```

Becomes:

```markdown
[Installation](/documentation/getting-started/installation)
```

## Search

The search endpoint scores results based on:

- Title match: +10 points
- Description match: +5 points
- Heading match: +3 points
- Content match: +1 point

Results are sorted by score and include contextual excerpts.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of notable changes.

## License

This package is open-source software licensed under the [MIT license](LICENSE).

## Credits

**[Olivier Lacombe](https://www.olacombe.com)** - Creator and maintainer

Olivier is a Product & Technology Director based in Montpellier, France, with over 20 years of experience innovating in UX/UI and emerging technologies. He specializes in guiding enterprises toward cutting-edge digital solutions, combining user-centered design with continuous optimization and artificial intelligence integration.

**Projects & Resources:**
- [OnAI](https://onai.olacombe.com) - Training courses and masterclasses on generative AI for businesses
- [Promptr](https://promptr.olacombe.com) - Prompt engineering Management Platform

## Support

For support, please open an issue on the [GitHub repository](https://github.com/oi-lab/oi-laravel-ts/issues).
