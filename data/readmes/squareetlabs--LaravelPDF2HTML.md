# Laravel PDF to HTML Converter

A robust and dependency-free Laravel package to convert PDF files to HTML using `poppler-utils` (pdftohtml).

## Features

- **Dependency Free**: Does not rely on external PHP packages.
- **Laravel Integration**: Automatic discovery, config publishing, and easy-to-use API.
- **Binary Auto-Discovery**: Automatically finds `pdftohtml` and `pdfinfo` binaries on your system.
- **Customizable**: Extensive options for zooming, image handling, and output formatting.
- **Inline Assets**: Automatically inlines CSS and Images (Base64) for a self-contained HTML output.
- **Strict Types**: Written with modern PHP standards and strict typing.

## Requirements

- PHP > 8.1
- `poppler-utils` installed on your server (contains `pdftohtml` and `pdfinfo`).

## Installation

1.  **Install via Composer**:

    ```bash
    composer require squareetlabs/laravel-pdf-to-html
    ```

2.  **Install `poppler-utils`**:

    - **Ubuntu/Debian**:
      ```bash
      sudo apt-get install poppler-utils
      ```
    - **MacOS**:
      ```bash
      brew install poppler
      ```
    - **CentOS/RHEL**:
      ```bash
      sudo yum install poppler-utils
      ```

3.  **Publish Configuration (Optional)**:

    ```bash
    php artisan vendor:publish --provider="Squareetlabs\LaravelPdfToHtml\Providers\PdfToHtmlServiceProvider"
    ```

## Usage

### Using Facade (Recommended)

```php
use PdfToHtml;

try {
    // Load a PDF file using the facade
    $pdf = PdfToHtml::load('/path/to/document.pdf');
    
    // Get HTML content
    $html = $pdf->getHtml();
    
    // Get all pages content as an array
    $pages = $html->getAllPages();
    
    // Get specific page
    $page1 = $html->getPage(1);
    
    echo $page1;
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Using Direct Class Instantiation

```php
use Squareetlabs\LaravelPdfToHtml\Support\Pdf;

try {
    // Create a new instance
    $pdf = new Pdf('/path/to/document.pdf');
    
    // Get HTML content
    $html = $pdf->getHtml();
    
    // Get all pages content as an array
    $pages = $html->getAllPages();
    
    // Get specific page
    $page1 = $html->getPage(1);
    
    echo $page1;
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Advanced Options

You can pass options to customize the behavior:

```php
$options = [
    'pdftohtml_path' => '/usr/custom/bin/pdftohtml', // Optional custom path
    'pdfinfo_path' => '/usr/custom/bin/pdfinfo',     // Optional custom path
    'generate' => [
        'singlePage' => false,      // Split pages (default)
        'imageJpeg' => true,        // Convert images to JPEG
        'ignoreImages' => false,    // Keep images
        'zoom' => 1.5,              // Zoom factor
        'noFrames' => true,         // Output without frames
    ],
    'html' => [
        'inlineCss' => true,        // Inline CSS into style attributes
        'inlineImages' => true,     // Convert images to Base64
        'onlyContent' => true,      // Return only body content
    ],
    'clearAfter' => true,           // Clear temp files after processing
];

// Using Facade
$pdf = PdfToHtml::load('/path/to/document.pdf', $options);

// Or using direct instantiation
$pdf = new Pdf('/path/to/document.pdf', $options);
```

### Get PDF Info

```php
$info = $pdf->getInfo();
// Returns array: ['pages' => 10, 'size' => '...', ...]

$count = $pdf->countPages();
```

## Testing

```bash
composer test
```

## License

MIT
