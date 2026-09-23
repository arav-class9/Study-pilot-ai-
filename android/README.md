# StudyPilot AI — Android Application

This folder contains the complete, production-ready Android Studio project for **StudyPilot AI**, engineered with Material 3, modern Android edge-to-edge support, native hardware haptics, gesture back-navigation, native camera and PDF document file choosers, and deep-link handling.

---

## 📱 Project Specifications

| Property | Value |
| :--- | :--- |
| **Application ID** | `com.studypilot.ai` |
| **Minimum SDK** | `26` (Android 8.0 Oreo) |
| **Target SDK** | `34` (Android 14) |
| **Language** | Kotlin 1.9.24 |
| **Gradle** | AGP 8.5.0+ |
| **Design System** | Google Material 3 (`Theme.Material3.DayNight.NoActionBar`) |
| **Architecture** | Native Android Activity + Hybrid Bridge Engine + Offline Cache |

---

## 🚀 Features Implemented

1. **Material 3 System & Edge-to-Edge Experience**:
   - Modern edge-to-edge window inset configuration with dynamic status bar and navigation bar contrast.
   - Fluid pull-to-refresh (`SwipeRefreshLayout`) matching Android system interactions.
   - Integrated top loading progress indicator.

2. **Native Gesture & Hardware Back Stack Handling**:
   - Integrated with AndroidX `OnBackPressedDispatcher`.
   - Pop navigation automatically closes active modals, navigates tabs back to Home, and utilizes Android's standard **"Double-press back to exit"** safety toast on the root screen.

3. **Native File & Camera Chooser**:
   - Seamlessly handles `<input type="file">` for PDF textbook uploads and camera photos for handwritten doubt solving via native `ActivityResultContracts.StartActivityForResult()`.

4. **Hardware Vibration / Haptics**:
   - Direct bridge to `Vibrator` and `VibratorManager` on API 31+ for micro-haptic taps during quiz option clicks and tab switching.

5. **Deep Linking**:
   - Supports custom scheme: `studypilot://app`
   - Supports verified web links: `https://studypilot.ai`

---

## 🛠️ How to Build & Run

### Method 1: Android Studio (Recommended)

1. Open **Android Studio** (Koala, Jellyfish, or Iguana).
2. Click **Open** and select the `/android` directory.
3. Allow Gradle to sync dependencies.
4. Connect an Android phone via USB (with USB Debugging enabled) or start an Android Virtual Device (AVD).
5. Click **Run 'app'** (`Shift + F10`).

### Method 2: Command Line (Gradle Wrapper)

To build a debug APK:
```bash
cd android
./gradlew assembleDebug
```
The output APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

To build an optimized production Release APK / Bundle (AAB):
```bash
./gradlew bundleRelease
```
The output App Bundle (`app-release.aab`) will be ready for upload to the **Google Play Console**.
