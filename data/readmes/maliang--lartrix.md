# Lartrix

Laravel 后台管理包，为 [Trix](https://github.com/maliang/trix) 前端提供 API 接口。

## 特性

- 🔐 用户认证与权限管理（基于 Laravel Sanctum + Spatie Permission）
- 👥 用户、角色、权限管理
- 📋 菜单管理（支持树形结构）
- ⚙️ 系统设置
- 📦 模块化开发支持（基于 nwidart/laravel-modules）
- 🎨 PHP Schema Builder - 用 PHP 构建前端界面

## 环境要求

- PHP >= 8.1
- Laravel >= 10.0

## 安装

```bash
composer require lartrix/lartrix
```

运行安装命令：

```bash
php artisan lartrix:install
```

安装过程会：
1. 发布前端资源到 `public/admin`
2. 发布配置文件和迁移文件
3. 执行数据库迁移
4. 创建超级管理员角色和权限
5. 创建默认菜单
6. 交互式创建管理员账户
7. 创建 AI 开发指南文件（AGENTS.md、CLAUDE.md）

## 访问后台

安装完成后访问 `/admin/` 进入后台管理系统。

## 配置

配置文件位于 `config/lartrix.php`：

```php
return [
    'route_prefix' => 'api/admin',      // API 路由前缀
    'guard' => 'sanctum',               // 认证守卫
    'super_admin_role' => 'super-admin', // 超级管理员角色名
    'models' => [...],                  // 模型类映射
    'controllers' => [...],             // 控制器类映射
];
```

## 开发指南

### 模块化开发

推荐使用 `nwidart/laravel-modules` 进行模块化开发：

```bash
php artisan module:make Blog
```

### 控制器开发

继承 `CrudController` 快速实现 CRUD：

```php
<?php

namespace Modules\Blog\Http\Controllers;

use Lartrix\Controllers\CrudController;
use Lartrix\Schema\Components\NaiveUI\{Input, Button, Space};
use Lartrix\Schema\Components\Business\CrudPage;
use Lartrix\Schema\Actions\{SetAction, CallAction, FetchAction};

class PostController extends CrudController
{
    protected function getModelClass(): string
    {
        return \Modules\Blog\Models\Post::class;
    }

    protected function getResourceName(): string
    {
        return '文章';
    }

    protected function listUi(): array
    {
        $schema = CrudPage::make('文章管理')
            ->apiPrefix('/blog/posts')
            ->columns([
                ['key' => 'id', 'title' => 'ID', 'width' => 80],
                ['key' => 'title', 'title' => '标题'],
            ])
            ->search([
                ['关键词', 'keyword', Input::make()->props(['placeholder' => '搜索', 'clearable' => true])],
            ])
            ->toolbarLeft([
                Button::make()->type('primary')->on('click', [SetAction::make('formVisible', true)])->text('新增'),
            ]);

        return success($schema->build());
    }
}
```

### API 响应

```php
// 成功响应
return success('操作成功', $data);
return success($data);

// 错误响应
error('错误信息', null, 40004);
```

## Schema 组件

### NaiveUI 组件

类名无 N 前缀，输出保留 N 前缀：

```php
use Lartrix\Schema\Components\NaiveUI\{Button, Input, Select, SwitchC, Card, Modal};

Button::make()->type('primary')->text('提交');
Input::make()->props(['placeholder' => '请输入']);
SwitchC::make();  // Switch 是 PHP 保留字
```

### 业务组件

```php
use Lartrix\Schema\Components\Business\{CrudPage, OptForm};

CrudPage::make('标题')
    ->apiPrefix('/api/path')
    ->columns([...])
    ->search([...])
    ->build();
```

### Action 类型

```php
use Lartrix\Schema\Actions\{SetAction, CallAction, FetchAction, IfAction, ScriptAction};

SetAction::make('visible', true);
CallAction::make('$message.success', ['成功']);
FetchAction::make('/api/path')->post()->body($data);
```

## 命令

```bash
php artisan lartrix:install          # 安装
php artisan lartrix:publish-assets   # 发布前端资源
php artisan lartrix:uninstall        # 卸载
```

## 测试

```bash
./vendor/bin/phpunit
```

## 许可证

MIT License
