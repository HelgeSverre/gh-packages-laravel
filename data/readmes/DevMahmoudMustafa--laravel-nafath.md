# Laravel Nafath Package

> **📌 This package integrates with Nafath API provided by [Elm Company](https://elm.sa)**
> 
> To obtain credentials (APP_ID, APP_KEY), please contact Elm support team or visit [Nafath Developer Portal](https://rabet-nafath.api.elm.sa)

A professional Laravel package for integrating with **Nafath** - Saudi Arabia's National Authentication System via **Elm Platform**. This package provides ready-to-use endpoints and makes it easy for anyone to integrate Nafath authentication into their Laravel applications.

---

## ✨ Why Use This Package?

- ✅ **Ready-to-Use Endpoints** - Pre-built HTTP endpoints for all Nafath operations (no DTOs needed!)
- ✅ **Easy Integration** - Simple step-by-step workflow, no complex setup
- ✅ **Direct HTTP Calls** - Use endpoints directly from frontend or any HTTP client - no PHP code required
- ✅ **Automatic Callback Handling** - Callback endpoint receives user actions automatically
- ✅ **JWT Verification** - Built-in JWT token verification and decryption
- ✅ **Event System** - React to user actions via Laravel events
- ✅ **Production Ready** - Professional architecture with error handling and security features

**💡 Important:** You can use all endpoints via HTTP requests directly - no need to use DTOs or PHP code unless you specifically need programmatic access from PHP.

---

## 📋 Requirements

- PHP >= 8.1
- Laravel >= 10.0
- Extensions: `ext-json`, `ext-openssl`

---

## 📥 Installation

### Step 1: Install Package

```bash
composer require devmahmoudmustafa/laravel-nafath
```

### Step 2: Publish & Run Migrations

```bash
php artisan vendor:publish --tag=nafath-config
php artisan vendor:publish --tag=nafath-migrations
php artisan migrate
```

### Step 3: Configure Environment

Add to your `.env` file:

```env
NAFATH_APP_ID=your_app_id_from_elm
NAFATH_APP_KEY=your_app_key_from_elm
NAFATH_MODE=development  # or 'production'
```

That's it! The package is ready to use.

---

## 🔄 How Nafath Integration Works

### Complete Workflow Flow

```
┌─────────────────┐
│  Create Request │  ← POST /nafath/create-request
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ User Action     │  ← User approves/rejects in Nafath App
│ (Nafath App)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Callback (JWT)  │  ← POST /nafath/callback (Source of Truth)
│ ← Source of     │     Receives update automatically
│    Truth        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Business Logic  │  ← Process callback, authenticate user
└─────────────────┘
         │
         ↓
┌─────────────────┐
│ (Optional)      │  ← POST /nafath/request-info
│ requestInfo     │     For UI updates or fallback
│ for UI          │     (if callback didn't arrive)
└─────────────────┘
```

### Key Points

1. **Create Request** → User sees verification code
2. **User Action** → User approves/rejects in Nafath mobile app
3. **Callback (Source of Truth)** → Your server receives update automatically with JWT token
4. **Business Logic** → Process the callback, authenticate user, update application
5. **Optional request-info** → Use for UI updates or if callback fails

---

## 🎯 Available Endpoints

The package provides ready-to-use HTTP endpoints. All endpoints are automatically registered and available at `/nafath/*` (configurable).

**💡 You can use these endpoints directly via HTTP requests - no DTOs or PHP code needed!** DTOs are only optional if you want to call from PHP code with type safety.

### 1. Create Request

**Endpoint:** `POST /nafath/create-request`

**Purpose:** Create a new Nafath authentication request.

**When to Use:** When user wants to authenticate via Nafath.

**Request:**
```json
{
  "national_id": "1234567890",
  "local": "ar",
  "request_id": "optional-uuid",
  "service": "optional-service-name"
}
```

**Request Fields:**
- `national_id` (required) - 10-digit Saudi National ID
- `local` (optional) - Language code: `ar` or `en` (default: `ar`)
- `request_id` (optional) - Custom request UUID
- `service` (optional) - Service type. If not provided, uses default from config (`DigitalServiceEnrollmentWithoutBio`)

**Response:**
```json
{
  "success": true,
  "message": "Request created successfully",
  "data": {
    "request_id": "uuid",
    "trans_id": "uuid",
    "random": "42",
    "status": "WAITING",
    "expires_at": "2024-01-01 12:00:00"
  }
}
```

**Usage:** Show the `random` code to the user. They will enter it in the Nafath app.

---

### 2. Get Status

**Endpoint:** `POST /nafath/get-status`

**Purpose:** Check the current status of a request **at any time**.

**When to Use:** 
- ✅ Check if request is WAITING, COMPLETED, REJECTED, or EXPIRED
- ✅ Verify request state anytime (before/after user action, before/after callback)
- ✅ UI updates and status display
- ✅ **Completely independent** - works standalone, no dependency on callback

**Request:**
```json
{
  "national_id": "1234567890",
  "trans_id": "uuid-from-create-request",
  "random": "42"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "WAITING",  // or COMPLETED, REJECTED, EXPIRED
    "trans_id": "uuid",
    "request_id": "uuid"
  }
}
```

**Status Values:**
- `WAITING` - User hasn't acted yet
- `COMPLETED` - User approved the request
- `REJECTED` - User rejected the request
- `EXPIRED` - Request expired (timeout)

**Usage:** Call this endpoint anytime to check request status. It's completely independent and works regardless of callback status.

---

### 3. Callback (Source of Truth) ⭐

**Endpoint:** `POST /nafath/callback`

**Purpose:** Receives automatic updates when user approves/rejects the request.

**When to Use:** This is called automatically by Nafath servers. You handle it via Events.

**Request (from Nafath):**
```json
{
  "transactionId": "uuid",
  "status": "COMPLETED",  // or REJECTED
  "token": "jwt-token-here"  // Only if COMPLETED
}
```

**Response:**
```json
{
  "success": true,
  "message": "Callback processed successfully"
}
```

**Why It's the Source of Truth:**
- ✅ Receives updates **immediately** when user acts
- ✅ Contains **JWT token** with decrypted user data
- ✅ **Automatic** - no polling needed
- ✅ **Reliable** - direct from Nafath servers

**How to Handle:**

**Option 1: Using Events (Recommended)**
```php
// In EventServiceProvider
use Nafath\LaravelNafath\Events\NafathRequestCompleted;
use Nafath\LaravelNafath\Events\NafathRequestRejected;

protected $listen = [
    NafathRequestCompleted::class => [
        \App\Listeners\HandleNafathSuccess::class,
    ],
    NafathRequestRejected::class => [
        \App\Listeners\HandleNafathRejection::class,
    ],
];
```

**Option 2: Direct Processing**
The callback endpoint automatically:
- Verifies JWT token
- Decrypts user data
- Updates database record
- Fires events

You can access the data via events or by querying the database.

---

### 4. Request Info (Optional)

**Endpoint:** `POST /nafath/request-info`

**Purpose:** Get decrypted user data. Use for UI updates or as fallback.

**When to Use:**
- ✅ To update UI after user approval
- ✅ As fallback if callback didn't arrive (network issues, etc.)
- ❌ Don't use as primary source - callback is faster and more reliable

**Request:**
```json
{
  "national_id": "1234567890",
  "trans_id": "uuid",
  "random": "42"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trans_id": "uuid",
    "request_id": "uuid",
    "status": "COMPLETED",
    "user_data": {
      "nationalId": "1234567890",
      "fullName": "John Doe",
      // ... other user fields from Nafath
    }
  }
}
```

**Important Note:**
The `request-info` endpoint reflects user actions (approval/rejection) **approximately 20-30 seconds** after the user interacts with the Nafath app. This is normal behavior from Nafath's side.

**Use Cases:**
- Update UI after user approval (if you didn't receive callback)
- Fallback mechanism if callback fails
- Display user information in your application

**Don't rely on it as primary source** - the callback endpoint is faster and receives updates immediately.

---

### 5. Get JWK

**Endpoint:** `GET /nafath/jwk`

**Purpose:** Get JSON Web Keys for manual JWT verification.

**When to Use:** If you need to verify JWT tokens manually (usually not needed - package handles it automatically).

**Response:**
```json
{
  "success": true,
  "data": {
    "keys": [...]
  }
}
```

---

### 6. Simulate User Action (Development Only)

**Endpoint:** `POST /nafath/simulate`

**Purpose:** Simulate user approval/rejection for testing.

**When to Use:** In development mode only, for testing without real Nafath app.

**Request:**
```json
{
  "national_id": "1002133393",  // Test National ID from Elm
  "local": "ar",
  "request_id": "uuid"
}
```

**Note:** Only available in `development` mode. Returns 403 in production.

**Test National ID:** `1002133393` (provided by Elm for testing)

---

## 📖 Step-by-Step Usage Guide

### Step 1: Create Request

**What Happens:**
- User initiates Nafath authentication
- Your application creates a request via `/nafath/create-request`
- User receives a verification code

**Code Example:**

**Option 1: Using HTTP Endpoint (Recommended - No DTOs needed)**

Simply call the HTTP endpoint from your frontend or any HTTP client:

```bash
POST /nafath/create-request
Content-Type: application/json

{
  "national_id": "1234567890",
  "local": "ar"
  // service is optional - will use default from config if not provided
}
```

**Option 2: Using PHP Code (Optional - Only if you need programmatic access)**

If you need to call from PHP code, you can use Facades. DTOs are optional:

```php
use Nafath\LaravelNafath\Facades\Nafath;
use Nafath\LaravelNafath\DTO\CreateRequestDTO;

// Using DTO (optional)
$dto = CreateRequestDTO::fromArray([
    'national_id' => '1234567890',
    'locale' => 'ar',
]);

$result = Nafath::createRequest($dto);

if ($result->isSuccess()) {
    $transId = $result->data['trans_id'];
    $random = $result->data['random'];
    // Show $random to user
    // Save $transId and $random for status checking
}
```

**Note:** You don't need to use DTOs - HTTP endpoints work directly. DTOs are only needed if you're calling from PHP code and want type safety.

**What to Do:**
- Show the `random` code to the user
- User will enter this code in Nafath mobile app

---

### Step 2: User Action

**What Happens:**
- User opens Nafath mobile app
- User sees the authentication request
- User enters the verification code
- User approves or rejects the request

**Code Needed:** None - handled by Nafath app.

---

### Step 3: Receive Callback (Source of Truth)

**What Happens:**
- Nafath servers call your `/nafath/callback` endpoint automatically
- Callback contains JWT token with decrypted user data
- Package verifies JWT and processes the callback
- Events are fired for you to handle

**Code Example:**
```php
// In EventServiceProvider
use Nafath\LaravelNafath\Events\NafathRequestCompleted;
use Nafath\LaravelNafath\Events\NafathRequestRejected;

protected $listen = [
    NafathRequestCompleted::class => [
        \App\Listeners\HandleNafathSuccess::class,
    ],
];

// In your Listener
namespace App\Listeners;

use Nafath\LaravelNafath\Events\NafathRequestCompleted;

class HandleNafathSuccess
{
    public function handle(NafathRequestCompleted $event): void
    {
        $jwtPayload = $event->jwtPayload;  // Decrypted user data
        
        $nationalId = $jwtPayload['nationalId'] ?? null;
        $fullName = $jwtPayload['fullName'] ?? null;
        
        // Authenticate user, create session, etc.
        $user = User::firstOrCreate(
            ['national_id' => $nationalId],
            ['name' => $fullName]
        );
        
        Auth::login($user);
    }
}
```

**What to Do:**
- Listen to `NafathRequestCompleted` event
- Extract user data from `$event->jwtPayload`
- Authenticate user or update your application

**Why Callback is Source of Truth:**
- ✅ Receives updates immediately
- ✅ Contains verified JWT with user data
- ✅ No polling or delays needed
- ✅ Most reliable method

---

### Step 4: Business Logic

**What Happens:**
- Process the callback data
- Authenticate user in your application
- Update application state
- Redirect user or show success message

**Code Example:**
```php
// In your Listener (from Step 3)
public function handle(NafathRequestCompleted $event): void
{
    $userData = $event->jwtPayload;
    
    // Your business logic here
    $user = User::firstOrCreate(
        ['national_id' => $userData['nationalId']],
        ['name' => $userData['fullName']]
    );
    
    // Generate session/token
    Auth::login($user);
    
    // Redirect or return response
    return redirect('/dashboard');
}
```

---

### Step 5: Optional - Request Info for UI

**What Happens:**
- Use `/nafath/request-info` to get decrypted user data
- Useful for updating UI or as fallback

**When to Use:**
- ✅ Update UI after user approval (if callback didn't trigger UI update)
- ✅ Fallback if callback didn't arrive (network issues, etc.)
- ❌ Don't use as primary source - callback is better

**Code Example:**

**Option 1: Using HTTP Endpoint (Recommended - No DTOs needed)**

```bash
POST /nafath/request-info
Content-Type: application/json

{
  "national_id": "1234567890",
  "trans_id": "uuid",
  "random": "42"
}
```

**Option 2: Using PHP Code (Optional - Only if you need programmatic access)**

```php
use Nafath\LaravelNafath\Facades\Nafath;
use Nafath\LaravelNafath\DTO\RequestInfoDTO;

// Using DTO (optional)
$dto = RequestInfoDTO::fromArray([
    'national_id' => '1234567890',
    'trans_id' => $transId,
    'random' => $random,
]);

$info = Nafath::requestInfo($dto);

if ($info->isSuccess() && isset($info->data['user_data'])) {
    $userData = $info->data['user_data'];
    // Use user data for UI updates
}
```

**Note:** HTTP endpoints work directly - no DTOs needed. DTOs are only for PHP code if you want type safety.

**Important:**
- Updates reflect **approximately 20-30 seconds** after user action
- This is normal behavior from Nafath
- Use callback as primary source, request-info as fallback

---

### Step 6: Check Status (Anytime - Independent)

**What Happens:**
- Check the current status of a request **at any time**
- Verify if request is WAITING, COMPLETED, REJECTED, or EXPIRED
- **Completely independent** - works regardless of callback

**When to Use:**
- ✅ **Check current status** - Verify request state anytime (before/after user action, before/after callback)
- ✅ **UI updates** - Show current status to user in your application
- ✅ **Status verification** - Check if request expired, was rejected, or completed
- ✅ **Independent operation** - No dependency on callback - works standalone

**Code Example:**

**Option 1: Using HTTP Endpoint (Recommended - No DTOs needed)**

```bash
POST /nafath/get-status
Content-Type: application/json

{
  "national_id": "1234567890",
  "trans_id": "uuid-from-step-1",
  "random": "42"
}
```

**Option 2: Using PHP Code (Optional - Only if you need programmatic access)**

```php
use Nafath\LaravelNafath\Facades\Nafath;
use Nafath\LaravelNafath\DTO\GetStatusDTO;

// Using DTO (optional)
$dto = GetStatusDTO::fromArray([
    'national_id' => '1234567890',
    'trans_id' => $transId,  // From Step 1
    'random' => $random,     // From Step 1
]);

$status = Nafath::getStatus($dto);

if ($status->isSuccess()) {
    $currentStatus = $status->data['status'];
    
    switch ($currentStatus) {
        case 'WAITING':
            // User hasn't acted yet - show waiting message
            break;
        case 'COMPLETED':
            // User approved - proceed with authentication
            break;
        case 'REJECTED':
            // User rejected - show error message
            break;
        case 'EXPIRED':
            // Request expired - show expired message
            break;
    }
}
```

**Note:** HTTP endpoints work directly - no DTOs needed. DTOs are only for PHP code if you want type safety.

**Status Values:**
- `WAITING` - User hasn't acted yet
- `COMPLETED` - User approved the request
- `REJECTED` - User rejected the request
- `EXPIRED` - Request expired (timeout)

**Important Notes:**
- ✅ **Completely independent** - Works regardless of callback status
- ✅ **Use anytime** - Before user action, after user action, before callback, after callback
- ✅ **Real-time status** - Get current state of the request
- ✅ **No dependencies** - Standalone operation

**Typical Use Cases:**
1. **Status check** - Verify if request expired or was rejected
2. **UI updates** - Show current status to user (polling or on-demand)
3. **Before processing** - Check status before proceeding with business logic
4. **Independent verification** - Check status without relying on callback

---

## 🎯 Events System

The package fires events when callbacks are received. Listen to these events to handle user actions:

### Available Events

| Event | When Fired | Contains |
|-------|------------|----------|
| `NafathRequestCompleted` | User approves request | `jwtPayload` with user data |
| `NafathRequestRejected` | User rejects request | Request details |
| `NafathRequestExpired` | Request expires | Request details |
| `NafathCallbackReceived` | Any callback received | Full callback data |

### Example: Listen to Completed Requests

```php
// In EventServiceProvider
use Nafath\LaravelNafath\Events\NafathRequestCompleted;

protected $listen = [
    NafathRequestCompleted::class => [
        \App\Listeners\AuthenticateUser::class,
    ],
];

// In your Listener
use Nafath\LaravelNafath\Events\NafathRequestCompleted;

class AuthenticateUser
{
    public function handle(NafathRequestCompleted $event): void
    {
        $userData = $event->jwtPayload;
        
        // Your authentication logic
        $user = User::firstOrCreate(
            ['national_id' => $userData['nationalId']],
            ['name' => $userData['fullName']]
        );
        
        Auth::login($user);
    }
}
```

---

## ⚙️ Configuration

### Essential Settings

Add to your `.env`:

```env
# Required
NAFATH_APP_ID=your_app_id
NAFATH_APP_KEY=your_app_key
NAFATH_MODE=development  # or 'production'

# Optional
NAFATH_DEFAULT_SERVICE=DigitalServiceEnrollmentWithoutBio  # Default service if not provided in request
NAFATH_ROUTES_PREFIX=nafath  # Change endpoint prefix
NAFATH_CALLBACK_ALLOWED_IPS=  # IP whitelist for callbacks
```

**Note:** The `service` field in create-request is optional. If not provided, it uses `NAFATH_DEFAULT_SERVICE` from config (default: `DigitalServiceEnrollmentWithoutBio`).

### API Mode

**Development Mode:**
```env
NAFATH_MODE=development
```
- Uses sandbox endpoints
- Includes testing endpoints
- Safe for development

**Production Mode:**
```env
NAFATH_MODE=production
```
- Uses production endpoints
- No testing endpoints
- Ready for live use

See `config/nafath.php` for all available options.

---

## 🔧 Artisan Commands

```bash
# Test Nafath API connection
php artisan nafath:test

# View request statistics
php artisan nafath:stats --period=30

# Cleanup old requests
php artisan nafath:cleanup --days=30
```

---

## 🧪 Testing

### Test National ID

For development testing, use National ID: `1002133393`

This ID is provided by Elm for testing purposes. Contact [Elm Support](https://elm.sa) to confirm or get other test IDs.

### Simulate User Action

In development mode, use `/nafath/simulate` endpoint to simulate user approval without the real Nafath app.

---

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed installation steps
- [Usage Guide](docs/USAGE.md) - Complete usage examples
- [Events & Listeners](docs/EVENTS.md) - Event handling guide
- [Security Best Practices](docs/SECURITY.md) - Security recommendations
- [API Reference](docs/API.md) - Complete API documentation
- [Package Structure](STRUCTURE.md) - Internal package structure and architecture

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Nafath Official Website](https://nafath.sa)
- [Elm Platform](https://elm.sa)
- [Nafath Developer Portal](https://rabet-nafath.api.elm.sa)

---

## 💬 Support

For support and questions, please open an issue on GitHub.

