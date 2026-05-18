# GhostCompiler GhostGrid

Version: `1.0.0`

GhostGrid is a Laravel backend package for tenant-based reseller commerce. It gives your app accounts, account hierarchy, providers, product variants, pricelists, storefront products, order snapshots, provisioning tasks, and services.

It is not an admin panel. You build your own panel, API, checkout, billing area, or storefront on top of the package.

Supports Laravel `10`, `11`, `12`, and `13`. Laravel `13` is tested on PHP `8.3+`.

## Install

```bash
composer require ghostcompiler/ghostgrid
php artisan gg:init
php artisan migrate
```

Manual publish:

```bash
php artisan vendor:publish --tag=ghostgrid-config
php artisan vendor:publish --tag=ghostgrid-migrations
```

## Setup User Model

Add the trait to `app/Models/User.php`:

```php
use GhostCompiler\GhostGrid\Support\Concerns\HasGhostGrid;

class User extends Authenticatable
{
    use HasGhostGrid;
}
```

Now your controllers can use the short helper:

```php
$priceLists = ghostgrid()->priceLists();
$active = ghostgrid()->activePriceList();
$products = ghostgrid()->visibleStorefrontProducts();
```

In a job, seeder, or test where there is no logged-in user, pass the user:

```php
$priceLists = ghostgrid($user)->priceLists();
```

You can also use the facade:

```php
use GhostCompiler\GhostGrid\Facades\GhostGrid;

$grid = GhostGrid::forUser(auth()->user());
```

## Mental Model

Your Laravel `users` table handles login. GhostGrid `accounts` are commerce identities.

```text
Laravel User
  -> account_users
      -> GhostGrid Account
          -> Price Lists
          -> Storefront Products
          -> Orders
          -> Services
```

So `account_id` means `accounts.id`, not `users.id`.

The helper hides this most of the time:

```php
$account = ghostgrid()->account();
$accounts = ghostgrid()->accounts();
```

## Quick Start

Create the seller account:

```php
$account = ghostgrid()->createAccount([
    'name' => 'Acme Hosting',
    'type' => 'reseller',
]);
```

Create a provider record:

```php
$provider = ghostgrid()->createProvider('hetzner', 'Hetzner');
```

Create a backend product, variant, and provider SKU mapping:

```php
[$product, $variant] = ghostgrid()->createProduct(
    product: [
        'name' => 'Cloud VPS',
        'slug' => 'cloud-vps',
        'type' => 'vps',
    ],
    variant: [
        'name' => 'Hetzner CX32',
        'slug' => 'cx32',
        'billing_cycle' => 'monthly',
        'specs' => ['ram' => '4 GB', 'disk' => '80 GB SSD'],
    ],
    provider: $provider,
    mapping: [
        'provider_sku' => 'cx32',
        'priority' => 100,
        'config' => ['region' => 'fsn1'],
    ],
);
```

Create and assign a pricelist:

```php
$priceList = ghostgrid()->createPriceList('Default VPS Pricing', [
    [
        'product_variant_id' => $variant->id,
        'billing_cycle' => 'monthly',
        'selling_price' => 1499,
        'setup_fee' => 0,
    ],
]);
```

Create a frontend/storefront product:

```php
$storefrontProduct = ghostgrid()->createStorefrontProduct([
    'product_variant_id' => $variant->id,
    'price_list_id' => $priceList->id,
    'name' => 'Premium VPS 4GB',
    'slug' => 'premium-vps-4gb',
    'description' => 'Fast cloud server for growing sites',
    'actual_price' => 2000,
    'price' => 1499,
    'popular' => true,
    'visible' => true,
    'featured' => true,
    'features' => [
        ['label' => '4 GB RAM', 'icon' => 'server'],
        ['label' => '80 GB SSD', 'icon' => 'hard-drive'],
        ['label' => 'Free Setup', 'icon' => null],
    ],
]);
```

Show products on your frontend:

```php
$products = ghostgrid()->visibleStorefrontProducts();
```

## Pricelists

Most apps only need these methods:

```php
// All pricelists owned by accounts linked to the current user.
$priceLists = ghostgrid()->priceLists();

// Active/default assigned pricelist for the current account.
$active = ghostgrid()->activePriceList();

// Pricelists that have an assignment.
$assigned = ghostgrid()->assignedPriceLists();

// Draft pricelists with no assignment.
$drafts = ghostgrid()->unassignedPriceLists();

// Find by ID or name, scoped to the current user.
$priceList = ghostgrid()->priceList('Default VPS Pricing');
```

Create a draft pricelist without assigning it:

```php
$draft = ghostgrid()->createUnassignedPriceList('Draft Sale Pricing', [
    [
        'product_variant_id' => $variant->id,
        'billing_cycle' => 'monthly',
        'selling_price' => 1299,
    ],
]);
```

This is the same as:

```php
$draft = ghostgrid()->createPriceList(
    name: 'Draft Sale Pricing',
    items: [
        [
            'product_variant_id' => $variant->id,
            'billing_cycle' => 'monthly',
            'selling_price' => 1299,
        ],
    ],
    assign: false,
);
```

Assign an existing pricelist later:

```php
$assignment = ghostgrid()->assignPriceList($draft);
```

Assign it to a specific linked account:

```php
$assignment = ghostgrid()->assignPriceList(
    priceList: $draft,
    account: $clientAccount,
);
```

Assign with a date window:

```php
$assignment = ghostgrid()->assignPriceList(
    priceList: $draft,
    account: $clientAccount,
    isDefault: true,
    startsAt: '2026-06-01 00:00:00',
    endsAt: '2026-06-30 23:59:59',
);
```

## Master Pricelist Sharing

GhostGrid supports a master pricelist that acts as the source of products a tenant may sell.

When a tenant creates a pricelist from a master:

- products with tenant price overrides become active
- products without tenant prices are copied as inactive
- inactive state is stored on `price_list_items.enabled`
- this is not a storefront visibility feature

```php
$tenantPriceList = ghostgrid()->createPriceListFromParent(
    parent: $masterPriceList,
    name: 'Tenant VPS Pricing',
    itemOverrides: [
        $variant->id => [
            'selling_price' => 1499,
            'enabled' => true,
        ],
    ],
);
```

If a master product has no tenant price, GhostGrid creates it like this:

```php
[
    'product_variant_id' => $variant->id,
    'selling_price' => '1000.00',
    'enabled' => false,
    'metadata' => [
        'inherited_from_parent' => true,
        'tenant_price_set' => false,
    ],
]
```

When the master pricelist gets new products, sync missing items into the tenant pricelist as inactive rows:

```php
$createdInactiveItems = ghostgrid()->syncPriceListWithParent($tenantPriceList);
```

## Pricing Rules

By default:

- a child price cannot go below the parent `selling_price`
- if parent `min_selling_price` exists, that value becomes the minimum
- disabled parent products cannot be sold by child pricelists
- archived pricelists do not resolve as active pricelists
- helper methods only mutate records owned by accounts linked to the current user

Allow selling below the parent:

```php
'allow_selling_below_parent' => true,
```

## Storefront Products

Backend variants are the real sellable products. Storefront products are frontend display records.

Example:

```text
Backend variant: Hetzner CX32
Storefront product: Premium VPS 4GB
```

Create:

```php
$storefrontProduct = ghostgrid()->createStorefrontProduct([
    'product_variant_id' => $variant->id,
    'price_list_id' => $priceList->id,
    'name' => 'Premium VPS 4GB',
    'slug' => 'premium-vps-4gb',
    'description' => 'Fast cloud server for growing sites',
    'actual_price' => 2000,
    'price' => 1499,
    'popular' => true,
    'features' => [
        ['label' => '4 GB RAM', 'icon' => 'server'],
        ['label' => 'Free Setup', 'icon' => null],
    ],
]);
```

Read visible products:

```php
$products = ghostgrid()->visibleStorefrontProducts();
```

Hide:

```php
ghostgrid()->hideStorefrontProduct($storefrontProduct);
```

## Orders

Use `CreateOrderFromCart` after the account has an active assigned pricelist.

```php
use GhostCompiler\GhostGrid\Actions\CreateOrderFromCart;

$order = app(CreateOrderFromCart::class)->handle(
    accountId: ghostgrid()->account()->id,
    cartItems: [
        [
            'product_variant_id' => $variant->id,
            'billing_cycle' => 'monthly',
            'quantity' => 1,
        ],
    ],
);
```

GhostGrid snapshots at order time:

- product name
- variant name
- unit price
- setup fee
- provider ID
- provider SKU
- provider mapping config

## Payment To Provisioning

After payment succeeds:

```php
$paidOrder = ghostgrid()->markOrderPaid(
    order: $order,
    createProvisioningTasks: true,
    dispatch: true,
);
```

Create tasks without dispatching:

```php
$tasks = ghostgrid()->createProvisioningTasksForOrder(
    order: $order,
    dispatch: false,
);
```

Provisioning task creation is idempotent per order item, provider, and action. If your webhook runs twice, duplicate create-tasks are not created.

## Provider Adapters

Generate an adapter:

```bash
php artisan gg:vendor Hetzner
```

Register it:

```php
'provider_registry' => [
    'hetzner' => App\GhostGrid\Providers\HetznerProvider::class,
],
```

Adapters implement:

```php
use GhostCompiler\GhostGrid\DTO\ProvisioningResult;

interface ProvisioningProvider
{
    public function code(): string;
    public function name(): string;
    public function capabilities(): array;
    public function supports(string $action): bool;
    public function execute(string $action, array $payload): ProvisioningResult;
}
```

Dynamic actions can be anything your adapter supports:

```php
create
suspend
unsuspend
terminate
renew
reboot
shutdown
power_on
reinstall
reset_password
upgrade
downgrade
sync_products
```

Execute manually:

```php
use GhostCompiler\GhostGrid\Services\ProvisioningManager;

$result = app(ProvisioningManager::class)->execute(
    providerCode: 'hetzner',
    action: 'reboot',
    payload: ['remote_id' => 'server-123'],
);
```

## Services

Provisioning `create` success creates or updates a `services` record.

Service lifecycle helpers create provider action tasks:

```php
ghostgrid()->suspendService($service, dispatch: true);
ghostgrid()->unsuspendService($service, dispatch: true);
ghostgrid()->renewService($service, dispatch: true);
ghostgrid()->terminateService($service, dispatch: true);
```

## Update, Archive, Delete

Most helper methods accept a model instance or ID.

```php
ghostgrid()->updateAccount($account, ['name' => 'Updated Hosting']);
ghostgrid()->archiveAccount($account);
ghostgrid()->deleteAccount($account);

ghostgrid()->updatePriceList($priceList, ['name' => 'Published Pricing']);
ghostgrid()->archivePriceList($priceList);
ghostgrid()->deletePriceList($priceList);

ghostgrid()->addPriceListItem($priceList, [
    'product_variant_id' => $variant->id,
    'billing_cycle' => 'monthly',
    'selling_price' => 1600,
]);
ghostgrid()->updatePriceListItem($item, ['selling_price' => 1700]);
ghostgrid()->disablePriceListItem($item);
ghostgrid()->deletePriceListItem($item);

ghostgrid()->hideStorefrontProduct($storefrontProduct);
ghostgrid()->deleteStorefrontProduct($storefrontProduct);
```

Because GhostGrid does not use database foreign key constraints, your app decides whether hard delete is allowed. For production commerce flows, prefer archive/disable helpers for live records.

## ID Strategy

Default ID strategy is UUID.

Set before running migrations:

```env
GHOSTGRID_ID_STRATEGY=uuid
# uuid, ulid, bigint
```

Rules:

- `uuid`: string UUID primary keys
- `ulid`: string ULID primary keys
- `bigint`: auto-incrementing big integer primary keys
- relationship columns follow the same strategy
- relationship columns are indexed

## No Foreign Key Constraints

GhostGrid intentionally avoids database foreign key constraints.

Migrations use indexed relationship columns, but never:

```php
foreign()
constrained()
references()
cascadeOnDelete()
nullOnDelete()
```

This gives reseller systems more flexibility for imports, provider sync, account movement, and recovery. Your app should enforce deletion rules at the application layer.

## Config

Published config:

```php
return [
    'id_strategy' => env('GHOSTGRID_ID_STRATEGY', 'uuid'),
    'default_currency' => env('GHOSTGRID_DEFAULT_CURRENCY', 'USD'),
    'allow_selling_below_parent' => env('GHOSTGRID_ALLOW_SELLING_BELOW_PARENT', false),
    'queue_connection' => env('GHOSTGRID_QUEUE_CONNECTION', env('QUEUE_CONNECTION', 'sync')),
    'provider_registry' => [],
    'model_overrides' => [],
    'storefront' => [
        'default_visible' => true,
        'default_featured' => false,
    ],
    'enabled_modules' => [
        'accounts' => true,
        'providers' => true,
        'pricing' => true,
        'storefront' => true,
        'orders' => true,
        'provisioning' => true,
        'services' => true,
    ],
];
```

Internal constants such as order statuses, provisioning statuses, service statuses, and default provisioning actions live in PHP classes, not public config.

## Commands

```bash
php artisan gg:init
php artisan gg:vendor Hetzner
php artisan gg:sync hetzner
php artisan gg:demo
php artisan gg:check
```

## Factories

GhostGrid ships factories for tests and seeders:

```php
use GhostCompiler\GhostGrid\Models\Account;
use GhostCompiler\GhostGrid\Models\Product;
use GhostCompiler\GhostGrid\Models\ProductVariant;
use GhostCompiler\GhostGrid\Models\PriceList;
use GhostCompiler\GhostGrid\Models\StorefrontProduct;

$account = Account::factory()->create();
$product = Product::factory()->create();
$variant = ProductVariant::factory()->create(['product_id' => $product->id]);
$priceList = PriceList::factory()->create(['account_id' => $account->id]);
$storefront = StorefrontProduct::factory()->create([
    'account_id' => $account->id,
    'product_variant_id' => $variant->id,
]);
```

## Advanced Raw Model API

Helpers are recommended for tenant-aware app code. Raw Eloquent models are available for seeders, internal admin tools, or custom workflows.

```php
use GhostCompiler\GhostGrid\Models\Account;
use GhostCompiler\GhostGrid\Models\PriceList;

$account = Account::create(['name' => 'Acme Hosting']);

$priceList = PriceList::create([
    'account_id' => $account->id,
    'name' => 'Default Pricing',
    'currency' => 'USD',
]);

$priceList->items()->create([
    'product_variant_id' => $variant->id,
    'billing_cycle' => 'monthly',
    'selling_price' => 1499,
]);
```

## Helper API Cheatsheet

```php
$grid = ghostgrid();

$grid->createAccount([...]);
$grid->account();
$grid->accounts();
$grid->createChildAccount([...]);
$grid->updateAccount($account, [...]);
$grid->deleteAccount($account);
$grid->archiveAccount($account);

$grid->createProvider('hetzner', 'Hetzner');
$grid->updateProvider($provider, [...]);
$grid->deleteProvider($provider);
$grid->disableProvider($provider);

$grid->createProduct($product, $variant, $provider, $mapping);
$grid->updateProduct($product, [...]);
$grid->deleteProduct($product);
$grid->archiveProduct($product);
$grid->updateProductVariant($variant, [...]);
$grid->deleteProductVariant($variant);
$grid->archiveProductVariant($variant);
$grid->updateProviderMapping($mapping, [...]);
$grid->deleteProviderMapping($mapping);
$grid->disableProviderMapping($mapping);

$grid->priceLists();
$grid->activePriceList();
$grid->assignedPriceLists();
$grid->unassignedPriceLists();
$grid->priceList($idOrName);
$grid->createPriceList('Default', $items);
$grid->createPriceList('Draft', $items, assign: false);
$grid->createUnassignedPriceList('Draft', $items);
$grid->createPriceListFromParent($masterPriceList, 'Tenant Pricing', $overrides);
$grid->syncPriceListWithParent($tenantPriceList);
$grid->assignPriceList($priceList);
$grid->updatePriceList($priceList, [...]);
$grid->deletePriceList($priceList);
$grid->archivePriceList($priceList);
$grid->addPriceListItem($priceList, [...]);
$grid->updatePriceListItem($item, [...]);
$grid->deletePriceListItem($item);
$grid->disablePriceListItem($item);

$grid->createStorefrontProduct([...]);
$grid->visibleStorefrontProducts();
$grid->updateStorefrontProduct($storefrontProduct, [...]);
$grid->deleteStorefrontProduct($storefrontProduct);
$grid->hideStorefrontProduct($storefrontProduct);

$grid->markOrderPaid($order, createProvisioningTasks: true, dispatch: true);
$grid->createProvisioningTasksForOrder($order);
$grid->suspendService($service);
$grid->unsuspendService($service);
$grid->renewService($service);
$grid->terminateService($service);
```

## Docs Website

Open the static docs:

```text
docs/index.html
docs/docs.html
```

GitHub Pages:

```text
https://ghostcompiler.github.io/ghostgrid/
```

## Testing

```bash
composer validate --strict
composer test
```

The repository includes GitHub Actions coverage for Laravel `10`, `11`, `12`, and `13`.

## Security Notes

- Helper methods are tenant-aware and only mutate records owned by accounts linked to the current user.
- Raw models/actions are intentionally available for advanced/internal app code, so protect them with your own policies/controllers.
- Provider credentials should be stored encrypted by your Laravel app.
- Keep provider adapter payloads minimal and avoid logging secrets.

## Roadmap

- More optional helper methods for checkout flows
- More first-party provider examples
- More docs recipes for billing portals and reseller dashboards
- Additional test coverage for custom model overrides
