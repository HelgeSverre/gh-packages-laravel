# Edge TTS for Laravel

edge-tts is a Laravel package that allows you to use Microsoft Edge's online text-to-speech service from within your Laravel code. **No Azure API Key required** - this package uses the free Edge Read Aloud API.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nosun/edge-tts.svg?style=flat-square)](https://packagist.org/packages/nosun/edge-tts)
[![Total Downloads](https://img.shields.io/packagist/dt/nosun/edge-tts.svg?style=flat-square)](https://packagist.org/packages/nosun/edge-tts)
[![Tests](https://github.com/nosun/edge-tts/actions/workflows/tests.yml/badge.svg)](https://github.com/nosun/edge-tts/actions/workflows/tests.yml)

## Features

- 🎤 **Text to Speech**: Convert text to natural-sounding speech using Microsoft's neural voices
- 🌍 **Multi-language Support**: Support for 100+ languages and locales
- ⚡ **Speech Customization**: Adjust rate, pitch, and volume
- 💾 **Flexible Storage**: Save to local file or Laravel Storage
- 🎮 **Artisan Commands**: Command-line interface for quick usage
- 🔄 **Streaming Support**: Stream audio data in real-time
- 📝 **Metadata Support**: Word and sentence boundary metadata for subtitle generation
- 🔧 **Smart Text Processing**: Automatic text splitting and special character handling
- 🛡️ **Robust Error Handling**: Detailed exception types and automatic retry mechanisms

## Requirements

- PHP >= 8.1
- Laravel >= 10.0 || >= 11.0
- ext-json

## Installation

You can install the package via Composer:

```bash
composer require nosun/edge-tts
```

## Configuration

The package works with default configuration out of the box. If you want to customize the settings, publish the config file:

```bash
php artisan vendor:publish --provider="Nosun\EdgeTts\EdgeTtsServiceProvider" --tag="config"
```

This will create `config/edge-tts.php` with the following options:

```php
return [
    'default' => [
        'voice' => 'en-US-JennyNeural',   // Default voice
        'rate' => '+0%',                     // Speech rate (-100% to +100%)
        'pitch' => '+0Hz',                   // Pitch adjustment
        'volume' => '+0%',                   // Volume (-100% to +100%)
        'format' => 'audio-24khz-96kbitrate-mono-mp3', // Output format
    ],

    'storage' => [
        'disk' => 'public',                  // Storage disk for synthesizeToStorage
        'path' => 'edge-tts',                // Storage path
    ],

    'websocket' => [
        'timeout' => 30,                     // Connection timeout in seconds
        'wss_url' => '...',                  // WebSocket endpoint
        'voices_url' => '...',               // Voices list endpoint
    ],
];
```

## Usage

### Using Facade

```php
use Nosun\EdgeTts\Facades\EdgeTts;

// Basic text-to-speech
$result = EdgeTts::synthesize('Hello, World!');

// Get audio data
$audioData = $result->audioData;

// Save to file
$path = EdgeTts::synthesizeToFile('Hello, World!', '/path/to/output.mp3');

// Save to Laravel Storage
$storagePath = EdgeTts::synthesizeToStorage('Hello, World!', 'greeting.mp3');
```

### Customizing Speech Parameters

```php
use Nosun\EdgeTts\Facades\EdgeTts;

// With custom voice and parameters
$result = EdgeTts::synthesize('你好世界！', [
    'voice' => 'zh-CN-XiaoxiaoNeural',  // Chinese female voice
    'rate' => '+20%',                     // Slightly faster
    'pitch' => '+10Hz',                   // Higher pitch
    'volume' => '+50%',                   // Louder
]);

// Save with custom options
EdgeTts::synthesizeToFile(
    'Welcome to Laravel!', 
    '/path/to/output.mp3',
    [
        'voice' => 'en-US-GuyNeural',
        'rate' => '-10%',
    ]
);
```

### Streaming Audio with Metadata

```php
use Nosun\EdgeTts\Facades\EdgeTts;

// Stream audio in real-time with metadata
$stream = EdgeTts::stream('This is a long text that will be streamed...', [
    'boundary' => 'WordBoundary', // or 'SentenceBoundary'
]);

foreach ($stream as $chunk) {
    if ($chunk['type'] === 'audio') {
        // Process audio chunk
        file_put_contents('output.mp3', $chunk['data'], FILE_APPEND);
    } elseif ($chunk['type'] === 'WordBoundary' || $chunk['type'] === 'SentenceBoundary') {
        // Process metadata for subtitle generation
        echo "Text: {$chunk['text']}\n";
        echo "Offset: {$chunk['offset']} ticks\n";
        echo "Duration: {$chunk['duration']} ticks\n";
    }
}
```

### Voice Management

```php
use Nosun\EdgeTts\Facades\EdgeTts;

// Get all available voices
$voices = EdgeTts::voices();
foreach ($voices as $voice) {
    echo $voice->shortName . ' - ' . $voice->localeName . PHP_EOL;
}

// Filter voices by locale
$chineseVoices = EdgeTts::voicesByLocale('zh-CN');

// Filter voices by gender
$femaleVoices = EdgeTts::voicesByGender('Female');

// Get a specific voice
$voice = EdgeTts::getVoice('en-US-JennyNeural');

// Check if voice exists
if (EdgeTts::voiceExists('zh-CN-YunxiNeural')) {
    // Voice is available
}

// Get all available locales
$locales = EdgeTts::getLocales();
```

### Using Dependency Injection

```php
use Nosun\EdgeTts\EdgeTts;

class TtsController extends Controller
{
    public function synthesize(EdgeTts $edgeTts, Request $request)
    {
        $result = $edgeTts->synthesize($request->input('text'));
        
        return response($result->audioData)
            ->header('Content-Type', 'audio/mpeg');
    }
}
```

## Artisan Commands

### List Available Voices

```bash
# List all voices
php artisan edge-tts:voices

# Filter by locale
php artisan edge-tts:voices --locale=en-US
php artisan edge-tts:voices --locale=zh-CN

# Filter by gender
php artisan edge-tts:voices --gender=Female
php artisan edge-tts:voices --gender=Male
```

### Synthesize Text to Speech

```bash
# Basic synthesis (shows info only)
php artisan edge-tts:synthesize "Hello, World!"

# Save to local file
php artisan edge-tts:synthesize "Hello, World!" --output=/path/to/output.mp3

# Save to Laravel Storage
php artisan edge-tts:synthesize "Hello, World!" --storage --output=greeting.mp3

# With custom options
php artisan edge-tts:synthesize "你好！" \
    --voice=zh-CN-XiaoxiaoNeural \
    --rate=+20% \
    --pitch=+10Hz \
    --volume=+50% \
    --output=chinese.mp3
```

## Popular Voices

Here are some popular voices you can use:

| Voice Name | Language | Gender | Description |
|------------|----------|--------|-------------|
| `en-US-JennyNeural` | English (US) | Female | Warm, professional |
| `en-US-GuyNeural` | English (US) | Male | Deep, confident |
| `zh-CN-XiaoxiaoNeural` | Chinese (Mandarin) | Female | Natural Chinese |
| `zh-CN-YunxiNeural` | Chinese (Mandarin) | Male | Clear Chinese |
| `en-GB-SoniaNeural` | English (UK) | Female | British accent |
| `ja-JP-NanamiNeural` | Japanese | Female | Japanese |
| `ko-KR-SunHiNeural` | Korean | Female | Korean |
| `fr-FR-DeniseNeural` | French | Female | French |
| `de-DE-KatjaNeural` | German | Female | German |
| `es-ES-ElviraNeural` | Spanish | Female | Spanish |

Run `php artisan edge-tts:voices` to see the complete list.

## Speech Parameters

### Rate
Controls the speaking speed.
- Format: `±X%` (e.g., `+50%`, `-30%`)
- Range: Approximately `-100%` to `+100%`
- Default: `+0%`

### Pitch
Controls the voice pitch.
- Format: `±XHz` (e.g., `+10Hz`, `-5Hz`)
- Or relative: `high`, `low`, `default`
- Default: `+0Hz`

### Volume
Controls the audio volume.
- Format: `±X%` (e.g., `+50%`, `-20%`)
- Range: `-100%` to `+100%`
- Default: `+0%`

### Output Formats
- `audio-24khz-96kbitrate-mono-mp3` (Default)
- `audio-24khz-48kbitrate-mono-mp3`
- `audio-16khz-128kbitrate-mono-mp3`
- `audio-16khz-64kbitrate-mono-mp3`
- `audio-16khz-32kbitrate-mono-mp3`

## Examples

### Controller Example

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Nosun\EdgeTts\Facades\EdgeTts;

class TtsController extends Controller
{
    public function synthesize(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:1000',
            'voice' => 'nullable|string',
            'rate' => 'nullable|string',
        ]);

        $options = [];
        if ($request->voice) {
            $options['voice'] = $request->voice;
        }
        if ($request->rate) {
            $options['rate'] = $request->rate;
        }

        $filename = 'tts_' . uniqid() . '.mp3';
        $path = EdgeTts::synthesizeToStorage($request->text, $filename, $options);

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }

    public function download(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:500',
        ]);

        $result = EdgeTts::synthesize($request->text);

        return response($result->audioData)
            ->header('Content-Type', 'audio/mpeg')
            ->header('Content-Disposition', 'attachment; filename="speech.mp3"');
    }

    public function voices()
    {
        $voices = EdgeTts::voices();
        
        return response()->json([
            'voices' => array_map(fn($v) => $v->toArray(), $voices),
            'locales' => EdgeTts::getLocales(),
        ]);
    }
}
```

### Job Example

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Nosun\EdgeTts\Facades\EdgeTts;

class ProcessTextToSpeech implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $text,
        public string $filename,
        public array $options = []
    ) {}

    public function handle(): void
    {
        EdgeTts::synthesizeToStorage(
            $this->text,
            $this->filename,
            $this->options
        );
    }
}
```

## Testing

Run the package tests:

```bash
composer test
```

Generate code coverage report:

```bash
composer test-coverage
```

## Important Notes

### API Limitations
- This package uses Microsoft Edge's free Read Aloud API
- There may be rate limits or usage restrictions
- The API could change at any time (Microsoft controls this)

### Network Requirements
- Requires HTTPS/WebSocket connectivity to Microsoft servers
- Firewall must allow outbound connections to `speech.platform.bing.com`

### Long Text
- For very long text, consider splitting into smaller chunks
- Streaming is recommended for long texts to reduce memory usage

## Troubleshooting

### Connection Issues
```
NetworkException: WebSocket connection failed
```
- Check your internet connection
- Verify firewall allows WebSocket connections
- Try increasing the timeout in config

### Authentication Issues
```
403 Forbidden / Authentication error
```
- This is usually caused by clock skew between your server and Microsoft's servers
- The package includes automatic clock skew detection and retry
- If persistent, check your server's system clock

### Voice Not Found
```
VoiceNotFoundException: Voice not found: unknown-voice
```
- Run `php artisan edge-tts:voices` to see available voices
- Use the exact `ShortName` value

### No Audio Received
```
NoAudioReceivedException: No audio was received
```
- Verify your text is not empty
- Check if the voice supports the language of your text
- Review network connectivity

### Unexpected Response
```
UnexpectedResponseException: Unexpected response from service
```
- This indicates the service returned an unexpected format
- Check if Microsoft has updated their API
- Ensure you're using the latest version of this package

### SSL/TLS Issues
Ensure your PHP installation has proper SSL certificates configured.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Nosun](https://github.com/nosun)
- [All Contributors](../../contributors)

This package is inspired by:
- [rany2/edge-tts](https://github.com/rany2/edge-tts) - Python implementation
- [ericc-ch/edge-tts](https://github.com/ericc-ch/edge-tts) - TypeScript implementation

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
