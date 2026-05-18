# Habits Tracker

A personal habit-tracking web application built with Laravel 12. Designed to help you define, organize, and consistently log your habits over customizable periods and units.

---

## Project Overview

Habits Tracker allows you to:

- **Define Habit Categories**: Group related habits (e.g., Health, Learning, Productivity).
- **Create Custom Habits**: Specify name, icon, target value, unit (times, pages, cups, steps, hours, etc.), and recurrence period (daily, weekly, monthly, quarterly, yearly).
- **Track Progress**: Log each habit occurrence with a timestamp and optional notes; visualize completion history and streaks.

---

## Architecture & Components

- **Laravel 12 Backend**: Follows a service-repository pattern, leveraging Form Request validation and policy-based authorization.
- **Livewire 3 Frontend**: Each interactive element (habit list, entry form, summary charts) is a Livewire component for real-time UI updates without full page reloads.
- **Volt UI Theme**: A minimal, responsive design powered by Volt (Tailwind CSS + DaisyUI) ensures mobile and desktop friendliness.
- **Notification Pipeline**:
    - **Scheduler**: Schedules `NotificationsSummaryJob` at 23:35 via Laravel’s Cron.
    - **Queue Worker**: Processes jobs through Laravel Horizon, dispatching Pushover notifications to users.
- **Data Handling**:
    - **Spatie Laravel Data**: Ensures type-safe data transfer between controllers and views.
    - **Spatie Sluggable**: Automatically generates URL-friendly slugs for habit categories and entries.

---

## Data Model

- **User**: Has many Categories and Habit Entries. Supports invitation-based registration.
- **Category**: Belongs to a User. Groups multiple Habits.
- **Habit**: Belongs to a Category. Defines target value, unit, period, and default icon.
- **Entry**: Belongs to a Habit (and User indirectly). Records value, timestamp, and note.
- **Invitation**: Contains token, email, and expiration; used for onboarding new collaborators.

---

## Background Jobs

- **NotificationsSummaryJob**: Dispatches a Pushover notification at 23:35 to the admin with a summary of the requested invitations.

---

## Customization & Extensibility

- **Units & Periods**: Easily extendable via their Models to add new units (e.g., kilometers) or periods (e.g., bi-weekly).
- **Notification Channels**: Swap Pushover for email, Slack, or SMS by implementing `App\Notifications\DailySummary` channels.
- **UI Theming**: Modify `resources/css/variables.css` or swap Volt with another Tailwind UI kit.

---

## Future Roadmap

- **Receive Reminders**: Automated jobs to generate daily summary notifications (via Pushover) to keep you accountable.
- **Social Sharing**: Enable users to share habit achievements on social platforms.
- **Analytics Dashboard**: Add insights like monthly trends, habit correlations, and AI-driven recommendations.

---

## License

This project is licensed under the [CC BY-NC-SA 4.0 License](LICENSE).

