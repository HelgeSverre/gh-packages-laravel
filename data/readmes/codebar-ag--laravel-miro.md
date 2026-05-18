<img src="https://banners.beyondco.de/Laravel%20Miro.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-miro&pattern=circuitBoard&style=style_2&description=A+Laravel+Miro+integration.&md=1&showWatermark=0&fontSize=150px&images=template&widths=500&heights=500">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-miro.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-miro)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-miro.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-miro)
[![GitHub Tests](https://github.com/codebar-ag/laravel-miro/actions/workflows/run-tests-pest.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-miro/actions/workflows/run-tests-pest.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-miro/actions/workflows/fix-php-code-style-issues-pint.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-miro/actions/workflows/fix-php-code-style-issues-pint.yml)

This package was developed to give you a quick start to the Miro API.

## 📑 Table of Contents

- [What is Miro?](#-what-is-miro)
- [Requirements](#-requirements)
- [Installation](#️-installation)
- [Laravel Boost Skill](#-laravel-boost-skill)
- [Usage](#-usage)
  - [Response Handling](#response-handling)
  - [DTOs](#dtos)
- [API Reference](#api-reference)
  - [Boards](#boards)
  - [Board Items](#board-items)
  - [Sticky Notes](#sticky-notes)
  - [Frames](#frames)
- [Testing](#-testing)
- [Changelog](#-changelog)
- [Contributing](#️-contributing)
- [Security Vulnerabilities](#️-security-vulnerabilities)
- [Credits](#-credits)
- [License](#-license)

## 💡 What is Miro?

Miro is an online collaborative whiteboard platform that enables teams to work effectively together, from brainstorming with digital sticky notes to planning and managing agile workflows.

## 🛠 Requirements

| Package  | PHP           | Laravel       |
|----------|---------------|---------------|
| v0.1.1   | ^8.4          | ^12.0 \| ^13.0 |

## ⚙️ Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-miro
```

Optionally, you can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-miro-config"
```

Add your Miro access token to your `.env` file:

```dotenv
MIRO_ACCESS_TOKEN=your_access_token_here
```

You can generate a personal access token at [miro.com/app/settings/user-profile/apps](https://miro.com/app/settings/user-profile/apps).

## 🤖 Laravel Boost Skill

This package includes a [Laravel Boost](https://laravel.com/docs/boost) skill. If you use Laravel Boost in your project, the skill is automatically installed when you run:

```bash
php artisan boost:install
```

The skill provides AI agents with full context about the package — available methods, DTOs, response handling, and usage patterns.

## 🚀 Usage

All methods are available via the `Miro` facade and return a typed Response object.

```php
use CodebarAg\Miro\Facades\Miro;

$response = Miro::getBoard('board_id');
```

### Response Handling

All `*Response` objects expose the following methods:

```php
$response->successful();  // bool
$response->failed();      // bool
$response->status();      // int    (e.g. 200, 404, 429)
$response->error();       // ?string — null on success
$response->errorCode();   // ?string — null on success
$response->dto();         // typed DTO or array of DTOs, null on failure
```

Check `successful()` before accessing the DTO — no try/catch needed for API errors like 404, 429, or 400.

```php
$response = Miro::getBoard('board_id');

if ($response->successful()) {
    $board = $response->dto(); // BoardDto
} else {
    $response->status();     // e.g. 404
    $response->error();      // e.g. "Board not found"
    $response->errorCode();  // e.g. "board_not_found"
}
```

### DTOs

We provide DTOs for the following:

| DTO             | Fields                                                                                              |
|-----------------|-----------------------------------------------------------------------------------------------------|
| `BoardDto`      | `id`, `name`, `description`, `type`, `viewLink`, `teamId`, `projectId`, `createdAt`, `modifiedAt`  |
| `BoardItemDto`  | `id`, `type`, `data`, `position`, `geometry`, `createdAt`, `modifiedAt`, `parentId`                |
| `StickyNoteDto` | `id`, `type`, `content`, `shape`, `fillColor`, `textAlign`, `textAlignVertical`, `positionX`, `positionY`, `width`, `height`, `parentId`, `createdAt`, `modifiedAt` |
| `FrameDto`      | `id`, `type`, `title`, `fillColor`, `positionX`, `positionY`, `width`, `height`, `parentId`, `createdAt`, `modifiedAt` |

## API Reference

### Boards

```php
use CodebarAg\Miro\Facades\Miro;
use CodebarAg\Miro\Dto\Boards\CreateBoardDto;
use CodebarAg\Miro\Dto\Boards\GetBoardsDto;
use CodebarAg\Miro\Dto\Boards\UpdateBoardDto;
```

```php
/**
 * Get All Boards
 */
$response = Miro::getBoards();
$boards = $response->dto(); // BoardDto[]
```

```php
/**
 * Get Boards With Filters
 */
$response = Miro::getBoards(new GetBoardsDto(
    teamId: 'team_123',
    limit: 10,
));
```

```php
/**
 * Get A Board
 */
$response = Miro::getBoard('board_id');
$board = $response->dto(); // BoardDto
```

```php
/**
 * Create A Board
 */
$response = Miro::createBoard(new CreateBoardDto(
    name: 'My Sprint Board',
    description: 'Q1 planning board',
));
$board = $response->dto(); // BoardDto
```

```php
/**
 * Update A Board
 */
$response = Miro::updateBoard('board_id', new UpdateBoardDto(
    name: 'Q1 Planning',
));
$board = $response->dto(); // BoardDto
```

```php
/**
 * Delete A Board
 */
Miro::deleteBoard('board_id'); // returns Saloon\Http\Response
```

### Board Items

```php
use CodebarAg\Miro\Facades\Miro;
use CodebarAg\Miro\Dto\BoardItems\GetBoardItemsDto;
```

```php
/**
 * Get All Items On A Board
 */
$response = Miro::getBoardItems('board_id');
$items = $response->dto(); // BoardItemDto[]
```

```php
/**
 * Get Items Filtered By Type
 */
$response = Miro::getBoardItems('board_id', new GetBoardItemsDto(
    type: 'sticky_note',
));
```

```php
/**
 * Get A Board Item
 */
$response = Miro::getBoardItem('board_id', 'item_id');
$item = $response->dto(); // BoardItemDto
```

### Sticky Notes

```php
use CodebarAg\Miro\Facades\Miro;
use CodebarAg\Miro\Dto\StickyNotes\CreateStickyNoteDto;
use CodebarAg\Miro\Dto\StickyNotes\GetStickyNotesDto;
use CodebarAg\Miro\Dto\StickyNotes\UpdateStickyNoteDto;
```

```php
/**
 * Get All Sticky Notes On A Board
 */
$response = Miro::getStickyNotes('board_id');
$notes = $response->dto(); // StickyNoteDto[]
```

```php
/**
 * Get A Sticky Note
 */
$response = Miro::getStickyNote('board_id', 'item_id');
$note = $response->dto(); // StickyNoteDto
```

```php
/**
 * Create A Sticky Note
 */
$response = Miro::createStickyNote('board_id', new CreateStickyNoteDto(
    content: 'Hello World',
    shape: 'square',
    fillColor: 'yellow',
    positionX: 100.0,
    positionY: 200.0,
));
$note = $response->dto(); // StickyNoteDto
```

```php
/**
 * Update A Sticky Note
 */
$response = Miro::updateStickyNote('board_id', 'item_id', new UpdateStickyNoteDto(
    content: 'Updated content',
));
$note = $response->dto(); // StickyNoteDto
```

```php
/**
 * Delete A Sticky Note
 */
Miro::deleteStickyNote('board_id', 'item_id'); // returns Saloon\Http\Response
```

### Frames

```php
use CodebarAg\Miro\Facades\Miro;
use CodebarAg\Miro\Dto\Frames\CreateFrameDto;
use CodebarAg\Miro\Dto\Frames\GetFramesDto;
use CodebarAg\Miro\Dto\Frames\UpdateFrameDto;
```

```php
/**
 * Get All Frames On A Board
 */
$response = Miro::getFrames('board_id');
$frames = $response->dto(); // FrameDto[]
```

```php
/**
 * Get A Frame
 */
$response = Miro::getFrame('board_id', 'item_id');
$frame = $response->dto(); // FrameDto
```

```php
/**
 * Create A Frame
 */
$response = Miro::createFrame('board_id', new CreateFrameDto(
    title: 'Sprint 1',
    positionX: 0.0,
    positionY: 0.0,
    width: 1920.0,
    height: 1080.0,
));
$frame = $response->dto(); // FrameDto
```

```php
/**
 * Update A Frame
 */
$response = Miro::updateFrame('board_id', 'item_id', new UpdateFrameDto(
    title: 'Sprint 1 – Updated',
));
$frame = $response->dto(); // FrameDto
```

```php
/**
 * Delete A Frame
 */
Miro::deleteFrame('board_id', 'item_id'); // returns Saloon\Http\Response
```

## 🧪 Testing

```bash
composer test
```

To run the live API tests against the real Miro API, set your token as an environment variable:
```env
MIRO_ACCESS_TOKEN=your_access_token_here 
```


```bash
vendor/bin/pest --group=live
```

Alternatively, add it to `.env.testing` in the project root.

## 📝 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## ⚒️ Contributing

Please see [CONTRIBUTING](https://github.com/codebar-ag/.github/blob/main/CONTRIBUTING.md) for details.

## 🔒️ Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## 🙏 Credits

- [codebar AG](https://github.com/codebar-ag)
- [All Contributors](../../contributors)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
