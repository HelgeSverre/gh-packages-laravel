# laravel-audit-diff

Laravel Eloquent モデルの変更差分（Diff）を自動記録する監査ログパッケージです。  
created / updated / deleted イベントに対応し、変更キーのみを保存する軽量設計を採用しています。

---

## ✨ 特徴

- created / updated / deleted イベント対応
- 変更されたキーのみを保存（Diff方式）
- パスワード等のマスキング機能
- 除外キー（exclude_keys）設定可能
- actor_resolver による柔軟なユーザー識別
- updated_at のみ変更時はログスキップ可能
- JSON形式で before / after を保存

---

## 📦 インストール

```bash
composer require ryoyoshihara/laravel-audit-diff:^0.2
```

設定・マイグレーション生成：

```bash
php artisan audit-diff:install --migrate
```

---

## 🚀 使用方法

### 1. モデルに Trait を追加

```php
use AuditDiff\Laravel\Traits\Auditable;

class Post extends Model
{
    use Auditable;
}
```

これだけで変更が自動記録されます。

---

## 🗂 保存される形式

### updated の場合

```json
{
  "name": {
    "before": "A",
    "after": "B"
  }
}
```

### created の場合

- diff: null
- after: 作成時スナップショット

### deleted の場合

- diff: null
- before: 削除前スナップショット

---

## ⚙ 設定（config/audit-diff.php）

```php
return [

    'enabled' => true,

    'events' => ['created', 'updated', 'deleted'],

    'null_equals_empty_string' => true,

    'skip_if_only_timestamps_changed' => true,

    'store_full_snapshot' => false,

    'mask_keys' => [
        'password',
        'token',
        'secret',
        'api_key',
    ],

    'exclude_keys' => [
        'remember_token',
    ],

    'actor_resolver' => null,
];
```

---

## 👤 actor_resolver 例

```php
'actor_resolver' => fn () => [
    'id' => 'demo-user-1',
    'type' => 'demo',
],
```

ログインユーザーを使用する場合は、独自実装も可能です。

---

## 🔒 マスキング

mask_keys に指定したキーは以下のように保存されます：

```json
{
  "password": {
    "before": "***",
    "after": "***"
  }
}
```

---

## 🧪 テスト対応

- created / updated / deleted 検証済み
- exclude_keys 検証済み
- mask_keys 検証済み
- timestamps-only update スキップ検証済み

---

## 📊 デモ構成

- Post CRUD
- Audit Log 一覧表示
- Diff 表示（before / after）

---

## 🏷 バージョン

v0.2.0

---

## 📄 ライセンス

MIT
