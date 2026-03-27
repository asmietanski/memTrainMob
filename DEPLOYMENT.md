# memTrain Mobile - Deployment Guide

Complete guide for deploying memTrain Mobile to your Android device.

## Current Status

✅ **Completed:**
- React Native Expo project initialized
- All core functionality implemented
- SRS algorithm ported from Python to JavaScript
- 6 screens created with full navigation
- Database schema implemented
- Documentation complete
- Git repository initialized

🔄 **Next Steps:**
1. Copy data from desktop version
2. Test in development mode
3. Build APK for production
4. Install on Android device

## Step 1: Copy Data from Desktop Version

### Option A: Copy Image Directories

```bash
# Navigate to memTrainMob project
cd /home/pl37039/git/memTrainMob

# Create assets/images directory
mkdir -p assets/images

# Copy existing categories from desktop version
cp -r /home/pl37039/git/memTrain/Polish_male_film_actors assets/images/
cp -r /home/pl37039/git/memTrain/Countries_in_Europe assets/images/

# Verify copy
ls -la assets/images/
```

### Option B: Create Archive for Phone Transfer

```bash
# Create archive of all image data
cd /home/pl37039/git/memTrain
tar -czf memtrain-mobile-data.tar.gz \
  Polish_male_film_actors/ \
  Countries_in_Europe/

# Move to memTrainMob for easy access
mv memtrain-mobile-data.tar.gz /home/pl37039/git/memTrainMob/

# This file can be transferred to phone later
```

## Step 2: Test in Development Mode

### Install Expo Go on Phone

1. Open Google Play Store on your Android phone
2. Search for "Expo Go"
3. Install the app

### Start Development Server

```bash
cd /home/pl37039/git/memTrainMob

# Install dependencies (if not already done)
npm install

# Start Expo development server
npx expo start
```

### Connect Phone to Development Server

**Method 1: QR Code (WiFi)**
```bash
# Ensure phone and computer are on same WiFi network
npx expo start

# On phone:
# 1. Open Expo Go app
# 2. Tap "Scan QR code"
# 3. Scan the QR code shown in terminal
# 4. App loads on phone
```

**Method 2: Tunnel (if WiFi doesn't work)**
```bash
# Uses ngrok tunnel (slower but works across networks)
npx expo start --tunnel

# Scan QR code in Expo Go app
```

**Method 3: USB Connection**
```bash
# Enable USB debugging on phone
# Connect phone via USB cable
npx expo start --localhost

# Or use ADB
adb reverse tcp:8081 tcp:8081
npx expo start
```

### Test the App

1. ✅ App loads without errors
2. ✅ Home screen displays
3. ✅ Navigation works between screens
4. ✅ Database initializes
5. ✅ Can select categories (if data copied)
6. ✅ Study screen shows items
7. ✅ Swipe gestures work
8. ✅ Quality buttons function
9. ✅ Statistics update correctly
10. ✅ Item deletion works

## Step 3: Build Production APK

### Prerequisites

- Expo account (free): https://expo.dev
- EAS CLI installed globally

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Login to Expo

```bash
eas login
# Enter your Expo credentials
# Or create account at expo.dev
```

### Configure Build

```bash
cd /home/pl37039/git/memTrainMob

# Initialize EAS build (if not already done)
eas build:configure
```

This creates/updates `eas.json` with build profiles.

### Build APK

```bash
# Build APK for Android (preview profile)
eas build --platform android --profile preview

# This will:
# 1. Upload project to Expo servers
# 2. Build APK in the cloud
# 3. Provide download link
# 4. Takes 10-20 minutes
```

**Build Profiles:**
- `preview` - APK file (easy to install)
- `production` - AAB file (for Google Play Store)

### Monitor Build Progress

```bash
# Check build status
eas build:list

# Or visit: https://expo.dev/accounts/[your-account]/projects/memTrainMob/builds
```

### Download APK

Once build completes:
1. Download APK from provided link
2. Or use: `eas build:download --platform android`

## Step 4: Install on Android Device

### Method A: Direct Download on Phone

1. Open build URL on phone browser
2. Download APK file
3. Tap downloaded file
4. Enable "Install from unknown sources" if prompted
5. Tap "Install"
6. Open memTrain app

### Method B: Transfer via USB

```bash
# Connect phone via USB
# Enable File Transfer mode

# Copy APK to phone
adb install memtrain-mobile.apk

# Or manually copy
cp memtrain-mobile.apk /path/to/phone/Download/
```

### Method C: Cloud Transfer

1. Upload APK to Google Drive / Dropbox
2. Download on phone
3. Install from Downloads folder

## Step 5: Transfer Data to Phone

### If Images Not Bundled in APK

```bash
# On computer: Create data archive
cd /home/pl37039/git/memTrain
tar -czf memtrain-data.tar.gz Polish_male_film_actors/ Countries_in_Europe/

# Transfer to phone via:
# - USB cable
# - Cloud storage (Drive, Dropbox)
# - Email
# - ADB: adb push memtrain-data.tar.gz /sdcard/Download/
```

### On Phone: Extract Data

1. Install file manager (e.g., "Files by Google")
2. Navigate to Download folder
3. Extract memtrain-data.tar.gz
4. Move folders to: `/sdcard/memTrain/images/`

Final structure:
```
/sdcard/memTrain/images/
├── Polish_male_film_actors/
│   ├── actor1.jpg
│   └── ...
└── Countries_in_Europe/
    ├── country1.jpg
    └── ...
```

## Step 6: First Launch

1. Open memTrain app
2. Grant storage permissions if requested
3. App initializes database
4. Navigate to Categories
5. Select a category
6. Start studying!

## Troubleshooting

### Build Fails

```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache

# Update EAS CLI
npm install -g eas-cli@latest

# Check build logs
eas build:view
```

### App Crashes on Launch

- Check Expo Go version (update if needed)
- Clear Expo cache: `npx expo start -c`
- Rebuild: `eas build --platform android --profile preview`

### Images Not Loading

- Verify image paths in database
- Check file permissions on phone
- Ensure images in correct directory
- Restart app

### Database Errors

- Clear app data: Settings → Apps → memTrain → Clear Data
- Reinstall app
- Check SQLite compatibility

## Performance Optimization

### Reduce APK Size

```bash
# Use production build with optimizations
eas build --platform android --profile production

# Enable Hermes engine (already configured in app.json)
# Reduces bundle size by ~50%
```

### Optimize Images

```bash
# Before copying to phone, optimize images
cd /home/pl37039/git/memTrain

# Install imagemagick if needed
# sudo dnf install imagemagick

# Resize large images
find Polish_male_film_actors -name "*.jpg" -exec convert {} -resize 800x800\> {} \;
```

## Updating the App

### Development Updates

```bash
# Make code changes
# Save files
# Expo Go automatically reloads
# No rebuild needed!
```

### Production Updates

```bash
# Make changes
git add -A
git commit -m "Update: description"

# Rebuild APK
eas build --platform android --profile preview

# Download new APK
# Install over existing app (data preserved)
```

## Continuous Deployment

### Automated Builds

```bash
# Set up GitHub Actions or similar
# Trigger builds on git push
# Automatic APK generation
```

### OTA Updates (Over-The-Air)

```bash
# Publish updates without rebuilding
eas update --branch production

# Users get updates automatically
# No need to reinstall APK
```

## Security Considerations

### Before Publishing

1. Remove debug code
2. Disable console.log in production
3. Secure API keys (if any)
4. Enable ProGuard (Android)
5. Sign APK properly

### App Signing

```bash
# EAS handles signing automatically
# Or configure custom keystore in eas.json
```

## Next Steps

1. ✅ Test thoroughly in development
2. ✅ Build production APK
3. ✅ Install on phone
4. ✅ Transfer data
5. ✅ Verify all features work
6. 📱 Use daily for learning!
7. 🚀 Share with others (optional)
8. 📊 Monitor usage and feedback

## Support

For issues during deployment:
- Check Expo documentation: https://docs.expo.dev
- Review build logs: `eas build:view`
- Check GitHub issues
- Contact developer

---

**Ready to deploy! 🚀**

See [QUICKSTART.md](QUICKSTART.md) for user guide after deployment.