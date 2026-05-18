# Klantenvertellen for Laravel

A Laravel package to easily integrate and fetch reviews from Klantenvertellen.nl.

## Installation

You can install the package via composer:

```bash
composer require wefabric/klantenvertellen
```

## Configuration

First, publish the configuration file:

```bash
php artisan vendor:publish --tag="klantenvertellen-config"
```

Then, add your Klantenvertellen XML hash to your `.env` file:

```env
KLANTENVERTELLEN_XML_HASH=your_hash_here
KLANTENVERTELLEN_CACHE_DURATION=1440
```

## Usage

You can use the `KlantenvertellenService` to fetch review data. The data is cached for 24 hours (1440 minutes) by default. You can change this in the config or via the `KLANTENVERTELLEN_CACHE_DURATION` env variable.

```php
use Wefabric\Klantenvertellen\KlantenvertellenService;

$service = app(KlantenvertellenService::class);
$data = $service->getFeedData();

if ($data) {
    echo $data['averageRating'];
    echo $data['numberReviews'];
    echo $data['locationName'];
    
    foreach ($data['reviews'] as $review) {
        echo $review['author'];
        echo $review['rating'];
        echo $review['oneliner'];
        echo $review['opinion'];
        echo $review['date'];
    }
}
```

### Data Structure

The `getFeedData()` method returns an array with the following structure:

- `averageRating`: The average rating (string).
- `numberReviews`: Total number of reviews (string).
- `locationName`: Name of the location (string).
- `viewReviewUrl`: URL to view all reviews on Klantenvertellen.nl.
- `reviews`: An array of the 15 most recent reviews, each containing:
    - `author`: Name of the reviewer.
    - `city`: City of the reviewer.
    - `rating`: Individual rating.
    - `date`: Formatted date (dd-mm-yyyy).
    - `oneliner`: Review headline.
    - `opinion`: Full review text.

## Credits

- [Sebastiaan Hartman](mailto:sebastiaan@wefabric.nl)
- [Wefabric](https://www.wefabric.nl)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
