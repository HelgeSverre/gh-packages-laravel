# laravel-hexa-package-instagram

Dedicated Instagram package for Hexa.

## Main flow

1. Open **Accounts** and save one or more Instagram browser profiles with usernames and passwords.
2. Click **Log in with saved credentials** on the account you want to attach.
3. Open **Settings** and save the default usernames plus the optional Meta oEmbed token.
4. Run the **Full Connection Test** to confirm the active browser profile is really authenticated.
5. Use **Raw Workspace** to test profile scans, story pulls, public post import, and worker logs.

## Included surfaces

- `/instagram`
- `/instagram/accounts`
- `/settings/instagram`
- `/instagram/raw`

## Package ownership

This package owns:

- attached Instagram browser accounts
- optional Meta oEmbed token
- Instagram connection testing
- raw profile/story/post debugging
- the shared Instagram post import service used by other packages

It builds on `laravel-hexa-package-browser-worker` for the generic browser runtime and persistent session handling.
