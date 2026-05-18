# Laravel ElevenLabs

[![Latest Version](https://img.shields.io/packagist/v/digitalcorehub/laravel-elevenlabs.svg?style=flat-square)](https://packagist.org/packages/digitalcorehub/laravel-elevenlabs)
[![Total Downloads](https://img.shields.io/packagist/dt/digitalcorehub/laravel-elevenlabs.svg?style=flat-square)](https://packagist.org/packages/digitalcorehub/laravel-elevenlabs)
[![License](https://img.shields.io/packagist/l/digitalcorehub/laravel-elevenlabs.svg?style=flat-square)](https://packagist.org/packages/digitalcorehub/laravel-elevenlabs)

A modern, fluent Laravel package for integrating with the ElevenLabs Text-to-Speech (TTS) and Speech-to-Text (STT) APIs. This package provides a clean and intuitive interface for converting text to speech and transcribing audio in your Laravel applications.

**📖 [Türkçe Dokümantasyon](README.tr.md)**

## 📋 Requirements

- PHP 8.2 or higher
- Laravel 12.0 or higher

## 🚀 Installation

You can install the package via Composer:

```bash
composer require digitalcorehub/laravel-elevenlabs
```

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=elevenlabs-config
```

This will create a `config/elevenlabs.php` file in your config directory.

### Environment Variables

Add the following to your `.env` file:

```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_DEFAULT_VOICE=nova
ELEVENLABS_DEFAULT_FORMAT=mp3_44100_128
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
ELEVENLABS_TIMEOUT=30
```

### Configuration Options

- **api_key**: Your ElevenLabs API key (required)
- **base_url**: The base URL for the ElevenLabs API (default: `https://api.elevenlabs.io/v1`)
- **default_voice**: The default voice ID to use (default: `nova`)
- **default_format**: The default audio format (default: `mp3_44100_128`)
- **timeout**: Request timeout in seconds (default: `30`)

## 📖 Usage

## Text-to-Speech (TTS)

### Basic TTS Usage

The package provides a fluent API for generating text-to-speech audio:

```php
use DigitalCoreHub\LaravelElevenLabs\Facades\ElevenLabs;

// Generate audio and save to storage
ElevenLabs::tts()
    ->voice('nova')
    ->text('Hello from Laravel')
    ->format('mp3_44100_128')
    ->save('voices/hello.mp3');
```

### Using Defaults

If you've configured default voice and format, you can omit them:

```php
ElevenLabs::tts()
    ->text('Hello from Laravel')
    ->save('voices/hello.mp3');
```

### Getting Audio File Object

Instead of saving directly, you can get an `AudioFile` object:

```php
$audioFile = ElevenLabs::tts()
    ->voice('nova')
    ->text('Hello from Laravel')
    ->format('mp3_44100_128')
    ->generate();

// Access the content
$content = $audioFile->getContent();

// Get the format
$format = $audioFile->getFormat();

// Save to a different location
$audioFile->save('custom/path/audio.mp3', 's3');
```

### Custom Voice Settings

You can customize voice settings (stability, similarity_boost, etc.):

```php
ElevenLabs::tts()
    ->voice('nova')
    ->text('Hello from Laravel')
    ->voiceSettings([
        'stability' => 0.7,
        'similarity_boost' => 0.8,
    ])
    ->save('voices/hello.mp3');
```

### Available Voices

Common voice IDs include:
- `nova`
- `rachel`
- `domi`
- `bella`
- `antoni`
- `elli`
- `josh`
- `arnold`
- `adam`
- `sam`

### Supported Formats

- `mp3_44100_128`
- `mp3_44100_192`
- `mp3_44100_256`
- `pcm_16000`
- `pcm_22050`
- `pcm_24000`
- `pcm_44100`
- `ulaw_8000`

### Using Different Storage Disks

```php
ElevenLabs::tts()
    ->text('Hello from Laravel')
    ->save('voices/hello.mp3', 's3'); // Save to S3
```

## Speech-to-Text (STT)

### Basic STT Usage

The package provides a fluent API for transcribing audio files:

```php
use DigitalCoreHub\LaravelElevenLabs\Facades\ElevenLabs;

// Transcribe an audio file
$result = ElevenLabs::stt()
    ->file('audio.wav')
    ->transcribe();

// Access the transcribed text
echo $result->text;

// Access words array (if available)
$words = $result->words;

// Access confidence score (if available)
$confidence = $result->confidence;
```

### Using Storage Disks

You can transcribe files from any Laravel storage disk:

```php
// From local storage
$result = ElevenLabs::stt()
    ->file('audio/recording.wav', 'local')
    ->transcribe();

// From S3
$result = ElevenLabs::stt()
    ->file('audio/recording.wav', 's3')
    ->transcribe();
```

### Using Absolute File Paths

You can also use absolute file paths:

```php
$result = ElevenLabs::stt()
    ->file('/path/to/audio.wav')
    ->transcribe();
```

### Custom Model

You can specify a custom model for transcription:

```php
$result = ElevenLabs::stt()
    ->file('audio.wav')
    ->model('eleven_multilingual_v2')
    ->transcribe();
```

### TranscriptionResult Data Model

The `transcribe()` method returns a `TranscriptionResult` object with the following properties:

- **text** (string): The transcribed text
- **words** (array|null): Array of word objects with timing information (if available)
- **confidence** (float|null): Confidence score of the transcription (if available)

Example:

```php
$result = ElevenLabs::stt()
    ->file('audio.wav')
    ->transcribe();

// Get text
$text = $result->getText();

// Get words array
$words = $result->getWords();
// [
//     ['word' => 'Hello', 'start' => 0.0, 'end' => 0.5],
//     ['word' => 'world', 'start' => 0.5, 'end' => 1.0],
// ]

// Get confidence
$confidence = $result->getConfidence(); // 0.95

// Convert to array
$array = $result->toArray();
```

### Supported Audio Formats

The STT API supports various audio formats:
- WAV
- MP3
- M4A
- FLAC
- And other common audio formats

## Voice Management

### List All Voices

Get a collection of all available voices:

```php
$voices = ElevenLabs::voices()->list();

// Iterate through voices
foreach ($voices as $voice) {
    echo $voice->name;
    echo $voice->voiceId;
}

// Find voice by ID
$voice = $voices->findById('voice-id');

// Find voices by name
$found = $voices->findByName('Nova');
```

### Get Single Voice

Get detailed information about a specific voice:

```php
$voice = ElevenLabs::voices()->get('voice-id');

// Access voice properties
echo $voice->name;
echo $voice->description;
echo $voice->category;
$settings = $voice->settings;
```

### Create Custom Voice

Create a custom voice using audio files:

```php
// Using absolute file paths
$voice = ElevenLabs::voices()
    ->name('My Custom Voice')
    ->files(['/path/to/voice1.wav', '/path/to/voice2.wav'])
    ->description('A custom voice for my project')
    ->labels(['accent' => 'british', 'age' => 'young'])
    ->create();

// Using storage disk files
$voice = ElevenLabs::voices()
    ->name('My Custom Voice')
    ->files([
        ['path' => 'voices/voice1.wav', 'disk' => 'local'],
        ['path' => 'voices/voice2.wav', 'disk' => 's3'],
    ])
    ->create();
```

### Delete Voice

Delete a voice:

```php
$deleted = ElevenLabs::voices()->delete('voice-id');
```

### Sync Voices

Sync voices from the API (useful for caching or updating local database):

```php
// Direct sync
$voices = ElevenLabs::voices()->sync();

// Using queue job
use DigitalCoreHub\LaravelElevenLabs\Jobs\SyncVoicesJob;

SyncVoicesJob::dispatch();
```

### Voice Events

The package dispatches events when voices are created or synced:

```php
use DigitalCoreHub\LaravelElevenLabs\Events\VoiceCreated;
use DigitalCoreHub\LaravelElevenLabs\Events\VoiceSynced;

// Listen to voice created event
Event::listen(VoiceCreated::class, function (VoiceCreated $event) {
    $voice = $event->voice;
    // Handle voice creation
});

// Listen to voice synced event
Event::listen(VoiceSynced::class, function (VoiceSynced $event) {
    $voices = $event->voices;
    // Handle voice sync
});
```

### Voice Data Model

The `Voice` class provides access to all voice properties:

```php
$voice = ElevenLabs::voices()->get('voice-id');

// Properties
$voice->voiceId;
$voice->name;
$voice->description;
$voice->category;
$voice->samples;
$voice->settings;
$voice->labels;
$voice->previewUrl;

// Convert to array
$array = $voice->toArray();
```

### VoiceCollection

The `VoiceCollection` extends Laravel's Collection with additional methods:

```php
$voices = ElevenLabs::voices()->list();

// Collection methods
$voices->count();
$voices->first();
$voices->filter(fn ($voice) => $voice->category === 'premade');

// Custom methods
$voice = $voices->findById('voice-id');
$found = $voices->findByName('Nova');
```

## Dubbing (Auto Dubbing Engine)

### Basic Dubbing Usage

Dub videos or audio files to different languages:

```php
// Run dubbing synchronously
$result = ElevenLabs::dubbing()
    ->source('input.mp4')
    ->target('tr')
    ->run();

// Check status
echo $result->status; // processing, completed, failed
echo $result->jobId;
echo $result->outputUrl; // Available when completed
```

### Using Storage Disks

You can use files from any Laravel storage disk:

```php
// From local storage
$result = ElevenLabs::dubbing()
    ->source('videos/input.mp4', 'local')
    ->target('en')
    ->run();

// From S3
$result = ElevenLabs::dubbing()
    ->source('videos/input.mp4', 's3')
    ->target('es')
    ->run();
```

### Using Absolute File Paths

You can also use absolute file paths:

```php
$result = ElevenLabs::dubbing()
    ->source('/path/to/video.mp4')
    ->target('fr')
    ->run();
```

### Dubbing Options

You can pass additional options:

```php
$result = ElevenLabs::dubbing()
    ->source('input.mp4')
    ->target('tr')
    ->options([
        'num_speakers' => 2,
        'watermark' => false,
    ])
    ->run();
```

### Background Dubbing with Queue

For long-running dubbing jobs, use the queue:

```php
// Dispatch to queue
ElevenLabs::dubbing()
    ->source('input.mp4')
    ->target('tr')
    ->dispatch();

// Or with parameters
ElevenLabs::dubbing()->dispatch('input.mp4', 'tr');
```

Or create a dedicated job:

```php
use DigitalCoreHub\LaravelElevenLabs\Jobs\RunDubbingJob;

RunDubbingJob::dispatch('input.mp4', null, 'tr', ['watermark' => false]);
```

### Check Dubbing Status

Check the status of a dubbing job:

```php
$result = ElevenLabs::dubbing()->status('job-id');

if ($result->isCompleted()) {
    // Download the dubbed file
    $outputUrl = $result->outputUrl;
}

if ($result->isInProgress()) {
    // Job is still processing
}

if ($result->isFailed()) {
    // Job failed
}
```

### Dubbing Events

The package dispatches events when dubbing completes:

```php
use DigitalCoreHub\LaravelElevenLabs\Events\DubbingCompleted;

Event::listen(DubbingCompleted::class, function (DubbingCompleted $event) {
    $result = $event->result;

    if ($result->isCompleted()) {
        // Download or process the dubbed file
        $outputUrl = $result->outputUrl;
    }
});
```

### DubbingResult Data Model

The `run()` and `status()` methods return a `DubbingResult` object:

```php
$result = ElevenLabs::dubbing()
    ->source('input.mp4')
    ->target('tr')
    ->run();

// Properties
$result->status;      // processing, completed, failed
$result->jobId;       // Job ID for status checking
$result->outputUrl;   // URL to download dubbed file (when completed)
$result->duration;     // Duration in seconds (when completed)
$result->metadata;     // Additional metadata

// Status checks
$result->isCompleted();
$result->isInProgress();
$result->isFailed();

// Convert to array
$array = $result->toArray();
```

### Supported Languages

Common target language codes:
- `en` - English
- `tr` - Turkish
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- And more...

## 🔄 Queue Usage

You can easily queue TTS generation jobs:

```php
use Illuminate\Support\Facades\Queue;

Queue::push(function () {
    ElevenLabs::tts()
        ->text('This will be processed in the background')
        ->save('voices/queued.mp3');
});
```

Or create a dedicated job:

```php
namespace App\Jobs;

use DigitalCoreHub\LaravelElevenLabs\Facades\ElevenLabs;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateTtsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $text,
        public string $outputPath,
        public ?string $voice = null
    ) {}

    public function handle(): void
    {
        $tts = ElevenLabs::tts()->text($this->text);

        if ($this->voice) {
            $tts->voice($this->voice);
        }

        $tts->save($this->outputPath);
    }
}
```

## 🧪 Testing

The package includes fake providers for testing purposes.

### Testing TTS

```php
use DigitalCoreHub\LaravelElevenLabs\Tests\Fake\FakeTtsProvider;
use DigitalCoreHub\LaravelElevenLabs\Http\Endpoints\TtsEndpoint;
use DigitalCoreHub\LaravelElevenLabs\Http\Clients\ElevenLabsClient;

// In your test setup
$this->app->singleton(TtsEndpoint::class, function ($app) {
    $client = $app->make(ElevenLabsClient::class);
    return new FakeTtsProvider($client);
});
```

### Testing STT

```php
use DigitalCoreHub\LaravelElevenLabs\Tests\Fake\FakeSttProvider;
use DigitalCoreHub\LaravelElevenLabs\Http\Endpoints\SttEndpoint;
use DigitalCoreHub\LaravelElevenLabs\Http\Clients\ElevenLabsClient;

// In your test setup
$this->app->singleton(SttEndpoint::class, function ($app) {
    $client = $app->make(ElevenLabsClient::class);
    return new FakeSttProvider($client);
});
```

## 🛣️ Roadmap

### v0.1 - Text-to-Speech (TTS) ✅
- [x] Fluent API for TTS generation
- [x] Support for multiple audio formats
- [x] Custom voice settings
- [x] Storage integration
- [x] Configuration management
- [x] Comprehensive test coverage

### v0.2 - Speech-to-Text (STT) ✅
- [x] Fluent API for STT transcription
- [x] File upload support (local and storage disks)
- [x] TranscriptionResult data model
- [x] Support for multiple audio formats
- [x] Custom model selection
- [x] Words array and confidence scores
- [x] Comprehensive test coverage

### v0.3 - Voice Management ✅
- [x] Fluent API for voice management
- [x] List and get voice operations
- [x] Custom voice creation with file uploads
- [x] Voice deletion support
- [x] Voice sync functionality
- [x] Queue support with SyncVoicesJob
- [x] Event system (VoiceCreated, VoiceSynced)
- [x] Voice and VoiceCollection data models
- [x] Storage disk integration
- [x] Comprehensive test coverage

### v0.4 - Dubbing (Auto Dubbing Engine) ✅
- [x] Fluent API for video/audio dubbing
- [x] Source file support (local and storage disks)
- [x] Target language selection
- [x] Dubbing options support
- [x] Job status checking
- [x] Queue support with RunDubbingJob
- [x] Event system (DubbingCompleted)
- [x] DubbingResult data model
- [x] Status checking methods (isCompleted, isInProgress, isFailed)
- [x] Storage disk integration
- [x] Comprehensive test coverage

## 📝 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ by [DigitalCoreHub](https://digitalcorehub.com)
