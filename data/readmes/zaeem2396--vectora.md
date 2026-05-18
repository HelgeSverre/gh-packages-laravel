# Vectora

**Community-built PHP/Laravel SDK for [Pinecone](https://www.pinecone.io/)** — embeddings, vector upsert/query/delete, Eloquent sync, and queue-friendly jobs over Pinecone’s **REST API**. Pinecone does not publish an official PHP client; Vectora is maintained independently and is intended to be **useful to PHP developers** and **straightforward to share with Pinecone** as a reference Laravel integration (not an official Pinecone product).

**Requirements:** PHP **8.2+**, Laravel **11.x or 12.x**, `ext-json`.

## Install

```bash
composer require vectora/laravel-pinecone
```

If the package is not yet on [Packagist](https://packagist.org/), require it from GitHub:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/cod3xa/vectora.git"
        }
    ],
    "require": {
        "vectora/laravel-pinecone": "dev-main"
    },
    "minimum-stability": "dev",
    "prefer-stable": true
}
```

Laravel **auto-discovers** `PineconeServiceProvider` and registers the **`Pinecone`** and **`Vector`** facades.

Publish configuration:

```bash
php artisan vendor:publish --tag=pinecone-config
```

Set at least **`PINECONE_API_KEY`** and your index **host** (see `config/pinecone.php` and env keys `PINECONE_HOST` / `indexes`). For **OpenAI** embeddings, set **`OPENAI_API_KEY`** (or `PINECONE_OPENAI_API_KEY`).

Run a **queue worker** if you use queued upserts/deletes or `HasEmbeddings` with `PINECONE_ELOQUENT_SYNC=queued`:

```bash
php artisan queue:work
```

## Documentation

| Doc | Content |
|-----|---------|
| **[doc/installation.md](doc/installation.md)** | Install, env reference, verification, troubleshooting |
| **[doc/readme.md](doc/readme.md)** | Architecture, design, doc index |
| **[doc/laravel.md](doc/laravel.md)** | Service provider, jobs, commands, multi-index |
| **[doc/embeddings.md](doc/embeddings.md)** | Embedding drivers, OpenAI, caching |
| **[doc/eloquent.md](doc/eloquent.md)** | `HasEmbeddings`, semantic search, batch reindex |
| **[doc/core.md](doc/core.md)** | Framework-agnostic HTTP client usage |
| **[doc/dx.md](doc/dx.md)** | Phase 5 & 11: query cache, debug HTTP, `semanticWhere`/`semanticOrderBy`, attributes, `make:vector-model`, `pinecone:semantic-debug` |
| **[doc/observability.md](doc/observability.md)** | Phase 6 HTTP metrics; Phase 12 trace id, embedding/LLM events, cost estimates, `pinecone:observability` |
| **[doc/multi-backend.md](doc/multi-backend.md)** | Phase 7: Qdrant, Weaviate, SQLite, pgvector, `VectorStoreManager` |
| **[doc/rag.md](doc/rag.md)** | Phase 8: RAG pipeline, `Vector` facade, LLM drivers, streaming |
| **[doc/ingestion.md](doc/ingestion.md)** | Phase 9: chunking, file/HTML/URL ingestion, `Vector::ingest()`, jobs |
| **[doc/search.md](doc/search.md)** | Phase 10: hybrid-style search, reranking, facets, pagination, score normalization |
| **[doc/roadmap.md](doc/roadmap.md)** | Phases and future work |

### Examples (Phase 5 — DX)

**Cache vector queries** (same query body hits Laravel cache until TTL or flush):

```env
PINECONE_QUERY_CACHE=true
PINECONE_QUERY_CACHE_TTL=300
```

**Debug HTTP payloads** (truncated; use only in non-production):

```env
PINECONE_DEBUG=true
PINECONE_LOG_REQUESTS=true
```

**Observability 2.0 (Phase 12)** — correlate traces and estimate embedding/LLM cost (optional):

```env
VECTORA_OBSERVABILITY_V2=true
```

Use `VectorOperationTrace::begin()` in middleware or jobs; see **[doc/observability.md](doc/observability.md)**.

**Handle errors by category** after catching `Vectora\Pinecone\Core\Exception\ApiException`:

```php
if ($e->isAuthenticationError()) {
    // rotate API key / alert
} elseif ($e->category() === \Vectora\Pinecone\Core\Exception\ApiErrorCategory::RateLimited) {
    // backoff
}
```

## Development (this repository)

```bash
composer install
composer test
composer run format:test
composer analyse
```

## License

MIT (see `composer.json`).
