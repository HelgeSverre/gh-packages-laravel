# astroway/sdk-laravel

> Official Laravel ServiceProvider + facade for [`astroway/sdk`](https://packagist.org/packages/astroway/sdk) — auto-discovered, env-driven, container singleton.

[![Packagist version](https://img.shields.io/packagist/v/astroway/sdk-laravel.svg?style=flat&color=blue)](https://packagist.org/packages/astroway/sdk-laravel)

## Install

```bash
composer require astroway/sdk-laravel
php artisan vendor:publish --tag=astroway-config
```

ServiceProvider + facade auto-register via `composer.json`'s `extra.laravel.providers` — no edit to `config/app.php` needed.

## Configure

`.env`:

```env
ASTROWAY_API_KEY=aw_live_…
ASTROWAY_BASE_URL=https://api.astroway.info/v1   # optional
ASTROWAY_TIMEOUT=30                                # optional, seconds
ASTROWAY_AUTH_SCHEME=header                        # optional, header|bearer
```

`config/astroway.php` (published from the package) pulls these from `env()`.

## Use

### Via dependency injection

```php
use Astroway\Astroway;

class ChartController extends Controller
{
    public function __construct(private readonly Astroway $astroway) {}

    public function store(Request $request)
    {
        return response()->json(
            $this->astroway->chart()->compute($request->all()),
        );
    }
}
```

### Via facade

```php
use Astroway\Laravel\Facades\Astroway;

return Astroway::chart()->compute(['date' => '1990-01-15', ...]);
```

### Via container alias

```php
$aw = app('astroway');
$chart = $aw->chart()->compute([...]);
```

## Roadmap

- `0.1.0-alpha.x` — ServiceProvider + facade + config publish (current).
- `0.1.0-beta.1` — Telescope integration (every Astroway call visible in Telescope HTTP tab).
- `0.1.0-rc.1` — Artisan commands (`php artisan astroway:health`, `astroway:credits`).
- `0.1.0` — stable surface freeze.

## Links

- 📦 Packagist: <https://packagist.org/packages/astroway/sdk-laravel>
- 📦 Core SDK: [`astroway/sdk`](https://packagist.org/packages/astroway/sdk)
- 📘 API docs: <https://api.astroway.info/docs/>

## License

MIT — see [`LICENSE`](./LICENSE).
