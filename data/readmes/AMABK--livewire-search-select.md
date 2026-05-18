## Livewire Search Select
![alt text](image.png)
A powerful and customizable Livewire component for searchable select dropdowns. Supports multi-field labels, concatenation, and emits Livewire events for reactive parent handling.

---

## Usage

### 1. Installation

Install via Composer:

```bash
composer require amabk/livewire-search-select
```

### 2. Basic Usage

Add the component to any Blade view:
#### Single-select
```blade
<livewire:search-select
    model-class="\App\Models\User"
    :label-fields="['name','email']"
    :search-fields="['name','email']"
    :concat-fields="true"
    placeholder="Search by name or email…"
    emit-event="userSelected"
    :selected-id="$userId ?? null"
    :initial-load="5"
    input-class="border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
/>
```
#### Multi-select (chips inside field)

```blade
<livewire:search-select
    model-class="\App\Models\User"
    :label-fields="['name','email']"
    :search-fields="['name','email']"
    :concat-fields="true"
    :multiple="true"
    :selected-ids="$preselected ?? []"
    :initial-load="8"
    placeholder="Search and add users…"
    input-class="border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
/>
```

#### Custom separators
```blade
{{-- Display label uses " | ", search concatenation still uses space (more forgiving) --}}
<livewire:search-select
  model-class="\App\Models\User"
  :label-fields="['name','email']"
  :search-fields="['name','email']"
  :concat-fields="true"
  label-separator=" | "
  search-separator=" "
/>
```

```blade
{{-- Both label and search use the same separator --}}
<livewire:search-select
  model-class="\App\Models\User"
  :label-fields="['first_name','last_name','email']"
  :search-fields="['first_name','last_name','email']"
  :concat-fields="true"
  label-separator=" · "
  search-separator=" · "
/>
```

| Prop              | Type                              |       Default | Notes                                                          |                                       |
| ----------------- | --------------------------------- | ------------: | -------------------------------------------------------------- | ------------------------------------- |
| `modelClass`      | `string`                          |             — | Eloquent model FQCN, e.g. `\App\Models\User`                   |                                       |
| `labelFields`     | `array<string>` \| `string`       |   `['email']` | Fields used to render the visible label                        |                                       |
| `searchFields`    | `array<string>`                   |  `['name']` | Fields used for LIKE search                                    |                                       |
| `concatFields`    | `bool`                            |       `false` | If `true`, search uses `CONCAT_WS(searchSeparator, …)`         |                                       |
| `labelSeparator`  | `string`                          |         `' '` | Separator when rendering labels (display only)         |                                       |
| `searchSeparator` | `string`                          |         `' '` | Separator used in `CONCAT_WS` when `concatFields=true` |                                       |
| `orderBy`         | `{field:string, direction:'asc' \| 'desc'}` | `{ field: 'id', direction: 'asc' }` | Sort for initial and searched results |
| `limit`           | `int`                             |          `10` | Max rows for search results                                    |                                       |
| `initialLoad`     | `int`                             |           `0` | Prefetch N items on **focus** when search is empty             |                                       |
| `placeholder`     | `string`                          | `'Search...'` | Hidden when chips exist (multi)                                |                                       |
| `emitEvent`       | `string \| null` | `null`                        | Event name to dispatch on change      |
| `inputClass`      | `string`                          |          `''` | Extra classes on the **wrapper** (the chip field)              |                                       |
| `optionClass`     | `string`                          |          `''` | Extra classes on the dropdown `<ul>`                           |                                       |
| `multiple`        | `bool`                            |       `false` | Enable multi-select                                            |                                       |
| `selectedId`      | `int \| null` | `null`    | Preselect for single-select           |
| `selectedIds`     | `int[]`                           |          `[]` | Preselect for multi-select                                     |                                       |


---

### 3. Listening for Selection Events

When a user selects an option, the component emits a Livewire event (named by your `emit-event` prop) **to the parent component**.
You can listen for it and update your parent Livewire component’s data accordingly.

**Example Parent Component:**

```php
class UserForm extends Component
{
    public $selectedUserIds = [];

    #[On('usersSelected')] 
    // single: receives id or '' when cleared
    // multi: receives array<int> of ids
    public function usersSelected($userIds)
    {
        $this->selectedUserIds = $userIds;
    }

    public function render()
    {
        return view('livewire.user-form');
    }
}
```

**In your Blade view:**

```blade
<livewire:search-select
    :model-class="\App\Models\User::class"
    label-fields="name,email"
    label-separator=" ["
    label-suffix="]"
    :multiple="true"
    emit-event="usersSelected"
/>
Selected User IDs: {{ implode(', ', $selectedUserIds) }}
```

---

### 4. Customizing Appearance

You can pass custom CSS classes to the input and the options list:

```blade
<livewire:search-select
    :model-class="\App\Models\Product::class"
    :label-fields="['title', 'sku']"
    label-separator=" | SKU: "
    :multiple="true"
    emit-event="productsChosen"
    input-class="border-blue-500"
    option-class="max-h-48"
    placeholder="Find a product..."
/>

```

---

### 5. Setting a Default Selected Option

To set a default selection:

```blade
<livewire:search-select
    :model-class="\App\Models\Category::class"
    label-fields="name"
    :selected-id="[5, 9]"
    :multiple="true"
    emit-event="categoriesChosen"
/>
```

This will preselect the items with `id = 5` and `id = 9` and show their labels in the input.

---


### 6. Troubleshooting & Tips

* **No results found:** Ensure your model and label fields are correct and records exist.
* **Alpine/Livewire conflicts:** Alpine.js is auto-reinitialized after Livewire updates, but if you experience issues, check your Alpine.js version.
* **Emitted event not caught?**
  Ensure your parent Livewire component is listening for the same event name as the `emit-event` you specify.

---

### 7. Development
<!-- PSR-4 namespace: AMABK\LivewireSearchSelect\ → src/

Component class: AMABK\LivewireSearchSelect\SearchSelect

View: resources/views/search-select.blade.php
(Loaded as view('livewire-search-select::search-select'))

Run tests / lints as usual in your app; this package is Livewire-only and framework-native. -->

* **PSR-4 namespace:** AMABK\LivewireSearchSelect\ → src/
* **Component class:** AMABK\LivewireSearchSelect\SearchSelect
* **View:** resources/views/search-select.blade.php
  (Loaded as view('livewire-search-select::search-select'))

### 8. Example: User Dropdown in a Form

```blade
<form wire:submit.prevent="save">
    <livewire:search-select
        :model-class="\App\Models\User::class"
        :label-fields="['name', 'email']"
        :search-fields="['name', 'email', 'address']"
        label-separator=", "
        label-suffix=" (active)"
        :multiple="true"
        emit-event="userSelected"
        placeholder="Search for a user by name or email..."
    />

    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

```php
// Parent Component (UserForm.php)
public $userIds = [];
protected $listeners = ['userSelected'];

public function userSelected($userIds)
{
    $this->userIds = $userIds;
}

```

---

### 10. Advanced: Use With Any Model & Any Label Format

```blade
<livewire:search-select
    :model-class="\App\Models\Country::class"
    :label-fields="['country_name', 'country_code']"
    :search-fields="['name', 'currency_code']"
    label-separator=" - "
    label-suffix=""
    :multiple="true"
    emit-event="countriesSelected"
    placeholder="Search country..."
/>

```

---

**For advanced use, extend the component in your own package.**
**For issues, open a GitHub issue or PR!**

### License

MIT © [AMABK](https://github.com/AMABK) 
