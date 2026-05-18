# somisa/pokemon

[![Tests](https://github.com/somisa/pokemon/actions/workflows/tests.yml/badge.svg)](https://github.com/somisa/pokemon/actions/workflows/tests.yml)

A Laravel package for the [PokeAPI](https://pokeapi.co/). Fetch Pokémon data with a clean, testable service class and Facade.

---

## Requirements

| Dependency | Version |
|---|---|
| PHP | ^8.2 |
| Laravel | ^11.0 \| ^12.0 |

---

## Installation

```bash
composer require somisa/pokemon
```

The service provider and facade are auto-discovered by Laravel's package discovery.

Optionally publish the config file:

```bash
php artisan vendor:publish --tag=pokemon-config
```

---

## Configuration

`config/pokemon.php`:

```php
return [
    'base_url' => env('POKEAPI_URL', 'https://pokeapi.co/api/v2'),
];
```

Set `POKEAPI_URL` in your `.env` to override the default endpoint.

---

## Usage

### Via Facade

```php
use Somisa\Pokemon\Facades\Pokemon;

// Get a single Pokémon by name
$response = Pokemon::getPokemon('pikachu');
$data = $response->json();

// Get a list of Pokémon names
$response = Pokemon::getNames(limit: 20);
$list = $response->json('results');
```

### Via Dependency Injection

```php
use Somisa\Pokemon\Pokemon;

class PokemonController extends Controller
{
    public function __construct(private readonly Pokemon $pokemon) {}

    public function show(string $name): JsonResponse
    {
        $data = $this->pokemon->getPokemon($name)->json();
        return response()->json($data);
    }
}
```

---

## API

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `getPokemon(string $name)` | `$name = 'arbok'` | `Response` | Fetch a single Pokémon by name or ID |
| `getNames(int $limit)` | `$limit = 10` | `Response` | Fetch a paginated list of Pokémon names |

All methods return an `Illuminate\Http\Client\Response` instance.

---

## Development

```bash
# Install dependencies
composer install

# Run tests
composer test

# Fix code style
composer pint

# Check code style (CI mode — no changes)
vendor/bin/pint --test

# Run static analysis
composer stan

# Check type coverage
composer types
```

### Testing

Tests use [Pest](https://pestphp.com/) and [Orchestra Testbench](https://github.com/orchestral/testbench).

```bash
vendor/bin/pest
vendor/bin/pest --coverage
```

---

## Local Development with Path Repository

When developing this package alongside a Laravel app, add a path repository override
in the app's `composer.json`:

```json
"repositories": [
    {
        "type": "path",
        "url": "../pokemon",
        "options": { "symlink": true }
    }
]
```

Then require the package:

```bash
composer require somisa/pokemon:@dev
```

Changes to the package source are reflected immediately without pushing to GitHub.

---

## Changelog

### v1.0.0
- Initial release
- `getPokemon()` — fetch single Pokémon
- `getNames()` — fetch Pokémon list
- Facade support
- Config publish

---

## License

MIT — see [LICENSE](LICENSE).

---

## Author

**András Somos** · [somisa.hu](https://www.somisa.hu) · info@somisa.hu

---

[![Background music](https://img.youtube.com/vi/_OR0BwCXUJA/0.jpg)](https://www.youtube.com/watch?v=_OR0BwCXUJA)
