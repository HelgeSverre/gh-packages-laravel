# Rishadblack/Ireports

A reusable, extensible Laravel reporting package with Livewire integration for dynamic filters, PDF and Excel export, and iframe report viewing.

---

## Features

- **Dynamic Report Loading:** Single route handles all reports dynamically by report name.
- **Modular Support:** Automatically detects report controllers from `App\Reports` or `Modules\<ModuleName>\Reports` (compatible with nWidart Laravel Modules).
- **Livewire Filters:** Easily build interactive filters with Livewire; updates iframe view dynamically.
- **Export Options:** Export reports as PDF (using DomPDF) or Excel (using Maatwebsite Excel) using the same blade views.
- **Customizable Views:** Reports are fully customizable with blade templates.
- **Pagination Support:** Supports pagination with query parameter handling.
- **Reusable BaseReportController:** Extend the base controller to create new reports quickly.
- **Configurable Namespace & Suffix:** Customize report namespace and controller suffix in config.

---

## Installation

```bash
composer require rishadblack/i-reports
```

Publish config file (optional):

```bash
php artisan vendor:publish --tag=i-reports.config
```

---

## Usage

### 1. Define Report Controller

Create your report class extending the base controller:

```php
namespace App\Reports;

use Rishadblack\IReports\BaseReportController;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class UserReport extends BaseReportController
{
    public function builder(Request $request): Builder
    {
        return \App\Models\User::query();
    }
}
```

### 2. Create Blade View

Create `resources/views/reports/user-report.blade.php`:

```blade
<table border="1" cellpadding="5" cellspacing="0" style="width: 100%;">
<thead>
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
    </tr>
</thead>
<tbody>
    @foreach ($data as $user)
    <tr>
        <td>{{ $user->id }}</td>
        <td>{{ $user->name }}</td>
        <td>{{ $user->email }}</td>
        <td>{{ $user->status }}</td>
    </tr>
    @endforeach
</tbody>
</table>

@if (!$export)
{{ $data->links() }}
@endif
```

### 3. Access Report

Visit:

```
/ireports/view/user-report
```

You can add export parameters for PDF or Excel:

```
/ireports/view/user-report?export=pdf
/ireports/view/user-report?export=excel
```

---

## Configuration

Publish and edit `config/i-reports.php` to customize:

- Report namespace (`App\Reports` by default)
- Controller suffix (`Report` by default)
- Route prefix

---

## Modules Support

If using `nWidart/laravel-modules`, your report controllers can live inside modules:

```
Modules/
└── YourModule/
    └── Reports/
        └── UserReport.php
```

---

## Livewire Integration

Use the provided Livewire component to build filter UIs and update the report iframe dynamically.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contributions

Feel free to open issues or submit pull requests!

---

If you want, I can also generate a full example Livewire component README or more detailed docs. Just let me know!
