# NativeLab

**NativeLab** is a **[NativePHP](https://nativephp.com/) Mobile playground app** built with **Laravel + Livewire (Volt)**.
It’s designed to **fiddle with native device capabilities** (camera, dialogs, microphone, share sheet, etc.) 
in a clean, repeatable way—ideal for testing APIs, permissions, and runtime behavior in 
**[Jump](https://bifrost.nativephp.com/jump)**, an emulator, or on a real device.

Although **NativeLab** is primarily a testing playground, it can also serve as a **starter / boilerplate** for building 
a real app: it already includes navigation, a consistent UI theme, and working examples of common native integrations.

---

## Tech stack

- **Laravel 12**
- **Livewire + Volt** (Volt file-based Livewire components)
- **NativePHP Mobile v3**
- Vite for asset bundling

---

## What’s inside

NativeLab exposes a simple Home screen with sections (one per plugin / capability):

- **Camera** — take a picture and preview it
- **Browser** — open a URL in system browser or in-app browser (with optional callback)
- **Dialog** — alerts, confirms, button events, and toasts
- **Audio** — record voice and play it back
- **Share** — open the native share sheet
- **Device** — read device info and test features like vibrate/flashlight (depending on platform support)
- **Network** — check online status / connection type
- **System** — open native app settings (permissions, etc.)

---

## Requirements

- **PHP 8.4+**
- **Composer**
- **Node.js + npm**
- Native toolchain:
  - **Android**: Android Studio + Android SDK + JDK (17+) + emulator
  - **iOS**: Xcode + iOS Simulator (macOS only)

Check out the [NativePHP docs](https://nativephp.com/docs) for more info.

---

## Installation

### 1) Clone and install backend dependencies

```bash
composer install
```

### 2) Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3) Install frontend dependencies and build assets (important)

Native runtimes (Jump/emulator/device builds) expect `public/build/manifest.json` to exist.

```bash
npm install
npm run build
```

### 4) Migrate database (sqlite)

```bash
php artisan migrate
```

---

## Running in the browser (web layout)

```bash
php artisan serve
```

Open: `http://127.0.0.1:8000`

> In browser mode, the app uses a “web layout” that mimics a top bar + bottom nav (plain HTML),
> so it looks closer to the native runtime.

---

## Running in NativePHP (Jump / emulator)

### Build assets first (required)

```bash
npm run build
```

### Install / refresh native scaffolding

If you haven’t installed the native scaffolding yet (or changed app id/name):

```bash
php artisan native:install android --force
php artisan native:install ios --force
```

### Run on Android emulator

```bash
php artisan native:run android
```

### Run on iOS simulator (macOS only)

```bash
php artisan native:run ios
```

### Run with watch mode (hot-ish reload for native runtime)

Watch mode helps you iterate faster while the emulator/simulator is running:

```bash
php artisan native:run android --watch
php artisan native:run ios --watch
```

### Run with Jump (if you use Jump for iteration)

```bash
php artisan native:jump
```

> Tip: If Jump (or native runtime) throws a “manifest.json missing” error,
> it means you forgot to run `npm run build` on that machine.

---

## 📱 Building the Android App (APK)

To test the app on a physical device, you must compile the project into an APK.
This process requires that you have the **Android SDK** and **JDK 17+** installed on your machine.

### 1. Generate Build Credentials
Before packaging, you must generate the necessary signing keys. NativePHP handles this via a guided CLI tool:

```bash
php artisan native:credentials
```
*Follow the prompts to set your developer name and passwords. 
This will generate a `native-credentials.json` and a keystore file.  
**Do not share these files publicly.***

### 2. Link Storage
Ensure your public assets are correctly linked so that the app can serve icons and recorded media:

```bash
php artisan storage:link
```

### 3. Package the APK
Run the following command to compile the production-ready binary:

```bash
php artisan native:package android --build-type=release
```

### 4. Installation
Once the build completes, your APK will be located in the `dist/` or `release/` folder.
1. **Transfer:** Move the `.apk` file to your phone via USB or cloud storage.
2. **Install:** Open the file on your Android device.

> [!IMPORTANT]  
> **Sideloading:** Because this is a self-signed build, Android will show a "Blocked by Play Protect" warning.
> Tap **"More Details"** and then **"Install Anyway"** to proceed.

### Build Details
- **Runtime:** NativePHP Mobile v3.1
- **Min. Requirements:** Android 8.0 (API 26)
- **Target:** Universal APK (ARM64/X86_64)

---

## Scripts

If your project includes a Composer `setup` script, you can use:

```bash
composer setup
```

If you also have an asset helper script:

```bash
composer assets:build
```

(These scripts typically run `npm install` + `npm run build` for you.)

---

## App sections (plugins)

### Camera (`/camera`)

Tests the camera plugin:

* Open camera
* Take a photo
* Display the captured image

Plugin: `nativephp/mobile-camera`

---

### Browser (`/browser`)

Tests opening URLs:

* Open link in in-app browser
* Open link in system browser

Plugin: `nativephp/mobile-browser`

---

### Dialog (`/dialog`)

Tests dialog APIs:

* Alert dialogs (1 button)
* Confirm dialogs (Cancel/OK)
* 3-button dialogs
* Toast notifications
* Captures and displays the pressed button index/label via native events

Plugin: `nativephp/mobile-dialog`

---

### Audio (`/audio`)

Tests microphone / recording:

* Start recording
* Stop recording
* Persist recording to storage (for playback)
* Play the latest recording

Plugin: `nativephp/mobile-microphone`
(Optional helper) `nativephp/mobile-file` can be used for reliable file move/copy across platforms.

---

### Share (`/share`)

Tests the native share sheet:

* Share text / content through the OS share UI

Plugin: `nativephp/mobile-share`

---

### Device (`/device`)

Device playground:

* Display device/platform info
* Test device features (where supported), such as vibration and flashlight

Plugin: `nativephp/mobile-device`

---

### Network (`/network`)

Network playground:

* Online/offline checks
* Connection type (Wi-Fi / cellular, etc. where supported)

Plugin: `nativephp/mobile-network`

---

### System (`/system`)

System-level actions:

* Open **this app’s native settings screen** (useful after a permission was denied)

Plugin: `nativephp/mobile-system`

---

## Notes on permissions

Many native features require OS permissions (camera, microphone, etc.).
If something “does nothing” in native runtime, it’s often because the permission was denied.
Use the **System** section to open settings and enable it.

---

## Using NativeLab as a boilerplate

NativeLab is intentionally organized so you can use it as a starter project:

* A consistent UI theme (cards/buttons/layout)
* A clean “one feature per screen” structure
* Volt-based Livewire pages you can copy and adapt quickly
* Native + Web layouts (web layout mimics header/footer for easier browser dev)

A typical workflow for turning it into a real app:

1. Rename app + bundle id (see below)
2. Replace Home tiles with your product sections
3. Keep the existing plugin examples and expand from there

---

## Changing app name / app id

* Display name is commonly driven by `APP_NAME` (and/or `config/nativephp.php`)
* Application id / bundle id is typically `NATIVEPHP_APP_ID` (e.g. `com.numencode.nativelab`)

After changing these values, regenerate native scaffolding:

```bash
php artisan native:install android --force
php artisan native:install ios --force
```

Uninstall the old app from your emulator/device if you changed the app id.

---

## Useful links

NativePHP documentation:

```text
https://nativephp.com/docs
```

NativePHP Mobile docs (setup, platform requirements, running):

```text
https://nativephp.com/docs/mobile
```

---

## Preview

<p align="center">
    <img src="https://github.com/numencode/nativelab/blob/main/public/NativeLab.png?raw=true" alt="NumenCode NativeLab Screenshot" />
</p>

---

## Author

The **NumenCode NativeLab** is created by [Blaz Orazem](https://orazem.si/).

For inquiries, contact: info@numencode.com

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
