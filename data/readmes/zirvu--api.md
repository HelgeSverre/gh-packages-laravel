
# 🚀 Zirvu Laravel Modular Service Package

## 📦 Installation

```bash
composer require zirvu/api
```


A flexible and scalable Laravel package built around a **modular service architecture**. It enables fast backend development by organizing logic into services, repositories, and models — making your code clean, dynamic, and easy to extend across any domain (e.g., user management, roles, settings, monitoring, etc.).

---

## 🧩 Key Features

- 📦 Modular service-based structure
- 🧠 Dynamic service loading via trait (`loadUserService`, `loadMenuService`, etc.)
- 🔄 Built-in support for filtering, pagination, relationship loading
- 🔗 Safe model deletion through dynamic relationship checks
- 🧱 Standardized controller structure with consistent JSON responses
- ✅ Works across any domain: user, setting, HR, inventory, tracking...

---

## ⚙️ How to Use

### 1. 🧠 Load a Service

Use the `Zirvu\Api\Traits\Service` trait in your controller:

```php
use Zirvu\Api\Traits\Service;

class ExampleController
{
    use Service;

    public function index()
    {
        $this->loadUserService(); // Dynamically loads UserService
        return $this->userService->get((object)[
            "filter" => "name:contains:admin"
        ]);
    }
}
```

> 🔧 Make sure the service is registered in `config/zirvu/api/classes.php` under the correct category.

---

### 2. 🧱 Use a Model with Smart Delete Check

Every model should use the `Relation` trait:

```php
use Illuminate\Database\Eloquent\Model;
use Zirvu\Api\Traits\Relation;

class User extends Model
{
    use Relation;

    protected $fillable = ["name", "username", "password"];
}
```

#### 🔐 Why `Relation`?
When deleting a model, the repository checks if any child relations exist before allowing deletion:

```php
if (!$model->checkDelete()) {
    // skip delete or throw validation error
}
```

Prevents accidental deletion of records that are still being referenced by other data.

---

### 3. 🧩 Common Service Methods

#### 📄 `get(object $options)`
```php
$this->userService->get((object)[
    "filter" => "username:contains:admin",
    "take" => 10,
    "page" => 1,
    "with_roles" => 1
]);
```

- Supports filter operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `notin`, `contains`
- Relationship loading: `with_roles` returns `data_roles`

#### 💾 `save($id, array $fields)`
```php
$id = $request->id ?? null;
$this->settingService->save($id, [
    "id" => $id,
    "key" => "site_name",
    "value" => "Zirvu CMS"
]);
```

#### 🗑️ `delete(array $ids)`
```php
$this->userService->delete([1, 2]);
```

---

### 🧰 Standard JSON Controller Response

Use the `CommonController` trait for consistent API output:

```php
use Zirvu\Api\Traits\ControllerExtension\CommonController;

class UserController
{
    use CommonController;

    public function data(Request $request)
    {
        $this->loadUserService();
        $this->data = $this->userService->get((object)[
            "filter" => $request->filter ?? ""
        ]);
        return $this->response(200, true);
    }
}
```

📦 Auto response format:

```json
{
  "success": true,
  "message": "Success!",
  "pagination": { ... },
  "data": [ ... ]
}
```

---

## 📁 Suggested Structure

```
app/
├── Services/               # All business logic modules
├── Repositories/          # DB logic layer
├── Models/                # Use Relation trait
└── Http/Controllers/      # Use Service + CommonController traits
```

---

Built for extensibility and reusability across any Laravel project — modular, scalable, and production-ready.

> Made by Zirvu
