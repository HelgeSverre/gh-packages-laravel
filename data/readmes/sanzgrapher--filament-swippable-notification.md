# Swippable Notification

A Filament package that adds swipe-to-close functionality to **all Filament notifications** - both popup toast notifications and database notifications. Swipe left or right to dismiss with a smooth animation.

![Swippable Notification](./resources/swippable-notification.png)

## Features

- Swipe notifications to dismiss them (80px threshold)
- Full mobile support with touch events
- Desktop support with mouse drag
- Works on BOTH popup and database notifications
- Visual cursor feedback (grab cursor while dragging)
- Zero configuration needed
- Auto-initializes on all notifications
- Smooth animations and transitions
- Non-intrusive - respects existing Filament styling

## Installation

```bash
composer require sanzgrapher/swippable-notification
```

## Usage

Register the plugin in your Filament `PanelProvider`:

```php
use Sanzgrapher\SwippableNotification\SwippableNotification;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            // ... other configuration ...
            ->plugins([
                SwippableNotification::make(),
            ]);
    }
}
```

That's it! All Filament notifications will now support swipe-to-close functionality.

## Notification Types Supported

### 1. Popup Toast Notifications

Standard Filament notifications that appear as toasts:

```php
Notification::make()
    ->title('Success!')
    ->body('Your action was completed successfully.')
    ->success()
    ->send();
```

### 2. Database Notifications

Filament database notifications in the notification modal:

```php
use Filament\Notifications\Notification;

$recipient = auth()->user();

Notification::make()
    ->title('Important Update')
    ->body('You have a new message')
    ->success()
    ->persistent()
    ->sendToDatabase($recipient);
```

## How It Works

The package automatically:

1. Detects all Filament notification elements (`.fi-no-notification` for popups)
2. Detects database notifications inside modals (`[x-data*="notificationComponent"]`)
3. Attaches touch and mouse event listeners
4. Tracks swipe/drag distance in real-time with visual cursor feedback
5. Closes notifications when swiped > 80px
6. Monitors for dynamically added notifications
7. Applies smooth animations during the swipe

## How to Swipe

**On Desktop:**

- Hover over notification → see **grab cursor** 🖐️
- Click and drag left or right → notification follows
- Drag > 80px → notification closes smoothly
- Drag < 80px → snaps back

**On Mobile:**

- Swipe left or right → works just like desktop drag
- Swipe > 80px → notification closes
- Swipe < 80px → snaps back

## Visual Feedback

- **Grab cursor**: Shows when hovering over notification (indicates it's swipeable)
- **Grabbing cursor**: Shows while actively dragging
- **While dragging**: Notification follows your finger/cursor with opacity fade
- **Closing**: Smooth slide-out animation with fade
- **Dragging class**: `.swippable-notification-dragging` applied to element
- **Closing class**: `.swippable-notification-closing` applied to element

## Customization

### Adjust Swipe Sensitivity

To change the swipe threshold, edit `init-swippable.js`:

```javascript
threshold: 80,  // pixels needed to trigger close (increase for less sensitive)
```

### Opacity Fade Speed

Adjust how quickly the notification fades while dragging:

```javascript
this.el.style.opacity = `${Math.max(0, 1 - Math.abs(this.currentX) / 300)}`;
// Adjust 300 for different fade speeds
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile, Android Firefox)

## Troubleshooting

### Notifications aren't swiping

1. Clear your browser cache
2. Make sure the plugin is registered in your `PanelProvider`
3. Check that JavaScript is enabled
4. Verify notifications are rendering with correct Filament classes

### Database notifications not swiping

Make sure you're using Filament's `DatabaseNotification` class, not Laravel's standard notifications.

### Cursor not changing to grab

Make sure your CSS is loading properly. Check browser console for any CSS errors.

### Conflicts with other packages

This package is designed to be non-invasive and work alongside other Filament plugins. It only adds event listeners to notifications without modifying their structure.

## Examples

### Popup Toast Notification (Swipeable)

```php
use Filament\Notifications\Notification;

Notification::make()
    ->title('Success!')
    ->body('Your record was saved.')
    ->success()
    ->send();
```

### Database Notification (Swipeable)

```php
use Filament\Notifications\DatabaseNotification;

DatabaseNotification::create([
    'user_id' => auth()->id(),
    'title' => 'New Message',
    'body' => 'You have received a new message.',
]);
```

Both will have swipe-to-close functionality automatically!

## License

MIT

---

**Author:** Narayan Dhakal (sanzgrapher)
**Email:** narayandhakal09@duck.com
