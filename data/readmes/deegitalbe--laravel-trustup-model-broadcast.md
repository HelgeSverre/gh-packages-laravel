# laravel-trustup-model-broadcast

## Compatibility

| Laravel | Package |
|---|---|
| 8.x / 9.x | 1.x |
| 12.x | 2.x |

This package is used to dispatch configured models ***created, updated or deleted*** events to our websocket microservice.

## Installation

### Configure websocket package

Make sure you configured [websocket package](https://github.com/deegitalbe/laravel-trustup-io-websocket#env-configuration) first

### Install package using composer

```shell
composer require deegitalbe/laravel-trustup-model-broadcast
```

### .env configuration

Add these information to your `.env` file.
```dotenv
TRUSTUP_MODEL_BROADCAST_APP_KEY=
```

## Usage

### Configure your model

```php
use Illuminate\Database\Eloquent\Model;
use Deegitalbe\LaravelTrustupModelBroadcast\Traits\Models\IsTrustupBroadcastModel;
use Deegitalbe\LaravelTrustupModelBroadcast\Contracts\Models\TrustupBroadcastModelContract;

class YourModel extends Model implements TrustupBroadcastModelContract
{
    use IsTrustupBroadcastModel;

    /**
     * Getting attributes sent along when broadcasing events.
     
     * @param string $eventName Laravel model event that should be broadcasted (created, updated, deleted, ...)
     * @return array<string, mixed>
     */
    public function getTrustupModelBroadcastEventAttributes(string $eventName): array
    {
        return [
            // Your attributes ...
        ];
    }
}
```

Keep in mind your event ***won't broadcast*** if your model is unable to provide ***professional authorization key***.

### Customization

#### Professional authorization key

By default this package use model attribute `professional_authorization_key`. To customize this behavior, just override trait method.

```php
    /**
     * Getting model key used when broadcasting model events.
     * 
     * By default if null, event would not broadcast.
     * 
     * @return ?string
     */
    public function getTrustupModelBroadcastProfessionalAuthorizationKey(): ?string
    {
        return "your-value";
    }
```

