# Laravel Houjin Bangou (法人番号)

[![Latest Version](https://img.shields.io/github/v/release/GridworksInc/laravel-houjin-bangou)](https://github.com/GridworksInc/laravel-houjin-bangou/releases)
[![Laravel](https://img.shields.io/badge/Laravel-11%20%7C%2012-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-blue.svg)](https://www.php.net)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

日本の法人番号（Corporate Number）を検証し、国税庁の法人番号システムWeb-APIから企業情報を取得するLaravelパッケージです。

Developed by [Gridworks, Inc.](https://gridworks.co.jp)

## 機能

- ✅ 法人番号のチェックデジット検証
- ✅ 国税庁法人番号APIからの企業情報取得
- ✅ 自動ルート登録
- ✅ 設定ファイルのカスタマイズ可能
- ✅ Laravel 11/12 対応

## 必要要件

- PHP 8.2以上
- Laravel 11.x または 12.x
- ext-dom (XML解析用)

## インストール

### 1. Composerでインストール

```bash
composer require gridworks/laravel-houjin-bangou
```

### 2. 設定ファイルの公開（オプション）

```bash
php artisan vendor:publish --tag=houjin-bangou-config
```

### 3. 環境変数の設定

`.env` ファイルに法人番号APIのアプリケーションIDを追加:

```env
HOUJIN_BANGOU_APP_ID=your-application-id-here
```

**アプリケーションIDの取得方法**:

1. [国税庁法人番号システムWeb-API](https://www.houjin-bangou.nta.go.jp/webapi/)にアクセス
2. 「Web-APIの利用届出」から申請
3. 発行されたアプリケーションIDを上記に設定

## 使用方法

### APIエンドポイント

パッケージをインストールすると、以下のAPIエンドポイントが自動的に登録されます:

```
GET /api/corporate-number/{number}
```

**パラメータ**:
- `number`: 13桁の法人番号

**レスポンス例（成功）**:

```json
{
    "name": "株式会社サンプル",
    "address": "東京都千代田区霞が関1-2-3",
    "prefecture_code": "13",
    "postal_code": "1000013"
}
```

**レスポンス例（エラー）**:

```json
{
    "error": "法人番号は13桁で入力してください。"
}
```

### Vueコンポーネントでの使用例

```vue
<script setup>
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'

const form = useForm({
    corporate_number: '',
    company_name: '',
    address: '',
})

const loading = ref(false)
const error = ref(null)

const fetchCompanyInfo = async () => {
    if (form.corporate_number.length !== 13) {
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await fetch(`/api/corporate-number/${form.corporate_number}`)
        const data = await response.json()

        if (response.ok) {
            form.company_name = data.name
            form.address = data.address
        } else {
            error.value = data.error
        }
    } catch (e) {
        error.value = '法人情報の取得に失敗しました。'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <label for="corporate_number">
            法人番号（13桁）
            <span class="ml-1 px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded border border-red-400">
                必須
            </span>
        </label>
        <input
            id="corporate_number"
            v-model="form.corporate_number"
            type="text"
            inputmode="numeric"
            maxlength="13"
            @blur="fetchCompanyInfo"
            :disabled="loading"
        />
        <p v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</p>

        <label for="company_name" class="mt-4">会社名</label>
        <input
            id="company_name"
            v-model="form.company_name"
            type="text"
            readonly
        />

        <label for="address" class="mt-4">住所</label>
        <input
            id="address"
            v-model="form.address"
            type="text"
            readonly
        />
    </div>
</template>
```

### サービスクラスの直接使用

```php
use Gridworks\LaravelHoujinBangou\CorporateNumberService;

// チェックデジットの検証
$isValid = CorporateNumberService::validateCheckDigit('1234567890123');

if ($isValid) {
    // API呼び出し
    $info = CorporateNumberService::lookup('1234567890123');

    if ($info) {
        echo $info['name'];        // 会社名
        echo $info['address'];     // 住所
        echo $info['postal_code']; // 郵便番号
    }
}
```

### カスタムコントローラーでの使用

```php
use Gridworks\LaravelHoujinBangou\CorporateNumberService;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'corporate_number' => 'required|digits:13',
        ]);

        // チェックデジット検証
        if (!CorporateNumberService::validateCheckDigit($validated['corporate_number'])) {
            return back()->withErrors(['corporate_number' => '法人番号が無効です。']);
        }

        // API呼び出し
        $info = CorporateNumberService::lookup($validated['corporate_number']);

        if (!$info) {
            return back()->withErrors(['corporate_number' => '法人情報が見つかりませんでした。']);
        }

        // 企業情報を保存
        Company::create([
            'corporate_number' => $validated['corporate_number'],
            'name' => $info['name'],
            'address' => $info['address'],
            'postal_code' => $info['postal_code'],
        ]);

        return redirect()->route('companies.index');
    }
}
```

## 設定

`config/houjin-bangou.php` で以下の設定が可能です:

```php
return [
    // 法人番号APIアプリケーションID
    'app_id' => env('HOUJIN_BANGOU_APP_ID'),

    // ログ設定
    'log_lookups' => env('HOUJIN_BANGOU_LOG_LOOKUPS', false),

    // APIタイムアウト（秒）
    'timeout' => env('HOUJIN_BANGOU_TIMEOUT', 10),
];
```

### 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `HOUJIN_BANGOU_APP_ID` | 法人番号APIのアプリケーションID | - |
| `HOUJIN_BANGOU_LOG_LOOKUPS` | 法人番号検索をログに記録するか | `false` |
| `HOUJIN_BANGOU_TIMEOUT` | APIタイムアウト（秒） | `10` |

## APIレスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `name` | string | 法人名 |
| `address` | string | 本店所在地 |
| `prefecture_code` | string | 都道府県コード（2桁） |
| `postal_code` | string | 郵便番号（ハイフンなし7桁） |

## チェックデジットアルゴリズム

法人番号のチェックデジットは以下のアルゴリズムで検証されます:

1. 法人番号の2桁目から13桁目までの各桁に重み（奇数位:2、偶数位:1）を掛ける
2. 重みを掛けた値の合計を9で割った余りを求める
3. 余りが0の場合はチェックデジットは0、それ以外は9から余りを引いた値
4. 1桁目とチェックデジットが一致すれば有効

参考: [国税庁 - 法人番号の構成](https://www.houjin-bangou.nta.go.jp/setsumei/)

## トラブルシューティング

### API呼び出しで404エラー

**原因**: アプリケーションIDが未設定または無効

**解決方法**:
1. `.env` に `HOUJIN_BANGOU_APP_ID` が設定されているか確認
2. 国税庁のWeb-APIサイトでアプリケーションIDの状態を確認
3. キャッシュをクリア: `php artisan config:clear`

### ルートが見つからない

**原因**: ServiceProviderが登録されていない

**解決方法**:
```bash
# パッケージの再検出
php artisan package:discover --ansi

# キャッシュをクリア
php artisan route:clear
php artisan config:clear
```

### XMLパースエラー

**原因**: `ext-dom` 拡張がインストールされていない

**解決方法**:
```bash
# Ubuntu/Debian
sudo apt-get install php8.2-xml

# macOS (Homebrew)
brew install php@8.2

# Composer autoloadの再生成
composer dump-autoload
```

## テスト

```bash
# テストの実行（開発中）
composer test
```

## セキュリティ

セキュリティ上の問題を発見した場合は、公開せずに以下のメールアドレスに報告してください:

security@gridworks.co.jp

## ライセンス

このパッケージはMITライセンスの下で提供されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 開発元

**Gridworks, Inc.**
- Website: https://gridworks.co.jp
- GitHub: https://github.com/GridworksInc

## 貢献

プルリクエストを歓迎します！貢献する前に、以下を確認してください:

1. コーディング規約に従う
2. テストを追加する
3. ドキュメントを更新する

## 参考リンク

- [国税庁 法人番号システム Web-API](https://www.houjin-bangou.nta.go.jp/webapi/)
- [Laravel Package Development](https://laravel.com/docs/packages)
- [Gridworks Developers Guide](https://github.com/GridworksInc/developers-guide)

## 変更履歴

### v1.0.0 (2026-03-13)

- 初回リリース
- 法人番号チェックデジット検証機能
- 国税庁APIからの企業情報取得機能
- 自動ルート登録
- Laravel 11/12 対応

---

Made with ❤️ by Gridworks, Inc.
