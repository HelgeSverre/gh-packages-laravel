# Laravel Post-Login Redirect Guard

A small, focused helper for Laravel auth: drops a stale `url.intended`
session value when the just-authenticated user cannot reach the
captured URL — so `redirect()->intended($default)` falls through to a
safe destination instead of dead-ending on a 404.

The core class is `IntendedUrlGuard`.

## The problem

Laravel's auth middleware writes the originally-requested URL into the
session under `url.intended` when an unauthenticated request hits a
protected route. The auth controllers later replay that URL via
`redirect()->intended()`.

The pattern is fine for a single user, but it fails when sessions
turn over across users on the same browser:

1. User A is signed in and viewing `/app/workspaces/42/edit`.
2. User A's session expires (or they close the tab without logging out).
3. The browser reloads the page. The auth middleware sees a guest
   request and stamps `url.intended` with `/app/workspaces/42/edit` in
   a brand-new session.
4. User B sits down at the same browser and logs in.
5. `redirect()->intended()` bounces user B to
   `/app/workspaces/42/edit` — a workspace they do not own.
6. The route's ownership check fires `abort(404)`. User B lands on a
   dead end with no obvious recovery.

`IntendedUrlGuard` runs on a successful login, inspects the captured
URL, and removes it whenever the just-authenticated user could not
reach it. The auth controller's `redirect()->intended($default)` then
sends user B to the dashboard instead.

## Threat model — when this matters

The guard is most valuable when:

- Multiple users share devices (kiosks, family computers, support
  staff handing terminals back and forth).
- Sessions are short-lived and silent reloads are common.
- Per-user resources are exposed under stable, guessable paths
  (`/app/workspaces/{id}`, `/app/documents/{uuid}`).

It is **not** a replacement for route-level authorization — the route
should still verify ownership and `abort(404)` on cross-user access.
The guard is an ergonomic layer on top of that: it prevents the
inevitable 404 from being the *first* thing a freshly-logged-in user
sees.

The contract is intentionally conservative: drop the intended URL on
any mismatch (deleted resource, different owner, malformed id,
foreign host). Better to send the user to a safe default than to
replay a URL that is even slightly suspect.

## Usage

```php
use Acme\IntendedUrlGuard\IntendedUrlGuard;

class LoginController
{
    public function __construct(
        private readonly IntendedUrlGuard $guard,
    ) {}

    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Inspect the captured URL against the just-authenticated user
        // and clear it if it points at a resource they cannot reach.
        $this->guard->sanitize($request, $request->user());

        return redirect()->intended(route('dashboard'));
    }
}
```

## Integration notes

- Call `sanitize()` **after** `Auth::login()` (or `$request->authenticate()`)
  but **before** `redirect()->intended()`. The just-authenticated user
  must already be resolvable on the request.
- The guard reads and writes the session via `$request->session()`,
  so the session middleware must have run.
- Add lookup implementations that map the URL shapes your app exposes
  (workspaces, documents, projects, tenants, …) to your domain models.
  See `Contracts/WorkspaceLookup.php` and `Contracts/DocumentLookup.php`.

## Adding a new URL shape

Each protected per-user URL pattern needs three things:

1. A regex branch in `IntendedUrlGuard::isReachableBy()` that pins the
   path shape (numeric id, UUID, slug, …).
2. A lookup interface that returns the resource (or `null`) by id.
3. An ownership check on the resource — typically
   `(string) $resource->ownerId === (string) $user->getAuthIdentifier()`.

The default branch returns `true`, meaning unrecognized paths are
considered safe to replay. That's correct for user-agnostic surfaces
(the dashboard, index pages, the create form) but it does mean a new
per-user URL pattern needs to be added explicitly — silently failing
*open* on an unrecognized owned resource is the wrong default for
this code, so any new owned-resource shape should land here in the
same change as the route.

## Limitations / non-goals

- **Single-guard scope.** The sample uses a single `Authenticatable`.
  Apps with multiple guards (e.g. customer + admin) need to route
  through the matching guard's user; that branching is omitted here
  for clarity.
- **Eloquent decoupling.** The lookup interfaces sit between the
  guard and your models. Real callers typically wrap an Eloquent
  query in a one-method adapter (`return Workspace::find($id);`).
- **Not a CSRF or open-redirect defense.** Laravel already enforces
  same-origin on the cookie's session, and the guard's foreign-host
  check is belt-and-suspenders for the URL shape, not a substitute
  for the framework's CSRF protections.
- **Whitelist over blacklist.** The guard does not try to detect
  "dangerous" URLs by pattern. It only allows replays it can
  positively verify the user owns, plus user-agnostic paths outside
  the per-user URL shapes.

## Tests

```bash
composer install
vendor/bin/phpunit
```

The test suite uses `Illuminate\Http\Request` with
`Illuminate\Session\ArraySessionHandler` so it runs without booting
a full Laravel application — useful when wiring the guard into a
non-Laravel project that pulls in only the relevant Illuminate
packages.

---

*Author: [Maxim Popelnitskiy](https://github.com/Gegirhasut). Extracted from a larger Laravel codebase; refer to tests for usage patterns.*