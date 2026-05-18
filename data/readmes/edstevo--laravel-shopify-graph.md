# Laravel Shopify Graph API Integration

Laravel package for posting Shopify Admin GraphQL queries/mutations with typed input DTOs.

## Installation

```bash
composer require edstevo/laravel-shopify-graph
```

Publish config:

```bash
php artisan vendor:publish --tag=shopify-graph-config
```

Published config:

```php
return [
    'enabled' => env('SHOPIFY_ENABLED', true),
];
```

## API Versioning

The Shopify API version is intentionally hardcoded in the package (`2026-01`).  
When upgrading Shopify API versions, this package should release a new major version.

## Usage

### Facade

```php
use EdStevo\LaravelShopifyGraph\Facades\LaravelShopifyGraph;

$response = LaravelShopifyGraph::post(
    'your-shop.myshopify.com',
    'access_token',
    'query { shop { name } }',
    [] // optional variables
);
```

### Connection Class

```php
$response = app(\EdStevo\LaravelShopifyGraph\LaravelShopifyGraphConnection::class)->post(
    'your-shop.myshopify.com',
    'access_token',
    'query { shop { name } }',
    [] // optional variables
);
```

### Request Class

```php
use EdStevo\LaravelShopifyGraph\LaravelShopifyGraphRequest;

class CreateBlogArticleRequest extends LaravelShopifyGraphRequest
{
    public function __construct(public BlogArticle $article) {}

    public function query(): string
    {
        return '
            mutation CreateArticle($article: ArticleCreateInput!) {
              articleCreate(article: $article) {
                article {
                  id
                }
                userErrors {
                  code
                  field
                  message
                }
              }
            }
        ';
    }

    public function variables(): array
    {
        return [
            'article' => ArticleCreateInput::from($this->article->toShopifyPayload())->toArray(),
        ];
    }

    public function transformResponse(array $data): mixed
    {
        return $data['articleCreate']['article']['id'] ?? null;
    }
}

$request = new CreateBlogArticleRequest(BlogArticle::first());
$shopifyId = $request->post('your-shop.myshopify.com', 'access_token');
```

### Queue Job Class (recommended for mutations)

```php
use EdStevo\LaravelShopifyGraph\LaravelShopifyGraphJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreateBlogArticleJob extends LaravelShopifyGraphJob implements ShouldQueue
{
    public function __construct(
        public BlogArticle $article,
        public string $shopDomain,
        public string $accessToken
    ) {}

    public function getShopDomain(): string
    {
        return $this->shopDomain;
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function query(): string
    {
        return '
            mutation CreateArticle($article: ArticleCreateInput!) {
              articleCreate(article: $article) {
                article {
                  id
                }
                userErrors {
                  code
                  field
                  message
                }
              }
            }
        ';
    }

    public function variables(): array
    {
        return [
            'article' => ArticleCreateInput::from($this->article->toShopifyPayload())->toArray(),
        ];
    }

    public function handleResponse(array $data): void
    {
        $this->article->update([
            'shopify_id' => $data['articleCreate']['article']['id'] ?? null,
        ]);
    }
}

CreateBlogArticleJob::dispatch(BlogArticle::first(), 'your-shop.myshopify.com', 'access_token');
```

For synchronous execution:

```php
CreateBlogArticleJob::dispatchSync(BlogArticle::first(), 'your-shop.myshopify.com', 'access_token');
```

## Testing

```bash
composer test
```

## Changelog

See [CHANGELOG](CHANGELOG.md).

## Credits

- [Edward Stephenson](https://github.com/edstevo)
- [All Contributors](../../contributors)

## License

MIT.
