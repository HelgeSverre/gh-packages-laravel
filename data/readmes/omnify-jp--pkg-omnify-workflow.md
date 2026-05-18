# pkg-omnify-workflow

Laravel package cung cấp hệ thống approval workflow chuẩn quốc tế.

## Tính năng

- **Approval flow**: `draft → pending → approved / rejected / cancelled`
- **Multi-step**: chuỗi bước phê duyệt tuần tự
- **Parallel approval**: tất cả approvers phải đồng ý (parallel step)
- **Scoped RBAC**: phân quyền approver theo role
- **SLA / Escalation**: tự động leo thang khi quá hạn
- **Event-driven notifications**: fire events để host app tự gửi email/push
- **Config + DB**: định nghĩa workflow qua config, có thể override per-org trong DB
- **Morph**: gắn vào bất kỳ model nào qua `HasWorkflow` trait

## Tài liệu

- [Getting Started](guides/getting-started.md) — cài đặt và cấu hình cơ bản
- [Defining Workflows](guides/defining-workflows.md) — cách tạo workflow definition
- [Using HasWorkflow Trait](guides/has-workflow-trait.md) — gắn workflow vào model
- [API Reference](reference/api.md) — REST API endpoints
- [WorkflowEngine Reference](reference/workflow-engine.md) — PHP service API

## Cài đặt nhanh

```bash
# 1. Thêm vào composer.json (path repo)
composer require omnifyjp/omnify-client-laravel-workflow

# 2. Publish migrations + config
php artisan vendor:publish --provider="Omnify\Workflow\WorkflowServiceProvider"

# 3. Migrate
php artisan migrate

# 4. (Optional) Đặt lịch escalate
# Trong AppServiceProvider hoặc routes/console.php:
Schedule::command('workflow:escalate-expired')->hourly();
```

## Routes mặc định

| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/workflow/pending` | Danh sách chờ duyệt của user hiện tại |
| GET | `/api/workflow/instances/{id}` | Chi tiết instance + history |
| POST | `/api/workflow/instances/{id}/approve` | Phê duyệt |
| POST | `/api/workflow/instances/{id}/reject` | Từ chối (cần comment) |
| POST | `/api/workflow/instances/{id}/cancel` | Hủy (submitter hoặc admin) |
