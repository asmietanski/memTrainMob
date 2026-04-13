# Same-Day Re-Learning Fix

## Problem Identified

User reported that items like "Andora" were reviewed multiple times on the same day:
1. Failed (quality 0) → Reps = 0, interval = 0
2. Failed (quality 1) → Reps = 0, interval = 0
3. Passed (quality 3) → Reps = 1, interval = 1
4. Passed (quality 4) → Reps = 2, interval = 6 days

**Issue:** After 4 reviews in one day (with multiple failures), the item gets a 6-day interval, which is too long for a difficult item.

## Root Cause

The original SuperMemo SM-2 algorithm doesn't account for **same-day re-learning**. When an item is:
- Failed multiple times in one session
- Then passed with a low quality score (3 or 4)
- Reviewed again the same day and passed again

The algorithm treats each pass as a separate "repetition" and advances too quickly through the interval schedule (1 day → 6 days).

## Solution Implemented

Added **same-day re-learning detection** to `calculateNextInterval()`:

### New Logic:
```javascript
if (wasReviewedToday && repetitions > 0) {
    // Same-day re-learning: don't advance repetitions too fast
    // Keep current repetitions and set interval to 1 day
    newRepetitions = repetitions;
    newInterval = 1;
}
```

### How It Works:

**Scenario 1: Normal Learning (Different Days)**
- Day 1: First pass (quality 4) → Reps = 1, interval = 1 day
- Day 2: Second pass (quality 4) → Reps = 2, interval = 6 days
- ✅ Normal progression

**Scenario 2: Same-Day Re-Learning (OLD BEHAVIOR - WRONG)**
- Day 1, 10:00: First pass (quality 3) → Reps = 1, interval = 1 day
- Day 1, 10:05: Second pass (quality 4) → Reps = 2, interval = 6 days
- ❌ Too fast! Item gets 6-day interval after being difficult

**Scenario 3: Same-Day Re-Learning (NEW BEHAVIOR - CORRECT)**
- Day 1, 10:00: First pass (quality 3) → Reps = 1, interval = 1 day
- Day 1, 10:05: Second pass (quality 4) → Reps = 1, interval = 1 day (stays at Reps=1!)
- Day 2: Third pass (quality 4) → Reps = 2, interval = 6 days
- ✅ Correct! Item must prove itself on a different day before advancing

## Benefits

1. **Prevents premature advancement:** Items that are difficult (failed multiple times) don't jump to 6-day intervals too quickly
2. **Requires consistency:** Items must be remembered on different days to advance
3. **Better learning:** Forces review the next day to confirm retention
4. **More realistic:** Same-day re-learning doesn't count as true spaced repetition

## Example: Andora Case

### Before Fix:
```
10.04.2026, 07:00: Andora - Failed (quality 0) → Reps = 0
10.04.2026, 07:05: Andora - Failed (quality 1) → Reps = 0
10.04.2026, 07:10: Andora - Passed (quality 3) → Reps = 1, interval = 1
10.04.2026, 07:15: Andora - Passed (quality 4) → Reps = 2, interval = 6
Result: Next review on 16.04.2026 (6 days later)
```

### After Fix:
```
10.04.2026, 07:00: Andora - Failed (quality 0) → Reps = 0
10.04.2026, 07:05: Andora - Failed (quality 1) → Reps = 0
10.04.2026, 07:10: Andora - Passed (quality 3) → Reps = 1, interval = 1
10.04.2026, 07:15: Andora - Passed (quality 4) → Reps = 1, interval = 1 (same-day, stays at Reps=1!)
Result: Next review on 11.04.2026 (1 day later)

11.04.2026, 08:00: Andora - Passed (quality 4) → Reps = 2, interval = 6
Result: Next review on 17.04.2026 (6 days later)
```

## Implementation Details

### Files Modified:
1. **utils/srsAlgorithm.js:**
   - Added `lastReviewedAt` parameter to `calculateNextInterval()`
   - Added `isSameDay()` helper function
   - Added same-day detection logic

2. **screens/StudyScreen.js:**
   - Pass `item.last_reviewed_at` to `calculateNextInterval()`

### Code Changes:
```javascript
// New parameter added
export function calculateNextInterval(quality, currentEF, currentInterval, repetitions, lastReviewedAt = null)

// Same-day detection
const wasReviewedToday = lastReviewedAt ? isSameDay(new Date(lastReviewedAt), new Date()) : false;

if (wasReviewedToday && repetitions > 0) {
    newRepetitions = repetitions;  // Don't advance
    newInterval = 1;                // Review tomorrow
}
```

## Testing

To test this fix:
1. Start a new item (never reviewed)
2. Fail it (quality 0-2) → Should show again immediately
3. Pass it (quality 3-5) → Should get Reps=1, interval=1
4. Review it again **same day** and pass → Should stay at Reps=1, interval=1
5. Review it **next day** and pass → Should advance to Reps=2, interval=6

## Compatibility

This change is **backward compatible**:
- Existing items with Reps=2 and interval=6 will continue as scheduled
- Only affects **new reviews** going forward
- No database migration needed

## Conclusion

This fix addresses the core issue: **same-day re-learning should not count as true spaced repetition**. Items must prove retention across different days to advance through the interval schedule.

---

**Date:** 2026-04-13  
**Issue:** Items advancing too quickly after same-day failures and passes  
**Solution:** Same-day re-learning detection  
**Status:** ✅ Implemented and ready for testing