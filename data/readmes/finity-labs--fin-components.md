# Finity Labs Filament Components

Monorepo for Finity Labs' Filament packages. Each package can be installed individually.

| Package | Install |
|---|---|
| [Avatar](packages/fin-avatar) | `composer require finity-labs/fin-avatar` |
| [Mail](packages/fin-mail) | `composer require finity-labs/fin-mail` |
| [ModalTableSelect](packages/fin-modal-table-select) | `composer require finity-labs/fin-modal-table-select` |
| [Sentinel](packages/fin-sentinel) | `composer require finity-labs/fin-sentinel` |

See each package's README for documentation.

## Development

All package sources live under `packages/`. To run a package's tests:

```bash
cd packages/fin-avatar
composer install
vendor/bin/pest
```

## Releasing

Each package has its own version trajectory. Tags use the format `<package-name>/v<version>` and split out to the matching mirror repo with the bare version (no prefix), where Packagist picks it up.

```bash
git tag fin-avatar/v1.2.0
git push origin fin-avatar/v1.2.0
# → finity-labs/fin-avatar gets a new v1.2.0 tag
```

Packages release independently — bumping fin-mail does not touch the others.

## License

MIT
