# jekabs/laravel-rag

[![Tests](https://github.com/jecis-repos/laravel-rag/actions/workflows/tests.yml/badge.svg)](https://github.com/jecis-repos/laravel-rag/actions)
[![PHP 8.2+](https://img.shields.io/badge/php-8.2%2B-blue.svg)](https://www.php.net/)
[![Laravel 10-13](https://img.shields.io/badge/laravel-10--13-red.svg)](https://laravel.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Laravel RAG (Retrieval-Augmented Generation) package with **AST-aware code extractors**, a **knowledge graph**, **multi-hop search**, pgvector semantic search, BM25 keyword search, and Reciprocal Rank Fusion.

## What Makes This Different

Most RAG implementations chunk files by character count and do a single vector search. This package **understands Laravel code structure**:

- **12 AST extractors** using `nikic/php-parser` that understand Eloquent relationships, morph maps, event/listener bindings, service container registrations, routes, migrations, Filament resources, middleware, and validation rules
- **Knowledge graph** with typed edges (belongs_to, has_many, listens_to, binds_to, routes_to, etc.)
- **Multi-hop graph traversal** — a query about "LeadController" automatically discovers "SalesKpiService" and "ActivityRepository" via graph edges, without those terms in the query
- **4-stage search pipeline**: pgvector cosine similarity → ILIKE keyword → Reciprocal Rank Fusion → multi-hop expansion
- **BM25 scoring** (k1=1.5, b=0.75) for keyword results
- **Recency boost** for recently modified files

## Installation

```bash
composer require jekabs/laravel-rag
```

Publish config and migrations:
```bash
php artisan vendor:publish --tag=laravel-rag-config
php artisan vendor:publish --tag=laravel-rag-migrations
php artisan migrate
```

### Prerequisites

- PostgreSQL with pgvector extension (`CREATE EXTENSION vector`)
- PHP 8.2+
- Laravel 10+

## Quick Start

### 1. Configure Your Embedding Driver

Create a class implementing `EmbeddingDriverContract`:

```php
use Jekabs\LaravelRag\Contracts\EmbeddingDriverContract;

class OpenAIEmbeddingDriver implements EmbeddingDriverContract
{
    public function embed(string $text): array
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $text,
        ]);
        return $response->embeddings[0]->embedding;
    }

    public function embedBatch(array $texts): array
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $texts,
        ]);
        return array_map(fn ($e) => $e->embedding, $response->embeddings);
    }
}
```

Set it in config:
```php
// config/laravel-rag.php
'embedding_driver' => \App\Rag\OpenAIEmbeddingDriver::class,
```

### 2. Index Your Codebase

```php
use Jekabs\LaravelRag\Indexer;

$indexer = app(Indexer::class);
$count = $indexer->indexDirectory(base_path('app'));

echo "Indexed {$count} files";
```

### 3. Search

```php
use Jekabs\LaravelRag\Search\KnowledgeSearch;

$search = app(KnowledgeSearch::class);
$results = $search->search('How does user authentication work?');

foreach ($results as $result) {
    echo "{$result->name} ({$result->type}) — score: {$result->score}\n";
    echo "  via: {$result->matchType}, hop: {$result->hop}\n";
}
```

## The 12 Extractors

| Extractor | What It Finds | Edges Created |
|-----------|--------------|---------------|
| `ClassExtractor` | Classes, interfaces, traits, enums | extends, implements |
| `MethodExtractor` | Methods with visibility, params, return types | — |
| `RelationshipExtractor` | Eloquent relationships (hasMany, belongsTo, etc.) | hasMany, belongsTo, morphMany, etc. |
| `MorphMapExtractor` | `Relation::morphMap()` definitions | morph_alias |
| `EventListenerExtractor` | Event/listener bindings from `$listen` | listened_by |
| `ServiceBindingExtractor` | `bind()`, `singleton()`, `scoped()` calls | binds_to |
| `RouteExtractor` | Route definitions (get/post/resource) | routes_to |
| `MigrationExtractor` | `Schema::create/table` with table names | — |
| `ConfigExtractor` | Config file contents | — |
| `FilamentResourceExtractor` | Filament resource + model binding | manages_model |
| `MiddlewareExtractor` | Middleware classes with `handle()` | — |
| `ValidationRuleExtractor` | Custom validation rule classes | — |

## Search Pipeline

```
Query "LeadController"
   │
   ├── Stage 1: pgvector cosine similarity  →  [LeadController.php (0.92)]
   ├── Stage 2: ILIKE keyword + BM25        →  [LeadController.php (4.2), lead_routes.php (1.8)]
   ├── Stage 3: Reciprocal Rank Fusion      →  [LeadController.php (0.048), lead_routes.php (0.016)]
   └── Stage 4: Multi-hop graph traversal   →  + SalesKpiService.php (0.033, hop=1)
                                                + ActivityRepository.php (0.018, hop=2)
```

## Configuration

See `config/laravel-rag.php` for all options:
- `embedding_dimensions` — vector size (default: 1536)
- `search.top_k` — max results per stage
- `search.hop_penalty` — score decay per hop (default: 0.15)
- `search.max_hops` — traversal depth (default: 2)
- `search.bm25_k1`, `search.bm25_b` — BM25 parameters
- `search.rrf_k` — RRF constant (default: 60)
- `search.recency_days`, `search.recency_boost` — boost recent files

## How It Compares

| Feature | **laravel-rag** | Other Laravel RAG packages |
|---------|:-:|:-:|
| AST-aware code parsing | 12 extractors | Text chunking only |
| Knowledge graph with typed edges | Multi-hop traversal | No graph |
| Hybrid search (semantic + keyword) | pgvector + BM25 + RRF | Single-mode search |
| Laravel-specific understanding | Eloquent, routes, events, bindings | Generic text |
| Incremental indexing | Content hash tracking | Full re-index |
| BM25 with Yates correction | Built-in | Not available |
| Recency boost | Configurable | Not available |
| Bring-your-own embeddings | Driver contract | Hardcoded provider |
| Zero external API lock-in | Works with any embedding source | Often tied to OpenAI |

Compared packages: `omniglies/laravel-rag`, `thaolaptrinh/laravel-rag`, `akira/laravel-rag`, `mohaphez/laravel-ragkit`, `nomanur/laravel-markdown-rag`.

## Testing

```bash
composer install
vendor/bin/phpunit
```

81 tests covering all 12 extractors, BM25 algorithm, chunking service, search pipeline, and end-to-end scenarios. Most tests run without a database — integration tests that require PostgreSQL + pgvector are skipped automatically when unavailable.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. The most common contribution is adding a new AST extractor — the architecture makes this straightforward.

## License

MIT
