# Lobster Name

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Latest Version](https://img.shields.io/packagist/v/robbielove/laravel-lobster-name.svg?style=flat-square)](https://packagist.org/packages/robbielove/laravel-lobster-name)

Give your Eloquent models ridiculously fun alter-ego names. 36 name types from lobster to pirate to robot.

```
$ php artisan lobster:name "Robbie" --all

  Lobster ……………… Robbie Robster
  Dog …………………………… Rob Dog
  Doctor …………………… Dr. Robbie
  Judge ………………………… The Honourable Judge Robbie
  King ……………………………… Your Highness, Robbie
  Queen ………………………… Your Majesty, Robbie
  Initial …………………… R
  Backwards ………… eibboR
  Pirate …………………… Captain Robbie Stormborn
  Ninja ………………………… Whisper Robbie
  Wizard …………………… Robbie the Unbroken
  Rapper …………………… DJ Robbie
  Spy ……………………………… Agent R
  Chef ……………………………… Chef Robbie
  Wrestler ………… The Robster
  Viking …………………… Robbie the Ruthless
  Superhero ………… The Spectacular Robbie
  Villain ……………… Robbie the Merciless
  Cowboy …………………… Robbie "Lone Star" McCoy
  Rockstar ………… Robbie Havoc
  Mafia ………………………… Robbie "The Bull"
  Detective ………… Detective Robbie
  Professor ………… Professor Robbie
  President ………… President Robbie
  Robot ………………………… R-8279-E
  Medieval ………… Sir Robbie of Thornwall
  Alien ………………………… Nyx-Robbie of the Outer Rim
  Elf ……………………………… Robbieiel Nightbloom
  Dwarf ………………………… Robbiin Deepdelve
  Cat ……………………………… Robbie Pawsworth
  Formal …………………… The Right Honourable Robbie
  Stage ………………………… R.Nova
  Baby ……………………………… Widdle Wobbie
  Shouting ………… ROBBIE!!!
  Whisper ……………… ...robbie...
  Acronym ……………… R.O.B.B.I.E.
```

## Install

```bash
composer require robbielove/laravel-lobster-name
```

Supports Laravel 9, 10, 11, and 12. Requires PHP 8.0+.

## Usage

### On Eloquent models

Add the trait to any model with a `name` attribute:

```php
use Robbielove\LobsterName\Traits\HasLobsterName;

class User extends Model
{
    use HasLobsterName;
}

$user = User::find(1); // name = "Robbie"

$user->lobster_name;    // "Robbie Robster"
$user->pirate_name;     // "Captain Robbie Stormborn"
$user->ninja_name;      // "Whisper Robbie"
$user->wizard_name;     // "Robbie the Unbroken"
$user->rapper_name;     // "DJ Robbie"
$user->spy_name;        // "Agent R"
$user->robot_name;      // "R-8279-E"
$user->baby_name;       // "Widdle Wobbie"
$user->random_name;     // (surprise!)
$user->all_names;       // [...all 36 names as an array]
$user->name_card;       // formatted string of all names
```

#### Custom name column

If your model uses something other than `name`:

```php
class Customer extends Model
{
    use HasLobsterName;

    protected string $lobsterNameColumn = 'first_name';
}
```

### Standalone (no model needed)

```php
use Robbielove\LobsterName\LobsterName;

$lobster = new LobsterName('Sammy');
$lobster->lobster_name;  // "Sammy Sobster"
$lobster->pirate_name;   // "Captain Sammy Redbeard"

// Static factory
LobsterName::for('Alice')->wizard_name;  // "Alice the Eternal"

// Dump all names
echo LobsterName::for('Robbie');  // prints the full name card
```

### Artisan command

```bash
# Show curated highlights
php artisan lobster:name "Robbie"

# Show all 36 name types
php artisan lobster:name "Robbie" --all

# Get a specific type
php artisan lobster:name "Robbie" --type=pirate
```

## All Name Types

| Accessor | Example (for "Robbie") |
|---|---|
| `lobster_name` | Robbie Robster |
| `dog_name` | Rob Dog |
| `doctor_name` | Dr. Robbie |
| `judge_name` | The Honourable Judge Robbie |
| `king_name` | Your Highness, Robbie |
| `queen_name` | Your Majesty, Robbie |
| `initial_name` | R |
| `backwards_name` | eibboR |
| `pirate_name` | Captain Robbie Stormborn |
| `ninja_name` | Whisper Robbie |
| `wizard_name` | Robbie the Unbroken |
| `rapper_name` | DJ Robbie |
| `spy_name` | Agent R |
| `chef_name` | Chef Robbie |
| `wrestler_name` | The Robster |
| `viking_name` | Robbie the Ruthless |
| `superhero_name` | The Spectacular Robbie |
| `villain_name` | Robbie the Merciless |
| `cowboy_name` | Robbie "Lone Star" McCoy |
| `rockstar_name` | Robbie Havoc |
| `mafia_name` | Robbie "The Bull" |
| `detective_name` | Detective Robbie |
| `professor_name` | Professor Robbie |
| `president_name` | President Robbie |
| `robot_name` | R-8279-E |
| `medieval_name` | Sir Robbie of Thornwall |
| `alien_name` | Nyx-Robbie of the Outer Rim |
| `elf_name` | Robbieiel Nightbloom |
| `dwarf_name` | Robbiin Deepdelve |
| `cat_name` | Robbie Pawsworth |
| `formal_name` | The Right Honourable Robbie |
| `stage_name` | R.Nova |
| `baby_name` | Widdle Wobbie |
| `shouting_name` | ROBBIE!!! |
| `whisper_name` | ...robbie... |
| `acronym_name` | R.O.B.B.I.E. |

Names with variable suffixes (pirate, ninja, wizard, etc.) are **deterministic** — the same input name always produces the same output. No database, no randomness, just vibes.

## Testing

```bash
composer test
```

35 tests, 60 assertions.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Robbie Love](https://github.com/robbielove)
- [All Contributors](https://github.com/robbielove/lobster-name/contributors)

## License

MIT. See [LICENSE](LICENSE.md).
