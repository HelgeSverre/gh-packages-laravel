# Laravel Repository With Service

[![Latest Version](https://img.shields.io/packagist/v/l0n3ly/laravel-repository-with-service.svg?style=flat-square)](https://packagist.org/packages/l0n3ly/laravel-repository-with-service)
[![Total Downloads](https://img.shields.io/packagist/dt/l0n3ly/laravel-repository-with-service.svg?style=flat-square)](https://packagist.org/packages/l0n3ly/laravel-repository-with-service)
[![License](https://img.shields.io/packagist/l/l0n3ly/laravel-repository-with-service.svg?style=flat-square)](https://packagist.org/packages/l0n3ly/laravel-repository-with-service)
[![Laravel Boost Compatible](https://img.shields.io/badge/Laravel%20Boost-Compatible-brightgreen.svg?style=flat-square)](./BOOST.md)

A Laravel package that scaffolds the repository and service pattern — generates repository and service classes with interfaces, and automatically binds them to their implementations via the container.

## ✨ Features

- 🏗️ **Artisan Scaffolding** - Generate repositories and services with `make:repository` and `make:service`
- 🔗 **Auto Binding** - Automatically binds interfaces to implementations via the service container
- 📁 **Subdirectory Support** - Organize classes in nested directories (e.g., `Admin/UserRepository`)
- 🔄 **Paired Generation** - Generate a repository and service together with a single command
- 📋 **Interface-First** - Always generates a contract interface alongside each implementation
- 🎨 **Multiple Templates** - Choose between API service template or blank template
- 🤖 **Boost Compatible** - Full support for Laravel Boost AI-powered workflows and Copilot skills

## 📋 Requirements

- PHP ^8.2
- Laravel 11, 12, or 13

## 📦 Installation

Install the latest 1.x release:

```bash
composer require l0n3ly/laravel-repository-with-service
```

Publish the config file:

```bash
php artisan vendor:publish --tag=repository-with-service-config
```

## Quick Start

### Fastest Start: Generate Everything at Once

Scaffold a complete feature with one command:

```bash
php artisan make:model User --all
```

This creates everything — model, migration, factory, seeder, controller, repository, and service.

### Generate a Repository

```bash
# Basic repository
php artisan make:repository User

# Repository with paired service
php artisan make:repository User --service

# Repository with API-style service
php artisan make:repository User --service --api

# Repository in subdirectory
php artisan make:repository Admin/User --service
```

### Generate a Service

```bash
# Basic service
php artisan make:service UserService

# API service with response helpers
php artisan make:service UserService --api

# Service with paired repository
php artisan make:service UserService --repository

# Minimal service
php artisan make:service UserService --blank
```

### Generate from a Model

```bash
# Model with service and repository
php artisan make:model Product --service --repository

# Model with everything (fastest)
php artisan make:model Order --all
```

### Use in Your Code

Services and repositories are automatically bound to the container:

```php
class UserController extends Controller
{
    public function __construct(
        protected UserRepository $repository,
        protected UserService $service
    ) {}

    public function index()
    {
        return $this->service->getActiveUsers();
    }
}
```

## 📖 Documentation

Comprehensive documentation is available:

| Document | Purpose |
|----------|---------|
| [Full Guide](./docs/README.md) | Installation, quick start, and all commands |
| [API Reference](./docs/API.md) | Core interfaces and configuration |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Examples](./docs/EXAMPLES.md) | Real-world usage examples |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines |
| [Laravel Boost Integration](./BOOST.md) | Using with AI-powered Boost workflows |

## 🤖 Laravel Boost Support

This package is fully integrated with **Laravel Boost** and provides three AI skills to enhance your development workflow:

### Three Essential Skills
- **Repository Generator** - Generate repositories with best practices
- **Service Generator** - Generate services with business logic
- **Service Binding** - Understand dependency injection and binding patterns

These skills are located in `resources/boost/skills/` and are discovered by running:

```bash
php artisan boost:install --discover
```

Select the desired skills during installation, and they'll be available to your AI agent.

### AI-Powered Workflows

Get intelligent suggestions for:
- Generating complete feature modules
- Creating repository hierarchies
- Setting up service structures
- Testing patterns and mocking

### Example Boost Usage

```
User: "Generate a complete blog module with posts, comments, and categories"

Boost activates the skills and suggests:
✓ PostRepository with PostService (API template)
✓ CommentRepository with CommentService
✓ CategoryRepository with CategoryService
✓ BlogManager service orchestrating operations
```

### Getting Started with Boost

1. Install Laravel Boost in your Laravel project
2. Run `php artisan boost:install --discover`
3. Select this package's skills when prompted
4. Ask your AI agent to generate repositories, services, or help with architecture

See [BOOST.md](./BOOST.md) for detailed integration guide.

## 🎯 Common Patterns

### Blog Application
```bash
php artisan make:repository Post --service --api
php artisan make:repository Category --service
php artisan make:repository Post/Comment --service
```

### E-Commerce
```bash
php artisan make:repository Product --service --api
php artisan make:repository Order --service --api
php artisan make:service Shop/Checkout --api
php artisan make:service Shop/Inventory --api
```

### SaaS with Multi-Tenancy
```bash
php artisan make:repository Tenant --service --api
php artisan make:repository User --service --api
php artisan make:repository Subscription --service --api
```

See [EXAMPLES.md](./EXAMPLES.md) for complete real-world examples.

## 🔧 Configuration

Edit `config/service-repository.php` to customize:

```php
return [
    'repository_directory' => 'app/Repositories',
    'repository_namespace' => 'App\Repositories',
    'service_directory' => 'app/Services',
    'service_namespace' => 'App\Services',
    // ... naming conventions
];
```

## Override Binding Example

Decorate or replace a bound implementation in your service provider:

```php
$this->app->extend(UserRepository::class, function ($service, $app) {
    return new CachedUserRepository($service);
});
```

## Service API Template

The `--api` flag generates services with response helpers:

```php
class UserServiceImplement implements UserService
{
    use ResultService;

    public function create(array $data): array
    {
        try {
            $user = $this->repository->create($data);
            return $this->success($user, 'User created');
        } catch (Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
```

## 🚀 Performance Tips

1. **Use Caching** - Wrap repositories with caching decorators
2. **Eager Loading** - Use Eloquent's `with()` in repositories
3. **Singleton Services** - For stateless services, bind as singleton
4. **Optimize Queries** - Focus repository methods on specific queries

## 🧪 Testing

Mock repositories in tests:

```php
public function test_service_logic()
{
    $repository = Mockery::mock(UserRepository::class);
    $repository->shouldReceive('find')->with(1)->andReturn(['id' => 1]);

    $this->app->bind(UserRepository::class, fn() => $repository);

    $service = app(UserService::class);
    $result = $service->getUser(1);

    $this->assertEquals(1, $result['id']);
}
```

## 📚 Real-World Examples

Check [EXAMPLES.md](./EXAMPLES.md) for complete implementations:
- Blog with posts, comments, and categories
- E-commerce checkout process
- Multi-tenant SaaS structure
- Admin dashboards
- Testing patterns

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.

## Support

- 📖 **Documentation**: See `docs/` directory
- 🐛 **Issues**: Report on GitHub
- 💬 **Discussions**: Ask questions on GitHub Discussions
- 🔧 **Help**: Check [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

Project guide:

- <a href="https://l0n3ly.github.io/laravel-service-repository-pattern-guide/" target="_blank">V1 Docs</a>


## Changelog

See [CHANGELOG](CHANGELOG.md) for release notes.

## License

MIT. See [LICENSE.md](LICENSE.md).
