# laravel-trustup-io-sign

## Compatibility

| Laravel | Package |
|---|---|
| 8.x / 9.x | 1.x |
| 12.x | 2.x |

## Prerequisite

This package uses `deegitalbe/server-authorization` package to authenticate requests. Refer to its [documentation](https://github.com/deegitalbe/server-authorization) to make sure it's correctly configured on your project.

## Installation

```shell
composer require deegitalbe/laravel-trustup-io-sign
```

## Publish configuration

```shell
php artisan vendor:publish --provider="Deegitalbe\TrustupIoSign\Providers\TrustupIoSignServiceProvider" --tag="config"
```

## 🛠️ config.

Provide all model where you need your relations.

```shell

    "models" => [
        YourModel::class,
    ]
```

## Usage

```shell
    /** getTrustupIoSignUrl(?string $callback = null, ?string $webhook = null): string */
    $yourmodel->getTrustupIoSignUrl();

```

## 🛠️ Default installation BelongsTo relation.

All necessary methods are already defined.
Default model type identifier is set to uuid.

```shell
<?php

namespace App\Models;

use Deegitalbe\TrustupIoSign\Contracts\Models\BelongsToTrustupIoSignedDocumentRelatedModelContract;
use Deegitalbe\TrustupIoSign\Models\DefaultTrustupIoSignedDocumentRelatedModel;

class Ticket implements BelongsToTrustupIoSignedDocumentRelatedModelContract
{
    use BelongsToTrustupIoSignedDocumentRelatedModel;

    public function getTrustupIoSignOriginalPdfUrl(): string
    {
        return 'https://eforms.com/download/2019/08/Service-Contract-Template.pdf';
    }

    public function getTrustupIoSignCallbackUrl(): string
    {
        return 'https://www.google.com';
    }
}
```

## 🛠️ Default installation HasMany relation.

All necessary methods are already defined.
Default model type identifier is set to uuid.

```shell
<?php

namespace App\Models;

use Deegitalbe\TrustupIoSign\Contracts\Models\HasManyTrustupIoSignedDocumentRelatedModelContract;
use Deegitalbe\TrustupIoSign\Models\HasManyTrustupIoSignedDocumentRelatedModel;

class Ticket implements HasManyTrustupIoSignedDocumentRelatedModelContract
{
    use HasManyTrustupIoSignedDocumentRelatedModel;

    protected $casts = [
        "trustup_io_signed_document_uuids" => 'collection'

    ];

    public function getTrustupIoSignOriginalPdfUrl(): string
    {
        return 'https://eforms.com/download/2019/08/Service-Contract-Template.pdf';
    }

    public function getTrustupIoSignCallbackUrl(): string
    {
        return 'https://www.google.com';
    }
}
```

## 🛠️ Common trait.

Both belongsTo and HasMany traits implements IsTrustupIoSignedDocumentRelatedModel.
Feel free to overide it for your use case.

```shell
<?php

namespace Deegitalbe\TrustupIoSign\Models;

use Illuminate\Support\Str;
use Deegitalbe\TrustupIoSign\Services\SignUrlService;
use Deegitalbe\TrustupIoSign\Facades\TrustupIoSignFacade;

trait IsTrustupIoSignedDocumentRelatedModel
{

    protected string $trustupIoSignCallback;
    protected string $trustupIoSignWebhook;

    /**
     * Getting model identifier
     */
    public function getTrustupIoSignModelId(): string
    {
        /** @var Model $this */
        return $this->uuid ??
            $this->id;
    }

    /**
     * Getting model type for media.trustup.io
     */
    public function getTrustupIoSignModelType(): string
    {
        /** @var Model $this */
        return Str::slug(str_replace('\\', '-', $this->getMorphClass()));
    }


    public function getTrustupIoSignAppKey(): string
    {
        return TrustupIoSignFacade::getConfig("app_key");
    }

    public function getTrustupIoSignWebHookUrl(): string
    {
        // use this adress for locale container 'trustup-io-ticketing/webhooks/trustup-io-sign/signed-document/stored'.
        return route("webhooks.trustup-io-sign.signed-document.stored");
    }

    public function getTrustupIoSignUrl(?string $callback = null, ?string $webhook = null): string
    {
        /** @var SignUrlService */
        $signUrlService = app()->make(SignUrlService::class);
        if ($callback) $this->setTrustupIoSignCallback($callback);
        if ($webhook) $this->setTrustupIoSignWebhook($webhook);

        return $signUrlService->generateUrl($this);
    }

    protected function setTrustupIoSignCallback(string $callback): self
    {
        $this->trustupIoSignCallback = $callback;
        return $this;
    }

    protected function setTrustupIoSignWebhook($webhook): self
    {
        $this->trustupIoSignWebhook = $webhook;
        return $this;
    }
}

```

## ⚡⚡ Migration BelongsTo trait.

By default the column is set to trustup_io_signed_document_uuid and type `string` but feel free to overide it.

```shell
<?php

namespace Deegitalbe\TrustupIoSign\Services\Traits;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

trait BelongsToTrustupioSignedDocumentRelatedMigrations
{
    public function addSignedDocumentColumn(string $model, string  $column = 'trustup_io_signed_document_uuid'): void
    {
        Schema::table($model, function (Blueprint $table) use ($column) {
            $table->string($column)->nullable();
        });
    }

    public function removeSignedDocumentColumn(string $table, string  $column = 'trustup_io_signed_document_uuid'): void
    {
        Schema::table($table, function (Blueprint $table) use ($column) {
            $table->dropColumn($column);
        });
    }
}

```

## ⚡⚡ Migration HasMany trait.

By default the column is set to trustup_io_signed_document_uuids and type `json` but feel free to overide it.
Note: Remember to cast as collection in your model !!!

```shell
<?php

namespace Deegitalbe\TrustupIoSign\Services\Traits;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

trait HasManyTrustupioSignedDocumentRelatedMigrations
{
    public function addSignedDocumentColumn(string $model, string  $column = 'trustup_io_signed_document_uuids'): void
    {
        Schema::table($model, function (Blueprint $table) use ($column) {
            $table->json($column)->nullable();
        });
    }

    public function removeSignedDocumentColumn(string $table, string  $column = 'trustup_io_signed_document_uuids'): void
    {
        Schema::table($table, function (Blueprint $table) use ($column) {
            $table->dropColumn($column);
        });
    }
}


```

Webhook data structure

```js

{
 "id": 43,
  "uuid": "6dcc41ca-b3b3-4027-9a52-190c249f0606",
  "ip": "192.168.240.8",
  "timezone": null,
  "latitude": null,
  "longitude": null,
  "modelId": "44b1f149-5dd8-494c-a7ec-52edeb666c18",
  "modelType": "ticket",
  "appKey": "trustup-io-ticketing",
  "documentUuid": "e0f26d6a-206f-4ed1-b244-e41e7a4f33f1",
  "signedAt": "2023-03-16T16:35:17.000000Z",
  "document": {
    "app_key": "trustup-io-sign",
    "collection": "files",
    "conversions": [],
    "custom_properties": {
      "width": null,
      "height": null
    },
    "id": 349,
    "model_id": "6dcc41ca-b3b3-4027-9a52-190c249f0606",
    "model_type": "signeddocument",
    "uuid": "e0f26d6a-206f-4ed1-b244-e41e7a4f33f1",
    "url": "https://media.trustup.io.test/storage/e0f26d6a-206f-4ed1-b244-e41e7a4f33f1/lGlUXJYi.pdf",
    "optimized": {
      "url": "https://media.trustup.io.test/storage/e0f26d6a-206f-4ed1-b244-e41e7a4f33f1/lGlUXJYi.pdf",
      "name": "original",
      "width": null,
      "height": null
    },
    "width": null,
    "height": null,
    "name": "lGlUXJYi.pdf"
  }
}

```
