![alt text](https://cdn.marshmallow-office.com/media/images/logo/marshmallow.transparent.red.png "marshmallow.")

# Marshmallow Products

Deze package gaat alle logica houden voor producten. Producten zullen in het algemeen gebruikt worden in combinatie met de Cart of Ecommerce package.

### Installatie

```
composer require marshmallow/products
```

Voeg de observer toe aan `AppServiceProvider.php`.

```php
public function boot()
{
    ModelObserver::observe();
}
```

```bash
php artisan db:seed --class=Marshmallow\\Priceable\\Database\\Seeds\\VatRatesSeeder
```

## After installation

```bash
php artisan marshmallow:resource Product Product
php artisan marshmallow:resource Supplier Product
php artisan marshmallow:resource ProductCategory Product
php artisan marshmallow:resource Price Priceable
php artisan marshmallow:resource VatRate Priceable
php artisan marshmallow:resource Currency Priceable
```

```
CURRENCY=eur
```

## Extra

factory(Marshmallow\Product\Models\Product::class, 10)->create();

## Hulp

Als de factory niet werkt, zet dan `'strict' => false,` in `config/database.php`.

...
