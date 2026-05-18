# Converting between numbers and words.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ibrahim-bougaoua/numbertowords.svg?style=flat-square)](https://packagist.org/packages/ibrahim-bougaoua/numbertowords)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ibrahim-bougaoua/numbertowords/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ibrahim-bougaoua/numbertowords/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ibrahim-bougaoua/numbertowords/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ibrahim-bougaoua/numbertowords/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ibrahim-bougaoua/numbertowords.svg?style=flat-square)](https://packagist.org/packages/ibrahim-bougaoua/numbertowords)

The words-to-number and number-to-words conversion functionality enables users to seamlessly switch between numeric values and their worded equivalents in various languages. This feature supports multiple languages, including English, French, Arabic, Spanish, German, and Italian.

<br />
<a href="https://www.youtube.com/@IbrahimBougaoua" target="_blank">Youtube Video</a>
<br /><br />
<img src="https://raw.githubusercontent.com/ibrahimBougaoua/screenshot/main/wordsToNumbers.jpg" width="100%" class="filament-hidden" />

## Installation

You can install the package via composer:

```bash
composer require ibrahim-bougaoua/numbertowords
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="numbertowords-config"
```

This is the contents of the published config file:

```php
return [
    // default lang
    'lang' => 'en',

    'words' => [

        // Arabic words
        'units_ar' => ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'],
        'teens_ar' => ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'],
        'tens_ar' => ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'],
        'thousands_ar' => ['', 'ألف', 'مليون', 'مليار', 'بليون'],
        'zero_ar' => 'صفر',
        'negative_ar' => 'سالب ',
        'hundred_ar' => ' مائة ',
        'and_ar' => ' و ',
        'cents_ar' => ' قروش',

        // English words
        'units_en' => ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'],
        'teens_en' => ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'],
        'tens_en' => ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'],
        'thousands_en' => ['', 'Thousand', 'Million', 'Billion', 'Trillion'],
        'zero_en' => 'Zero',
        'negative_en' => 'Negative ',
        'hundred_en' => ' Hundred ',
        'and_en' => ' and ',
        'cents_en' => ' Cents',

        // French words
        'units_fr' => ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf'],
        'teens_fr' => ['Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf'],
        'tens_fr' => ['', 'Dix', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-dix', 'Quatre-vingts', 'Quatre-vingt-dix'],
        'thousands_fr' => ['', 'Mille', 'Million', 'Milliard', 'Billion'],
        'zero_fr' => 'Zéro',
        'negative_fr' => 'Négatif ',
        'hundred_fr' => ' Cent ',
        'and_fr' => ' et ',
        'cents_fr' => ' Centimes',

        // Spanish words
        'units_es' => ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'],
        'teens_es' => ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'],
        'tens_es' => ['', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'],
        'thousands_es' => ['', 'Mil', 'Millón', 'Mil Millones', 'Billón'],
        'zero_es' => 'Cero',
        'negative_es' => 'Negativo ',
        'hundred_es' => ' Cien ',
        'and_es' => ' y ',
        'cents_es' => ' Centavos',

        // German words
        'units_de' => ['', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun'],
        'teens_de' => ['Zehn', 'Elf', 'Zwölf', 'Dreizehn', 'Vierzehn', 'Fünfzehn', 'Sechzehn', 'Siebzehn', 'Achtzehn', 'Neunzehn'],
        'tens_de' => ['', 'Zehn', 'Zwanzig', 'Dreißig', 'Vierzig', 'Fünfzig', 'Sechzig', 'Siebzig', 'Achtzig', 'Neunzig'],
        'thousands_de' => ['', 'Tausend', 'Million', 'Milliarde', 'Billion'],
        'zero_de' => 'Null',
        'negative_de' => 'Negativ ',
        'hundred_de' => ' Hundert ',
        'and_de' => ' und ',
        'cents_de' => ' Cent',

        // Italian words
        'units_it' => ['', 'Uno', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Otto', 'Nove'],
        'teens_it' => ['Dieci', 'Undici', 'Dodici', 'Tredici', 'Quattordici', 'Quindici', 'Sedici', 'Diciassette', 'Diciotto', 'Diciannove'],
        'tens_it' => ['', 'Dieci', 'Venti', 'Trenta', 'Quaranta', 'Cinquanta', 'Sessanta', 'Settanta', 'Ottanta', 'Novanta'],
        'thousands_it' => ['', 'Mille', 'Milione', 'Miliardo', 'Bilione'],
        'zero_it' => 'Zero',
        'negative_it' => 'Negativo ',
        'hundred_it' => ' Cento ',
        'and_it' => ' e ',
        'cents_it' => ' Centesimi',
    ]
];
```

## Usage

```php
use NumberToWord\NumberToWords\Traits\NumbersToWords;

$words = NumbersToWords::numbersToWords(12000, 'en');
echo $words; // Outputs: Twelve Thousand
```

```php
use NumberToWord\NumberToWords\Traits\WordsToNumbers;

$numbers = WordsToNumbers::wordsToNumbers('Twelve Thousand', 'en');
echo $numbers; // Outputs: 12000
```
## It's support filament,you can use it with filament as you see below.


```php
// with form.
return $form
    ->schema([
        Section::make()
            ->schema([
                NumbersToWordsInput::make('price')
                    ->label('Numbers To Words')
                    ->lang('en'),
                WordsToNumbersInput::make('word')
                    ->label('Words To Numbers')
                    ->lang('en'),
```

```php
// with table.
return $table
     ->columns([
		NumbersToWordsColumn::make('price')
			->label("Numbers To Words")
			->lang('en')
			->suffix(' DA')
			->badge()
			->color('success'),
                WordsToNumbersColumn::make('word')
			->label("Words To Numbers")
			->lang('en')
			->suffix(' DA')
			->badge()
			->color('primary'),
    ])
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Ibrahim Bougaoua](https://github.com/Ibrahim Bougaoua)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
