# Laravel AMI Toolkit

🚀 **Laravel AMI Toolkit** is a powerful, developer-friendly Laravel package for seamless integration with the **Asterisk Manager Interface (AMI)**.

It provides clean abstractions and expressive APIs to connect to Asterisk, listen to AMI events, and send manager commands — all while staying idiomatic to Laravel’s ecosystem.

This package is designed for **real-time**, **event-driven** telephony applications such as CRMs, call centers, monitoring dashboards, and VoIP-based services.

---

## ✨ Features

* 🔌 Persistent and configurable connection to Asterisk AMI
* 📡 Listen to real-time AMI events (Dial, Hangup, Queue, etc.)
* ⚡ Send AMI actions (Originate, Hangup, Ping, Command, …)
* 🧩 Laravel Event & Listener integration
* 🧪 Testable architecture with mockable components
* 🛠️ Clean, extensible, and well-structured codebase
* 🔒 Secure authentication handling
* 📦 Laravel auto-discovery support

---

## 📦 Installation

Install the package via Composer:

```bash
composer require khody2012/laravel-ami-toolkit
```

---

## ⚡ Requirements

* PHP 8.1+
* Laravel 9.x, 10.x, 11.x, 12.x

---

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=ami-config
```

This will create `config/ami.php`.

### Example configuration

```php
return [
    'host' => env('AMI_HOST', '127.0.0.1'),
    'port' => env('AMI_PORT', 5038),
    'username' => env('AMI_USERNAME'),
    'password' => env('AMI_PASSWORD'),
    'timeout' => 5,
    'auto_reconnect' => true,
];
```

Add the following variables to your `.env` file:

```env
AMI_HOST=127.0.0.1
AMI_PORT=5038
AMI_USERNAME=admin
AMI_PASSWORD=secret
```

---

## 🚀 Basic Usage

### Connecting to Asterisk AMI

```php
use Khody2012\LaravelAmiToolkit\Facades\Ami;

Ami::connect();
$response = Ami::ping();

if ($response->isSuccess()) {
    // Connection alive
}
```

---

## 📞 AMI Actions

### Originate a Call

```php
Ami::originate([
    'Channel'  => 'SIP/1000',
    'Context'  => 'default',
    'Exten'    => '1001',
    'Priority' => 1,
    'Timeout'  => 30000,
]);
```

### Execute a raw AMI command

```php
Ami::command('sip show peers');
```

---

### Available Events (examples)

* `AmiDialEvent`
* `AmiHangupEvent`
* `AmiNewChannelEvent`
* `AmiQueueMemberEvent`
* `AmiBridgeEvent`

> You can easily extend or map new AMI events.

---

## 🧩 Architecture Overview

* **Connection Layer** – Handles socket communication and authentication
* **Action Layer** – Encapsulates AMI actions
* **Event Layer** – Maps AMI events to Laravel events
* **Facade API** – Clean developer-facing interface

This layered design keeps the package **maintainable**, **testable**, and **extensible**.


---

## 🔐 Security Notes

* Credentials are never logged
* Supports environment-based configuration
* Connection timeouts and reconnection strategies included

---

## 🛣️ Roadmap

* [ ] Async / non-blocking event loop
* [ ] Queue-based event handling
* [ ] Horizon & WebSocket integration
* [ ] Dashboard helpers
* [ ] Full API documentation website

---

## 🤝 Contributing

Contributions are welcome ❤️

1. Fork the repository
2. Create a feature branch
3. Write tests
4. Submit a pull request

---

## 📄 License

This package is open-sourced software licensed under the **MIT license**.

---

## 🏷️ Keywords

`laravel`, `asterisk`, `ami`, `voip`, `pbx`, `telephony`, `event-driven`, `call-center`, `realtime`
