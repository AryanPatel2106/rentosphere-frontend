# Rentosphere iOS App & Apple TestFlight Deployment Guide

This guide provides complete, step-by-step instructions for building the **Rentosphere** iOS app using **CapacitorJS** and publishing it to **Apple TestFlight**.

---

## 1. Architecture & Setup Overview

- **App ID (Bundle Identifier)**: `com.rentosphere.app`
- **Display Name**: `Rentosphere`
- **Web App Directory**: `dist` (built with Vite React)
- **Native iOS Project**: `ios/App/App.xcodeproj`
- **Capacitor Configuration**: [`capacitor.config.json`](./capacitor.config.json)
- **Automated CI/CD Workflow**: [`.github/workflows/deploy-testflight.yml`](./.github/workflows/deploy-testflight.yml)
- **Privacy Manifest**: [`ios/App/App/PrivacyInfo.xcprivacy`](./ios/App/App/PrivacyInfo.xcprivacy) (Apple 2024+ Compliance)
- **Encryption Exemption**: Configured with `ITSAppUsesNonExemptEncryption = false` in `Info.plist` (bypasses manual compliance prompts on every build)

---

## 2. Prerequisites: Apple Developer Account Setup

To deploy any app to TestFlight, you need an active [Apple Developer Program](https://developer.apple.com/) account ($99/year).

### Step 2.1: Register the Bundle Identifier
1. Go to the [Apple Developer Portal &rarr; Identifiers](https://developer.apple.com/account/resources/identifiers/list).
2. Click the blue **+** button.
3. Select **App IDs** and click **Continue**.
4. Select type **App** and click **Continue**.
5. Fill in:
   - **Description**: `Rentosphere`
   - **Bundle ID**: Select **Explicit** and enter `com.rentosphere.app`
6. Under Capabilities, leave standard defaults (or enable Push Notifications if needed).
7. Click **Continue** &rarr; **Register**.

### Step 2.2: Create the App Record in App Store Connect
1. Navigate to [App Store Connect &rarr; Apps](https://appstoreconnect.apple.com/apps).
2. Click the **+** button &rarr; **New App**.
3. Fill in the modal:
   - **Platforms**: Check **iOS**
   - **Name**: `Rentosphere`
   - **Primary Language**: `English (US)` (or preferred)
   - **Bundle ID**: Select `com.rentosphere.app` from the dropdown
   - **SKU**: `rentosphere-ios` (unique internal identifier)
   - **User Access**: `Full Access`
4. Click **Create**.

---

## 3. Path A: Automated Cloud Build & Upload (No Mac Needed)

Because native iOS compilation (`xcodebuild` / `.ipa`) requires macOS, you can build and ship directly from your Linux environment using the automated **GitHub Actions macOS Runner** configured in this repository.

### Step 3.1: Generate App Store Connect API Key
1. In [App Store Connect](https://appstoreconnect.apple.com/), go to **Users and Access &rarr; Integrations &rarr; App Store Connect API**.
2. Click **+** (Generate API Key).
3. **Name**: `GitHub Actions TestFlight`
4. **Access**: Select **App Manager** or **Admin**.
5. Click **Generate**.
6. Note down the **Key ID** and the **Issuer ID** (at the top of the page).
7. Download the `.p8` private key file (e.g. `AuthKey_XXXXXXXXXX.p8`). *Note: You can only download this file once.*

### Step 3.2: Export Distribution Certificate & Provisioning Profile
From any Mac with an Apple Distribution Certificate, or generated via the Apple Developer Portal:
1. **Distribution Certificate (`.p12`)**:
   - In Apple Developer Portal &rarr; Certificates &rarr; Create "Apple Distribution" certificate.
   - Export it from Mac Keychain Access as a `.p12` file with a password.
   - Convert to Base64:
     ```bash
     base64 -w 0 distribution_cert.p12 > cert_base64.txt
     ```
2. **App Store Provisioning Profile**:
   - In Apple Developer Portal &rarr; Profiles &rarr; Create "App Store" Distribution Profile for `com.rentosphere.app`.
   - Download `Rentosphere_AppStore.mobileprovision`.
   - Convert to Base64:
     ```bash
     base64 -w 0 Rentosphere_AppStore.mobileprovision > profile_base64.txt
     ```

### Step 3.3: Add GitHub Secrets
In your GitHub repository ([AryanPatel2106/rentosphere-frontend](https://github.com/AryanPatel2106/rentosphere-frontend)), go to **Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret**:

| Secret Name | Value |
|---|---|
| `APP_STORE_CONNECT_KEY_ID` | Your Key ID (e.g., `2X9R4HXF34`) |
| `APP_STORE_CONNECT_ISSUER_ID` | Your Issuer ID UUID (e.g., `57246542-96fe-1a63-e053-0824d011072a`) |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Entire content of `AuthKey_XXXXXXXXXX.p8` file (including `-----BEGIN PRIVATE KEY-----`) |
| `BUILD_CERTIFICATE_BASE64` | Content of `cert_base64.txt` |
| `P12_PASSWORD` | Password you set when exporting the `.p12` |
| `BUILD_PROVISION_PROFILE_BASE64` | Content of `profile_base64.txt` |

### Step 3.4: Trigger the TestFlight Deployment
1. Go to your GitHub repository and click the **Actions** tab.
2. Under "Workflows" on the left, click **Deploy iOS App to Apple TestFlight**.
3. Click **Run workflow** &rarr; Branch: `main` &rarr; Click the green **Run workflow** button.
4. The macOS virtual machine will:
   - Build web assets (`vite build`).
   - Sync Capacitor (`cap sync ios`).
   - Code-sign and archive the iOS project (`xcodebuild`).
   - Upload the `.ipa` directly to Apple TestFlight.
   - Save the `.ipa` as a downloadable artifact in GitHub Actions.

---

## 4. Path B: Direct Build Using a Mac & Xcode

If you or a colleague have a Mac:

### Step 4.1: Sync and Open
```bash
# 1. Pull latest changes
git pull origin main

# 2. Build production assets and update native iOS project
npm run cap:build

# 3. Open project in Xcode
npm run cap:ios
```

### Step 4.2: Configure Signing in Xcode
1. In the left navigator in Xcode, select the root **App** project.
2. Select the **App** target under Targets.
3. Open the **Signing & Capabilities** tab.
4. Check **Automatically manage signing**.
5. Select your **Team** from the dropdown.
6. Verify the Bundle Identifier is `com.rentosphere.app`.

### Step 4.3: Create Archive & Upload
1. In the Xcode top toolbar, set the device target to **Any iOS Device (arm64)** (do not select a simulator).
2. In the top menu bar, click **Product &rarr; Archive**.
3. Once Xcode finishes compiling, the **Organizer** window opens showing your archive.
4. Click **Distribute App** on the right panel.
5. Select **Custom** (or **TestFlight & App Store**) &rarr; Click **Next**.
6. Distribution option: **Upload** &rarr; Click **Next**.
7. Keep default app strip/symbols settings &rarr; Click **Next**.
8. Select **Automatically manage signing** &rarr; Click **Next**.
9. Click **Upload**.
10. Xcode will validate and upload your build to Apple TestFlight.

> [!TIP]
> **Alternative: Transporter App**
> You can also export the `.ipa` from the Organizer (`Distribute App` &rarr; `Export`), then open the free **Transporter** app from the Mac App Store, drag the `.ipa` file into it, and click **Deliver**.

---

## 5. Activating TestFlight & Inviting Testers

Once the build is uploaded (via GitHub Actions or Xcode):

1. **Processing Phase (5–15 minutes)**:
   - Go to [App Store Connect &rarr; Apps &rarr; Rentosphere &rarr; TestFlight](https://appstoreconnect.apple.com/).
   - The new build will appear with the status **"Processing"**. Apple automatically scans the binary.
   - Once processed, the status changes to **"Ready to Submit"** or **"Active"**.

2. **Internal Testing (Instant - No Review Required)**:
   - In the TestFlight tab, click **Internal Testing** &rarr; **+**.
   - Add yourself or team members (up to 100 App Store Connect users).
   - Testers receive an email invitation immediately with a redemption code.

3. **External Testing (Up to 10,000 Users)**:
   - In the TestFlight tab, click **External Groups** &rarr; **Add Group** (e.g. `Beta Users`).
   - Select your uploaded build.
   - Provide "What to Test" notes (e.g. "Testing property search, rental requests, and payments").
   - Click **Submit for Review** (Apple beta review typically takes 24–48 hours for the first external build; subsequent builds are usually approved in a few hours).
   - Once approved, enable **Public Link** to get a sharable link (e.g. `https://testflight.apple.com/join/XXXXXX`) that anyone with an iPhone can click to install!

4. **Testing on iPhone/iPad**:
   - Testers install the free **TestFlight** app from the iOS App Store.
   - Open the invitation email or public link &rarr; Tap **Accept** &rarr; Tap **Install**.
