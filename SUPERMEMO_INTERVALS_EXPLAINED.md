# SuperMemo SM-2 Algorithm - Intervals Explained

## Debug Data Analysis (13.04.2026)

Based on the debug screenshots from the Countries_in_Europe category:

### Current Status:
- **Total items:** 51
- **Due:** 0
- **Failed:** 0
- **New:** 0
- **Scheduled:** 51

### Example Item (Albania):
- **Last Reviewed:** 10.04.2026, 07:33 (3 days ago)
- **Repetitions:** 2
- **Interval:** 6 days
- **Next Review:** 16.04.2026, 06:00 (in 3 days)
- **Easiness Factor:** 2.36

## How SuperMemo SM-2 Works

### Interval Progression:

1. **First Correct Answer (Reps = 1):**
   - Interval = **1 day**
   - Next review: Tomorrow at 6:00 AM

2. **Second Correct Answer (Reps = 2):**
   - Interval = **6 days**
   - Next review: In 6 days at 6:00 AM

3. **Third and Subsequent Correct Answers (Reps ≥ 3):**
   - Interval = **Previous Interval × Easiness Factor**
   - Example: If previous interval was 6 days and EF = 2.5:
     - New interval = 6 × 2.5 = 15 days

### Failed Items (Quality < 3):
- Interval = **0 days** (review again today)
- Repetitions reset to 0
- Item appears at the end of today's queue

## Your Situation Explained

### Timeline:
- **10.04.2026 (3 days ago):** You reviewed all 51 countries
- **This was your SECOND correct review** (Reps = 2)
- **Algorithm set interval to 6 days**
- **Next review scheduled:** 16.04.2026 (in 3 more days)

### Why No Items Today?

Because you're on the **second repetition cycle**:
- First review: Some days before 10.04
- Second review: 10.04.2026 (interval was 1 day from first)
- Third review: 16.04.2026 (interval is 6 days from second)

**This is CORRECT behavior according to SuperMemo SM-2!**

## Is This Too Long?

The 6-day interval for the second repetition is a **core principle** of SuperMemo SM-2, based on memory research. However, if you feel this is too long for your learning style, there are options:

### Option 1: Accept the Algorithm (Recommended)
- SuperMemo SM-2 is scientifically proven
- The 6-day interval helps consolidate long-term memory
- Trust the process - it works!

### Option 2: Modify the Algorithm (Not Recommended)
We could change the intervals to:
- First repetition: 1 day (current)
- Second repetition: **3 days** (instead of 6)
- Third repetition: interval × EF (current)

**Warning:** Shorter intervals mean:
- ✅ More frequent reviews
- ❌ Less efficient learning
- ❌ More time spent reviewing
- ❌ Deviates from proven science

## Comparison with Desktop App

The desktop app (memTrain) uses the **exact same intervals**:
- Reps = 1: interval = 1 day
- Reps = 2: interval = 6 days
- Reps ≥ 3: interval = previous × EF

**Your mobile app is working correctly and matches the desktop version!**

## What Should You Do?

### Recommended Approach:
1. **Wait until 16.04.2026** for the next review
2. **Trust the algorithm** - it's designed to optimize long-term retention
3. **Use the time** to learn new categories or review failed items

### If You Really Want to Review Earlier:
You could manually reset the items, but this would:
- Disrupt the spaced repetition schedule
- Reduce learning efficiency
- Require database manipulation (not recommended)

## Conclusion

**Your app is working PERFECTLY!** 

The algorithm is doing exactly what it should:
- You reviewed items 3 days ago (second repetition)
- Next review is in 3 days (6-day interval for Reps=2)
- This follows SuperMemo SM-2 exactly

**The "problem" is not a bug - it's a feature!** The algorithm is protecting you from over-reviewing and helping you build long-term memory efficiently.

---

**Created:** 2026-04-13  
**Based on:** Debug data from Countries_in_Europe category  
**Verdict:** ✅ Algorithm working correctly, no changes needed