# 🌐 Laravel Translator

Boîte à outils de traduction propulsée par l'IA pour Laravel. Détecte les chaînes brutes non traduites dans les vues Blade et les fichiers PHP, génère des clés sémantiques, corrige les fichiers sources en place, synchronise les traductions manquantes dans toutes les langues cibles et fournit un débogueur visuel — le tout depuis la ligne de commande.

**Compatibilité :** PHP 8.2+ · Laravel 10 / 11 / 12 · PSR-4

---

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Workflow](#workflow)
- [translator:detect](#1-translatordetect--détecter-les-chaînes-brutes)
- [translator:fix](#2-translatorfix--remplacer-les-chaînes-brutes)
- [translator:sync](#3-translatorsync--traduire-les-clés-manquantes)
- [Smart Keys](#smart-keys)
- [Débogueur visuel](#débogueur-visuel)
- [Drivers](#drivers)
  - [OpenAI](#openai-par-défaut)
  - [DeepL](#deepl)
  - [APIs compatibles OpenAI (Gemini, Mistral, Groq…)](#apis-compatibles-openai-gemini-mistral-groq)
- [Sauvegardes](#sauvegardes)
- [Architecture](#architecture)
- [Tests](#tests)

---

## Installation

```bash
composer require godrade/laravel-translator
```

Le package est auto-découvert via Laravel Package Auto-Discovery. Aucune inscription manuelle dans `config/app.php` n'est nécessaire.

### Publier la configuration

```bash
php artisan vendor:publish --tag=translator-config
```

---

## Configuration

Fichier publié : `config/translator.php`

```php
return [
    // Driver actif : 'openai' ou 'deepl'
    'driver' => env('TRANSLATOR_DRIVER', 'openai'),

    // Locale des chaînes présentes dans votre code source
    'source_locale' => env('TRANSLATOR_SOURCE_LOCALE', 'fr'),

    // Locales cibles que translator:sync va remplir
    'target_locales' => ['en', 'es', 'de'],

    'drivers' => [
        'openai' => [
            'api_key'    => env('OPENAI_API_KEY'),
            'model'      => env('OPENAI_TRANSLATOR_MODEL', 'gpt-4o-mini'),
            'base_url'   => env('OPENAI_BASE_URL'),  // optionnel — voir section Drivers
            'timeout'    => 30,
            'batch_size' => 50,
        ],
        'deepl' => [
            'api_key'    => env('DEEPL_API_KEY'),
            'api_url'    => env('DEEPL_API_URL', 'https://api-free.deepl.com/v2'),
            'timeout'    => 30,
            'batch_size' => 50,
        ],
    ],

    'scan' => [
        'include' => [resource_path('views'), app_path()],
        'exclude' => [],
    ],

    'smart_keys' => [
        // true = l'IA génère les clés ; false = slug dérivé du texte brut
        'enabled' => true,
    ],

    'security' => [
        'backup_files'          => true,   // .bak avant chaque modification
        'validate_placeholders' => true,   // bloque si un :param disparaît
    ],

    'visual_debug' => env('TRANSLATOR_VISUAL_DEBUG', false),
];
```

Variables `.env` disponibles :

```dotenv
TRANSLATOR_DRIVER=openai
TRANSLATOR_SOURCE_LOCALE=fr
TRANSLATOR_VISUAL_DEBUG=false

OPENAI_API_KEY=sk-...
OPENAI_TRANSLATOR_MODEL=gpt-4o-mini
OPENAI_BASE_URL=           # laisser vide pour OpenAI natif

DEEPL_API_KEY=...
```

---

## Workflow

```
translator:detect  →  translator:fix  →  translator:sync
```

---

## 1. `translator:detect` — Détecter les chaînes brutes

```bash
php artisan translator:detect
```

Scanne chaque fichier dans `scan.include`, extrait les chaînes humaines brutes et écrit un rapport dans :

```
storage/framework/translator/detect_report.json
```

```jsonc
[
  {
    "file": "resources/views/auth/login.blade.php",
    "line": 14,
    "raw_text": "Connexion",
    "context": "<button type=\"submit\">Connexion</button>"
  }
]
```

### Filtrage des faux positifs

Le parseur applique des heuristiques avancées pour n'extraire que les chaînes réellement destinées aux utilisateurs. Les patterns suivants sont automatiquement ignorés :

| Catégorie | Exemples filtrés |
|---|---|
| Attributs HTML / SVG | `stroke-linejoin="round"`, `aria-hidden="true"`, `data-slot="icon"` |
| Fragments de validation Laravel | `min:0`, `required\|exists:faqs,id`, `gte:randomCategoriesMin` |
| Expressions SQL brutes | `CASE WHEN status = ? THEN 0 ELSE 1 END`, `CHAR_LENGTH(...)` |
| Chargement Eloquent contraint | `createdBy:id,username`, `with:id,name` |
| Événements Livewire / Alpine | `faqQuestion:refresh`, `price:show:details` |
| Clés de configuration / traduction | `mail.tickets.ticket-closed`, `scout.typesense.client-settings.api_key` |
| Expressions JS Alpine | `!this.allowedTypes.includes(f.type)`, `f.size > this.maxBytes` |
| Syntaxe Markdown (mails) | `# Titre` → texte extrait sans `#` ; `**Gras**` → contenu déballé |
| Emojis décoratifs | `👤 Compte utilisateur` → `Compte utilisateur` détecté proprement |
| Fragments entre echos | `Ticket #`, `à partir de €`, `h min`, `Depuis le :` |
| Constructeurs d'exception | `new \Exception('...')`, `new RuntimeException('...')` |
| Identifiants séparés par virgules | `name, full_name, description` (Typesense `query_by`) |

---

## 2. `translator:fix` — Remplacer les chaînes brutes

```bash
# Prévisualiser sans écrire de fichiers
php artisan translator:fix --dry-run

# Appliquer les modifications
php artisan translator:fix
```

Pour chaque entrée du rapport de détection, la commande :

1. **Génère une Smart Key** via le driver IA configuré.
   `"Connexion"` dans `login.blade.php` → `auth.login_button_label`
2. **Vérifie** que le texte original est toujours présent à la ligne exacte (garde-fou anti-désynchronisation).
3. **Crée une copie `.bak`** du fichier original.
4. **Remplace** la chaîne brute :
   - Blade : `Connexion` → `{{ __('auth.login_button_label') }}`
   - PHP : `'Connexion'` → `__('auth.login_button_label')`
5. **Injecte** la clé et sa valeur dans le fichier de langue source :
   `lang/fr/auth.php` → `'login_button_label' => 'Connexion'`

### Options

| Option | Description |
|---|---|
| `--dry-run` | Prévisualisation uniquement — aucun fichier n'est écrit |

---

## 3. `translator:sync` — Traduire les clés manquantes

```bash
# Toutes les locales cibles configurées
php artisan translator:sync

# Une locale spécifique
php artisan translator:sync --locale=en

# Plusieurs locales
php artisan translator:sync --locale=en --locale=es

# Prévisualisation
php artisan translator:sync --dry-run

# Forcer l'écriture même si la validation des placeholders échoue
php artisan translator:sync --force
```

La commande :

1. Scanne le codebase pour chaque appel `__()` / `@lang()` / `trans()` et collecte les clés uniques.
2. Résout la valeur en locale source pour chaque clé (fichier PHP de groupe ou JSON).
3. Envoie les valeurs manquantes au driver en **lots** (`batch_size` configurable).
4. **Valide les placeholders** — toute traduction supprimant un `:name`, `{slot}` ou `%s` est bloquée (sauf avec `--force`).
5. Écrit les clés PHP **alphabétiquement** dans `lang/{locale}/{groupe}.php` en préservant les commentaires d'en-tête.
6. Fusionne les clés JSON **alphabétiquement** dans `lang/{locale}.json`.

### Options

| Option | Description |
|---|---|
| `--locale=` | Limite la sync à une ou plusieurs locales (répétable) |
| `--dry-run` | Prévisualisation uniquement — aucun fichier n'est écrit |
| `--force` | Écrit même si la validation des placeholders échoue |

### Exemple de sortie

```
🔍  Analyse du codebase pour les clés de traduction…
  → 42 clé(s) unique(s) trouvée(s).

  Synchronisation de en…
     12 écrite(s)  |  1 bloquée(s)  |  29 inchangée(s)

     ⚠  Traductions bloquées (placeholder manquant) :
       auth.welcome_message — placeholder(s) manquant(s) : :name
         source      : "Bienvenue :name !"
         traduction  : "Welcome!"

✅  Terminé — 12 traduction(s) écrite(s), 1 bloquée(s) par la validation des placeholders.
```

> La commande se termine avec un **code de sortie non nul** si des traductions sont bloquées — adapté aux pipelines CI/CD. Utiliser `--force` pour passer outre.

---

## Smart Keys

Lorsque `smart_keys.enabled = true`, le driver OpenAI génère des clés sémantiques en notation pointée à partir de la chaîne brute et du nom du fichier source.

| Chaîne brute | Fichier | Clé générée |
|---|---|---|
| `Connexion` | `login.blade.php` | `auth.login_button_label` |
| `Votre mot de passe est incorrect` | `login.blade.php` | `auth.invalid_password_message` |
| `Enregistrer les modifications` | `settings.blade.php` | `settings.save_changes_button` |

**Protection anti-doublon** — si une clé existe déjà dans le fichier de langue source avec une valeur différente, le service l'incrémente automatiquement (`login_button_label_2`, etc.).

Lorsque `smart_keys.enabled = false` (ou si l'appel API échoue), la clé est générée sous forme de slug à partir du texte brut.

---

## Débogueur visuel

Définir `TRANSLATOR_VISUAL_DEBUG=true` pour que chaque chaîne traduite affiche sa clé entre crochets au lieu de sa valeur :

```
# Normal
Connexion

# Avec visual_debug = true
[auth.login_button_label]
```

Ceci s'applique **uniquement aux requêtes HTTP** — les commandes Artisan, les workers de queue et les tests reçoivent toujours la valeur traduite réelle, afin que `translator:sync` et `translator:fix` continuent de fonctionner correctement.

À l'activation, le singleton `translator` est remplacé dans `TranslatorServiceProvider` par `DebugTranslator` — une sous-classe transparente de `Illuminate\Translation\Translator`.

---

## Drivers

### OpenAI (par défaut)

```php
'drivers' => [
    'openai' => [
        'api_key'    => env('OPENAI_API_KEY'),
        'model'      => env('OPENAI_TRANSLATOR_MODEL', 'gpt-4o-mini'),
        'timeout'    => 30,
        'batch_size' => 50,
    ],
],
```

Supporte la **traduction** (`translateBatch`) et la **génération de clés** (`generateSmartKeyBatch`).

### DeepL

```php
'driver' => 'deepl',

'drivers' => [
    'deepl' => [
        'api_key'    => env('DEEPL_API_KEY'),
        'api_url'    => env('DEEPL_API_URL', 'https://api-free.deepl.com/v2'),
        'timeout'    => 30,
        'batch_size' => 50,
    ],
],
```

> DeepL supporte la **traduction uniquement**. La génération de Smart Keys nécessite le driver OpenAI.

### APIs compatibles OpenAI (Gemini, Mistral, Groq…)

Tout fournisseur exposant un endpoint compatible OpenAI fonctionne via la clé `base_url` :

```dotenv
TRANSLATOR_DRIVER=openai
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_API_KEY=AIza...
OPENAI_TRANSLATOR_MODEL=gemini-2.0-flash
```

```php
// config/translator.php
'drivers' => [
    'openai' => [
        'api_key'    => env('OPENAI_API_KEY'),
        'model'      => env('OPENAI_TRANSLATOR_MODEL', 'gpt-4o-mini'),
        'base_url'   => env('OPENAI_BASE_URL'),
        'timeout'    => 30,
        'batch_size' => 50,
    ],
],
```

| Fournisseur | `OPENAI_BASE_URL` |
|---|---|
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| **Mistral** | `https://api.mistral.ai/v1` |
| **Groq** | `https://api.groq.com/openai/v1` |
| **Ollama** (local) | `http://localhost:11434/v1` |

---

## Sauvegardes

Avant toute modification de fichier, une sauvegarde est écrite dans :

```
storage/framework/translator/backups/{chemin/relatif/du/fichier}.bak
```

L'arborescence des répertoires est identique à celle de la source. Pour restaurer :

```bash
cp storage/framework/translator/backups/resources/views/auth/login.blade.php.bak \
   resources/views/auth/login.blade.php
```

---

## Architecture

```
src/
├── Commands/
│   ├── DetectCommand.php          # translator:detect
│   ├── FixCommand.php             # translator:fix
│   └── SyncCommand.php            # translator:sync
├── Contracts/
│   ├── ParserContract.php
│   └── TranslationDriverContract.php
├── Drivers/
│   ├── OpenAiDriver.php
│   └── DeepLDriver.php
├── DTOs/
│   ├── DetectedString.php
│   └── ProcessResult.php
├── Parsers/
│   ├── BladeParser.php            # extraction depuis les vues Blade
│   └── PhpParser.php              # extraction depuis les fichiers PHP (token-based)
├── Services/
│   ├── ScannerService.php
│   ├── SmartKeyGeneratorService.php
│   ├── FileModifierService.php
│   ├── LangFileWriter.php
│   ├── KeyExtractorService.php
│   ├── PlaceholderValidator.php
│   └── TranslationSyncService.php
├── Translation/
│   └── DebugTranslator.php
└── TranslatorServiceProvider.php
```

Toutes les classes de service sont liées dans le container via `TranslatorServiceProvider`. Les drivers sont résolus via `TranslationDriverContract` — changer d'implémentation en modifiant `TRANSLATOR_DRIVER` dans `.env`.

---

## Tests

```bash
./vendor/bin/pest
```

| Fichier | Couverture |
|---|---|
| `tests/Unit/BladeParserTest.php` | Extraction de texte Blade, filtrage des faux positifs (SVG, Markdown, emojis, JS Alpine, fragments d'echoes…) |
| `tests/Unit/PhpParserTest.php` | Extraction PHP token-based, skip des fonctions de traduction/log, constructeurs d'exception, SQL, événements Livewire |
| `tests/Unit/SmartKeyGeneratorServiceTest.php` | Génération de clés, protection anti-doublon, incrément de suffixe |
| `tests/Unit/FileModifierServiceTest.php` | Remplacement Blade / PHP, création `.bak`, vérification de ligne |
| `tests/Unit/LangFileWriterTest.php` | Écriture PHP groupé, fusion JSON alphabétique |
| `tests/Unit/PlaceholderValidatorTest.php` | Détection `:name`, `{slot}`, `%s` supprimés |
| `tests/Unit/KeyExtractorServiceTest.php` | Scan des appels `__()` / `trans()` / `@lang()` |
| `tests/Unit/TranslationSyncServiceTest.php` | Flux sync complet, dry-run, blocage placeholder, fusion JSON |
| `tests/Unit/OpenAiDriverTest.php` | Traduction par lot, génération Smart Keys, base_url personnalisée |
| `tests/Unit/DebugTranslatorTest.php` | Mode `[clé]` HTTP uniquement, bypass CLI |
| `tests/Feature/ServiceProviderTest.php` | Enregistrement du provider, commandes Artisan, résolution du container |

174 tests, tous au vert.

---

## Licence

MIT — [Godrade](https://github.com/godrade)

