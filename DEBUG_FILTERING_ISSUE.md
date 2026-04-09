# Debugging Item Filtering Issue

## Problem Description
Items that have been reviewed (both passed and failed) are appearing again when re-entering the same category on the same day. The home screen correctly shows:
- 46 Due for Review
- 5 Reviewed Today
- 0 Failed Items
- 51 Total Items

This indicates items ARE being saved, but the filtering logic is not working correctly.

## Root Cause Analysis

### Desktop App (Python) Logic
In `~/git/memTrain/app.py`:

```python
# When updating after review:
if new_interval == 0:
    # Failed item - available immediately
    next_review_datetime = datetime.now()
else:
    # Passed item - schedule for future
    target_date = today + timedelta(days=new_interval)
    next_review_datetime = datetime.combine(target_date, datetime.min.time().replace(hour=6))

# Filtering logic:
WHERE next_review_date <= NOW()
```

**Key insight**: ALL items ALWAYS have `next_review_date` set. Filtering is simple: show only items where `next_review_date <= now`.

### Mobile App (JavaScript) Logic
In `utils/database.js` - **CORRECT**:
```javascript
if (newInterval === 0) {
    nextReviewDate = now;  // Available immediately
} else {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    nextDate.setHours(6, 0, 0, 0);
    nextReviewDate = nextDate.toISOString();
}
```

In `utils/srsAlgorithm.js` - **NEEDS VERIFICATION**:
```javascript
// Skip items not yet due (only if they have a future date)
if (nextReview && nextReview > now) {
    return;  // Skip items scheduled for future
}
```

This logic should be correct, but we need to verify with detailed logging.

## Debugging Steps Added

### 1. Enhanced Logging in `srsAlgorithm.js`
- Log each item's status: interval, repetitions, next_review_date, last_reviewed_at
- Log why each item is included or excluded
- Log categorization: SCHEDULED, FAILED, NEW, or EXCLUDED
- Log final counts and total items returned

### 2. Enhanced Logging in `StudyScreen.js`
- Log category being loaded
- Log total items from database
- Log sample item structure
- Log items after filtering

### 3. Enhanced Logging in `database.js`
- Log item updates with all parameters
- Log calculated next_review_date

## Expected Behavior

When an item is reviewed with quality >= 3:
1. `interval` is set to 1 (or more)
2. `repetitions` is incremented
3. `next_review_date` is set to tomorrow (or later) at 6 AM
4. Item should NOT appear in today's review queue

When an item is reviewed with quality < 3:
1. `interval` is set to 0
2. `repetitions` is set to 0
3. `next_review_date` is set to NOW
4. Item SHOULD appear in today's review queue (at the end)

## Testing Plan

1. Install new APK with enhanced logging
2. Start a category with 51 items
3. Review some items:
   - Mark some as quality 5 (should disappear)
   - Mark some as quality 0 (should reappear at end)
4. Exit and re-enter the category
5. Check logs to see:
   - What `next_review_date` values are stored
   - Which items are being filtered out
   - Which items are being included
   - Why items that should be filtered are appearing

## Next Steps

1. Wait for GitHub Actions build (~10-15 min)
2. Download and install new APK
3. Test with logging enabled
4. Analyze logs using `adb logcat | grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]"`
5. Identify the exact point where filtering fails
6. Apply fix based on log analysis

## Build Status

Latest commit: d71eb0e - "Add extensive logging to debug item filtering issue"
GitHub Actions: Building...
Expected completion: ~10-15 minutes from push time (20:18 UTC)