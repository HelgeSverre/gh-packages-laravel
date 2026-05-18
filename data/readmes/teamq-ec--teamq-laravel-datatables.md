# Laravel Datatable API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/teamq/laravel-datatables.svg?style=flat-square)](https://packagist.org/packages/teamq/laravel-datatables)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/teamq-ec/teamq-laravel-datatables/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/teamq-ec/teamq-laravel-datatables/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/teamq-ec/teamq-laravel-datatables/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/teamq-ec/teamq-laravel-datatables/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/teamq/laravel-datatables.svg?style=flat-square)](https://packagist.org/packages/teamq/laravel-datatables)

This is a collection of classes for filters and sorts, extending from
the [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder) package,
in addition to providing the possibility of applying these filters and sorting in related models using join through
from the [kirschbaum-development/eloquent-power-joins](https://github.com/kirschbaum-development/eloquent-power-joins)
package.

## Installation

You can install the package via composer:

```bash
composer require teamq/laravel-datatables
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-datatable-config"
```

This is the contents of the published config file:

```php
return [
    'parameters' => [
        'per_page' => 'per_page',
    ],

    'per_page' => [
        // Represents the value to be sent by the user, to obtain all records, if using the result method.
        'all' => 'all',
    ],
];
```

## Usage

### Pagination

This package uses Laravel pagination by default; However, it allows you to specify through parameters of
queries, the number of records to obtain, you can even obtain all the records.

```php
GET /books?per_page=30
```

It is recommended to use the `result` method instead of `paginate` or `get`. Since `result` encapsulates the logic of
both yes, it is requested to show all, below `result` will use `get` but if you want to see a number of records
below will use `paginate` with the amount provided.

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\TextFilter;

$query = QueryBuilder::for(Book::class);

$query->result();
```

### Filters

| Filter          | Class                                            | Operators |
|-----------------|--------------------------------------------------|-----------|
| Text            | `TeamQ\Datatables\Filters\TextFilter`            | Text      |
| Number          | `TeamQ\Datatables\Filters\NumberFilter`          | Number    |
| Date            | `TeamQ\Datatables\Filters\DateFilter`            | Number    |
| Global          | `TeamQ\Datatables\Filters\GlobalFilter`          | -         |
| HasRelationship | `TeamQ\Datatables\Filters\HasRelationshipFilter` | -         |

<details>
    <summary>Text comparison operators</summary>

| Comparison operator | Key           |
|---------------------|---------------|
| Equal               | $eq           |
| Not Equal           | $notEq        |
| Start With          | $startWith    |
| Not Start With      | $notStartWith |
| End With            | $endWith      |
| Not End With        | $notEndWith   |
| Contains            | $contains     |
| Not Contains        | $notContains  |
| In                  | $in           |
| Not In              | $notIn        |
| Filled              | $filled       |
| Not Filled          | $notFilled    |

</details>

<details>
    <summary>Number comparison operators</summary>

| Comparison operator   | Key         |
|-----------------------|-------------|
| Equal                 | $eq         |
| Not Equal             | $notEq      |
| Greater Than          | $gt         |
| Greater Than Or Equal | $gte        |
| Less Than             | $lt         |
| Less Than Or Equal    | $lte        |
| Between               | $between    |
| Not Between           | $notBetween |
| In                    | $in         |
| Not In                | $notIn      |
| Filled                | $filled     |
| Not Filled            | $notFilled  |

</details>

You can use advanced filters that have support for multiple comparison operators.
The available comparison operators are located in `TeamQ\Datatables\Enums\Comparators`

To use these advanced filters, just call them as custom filters:

```php
GET /books?filter[isbn][value]=54213&filter[isbn][operator]=$lt
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\TextFilter;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('isbn', new TextFilter()),
        ]);
```

If you want to handle relationships using join, you must pass `false` as the first parameter to the filter
and pass the type of `join` to use.

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\TextFilter;
use TeamQ\Datatables\Enums\JoinType;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('isbn', new TextFilter(false, JoinType::Inner)),
        ]);
```

#### _Text Filter_

The following example uses the comparison operator `$endWith` isbn 54213

```php
GET /books?filter[isbn][value]=54213&filter[isbn][operator]=$endWith
```

```sql
select *
from `books`
where lower(`isbn`) like '%54213'
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\TextFilter;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('isbn', new TextFilter()),
        ]);
```

#### _Number Filter_

The following example uses the comparison operator `$in` 1, 5 or 9

For this example an array of values was used. Arraying values is supported by all types of operators (text and number).

```php
GET /books?filter[id][value][0]=1&filter[id][value][1]=5&filter[id][value][2]=9&filter[id][operator]=$in
```

```sql
select *
from `books`
where id in (1, 5, 9)
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\NumberFilter;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('id', new NumberFilter()),
        ]);
```

#### _Date Filter_

The following example uses the comparison operator `$notBetween`, created at 2019-08-01 and 2019-08-10

For this example an array of values was used. Arraying values is supported by all types of operators (text and number).

```php
GET /books?filter[created_at][value][0]=2019-08-01&filter[created_at][value][1]=2019-08-10&filter[created_at][operator]=$notBetween
```

```sql
select *
from `books`
where created_at not between '2019-08-01' and '2019-08-10'
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\DateFilter;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('created_at', new DateFilter()),
        ]);
```

#### _Global Filter_

The global filter implements general search functionality for the model and its relationships.

This is not a global search engine between entities!!!
For that you can use the package [spatie/laravel-searchable](https://github.com/spatie/laravel-searchable)

To use this filter, you must pass the model fields to be filtered or their relationships.

```php
GET /books?filter[search]='Luis'
```

```sql
select *
from `books`
where (
          exists (select *
                  from `authors`
                  where `books`.`author_id` = `authors`.`id`
                    and lower(`authors`.`name`) LIKE '%Luis%')
              or
          lower(`books`.`title`) LIKE '%Luis%'
          )
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\GlobalFilter;

QueryBuilder::for(Book::class)
        ->allowedFilters([
            AllowedFilter::custom('search', new GlobalFilter([
                'author.name',
                'title',
            ])),
        ]);
```

#### _Has Relationship Filter_

This filter accepts two possible values:

- `1` to filter by "Has"
- `0` to filter by "Does not have"

Use this filter when you want the user to be able to filter on records that have associated models/relationships,
For example, you may be interested in obtaining all authors who have books.

```php
GET /books?filter[has_books]=1
```

```sql
select *
from `authors`
where exists (select * from `books` where `authors`.`id` = `books`.`author_id`)
```

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Filters\HasRelationshipFilter;

QueryBuilder::for(Author::class)
        ->allowedFilters([
            AllowedFilter::custom('has_books', new HasRelationshipFilter(), 'books'),
        ]);
```

---

### Sorts

| Sort     | Class                                 |
|----------|---------------------------------------|
| Relation | `TeamQ\Datatables\Sorts\RelationSort` |
| Case     | `TeamQ\Datatables\Sorts\CaseSort`     |

#### _RelationSort_

To sort by fields of related tables you must use `join`, there is no easy way to do it from eloquent,
so you can use `RelationSort`, this class receives the type of `join` as a parameter.

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Sorts\RelationSort;

QueryBuilder::for(Book::class)
        ->allowedSorts([
            AllowedSort::custom('author.name', new RelationSort(JoinType::Inner)),
        ])
```

#### _CaseSort_

If you use enums or states, where each enum or state is represented by a number, you may want to sort by name
of that enum or state and not by the number, then you can use `CaseSort`.

You must pass an array `[$key => $value]`, which will be used to generate the sort.

As a second parameter you can specify the type of `Join` that you want to use, if the ordering is by the field of a
related model. By default, it is `Inner Join`.

```php
use Spatie\QueryBuilder\AllowedFilter;
use TeamQ\Datatables\QueryBuilder;
use TeamQ\Datatables\Sorts\CaseSort;

QueryBuilder::for(Book::class)
        ->allowedSorts([
            AllowedSort::custom('state', new CaseSort([
                1 => 'Active',
                2 => 'Rejected',
                3 => 'Deleted',
                4 => 'Completed',
            ])),
        ]);
```

## Testing

Can use docker-compose to run

```bash
docker-compose exec app composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Luis Arce](https://github.com/luilliarcec)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
