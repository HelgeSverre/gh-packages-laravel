# My Bar Decoder 🧾

- Web application for decoding payment codes from PDF files using PHP and Laravel framework with Livewire.
The main API used for decoding was [Google Vision API V1](https://www.google.com/aclk?sa=L&ai=DChsSEwiB_4jsquaRAxV1QEgAHfopFnwYACICCAEQABoCY2U&co=1&ase=2&gclid=CjwKCAiAjc7KBhBvEiwAE2BDOfO0O5OZHElPRG31iNloQbVU9HHBGc-RlrkW0LDc5Z60_qZd50JWAxoCUrQQAvD_BwE&cid=CAAS0wHkaPplRkGyi-pu_bPo0TJlkur-6F60aTymntTIX2Epe4zjkYhvQodBVYJm3QfWLXandJIeBlmkZO8_ZhwoPqWg3C61AAh10yJ3cbF8SdhSTG4ZhMD_TI5aiKGJp9FJMQ-M26Ff4bvOGsADFPfXgrcH6gLjg9_p9MxkGw9hEJo_wIl0grZYwZsOrgLGderttN35OFNO-ngGBIX70V2K-bqmK89q61-QqpREy8-Ct1HqxtXlFStCOjMzFPePoGO428k-US2TraQdPAyKCHmnpn2zb5KJ&cce=2&category=acrcp_v1_37&sig=AOD64_3VhbeZcYu09B3ML5Mrit9adXcumQ&q&nis=4&adurl&ved=2ahUKEwj5uYPsquaRAxXyBbkGHdvjJg0Q0Qx6BAgWEAE) which has a free plan.
- App designed to test the Cloud platform called [Render](https://render.com) and Laravel/Livewire FE library.
- The app uses [Resend](https://resend.com) to send emails without using SMTP protocol.
- The app uses [Cloudflare](https://www.cloudflare.com) services for DNS management.

## Required Tools

- PHP v8.4.13
- Composer v2.8.12
- Laravel v12.43.1
- Livewire v3.7.3
- NodeJS v20.13.1

## Required PHP v8 Extensions

- pecl.php.net/imagick-3.8.1

## Imagick Extension Setup (Debian)

```bash
# Install ImageMagick system libraries first
sudo apt-get update
sudo apt-get install libmagickwand-dev imagemagick ghostscript

# Install Imagick extension via PECL
pecl install imagick

# Find your PHP ini directory
php --ini

# Add the extension to your php.ini or create a new config file
echo "extension=imagick.so" >> $(php --ini | grep "Scan for additional" | awk '{print $NF}')/imagick.ini

# Check if the extension is loaded
php -m | grep imagick
```

## Development Setup (Using Laravel Sail)

```bash
cp .env.example .env

# Create PostgreSQL and Laravel containers
sail up -d

# Run database migrations
sail artisan migrate

# Run Vite dev server
sail npm run dev
```

## Architecture

The project follows Clean Architecture with DDD principles. All domain logic lives under `App\Core\Modules\Documents\`, split into three layers with strict dependency direction: Domain ← Application ← Infrastructure.

### Domain layer

Pure PHP, no framework dependencies. Contains:

- **`Document` entity** — the aggregate root. Holds `name`, `paymentCode`, `createdAt`, and `ownerId`. Built after a successful extraction and passed to the repository.
- **`PaymentCode` value object** — wraps the extracted code string. Created via `PaymentCode::tryCreateFromText(string $text)`, which applies regex patterns for two Brazilian formats (DAS 48-digit barcode and standard 47-digit bill code). Throws `ExtractCodeException` if neither matches.
- **`DocumentRepository` interface** — write port. Single method: `save(Document $document)`.
- **`ExtractPaymentCodeUseCase` interface** — the use case contract consumed by the UI layer.

### Application layer

Orchestrates domain objects and defines the remaining ports:

- **`ExtractPaymentCodeService`** implements `ExtractPaymentCodeUseCase`. Calls `FileTextExtractor` → creates `PaymentCode` → creates `Document` → persists via `DocumentRepository` → returns `Output($document)`. Throws `FailedToExtractPaymentCodeException` when the extractor returns empty text.
- **`FileTextExtractor` interface** — port for PDF-to-text extraction.
- **`DocumentDAO` interface** — read-only query port. Exposes `listByOwnerId` for the dashboard listing. Kept separate from `DocumentRepository` to reflect the write/read asymmetry (CQRS-flavoured split).

### Infrastructure layer

Concrete implementations, all framework-aware:

- **`EloquentDocumentRepository`** — implements `DocumentRepository::save()`, maps the `Document` entity to the Eloquent model.
- **`EloquentDocumentDAO`** — implements `DocumentDAO::listByOwnerId()`, returns a paginated Eloquent result.
- **`GoogleVisionFileTextExtractor`** — implements `FileTextExtractor`. Converts the first PDF page to PNG via Ghostscript, base64-encodes it, and sends it to the Google Vision API (`TEXT_DETECTION`).

### UI layer

`App\Livewire\Dashboard` is the only Livewire component. It injects `DocumentDAO` via Livewire's `boot()` hook (not serialised between requests) for reads, and receives `ExtractPaymentCodeUseCase` via method injection in `submit()` for writes.

----------
Released in 2025

By [Victor B. Fiamoncini](https://github.com/Victor-Fiamoncini) ☕️
