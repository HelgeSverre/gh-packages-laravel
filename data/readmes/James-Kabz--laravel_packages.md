# MpesaPkg (Laravel)

Plug-and-play M-Pesa package with STK, B2C, C2B, and utility APIs. Includes request/response persistence, callback storage, and optional webhook validation.

## Quick Start

1) Publish config (optional):
```bash
php artisan vendor:publish --tag=mpesa-config
```

2) Run migrations:
```bash
php artisan migrate
```

3) Place certificates:
```text
storage/app/private/certs/SandboxCertificate.cer
storage/app/private/certs/ProductionCertificate.cer
```

4) Configure env (see template below).

## Environment Variables (example)

```dotenv
MPESA_ENV=sandbox
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_ROUTE_PREFIX=payments
MPESA_STORE_REQUESTS=true
MPESA_STORE_CALLBACKS=true

MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...

# STK
MPESA_STK_SHORT_CODE=174379
MPESA_STK_PASSKEY=...
MPESA_STK_CALLBACK_URL=https://example.ngrok-free.app/payments/stk/callback

# B2C
MPESA_B2C_INITIATOR=testapi
MPESA_B2C_INITIATOR_PASSWORD=
MPESA_B2C_SECURITY_CREDENTIAL=...
MPESA_B2C_SHORT_CODE=600997
MPESA_B2C_COMMAND_ID=BusinessPayment
MPESA_B2C_RESULT_URL=https://example.ngrok-free.app/payments/b2c/result
MPESA_B2C_TIMEOUT_URL=https://example.ngrok-free.app/payments/b2c/timeout

# C2B
MPESA_C2B_SHORT_CODE=600997
MPESA_C2B_RESPONSE_TYPE=Completed
MPESA_C2B_VALIDATION_URL=https://example.ngrok-free.app/payments/c2b/validation
MPESA_C2B_CONFIRMATION_URL=https://example.ngrok-free.app/payments/c2b/confirmation

# Utility callbacks
MPESA_TRANSACTION_STATUS_RESULT_URL=https://example.ngrok-free.app/payments/transaction/status/result
MPESA_TRANSACTION_STATUS_TIMEOUT_URL=https://example.ngrok-free.app/payments/transaction/status/timeout
MPESA_ACCOUNT_BALANCE_RESULT_URL=https://example.ngrok-free.app/payments/account/balance/result
MPESA_ACCOUNT_BALANCE_TIMEOUT_URL=https://example.ngrok-free.app/payments/account/balance/timeout
MPESA_REVERSAL_RESULT_URL=https://example.ngrok-free.app/payments/reversal/result
MPESA_REVERSAL_TIMEOUT_URL=https://example.ngrok-free.app/payments/reversal/timeout

# Webhook validation (optional)
MPESA_WEBHOOK_VALIDATION=false
MPESA_WEBHOOK_HEADER=X-Mpesa-Token
MPESA_WEBHOOK_TOKEN=
MPESA_WEBHOOK_ALLOWED_IPS=
```

Note: some sandbox environments reject callback URLs containing the word `mpesa` in the path. If you see `Invalid ValidationURL`, use a different prefix such as `payments`.

## Routes (under MPESA_ROUTE_PREFIX)

```text
POST /<prefix>/stk/push
POST /<prefix>/stk/query
POST /<prefix>/stk/callback

POST /<prefix>/b2c/send
POST /<prefix>/b2c/validated
POST /<prefix>/b2c/result
POST /<prefix>/b2c/timeout

POST /<prefix>/c2b/register
POST /<prefix>/c2b/simulate
POST /<prefix>/c2b/validation
POST /<prefix>/c2b/confirmation

POST /<prefix>/transaction/status
POST /<prefix>/transaction/status/result
POST /<prefix>/transaction/status/timeout
POST /<prefix>/account/balance
POST /<prefix>/account/balance/result
POST /<prefix>/account/balance/timeout
POST /<prefix>/reversal
POST /<prefix>/reversal/result
POST /<prefix>/reversal/timeout
```

## Response Format

All API responses return:
```json
{
  "ok": true,
  "status": 200,
  "data": {},
  "error": null,
  "body": null
}
```

## Generate Security Credential

```bash
php artisan mpesa:security-credential
```

## Test Commands (examples)

Set:
```text
BASE=https://example.ngrok-free.app
PREFIX=payments
```

### STK Push
```bash
curl -X POST "$BASE/$PREFIX/stk/push" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254700000000",
    "amount": 1,
    "account_reference": "TEST-001",
    "transaction_desc": "STK Test",
    "callback_url": "'"$BASE"'/'"$PREFIX"'/stk/callback"
  }'
```

### STK Query
```bash
curl -X POST "$BASE/$PREFIX/stk/query" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_request_id": "ws_CO_123456789"
  }'
```

### B2C Send
```bash
curl -X POST "$BASE/$PREFIX/b2c/send" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254700000000",
    "amount": 10,
    "remarks": "B2C Test",
    "occasion": "Test"
  }'
```

### B2C Validated
```bash
curl -X POST "$BASE/$PREFIX/b2c/validated" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254700000000",
    "amount": 10,
    "remarks": "B2C Validate",
    "id_number": "12345678"
  }'
```

### C2B Register URLs
```bash
curl -X POST "$BASE/$PREFIX/c2b/register" \
  -H "Content-Type: application/json" \
  -d '{
    "short_code": "600997",
    "confirmation_url": "'"$BASE"'/'"$PREFIX"'/c2b/confirmation",
    "validation_url": "'"$BASE"'/'"$PREFIX"'/c2b/validation",
    "response_type": "Completed"
  }'
```

### C2B Simulate
```bash
curl -X POST "$BASE/$PREFIX/c2b/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254700000000",
    "amount": 10,
    "short_code": "600997",
    "command_id": "CustomerPayBillOnline",
    "bill_ref_number": "TEST-001"
  }'
```

### C2B Validation (manual test)
```bash
curl -X POST "$BASE/$PREFIX/c2b/validation" \
  -H "Content-Type: application/json" \
  -d '{
    "ResultCode": 0,
    "ResultDesc": "Accepted",
    "TransID": "TEST123",
    "TransAmount": "10",
    "MSISDN": "254700000000",
    "BusinessShortCode": "600997",
    "BillRefNumber": "TEST-001"
  }'
```

### C2B Confirmation (manual test)
```bash
curl -X POST "$BASE/$PREFIX/c2b/confirmation" \
  -H "Content-Type: application/json" \
  -d '{
    "ResultCode": 0,
    "ResultDesc": "Accepted",
    "TransID": "TEST123",
    "TransAmount": "10",
    "MSISDN": "254700000000",
    "BusinessShortCode": "600997",
    "BillRefNumber": "TEST-001"
  }'
```

### Transaction Status
```bash
curl -X POST "$BASE/$PREFIX/transaction/status" \
  -H "Content-Type: application/json" \
  -d '{
    "short_code": "600997",
    "transaction_id": "TEST123",
    "identifier_type": "4",
    "remarks": "Status Check"
  }'
```

### Transaction Status Result (callback test)
```bash
curl -X POST "$BASE/$PREFIX/transaction/status/result" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 0,
      "ResultDesc": "Accepted",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456",
      "TransactionID": "TEST789"
    }
  }'
```

### Transaction Status Timeout (callback test)
```bash
curl -X POST "$BASE/$PREFIX/transaction/status/timeout" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 1,
      "ResultDesc": "Timeout",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456"
    }
  }'
```

### Account Balance
```bash
curl -X POST "$BASE/$PREFIX/account/balance" \
  -H "Content-Type: application/json" \
  -d '{
    "short_code": "600997",
    "identifier_type": "4",
    "remarks": "Balance Check"
  }'
```

### Account Balance Result (callback test)
```bash
curl -X POST "$BASE/$PREFIX/account/balance/result" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 0,
      "ResultDesc": "Accepted",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456"
    }
  }'
```

### Account Balance Timeout (callback test)
```bash
curl -X POST "$BASE/$PREFIX/account/balance/timeout" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 1,
      "ResultDesc": "Timeout",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456"
    }
  }'
```

### Reversal
```bash
curl -X POST "$BASE/$PREFIX/reversal" \
  -H "Content-Type: application/json" \
  -d '{
    "short_code": "600997",
    "transaction_id": "TEST123",
    "amount": 10,
    "remarks": "Reversal Test"
  }'
```

### Reversal Result (callback test)
```bash
curl -X POST "$BASE/$PREFIX/reversal/result" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 0,
      "ResultDesc": "Accepted",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456",
      "TransactionID": "TEST789"
    }
  }'
```

### Reversal Timeout (callback test)
```bash
curl -X POST "$BASE/$PREFIX/reversal/timeout" \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 1,
      "ResultDesc": "Timeout",
      "OriginatorConversationID": "TEST123",
      "ConversationID": "TEST456"
    }
  }'
```
## Notes

- Requests and callbacks are persisted when `MPESA_STORE_REQUESTS=true` and `MPESA_STORE_CALLBACKS=true`.
- Callbacks can be protected using `MPESA_WEBHOOK_VALIDATION` with token/IP allow-listing.
