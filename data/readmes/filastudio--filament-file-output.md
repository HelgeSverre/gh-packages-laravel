# Filament FileOutput

![Laravel Filament FileOutput](https://github.com/user-attachments/assets/031bf175-15e7-4697-98ee-c2385a99b3bd)

[![Latest Version](https://img.shields.io/packagist/v/filastudio/filament-file-output.svg?style=flat-square)](https://packagist.org/packages/filastudio/filament-file-output)
[![License](https://img.shields.io/packagist/l/filastudio/filament-file-output.svg?style=flat-square)](https://packagist.org/packages/filastudio/filament-file-output)

A Filament form component for displaying uploaded files. Supports any storage disk (public, private, S3), multiple files, image previews, download links, and file deletion with callbacks.

---

## Features

- Works with any storage disk — public, private, S3, etc.
- Automatic image detection and preview
- Download links for non-image files
- Temporary signed URLs for private files
- Delete button with callback and confirmation dialog
- Multiple files (array fields) out of the box
- Styled to match Filament, including dark mode
- Auto-sync: deleting a file updates the linked form field
- Conditional show/hide of the delete button

## Installation

```bash
composer require filastudio/filament-file-output
```

The package auto-registers its service provider — no extra setup needed.

## Quick Start

### Basic Usage

```php
use FilaStudio\FileOutput\FileOutput;

FileOutput::make('file_preview')
    ->field('file_path')
    ->label('Current File')
```

### With Private Storage

```php
FileOutput::make('document_preview')
    ->field('document')
    ->disk('private')
    ->label('Private Document')
```

### Complete Form Example

```php
use Filament\Forms\Components\FileUpload;
use FilaStudio\FileOutput\FileOutput;

public static function form(Form $form): Form
{
    return $form
        ->schema([
            FileUpload::make('document')
                ->disk('private')
                ->directory('documents')
                ->label('Upload Document'),
                
            FileOutput::make('document_preview')
                ->field('document')
                ->disk('private')
                ->label('Current Document')
                ->onDelete(function ($record, $filePath, $disk) {
                    Storage::disk($disk)->delete($filePath);
                }),
        ]);
}
```

When a file is deleted, the linked field state is automatically cleared.

---

## Examples

### Using `path()` Method

#### Direct Path

```php
FileOutput::make('contract')
    ->path('contracts/2024/contract-001.pdf')
    ->disk('private')
    ->label('Contract')
```

#### Dynamic Path with Closure

```php
FileOutput::make('user_avatar')
    ->path(fn ($record) => 'avatars/' . $record->user_id . '.jpg')
    ->disk('public')
    ->label('User Avatar')
```

#### Public URL

```php
FileOutput::make('external_file')
    ->path('https://example.com/files/document.pdf')
    ->label('External Document')
```

#### Conditional Logic

```php
FileOutput::make('file_preview')
    ->path(function ($record) {
        if ($record->file_type === 'contract') {
            return 'contracts/' . $record->file_name;
        }
        return 'documents/' . $record->file_name;
    })
    ->disk('private')
```

#### Multiple Files with Custom Labels

```php
FileOutput::make('documents')
    ->path([
        'contracts/main-contract.pdf' => 'Main Contract Document',
        'contracts/addendum-1.pdf' => 'Addendum #1',
        'contracts/addendum-2.pdf' => 'Addendum #2',
        'invoices/invoice-2024.pdf' => 'Invoice 2024'
    ])
    ->disk('private')
    ->label('Contract Documents')
```

#### Dynamic Labels with Closure

```php
FileOutput::make('user_documents')
    ->path(function ($record) {
        return [
            $record->contract_path => 'Contract for ' . $record->client_name,
            $record->invoice_path => 'Invoice #' . $record->invoice_number,
            $record->receipt_path => 'Payment Receipt'
        ];
    })
    ->disk('private')
```

### Multiple Files

#### Basic Multiple Files

```php
FileOutput::make('attachments_preview')
    ->field('attachments')  // Array of file paths
    ->disk('private')
    ->label('Attachments')
```

#### Complete Multiple Files Example

```php
FileUpload::make('attachments')
    ->disk('private')
    ->directory('attachments')
    ->multiple()
    ->maxFiles(10)
    ->acceptedFileTypes(['application/pdf', 'image/*']),
    
FileOutput::make('attachments_preview')
    ->field('attachments')
    ->disk('private')
    ->label('Current Attachments')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        // Auto-updates array - removes only this file
    })
```

#### Multiple Files via `path()` with Array

```php
FileOutput::make('documents')
    ->path(['contracts/file1.pdf', 'contracts/file2.pdf'])
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
    })
```

#### Multiple Files with Closure

```php
FileOutput::make('photos_preview')
    ->path(fn ($record) => $record->photos ?? [])
    ->field('photos')  // needed for auto-sync
    ->disk('public')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        
        // Update database
        $photos = array_values(array_filter(
            $this->record->photos ?? [],
            fn($p) => $p !== $filePath
        ));
        $this->record->update(['photos' => $photos]);
    })
```

When using `path()` with arrays, also specify `field()` to enable automatic state updates.

### Delete Button Control

#### Hide Delete Button

```php
FileOutput::make('document')
    ->field('document')
    ->disk('private')
    ->onDelete(fn ($record, $filePath, $disk) => Storage::disk($disk)->delete($filePath))
    ->hideDeleteButton()
```

#### Conditional Delete Button

```php
// Hide for locked records
FileOutput::make('file')
    ->field('file_path')
    ->onDelete(fn ($record, $filePath, $disk) => Storage::disk($disk)->delete($filePath))
    ->hideDeleteButton(fn ($record) => $record->is_locked)
```

#### Show Only for Admins

```php
FileOutput::make('sensitive_doc')
    ->field('document')
    ->disk('private')
    ->onDelete(fn ($record, $filePath, $disk) => Storage::disk($disk)->delete($filePath))
    ->showDeleteButton(fn () => auth()->user()->isAdmin())
```

#### Complex Conditions

```php
FileOutput::make('invoice')
    ->field('invoice_file')
    ->onDelete(fn ($record, $filePath, $disk) => Storage::disk($disk)->delete($filePath))
    ->showDeleteButton(function ($record) {
        $isOwnerOrAdmin = auth()->user()->isAdmin() || 
                          auth()->id() === $record->user_id;
        $isNotPaid = $record->status !== 'paid';
        
        return $isOwnerOrAdmin && $isNotPaid;
    })
```

### Image Gallery

```php
FileOutput::make('product_images')
    ->field('images')
    ->disk('public')
    ->label('Product Gallery')
    ->onDelete(function ($record, $filePath, $disk) {
        // Delete original
        Storage::disk($disk)->delete($filePath);
        
        // Delete thumbnails
        $directory = dirname($filePath);
        $filename = basename($filePath);
        Storage::disk($disk)->delete($directory . '/thumbs/' . $filename);
        
        // Update record
        $record->increment('images_deleted_count');
    })
```

### S3 Storage

```php
FileOutput::make('backup')
    ->field('backup_path')
    ->disk('s3')
    ->label('Backup File')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        
        Log::info('Backup deleted', [
            'path' => $filePath,
            'user' => auth()->id(),
            'record_id' => $record?->id,
        ]);
    })
```

### With Notifications

```php
FileOutput::make('document')
    ->field('document')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        try {
            if (Storage::disk($disk)->exists($filePath)) {
                Storage::disk($disk)->delete($filePath);
                
                Notification::make()
                    ->title('File deleted successfully')
                    ->success()
                    ->send();
            } else {
                throw new \Exception('File not found');
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error deleting file')
                ->body($e->getMessage())
                ->danger()
                ->send();
                
            Log::error('File deletion error', [
                'path' => $filePath,
                'record_id' => $record?->id,
                'error' => $e->getMessage(),
            ]);
        }
    })
```

### Custom Delete Confirmation

#### Basic Custom Confirmation

```php
FileOutput::make('contract')
    ->field('contract_file')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
    })
    ->deleteConfirmationTitle('Delete Contract?')
    ->deleteConfirmationDescription('This action cannot be undone. The contract file will be permanently deleted.')
```

#### Dynamic Confirmation Message

```php
FileOutput::make('document')
    ->field('document_path')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
    })
    ->deleteConfirmationTitle(fn ($record) => "Delete {$record->name}?")
    ->deleteConfirmationDescription(fn ($record) => "Are you sure you want to delete the document for {$record->client_name}? This action cannot be undone.")
```

#### Confirmation for Critical Files

```php
FileOutput::make('sensitive_document')
    ->field('document')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        Log::warning('Sensitive document deleted', [
            'path' => $filePath,
            'record_id' => $record?->id
        ]);
    })
    ->deleteLabel('Remove Document')
    ->deleteConfirmationTitle('Delete Sensitive Document?')
    ->deleteConfirmationDescription('WARNING: This is a sensitive document. Deletion will be logged and cannot be undone. Please confirm you want to proceed.')
```

#### Custom Button Label

```php
FileOutput::make('attachment')
    ->field('attachment_path')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
    })
    ->deleteLabel('Remove Attachment')
```

### Conditional Visibility

```php
FileOutput::make('contract')
    ->field('contract_file')
    ->disk('private')
    ->visible(fn ($record) => $record?->contract_file !== null)
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        $record->update([
            'contract_file' => null,
            'contract_signed_at' => null,
        ]);
    })
```

### Custom Empty State

#### Basic Custom Message

```php
FileOutput::make('document')
    ->field('document_path')
    ->disk('private')
    ->emptyState('No document has been uploaded yet')
```

#### Dynamic Empty State

```php
FileOutput::make('contract')
    ->field('contract_file')
    ->disk('private')
    ->emptyState(fn ($record) => "No contract uploaded for {$record->client_name}")
```

#### Multilingual Empty State

```php
FileOutput::make('invoice')
    ->field('invoice_path')
    ->disk('private')
    ->emptyState(__('invoices.no_file_uploaded'))
```

### File Descriptions

#### Basic Description

```php
FileOutput::make('contract')
    ->field('contract_file')
    ->disk('private')
    ->description('Contract signed on 2024-01-15')
```

#### Dynamic Description

```php
FileOutput::make('document')
    ->field('document_path')
    ->disk('private')
    ->description(fn ($record) => "Uploaded by {$record->user->name} on {$record->created_at->format('Y-m-d')}")
```

#### Multiple Files with Descriptions (Indexed Array)

```php
FileOutput::make('attachments')
    ->field('attachments')
    ->disk('private')
    ->description([
        'Main contract document',
        'Signed addendum',
        'Supporting documentation'
    ])
```

#### Multiple Files with Descriptions (Associative Array)

```php
FileOutput::make('documents')
    ->path([
        'contracts/contract.pdf' => 'Main Contract',
        'contracts/addendum.pdf' => 'Addendum',
        'invoices/invoice.pdf' => 'Invoice'
    ])
    ->disk('private')
    ->description([
        'contracts/contract.pdf' => 'Signed on 2024-01-15',
        'contracts/addendum.pdf' => 'Additional terms and conditions',
        'invoices/invoice.pdf' => 'Payment due: 2024-02-01'
    ])
```

#### Dynamic Multiple Descriptions

```php
FileOutput::make('certificates')
    ->field('certificates')
    ->disk('private')
    ->description(function ($state) {
        if (is_array($state)) {
            return array_map(function($path, $index) {
                return 'Certificate #' . ($index + 1) . ' - ' . basename($path);
            }, $state, array_keys($state));
        }
        return null;
    })
```

#### Description Based on Other Fields

```php
FileOutput::make('invoice')
    ->field('invoice_file')
    ->disk('private')
    ->description(function ($record, $get) {
        $status = $get('payment_status');
        $date = $record->invoice_date->format('d.m.Y');
        return "Invoice from {$date} - Status: {$status}";
    })
```

### Advanced Multiple Files

#### Limit Deletion (Keep at Least One)

```php
FileOutput::make('documents')
    ->field('documents')
    ->disk('private')
    ->onDelete(fn ($filePath, $disk) => Storage::disk($disk)->delete($filePath))
    ->showDeleteButton(function ($record) {
        $documents = $record->documents ?? [];
        return is_array($documents) && count($documents) > 1;
    })
```

#### With Database Counter Update

```php
FileOutput::make('certificates')
    ->field('certificates')
    ->disk('private')
    ->onDelete(function ($record, $filePath, $disk) {
        Storage::disk($disk)->delete($filePath);
        
        $certificates = array_values(array_filter(
            $this->record->certificates ?? [],
            fn($cert) => $cert !== $filePath
        ));
        
        $this->record->update([
            'certificates' => empty($certificates) ? null : $certificates,
            'certificates_count' => count($certificates),
        ]);
        
        Notification::make()
            ->title('Certificate deleted')
            ->body('Remaining: ' . count($certificates))
            ->success()
            ->send();
    })
```

---

## API Reference

### Methods

#### `field(string $fieldName)`

**Required** (if `path` not specified)

Specifies the field name to read the file path from.

```php
FileOutput::make('preview')->field('file_path')
```

#### `path(string|array|Closure $path)`

**Required** (if `field` not specified)

Specifies the direct path to the file. Supports:

- **String**: Direct file path
- **Array**: Multiple file paths
- **Associative Array**: File paths with custom labels (path => label)
- **Closure**: Dynamic path (can return string or array)
- **Public URL**: External file URL

```php
// String
->path('documents/report.pdf')

// Array (indexed)
->path(['file1.pdf', 'file2.pdf'])

// Associative Array with custom labels
->path([
    'contracts/contract-2024.pdf' => 'Main Contract 2024',
    'contracts/addendum.pdf' => 'Contract Addendum',
    'documents/invoice.pdf' => 'Invoice #12345'
])

// Closure (single)
->path(fn ($record) => 'users/' . $record->user_id . '/avatar.jpg')

// Closure (multiple)
->path(fn ($record) => $record->files ?? [])

// Closure with labels
->path(fn ($record) => [
    $record->contract_path => 'Contract for ' . $record->name,
    $record->invoice_path => 'Invoice #' . $record->invoice_number
])

// Public URL
->path('https://example.com/file.pdf')
```

Use associative arrays to set custom labels for download links. Without a label, the default "Download File" text is used.

`path()` takes priority for reading, but `field()` is still used for auto-updates. When using `path()` with arrays, also specify `field()` for state sync:

```php
->path(fn ($record) => $record->files ?? [])
->field('files')
```

#### `disk(string $disk)`

**Optional**

Specifies the storage disk (public, private, s3, etc.).

```php
->disk('private')
```

#### `onDelete(Closure $callback)`

**Optional**

Adds delete button with callback. Receives `$record`, `$filePath`, and `$disk` parameters.

```php
->onDelete(function ($record, $filePath, $disk) {
    Storage::disk($disk)->delete($filePath);
})

// With record usage
->onDelete(function ($record, $filePath, $disk) {
    Storage::disk($disk)->delete($filePath);
    
    // Update record
    $record->update(['file_path' => null]);
    
    // Log deletion
    Log::info('File deleted', [
        'file' => $filePath,
        'user' => auth()->id(),
        'record_id' => $record->id
    ]);
})
```

**Parameters:**

- `$record` - Current model/record instance (can be null)
- `$filePath` - Path to the file being deleted
- `$disk` - Storage disk name

Field state is automatically cleared after deletion (if `field()` is specified).

#### `hideDeleteButton(bool|Closure $condition = true)`

**Optional**

Hides the delete button.

```php
// Always hide
->hideDeleteButton()

// Conditional
->hideDeleteButton(fn ($record) => $record->is_locked)
```

#### `showDeleteButton(bool|Closure $condition = true)`

**Optional**

Shows the delete button (default). Useful for conditional display.

```php
->showDeleteButton(fn () => auth()->user()->isAdmin())
```

#### `deleteLabel(string|Closure $label)`

**Optional**

Sets a custom label for the delete button.

```php
// Static label
->deleteLabel('Remove')

// Dynamic label
->deleteLabel(fn () => 'Remove File')
```

#### `emptyState(string|Closure $message)`

**Optional**

Sets a custom message to display when no file is uploaded. Default: "No file uploaded".

```php
// Static message
->emptyState('No document available')

// Dynamic message
->emptyState(fn ($record) => "No file uploaded for {$record->name}")

// Multilingual
->emptyState(__('custom.no_file'))
```

#### `deleteConfirmationTitle(string|Closure $title)`

**Optional**

Sets a custom title for the delete confirmation modal.

```php
// Static title
->deleteConfirmationTitle('Delete File?')

// Dynamic title
->deleteConfirmationTitle(fn () => 'Delete this document?')
```

#### `deleteConfirmationDescription(string|Closure $description)`

**Optional**

Sets a custom description for the delete confirmation modal.

```php
// Static description
->deleteConfirmationDescription('This action cannot be undone.')

// Dynamic description
->deleteConfirmationDescription(fn ($record) => "Are you sure you want to delete {$record->name}?")
```

#### `description(string|array|Closure $description)`

**Optional**

Adds a description text for the file(s). Supports:

- **String**: Single description for one file
- **Indexed Array**: Multiple descriptions (one per file) for multiple files
- **Associative Array**: Descriptions mapped by file path (path => description)
- **Closure**: Dynamic description based on record/state

```php
// String (single file)
->description('Contract signed on 2024-01-15')

// Indexed Array (multiple files)
->description([
    'First document description',
    'Second document description',
    'Third document description'
])

// Associative Array (path => description)
->description([
    'contracts/contract.pdf' => 'Main contract signed on 2024-01-15',
    'contracts/addendum.pdf' => 'Additional terms',
    'invoices/invoice.pdf' => 'Payment due: 2024-02-01'
])

// Closure with record
->description(fn ($record) => "Document for: {$record->name}")

// Closure with state
->description(function ($state) {
    if (is_array($state)) {
        return array_map(fn($path) => 'File: ' . basename($path), $state);
    }
    return 'Single file uploaded';
})

// Closure with multiple parameters
->description(function ($record, $state, $get) {
    $type = $get('document_type');
    return "Document type: {$type} for {$record->name}";
})
```

**Available Closure Parameters:**

- `$record` - Current model/record
- `$state` - Current field value (file path or array of paths)
- `$component` - The FileOutput component instance
- `$get` - Function to get other field values: `$get('field_name')`
- `$set` - Function to set other field values: `$set('field_name', $value)`

For multiple files, you can use indexed arrays (matched by position) or associative arrays (matched by file path). Associative arrays work best with `path()` and custom labels.

---

## How It Works

- **Images** — detected automatically by extension (jpg, png, gif, svg, webp, etc.) and shown as previews.
- **Documents** — non-image files get a download link with the filename.
- **Private files** — served via temporary signed URLs.
- **Public URLs** — displayed directly.
- **Multiple files** — arrays are handled per-item, each with its own preview and delete button.
- **Auto-sync** — on deletion, only the removed file is taken out of the array; the rest stays intact.

---

## Requirements

- **PHP**: 8.1 or higher
- **Laravel**: 10.x, 11.x, or 12.x
- **Filament**: 3.x or 4.x

---

## Contributing

Pull requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

## Author

**FilaStudio**

- GitHub: [@filastudio](https://github.com/filastudio)

---

## Links

- [Repository](https://github.com/filastudio/filament-file-output)
- [Packagist](https://packagist.org/packages/filastudio/filament-file-output)
- [Issues](https://github.com/filastudio/filament-file-output/issues)
