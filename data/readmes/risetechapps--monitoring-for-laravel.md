# Monitoring for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/risetechapps/monitoring-for-laravel.svg?style=flat-square)](https://packagist.org/packages/risetechapps/monitoring-for-laravel)
[![PHP Version](https://img.shields.io/badge/php-%5E8.3-blue)](https://www.php.net)
[![Laravel Version](https://img.shields.io/badge/laravel-%5E12.0-red)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Monitoring for Laravel** é um pacote de monitoramento completo para aplicações Laravel, desenvolvido pela [RiseTechApps](https://github.com/risetechapps). Ele captura automaticamente eventos da aplicação — requisições HTTP, exceções, jobs, comandos, notificações, e-mails, gates de autorização, eventos e muito mais — com suporte a múltiplos drivers de armazenamento.

---

## Requisitos

- PHP `^8.3`
- Laravel `^12.0`
- Laravel Sanctum `^4.0`

---

## Instalação

Instale o pacote via Composer:

```bash
composer require risetechapps/monitoring-for-laravel
```

O pacote se registra automaticamente via _auto-discovery_ do Laravel. O `ServiceProvider` e o alias `Logs` são configurados automaticamente.

### Publicar a configuração

```bash
php artisan vendor:publish --tag=config --provider="RiseTechApps\Monitoring\MonitoringServiceProvider"
```

Isso criará o arquivo `config/monitoring.php` na sua aplicação.

### Executar as migrações (drivers MySQL / PostgreSQL)

```bash
php artisan migrate
```

As migrações criam:
- A tabela `monitoring` com os campos padrão
- Índices para otimização de consultas
- **Campos de resolução de exceções** (`resolved_at`, `resolved_by`) — úteis para marcar exceções como "resolvidas"

---

## Configuração

O arquivo `config/monitoring.php` centraliza todas as opções do pacote.

### Opções principais

```php
return [
    // Habilita ou desabilita o monitoramento globalmente
    'enabled' => env('MONITORING_ENABLED', true),

    // Driver de armazenamento: 'single' ou 'database'
    'driver' => env('MONITORING_DRIVER', 'single'),

    // Quantidade de entradas acumuladas antes de persistir (buffer)
    'buffer_size' => (int) env('MONITORING_BUFFER_SIZE', 5),

    'watchers' => [ ... ],

    'drivers' => [ ... ],
];
```

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `MONITORING_ENABLED` | `true` | Liga/desliga o monitoramento |
| `MONITORING_DRIVER` | `single` | Driver de armazenamento |

---

## Drivers de Armazenamento

O pacote suporta quatro drivers, configuráveis via `MONITORING_DRIVER`.

### `single` — Arquivo de Log

Persiste os eventos em um arquivo local (`storage/logs/monitoring.log`). Ideal para desenvolvimento ou ambientes sem banco de dados.

```env
MONITORING_DRIVER=single
```

### `mysql` — MySQL

Armazena os eventos na tabela `monitoring` de uma conexão MySQL.

```env
MONITORING_DRIVER=mysql
DB_CONNECTION=mysql
```

```php
// config/monitoring.php
'mysql' => [
    'connection' => env('DB_CONNECTION', 'mysql'),
],
```

### `pgsql` — PostgreSQL

Idêntico ao driver MySQL, mas para conexões PostgreSQL.

```env
MONITORING_DRIVER=pgsql
DB_CONNECTION=pgsql
```

```php
'pgsql' => [
    'connection' => env('DB_CONNECTION', 'pgsql'),
],
```

---

## Watchers

Os _watchers_ são os componentes responsáveis por interceptar e registrar cada categoria de evento. Todos podem ser habilitados/desabilitados individualmente no arquivo de configuração.

### RequestWatcher — Requisições HTTP

Monitora todas as requisições HTTP recebidas pela aplicação.

**Dados coletados:** IP do cliente, URI, método HTTP, controller/action, middlewares, headers, payload, sessão, resposta, duração (ms) e uso de memória (MB).

**Opções de filtro:**

```php
\RiseTechApps\Monitoring\Watchers\RequestWatcher::class => [
    'enabled' => true,
    'options' => [
        'ignore_http_methods' => ['options'],   // Ignora métodos HTTP específicos
        'ignore_status_codes' => [404],         // Ignora códigos de status HTTP
        'ignore_paths' => ['telescope', 'horizon'], // Ignora paths específicos
        'size_limit' => 64,                     // Limite de tamanho da resposta em KB
    ],
],
```

> **Segurança:** Os campos `password`, `password_confirmation`, `authorization` e `php-auth-pw` são automaticamente mascarados como `********`.

---

### ExceptionWatcher — Exceções

Captura exceções registradas via `Log::error()`, `Log::critical()` e similares que passem uma instância de `Throwable` no contexto.

**Dados coletados:** classe da exceção, arquivo, linha, mensagem, contexto adicional, stack trace e preview de código (linhas ao redor da exceção).

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\ExceptionWatcher::class => [
    'enabled' => true,
    'options' => [
        // Ignorar classes de exceção específicas
        'ignore_exceptions' => [
            \Illuminate\Validation\ValidationException::class,
            \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        ],
        // Ignorar exceções cujas mensagens contenham estes textos
        'ignore_messages_containing' => ['password', 'sensitive_data'],
        // Ignorar exceções de arquivos que contenham estes caminhos
        'ignore_files_containing' => ['/vendor/'],
    ],
],
```

---

### EventWatcher — Eventos

Registra os eventos disparados na aplicação, excluindo eventos internos do framework por padrão.

**Dados coletados:** nome do evento, payload formatado, lista de listeners e indicação se o evento é broadcast.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\EventWatcher::class => [
    'enabled' => true,
    'options' => [
        'ignore' => [
            'App\Events\MeuEventoInterno',
        ],
    ],
],
```

---

### CommandWatcher — Artisan Commands

Monitora comandos Artisan executados.

**Dados coletados:** nome do comando, código de saída (`exit_code`), argumentos e opções.

> Os comandos `schedule:run`, `schedule:finish`, `package:discover`, `horizon:*`, `migrate:*` e outros comandos internos são ignorados automaticamente.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\CommandWatcher::class => [
    'enabled' => true,
    'options' => [
        'ignore' => ['meu:comando-interno'],
    ],
],
```

---

### ScheduleWatcher — Tarefas Agendadas

Registra a execução das tarefas agendadas do Laravel Scheduler.

**Dados coletados:** comando ou closure, descrição, expressão cron, timezone, usuário e saída do comando.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\ScheduleWatcher::class => [
    'enabled' => true,
    'options' => [
        // Ignorar comandos agendados específicos
        'ignore_commands' => ['my:scheduled-command'],
        // Ignorar closures (tarefas agendadas como closures)
        'ignore_closures' => false,
    ],
],
```

---

### JobWatcher — Jobs de Fila

Monitora o ciclo de vida completo de jobs, incluindo pendente, processado e falho.

**Dados coletados:**
- **Pendente:** nome, conexão, fila, tentativas, timeout, payload, `batch_id`
- **Processado:** status, nome do job, tentativas, hostname
- **Falho:** status, nome do job, mensagem de exceção, trace, preview de código, hostname

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\JobWatcher::class => [
    'enabled' => true,
    'options' => [
        // Ignorar namespaces de jobs
        'ignore_namespaces' => [
            'App\Jobs\Internal\',
        ],
        // Ignorar jobs específicos
        'ignore_jobs' => [
            \App\Jobs\HeavyLoggingJob::class,
        ],
    ],
],
```

> Jobs do próprio pacote, Telescope, Horizon e Pulse são ignorados automaticamente.

---

### QueueWatcher — Worker de Fila

Detecta parada e retomada do worker de fila. Cria um arquivo `storage/framework/queue_stopping` ao parar e o remove ao retomar.

---

### GateWatcher — Autorização

Monitora todas as verificações de autorização (Gates e Policies).

**Dados coletados:** ability verificada, resultado (`allowed`/`denied`), argumentos e arquivo/linha de origem da chamada.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\GateWatcher::class => [
    'enabled' => true,
    'options' => [
        'ignore_abilities' => ['viewNova'],
    ],
],
```

---

### NotificationWatcher — Notificações

Captura notificações enviadas pela aplicação.

**Dados coletados:** classe da notificação, se é queued, notifiable, canal, resposta e UUID da notificação.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\NotificationWatcher::class => [
    'enabled' => true,
    'options' => [
        // Ignorar classes de notificação específicas
        'ignore_notifications' => [
            \App\Notifications\TestNotification::class,
        ],
        // Ignorar canais específicos
        'ignore_channels' => ['broadcast', 'slack'],
        // Ignorar notificações anônimas (AnonymousNotifiable)
        'ignore_anonymous' => false,
    ],
],
```

---

### MailWatcher — E-mails

Registra todos os e-mails enviados.

**Dados coletados:** classe mailable, se é queued, remetente, reply-to, destinatários (to, cc, bcc), assunto, corpo HTML e e-mail bruto.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\MailWatcher::class => [
    'enabled' => true,
    'options' => [
        // Ignorar classes Mailable específicas
        'ignore_mailables' => [
            \App\Mail\TestMail::class,
        ],
        // Ignorar e-mails cujo assunto contenha estes textos
        'ignore_subjects_containing' => ['[Test]', '[Local]'],
        // Ignorar e-mails de remetentes específicos
        'ignore_from_addresses' => ['noreply@example.com'],
        // Ignorar e-mails para destinatários específicos
        'ignore_to_addresses' => ['test@example.com'],
    ],
],
```

---

### ClientRequestWatcher — HTTP Client (Saída)

Monitora requisições HTTP feitas _pela_ aplicação usando o `Http::` facade do Laravel.

**Dados coletados:** método, URI, headers, payload, status da resposta, headers da resposta, corpo da resposta e duração (ms).

> Requisições para os hosts da própria plataforma de monitoramento são ignoradas automaticamente para evitar loops.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\ClientRequestWatcher::class => [
    'enabled' => true,
    'options' => [
        'ignore_hosts' => ['api.interna.com'],
        'size_limit' => 64,
    ],
],

---

### QueryWatcher — Queries Lentas

Monitora automaticamente queries SQL que excedem um tempo limite configurado.

**Dados coletados:** SQL completo, bindings, tempo de execução, conexão utilizada, arquivo e linha de origem.

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\QueryWatcher::class => [
    'enabled' => true,
    'options' => [
        // Threshold em ms para considerar query lenta
        'slow_query_threshold_ms' => 100,
        // Padrões de SQL que devem ser ignorados
        'ignore_patterns' => ['information_schema', 'migrations', 'telescope'],
        // Logar bindings das queries
        'log_bindings' => true,
        // Tamanho máximo do SQL antes de truncar
        'max_sql_length' => 5000,
    ],
],
```

**Exemplo de uso:**

```bash
# Ver queries lentas
GET /monitoring/type/query

# Buscar queries específicas
GET /monitoring/search?q=SELECT * FROM orders
```

---

### CacheWatcher — Operações de Cache

Monitora hits, misses, escritas e deleções no cache da aplicação.

**Dados coletados:** operação (hit/miss/write/delete), key, store (redis/memcached/file), TTL (para writes).

**Opções:**

```php
\RiseTechApps\Monitoring\Watchers\CacheWatcher::class => [
    'enabled' => true,
    'options' => [
        // Registrar cache hits
        'track_hits' => true,
        // Registrar cache misses
        'track_misses' => true,
        // Chaves de cache que devem ser ignoradas
        'ignore_keys' => ['config', 'routes', 'telescope'],
    ],
],
```

**Casos de uso:**
- Identificar keys com baixo hit rate
- Detectar cache thrashing (misses excessivos)
- Analisar TTL efetivo das keys
```

---

## Loggly — Logger Estruturado

O `Loggly` é o componente de log manual do pacote, acessível via função helper global. Ele oferece uma API fluente para registrar logs ricos e estruturados.

### Helpers disponíveis

```php
loggly()          // Info (padrão)
logglyInfo()      // Nível INFO
logglyDebug()     // Nível DEBUG
logglyWarning()   // Nível WARNING
logglyNotice()    // Nível NOTICE
logglyError()     // Nível ERROR
logglyCritical()  // Nível CRITICAL
logglyAlert()     // Nível ALERT
logglyEmergency() // Nível EMERGENCY
logglyModel()     // Nível MODEL
```

### API fluente

```php
loggly()
    ->level('error')                        // Define o nível
    ->performedOn($user)                    // Modelo ou string do contexto
    ->exception($exception)                 // Captura dados da exceção
    ->withProperties(['key' => 'value'])    // Propriedades extras
    ->withContext(['request_id' => '123'])  // Contexto adicional
    ->withTags(['pagamento', 'critico'])    // Tags para categorização
    ->withRequest($request->all())          // Dados da requisição
    ->withResponse($response->json())       // Dados da resposta
    ->at(new DateTime())                    // Timestamp personalizado
    ->encrypt()                             // Encripta a mensagem
    ->to('loggly')                          // Destino: 'loggly' ou 'file'
    ->log('Mensagem do log');
```

### Exemplos de uso

**Log simples:**
```php
logglyInfo()->log('Usuário autenticado com sucesso.');
```

**Log de exceção com contexto:**
```php
try {
    // ...
} catch (Exception $e) {
    logglyError()
        ->performedOn(PaymentService::class)
        ->exception($e)
        ->withProperties(['order_id' => $orderId])
        ->log('Falha ao processar pagamento.');
}
```

**Log de modelo:**
```php
logglyModel()
    ->performedOn($produto)
    ->withContext(['acao' => 'preco_atualizado'])
    ->log('Preço do produto foi alterado.');
```

**Salvar em arquivo (sem enviar para o driver principal):**
```php
loggly()->to('file')->log('Debug local.');
```

---

## Trait `HasLoggly` — Auditoria de Models

Adicione a trait `HasLoggly` a qualquer Model Eloquent para registrar automaticamente as operações de criação, atualização, exclusão e restauração.

```php
use RiseTechApps\Monitoring\Traits\HasLoggly\HasLoggly;

class Produto extends Model
{
    use HasLoggly;
}
```

### Eventos monitorados

| Evento Eloquent | Ação registrada |
|---|---|
| `created` | `Created record.` |
| `updated` | `Updated record.` (com diff dos campos alterados) |
| `deleted` | `Deleted record.` ou `Force deleted record.` |
| `restored` | `Restored record.` (apenas com SoftDeletes) |

### Dados coletados

- **updated:** classe do model, valores antigos, valores novos e um diff com `old`/`new` para cada campo alterado.
- **created/deleted/restored:** classe do model e atributos atuais do model.

> Se o Model usar `SoftDeletes`, o evento `restored` é monitorado automaticamente.

---

## Métricas Customizáveis

Além dos watchers automáticos, você pode registrar métricas de negócio personalizadas usando o helper `monitoring()`.

### Tipos de Métricas

#### Gauge (Valor Pontual)

Registra um valor em um momento específico. Ideal para contagens, estados ou níveis.

```php
// Contagem de pedidos pendentes
monitoring()->gauge('pedidos_pendentes', Pedido::where('status', 'pendente')->count());

// Valor em estoque de um produto
monitoring()->gauge('estoque_produto', $produto->quantidade, ['produto_id' => $produto->id]);

// Usuários ativos no momento
monitoring()->gauge('usuarios_ativos', Cache::get('online_users', 0));
```

#### Counter (Contador)

Incrementa um contador. Ideal para eventos discretos.

```php
// Checkout concluído
monitoring()->increment('checkout_concluido');

// Incremento com valor personalizado
monitoring()->increment('itens_vendidos', $quantidade);

// Com tags adicionais
monitoring()->increment('pagamentos', 1, ['metodo' => 'cartao']);
monitoring()->increment('pagamentos', 1, ['metodo' => 'boleto']);
```

#### Histogram (Distribuição)

Registra valores em uma distribuição. Ideal para tempos e tamanhos.

```php
// Tempo de processamento em milissegundos
monitoring()->histogram('tempo_processamento', 250);

// Tamanho da resposta da API
monitoring()->histogram('tamanho_resposta_api', strlen($responseBody));

// Com tags para segmentação
monitoring()->histogram('tempo_db', $queryTime, ['tabela' => 'pedidos']);
```

#### Timer (Medidor de Tempo)

Executa um código e automaticamente registra o tempo de execução.

```php
// Medir tempo de uma operação
$resultado = monitoring()->timer('processar_pedido', function() use ($pedido) {
    return $this->processarPedido($pedido);
});

// Medir chamada de API externa
$dados = monitoring()->timer('api_pagamento', function() use ($payload) {
    return Http::post('https://api.pagamento.com', $payload)->json();
});

// Com tags
$relatorio = monitoring()->timer('gerar_relatorio', function() {
    return $this->gerarRelatorioVendas();
}, ['tipo' => 'vendas', 'periodo' => 'mensal']);
```

### Dados Coletados

Cada métrica registra:

| Campo | Descrição |
|---|---|
| `metric_type` | Tipo: `gauge`, `counter`, `histogram` |
| `metric_name` | Nome da métrica (ex: `checkout_concluido`) |
| `value` | Valor numérico registrado |
| `tags` | Tags adicionais para segmentação |
| `created_at` | Timestamp do registro |

### Exemplos de Uso na Prática

**Controller de Checkout:**
```php
class CheckoutController extends Controller
{
    public function processar(Request $request)
    {
        $resultado = monitoring()->timer('checkout_total', function() use ($request) {
            // Validação
            $dados = $request->validate([...]);

            // Processamento do pagamento
            $pagamento = monitoring()->timer('processar_pagamento', function() use ($dados) {
                return $this->pagamentoService->processar($dados);
            }, ['gateway' => $dados['gateway']]);

            // Criar pedido
            $pedido = Pedido::create([...]);

            // Atualizar estoque
            monitoring()->gauge('estoque_reduzido', $this->atualizarEstoque($pedido));

            return $pedido;
        });

        monitoring()->increment('pedidos_criados', 1, [
            'metodo_pagamento' => $resultado->metodo
        ]);

        return response()->json($resultado);
    }
}
```

**Job de Processamento:**
```php
class ProcessarImportacaoJob implements ShouldQueue
{
    public function handle()
    {
        monitoring()->gauge('registros_a_processar', $this->totalRegistros);

        foreach ($this->registros as $registro) {
            $processado = monitoring()->timer('processar_registro', function() use ($registro) {
                return $this->processar($registro);
            });

            if ($processado) {
                monitoring()->increment('registros_sucesso');
            } else {
                monitoring()->increment('registros_falha');
            }
        }

        monitoring()->gauge('registros_restantes', 0);
    }
}
```

**Comando Artisan:**
```php
class LimparCacheCommand extends Command
{
    public function handle()
    {
        $chavesRemovidas = monitoring()->timer('limpar_cache', function() {
            return Cache::flush();
        });

        monitoring()->increment('cache_limpo', $chavesRemovidas);
        monitoring()->gauge('cache_tamanho', Cache::getMemoryUsage());

        $this->info("Cache limpo: {$chavesRemovidas} chaves removidas.");
    }
}
```

### Consultando Métricas

As métricas são registradas com `type = 'metric'` e podem ser consultadas via API ou repositório:

```php
use RiseTechApps\Monitoring\Entry\EntryType;

// Todas as métricas
$metricas = $monitoring->getEventsByTypes(EntryType::METRIC);

// Filtrar por nome de métrica
$checkouts = $metricas->filter(fn($m) => $m['content']['metric_name'] === 'checkout_concluido');

// Calcular estatísticas
$totalCheckouts = $checkouts->sum('content.value');
$tempoMedio = $checkouts->where('content.metric_type', 'histogram')->avg('content.value');
```

---

## Middleware `monitoring.disable`

Use o middleware para desabilitar o monitoramento em rotas específicas, como painéis administrativos ou endpoints de health check.

### Registrando nas rotas

```php
// routes/web.php ou routes/api.php

Route::middleware('monitoring.disable')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));
    Route::get('/admin/dashboard', [AdminController::class, 'index']);
});
```

### Aplicando em um controller

```php
public function __construct()
{
    $this->middleware('monitoring.disable');
}
```

---

## Controle Programático

### Desabilitar o monitoramento

```php
use RiseTechApps\Monitoring\Monitoring;

Monitoring::disable();
```

### Verificar se está habilitado

```php
if (Monitoring::isEnabled()) {
    // ...
}
```

### Adicionar tags globais a todas as entradas

```php
// Em um ServiceProvider
Monitoring::tag(function ($entry) {
    return ['ambiente:' . app()->environment()];
});
```

### Ocultar parâmetros sensíveis

```php
// Em um ServiceProvider
Monitoring::$hiddenRequestParameters = ['cartao_numero', 'cvv'];
Monitoring::$hiddenResponseParameters = ['token_acesso', 'secret'];
```

### Registrar rotas do pacote

```php
Monitoring::routes();
```

---

## Estrutura da Tabela (`monitoring`)

Quando usando os drivers `mysql` ou `pgsql`, os eventos são armazenados na tabela `monitoring`:

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador primário |
| `uuid` | UUID (unique) | Identificador único da entrada |
| `batch_id` | UUID | Agrupa entradas de uma mesma requisição/job |
| `type` | string(20) | Tipo da entrada (veja abaixo) |
| `content` | JSON | Dados específicos do evento |
| `tags` | JSON | Tags associadas à entrada |
| `user` | JSON | Dados do usuário autenticado |
| `device` | JSON | Dados do dispositivo/browser |
| `resolved_at` | timestamp (nullable) | Quando a exceção foi marcada como resolvida |
| `resolved_by` | string (nullable) | Identificador de quem resolveu (email/user_id) |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

### Tipos de entrada (`type`)

| Constante | Valor | Descrição |
|---|---|---|
| `EntryType::REQUEST` | `request` | Requisição HTTP recebida |
| `EntryType::EXCEPTION` | `exception` | Exceção capturada |
| `EntryType::EVENT` | `event` | Evento da aplicação |
| `EntryType::COMMAND` | `command` | Comando Artisan |
| `EntryType::SCHEDULED_TASK` | `schedule` | Tarefa agendada |
| `EntryType::JOB` | `job` | Job de fila |
| `EntryType::GATE` | `gate` | Verificação de autorização |
| `EntryType::NOTIFICATION` | `notification` | Notificação enviada |
| `EntryType::MAIL` | `mail` | E-mail enviado |
| `EntryType::CLIENT_REQUEST` | `client_request` | Requisição HTTP de saída |
| `EntryType::LOG` | `log` | Log manual via Loggly |
| `EntryType::MODEL` | `model` | Operação em Model Eloquent |
| `EntryType::QUERY` | `query` | Query no banco de dados |
| `EntryType::METRIC` | `metric` | Métrica de negócio customizada |

---

## Buffer de Entradas

O pacote utiliza um buffer em memória para otimizar a performance, evitando uma escrita no storage para cada evento individualmente.

- As entradas são acumuladas no buffer até atingir `buffer_size` (padrão: `5`).
- O buffer é descarregado automaticamente ao final de cada requisição HTTP (evento `RequestHandled`).
- Em ambientes de console (jobs, commands), o buffer é descarregado imediatamente após cada entrada.

Configure o tamanho do buffer:

```env
MONITORING_BUFFER_SIZE=10
```

---

## Consultando os Registros de Monitoramento

O pacote fornece um repositório com métodos padronizados para leitura dos eventos, disponíveis para os drivers `dabase`. O driver `single` (arquivo) **não suporta leitura** — seus métodos retornam coleções vazias.

### Injetando o Repositório

Você pode injetar o `MonitoringRepositoryInterface` em qualquer controller, service ou job:

```php
use RiseTechApps\Monitoring\Repository\Contracts\MonitoringRepositoryInterface;

class MonitoringDashboardController extends Controller
{
    public function __construct(
        protected MonitoringRepositoryInterface $monitoring
    ) {}
}
```

Ou resolver diretamente via container:

```php
$monitoring = app(MonitoringRepositoryInterface::class);
```

---

### Métodos de Consulta

Todos os métodos retornam uma `Illuminate\Support\Collection`.

#### Todos os eventos

```php
$events = $monitoring->getAllEvents();
// Retorna todos os registros ordenados por created_at DESC
```

#### Evento por ID

Retorna o evento específico **e todos os eventos relacionados do mesmo `batch_id`** no campo `related_events`.

```php
$event = $monitoring->getEventById('uuid-ou-id-aqui');

// Estrutura de retorno:
// [
//   'id'             => '...',
//   'uuid'           => '...',
//   'batch_id'       => '...',
//   'type'           => 'request',
//   'content'        => [...],
//   'tags'           => [...],
//   'user'           => [...],
//   'device'         => [...],
//   'created_at'     => '...',
//   'updated_at'     => '...',
//   'related_events' => [...],  // outros eventos do mesmo batch
// ]
```

#### Eventos por tipo

Filtra por um dos tipos definidos em `EntryType`. Retorna cada evento com seu `related_events`.

```php
use RiseTechApps\Monitoring\Entry\EntryType;

$requests    = $monitoring->getEventsByTypes(EntryType::REQUEST);
$exceptions  = $monitoring->getEventsByTypes(EntryType::EXCEPTION);
$jobs        = $monitoring->getEventsByTypes(EntryType::JOB);
$commands    = $monitoring->getEventsByTypes(EntryType::COMMAND);
$mails       = $monitoring->getEventsByTypes(EntryType::MAIL);
$logs        = $monitoring->getEventsByTypes(EntryType::LOG);
$models      = $monitoring->getEventsByTypes(EntryType::MODEL);
$gates       = $monitoring->getEventsByTypes(EntryType::GATE);
$events      = $monitoring->getEventsByTypes(EntryType::EVENT);
$schedules   = $monitoring->getEventsByTypes(EntryType::SCHEDULED_TASK);
$notifs      = $monitoring->getEventsByTypes(EntryType::NOTIFICATION);
$outbound    = $monitoring->getEventsByTypes(EntryType::CLIENT_REQUEST);
```

#### Eventos por batch

Retorna todos os eventos que pertencem a um mesmo ciclo de requisição ou job, agrupados pelo `batch_id`.

```php
$batchEvents = $monitoring->getByBatch('batch-uuid-aqui');
```

#### Lista de tipos disponíveis

```php
$types = $monitoring->getEventsByTags();
// Retorna: ['command', 'event', 'exception', 'job', 'log', 'mail',
//           'model', 'notification', 'query', 'request',
//           'schedule', 'client_request', 'gate']
```

---

### Consulta por Período

Filtra eventos pelos períodos pré-definidos:

```php
$monitoring->getLast24Hours();  // Últimas 24 horas
$monitoring->getLast7Days();    // Últimos 7 dias
$monitoring->getLast15Days();   // Últimos 15 dias
$monitoring->getLast30Days();   // Últimos 30 dias
$monitoring->getLast60Days();   // Últimos 60 dias
$monitoring->getLast90Days();   // Últimos 90 dias
```

---

### Suporte por Driver

| Método | `database` | `single` |
|---|:----------:|:--------:|
| `getAllEvents()` |     ✅      | ❌ |
| `getEventById()` |     ✅      | ❌ |
| `getEventsByTypes()` |     ✅      | ❌ |
| `getEventsByTags()` |     ✅      | ✅* |
| `getByBatch()` |     ✅      | ❌ |
| `getTimelineByTag()` |     ✅      | ❌ |
| `gauge()` |     ✅      | ✅ |
| `increment()` |     ✅      | ✅ |
| `histogram()` |     ✅      | ✅ |
| `timer()` |     ✅      | ✅ |
| `getLast24Hours()` |     ✅      | ❌ |
| `getLast7Days()` |     ✅      | ❌ |
| `getLast15Days()` |     ✅      | ❌ |
| `getLast30Days()` |     ✅      | ❌ |
| `getLast60Days()` |     ✅      | ❌ |
| `getLast90Days()` |     ✅      | ❌ |
| `resolveEvent()` |     ✅      | ❌ |
| `resolveExceptionType()` |     ✅      | ❌ |
| `unresolveEvent()` |     ✅      | ❌ |
| `getUnresolvedExceptions()` |     ✅      | ❌ |

> *`getEventsByTags()` no driver `single` retorna apenas a lista de tipos disponíveis.

---

### Rotas HTTP de Consulta

O pacote disponibiliza rotas prontas para expor os eventos via API. Registre-as no `AppServiceProvider` ou `RouteServiceProvider`:

```php
use RiseTechApps\Monitoring\Monitoring;

// Registro básico (usa middleware 'api' por padrão)
Monitoring::routes();
```

**Opções disponíveis:**

```php
Monitoring::routes([
    'middleware'  => ['api', 'auth:sanctum'],  // middlewares customizados
    'authorize'   => 'view-monitoring',         // Gate/Policy de autorização
    'rate_limit'  => '60,1',                    // throttle: 60 req/min
    'as'          => 'monitoring.',             // prefixo dos nomes das rotas
]);
```

**Endpoints registrados:**

| Método | URI | Nome | Descrição |
|---|---|---|---|
| `GET` | `/monitoring` | `monitoring.index` | Lista todos os eventos |
| `GET` | `/monitoring/{id}` | `monitoring.show` | Detalhe de um evento + relacionados |
| `GET` | `/monitoring/type/{type}` | `monitoring.type` | Filtra por tipo |
| `POST` | `/monitoring/tags` | `monitoring.tags` | Lista tipos disponíveis |
| `GET` | `/monitoring/timeline/{tag}/{value}` | `monitoring.timeline` | Timeline cronológico por tag |

**Rotas de Health Check:**

| Método | URI | Nome | Descrição |
|---|---|---|---|
| `GET` | `/monitoring/health` | `monitoring.health` | Verifica saúde da aplicação (DB, Cache, Queue, Storage) |

**Rotas de Busca e Comparação:**

| Método | URI | Nome | Descrição |
|---|---|---|---|
| `GET` | `/monitoring/search` | `monitoring.search` | Busca full-text nos eventos |
| `GET` | `/monitoring/compare` | `monitoring.compare` | Compara métricas entre dois períodos |

**Rotas de Resolução de Exceções:**

| Método | URI | Nome | Descrição |
|---|---|---|---|
| `GET` | `/monitoring/exceptions/unresolved` | `monitoring.exceptions.unresolved` | Lista exceções não resolvidas agrupadas por tipo |
| `POST` | `/monitoring/resolve-exception` | `monitoring.exceptions.resolve-type` | Marca todas as exceções de um tipo como resolvidas |
| `POST` | `/monitoring/{id}/resolve` | `monitoring.resolve` | Marca um evento específico como resolvido |
| `POST` | `/monitoring/{id}/unresolve` | `monitoring.unresolve` | Remove o status de resolvido de um evento |

> As rotas do painel de monitoramento usam automaticamente o middleware `monitoring.disable` para não serem monitoradas.

---

### Timeline por Tag

Visualize o fluxo completo de eventos relacionados a uma tag específica em ordem cronológica. Útil para rastrear o ciclo de vida de um pedido, usuário, ou qualquer entidade monitorada.

#### Endpoint

```bash
GET /monitoring/timeline/{tag}/{value}?period=24%20hours
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `tag` | string | Sim | Nome da tag (ex: `pedido_id`) |
| `value` | string | Sim | Valor da tag (ex: `123`) |
| `period` | string | Não | Período de busca. Padrão: `24 hours`. Opções: `1 hour`, `6 hours`, `12 hours`, `24 hours`, `7 days`, `30 days`, `90 days` |

#### Exemplos de uso

**Timeline de um pedido:**

```bash
GET /monitoring/timeline/pedido_id/123?period=24%20hours
```

**Timeline de um usuário específico:**

```bash
GET /monitoring/timeline/user_id/550e8400-e29b-41d4-a716-446655440000?period=7%20days
```

#### Resposta

```json
{
  "tag": "pedido_id",
  "value": "123",
  "period": "24 hours",
  "total_batches": 2,
  "timeline": [
    {
      "batch_id": "abc-123-uuid",
      "started_at": "2025-01-15 10:23:15",
      "timeline": [
        {
          "id": "...",
          "type": "request",
          "type_label": "Requisição HTTP",
          "icon": "🌐",
          "content": { "method": "POST", "uri": "/api/pedidos", ... },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 10:23:15"
        },
        {
          "id": "...",
          "type": "query",
          "type_label": "Query SQL",
          "icon": "🗄️",
          "content": { "sql": "INSERT INTO pedidos...", "time_ms": 45 },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 10:23:15"
        },
        {
          "id": "...",
          "type": "job",
          "type_label": "Job",
          "icon": "⚙️",
          "content": { "displayName": "ProcessarPedidoJob", ... },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 10:23:16"
        },
        {
          "id": "...",
          "type": "mail",
          "type_label": "E-mail",
          "icon": "📧",
          "content": { "subject": "Pedido #123 recebido", ... },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 10:23:18"
        }
      ],
      "duration_ms": 3000,
      "event_count": 4
    },
    {
      "batch_id": "def-456-uuid",
      "started_at": "2025-01-15 14:45:22",
      "timeline": [
        {
          "id": "...",
          "type": "request",
          "type_label": "Requisição HTTP",
          "icon": "🌐",
          "content": { "method": "PUT", "uri": "/api/pedidos/123", ... },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 14:45:22"
        },
        {
          "id": "...",
          "type": "query",
          "type_label": "Query SQL",
          "icon": "🗄️",
          "content": { "sql": "UPDATE pedidos...", "time_ms": 23 },
          "tags": { "pedido_id": "123" },
          "created_at": "2025-01-15 14:45:22"
        }
      ],
      "duration_ms": 800,
      "event_count": 2
    }
  ]
}

> **Nota:** Os eventos são agrupados por `batch_id` único. Se múltiplos eventos 
> compartilharem o mesmo batch_id, você recebe apenas uma entrada na timeline 
> contendo todos os eventos relacionados.
```

#### Uso programático

```php
use RiseTechApps\Monitoring\Repository\Contracts\MonitoringRepositoryInterface;

class PedidoController extends Controller
{
    public function __construct(
        protected MonitoringRepositoryInterface $monitoring
    ) {}

    public function timeline(string $pedidoId)
    {
        // Busca todos os eventos relacionados ao pedido nas últimas 24h
        // Agrupados por batch_id único
        $timeline = $this->monitoring->getTimelineByTag('pedido_id', $pedidoId, '24 hours');

        return response()->json([
            'pedido_id' => $pedidoId,
            'total_operacoes' => $timeline->count(),
            'operacoes' => $timeline->map(function ($batch) {
                return [
                    'batch_id' => $batch['batch_id'],
                    'inicio' => $batch['started_at'],
                    'fim' => $batch['timeline']->last()['created_at'] ?? null,
                    'duracao_ms' => $batch['duration_ms'],
                    'eventos' => $batch['event_count'],
                    'passos' => $batch['timeline']->map(fn ($e) => [
                        'hora' => $e['created_at'],
                        'tipo' => $e['type_label'],
                        'icone' => $e['icon'],
                    ]),
                ];
            }),
        ]);
    }
}
```

---

### Gerenciamento de Exceções Resolvidas

O pacote permite marcar exceções como "resolvidas", facilitando o acompanhamento de bugs e evitando poluição visual no dashboard.

#### Campos adicionais na resposta

Quando um evento é resolvido, os seguintes campos são adicionados à resposta:

```php
[
  'id'             => '...',
  'uuid'           => '...',
  'type'           => 'exception',
  'content'        => [...],
  // ... outros campos ...
  'resolved_at'    => '2025-01-15 14:30:00',  // quando foi resolvido
  'resolved_by'    => 'user@example.com',     // quem resolveu
  'is_resolved'    => true,                   // flag booleana
]
```

#### Listar exceções não resolvidas

```bash
GET /monitoring/exceptions/unresolved
```

**Resposta:**
```json
[
  {
    "exception_class": "App\\Exceptions\\CustomException",
    "count": 15,
    "last_occurrence": "2025-01-15 10:23:00"
  },
  {
    "exception_class": "Illuminate\\Validation\\ValidationException",
    "count": 3,
    "last_occurrence": "2025-01-15 09:45:00"
  }
]
```

#### Marcar uma exceção como resolvida

```bash
POST /monitoring/{id}/resolve
Content-Type: application/json

{
  "resolved_by": "user@example.com"
}
```

#### Marcar múltiplas exceções do mesmo tipo como resolvidas

```bash
POST /monitoring/resolve-exception
Content-Type: application/json

{
  "exception_class": "App\\Exceptions\\CustomException",
  "resolved_by": "user@example.com"
}
```

**Resposta:**
```json
{
  "message": "15 exceções marcadas como resolvidas.",
  "exception_class": "App\\Exceptions\\CustomException",
  "count": 15
}
```

#### Desfazer a resolução

```bash
POST /monitoring/{id}/unresolve
```

#### Uso programático

```php
use RiseTechApps\Monitoring\Repository\Contracts\MonitoringRepositoryInterface;

class ExceptionController extends Controller
{
    public function __construct(
        protected MonitoringRepositoryInterface $monitoring
    ) {}

    // Marcar como resolvida
    public function resolve(string $id)
    {
        $success = $this->monitoring->resolveEvent(
            $id,
            auth()->user()?->email
        );

        return $success
            ? response()->json(['message' => 'Resolvido!'])
            : response()->json(['message' => 'Não encontrado'], 404);
    }

    // Listar não resolvidas
    public function unresolved()
    {
        $exceptions = $this->monitoring->getUnresolvedExceptions();

        return response()->json($exceptions);
    }
}
```

---

## Health Check

Endpoint para verificar a saúde da aplicação e suas dependências.

### Endpoint

```bash
GET /monitoring/health
```

### Resposta

```json
{
    "status": "healthy",
    "checks": {
        "database": { "status": "ok" },
        "cache": { "status": "ok", "driver": "redis" },
        "queue": { "status": "ok", "driver": "redis", "queue_size": 0 },
        "storage": { "status": "ok", "disk": "local" }
    },
    "performance": {
        "apdex_score": 0.94,
        "throughput_per_minute": 245,
        "error_rate_percent": 0.5
    },
    "timestamp": "2025-01-15T10:30:00Z"
}
```

### Status possíveis

| Status | Significado |
|---|---|
| `healthy` | Todos os sistemas OK |
| `degraded` | Algum sistema com problemas leves |
| `unhealthy` | Falha crítica em algum sistema |

### Uso em Load Balancers

```bash
# Health check para load balancer
GET /monitoring/health

# Retorna 200 se healthy/degraded
# Retorna 503 se unhealthy
```

---

## Sistema de Alertas

Configure notificações automáticas para eventos críticos via Slack, Discord ou Email.

### Configuração

```php
// config/monitoring.php
'alerts' => [
    'enabled' => env('MONITORING_ALERTS_ENABLED', true),

    // Webhooks
    'slack_webhook' => env('MONITORING_SLACK_WEBHOOK'),
    'discord_webhook' => env('MONITORING_DISCORD_WEBHOOK'),

    // Email
    'email' => [
        'enabled' => true,
        'to' => ['devops@empresa.com'],
        'from' => 'monitoring@empresa.com',
    ],

    // Thresholds
    'thresholds' => [
        'exceptions_per_minute' => 10,
        'failed_jobs_per_hour' => 5,
        'slow_request_ms' => 5000,
        'slow_queries_per_minute' => 10,
        'error_rate_percent' => 5.0,
    ],

    // Cooldown entre alertas (minutos)
    'cooldown_minutes' => 5,
],
```

### Variáveis de ambiente

```env
MONITORING_ALERTS_ENABLED=true
MONITORING_SLACK_WEBHOOK=https://hooks.slack.com/services/...
MONITORING_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
MONITORING_ALERTS_EMAIL_TO=devops@empresa.com,admin@empresa.com
```

### Alertas Disparados

| Evento | Threshold | Mensagem |
|---|---|---|
| Exceção em produção | Qualquer | 🚨 Exceção: `{class}` - `{message}` |
| Requisição lenta | > 5000ms | ⏱️ Requisição lenta: `{uri}` - `{duration}ms` |
| Job falho | > 5/hora | 🔥 Job falhou: `{job}` |
| Query lenta | > 100ms | 🐢 Query lenta: `{time}ms` |

### Cooldown

Para evitar spam, o mesmo tipo de alerta só é enviado a cada 5 minutos (configurável).

---

## Relatórios Automáticos

Gere relatórios periódicos (diário, semanal, mensal) com métricas e estatísticas completas do sistema de monitoramento.

### Configuração

```php
// config/monitoring.php
'reports' => [
    'auto_schedule' => env('MONITORING_REPORTS_AUTO_SCHEDULE', false),
    'timezone' => 'America/Sao_Paulo',

    'daily' => [
        'enabled' => true,
        'send_at' => '08:00',
    ],
    'weekly' => [
        'enabled' => true,
        'send_at' => '08:00',
        'day' => 'monday',
    ],
    'monthly' => [
        'enabled' => true,
        'send_at' => '08:00',
    ],

    'channels' => [
        'email' => [
            'enabled' => true,
            'to' => ['devops@empresa.com'],
            'from' => 'monitoring@empresa.com',
        ],
        'slack' => ['enabled' => true],
        'discord' => ['enabled' => true],
    ],
],
```

### Variáveis de Ambiente

```env
MONITORING_REPORTS_AUTO_SCHEDULE=true
MONITORING_REPORT_EMAIL_TO=devops@empresa.com,admin@empresa.com
MONITORING_REPORT_EMAIL_FROM=monitoring@empresa.com

# Canais
MONITORING_REPORT_EMAIL_ENABLED=true
MONITORING_REPORT_SLACK_ENABLED=true
MONITORING_REPORT_DISCORD_ENABLED=false
```

### Comando Artisan

```bash
# Gerar relatório diário
php artisan monitoring:report daily

# Gerar e enviar automaticamente
php artisan monitoring:report daily --send

# Enviar para canais específicos
php artisan monitoring:report weekly --send --channels=email,slack

# Preview no console
php artisan monitoring:report monthly --preview

# Salvar HTML no storage
php artisan monitoring:report daily --save
```

### Conteúdo do Relatório

Cada relatório inclui:

**1. Resumo Executivo**
- Total de eventos
- Exceções, requisições, jobs
- Taxa de erro
- Tempo médio de resposta

**2. Métricas de Performance**
- Apdex Score
- Tempo mínimo, máximo e médio
- Queries lentas

**3. Eventos por Tipo**
- Distribuição percentual
- Gráficos de barras

**4. Top Erros**
- Exceções mais frequentes (não resolvidas)
- Contagem de ocorrências

**5. Tendências**
- Comparação com período anterior
- Indicadores de crescimento/queda

### Agendamento Automático

Com `MONITORING_REPORTS_AUTO_SCHEDULE=true`:

| Relatório | Frequência | Horário |
|-----------|-----------|---------|
| Diário | Todo dia | 08:00 |
| Semanal | Segundas-feiras | 08:00 |
| Mensal | Dia 1 de cada mês | 08:00 |

---

## Relatórios Customizáveis (100% Autônomo)

O sistema de relatórios permite **100% de autonomia** no envio. Você pode usar:

1. **Handlers Customizados** - Substituir canais específicos ou todos
2. **Event Listener** - Controle total via evento `ReportGenerated`
3. **Notificações Padrão** - Email, Slack, Discord (funciona sem configuração extra)

### Controle Total - Desabilitar Padrão

Para usar **apenas** suas notificações customizadas:

```php
// Em um ServiceProvider
use RiseTechApps\Monitoring\Services\Reporting\ReportService;

public function boot(): void
{
    // Desabilita notificações padrão
    ReportService::disableDefaultNotifications();
}
```

### Handler Customizado para Relatórios

Implemente `ReportHandlerInterface` para criar seu próprio envio:

```php
<?php

namespace App\Monitoring\Handlers;

use RiseTechApps\Monitoring\Contracts\ReportHandlerInterface;

class MinhaNotificacaoEmail implements ReportHandlerInterface
{
    public function send(array $report, string $html, array $config = []): bool
    {
        // Use sua própria lógica de envio
        return \Mail::send('minha-view-relatorio', [
            'relatorio' => $report,
        ], function ($message) use ($report, $config) {
            $message->to($config['to'] ?? 'admin@empresa.com')
                ->subject($report['period_label']);
        });
    }

    public function isConfigured(array $config = []): bool
    {
        return !empty($config['to']);
    }

    public function getName(): string
    {
        return 'minha_notificacao_email';
    }

    public function getSupportedChannels(): array
    {
        return ['email']; // Substitui só o email
        // return []; // Todos os canais
        // return ['email', 'slack']; // Email + Slack
    }
}
```

Registre o handler:

```php
use RiseTechApps\Monitoring\Services\Reporting\ReportService;
use App\Monitoring\Handlers\MinhaNotificacaoEmail;

public function boot(): void
{
    // Substitui apenas o canal de email
    ReportService::registerHandler('meu_email', new MinhaNotificacaoEmail());
    
    // Ou desabilita padrão e usa só o seu
    ReportService::disableDefaultNotifications();
}
```

Configure no `config/monitoring.php`:

```php
'reports' => [
    // ... outras configurações ...
    
    'custom_handlers' => [
        'meu_email' => [
            'to' => 'admin@empresa.com',
            'from' => 'monitoring@empresa.com',
        ],
    ],
],
```

### Evento ReportGenerated

Ouça o evento para controle total:

```php
<?php

namespace App\Listeners;

use RiseTechApps\Monitoring\Events\ReportGenerated;

class EnviarMeuRelatorio
{
    public function handle(ReportGenerated $event): void
    {
        // Acesso completo aos dados
        $period = $event->report['period'];      // 'daily', 'weekly', 'monthly'
        $summary = $event->report['summary'];    // Métricas
        $html = $event->html;                     // HTML renderizado
        $channels = $event->channels;            // Canais solicitados
        
        // Envio customizado
        foreach ($channels as $channel) {
            match($channel) {
                'email' => $this->enviarEmailCustom($event),
                'slack' => $this->enviarSlackCustom($event),
                default => null,
            };
        }
        
        // Suprime envio padrão (100% autônomo)
        $event->markAsHandled();
        $event->suppressDefaultNotifications();
    }
}
```

Registre no `EventServiceProvider`:

```php
protected $listen = [
    \RiseTechApps\Monitoring\Events\ReportGenerated::class => [
        \App\Listeners\EnviarMeuRelatorio::class,
    ],
];
```

### Comparativo: Alertas vs Relatórios

| Recurso | Alertas (runtime) | Relatórios (periódicos) |
|---------|-------------------|-------------------------|
| Interface | `AlertHandlerInterface` | `ReportHandlerInterface` |
| Evento | `AlertTriggered` | `ReportGenerated` |
| Service | `AlertService` | `ReportService` |
| Contexto | Evento individual (exceção, etc) | Dados agregados do período |
| Dados | `IncomingEntry` | `array $report` + `string $html` |
| Canais | Email, Slack, Discord | Email, Slack, Discord |

---

## Notificações Customizáveis (Alertas)

Além dos canais padrão (Slack, Discord, Email), você pode criar notificações customizadas usando **Handlers** ou ouvindo o evento `AlertTriggered`.

### Método 1: Handler Customizado (Recomendado)

Crie uma classe implementando `AlertHandlerInterface`:

```php
<?php

namespace App\Monitoring\Handlers;

use RiseTechApps\Monitoring\Contracts\AlertHandlerInterface;
use RiseTechApps\Monitoring\Entry\IncomingEntry;

class TelegramAlertHandler implements AlertHandlerInterface
{
    public function send(string $type, IncomingEntry $entry, array $config = []): bool
    {
        $botToken = $config['bot_token'] ?? config('services.telegram.bot_token');
        $chatId = $config['chat_id'] ?? config('services.telegram.chat_id');

        $message = $this->formatMessage($type, $entry);

        $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
        ]);

        return $response->successful();
    }

    public function isConfigured(array $config = []): bool
    {
        return !empty($config['bot_token']) && !empty($config['chat_id']);
    }

    public function getName(): string
    {
        return 'telegram';
    }

    private function formatMessage(string $type, IncomingEntry $entry): string
    {
        $content = $entry->content;

        return match ($type) {
            'exception' => "<b>🚨 Exceção</b>\n" .
                "Classe: {$content['class']}\n" .
                "Mensagem: {$content['message']}",
            'request' => "<b>⏱️ Requisição Lenta</b>\n" .
                "{$content['method']} {$content['uri']}\n" .
                "Duração: {$content['duration']}ms",
            default => "<b>Alerta:</b> {$type}",
        };
    }
}
```

Registre o handler em um `ServiceProvider`:

```php
<?php

namespace App\Providers;

use App\Monitoring\Handlers\TelegramAlertHandler;
use Illuminate\Support\ServiceProvider;
use RiseTechApps\Monitoring\Services\Alerts\AlertService;

class MonitoringServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Registra o handler customizado
        AlertService::registerHandler('telegram', new TelegramAlertHandler());
    }
}
```

Configure o handler no `config/monitoring.php`:

```php
'alerts' => [
    'enabled' => true,

    // ... configurações padrão ...

    // Handlers customizados
    'custom_handlers' => [
        'telegram' => [
            'bot_token' => env('TELEGRAM_BOT_TOKEN'),
            'chat_id' => env('TELEGRAM_CHAT_ID'),
        ],
    ],
],
```

### Método 2: Event Listener

Ouça o evento `AlertTriggered` para executar ações customizadas:

```php
<?php

namespace App\Listeners;

use RiseTechApps\Monitoring\Events\AlertTriggered;

class SendPagerDutyNotification
{
    public function handle(AlertTriggered $event): void
    {
        // Apenas para exceções críticas
        if ($event->type !== 'exception') {
            return;
        }

        $content = $event->entry->content;

        // Envia para PagerDuty
        Http::post(config('services.pagerduty.webhook'), [
            'routing_key' => config('services.pagerduty.key'),
            'event_action' => 'trigger',
            'payload' => [
                'summary' => $content['message'],
                'severity' => 'critical',
                'source' => $content['file'] ?? 'unknown',
            ],
        ]);

        // Marca como handled para pular notificações padrão (opcional)
        // $event->markAsHandled();
    }
}
```

Registre o listener no `EventServiceProvider`:

```php
protected $listen = [
    \RiseTechApps\Monitoring\Events\AlertTriggered::class => [
        \App\Listeners\SendPagerDutyNotification::class,
    ],
];
```

### Desabilitar Notificações Padrão

Para usar apenas notificações customizadas:

```php
use RiseTechApps\Monitoring\Services\Alerts\AlertService;

// Em um ServiceProvider::boot()
AlertService::disableDefaultNotifications();
```

Para reabilitar:

```php
AlertService::enableDefaultNotifications();
```

### Ordem de Processamento

1. Evento `AlertTriggered` é disparado → listeners podem processar
2. Se `$event->handled = true`, notificações padrão são ignoradas
3. Handlers customizados são executados
4. Notificações padrão (Slack/Discord/Email) são enviadas (se não desabilitadas)

### Exemplo: Notificação para Múltiplos Canais

```php
// Handler para Microsoft Teams
class TeamsAlertHandler implements AlertHandlerInterface
{
    public function send(string $type, IncomingEntry $entry, array $config = []): bool
    {
        $webhook = $config['webhook_url'];

        $card = [
            '@type' => 'MessageCard',
            '@context' => 'https://schema.org/extensions',
            'themeColor' => $this->getColorForType($type),
            'summary' => "Alerta: {$type}",
            'sections' => [
                [
                    'activityTitle' => "Alerta de Monitoramento: {$type}",
                    'facts' => $this->buildFacts($entry),
                ],
            ],
        ];

        Http::post($webhook, $card);
        return true;
    }

    public function isConfigured(array $config = []): bool
    {
        return !empty($config['webhook_url']);
    }

    public function getName(): string
    {
        return 'teams';
    }
}
```

---

## Performance Monitoring

Métricas avançadas de performance calculadas automaticamente.

### Configuração

```php
'performance' => [
    'track_memory_peaks' => true,
    'track_db_connections' => true,
    'track_cache_hits' => true,

    'apdex' => [
        'threshold' => 500,   // ms - satisfatório
        'tolerable' => 2000,  // ms - tolerável
    ],
],
```

### Métricas Calculadas

#### Apdex Score

Mede satisfação do usuário (0.0 a 1.0):
- `1.0` = Perfeito
- `0.94-0.99` = Excelente
- `0.85-0.93` = Bom
- `0.70-0.84` = Justo
- `< 0.70` = Ruim

#### Throughput

Requisições por minuto processadas.

#### Latência Percentil

| Métrica | Significado |
|---|---|
| `p50` (mediana) | 50% das requisições são mais rápidas que isso |
| `p95` | 95% das requisições são mais rápidas |
| `p99` | 99% das requisições são mais rápidas |

#### Exemplo de resposta

```json
{
    "apdex_score": 0.94,
    "throughput_per_minute": 245,
    "error_rate_percent": 0.5,
    "latency": {
        "p50": 120,
        "p95": 450,
        "p99": 890,
        "avg": 180,
        "min": 45,
        "max": 1200
    },
    "memory": {
        "peak_avg_mb": 64,
        "peak_max_mb": 128
    }
}
```

---

## Filtros Avançados na API

### Parâmetros de busca

```bash
# Filtrar por tipo e período
GET /monitoring?type=exception&from=2025-01-01&to=2025-01-15

# Apenas exceções não resolvidas
GET /monitoring?type=exception&unresolved=true

# Ordenação personalizada
GET /monitoring?sort=created_at&order=asc&per_page=25

# Busca full-text
GET /monitoring/search?q=PaymentException

# Busca por tipo específico
GET /monitoring/search?q=TimeoutException&type=exception
```

### Comparação de Períodos

```bash
GET /monitoring/compare?period1=last_7_days&period2=previous_7_days
```

**Resposta:**

```json
{
    "period1": {
        "name": "last_7_days",
        "data": { "total": 1250, "by_type": {...} }
    },
    "period2": {
        "name": "previous_7_days",
        "data": { "total": 980, "by_type": {...} }
    },
    "changes": {
        "total_diff": 270,
        "total_percent": 27.55
    }
}
```

---

## Política de Retenção Inteligente

Configure retenção diferenciada por tipo de dado.

### Configuração

```php
'retention' => [
    'days' => 90,  // Padrão fallback

    // Políticas granulares
    'granular' => [
        'exceptions' => 90,   // Manter exceções por mais tempo
        'requests'   => 30,   // Requisições por menos tempo
        'jobs'       => 60,
        'queries'    => 7,    // Queries por pouco tempo
        'cache'      => 7,
        'metrics'    => 30,
    ],

    // Manter exceções não resolvidas além do prazo
    'keep_unresolved' => true,
],
```

### Comando de retenção

```bash
# Retenção padrão
php artisan monitoring:retention

# Com políticas granulares
php artisan monitoring:retention --granular

# Manter exceções não resolvidas
php artisan monitoring:retention --keep-unresolved

# Simular sem executar
php artisan monitoring:retention --dry-run
```

### Agendamento automático

```php
// App/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('monitoring:retention --granular --force')
        ->dailyAt('02:00');
}
```

---

**Exemplos de requisição:**

```bash
# Todos os eventos
GET /monitoring

# Evento específico com relacionados
GET /monitoring/018e4b2a-1234-7000-abcd-ef0123456789

# Filtrar por tipo
GET /monitoring/type/exception
GET /monitoring/type/request
GET /monitoring/type/job

# Listar tipos disponíveis
POST /monitoring/tags
```

---

### Exemplo Completo: Dashboard de Monitoramento

```php
use RiseTechApps\Monitoring\Repository\Contracts\MonitoringRepositoryInterface;
use RiseTechApps\Monitoring\Entry\EntryType;

class MonitoringDashboardController extends Controller
{
    public function __construct(
        protected MonitoringRepositoryInterface $monitoring
    ) {}

    public function index()
    {
        return response()->json([
            'resumo' => [
                'requisicoes'  => $this->monitoring->getEventsByTypes(EntryType::REQUEST)->count(),
                'excecoes'     => $this->monitoring->getEventsByTypes(EntryType::EXCEPTION)->count(),
                'jobs_falhos'  => $this->monitoring->getEventsByTypes(EntryType::JOB)
                                    ->where('content.status', 'failed')->count(),
            ],
            'ultimas_24h'  => $this->monitoring->getLast24Hours(),
            'ultimos_7d'   => $this->monitoring->getLast7Days(),
        ]);
    }

    public function show(string $id)
    {
        return response()->json(
            $this->monitoring->getEventById($id)
        );
    }

    public function byBatch(string $batchId)
    {
        // Útil para ver tudo que aconteceu em uma requisição específica:
        // request + events + jobs + gates disparados juntos
        return response()->json(
            $this->monitoring->getByBatch($batchId)
        );
    }
}
```

---

## Diagnóstico e Troubleshooting

### Testar Watchers (`monitoring:test-watchers)

Execute um diagnóstico completo para verificar se todos os watchers estão funcionando corretamente. O comando dispara eventos de teste e verifica se foram registrados no banco.

```bash
# Teste completo
php artisan monitoring:test-watchers

# Com detalhes
php artisan monitoring:test-watchers --verbose

# Aguardar mais tempo entre testes
php artisan monitoring:test-watchers --wait=3

# Não limpar registros de teste (para debug)
php artisan monitoring:test-watchers --no-cleanup
```

#### Testes executados

| Watcher | Evento de Teste | O que é verificado |
|---------|-----------------|-------------------|
| Exception | Exception de teste | Captura de exceções |
| Query | SELECT simples | Monitoramento de queries |
| Cache | Write, Hit, Miss, Delete | Operações de cache |
| Log | Log::info() | Mensagens de log |
| Event | Evento de locale | Eventos disparados |
| Gate | Gate de teste | Autorizações |
| Mail | Mailable de teste | Envio de e-mail |
| Notification | Notificação de teste | Notificações |
| HTTP Client | Request fake | Requisições HTTP |

#### Saída esperada

```
┌─────────────────────────────────────────────────┐
│     Monitoring — Teste de Watchers              │
└─────────────────────────────────────────────────┘

✓ Monitoramento habilitado

Testando: Exception Watcher
  ✓ Evento disparado

Testando: Query Watcher
  ✓ Evento disparado

...

Verificando registros no banco...

  ✓ Exception Watcher: 1 registro(s) encontrado(s)
  ✓ Query Watcher: 1 registro(s) encontrado(s)
  ✓ Cache Watcher: 4 registro(s) encontrado(s)
  ...

─────────────────────────────────────────────────
RESUMO DOS TESTES
─────────────────────────────────────────────────

Total: 9 | Eventos disparados: 9 | Registros no DB: 8

┌─────────────────────────┬───────────────────┬────────────┐
│ Watcher                 │ Status            │ Registros  │
├─────────────────────────┼───────────────────┼────────────┤
│ Exception Watcher       │ ✓ OK              │ 1          │
│ Query Watcher           │ ✓ OK              │ 1          │
│ Cache Watcher           │ ✓ OK              │ 4          │
│ Log Watcher             │ ✓ OK              │ 1          │
│ ...                     │ ...               │ ...        │
└─────────────────────────┴───────────────────┴────────────┘
```

#### Possíveis problemas

**"Monitoramento está DESABILITADO"**
```bash
# Verifique a configuração
cat .env | grep MONITORING_ENABLED

# Ou habilite temporariamente
php artisan tinker --execute="config(['monitoring.enabled' => true])"
```

**Watcher não registra no banco**
- Verifique se o watcher está habilitado em `config/monitoring.php`
- Confirme se o driver é `database` (não `single`)
- Execute com `--wait=5` para dar mais tempo ao buffer

**"0 registros encontrados"**
- Driver `single` grava em arquivo, não no banco — isso é normal
- Verifique `storage/logs/monitoring.log` para logs em arquivo

---

## Canal de Log `monitoring`

O pacote registra automaticamente um canal de log chamado `monitoring` no Laravel. Você pode usá-lo diretamente com a facade `Log`:

```php
use Illuminate\Support\Facades\Log;

Log::channel('monitoring')->info('Mensagem de log.');
```

Os logs são gravados em `storage/logs/monitoring.log`.

---

## Facade `Logs`

O pacote registra o alias `Logs` para a facade `MonitoringFacade`:

```php
use Logs; // alias para MonitoringFacade

Logs::disable();
Logs::isEnabled();
```

---

## Changelog

Veja o [CHANGELOG](CHANGELOG.md) para o histórico completo de versões.

## Contribuindo

Veja o [CONTRIBUTING](CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

## Licença

Este pacote é open-source, licenciado sob a [MIT license](LICENSE.md).

---

Desenvolvido com ❤️ por [RiseTechApps](https://github.com/risetechapps) — [apps@risetech.com.br](mailto:apps@risetech.com.br)
