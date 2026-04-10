/**
 * Spaced Repetition System (SRS) using SuperMemo SM-2 Algorithm
 * Ported from memTrain Python implementation
 */

/**
 * Calculate next review interval using SM-2 algorithm with enhanced recovery boost
 * 
 * @param {number} quality - User's response quality (0-5)
 * @param {number} currentEF - Current easiness factor
 * @param {number} currentInterval - Current interval in days
 * @param {number} repetitions - Number of successful repetitions
 * @returns {object} - { newEF, newInterval, newRepetitions }
 */
export function calculateNextInterval(quality, currentEF, currentInterval, repetitions) {
    // Calculate new easiness factor using standard SM-2 formula
    let newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Apply enhanced recovery boost for high-quality responses on difficult items
    // This helps items recover faster from the difficulty pit
    if (currentEF <= 1.6 && quality >= 4) {
        // Enhanced recovery bonus:
        // Quality 5: +0.4 (total change: +0.5 from 1.3)
        // Quality 4: +0.2 (total change: +0.2 from 1.3)
        const recoveryBonus = 0.2 * (quality - 3);
        newEF += recoveryBonus;
    }
    
    // Ensure EF stays within bounds (1.0 to 2.5)
    // Lower floor to 1.0 to better differentiate difficulty levels
    if (newEF < 1.0) {
        newEF = 1.0;
    } else if (newEF > 2.5) {
        newEF = 2.5;
    }
    
    let newInterval;
    let newRepetitions;
    
    // Calculate new interval and repetitions
    if (quality < 3) {
        // Incorrect response - reset and show again today (at end of queue)
        newRepetitions = 0;
        newInterval = 0;  // 0 means show again today (immediately available)
    } else {
        // Correct response
        newRepetitions = repetitions + 1;
        
        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(currentInterval * newEF);
        }
    }
    
    return {
        newEF: Math.round(newEF * 100) / 100,  // Round to 2 decimal places
        newInterval,
        newRepetitions
    };
}

/**
 * Calculate next review date based on interval
 *
 * @param {number} interval - Interval in days (0 means today)
 * @returns {Date} - Next review date at 6 AM
 */
export function calculateNextReviewDate(interval) {
    const now = new Date();
    
    if (interval === 0) {
        // Available immediately
        return now;
    }
    
    // Set to 6 AM on the target day (matches desktop app)
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + interval);
    nextReview.setHours(6, 0, 0, 0);
    
    return nextReview;
}

/**
 * Get items due for review
 * Priority: Scheduled reviews → Failed items → New items
 * If 20+ failed items exist today, hide new items
 * 
 * @param {Array} items - All items from database
 * @returns {Array} - Items due for review, sorted by priority
 */
export function getDueItems(items) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    console.log(`[getDueItems] now=${now.toISOString()}, checking ${items.length} items`);
    
    // Count failed items reviewed today
    const failedItems = items.filter(item =>
        item.interval === 0 &&
        item.repetitions === 0 &&
        item.last_reviewed_at &&
        new Date(item.last_reviewed_at) >= todayStart
    );
    
    const failedCount = failedItems.length;
    
    // Categorize items
    const scheduled = [];
    const failed = [];
    const newItems = [];
    
    items.forEach(item => {
        const nextReview = item.next_review_date ? new Date(item.next_review_date) : null;
        
        console.log(`[getDueItems] Item ${item.id}: interval=${item.interval}, reps=${item.repetitions}, next_review=${item.next_review_date}, last_reviewed=${item.last_reviewed_at}`);
        
        // Skip items not yet due (only if they have a future date)
        if (nextReview && nextReview > now) {
            console.log(`[getDueItems]   -> SKIPPED (future): next_review=${nextReview.toISOString()} > now=${now.toISOString()}`);
            return;  // Skip items scheduled for future
        }
        
        // Scheduled reviews (interval > 0, repetitions > 0)
        if (item.interval > 0 && item.repetitions > 0) {
            console.log(`[getDueItems]   -> SCHEDULED (interval=${item.interval}, reps=${item.repetitions})`);
            scheduled.push({ ...item, priority: 0 });
        }
        // Failed items (interval = 0, repetitions = 0, reviewed before)
        else if (item.interval === 0 && item.repetitions === 0 && item.last_reviewed_at) {
            console.log(`[getDueItems]   -> FAILED (needs re-review)`);
            failed.push({ ...item, priority: 1 });
        }
        // New items (never reviewed) - only if failed count < 20
        else if (!item.last_reviewed_at && failedCount < 20) {
            console.log(`[getDueItems]   -> NEW (never reviewed, failedCount=${failedCount})`);
            newItems.push({ ...item, priority: 2 });
        }
        else {
            console.log(`[getDueItems]   -> EXCLUDED (doesn't match any category or failedCount >= 20)`);
        }
    });
    
    // Fisher-Yates shuffle algorithm for better randomization
    const shuffle = (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    
    // Sort scheduled by date (oldest first), then shuffle items with same date
    // Group by date first
    const scheduledByDate = {};
    scheduled.forEach(item => {
        const dateKey = item.next_review_date || 'null';
        if (!scheduledByDate[dateKey]) {
            scheduledByDate[dateKey] = [];
        }
        scheduledByDate[dateKey].push(item);
    });
    
    // Sort date groups and shuffle within each group
    const sortedScheduled = Object.keys(scheduledByDate)
        .sort((a, b) => {
            if (a === 'null') return 1;
            if (b === 'null') return -1;
            return new Date(a) - new Date(b);
        })
        .flatMap(dateKey => shuffle(scheduledByDate[dateKey]));
    
    console.log(`[getDueItems] Result: ${scheduled.length} scheduled, ${failed.length} failed, ${newItems.length} new = ${scheduled.length + failed.length + newItems.length} total`);
    
    const result = [
        ...sortedScheduled,
        ...shuffle(failed),
        ...shuffle(newItems)
    ];
    
    console.log(`[getDueItems] Returning ${result.length} items`);
    return result;
}

/**
 * Get statistics for current session
 * 
 * @param {Array} items - All items from database
 * @returns {object} - Statistics object
 */
export function getStatistics(items) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const dueItems = getDueItems(items);
    const failedToday = items.filter(item =>
        item.interval === 0 &&
        item.repetitions === 0 &&
        item.last_reviewed_at &&
        new Date(item.last_reviewed_at) >= todayStart
    );
    
    const reviewedToday = items.filter(item =>
        item.last_reviewed_at &&
        new Date(item.last_reviewed_at) >= todayStart
    );
    
    return {
        totalItems: items.length,
        dueCount: dueItems.length,
        failedCount: failedToday.length,
        reviewedToday: reviewedToday.length,
        newItemsBlocked: failedToday.length >= 20
    };
}

// Made with Bob
