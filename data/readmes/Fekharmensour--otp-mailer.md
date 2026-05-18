# otp-mailer

Standalone OTP mailer package for Laravel — send one-time passwords (OTP) to user emails.

Installation
--

1. Require the package via Composer:

```bash
composer require fekharmensour/otp-mailer
```

2. (Optional) If your app does not auto-discover packages, register the service provider and alias in `config/app.php`:

- Provider: `Fekharmensour\OtpMailer\OtpMailerServiceProvider`
- Alias: `OtpMailer` => `Fekharmensour\OtpMailer\Facades\OtpMailer`

Publish configuration
--

The package ships a config file. Publish it with this command:

```bash
php artisan vendor:publish --provider="Fekharmensour\OtpMailer\OtpMailerServiceProvider" --tag=config
```

This will copy `config/otp-mailer.php` to your application's config folder. You can also copy `config/otp-auth.php` from the package if you need the legacy compatibility file.

Environment / SMTP setup
--

The package sends emails using Laravel's mail system. Add your SMTP credentials to `.env`. For example (Gmail app password):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=youremail@gmail.com
MAIL_FROM_NAME="Your App"
```

Note: For Gmail use an App Password (requires 2FA). Replace `your_app_password` with that app password.

Usage (simple route)
--

The package exposes a facade `OtpMailer` (and backward-compatible `OtpAuth`). Use `generateAndSend(string $email)` to create and email a 6-digit OTP, and `validate(string $email, string $code)` to validate it.

Example route (routes/web.php):

```php

use Fekharmensour\OtpMailer\Facades\OtpMailer;
use Illuminate\Http\Request;

Route::get('/send-otp', function () {
	$email = 'user@example.com';
	$code = OtpMailer::generateAndSend($email);

	return "OTP sent to {$email}"; // do not reveal the code in production
});

Route::post('/verify-otp', function (\\Illuminate\\Http\\Request $request) {
	$email = $request->input('email');
	$code = $request->input('code');

	$valid = OtpMailer::validate($email, $code);

	return response()->json(['valid' => $valid]);
});
```

Usage (controller)
--

In a controller you can call the same facade methods:

```php
use Fekharmensour\OtpMailer\Facades\OtpMailer;

public function send(Request $request)
{
	$email = $request->input('email');
	OtpMailer::generateAndSend($email);

	return back()->with('status', 'OTP sent');
}
```

Configuration
--

Open `config/otp-mailer.php` to change TTL, cache prefix, or the Notification class used to send the email. The default notification class is `Fekharmensour\\OtpMailer\\Notifications\\OtpNotification`.

Troubleshooting
--

- Ensure your mail settings in `.env` are correct and that the app can send mail (try `php artisan tinker` + `\\Mail::raw('test', function($m){$m->to('you@example.com')->subject('test');});`).
- For Gmail use an App Password and enable the correct security settings.

License
--

MIT
