# Laravel Asaas

Pacote Laravel para integrar com a API de pagamentos [Asaas](https://www.asaas.com/). Oferece Facade e classes para gerenciar clientes, cobranças, assinaturas, parcelamentos, notas fiscais, links de pagamento, antecipações, finanças, transferências, subcontas, webhooks e chaves Pix.

## Requisitos

- PHP >= 8.0
- Laravel >= 10.0

## Instalação

```bash
composer require jorzelalves/laravel-asaas
```

Publique o arquivo de configuração:

```bash
php artisan asaas:publish
# ou
php artisan vendor:publish --provider="Asaas\AsaasServiceProvider" --tag=config
```

Adicione as variáveis de ambiente no `.env`:

```env
ASAAS_BASE_URL=https://api.asaas.com/
ASAAS_API_KEY=sua_chave_aqui
```

Para ambiente sandbox:

```env
ASAAS_BASE_URL=https://sandbox.asaas.com/api/
```

## Uso

A API key é passada por parâmetro em cada chamada, permitindo uso multi-tenant com chaves diferentes por subconta:

```php
use Asaas\Facades\Asaas;

$customer = Asaas::customer($apiKey)->create([...]);
$payment = Asaas::payment($apiKey)->create([...]);
```

Todas as respostas seguem o formato:

```php
[
    'code' => 200,                // HTTP status code
    'response' => [...]           // Dados da API
]
```

---

## Módulos

### Customer (Clientes)

```php
$customer = Asaas::customer($apiKey);

// Criar
$customer->create([
    'name' => 'João Silva',
    'cpfCnpj' => '12345678901',
    'email' => 'joao@email.com',
    'phone' => '11999999999',
]);

// Listar
$customer->list(['name' => 'João']);

// Buscar
$customer->get('cus_xxx');

// Atualizar
$customer->update('cus_xxx', ['name' => 'João Santos']);

// Remover
$customer->delete('cus_xxx');

// Restaurar removido
$customer->restoreRemovedCustomer('cus_xxx');

// Notificações do cliente
$customer->retriveNotificationsFromCustomer('cus_xxx');
```

---

### Payment (Cobranças)

```php
$payment = Asaas::payment($apiKey);

// Criar cobrança (PIX, BOLETO ou CREDIT_CARD)
$payment->create([
    'customer' => 'cus_xxx',
    'billingType' => 'PIX',
    'value' => 100.00,
    'dueDate' => '2026-06-01',
    'description' => 'Cobrança de teste',
]);

// Criar cobrança com cartão de crédito
$payment->createWithCreditCard([
    'customer' => 'cus_xxx',
    'billingType' => 'CREDIT_CARD',
    'value' => 100.00,
    'dueDate' => '2026-06-01',
    'creditCard' => [
        'holderName' => 'João Silva',
        'number' => '4111111111111111',
        'expiryMonth' => '12',
        'expiryYear' => '2028',
        'ccv' => '123',
    ],
    'creditCardHolderInfo' => [
        'name' => 'João Silva',
        'email' => 'joao@email.com',
        'cpfCnpj' => '12345678901',
        'postalCode' => '01001000',
        'addressNumber' => '100',
        'phone' => '11999999999',
    ],
    'remoteIp' => '127.0.0.1',
]);

// Listar
$payment->list(['customer' => 'cus_xxx']);

// Buscar
$payment->get('pay_xxx');

// Atualizar
$payment->update('pay_xxx', [...]);

// Remover
$payment->delete('pay_xxx');

// Restaurar removido
$payment->restore('pay_xxx');

// Status do pagamento
$payment->getStatus('pay_xxx');

// Informações de cobrança
$payment->getBillingInfo('pay_xxx');

// Informações de visualização
$payment->getViewingInfo('pay_xxx');

// QR Code Pix
$payment->getQrCodeForPix('pay_xxx');

// Linha digitável do boleto
$payment->getDigitableBillLine('pay_xxx');

// Capturar pré-autorização
$payment->capturePaymentWithPreAuthorization('pay_xxx');

// Pagar com cartão de crédito
$payment->payChargeWithCreditCard('pay_xxx');

// Confirmar recebimento em dinheiro
$payment->payed('pay_xxx', ['paymentDate' => '2026-06-01', 'value' => 100.00]);

// Desfazer confirmação de recebimento
$payment->undoCashReceipt('pay_xxx');

// Estorno
$payment->refund('pay_xxx', ['value' => 50.00, 'description' => 'Estorno parcial']);

// Listar estornos
$payment->getRefunds('pay_xxx');

// Estorno de boleto
$payment->refundBankSlip('pay_xxx');

// Simulador de vendas
$payment->simulate(['value' => 100.00, 'installmentCount' => 3]);

// Limites de pagamento
$payment->getLimits();

// Escrow
$payment->getEscrow('pay_xxx');
```

---

### Subscription (Assinaturas)

```php
$subscription = Asaas::subscription($apiKey);

// Criar assinatura
$subscription->create([
    'customer' => 'cus_xxx',
    'billingType' => 'PIX',
    'value' => 49.90,
    'nextDueDate' => '2026-07-01',
    'cycle' => 'MONTHLY',
    'description' => 'Plano mensal',
]);

// Criar assinatura com cartão de crédito
$subscription->createWithCreditCard([
    'customer' => 'cus_xxx',
    'billingType' => 'CREDIT_CARD',
    'value' => 49.90,
    'nextDueDate' => '2026-07-01',
    'cycle' => 'MONTHLY',
    'creditCard' => [...],
    'creditCardHolderInfo' => [...],
    'remoteIp' => '127.0.0.1',
]);

// Listar
$subscription->list(['customer' => 'cus_xxx']);

// Buscar
$subscription->get('sub_xxx');

// Atualizar
$subscription->update('sub_xxx', ['value' => 59.90]);

// Remover
$subscription->delete('sub_xxx');

// Atualizar cartão de crédito
$subscription->updateCreditCard('sub_xxx', [...]);

// Listar pagamentos da assinatura
$subscription->getPayments('sub_xxx');

// Gerar carnê
$subscription->getBooklet('sub_xxx', ['month' => 6, 'year' => 2026]);

// Configuração de nota fiscal
$subscription->getInvoiceConfig('sub_xxx');
$subscription->createInvoiceConfig('sub_xxx', [...]);
$subscription->updateInvoiceConfig('sub_xxx', [...]);
$subscription->deleteInvoiceConfig('sub_xxx');

// Listar notas fiscais
$subscription->getInvoices('sub_xxx');
```

**Ciclos disponíveis:** `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `BIMONTHLY`, `QUARTERLY`, `SEMIANNUALLY`, `YEARLY`

---

### Installment (Parcelamentos)

```php
$installment = Asaas::installment($apiKey);

// Criar parcelamento
$installment->create([
    'customer' => 'cus_xxx',
    'billingType' => 'BOLETO',
    'value' => 600.00,
    'dueDate' => '2026-07-01',
    'installmentCount' => 6,
    'description' => 'Parcelamento em 6x',
]);

// Criar parcelamento com cartão
$installment->createWithCreditCard([
    'customer' => 'cus_xxx',
    'billingType' => 'CREDIT_CARD',
    'value' => 600.00,
    'dueDate' => '2026-07-01',
    'installmentCount' => 6,
    'creditCard' => [...],
    'creditCardHolderInfo' => [...],
    'remoteIp' => '127.0.0.1',
]);

// Listar
$installment->list();

// Buscar
$installment->get('inst_xxx');

// Remover
$installment->delete('inst_xxx');

// Listar pagamentos do parcelamento
$installment->getPayments('inst_xxx');

// Gerar carnê
$installment->getBooklet('inst_xxx');

// Estornar parcelamento
$installment->refund('inst_xxx');

// Atualizar splits
$installment->updateSplits('inst_xxx', [...]);
```

---

### Invoice (Notas Fiscais)

```php
$invoice = Asaas::invoice($apiKey);

// Agendar nota fiscal
$invoice->create([
    'serviceDescription' => 'Consultoria em TI',
    'value' => 1000.00,
    'effectiveDate' => '2026-07-01',
    'customer' => 'cus_xxx',
    'taxes' => [
        'retainIss' => false,
        'iss' => 5,
        'cofins' => 3,
        'csll' => 1,
        'inss' => 0,
        'ir' => 1.5,
        'pis' => 0.65,
    ],
]);

// Listar
$invoice->list(['customer' => 'cus_xxx']);

// Buscar
$invoice->get('inv_xxx');

// Atualizar
$invoice->update('inv_xxx', ['value' => 1200.00]);

// Autorizar (emitir)
$invoice->authorize('inv_xxx');

// Cancelar
$invoice->cancel('inv_xxx');
```

---

### PaymentLink (Links de Pagamento)

```php
$paymentLink = Asaas::paymentLink($apiKey);

// Criar link de pagamento
$paymentLink->create([
    'name' => 'Produto X',
    'billingType' => 'UNDEFINED',
    'chargeType' => 'DETACHED',
    'value' => 150.00,
    'description' => 'Link para pagamento do Produto X',
]);

// Listar
$paymentLink->list(['active' => true]);

// Buscar
$paymentLink->get('pl_xxx');

// Atualizar
$paymentLink->update('pl_xxx', ['name' => 'Produto X - Atualizado']);

// Remover
$paymentLink->delete('pl_xxx');

// Restaurar removido
$paymentLink->restore('pl_xxx');

// Imagens do link
$paymentLink->listImages('pl_xxx');
$paymentLink->addImage('pl_xxx', '/path/to/image.jpg', true);  // true = imagem principal
$paymentLink->getImage('pl_xxx', 'img_xxx');
$paymentLink->deleteImage('pl_xxx', 'img_xxx');
$paymentLink->setMainImage('pl_xxx', 'img_xxx');
```

**Tipos de cobrança:** `DETACHED` (avulsa), `RECURRENT` (recorrente), `INSTALLMENT` (parcelada)

**Tipos de billing:** `PIX`, `BOLETO`, `CREDIT_CARD`, `UNDEFINED` (cliente escolhe)

---

### Anticipation (Antecipação)

```php
$anticipation = Asaas::anticipation($apiKey);

// Solicitar antecipação
$anticipation->create([
    'payment' => 'pay_xxx',
]);

// Solicitar antecipação com documentos
$anticipation->create([
    'installment' => 'inst_xxx',
    'documents' => ['/path/to/doc.pdf'],
]);

// Simular antecipação
$anticipation->simulate([
    'payment' => 'pay_xxx',
]);

// Listar
$anticipation->list(['status' => 'PENDING']);

// Buscar
$anticipation->get('ant_xxx');

// Cancelar
$anticipation->cancel('ant_xxx');

// Configuração de antecipação automática
$anticipation->getConfig();
$anticipation->updateConfig(['enabled' => true]);

// Limites
$anticipation->getLimits();
```

---

### Finance (Finanças)

```php
$finance = Asaas::finance($apiKey);

// Saldo da conta
$finance->getBalance();

// Estatísticas de pagamento
$finance->getPaymentStatistics([
    'customer' => 'cus_xxx',
    'billingType' => 'PIX',
]);

// Estatísticas de split
$finance->getSplitStatistics();

// Extrato financeiro
$finance->getExtract([
    'startDate' => '2026-01-01',
    'finishDate' => '2026-05-01',
]);
```

---

### Transfer (Transferências)

```php
$transfer = Asaas::transfer($apiKey);

// Transferência via Pix
$transfer->transferByPix([
    'value' => 100.00,
    'pixAddressKey' => 'email@destino.com',
    'pixAddressKeyType' => 'EMAIL',
    'description' => 'Pagamento',
]);

// Transferência via TED
$transfer->transferByBankAccount([
    'value' => 500.00,
    'bankAccount' => [
        'bank' => ['code' => '341'],
        'accountName' => 'Conta Empresa',
        'ownerName' => 'Empresa LTDA',
        'cpfCnpj' => '12345678000190',
        'agency' => '1234',
        'account' => '56789',
        'accountDigit' => '0',
        'bankAccountType' => 'CONTA_CORRENTE',
    ],
]);

// Transferência para conta Asaas
$transfer->transferToAsaas([
    'value' => 250.00,
    'walletId' => 'wallet_xxx',
]);

// Buscar
$transfer->get('transfer_xxx');

// Cancelar
$transfer->cancel('transfer_xxx');

// Listar (com filtros)
$transfer->list([
    'dateCreatedFrom' => '2026-01-01',
    'dateCreatedTo' => '2026-05-01',
    'type' => 'PIX',
]);
```

**Tipos de chave Pix:** `CPF`, `CNPJ`, `EMAIL`, `PHONE`, `EVP`

---

### Pix

```php
$pix = Asaas::pix($apiKey);

// Criar chave Pix (aleatória - EVP)
$pix->createPixKey();

// Listar chaves
$pix->listPixKeys();

// Buscar chave
$pix->getPixKey('pix_xxx');

// Remover chave
$pix->deletePixKey('pix_xxx');

// QR Code estático
$pix->createStaticQrCode([
    'value' => 50.00,
    'description' => 'Pagamento via QR Code',
]);
$pix->deleteStaticQrCode('qr_xxx');

// Verificar token bucket
$pix->getTokenBucket();

// Pagar QR Code
$pix->payQrCode([
    'qrCode' => ['payload' => '00020126...'],
    'value' => 100.00,
]);

// Decodificar QR Code
$pix->decodeQrCode(['payload' => '00020126...']);

// Transações Pix
$pix->listTransactions(['status' => 'DONE']);
$pix->getTransaction('txn_xxx');
$pix->cancelTransaction('txn_xxx');
```

---

### CreditCard (Cartão de Crédito)

```php
$creditCard = Asaas::creditCard($apiKey);

// Tokenizar cartão
$creditCard->tokenize([
    'customer' => 'cus_xxx',
    'creditCard' => [
        'holderName' => 'João Silva',
        'number' => '4111111111111111',
        'expiryMonth' => '12',
        'expiryYear' => '2028',
        'ccv' => '123',
    ],
    'creditCardHolderInfo' => [
        'name' => 'João Silva',
        'email' => 'joao@email.com',
        'cpfCnpj' => '12345678901',
        'postalCode' => '01001000',
        'addressNumber' => '100',
        'phone' => '11999999999',
    ],
    'remoteIp' => '127.0.0.1',
]);
```

---

### SubAccount (Subcontas)

```php
$subAccount = Asaas::subAccount($apiKey);

// Criar subconta
$subAccount->create([
    'name' => 'Empresa Parceira',
    'email' => 'parceiro@email.com',
    'cpfCnpj' => '12345678000190',
    'mobilePhone' => '11999999999',
    'incomeValue' => 5000,
    'address' => 'Rua Exemplo',
    'addressNumber' => '123',
    'province' => 'Centro',
    'postalCode' => '01001000',
]);

// Listar
$subAccount->list();

// Buscar
$subAccount->get('acc_xxx');

// Configuração de escrow
$subAccount->getEscrowConfig('acc_xxx');
$subAccount->saveEscrowConfig('acc_xxx', [...]);
```

**Tipos de empresa:** `MEI`, `LIMITED`, `INDIVIDUAL`, `ASSOCIATION`

---

### Webhook

```php
$webhook = Asaas::webhook($apiKey);

// Criar webhook
$webhook->create([
    'url' => 'https://meuapp.com/webhook',
    'email' => 'admin@meuapp.com',
    'enabled' => true,
    'events' => ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'],
]);

// Listar
$webhook->list();

// Buscar
$webhook->get('wh_xxx');

// Atualizar
$webhook->update('wh_xxx', ['enabled' => false]);

// Remover
$webhook->delete('wh_xxx');
```

#### Eventos disponíveis

| Classe | Eventos |
|---|---|
| `PaymentsWebhookEvents` | PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED, PAYMENT_REFUNDED, ... |
| `SubscriptionsWebhookEvents` | SUBSCRIPTION_CREATED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_INACTIVATED, SUBSCRIPTION_DELETED, ... |
| `TransfersWebhookEvents` | TRANSFER_CREATED, TRANSFER_PENDING, TRANSFER_DONE, TRANSFER_FAILED, TRANSFER_CANCELLED, ... |
| `InvoicesWebhookEvents` | INVOICE_CREATED, INVOICE_AUTHORIZED, INVOICE_CANCELED, INVOICE_ERROR, ... |
| `BillsWebhookEvents` | BILL_CREATED, BILL_PAID, BILL_CANCELLED, BILL_FAILED, ... |
| `AccountStatusWebhookEvents` | ACCOUNT_STATUS_DOCUMENT_APPROVED, ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED, ... |
| `PhoneRechargeWebhookEvents` | PHONE_RECHARGE_CONFIRMED, PHONE_RECHARGE_CANCELLED, ... |
| `ReceivableAnticipationWebhookEvents` | RECEIVABLE_ANTICIPATION_CREDITED, RECEIVABLE_ANTICIPATION_DENIED, ... |

---

## Retry automático

O pacote possui retry automático com backoff exponencial para resiliência contra falhas transitórias:

- **Tentativas:** 1 retry após falha
- **Delay inicial:** 150ms
- **Delay máximo:** 1000ms
- **Backoff:** Exponencial (fator 2.0) com jitter aleatório (0-150ms)
- **Status codes retryable:** 408, 429, 500, 502, 503, 504
- **Exceptions retryable:** Erros de conexão (timeout, rede)

---

## Tratamento de erros

Erros da API retornam no mesmo formato padronizado:

```php
[
    'code' => 400,
    'response' => [
        ['code' => 'invalid_customer', 'message' => 'Cliente inválido']
    ]
]
```

Erros de validação (antes do envio à API) lançam `\Exception` com os detalhes dos campos inválidos.

---

## Multi-tenant

A `$apiKey` é passada em toda chamada via `Asaas::modulo($apiKey)`. Isso permite que uma aplicação multi-tenant use chaves diferentes por subconta/cliente:

```php
// Subconta A
$pagamentoA = Asaas::payment($apiKeySubcontaA)->create([...]);

// Subconta B
$pagamentoB = Asaas::payment($apiKeySubcontaB)->create([...]);
```

---

## Licença

MIT
