# DDD Foundation for Laravel

> [!IMPORTANT]  
> Currently work in progress! 🚧

A comprehensive toolkit providing foundational building blocks for implementing Domain-Driven Design (DDD) patterns in Laravel 12+ applications. This package offers battle-tested base classes, contracts, and infrastructure components to help you build scalable, maintainable domain-driven applications.

## Features

- 🏗️ **Aggregate & Entity Base Classes** - Ready-to-use foundation for domain entities with built-in versioning and timestamps
- 🎯 **Event Sourcing Support** - Complete domain event handling with automatic event dispatching via Laravel's event system
- 🔄 **Repository Pattern** - Abstract repository implementation with entity-model mapping
- 🗺️ **Entity-Model Mappers** - Clean separation between domain and infrastructure layers
- 🆔 **UUID Primary Keys** - Built-in UUID support for entities and models
- 🔐 **Optimistic Locking** - Automatic version tracking to prevent concurrent update conflicts
- 📦 **Value Objects** - Type-safe value object implementations (MongoObjectId, UUID, Email, Link, Json)
- 🔌 **Service Layer Pattern** - Interfaces for application and domain services
- ⚡ **Transaction Support** - Automatic transaction handling in repositories

## Requirements

- **PHP**: 8.3+
- **Laravel**: 12+
- **Dependencies**:
    - `illuminate/support`
    - `illuminate/database`
    - `illuminate/events`
    - `spatie/laravel-data`
    - `ramsey/uuid`

## Installation

Install via Composer:

```bash
composer require lava83/ddd-foundation
```

## Core Concepts

### Entity Hierarchy

```
Entity (Base)
    ├── Aggregate (extends Entity + Event Handling)
    └── Child Entities (extend Entity)
```

## Quick Start Guide

### 1. Creating an Entity

Entities are domain objects with identity that can change over time:

```php
<?php

declare(strict_types=1);

namespace App\Domain\TrelloManagement\Entities;

use Illuminate\Support\Collection;
use Lava83\DddFoundation\Domain\Entities\Entity;
use App\Domain\TrelloManagement\ValueObjects\Identity\MemberId;

class Member extends Entity
{
    public function __construct(
        private MemberId $trelloId,
        protected string $fullName,
        protected string $username,
    ) {
        parent::__construct();
    }

    public function id(): MemberId
    {
        return $this->trelloId;
    }

    public function fullName(): string
    {
        return $this->fullName;
    }

    public function username(): string
    {
        return $this->username;
    }

    public function update(string $fullName, string $username): void
    {
        $this->updateEntity([
            'fullName' => $fullName,
            'username' => $username,
        ]);
    }

    protected function applyChanges(Collection $changes): void
    {
        $this->applyChangesByPropertyMap([
            'fullName' => fn($value) => $this->fullName = $value,
            'username' => fn($value) => $this->username = $value,
        ], $changes);
    }
}
```

### 2. Creating an Aggregate Root

Aggregates are the main entry points for domain operations and manage domain events:

```php
<?php

declare(strict_types=1);

namespace App\Domain\TrelloManagement\Entities;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Lava83\DddFoundation\Domain\Entities\Aggregate;
use Lava83\DddFoundation\Domain\ValueObjects\Communication\Link;
use App\Domain\TrelloManagement\Events\BoardCreated;
use App\Domain\TrelloManagement\Events\BoardUpdated;
use App\Domain\TrelloManagement\ValueObjects\Identity\BoardId;

class Board extends Aggregate
{
    public function __construct(
        protected BoardId $trelloId,
        protected string $name,
        protected string $description,
        protected bool $isClosed,
        protected Link $link,
        protected Link $shortUrl,
        protected bool $isSubscribed,
        protected ?CarbonImmutable $closedAt,
        protected ?CarbonImmutable $lastActivityAt,
        protected ?CarbonImmutable $lastView,
        protected Collection $lists,
        protected ?Webhook $webhook,
    ) {
        parent::__construct();
    }

    public static function create(
        BoardId $trelloId,
        string $name,
        string $description,
        bool $isClosed,
        Link $link,
        Link $shortUrl,
        bool $isSubscribed,
        ?CarbonImmutable $closedAt = null,
        ?CarbonImmutable $lastActivityAt = null,
        ?CarbonImmutable $lastView = null,
    ): self {
        $board = new self(
            trelloId: $trelloId,
            name: $name,
            description: $description,
            isClosed: $isClosed,
            link: $link,
            shortUrl: $shortUrl,
            isSubscribed: $isSubscribed,
            closedAt: $closedAt,
            lastActivityAt: $lastActivityAt,
            lastView: $lastView,
            lists: new Collection,
            webhook: null,
        );

        $board->recordEvent(
            new BoardCreated(
                $board->id(),
                collect([
                    'trelloId' => $board->trelloId(),
                    'name' => $board->name(),
                    'description' => $board->description(),
                    // ... other data
                ])
            )
        );

        return $board;
    }

    public function id(): BoardId
    {
        return $this->trelloId;
    }

    public function update(
        string $name,
        string $description,
        bool $isClosed,
        Link $link,
        Link $shortUrl,
        bool $isSubscribed,
        ?CarbonImmutable $closedAt,
        ?CarbonImmutable $lastActivityAt,
        ?CarbonImmutable $lastView
    ): void {
        $this->updateAggregateRoot(
            [
                'name' => $name,
                'description' => $description,
                'isClosed' => $isClosed,
                'link' => $link,
                'shortUrl' => $shortUrl,
                'isSubscribed' => $isSubscribed,
                'closedAt' => $closedAt,
                'lastActivityAt' => $lastActivityAt,
                'lastView' => $lastView,
            ],
            BoardUpdated::class,
        );
    }

    protected function applyChanges(Collection $changes): void
    {
        $this->applyChangesByPropertyMap([
            'name' => fn($value) => $this->name = $value,
            'description' => fn($value) => $this->description = $value,
            'isClosed' => fn($value) => $this->isClosed = $value,
            'link' => fn($value) => $this->link = $value,
            'shortUrl' => fn($value) => $this->shortUrl = $value,
            'isSubscribed' => fn($value) => $this->isSubscribed = $value,
            'closedAt' => fn($value) => $this->closedAt = $value,
            'lastActivityAt' => fn($value) => $this->lastActivityAt = $value,
            'lastView' => fn($value) => $this->lastView = $value,
        ], $changes);
    }
}
```

### 3. Implementing a Repository

Repositories provide collection-like access to aggregates:

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Repositories\Trello;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Lava83\DddFoundation\Infrastructure\Repositories\Repository;
use App\Domain\TrelloManagement\Contracts\Board\BoardRepositoryInterface;
use App\Domain\TrelloManagement\Entities\Board;
use App\Domain\TrelloManagement\ValueObjects\Identity\BoardId;
use App\Infrastructure\Mappers\Trello\BoardMapper;
use App\Infrastructure\Models\Trello\Board\BoardModel;

class EloquentBoardRepository extends Repository implements BoardRepositoryInterface
{
    protected string $aggregateClass = Board::class;

    public function exists(BoardId $boardId): bool
    {
        return BoardModel::where('trello_id', $boardId->toString())->exists();
    }

    public function find(BoardId $boardId): ?Board
    {
        $model = BoardModel::with(['boardLists', 'webhook'])
            ->find($boardId->toString());

        return $model ? BoardMapper::toEntity($model, true) : null;
    }

    public function findOrFail(BoardId $boardId): Board
    {
        return BoardMapper::toEntity(
            BoardModel::with(['boardLists', 'webhook'])
                ->findOrFail($boardId->toString()),
            true
        );
    }

    public function findAll(): Collection
    {
        return BoardModel::with(['boardLists', 'webhook'])
            ->latest()
            ->get()
            ->map(fn(BoardModel $model) => BoardMapper::toEntity($model, true));
    }

    public function save(Board $board): void
    {
        DB::transaction(fn() => $this->saveEntity($board));
    }

    public function delete(Board $board): void
    {
        // Implementation
    }
}
```

### 4. Creating Entity-Model Mappers

Mappers handle the translation between domain entities and infrastructure models:

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Mappers\Trello;

use Lava83\DddFoundation\Domain\Entities\Entity;
use Lava83\DddFoundation\Infrastructure\Contracts\EntityMapper;
use Lava83\DddFoundation\Infrastructure\Models\Model;
use App\Domain\TrelloManagement\Entities\Member;
use App\Domain\TrelloManagement\ValueObjects\Identity\MemberId;
use App\Infrastructure\Models\Trello\Member\MemberModel;

class MemberMapper implements EntityMapper
{
    /**
     * @param MemberModel $model
     */
    public static function toEntity(Model $model, bool $deep = false): Entity
    {
        $member = new Member(
            trelloId: MemberId::fromString($model->trello_id),
            fullName: $model->full_name,
            username: $model->username,
        );

        $member->hydrate($model);

        return $member;
    }

    /**
     * @param Member $entity
     */
    public static function toModel(Entity $entity): MemberModel
    {
        $data = [
            'trello_id' => $entity->trelloId(),
            'full_name' => $entity->fullName(),
            'username' => $entity->username(),
            'created_at' => $entity->createdAt(),
            'updated_at' => $entity->updatedAt(),
            'version' => $entity->version(),
        ];

        $member = MemberModel::findOr(
            $entity->id(), 
            ['*'], 
            fn() => app(MemberModel::class)
        );
        $member->fill($data);

        return $member;
    }
}
```

### 5. Registering Mappers

Create a mapper resolver to manage entity-to-mapper relationships:

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Mappers;

use Lava83\DddFoundation\Domain\Entities\Aggregate;
use Lava83\DddFoundation\Infrastructure\Contracts\EntityMapper;
use Lava83\DddFoundation\Infrastructure\Contracts\EntityMapperResolver as EntityMapperResolverContract;
use App\Domain\TrelloManagement\Entities\Board;
use App\Domain\TrelloManagement\Entities\Member;
use App\Infrastructure\Mappers\Trello\BoardMapper;
use App\Infrastructure\Mappers\Trello\MemberMapper;

class EntityMapperResolver implements EntityMapperResolverContract
{
    /**
     * @param class-string<Aggregate> $entityClass
     */
    public function resolve(string $entityClass): EntityMapper
    {
        return match ($entityClass) {
            Board::class => app(BoardMapper::class),
            Member::class => app(MemberMapper::class),
            default => throw new NoMapperFoundForEntity($entityClass),
        };
    }
}
```

Register in your service provider:

```php
$this->app->singleton(
    EntityMapperResolverContract::class,
    EntityMapperResolver::class,
);
```

### 6. Working with Domain Events

Create domain events to capture important business occurrences:

```php
<?php

declare(strict_types=1);

namespace App\Domain\TrelloManagement\Events;

use Lava83\DddFoundation\Domain\Events\DomainEvent;

class BoardCreated extends DomainEvent
{
    public function eventName(): string
    {
        return 'trello.board.created';
    }
}
```

Handle events using Laravel Event Subscribers:

```php
<?php

declare(strict_types=1);

namespace App\Application\Listeners;

use Illuminate\Events\Dispatcher;
use App\Domain\TrelloManagement\Events\BoardCreated;
use App\Domain\TrelloManagement\Events\BoardUpdated;

class BoardEventSubscriber
{
    public function handleBoardCreated(BoardCreated $event): void
    {
        // Handle board creation
        // e.g., send notifications, update read models, etc.
    }

    public function handleBoardUpdated(BoardUpdated $event): void
    {
        // Handle board updates
    }

    public function subscribe(Dispatcher $events): array
    {
        return [
            BoardCreated::class => 'handleBoardCreated',
            BoardUpdated::class => 'handleBoardUpdated',
        ];
    }
}
```

Register the subscriber in your `EventServiceProvider`:

```php
protected $subscribe = [
    BoardEventSubscriber::class,
];
```

### 7. Creating Application Services

Application services orchestrate domain operations:

```php
<?php

declare(strict_types=1);

namespace App\Application\Services\Trello\Board;

use Illuminate\Support\Collection;
use Lava83\DddFoundation\Domain\ValueObjects\Communication\Link;
use App\Domain\TrelloManagement\Contracts\Board\BoardRepositoryInterface;
use App\Domain\TrelloManagement\Contracts\Board\BoardServiceInterface;
use App\Domain\TrelloManagement\Entities\Board;
use App\Domain\TrelloManagement\ValueObjects\Identity\BoardId;

class BoardApplicationService implements BoardServiceInterface
{
    public function __construct(
        private BoardRepositoryInterface $boardRepository,
    ) {}

    public function listBoards(): Collection
    {
        return $this->boardRepository->findAll();
    }

    public function board(string $boardId): Board
    {
        return $this->boardRepository->findOrFail(
            BoardId::fromString($boardId)
        );
    }

    public function createBoard(array $data): Board
    {
        $board = Board::create(
            trelloId: BoardId::fromString($data['trello_id']),
            name: $data['name'],
            description: $data['description'],
            isClosed: $data['is_closed'],
            link: Link::fromString($data['link']),
            shortUrl: Link::fromString($data['short_url']),
            isSubscribed: $data['is_subscribed'],
            closedAt: $data['closed_at'] ?? null,
            lastActivityAt: $data['last_activity_at'] ?? null,
            lastView: $data['last_view'] ?? null,
        );

        $this->boardRepository->save($board);

        return $board;
    }

    public function updateBoard(string $boardId, array $data): Board
    {
        $board = $this->boardRepository->findOrFail(
            BoardId::fromString($boardId)
        );

        $board->update(
            name: $data['name'],
            description: $data['description'],
            isClosed: $data['is_closed'],
            link: Link::fromString($data['link']),
            shortUrl: Link::fromString($data['short_url']),
            isSubscribed: $data['is_subscribed'],
            closedAt: $data['closed_at'] ?? null,
            lastActivityAt: $data['last_activity_at'] ?? null,
            lastView: $data['last_view'] ?? null,
        );

        $this->boardRepository->save($board);

        return $board;
    }
}
```

### 8. Creating Value Objects

Value objects represent descriptive aspects of your domain:

#### Simple Date Range Value Object Example

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObjects;

use Carbon\CarbonImmutable;
use Lava83\DddFoundation\Domain\ValueObjects\ValueObject;

class DateRange extends ValueObject
{
    private function __construct(
        private CarbonImmutable $startDate,
        private CarbonImmutable $endDate,
    ) {
        $this->validate();
    }

    public static function create(
        CarbonImmutable $startDate, 
        CarbonImmutable $endDate
    ): self {
        return new self($startDate, $endDate);
    }

    public function startDate(): CarbonImmutable
    {
        return $this->startDate;
    }

    public function endDate(): CarbonImmutable
    {
        return $this->endDate;
    }

    public function contains(CarbonImmutable $date): bool
    {
        return $date->greaterThanOrEqualTo($this->startDate)
            && $date->lessThanOrEqualTo($this->endDate);
    }

    public function overlaps(DateRange $other): bool
    {
        return $this->startDate->lessThanOrEqualTo($other->endDate)
            && $other->startDate->lessThanOrEqualTo($this->endDate);
    }

    public function durationInDays(): int
    {
        return $this->startDate->diffInDays($this->endDate);
    }

    protected function validate(): void
    {
        if ($this->startDate->greaterThan($this->endDate)) {
            throw new \InvalidArgumentException(
                'Start date must be before or equal to end date'
            );
        }
    }

    public function toString(): string
    {
        return sprintf(
            '%s to %s',
            $this->startDate->format('Y-m-d'),
            $this->endDate->format('Y-m-d')
        );
    }

    public function toArray(): array
    {
        return [
            'start_date' => $this->startDate->toDateString(),
            'end_date' => $this->endDate->toDateString(),
        ];
    }

    public function equals(mixed $other): bool
    {
        if (!$other instanceof self) {
            return false;
        }

        return $this->startDate->equalTo($other->startDate)
            && $this->endDate->equalTo($other->endDate);
    }
}
```

#### Using Built-in Value Objects

```php
use Lava83\DddFoundation\Domain\ValueObjects\Identity\Uuid;
use Lava83\DddFoundation\Domain\ValueObjects\Identity\MongoObjectId;
use Lava83\DddFoundation\Domain\ValueObjects\Communication\Email;
use Lava83\DddFoundation\Domain\ValueObjects\Communication\Link;
use Lava83\DddFoundation\Domain\ValueObjects\Data\Json;

// UUID
$userId = Uuid::generate();
$userId = Uuid::fromString('550e8400-e29b-41d4-a716-446655440000');

// MongoDB ObjectId (compatible with Trello IDs)
$boardId = MongoObjectId::fromString('507f1f77bcf86cd799439011');

// Email
$email = Email::fromString('user@example.com');
echo $email->toString(); // user@example.com

// Link/URL
$url = Link::fromString('https://example.com');
echo $url->toString(); // https://example.com

// JSON Data
$json = Json::fromArray(['key' => 'value']);
$data = $json->toArray();
```

## Key Features Explained

### Automatic Event Dispatching

When you save an aggregate through a repository, domain events are automatically dispatched:

```php
$board = Board::create(/* ... */);
$board->update(/* ... */); // Records BoardUpdated event

$boardRepository->save($board); 
// 1. Saves to database
// 2. Automatically dispatches all uncommitted events via Laravel's event system
// 3. Clears uncommitted events from the aggregate
```

The `Repository` base class handles this through the `dispatchUncommittedEvents()` method, which uses Laravel's `Illuminate\Events\Dispatcher`.

### Optimistic Locking

All entities include automatic version tracking to prevent lost updates:

```php
// User A loads board
$boardA = $boardRepository->find($boardId);
$versionA = $boardA->version(); // version = 1

// User B loads same board
$boardB = $boardRepository->find($boardId);

// User B updates and saves
$boardB->update(/* ... */);
$boardRepository->save($boardB); // version now = 2

// User A tries to save
$boardA->update(/* ... */);
$boardRepository->save($boardA); 
// Throws ConcurrencyException because version mismatch
```

### UUID Primary Keys

Models automatically use UUIDs as primary keys by extending the framework's `Model` base class:

```php
<?php

namespace App\Infrastructure\Models\Trello\Board;

use Lava83\DddFoundation\Infrastructure\Models\Model;

class BoardModel extends Model
{
    protected $table = 'trello_boards';
    protected $primaryKey = 'trello_id'; // Uses UUID/MongoObjectId
    
    protected $fillable = [
        'trello_id',
        'name',
        'description',
        // ...
    ];
}
```

### Transaction Support

Repositories automatically wrap save operations in transactions:

```php
public function save(Board $board): void
{
    DB::transaction(fn() => $this->saveEntity($board));
}
```

## Architecture & Layering

### Recommended Project Structure

```
app/
├── Application/                    # Application Layer
│   ├── Controllers/               # API Controllers
│   ├── Requests/                  # Form Requests
│   ├── Resources/                 # API Resources
│   └── Services/                  # Application Services
│       └── Trello/
│           ├── Board/
│           │   ├── BoardApplicationService.php
│           │   └── BoardSynchronizationService.php
│           └── ...
├── Domain/                        # Domain Layer
│   └── TrelloManagement/
│       ├── Contracts/            # Domain Interfaces
│       │   ├── Board/
│       │   │   ├── BoardRepositoryInterface.php
│       │   │   └── BoardServiceInterface.php
│       │   └── ...
│       ├── Entities/             # Domain Entities & Aggregates
│       │   ├── Board.php
│       │   ├── BoardList.php
│       │   ├── Card.php
│       │   └── Member.php
│       ├── Events/               # Domain Events
│       │   ├── BoardCreated.php
│       │   ├── BoardUpdated.php
│       │   └── ...
│       ├── Exceptions/           # Domain Exceptions
│       └── ValueObjects/         # Domain Value Objects
│           └── Identity/
│               ├── BoardId.php
│               └── MemberId.php
└── Infrastructure/                # Infrastructure Layer
    ├── Mappers/                  # Entity-Model Mappers
    │   ├── EntityMapperResolver.php
    │   └── Trello/
    │       ├── BoardMapper.php
    │       └── MemberMapper.php
    ├── Models/                   # Eloquent Models
    │   └── Trello/
    │       ├── Board/
    │       │   ├── BoardModel.php
    │       │   └── BoardListModel.php
    │       └── ...
    ├── Providers/                # Service Providers
    │   ├── RepositoriesServiceProvider.php
    │   └── RelationServiceProvider.php
    └── Repositories/             # Repository Implementations
        └── Trello/
            ├── EloquentBoardRepository.php
            └── EloquentMemberRepository.php
```

### Layer Responsibilities

**Domain Layer** (Pure PHP, no Laravel dependencies)
- Business logic and rules
- Entities and Aggregates
- Domain events
- Value Objects
- Repository and Service contracts

**Application Layer** (Minimal Laravel usage)
- Application services (use cases)
- Controllers
- Request validation
- Resource transformers
- Use Laravel helpers like `collect()` when beneficial

**Infrastructure Layer** (Full Laravel integration)
- Eloquent models
- Repository implementations
- Entity-Model mappers
- External service integrations
- Database migrations

## Service Provider Setup

### Register Repositories

```php
<?php

namespace App\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\TrelloManagement\Contracts\Board\BoardRepositoryInterface;
use App\Infrastructure\Repositories\Trello\EloquentBoardRepository;

class RepositoriesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            BoardRepositoryInterface::class, 
            EloquentBoardRepository::class
        );
        
        // Register other repositories...
    }
}
```

### Register Application Services

```php
<?php

namespace App\Application\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\TrelloManagement\Contracts\Board\BoardServiceInterface;
use App\Application\Services\Trello\Board\BoardApplicationService;

class ApplicationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            BoardServiceInterface::class,
            BoardApplicationService::class
        );
        
        // Register other services...
    }
}
```

## Best Practices

### 1. Keep Domain Layer Pure

Minimize Laravel dependencies in the domain layer:

```php
// ✅ Good - Uses generic Collection from illuminate/support
use Illuminate\Support\Collection;

class Board extends Aggregate
{
    public function __construct(
        // ...
        protected Collection $lists,
    ) {
        parent::__construct();
    }
}

// ❌ Avoid - Don't use Eloquent in domain layer
use Illuminate\Database\Eloquent\Collection;
```

### 2. Use Helper Functions Sparingly

Use Laravel helpers like `collect()` in domain when beneficial:

```php
public function activeBoards(): Collection
{
    return collect($this->boards)->filter(
        fn(Board $board) => !$board->isClosed()
    );
}
```

### 3. Always Use Static Factory Methods

Create aggregates through named constructors:

```php
// ✅ Good - Clear intent
$board = Board::create($id, $name, $description, ...);

// ❌ Avoid - Using new directly
$board = new Board($id, $name, $description, ...);
```

### 4. Record Events for All State Changes

```php
public function update(/* params */): void
{
    $this->updateAggregateRoot(
        [/* changes */],
        BoardUpdated::class, // Always provide event class
    );
}
```

### 5. Use Transactions for Aggregate Saves

Always wrap saves in transactions to ensure consistency:

```php
public function save(Board $board): void
{
    DB::transaction(fn() => $this->saveEntity($board));
}
```

## Planned Features

- ⏳ **Soft Deletes** - Soft delete support at entity, aggregate, and model layers
- ⏳ **Additional Value Objects** - More built-in value objects (Money, Address, etc.)
- ⏳ **Advanced Mapper Types** - Support for different mapping strategies

## Troubleshooting

### "No mapper found for entity class"

Ensure you've registered the mapper in your `EntityMapperResolver`:

```php
public function resolve(string $entityClass): EntityMapper
{
    return match ($entityClass) {
        YourEntity::class => app(YourEntityMapper::class),
        // ...
    };
}
```

### "Concurrency Exception"

This indicates two processes tried to update the same aggregate simultaneously. Handle it gracefully:

```php
try {
    $repository->save($board);
} catch (ConcurrencyException $e) {
    // Reload entity and retry, or notify user
    $board = $repository->findOrFail($boardId);
    // Reapply changes...
}
```

### Events Not Dispatching

Ensure:
1. You're calling `save()` on the repository (not directly on the model)
2. Your event subscribers are registered in `EventServiceProvider`
3. Events extend the framework's `DomainEvent` base class

## Contributing

This is currently a private package. For questions or suggestions, contact the maintainer.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Credits

Built with ❤️ by [lava83](https://github.com/lava83) for building scalable Laravel applications using Domain-Driven Design principles.
