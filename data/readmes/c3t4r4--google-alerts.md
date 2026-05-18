# Google Alerts (Laravel)

Laravel package for managing [Google Alerts](https://www.google.com/alerts) with **OAuth 2.0** authentication. It provides a stable, token-based flow (with refresh) instead of relying only on manual cookies, and exposes REST-style endpoints to list, create, update, and delete alerts.

---

## English

### Features

- **OAuth 2.0** – Authenticate with Google and store access/refresh tokens (no manual cookie copy/paste required for the main flow).
- **Token refresh** – Automatic refresh before expiry and optional hourly Artisan command to keep tokens valid.
- **Cookie cache** – Caches session cookies to reduce DB/decrypt load.
- **Manual cookies (optional)** – Fallback: use base64-encoded cookies from config/env when OAuth cookie extraction is not enough.
- **Multi-account** – Support multiple Google accounts (by email).
- **REST-style API** – List, create, update, and delete alerts via the package routes or the `GoogleAlerts` facade.

### Requirements

- PHP 8.2+
- Laravel 11 or 12
- [Google Cloud OAuth credentials](https://console.cloud.google.com/apis/credentials) (Client ID + Client Secret)

### Installation

```bash
composer require c3t4r4/google-alerts
```

Publish config and migrations:

```bash
php artisan vendor:publish --tag=google-alerts-config
php artisan vendor:publish --tag=google-alerts-migrations
php artisan migrate
```

### Configuration

In `.env`:

```env
GOOGLE_ALERTS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ALERTS_CLIENT_SECRET=your-client-secret
GOOGLE_ALERTS_REDIRECT_URI=/google-alerts/callback
```

Optional:

- `GOOGLE_ALERTS_TOKEN_STORAGE=database` (default)
- `GOOGLE_ALERTS_COOKIES_BASE64` – if you want to use manual cookies (base64-encoded JSON array of `{key, value, domain}`).

In `config/google-alerts.php` you can adjust cache TTL, API timeout, retry on 401, and default alert settings (region, language, how often, etc.).

### OAuth flow (first-time setup)

1. **Redirect the user to Google**

   Use the named route (e.g. in a “Connect Google Alerts” button):

   ```php
   return redirect()->route('google-alerts.auth.redirect');
   ```

2. **Callback**

   Google redirects to your callback URL with a `code`. The package registers:

   - **Web:** `GET /google-alerts/callback` (route name: `google-alerts.auth.callback`)

   Your frontend or a simple “success” page should point users to the same URL. The package handles the `code`, exchanges it for tokens, stores them (and optionally extracts cookies), and returns a JSON response with `success`, `email`, and `expires_at`.

3. **Redirect URI in Google Cloud**

   In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your OAuth 2.0 Client → Authorized redirect URIs, add:

   `https://your-domain.com/google-alerts/callback`  
   (or `http://localhost:8000/google-alerts/callback` for local.)

### Using the API (routes)

The package registers these routes (prefix `google-alerts`, middleware `api`):

| Method   | Path           | Description        |
|----------|----------------|--------------------|
| `GET`    | `/google-alerts`       | List all alerts (optional query: `?email=user@example.com`) |
| `POST`   | `/google-alerts`       | Create alert (body: `query` or `name`, optional `howOften`, `sources`, `lang`, `region`, `howMany`, `deliverTo`, `email`) |
| `PUT`    | `/google-alerts/{id}`   | Update alert (body: same optional fields + optional `email`) |
| `DELETE` | `/google-alerts/{id}`   | Delete alert (optional query: `?email=user@example.com`) |

Example (create):

```bash
curl -X POST https://your-app.com/google-alerts \
  -H "Content-Type: application/json" \
  -d '{"query": "Laravel", "name": "Laravel news", "email": "user@example.com"}'
```

### Using the facade in code

```php
use C3t4r4\GoogleAlerts\Facades\GoogleAlerts;

// List all alerts (default account)
$alerts = GoogleAlerts::all();

// For a specific account
$alerts = GoogleAlerts::forEmail('user@example.com')->all();

// Create
$alert = GoogleAlerts::forEmail('user@example.com')->create([
    'query'  => 'Laravel',
    'name'   => 'Laravel news',
    'howOften' => 1,  // AT_MOST_ONCE_A_DAY
    'region' => 'BR',
    'lang'   => 'pt',
]);

// Update
GoogleAlerts::forEmail('user@example.com')->update('alert-id-here', [
    'name' => 'New name',
]);

// Delete
GoogleAlerts::forEmail('user@example.com')->delete('alert-id-here');
```

Constants for options (from `GoogleAlertsService`):

- `HOW_OFTEN`: `AS_IT_HAPPENS` (0), `AT_MOST_ONCE_A_DAY` (1), `AT_MOST_ONCE_A_WEEK` (2)
- `DELIVER_TO`: `MAIL` (0), `RSS` (1)
- `HOW_MANY`: `BEST` (0), `ALL` (1)
- `SOURCE_TYPE`: `AUTOMATIC` (0), `NEWS` (1), `BLOGS` (2), `WEB` (3), etc.

### Manual cookies (optional)

If OAuth-based cookie extraction is not reliable in your environment, you can set cookies manually:

1. Encode a JSON array of cookies: `[{"key":"SID","value":"...","domain":".google.com"}, ...]`
2. Base64-encode it and set `GOOGLE_ALERTS_COOKIES_BASE64` in `.env`, or set `config('google-alerts.cookies_manual')` (e.g. `'default' => $base64` or per-email keys).

When set, the package uses these cookies instead of extracting from the token.

### Proactive token refresh (Artisan)

To reduce the chance of expired tokens in production, run the refresh command (e.g. hourly via scheduler):

```bash
php artisan google-alerts:refresh-tokens
```

Options:

- `--email=user@example.com` – refresh only this account
- `--dry-run` – only list tokens that would be refreshed

The package can also register this command in the Laravel scheduler (hourly) when running in the console and when `Schedule` is available.

### Testing

```bash
composer test
```

Uses [Pest](https://pestphp.com/) and Orchestra Testbench. Tests cover the model, auth service, alerts service, refresh command, and HTTP controllers.

### Disclaimer

Google Alerts does not offer an official public API. This package uses the same internal endpoints as the Google Alerts web UI, with OAuth for identity and session handling. Use in accordance with Google’s terms of service.

---

## Português

### Funcionalidades

- **OAuth 2.0** – Autenticação com Google e armazenamento de access/refresh tokens (fluxo principal sem colar cookies manualmente).
- **Refresh de token** – Renovação automática antes do vencimento e comando Artisan opcional (horário) para manter tokens válidos.
- **Cache de cookies** – Cache dos cookies de sessão para reduzir acesso ao banco e descriptografia.
- **Cookies manuais (opcional)** – Fallback: usar cookies em base64 na config/env quando a extração via OAuth não for suficiente.
- **Múltiplas contas** – Suporte a vários usuários Google (por email).
- **API REST** – Listar, criar, atualizar e excluir alertas pelas rotas do pacote ou pela facade `GoogleAlerts`.

### Requisitos

- PHP 8.2+
- Laravel 11 ou 12
- [Credenciais OAuth no Google Cloud](https://console.cloud.google.com/apis/credentials) (Client ID e Client Secret)

### Instalação

```bash
composer require c3t4r4/google-alerts
```

Publicar config e migrations:

```bash
php artisan vendor:publish --tag=google-alerts-config
php artisan vendor:publish --tag=google-alerts-migrations
php artisan migrate
```

### Configuração

No `.env`:

```env
GOOGLE_ALERTS_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_ALERTS_CLIENT_SECRET=seu-client-secret
GOOGLE_ALERTS_REDIRECT_URI=/google-alerts/callback
```

Opcional:

- `GOOGLE_ALERTS_TOKEN_STORAGE=database` (padrão)
- `GOOGLE_ALERTS_COOKIES_BASE64` – para usar cookies manuais (JSON em base64 no formato `[{key, value, domain}]`).

Em `config/google-alerts.php` é possível ajustar TTL do cache, timeout da API, retry em 401 e padrões do alerta (região, idioma, frequência, etc.).

### Fluxo OAuth (primeira vez)

1. **Redirecionar o usuário para o Google**

   Use a rota nomeada (ex.: botão “Conectar Google Alerts”):

   ```php
   return redirect()->route('google-alerts.auth.redirect');
   ```

2. **Callback**

   O Google redireciona para a URL de callback com um `code`. O pacote registra:

   - **Web:** `GET /google-alerts/callback` (nome: `google-alerts.auth.callback`)

   Seu front ou uma página de sucesso deve apontar para essa URL. O pacote troca o `code` por tokens, grava (e opcionalmente extrai cookies) e devolve JSON com `success`, `email` e `expires_at`.

3. **URI de redirecionamento no Google Cloud**

   Em [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → seu cliente OAuth 2.0 → URIs de redirecionamento autorizados, adicione:

   `https://seu-dominio.com/google-alerts/callback`  
   (ou `http://localhost:8000/google-alerts/callback` em ambiente local.)

### Uso da API (rotas)

O pacote registra estas rotas (prefixo `google-alerts`, middleware `api`):

| Método   | Caminho              | Descrição |
|----------|----------------------|-----------|
| `GET`    | `/google-alerts`     | Listar alertas (query opcional: `?email=usuario@exemplo.com`) |
| `POST`   | `/google-alerts`     | Criar alerta (body: `query` ou `name`, opcional `howOften`, `sources`, `lang`, `region`, `howMany`, `deliverTo`, `email`) |
| `PUT`    | `/google-alerts/{id}`| Atualizar alerta (body: mesmos campos opcionais + opcional `email`) |
| `DELETE` | `/google-alerts/{id}`| Excluir alerta (query opcional: `?email=usuario@exemplo.com`) |

Exemplo (criar):

```bash
curl -X POST https://sua-app.com/google-alerts \
  -H "Content-Type: application/json" \
  -d '{"query": "Laravel", "name": "Notícias Laravel", "email": "usuario@exemplo.com"}'
```

### Uso da facade no código

```php
use C3t4r4\GoogleAlerts\Facades\GoogleAlerts;

// Listar todos os alertas (conta padrão)
$alerts = GoogleAlerts::all();

// Para uma conta específica
$alerts = GoogleAlerts::forEmail('usuario@exemplo.com')->all();

// Criar
$alert = GoogleAlerts::forEmail('usuario@exemplo.com')->create([
    'query'    => 'Laravel',
    'name'     => 'Notícias Laravel',
    'howOften' => 1,   // AT_MOST_ONCE_A_DAY
    'region'   => 'BR',
    'lang'     => 'pt',
]);

// Atualizar
GoogleAlerts::forEmail('usuario@exemplo.com')->update('id-do-alerta', [
    'name' => 'Novo nome',
]);

// Excluir
GoogleAlerts::forEmail('usuario@exemplo.com')->delete('id-do-alerta');
```

Constantes de opções (em `GoogleAlertsService`):

- `HOW_OFTEN`: `AS_IT_HAPPENS` (0), `AT_MOST_ONCE_A_DAY` (1), `AT_MOST_ONCE_A_WEEK` (2)
- `DELIVER_TO`: `MAIL` (0), `RSS` (1)
- `HOW_MANY`: `BEST` (0), `ALL` (1)
- `SOURCE_TYPE`: `AUTOMATIC` (0), `NEWS` (1), `BLOGS` (2), `WEB` (3), etc.

### Cookies manuais (opcional)

Se a extração de cookies via OAuth não for confiável no seu ambiente, você pode definir cookies manualmente:

1. Monte um JSON com array de cookies: `[{"key":"SID","value":"...","domain":".google.com"}, ...]`
2. Codifique em base64 e defina `GOOGLE_ALERTS_COOKIES_BASE64` no `.env`, ou configure `config('google-alerts.cookies_manual')` (ex.: `'default' => $base64` ou chaves por email).

Quando definido, o pacote usa esses cookies em vez de extrair do token.

### Refresh proativo de tokens (Artisan)

Para reduzir expiração de tokens em produção, execute o comando (ex.: a cada hora no agendador):

```bash
php artisan google-alerts:refresh-tokens
```

Opções:

- `--email=usuario@exemplo.com` – atualizar só esta conta
- `--dry-run` – apenas listar tokens que seriam atualizados

O pacote pode ainda registrar esse comando no agendador do Laravel (horário) quando estiver em contexto console e o `Schedule` estiver disponível.

### Testes

```bash
composer test
```

Usa [Pest](https://pestphp.com/) e Orchestra Testbench. Os testes cobrem o model, serviço de auth, serviço de alertas, comando de refresh e controllers HTTP.

### Aviso

O Google Alerts não possui API pública oficial. Este pacote utiliza os mesmos endpoints internos da interface web do Google Alerts, com OAuth para identidade e sessão. Use em conformidade com os termos de uso do Google.

---

## License

MIT.
