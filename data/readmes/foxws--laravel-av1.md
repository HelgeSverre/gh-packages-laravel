# Laravel AV1

[![Latest Version on Packagist](https://img.shields.io/packagist/v/foxws/laravel-av1.svg?style=flat-square)](https://packagist.org/packages/foxws/laravel-av1)
[![Tests](https://img.shields.io/github/actions/workflow/status/foxws/laravel-av1/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/foxws/laravel-av1/actions/workflows/run-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/foxws/laravel-av1.svg?style=flat-square)](https://packagist.org/packages/foxws/laravel-av1)

A Laravel package for AV1 video encoding with support for [ab-av1](https://github.com/alexheretic/ab-av1) VMAF-targeted quality optimization and direct FFmpeg encoding with hardware acceleration (Intel QSV, AMD AMF, NVIDIA NVENC).

```php
use Foxws\AV1\Facades\AV1;

// FFmpeg encoding with hardware acceleration
$result = AV1::open('videos/input.mp4')
    ->ffmpegEncode()
    ->useHardwareAcceleration()
    ->crf(28)
    ->preset('6')
    ->export()
    ->toDisk('s3')
    ->save('output.mp4');

// Or use ab-av1 for VMAF-targeted encoding
$result = AV1::open('videos/input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->save('output.mp4');
```

## Features

- 🎬 **Fluent API** - Laravel-style chainable methods
- 📁 **Multiple Disks** - Works with local, S3, and custom filesystems
- 🎯 **VMAF-Targeted Encoding** - Automatically finds optimal CRF for target quality using ab-av1
- ⚡ **Hardware Acceleration** - GPU encoding support (Intel QSV, AMD AMF, NVIDIA NVENC)
- 🔄 **Multiple Encoders** - Support for ab-av1 and FFmpeg with auto-detection
- 📊 **Quality Metrics** - Built-in VMAF & XPSNR scoring
- 🚀 **Auto CRF Optimization** - Use ab-av1 to find optimal CRF, then encode with FFmpeg GPU
- 🧪 **Testable** - Clean architecture with mockable components
- 📝 **Type-Safe** - Full PHP 8.4+ type declarations

## Requirements

- PHP 8.3 or higher
- Laravel 11.x or higher
- FFmpeg with AV1 encoder support (libsvtav1 or hardware encoder)
- Optional: [ab-av1](https://github.com/alexheretic/ab-av1) for VMAF-targeted quality optimization

## Installation

Install the package via composer:

```bash
composer require foxws/laravel-av1
```

Publish the config file:

```bash
php artisan vendor:publish --tag="av1-config"
```

### Installing ab-av1 (Optional)

ab-av1 is optional but recommended for VMAF-targeted quality optimization. Install using cargo:

```bash
cargo install ab-av1
```

Or download a prebuilt binary from the [releases page](https://github.com/alexheretic/ab-av1/releases).

### Installing FFmpeg with AV1 Support

FFmpeg is required for direct AV1 encoding. Ensure FFmpeg is compiled with AV1 encoder support:

```bash
# Check available AV1 encoders
ffmpeg -encoders | grep av1

# You should see one or more of:
# - libsvtav1 (CPU encoding)
# - av1_qsv (Intel Quick Sync)
# - av1_amf (AMD)
# - av1_nvenc (NVIDIA)
```

For hardware acceleration support, you'll need FFmpeg compiled with the appropriate hardware encoder for your GPU.

### Verify Installation

After installation, verify that ab-av1 is properly configured:

```bash
php artisan av1:verify
```

This will check:

- Binary exists and is executable
- Can retrieve version information
- Configuration is properly set up
- Temporary directory is accessible

### Package Information

View package and binary information:

```bash
php artisan av1:info
```

## Quick Start

### FFmpeg Hardware Encoding

Encode videos using FFmpeg with automatic hardware acceleration detection:

```php
use Foxws\AV1\Facades\AV1;

// Auto-detect and use GPU acceleration
$result = AV1::open('input.mp4')
    ->ffmpegEncode()
    ->useHardwareAcceleration()
    ->crf(28)
    ->preset('6')
    ->export()
    ->save('output.mp4');
```

### FFmpeg with Auto CRF Optimization

Combine ab-av1's CRF optimization with FFmpeg's GPU encoding:

```php
// Use ab-av1 to find optimal CRF, then encode with FFmpeg GPU
$result = AV1::open('input.mp4')
    ->ffmpegAutoEncode()
    ->targetVmaf(95)
    ->preset('6')
    ->useHardwareAcceleration()
    ->export()
    ->save('output.mp4');
```

### Using ab-av1 Encoder

Use ab-av1 for integrated VMAF-targeted encoding:

```php
use Foxws\AV1\Facades\AV1;

$result = AV1::open('input.mp4')
    ->abav1() // Use ab-av1 encoder
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->save('output.mp4');
```

### VMAF Encode

Automatically find the optimal CRF value to achieve a target VMAF quality score and encode the full video:

```php
use Foxws\AV1\Facades\AV1;

$result = AV1::open('input.mp4')
    ->abav1() // Use ab-av1 encoder
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->save('output.mp4');
```

### Hardware Acceleration

Check available hardware encoders and use the best available:

```php
use Foxws\AV1\FFmpeg\HardwareDetector;

$detector = new HardwareDetector();

// Check available encoders
$encoders = $detector->getAvailableEncoders();
// ['av1_qsv' => [...], 'libsvtav1' => [...]]

// Check if hardware acceleration is available
if ($detector->hasHardwareAcceleration()) {
    $result = AV1::open('input.mp4')
        ->ffmpegEncode()
        ->useHardwareAcceleration()
        ->crf(28)
        ->export()
        ->save('output.mp4');
}
```

### CRF Search (ab-av1)

Search for the optimal CRF value without encoding the full video:

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->crfSearch()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->save();

// The output will contain the recommended CRF value
echo $result->getOutput();
```

### Sample Encode (ab-av1)

Encode a sample of the video to test settings:

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->sampleEncode()
    ->crf(30)
    ->preset('6')
    ->sample(60) // Sample duration in seconds
    ->export()
    ->save('sample.mp4');
```

### Full Encode (ab-av1)

Encode the entire video with a specific CRF:

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->encode()
    ->crf(30)
    ->preset('6')
    ->export()
    ->save('output.mp4');
```

### VMAF Score

Calculate VMAF score between two videos:

```php
$result = AV1::vmaf()
    ->abav1()
    ->reference('original.mp4')
    ->distorted('encoded.mp4')
    ->export()
    ->save();

echo $result->getOutput(); // VMAF score
```

### XPSNR Score

Calculate XPSNR score between two videos:

```php
$result = AV1::xpsnr()
    ->abav1()
    ->reference('original.mp4')
    ->distorted('encoded.mp4')
    ->export()
    ->save();

echo $result->getOutput(); // XPSNR score
```

## FFmpeg Encoding

### Basic FFmpeg Encoding

```php
// Simple FFmpeg encode
$result = AV1::open('input.mp4')
    ->ffmpegEncode()
    ->crf(28)
    ->preset('6')
    ->export()
    ->save('output.mp4');

// With 10-bit color
$result = AV1::open('input.mp4')
    ->ffmpegEncode()
    ->crf(28)
    ->pixFmt('yuv420p10le')
    ->export()
    ->save('output.mp4');
```

### GPU Acceleration

```php
// Auto-detect and use best hardware encoder
$result = AV1::open('input.mp4')
    ->ffmpegEncode()
    ->useHardwareAcceleration()
    ->crf(28)
    ->preset('6')
    ->export()
    ->save('output.mp4');
```

### Auto CRF with FFmpeg

Combine ab-av1's CRF optimization with FFmpeg's GPU encoding:

```php
// Find optimal CRF with ab-av1, encode with FFmpeg GPU
$result = AV1::open('input.mp4')
    ->ffmpegAutoEncode()
    ->targetVmaf(95)
    ->preset('6')
    ->useHardwareAcceleration()
    ->export()
    ->save('output.mp4');
```

For detailed FFmpeg examples including hardware-specific configurations, see [FFMPEG_ENCODING.md](FFMPEG_ENCODING.md).

## Working with Different Disks

### From S3

```php
$result = AV1::fromDisk('s3')
    ->open('videos/input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->toDisk('s3')
    ->save('videos/output.mp4');
```

### From Local to S3

```php
$result = AV1::open('local/input.mp4')
    ->abav1()
    ->encode()
    ->crf(30)
    ->preset('6')
    ->export()
    ->toDisk('s3')
    ->toPath('videos/encoded')
    ->save('output.mp4');
```

### S3 with Hardware Encoding

```php
$result = AV1::fromDisk('s3')
    ->open('videos/input.mp4')
    ->ffmpegEncode()
    ->useHardwareAcceleration()
    ->crf(28)
    ->export()
    ->toDisk('s3')
    ->save('encoded/output.mp4');
```

## Advanced Options

### CRF Range

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->crfSearch()
    ->minCrf(20)
    ->maxCrf(40)
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->save();
```

### Max Encoded Size

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->maxEncodedPercent(95) // Max 95% of original size
    ->export()
    ->save('output.mp4');
```

### Pixel Format

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->encode()
    ->crf(30)
    ->preset('6')
    ->pixFmt('yuv420p10le')
    ->export()
    ->save('output.mp4');
```

### Full VMAF

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->fullVmaf() // Calculate VMAF for entire video
    ->export()
    ->save('output.mp4');
```

### VMAF Model

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->vmafModel('/path/to/vmaf_model.json')
    ->export()
    ->save('output.mp4');
```

### Verbose Output

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->verbose()
    ->export()
    ->save('output.mp4');

echo $result->getOutput();
```

## Batch Processing

Process multiple files:

```php
$files = ['video1.mp4', 'video2.mp4', 'video3.mp4'];

AV1::fromDisk('s3')
    ->each($files, function ($av1, $file) {
        $av1->open($file)
            ->abav1()
            ->vmafEncode()
            ->preset('6')
            ->minVmaf(95)
            ->export()
            ->toDisk('s3')
            ->toPath('encoded')
            ->save();
    });
```

## Callbacks

Add callbacks after encoding:

```php
$result = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->afterSaving(function ($result, $path) {
        Log::info("Encoded to: {$path}");
        Log::info("VMAF score: {$result->getOutput()}");
    })
    ->save('output.mp4');
```

## Debugging

Get the command that will be executed:

```php
$command = AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->getCommand();

echo $command;
// Output: ab-av1 auto-encode -i input.mp4 --preset 6 --min-vmaf 95
```

Or dump and die:

```php
AV1::open('input.mp4')
    ->abav1()
    ->vmafEncode()
    ->preset('6')
    ->minVmaf(95)
    ->export()
    ->dd();
```

## Configuration

### Environment Variables

**ab-av1 Configuration:**

- `AB_AV1_BINARY_PATH` - Path to ab-av1 binary (default: '/usr/local/bin/ab-av1')
- `AB_AV1_TIMEOUT` - Maximum time in seconds for encoding commands (default: 14400)
- `AB_AV1_PRESET` - Default encoder preset 0-13 for svt-av1 (default: 6)
- `AB_AV1_MIN_VMAF` - Minimum VMAF score to target (default: 80)
- `AB_AV1_MAX_PERCENT` - Maximum encoded file size as percentage (default: 300)

**FFmpeg Configuration:**

- `FFMPEG_BINARY_PATH` - Path to ffmpeg binary (default: '/usr/local/bin/ffmpeg')
- `FFMPEG_TIMEOUT` - Maximum time in seconds for FFmpeg encoding (default: 7200)
- `FFMPEG_ENCODER` - Force specific encoder (null = auto-detect): av1_qsv, av1_amf, av1_nvenc, libsvtav1
- `FFMPEG_HARDWARE_ACCEL` - Enable hardware acceleration (default: true)
- `FFMPEG_DEFAULT_CRF` - Default CRF value (default: 30)
- `FFMPEG_DEFAULT_PRESET` - Default preset (default: 6)
- `FFMPEG_AUDIO_CODEC` - Default audio codec (default: 'libopus')
- `FFMPEG_PIXEL_FORMAT` - Default pixel format (default: 'yuv420p')
- `FFMPEG_AUTO_CRF` - Use ab-av1 for auto CRF by default (default: false)

**General:**

- `AB_AV1_LOG_CHANNEL` - Log channel to use (false to disable, null for default)
- `AB_AV1_TEMPORARY_FILES_ROOT` - Directory for temporary files (default: storage/app/av1/temp)

### Configuration File

Publish and edit `config/av1.php` for more control:

```php
return [
    'binaries' => [
        'ab-av1' => env('AB_AV1_BINARY_PATH', '/usr/local/bin/ab-av1'),
        'ffmpeg' => env('FFMPEG_BINARY_PATH', '/usr/local/bin/ffmpeg'),
    ],

    'ffmpeg' => [
        'timeout' => env('FFMPEG_TIMEOUT', 7200),
        'encoder' => env('FFMPEG_ENCODER', null),
        'hardware_acceleration' => env('FFMPEG_HARDWARE_ACCEL', true),
        'default_crf' => env('FFMPEG_DEFAULT_CRF', 30),
        'default_preset' => env('FFMPEG_DEFAULT_PRESET', 6),
        'audio_codec' => env('FFMPEG_AUDIO_CODEC', 'libopus'),
        'pixel_format' => env('FFMPEG_PIXEL_FORMAT', 'yuv420p'),
        'auto_crf' => env('FFMPEG_AUTO_CRF', false),
    ],

    'ab-av1' => [
        'timeout' => env('AB_AV1_TIMEOUT', 14400),
        'preset' => env('AB_AV1_PRESET', 6),
        'min_vmaf' => env('AB_AV1_MIN_VMAF', 80),
        'max_encoded_percent' => env('AB_AV1_MAX_PERCENT', 300),
    ],
];
```

## Error Handling

```php
try {
    $result = AV1::open('input.mp4')
        ->abav1()
        ->vmafEncode()
        ->preset('6')
        ->minVmaf(95)
        ->export()
        ->save('output.mp4');

    if ($result->isSuccessful()) {
        echo "Encoding successful!";
    } else {
        echo "Encoding failed: " . $result->getErrorOutput();
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

## Available Commands

### vmafEncode()

Automatically finds the optimal CRF value to achieve a target VMAF score, then encodes the full video at that quality level.

**Required options:**

- `preset(string)` - Encoder preset
- `minVmaf(float)` - Minimum VMAF score

**Optional:**

- `maxEncodedPercent(int)` - Max size as percentage of input
- `sample(int)` - Sample duration in seconds
- `minCrf(int)` - Minimum CRF to try
- `maxCrf(int)` - Maximum CRF to try

### crfSearch()

Searches for the optimal CRF value to achieve a target VMAF score without encoding the full video. Useful for testing before full encoding.

**Required options:**

- `preset(string)` - Encoder preset (0-13 for svt-av1)
- `minVmaf(float)` - Target VMAF score (0-100)

**Optional:** Same as vmafEncode()

### sampleEncode()

Encodes a sample portion of the video for testing settings before committing to a full encode.

**Required options:**

- `crf(int)` - CRF value to use for encoding
- `preset(string)` - Encoder preset (0-13 for svt-av1)

**Optional:**

- `sample(int)` - Sample duration in seconds (default varies by encoder)

### encode()

Encodes the entire video using a manually specified CRF value. Use this when you know the exact CRF you want.

**Required options:**

- `crf(int)` - CRF value (lower = higher quality, larger file)
- `preset(string)` - Encoder preset (0-13 for svt-av1, higher = faster/larger)

### vmaf()

Calculates the VMAF (Video Multimethod Assessment Fusion) quality score between a reference and distorted video.

**Required options:**

- `reference(string)` - Reference (original) video path
- `distorted(string)` - Distorted (encoded) video path

**Optional:**

- `vmafModel(string)` - Path to custom VMAF model file

### xpsnr()

Calculates the XPSNR (Extended Peak Signal-to-Noise Ratio) quality score between a reference and distorted video.

**Required options:**

- `reference(string)` - Reference (original) video path
- `distorted(string)` - Distorted (encoded) video path

## Testing

```bash
composer test
```

## Credits

- [ab-av1](https://github.com/alexheretic/ab-av1) - The underlying encoding tool

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
