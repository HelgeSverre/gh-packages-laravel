# laravel-appointments

### **Overview**

This document is a comprehensive guide for the **`laravel-appointments`** Laravel package, designed for scheduling, managing, and tracking appointments.

### **Setup and Installation**

- **Installation**:

    ```bash
    composer require redberry/laravel-appointments
    ```

- **Publish Configuration** (if applicable):

    ```bash
    php artisan vendor:publish --tag="laravel-appointments-config"
    ```

- **Database Migration**:

    ```bash
    php artisan migrate
    ```


### **Core Functionalities**

### Using the Appointment Facade

1. **Schedule an Appointment**
    - Schedule an appointment for a user at a specified timestamp.

    ```php
    use Redberry\Appointments\Facades\Appointment;
    
    Appointment::with($doctor)->for($user)->schedule(at: $timestamp);
    ```

2. **Reschedule an Appointment**
    - Change the time of an existing appointment.

    ```php
    Appointment::for($user)->reschedule(at: $timestamp);
    ```

3. **Cancel an Appointment**
    - Cancel a scheduled appointment.

    ```php
    Appointment::for($user)->cancel();
    ```

4. **Retrieve Available Dates**
    - Get dates with available appointment slots.

    ```php
    $availableDates = Appointment::availableDates();
    ```

5. **Retrieve Booked Dates**
    - Get dates with no available appointment slots.

    ```php
    $bookedDates = Appointment::bookedDates();
    ```

6. **Available Time Slots for a Date**
    - Get available time slots for a specific date.

    ```php
    $availableTimeSlots = Appointment::date($date)->availableTimeslots();
    ```

7. **Booked Time Slots for a Date**
    - Get booked time slots for a specific date.

    ```php
    $bookedTimeSlots = Appointment::date($date)->bookedTimeslots();
    ```


### **Events**

### Available Events

The package fires several events related to appointment activities:

1. **AppointmentScheduled**
2. **AppointmentReschedule**
3. **AppointmentCanceled**

### Registering Event Listeners

Developers can listen to these events in their application's **`EventServiceProvider`**:

```php
protected $listen = [
    \Redberry\Appointments\Events\AppointmentScheduled::class => [
        \App\Listeners\HandleAppointmentScheduled::class,
    ],
    \Redberry\Appointments\Events\AppointmentRescheduled::class => [
        \App\Listeners\HandleAppointmentRescheduled::class,
    ],
    \Redberry\Appointments\Events\AppointmentCanceled::class => [
        \App\Listeners\HandleAppointmentCanceled::class,
    ],
];
```

### **Testing**

- Pest

### **Development and Contributions**

- Instructions for contributing to the package, including coding standards and pull request processes.

### **Future Plans and Feedback**

- Outline of planned features and enhancements, and an invitation for community feedback and suggestions.
