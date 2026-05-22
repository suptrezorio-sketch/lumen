# Native distribution (Loadly / AppHost)

## Prerequisites

- **Apple Developer Program** ($99/year) for iOS `.ipa` (Ad Hoc or Enterprise).
- **Android**: signed `.apk` or AAB.
- Student devices: iOS **Developer Mode** enabled (Settings → Privacy & Security).

## Build with Capacitor

```bash
npm run build
npx cap sync
npx cap open ios    # or android
```

Archive in Xcode → export `.ipa` / build signed `.apk`.

## [Loadly.io](https://loadly.io/) (recommended)

- Free: unlimited uploads/downloads, up to 2GB per file.
- Upload `.ipa` / `.apk` via dashboard or API.
- Share QR + install link with class.

## [AppHost](https://appho.st/) (optional)

- Free tier: 5 apps, 50 downloads/month (see [free-for.dev](https://free-for.dev/#mobile-app-distribution-and-feedback)).
- Flutter CLI: `flutter_app_host` for automated uploads.
- Capacitor: upload manually via dashboard or Private API (`.apphost` config).

## Install guide for students (iOS)

1. Open distribution link in Safari.
2. Tap Install → allow profile.
3. Settings → General → VPN & Device Management → Trust developer.
4. Enable Developer Mode if prompted.

## Legal

LUMEN Bank is a **training simulator**, not a licensed financial institution. Do not market as a real bank in store listings.
