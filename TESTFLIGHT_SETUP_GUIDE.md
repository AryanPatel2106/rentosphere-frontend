# Rentosphere iOS & Apple TestFlight Setup Guide

This guide explains how to build the Rentosphere iOS application using **CapacitorJS** and automatically deploy it to **Apple TestFlight**.

---

## 1. Project Configuration Overview

- **Capacitor Configuration**: [`capacitor.config.json`](./capacitor.config.json)
- **App ID (Bundle Identifier)**: `com.rentosphere.app`
- **App Name**: `Rentosphere`
- **Native iOS Project Location**: `ios/App/App.xcodeproj`
- **Automated CI/CD Workflow**: [`.github/workflows/deploy-testflight.yml`](./.github/workflows/deploy-testflight.yml)

---

## 2. Prerequisites in Apple Developer Account

To host your app on TestFlight, you need an active [Apple Developer Program](https://developer.apple.com/) account ($99/year).

### A. Register the Bundle ID
1. Log into [Apple Developer Portal &rarr; Identifiers](https://developer.apple.com/account/resources/identifiers/list).
2. Click **+** &rarr; **App IDs** &rarr; Select **App**.
3. **Description**: `Rentosphere`
4. **Bundle ID**: `com.rentosphere.app` (Explicit)
5. Click **Continue** &rarr; **Register**.

### B. Create an App in App Store Connect
1. Log into [App Store Connect &rarr; Apps](https://appstoreconnect.apple.com/apps).
2. Click **+** &rarr; **New App**.
3. Select **iOS**.
4. **Name**: `Rentosphere`
5. **Primary Language**: `English (US)`
6. **Bundle ID**: Select `com.rentosphere.app`.
7. **SKU**: `rentosphere-ios-app`
8. Click **Create**.

---

## 3. GitHub Secrets Configuration (For Automated TestFlight Uploads)

In your GitHub repository ([AryanPatel2106/rentosphere-frontend](https://github.com/AryanPatel2106/rentosphere-frontend)), go to **Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret** and add the following:

| Secret Name | Description | Where to get it |
|---|---|---|
| `APP_STORE_CONNECT_KEY_ID` | App Store Connect API Key ID (e.g. `2X9R4HXF34`) | App Store Connect &rarr; Users and Access &rarr; Integrations &rarr; App Store Connect API |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect Issuer ID UUID | App Store Connect &rarr; Users and Access &rarr; Integrations |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Contents of `AuthKey_XXXXXX.p8` private key file | Generated when creating API Key above |
| `BUILD_CERTIFICATE_BASE64` | Base64-encoded Apple Distribution Certificate (`.p12`) | Exported from Mac Keychain (`base64 -w 0 cert.p12` on Linux/Mac) |
| `P12_PASSWORD` | Password used when exporting your `.p12` certificate | Password you set during export |
| `BUILD_PROVISION_PROFILE_BASE64` | Base64-encoded App Store Provisioning Profile | Downloaded from Apple Developer Portal (`base64 -w 0 profile.mobileprovision`) |

> [!TIP]
> How to base64-encode your certificate and provisioning profile:
> ```bash
> # On Linux or macOS:
> base64 -w 0 distribution_cert.p12 > cert_base64.txt
> base64 -w 0 Rentosphere_AppStore.mobileprovision > profile_base64.txt
> ```

---

## 4. Triggering the TestFlight Build

Once the secrets are added to GitHub:
1. Open your repository on GitHub.
2. Click on the **Actions** tab.
3. Select **"Deploy iOS App to Apple TestFlight"** from the left sidebar.
4. Click **Run workflow** &rarr; Select branch `main` &rarr; Click **Run workflow**.
5. The macOS runner on GitHub will:
   - Compile the React application and sync Capacitor.
   - Archive and code-sign the Xcode project.
   - Upload the `.ipa` directly to **Apple TestFlight**.
   - Within 5–15 minutes, the build will appear under **TestFlight** in App Store Connect for external and internal testers.

---

## 5. Testing Locally on a Mac (Optional)

If you or a team member have a Mac:
```bash
# 1. Clone or pull the repository
git pull origin main

# 2. Build web assets and sync native iOS project
npm run cap:build

# 3. Open Xcode
npm run cap:ios
```
Inside Xcode, select your simulator (e.g. iPhone 15 Pro) or a plugged-in physical iPhone and press **Run** (Cmd + R).
