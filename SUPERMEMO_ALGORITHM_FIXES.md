# SuperMemo Algorithm Fixes - Mobile App

## Issues Found and Fixed

### 1. ❌ CRITICAL: Missing Quality Response Buttons (1 and 2)

**Problem:**
- Desktop app has 6 quality levels (0-5) matching SuperMemo SM-2 standard
- Mobile app only had 4 buttons (0, 3, 4, 5) - missing levels 1 and 2

**Desktop Implementation:**
```
0 - Complete blackout
1 - Incorrect, felt familiar  
2 - Incorrect, seemed easy
3 - Correct, serious effort
4 - Correct, with hesitation
5 - Perfect response
```

**Mobile Implementation (BEFORE):**
```
0 - Wrong
3 - Hard
4 - Good
5 - Easy
```

**Mobile Implementation (AFTER - FIXED):**
```
0 - Blackout
1 - Wrong, familiar
2 - Wrong, easy
3 - Hard
4 - Good
5 - Easy
```

**Files Modified:**
- `screens/StudyScreen.js` - Added buttons for quality 1 and 2, reorganized into two rows of 3 buttons each

---

### 2. ⏰ Next Review Time Mismatch

**Problem:**
- Desktop app sets next review to **6 AM** on target day
- Mobile app was setting to **4 AM** on target day

**Fix Applied:**
- Changed from 4 AM to 6 AM in both files:
  - `utils/srsAlgorithm.js` - Line 82: `nextReview.setHours(6, 0, 0, 0)`
  - `utils/database.js` - Line 132: `nextDate.setHours(6, 0, 0, 0)`

---

### 3. 🔍 getDueItems Filtering Logic Issue

**Problem:**
- Mobile app wasn't properly filtering items by `next_review_date <= now`
- This could cause items to appear before they're actually due

**Desktop Logic:**
```python
WHERE next_review_date <= ?
ORDER BY
    CASE
        WHEN interval > 0 AND repetitions > 0 THEN 0  # Scheduled
        WHEN interval = 0 AND repetitions = 0 AND last_reviewed_at IS NOT NULL THEN 1  # Failed
        ELSE 2  # New
    END
```

**Mobile Logic (FIXED):**
```javascript
// Only include items that are due (next_review_date <= now)
if (!nextReview || nextReview > now) {
    return;  // Skip items not yet due
}

// Then categorize:
// 1. Scheduled (interval > 0, repetitions > 0)
// 2. Failed (interval = 0, repetitions = 0, reviewed before)
// 3. New (never reviewed, only if failed count < 20)
```

**Files Modified:**
- `utils/srsAlgorithm.js` - Lines 115-131: Added proper filtering before categorization

---

## Algorithm Verification

### SuperMemo SM-2 Formula (Unchanged - Already Correct)
```javascript
newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

// Enhanced recovery boost for difficult items
if (currentEF <= 1.6 && quality >= 4) {
    recoveryBonus = 0.2 * (quality - 3)
    newEF += recoveryBonus
}

// Bounds: 1.0 <= EF <= 2.5
```

### Interval Calculation (Unchanged - Already Correct)
```javascript
if (quality < 3) {
    newRepetitions = 0
    newInterval = 0  // Show again today
} else {
    newRepetitions = repetitions + 1
    if (newRepetitions === 1) newInterval = 1
    else if (newRepetitions === 2) newInterval = 6
    else newInterval = Math.round(currentInterval * newEF)
}
```

### Priority System (Unchanged - Already Correct)
1. **Scheduled reviews** (interval > 0, repetitions > 0) - sorted by date
2. **Failed items** (interval = 0, repetitions = 0, reviewed) - randomized
3. **New items** (never reviewed) - randomized, blocked if 20+ failed items

---

## Testing Checklist

- [ ] All 6 quality buttons (0-5) are visible and functional
- [ ] Button labels match desktop app descriptions
- [ ] Items scheduled for tomorrow appear at 6 AM (not 4 AM)
- [ ] Failed items (quality < 3) reappear immediately in the queue
- [ ] New items are blocked when 20+ failed items exist
- [ ] Scheduled reviews appear in correct date order
- [ ] Failed and new items are randomized for variety
- [ ] EF values stay within bounds (1.0 - 2.5)
- [ ] Recovery boost applies correctly for difficult items (EF <= 1.6, quality >= 4)

---

## Summary

The mobile app now fully matches the desktop app's SuperMemo SM-2 implementation:
- ✅ 6 quality response levels (0-5)
- ✅ Next review time set to 6 AM
- ✅ Proper filtering of due items
- ✅ Correct priority ordering
- ✅ 20+ failed items blocks new items
- ✅ Enhanced recovery boost for difficult items

All changes maintain backward compatibility with existing data.