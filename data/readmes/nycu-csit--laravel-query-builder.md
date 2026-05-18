# Laravel Query Builder

This package makes you to filter, sort, include, count eloquent model easily based on the query string from the request.

## QueryBuilder

`NycuCsit\LaravelQueryBuilder\QueryBuilder` extends laravel query builder and supports fluent interface, you can use any
laravel query builder function call on it.

```php
use NycuCsit\LaravelQueryBuilder\QueryBuilder;
use NycuCsit\LaravelQueryBuilder\OperatorSet;

QueryBuilder::for(User::class)
    ->whereNull('deleted_at')   // laravel query builder function
    ->allowedFilter('year', 'number', OperatorSet::NUMBER_NULLABLE)   // filter feature
    ->get();   // laravel query builder function
```

## Filtering

The `filter` query parameters can be used to add where clauses to your Eloquent query.
Only allowed query parameters could be parsed and built as a SQL query.  If the query parameters is not allowed, 
it will be **skipped** without any error.

The supported format of query string: 
* `filter[<parameter>][<operator>]=<value>` is JSON:API format, this format is **strongly recommended**.
* `filter[<parameter>]=<value>` is JSON:API format
* `<parameter>[<operator>]=<value>` is seen as a filter
* `<parameter>=<value>` is seen as a filter

Use `QueryBuilder` to parse query string and build query:
```php
QueryBuilder::for(User::class)
    ->allowedFilter(
        'year',                         // parameter name
        'number',                       // type
        OperatorSet::NUMBER_NULLABLE,   // allowed operators
        'registered_year',              // column name, if omitted, use parameter name as column name
        'eq',                           // default operator, 'eq' if omitted
    )
    ->toSql();
```

The SQL query of `GET /users?year[gt]=2022` will be look like this:
```sql
select * from `users` where `registered_year` > 2022
```

Add many allowed query parameter filters:
```php
QueryBuilder::for(User::class)
    ->allowedFilterMany(
        ['year', 'number', OperatorSet::NUMBER_NULLABLE, 'registered_year', 'eq'],
        ['email', 'string', OperatorSet::STRING],
        // ...
    )
    ->toSql();
```

Use `add()` to add allowed query parameter filter:
```php
use NycuCsit\LaravelQueryBuilder\Criteria\AllowedFilter;

QueryBuilder::for(User::class)
    // use add() to add any implementation of NycuCsit\Contract\CriteriaQueryBuilder
    // shorthand criteria are in NycuCsit\Criteria
    ->add([
        AllowedFilter::for('email', 'string', OperatorSet::STRING, 'other_email', 'eq')
    ])
    ->toSql();
```

### Operators

| Operator   | Meaning                    | Value                 | String                   | Number | Boolean | Datetime | Date | Time |
|------------|----------------------------|-----------------------|--------------------------|--------|---------|----------|------|------|
| `eq`       | Equals to                  | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `neq`      | Not equals to              | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `gt`       | Greater than               | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `lt`       | Less then                  | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `ge`       | Greater or equals to       | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `le`       | Less or equals to          | Any                   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `in`       | Equals to one of array     | Comma-seperated value | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `notin`    | Not equals to one of array | Comma-seperated value | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `is`       | Is                         | `null` or `notnull`   | ✅                        | ✅      | ✅       | ✅        | ✅    | ✅    |
| `like`     | Like (SQL fuzzy string)    | string                | ✅                        | ❌      | ❌       | ❌        | ❌    | ❌    |
| `year_eq`  | Year equals to             | number                | ❌                        | ❌      | ❌       | ✅        | ✅    | ✅    |
| `month_eq` | Month equals to            | number                | ❌                        | ❌      | ❌       | ✅        | ✅    | ✅    |
| `day_eq`   | Day equals to              | number                | ❌                        | ❌      | ❌       | ✅        | ✅    | ✅    |
| `date_eq`  | Date equals to             | date string (RFC3339) | ❌                        | ❌      | ❌       | ✅        | ✅    | ✅    |
| `time_eq`  | Date equals to             | time string (RFC3339) | ❌                        | ❌      | ❌       | ✅        | ✅    | ✅    |

If there aren't a specified `[operator]` , the query builder will use the default operator you specified.
By default, the operator is `eq`.

### Query Scope

The `scope` query parameters can be used to apply a
[Query Scope](https://laravel.com/docs/master/eloquent#query-scopes) to your Eloquent query. Only allowed scope could be
parsed and built as a SQL query.  If the scope is not allowed, it will be **skipped** without any error.

Supports these format of query string:
* `scope[<scopeName>]=<toggle>`
  * Toggle the scope
  * `<scopeName>` is the name of your scope, it is camelCase format
  * `<toggle>` boolean value, specify whether to apply this scope
* `scope[<scopeName>][<scopeArgumentName>]=<scopeArgumentValue>`
  * For [dynamic scope](https://laravel.com/docs/master/eloquent#dynamic-scopes)
  * `<scopeName>` is the name of your scope, it is camelCase format
  * `<scopeArgumentName>` is the argument name to be passed to the scope
  * `<scopeArgumentValue>` is the argument value to be passed to the scope

For example, you may define a scope function:
```php
// The name of this scope is 'banned'
public function scopeBanned($query)
{
    return $query->where('banned', true);
}
``` 

Use `allowedScopes()` in the query builder:
```php
QueryBuilder::for(\App\Models\User::class)
    ->allowedScopes(
        [
            'isBanned',   // parameter name
            null,         // argument transformer
            'banned'      // scope name, null if the parameter name is scope name
        ], // other scopes ...
    )
    ->toSql();
```

The query string
```
?scope[isBanned]=1
```
will be applied as `$query->banned()`.

The arguments will be passed by corresponding names, the order does not affect. If the arguments doesn't fit the scope
function's definition, this scope query string will be ignored.

#### Argument Transformer

You may check or modify the arguments array in the transformer. The transformer could be an array of callables or 
single callable, the array transformer will be invoked one by one.

The scope query builder will send the arguments in the query string of the scope to the transformers.

```php
// The name of this scope is 'ofCondition'
public function scopeOfCondition($query, string $email = '', int $id = -1, bool $active = true)
{
    return $query->where('email', $email)->orWhere('id', $id)->orWhere('active', $active);
}
```

Here is the query string:
```
?scope[ofCondition][email]=admin@test.com&scope[ofCondition][id]=946&scope[ofCondition][active]=true
```
the arguments of scope 'ofCondition' is:
```php
[
    'email' => 'admin@test.com',
    'id' => '946',
    'active' => 'true'
]
```

You may use [Cast](src/Builders/Cast.php) as transformer to cast string to other type in the arguments:

```php
use NycuCsit\LaravelQueryBuilder\Builders\Cast;

QueryBuilder::for(\App\Models\User::class)
    ->allowedScopes(
        [
            'ofCondition',   // parameter name, also scope name
            [Cast::byKey('id', 'number'), Cast::byKey('active', 'bool')],   // argument transformer
        ], // other scopes ...
    )
    ->toSql();
```

Or, you can just use a closure as transformer:
```php
function ($args) {
    $args['id'] = intval($args['id']);
}
```

## Filtering Existence

The `filter` query parameters with existence operators can be used to add
[has()](https://laravel.com/docs/9.x/eloquent-relationships#querying-relationship-existence) clauses to your Eloquent
query.
The not allowed query parameters will be **skipped** without any error.

The supported format of query string:
* `filter[<parameter>][<operator>]=<value>` is JSON:API format

Use `QueryBuilder` to parse query string and build query:
```php
QueryBuilder::for(User::class)
    ->allowedFilterExistence([
        'posts',                    // parameter name
        'news_posts',               // relationship name
        OperatorSet::EXIST_COUNT    // allowed operators, OperatorSet::EXIST if omitted
    ])
    ->toSql();
```

The SQL query of `GET /users?filter[posts][exist]=true` will be look like this:
```sql
select * from `users` where exists (select * from `news_posts` where `users`.`id` = `news_posts`.`user_id`)
```

Add many allowed query parameter existence filters:
```php
QueryBuilder::for(User::class)
    ->allowedFilterExistenceMany(
        ['posts', 'posts', OperatorSet::EXIST_COUNT],
        ['orders']
        // ...
    )
    ->toSql();
```

Use `add()` to add allowed query parameter existence filter:
```php
use NycuCsit\LaravelQueryBuilder\Criteria\AllowedFilterExistence;

QueryBuilder::for(User::class)
    ->add([
        AllowedFilterExistence::for('orders', 'orders', OperatorSet::EXIST_COUNT)
    ])
    ->toSql();
```

### Operators

| Operator    | Meaning                                        | Value  |
|-------------|------------------------------------------------|--------|
| `exist`     | Have at least one related record               | bool   |
| `exist_eq`  | Number of related records equals to            | number |
| `exist_neq` | Number of related records not equals to        | number |
| `exist_gt`  | Number of related records greater than         | number |
| `exist_lt`  | Number of related records less then            | number |
| `exist_ge`  | Number of related records greater or equals to | number |
| `exist_le`  | Number of related records less or equals to    | number |

## Including relationships

The `include` query parameter will load any Eloquent relation or relation count on the resulting models. All includes
must be explicitly allowed using allowedIncludes().

The supported format of query string:
* `include=<relation1>,<relation2>,...` is JSON:API format
* `<parameter>[include]=<value>` \<value\> is boolean

Use `QueryBuilder` to parse query string and build query:
```php
QueryBuilder::for(User::class)
    ->allowedIncludes([
        // key is parameter name, if there are no string key, use relationship name as parameter name
        // value is relationship name
        'posts' => 'news_posts',
        'orders'
        // ...
   ])
    ->toSql();
```

The SQL query of `GET /users?include=posts` will be look like this:
```sql
select * from `users`
select * from `news_posts` where `news_posts`.`user_id` in (...)
```

Be caution, you should call `allowedIncludes` or `add(AllowedIncludes...)` only once per query, because including
validation will be added in future version.

The corresponding shorthand for `add()` is `NycuCsit\LaravelQueryBuilder\Criteria\AllowedIncludes`.

## Sorting

The `sort` query parameter is used to determine by which property the results' collection will be ordered. Sorting is
ascending by default and can be reversed by adding a hyphen (-) to the start of the property name.

If there is any not allowed parameter in `sort` query parameter, an Illuminate\Validation\ValidationException
will be thrown.

The supported format of query string:
* `sort=<parameter1>,<parameter2>,...` is JSON:API format

Use `QueryBuilder` to parse query string and build query:
```php
QueryBuilder::for(User::class)
    ->allowedSorts([
        // key is parameter name, if there are no string key, use column name as parameter name
        // value is column name
        'create_time' => 'created_at',
        'email'
        // ...
   ])
    ->toSql();
```

The SQL query of `GET /users?sort=create_time,-email` will be look like this:
```sql
select * from `users` order by `created_at` asc, `email` desc
```

The corresponding shorthand for `add()` is `NycuCsit\LaravelQueryBuilder\Criteria\AllowedSorts`.

## Counting relationship

The `count` query parameter will count on the related records. All counts must be explicitly allowed using allowedCounts().

The supported format of query string:
* `count=<relation1>,<relation2>,...` is JSON:API format
* `<parameter>[count]=<value>` \<value\> is boolean


Use `QueryBuilder` to parse query string and build query:
```php
QueryBuilder::for(User::class)
    ->allowedCounts([
        // key is parameter name, if there are no string key, use relationship name as parameter name
        // value is relationship name
        'posts' => 'news_posts',
        'orders'
        // ...
   ])
    ->toSql();
```

The SQL query of `GET /users?count=posts` will be look like this:
```sql
select `users`.*, (select count(*) from `news_posts` where `users`.`id` = `news_posts`.`user_id`) as `news_posts_count` from `users`
```

As you can see, there is a new field `news_posts_count` is appended, but the field name will be`<relationName>_count` instead
of `<parameterName>_count`.

The corresponding shorthand for `add()` is `NycuCsit\LaravelQueryBuilder\Criteria\AllowedCounts`.

## Extra Queries for single Model

### Eager Loading

Sometimes, we want to load relationships for a model by query string. Just use
[HasExtraQuery](src/ModelCriteria/HasExtraQuery.php) trait in your model class:

```php
use NycuCsit\LaravelQueryBuilder\ModelCriteria\HasExtraQuery;

class Post extends Model
{
    use HasExtraQuery;

    // ...
}
```

The supported format of query string:
* `load[<parameterName>]=<value>` is JSON:API format
  * `<parameterName>` the name which you want to eager load
  * `<value>` boolean value, toggle the eager loading

Now, you can use `allowedLoad()` function on your model:
```php
$post = Post::find($id);
$post->allowedLoad(/* parameter name */'author', /* relation name */'user');
```

The query string `&load[author]=1` will be applied as `$post->load('user')`.

The `allowedLoad()` function supports fluent interface.
