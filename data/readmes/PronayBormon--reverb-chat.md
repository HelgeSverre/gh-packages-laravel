# Laravel Reverb Chat Package

A modular, real-time chat package for Laravel powered by **Laravel Reverb**.

---

## Features

* 💬 Private & Group Chat
* ⚡ Real-time messaging (WebSocket)
* 📎 File attachments
* 🌐 API + Web UI
* 🧱 Clean and scalable architecture
* 🔌 Easy integration with any Laravel app

---

## Installation

### 1. Install via Composer

```bash
composer require twopoint0/reverb-chat
```

---

### 2. Publish Config

```bash
php artisan vendor:publish --tag=reverb-chat-config
```

---

### 3. Run Migration

```bash
php artisan migrate
```

---

### 4. Install Laravel Reverb (Required)

```bash
composer require laravel/reverb
php artisan reverb:install
```

---

### 5. Configure `.env`

```env
BROADCAST_DRIVER=reverb

REVERB_APP_ID=local
REVERB_APP_KEY=your_key
REVERB_APP_SECRET=your_secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

### 6. Run Services

```bash
php artisan reverb:start
php artisan queue:work
```

---

## ⚙️ Configuration

```php
return [
    'user_model' => App\Models\User::class,
    'user_table' => 'users',
    'api_prefix' => 'api/reverb-chat',
];
```

---

## 🌐 Routes

### 📡 API Routes

Base URL:

```
http://127.0.0.1:8000/api
```

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| POST   | /open-group              | Create or open private chat |
| POST   | /{chat}/message          | Send message using chat ID  |
| POST   | /user/{user}/message     | Send message to user        |
| GET    | /messages/{chat_id}      | Get chat messages           |
| GET    | /messages/user/{user_id} | Get messages with user      |
| GET    | /list                    | Get chat list               |

---

### 🌐 Web Routes

Base URL:

```
http://127.0.0.1:8000
```

| Method | Endpoint      | Description    |
| ------ | ------------- | -------------- |
| GET    | /message      | Chat home page |
| POST   | /chatroom     | Open chat room |
| POST   | /send-message | Send message   |

---

## 💬 API Usage

### 🔹 Open or Create Chat

```http
POST /api/chat/open-group
```

```json
{
  "user_id": 2
}
```

---

### 🔹 Send Message (Chat ID)

```http
POST /api/chat/{chat_id}/message
```

```json
{
  "message": "Hello"
}
```

---

### 🔹 Send Message (User)

```http
POST /api/chat/user/{user_id}/message
```

---

### 🔹 Get Messages

```http
GET /api/chat/messages/{chat_id}
```

---

### 🔹 Chat List

```http
GET /api/chat/list
```

---

## ⚡ Realtime Example

```js
window.Echo.channel('chat.1')
    .listen('sendMessage', (e) => {
        console.log(e.message);
    });
```

---

## 🧱 Database Tables

* chats
* chat_messages
* chat_users
* chat_message_attachments

---

## 🛠 Requirements

* PHP >= 8.2
* Laravel 11 / 12 / 13
* Laravel Reverb

---

## 🔮 Upcoming Features

* Typing indicator
* Seen / delivered system
* Online users (presence)
* Notifications
* Multi-tenant support

---

## 🤝 Contributing

Pull requests are welcome. Feel free to improve this package.

---

## 📄 License

MIT License
