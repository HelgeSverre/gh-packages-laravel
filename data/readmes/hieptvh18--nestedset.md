# Hieptvh NestedSet

Mini Laravel package xử lý thuật toán **Nested Set Model** cho menu/category đa cấp.

## Đặc điểm

- **Auto-migrate**: Tự động thêm các cột `_lft`, `_rgt`, `parent_id`, `depth` khi sử dụng trait
- **Rebuild tree**: Tính lại toàn bộ left/right từ `parent_id`
- **CRUD node**: Thêm root, thêm child, xoá node (giữ con), xoá subtree
- **Move node**: Di chuyển node sang parent mới
- **Tree builder**: Chuyển flat data thành nested collection
- **Scopes**: `descendants`, `ancestors`, `leaves`, `roots`, `ordered`
- **Relationships**: `parent()`, `children()`

## Cài đặt

Thêm autoload vào `composer.json` gốc:

```json
"autoload": {
    "psr-4": {
        "Hieptvh\\NestedSet\\": "packages/hieptvh/nestedset/src/"
    }
}
```

Đăng ký provider trong `extra.laravel.providers`:

```json
"extra": {
    "laravel": {
        "providers": [
            "Hieptvh\\NestedSet\\NestedSetServiceProvider"
        ]
    }
}
```

Chạy:

```bash
composer dump-autoload
```

## Sử dụng

### 1. Thêm Trait vào Model

```php
use Hieptvh\NestedSet\Contracts\NestedSetInterface;
use Hieptvh\NestedSet\Traits\HasNestedSet;

class Category extends Model implements NestedSetInterface
{
    use HasNestedSet;

    protected $fillable = ['name', 'parent_id', '_lft', '_rgt', 'depth'];
}
```

Khi Model boot lần đầu, trait sẽ tự thêm các cột `_lft`, `_rgt`, `parent_id`, `depth` nếu chưa có.

### 2. Tuỳ chỉnh tên cột (optional)

```php
class Category extends Model implements NestedSetInterface
{
    use HasNestedSet;

    protected array $nestedSetColumns = [
        'lft'    => 'left',
        'rgt'    => 'right',
        'parent' => 'parent_id',
        'depth'  => 'level',
    ];
}
```

### 3. API

```php
// Rebuild tree từ parent_id
Category::rebuildTree();

// Thêm root node
$root = (new Category)->addRoot(['name' => 'Electronics']);

// Thêm child
$child = $root->addChild(['name' => 'Phones']);
$grandchild = $child->addChild(['name' => 'iPhone']);

// Lấy tree dạng nested
$tree = Category::toTree();

// Lấy descendants
$descendants = $root->getDescendants();

// Lấy ancestors
$ancestors = $grandchild->getAncestors();

// Lấy siblings
$siblings = $child->getSiblings();

// Di chuyển node
$child->moveTo($anotherParent);

// Xoá node (con lên cha)
$child->removeNode();

// Xoá cả subtree
$root->removeSubtree();

// Kiểm tra
$node->isLeaf();
$node->isRoot();
$node->getDescendantCount();
```

### 4. Scopes

```php
Category::query()->descendantsOf($node)->get();
Category::query()->ancestorsOf($node)->get();
Category::query()->leaves()->get();
Category::query()->roots()->get();
Category::query()->ordered()->get();
```

## Publish Config

```bash
php artisan vendor:publish --tag=nestedset-config
```

File `config/nestedset.php`:

```php
return [
    'columns' => [
        'lft'    => '_lft',
        'rgt'    => '_rgt',
        'parent' => 'parent_id',
        'depth'  => 'depth',
    ],
];
```
