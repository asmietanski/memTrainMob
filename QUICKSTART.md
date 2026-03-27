# memTrain Mobile - Quick Start Guide

Get up and running with memTrain Mobile in 5 minutes!

## Prerequisites

- Android phone
- Computer with Node.js 18+ installed
- USB cable OR WiFi connection

## Option 1: Development Mode (Fastest)

### Step 1: Install Expo Go on Your Phone

1. Open Google Play Store
2. Search for "Expo Go"
3. Install the app

### Step 2: Start the Development Server

```bash
cd ~/git/memTrainMob
npm install
npx expo start
```

### Step 3: Connect Your Phone

**Method A: QR Code (WiFi)**
1. Ensure phone and computer are on same WiFi network
2. Open Expo Go app on phone
3. Tap "Scan QR code"
4. Scan the QR code shown in terminal
5. App loads on your phone!

**Method B: USB Connection**
```bash
# Enable USB debugging on phone
# Connect phone via USB
npx expo start --tunnel
# Scan QR code in Expo Go
```

### Step 4: Add Some Data

For testing, you can:
1. Use the app with empty database (will show "No items")
2. Copy images from desktop version (see below)
3. Wait for Wikipedia scraper feature

## Option 2: Standalone APK (Production)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
# Enter your Expo account credentials
# Or create account at expo.dev
```

### Step 3: Build APK

```bash
cd ~/git/memTrainMob
eas build --platform android --profile preview
```

This will:
- Upload your project to Expo servers
- Build the APK in the cloud
- Provide a download link (takes 10-20 minutes)

### Step 4: Install on Phone

1. Download APK from the provided link
2. Transfer to phone (USB, email, cloud, etc.)
3. On phone: Settings → Security → Enable "Install from unknown sources"
4. Tap the APK file to install
5. Open memTrain app!

## Adding Data from Desktop Version

If you have the desktop memTrain with existing data:

### Step 1: Prepare Data on Computer

```bash
cd ~/git/memTrain

# Create archive of image directories
tar -czf memtrain-data.tar.gz \
  Polish_male_film_actors/ \
  Countries_in_Europe/

# Or copy specific category
cp -r Polish_male_film_actors ~/memtrain-export/
```

### Step 2: Transfer to Phone

**Method A: USB Cable**
```bash
# Connect phone via USB
# Enable File Transfer mode on phone

# Copy to phone
adb push memtrain-data.tar.gz /sdcard/Download/

# Or use file manager to copy
cp memtrain-data.tar.gz /path/to/phone/storage/
```

**Method B: Cloud Storage**
1. Upload to Google Drive / Dropbox
2. Download on phone
3. Extract files

### Step 3: Extract on Phone

1. Install a file manager app (e.g., "Files by Google")
2. Navigate to Download folder
3. Extract memtrain-data.tar.gz
4. Move folders to: `/sdcard/memTrain/images/`

Final structure should be:
```
/sdcard/memTrain/images/
├── Polish_male_film_actors/
│   ├── actor1.jpg
│   ├── actor2.jpg
│   └── ...
└── Countries_in_Europe/
    ├── country1.jpg
    ├── country2.jpg
    └── ...
```

### Step 4: Import in App

1. Open memTrain app
2. Tap "Settings"
3. Tap "Import Data" (coming soon)
4. Or restart app to auto-detect images

## Quick Usage Guide

### Starting Your First Study Session

1. **Open app** → See dashboard
2. **Tap "Start Studying"** → Select category
3. **Review items:**
   - Swipe RIGHT = Correct (Easy)
   - Swipe LEFT = Wrong
   - Or tap quality buttons
4. **Complete session** → View statistics

### Understanding Quality Ratings

- **Wrong (0)**: Couldn't recall → Review immediately
- **Hard (3)**: Recalled with difficulty → Shorter interval
- **Good (4)**: Recalled with effort → Normal interval
- **Easy (5)**: Perfect recall → Longer interval

### Daily Routine

1. Open app each morning
2. Check "Due Today" count
3. Complete reviews (usually 5-15 minutes)
4. New items added automatically
5. Come back tomorrow!

## Troubleshooting

### "No items available"

**Solution:** Add data first
- Copy images from desktop version
- Or wait for Wikipedia scraper feature
- Or manually add images to phone storage

### App won't connect in Expo Go

**Solution:** Check network
```bash
# Try tunnel mode
npx expo start --tunnel

# Or use LAN
npx expo start --lan
```

### Images not showing

**Solution:** Check paths
1. Verify images in `/sdcard/memTrain/images/CategoryName/`
2. Restart app
3. Check file permissions

### Build fails

**Solution:** Update tools
```bash
npm install -g eas-cli@latest
npm install
eas build --platform android --profile preview --clear-cache
```

## Next Steps

1. ✅ App installed and running
2. ✅ Data imported
3. ✅ First study session completed
4. 📖 Read full README.md for advanced features
5. 🎯 Study daily for best results!

## Tips for Success

- **Study daily** - Even 5 minutes helps
- **Be honest** with quality ratings
- **Don't skip** difficult items
- **Review statistics** to track progress
- **Focus mode** - Master failed items first

## Getting Help

- Check README.md for detailed documentation
- Review error messages carefully
- Check Expo documentation: docs.expo.dev
- Open issue on GitHub

## Development Tips

### Hot Reload

Changes to code automatically reload in Expo Go:
1. Edit any file
2. Save
3. App reloads instantly
4. No need to rebuild!

### Debugging

```bash
# View logs
npx expo start

# Press 'j' to open debugger
# Press 'r' to reload
# Press 'm' to toggle menu
```

### Testing on Multiple Devices

1. Start dev server once
2. Scan QR code on multiple phones
3. All devices run the same code
4. Perfect for testing!

---

**You're ready to start learning! 🚀**

For detailed information, see [README.md](README.md)