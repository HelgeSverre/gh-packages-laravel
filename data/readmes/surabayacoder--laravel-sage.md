# Laravel Sage

Laravel Sage adalah package all-in-one untuk mengintegrasikan kemampuan Retrieval-Augmented Generation (RAG) ke dalam aplikasi Laravel Anda. Tanyakan pertanyaan dalam bahasa natural pada dokumen Anda sendiri (PDF dan Markdown) menggunakan kekuatan Google Gemini.

## Fitur Utama

-   **RAG Siap Pakai**: Implementasikan fungsionalitas "tanya dokumen Anda" dalam hitungan menit.
-   **Multi-Driver Vector Store**: Pilih sistem penyimpanan yang sesuai untuk kebutuhan Anda:
    -   `file`: Sederhana, berbasis file JSON, cocok untuk demo dan prototipe.
    -   `pgvector`: Kuat dan efisien, menggunakan ekstensi vector di PostgreSQL untuk produksi.
    -   `mysql`: Pilihan untuk environment MySQL (lebih lambat, tidak disarankan untuk data besar).
-   **Berbagai Sumber Data**: Lakukan ingest (indeks) dari berbagai sumber file (PDF dan Markdown)

## Instalasi

Anda bisa menginstal package ini melalui Composer.

``` bash
composer require surabayacoder/laravel-sage
```

Selanjutnya, pastikan Anda sudah mengatur API Key Gemini dan RAG Vector Driver (pgvector, mysql, atau file) di file `.env`
Anda:

``` env
GEMINI_API_KEY="AIzaSy...kunci_api_anda"
RAG_VECTOR_DRIVER=mysql
```

### Periksa Ekstensi jika menggunakan pgvector sebagai Driver Anda

Jika Anda menggunakan `pgvector`, pastikan ekstensi vector sudah diaktifkan di database Anda. Jika belum aktif, hubungkan ke database Anda sebagai superuser dan jalankan:

``` sql
CREATE EXTENSION vector;
```

## Konfigurasi

### 1. Publikasikan File Konfigurasi

Jalankan perintah `vendor:publish` untuk menyalin file konfigurasi utama
ke direktori config aplikasi Anda.

``` bash
php artisan vendor:publish --provider="Surabayacoder\Sage\SageServiceProvider" --tag="sage-config"
```

Ini akan membuat file `config/sage.php` di mana Anda bisa mengatur model Gemini, driver vector store, dan path sumber dokumen.

### 4. Publikasikan Migrasi

Jalankan `vendor:publish` untuk menyalin file migrasi yang sesuai dengan driver Anda.

``` bash
php artisan vendor:publish --provider="Surabayacoder\Sage\SageServiceProvider" --tag="sage-migrations"
```

Setelah itu, jalankan migrasi seperti biasa:

``` bash
php artisan migrate
```

## Penggunaan

### 1. Ingest (Indexing) Dokumen

Sebelum bisa bertanya, Anda harus memproses dokumen sumber Anda. Tempatkan semua file Anda (misal: `.pdf`, `.md`) di dalam direktori `storage/app/rag_sources`. Kemudian, jalankan perintah ingest.

``` bash
php artisan sage:ingest
```

### 2. Bertanya pada AI

Gunakan Facade `Sage` di mana saja dalam aplikasi Anda untuk mulai
bertanya.

``` php
use Surabayacoder\Sage\Facades\Sage;

// Di dalam Controller atau Route

Route::get('/ask', function () {
    $question = "Bagaimana kebijakan cuti tahunan?";

    $result = Sage::ask($question);

    // $result adalah sebuah array yang berisi 'answer' dan 'sources'
    // dd($result);

    return view('hasil', ['result' => $result]);
});
```

### 3. Multi-turn Chat (Chat History)

Untuk membuat percakapan berkelanjutan (AI mengingat konteks pertanyaan sebelumnya), tambahkan `session_id` sebagai argumen kedua pada method `ask`.

```php
// User bertanya
$response1 = Sage::ask("Siapa penemu lampu?", "session-user-1");
// AI: Thomas Alva Edison...

// User bertanya lagi (Referensial)
$response2 = Sage::ask("Kapan dia lahir?", "session-user-1");
// AI: Thomas Alva Edison lahir pada tahun 1847...
```

Pastikan Anda telah menjalankan migrasi `sage_chat_histories` untuk menggunakan fitur ini.

Method `ask()` akan mengembalikan sebuah array:

-   `answer`: Jawaban yang dihasilkan oleh AI.
-   `sources`: Daftar sumber dokumen yang digunakan untuk menghasilkan jawaban tersebut.

## Lisensi

Package ini berlisensi MIT. Silakan lihat File Lisensi untuk informasi lebih lanjut.
