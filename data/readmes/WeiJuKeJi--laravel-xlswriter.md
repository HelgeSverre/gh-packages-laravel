# Laravel Xlswriter

`weijukeji/laravel-xlswriter` 是一个面向 Laravel 项目的 Excel 导入导出扩展，底层基于 PHP `xlswriter` 扩展生成 `.xlsx` 文件。

扩展的核心目标不是替代业务代码，而是把 Excel 文件生成过程中稳定、重复、容易出错的部分封装起来：

- 统一 Laravel 项目里的 Excel 导出写法。
- 让导出定义可以复用查询、Resource、枚举文案等业务展示逻辑。
- 明确声明 Excel 列类型，避免金额、数量、日期等字段被导出成文本。
- 支持大数据量导出时按查询游标迭代，减少一次性加载全部数据的内存压力。
- 为后续导入、异步队列、导出记录和任务状态查询预留扩展边界。

## 环境要求

- PHP 8.3+
- Laravel 12 或 13
- `ext-xlswriter`

安装：

```bash
composer require weijukeji/laravel-xlswriter
```

如果需要调整默认磁盘、目录、临时目录、分块大小等配置，可以发布配置文件：

```bash
php artisan vendor:publish --tag=xlswriter-config
```

## 当前已实现功能

当前版本重点覆盖 Excel 导出，已经实现以下能力：

- 单 Sheet 导出。
- 多 Sheet 导出。
- 基于数组、集合等 `iterable` 数据的导出。
- 基于 Generator 的流式导出。
- 基于 Laravel Query Builder / Eloquent Builder 的查询导出。
- `QueryExport` 自动优先使用 `lazyById()`，其次使用 `lazy()`，最后才回退到 `get()`。
- 通过 `ExcelColumn` 定义表头、字段 key、列宽、数据类型和单元格格式。
- 支持字符串、整数、数字、金额、日期、日期时间、布尔值、公式列。
- 支持 `valueUsing()` 自定义单元格取值。
- 支持 `formatUsing()` 自定义单元格格式。
- 默认写入表头、冻结表头、启用自动筛选。
- 使用 xlswriter constant memory 模式写文件。
- 支持写入 Laravel Storage。
- 支持写入指定本地文件路径，用于 Controller 直接返回下载。
- 提供 `ExportResult`，统一返回文件名、路径、磁盘、绝对路径、大小、MIME 类型和创建时间。
- 提供低层级 `RunExcelExportJob` 队列 Job 脚手架。

需要注意：当前已经有导出 Job 脚手架，但还没有内置完整的“创建导出任务、记录任务状态、前端轮询、失败重试、过期清理”的异步导出闭环。业务项目如果现在需要异步导出，可以基于现有 Job 自行封装任务表和状态接口。

## 当前未实现但已预留的功能

以下能力属于后续规划，不应在当前版本中当成已完成能力使用：

- 完整 Excel 导入读取流程。
- 导入行级校验、错误收集和错误文件回传。
- 导入任务队列。
- 完整异步导出任务服务。
- 导出记录表，例如 `excel_tasks` / `excel_exports`。
- 导出任务状态接口，例如等待中、处理中、成功、失败、过期。
- 导出文件下载授权和过期清理。
- 批量任务管理和后台导出记录查询。
- 更完整的样式能力，例如合并单元格、复杂表头、图片、水印、批注等。

## 适用场景

这个扩展适合以下场景：

- 后台列表数据导出为 Excel。
- 订单、财务、结算、库存、会员等结构化数据导出。
- 需要金额、数量、日期等字段保持 Excel 原生类型，方便用户在 WPS / Excel 中求和、筛选和排序。
- 数据量较大，不希望先 `get()` 全部数据再生成文件。
- 多个模块都需要类似导出能力，希望统一代码风格和文件返回结构。
- 项目未来会继续建设导入、异步导出、导出记录等 Excel 任务能力。

这个扩展不适合直接承载复杂报表引擎。高度定制的财务报表、多级表头、复杂合并单元格、图表、图片模板等场景，当前版本可能需要业务侧自行扩展 Writer 或等待后续版本。

## 基础概念

### Exportable

`Exportable` 表示一个 Excel 文件。一个文件可以包含一个或多个 Sheet。

内置实现：

- `SingleSheetExport`：单 Sheet 文件。
- `MultiSheetExport`：多 Sheet 文件。

多数情况下不需要手动创建 `SingleSheetExport`。直接把一个 `SheetExport` 传给 `Xlswriter::export()`，扩展会自动包装成单 Sheet 文件。

### SheetExport

`SheetExport` 表示一个 Sheet，核心方法包括：

- `title()`：Sheet 名称。
- `columns()`：列定义。
- `rows()`：行数据。
- `options()`：当前 Sheet 的配置覆盖。

内置基类：

- `CollectionExport`：适合少量数组或集合数据。
- `GeneratorExport`：适合手写生成器逐行产出数据。
- `QueryExport`：适合 Eloquent / Query Builder 大数据量导出。

### ExcelColumn

`ExcelColumn` 表示一个 Excel 列。它负责定义：

- 字段 key。
- 表头名称。
- Excel 数据类型。
- 数字格式。
- 列宽。
- 自定义取值逻辑。
- 自定义单元格格式。

常用类型：

```php
ExcelColumn::make('order_no', '订单号')->string();
ExcelColumn::make('quantity', '数量')->integer();
ExcelColumn::make('amount', '金额')->money();
ExcelColumn::make('rate', '比例')->number('0.00%');
ExcelColumn::make('business_date', '营业日期')->date();
ExcelColumn::make('created_at', '创建时间')->datetime();
ExcelColumn::make('enabled', '是否启用')->boolean();
```

## 快速开始

```php
use WeiJuKeJi\LaravelXlswriter\Exports\CollectionExport;
use WeiJuKeJi\LaravelXlswriter\Facades\Xlswriter;
use WeiJuKeJi\LaravelXlswriter\Support\ExcelColumn;

$export = new CollectionExport(
    rows: [
        ['order_no' => 'A1001', 'amount' => 99.50],
        ['order_no' => 'A1002', 'amount' => 120.00],
    ],
    columns: [
        ExcelColumn::make('order_no', '订单号')->string()->width(24),
        ExcelColumn::make('amount', '金额')->money()->width(12),
    ],
    title: '订单'
);

$result = Xlswriter::export($export)->store('exports/orders', 'orders.xlsx');
```

`store()` 会把文件写入 Laravel Storage，并返回 `ExportResult`：

```php
[
    'file_name' => 'orders.xlsx',
    'path' => 'exports/orders/orders.xlsx',
    'disk' => 'local',
    'absolute_path' => storage_path('app/exports/orders/orders.xlsx'),
    'size' => 12345,
    'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'created_at' => '2026-05-08 12:00:00',
    'meta' => ['driver' => 'xlswriter'],
]
```

## 查询导出

大数据量导出优先使用 `QueryExport`。它会按配置的 `chunk_size` 迭代查询结果，避免一次性加载全部数据。

```php
use Illuminate\Database\Eloquent\Builder;
use WeiJuKeJi\LaravelXlswriter\Exports\QueryExport;
use WeiJuKeJi\LaravelXlswriter\Support\ExcelColumn;

final class OrderExport extends QueryExport
{
    public function __construct(
        protected Builder $query,
        protected string $sheetTitle = '订单导出'
    ) {
    }

    public function title(): string
    {
        return $this->sheetTitle;
    }

    public function query(): Builder
    {
        return $this->query;
    }

    public function columns(): array
    {
        return [
            ExcelColumn::make('order_no', '订单号')->string()->width(24),
            ExcelColumn::make('amount', '金额')->money()->width(12),
            ExcelColumn::make('created_at', '创建时间')->datetime()->width(20),
        ];
    }
}
```

Controller 中可以直接生成文件并返回下载：

```php
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use WeiJuKeJi\LaravelXlswriter\Facades\Xlswriter;

public function export(OrderExportRequest $request): BinaryFileResponse
{
    $query = Order::query()
        ->filter($request->validated())
        ->latest('id');

    $filename = 'orders-'.now()->format('YmdHis').'.xlsx';
    $path = storage_path('app/tmp/order-exports/'.$filename);

    Xlswriter::export(new OrderExport($query))->toFile($path, $filename);

    return response()
        ->download($path, $filename)
        ->deleteFileAfterSend(true);
}
```

如果接口不直接返回文件流，而是需要先生成文件并返回文件信息，可以使用 `store()`：

```php
$result = Xlswriter::export(new OrderExport($query))
    ->store(directory: 'exports/orders', filename: $filename, disk: 'local');

return response()->json($result->toArray());
```

## 复用 Resource 的推荐写法

导出不应该重新实现一套列表查询、权限视角、枚举文案和字段展示逻辑。推荐做法是：

- Controller / Service 复用列表查询条件、权限范围和排序。
- Resource 复用列表字段展示、枚举文案、观察者视角。
- Export 只定义 Excel 表头、列顺序、列宽、单元格类型和导出专属取值。

示例：

```php
use Modules\Order\Http\Resources\OrderResource;
use WeiJuKeJi\LaravelXlswriter\Exports\QueryExport;
use WeiJuKeJi\LaravelXlswriter\Support\ExcelColumn;

final class OrderExport extends QueryExport
{
    // 这里省略 constructor/title/query，实际项目中与上方 QueryExport 示例一致。

    public function rows(): iterable
    {
        foreach ($this->query()->lazy($this->chunkSize()) as $order) {
            yield OrderResource::make($order)->resolve();
        }
    }

    public function columns(): array
    {
        return [
            ExcelColumn::make('order_no', '订单号')->string()->width(24),
            ExcelColumn::make('sale_channel', '销售渠道')
                ->valueUsing(fn (array $row) => data_get($row, 'observer_view.sale_to_channel.name', ''))
                ->width(22),
            ExcelColumn::make('observer_sale', '销售金额')
                ->valueUsing(fn (array $row) => data_get($row, 'observer_view.sale', 0))
                ->money()
                ->width(12),
            ExcelColumn::make('created_at', '创建时间')->datetime()->width(20),
        ];
    }
}
```

这样可以保证同一业务字段在列表和导出中的展示规则一致，只把 Excel 专属的类型和格式留在 Export 类中。

## 多 Sheet 导出

```php
use WeiJuKeJi\LaravelXlswriter\Exports\CollectionExport;
use WeiJuKeJi\LaravelXlswriter\Exports\MultiSheetExport;
use WeiJuKeJi\LaravelXlswriter\Facades\Xlswriter;

$export = new MultiSheetExport([
    new CollectionExport($orders, $orderColumns, '订单'),
    new CollectionExport($refunds, $refundColumns, '退款'),
], filename: 'order-report.xlsx');

$result = Xlswriter::export($export)->store('exports/reports');
```

Sheet 名称会自动清理 Excel 不允许的字符，并限制在 31 个字符以内。

## 配置说明

发布后的配置文件为 `config/xlswriter.php`：

```php
return [
    'disk' => env('XLSWRITER_DISK', 'local'),
    'path' => env('XLSWRITER_PATH', 'exports'),
    'temp_path' => env('XLSWRITER_TEMP_PATH', storage_path('app/tmp/xlswriter')),
    'chunk_size' => (int) env('XLSWRITER_CHUNK_SIZE', 1000),
    'queue' => env('XLSWRITER_QUEUE', 'exports'),
    'default_sheet_name' => env('XLSWRITER_DEFAULT_SHEET_NAME', 'Sheet1'),
    'auto_filter' => env('XLSWRITER_AUTO_FILTER', true),
    'freeze_header' => env('XLSWRITER_FREEZE_HEADER', true),
    'use_zip64' => env('XLSWRITER_USE_ZIP64', true),
    'max_rows_per_sheet' => (int) env('XLSWRITER_MAX_ROWS_PER_SHEET', 1048576),
    'file_ttl_days' => (int) env('XLSWRITER_FILE_TTL_DAYS', 7),
    'track_tasks' => env('XLSWRITER_TRACK_TASKS', false),
];
```

常用配置：

- `disk`：`store()` 默认写入的 Storage 磁盘。
- `path`：`store()` 默认写入目录。
- `temp_path`：生成 Excel 时使用的临时目录。
- `chunk_size`：`QueryExport` 查询迭代分块大小。
- `queue`：预留给导入导出队列任务使用的队列名。
- `auto_filter`：是否默认启用表头筛选。
- `freeze_header`：是否默认冻结首行。
- `use_zip64`：是否启用 Zip64，适合较大 xlsx 文件。
- `file_ttl_days`：预留给后续文件过期清理。
- `track_tasks`：预留给后续导出记录和任务追踪。

## 注意事项

### 业务逻辑不要写进 Export

Export 类只负责 Excel 展示结构。查询范围、权限视角、筛选条件、枚举文案等应复用列表接口已有逻辑。

如果列表和导出都要展示同一个业务字段，优先把规则放到 Resource 或共享服务中。

### 金额和数量不要导出成文本

金额、数量、比例等字段必须使用数值类型：

```php
ExcelColumn::make('amount', '金额')->money();
ExcelColumn::make('quantity', '数量')->integer();
ExcelColumn::make('rate', '比例')->number('0.00%');
```

不要提前使用 `number_format()`，也不要拼接 `元`、`个`、`%` 等单位后再导出。需要展示单位时，建议单独增加文本列。

### 编号类字段使用字符串

订单号、手机号、证件号、卡号、编码等字段应该使用 `string()`，避免 Excel 自动转科学计数法或丢失前导零。

```php
ExcelColumn::make('order_no', '订单号')->string();
ExcelColumn::make('phone', '手机号')->string();
```

### 日期字段传原始日期值

`date()` 和 `datetime()` 支持 `DateTimeInterface`，也可以传可被 `Carbon::parse()` 解析的值。不要把日期格式化成复杂中文文案后再交给日期列。

### 大数据量导出优先使用 QueryExport

大数据量不要先 `get()` 后传给 `CollectionExport`。优先使用 `QueryExport`，必要时覆盖 `rows()`，在逐行迭代中转换 Resource。

### 直接下载时注意临时文件清理

使用 `toFile()` 生成本地文件并返回下载时，建议配合：

```php
return response()
    ->download($path, $filename)
    ->deleteFileAfterSend(true);
```

### 路由顺序由业务项目保证

如果导出接口路径类似 `orders/export`，应放在 `orders/{order}` 这类资源路由之前，避免 `export` 被当成模型 ID。

## 未来规划

后续版本计划围绕“Excel 任务能力”继续扩展，而不只停留在同步生成文件：

- 完整异步导出服务：提交导出任务后立即返回任务 ID，由队列后台生成文件。
- 导出记录表：记录任务类型、业务模块、筛选参数、文件路径、状态、失败原因、创建人、完成时间、过期时间等。
- 导出状态接口：支持前端查询排队中、处理中、成功、失败、已过期等状态。
- 导出文件下载接口：统一鉴权、校验归属、处理文件过期和不存在的情况。
- 导出文件清理命令：按 `file_ttl_days` 清理过期文件和记录。
- 队列失败重试和失败原因记录。
- 大文件分 Sheet 策略：超过 Excel 单 Sheet 最大行数时自动拆分 Sheet。
- 导入读取流程：支持读取 xlsx、映射表头、逐行校验、返回行级错误。
- 导入错误文件：把失败行和错误原因重新生成 Excel 供用户下载。
- 导入导出统一任务模型：让同步、异步、导入、导出都使用一致的任务状态和返回结构。

## 开发和测试

运行测试：

```bash
./vendor/bin/pest
```

当前测试重点覆盖：

- 集合导出写入 Storage。
- 数字字符串在金额、数量列中按数值写入。
