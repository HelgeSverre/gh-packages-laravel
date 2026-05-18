# Admini Laravel

Admini 是一个轻量级的 Laravel 认证与内容管理（CMS）包，适用于公司官网或微型博客。

## 功能特性

- 多语言支持（内置英文、简体中文）
- 文章/页面/公告/文件等多种内容类型
- 标签分类系统
- 富文本编辑器（集成 wangEditor）
- PC 端和移动端独立内容编辑
- 自动语言检测
- 自定义元数据（支持 text/textarea/radio/checkbox 等）

## 环境要求

- PHP ^8.2
- Laravel ^11.0|^12.0

## 安装

```bash
composer require sungmee/admini
```

## 配置

发布配置文件和资源：

```bash
php artisan vendor:publish --provider="Sungmee\Admini\ServiceProvider"
```

按需选择发布项：

```bash
# 仅发布配置
php artisan vendor:publish --provider="Sungmee\Admini\ServiceProvider" --tag=config

# 仅发布视图
php artisan vendor:publish --provider="Sungmee\Admini\ServiceProvider" --tag=views

# 仅发布静态资源
php artisan vendor:publish --provider="Sungmee\Admini\ServiceProvider" --tag=public

# 仅发布翻译文件
php artisan vendor:publish --provider="Sungmee\Admini\ServiceProvider" --tag=translations
```

## 环境变量

在 `.env` 中添加：

```env
ADMINI_EMAIL=admin@example.com
ADMINI_PASSWORD=your_password
```

## 数据库迁移

```bash
php artisan migrate
```

## 路由

后台管理入口默认挂载在 `/admini` 路径下：

| 路由 | 方法 | 说明 |
|------|------|------|
| `/admini/login` | GET/POST | 登录 |
| `/admini/logout` | POST | 登出 |
| `/admini/{type}` | GET | 内容列表 |
| `/admini/{type}/create` | GET | 新建内容 |
| `/admini/{type}` | POST | 保存内容 |
| `/admini/{type}/{id}/edit` | GET | 编辑内容 |
| `/admini/{type}/{id}` | PUT/PATCH | 更新内容 |
| `/admini/{type}/{id}` | DELETE | 删除内容 |
| `/admini/tags` | GET/POST | 标签管理 |
| `/admini/tags/{id}/edit` | GET | 编辑标签 |
| `/admini/tags/{id}` | PUT/PATCH | 更新标签 |
| `/admini/tags/{id}` | DELETE | 删除标签 |
| `/admini/upload` | POST | 文件上传 |

## 配置项说明

发布后在 `config/admini.php` 中配置：

```php
return [
    // 管理员邮箱和密码
    'email'    => env('ADMINI_EMAIL', 'admin@app.dev'),
    'password' => env('ADMINI_PASSWORD', '123456'),

    // 支持的语言
    'languages' => [
        ['language' => 'en', 'locale' => 'en'],
        ['language' => 'cn', 'locale' => 'zh_CN'],
    ],

    // 根据浏览器语言自动切换
    'auto_language'  => true,

    // 启用移动端编辑器
    'mobile_version' => false,

    // 显示副标题字段
    'post_subtitle'  => true,

    // 显示附加信息字段
    'post_addition'  => true,

    // 默认缩略图 URL
    'post_thumbnail_default' => null,

    // 启用的内容类型
    'post_type' => [
        'post'     => false,
        'page'     => true,
        'new'      => true,
        'notice'   => false,
        'file'     => false,
        'menu'     => false,
        'homepage' => false,
    ],

    // 允许删除的内容类型
    'delete_botton_in_post_types' => ['news', 'pages'],

    // 自定义元数据字段
    'post_meta' => [
        [
            'type'  => 'textarea',
            'name'  => 'style',
            'label' => 'custom_style',
            'col'   => 12
        ],
    ],

    // 自定义导航链接
    'custom_links' => [],
];
```

## 前端调用

通过 Facade `Admin` 或依赖注入 `Admini` 获取前端数据：

```php
// 获取列表并分页
Admin::posts('new')->paginate();

// 获取单篇文章
Admin::post('hello-world');

// 按标签筛选
Admin::postsByTag('technology')->paginate();

// 自定义排序和数量
Admin::posts('new')->orderBy('created_at')->order('DESC')->limit(5)->get();

// 获取页面列表
Admin::pages();
Admin::news();
Admin::notices();
Admin::files();

// 标签
Admin::tags();
Admin::tag('technology');
```

## Blade 视图

包内置了后台管理视图，你也可以发布到 `resources/views/vendor/admini` 进行自定义覆盖。

## License

MIT
