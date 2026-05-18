# XditnModule

XditnModule 是一个基于 Laravel 的模块化后台管理框架核心包，提供模块管理、CRUD 生成、权限控制、API 版本控制等功能。

## 环境要求

- PHP 8.2+
- Laravel 11.0+ / 12.0+
- MySQL 5.7+ / MariaDB 10.3+
- Composer 2.0+
- Git（用于安装命令检测）
- Redis（可选，用于缓存和队列）

## 完整安装流程

### 第一步：创建 Laravel 项目（已有项目跳过）

```bash
composer create-project laravel/laravel my-admin
cd my-admin
```

### 第二步：配置数据库

编辑 `.env` 文件，配置数据库连接：

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**确保数据库已创建且可以连接。**

### 第三步：安装 XditnModule

**方式一：使用 Packagist（推荐）**

```bash
composer require xditn/xditn-module
```

**方式二：使用 GitHub VCS（如果 Packagist 未同步最新版本）**

在 `composer.json` 中添加 VCS 仓库：

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/lanrongxiang/xditn-xditn-module.git"
        }
    ]
}
```

然后安装：

```bash
composer require xditn/xditn-module --ignore-platform-reqs --no-audit
```

### 第四步：发布配置文件

```bash
php artisan vendor:publish --provider="XditnModule\Providers\XditnModuleServiceProvider"
```

这会发布以下文件：
- `config/xditn.php` - 框架配置文件

### 第五步：配置默认模块（可选）

编辑 `config/xditn.php`，配置需要安装的模块：

```php
'module' => [
    // 默认安装的模块
    'default' => [
        'user',        // 用户模块（必需）
        'permissions', // 权限模块（必需）
        'system',      // 系统模块（必需）
        'common',      // 通用模块（必需）
        'develop',     // 开发工具
        // 可选模块
        // 'ai',
        // 'cms',
        // 'mail',
        // 'member',
        // 'openapi',
        // 'pay',
        // 'wechat',
        // 'domain',
    ],
],
```

### 第六步：运行安装命令

```bash
php artisan xditn:module:install
```

安装命令会自动执行：
1. 生成 APP_KEY（如果没有）
2. 发布配置文件
3. 运行数据库迁移
4. 填充初始数据（管理员账号等）
5. 安装配置的模块

**生产环境安装：**
```bash
php artisan xditn:module:install --prod
```

**Docker 环境安装：**
```bash
php artisan xditn:module:install --docker
```

**强制重新安装（更新模块代码）：**
```bash
php artisan xditn:module:install --fresh
```

> 使用 `--fresh` 参数会：
> 1. 删除 `storage/app/modules.json` 模块记录
> 2. 重新发布所有模块到 `modules/` 目录（覆盖现有文件）
> 3. 重新运行迁移和数据填充

**不发布模块（保留 vendor 中的模块）：**
```bash
php artisan xditn:module:install --no-publish
```

### 单独发布模块

如果只想发布或更新某个模块：

```bash
# 发布所有模块
php artisan xditn:module:publish --all

# 发布指定模块
php artisan xditn:module:publish User

# 强制覆盖已存在的模块
php artisan xditn:module:publish User --force
```

### 第七步：启动服务

```bash
php artisan serve
```

访问 `http://127.0.0.1:8000`

### 第八步：登录管理后台

- **默认账号**：`admin@xditn.com`
- **默认密码**：`xditn`

> 首次登录后请立即修改密码！

---

## 安装常见问题

### Q: 提示 "Git 未安装"

确保 Git 已安装并添加到系统 PATH 环境变量。

**Windows**：
1. 找到 Git 安装目录（通常是 `C:\Program Files\Git\bin`）
2. 添加到系统环境变量 PATH

**验证**：
```bash
git --version
```

### Q: 提示 "jwt:secret" 命令不存在

这是正常的，如果您没有安装 `tymon/jwt-auth` 包，此命令会被跳过。

如需 JWT 认证：
```bash
composer require tymon/jwt-auth
php artisan jwt:secret
```

### Q: 模块安装失败

1. 确保数据库连接正确
2. 确保有足够的数据库权限
3. 尝试重新运行：`php artisan xditn:module:install`

### Q: 提示 "Module [xxx] has been created"

这表示模块已在 `storage/app/modules.json` 中记录，但可能数据库没有数据。

**解决方案 1：强制重新安装**
```bash
php artisan xditn:module:install --fresh
```

**解决方案 2：手动删除模块记录**
```bash
rm -f storage/app/modules.json
php artisan xditn:module:install
```

**解决方案 3：仅运行迁移和 seed**
```bash
php artisan migrate
php artisan xditn:module:migrate user
php artisan xditn:module:db:seed user
# 依次处理其他模块...
```

### Q: 时间显示为 1970-01-01

从模型的 `$fillable` 数组中移除时间戳字段（`created_at`, `updated_at`, `deleted_at`）。

### Q: decimal 字段报错 "Incorrect decimal value"

在模型中设置：
```php
protected bool $autoNull2EmptyString = false;
```

---

## 目录结构

安装完成后的目录结构：

```
project/
├── app/                        # Laravel 应用目录
├── config/
│   └── xditn.php              # XditnModule 配置
├── database/
│   └── migrations/            # Laravel 迁移文件
├── modules/                   # 所有模块（安装时自动发布）
│   ├── User/                  # 用户管理
│   ├── Permissions/           # 权限管理
│   ├── System/                # 系统设置
│   ├── Common/                # 通用功能
│   ├── Develop/               # 开发工具
│   └── MyModule/              # 你自己创建的模块
└── vendor/
    └── xditn/xditn-module/    # 框架核心代码
```

**重要说明**：
- 安装时框架模块会自动发布到 `modules/` 目录
- 你可以自由修改 `modules/` 目录下的任何代码
- 更新框架后，使用 `--fresh` 参数可更新模块代码

### 模块目录结构

```
modules/{ModuleName}/
├── database/
│   ├── migrations/            # 数据库迁移
│   └── seeders/              # 数据填充
├── Http/
│   ├── Controllers/          # 控制器
│   ├── Requests/             # 表单请求验证
│   └── Resources/            # API 资源
├── Models/                    # 模型
├── Services/                  # 服务类
├── Observers/                 # 模型观察者
├── Enums/                     # 枚举类
├── routes/
│   └── route.php             # 模块路由
└── Installer.php             # 模块安装器
```

---

## 创建自定义模块

### 1. 初始化模块

```bash
php artisan xditn:module:init MyModule
```

这会在 `modules/` 目录下创建模块基础结构。

### 2. 创建数据库迁移

```bash
php artisan xditn:module:make:migration MyModule my_table
```

编辑迁移文件后运行：

```bash
php artisan xditn:module:migrate MyModule
```

### 3. 生成 CRUD

```bash
php artisan xditn:module:make:crud MyModule MyResource --subgroup=资源管理
```

这会生成：
- 模型
- 控制器
- 请求验证类
- 服务类

### 4. 添加路由

编辑 `modules/MyModule/routes/route.php`：

```php
<?php

use Illuminate\Support\Facades\Route;
use Modules\MyModule\Http\Controllers\MyResourceController;

Route::prefix('my-module')->group(function () {
    Route::apiResource('my-resources', MyResourceController::class);
});
```

---

## 常用命令

### 迁移命令

```bash
php artisan xditn:module:make:migration {模块名} {表名}
php artisan xditn:module:migrate {模块名}
php artisan xditn:module:migrate:fresh {模块名}
php artisan xditn:module:migrate:rollback {模块名}
```

### 代码生成命令

```bash
php artisan xditn:module:make:controller {模块名} {控制器名}
php artisan xditn:module:make:model {模块名} {模型名} --t=表名
php artisan xditn:module:make:crud {模块名} {资源名} --subgroup=分组名
php artisan xditn:module:make:seeder {模块名} {Seeder名称}
php artisan xditn:module:make:observer {模块名} {模型名}
```

### Seeder 命令

```bash
php artisan xditn:module:db:seed {模块名}
php artisan xditn:module:db:seed {模块名} --seeder=MySeeder
```

### 维护命令

```bash
php artisan xditn:module:version              # 查看版本
php artisan xditn:module:update:password      # 更新管理员密码
php artisan xditn:module:api:doc              # 生成 API 文档
php artisan xditn:module:purge-trashed        # 清理软删除数据
```

---

## 控制器示例

```php
<?php

declare(strict_types=1);

namespace Modules\MyModule\Http\Controllers;

use Modules\MyModule\Models\MyResource;
use XditnModule\Base\XditnModuleController as Controller;

/**
 * @group 管理端
 * @subgroup 资源管理
 */
class MyResourceController extends Controller
{
    public function __construct(
        protected readonly MyResource $model
    ) {}

    public function index(): mixed
    {
        return $this->model->getList();
    }

    public function store(): mixed
    {
        return $this->model->storeBy(request()->all());
    }

    public function show(int $id): mixed
    {
        return $this->model->firstBy($id);
    }

    public function update(int $id): mixed
    {
        return $this->model->updateBy($id, request()->all());
    }

    public function destroy(int $id): mixed
    {
        return $this->model->deleteBy($id);
    }
}
```

## 模型示例

```php
<?php

declare(strict_types=1);

namespace Modules\MyModule\Models;

use XditnModule\Base\XditnModuleModel;

class MyResource extends XditnModuleModel
{
    protected $table = 'my_resources';

    // 可批量赋值字段（不包含时间戳）
    protected $fillable = ['id', 'title', 'description', 'status'];

    // 列表查询返回字段
    protected array $fields = ['id', 'title', 'status', 'created_at'];

    // 可搜索字段
    public array $searchable = [
        'title' => 'like',
        'status' => '=',
    ];
}
```

---

## 核心功能

### 模型基础操作

| 方法 | 说明 |
|------|------|
| `getList()` | 获取列表（支持分页、搜索、排序） |
| `storeBy(array $data)` | 保存数据 |
| `updateBy($id, array $data)` | 更新数据 |
| `firstBy($value, $field)` | 查询单条记录 |
| `deleteBy($id)` | 删除记录 |
| `deletesBy($ids)` | 批量删除 |
| `restoreBy($ids)` | 恢复软删除记录 |
| `toggleBy($id, $field)` | 切换状态 |

### 链式查询

```php
// 关联查询
$this->model->setBeforeGetList(fn($q) => $q->with('user'))->getList();

// 禁用分页
$this->model->disablePaginate()->getList();

// 树形结构
$this->model->asTree()->getList();

// 自定义搜索
$this->model->setSearchable(['title' => 'like'])->getList();
```

### 枚举

```php
use XditnModule\Enums\Enum;
use XditnModule\Enums\EnumTrait;

enum Status: int implements Enum
{
    use EnumTrait;

    case Enable = 1;
    case Disable = 2;

    public function label(): string
    {
        return match ($this) {
            self::Enable => '启用',
            self::Disable => '禁用',
        };
    }
}

// 使用
$options = Status::options();  // [['value' => 1, 'label' => '启用'], ...]
$values = Status::values();    // [1, 2]
```

### 金额处理

```php
use XditnModule\Traits\DB\AmountTrait;

class Order extends XditnModuleModel
{
    use AmountTrait;

    protected array $amountFields = ['amount', 'discount_amount'];
}

// 入库：100.50 USD -> 10050 分
// 出库：10050 分 -> 100.50 USD
```

### 缓存装饰器

```php
use XditnModule\Traits\DB\Cacheable;

class UserService
{
    use Cacheable;

    protected int $cacheTTL = 3600;
    protected ?string $cachePrefix = 'user';

    public function getUser(int $id): ?User
    {
        return $this->remember("user:{$id}", fn() => User::find($id));
    }
}
```

### 查询过滤器

```php
use XditnModule\Traits\DB\HasFilters;
use XditnModule\Support\Query\Filters\StatusFilter;
use XditnModule\Support\Query\Filters\DateRangeFilter;

class Order extends XditnModuleModel
{
    use HasFilters;

    protected array $filters = [
        'status' => StatusFilter::class,
        'date_range' => DateRangeFilter::class,
    ];
}

// 使用
Order::filter(['status' => 1, 'date_range' => ['2024-01-01', '2024-12-31']])->get();
```

---

## 配置说明

`config/xditn.php` 主要配置项：

```php
return [
    'super_admin' => 1,                    // 超级管理员 ID
    'request_allowed' => true,             // GET 请求免权限
    
    'module' => [
        'root' => 'modules',               // 用户模块目录
        'namespace' => 'Modules',          // 命名空间
        'autoload' => true,                // 自动加载
        'default' => [                     // 默认安装模块
            'user', 'permissions', 'system', 'common', 'develop',
        ],
    ],
    
    'route' => [
        'prefix' => 'api',
        'version' => 'v1',
        'supported_versions' => ['v1', 'v2'],
    ],
    
    'amount' => [
        'conversion_rate' => 100,          // 金额转换比例
    ],
    
    'rate_limit' => [
        'enabled' => true,
        'max_attempts' => 60,
        'decay_minutes' => 1,
    ],
    
    'soft_delete' => [
        'auto_purge' => true,
        'purge_after_days' => 30,
    ],
];
```

---

## 异常类型

| 异常类 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `ValidationException` | 422 | 验证失败 |
| `AuthenticationException` | 401 | 认证失败 |
| `AuthorizationException` | 403 | 授权失败 |
| `ResourceNotFoundException` | 404 | 资源不存在 |
| `BusinessException` | 400 | 业务异常 |
| `FailedException` | 500 | 操作失败 |

```php
use XditnModule\Exceptions\FailedException;

throw new FailedException('操作失败');
```

---

## 中间件

### 速率限制

```php
Route::middleware(RateLimitMiddleware::class)->group(function () {
    // 默认每分钟 60 次请求
});
```

### 请求追踪

```php
Route::middleware(RequestTracingMiddleware::class)->group(function () {
    // 自动添加 X-Trace-Id 响应头
});
```

---

## 更新升级

```bash
composer update xditn/xditn-module
```

如需更新配置文件：
```bash
php artisan vendor:publish --provider="XditnModule\Providers\XditnModuleServiceProvider" --force
```

---

## PR 提交规范

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档注释 |
| `style` | 代码格式 |
| `refactor` | 重构优化 |
| `perf` | 性能优化 |
| `test` | 增加测试 |
| `chore` | 构建工具 |

示例：`fix(Pay): 修复充值金额计算错误`

---

## 许可证

[MIT License](LICENSE.md)
