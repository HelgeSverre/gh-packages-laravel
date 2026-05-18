# wyxos/laravel-mail-provision

Provision SparkPost sending/tracking domains and Cloudflare DNS records, and optionally configure SparkPost SMTP mail settings in your `.env`.

## Install

```bash
composer require wyxos/laravel-mail-provision
```

## Required Env

- `CLOUDFLARE_API_TOKEN`
- Either `CLOUDFLARE_ZONE_ID` or `CLOUDFLARE_ZONE_NAME` (otherwise it will infer a zone name from the last 2 labels of your domain)
- SparkPost API key (one of):
  - `SPARKPOST_PROVISIONING_KEY`
  - `SPARKPOST_API_KEY`
  - `MAIL_PASSWORD`

## Usage

Provision using `APP_DOMAIN` (or `APP_URL` host) when the domain argument is omitted:

```bash
php artisan mail:provision-domain
```

Provision an explicit domain:

```bash
php artisan mail:provision-domain nudge.example.com
```

By default, the command updates your env file with SparkPost SMTP settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sparkpostmail.com
MAIL_PORT=587
MAIL_USERNAME=SMTP_Injection
MAIL_PASSWORD=<API_KEY>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@<your-domain>
MAIL_FROM_NAME="${APP_NAME}"
```

Options:

- `--api-key=` Provide SparkPost API key (used for provisioning and written to `MAIL_PASSWORD` when configuring env)
- `--no-env` Skip writing env mail settings
- `--env-file=` Override env file path to update
- `--tracking=` Override tracking domain (defaults to `sp.<domain>`)
- `--skip-spf`, `--skip-dmarc` Skip those TXT records

## Notes

- Packagist versions should be managed via git tags (e.g. v0.1.1).

