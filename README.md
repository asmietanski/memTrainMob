# memTrain Mobile - Spaced Repetition Learning App

A mobile Android application for memory training using the SuperMemo SM-2 spaced repetition algorithm. Learn and memorize images with names through scientifically-proven spaced repetition techniques.

## Features

- **Spaced Repetition System (SRS)** - Based on SuperMemo SM-2 algorithm
- **Category-based Learning** - Organize items into different categories
- **Swipe Gestures** - Intuitive swipe left (wrong) / right (correct) interface
- **Quality Ratings** - Rate your recall: Wrong (0), Hard (3), Good (4), Easy (5)
- **Smart Scheduling** - Reviews scheduled for 4:00 AM on target days
- **Failed Items Management** - 20+ failed items triggers focus mode
- **Progress Tracking** - Detailed statistics and progress monitoring
- **Item Deletion** - Remove items with persistent tracking
- **Offline Support** - Works completely offline once data is loaded
- **Wikipedia Integration** - UI for adding items from Wikipedia (coming soon)

## Technology Stack

- **React Native** with Expo
- **SQLite** for local database
- **React Navigation** for screen management
- **PanResponder** for swipe gestures
- **Animated API** for smooth animations

## Installation

### Prerequisites

- Node.js 18+ installed
- Android phone with Expo Go app installed
- OR EAS CLI for building standalone APK

### Quick Start

1. **Clone the repository:**
```bash
cd ~/git
git clone <repository-url> memTrainMob
cd memTrainMob
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npx expo start
```

4. **Run on your phone:**
   - Install Expo Go from Google Play Store
   - Scan the QR code shown in terminal
   - App will load on your phone

### Building APK for Production

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure the project:**
```bash
eas build:configure
```

4. **Build APK:**
```bash
eas build --platform android --profile preview
```

5. **Download and install:**
   - Download the APK from the provided link
   - Transfer to your phone
   - Install (enable "Install from unknown sources" if needed)

## Project Structure

```
memTrainMob/
├── App.js                          # Main app with navigation
├── utils/
│   ├── srsAlgorithm.js            # SuperMemo SM-2 implementation
│   └── database.js                # SQLite database operations
├── screens/
│   ├── HomeScreen.js              # Dashboard with statistics
│   ├── CategoryScreen.js          # Category selection
│   ├── StudyScreen.js             # Main study interface
│   ├── StatisticsScreen.js        # Detailed statistics
│   ├── SettingsScreen.js          # App settings
│   └── WikipediaScraperScreen.js  # Wikipedia integration
├── assets/
│   └── images/                    # Category folders with images
├── package.json
├── app.json
└── README.md
```

## SuperMemo SM-2 Algorithm

The app uses the proven SuperMemo SM-2 algorithm for optimal learning:

### Key Concepts

1. **Easiness Factor (EF)**: 1.0 - 2.5
   - Starts at 2.5 for new items
   - Adjusts based on recall quality
   - Lower EF = more difficult item

2. **Intervals**: Days until next review
   - First review: 1 day
   - Second review: 6 days
   - Subsequent: interval × EF

3. **Quality Ratings**:
   - 0 (Wrong): Complete failure, restart
   - 3 (Hard): Correct with difficulty
   - 4 (Good): Correct with some effort
   - 5 (Easy): Perfect recall

4. **Recovery Bonus**: When EF ≤ 1.6
   - Quality 5: +0.4 to EF
   - Quality 4: +0.2 to EF
   - Helps struggling items recover

5. **Failed Items**: Quality < 3
   - Interval set to 0 (available immediately)
   - Repetitions reset to 0
   - Prioritized in review queue

### Review Priority

1. **Scheduled reviews** (priority 0) - Due today or overdue
2. **Failed items** (priority 1) - Items you got wrong
3. **New items** (priority 2) - Never reviewed before

### 20 Failed Items Threshold

When you have 20+ failed items in a category:
- New items are blocked
- Focus on mastering failed items first
- Warning badge shown on category
- "Practice mode" message displayed

## Database Schema

### items table
```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    easiness_factor REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    next_review_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at TEXT
);
```

### review_history table
```sql
CREATE TABLE review_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    quality INTEGER NOT NULL,
    easiness_factor REAL NOT NULL,
    interval INTEGER NOT NULL,
    reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### deleted_items table
```sql
CREATE TABLE deleted_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT UNIQUE NOT NULL,
    deleted_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Guide

### Starting a Study Session

1. Open the app
2. Tap "Start Studying" or select a category
3. Review items using swipe gestures or buttons
4. Complete the session or exit anytime

### Swipe Gestures

- **Swipe Right** → Correct (Quality 5 - Easy)
- **Swipe Left** → Wrong (Quality 0 - Failed)
- **Tap Buttons** → Choose specific quality (0, 3, 4, 5)

### Quality Button Guidelines

- **Wrong (0)**: Couldn't recall at all
- **Hard (3)**: Recalled but with significant difficulty
- **Good (4)**: Recalled with some effort
- **Easy (5)**: Perfect recall, no hesitation

### Deleting Items

1. During study session, tap "Delete Item" button
2. Confirm deletion
3. Item is permanently removed and tracked
4. Cannot be re-added (prevents duplicates)

### Viewing Statistics

- Tap "Statistics" from home screen
- View overall progress
- See category-specific stats
- Monitor learning trends

## Adding Data

### Method 1: Copy from Desktop Version

If you have the desktop memTrain app:

```bash
# On your computer
cd ~/git/memTrain
tar -czf memtrain-data.tar.gz Polish_male_film_actors/ Countries_in_Europe/

# Transfer to phone via USB or cloud
# Extract to: /sdcard/memTrain/images/
```

### Method 2: Manual Addition

1. Create category folder: `/sdcard/memTrain/images/CategoryName/`
2. Add images with format: `name.jpg` or `name.png`
3. App will auto-detect on next launch

### Method 3: Wikipedia Scraper (Coming Soon)

1. Tap "Add from Wikipedia"
2. Enter Wikipedia category URL
3. Wait for images to download
4. Items automatically added to database

## Troubleshooting

### App won't start
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Clear cache: `npx expo start -c`

### Images not showing
- Check image paths in database
- Ensure images exist in `/sdcard/memTrain/images/`
- Verify file permissions

### Database errors
- Clear app data and restart
- Reinstall the app
- Check SQLite compatibility

### Build fails
- Update EAS CLI: `npm install -g eas-cli@latest`
- Check Expo account credentials
- Review build logs for specific errors

## Development

### Running in Development

```bash
# Start Expo dev server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check
```

### Code Structure

- **utils/srsAlgorithm.js**: Pure functions for SRS calculations
- **utils/database.js**: All database operations
- **screens/**: React Native components for each screen
- **App.js**: Navigation and app initialization

## Performance Optimization

- Images loaded on-demand
- Database queries optimized with indexes
- Animations use native driver
- Minimal re-renders with proper state management

## Future Enhancements

- [ ] Wikipedia scraper implementation
- [ ] Audio pronunciation support
- [ ] Export/import functionality
- [ ] Cloud sync across devices
- [ ] Custom study sessions
- [ ] Advanced statistics and charts
- [ ] Dark mode support
- [ ] Multiple language support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Credits

- SuperMemo SM-2 algorithm by Piotr Woźniak
- Built with React Native and Expo
- Icons from React Native Vector Icons

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## Version History

### v1.0.0 (2026-03-27)
- Initial release
- Core SRS functionality
- Swipe gesture interface
- Category management
- Statistics tracking
- Item deletion
- Offline support

---

**Happy Learning! 🧠📚**