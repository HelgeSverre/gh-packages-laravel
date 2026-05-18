# Status Auditor for Laravel

A simple Laravel package to audit status changes on your Eloquent models. This package is intended for educational purposes to demonstrate how to create a basic, reusable Laravel package.

It automatically tracks changes to a specified "status" column on a model and records the old and new values in a dedicated audit table.

## Installation

1.  **Require the package**

    You can install the package via Composer:

    ```bash
    composer require aitaddihamza/status-auditor
    ```
    The package will automatically register its service provider.

2.  **Run the migrations**

    The package's migrations are loaded automatically. Simply run the `migrate` command to create the `status_audits` table.

    ```bash
    php artisan migrate
    ```

## Usage

1.  **Prepare Your Model**

    In the model you want to audit (e.g., `Order`, `Post`), you must:
    a. Implement the `Aitaddihamza\StatusAuditor\Contracts\AuditableStatus` interface.
    b. Use the `Aitaddihamza\StatusAuditor\Traits\HasStatusAudit` trait.
    c. Implement the `getStatusColumn()` method to tell the auditor which column to monitor.

    Here is an example using an `Order` model:

    ```php
    <?php

    namespace App\Models;

    use Aitaddihamza\StatusAuditor\Contracts\AuditableStatus;
    use Aitaddihamza\StatusAuditor\Traits\HasStatusAudit;
    use Illuminate\Database\Eloquent\Model;

    class Order extends Model implements AuditableStatus
    {
        use HasStatusAudit;

        protected $fillable = [
            'name',
            'status'
        ];

        public function getStatusColumn(): string
        {
            return "status";
        }
    }
    ```

2.  **How It Works**

    Whenever you update the `status` attribute on an `Order` instance, a new record will be automatically created in the `status_audits` table.

3.  **Accessing Audit History**

    The `HasStatusAudit` trait adds a `statusAudits()` relationship to your model, allowing you to retrieve the history of status changes.

    ```php
    // Get an order
    $order = Order::first();

    // Get the audit history for the order
    $audits = $order->statusAudits()->get();
    ```

    Example output from `php artisan tinker`:

    ```shell
    > $order = Order::first()
    = App\Models\Order {#6975
        id: 1,
        name: "order 1",
        status: "in process",
        created_at: "2026-02-07 16:08:11",
        updated_at: "2026-02-07 16:23:01",
      }

    > $order->statusAudits()->get()
    = Illuminate\Database\Eloquent\Collection {#6300
        all: [
          Aitaddihamza\StatusAuditor\Models\StatusAudit {#7445
            id: 1,
            model_type: "App\Models\Order",
            model_id: 1,
            old_status: "pending",
            new_status: "in process",
            user_id: null,
            created_at: "2026-02-07 16:23:01",
            updated_at: "2026-02-07 16:23:01",
          },
        ],
      }
    ```

## Local Development

If you are contributing or testing this package locally, you can use a "path" repository.

1.  Clone this repository to your local machine.
2.  In your main Laravel project's `composer.json`, add the following `repositories` block:

    ```json
    "repositories": [
        {
            "type": "path",
            "url": "path/to/your/status-auditor"
        }
    ]
    ```
3.  Require the package using `dev-main` (or your development branch name):
    ```bash
    composer require aitaddihamza/status-auditor:dev-main
    ```

## License

This project is open-source software licensed under the [MIT license](LICENSE).

---

**Author**: AIT ADDI Hamza