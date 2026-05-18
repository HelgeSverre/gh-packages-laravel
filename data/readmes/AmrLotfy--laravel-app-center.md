# Laravel App Center

A unified Laravel package for integrating with popular third-party services like Slack, WhatsApp, Telegram, ElevenLabs, and OpenAI.

## Features

- **Unified API** - Consistent interface across all integrations
- **Fluent Interface** - Method chaining for clean, readable code
- **Modular** - Only load the channels you need
- **Laravel Native** - Built with Laravel patterns and best practices

## Supported Channels

### Communication
- **Slack** - Messages, webhooks, attachments, blocks
- **WhatsApp** - Meta Cloud API, templates, media messages
- **Telegram** - Bot API, inline keyboards, media

### AI & Voice
- **ElevenLabs** - Text-to-speech, voice synthesis
- **OpenAI** - GPT Chat, TTS, DALL-E images, Whisper transcription

## Requirements

- PHP >= 8.1
- Laravel >= 10.x

## Installation

```bash
composer require amrlotfy/laravel-app-center
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=app-center-config
```

## Configuration

Add your API credentials to your `.env` file:

```env
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_BOT_TOKEN=xoxb-...

# WhatsApp (Meta)
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_API_VERSION=v18.0

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# ElevenLabs
ELEVENLABS_API_KEY=your-api-key
ELEVENLABS_DEFAULT_VOICE=rachel

# OpenAI
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4
OPENAI_TTS_VOICE=alloy
```

## Usage

### Basic Usage

```php
use AmrLotfy\AppCenter\Facades\AppCenter;

// Slack
AppCenter::slack()->message('#general', 'Hello team!');

// WhatsApp
AppCenter::whatsapp()->send('+1234567890', 'Your order is ready!');

// Telegram
AppCenter::telegram()->send($chatId, 'Hello from Laravel!');

// ElevenLabs
$audio = AppCenter::elevenlabs()->textToSpeech('Welcome to our app');

// OpenAI
$response = AppCenter::openai()->chat('What is Laravel?');
```

---

## Slack

### Webhook Messages

```php
AppCenter::slack()
    ->webhook('https://hooks.slack.com/services/...')
    ->send('#general', 'Hello via webhook!');
```

### Bot API Messages

```php
// Simple message
AppCenter::slack()->message('#general', 'Hello team!');

// With attachments
AppCenter::slack()
    ->withAttachments([
        [
            'color' => '#36a64f',
            'title' => 'New Order',
            'text' => 'Order #1234 has been placed',
        ]
    ])
    ->message('#orders', 'New order received!');

// With blocks
AppCenter::slack()
    ->withBlocks([
        [
            'type' => 'section',
            'text' => [
                'type' => 'mrkdwn',
                'text' => '*New Feature Released!*'
            ]
        ]
    ])
    ->message('#announcements', 'Check out our new feature!');
```

### Send Media

```php
AppCenter::slack()->sendMedia('#general', 'https://example.com/image.png', 'Check this out!');
```

---

## WhatsApp

### Text Messages

```php
AppCenter::whatsapp()->send('+1234567890', 'Hello from Laravel!');
```

### Template Messages

```php
AppCenter::whatsapp()->sendTemplate(
    '+1234567890',
    'order_confirmation',
    [
        [
            'type' => 'body',
            'parameters' => [
                ['type' => 'text', 'text' => 'John'],
                ['type' => 'text', 'text' => '#12345'],
            ]
        ]
    ],
    'en'
);
```

### Media Messages

```php
// Image
AppCenter::whatsapp()->sendImage('+1234567890', 'https://example.com/image.jpg', 'Product image');

// Document
AppCenter::whatsapp()->sendDocument('+1234567890', 'https://example.com/invoice.pdf', 'Your invoice', 'invoice.pdf');

// Audio
AppCenter::whatsapp()->sendAudio('+1234567890', 'https://example.com/audio.mp3');

// Video
AppCenter::whatsapp()->sendVideo('+1234567890', 'https://example.com/video.mp4', 'Check this out!');
```

### Location

```php
AppCenter::whatsapp()->sendLocation('+1234567890', 37.7749, -122.4194, 'San Francisco', '123 Main St');
```

### Interactive Buttons

```php
AppCenter::whatsapp()->sendButtons(
    '+1234567890',
    'Would you like to proceed?',
    [
        ['id' => 'yes', 'title' => 'Yes'],
        ['id' => 'no', 'title' => 'No'],
    ],
    'Confirmation',
    'Please respond'
);
```

---

## Telegram

### Text Messages

```php
// Simple message
AppCenter::telegram()->send($chatId, 'Hello!');

// With HTML formatting
AppCenter::telegram()
    ->parseMode('HTML')
    ->send($chatId, '<b>Bold</b> and <i>italic</i>');

// Silent message
AppCenter::telegram()->silent()->send($chatId, 'This will not notify the user');
```

### Keyboards

```php
// Inline keyboard
AppCenter::telegram()
    ->withInlineKeyboard([
        [
            ['text' => 'Option 1', 'callback_data' => 'option_1'],
            ['text' => 'Option 2', 'callback_data' => 'option_2'],
        ]
    ])
    ->send($chatId, 'Choose an option:');

// Reply keyboard
AppCenter::telegram()
    ->withKeyboard([
        [['text' => 'Yes'], ['text' => 'No']],
    ])
    ->send($chatId, 'Do you agree?');
```

### Media

```php
// Photo
AppCenter::telegram()->sendPhoto($chatId, 'https://example.com/photo.jpg', 'Nice photo!');

// Document
AppCenter::telegram()->sendDocument($chatId, 'https://example.com/file.pdf', 'Your document');

// Audio
AppCenter::telegram()->sendAudio($chatId, 'https://example.com/audio.mp3', 'Great song!');

// Video
AppCenter::telegram()->sendVideo($chatId, 'https://example.com/video.mp4', 'Check this out!');
```

### Other Features

```php
// Location
AppCenter::telegram()->sendLocation($chatId, 37.7749, -122.4194);

// Contact
AppCenter::telegram()->sendContact($chatId, '+1234567890', 'John', 'Doe');

// Poll
AppCenter::telegram()->sendPoll($chatId, 'What is your favorite color?', ['Red', 'Blue', 'Green']);

// Edit message
AppCenter::telegram()->editMessage($chatId, $messageId, 'Updated text');

// Delete message
AppCenter::telegram()->deleteMessage($chatId, $messageId);
```

---

## ElevenLabs

### Text-to-Speech

```php
// Basic TTS
$response = AppCenter::elevenlabs()->textToSpeech('Hello, welcome to our app!');
$audioContent = $response->data('audio');

// With specific voice
$response = AppCenter::elevenlabs()
    ->voice('adam')
    ->textToSpeech('Hello!');

// Save to file
$response = AppCenter::elevenlabs()
    ->voice('rachel')
    ->textToSpeechSave('Hello!', storage_path('app/audio/greeting.mp3'));
```

### Voice Settings

```php
$response = AppCenter::elevenlabs()
    ->voice('rachel')
    ->model('eleven_multilingual_v2')
    ->settings(
        stability: 0.7,
        similarityBoost: 0.8,
        style: 0.5,
        useSpeakerBoost: true
    )
    ->textToSpeech('Hello!');
```

### Available Voices

```php
$response = AppCenter::elevenlabs()->getVoices();
$voices = $response->data('voices');
```

---

## OpenAI

### Chat Completions

```php
// Simple chat
$response = AppCenter::openai()->chat('What is Laravel?');
$answer = $response->data('content');

// With system prompt
$response = AppCenter::openai()
    ->system('You are a helpful coding assistant.')
    ->chat('How do I create a controller in Laravel?');

// With conversation history
$response = AppCenter::openai()->conversation([
    ['role' => 'system', 'content' => 'You are a helpful assistant.'],
    ['role' => 'user', 'content' => 'Hello!'],
    ['role' => 'assistant', 'content' => 'Hi! How can I help you?'],
    ['role' => 'user', 'content' => 'What is PHP?'],
]);

// With custom settings
$response = AppCenter::openai()
    ->model('gpt-4')
    ->temperature(0.8)
    ->maxTokens(1000)
    ->chat('Write a poem about Laravel');
```

### Text-to-Speech

```php
// Basic TTS
$response = AppCenter::openai()->tts('Hello, welcome!');
$audioContent = $response->data('audio');

// With voice and speed
$response = AppCenter::openai()
    ->voice('nova')
    ->speed(1.2)
    ->tts('Hello!');

// Save to file
$response = AppCenter::openai()
    ->voice('alloy')
    ->ttsSave('Hello!', storage_path('app/audio/greeting.mp3'));
```

Available voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

### Speech-to-Text (Whisper)

```php
$response = AppCenter::openai()->transcribe(storage_path('app/audio/recording.mp3'), 'en');
$text = $response->data('text');
```

### Image Generation (DALL-E)

```php
$response = AppCenter::openai()->image('A sunset over mountains', '1024x1024');
$images = $response->data('images');
```

### Embeddings

```php
$response = AppCenter::openai()->embeddings('Hello, world!');
```

### Content Moderation

```php
$response = AppCenter::openai()->moderate('Some text to check');
```

---

## Response Object

All methods return a `Response` object with consistent methods:

```php
$response = AppCenter::slack()->message('#general', 'Hello!');

// Check status
$response->successful(); // bool
$response->ok();         // alias for successful()
$response->isSuccess();  // alias for successful()
$response->failed();     // bool

// Get data
$response->data();              // array - all data
$response->data('key');         // mixed - specific key
$response->data('key', 'default'); // mixed - with default

// Get error
$response->error();      // string|null

// Get HTTP info
$response->statusCode(); // int
$response->headers();    // array

// Throw exception on failure
$response->throw();

// Convert to array/JSON
$response->toArray();
$response->toJson();
```

---

## Error Handling

```php
use AmrLotfy\AppCenter\Exceptions\ApiException;
use AmrLotfy\AppCenter\Exceptions\ConfigurationException;
use AmrLotfy\AppCenter\Exceptions\ChannelNotFoundException;

try {
    $response = AppCenter::slack()->message('#general', 'Hello!');
    $response->throw(); // Throws if failed
} catch (ConfigurationException $e) {
    // Missing configuration
} catch (ApiException $e) {
    // API error
}
```

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
