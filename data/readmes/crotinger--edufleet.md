# edufleet

Transportation and compliance system of record for K-12 school districts.

edufleet is what a small district uses instead of a stack of paper binders, a Tyler quote it can't afford, and a separate vendor for every kind of compliance paperwork. It tracks the fleet, the drivers, the routes, the trips, the requests, the inspections, the registrations, the maintenance, the athletics schedule, the federally-mandated drug and alcohol pool, and the per-driver qualification file — all in one Laravel app a district IT person can host on a single Docker box.

The goals are narrow and concrete:

- Give the transportation director one place to log daily-route trips, dispatch vehicles, review pending submissions, and produce the supporting data for the KSDE transportation reimbursement filing.
- Let teachers and athletic directors request transportation without admin-panel access, with the request landing on the director's queue with capacity and conflict checks already done.
- Let drivers log a trip from a phone with a QR sticker in the cab — no app install, no full login.
- Keep one defensible audit trail of every change so a state audit takes hours, not weeks.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Laravel 13 (PHP 8.4) |
| Admin UI | Filament 5 + Livewire 3 + Alpine.js |
| Database | PostgreSQL 16 (`timestamptz` throughout, Central time by default) |
| Cache / sessions / queues | Redis 7 |
| Web runtime | FrankenPHP (Caddy + PHP embedded) |
| Containerization | Docker Compose |
| Auth / RBAC | `spatie/laravel-permission` |
| Audit log | `spatie/laravel-activitylog` |
| QR codes | `bacon/bacon-qr-code` |

## What's in it

### For the transportation director

- **Trip log** — daily routes plus athletic, field-trip, activity, and maintenance runs. Odometer auto-syncs back to the Vehicle when a trip closes. In-progress trips surface on the dashboard so unfinished work doesn't go missing.
- **Trip requests** — teacher and athletic submissions land in one queue with live capacity / conflict checks. Approve, split across vehicles (e.g. 20 passengers across two 12-passenger vans, both legs share a split-group ID), or reject with a reason.
- **Reservations** — admin-issued, self-service, athletic-source, or auto-materialized from a daily route. Lifecycle: `requested` → `reserved` → `claimed` → `returned`. A `Stale` tab surfaces approved-but-never-claimed rows whose date has passed.
- **Vehicle availability** — fleet-wide sortable view of current state (available / in use / reserved) plus the next 14 days.
- **Reservation schedule** — week grid of every reservation and daily-route trip across the fleet. Quickest way to spot double-bookings.
- **Customizable dashboard** — drag-and-drop tiles, half / full column-span control, with role-defaulted starting layouts an admin can set centrally.

### For the athletic director

- **Teams** — one row per sport / level / gender / season. Each team has a roster (with optional Student-record links) and a coach/staff list with a default-traveler flag.
- **Roster import** — CSV with `last_name, first_name, grade, jersey_number, position`; auto-links to existing Student records by name + grade match.
- **Schedule import** — CSV with `date, time, opponent, location, is_home, bus_departure, bus_return`. Per-event form auto-fills expected athletes from roster + default-traveler staff.
- **Transport requests** — single request per event, bulk **Request shared transport** to combine Varsity + JV on one bus, or **Add to existing trip** to attach a row to an already-submitted request after the fact.
- **Preferred vehicle hint** — the team's usual bus; transportation sees it when assigning.

### For drivers

- **Quicktrip QR** — one signed-URL QR code per vehicle, taped inside the cab. Driver scans, enters PIN, picks themselves, logs start odometer. End of trip: scan again, enter end odometer + ridership. No app install, no full login.
- **Reservation pre-fill** — when a scan happens within the configurable grace window of a planned reservation, the form pre-fills with the reservation's vehicle, purpose, and trip type.
- **Pre-trip / post-trip inspections** — checklist-driven DVIRs from the same QR session. Defects roll into Maintenance.

### For teachers

- **Trip request** form — vehicle pick + capacity check, expected dates, purpose, ridership estimate. Sees own request status; sees Vehicle availability before submitting.

### For mechanics

- **Maintenance schedule + records** — schedule defines the rule (oil change every 5,000 mi or 6 months, propane tank inspection annually); records are the events that tick it forward.
- **Maintenance timeline** — projects each vehicle's next due service from schedule + last record.
- **Pre-trip inspection results** — defects flagged by drivers land here for resolution.

### For the board / auditors

- **Board report** — printable one-pager: fleet, drivers, miles, safety, maintenance, compliance, trip-type breakdown. Fiscal year (Jul–Jun) / academic year (Aug–May) / fiscal quarter / custom range. Includes district name, USD number, superintendent, and board chair if configured.
- **KSDE mileage report** — date-range rollup of daily-route reimbursable miles, eligible boardings, rider-miles. Per-route, per-vehicle, per-trip-type breakdowns plus a data-quality checklist (missing end odometers, silent routes, odometer regressions). Printable and CSV-exportable. Note: this produces the *supporting data* for the KSDE filing — it does not generate or file the actual state form.
- **Audit log** — append-only trail of every create / update / delete on every major model (Vehicle, Driver, Trip, Route, Inspection, Registration, MaintenanceRecord, User, TripReservation, AthleticEvent, Team, etc.), filterable by subject, actor, and date.

### Compliance modules

- **DQF compliance (49 CFR §391)** — per-driver qualification file. Each Driver gets a checklist of required items (application, MVR, road test, certificates, medical card, etc.), document attachments stored encrypted, and a one-click **Binder** action that downloads all current DQF documents as a single ZIP for an auditor.
- **§382 drug & alcohol testing** — pool tracking (active CDL holders only), every test type logged (random, pre-employment, post-accident, reasonable-suspicion, return-to-duty, follow-up), YTD compliance page comparing actual vs. required at the configured FMCSA rate.
- **Inspections & registrations** — KHP annual (buses), internal safety (light vehicles), propane tank inspections, vehicle registration tracking. Color-coded expiration ranges configurable per warning window.
- **Document attachments** — polymorphic upload + signed-URL download on Drivers, Vehicles, Trips, Inspections, MaintenanceRecords. Files store outside the web root.

### Runtime configuration

- **System settings page** (super-admin only) — district identity (name, USD #, superintendent, board chair, address), timezone, compliance warning windows, KSDE default reimbursement rate and eligible-rider distance threshold, FMCSA §382 random-test rates, QR scan grace window, athletics upcoming horizon. Persisted in a generic settings store; no env / redeploy needed to adjust.
- **Help page** — in-app field guide with a tabbed manual for transportation directors, athletic directors, drivers, IT, and board members.

## First-run install (fresh Ubuntu 24.04 host)

```bash
# 1) Docker Engine + Compose plugin
sudo apt-get update && sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# 2) Clone
sudo mkdir -p /opt/edufleet && sudo chown $USER:$USER /opt/edufleet
cd /opt/edufleet
git clone https://github.com/crotinger/edufleet .

# 3) Configure
cp .env.example .env
#   edit .env: POSTGRES_PASSWORD, SERVER_NAME, APP_HTTP_PORT, APP_HTTPS_PORT, APP_URL

# 4) Build + launch
docker compose up -d --build

# 5) First-time Laravel bootstrap
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --class=RolesAndPermissionsSeeder --force

# 6) Create your first super-admin
docker compose exec app php artisan make:filament-user
#   then assign the role:
docker compose exec app php artisan tinker --execute="\
  \App\Models\User::where('email','<your-email>')->first()->assignRole('super-admin');"

# 7) (Optional) Populate realistic demo fleet, drivers, routes, and trips
docker compose exec app php artisan db:seed --class=DemoSeeder --force
```

The admin panel is then reachable at whatever `SERVER_NAME` / port you set.

### Behind a TLS-terminating reverse proxy

Two things you must do or the Quicktrip QR scan will fail with `403 Invalid Signature`:

1. Set `APP_URL` in `src/.env` to the **public HTTPS URL** (e.g. `https://edufleet.example.org`).
2. `bootstrap/app.php` already calls `->trustProxies(at: '*')` — keep it, and make sure your proxy forwards `X-Forwarded-Proto: https`.

### Picking the timezone

The default is `America/Chicago` (KS, where the project was built). Web requests pick up timezone changes from System settings immediately; the worker container caches its config, so restart the worker container after changing the timezone setting:

```bash
docker compose restart worker
```

## Everyday commands

From `/opt/edufleet`:

```bash
# status / logs
docker compose ps
docker compose logs -f app
docker compose logs -f worker

# start / stop
docker compose up -d
docker compose down

# artisan
docker compose exec app php artisan migrate
docker compose exec app php artisan tinker
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan permission:cache-reset

# composer
docker compose exec app composer require vendor/package
```

If you just ran `usermod -aG docker $USER` and haven't logged out and back in, prefix docker commands with `sg docker -c "..."` to pick up the group without re-logging.

### Backups

Two things to back up nightly:

```bash
# Database
docker compose exec db pg_dump -U edufleet edufleet | gzip > backup-$(date +%F).sql.gz

# Uploaded files (CSV imports, generated QR codes, attachment uploads)
tar -czf storage-$(date +%F).tar.gz src/storage/app
```

## Roles & permissions

Every route to the admin panel requires one of these roles. Permissions are seeded by `database/seeders/RolesAndPermissionsSeeder.php`. A user can hold multiple roles (permissions union).

| Role | Intended user | What they can do |
| --- | --- | --- |
| `super-admin` | IT / primary administrator | Bypasses every permission check. Manages users, roles, role-to-permission assignments. Edits System settings (timezone, district identity, compliance windows, FMCSA rates, etc.). |
| `transportation-director` | Runs the transportation department day-to-day | Full control of vehicles, drivers, routes, trips, inspections, registrations, maintenance, reservations, and trip requests. Approves/rejects teacher and athletic transport requests. Runs KSDE and Board reports. Cannot manage users or roles. |
| `athletic-director` | Runs sports / activities programs | Creates and edits Teams, rosters, coaches/staff. Imports season schedules and creates athletic events. Submits transport requests (single, shared-bus, or attached to existing). Read-only on the rest of the operation. |
| `mechanic` | Shop crew | Full control of vehicles, inspections, maintenance records, and maintenance schedules. Read-only on trips. Sees Vehicle availability. |
| `driver` | Bus / van driver | Read-only on vehicles and routes. Sees and creates only their own trips (the Driver field is auto-locked). Most logging happens through the Quicktrip QR; full login is optional. |
| `teacher` | Teacher / sponsor booking a vehicle | Submits and edits their own Trip requests. Sees Vehicle availability so they can plan around existing reservations. |
| `viewer` | Superintendent, auditor, board member | Read-only on every screen. No create / edit / delete anywhere. |

Driver-only users (`driver` role only) get row-level scoping on Trips — they only see their own.

## Architecture highlights

### Quicktrip QR flow

`GET /quicktrip/{vehicle}` is a public Livewire page behind `signed` + `throttle:quicktrip` middleware. Each vehicle has a 4-digit `quicktrip_pin` printed on the same in-cab sticker as the QR. The flow is state-aware:

- **No open trip + planned reservation within grace window** → pre-filled START form (vehicle, purpose, trip type)
- **No open trip + no reservation** → blank START form that creates a self-service reservation on submit
- **Open trip exists, this driver** → END form (odometer + ridership)
- **Open trip exists, different driver** → "Not my trip" path closes the stale trip at the current odometer, flags it for review, then starts the new driver fresh

Every quicktrip-submitted trip is `status=pending` until an admin approves it. Until approval, it doesn't count toward reimbursement totals or any dashboard widget.

The grace window for matching a scan to a planned reservation is configurable in System settings (`qr.scan_grace_minutes`, default 30).

### Approval / audit model

Every aggregation query (KSDE report, Board report, dashboard widgets, per-route / per-vehicle rollups) filters `trips.status = 'approved'`. Pending trips stay invisible to the reimbursement numbers but are visible in the main Trip log with filter tabs and per-row Approve / Reject actions.

`spatie/laravel-activitylog` is wired on every major model: Vehicle, Driver, Trip, Route, Inspection, Registration, MaintenanceRecord, User, TripReservation, AthleticEvent, Team, Student, DrugAlcoholTest, PreTripInspection, PostTripInspection. Each save writes a row to `activity_log` with the causer, the changed attributes, and old + new values. Viewable at `/admin/activity-logs`.

### Odometer auto-sync

When a Trip saves with an `end_odometer` higher than the linked Vehicle's current reading, a `Trip::saved` hook bumps `vehicles.odometer_miles` (via `saveQuietly` to avoid re-triggering activity-log noise). The maintenance widget's "miles to go" and the vehicle edit page always reflect the most recent trip without any manual reconciliation.

### Daily-route reservation materialization

Daily routes are templates, but their reservations are *materialized*: a job populates `trip_reservations` rows forward from the Route schedule so the Reservation schedule, Vehicle availability, and conflict checker see them as concrete bookings. When a driver scans the in-cab QR within the grace window of a materialized daily-route reservation, the form pre-fills from it and the reservation transitions `reserved → claimed`. If nobody claims it by the planned end, it transitions to `expired`.

### Document attachments

Polymorphic `attachments` table linked to Drivers, Vehicles, Trips, Inspections, and MaintenanceRecords. Files store under `storage/app/private/attachments/{model}/{id}/...` and are downloaded through signed URLs that expire — no public web path. Encrypted at rest if the underlying disk is encrypted.

### Runtime settings

A generic `settings` key/value table backs the System settings page. Values are cached process-wide; writes bust the cache. Used for:

- App identity (name) and timezone
- District identity (name, USD #, superintendent, board chair, address) — surfaced on Board and KSDE printouts
- Compliance warning windows (table filters: 30 days default; Board report: 60 days default)
- KSDE: default reimbursement rate, eligible-rider distance threshold (2.5 mi default)
- FMCSA §382: random drug rate (0.50), random alcohol rate (0.10)
- Operational tuning: QR scan grace minutes, athletics upcoming horizon

## Repo layout

```
/opt/edufleet
├── compose.yaml              # 4 containers: app, worker, db, redis
├── .env                      # DB password, ports, APP_URL — NOT committed
├── .env.example              # template
├── docker/
│   └── app/
│       ├── Dockerfile        # FrankenPHP 8.4 + extensions
│       └── Caddyfile
└── src/                      # Laravel app root
    ├── app/
    │   ├── Filament/
    │   │   ├── Resources/    # Vehicles, Drivers, Trips, Teams, AthleticEvents, ...
    │   │   ├── Pages/        # KsdeReport, BoardReport, DqfCompliance, ...
    │   │   └── Widgets/      # dashboard tiles
    │   ├── Livewire/         # QuickTrip (public PWA page)
    │   ├── Models/           # 24 models inc. Vehicle, Driver, Trip, Team, Setting, Attachment, ...
    │   ├── Services/         # DashboardWidgetRegistry, etc.
    │   ├── Http/Controllers/ # KsdeReportPrintController, BoardReportPrintController
    │   └── Providers/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    │       ├── RolesAndPermissionsSeeder.php
    │       ├── InspectionTemplateSeeder.php
    │       └── DemoSeeder.php
    ├── resources/
    │   └── views/
    │       ├── filament/pages/   # custom Filament page blades
    │       ├── reports/          # standalone print views (board-print, ksde-print, district header)
    │       └── livewire/         # Quicktrip
    ├── routes/web.php
    └── ...
```

## Caveats and known limitations

- **No SSO yet.** Auth is local username/password. Socialite + Google Workspace / Microsoft 365 is on the roadmap.
- **No self-serve password reset email flow.** Super-admin sets a temp password, user changes it on first login.
- **No email or SMS notifications.** Teachers don't get emailed when their request is approved or rejected; drivers don't get a message when an in-progress trip is closed for them. A Laravel notification + mail driver could plug in.
- **No calendar export.** Reservations don't push to Google Calendar / iCal.
- **Browser-print PDFs.** Both the KSDE and Board reports render via standalone print routes (auto `window.print()` on load) rather than server-side PDF generation. A `dompdf` or `browsershot` integration is straightforward to add if a non-browser PDF stream is needed (e.g. emailing the board pack).
- **No live GPS / telematics.** edufleet is not a fleet-tracking product; pair it with Samsara / Zonar / Geotab if you need real-time bus location.
- **Single-district.** No multi-tenant / co-op shared transportation between districts. Co-op support would need a `district_id` scope across the major models.
- **`ended_at` on a disowned trip is the next driver's scan time,** not the actual return time. The audit note makes this explicit, but the director should adjust if they know the real return time.
- **Demo seeder is not idempotent for some tables.** Re-running mostly truncates and re-creates demo data. Safe for demo; do not run against production data.

## Roadmap

Short-term, ordered roughly by district priority:

- **Bus discipline / behavior referrals** — driver-side write-up entry, principal-side queue.
- **Fuel log** — gallons / $ / pump / odometer per fill-up, with auto MPG by vehicle.
- **Driver training events log** — first aid, defensive driving, evacuation drills as recordable events feeding the existing expiry fields.
- **Accident / incident reports** — DOT-required form, photo attachments, insurance package export.
- **MVR pull tracking** — annual driver record review with attachment.

Larger work:

- Login hardening (rate limit, 2FA, stronger password policy, lockout backoff).
- SSO via Socialite (Google Workspace / Microsoft 365).
- Self-serve password reset email flow.
- Email + SMS notifications on approval / rejection / "closed for you" events.
- Server-side PDF generation for board / KSDE / DQF binder packets.
- Stale-reservation auto-expiry cron.
- Mobile responsiveness sweep on admin tables.

## Contributing

This is currently a single-maintainer project. Issues and pull requests are welcome but not actively triaged on a schedule. For a substantive PR (new feature, schema change), open an issue first to align on scope.

When working in the codebase locally, the conventions are:

- Filament closure parameter names must match the canonical names (`$query`, `$state`, `$record`, `$get`, `$set`) — Filament resolves by name first, and a mismatch silently builds a model-less instance.
- Custom Filament page views should use scoped `<style>` blocks with explicit `.dark` selectors rather than relying on Tailwind `dark:` utilities, since Tailwind purge doesn't always pick up custom view paths.
- Migrations involving timestamps prefer `timestamptz`; the project assumes `America/Chicago` by default and converts on the way in/out.

## License

[MIT](LICENSE) — Copyright (c) 2026 Jason Crotinger.
