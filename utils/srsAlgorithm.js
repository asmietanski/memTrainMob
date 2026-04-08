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
    
    // Count failed items reviewed today
    const failedItems = items.filter(item => 
        item.interval === 0 && 
        item.repetitions === 0 && 
        item.lastReviewedAt && 
        new Date(item.lastReviewedAt) >= todayStart
    );
    
    const failedCount = failedItems.length;
    
    // Categorize items
    const scheduled = [];
    const failed = [];
    const newItems = [];
    
    items.forEach(item => {
        const nextReview = item.nextReviewDate ? new Date(item.nextReviewDate) : null;
        
        // Only include items that are due (next_review_date <= now)
        if (!nextReview || nextReview > now) {
            return;  // Skip items not yet due
        }
        
        // Scheduled reviews (interval > 0, repetitions > 0)
        if (item.interval > 0 && item.repetitions > 0) {
            scheduled.push({ ...item, priority: 0 });
        }
        // Failed items (interval = 0, repetitions = 0, reviewed before)
        else if (item.interval === 0 && item.repetitions === 0 && item.lastReviewedAt) {
            failed.push({ ...item, priority: 1 });
        }
        // New items (never reviewed) - only if failed count < 20
        else if (!item.lastReviewedAt && failedCount < 20) {
            newItems.push({ ...item, priority: 2 });
        }
    });
    
    // Sort scheduled by date (oldest first)
    scheduled.sort((a, b) => 
        new Date(a.nextReviewDate) - new Date(b.nextReviewDate)
    );
    
    // Shuffle failed and new items for variety
    const shuffled = (arr) => arr.sort(() => Math.random() - 0.5);
    
    return [
        ...scheduled,
        ...shuffled(failed),
        ...shuffled(newItems)
    ];
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
        item.lastReviewedAt && 
        new Date(item.lastReviewedAt) >= todayStart
    );
    
    const reviewedToday = items.filter(item => 
        item.lastReviewedAt && 
        new Date(item.lastReviewedAt) >= todayStart
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
