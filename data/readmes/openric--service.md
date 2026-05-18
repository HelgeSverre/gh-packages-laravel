# OpenRiC

An open-source Records in Contexts (RiC-O) service. Laravel 12 backend with Apache Jena Fuseki as the RDF store.

OpenRiC is the authoritative RiC-O implementation for the Archive & Heritage Group stack. Heratio currently consumes RiC features in-process; over time it will migrate to consuming them via OpenRiC's HTTP API.

## Repository layout

```
/
├── app/                       Laravel application code
├── bin/release                Release script — bumps version, commits, tags
├── config/                    Laravel config
├── database/                  Migrations, seeders
├── docs/
│   ├── drift-log.md           Cherry-pick log between OpenRiC and Heratio
│   ├── outreach/              Email drafts, contribution proposals
│   └── plans/                 Implementation plans (read before executing)
├── packages/
│   ├── ahg-core/              Vendored from Heratio — shared base services
│   ├── ahg-api/               Vendored from Heratio — REST/auth plumbing
│   └── ahg-ric/               Vendored from Heratio — RiC entity mgmt
├── public/
├── resources/                 Views, JS, CSS
├── routes/                    HTTP + console routes
├── storage/
├── tests/
├── CHANGELOG.md
├── composer.json
├── version.json               Source of truth for current version
└── README.md
```

The `packages/` dir holds our own copies of Heratio's shared packages. **Do not symlink them back to Heratio** — that re-couples the two trees. Drift is tracked per-bug-fix in `docs/drift-log.md`.

## Release flow

**Never `git push` without using `bin/release` first.** It enforces the version invariant.

```bash
./bin/release patch "Fix OntologyService SPARQL escape bug"
./bin/release minor "Phase 1 — RiC-O load + OntologyService" --issue 7
./bin/release major "Break: rename route prefix to /reference/ric-cm"
```

What it does:

1. Requires a clean working tree and `main` branch.
2. Bumps `version.json` (semver).
3. Prepends a dated entry to `CHANGELOG.md`.
4. Commits those two files with message `vX.Y.Z: <message>`.
5. Creates an annotated git tag `vX.Y.Z`.
6. **Does NOT push.** Prints the push commands for you to run.

To undo locally (before pushing):

```bash
git tag -d vX.Y.Z
git reset --hard HEAD~1
```

## Environment

See `.env.example` for the full list. Minimum required beyond Laravel defaults:

- `FUSEKI_URL` — the Jena Fuseki endpoint (default `http://localhost:3030`).
- `FUSEKI_DATASET_DATA=openric` — instance data.
- `FUSEKI_DATASET_MODEL=openric-model` — RiC-O OWL ontology (populated in Phase 1 of the reference-browser plan).
- `FUSEKI_USER` / `FUSEKI_PASSWORD` — admin credentials for ontology loads; public SPARQL reads are anonymous.

## Contributing

Read `docs/plans/` for the current implementation plan before writing code. Follow the architectural decisions captured there; do not introduce new frontend stacks or break the declared package interface without the decision being explicitly reopened.

## License

AGPL-3.0 (matching the rest of the AHG stack).
