# Bab-un-Nisa APK Build Guide

This guide will walk you through the process of building an Android APK for the Bab-un-Nisa Islamic Resources application.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** and **npm** (v16 or higher recommended)
2. **Java Development Kit (JDK)** version 11 or higher
3. **Android Studio** with Android SDK tools
4. **Gradle** build system

## Step 1: Set up Android SDK

If you haven't already set up the Android SDK:

1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure to select:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. After installation, open Android Studio and go to Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
4. Make sure you have at least one Android SDK Platform installed (Android 12/API Level 31 or higher recommended)
5. Note down your Android SDK location (you'll need it later)

## Step 2: Set Environmental Variables

Set the following environment variables for your system:

### On Windows:

```
set ANDROID_SDK_ROOT=C:\Users\YourUsername\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Java\jdk-11
```

### On macOS/Linux:

```
export ANDROID_SDK_ROOT=~/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home
```

(Adjust paths based on your actual installation directories)

## Step 3: Build the Application

1. Navigate to the project root directory in your terminal
2. Run the following commands:

   ```bash
   # Build the web application
   npx vite build
   
   # Add Android platform (if not already added)
   npx cap add android
   
   # Sync web code with Android
   npx cap sync
   
   # Build the APK
   cd android && ./gradlew assembleDebug && cd ..
   ```

## Step 4: Locate the Generated APK

After a successful build, your APK will be available at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 5: Install the APK on your Device

### Using a USB cable:

1. Connect your Android device to your computer with a USB cable
2. Enable USB debugging on your device (Under Developer Options)
3. Install the APK using ADB:

   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Directly on the device:

1. Transfer the APK file to your Android deMicrosoft Teams


vice
2. Navigate to the file on your device and tap to install
3. You may need to enable "Install from Unknown Sources" in your device settings

## Troubleshooting

If you encounter issues during the build process:

1. **Build errors**: Make sure your Android SDK and JDK are properly installed and environment variables are set
2. **Capacitor errors**: Try running `npx cap sync` before building again
3. **Missing Android SDK components**: Open Android Studio > SDK Manager and install any missing components
4. **Gradle build issues**: Try running `./gradlew clean` in the android directory before building again

## Creating a Signed Release APK

For publishing to the Google Play Store, you'll need to create a signed release APK:

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore babnisa-key.keystore -alias babnisa -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Edit your project's capacitor.config.ts file to include signing details
3. Build a release version instead of debug

For more detailed instructions on generating a signed APK, refer to the [official Capacitor documentation](https://capacitorjs.com/docs/android/deploying-to-google-play).
