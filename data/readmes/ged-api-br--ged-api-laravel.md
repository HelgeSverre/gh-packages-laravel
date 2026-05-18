# GED API Laravel Package

Package oficial para integração com o **GED.API.BR** — Assinatura Digital e Emissão de Certificados.

## Instalação

```bash
composer require ged/api-laravel
php artisan vendor:publish --tag=ged-api-config
```

## Configuração (.env)

Uma única API Key com os serviços habilitados no painel (assinatura, certificado ou ambos):

```env
GED_API_KEY=sua-chave-api
```

## Inicialização

```php
use Ged\ApiLaravel\GedApiClient;

$client = new GedApiClient(
    config('ged-api.base_url'),
    config('ged-api.api_key')
);
```

A mesma instância é usada para todos os serviços. A API valida automaticamente se a key tem o serviço habilitado.

---

## Assinatura Digital PAdES

Requer serviço `signature` habilitado na key.

### 1. Preparar PDF

```php
// A partir de arquivo
$result = $client->padesPrepareFromFile('/path/to/document.pdf');

// A partir de base64
$result = $client->padesPrepareFromBase64($pdfBase64);

// Com representação visual
$result = $client->padesPrepareFromFileWithVisual('/path/to/document.pdf', [
    'rect' => [100, 100, 300, 150],
    'page' => 1,
    'signer_name' => 'João da Silva',
]);

// $result['document_id']  → ID do documento
// $result['field_name']   → Campo de assinatura
```

### 2. Obter hash para assinar

```php
$result = $client->padesCmsParams($documentId, $certDerBase64);

// $result['hash_hex']         → Hash SHA-256 para assinar
// $result['signed_attrs_hex'] → Atributos assinados
```

### 3. Injetar assinatura

```php
// Com PKCS#1 (recomendado)
$result = $client->padesInjectPkcs1(
    $documentId,
    $fieldName,
    $signaturePkcs1DerHex,
    $signerCertDerBase64,
    $signerChainDerBase64  // opcional
);

// Com DER completa
$result = $client->padesInject($documentId, $fieldName, $signatureDerHex);
```

### 4. Finalizar

```php
$result = $client->padesFinalize($documentId);

// $result['download_url'] → URL para download do PDF assinado
// $result['sha256']       → Hash do documento final
```

### Extrair chave pública de certificado

```php
// De arquivo PFX/P12
$result = $client->extractPublicKeyFromFile('/path/to/cert.pfx', 'senha');

// De conteúdo binário
$result = $client->extractPublicKey($certContent, 'senha', 'cert.pfx');

// $result['data']['public_key_der_base64'] → Chave pública em DER base64
```

---

## Emissão de Certificados

Requer serviço `certificate` habilitado na key.

### Emitir

```php
$result = $client->issueCertificate(
    name: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@empresa.com.br',
    password: 'senha-segura-123',
    validityDays: 730  // opcional: 365, 730 (padrão) ou 1095
);

// $result['data']['pfx_base64']     → Certificado .pfx em base64
// $result['data']['serial']         → Serial do certificado
// $result['data']['name']           → Nome do titular
// $result['data']['issuer']         → Emissor (CA)
// $result['data']['valid_from']     → Início da validade
// $result['data']['valid_until']    → Fim da validade
// $result['data']['pfx_size_bytes'] → Tamanho do .pfx
```

### Listar certificados emitidos

```php
$result = $client->listCertificates(
    page: 1,
    perPage: 15,
    status: 'active',  // opcional: active, revoked, expired
    search: 'João'     // opcional: busca por nome, CPF, email ou serial
);
```

### Revogar

```php
$result = $client->revokeCertificate(
    serial: '12345',
    reason: 'Certificado comprometido'  // opcional
);

// Após revogação, o certificado não poderá mais ser usado para assinatura
```

### Verificar validade (público)

```php
$result = $client->verifyCertificate(serial: '12345');

// $result['data']['serial']      → Serial
// $result['data']['subject_cn']  → Nome do titular
// $result['data']['status']      → active, revoked, expired
// $result['data']['is_valid']    → true/false
// $result['data']['valid_from']  → Início da validade
// $result['data']['valid_until'] → Fim da validade
// $result['data']['revoked_at']  → Data da revogação (se revogado)
```

---

## Endpoints

### Assinatura (requer serviço `signature`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/pades/prepare` | Preparar PDF |
| POST | `/api/pades/cms-params` | Obter hash |
| POST | `/api/pades/inject` | Injetar assinatura |
| POST | `/api/pades/finalize` | Finalizar |

### Certificados (requer serviço `certificate`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/certificate/issue` | Emitir certificado |
| GET | `/api/certificate/list` | Listar emitidos |
| POST | `/api/certificate/revoke` | Revogar certificado |
| POST | `/api/certificate/extract-public-key` | Extrair chave pública |

### Públicos (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/certificate/verify/{serial}` | Verificar validade |
| GET | `/api/certificate/crl` | Lista de revogados (CRL) |

---

## Serviços por API Key

Cada key pode ter um ou mais serviços habilitados:

| Serviço | Descrição | Endpoints |
|---------|-----------|-----------|
| `signature` | Assinatura digital PAdES | `/api/pades/*` |
| `certificate` | Emissão e gestão de certificados | `/api/certificate/*` |

Os serviços são configurados no painel ao gerar a key. Uma key com ambos os serviços acessa todos os endpoints.

## Revogação de Certificados

Certificados emitidos pela GED Platform CA podem ser revogados:

- O certificado é marcado como `revoked`
- Ao tentar assinar com esse certificado, a API retorna erro 403
- O certificado aparece na CRL pública (`/api/certificate/crl`)
- Certificados de outras CAs (ICP-Brasil, etc.) não são afetados

---

## Suporte

- suporte@ged.api.br
- welinaldo@gmail.com
