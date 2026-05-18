# kamoca/cep

Pacote Laravel para consulta paralela de CEPs com fallback automático entre provedores.

## Requisitos

- PHP 8.0+
- Laravel 12 ou 13

## Instalação

```bash
composer require kamoca/cep
```

O pacote é registrado automaticamente via Laravel Package Discovery.

## Configuração

Publique o arquivo de configuração:

```bash
php artisan vendor:publish --tag=cep-config
```

Isso cria `config/cep.php`. As opções disponíveis:

```php
return [
    'timeout_ms' => env('CEP_TIMEOUT_MS', 15000),

    'cache' => [
        'enabled' => env('CEP_CACHE_ENABLED', true),
        'ttl'     => env('CEP_CACHE_TTL', 3600),       // segundos
        'key'     => env('CEP_CACHE_KEY', 'cep.lookup.%s'),
    ],

    'cep_class' => \Kamoca\Cep\Transformers\CepTransformer::class,

    'providers' => [
        'via_cep' => [
            'enabled' => env('FALLBACK_CEP_API_VIA_CEP_ENABLED', true),
            'class'   => \Kamoca\Cep\Providers\ViaCepProvider::class,
        ],
        'brasil_api' => [
            'enabled' => env('FALLBACK_CEP_API_BRASIL_API_ENABLED', true),
            'class'   => \Kamoca\Cep\Providers\BrasilApiProvider::class,
        ],
    ],
];
```

Ou via `.env`:

```env
CEP_TIMEOUT_MS=15000
CEP_CACHE_ENABLED=true
CEP_CACHE_TTL=3600
```

## Uso

### Via injeção de dependência

```php
use Kamoca\Cep\CepResolver;

class EnderecoController extends Controller
{
    public function __construct(private CepResolver $cep) {}

    public function show(string $cep)
    {
        $resultado = $this->cep->resolve($cep)->toArray();

        return response()->json($resultado);
    }
}
```

### Via Facade

```php
use Kamoca\Cep\Facade\Cep;

$resultado = Cep::resolve('95914-100')->toArray();
```

### Formato da resposta

```json
{
    "cep": "95914100",
    "street": "Rua Bento Gonçalves",
    "neighborhood": "Universitário",
    "city": "Lajeado",
    "state": "RS",
    "provider": "via_cep",
    "response_time_ms": 312,
    "response_time_s": 0.312,
    "cached": false
}
```

| Campo | Descrição |
|---|---|
| `provider` | Provedor que respondeu primeiro (`via_cep` ou `brasil_api`) |
| `response_time_ms` | Tempo de resposta em milissegundos |
| `response_time_s` | Tempo de resposta em segundos |
| `cached` | `true` quando veio do cache, `false` quando foi busca real |

### Tratamento de erros

CEP inválido ou não encontrado lança `CepResolutionException`:

```php
use Kamoca\Cep\Exceptions\CepResolutionException;

try {
    $resultado = Cep::resolve('00000000')->toArray();
} catch (CepResolutionException $e) {
    // CEP não encontrado ou todos os provedores falharam
    return response()->json(['error' => 'CEP não encontrado'], 404);
}
```

## Personalização

### Classe de CEP customizada

Para adicionar campos ou lógica própria ao objeto de retorno, implemente `CepContract`:

```php
use Kamoca\Cep\Contracts\CepContract;
use Kamoca\Cep\Normalizers\CepNormalize;

class MeuCep implements CepContract
{
    public function __construct(
        public readonly string $cep,
        public readonly string $cidade,
        public readonly string $estado,
    ) {}

    public static function fromNormalizer(CepNormalize $payload): static
    {
        return new static(
            cep:    $payload->cep,
            cidade: $payload->city,
            estado: $payload->state,
        );
    }

    public function toArray(): array
    {
        return [
            'cep'    => $this->cep,
            'cidade' => $this->cidade,
            'estado' => $this->estado,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

Registre em `config/cep.php`:

```php
'cep_class' => App\Cep\MeuCep::class,
```

### Provedor customizado

Para adicionar uma nova fonte de CEP, estenda `BaseCepProvider`:

```php
use GuzzleHttp\Psr7\Request;
use Kamoca\Cep\Normalizers\CepNormalize;
use Kamoca\Cep\Providers\BaseCepProvider;

class MinhaApiProvider extends BaseCepProvider
{
    public function buildRequest(string $cep): Request
    {
        return new Request('GET', "https://minha-api.com/cep/{$cep}");
    }

    protected function normalize(array $payload): CepNormalize
    {
        return new CepNormalize(
            cep:          $payload['codigo'] ?? '',
            street:       $payload['logradouro'] ?? '',
            neighborhood: $payload['bairro'] ?? '',
            city:         $payload['municipio'] ?? '',
            state:        $payload['uf'] ?? '',
            provider:     $this->getName(),
        );
    }
}
```

Registre em `config/cep.php`:

```php
'providers' => [
    'minha_api' => [
        'enabled' => true,
        'class'   => App\Cep\MinhaApiProvider::class,
    ],
    // provedores padrão continuam funcionando em paralelo
    'via_cep'    => ['enabled' => true, 'class' => \Kamoca\Cep\Providers\ViaCepProvider::class],
    'brasil_api' => ['enabled' => true, 'class' => \Kamoca\Cep\Providers\BrasilApiProvider::class],
],
```

Todos os provedores habilitados são consultados em paralelo — o primeiro a responder com sucesso é usado.
