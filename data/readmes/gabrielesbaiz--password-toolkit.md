# 🔐 PasswordToolkit

[![Latest Version on Packagist](https://img.shields.io/packagist/v/gabrielesbaiz/password-toolkit.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/password-toolkit)
[![Total Downloads](https://img.shields.io/packagist/dt/gabrielesbaiz/password-toolkit.svg?style=flat-square)](https://packagist.org/packages/gabrielesbaiz/password-toolkit)
[![License](https://img.shields.io/packagist/l/gabrielesbaiz/password-toolkit.svg?style=flat-square)](LICENSE.md)
[![PHP Version](https://img.shields.io/packagist/php-v/gabrielesbaiz/password-toolkit.svg?style=flat-square)](composer.json)

> Generate **memorable, human-friendly passwords** with style — `Goldrake-Mitico-4271`, `Ferrari-Veloce-9912`, `Cannolo-Goloso-3301`. No more `xK#9$!qZ`.

`PasswordToolkit` is a tiny, zero-dependency-friendly Laravel package that crafts passwords by mashing up curated **names** (Disney, Star Wars, Harry Potter, Studio Ghibli, Italian chefs, philosophers, Formula 1 drivers, Pixar, Game of Thrones, gelato flavors, pasta shapes…) with **gender-aware Italian adjectives**, optional **digits**, and even **leetspeak**. Easy to remember. Fun to use. Battle-tested in real apps.

---

## ✨ Features

- 🎭 **91 curated dictionaries** (49 People + 42 Things) — pop-culture icons, Italian legends, foods, wines, cars and more
- 🧠 **Gender-aware adjectives** — agreement is correct (Italian/multilingual safe)
- 🔢 **Optional digits** at start, middle or end with configurable length
- 🤖 **Leetspeak modes** — `none`, `basic`, `advanced` (`901d24k3-M171c0-4271`)
- 🎚️ **Pick & mix categories** — toggle each dictionary on/off via config
- 🪄 **Laravel-native** — facade, service provider, auto-discovery
- 🪶 **Lightweight** — pure PHP, only Spatie package-tools as runtime dep
- ✅ **Pest 3 test suite**, Laravel **10/11/12** compatible

---

## 📦 Installation

```bash
composer require gabrielesbaiz/password-toolkit
```

Publish the config:

```bash
php artisan vendor:publish --tag="password-toolkit-config"
```

---

## 🚀 Quick start

```php
use Gabrielesbaiz\PasswordToolkit\Facades\PasswordToolkit;

PasswordToolkit::generate();
// => "Goldrake-Mitico-4271"
```

Or instantiate directly:

```php
use Gabrielesbaiz\PasswordToolkit\PasswordToolkit;

echo PasswordToolkit::generate();
```

### Batch generation

```php
PasswordToolkit::generate(10);
// => ["Goldrake-Mitico-4271", "Vespa-Veloce-9921", ...] (array of 10)

PasswordToolkit::generateManyWithReport(5);
// => [['password' => '...', 'report' => StrengthReport], ...]
```

`generate(1)` (default) returns a string. `generate(N)` with `N > 1` returns an array.

### Sample output

All rows below show the same picked name (`Goldrake`) + adjective (`Mitico`) + number (`4271`), so you can compare exactly what each option changes.

| Config | Example |
|---|---|
| defaults | `Goldrake-Mitico-4271` |
| `separator_symbol => '_'` | `Goldrake_Mitico_4271` |
| `numbers_position => 'start'` | `4271-Goldrake-Mitico` |
| `numbers_position => 'middle'` | `Goldrake-4271-Mitico` |
| `leetspeak_conversion => 'basic'` | `901d24k3-M171c0-4271` |
| `leetspeak_conversion => 'advanced'` | `901d24\|<3-\|V\|171<0-4271` |
| `add_numbers => false` | `Goldrake-Mitico` |

---

## 📚 Built-in dictionaries

<details>
<summary><b>👤 People (49)</b></summary>

| Dictionary | Example |
|---|---|
| `back_to_the_future` | Marty McFly |
| `cartoons` | Topolino |
| `disney_characters` | Cenerentola |
| `disney_villains` | Malefica |
| `game_of_thrones` | Jon Snow |
| `greek_mythology` | Zeus |
| `harry_potter` | Albus Silente |
| `hayao_miyazaki` | Totoro |
| `italian_actors` | Roberto Benigni |
| `italian_architects` | Renzo Piano |
| `italian_basketball_legends` | Dino Meneghin |
| `italian_chefs` | Gualtiero Marchesi |
| `italian_comedians` | Maccio Capatonda |
| `italian_cyclists` | Fausto Coppi |
| `italian_dj_producers` | Benny Benassi |
| `italian_explorers` | Cristoforo Colombo |
| `italian_fashion_designers` | Giorgio Armani |
| `italian_film_directors` | Federico Fellini |
| `italian_football_legends` | Roberto Baggio |
| `italian_inventors` | Guglielmo Marconi |
| `italian_journalists` | Indro Montanelli |
| `italian_mathematicians` | Leonardo Fibonacci |
| `italian_motogp_legends` | Valentino Rossi |
| `italian_musicians` | Lucio Battisti |
| `italian_nobel_prize_winners` | Grazia Deledda |
| `italian_olympic_legends` | Alberto Tomba |
| `italian_opera_composers` | Giuseppe Verdi |
| `italian_painters` | Amedeo Modigliani |
| `italian_poets` | Dante Alighieri |
| `italian_presidents_of_the_republic` | Sandro Pertini |
| `italian_racing_drivers` | Alberto Ascari |
| `italian_rappers` | Marracash |
| `italian_renaissance_artists` | Leonardo da Vinci |
| `italian_scientists` | Galileo Galilei |
| `italian_singers_classic` | Lucio Dalla |
| `italian_singers_modern` | Marco Mengoni |
| `italian_superheroes` | Diabolik |
| `italian_television_personalities` | Maria De Filippi |
| `italian_tennis_players` | Jannik Sinner |
| `italian_voice_actors` | Ferruccio Amendola |
| `italian_volleyball_legends` | Paola Egonu |
| `italian_writers` | Italo Calvino |
| `italian_youtubers` | Favij |
| `lupin_iii_characters` | Fujiko |
| `philosophers` | Cartesio |
| `pixar_characters` | Saetta McQueen |
| `roman_emperors` | Marco Aurelio |
| `roman_mythology` | Giove |
| `star_wars` | Luke Skywalker |
</details>

<details>
<summary><b>🍝 Things (42)</b></summary>

| Dictionary | Example |
|---|---|
| `car_brands` | Ferrari |
| `coffee_brands` | Lavazza |
| `italian_aperitivi` | Negroni |
| `italian_breads` | Ciabatta |
| `italian_card_games` | Scopa |
| `italian_carnival_masks` | Arlecchino |
| `italian_cars` | Cinquecento |
| `italian_castles` | Castel del Monte |
| `italian_cheeses` | Parmigiano Reggiano |
| `italian_children_games_70s` | Subbuteo |
| `italian_children_games_80s` | Goldrake |
| `italian_children_games_90s` | Tamagotchi |
| `italian_children_games_2000s` | Winx Club |
| `italian_circus_terms` | Saltimbanco |
| `italian_cryptids_legends` | Befana |
| `italian_cured_meats` | Mortadella |
| `italian_dance_styles` | Tarantella |
| `italian_design_objects` | Arco |
| `italian_desserts` | Cannolo |
| `italian_dialect_words` | Guaglione |
| `italian_folk_instruments` | Mandolino |
| `italian_icecream_flavors` | Stracciatella |
| `italian_invented_words` | Petaloso |
| `italian_islands` | Pantelleria |
| `italian_lakes` | Garda |
| `italian_liqueurs` | Limoncello |
| `italian_monuments` | Colosseo |
| `italian_motorcycles` | Vespa |
| `italian_mountains` | Cervino |
| `italian_old_currencies` | Fiorino |
| `italian_old_jobs` | Arrotino |
| `italian_pasta_shapes` | Fusilli |
| `italian_pizza_types` | Margherita |
| `italian_progressive_rock_bands` | PFM |
| `italian_regional_foods` | Cacciucco |
| `italian_rivers` | Tevere |
| `italian_sea_creatures` | Polpo |
| `italian_street_foods` | Arancino |
| `italian_train_stations_classic` | Roma Termini |
| `italian_volcanoes` | Etna |
| `italian_wine_regions` | Chianti |
| `italian_wines` | Barolo |
</details>

Toggle each one in `config/password-toolkit.php` (`true` / `false`).

---

## ⚙️ Configuration

```php
return [
    'name_types' => [
        'people' => [ /* 49 dictionaries — true/false */ ],
        'things' => [ /* 42 dictionaries — true/false */ ],
    ],

    // Separator between segments. Any symbol, or null.
    'separator_symbol' => '-',

    // Replace spaces in multi-word names with the separator (true)
    // or strip them entirely (false).
    'name_separator' => true,

    // Append a random numeric segment.
    'add_numbers'      => true,
    'numbers_digits'   => 4,           // length of the number
    'numbers_position' => 'end',       // start | middle | end

    // Leetspeak transform: 'no' | 'basic' | 'advanced'.
    'leetspeak_conversion' => 'no',
];
```

### Leetspeak cheat sheet

| char | basic | advanced |
|---|---|---|
| a | `4` | `4` |
| e | `3` | `3` |
| i / l | `1` | `1` |
| o | `0` | `0` |
| s | `$` | `$` |
| m | — | `\|V\|` |
| w | — | `\\/\\/` |
| n | — | `\|\\\|` |

`advanced` mode expands character count — useful for stricter length policies.

---

## 🛡️ Strength reporter

Two entry points:

```php
use Gabrielesbaiz\PasswordToolkit\Facades\PasswordToolkit;

// Score an arbitrary password (charset model)
$report = PasswordToolkit::strength('Goldrake-Mitico-4271');
$report->score;              // 0..4
$report->label;              // very_weak | weak | fair | strong | very_strong
$report->entropyBits;        // float
$report->charsetFlags;       // ['lower'=>true,'upper'=>true,'digits'=>true,'symbols'=>true]
$report->crackTimeHuman;     // "12 years"

// Generate + structural report (knowledge of dictionaries — more honest)
['password' => $pwd, 'report' => $report] = PasswordToolkit::generateWithReport();
$report->components;         // ['name'=>x,'adjective'=>y,'number'=>z,'leetspeak_bonus'=>b,'total'=>t]
```

### Score thresholds

| bits | score | label |
|---|---|---|
| `< 28` | 0 | very_weak |
| `28–35` | 1 | weak |
| `36–59` | 2 | fair |
| `60–127` | 3 | strong |
| `≥ 128` | 4 | very_strong |

Crack time defaults to `1e10` guesses/sec (offline GPU vs fast hash). Override via `config/password-toolkit.php`:

```php
'strength' => ['guesses_per_second' => 1e12],
```

The structural model accounts for the fact a dictionary-aware attacker only searches the package's pool space, not the full charset — usually a much lower (and more realistic) entropy figure.

---

## 🧪 Testing

```bash
composer test
```

---

## 🛣️ Roadmap ideas

- Locale-aware adjective packs (EN / ES / FR)
- Custom user dictionaries via config

PRs welcome. 🙌

---

## 📝 Changelog

See [CHANGELOG](CHANGELOG.md).

## 🤝 Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## 🛡️ Security

⚠️ Memorable passwords trade entropy for usability. For high-security secrets (API keys, root creds) prefer `Str::random()` or `random_bytes()`. PasswordToolkit shines for **user onboarding, default credentials, share links, demo accounts**.

Report vulnerabilities via [our security policy](../../security/policy).

## 🙏 Credits

- [Gabriele Sbaiz](https://github.com/gabrielesbaiz)
- [All Contributors](../../contributors)

## 📄 License

[MIT](LICENSE.md).
