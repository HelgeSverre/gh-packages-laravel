# [Personal Use] Logify

Logify adalah paket Laravel yang dirancang untuk mempermudah pencatatan aktivitas dalam aplikasi Anda. Paket ini menyediakan cara mudah untuk mencatat aktivitas pengguna, sehingga lebih mudah untuk melacak perubahan dan tindakan yang dilakukan oleh pengguna.

-----

## Fitur Utama

  - **Pencatatan Aktivitas**: Logify secara otomatis mencatat aktivitas pengguna.
  - **Dapat Disesuaikan**: Mudah diperluas agar sesuai dengan kebutuhan aplikasi Anda.
  - **Integrasi**: Bekerja dengan mulus dengan sistem *logging* Laravel.
  - **Log Viewer**: Menyediakan komponen Livewire siap pakai untuk menampilkan dan memfilter log.

-----

## Instalasi

Anda dapat menginstal paket ini melalui Composer:

```bash
composer require novay/logify
```

-----

## Penggunaan

Untuk menggunakan Logify, tambahkan *trait* `LogActivity` ke komponen atau *controller* Anda. *Trait* ini menyediakan serangkaian fungsi *helper* untuk mencatat aktivitas, termasuk:

  * **`logCreated(string $moduleName, array $createdData)`**: Mencatat peristiwa pembuatan data baru.
  * **`logUpdated(string $moduleName, array $oldData, array $newData)`**: Mencatat peristiwa pembaruan data, hanya menampilkan *field* yang berubah.
  * **`logDeleted(string $moduleName, array $deletedData)`**: Mencatat peristiwa penghapusan data.
  * **`log(string $moduleName, string $message, string $level, array $context)`**: Fungsi serbaguna untuk mencatat pesan log kustom dengan *level* tertentu.
  * **`getCauserContext()`**: Mengambil detail pengguna yang saat ini melakukan aksi (nama, ID, IP).

Berikut adalah contoh penggunaan di dalam komponen Livewire:

```php
namespace App\Http\Livewire;

use Livewire\Component;
use Novay\Logify\Traits\LogActivity;
use Illuminate\Support\Facades\Log;

class PostForm extends Component
{
    use LogActivity;

    public function createPost()
    {
        // ... logika validasi & penyimpanan data ...

        $this->logCreated('Post', $newPost->toArray());
    }

    public function updatePost()
    {
        // ... logika validasi & pembaruan data ...

        $this->logUpdated('Post', $oldPost->toArray(), $updatedPost->toArray());
    }

    public function deletePost()
    {
        // ... logika penghapusan data ...

        $this->logDeleted('Post', $deletedPost->toArray());
    }

    public function handleCustomError(\Exception $e)
    {
        // Contoh penggunaan fungsi log()
        $this->log('Post', 'Gagal memproses post', 'error', [
            'exception' => $e->getMessage(),
            'user_input' => $this->all(),
        ]);

        // Contoh langsung menggunakan Log facade dengan channel 'logify'
        Log::channel(config('logify.channel.name'))->error('Galat!: ' . $e->getMessage(), array_merge($this->getCauserContext(), [
            'exception'  => $e->getMessage(),
            'input_data' => $this->all(),
        ]));
    }
}
```

-----

## Konfigurasi

Anda dapat mempublikasikan file konfigurasi menggunakan perintah berikut:

```bash
php artisan vendor:publish --provider="Novay\Logify\LogifyServiceProvider"
```

File konfigurasi ini (`config/logify.php`) memungkinkan Anda menyesuaikan *channel logging* yang digunakan oleh paket. Secara bawaan, konfigurasi akan menggunakan `Monolog\Formatter\JsonFormatter` untuk memastikan *output* log terstruktur dengan baik dan mudah dibaca oleh *log viewer*.

Contoh `config/logify.php`:

```php
<?php

return [
    'channel' => [
        'name' => env('LOGIFY_CHANNEL_NAME', 'logify'),
        'driver' => 'daily',
        'path' => storage_path('logs/logify.log'),
        'level' => env('LOGIFY_CHANNEL_LEVEL', 'info'),
        'days' => 14,
        'formatter' => Monolog\Formatter\JsonFormatter::class,
        'formatter_with' => [
            'batchMode' => Monolog\Formatter\JsonFormatter::BATCH_MODE_NEWLINES,
            'appendNewline' => true
        ],
    ],
];
```

-----

## Log Viewer

Logify menyediakan *view* bawaan untuk *log viewer* dalam bentuk komponen Livewire. Anda dapat menyesuaikannya dengan mempublikasikan *views* paket:

```bash
php artisan vendor:publish --provider="Novay\Logify\LogifyServiceProvider"
```

Setelah itu, Anda dapat memodifikasi *view* yang terletak di `resources/views/vendor/logify/log-viewer.blade.php`.

Anda dapat menyertakan *log viewer* di *template* Blade:

```blade
<livewire:logify::log-viewer />
```

-----

## Lisensi

Logify adalah perangkat lunak *open-source* yang dilisensikan di bawah [Lisensi MIT](https://opensource.org/licenses/mit-license.php).
