
# BladeBundler

a super efficient package to bundle all similar structures for your Laravel blades. Using this package will give you incredible development speed, which is necessary at critical points. You will be able to customize it to any level you want.


## Installation

Like any other packages in the Packagist you'll need to add service provider and Facade aliases into your config/app.php using the following lines:

first of all, you need to run the following command in the root directory of your app in the terminal:
```bash
  composer require lhaamed/blade-bundler
```

then, add this as a service provider in the "providers" array:
```bash
  BladeBundler\BladeBundlerServiceProvider::class,
```


then add this as an alias in the "aliases" array:
```bash
  'BB' => BladeBundler\BB::class
```

never forget to use the following commands in the terminal because you have changed config files.


```bash
  php artisan optimize
```
```bash
  composer du
```

## what is ListBundle
The ListBundle is a Bundle that helps you create the main structure of your lists in a better way using the package principles.
you can have different lists for every model and any kind of usage. for example, for showing a list of users you can have different types of lists and in each controller, you can call any of them by just changing the function name in the listGenerator function. the advantage of this system is having both Collection base and Paginated base lists. it means you can pass the data as Collection or Paginated Object and based on the type of data the Bundler generates the desired bundle for you. In this release, there is no view for lists by default. don't forget that we are working on making things easier for you not causing troubles in the dev process. By getting dd() from the ListBundle object you'll find out how to show it in your blade file. not having certain view files for lists helps you bind the ListBundle with your theme at any level of complexity.

## how to use ListBundle 

this package will help you to organize generating forms and table lists in your app. so you can have full control over all existing forms and lists in any aspect.
To have a list you need your $query which could be paginated or not. if you pass the paginated query you'll get the bundle paginated and if you don't it gives the bundle properly.
the other parameter that is necessary to make a bundle is a map function. the bundler with pass the query through the map function to generate the list as you desire.
```bash
  $paginated_query = User::paginate(30)->onEachSide(2);
  $listBundle = BB::generateList($paginated_query,['this','defaultListMap']);
```
or
```bash
  $collected_query = User::all();
  $listBundle = BB::generateList($collected_query,['this','defaultListMap']);
```

so let's take a look at the map function structure.
```bash
public static function defaultListMap(listBundle $listBundle ,LengthAwarePaginator|Collection $query): listBundle
{
    $items = BB::getQueryItems($query);

    $mappedData = array_map(function ($eachRecord) use ( $query) {
        $recordModel = $query->find($eachRecord['id']);
        $action_links = [];

        return [
            $recordModel->showName(),
            $recordModel->showLastname(),
            'actions' => $action_links
        ];
    }, $items);

    $listBundle->setTitle('custom title for the list');
    $listBundle->setTableHeader([
        'name',
        'lastname',
        'actions',
    ]);
    $listBundle->setTableRecords($mappedData);

    return $listBundle;
}
```

in this function, you define what are the heads and each cell's exact value. so you have full control over your list in a better way.


## what is FormBundle
The FormBundle is a Bundle that helps you create forms in Bootstrap structure. After creating the Form via the FormGenerator you have to append a new section. In each section, you are allowed to append rows and inside the rows, you can append your cells. each cell contains input and you can see the list of supported inputs in the following:


## License

[MIT](https://choosealicense.com/licenses/mit/)

