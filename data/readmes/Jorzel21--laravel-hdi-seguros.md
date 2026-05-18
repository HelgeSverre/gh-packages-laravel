# Laravel HDI Seguros

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jorzelalves/laravel-hdi-seguros.svg?style=flat-square)](https://packagist.org/packages/jorzelalves/laravel-hdi-seguros)
[![Total Downloads](https://img.shields.io/packagist/dt/jorzelalves/laravel-hdi-seguros.svg?style=flat-square)](https://packagist.org/packages/jorzelalves/laravel-hdi-seguros)

Pacote Laravel completo para integração com a API HDI Seguros. Fornece uma interface simples e intuitiva para trabalhar com todos os endpoints da API HDI, incluindo autenticação, cotação, efetivação de propostas, consulta de apólices, sinistros e muito mais.

## Características

- ✅ **Autenticação Automática** - Gerenciamento automático de tokens OAuth2 com cache
- ✅ **Todos os Endpoints** - Implementação completa de todos os endpoints da API HDI
- ✅ **Validação de Dados** - Form Requests para validação robusta de dados
- ✅ **Type Safety** - DTOs tipados para respostas da API
- ✅ **Fácil Configuração** - Arquivo de configuração simples e intuitivo
- ✅ **Tratamento de Erros** - Exceções customizadas para melhor debugging
- ✅ **Laravel 10 e 11** - Compatível com as versões mais recentes do Laravel

## Requisitos

- PHP 8.1 ou superior
- Laravel 10.x ou 11.x
- GuzzleHTTP 7.x

## Instalação

Instale o pacote via Composer:

```bash
composer require jorzelalves/laravel-hdi-seguros
```

Publique o arquivo de configuração:

```bash
php artisan vendor:publish --tag=hdi-seguros-config
```

Configure suas credenciais no arquivo `.env`:

```env
HDI_BASE_URL=https://openapi-int.hdi.com.br
HDI_API_KEY=sua_api_key_aqui
HDI_COMPANY_ID=01
HDI_APPLICATION_ID=01
HDI_USER_ID=seu_user_id

# Credenciais de Autenticação
HDI_CLIENT_ID=seu_client_id
HDI_CLIENT_SECRET=seu_client_secret
HDI_GRANT_TYPE=client_credentials

# Dados do Corretor
HDI_SUSEP_CODE=seu_codigo_susep
HDI_SUCURSAL_CODE=seu_codigo_sucursal

# Cache (Opcional)
HDI_CACHE_ENABLED=true
HDI_CACHE_TTL=3600
HDI_TIMEOUT=30
```

## Uso

### Autenticação

A autenticação é gerenciada automaticamente pelo pacote. O token é armazenado em cache e renovado automaticamente quando necessário.

```php
use HdiSeguros\Services\AuthService;

// Injeção de dependência
public function __construct(
    private AuthService $authService
) {}

// Autenticação manual (raramente necessário)
$token = $this->authService->authenticateAndGetToken();

// Limpar token do cache
$this->authService->clearToken();
```

### Cotação (Quote)

#### Listar Portfólio

```php
use HdiSeguros\Services\QuoteService;

public function __construct(
    private QuoteService $quoteService
) {}

public function getPortfolio()
{
    $portfolio = $this->quoteService->getPortfolioViewAll(
        sucursalCode: '001',
        susepCode: '00000000000001',
        skip: 0,
        limit: 10
    );
    
    return $portfolio;
}
```

#### Buscar Veículos

```php
// Buscar por descrição
$vehicles = $this->quoteService->searchVehiclesByDescription(
    description: 'gsx-s',
    limit: 10
);

// Buscar por FIPE
$vehicles = $this->quoteService->searchVehiclesByFipe(
    fipe: '509365-1'
);

// Buscar por Chassi
$vehicles = $this->quoteService->searchVehiclesByChassis(
    chassi: '9BD5781FFKY323228'
);
```

#### Consultar Coberturas

```php
$coverages = $this->quoteService->getCoverages(
    postalCode: '05777190',
    sucursalCode: '001',
    susepCode: '00000000000001',
    vehicleCategory: 10
);
```

#### Gerar Cotação

```php
$quoteData = [
    'prospect' => [
        'name' => 'João da Silva',
        'documents' => [
            [
                'type' => ['id' => 1],
                'number' => '12345678900'
            ]
        ],
        'contacts' => [
            [
                'type' => ['id' => 3],
                'data' => 'joao@example.com',
                'isAllowCampaign' => false
            ]
        ],
        'addresses' => [
            [
                'street' => 'Rua Exemplo',
                'district' => 'Centro',
                'number' => '123',
                'postalCode' => '01234567'
            ]
        ]
    ],
    'search' => [
        'segment' => [
            [
                'id' => '1',
                'components' => [
                    [
                        'id' => '1',
                        'compositions' => [
                            ['id' => '3']
                        ]
                    ]
                ]
            ]
        ],
        'businessItem' => [
            'insurance' => [
                'period' => [
                    'effectiveDate' => '2024-01-01',
                    'expirationDate' => '2025-01-01'
                ],
                'brokers' => [
                    [
                        'sucursalCode' => '001',
                        'susepCode' => '00000000000001',
                        'isMain' => true,
                        'percentageCommission' => 20,
                        'percentageParticipation' => 100
                    ]
                ],
                'autos' => [
                    // Dados do veículo, motorista e coberturas
                ]
            ]
        ]
    ]
];

$quote = $this->quoteService->generateQuote($quoteData);
```

#### Imprimir Cotação (PDF)

```php
$pdfContent = $this->quoteService->printQuote(
    offerId: 'uuid-da-oferta',
    itemId: 1
);

// Salvar PDF
file_put_contents('cotacao.pdf', $pdfContent);

// Ou retornar para download
return response($pdfContent)
    ->header('Content-Type', 'application/pdf')
    ->header('Content-Disposition', 'attachment; filename="cotacao.pdf"');
```

### Proposta (Proposal)

#### Criar Proposta (Efetivação)

```php
use HdiSeguros\Services\ProposalService;

public function __construct(
    private ProposalService $proposalService
) {}

public function createProposal()
{
    $proposalData = [
        'prospect' => [
            [
                'name' => 'João da Silva',
                'occupationClassificationCode' => 9,
                'salaryRangeCode' => 9,
                'isAwareName' => true,
                'isAwareAddress' => true,
                'isPoliticallyExposedPerson' => false,
                'document' => [
                    [
                        'type' => ['id' => '3'],
                        'number' => '12345678900',
                        'issuer' => 'SSP-SP',
                        'issueDate' => '2000-12-30'
                    ]
                ],
                'contacts' => [
                    [
                        'type' => ['id' => '3'],
                        'data' => 'joao@example.com',
                        'isAllowCampaign' => true
                    ]
                ],
                'addresses' => [
                    [
                        'street' => 'Rua Exemplo',
                        'district' => 'Centro',
                        'number' => 123,
                        'postalCode' => '01234567',
                        'city' => 'São Paulo',
                        'state' => 'SP'
                    ]
                ]
            ]
        ],
        'businessItem' => [
            'offerId' => 'uuid-da-cotacao',
            'insurance' => [
                'installments' => [
                    'numberOfInstallments' => 1,
                    'billingTypeId' => 7 // 1=Cartão, 2=Débito, 7=Carnê
                ],
                'broker' => [
                    [
                        'sucursalCode' => '001',
                        'typeCode' => 'C',
                        'susepCode' => '00000000000001',
                        'isMain' => true,
                        'percentageParticipation' => 100
                    ]
                ],
                'autos' => [
                    [
                        'taxInvoiceNumber' => '1',
                        'isTaxInvoiceOnInspection' => true,
                        'vehicle' => [
                            'chassisCode' => 'KMHJN81BBA179136',
                            'licensePlateCode' => 'ABC1234',
                            'stateLicensePlateCode' => 'SP'
                        ]
                    ]
                ]
            ]
        ]
    ];
    
    $proposal = $this->proposalService->createProposal($proposalData);
    
    return $proposal;
}
```

#### Listar Propostas

```php
$proposals = $this->proposalService->listProposalsWithStatus(
    registrationDate: '2024-01-01'
);
```

#### Imprimir Proposta

```php
$pdfContent = $this->proposalService->printProposal(
    offerId: 'uuid-da-oferta',
    itemId: 1
);
```

#### Excluir Proposta

```php
$result = $this->proposalService->deleteProposal(
    proposalNumber: '1234567'
);
```

### Apólice (Policy)

```php
use HdiSeguros\Services\PolicyService;

public function __construct(
    private PolicyService $policyService
) {}

// Listar apólices emitidas
$policies = $this->policyService->listIssuedPolicies(
    processDate: '2024-01-01'
);

// Detalhe da apólice
$policyDetail = $this->policyService->getPolicyDetail(
    id: '123456',
    policyCode: '123456'
);

// Buscar apólices (2ª via)
$policies = $this->policyService->listPolicyDetails(
    limit: 10,
    skip: 0,
    policyCode: '123456'
);

// Imprimir apólice (PDF)
$pdfContent = $this->policyService->printPolicy(
    policyCode: '123456',
    brokerType: 'C',
    brokerCode: '001'
);

// Extrato de comissões
$commissions = $this->policyService->getCommissionStatement(
    companyId: '01',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
);

// Status de parcelas
$installments = $this->policyService->listInstallmentStatus(
    policyCode: '123456',
    status: 'ALL' // ALL, PAID, PENDING, OVERDUE
);

// Extrato de conta corrente
$statement = $this->policyService->getAccountStatement(
    daysRange: 90
);
```

### Sinistro (Claim)

```php
use HdiSeguros\Services\ClaimService;

public function __construct(
    private ClaimService $claimService
) {}

// Listar sinistros
$claims = $this->claimService->listClaims(
    dateOfClaim: '2024-01-01'
);

// Detalhe do sinistro
$claimDetail = $this->claimService->getClaimDetail(
    claimId: '123456'
);
```

### Usando Facade

Você também pode usar a Facade para acesso rápido aos serviços:

```php
use HdiSeguros\Facades\HdiSeguros;

// Autenticação
$token = HdiSeguros::auth()->authenticateAndGetToken();

// Cotação
$vehicles = HdiSeguros::quote()->searchVehiclesByDescription('civic');

// Proposta
$proposal = HdiSeguros::proposal()->createProposal($data);

// Apólice
$policies = HdiSeguros::policy()->listIssuedPolicies('2024-01-01');

// Sinistro
$claims = HdiSeguros::claim()->listClaims('2024-01-01');
```

## Validação de Dados

O pacote inclui Form Requests para validação de dados:

```php
use HdiSeguros\Http\Requests\GenerateQuoteRequest;
use HdiSeguros\Http\Requests\CreateProposalRequest;

public function store(GenerateQuoteRequest $request)
{
    // Dados já validados
    $validated = $request->validated();
    
    $quote = $this->quoteService->generateQuote($validated);
    
    return response()->json($quote);
}
```

### Form Requests Disponíveis

- `AuthenticationRequest` - Validação de autenticação
- `TokenRequest` - Validação de token
- `GenerateQuoteRequest` - Validação para gerar cotação
- `CreateProposalRequest` - Validação para criar proposta
- `SearchVehicleRequest` - Validação para buscar veículos
- `GetCoveragesRequest` - Validação para consultar coberturas

## DTOs (Data Transfer Objects)

O pacote fornece DTOs tipados para trabalhar com as respostas da API:

```php
use HdiSeguros\DTOs\QuoteDTO;
use HdiSeguros\DTOs\ProposalDTO;
use HdiSeguros\DTOs\TokenDTO;

$quoteResponse = $this->quoteService->generateQuote($data);
$quoteDTO = QuoteDTO::fromArray($quoteResponse);

if ($quoteDTO->hasErrors()) {
    // Tratar erros
    return response()->json($quoteDTO->errors, 422);
}

return response()->json($quoteDTO->toArray());
```

## Tratamento de Erros

O pacote lança exceções customizadas para facilitar o tratamento de erros:

```php
use HdiSeguros\Exceptions\HdiApiException;

try {
    $quote = $this->quoteService->generateQuote($data);
} catch (HdiApiException $e) {
    // Status HTTP
    $statusCode = $e->getCode();
    
    // Mensagem de erro
    $message = $e->getMessage();
    
    // Dados completos da resposta
    $responseData = $e->getResponseData();
    
    return response()->json([
        'error' => $message,
        'details' => $responseData
    ], $statusCode);
}
```

## Configuração Avançada

### Cache de Token

Por padrão, o token de autenticação é armazenado em cache. Você pode configurar isso no arquivo `config/hdi-seguros.php`:

```php
'cache' => [
    'enabled' => true,
    'ttl' => 3600, // 1 hora em segundos
    'prefix' => 'hdi_seguros_',
],
```

### Timeout de Requisições

Configure o timeout das requisições HTTP:

```php
'timeout' => 30, // segundos
```

### Trace ID Customizado

Você pode definir um Trace ID customizado para rastreamento:

```php
use HdiSeguros\Services\HdiClient;

$client = app(HdiClient::class);
$client->setTraceId('meu-trace-id-123');
```

## Testes

```bash
composer test
```

## Changelog

Por favor, veja [CHANGELOG](CHANGELOG.md) para mais informações sobre o que mudou recentemente.

## Contribuindo

Por favor, veja [CONTRIBUTING](CONTRIBUTING.md) para detalhes.

## Segurança

Se você descobrir alguma questão de segurança, por favor envie um email para seu-email@example.com em vez de usar o issue tracker.

## Créditos

- [Seu Nome](https://github.com/jorzelalves)
- [Todos os Contribuidores](../../contributors)

## Licença

The MIT License (MIT). Por favor, veja [License File](LICENSE.md) para mais informações.

## Endpoints Implementados

### Autenticação
- ✅ POST `/corporate/security/v3/authorize` - Autenticação
- ✅ POST `/corporate/security/v3/token` - Obter Token

### Cotação
- ✅ GET `/marketplace/offer/v1/portfolio/viewAll` - Listar Portfólio
- ✅ GET `/marketplace/offer/v1/portfolio/component` - Detalhe do Componente
- ✅ GET `/marketplace/offer/v1/insurance/coverages` - Lista de Coberturas
- ✅ GET `/marketplace/offer/v1/vehicles/models` - Buscar Veículos
- ✅ GET `/marketplace/offer/v1/components/compositions/questionnaires` - Questionário
- ✅ POST `/marketplace/offer/v1/offers` - Gerar Cotação
- ✅ PUT `/marketplace/offer/v1/offers` - Recalcular Cotação
- ✅ POST `/marketplace/sales/v1/offers/{offerId}/items/{itemId}/checkingAccount/recalculation` - Aplicar Desconto Conta Corrente
- ✅ GET `/marketplace/broker/v1/account/balance` - Saldo Conta Corrente
- ✅ GET `/marketplace/offer/v1/offers/{offerId}/items/{itemId}/insurance/document` - Imprimir Cotação

### Proposta
- ✅ POST `/marketplace/offer/v1/offers/proposal` - Criar Proposta
- ✅ GET `/marketplace/offer/v1/offers/{offerId}/items/{itemId}/insurance/proposals/document` - Imprimir Proposta
- ✅ GET `/proposals/status/v1/proposals` - Listar Propostas com Status
- ✅ DELETE `/marketplace/proposal/v1/proposal/delete/{proposalNumber}` - Excluir Proposta

### Pós-venda
- ✅ GET `/corporate/party/v1/backoffice/document/detail` - Detalhe da Apólice
- ✅ GET `/corporate/party/v1/backoffice/document/list` - Listar Apólices Emitidas
- ✅ GET `/insurance/policy/v1/policies/details` - Lista de Apólices (2ª via)
- ✅ GET `/insurance/policy/v1/policies/{policyCode}/document` - Imprimir Apólice
- ✅ GET `/corporate/finance/v1/commission/list` - Extrato de Comissões
- ✅ GET `/insurance/policy/v1/installment/status/list` - Status de Parcelas
- ✅ GET `/marketplace/broker/v1/account/statement` - Extrato Conta Corrente
- ✅ GET `/insurance/claim/v1/netx/claim/opening-payment/list` - Listar Sinistros
- ✅ GET `/insurance/claim/v1/claim/detail/{claimId}` - Detalhe do Sinistro
