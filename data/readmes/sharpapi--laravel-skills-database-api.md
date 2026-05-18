![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# Skills Database API for Laravel

## 🚀 Access a comprehensive database of professional skills for your Laravel applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-skills-database-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-skills-database-api)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-skills-database-api.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-skills-database-api)

Check the details at SharpAPI's [Skills Database API](https://sharpapi.com/en/catalog/utility/skills-database-api) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Skills Database API package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-skills-database-api
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-skills-database-api
```

---
## Key Features

- **Skill Search**: Search for skills by name or keyword.
- **Skill Details**: Get detailed information about specific skills.

---

## Usage

You can inject the `SkillsDatabaseApiService` class to access the skills database functionality.

### Basic Workflow

1. **Search for Skills**: Use `searchSkills` to find skills by name or keyword.
2. **Get Skill Details**: Use `getSkillById` to get detailed information about a specific skill.

---

### Controller Example

Here is an example of how to use `SkillsDatabaseApiService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\SkillsDatabaseApi\SkillsDatabaseApiService;

class SkillsController extends Controller
{
    protected SkillsDatabaseApiService $skillsService;

    public function __construct(SkillsDatabaseApiService $skillsService)
    {
        $this->skillsService = $skillsService;
    }

    /**
     * @throws GuzzleException
     */
    public function searchSkills(string $query)
    {
        $results = $this->skillsService->searchSkills($query);
        
        return response()->json($results);
    }

    /**
     * @throws GuzzleException
     */
    public function getSkillDetails(string $skillId)
    {
        $skill = $this->skillsService->getSkillById($skillId);
        
        return response()->json($skill);
    }
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $skills = $this->skillsService->searchSkills('programming');
} catch (ClientException $e) {
    echo $e->getMessage();
}
```

---

## Optional Configuration

You can customize the configuration by setting the following environment variables in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
SHARP_API_BASE_URL=https://sharpapi.com/api/v1
```

---

## Skill Data Format Example

```json
{
  "data": {
    "id": "df0d4541-2a03-49ba-aefc-6cb46f6cc26c",
    "name": "PHP",
    "slug": "php",
    "related_skills": [
      {
        "id": "6c88d71b-5666-4cd1-9d61-f1d0c33e1302",
        "name": "MySQL",
        "slug": "mysql",
        "weight": 9
      },
      {
        "id": "fb2e1204-c39b-4c28-97d7-6e6f06ae7eed",
        "name": "Laravel",
        "slug": "laravel",
        "weight": 8.5
      },
      {
        "id": "67445863-20bb-4b26-8d6c-ff5fee8dbd48",
        "name": "HTML",
        "slug": "html",
        "weight": 8
      },
      {
        "id": "79c2b261-7773-4766-aa03-eea5931bd2a5",
        "name": "JavaScript",
        "slug": "javascript",
        "weight": 7.5
      }
    ]
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-skills-database-api/issues)
- Join our [Telegram community](https://t.me/sharpapi_community)

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for a detailed list of changes.

---

## Credits

- [A2Z WEB LTD](https://github.com/a2zwebltd)
- [Dawid Makowski](https://github.com/makowskid)
- Enhance your [Laravel AI](https://sharpapi.com/) capabilities!

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Follow Us

Stay updated with news, tutorials, and case studies:

- [SharpAPI on X (Twitter)](https://x.com/SharpAPI)
- [SharpAPI on YouTube](https://www.youtube.com/@SharpAPI)
- [SharpAPI on Vimeo](https://vimeo.com/SharpAPI)
- [SharpAPI on LinkedIn](https://www.linkedin.com/products/a2z-web-ltd-sharpapicom-automate-with-aipowered-api/)
- [SharpAPI on Facebook](https://www.facebook.com/profile.php?id=61554115896974)