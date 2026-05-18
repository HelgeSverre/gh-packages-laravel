# Laravel ClamAV Upload Scanner

<p align="center">
    <img src="logo.png" alt="Laravel ClamAV Upload Scanner" width="400">
</p>


[![Latest Version on Packagist](https://img.shields.io/packagist/v/jodeveloper/upload-file-scanner.svg?style=flat-square)](https://packagist.org/packages/jodeveloper/upload-file-scanner)
[![Total Downloads](https://img.shields.io/packagist/dt/jodeveloper/upload-file-scanner.svg?style=flat-square)](https://packagist.org/packages/jodeveloper/upload-file-scanner)

A clean, Laravel-native way to scan uploaded files using ClamAV. This package provides a simple API for virus scanning in your file upload validation and storage pipelines.

## Installation

You can install the package via composer:

```bash
composer require jodeveloper/upload-file-scanner
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="clamav-scanner-config"
```

This is the contents of the published config file:

```php
return [
    'binary' => env('CLAMAV_BINARY', 'clamscan'),
    'timeout' => (int) env('CLAMAV_TIMEOUT', 30),
    'scan_options' => [
        '--no-summary',
    ],
];
```

## Requirements

- PHP 8.3 or higher
- Laravel 11.0 or 12.0
- ClamAV installed on your server (clamscan binary)

## Installing ClamAV

### macOS

```bash
brew install clamav
```

After installation, you may need to update the virus definitions:

```bash
freshclam
```

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install clamav clamav-daemon
```

Update virus definitions:

```bash
sudo freshclam
```

### CentOS/RHEL

```bash
sudo yum install epel-release
sudo yum install clamav clamav-update
```

Update virus definitions:

```bash
sudo freshclam
```

### From Source

For detailed instructions on installing ClamAV from source, see the [official ClamAV documentation](https://docs.clamav.net/manual/Installing/Installing-from-source-Unix.html).

### Verifying Installation

After installation, verify that ClamAV is accessible:

```bash
clamscan --version
```

This should display ClamAV version information.

## Usage

### Using the Facade (Recommended)

```php
use Jodeveloper\UploadFileScanner\Facades\Scanner;

$result = Scanner::scan('/path/to/file');

if ($result->hasVirus()) {
    // Handle infected file
}

if ($result->isClean()) {
    // File is safe to process
}

// Get the scanner output
$output = $result->output;
```

### Using the Validation Rule

The package provides a Laravel validation rule for easy integration:

**Simple approach (recommended):**

```php
public function upload(Request $request)
{
    $validated = $request->validate([
        'file' => ['required', 'file', 'clean_file'],
    ]);

    // File is clean, proceed with storage
}
```

**For more control, use the object-based approach:**

```php
use Jodeveloper\UploadFileScanner\Rules\CleanFile;
use Jodeveloper\UploadFileScanner\Contracts\Scanner;

public function upload(Request $request)
{
    $validated = $request->validate([
        'file' => ['required', 'file', new CleanFile()],
    ]);

    // File is clean, proceed with storage
}
```

### Example Controller

```php
use Illuminate\Http\Request;
use Jodeveloper\UploadFileScanner\Contracts\Scanner;
use Jodeveloper\UploadFileScanner\Exceptions\ScanFailedException;

class FileUploadController extends Controller
{
    public function store(Request $request, Scanner $scanner)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'], // max 10MB
        ]);

        try {
            $result = $scanner->scan($request->file('file')->getRealPath());

            if ($result->hasVirus()) {
                return back()->with('error', 'The uploaded file contains a virus.');
            }

            // File is clean, store it
            $path = $request->file('file')->store('uploads');

            return back()->with('success', 'File uploaded successfully.');

        } catch (ScanFailedException $e) {
            // Handle scanner execution failure
            return back()->with('error', 'Unable to scan file. Please try again.');
        }
    }
}
```

## Configuration

### ClamAV Binary Path

By default, the package assumes `clamscan` is in your system PATH. If you have a custom installation:

```env
CLAMAV_BINARY=/usr/local/bin/clamscan
```

### Scan Timeout

The default timeout is 30 seconds. Adjust for large files:

```env
CLAMAV_TIMEOUT=60
```

### Scan Options

Add additional options to pass to clamscan in the config file:

```php
'scan_options' => [
    '--no-summary',
    '--infected',
],
```

**Warning:** Use caution with options like `--remove` which will delete infected files.

## Security Philosophy

### This Package is a Secondary Defense

This package provides virus scanning as a secondary security layer. It should **not** be your only defense against malicious file uploads.

### Required Additional Security Measures

1. **Re-encoding Images**: Always re-encode uploaded images to strip potential embedded payloads
2. **File Type Validation**: Validate MIME types and file extensions
3. **Content Inspection**: Inspect file contents, not just extensions
4. **Storage Location**: Store uploads outside of the public web root
5. **Access Control**: Implement proper authentication and authorization

### SVG Files are Unsafe

SVG files can contain JavaScript and should be treated with extreme caution. Always sanitize SVG files before storage or serving.

### Public Storage is Dangerous

Never store user uploads in publicly accessible directories without proper access controls. Use Laravel's `Storage::disk('local')` or implement signed URLs for public access.

## Exception Handling

The package throws `ScanFailedException` when:

- ClamAV binary is not found
- Process crashes or fails to execute
- Timeout occurs
- Other execution errors occur

Infected files do **not** throw exceptions. They return a `ScanResult` where `hasVirus()` returns `true`.

```php
use Jodeveloper\UploadFileScanner\Exceptions\ScanFailedException;

try {
    $result = $scanner->scan($path);
} catch (ScanFailedException $e) {
    // Log the error and notify administrators
    Log::error('ClamAV scan failed', ['message' => $e->getMessage()]);
    throw new \RuntimeException('Unable to scan file. Please try again later.');
}
```

## API Reference

### Facade

```php
use Jodeveloper\UploadFileScanner\Facades\Scanner;

Scanner::scan(string $path): ScanResult
```

### Contract

```php
use Jodeveloper\UploadFileScanner\Contracts\Scanner;

public function __construct(Scanner $scanner)
```

### ScanResult

The `ScanResult` object is immutable and exposes readonly properties:

```php
public readonly bool $clean
public readonly string $output
```

Helper methods are also available:

```php
isClean(): bool     // Returns true if no virus was found
hasVirus(): bool    // Returns true if a virus was detected
```

### CleanFile Rule

Implements `Illuminate\Contracts\Validation\Rule`. Can be used as an object or string rule (`clean_file`).

## Testing

```bash
composer test
```

The test suite mocks all ClamAV execution - no actual scanning occurs during tests.

## Limitations

- This package does not provide automatic scanning of all uploads
- No UI is included
- No opinionated storage logic is provided
- ClamAV must be installed and accessible on your server

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Joe Developer](https://github.com/jodeveloper)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
