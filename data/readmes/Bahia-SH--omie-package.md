# Omie SDK

Pacote Laravel pra integrar com API Omie. Multi-tenant, com fila, rate-limit, log estruturado e feedback claro pro programador.

## Instalação

```bash
composer require bahiash/omie-sdk
php artisan vendor:publish --tag=omie-config
php artisan migrate
```

Auto-discovery: `OmieServiceProvider` + facade `Omie`.

## Configuração mínima

`.env`:

```
OMIE_QUEUE_CONNECTION=redis
OMIE_QUEUE=omie
OMIE_HTTP_TIMEOUT=30
OMIE_HTTP_RETRY_ENABLED=true
```

Cache **deve** suportar locks (`redis` ou `database`).

## Uso

### Async (fila) — padrão

```php
use Bahiash\Omie\Facades\Omie;

$correlationId = Omie::for($appKey, $appSecret, tenantId: $tenant->id)
    ->produtos()
    ->dispatch('ListarProdutos', [
        ['pagina' => 1, 'registros_por_pagina' => 50],
    ]);

// $correlationId = uuid → use pra rastrear o log
```

### Síncrono — quando precisar resposta imediata

```php
$log = Omie::for($appKey, $appSecret)
    ->produtos()
    ->call('ConsultarProduto', [['codigo_produto_integracao' => 'ABC']]);

if ($log->wasSuccessful()) {
    $produto = $log->response_body;
} else {
    // $log->omie_fault_code, $log->omie_fault_string, $log->retryable
}
```

### Generic — qualquer endpoint Omie

```php
Omie::for($appKey, $appSecret)
    ->dispatch('produtos/familias', 'ListarFamilias', [['pagina' => 1]]);
```

### Aguardar resultado de chamada async

```php
$id = Omie::for($k, $s)->produtos()->dispatch('ListarProdutos', [...]);

$log = Omie::waitFor($id, timeoutSeconds: 30);

$log->wasSuccessful();   // bool
$log->response_body;     // array
$log->omie_fault_code;   // ex: "SOAP-ENV:Client-101"
$log->retryable;         // bool
```

### Eventos

Dois eventos disparados automaticamente:

- `Bahiash\Omie\Events\OmieCallSucceeded`
- `Bahiash\Omie\Events\OmieCallFailed`

Listener:

```php
use Bahiash\Omie\Events\OmieCallSucceeded;

class ProcessarProdutoOmie
{
    public function handle(OmieCallSucceeded $event): void
    {
        $log = $event->getLog();
        $params = $event->getEventParams();   // ex: ['pedido_id' => 42]

        // log->response_body já decodificado
    }
}
```

`EventServiceProvider`:

```php
protected $listen = [
    OmieCallSucceeded::class => [ProcessarProdutoOmie::class],
    OmieCallFailed::class    => [NotificarFalhaOmie::class],
];
```

Passar `eventParams` na chamada:

```php
Omie::for($k, $s)->produtos()->dispatch(
    'IncluirProduto',
    [$produto],
    eventClass: null,
    eventParams: ['origem_id' => 99]
);
```

### Tratamento de erro

```php
use Bahiash\Omie\Exceptions\OmieApiException;

try {
    $log = Omie::for($k, $s)->produtos()->call('IncluirProduto', [$dados]);
} catch (OmieApiException $e) {
    $e->getOmieFaultCode();    // SOAP-ENV:Client-101
    $e->getOmieFaultString();  // mensagem original Omie
    $e->getHttpStatus();       // 400/500/etc
    $e->isRateLimited();       // bool
    $e->isRetryable();         // bool
}
```

## Tabela de log (`omie_api_logs`)

Colunas chave:

| Coluna | Uso |
|---|---|
| `correlation_id` | uuid retornado pelo `dispatch()`/`call()` |
| `tenant_id` | identificador opcional do tenant |
| `status` | `pending` / `running` / `success` / `failed` |
| `attempt` | tentativa do job |
| `omie_fault_code` / `omie_fault_string` | erro estruturado Omie |
| `retryable` | indica se erro pode ser re-tentado |
| `duration_ms`, `finished_at` | métricas |
| `request_body`, `response_body` | payload mascarado |

Recuperar log direto:

```php
use Bahiash\Omie\Models\OmieApiLog;

$log = OmieApiLog::findByCorrelationId($id);
```

## Rate Limiting

Limites Omie aplicados automaticamente no worker:

- 960/min por IP
- 240/min por app+method
- 4 simultâneas por app+method (com `acquire`/`release` em `finally`)

Configuração em `config/omie.php` → `rate_limit`. Estratégia `fixed` (default) ou `sliding` (Redis sorted set).

## Mascaramento de dados sensíveis

Recursivo. Configure em `config/omie.php` → `logging.masked_fields`:

```php
'masked_fields' => ['app_secret','password','cnpj_cpf','cpf','token'],
```

Aplica em `request_body`, `response_body` e `event_params` (request body — request `app_secret` nunca chega ao log porque o job só persiste `params`, não as credenciais).

## Retry

Job tem `tries` e `backoff` configuráveis em `config('omie.queue')`. Erros marcados `retryable=false` (ex: validação Omie 4xx) chamam `fail()` direto, sem retentar.

## Modelo de extensão

Adicionar novo recurso = uma classe vazia:

```php
namespace App\Omie;

use Bahiash\Omie\Services\AbstractOmieService;

class FamiliasService extends AbstractOmieService
{
    public const SERVICE_PATH = 'produtos/familias';
}
```

Ou usar `Omie::for(...)->dispatch($servicePath, $method, $params)` direto (generic), sem criar classe.

## Arquitetura (resumo)

```
Service (Produtos|Clientes|...|Generic)
  └─ DispatchOmieCallJob (gera correlation_id, captura IP)
       └─ worker → handle()
            ├─ logger->startLog (status=running, mascara recursivo)
            ├─ rateLimiter->acquire (IP + app+method + concurrent)
            ├─ try
            │    ├─ new OmieClient(...)->call()  (timeout/retry/parse fault)
            │    ├─ logger->finishLogSuccess
            │    └─ Event::dispatch(OmieCallSucceeded)
            ├─ catch
            │    ├─ logger->finishLogError (com omie_fault_code, retryable)
            │    ├─ Event::dispatch(OmieCallFailed)
            │    └─ if !retryable → $this->fail(); senão rethrow (retry)
            └─ finally
                 └─ rateLimiter->releaseConcurrent
```

## Comandos úteis

```bash
composer install
vendor/bin/phpunit
vendor/bin/phpunit --filter testMethodName
```
