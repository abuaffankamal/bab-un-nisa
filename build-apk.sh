#!/bin/bash

# Build Bab-un-Nisa APK

echo "=== Building Bab-un-Nisa Islamic Resources Application APK ==="
echo ""

# Step 1: Build the web application
echo "Step 1: Building the web application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Error: Failed to build web application."
  exit 1
fi

echo "Web application build successful."
echo ""

# Step 2: Add Android platform if not already added
echo "Step 2: Setting up Android platform..."
if [ ! -d "android" ]; then
  echo "Adding Android platform..."
  npx cap add android
else
  echo "Android platform already exists."
fi

# Step 3: Sync the web code with the Android project
echo ""
echo "Step 3: Syncing web code with Android project..."
npx cap sync android

# Step 4: Build the APK
echo ""
echo "Step 4: Building the APK (this may take a while)..."
cd android && ./gradlew assembleDebug && cd ..

if [ $? -ne 0 ]; then
  echo "Error: Failed to build APK."
  exit 1
fi

echo ""
echo "=== Build Complete ==="
echo ""
echo "Your APK is available at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install the APK on a connected device:"
echo "adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
