# QZ Tray Enterprise for Laravel

[![Latest Version](https://img.shields.io/packagist/v/bitdreamit/qz-tray-enterprise.svg)](https://packagist.org/packages/bitdreamit/qz-tray-enterprise)
[![Total Downloads](https://img.shields.io/packagist/dt/bitdreamit/qz-tray-enterprise.svg)](https://packagist.org/packages/bitdreamit/qz-tray-enterprise)
[![License](https://img.shields.io/packagist/l/bitdreamit/qz-tray-enterprise.svg)](https://packagist.org/packages/bitdreamit/qz-tray-enterprise)
[![PHP Version](https://img.shields.io/packagist/php-v/bitdreamit/qz-tray-enterprise.svg)](https://packagist.org/packages/bitdreamit/qz-tray-enterprise)
[![Laravel Version](https://img.shields.io/badge/Laravel-9.x|10.x|11.x|12.x-brightgreen.svg)](https://laravel.com)

Complete QZ Tray integration package for Laravel - The definitive enterprise printing solution for POS systems, laboratories, ERPs, and any application requiring reliable, professional printing capabilities.

## 🚀 Why Choose QZ Tray Enterprise?

**QZ Tray Enterprise** is not just another printing package - it's a **complete printing management system** that brings enterprise-grade printing capabilities to your Laravel application with zero configuration hassles.

### ✨ Key Benefits:
- **🚀 One-command installation** - Get started in under 5 minutes
- **🎯 Zero configuration required** for basic usage
- **🏢 Enterprise-ready** out of the box
- **🔒 Military-grade security** with certificate signing
- **📱 Responsive dashboard** with real-time monitoring
- **🔄 Smart fallback system** - Never lose a print job
- **📊 Comprehensive analytics** and job tracking
- **🛡️ Production-ready error handling**

## 📋 Features Overview

### 🖨️ **Core Printing Features**
- ✅ **Complete QZ Tray Integration** - Full API coverage
- ✅ **Multi-Format Support** - Raw, HTML, PDF, Images, ZPL, ESC/POS
- ✅ **Barcode Generation** - CODE128, CODE39, EAN13, QR codes, and more
- ✅ **Thermal Printer Support** - Epson, Zebra, Citizen, Bixolon
- ✅ **Label Printing** - ZPL (Zebra Programming Language)
- ✅ **Receipt Printing** - ESC/POS commands
- ✅ **Virtual Printers** - PDF, XPS, OneNote
- ✅ **Network Printers** - TCP/IP, Shared, LPD

### 🛠️ **Management Features**
- ✅ **Auto-Discovery** - Automatic printer detection
- ✅ **User Preferences** - Per-user, per-module printer selection
- ✅ **Print Queue Management** - Job queuing with retry logic
- ✅ **Job History** - Complete audit trail of all print jobs
- ✅ **Real-time Monitoring** - Live status updates
- ✅ **Smart Fallback System** - Browser print, PDF download, preview
- ✅ **Module-Specific Printers** - Different printers for different tasks

### 🛡️ **Security Features**
- ✅ **HTTPS Enforcement** - Secure connections only
- ✅ **Certificate Signing** - Military-grade security
- ✅ **User Authentication** - Role-based access control
- ✅ **IP Restriction** - Control access by IP
- ✅ **Request Validation** - Input sanitization and validation
- ✅ **Secure WebSocket** - Encrypted communication

### 📊 **Diagnostics & Monitoring**
- ✅ **System Health Checks** - Comprehensive diagnostics
- ✅ **Performance Metrics** - Memory usage, connection speed
- ✅ **Error Tracking** - Detailed error logging
- ✅ **Export Reports** - JSON export for debugging
- ✅ **Real-time Dashboard** - Live monitoring interface
- ✅ **Historical Data** - 30-day diagnostic history

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Laravel Application                    │
├─────────────────────────────────────────────────────────┤
│  QZ Tray Enterprise Package                            │
│  ├── Dashboard (/qz-tray/dashboard)                    │
│  ├── API Endpoints (/api/qz-tray/*)                    │
│  ├── Real-time WebSocket                               │
│  └── Background Jobs                                   │
├─────────────────────────────────────────────────────────┤
│  QZ Tray Desktop Application                           │
│  (Installed on client machines)                        │
├─────────────────────────────────────────────────────────┤
│  Physical Printers                                     │
│  ├── Thermal (Epson, Zebra)                            │
│  ├── Label (Zebra, SATO)                               │
│  ├── Network Printers                                  │
│  └── Virtual Printers                                  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Installation

### 1. Install via Composer

```bash
composer require bitdreamit/qz-tray-enterprise
```

### 2. Run the Installation Command

```bash
php artisan qz-tray:install
```

### 3. Install QZ Tray Desktop Application

Download and install QZ Tray on client machines from [https://qz.io/download/](https://qz.io/download/)

### 4. Configure HTTPS

Ensure your application is served over HTTPS for security. For local development, you can use Laravel Valet or Ngrok.

### 5. Generate Security Certificate

```bash
php artisan qz-tray:generate-certificate
```

### 6. Run Migrations

```bash
php artisan migrate
```

### 7. Access the Dashboard

Visit `/qz-tray/dashboard` in your browser.

## ⚙️ Configuration

### Environment Variables (.env)

```env
# QZ Tray Configuration
QZ_TRAY_ENABLED=true
QZ_REQUIRE_HTTPS=true
QZ_ALLOW_LOCALHOST=true
QZ_AUTO_CONNECT=true
QZ_AUTO_DISCOVERY=true
QZ_FALLBACK_STRATEGY=browser-print
QZ_DEFAULT_PAPER_SIZE=A4
QZ_LOGGING_ENABLED=true
QZ_PRIVATE_KEY=storage/app/certs/private-key.pem
QZ_SIGNATURE_ALGORITHM=SHA512
QZ_RETRY_ATTEMPTS=3
QZ_RETRY_DELAY=1000
QZ_DISCOVERY_INTERVAL=30000
QZ_DEBUG_MODE=false
```

### Publish Configuration File

```bash
php artisan vendor:publish --tag=qz-tray-config
```

This creates `config/qz-tray.php` with complete configuration options.

## 📖 Usage Examples

### Blade Integration

Include QZ Tray assets in your layout:

```blade
<!DOCTYPE html>
<html>
<head>
    <!-- Include QZ Tray assets -->
    @include('qz-tray::partials.qz-assets')
</head>
<body>
    @yield('content')
</body>
</html>
```

### Print from Controller

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use BitDreamIT\QzTray\Facades\QzTray;

class OrderController extends Controller
{
    /**
     * Print receipt for order
     */
    public function printReceipt($orderId)
    {
        $order = Order::with('items', 'customer')->findOrFail($orderId);
        
        // Generate receipt HTML
        $receipt = view('receipts.order', compact('order'))->render();
        
        // Print using ESC/POS format for thermal printer
        QzTray::printEscpos(
            'EPSON TM-T88V',
            $this->generateEscposReceipt($order),
            [
                'copies' => 2,
                'paperSize' => 'Receipt'
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Receipt sent to printer'
        ]);
    }
    
    /**
     * Print shipping label
     */
    public function printShippingLabel($orderId)
    {
        $order = Order::findOrFail($orderId);
        
        // Generate ZPL label
        $zpl = $this->generateShippingLabelZpl($order);
        
        // Print using Zebra label printer
        QzTray::printZpl('Zebra LP 2844', $zpl, [
            'label_width' => 100,
            'label_height' => 150,
            'copies' => 1
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Shipping label printed'
        ]);
    }
    
    /**
     * Print barcode for product
     */
    public function printProductBarcode($productId)
    {
        $product = Product::findOrFail($productId);
        
        // Print barcode label
        QzTray::printBarcode(
            'Zebra LP 2844',
            $product->sku,
            'CODE128',
            [
                'width' => 2,
                'height' => 100,
                'human_readable' => true,
                'copies' => 3
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Barcode labels printed'
        ]);
    }
    
    /**
     * Print PDF document
     */
    public function printInvoice($orderId)
    {
        $order = Order::findOrFail($orderId);
        
        // Generate PDF
        $pdfUrl = route('orders.invoice.pdf', $order->id);
        
        // Print PDF
        QzTray::printPdf('HP LaserJet', $pdfUrl, [
            'copies' => 1,
            'paperSize' => 'A4',
            'orientation' => 'portrait',
            'pageRange' => '1'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Invoice sent to printer'
        ]);
    }
}
```

### JavaScript API

```javascript
// Initialize QZ Tray Manager
const qzManager = new QzTrayManager({
    autoConnect: true,
    discoveryInterval: 30000,
    fallbackStrategy: 'browser-print'
});

// Event Listeners
qzManager.on('initialized', () => {
    console.log('QZ Tray ready for printing');
    updateConnectionStatus('connected');
});

qzManager.on('connected', (data) => {
    console.log(`Connected to QZ Tray v${data.version}`);
    showNotification('success', 'Connected to QZ Tray');
});

qzManager.on('printersDiscovered', (data) => {
    console.log(`Found ${data.printers.length} printers`);
    updatePrinterList(data.printers);
});

qzManager.on('jobCompleted', (job) => {
    console.log(`Job ${job.id} completed successfully`);
    showNotification('success', 'Print job completed');
    updateJobHistory();
});

qzManager.on('error', (error) => {
    console.error('QZ Tray error:', error);
    showNotification('error', error.message || 'Printing error');
});

// Print Functions
async function printReceipt(orderData) {
    try {
        // Get receipt printer (module-specific)
        const printer = await qzManager.getSelectedPrinter('receipts');
        
        // Generate receipt HTML
        const receiptHtml = generateReceiptHtml(orderData);
        
        // Print receipt
        await qzManager.print(receiptHtml, {
            printer: printer,
            format: 'html',
            copies: orderData.copies || 1,
            paperSize: 'Receipt'
        });
        
        return { success: true, message: 'Receipt printed' };
        
    } catch (error) {
        console.error('Receipt print failed:', error);
        return { success: false, error: error.message };
    }
}

async function printLabel(productData) {
    try {
        // Get label printer
        const printer = await qzManager.getSelectedPrinter('labels');
        
        // Generate ZPL label
        const zpl = generateLabelZpl(productData);
        
        // Print label
        await qzManager.print(zpl, {
            printer: printer,
            format: 'zpl',
            copies: productData.quantity || 1,
            label_width: 100,
            label_height: 150
        });
        
        return { success: true, message: 'Label printed' };
        
    } catch (error) {
        console.error('Label print failed:', error);
        return { success: false, error: error.message };
    }
}

async function printDocument(documentUrl) {
    try {
        // Get default document printer
        const printer = await qzManager.getSelectedPrinter('documents');
        
        // Print PDF
        await qzManager.print(documentUrl, {
            printer: printer,
            format: 'pdf',
            copies: 1,
            paperSize: 'A4',
            orientation: 'portrait'
        });
        
        return { success: true, message: 'Document printed' };
        
    } catch (error) {
        console.error('Document print failed:', error);
        return { success: false, error: error.message };
    }
}

// Printer Management
async function discoverPrinters() {
    try {
        const result = await qzManager.discoverPrinters();
        return result.printers;
    } catch (error) {
        console.error('Printer discovery failed:', error);
        return [];
    }
}

async function selectPrinter(printerName, module = null) {
    try {
        await qzManager.selectPrinter(printerName, module);
        return { success: true, message: `Selected ${printerName}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testPrinter(printerName) {
    try {
        await qzManager.testPrinter(printerName);
        return { success: true, message: 'Test print sent' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Diagnostics
async function runDiagnostics() {
    try {
        const diagnostics = await qzManager.runDiagnostics();
        displayDiagnosticsResults(diagnostics);
        return diagnostics;
    } catch (error) {
        console.error('Diagnostics failed:', error);
        return null;
    }
}

// Global Helper Functions
window.qzPrint = async function(content, options = {}) {
    return await qzManager.print(content, options);
};

window.qzTestPrint = async function(printerName) {
    return await qzManager.testPrinter(printerName);
};

window.qzDiscoverPrinters = async function() {
    return await qzManager.discoverPrinters();
};
```

### Queue and Job Management

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use BitDreamIT\QzTray\Facades\QzTray;

class PrintJobController extends Controller
{
    /**
     * Get print queue status
     */
    public function queueStatus()
    {
        $status = QzTray::getQueueStatus();
        
        return response()->json([
            'success' => true,
            'data' => $status
        ]);
    }
    
    /**
     * Get print job history
     */
    public function jobHistory(Request $request)
    {
        $limit = $request->input('limit', 50);
        $userId = $request->input('user_id');
        
        $jobs = QzTray::getJobHistory($limit, $userId);
        
        return response()->json([
            'success' => true,
            'data' => $jobs,
            'count' => $jobs->count()
        ]);
    }
    
    /**
     * Cancel print job
     */
    public function cancelJob($jobId)
    {
        $job = PrintJob::findOrFail($jobId);
        
        // Check if job can be cancelled
        if (!$job->isPending()) {
            return response()->json([
                'success' => false,
                'error' => 'Job cannot be cancelled'
            ], 400);
        }
        
        $job->markAsCancelled();
        
        return response()->json([
            'success' => true,
            'message' => 'Job cancelled successfully'
        ]);
    }
    
    /**
     * Clear printer queue
     */
    public function clearQueue(Request $request)
    {
        $request->validate([
            'printer' => 'required|string'
        ]);
        
        QzTray::clearQueue($request->input('printer'));
        
        return response()->json([
            'success' => true,
            'message' => 'Printer queue cleared'
        ]);
    }
    
    /**
     * Get print statistics
     */
    public function statistics()
    {
        $stats = [
            'today' => PrintJob::today()->count(),
            'total' => PrintJob::count(),
            'success_rate' => PrintJob::completed()->count() / max(PrintJob::count(), 1) * 100,
            'top_printers' => PrintJob::select('printer', \DB::raw('count(*) as count'))
                ->groupBy('printer')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
            'hourly_stats' => PrintJob::select(
                    \DB::raw('HOUR(created_at) as hour'),
                    \DB::raw('count(*) as count')
                )
                ->whereDate('created_at', today())
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
```

## 📊 Dashboard Features

### Main Dashboard (`/qz-tray/dashboard`)

The QZ Tray dashboard provides a comprehensive interface for managing all printing operations:

#### **Connection Status Panel**
- Real-time connection status
- WebSocket connectivity
- Security certificate status
- QZ Tray version information

#### **Printer Management**
- Auto-discovered printers list
- Printer categorization (USB, Network, Virtual)
- Printer capabilities display
- Default printer selection
- Test print functionality

#### **Print Queue**
- Real-time job queue status
- Job history with filters
- Failed jobs with error details
- Queue clearing options

#### **Diagnostics Panel**
- System health score
- Component testing
- Performance metrics
- Export diagnostic reports

#### **User Preferences**
- Per-user printer preferences
- Module-specific printer assignments
- Print job defaults
- Theme selection (Light/Dark)

#### **Settings**
- Connection configuration
- Discovery intervals
- Fallback strategies
- Security settings

## 🔧 Advanced Configuration

### Module-Specific Printers

```php
// In your application service provider
public function boot()
{
    // Set default printers for different modules
    QzTray::saveUserPreference(auth()->id(), 'receipts', 'EPSON TM-T88V');
    QzTray::saveUserPreference(auth()->id(), 'labels', 'Zebra LP 2844');
    QzTray::saveUserPreference(auth()->id(), 'documents', 'HP LaserJet');
    
    // Or in controller actions
    QzTray::saveUserPreference(
        auth()->id(),
        'shipping_labels',
        $request->input('printer')
    );
}

// Retrieve module-specific printer
$labelPrinter = QzTray::getUserPreference(auth()->id(), 'labels');
```

### Custom Print Templates

```php
// Create custom print templates
class ReceiptTemplate
{
    public static function generate(array $orderData): string
    {
        return "
            ^XA
            ^FO50,50^A0N,50,50^FDORDER RECEIPT^FS
            ^FO50,120^A0N,30,30^FDOrder #: {$orderData['number']}^FS
            ^FO50,160^A0N,30,30^FDDate: " . date('Y-m-d H:i:s') . "^FS
            ^FO50,200^A0N,30,30^FDTotal: \${$orderData['total']}^FS
            ^FO50,250^GB700,3,3^FS
            ^FO50,270^A0N,25,25^FDThank you for your order!^FS
            ^XZ
        ";
    }
}

// Usage
$zpl = ReceiptTemplate::generate($order->toArray());
QzTray::printZpl('Zebra LP 2844', $zpl);
```

### Event Listeners

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    \BitDreamIT\QzTray\Events\PrintJobQueued::class => [
        \App\Listeners\LogPrintJob::class,
        \App\Listeners\SendPrintNotification::class,
    ],
    \BitDreamIT\QzTray\Events\PrinterConnected::class => [
        \App\Listeners\UpdatePrinterStatus::class,
    ],
];

// Custom listener example
namespace App\Listeners;

use BitDreamIT\QzTray\Events\PrintJobQueued;

class SendPrintNotification
{
    public function handle(PrintJobQueued $event)
    {
        $job = $event->printJob;
        
        // Send notification to user
        $job->user->notify(new PrintJobNotification($job));
        
        // Log to external system
        ExternalLogService::logPrintJob($job);
    }
}
```

## 🖨️ Supported Printer Types

### **Thermal Receipt Printers**
- ✅ **Epson** - TM-T88V, TM-T70, TM-U220
- ✅ **Citizen** - CT-S310, CT-S400
- ✅ **Bixolon** - SRP-350, SRP-770
- ✅ **Star** - TSP100, TSP650
- ✅ **Custom ESC/POS** compatible printers

### **Label Printers**
- ✅ **Zebra** - LP 2844, ZT410, ZT420, ZD420
- ✅ **SATO** - CT400, CL4NX
- ✅ **Intermec** - PC42, PC43
- ✅ **Datamax** - H-4212, I-4212
- ✅ **Custom ZPL** compatible printers

### **Network Printers**
- ✅ **TCP/IP** printers
- ✅ **Shared** Windows printers
- ✅ **LPD** (Line Printer Daemon)
- ✅ **IPP** (Internet Printing Protocol)
- ✅ **CUPS** printers

### **Virtual Printers**
- ✅ **PDF** printers
- ✅ **XPS** printers
- ✅ **OneNote** printer
- ✅ **Microsoft Print to PDF**
- ✅ **Custom virtual printers**

## 📋 Print Format Support

### **Raw Text Printing**
```php
// Simple text printing
QzTray::printRaw('EPSON TM-T88V', "Hello World\nThis is a test print");

// With ESC/POS commands
$escpos = "\x1B\x40" . // Initialize printer
          "\x1B\x61\x01" . // Center align
          "RECEIPT\n" .
          "\x1B\x61\x00" . // Left align
          "Item 1: $10.00\n" .
          "Item 2: $15.00\n" .
          "\x1D\x56\x41\x10"; // Cut paper

QzTray::printRaw('EPSON TM-T88V', $escpos);
```

### **HTML Printing**
```php
// Print HTML document
$html = '
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; font-size: 24px; }
            .content { margin: 20px; }
        </style>
    </head>
    <body>
        <div class="header">Company Invoice</div>
        <div class="content">
            <p>Invoice #: INV-2023-001</p>
            <p>Date: ' . date('Y-m-d') . '</p>
        </div>
    </body>
    </html>';

QzTray::printHtml('HP LaserJet', $html, [
    'paperSize' => 'A4',
    'orientation' => 'portrait',
    'margins' => '0.5in'
]);
```

### **PDF Printing**
```php
// Print PDF from URL
QzTray::printPdf('HP LaserJet', 'https://example.com/invoice.pdf', [
    'copies' => 2,
    'pageRange' => '1-3',
    'orientation' => 'landscape'
]);

// Print PDF from local file
$pdfPath = storage_path('app/invoices/invoice-123.pdf');
$pdfUrl = asset('storage/invoices/invoice-123.pdf');

QzTray::printPdf('PDF Printer', $pdfUrl, [
    'copies' => 1
]);
```

### **Image Printing**
```php
// Print image from URL
QzTray::printImage('Photo Printer', 'https://example.com/photo.jpg', [
    'copies' => 1,
    'dpi' => 300,
    'width' => 800,
    'height' => 600
]);

// Print image from local file
$imageUrl = asset('storage/products/barcode.png');
QzTray::printImage('Label Printer', $imageUrl, [
    'dpi' => 203, // Standard label printer DPI
    'width' => 800
]);
```

### **ZPL (Zebra Programming Language)**
```php
// Simple label
$zpl = '^XA
    ^FO50,50^A0N,50,50^FDProduct Label^FS
    ^FO50,120^BY3^BCN,100,Y,N,N^FD123456789012^FS
    ^FO50,250^A0N,30,30^FDSKU: ABC-123^FS
    ^XZ';

QzTray::printZpl('Zebra LP 2844', $zpl, [
    'label_width' => 100,
    'label_height' => 150
]);

// Barcode label with graphics
$zpl = '^XA
    ^FO20,20^GB760,1,3^FS
    ^FO20,40^A0N,40,40^FDWAREHOUSE LABEL^FS
    ^FO20,100^BY3^BCN,150,Y,N,N^FD' . $sku . '^FS
    ^FO20,280^A0N,30,30^FDLocation: ' . $location . '^FS
    ^FO20,320^A0N,30,30^FDQty: ' . $quantity . '^FS
    ^XZ';

QzTray::printZpl('Zebra ZT410', $zpl);
```

### **ESC/POS Receipt Printing**
```php
// Complete receipt with formatting
$escpos = "\x1B\x40" . // Initialize
          "\x1B\x61\x01" . // Center
          "RESTAURANT NAME\n" .
          "123 Main Street\n" .
          "Phone: (555) 123-4567\n" .
          "\x1B\x61\x00" . // Left
          "\x1B\x45\x01" . // Bold on
          "ORDER #: 2023-00123\n" .
          "\x1B\x45\x00" . // Bold off
          str_repeat("-", 42) . "\n" .
          "Item              Qty   Price   Total\n" .
          str_repeat("-", 42) . "\n" .
          "Burger            2     $10.00  $20.00\n" .
          "Fries             1     $4.00   $4.00\n" .
          "Soda              1     $2.50   $2.50\n" .
          str_repeat("-", 42) . "\n" .
          "\x1B\x45\x01" . // Bold
          "Total:                    $26.50\n" .
          "\x1B\x45\x00" . // Bold off
          "\x1B\x61\x01" . // Center
          "Thank you for dining with us!\n" .
          "\x1D\x56\x41\x10"; // Cut

QzTray::printEscpos('EPSON TM-T88V', $escpos);
```

## 🔒 Security Features

### HTTPS Enforcement
```php
// Middleware automatically enforces HTTPS
// For local development, add to .env:
QZ_ALLOW_LOCALHOST=true
```

### Certificate Signing
```bash
# Generate certificates
php artisan qz-tray:generate-certificate

# Certificate will be stored at:
# storage/app/certs/digital-certificate.txt
# storage/app/certs/private-key.pem
```

### User Authentication
```php
// Default middleware includes auth
'middleware' => ['web', 'auth'],

// Customize in config/qz-tray.php
'middleware' => ['web', 'auth', 'role:admin,manager'],
```

### IP Restriction
```php
// Add to .env
QZ_TRUSTED_IPS=192.168.1.0/24,10.0.0.0/8

// Or in config
'trusted_ips' => explode(',', env('QZ_TRUSTED_IPS', '')),
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### **1. "QZ Tray object not found"**
```javascript
// Solution: Install QZ Tray on client machine
// Download from: https://qz.io/download/

// Check if QZ is loaded
if (typeof qz === 'undefined') {
    alert('Please install QZ Tray from https://qz.io/download/');
}
```

#### **2. Certificate Errors**
```bash
# Regenerate certificates
php artisan qz-tray:generate-certificate --force

# Check file permissions
chmod -R 755 storage/app/certs/
chown -R www-data:www-data storage/app/certs/
```

#### **3. Connection Failed**
```javascript
// Check WebSocket connection
// Add to .env for debugging
QZ_DEBUG_MODE=true

// Check browser console for WebSocket errors
console.log('WebSocket status:', qz.websocket.isActive());
```

#### **4. Printer Not Found**
```php
// Run printer discovery
QzTray::printerService()->refresh();

// Check system printers
$printers = QzTray::getAllPrinters();
dd($printers);
```

#### **5. Print Job Stuck in Queue**
```php
// Clear printer queue
QzTray::clearQueue('Printer Name');

// Check job status
$job = PrintJob::find($jobId);
if ($job->isPending()) {
    $job->markAsFailed('Manual intervention required');
}
```

### Diagnostic Commands

```bash
# Run full diagnostics
php artisan tinker
>>> QzTray::getSystemStatus();

# Check requirements
php artisan tinker
>>> QzTray::checkRequirements();

# Get printer list
php artisan tinker
>>> QzTray::getAllPrinters();

# Test print
php artisan tinker
>>> QzTray::testPrint('Printer Name');
```

## 📈 Performance Optimization

### Caching Strategies
```php
// Cache printer discovery (5 minutes)
Cache::remember('qz_printers', 300, function () {
    return QzTray::getAllPrinters();
});

// Cache capabilities (10 minutes)
Cache::remember('qz_capabilities_' . $printerName, 600, function () use ($printerName) {
    return QzTray::getPrinterCapabilities($printerName);
});
```

### Queue Optimization
```php
// Use database queue for print jobs
'queue' => [
    'default' => 'database',
    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'print',
            'retry_after' => 90,
        ],
    ],
],
```

### Database Indexing
```sql
-- Optimize print_jobs table
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_print_jobs_printer ON print_jobs(printer);
CREATE INDEX idx_print_jobs_created ON print_jobs(created_at);
CREATE INDEX idx_print_jobs_user ON print_jobs(user_id);
```

## 🔄 Migration Guide

### From Raw QZ Tray Implementation
```php
// Before: Manual QZ Tray implementation
$config = qz.configs.create('Printer');
qz.print($config, ['Hello World']);

// After: Using QZ Tray Enterprise
QzTray::printRaw('Printer', 'Hello World');
```

### From Other Printing Packages
```php
// Before: Using another package
$printer = new ThermalPrinter('EPSON TM-T88V');
$printer->text('Hello World');
$printer->cut();

// After: Using QZ Tray Enterprise
$escpos = "Hello World\n\x1D\x56\x41\x10";
QzTray::printEscpos('EPSON TM-T88V', $escpos);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone repository
git clone https://github.com/bitdreamit/qz-tray-enterprise.git

# Install dependencies
composer install

# Run tests
composer test

# Run code style fixer
composer fix
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Generate test coverage
vendor/bin/phpunit --coverage-html coverage
```

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## 🏢 Enterprise Support

For enterprise clients requiring additional features or priority support, we offer **QZ Tray Premium**:

### Premium Features:
- **Multi-tenant Support** - Separate configurations per tenant
- **Advanced Analytics** - Detailed reporting dashboard
- **Print Templates** - Drag-and-drop template builder
- **Mobile Printing** - Print from mobile devices
- **Cloud Print Relay** - Print to remote locations
- **SLA Monitoring** - 99.9% uptime guarantee
- **White-label Dashboard** - Custom branding
- **24/7 Priority Support** - Dedicated support team

### Get Premium:
```bash
composer require bitdreamit/qz-tray-premium
```

Contact: **support@bitdreamit.com**

## 🙏 Credits

- **[QZ Tray](https://qz.io/)** - The amazing printing solution that makes this possible
- **[Laravel](https://laravel.com/)** - The best PHP framework for modern web development
- **[Bit Dream IT](https://bitdreamit.com)** - Package development and maintenance
- **Our Contributors** - Everyone who has helped improve this package

## 📞 Support & Community

### Documentation
- **[Full Documentation](https://docs.bitdreamit.com/qz-tray-enterprise)** - Complete API reference and guides
- **[Video Tutorials](https://youtube.com/bitdreamit)** - Step-by-step video guides
- **[Example Projects](https://github.com/bitdreamit/qz-tray-examples)** - Ready-to-use examples

### Community Support
- **[GitHub Issues](https://github.com/bitdreamit/qz-tray-enterprise/issues)** - Bug reports and feature requests
- **[Discord Community](https://discord.gg/bitdreamit)** - Real-time chat with developers
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/qz-tray-enterprise)** - Technical questions and answers

### Professional Support
- **Email Support** - support@bitdreamit.com
- **Priority Support** - Available with Premium package
- **Custom Development** - Need custom features? Contact us!

---

## 🎯 Quick Reference

### Installation Cheat Sheet
```bash
# 1. Install package
composer require bitdreamit/qz-tray-enterprise

# 2. Publish assets
php artisan vendor:publish --provider="BitDreamIT\\QzTray\\Providers\\QzTrayServiceProvider"

# 3. Run installation
php artisan qz-tray:install

# 4. Run migrations
php artisan migrate

# 5. Generate certificate
php artisan qz-tray:generate-certificate

# 6. Access dashboard
# Visit: /qz-tray/dashboard
