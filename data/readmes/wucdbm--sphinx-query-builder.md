# sphinx-query-builder

## TODO
- Add `->match($something)` shorthand

## Notes
- If you are using this library standalone and need events, require `illuminate/events` and set a Dispatcher instance to your SphinxConnection if you need events.
- If you're using this package with Laravel, please refer to `\Illuminate\Database\Connection::resolverFor` where you can set a factory callback that accepts the same parameters as `ConnectionFactory::createConnection`.

## Example Usage

```php
<?php

namespace MyApp\SomeFactory;

use Illuminate\Container\Container;
use Illuminate\Database\Connectors\MySqlConnector;
use Illuminate\Database\Events\StatementPrepared;
use Illuminate\Events\Dispatcher;
use Wucdbm\Component\SphinxQueryBuilder\SphinxConnection;

class ConnectionFactory {

    // Example simple usage
    public static function create(
        string $driver, string $host, string $port,
        string $db, string $user, string $pass
    ): SphinxConnection {
        $config = [
            'driver'    => $driver,
            'host'      => $host,
            'port'      => $port,
            'database'  => $db,
            'username'  => $user,
            'password'  => $pass,
            'charset'   => 'utf8',
            'prefix'    => '',
        ];

        $connector = new MySqlConnector();
        $pdo = $connector->connect($config);

        return new SphinxConnection($pdo, $config['database'], $config['prefix'], $config);
    }
   
    // Attach an event dispatcher and force fetch mode to `\PDO::FETCH_ASSOC` 
    public static function withEvents(
        SphinxConnection $c
    ): Dispatcher {
        $dispatcher = new Dispatcher(new Container());
        $c->setEventDispatcher($dispatcher);

        $dispatcher->listen(StatementPrepared::class, static function(StatementPrepared $event) {
            $statement = $event->statement;
            $statement->setFetchMode(\PDO::FETCH_ASSOC);
        });

        return $dispatcher;
    }

}
```

```php
<?php

$connection = \MyApp\SomeFactory\ConnectionFactory::create(
    'sphinx', '127.0.0.1', '9306',
    '', '', ''
);
$dispatcher = \MyApp\SomeFactory\ConnectionFactory::withEvents($connection);

// ...
```

```php
<?php

namespace MyApp\SomeModule;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Wucdbm\Component\SphinxQueryBuilder\SphinxConnection;
use MyApp\MyFilterAndPaginationDTO;

class SomeRandomModule {

    /** @var SphinxConnection */
    private $db;

    public function __construct(SphinxConnection $db) {
        $this->db = $db;
    }

    public function stats(MyFilterAndPaginationDTO $filter): Collection {
        $fromDate = $filter->getFromDate();
        $fromDate->setTime(0, 0, 0);
        $toDate = $filter->getToDate();
        $toDate->setTime(23, 59, 59);

        $pagination = $filter->getPagination();

        $builder = $this->db->table('my_sphinx_index');
        $builder->select([
            $builder->raw('COUNT(*) AS cnt'),
            'provider_id',
            'status_id',
            $builder->raw('AVG(duration) AS avgduration'),
            $builder->raw('YEAR(date) AS year'),
            $builder->raw('MONTH(date) AS month'),
            $builder->raw('DAY(date) AS day')
        ])
            ->whereBetween('date_created', [
                $fromDate->getTimestamp(), $toDate->getTimestamp()
            ])
            ->orderBy('cnt', 'DESC')
            ->limit($filter->getLimit())
            ->offset($pagination->getOffset());
        
        $builder->groupBy(['provider_id']);

        if ($status = $filter->getStatus()) {
            $builder->where('status_id', '=', $status->getId());
        }

        // You also need to configure this in sphinx.conf
        $builder->maxMatches(10000);

        return $this->paginate($filter, $builder);
    }

    public function paginate(MyFilterAndPaginationDTO $filter, Builder $builder): Collection {
        $result = $builder->get();

        $pagination = $filter->getPagination();
        $meta = $builder->getConnection()->select('SHOW META');

        foreach ($meta as $obj) {
            switch ($obj['Variable_name']) {
                // total, total_found, time
                case 'total':
                    $pagination->setTotalResults($obj['Value']);
                    break;
                case 'time':
                    $filter->setQueryExecTime($obj['Value']);
            }
        }

        return $result;
    }

}
```
