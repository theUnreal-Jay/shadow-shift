# Google Play Store Publishing Guide for SHADOW SHIFT

This guide provides instructions for building, signing, and publishing **SHADOW SHIFT** to the **Google Play Store**.

---

## 1. App Identifiers & Specifications

| Property | Value |
| :--- | :--- |
| **App Name** | Shadow Shift |
| **Package Name** | `com.theunrealjay.shadowshift` |
| **Version Code** | `1` |
| **Version Name** | `1.0.0` |
| **Minimum SDK** | API 24 (Android 7.0 Nougat) — *99.5%+ device coverage* |
| **Target SDK** | API 36 (Android 15) — *Exceeds Google Play API 34+ requirement* |
| **Category** | Games / Puzzle & Arcade |
| **Content Rating** | Everyone (PEGI 3 / ESRB Everyone) |
| **Contains Ads** | No |
| **Target Audience** | Ages 6 and up |

---

## 2. Generated Build Artifacts

Your project already has both debug and release artifacts built:

### A. Google Play Store Release Bundle (`.aab`)
- **File**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Size**: ~3.02 MB
- **Usage**: This is the official format required by the Google Play Console for store releases.

### B. Direct Test APK (`.apk`)
- **File**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: ~4.15 MB
- **Usage**: Sideload directly to any Android phone for testing without going through the Play Store.

---

## 3. Step-by-Step Build Commands

Whenever you make changes to the game web code, update the Android app with these three commands:

```bash
# 1. Build the web assets
npm run build

# 2. Sync web assets into Android project
npx cap sync android

# 3. Build Google Play Release Bundle (.aab)
cd android
./gradlew bundleRelease

# Or to build a test APK:
./gradlew assembleDebug
```

---

## 4. Keystore & App Signing (One-Time Setup)

Google Play requires release builds to be signed with an upload key.

### Step 1: Generate your release keystore
Run this in PowerShell or Command Prompt:
```bash
keytool -genkey -v -keystore shadow-shift-release-key.jks -alias shadowshift -keyalg RSA -keysize 2048 -validity 10000
```
*(Store this keystore and password in a safe place. Never lose this key!)*

### Step 2: Configure Gradle to automatically sign releases (Optional)
In `android/app/build.gradle`, add signing config under `android { ... }`:
```groovy
signingConfigs {
    release {
        storeFile file("shadow-shift-release-key.jks")
        storePassword "YOUR_STORE_PASSWORD"
        keyAlias "shadowshift"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```
Alternatively, you can let Google Play App Signing manage signing keys automatically when you upload `app-release.aab`.

---

## 5. Google Play Console Setup

1. **Log in** to your [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: `Shadow Shift`
   - **Default language**: `English (United States)`
   - **App or game**: `Game`
   - **Free or paid**: `Free`
   - Accept declarations and click **Create app**.

### App Content & Declarations:
Go to **Policy and programs** > **App content**:
- **Privacy Policy**: (Host a simple HTML privacy policy on GitHub Pages or a free host declaring no personal data collection).
- **Ads**: Select *No, my app does not contain ads*.
- **App Access**: Select *All functionality is available without special access*.
- **Content Rating**: Complete the questionnaire (Educational / Brain / Puzzle; no violence, no swearing -> Results in Everyone / PEGI 3).
- **Target Audience**: Select *All ages (including children)* or *13+*.
- **Data Safety**:
  - Does your app collect or share data? -> **No**.
  - All game saves are stored locally on the device (`localStorage`).

---

## 6. Store Listing Copy (Ready to Copy & Paste)

### App Title (30 characters max)
```
Shadow Shift: Puzzle Arcade
```

### Short Description (80 characters max)
```
Change the light. Change the world. Manipulate shadows to create your path!
```

### Full Description (4000 characters max)
```
Enter the enchanting world of SHADOW SHIFT, an original 2D shadow-manipulation puzzle arcade game where objects cast shadows that solidify into physical, walkable platforms!

Guide Lumi, a tiny bioluminescent creature with glowing eyes and boundless curiosity, through an atmospheric miniature shadow theater. When you face an impossible chasm, don't look for a bridge—cast one!

FEATURES:
✦ 100 HANDCRAFTED CAMPAIGN PUZZLES
Embark on a journey across 10 themed chapters:
• Learning the Light — Master basic shadow projection & gap bridging
• Longer Shadows — Multi-pillar arrangements & crystal shard routing
• Moving Light — Dynamic oscillating light sources & timing
• Fragile Shadows — Brittle shadow bridges with step limits
• Multiple Light Sources — Dual intersecting beams with overlapping platforms
• Rotating Objects — Crystal prisms deflecting shadows at 90° angles
• Shadow Switches — Ancient floor switches that activate light projectors
• Dark Zones — Light-absorbing void areas requiring indirect shadow routing
• Time Challenges — Test your spatial speed and move efficiency
• Master Puzzles — The Grand Zenith combining all shadow arts

✦ INFINITE PROCEDURAL VOID
After the campaign, enjoy endless, guaranteed-solvable procedural levels verified by an intelligent reachability algorithm.

✦ DAILY CHALLENGES
Solve a unique handcrafted daily puzzle every day to maintain your streak and earn bonus coins.

✦ ORIGINAL ANIMATED CHARACTER: LUMI
Lumi squashes and stretches on landing, breathes gently when idle, and has big expressive eyes that physically follow the light source!

✦ CUSTOMIZE YOUR EXPERIENCE
Unlock beautiful glowing skins for Lumi (Classic Spark, Amethyst Phantom, Cyber Neon, Sakura Whisper, Solar Flare, Quantum Ghost), custom lantern projectors, and board themes.

✦ GENERATIVE AMBIENT SOUNDSCAPE
Relax to soothing procedural ambient music in the E-minor pentatonic scale and satisfying synthesized audio cues.

✦ OFFLINE PLAY
No internet required. Play anywhere, anytime.

Change the light. Change the world. Download SHADOW SHIFT today!
```

---

## 7. Uploading the Release to Production

1. In Google Play Console, navigate to **Production** (or **Closed testing**).
2. Click **Create new release**.
3. Under **App bundles**, upload `android/app/build/outputs/bundle/release/app-release.aab`.
4. Enter release notes:
   ```
   Initial Release: 100 Handcrafted levels, procedural endless mode, daily challenge, and complete wardrobe customization.
   ```
5. Click **Next** > **Save** > **Start rollout to Production**!
