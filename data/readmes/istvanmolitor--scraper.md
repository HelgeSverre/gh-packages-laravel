# Scraper modul

Weboldalak strukturált bejárása és HTML oldalak letöltése, linkek felderítése, valamint saját PageParser osztályokkal történő feldolgozás.

## Előfeltételek

- Laravel alkalmazás
- Queue használata ajánlott a folyamatos futtatáshoz

## Telepítés

### Provider regisztrálása

config/app.php

```php
'providers' => ServiceProvider::defaultProviders()->merge([
    /*
    * Package Service Providers...
    */
    \Molitor\Scraper\Providers\ProductScraperServiceProvider::class,
])->toArray(),
```

### Seeder regisztrálása (opcionális)

database/seeders/DatabaseSeeder.php
```php
use Molitor\Scraper\database\seeders\ScraperSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ScraperSeeder::class,
        ]);
    }
}
```

## Konfiguráció

A csomag konfigurációját publikálhatod, majd testre szabhatod.

```bash
php artisan vendor:publish --tag=scraper-config
# (Vagy a régi címkével is működik)
php artisan vendor:publish --tag=scraper
```

A publikált konfiguráció: config/scraper.php
```php
return [
    'parsers' => [
        // 'https://www.pelda.hu' => \App\Services\Parsers\PeldaHuParser::class,
    ],
];
```

- A parsers tömbben domainhez rendelhetsz PageParser implementációkat. A kulcs a domain (base URL), az érték a saját parser osztályod FQCN-je.

### Fordítások

A csomag tartalmaz fordításokat (resources/lang). Publikálásuk:
```bash
php artisan vendor:publish --tag=scraper-lang
```

## Admin felület (Filament)

A csomag Filament erőforrásokat biztosít:
- ScraperResource: Scraper-ek kezelése (név, base URL, robots.txt követés, linkkövetés, stb.)
- ScraperUrlResource: Talált URL-ek listája és műveletei

Megjegyzés: A navigáció megjelenítéséhez jogosultság ellenőrzést használ:
```php
Gate::allows('acl', 'scraper')
```
Biztosítsd, hogy a felhasználó megkapja a megfelelő „scraper” jogosultságot.

## CLI parancsok

A következő Artisan parancsok érhetők el:

- Scraper létrehozása interaktív kérdésekkel
```bash
php artisan scraper:create
```

- Következő futtatható scraper linkjeinek letöltése
```bash
php artisan scraper:run
```

- Egy konkrét link letöltése (link vagy ID alapján)
```bash
php artisan scraper:download "https://example.com/oldal"     # link argumentummal
php artisan scraper:download --id=123                         # scraper_urls tábla ID alapján
```

- Scraper információk kiírása
```bash
php artisan scraper:info
```

- Folyamatos munka (worker-szerű futtatás)
```bash
php artisan scraper:work
```

## Folyamatos futtatás (Queue / Job)

A csomag tartalmaz egy ütemezhető jobot:
- Molitor\Scraper\Jobs\ScraperWorker

Használat minta (app/Console/Kernel.php):
```php
protected function schedule(Schedule $schedule): void
{
    // 1 percenként indít egy worker jobot
    $schedule->job(new \Molitor\Scraper\Jobs\ScraperWorker())->everyMinute();
}
```

Javasolt a queue worker futtatása:
```bash
php artisan queue:work
```

## Saját PageParser készítése

Hozz létre egy osztályt, amely a Molitor\Scraper\Services\PageParser absztrakt osztályból származik, és implementáld a következő metódusokat:
- getType(Crawler $crawler): string
- getPriority(Crawler $crawler, string $type): int
- getExpiration(Crawler $crawler, string $type, int $priority): Carbon
- getData(Crawler $crawler, string $type): array

A linkek felderítésére használhatod az alapértelmezett getLinks() metódust. Példa regisztráció a config/scraper.php fájlban:
```php
'parsers' => [
    'https://www.pelda.hu' => \App\Services\Parsers\PeldaHuParser::class,
],
```

## Hasznos szolgáltatások

A Molitor\Scraper\Services\ScraperService számos hasznos metódust kínál többek között:
- createScraper(name, baseUrl, robotsTxt, followLinks, enabled)
- storeLink(link) és storeLinks(links, parent, type, priority)
- downloadScraperUrl($scraperUrl) és downloadHtmlPage($scraperUrl)
- getPageParserByDomain($domain) és kapcsolódó lekérdezések

Ezeket igény szerint közvetlenül is használhatod a saját kódodból (app() konténeren keresztül).

## Útvonalak

A csomag saját útvonalakat is betölt (routes/web.php). Bizonyos export vagy admin funkciók ezen keresztül érhetőek el.

## Migrációk

A csomag automatikusan betölti a saját migrációit. A táblák létrejönnek a szolgáltató regisztrálása után és a szokásos migráció futtatásával:
```bash
php artisan migrate
```

## Hibakeresés tippek

- Ellenőrizd, hogy a domain-hez tartozik-e PageParser a konfigban, ha speciális feldolgozásra van szükség.
- A robots.txt és linkkövetés beállításai a Scraper rekordban állíthatók.
- Nagy mennyiségű link esetén állítsd be a chunk_size mezőt és futtasd queue workert.

## Licenc

Belső modul. Használat a projekt irányelvei szerint.
