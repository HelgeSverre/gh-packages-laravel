# Laravel DKIM

A drop-in Laravel package that automatically signs all outgoing emails with DKIM. No changes to your existing Mailables, Notifications, or any mail-sending code required — just install, configure your key, and every email gets signed transparently.

Uses Symfony's built-in `DkimSigner` under the hood.

## Installation

```bash
composer require shaffe/laravel-dkim
```

The service provider is auto-discovered via the `composer.json` extra configuration.

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=dkim-config
```

Add these variables to your `.env`:

```env
DKIM_ENABLED=true
DKIM_PRIVATE_KEY=/path/to/your/private.key
DKIM_DOMAIN=example.com
DKIM_SELECTOR=my-selector
DKIM_PASSPHRASE=
```

`DKIM_PRIVATE_KEY` accepts either a path to a PEM key file or the raw PEM key as a string.

## Choosing a Selector

We recommend using a custom selector instead of `default`. The default DKIM key (`default._domainkey.example.com`) is often managed by your hosting panel (Plesk, cPanel, etc.) and may be regenerated during system upgrades or configuration changes — which would silently break your application's DKIM signing.

Using a dedicated selector like `laravel`, or `app-mail` gives you several advantages:

- Your key is independent from the system-managed one and won't be affected by server-side changes.
- It clearly identifies the source of signed emails (useful when multiple services send from the same domain).
- You can rotate or revoke the key without impacting other services.

## Key Generation

Generate a dedicated key pair for your selector:

```bash
openssl genrsa -out my-selector.dkim.private 2048
openssl rsa -in my-selector.dkim.private -out my-selector.dkim.public -pubout -outform PEM
```

## DNS Setup

Add a TXT record for your selector on the sending domain:

```
my-selector._domainkey.example.com  IN  TXT  "v=DKIM1; k=rsa; s=email; p=<your_public_key_base64>"
```

The `p=` value is the content of your public key file, without the `-----BEGIN/END PUBLIC KEY-----` lines and without line breaks.

## Verifying Your DNS Record

You can verify that your DKIM DNS record is correctly set up using [MXToolbox](https://mxtoolbox.com/SuperTool.aspx):

```
https://mxtoolbox.com/SuperTool.aspx?action=dkim:example.com:my-selector&run=toolpage
```

Replace `example.com` with your domain and `my-selector` with your chosen selector.

## How It Works

The package hooks into Laravel's mail pipeline by listening to `\Illuminate\Mail\Events\MessageSending`. This event fires right before any email is handed off to the transport, so every email sent through Laravel's mailer (Mailables, Notifications, `Mail::raw()`, etc.) is automatically signed — without touching a single line of your existing code.
