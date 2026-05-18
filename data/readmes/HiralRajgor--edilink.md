# EDILink by Hiral Rajgor

**Laravel package for generating shipping EDI files from container lifecycle events.**

Stuck figuring out encoding and decoding EDIs, here is the easiest way to do it. EDILink gives you a clean, framework-agnostic pipeline to turn your container movement data into carrier-ready EDI output — with zero database coupling, typed data objects, and a pluggable carrier profile system that makes adding new shipping lines straightforward.

Built and maintained by [Hiral Rajgor](https://github.com/HiralRajgor).

---

## Features

- **Typed input objects** — `MovementRecord` with a fluent builder; hydrate from any array or DB row
- **Pluggable carrier profiles** — MSC ships built-in; add HLL, KMTC, OOCL etc. by implementing one interface
- **Dual output modes** — fixed-width text (for EDI files) or structured array (for Excel / OVA / API)
- **Chronological validation** — each event is checked against the full arrival→survey→repair→departure chain before being included
- **DB feedback loop** — every `EdiOutput` carries the `includedIds` of records written, so you update your own DB
- **Zero framework coupling in the core** — `MovementRecord`, `EdiOutput`, and all profile logic are pure PHP; Laravel is only needed for the Facade, service provider, and Artisan commands

---

## Requirements

- PHP 8.2+
- Laravel 10, 11, 12, or 13

---

## Installation

```bash
composer require entelix/edilink
```

Laravel auto-discovers the service provider. To publish the config file:

```bash
php artisan vendor:publish --tag=edilink-config
```

---

## Core concepts

### MovementRecord

The single input object that flows through EDILink. Represents one container's state at the time you want to generate EDI.

**Fluent builder:**

```php
use Entelix\EdiLink\DTOs\MovementRecord;

$record = MovementRecord::build()
    ->identity('CMAU1234560', '20GP', 'MSC', reportingParty: 'ADEPOT')
    ->depot('ADN01', zone: 26)
    ->arrival('2024-06-01 08:00:00', movementType: 'FULL_IN', vehicleNo: 'GJ05TX1234')
    ->deliveryOrder('MSCUDO123456', validity: '2024-06-10', grace: false)
    ->survey('2024-06-01 10:00:00')
    ->repairCycle(sentAt: '2024-06-02 09:00:00', returnedAt: '2024-06-05 14:00:00')
    ->departure('2024-06-08 11:00:00', movementType: 'FULL_OUT', vehicleNo: 'MH04CD5678')
    ->booking('MSCUBOOK001', validity: '2024-06-15', consignee: 'ACME EXPORTS', sealRef: 'MSC987654')
    ->ediFlags(gateIn: '', survey: '', mnrIn: '', mnrOut: '', gateOut: '')
    ->id('1001')
    ->make();
```

**From a DB row array:**

```php
$record = MovementRecord::fromArray($dbRow);
```

`fromArray()` accepts both snake_case and camelCase keys, and maps common column name variants automatically — `gate_in`, `arrived_at`, `gate_in_at`, `arrivedAt` all map to the same field.

### EdiOutput

Every `build*()` method returns an `EdiOutput`:

```php
$output->content;       // string  — the EDI text (or JSON for array format)
$output->includedIds;   // array   — your PKs for DB update
$output->eventType;     // string  — 'gate_in', 'survey', etc.
$output->rows;          // array   — structured rows for Excel/OVA
$output->hasContent();  // bool
$output->lineCount();   // int
$output->recordCount(); // int
```

---

## Usage

### Generate a single event

```php
use Entelix\EdiLink\Facades\EdiLink;

$output = EdiLink::carrier('MSC')->buildGateIn($records);

file_put_contents(storage_path('app/edilink/gatein.txt'), $output->content);

// Update your DB for the records that were included
Container::whereIn('id', $output->includedIds)
         ->where('edi_gate_in', '')
         ->update(['edi_gate_in' => 'gatein.txt']);
```

### Generate all events at once

```php
$results = EdiLink::carrier('MSC')->buildAll($records);

// $results is keyed by event type:
// ['gate_in' => EdiOutput, 'survey' => EdiOutput, 'repair_dispatch' => EdiOutput, ...]

$filename = 'MSC_EDI_' . now()->format('d_M_Y_H_i') . '.txt';
$buffer   = '';

foreach ($results as $eventType => $output) {
    $buffer .= $output->content;

    if (! empty($output->includedIds)) {
        $column = match($eventType) {
            'gate_in'        => 'edi_gate_in',
            'survey'         => 'edi_survey',
            'repair_dispatch'=> 'edi_mnr_in',
            'repair_return'  => 'edi_mnr_out',
            'gate_out'       => 'edi_gate_out',
            default          => null,
        };

        if ($column) {
            Container::whereIn('id', $output->includedIds)
                     ->where($column, '')
                     ->update([$column => $filename]);
        }
    }
}

file_put_contents(storage_path("app/edilink/{$filename}"), $buffer);
```

### Shorthand — full EDI string in one call

```php
$ediContent = EdiLink::generate('MSC', $records);
file_put_contents($path, $ediContent);
```

### Array / OVA output mode

```php
$output = EdiLink::carrier('MSC', 'array')->buildGateIn($records);

$rows = json_decode($output->content, true);
// Each row is an associative array: ['carrier_code', 'container_number', 'event_code', ...]

// Export to Excel
foreach ($rows as $row) {
    $sheet->appendRow(array_values($row));
}
```

---

## Laravel scheduler integration

The example below shows the recommended pattern: a dedicated scope on your
model resolves the pending records, `buildAll()` generates the EDI in one
pass, and `includedIds` gives you the exact IDs to stamp without a second
query.

**Your model scope** — add this to whatever Eloquent model holds your container data:

```php
// app/Models/ContainerUnit.php

public function scopePendingEdiFor(Builder $query, string $carrier, Carbon $from, Carbon $to): Builder
{
    // Adapt column names to match your own schema
    return $query
        ->where('shipping_line', $carrier)
        ->where(function (Builder $q) use ($from, $to) {
            $events = [
                ['flag' => 'edi_arrival',  'event_col' => 'arrived_at'],
                ['flag' => 'edi_survey',   'event_col' => 'surveyed_at'],
                ['flag' => 'edi_mnr_out',  'event_col' => 'repair_sent_at'],
                ['flag' => 'edi_mnr_in',   'event_col' => 'repair_done_at'],
                ['flag' => 'edi_departed', 'event_col' => 'departed_at'],
            ];

            foreach ($events as $e) {
                $q->orWhere(fn(Builder $sub) =>
                    $sub->whereNull($e['flag'])
                        ->whereBetween($e['event_col'], [$from, $to])
                );
            }
        });
}
```

**The Artisan command:**

```php
// app/Console/Commands/DispatchCarrierEdi.php

namespace App\Console\Commands;

use App\Models\ContainerUnit;
use Entelix\EdiLink\Core\EdiOutput;
use Entelix\EdiLink\DTOs\MovementRecord;
use Entelix\EdiLink\Facades\EdiLink;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class DispatchCarrierEdi extends Command
{
    protected $signature   = 'edi:dispatch {carrier}';
    protected $description = 'Build and email a carrier EDI file covering the previous hour';

    /**
     * Maps EDILink event slugs to the dispatch-flag column in your table.
     * Adjust the right-hand values to match your actual column names.
     */
    private const DISPATCH_FLAGS = [
        'gate_in'         => 'edi_arrival',
        'survey'          => 'edi_survey',
        'repair_dispatch' => 'edi_mnr_out',
        'repair_return'   => 'edi_mnr_in',
        'gate_out'        => 'edi_departed',
    ];

    public function handle(): int
    {
        $carrier  = strtoupper($this->argument('carrier'));
        $window   = $this->reportingWindow();
        $filename = sprintf('%s_EDI_%s.txt', $carrier, $window['from']->format('Ymd_Hi'));

        $units = ContainerUnit::with(['depot', 'inboundOrder', 'outboundBooking', 'activeSeal'])
            ->pendingEdiFor($carrier, $window['from'], $window['to'])
            ->get();

        if ($units->isEmpty()) {
            $this->info("No pending {$carrier} EDI events in window.");
            return self::SUCCESS;
        }

        // Hydrate MovementRecord objects from your model collection.
        // fromArray() accepts any key names — map yours here once.
        $records = $units->map(fn($unit) => MovementRecord::fromArray([
            'id'                      => $unit->id,
            'container_number'        => $unit->unit_number,
            'iso_type'                => $unit->size_type,
            'carrier_code'            => $unit->shipping_line,
            'reporting_party'         => $unit->depot->edi_party_code,
            'depot_code'              => $unit->depot->location_code,
            'zone_id'                 => $unit->depot->zone_id,
            'arrived_at'              => $unit->arrived_at,
            'arrival_movement_type'   => $unit->arrival_type,
            'arrival_vehicle'         => $unit->arrival_vehicle_ref,
            'delivery_order_ref'      => $unit->inboundOrder?->reference,
            'delivery_order_expiry'   => $unit->inboundOrder?->expires_at,
            'delivery_order_overdue'  => $unit->arrival_after_do_expiry,
            'surveyed_at'             => $unit->surveyed_at,
            'sent_for_repair_at'      => $unit->repair_sent_at,
            'returned_from_repair_at' => $unit->repair_done_at,
            'departed_at'             => $unit->departed_at,
            'departure_movement_type' => $unit->departure_type,
            'departure_vehicle'       => $unit->departure_vehicle_ref,
            'destination_location'    => $unit->departure_destination,
            'booking_ref'             => $unit->outboundBooking?->reference,
            'booking_expiry'          => $unit->outboundBooking?->expires_at,
            'booking_overdue'         => $unit->departure_after_booking_expiry,
            'consignee_name'          => $unit->outboundBooking?->consignee,
            'seal_reference'          => $unit->activeSeal?->full_number,
            // Dispatch flags — empty string = pending, filename = already sent
            'dispatched_gate_in'      => $unit->edi_arrival     ?? '',
            'dispatched_survey'       => $unit->edi_survey       ?? '',
            'dispatched_mnr_in'       => $unit->edi_mnr_out      ?? '',
            'dispatched_mnr_out'      => $unit->edi_mnr_in       ?? '',
            'dispatched_gate_out'     => $unit->edi_departed     ?? '',
        ]))->all();

        // Generate all event types in a single pass
        $results = EdiLink::carrier($carrier)->buildAll($records);

        // Concatenate content + stamp dispatched flags in one loop
        $ediContent = collect($results)
            ->filter(fn(EdiOutput $o) => $o->hasContent())
            ->each(function (EdiOutput $output) use ($filename) {
                $column = self::DISPATCH_FLAGS[$output->eventType] ?? null;
                if ($column && $output->includedIds) {
                    ContainerUnit::whereIn('id', $output->includedIds)
                        ->whereNull($column)
                        ->update([$column => $filename]);
                }
            })
            ->implode('content');

        if (empty(trim($ediContent))) {
            $this->info("EDI generated but all lines were filtered. Nothing to send.");
            return self::SUCCESS;
        }

        Storage::put("edi/outbound/{$filename}", $ediContent);

        // Send — adapt to your mail setup (Mailable, raw, notification, etc.)
        Mail::send([], [], fn($msg) => $msg
            ->to(config("services.edi.{$carrier}.recipients"))
            ->subject("{$carrier} EDI — {$filename}")
            ->text("{$carrier} EDI file attached. Period: {$window['from']} to {$window['to']}.")
            ->attachData($ediContent, $filename, ['mime' => 'text/plain'])
        );

        $this->info("Dispatched {$filename} — {$units->count()} unit(s), " . strlen($ediContent) . " bytes.");
        return self::SUCCESS;
    }

    private function reportingWindow(): array
    {
        return [
            'from' => Carbon::now()->subHour()->startOfHour(),
            'to'   => Carbon::now()->startOfHour(),
        ];
    }
}
```

Register in your scheduler:

```php
// routes/console.php  (Laravel 11+)
Schedule::command('edi:dispatch MSC')->hourly();
```

---

## Adding a new carrier

1. Create a profile class in your app (or a separate package):

```php
// app/EdiLink/HllCarrierProfile.php

namespace App\EdiLink;

use Entelix\EdiLink\Builders\AbstractCarrierProfile;
use Entelix\EdiLink\Core\EdiLine;
use Entelix\EdiLink\Core\EdiOutput;
use Entelix\EdiLink\DTOs\MovementRecord;
use DateTimeImmutable;

class HllCarrierProfile extends AbstractCarrierProfile
{
    public function carrierCode(): string { return 'HLL'; }
    public function carrierName(): string { return 'Hapag-Lloyd'; }

    public function buildGateIn(array $records): EdiOutput
    {
        $lines       = [];
        $includedIds = [];

        foreach ($records as $record) {
            if (! $this->isPending($record->dispatchedGateIn)) continue;
            if ($record->arrivedAt === null) continue;

            $line = EdiLine::make()
                // HLL has its own field layout — define it here
                ->add('carrier',       4,  $record->carrierCode)
                ->add('container',     11, $record->containerNumber)
                ->add('event',         6,  'RCVD')
                ->add('timestamp',     12, $this->ediTimestamp($record->arrivedAt))
                ->add('location',      5,  $record->depotCode);

            $lines[]     = $line->toText();
            $includedIds[] = $record->recordId;
        }

        return new EdiOutput(
            content:     implode('', $lines),
            includedIds: $includedIds,
            eventType:   'gate_in',
            generatedAt: new DateTimeImmutable()
        );
    }

    // Implement buildSurvey, buildRepairDispatch, buildRepairReturn, buildGateOut
    // Inherit no-op buildCfsArrival, buildStuffing, buildDestuffing from AbstractCarrierProfile
}
```

2. Register in `config/edilink.php`:

```php
'carriers' => [
    'HLL' => \App\EdiLink\HllCarrierProfile::class,
],
```

3. Use it:

```php
EdiLink::carrier('HLL')->buildAll($records);
```

---

## Artisan commands

```bash
# Check registered carriers and usage hint
php artisan edilink:generate MSC

# Validate an EDI file against a carrier schema
php artisan edilink:validate /path/to/file.txt --carrier=MSC
```

---

## Running tests

```bash
composer install
./vendor/bin/phpunit
```

---

## MSC event reference

| Method | Event type slug | EDI code |
|---|---|---|
| `buildGateIn()` | `gate_in` | DEV / MCY / MPI / ERM (zone-aware) |
| `buildSurvey()` | `survey` | DAM |
| `buildRepairDispatch()` | `repair_dispatch` | TBR |
| `buildRepairReturn()` | `repair_return` | REP |
| `buildGateOut()` | `gate_out` | FST / MPO / MSH (zone-aware) |
| `buildCfsArrival()` | `cfs_arrival` | DVAN |
| `buildStuffing()` | `stuffing` | CST |
| `buildDestuffing()` | `destuffing` | DST |

---

## Roadmap

- [x] MSC fixed-width EDI generator
- [x] MSC array / OVA output
- [x] Zone-aware event code resolution (Hazira, Mundra, Nhava Sheva)
- [x] Chronological chain validation
- [x] `EdiOutput.includedIds` for DB feedback loop
- [x] `MovementRecord` fluent builder + `fromArray()` factory
- [ ] HLL carrier profile
- [ ] KMTC carrier profile
- [ ] OOCL carrier profile
- [ ] Inbound EDI parser (raw EDI text → `MovementRecord[]`)
- [ ] Schema validator with field-level error messages
- [ ] Hosted API tier — subscribe at entelix.in for an API key

---

## License

MIT — free to use in any project.

© [Hiral Rajgor](https://hiralrajgor.entelix.in) | [Entelix Technologies](https://entelix.in). Contributions welcome via GitHub.
