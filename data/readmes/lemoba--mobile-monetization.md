# Mobile Monetization for Laravel

Laravel 扩展包，用于移动端短剧/内容应用常见的后端验证能力：

- iOS Sign in with Apple 登录 token 验证
- Android Google 登录 ID token 验证
- iOS App Store / Android Google Play 内购验证
- Unity LevelPlay 激励广告 S2S 回调验签
- Firebase Cloud Messaging iOS / Android 消息推送

本包只做「可信验证、签名校验、接口封装、结果归一化、推送发送」，不创建数据表，不写数据库，不给用户加金币，不开通 VIP，不解锁视频。订单幂等、金币流水、会员权益、短剧解锁、推送 token 保存等业务逻辑全部由调用方完成。

## 安装

本地 path 仓库示例：

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../package/mobile-monetization"
    }
  ],
  "require": {
    "lemoba/mobile-monetization": "*"
  }
}
```

发布配置：

```bash
php artisan vendor:publish --tag=mobile-monetization-config
```

## 环境变量

```env
MOBILE_MONETIZATION_CACHE_STORE=redis
MOBILE_MONETIZATION_CACHE_PREFIX=mobile_monetization
MOBILE_MONETIZATION_JWKS_TTL=3600
MOBILE_MONETIZATION_OAUTH_TOKEN_TTL=3300

APPLE_BUNDLE_ID=com.example.app
APPLE_TEAM_ID=YOUR_APPLE_TEAM_ID
APPLE_ISSUER_ID=YOUR_APP_STORE_CONNECT_ISSUER_ID
APPLE_CLIENT_ID=com.example.app
APPLE_KEY_ID=ABC123DEFG
APPLE_PRIVATE_KEY_PATH=/secure/AuthKey_ABC123DEFG.p8
APPLE_IAP_ENVIRONMENT=production

GOOGLE_ANDROID_CLIENT_IDS=android-oauth-client-id.apps.googleusercontent.com
GOOGLE_PLAY_PACKAGE_NAME=com.example.app
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_PATH=/secure/google-play-service-account.json

MOBILE_COIN_PRODUCT_IDS=coins_60,coins_300,coins_980
MOBILE_VIP_WEEK_PRODUCT_ID=vip_week
MOBILE_VIP_MONTH_PRODUCT_ID=vip_month
MOBILE_VIP_YEAR_PRODUCT_ID=vip_year

LEVELPLAY_SECRET=your_levelplay_secret

FCM_ANDROID_PROJECT_ID=android-firebase-project-id
FCM_ANDROID_SERVICE_ACCOUNT_JSON_PATH=/secure/firebase-android-service-account.json
FCM_IOS_PROJECT_ID=ios-firebase-project-id
FCM_IOS_SERVICE_ACCOUNT_JSON_PATH=/secure/firebase-ios-service-account.json
FCM_DEFAULT_PLATFORM=android
FCM_TIMEOUT=15
```

配置文件会按职责发布到主项目：

```text
config/mobile-monetization.php  # Redis cache store、cache key 前缀、TTL
config/mobile-auth.php          # Apple / Google 登录
config/mobile-payments.php      # App Store / Google Play 支付
config/mobile-ads.php           # LevelPlay 广告
config/mobile-push.php          # FCM 推送，Android/iOS 两套 Firebase 文件
```

## 路由

本包不注册任何默认路由，由调用方在主项目中自行定义路由和控制器。示例：

```php
use Illuminate\Support\Facades\Route;
use Lemoba\MobileMonetization\Facades\MobileMonetization;

Route::post('/auth/apple', function () {
    $data = request()->validate([
        'identity_token' => ['required', 'string'],
        'nonce' => ['nullable', 'string'],
    ]);

    return MobileMonetization::verifyAppleIdentityToken(
        $data['identity_token'],
        $data['nonce'] ?? null
    );
});
```

## 缓存

JWKS、公钥集合、Google Play OAuth token、App Store Server API bearer token、FCM OAuth token 都会走 Laravel Cache，并默认使用 Redis：

```php
// config/mobile-monetization.php
'cache' => [
    'store' => env('MOBILE_MONETIZATION_CACHE_STORE', 'redis'),
    'key_prefix' => env('MOBILE_MONETIZATION_CACHE_PREFIX', 'mobile_monetization'),
    'jwks_ttl' => 3600,
    'oauth_token_ttl' => 3300,
],
```

调用方可以改 `store` 使用任意 Laravel cache store，但生产环境建议 Redis。

## 登录验证

Apple：

```php
use Lemoba\MobileMonetization\Facades\MobileMonetization;

$identity = MobileMonetization::verifyAppleIdentityToken($identityToken, $nonce);
```

Google：

```php
use Lemoba\MobileMonetization\Facades\MobileMonetization;

$identity = MobileMonetization::verifyGoogleIdToken($idToken, $nonce);
```

返回字段包含：

```php
[
    'provider' => 'apple',
    'provider_user_id' => '...',
    'email' => '...',
    'email_verified' => true,
    'claims' => [],
]
```

调用方应该用 `provider + provider_user_id` 去绑定或创建自己的用户。

`provider_user_id` 来自 Apple / Google ID token 的 `sub` 字段。本包会强制校验 `sub`，如果 token 中没有 `sub` 会直接抛出异常，不会返回空的 `provider_user_id`。

## 支付验证

iOS App Store：

```php
use Lemoba\MobileMonetization\Facades\MobileMonetization;

$purchase = MobileMonetization::verifyAppleTransactionId($transactionId);

// 或者客户端已拿到 signedTransactionInfo:
$purchase = MobileMonetization::verifyAppleSignedTransaction($signedTransactionInfo);
```

Android Google Play 一次性消耗商品：

```php
use Lemoba\MobileMonetization\Facades\MobileMonetization;

$purchase = MobileMonetization::verifyGoogleProduct($productId, $purchaseToken);

if ($purchase->valid) {
    // 调用方先按 transaction_id 做唯一幂等，再发金币。
    MobileMonetization::acknowledgeGoogleProduct($productId, $purchaseToken);
    MobileMonetization::consumeGoogleProduct($productId, $purchaseToken);
}
```

Android Google Play VIP 周/月/年订阅：

```php
$purchase = MobileMonetization::verifyGoogleSubscription($productId, $purchaseToken);

if ($purchase->active()) {
    // 调用方按 original_transaction_id 或 transaction_id 更新自己的会员到期时间。
}
```

统一返回对象：

```php
$purchase->toArray();
```

关键字段：

```php
[
    'platform' => 'ios|android',
    'product_id' => 'coins_60',
    'transaction_id' => '...',
    'original_transaction_id' => '...',
    'type' => 'consumable|subscription',
    'valid' => true,
    'active' => true,
    'consumable' => true,
    'purchased_at_ms' => 1710000000000,
    'expires_at_ms' => null,
    'raw' => [],
]
```

建议调用方业务处理：

```php
if ($purchase->valid && $purchase->consumable) {
    // 1. 用 transaction_id 建唯一索引或幂等锁。
    // 2. 根据 product_id 查自己的金币配置。
    // 3. 写订单、写金币流水、增加余额。
}

if ($purchase->active() && $purchase->type === 'subscription') {
    // 1. 用 original_transaction_id 关联订阅。
    // 2. 用 expires_at_ms 更新 VIP 到期时间。
}
```

## LevelPlay 激励广告

在 LevelPlay 后台配置 S2S Rewarded Video Callback URL：

```text
https://your-domain.com/your-levelplay-callback
```

本包不提供默认 HTTP 控制器，也不注册默认路由。调用方需要在主项目中自行创建回调入口，调用本包完成验签，并保存 `event_id` 做唯一幂等。

业务控制器示例：

```php
use Illuminate\Http\Request;
use Lemoba\MobileMonetization\Facades\MobileMonetization;

public function reward(Request $request)
{
    $reward = MobileMonetization::verifyLevelPlayRewardCallback($request);

    // 调用方业务逻辑：
    // 1. 用 event_id 做唯一幂等，event_id 对应 LevelPlay eventId。
    // 2. 用 user_id/app_user_id 或 dynamic_user_id 映射自己的用户。
    // 3. 用 order_id 关联前端传入的自定义订单号（如果配置了 customParameters）。
    // 4. 根据 reward_amount 或自己的广告奖励配置给金币。
    // 5. 写金币流水、余额变化、任务记录等。

    return response(MobileMonetization::levelPlayOkResponse($reward['event_id']), 200)
        ->header('Content-Type', 'text/plain');
}
```

本地测试如果不方便生成 LevelPlay 签名，可以传入第二个参数 `true` 开启 dev 模式，跳过 `LEVELPLAY_SECRET` 和 `signature` 校验：

```php
$reward = MobileMonetization::verifyLevelPlayRewardCallback($request, dev: true);
```

`verifyRewardCallback()` 返回：

```php
[
    'event_id' => '...',
    'user_id' => '...',
    'app_user_id' => '...',
    'dynamic_user_id' => '...',
    'reward_item' => 'coins',
    'reward_amount' => 10,
    'rewards' => '10',
    'country' => 'SG',
    'publisher_sub_id' => '0',
    'custom_parameters' => [
        'order_id' => 'ORD-20260429-001',
    ],
    'order_id' => 'ORD-20260429-001',
    'ad_unit' => '...',
    'placement' => '...',
    'network' => '...',
    'timestamp' => 1710000000,
    'raw' => [],
]
```

## Firebase Cloud Messaging 推送

由于 Android 和 iOS 不在同一个 Firebase 后台，本包在 `config/mobile-push.php` 中分别配置两套 service account：

```php
'fcm' => [
    'android' => [
        'project_id' => env('FCM_ANDROID_PROJECT_ID'),
        'service_account_json_path' => env('FCM_ANDROID_SERVICE_ACCOUNT_JSON_PATH'),
    ],
    'ios' => [
        'project_id' => env('FCM_IOS_PROJECT_ID'),
        'service_account_json_path' => env('FCM_IOS_SERVICE_ACCOUNT_JSON_PATH'),
    ],
],
```

发送到单个设备 token：

```php
use Lemoba\MobileMonetization\Facades\MobileMonetization;

$message = MobileMonetization::sendFcmToToken(
    platform: 'ios',
    token: $deviceToken,
    title: 'VIP 到期提醒',
    body: '你的会员即将到期',
    data: [
        'type' => 'vip_expiring',
        'user_id' => (string) $userId,
    ],
    options: [
        'apns' => [
            'payload' => [
                'aps' => [
                    'sound' => 'default',
                ],
            ],
        ],
    ]
);

$message->toArray();
```

发送到 Android：

```php
$message = MobileMonetization::sendFcmToToken(
    platform: 'android',
    token: $deviceToken,
    title: '金币到账',
    body: '看广告奖励已发放',
    data: [
        'type' => 'coins_granted',
        'amount' => '10',
    ],
    options: [
        'android' => [
            'priority' => 'HIGH',
        ],
    ]
);
```

发送到 topic：

```php
$message = MobileMonetization::sendFcmToTopic(
    platform: 'android',
    topic: 'vip_users',
    title: '新剧上线',
    body: '会员可抢先观看'
);
```

`data` 会统一转成字符串值，符合 FCM HTTP v1 对 data payload 的要求。FCM OAuth token 会按平台和 service account 缓存在 Redis 中。

## 数据库说明

本包没有迁移文件，也不会调用 `DB`、Model 或 Schema。推荐调用方自行维护这些业务表或存储：

- 用户第三方登录绑定表
- 充值订单表
- 内购交易幂等表
- 金币钱包表
- 金币流水表
- VIP 订阅表
- LevelPlay 广告事件表
- 短剧视频解锁表
- 设备推送 token 表
