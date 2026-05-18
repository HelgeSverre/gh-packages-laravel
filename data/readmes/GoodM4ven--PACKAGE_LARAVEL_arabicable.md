<div align="center">بسم الله الرحمن الرحيم</div>
<div align="left">

# Arabicable

Practical Arabic text processing for Laravel, focused on fast and predictable Arabic search with database-backed searchable variants.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/goodm4ven/arabicable.svg?style=for-the-badge&color=gray)](https://packagist.org/packages/goodm4ven/arabicable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/goodm4ven/PACKAGE_LARAVEL_arabicable/pest.yml?branch=dev&label=tests&style=for-the-badge&color=forestgreen)](https://github.com/goodm4ven/PACKAGE_LARAVEL_arabicable/actions?query=workflow%3Apest+branch%3Adev)
[![Coverage Status](https://img.shields.io/codecov/c/github/goodm4ven/PACKAGE_LARAVEL_arabicable/dev?style=for-the-badge&color=purple)](https://codecov.io/gh/goodm4ven/PACKAGE_LARAVEL_arabicable/tree/dev)
[![Total Downloads](https://img.shields.io/packagist/dt/goodm4ven/arabicable.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/goodm4ven/arabicable)

<img src="./.github/images/banner.png">


## Description

Arabicable primarily stores Arabic field variants in dedicated database columns, so indexing and querying remain consistent and fast through normal Eloquent workflows.

For each Arabicable text column, the package maintains:

- `<column>`
- `<column>_with_harakat`
- `<column>_searchable`
- `<column>_stemmed`

And all in all, this package provides all of these features:

</div>
<div align="center">

### Anaylsis and Search 

</div>
<div align="left">

- Generate Arabic-ready database columns and keep searchable variants in sync automatically with [Arabicable model and migration setup](#arabicable-model--migration).
- Run exact, like, and relevance-ranked Arabic matching with [search scopes](#search-scopes) and [text processing helpers](#text-processing-helpers).
- Build comprehensive query plans using normalization, tokenization, stop-word filtering, stemming, and lexical expansion via [text processing helpers](#text-processing-helpers) and [search scopes](#search-scopes).
- Control text with or without harakat and diacritics using the [ArabicFilter facade](#arabicfilter-facade), [Arabic facade common methods](#arabic-facade-common-methods), and [CamelTools facade](#cameltools-facade-pure-php-utility-port).
- Normalize letters, punctuation, spacing, and keywords using the [Arabic facade common methods](#arabic-facade-common-methods) and [CamelTools facade](#cameltools-facade-pure-php-utility-port).
- Compile and seed local lexical dictionaries for variants and stop-words using the [dictionary workflow](#dictionary-workflow-arabicableraw_data_path).
- Use pure-PHP transliteration, mapping, normalization, dediacritization, and tokenization through the [CamelTools facade](#cameltools-facade-pure-php-utility-port).

</div>
<div align="center">

### Al-Qur'an

</div>
<div align="left">

- Query Quran data at both ayah and exact word-occurrence levels with [Quran indexing tables](#quran-indexing-tables).
- Render Quran text with DigitalKhatt-compatible fonts while searching normalized fields via [DigitalKhatt / Quran font setup](#digitalkhatt--quran-font-setup).

</div>
<div align="center">

### Date

</div>
<div align="left">

- Convert dates between Gregorian and Hijri calendars with [Gregorian/Hijri date helpers](#gregorianhijri-date-helpers) and [Arabic facade common methods](#arabic-facade-common-methods).

</div>
<div align="center">

### Numbers

</div>
<div align="left">

- Convert numerals between ASCII digits (`123`) and Arabic-Indic digits (`١٢٣`) from backend and browser using [Arabic facade common methods](#arabic-facade-common-methods) and the [JavaScript number helper](#javascript-number-helper).

</div>
<div align="center">

### Voice

</div>
<div align="left">

- Add browser speech-to-text, text-to-speech, and voice transforms with the [RunAnywhere STT/TTS companion](#runanywhere-stttts-companion).


## Installation

1. Install via Composer:

```bash
composer require goodm4ven/arabicable
```

2. Run installer:

```bash
php artisan arabicable:install --seed
```

This publishes config + migrations, runs migration (with prompt unless `--testing`), and imports dictionaries when `--seed` is provided.

3. Publish the assets:

```bash
php artisan vendor:publish --tag=arabicable-assets
```

Raw data resolution defaults are customizable if you wish:

- `arabicable.raw_data_path` is auto-resolved from `vendor/goodm4ven/arabicable/resources/raw-data`, then `resources/raw-data`.
- You can publish package raw datasets to your app with:

```bash
php artisan vendor:publish --tag="arabicable-raw-data" --force
```

### Upgrading

Refresh published package files:

```bash
php artisan vendor:publish --tag="arabicable-config" --force
php artisan vendor:publish --tag="arabicable-migrations" --force
php artisan vendor:publish --tag="arabicable-raw-data" --force
php artisan migrate
```

If local dictionary sources changed:

```bash
php artisan arabicable:compile-data
php artisan arabicable:seed --all --truncate
```


## Usage

### Arabicable Model & Migration

1. Add an Arabicable migration macro:

   ```php
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   Schema::create('notes', function (Blueprint $table): void {
       $table->id();
       $table->arabicText('content');
       $table->timestamps();
   });
   ```

2. Use `Arabicable` trait on your model:

   ```php
   use GoodMaven\Arabicable\Traits\Arabicable;
   use Illuminate\Database\Eloquent\Model;

   class Note extends Model
   {
       use Arabicable;

       protected $fillable = ['content'];
   }
   ```

Observer-managed columns are now updated automatically when `content` changes:

- `$note->content`
- `$note->content_with_harakat`
- `$note->content_searchable`
- `$note->content_stemmed`

If using [Spatie Translatable](https://spatie.be/docs/laravel-translatable/v6/introduction), migration macros accept `?bool $isTranslatable`:

```php
$table->arabicText('content', isTranslatable: true);
```

</div>

> [!NOTE]
> `Arabicable` trait also provides `getSearchableTranslations()` for flattened keys like `content_searchable_ar`, `content_searchable_en`, etc.

<div align="left">


### Search Scopes

`Arabicable` trait includes:

- `scopeSearchArabic`
- `scopeWhereArabicLike`
- `scopeSearchArabicComprehensive`
- `scopeWhereArabicComprehensive`
- `scopeOrderByArabicRelevance`

Example:

```php
Post::query()
    ->searchArabic('content', $query)
    ->limit(20)
    ->get();
```

Comprehensive mode builds terms from:

- normalized query text
- tokens
- stop-word removal
- stems
- lexical variants (`roots`, `stems`, `original_words`, or `all`)


### Text Processing Helpers

```php
use GoodMaven\Arabicable\Facades\Arabic;
use GoodMaven\Arabicable\Facades\ArabicFilter;

$searchable = ArabicFilter::forSearch($text);
$stemmed = ArabicFilter::forStem($text);
$withoutHarakat = ArabicFilter::withoutHarakat($text);
$clean = Arabic::stripWeirdCharacters($text, keepHarakat: true, keepPunctuation: true);
$keywords = Arabic::extractKeywords($text);
$plan = Arabic::buildComprehensiveSearchPlan($query);
$variants = Arabic::expandWordVariants($tokens, mode: 'all', stripStopWords: true);
```


### ArabicFilter Facade

- `withHarakat(string $text): string`
- `withoutHarakat(string $text): string`
- `withoutDiacritics(string $text, bool $keepShadda = false): string`
- `forSearch(string $text): string`
- `forStem(string $text): string`
- `forMemorizationComparison(string $text, bool $stripCommons = true, bool $stripConnectors = true): string`


### Arabic Facade (Common Methods)

- Harakat/diacritics: `removeHarakat`, `removeDiacritics`, `addHarakat`
- Normalization: `normalizeHuroof`, `normalizeNumeralsForSearch`, `stripWeirdCharacters`
- Keywords/search: `tokenize`, `stemWord`, `stemWords`, `removeStopWords`, `extractKeywords`, `buildComprehensiveSearchPlan`, `expandWordVariants`
- Commons/cache: `removeCommons`, `clearConceptCache`
- Punctuation/spacing: `toTightPunctuationStyle`, `toLoosePunctuationStyle`, `removeAllPunctuationMarks`, `normalizeSpaces`
- Date conversion: `gregorianToHijri`, `hijriToGregorian`


### Quran Indexing Tables

Enable Quran features in config when needed:

```php
'features' => [
    'quran' => true,
],
```

After running migrations, Arabicable creates and imports:

- `quran_verses`: one row per ayah with `surah_number`, `ayah_number`, `ayah_index`, `text_uthmani`, `text_searchable`, `text_sanitized`, `text_without_harakat`, `text_without_diacritics`, `text_normalized_huroof`.
- `quran_words`: one row per word occurrence with `verse_id`, `word_position`, `global_word_index`, `token_uthmani`, `token_sanitized`, `token_searchable`, `token_without_harakat`, `token_without_diacritics`, `token_normalized_huroof`, `token_stem`, `token_root`, `token_lemma`.
- `quran_verse_explanations`: ayah-linked tafsir/i'rab records from SQLite sources (`source_key`, `content_kind`, `content_html`, `content_text`).
- `quran_word_annotations`: optional word-level notes/translation payloads linked to exact `quran_words` rows.

For repeat words, target the occurrence with:

- `verse_id + word_position` for stable position inside ayah.
- `global_word_index` for a single canonical word pointer across the full Quran.

This structure is ready for later tafsir/translation attachments at ayah level or exact word occurrence level.

Default source config keys:

- `arabicable.raw_data_path`
- `arabicable.data_sources.quran_othmani_surahs_dir`
- `arabicable.data_sources.quran_exegesis_databases_dir`
- `arabicable.data_sources.quran_layout_databases_dir`
- `arabicable.data_sources.quran_lexicon_databases_dir`
- `arabicable.data_sources.quran_fonts_dir`
- `arabicable.data_sources.quran_surah_headers_fonts_dir`

For tafsir / i'rab SQLite data:

- Put files like `ar-tafsir-al-tabari.db` and `al-i-rab-al-muyassar.db` in `<raw_data_path>/quran/exegesis`.
- Keep required exegesis SQLite files inside `<raw_data_path>/quran/exegesis` (or your configured data source path).
- Explanations are stored for display and retrieval, and are not part of Arabicable search indexing.


### Gregorian/Hijri Date Helpers

```php
use GoodMaven\Arabicable\Facades\Arabic;

$hijri = Arabic::gregorianToHijri(2025, 1, 1); // ['year' => ..., 'month' => ..., 'day' => ...]
$gregorian = Arabic::hijriToGregorian($hijri['year'], $hijri['month'], $hijri['day']);
```


### JavaScript Number Helper

Published asset: `public/vendor/arabicable/arabicable.js`

```js
window.ArabicableNumbers.toArabicIndic('123'); // "١٢٣"
window.ArabicableNumbers.toAscii('١٢٣'); // "123"
window.ArabicableNumbers.normalizeForBackendSearch('رقم ١٢٣', 'arabic'); // "رقم 123"
window.ArabicableNumbers.normalizeForBackendSearch('رقم 123', 'indian'); // "رقم ١٢٣"
window.ArabicableNumbers.normalizeForBackendSearch('123', 'both'); // "123 ١٢٣"
```


### DigitalKhatt / Quran Font Setup

Arabicable can be paired with DigitalKhatt-style Quran rendering in your app frontend.

1. Publish package assets (and optionally Quran raw-data files if you want app-local copies):

```bash
php artisan vendor:publish --tag=arabicable-assets --force
php artisan vendor:publish --tag=arabicable-raw-data --force
```

2. Use the included Quran font file (published under `public/vendor/arabicable/madina.woff2`), or replace it with your preferred DigitalKhatt-compatible font build.

   Surah header fonts are also bundled and available in both locations:

   - `resources/raw-data/quran/fonts/surah-headers/QCF_SurahHeader_COLOR-Regular.woff2`
   - `resources/raw-data/quran/fonts/surah-headers/surah-name-v2.woff2`
   - `public/vendor/arabicable/QCF_SurahHeader_COLOR-Regular.woff2`
   - `public/vendor/arabicable/surah-name-v2.woff2`

3. Define your Quran text class:

```css
@font-face {
  font-family: 'MadinaQuran';
  src: url('/vendor/arabicable/madina.woff2') format('woff2');
  font-display: swap;
}

.font-quran {
  font-family: 'MadinaQuran', 'Amiri', serif;
}

.font-quran-surah-header {
  font-family: 'QcfSurahHeaderColor', 'SurahNameV2', 'MadinaQuran', 'Amiri', serif;
}
```

4. Render Uthmani text with `.font-quran`, while using `text_searchable`/`token_searchable` fields for search queries.

5. Optional package config for surah header font selection:

```php
'quran_fonts' => [
    'surah_headers' => [
        'preferred' => 'qcf-surah-header-color-regular',
        'available' => [
            'qcf-surah-header-color-regular' => [
                'family' => 'QcfSurahHeaderColor',
                'filename' => 'QCF_SurahHeader_COLOR-Regular.woff2',
                'format' => 'woff2',
            ],
            'surah-name-v2' => [
                'family' => 'SurahNameV2',
                'filename' => 'surah-name-v2.woff2',
                'format' => 'woff2',
            ],
        ],
    ],
],
```

If you integrate the external `digitalkhatt.js` stack, keep Arabicable as the search/index layer and use DigitalKhatt purely for display shaping.


### RunAnywhere STT/TTS Companion

Install frontend packages:

```bash
npm install @runanywhere/web @runanywhere/web-onnx
```

Initialize and register your bridge:

```js
import { RunAnywhere, SDKEnvironment } from '@runanywhere/web';
import { ONNX } from '@runanywhere/web-onnx';

await RunAnywhere.initialize({ environment: SDKEnvironment.Production, debug: false });
await ONNX.register();

window.ArabicableRunAnywhere.setBridge({
  async speechToText(audioInput, options = {}) {
    // Return string or object containing transcript text
    return { text: '' };
  },
  async textToSpeech(text, options = {}) {
    // Return Float32Array, Blob, or { audio/blob/url, sampleRate }
    return { audio: new Float32Array(), sampleRate: 24000 };
  },
});
```

Bridge API methods:

- `speechToText(audioInput, options)`
- `textToSpeech(text, options)`
- `voiceToText(audioInput, options)`
- `textToVoice(text, options)`
- `voiceToVoice(audioInput, options)`
- `transformArabic({ text, audio, target }, options)`
- `decodeAudioBlob(blob, targetSampleRate?)`
- `playFloat32Audio(audio, sampleRate?)`
- `playAudio(result)`


### Dictionary Workflow (`arabicable.raw_data_path`)

`compiled-*` files are runtime dictionaries. `source-*` files are local raw assets.

Compile:

```bash
php artisan arabicable:compile-data
php artisan arabicable:compile-data --raw-data-path=/absolute/path/to/raw-data
php artisan arabicable:compile-data --without-extra-stopwords
```

Seed DB dictionaries:

```bash
php artisan arabicable:seed --all
php artisan arabicable:seed --common-texts --stop-words
php artisan arabicable:seed --all --truncate
```

Current DB imports:

- `common_arabic_texts`
- `arabic_stop_words`

Current file-backed lexical expansion sources:

- `<raw_data_path>/verbs/compiled-word-variants.tsv`
- `<raw_data_path>/quran/compiled-quran-word-index.tsv`

All source paths are configurable via `config/arabicable.php` using:

- `arabicable.raw_data_path` (global base path)
- `arabicable.data_sources.*` (per-file/per-directory overrides)


## API

### Validation Rules

- `GoodMaven\Arabicable\Rules\Arabic`
- `GoodMaven\Arabicable\Rules\ArabicWithSpecialCharacters`
- `GoodMaven\Arabicable\Rules\UncommonArabic`
- `GoodMaven\Arabicable\Rules\UniqueArabicWithSpecialCharacters`

### Artisan Commands

| Command | Purpose |
|---|---|
| `arabicable:install` | Publish config/migrations, migrate, optional seed (`--testing`, `--seed`) |
| `arabicable:compile-data` | Compile local datasets (`--raw-data-path`, `--without-extra-stopwords`) |
| `arabicable:seed` | Import configured dictionaries (`--all`, `--common-texts`, `--stop-words`, `--truncate`) |

### Migration Macros

| Macro | Purpose |
|---|---|
| `indianDate($columnName, $isNullable = false, $isUnique = false)` | Creates date column and `<column>_indian` |
| `arabicString($columnName, $length = 255, $isNullable = false, $isUnique = false, $supportsFullSearch = false, $isTranslatable = null)` | String + Arabicable variant columns |
| `arabicTinyText($columnName, $isNullable = false, $isUnique = false, $supportsFullSearch = false, $isTranslatable = null)` | TinyText + variants |
| `arabicText($columnName, $isNullable = false, $isUnique = false, $isTranslatable = null)` | Text + variants |
| `arabicMediumText($columnName, $isNullable = false, $isUnique = false, $isTranslatable = null)` | MediumText + variants |
| `arabicLongText($columnName, $isNullable = false, $isUnique = false, $isTranslatable = null)` | LongText + variants |

### Global Functions

- `ar_indian(string $property): string`
- `ar_with_harakat(string $property): string`
- `ar_searchable(string $property): string`
- `ar_stem(string $property): string`
- `ar_expand_variants(...)`
- `arabicable_special_characters(...)`
- `camel_tools()` and `camel_*` helpers

### CamelTools Facade (Pure-PHP Utility Port)

Key utilities:

- Builtin mapping/transliteration: `mapWithBuiltin`, `transliterateWithBuiltin`, `arclean`
- Unicode/orthographic normalization: `normalizeUnicode`, `normalizeAlef*`, `normalizeAlefMaksura*`, `normalizeTehMarbuta*`, `normalizeOrthography`
- Dediacritization: `dediac*`
- Tokenization: `simpleWordTokenize`


## Contribution

- Always target `dev` branch for your PRs.


## License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).


## Credits

- Youssif Shaaban Alsager ([yshalsager](https://github.com/yshalsager))
- [Linuxscout](https://github.com/linuxscout)
- [CAMeL Tools](https://github.com/CAMeL-Lab/camel_tools)
- [ar-php](https://github.com/khaled-alshamaa/ar-php)
- [Qul by Tarteel](https://qul.tarteel.ai/resources)
- [Nuqaya](https://github.com/nuqayah)


</div>

<br>
<div align="center">والحمد لله رب العالمين</div>
