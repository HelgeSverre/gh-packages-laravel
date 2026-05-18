[![Packagist Version](https://img.shields.io/packagist/v/dharma/laravel-video-uploader?style=flat-square)](https://packagist.org/packages/dharma/laravel-video-uploader)
[![PHP Version](https://img.shields.io/packagist/php-v/dharma/laravel-video-uploader?style=flat-square)](https://www.php.net/)
[![License](https://img.shields.io/packagist/l/dharma/laravel-video-uploader?style=flat-square)](LICENSE)
[![Laravel Version](https://img.shields.io/badge/Laravel-10.x-red?style=flat-square)](https://laravel.com/)

---

A simple and elegant **Laravel package** to handle **video uploads** effortlessly. Supports single or multiple video uploads with optional validation and storage support. Perfect for modern Laravel applications.  

---

## 🌟 Features

- Upload **single or multiple videos**
- Supports popular video formats (`mp4`, `mov`, `avi`, etc.)
- Optional **size/type validation**
- Compatible with **Laravel 10+**
- Easy integration with **custom storage disks**
- Lightweight and **developer-friendly**

---
## ⚙️ Dependencies
Before using **`dharma/laravel-video-uploader`**, install:
- [pbmedia/laravel-ffmpeg](https://github.com/pascalbaljetmedia/laravel-ffmpeg) – handles video processing.
```bash
composer require pbmedia/laravel-ffmpeg:^8.7
```

## ⚡ Installation

Install via Composer:
```bash
composer require dharma/laravel-video-uploader
```
Publish the config file:
```bash
php artisan vendor:publish --provider="Dharma\VideoUploader\VideoUploaderServiceProvider" --tag=config
```
## 🚀 Usage Examples
```php
use Dharma\VideoUploader\VideoUploader;

class VideoController extends Controller
{
    protected VideoUploader $video;

    public function __construct(VideoUploader $video)
    {
        $this->video = $video;
    }


    /**
     * List all videos
     */
    public function index()
    {
        // List videos with pagination (20 per page)
        $videos = $this->video->list([], 20);
        return view('video', compact('videos'));
    }

    /**
     * Upload a new video
     */
    public function store(Request $request)
    {
        // Upload video and dispatch processing job
        $video = $this->video->uploadVideo($request->file('video'));
        return response()->json([
            'message' => 'Video uploaded and queued for processing.!',
            'video' => $video
        ]);
    }


    /**
     * Show single video
     */
    public function show(int $id)
    {
        $video = $this->video->getById($id);
        return view('video', compact('video'));
    }


    /**
     * Delete a video by ID
     */
    public function destroy(int $id)
    {
        $this->video->deleteById($id);
        return response()->json([
            'message' => 'Video deleted successfully.!'
        ]);
    }
}
```
