# Laravel Version

A tiny port-adapter version resolver for Laravel apps. Pluggable sources: `VERSION` file, env var, git tag, or config array.

```
composer require othercode/laravel-version
```

- PHP **^8.3**
- Laravel **^11.0 || ^12.0**

## Usage

The package auto-registers its service provider and ships a `version()` helper. Anywhere in your app:

```php
$version = version();              // SemanticVersion instance
(string) $version;                 // "1.2.3-beta"
$version->major;                   // "1"
$version->minor;                   // "2"
$version->patch;                   // "3"
$version->status;                  // "beta"
```

Prefer explicit DI? Resolve the manager yourself:

```php
use OtherCode\Laravel\Version\VersionManager;

$version = app(VersionManager::class)->version();
```

## Choosing a source

Configure via `config/version.php` (publish with `php artisan vendor:publish --tag=version-config`) or env vars:

```env
VERSION_SOURCE=file                 # file | env | git | config
VERSION_FILE_PATH=VERSION           # used when VERSION_SOURCE=file
VERSION_ENV_KEY=version.value       # used when VERSION_SOURCE=env
APP_VERSION=v1.2.3-beta             # used when VERSION_SOURCE=env
VERSION_CONFIG_PREFIX=version       # used when VERSION_SOURCE=config
```

### `file` (default)

Reads a plain-text `VERSION` file at the app base path. Great for build-time injection:

```sh
# build.sh
git describe --tags --abbrev=0 > VERSION
```

### `env`

Reads `config('version.value')`, typically fed by `APP_VERSION`. Ideal for platforms like Laravel Cloud where the deploy system injects the release tag as an environment variable. Laravel Cloud does **not** auto-inject a version — set `APP_VERSION` per release in the dashboard.

### `git`

Runs `git describe --tags --abbrev=0` via Symfony Process. Useful in **dev** and **CI build steps**, not in container runtimes: Docker images built from your repo typically do not ship the `.git` directory, so this adapter will fall back to `v0.0.0-dev` in production.

### `config`

Reads four keys from a config bag: `{prefix}.major`, `{prefix}.minor`, `{prefix}.patch`, `{prefix}.status` (prefix defaults to `version`). Ideal when your app already keeps hardcoded version fragments in `config/version.php` and you want the file to stay pure data:

```php
// config/version.php (consumer app)
return [
    'source' => 'config',

    'major' => '1',
    'minor' => '2',
    'patch' => '3',
    'status' => 'beta',
];
```

## Using a custom source

Bind your own adapter anywhere (e.g. in a service provider):

```php
use OtherCode\Laravel\Version\Contracts\VersionSource;
use OtherCode\Laravel\Version\SemanticVersion;

$this->app->singleton(VersionSource::class, fn () => new class implements VersionSource {
    public function version(): SemanticVersion {
        return SemanticVersion::fromString('1.0.0');
    }
});
```

## Semantic version value object

`SemanticVersion` is a tiny immutable VO that parses `[v]MAJOR[.MINOR[.PATCH]][-STATUS]`:

```php
use OtherCode\Laravel\Version\SemanticVersion;

SemanticVersion::fromString('v2.5.0-rc1');
SemanticVersion::fromString('2.5');       // pads MINOR/PATCH with "0"
SemanticVersion::fromString('');          // throws InvalidArgumentException
```

## The `version()` helper

The package registers a global `version()` function guarded by `function_exists()`. If something in your app already defines `version()`, ours is silently skipped and you can still use `app(VersionManager::class)->version()` directly.

## License

MIT — see [LICENSE](LICENSE).
