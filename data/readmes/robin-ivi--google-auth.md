# 🚀 Laravel Google Auth Package

Simple & plug-and-play Google Login package for Laravel using Socialite.
Just install, add `.env` keys, and you're ready to go🔥

---

## 📦 Features

* ✅ Google Login (OAuth 2.0)
* ✅ Auto User Registration
* ✅ Session-based Authentication
* ✅ Minimal Setup (Only `.env`)
* ✅ Clean & Lightweight Package

---

## 🛠️ Installation

### Step 1: Install via Composer

```bash
composer require robin-ivi/google-auth
```

---

### Step 2: Install Socialite

```bash
composer require laravel/socialite
```

---

## ⚙️ Configuration

### Step 3: Add Google Credentials in `.env`

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

---

### Step 4: Update `config/services.php`

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

---

### Step 5: Clear Config Cache

```bash
php artisan config:clear
php artisan cache:clear
```

---

## 🔑 Google Console Setup

Go to Google Cloud Console:

* Create OAuth Client ID
* Application Type: Web Application

### Add Authorized Redirect URI:

```
http://127.0.0.1:8000/auth/google/callback
```

⚠️ Note:

* `.test` domains are NOT supported
* Use `localhost` or real domain only

---

## 🚀 Usage

### Visit the login route:

```
http://127.0.0.1:8000/auth/google
```

---

## 🔄 Available Routes

| Route                   | Description        |
| ----------------------- | ------------------ |
| `/auth/google`          | Redirect to Google |
| `/auth/google/callback` | Handle callback    |

---

## 👤 How It Works

1. User clicks Google Login
2. Redirects to Google
3. User authenticates
4. Callback receives user data
5. User is created (if not exists)
6. User is logged in automatically

---

## 🧪 Testing

Run the Laravel server:

```bash
php artisan serve
```

Then open:

```
http://127.0.0.1:8000/auth/google
```

---

## ❗ Common Issues & Fixes

### 1. Session store not set

✔ Use `web` middleware

---

### 2. invalid_client (401)

✔ Check Client ID / Secret
✔ Check Redirect URI exact match

---

### 3. Invalid redirect domain

❌ `.test` not allowed
✔ Use `127.0.0.1` or real domain

---

## 📁 Package Structure

```
src/
 ├── Controllers/
 │   └── GoogleController.php
 ├── routes/
 │   └── web.php
 ├── GoogleAuthServiceProvider.php
```

---

## 🔥 Future Updates

* 🔹 Multiple Providers (Facebook, GitHub)
* 🔹 API Support (JWT)
* 🔹 Role-based Redirect
* 🔹 Avatar Storage

---

## 🤝 Contributing

Pull requests are welcome!
For major changes, open an issue first.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Krishna Mishra
GitHub: https://github.com/robin-ivi

---

## ⭐ Support

If you like this package, give it a star ⭐ on GitHub!
