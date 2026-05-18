# Conference Management System — Laravel Filament

A full-featured conference admin panel built with Laravel and Filament v3. Manages conferences, speakers, talks, and attendees — complete with charts, stats widgets, enum-based statuses, and regional filters.

## Features

- **Conference Management** — create and manage conferences with region, status, dates, and venue
- **Speaker Management** — speaker profiles with bios, qualifications, and linked talks
- **Talk Management** — talks with status workflow (pending → approved/rejected), duration, and speaker assignment
- **Attendee Tracking** — registration records with stats and chart widgets on the attendee list page
- **Enum-driven Status** — typed PHP enums for talk status (`TalkStatus`), talk length (`TalkLength`), and region (`Region`)
- **Relation Managers** — manage a speaker's talks directly from the speaker detail page
- **Dashboard Widgets** — attendee count chart and stats overview built with Filament widgets
- **Blueprint Scaffolding** — model/migration/factory generation via Laravel Blueprint

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel |
| Admin Panel | Filament v3 |
| Scaffolding | Laravel Blueprint |
| Database | MySQL |

## Admin Resources

| Resource | Manages |
|---|---|
| `ConferenceResource` | Conferences list, create, edit |
| `SpeakerResource` | Speakers list, view, create, edit + talks relation |
| `TalkResource` | Talks list, create, edit with status workflow |
| `AttendeeResource` | Attendees list, create, edit + widgets |

## Enums

```php
enum TalkStatus { Submitted, Approved, Rejected }
enum TalkLength { Lightning, Normal, Full }
enum Region { us, eu, au, uk, in }
```

## Filament Widgets

| Widget | Description |
|---|---|
| `AttendeeChartWidget` | Line/bar chart of attendee registrations over time |
| `AttendeesStatsWidget` | Total count, recent registrations, etc. |

## Installation

```bash
git clone https://github.com/Ma7moud1599/Filament_learning.git
cd Filament_learning

composer install
cp .env.example .env
php artisan key:generate

# Configure DB in .env, then:
php artisan migrate --seed

# Create admin user
php artisan make:filament-user

php artisan serve
```

Visit `/admin` to access the panel.

## Project Structure

```
app/
├── Enums/
│   ├── Region.php
│   ├── TalkLength.php
│   └── TalkStatus.php
├── Filament/
│   └── Resources/
│       ├── AttendeeResource/
│       │   ├── Pages/          # List, Create, Edit
│       │   └── Widgets/        # Chart & Stats
│       ├── ConferenceResource/
│       ├── SpeakerResource/
│       │   └── RelationManagers/TalksRelationManager.php
│       └── TalkResource/
└── Models/
    ├── Attendee.php
    ├── Conference.php
    ├── Speaker.php
    └── Talk.php
```

## License

MIT
