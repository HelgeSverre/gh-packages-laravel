<div align="center">

<a href="https://packagist.org/packages/milenmk/laravel-livewire-crud">![Latest Version on Packagist](https://img.shields.io/packagist/v/milenmk/laravel-livewire-crud.svg?style=flat)</a>
<a href="https://packagist.org/packages/milenmk/laravel-livewire-crud">![Total Downloads](https://img.shields.io/packagist/dt/milenmk/laravel-livewire-crud.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-livewire-crud">![GitHub User's stars](https://img.shields.io/github/stars/milenmk/laravel-livewire-crud?style=flat&logo=github&color=red)</a>
<a href="https://laravel.com/docs">![Laravel 10 Support](https://img.shields.io/badge/Laravel-10.x|11.x|12.x-orange?style=flat&logo=laravel)</a>
<a href="https://www.php.net">![PHP Version Support](https://img.shields.io/packagist/php-v/milenmk/laravel-livewire-crud?style=flat)</a>
<a href="https://github.com/milenmk/laravel-livewire-crud/blob/develop/LICENSE.md">![License](https://img.shields.io/packagist/l/milenmk/laravel-livewire-crud.svg?style=flat)</a>
<a href="https://github.com/milenmk/laravel-livewire-crud/issues">![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)</a>
<a href="https://www.patreon.com/c/LaravelAddonsbyMilen">![Sponsor me](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ff69b4?style=flat)</a>

</div>

This package provides a comprehensive solution for CRUD operations within your Laravel applications, offering a
streamlined and reusable approach for managing data.
Whether you're working with Laravel controllers or Livewire components, this package allows you to:

- Simplify common CRUD operations (create, read, update, delete) by abstracting and consolidating logic
  and reducing boilerplate code.
- Enhance productivity by providing out-of-the-box methods for storing, updating, and deleting records.
- Integrate seamlessly with both Laravel and Livewire, making it easy to use in traditional controllers
  or real-time components.
- Ensure consistency across your application with standardized CRUD methods for various models.
- Support bulk actions, enabling efficient mass deletion or updates of records.
- Reduce development time by leveraging reusable methods for model interactions, validation and error handling.

This package is ideal for developers who want to focus on business logic rather than repetitive CRUD operations,
saving time and minimizing errors.

Since version 1.3.0, the package also support Livewire Forms. Just move the corresponding logic (validation rules and
CRUD methods from the component to the form)

## Requirements

- PHP 8.3 or higher
- Laravel 10.x or higher
- Livewire 3.x or higher

## Install

Run ```composer require milenmk/laravel-livewire-crud``` to install the package

## Usage

1. In your controller or Livewire component, include the `GetSetData` trait:

    ```
    use Milenmk\LaravelCrud\GetSetData;
    ```

2. Reference the CRUD methods from the CrudClass trait, passing the model name as a parameter. Here's an example with a
   Client model and a Livewire component:

    ```
    <?php
    
    declare(strict_types=1);
    
    namespace App\Livewire\Client;
    
    use App\Livewire\CommonComponent;
    use App\Models\Client;
    use Milenmk\LaravelCrud\GetSetData;
    
    final class Clients extends CommonComponent
    {
        use GetSetData;
    
        // Store new client
        public function storeClient(): void
        {
            $this->rules = [
                'company' => 'required|min:3',
                'country' => 'nullable',
                'city' => 'nullable',
                'zip' => 'nullable',
                'address' => 'nullable',
                'phone' => 'nullable',
                'fax' => 'nullable',
                'mobile' => 'nullable',
                'email' => 'nullable',
            ];
    
            $this->commonStoreData('Client');
        }
    
        // Edit existing client
        public function editClient(int $clientId): void
        {
            $this->commonEditData('Client', $clientId);
        }
    
        // Update client information
        public function updateClient(): void
        {
            $this->rules = [
                'company' => 'required|min:3',
                'country' => 'nullable',
                'city' => 'nullable',
                'zip' => 'nullable',
                'address' => 'nullable',
                'phone' => 'nullable',
                'fax' => 'nullable',
                'mobile' => 'nullable',
                'email' => 'nullable',
                'status' => 'required',
            ];
    
            $this->commonUpdateData('Client');
        }
    
        // Delete client
        public function deleteClient(int $clientId): void
        {
            $this->commonDeleteData('Client', $clientId);
        }
    
        // Destroy client (permanent delete)
        public function destroyClient(): void
        {
            $this->commonDestroyData('Client');
        }
    
        // Bulk delete clients
        public function bulkDestroyClients(): void
        {
            $this->commonBulkDestroyData('Client', $this->selectedItems);
        }
    
        /**
         * Array of selected items for bulk action
         */
        public array $selectedItems = [];
    }
    
    ```

3. To use the Bulk Delete option, define a `selectedItems` property in your Livewire component, which should be an array
   of selected record IDs:

    ```
    /**
     * Array of selected items for bulk action
     *
     */
    public array $selectedItems = [];
    ```

## If you are using Livewire Forms

1. Sample Livewire component

    ```
    namespace App\Livewire;
    
    use App\Models\Test;
    use Illuminate\Database\Eloquent\Collection;
    use Livewire\Attributes\Computed;
    use Livewire\Attributes\Locked;
    use Livewire\Component;
    use Throwable;
    
    class Tests extends Component
    {
        public Test $model;
    
        public TestForm $form;
    
        public bool $addModal = false;
    
        public bool $editModal = false;
    
        public bool $deleteModal = false;
    
        public string $modelName = 'Test';
    
        #[Locked]
        protected $id;
    
        public function render()
        {
            return view('livewire.tests');
        }
    
        #[Computed]
        public function data(): array
        {
            return [
                ['key' => 'id', 'label' => 'ID'],
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'code', 'label' => 'Code'],
                ['key' => 'region', 'label' => 'Region'],
            ];
        }
    
        #[Computed]
        public function records(): array|Collection
        {
            return Test::all();
        }
    
        /**
         * @throws Throwable
         */
        public function save(): void
        {
            $this->form->create($this->modelName);
    
            $this->addModal = false;
        }
    
        public function edit(Test $record): void
        {
            $this->form->fillEditForm(record: $record);
    
            $this->editModal = true;
        }
    
        /**
         * @throws Throwable
         */
        public function update(): void
        {
            $this->form->update($this->modelName, $this->form->record->id);
    
            $this->editModal = false;
        }
    
        public function delete(Test $record): void
        {
            $this->form->fillDeleteForm(record: $record);
    
            $this->deleteModal = true;
        }
    
        /**
         * @throws Throwable
         */
        public function destroy(): void
        {
            $this->form->destroy($this->modelName, $this->form->record->id);
    
            $this->deleteModal = false;
        }
    }
    ```

2. Sample blade file (for Livewire with Flux)

    ```
    <div>
        <flux:modal.trigger @click="$wire.addModal = true">
            <flux:button variant="filled">{{ __('Add Record') }}</flux:button>
        </flux:modal.trigger>
    
        <div class="mt-6">
            <table>
                <thead>
                    <tr>
                        @foreach ($this->data as $column)
                            <th class="text-nowrap">{{ $column['label'] }}</th>
                        @endforeach
    
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($this->records as $record)
                        <tr>
                            @foreach ($this->data as $row)
                                @php
                                    $prop = $row['key'];
                                @endphp
    
                                <td class="text-nowrap">{{ $record->$prop }}</td>
                            @endforeach
    
                            <td>
                                <flux:button variant="primary" wire:click="edit({{ $record->id }})">
                                    {{ __('Edit Record') }}
                                </flux:button>
                                <flux:button variant="danger" wire:click="delete({{ $record->id }})">
                                    {{ __('Delete Record') }}
                                </flux:button>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    
        <!-- Add Modal -->
        <flux:modal wire:model.self="addModal" class="md:w-96">
            <div>
                <h5 class="mb-5 font-bold">Add record</h5>
            </div>
    
            <flux:spacer />
    
            <form wire:submit="save">
                <div class="space-y-6">
                    @foreach ($this->data as $input)
                        @if ($input['key'] !== 'id')
                            <flux:input label="{{ __($input['label']) }}" wire:model="form.{{ $input['key'] }}" />
                        @endif
                    @endforeach
    
                    <div class="flex">
                        <flux:spacer />
                        <flux:button type="submit" variant="primary">{{ __('Create') }}</flux:button>
                    </div>
                </div>
            </form>
        </flux:modal>
    
        <!-- Edit Modal -->
        <flux:modal wire:model.self="editModal" class="md:w-96">
            <div>
                <h5 class="mb-5 font-bold">Edit record</h5>
            </div>
    
            <flux:spacer />
    
            <form wire:submit="update()">
                <div class="space-y-6">
                    @foreach ($this->data as $input)
                        @if ($input['key'] !== 'id')
                            <flux:input label="{{ __($input['label']) }}" wire:model="form.{{ $input['key'] }}" />
                        @endif
                    @endforeach
    
                    <div class="flex">
                        <flux:spacer />
                        <flux:button type="submit" variant="primary">{{ __('Update') }}</flux:button>
                    </div>
                </div>
            </form>
        </flux:modal>
    
        <!-- Delete Modal -->
        <flux:modal wire:model.self="deleteModal" class="md:w-96">
            <div>
                <h5 class="text-danger mb-5 font-bold">Delete record</h5>
            </div>
    
            <flux:spacer />
    
            @if ($this->deleteModal === true)
                <p class="mb-5">
                    {{ __('Are you sure you want to delete this record :name?', ['name' => $this->form->record->name]) }}
                </p>
            @endif
    
            <form wire:submit="destroy()">
                <div class="space-y-6">
                    <div class="flex">
                        <flux:spacer />
                        <flux:button type="submit" variant="primary">{{ __('Delete') }}</flux:button>
                    </div>
                </div>
            </form>
        </flux:modal>
    </div>
    ```

3. Sample Form component

    ```
    namespace App\Livewire;
    
    use App\Models\Test;
    use Livewire\Attributes\Validate;
    use Livewire\Form;
    use Milenmk\LaravelCrud\GetSetData;
    use Throwable;
    
    class TestForm extends Form
    {
        use GetSetData;
    
        public ?Test $record;
    
        #[Validate(['required', 'max:128'])]
        public $name = '';
    
        #[Validate(['required', 'max:128'])]
        public $code = '';
    
        #[Validate(['required', 'max:128'])]
        public $region = '';
    
        /**
         * @throws Throwable
         */
        public function create($model): void
        {
            $this->commonStoreData($model);
        }
    
        public function fillEditForm(Test $record): void
        {
            $this->record = $record;
    
            $this->commonEditData('Test', $record->id);
        }
    
        /**
         * @throws Throwable
         */
        public function update($model, $recordId): void
        {
            $this->commonUpdateData($model, $recordId);
        }
    
        public function fillDeleteForm(Test $record): void
        {
            $this->record = $record;
    
            $this->commonDeleteData('Test', $record->id);
        }
    
        /**
         * @throws Throwable
         */
        public function destroy($model, $recordId): void
        {
            $this->commonDestroyData($model, $recordId);
        }
    }
    ```

## Methods Overview

- `commonStoreData('Model')` stores a new record in the database.
- `commonEditData('Model', $recordId)` retrieves data for editing a specific record by ID.
- `commonUpdateData('Model')` updates a specific record in the database.
- `commonDeleteData('Model', $recordId)` marks a specific record for deletion (soft delete).
- `commonDestroyData('Model')` permanently deletes a specific record from the database.
- `commonBulkDestroyData('Model', $selectedItems)` bulk deletes records based on an array of IDs.

## Additional Information

### Livewire Considerations

- If you are using Livewire, ensure that you are using dispatch for event handling as it integrates with Livewire's
  event system.
- For Livewire components, methods like reset(), resetErrorBag(), and resetValidation() will be triggered if they exist
  in the component.

### Laravel Controller Considerations

For regular Laravel controllers, the event() function is used for an event dispatching, as Livewire-specific methods
like dispatch() are not available.

## Example of a Laravel Controller

```
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Client;
use Milenmk\LaravelCrud\GetSetData;

class ClientController extends Controller
{
    use GetSetData;

    public function storeClient(): void
    {
        $this->rules = [
            'company' => 'required|min:3',
            'country' => 'nullable',
            'city' => 'nullable',
            'zip' => 'nullable',
            'address' => 'nullable',
            'phone' => 'nullable',
            'fax' => 'nullable',
            'mobile' => 'nullable',
            'email' => 'nullable',
        ];

        $this->commonStoreData('Client');
    }

    public function editClient(int $clientId): void
    {
        $this->commonEditData('Client', $clientId);
    }

    public function updateClient(): void
    {
        $this->rules = [
            'company' => 'required|min:3',
            'country' => 'nullable',
            'city' => 'nullable',
            'zip' => 'nullable',
            'address' => 'nullable',
            'phone' => 'nullable',
            'fax' => 'nullable',
            'mobile' => 'nullable',
            'email' => 'nullable',
            'status' => 'required',
        ];

        $this->commonUpdateData('Client');
    }

    public function deleteClient(int $clientId): void
    {
        $this->commonDeleteData('Client', $clientId);
    }

    public function destroyClient(): void
    {
        $this->commonDestroyData('Client');
    }

    public function bulkDestroyClients(array $clientIds): void
    {
        $this->commonBulkDestroyData('Client', $clientIds);
    }
}

```

## Changelog

Please see [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

- Pull requests and issues are welcome at [GitHub](https://github.com/milenmk/laravel-livewire-crud).
- Follow PSR‑12 requirements

## Support My Work

If this package saves you time, you can support ongoing development:  
👉 [Become a Patron](https://www.patreon.com/c/LaravelAddonsbyMilen)

## Other Packages

Check out my other Laravel packages:

- **[Laravel GDPR Cookie Manager](https://packagist.org/packages/milenmk/laravel-gdpr-cookie-manager)** -
  GDPR-compliant cookie consent management with user preference tracking
- **[Laravel Email Change Confirmation](https://packagist.org/packages/milenmk/laravel-email-change-confirmation)** -
  Secure email change confirmation system
- **[Laravel Blacklist](https://packagist.org/packages/milenmk/laravel-blacklist)** -
  A Laravel package for blacklist validation of user input
- **[Laravel GDPR Exporter](https://packagist.org/packages/milenmk/laravel-gdpr-exporter)** -
  GDPR-compliant data export functionality
- **[Laravel Route Label](https://packagist.org/packages/milenmk/laravel-route-label)** -
  Add label support to Laravel routes with routeLabel() helper and Blade @routeLink directive
- **[Laravel Locations](https://packagist.org/packages/milenmk/laravel-locations)** -
  Add Countries, Cities, Areas, Languages and Currencies models to your Laravel application
- **[Laravel Rate Limiting](https://packagist.org/packages/milenmk/laravel-rate-limiting)** -
  Advanced rate limiting capabilities with exponential backoff
- **[Laravel Datatables and Forms](https://packagist.org/packages/milenmk/laravel-simple-datatables-and-forms)** -
  Easy to use package to create datatables and forms for Livewire components

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## DISCLAIMER

This package is provided ”as is”, without warranty of any kind, either express or implied, including but not limited to
the warranties of merchantability, fitness for a particular
purpose, or noninfringement.

The author(s) make no representations or warranties regarding the accuracy, reliability or completeness of the code or
its suitability for any specific use case. It is recommended
that you thoroughly test this package in your environment before deploying it to production.

By using this package, you acknowledge and agree that the author(s) shall not be held liable for any damages, losses or
other issues arising from the use of this software.