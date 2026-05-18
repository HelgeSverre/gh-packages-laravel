# DcfParser

**DcfParser** is a PHP & Laravel package to parse Debian Control Files (DCF format).

## Requirements

- PHP 8.2+

## Installation

```bash
composer require makowskid/dcfparser
```

## Usage

### Parse a file (first stanza)

```php
$parser = new \makowskid\DcfParser\DcfParser();
$data = $parser->parseFile('/path/to/control');
// ['source' => 'gentoo', 'section' => 'games', ...]
```

### Parse a string

```php
$data = $parser->parseString("Source: gentoo\nSection: games\n");
```

### Parse all stanzas

DCF files can contain multiple stanzas (paragraphs) separated by blank lines:

```php
$stanzas = $parser->parseFileAll('/path/to/control');
// or
$stanzas = $parser->parseStringAll($content);

// Returns: [['source' => 'gentoo', ...], ['package' => 'gentoo', ...]]
```

### Laravel

The package auto-discovers its service provider. Use the facade:

```php
\DcfParser::parseFile('/path/to/control');
\DcfParser::parseString($content);
\DcfParser::parseFileAll('/path/to/control');
\DcfParser::parseStringAll($content);
```

## DCF Format

Reference: https://www.debian.org/doc/debian-policy/ch-controlfields.html

Example input:
```
Source: gentoo
Section: games
Priority: optional
Maintainer: Josip Rodin <joy-mg@debian.org>
Build-Depends: debhelper (>=10)
Homepage: https://packages.debian.org/gentoo

Package: gentoo
Architecture: any
Description: A nice game
 Gentoo is a classic Jumpn Run sidescrolling game.
```

Parsed result (first stanza):
```php
[
    'source' => 'gentoo',
    'section' => 'games',
    'priority' => 'optional',
    'maintainer' => 'Josip Rodin <joy-mg@debian.org>',
    'build-depends' => 'debhelper (>=10)',
    'homepage' => 'https://packages.debian.org/gentoo',
]
```

Key behaviors:
- Keys are normalized to lowercase
- Only the first `:` splits key from value
- Continuation lines (starting with whitespace) are appended to the previous field
- Blank lines separate stanzas
- Comment lines (starting with `#`) are skipped
- Throws `DcfParserException` on malformed input or file errors

## Development

```bash
composer install
composer test        # Run tests
composer analyse     # PHPStan (level 8)
composer cs-fix      # Fix code style
composer cs-check    # Check code style
```

## Credits

- [Dawid Makowski](https://github.com/makowskid)
- [Alin Purcaru](https://stackoverflow.com/users/321468/alin-purcaru) - thanks for inspiration on [StackOverflow](https://stackoverflow.com/questions/4392904/control-file-to-php-array)

## License

The MIT License (MIT). See the [License File](https://github.com/makowskid/dcfparser/blob/master/LICENSE) for more information.
