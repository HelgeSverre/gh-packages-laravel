# Laravel GSM Modem Package

A comprehensive Laravel package for GSM modem communication. Send SMS, make calls, handle USSD codes and more through AT commands. Perfect for IoT applications, SMS gateways, and telecommunication solutions.

## Features

- 📱 **SMS Management**: Send, receive, and delete SMS messages in both TEXT and PDU modes
- 📞 **Call Handling**: Make calls, answer incoming calls, and hangup
- 💬 **USSD Support**: Send and receive USSD codes
- 📡 **Network Information**: Get signal strength, network operator, and modem details
- 🔐 **SIM Management**: Check SIM status, unlock with PIN
- ⚡ **Serial Communication**: Robust serial port handling with configurable parameters
- 🎯 **Event System**: Listen for incoming messages and calls
- 🛠️ **Artisan Commands**: Test connection, send SMS, and monitor modem via CLI
- 🧪 **Well Tested**: Comprehensive test suite included

## Requirements

- PHP 8.3 or higher
- Laravel 11.0 or higher
- Access to serial/USB port for GSM modem connection

## Installation

You can install the package via composer:

```bash
composer require iamgerwin/gsm-modem
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag="gsm-modem-config"
```

This will create a `config/gsm-modem.php` configuration file. Configure your modem connection:

```php
return [
    'default' => env('GSM_MODEM_CONNECTION', 'default'),

    'connections' => [
        'default' => [
            'port' => env('GSM_MODEM_PORT', '/dev/ttyUSB0'),
            'baud_rate' => env('GSM_MODEM_BAUD_RATE', 115200),
            'data_bits' => env('GSM_MODEM_DATA_BITS', 8),
            'parity' => env('GSM_MODEM_PARITY', 'none'),
            'stop_bits' => env('GSM_MODEM_STOP_BITS', 1),
            'flow_control' => env('GSM_MODEM_FLOW_CONTROL', 'none'),
        ],
    ],

    'sms_mode' => env('GSM_MODEM_SMS_MODE', 'TEXT'), // TEXT or PDU
    'pin' => env('GSM_MODEM_PIN', null),
    'auto_connect' => env('GSM_MODEM_AUTO_CONNECT', false),
    'debug' => env('GSM_MODEM_DEBUG', false),
];
```

## Usage

### Basic Usage

```php
use Iamgerwin\GsmModem\GsmModem;

$modem = new GsmModem();

// Connect to modem
$modem->open('/dev/ttyUSB0', ['baudRate' => 115200]);

// Send SMS
$modem->sendSms('+1234567890', 'Hello from Laravel!');

// Get inbox messages
$messages = $modem->getInbox();
foreach ($messages as $message) {
    echo "From: {$message->sender}\n";
    echo "Message: {$message->message}\n";
    echo "Time: {$message->timestamp->format('Y-m-d H:i:s')}\n";
}

// Get signal strength
$signal = $modem->getSignalStrength(); // Returns percentage (0-100)

// Make a call
$modem->makeCall('+1234567890');

// Send USSD
$response = $modem->sendUssd('*123#');

// Close connection
$modem->close();
```

### Using the Facade

```php
use Iamgerwin\GsmModem\Facades\GsmModem;

// Send SMS
GsmModem::sendSms('+1234567890', 'Hello!');

// Get network info
$network = GsmModem::getNetworkInfo();
// Returns: ['operator' => 'Vodafone', 'mode' => '4G']

// Get modem info
$info = GsmModem::getModemInfo();
// Returns: ['manufacturer' => 'Huawei', 'model' => 'E3531', 'imei' => '...']
```

### Event Listeners

```php
$modem = new GsmModem();

// Listen for new messages
$modem->on('new_message', function($message) {
    Log::info("New SMS from {$message->sender}: {$message->message}");
});

// Listen for incoming calls
$modem->on('incoming_call', function($number) {
    Log::info("Incoming call from: {$number}");
});
```

### Artisan Commands

Test your modem connection:
```bash
php artisan gsm-modem:test /dev/ttyUSB0 --baudrate=115200
```

Send SMS via CLI:
```bash
php artisan gsm-modem:send-sms +1234567890 "Your message here"
```

Monitor modem for incoming messages:
```bash
php artisan gsm-modem:monitor --interval=5
```

## Advanced Features

### PDU Mode

For broader modem compatibility, use PDU mode:

```php
use Iamgerwin\GsmModem\Enums\SmsMode;

$modem = new GsmModem(['sms_mode' => 'PDU']);
$modem->setSmsMode(SmsMode::PDU);
$modem->sendSms('+1234567890', 'Unicode message: 你好');
```

### SIM Management

```php
// Check SIM status
$simInfo = $modem->getSimInfo();
if ($simInfo['status'] === 'PIN_REQUIRED') {
    $modem->unlockSim('1234');
}

// Get own number
$myNumber = $modem->getOwnNumber();
```

### Message Management

```php
// Delete single message
$modem->deleteMessage(1); // Delete message at index 1

// Delete all messages
$modem->deleteAllMessages();

// Get messages by status
use Iamgerwin\GsmModem\Enums\MessageStatus;

$modem->executeCommand('AT+CMGL=' . MessageStatus::UNREAD->getAtCommand());
```

### Custom AT Commands

Execute any AT command directly:

```php
$response = $modem->executeCommand('AT+COPS?', 10000);
```

## Serial Port Configuration

The package supports various serial port configurations:

- **Baud rates**: 9600, 19200, 38400, 57600, 115200, etc.
- **Data bits**: 5, 6, 7, 8
- **Parity**: none, even, odd
- **Stop bits**: 1, 2
- **Flow control**: none, hardware, software

## Supported Modems

This package works with most GSM modems that support standard AT commands, including:

- Huawei E-series (E3531, E3372, etc.)
- ZTE modems
- Sierra Wireless modems
- Simcom modules (SIM800, SIM900, etc.)
- Quectel modules
- Any Hayes AT command compatible modem

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Troubleshooting

### Common Issues

1. **Permission denied on serial port**
   ```bash
   sudo chmod 666 /dev/ttyUSB0
   # Or add your user to the dialout group
   sudo usermod -a -G dialout $USER
   ```

2. **Port not found**
   - Check connected devices: `ls /dev/tty*`
   - Verify modem is connected: `lsusb`

3. **Commands timeout**
   - Increase timeout in config
   - Check baud rate matches your modem
   - Verify modem is powered on

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security related issues, please email iamgerwin@live.com instead of using the issue tracker.

## Credits

- [Gerwin](https://github.com/iamgerwin)
- Inspired by [serialport-gsm](https://github.com/zabsalahid/serialport-gsm) Node.js package

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.