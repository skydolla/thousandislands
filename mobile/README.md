# Thousand Islands for iOS

The iOS app: the island map, trip details with photos, and (after signing in as the owner) adding and
editing trips, islands and photos. It talks to the web app's API at `EXPO_PUBLIC_API_URL`, so all
data rules live in one place.

Built with Expo SDK 58 and Expo Router. iOS only, dark mode only.

## Run it on your iPhone

```bash
cd mobile
nvm use 22
npm install
npx expo start      # scan the QR code with the iPhone camera; it opens in the Expo Go app
```

`mobile/.env` holds the public settings (API URL, Supabase URL and publishable key). They are
compiled into the app, the same values the web app sends to every browser. Never put a secret key here.

## Release (TestFlight)

Builds run in the cloud on EAS, so no Xcode or Mac upgrade is needed.

```bash
npx eas-cli@latest build -p ios --profile production --auto-submit   # build, then upload to TestFlight
npx eas-cli@latest update --channel production --message "…"         # ship JS-only changes without a new build
```

A new build is needed only when native settings change: `app.json`, a package with native code, or
the Expo SDK. Everything else can go out as an update. TestFlight builds expire after 90 days.

## Layout

| Path | What |
|---|---|
| `src/app/` | Routes: map (`index`), island sheet, sign-in, and the owner's `manage/` screens |
| `src/screens/` | Screen bodies rendered by the routes |
| `src/components/` | Shared UI: form rows, chips, photo pager, island search, photo manager |
| `src/lib/` | API client, Supabase session (kept in the Keychain), queries, photo resizing and upload |
