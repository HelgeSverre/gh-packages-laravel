# Laravel Ekwanza

Integração oficial (wrapper) do Laravel para o [e-kwanza PHP SDK](https://github.com/souzajluiz/ekwanza-php-sdk), facilitando o uso da API de pagamentos integrados e-kwanza V2.5+ e Gateway (GPO).

Essa biblioteca fornece uma Facade (`Ekwanza`) e integração fácil com o Container de Injeção de Dependências do Laravel.

## Instalação

Você pode instalar o pacote via Composer:

```bash
composer require souzajluiz/laravel-ekwanza
```

### Publicar Configurações

Após a instalação, publique o arquivo de configuração para customizar suas credenciais (opcional, para sobrescrever configurações):

```bash
php artisan vendor:publish --tag=ekwanza-config
```

Isso criará um arquivo `config/ekwanza.php` no seu projeto.

### Variáveis de Ambiente (.env)

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
EKWANZA_BASE_URL=https://api.sandbox.e-kwanza.ao
EKWANZA_GATEWAY_URL=https://gateway.e-kwanza.ao
EKWANZA_MERCHANT_REGISTRATION=SEU_NUMERO_DE_REGISTRO
EKWANZA_NOTIFICATION_TOKEN=SEU_TOKEN_DE_NOTIFICACAO
EKWANZA_API_KEY=SUA_API_KEY_AQUI

# Apenas para Gateway / OAuth (Opcional se não usar GPO)
EKWANZA_CLIENT_ID=SEU_CLIENT_ID
EKWANZA_CLIENT_SECRET=SEU_CLIENT_SECRET
EKWANZA_RESOURCE=SEU_RESOURCE
```

## Uso e Exemplos Reais

O pacote permite acessar as funcionalidades do SDK nativo através da Facade `Ekwanza`.

### 1. Criar um Ticket de Pagamento Multicaixa/e-kwanza

Ideal para gerar uma referência de pagamento que o cliente pode pagar no ATM, aplicativo Multicaixa Express ou e-kwanza.

```php
use Souzajluiz\LaravelEkwanza\Facades\Ekwanza;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        $amount = 5000.50;
        $referenceCode = 'PEDIDO_12345'; // Referência única do seu sistema
        $mobileNumber = '9XXXXXXXX'; // Número de telefone do cliente

        // Gera o ticket na API do e-kwanza
        $ticket = Ekwanza::tickets()->create($amount, $referenceCode, $mobileNumber);

        return response()->json([
            'sucesso' => true,
            'ticket_code' => $ticket->code,
            'mensagem' => 'Ticket gerado! Pague sua conta na máquina/Express.'
        ]);
    }
}
```

### 2. Consultar Status do Ticket

Você pode consultar manualmente se o ticket gerado foi pago ou ainda está pendente.

```php
use Souzajluiz\LaravelEkwanza\Facades\Ekwanza;
use App\Http\Controllers\Controller;

class TicketController extends Controller
{
    public function checkStatus($ticketCode)
    {
        // Retorna um objeto TicketStatus
        $status = Ekwanza::tickets()->status($ticketCode);

        if ($status->state === 'PAID') {
            return "O pagamento já foi realizado!";
        }

        return "O ticket ainda encontra-se no estado: " . $status->state;
    }
}
```

### 3. Enviar Dinheiro a um Cliente (Send To Customer)

Transfere fundos diretamente para a carteira de um número e-kwanza (ideal para saques de comissões/retiradas/cashout). A própria API gera e assina os headers de segurança automaticamente.

```php
use Souzajluiz\LaravelEkwanza\Facades\Ekwanza;
use App\Http\Controllers\Controller;

class PayoutController extends Controller
{
    public function payout()
    {
        $mobileNumber = '9XXXXXXXX'; 
        $amount = '1000.00';
        $operationCode = 'SAQUE_' . uniqid(); // Código único da operação de saque

        // Envia o pagamento para o cliente
        $response = Ekwanza::customers()->sendPayment($mobileNumber, $amount, $operationCode);

        // Retorna o resultado da operação
        return response()->json([
            'message' => 'Transferência efetuada com sucesso',
            'data' => $response
        ]);
    }
}
```

### 4. Pagamentos via Gateway (GPO)

O Gateway Online permite a integração para pagamentos mais diretos, usando OAuth e cobranças através de MULTICAIXA, etc. O SDK do Laravel processa e negocia o Token OAuth automaticamente usando as credenciais do seu `.env`.

```php
use Souzajluiz\LaravelEkwanza\Facades\Ekwanza;
use Illuminate\Http\Request;

class GatewayController extends Controller
{
    public function charge(Request $request)
    {
        $amount = 2500.00;
        $transactionId = 'TX_987654';
        
        $response = Ekwanza::gateway()->createCharge(
            $amount, 
            $transactionId, 
            'MULTICAIXA', 
            'Pagamento de Mensalidade Escolar'
        );

        return response()->json($response);
    }
}
```

### 5. Receber Webhooks de Confirmação (Payment Callbacks)

Quando o cliente paga um ticket de pagamento ou o Gateway processa, o e-kwanza envia uma requisição POST automática para o seu sistema (assumindo que configuraste o endpoint de notificação no painel ou com a equipa de suporte). 

O SDK oferece um método extremamente fácil e seguro para **verificar a assinatura da notificação**.

**Exemplo de Rota (`routes/api.php`):**
```php
Route::post('/ekwanza/webhook', [WebhookController::class, 'handleCallback']);
```

**Exemplo de Controller (`WebhookController.php`):**
```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Souzajluiz\LaravelEkwanza\Facades\Ekwanza;
use Souzajluiz\Ekwanza\Exceptions\InvalidSignatureException;

class WebhookController extends Controller
{
    public function handleCallback(Request $request)
    {
        // O body da requisição
        $payload = $request->all();
        // A assinatura enviada nos headers
        $signature = $request->header('x-signature');

        if (!$signature) {
            return response()->json(['error' => 'Assinatura ausente'], 400);
        }

        try {
            // Verifica a assinatura e retorna o objeto "PaymentNotification" (DTO)
            $notification = Ekwanza::client()->webhooks()->verifyPaymentCallback($payload, $signature);
            
            // Lógica de negócio a partir daqui!
            if ($notification->state === 'PAID') {
                // Atualizar o estado do pedido pago usando o operationCode / code.
                // Order::where('reference', $notification->operationCode)->update(['status' => 'paid']);
            }

            return response()->json(['status' => 'sucesso'], 200);

        } catch (InvalidSignatureException $e) {
            // Rejeita requisições com assinatura forjada/inválida
            return response()->json(['error' => 'Assinatura inválida'], 403);
        }
    }
}
```

## Tratamento de Exceções e Respostas

O SDK lança exceções do tipo `ApiException` quando a API do e-kwanza devolve instabilidades ou erros de validação (`4xx` ou `5xx`). O ideal é envolvê-las numa estrutura *Try/Catch*.

```php
use Souzajluiz\Ekwanza\Exceptions\ApiException;

try {
    $ticket = Ekwanza::tickets()->create(100.00, 'REF-TEST', '9ZZZZZZZZ');
} catch (ApiException $e) {
    // Retorna mensagem formatada fornecida pela e-kwanza
    return response()->json([
        'erro' => $e->getMessage()
    ], $e->getCode() ?: 400);
}
```

## Métodos Disponíveis na Facade
Atualmente a Facade suporta a invocação aos Seguintes Serviços do SDK PHP:
- `Ekwanza::tickets()`: TicketService.php
- `Ekwanza::customers()`: CustomerPaymentService.php
- `Ekwanza::gateway()`: GatewayService.php
- `Ekwanza::client()`: Client.php (Dá acesso nativo e aos Webhooks como `$client->webhooks()`)
