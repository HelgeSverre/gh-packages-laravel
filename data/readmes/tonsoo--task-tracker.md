# Task Tracker

Um pacote Laravel que transforma mensagens recebidas do WhatsApp em tarefas acionáveis em qualquer gerenciador configurado (Trello, Linear, sistemas internos) usando extração de intenção por IA. Ele escuta webhooks do WhatsApp, interpreta mensagens via adapters, classifica a intenção com um LLM e orquestra operações no gerenciador de tarefas (criar/atualizar/fechar, adicionar contexto, etc.).

## Recursos
- **Ingestão de webhooks de mensageria** via `routes/api.php` para `MessagingWebhookController`
- **Padrão Adapter** para plataformas de mensagens (`MessagingAdapter`), com `WhatsAppAdapter` embutido
- **Registro automático de webhooks** para drivers de mensageria configurados
- **Análise de intenção por IA** usando `OpenAI` através do contrato `LLMClient`
- **Orquestração inteligente de tarefas** para deduplicar relatos e atualizar itens existentes
- **Integrações pluggable** via `TaskDriver` (Trello incluso por padrão)
- **Publicação de config** e configuração por ambiente (`config/task-tracker.php`)
- **Processamento em fila** com tratamento idempotente de mensagens recebidas

## Início Rápido
1. **Instalação**
```bash
composer require tonsoo/task-tracker
```

2. **Publicar configuração**
```bash
php artisan vendor:publish --tag=task-tracker-config
```

3. **Variáveis de ambiente** (veja `.env.example` e `docs/concepts/configuration.md`)
```env
WHATSAPP_TOKEN=...
WHATSAPP_FROM_NUMBER=...
WHATSAPP_FROM_ID=...
WHATSAPP_SECRET=...

TASK_TRACKER_DRIVER=trello

TRELLO_KEY=...
TRELLO_TOKEN=...
TRELLO_BOARD_ID=...
TRELLO_LIST_ID=...

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
TASK_TRACKER_AI_DRIVER=openai
```

4. **Rotas de webhook**
- GET `/webhooks/messaging/whatsapp` para verificação
- POST `/webhooks/messaging/whatsapp` para eventos

5. **Worker da fila**
```bash
php artisan queue:work
```

## Arquitetura
- **Service Provider**: `src/TaskTrackerServiceProvider.php`
  - Faz bind de `LLMClient` para `OpenAILLMClient`
  - Faz bind do `TaskDriver`, do `TaskManager` e do `TaskOrchestrator`
  - Registra `WhatsAppAdapter`
  - Carrega rotas e publica config

- **HTTP**: `routes/api.php` → `MessagingWebhookController`
  - Verifica webhook (`whatsappAuth()`)
  - Interpreta payload via `WhatsAppAdapter` e despacha `ProcessIncomingMessageJob`

- **Messaging**: contrato `MessagingAdapter` + `WhatsAppAdapter` + `IncomingMessage`

- **IA**: `AiIntentAnalyzer` + `LLMClient` (implementação OpenAI)

- **Caso de Uso**: `ProcessIncomingMessage` → extrai intenção → delega ao `TaskOrchestrator`

- **Integrações**: `TaskDriver` (cria manager + orchestrator) + `TaskManager`

## Ciclo (alto nível)
1. Plataforma envia webhook → `MessagingWebhookController@ingest`
2. `WhatsAppAdapter` converte para `IncomingMessage[]`
3. Cada mensagem é enfileirada como `ProcessIncomingMessageJob` (lock idempotente por id da mensagem quando houver)
4. `ProcessIncomingMessage` usa `AiIntentAnalyzer` para obter `StructuredIntent`
5. `TaskOrchestrator`:
   - `bug_report`: encontra tarefa similar via palavras‑chave + IA; atualiza existente ou cria nova
   - `bug_fixed`: adiciona resolução e fecha a tarefa
   - `feature_request`: cria nova tarefa

## Documentação
- **[Visão Geral](docs/concepts/overview.md)**
- **[Instalação](getting-started.md)**
- **[Configuração](docs/concepts/configuration.md)**
- **[Uso](docs/concepts/usage.md)**
- **[Transcrições](docs/integrations/transcriptions.md)**
- **[Adapters de Mensageria](docs/integrations/adapters.md)**
- **[Análise de IA](docs/ai/overview.md)**
- **[Gerenciadores de Tarefas](docs/drivers/task-managers.md)**
- **[Integração com Trello](docs/drivers/trello.md)**
- **[HTTP & Webhooks](docs/integrations/http-webhooks.md)**
- **[Estendendo o Pacote](docs/concepts/extending.md)**
## Requisitos
- PHP 8.2+
- Laravel 12.x
- Fila configurada e worker em execução
- Chave e token do gerenciador (Trello incluso)
- App do WhatsApp Cloud API configurado
- Chave de API da OpenAI

## Contribuição
Issues e PRs são bem-vindos. Siga PSR-12 e rode testes/linters antes de enviar.

## Licença
MIT
