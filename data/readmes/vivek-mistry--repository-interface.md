<p align="center">
  <img src="docs/images/repository_interface.png" alt="Repository Interface"  width="80%">
</p>

## Laravel Repository Interface

A Laravel package that leverages dependency injection to cleanly separate business logic from other application layers, promoting better code organization, testability, and adherence to SOLID principles

## 🛠️ Installation

Install the package via Composer:
```bash
composer require vivek-mistry/repository-interface
```

## Get Plain Repository Interface
```bash
php artisan app:make-repo {ModelName} --plain
```

## Particular Model Generate the Repository-Interface
```bash
php artisan app:make-repo {ModelName}
```
With basic functions you will get here like,
<ul>
<li>public function createOrUpdate(array $data, $id = null);</li>
<li>public function getAll($draw = null, $start = null, $rawperpage = null);</li>
<li>public function getRecordById($id, array $with = []);</li>
<li>public function getRecordByField(string $field_name, string $field_value);</li>
</ul>

So using above two files created at app/Repositories/Interface & app/Repositories/Repository
<ul>
<li>ModelNameInterface.php</li>
<li>ModelNameInterfaceRepository.php</li>
</ul>


## Create Service Prvider
```bash
php artisan make:provider RepositoryServiceProvider
```

## Register Your Service Provider & register your repository
<P>=> Register your service provider</P>
<P>=> In your RepositoryServiceProvider add below : </P>
    
```php
    public function boot(): void
    {
        $this->app->bind(
            INTERFACE_NAME::class,
            REPOSITORY_NAME::class
        );
    }
```    

## HOW TO USE IN YOUR CONTROLLER? 

For example : 

```php
class UserController extends Controller
{
    protected $userRepository;

    /**
     * Load Repository
     */
    public function __construct(
        UserRepositoryInterface $userRepository
    ) {
        $this->userRepository = $userRepository;
    }

    public function index($request)
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email
        ];
        $this->userRepository->createOrUpdate($data);
    }
}
```

## Testing
```php
composer test
```

## Change Logs
Date : 27 Sept, 2025
- Update the Minor bugs of functions
- Added Plain Repository/Interface

## Credits

- [Vivek Mistry](https://github.com/vivek-mistry) - Project creator and maintainer

## License
MIT License. See [LICENSE](https://github.com/vivek-mistry/repository-interface/blob/DEV/LICENSE) for details.
