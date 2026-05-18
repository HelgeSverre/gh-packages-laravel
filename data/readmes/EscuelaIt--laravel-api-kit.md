# laravel-api-kit

Utils to create consisten APIs in Laravel.

## Installation

Install the package via Composer:

```bash
composer require escuelait/laravel-api-kit
```

That's it! The package will automatically register its service provider.

**Laravel compatibility**: Laravel 9.0+ and PHP 8.1+. 

## Built-in Utilities in this Package

This package offers two fundamental utilities for developing APIs that usually require significant work and are quite repetitive across different API resources.

1. Searches and listings on resources with or without pagination
2. Execution of actions on batches of elements

The package provides mechanisms that significantly simplify these two operations, allowing fine-grained customization of their behavior, which eliminates much of the tedious development work for resources.

## Consistent API Responses

Using the mechanisms proposed by this API utilities kit, you will ensure your resources work consistently, allowing your clients to work more predictably.

One of the keys to achieving this is the use of a library that provides a common interface for generating JSON responses: [Laravel API Response Wrapper](https://github.com/negartarh/apiwrapper). Thanks to it, a homogeneous API response schema is always used.

We encourage you to use it as well in the development of other API operations where this kit does not provide ready-made solutions.

## Frontend Components

This library can be perfectly combined with the catalog of [CRUD Components for Dile Components frontend](https://dile-components.com/crud/).

Thanks to Dile Components' CRUD frontend components, you can easily build user interfaces to provide listings, filtering, sorting, batch action processing, as well as other operations like insertions, edits, and deletions.

If you already use Dile Components' CRUD components, you'll see that applying the Laravel solutions kit allows you to build the backend much faster.

## Searches in Resource Index

Laravel API Kit provides convenient search and filtering features that can be easily implemented in API resources or in any situation where you need to return collections of elements in JSON format.

To implement this utility, two components are required:

- The `ResourceListable` trait in a controller, which provides a `list()` method for generating listings.  
- A listing service, based on `ListService`, for implementing searches on models.

### The ResourceListable Trait

To achieve listing functionality, we simply need to implement the `ResourceListable` trait in a controller.

```php
namespace App\Http\Controllers;

use EscuelaIT\APIKit\ResourceListable;

class ListUsersController extends Controller
{
    use ResourceListable;

    public function index()
    {
        return $this->list($userListService);
    }
}
```

Thanks to implementing the `ResourceListable` trait in the controller, several utilities are obtained, mainly:

- `list()` method that returns model data in JSON, performing filtering and sorting of elements, as well as optional pagination.
- `allIds()` method that allows obtaining the complete list of model identifiers given a query, once filters are applied. It's useful when you want to know all the elements that are part of a result set, regardless of pagination, to request batch actions on them.
- `findIncluding()` method that returns JSON response with a single idenfified item or a not found response if the item is not found, including optional relationships.

All this methods require receiving a service that allows detailed configuration of query aspects, such as the model to operate on or the types of filtering, among other things.

Below is an example of a controller that provides the functionalities offered by the trait:

```php
namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use EscuelaIT\APIKit\ResourceListable;
use App\Services\User\UserListService;

class ListUsersController extends Controller
{
    use ResourceListable;

    public function index()
    {
        $service = new UserListService();
        return $this->list($service);
    }

    public function ids()
    {
        $service = new UserListService();
        return $this->allIds($service);
    }
}
```

The listing customization service is what allows the `ResourceListable` trait to work generically, being able to operate on any entity you want to incorporate as an API resource. 

### ListService

`ListService` is the base class for services used to configure how listings behave for each resource. To define the behavior of a resource’s listing, you must pass to the `list()` method a ListService, usually extending the `ListService` class provided by this package.

Within `ListService`, you can configure various search and filtering behaviors to be applied in your resource controller. However, for a basic implementation, you only need to specify the model that the listing should use.

To do this, define a `$listModel` property and assign it the model class you want to use for listings.

```php
namespace App\Http\Controllers\User;

use App\Models\User;
use EscuelaIT\APIKit\ListService;

class UserListService extends ListService
{
    protected string $listModel = User::class;
}
```

To make your controller more testable, you can delegate the service instantiation to Laravel’s service container by injecting the instance through the controller’s constructor.

```php
class ListUsersController extends Controller
{
    use ResourceListable;

    public function __construct(
        private UserListService $userListService
    ) {}

    public function index()
    {
        return $this->list($this->userListService);
    }
}
```

### JSON Response in Listings

With the default configuration, calling the controller’s method will return a JSON response like the following:

```json
{
  "status": 200,
  "message": "3 items found",
  "data": {
    "countItems": 3,
    "result": {
      "current_page": 1,
      "current_page_url": "http:\/\/localhost\/api\/users?page=1",
      "data": [
        {
          "id": 1,
          "name": "Dr. Richie Considine MD",
          "email": "lizeth21@example.com"
        },
        {
          "id": 2,
          "name": "Prof. Erling Harris",
          "email": "nikita.skiles@example.com"
        },
        {
          "id": 3,
          "name": "Sabrina Lubowitz",
          "email": "tanya54@example.com"
        }
      ],
      "first_page_url": "http:\/\/localhost\/api\/users?page=1",
      "from": 1,
      "next_page_url": null,
      "path": "http:\/\/localhost\/api\/users",
      "per_page": 10,
      "prev_page_url": null,
      "to": 3
    }
  },
  "errors": [],
  "execution": "64ms",
  "version": "1"
}
```

### ListService Configuration via Properties

Inside a resource’s `ListService`, several properties can be configured to customize how listings behave:

- **`$listModel`** Defines the model class used for the listing.  
- **`$identifierField`** The database table field to identify resource items, default is 'id'.
- **`$paginated`** Determines whether the resource results should be paginated. The default value is `true`, meaning pagination is enabled.  
- **`$maxPerPage`** Sets the maximum page size allowed for paginated results. The default value is `null`, meaning no limit is enforced. When set to a positive integer, any `per_page` request exceeding this value will be automatically capped to the configured maximum. This is useful for preventing performance issues from excessively large page requests, e.g.:  
  ```php
  protected ?int $maxPerPage = 100;
  ```
  You can also configure this using the `setMaxPerPage()` method:  
  ```php
  $service->setMaxPerPage(50);
  ```
- **`$availableFilterColumns`** Specifies which columns of the resource are available for filtering. The default value is `null`, allowing filtering by any field. For security reasons, it’s recommended to explicitly restrict this array to only the columns that should be searchable, e.g.:  
  ```php
  protected ?array $availableFilterColumns = ['is_admin', 'country'];
  ```
- **`$availableScopes`** Specifies which scopes are allowed to be applied via the `belongsTo` and `relationId` configurations. The default value is `null`, allowing any scope to be applied. For security reasons, it's recommended to explicitly restrict this array to only the scopes that should be allowed, e.g.:  
  ```php
  protected ?array $availableScopes = ['byTeam', 'published'];
  ```
- **`$availableIncludes`** Specifies which relationships are allowed to be included via the `include` QueryString parameter. The default value is `null`, allowing any relationship to be included. For security and performance reasons, it's recommended to explicitly restrict this array to only the relationships that should be loadable, e.g.:  
  ```php
  protected ?array $availableIncludes = ['comments', 'author', 'tags'];
  ```
- **`$searchConfiguration`** Holds an array defining the search configuration for listings. This allows fine-grained customization of multi-parameter searches. The property stores the default configuration but can be overridden using the `setSearchConfiguration()` method, which merges new settings with the existing defaults to adapt searches for specific listings.
- **`$maxFilters`** Sets the maximum number of filters allowed per query. The default value is `null`, meaning no limit is enforced. When set to a positive integer, any number of active filters exceeding this value will be automatically capped to the configured maximum without raising an error.
- **`$maxIds`** Defines the maximum number of IDs that will be returned when calling the ids() method of the ResourceListable trait, preventing an excessive number of items from being returned that could overload the system. The default value is 100. It can be set to null, in which case there will be no limit.

### QueryString Configurations for Listing Operations

When working with the `ResourceListable` trait, listing configurations are retrieved from QueryString variables (sent via the URL). These configurations are automatically passed to the `ListService` to customize its behavior. This approach makes it easy to introduce numerous listing customizations that can change with each resource listing request.

**Example of a listing query with QueryString variables:**

```
https://example.com/api/users?sortField=email&sortDirection=desc&per_page=25&keyword=miss&filters[0][name]=is_admin&filters[0][active]=true&filters[0][value]=true
```

#### "keyword" Configuration

Allows sending a keyword to search the model for that keyword.

```
example.com/users?keyword=paul
```

This configuration doesn’t perform any search by itself. You must enable it in the `ListService` by overriding the `applyKeywordFilter()` method:

```php
protected function applyKeywordFilter(?string $keyword): void 
{
    if (!empty($keyword)) {
        $keyword = '%' . $keyword . '%';
        return $query->where('name', 'like', $keyword)->orWhere('email', 'like', $keyword);
    }
}
```

**Recommendation**: Delegate the search to the model using a scope. Here’s an example using a `similar()` scope:

```php
protected function applyKeywordFilter(?string $keyword): void 
{
    $this->query->similar($keyword);
}
```

You need to implement this scope with your query logic in the corresponding model. Here's an example implementation:

```php
public function scopeSimilar($query, $keyword)
{
    if (empty($keyword)) {
        return $query;
    }

    $keyword = '%' . $keyword . '%';
    return $query->where(function ($q) use ($keyword) {
        $q->where('title', 'like', $keyword)
            ->orWhere('status', 'like', $keyword);
    });
}
```

#### "sortField" and "sortDirection" Configuration

These two configurations together define the order of search results.

```
example.com/users?sortField=name&sortDirection=desc
```

You can specify any model field to achieve the desired listing order.

Valid `sortDirection` values are `"asc"` (ascending) and `"desc"` (descending).

#### "per_page" Configuration

Allows specifying a custom page size for the resource listing.

```
example.com/users?per_page=25
```

This is only considered if the resource is paginated. To disable pagination, set the `$paginated` boolean property to `false` in `ListService`:

```php
protected bool $paginated = true;
```

If pagination is enabled, the default page size is 10.

**Limiting Maximum Page Size**: You can enforce a maximum page size using the `$maxPerPage` property. If a user requests a `per_page` value exceeding this limit, it will be automatically capped to the configured maximum without raising an error:

```php
protected ?int $maxPerPage = 100;
```

For example, if `$maxPerPage` is set to `100` and a user requests `per_page=500`, the listing will return a maximum of 100 items per page. This helps prevent performance degradation from excessively large page requests.

#### "filters" Configuration

The `"filters"` configuration allows enabling any number of filters via an array. For each filter, the following data is expected:

- **`active`**: Indicates whether the filter should be applied. If `active` is not received, the filter won’t be processed.
- **`name`**: Column for filtering.
- **`value`**: Value to search for in that column.

For a filter to be processed (with `active: true`), the column must be listed in the `ListService`’s `$availableFilterColumns` array, or that property must be `null` (allowing any column).

> **For enhanced privacy and security, it’s highly recommended to configure the `$availableFilterColumns` array in `ListService`** to prevent users from enabling unintended filters.

**Example**: If the QueryString filters array is:

```json
[
  {
    "name": "is_admin",
    "active": "true",
    "value": "true"
  },
  {
    "name": "country",
    "active": "true",
    "value": "Spain"
  },
  {
    "name": "continent",
    "active": "false",
    "value": "Asia"
  }
]
```

This would filter items where `is_admin = true` **and** `country = Spain`. The `continent` filter would be ignored because `active` is `false`.

**Limiting Maximum Number of Filters**: You can enforce a maximum number of filters that can be applied simultaneously using the `$maxFilters` property. If the number of active filters exceeds this limit, only the first filters up to the maximum will be applied without raising an error:

```php
protected ?int $maxFilters = 5;
```

For example, if `$maxFilters` is set to `2` and a user sends 4 active filters, only the first 2 filters will be applied. This helps prevent performance issues from overly complex queries with too many filter conditions.

#### Custom Filters Implementation

Database column-based filtering is convenient but often insufficient. This package supports custom filters defined by developers.

To implement custom filters, follow these steps:

1. Create a custom filter class.
2. Register custom filters in the `ListService`’s `customFilters()` method.
3. Send the necessary data via QueryString to activate/configure the filter.

Custom filters provide full Eloquent power, allowing complex queries across model columns or related data without restrictions.

##### Creating a Filter Class

First, implement a class defining the custom filter behavior. This class must extend `CustomFilter`:

```php
use EscuelaIT\APIKit\CustomFilter;

class EuropeFilter extends CustomFilter
{
    // ...
}
```

The class must define a `$filterName` property with the filter’s name and an `apply()` method that receives an `Illuminate\Database\Eloquent\Builder` instance:

```php
class SpanishOrBrazilianFilter extends CustomFilter
{
    protected $filterName = 'hispanic_brazilian';

    public function apply(Builder $query): void
    {
        $query->where(function (Builder $subQuery) {
            $subQuery
                ->where('nationality', 'Spanish')
                ->orWhere('nationality', 'Brazilian');
        });
    }
}
```

The above filter would restrict results to items where `nationality` is Spanish or Brazilian.

To access the filter value from QueryString, use `getFilterValue()`:

```php
class TitleContainsFilter extends CustomFilter
{
    protected $filterName = 'title_contains';
    
    public function apply(Builder $query): void
    {
        $value = (string) $this->getFilterValue();
        if ($value !== '') {
            $query->where('title', 'like', '%' . $value . '%');
        }
    }
}
```

**Other available `CustomFilter` methods**:
- `getFilterName()`: Returns the filter name.
- `getFilterData()`: Returns complete filter data from QueryString.
- `isFilterActive()`: Indicates if the filter is active.

##### Registering Filters in customFilters()

In your `ListService`, override the `customFilters()` method to return an array of custom filter instances:

```php
protected function customFilters(): array
{
    return [new TitleContainsFilter()];
}
```

##### Sending Filter Data via QueryString

Include the filter data in the QueryString variables:

```json
[
  {
    "name": "title_contains",
    "active": true,
    "value": "foo"
  }
]
```

- **`name`**: Matches the `$filterName` defined in the filter class.
- **`active`**: Must be `true` to apply the filter (otherwise, `apply()` won’t be called).
- **`value`**: Data passed to the filter for processing.


#### belongsTo and relationId Configurations

Filtering configurations are designed to be dynamically modified by user input, allowing each resource listing request to have highly variable queries.

However, there are cases where you want to **fix certain listing behaviors independently**, without allowing users to modify them via filters. For example, you might want to display a listing showing only invoices for a specific client, where that client cannot be changed via filters. In these cases, you can use **belongsTo** and **relationId** configurations for fixed filtering.

Let’s examine how this property works with an example. Suppose you’re working with a `User` resource model. Users belong to a `Team` model via a `BelongsToMany` relationship:

```php
public function teams(): BelongsToMany
{
    return $this->belongsToMany(Team::class);
}
```

In the `User` model, you can create a scope to filter users by a team identifier:

```php
public function scopeByTeam($query, $teamId) {
    return $query->whereHas('teams', function($query) use ($teamId) {
        $query->where('team_id', $teamId);
    });
}
```

To activate this scope-based filtering via QueryString, send the following configurations:

- **`belongsTo`** variable with value `"byTeam"`
- **`relationId`** variable as an integer

**Example URL:**

```
https://example.com/api/users?belongsTo=byTeam&relationId=2
```

This will activate a scope named `byTeam` on the resource model, passing `2` as the parameter, returning **only users belonging to the team with `id=2`**.

##### Restricting Allowed Scopes with $availableScopes

Similar to `$availableFilterColumns`, you can restrict which scopes are allowed to be applied via the `belongsTo` configuration by setting the `$availableScopes` property.

By default, `$availableScopes` is `null`, which means any scope can be applied via QueryString. For security reasons, it's recommended to explicitly define which scopes are allowed:

```php
protected ?array $availableScopes = ['byTeam', 'published'];
```

With this configuration, only the `byTeam` and `published` scopes can be applied. Any attempt to apply a different scope via QueryString will be ignored.

> **For enhanced security, it's highly recommended to configure the `$availableScopes` array in `ListService`** to prevent users from enabling unintended scopes that might expose sensitive data or cause undesired filtering behavior.

#### "include" Configuration

The `"include"` configuration allows eager loading of related entities in listing results. This is useful for including associated data (like comments on posts, or payments for users) without requiring additional queries.

```
example.com/posts?include=comments,author
```

You can specify multiple relationships separated by commas. The data will be eager-loaded using Laravel's `with()` method.

##### Restricting Allowed Includes with $availableIncludes

Similar to `$availableFilterColumns` and `$availableScopes`, you can restrict which relationships are allowed to be included via the `include` parameter by setting the `$availableIncludes` property.

By default, `$availableIncludes` is `null`, which means any relationship can be included via QueryString. For security and performance reasons, it's recommended to explicitly define which relationships are allowed:

```php
protected ?array $availableIncludes = ['comments', 'author', 'tags'];
```

With this configuration, only the `comments`, `author`, and `tags` relationships can be included. Any attempt to include other relationships via QueryString will be ignored.

You can also set the available includes using the `setAvailableIncludes()` method:

```php
$service = (new ListService())
    ->setListModel(Post::class)
    ->setAvailableIncludes(['comments', 'author'])
    ->setSearchConfiguration($config);
```

**Example URL with allowed includes:**

```
https://example.com/api/posts?include=comments,author
```

This will return posts with their related comments and authors eager-loaded.

**Example with restricted includes:**

If `$availableIncludes` is set to `['comments']` but you request `?include=comments,author`, only the `comments` relationship will be included. The `author` relationship will be ignored because it's not in the allowed list.

> **For enhanced security and performance, it's highly recommended to configure the `$availableIncludes` array in `ListService`** to prevent users from eager-loading potentially expensive relationships that might impact application performance or expose sensitive data through related entities.

### List Service methods

#### setSearchConfigurationValue

Sets a specific value in the search configuration array.

**Description:**
This method allows you to set individual properties of the `$searchConfiguration` array without needing to pass an entire array. It follows the fluent interface pattern, enabling method chaining with other service methods.

**Parameters:**
- `string $key` - The configuration property name to set (e.g., 'keyword', 'perPage', 'sortField')
- `mixed $value` - The value to assign to the configuration property. If the value is `null`, it will not be set.

**Returns:**
`ListService` - Returns the service instance for method chaining.

**Example Usage:**
```php
$listService = new ListService();
$listService->setListModel(Post::class)
    ->setSearchConfigurationValue('keyword', 'laravel')
    ->setSearchConfigurationValue('perPage', 20)
    ->setSearchConfigurationValue('sortField', 'created_at')
    ->setSearchConfigurationValue('sortDirection', 'desc');

$results = $listService->getResults();
```

- This method provides a convenient alternative to `setSearchConfiguration()` when setting a single value
- Null values are ignored and will not update the configuration
- This method supports method chaining for a fluent API

## Resource Actions

Besides typical CRUD operations, applications often require additional behaviors to complete custom business operations. For example, for an invoice you might need an action to create a duplicate, or for a quote you might need an action to generate an invoice from it.

Additionally, some of these operations sometimes need to be performed in batches. For example, marking a series of invoices as paid, or sending a notification to a series of users, without having to perform the same action one by one.

To simplify these functionalities, the Laravel Api Kit package provides resource actions, a consistent way to handle common API operations for resources.

To build these actions, we need to define a couple of components:

- A single controller to receive all action execution requests on a model in a unified way.
- A service that defines how actions should be executed, indicating which model they operate on, what actions are possible, etc.

Additionally, configuring the actions requires defining the action itself, which contains the logic needed for its execution. Each action is implemented in its own dedicated class.

### Action Controller

We will need a single controller to execute all necessary actions on an entity. This controller will receive the data to process the action via POST, such as the action type, the identifiers of the elements on which the action should be executed, and any additional data the action needs.

To define the controller, we will create a route like this:

```php
Route::post('/users/action', ActionUsersController::class);
```

### ActionHandler Trait

To easily implement the action controller, the `ActionHandler` trait is provided, which must be used in the controller that receives the action data to process.

```php
namespace App\Http\Controllers\User;

use EscuelaIT\APIKit\ActionHandler;

class ActionUsersController extends Controller
{
    use ActionHandler;
}
```

Inside the controller, you must implement the method configured in the POST route and invoke the `handleAction()` method provided by the `ActionHandler` trait, passing an instance of the `ActionService` that defines the action system configuration.

```php
public function __invoke()
{
    $userActionService = new UserActionService();
    return $this->handleAction($userActionService);
}
```

The previous `__invoke` method is because we've chosen to use an invokable controller, although this is not a requirement for the action system to work.

For convenience, it's always useful to have the `ActionService` instance injected into the method, delegating to Laravel's service container the instantiation of the corresponding service.

```php
public function __invoke(UserActionService $userActionService)
{
    return $this->handleAction($userActionService);
}
```

The controller expects to receive a payload like the following:

```json
{
    "type": "SetAdminUserAction",
    "relatedIds": [
        "3",
        "5"
    ],
    "data": {
        "is_admin": false
    }
}
```

- `type`: the type of action that will be executed
- `relatedIds`: the identifiers of the models on which the action will be executed
- `data`: any set of data that the action requires to be processed

### ActionService

To configure the action system for each entity, we use the `ActionService` class provided by the Laravel API Kit package.

The most common approach is to create our own service by extending the `ActionService` class and making the appropriate configurations.

```php
namespace App\Services\User;

use App\Models\User;
use EscuelaIT\APIKit\ActionService;
use EscuelaIT\APIKit\Actions\DeleteAction;

class UserActionService extends ActionService
{
    protected string $actionModel = User::class;
    protected array $actionTypes = [
        'DeleteAction' => DeleteAction::class,
    ];
}
```

#### ActionService Properties

The properties that can be configured in the custom `ActionService` are the following:

##### `$actionModel` Property

Allows defining the class of the model that will be used to process the actions.

```php
protected string $actionModel = User::class;
```

##### `$actionTypes` Property

This is an associative array that defines the types of actions that can be performed on a model. In this array, the keys will be the action name, which corresponds to the `type` value received by the controller via POST. The value will be the action class responsible for processing it.

```php
protected array $actionTypes = [
    'DeleteAction' => DeleteAction::class,
    'SetAdminUserAction' => SetAdminUserAction::class,
];
```

##### `$maxModelsPerAction` Property

Allows specifying the maximum number of elements on which an action is allowed to be executed.

The default value of this property is 100, so if an action is requested to be executed on more than 100 elements, a validation error will occur, sending an HTTP 422 response code with a message.

```php
protected int $maxModelsPerAction = 50;
```

##### `$identifierField` Property

This is the field in the model's table where matches will be looked for to determine which elements should be processed.

The default value is `id`. So it expects that when requesting action processing, the identifiers of the elements are sent in the `relatedIds` field sent via POST to the controller.

For example, it could be set to `slug` if what we will receive in the `relatedIds` field are the slugs of the elements on which we want to process the actions.

```php
protected string $identifierField = 'slug';
```

#### ActionService Methods

Although not common, if you want to further customize the service's behavior, besides the previous properties, you can override methods that allow performing arbitrary actions.

- `createQuery()`: initializes the query
- `queryModels()`: filters the models with the received identifiers
- `getModels()`: returns the collection of models resulting from the query

For example, this would restrict the `ActionService` to execute actions only on users who are not administrators.

```php
protected function createQuery()
{
    return User::where('is_admin', false);
}
```

With the following code in the `createQuery()` method, you can ensure that the listed items always belong to the company associated with the current user.

```php
protected function createQuery()
{
    $user = Auth::user();
    throw_if(is_null($user), AuthenticationException::class);
    
    return $this->actionModel::query()->where('company_id', $user->company_id);
}
```

### Actions

To define particular behaviors for each type of action, we use action classes. Actions must extend the abstract `CrudAction` class.

The `ActionHandler` trait will call the corresponding action, deduced from the `type` value and according to the corresponding class in the `$actionTypes` array of the `ActionService`.

When building the action, three pieces of data will be available:

- The user authenticated in this request, or `null` if none exists. This user will be stored as the `$user` property.
- The related models based on the query, available in the `$models` property.
- The data sent in the request to the controller in the `data` field of the payload. This data will be available in the `$data` property.

With this data, an action can be defined as shown in the following example:

```php
namespace App\Actions\User;

use EscuelaIT\APIKit\CrudAction;
use EscuelaIT\APIKit\ActionResult;

class SetAdminUserAction extends CrudAction {

    protected function validationRules(): array {
        return [
            'is_admin' => 'nullable|boolean',
        ];
    }

    public function handle(): ActionResult
    {
        foreach($this->models as $model) {
            if($this->user->can('update', $model)) {
                $model->is_admin = $this->data['is_admin'];
                $model->save();
            }
        }
        return $this->createActionResultSuccess('Admin updated', [
            'new_value' => $this->data['is_admin'],
        ]);
    }
}
```

The `validationRules()` method allows defining validation rules for the data set contained in the `data` field of the payload.

The `handle()` method is responsible for processing the action. Typically in this method, you iterate over each of the models in the `$models` property. For each model, you can check if the user has permission to perform the actions and then execute the action if possible.

Finally, the action must return a response by sending an instance of the `ActionResult` class. To facilitate creating the response in the appropriate format, the `CrudAction` class provides a utility method:

- `createActionResultSuccess($message, $data)`: Allows generating an `ActionResult` instance for a positive response, sending a response message and an array of data to be reported to the client that requested the action.

The action processing flow already provides all the mechanisms to validate the action data, both the action format itself and the format of the specific data required by each type of action. Therefore, it's normal that if the `handle` method is executed, the action can be processed. However, if for any reason additional checks are needed and extra errors must be sent, this can be done in the `handle` method using another utility method that allows producing an error response message.

- `createActionResultError($message, $errors)`: Allows generating an `ActionResult` instance for a negative response, sending a message and an associative array of errors.

The `handle()` method of the action must return the `ActionResult` instance, created by the `createActionResultSuccess()` or `createActionResultError()` methods. However, if these methods are not sufficient, you can also directly use the static `success()` or `error()` methods of the `ActionResult` class.

#### Action Response Formats

Once the action is processed, a response will be sent to the client. The format is consistent with other response formats from other types of API requests.

In case of success, a JSON will be sent to the client in this format:

```json
{
    "status": 200,
    "message": "Admin updated",
    "data": {
        "msg": "Admin updated",
        "action": "SetAdminUserAction",
        "data": {
            "new_value": false
        }
    },
    "errors": [],
    "execution": "84ms",
    "version": "1"
}
```

In case of a validation error, the response format would be the following:

```json
{
    "status": 422,
    "message": "The provided data is not valid.",
    "errors": {
        "foo": [
            "The foo field is required."
        ]
    },
    "data": [],
    "execution": "197ms",
    "version": "1"
}
```

### ActionResult Class

This class is used internally to create homogeneous action responses. It is prepared to create both positive and negative messages.

To create instances, the only available methods are the following:

#### `success()` Method

```php
static function success(string $message = 'Ok', array $data = []): ActionResult
```

Returns an `ActionResult` instance configured as a success response.

```php
$actionSuccessInstance = ActionResult::success('Action completed successfully', [
    'total_received' => 5, 
    'successfully_processed' => 4,
]);
```

#### `error()` Method

```php
static function error(array $errors = [], string $message = 'Error'): ActionResult
```

Returns an `ActionResult` instance configured as an error response.

The `$errors` parameter expects an associative array of errors where the keys are the fields where the error occurred and the values are the specific errors found.

```php
$actionErrorInstance = ActionResult::error([
    'count' => ['The field count must be a number']
], $message);
```
