/**
 * Database utility for SQLite operations
 * Manages items, review history, and deleted items
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const DB_NAME = 'memtrain.db';

/**
 * Open database connection
 */
export async function openDatabase() {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(db);
    return db;
}

/**
 * Initialize database schema
 */
async function initDatabase(db) {
    // Create items table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS items (
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
    `);

    // Create review history table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS review_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            quality INTEGER NOT NULL,
            easiness_factor REAL NOT NULL,
            interval INTEGER NOT NULL,
            repetitions INTEGER NOT NULL,
            reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
        );
    `);

    // Create deleted items table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS deleted_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT UNIQUE NOT NULL,
            deleted_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Create indexes for better performance
    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
        CREATE INDEX IF NOT EXISTS idx_items_next_review ON items(next_review_date);
        CREATE INDEX IF NOT EXISTS idx_review_history_item ON review_history(item_id);
    `);
}

/**
 * Get all categories
 */
export async function getCategories(db) {
    const result = await db.getAllAsync(
        'SELECT DISTINCT category FROM items ORDER BY category'
    );
    return result.map(row => row.category);
}

/**
 * Get all items for a category
 */
export async function getItemsByCategory(db, category) {
    return await db.getAllAsync(
        `SELECT * FROM items WHERE category = ? ORDER BY created_at`,
        [category]
    );
}

/**
 * Get all items
 */
export async function getAllItems(db) {
    return await db.getAllAsync('SELECT * FROM items ORDER BY created_at');
}

/**
 * Add new item
 */
export async function addItem(db, item) {
    const { imagePath, name, category } = item;
    const now = new Date().toISOString();
    
    try {
        const result = await db.runAsync(
            `INSERT INTO items (image_path, name, category, next_review_date, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [imagePath, name, category, now, now]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding item:', error);
        throw error;
    }
}

/**
 * Update item after review
 */
export async function updateItemAfterReview(db, itemId, quality, newEF, newInterval, newRepetitions) {
    const now = new Date().toISOString();
    
    // Calculate next review date
    let nextReviewDate;
    if (newInterval === 0) {
        nextReviewDate = now;  // Available immediately
    } else {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + newInterval);
        nextDate.setHours(4, 0, 0, 0);
        nextReviewDate = nextDate.toISOString();
    }
    
    // Update item
    await db.runAsync(
        `UPDATE items 
         SET easiness_factor = ?,
             interval = ?,
             repetitions = ?,
             next_review_date = ?,
             last_reviewed_at = ?
         WHERE id = ?`,
        [newEF, newInterval, newRepetitions, nextReviewDate, now, itemId]
    );
    
    // Add to review history
    await db.runAsync(
        `INSERT INTO review_history (item_id, quality, easiness_factor, interval, repetitions)
         VALUES (?, ?, ?, ?, ?)`,
        [itemId, quality, newEF, newInterval, newRepetitions]
    );
}

/**
 * Delete item permanently
 */
export async function deleteItem(db, itemId) {
    // Get image path before deleting
    const item = await db.getFirstAsync(
        'SELECT image_path FROM items WHERE id = ?',
        [itemId]
    );
    
    if (item) {
        // Add to deleted items
        await db.runAsync(
            'INSERT OR IGNORE INTO deleted_items (image_path) VALUES (?)',
            [item.image_path]
        );
        
        // Delete the item
        await db.runAsync('DELETE FROM items WHERE id = ?', [itemId]);
    }
}

/**
 * Check if item was deleted
 */
export async function isItemDeleted(db, imagePath) {
    const result = await db.getFirstAsync(
        'SELECT 1 FROM deleted_items WHERE image_path = ?',
        [imagePath]
    );
    return !!result;
}

/**
 * Get review statistics
 */
export async function getStatistics(db, category = null) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    let whereClause = '';
    let params = [];
    
    if (category) {
        whereClause = 'WHERE category = ?';
        params = [category];
    }
    
    // Total items
    const totalResult = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM items ${whereClause}`,
        params
    );
    
    // Due items
    const dueResult = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM items 
         ${whereClause ? whereClause + ' AND' : 'WHERE'} 
         (next_review_date <= ? OR next_review_date IS NULL)`,
        category ? [category, now.toISOString()] : [now.toISOString()]
    );
    
    // Failed items today
    const failedResult = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM items 
         ${whereClause ? whereClause + ' AND' : 'WHERE'}
         interval = 0 AND repetitions = 0 
         AND last_reviewed_at >= ?`,
        category ? [category, todayStart.toISOString()] : [todayStart.toISOString()]
    );
    
    // Reviewed today
    const reviewedResult = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM items 
         ${whereClause ? whereClause + ' AND' : 'WHERE'}
         last_reviewed_at >= ?`,
        category ? [category, todayStart.toISOString()] : [todayStart.toISOString()]
    );
    
    return {
        total: totalResult.count,
        due: dueResult.count,
        failed: failedResult.count,
        reviewedToday: reviewedResult.count,
        newItemsBlocked: failedResult.count >= 20
    };
}

/**
 * Import items from JSON (for data migration)
 */
export async function importItemsFromJSON(db, items) {
    for (const item of items) {
        // Check if already deleted
        const isDeleted = await isItemDeleted(db, item.image_path);
        if (isDeleted) continue;
        
        try {
            await addItem(db, {
                imagePath: item.image_path,
                name: item.name,
                category: item.category
            });
        } catch (error) {
            // Item might already exist, skip
            console.log(`Skipping existing item: ${item.name}`);
        }
    }
}

/**
 * Copy image file to app's document directory
 */
export async function copyImageToAppDirectory(sourceUri, category, filename) {
    const appDir = FileSystem.documentDirectory + 'images/';
    const categoryDir = appDir + category + '/';
    
    // Create directories if they don't exist
    await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(categoryDir, { intermediates: true });
    
    const destUri = categoryDir + filename;
    
    // Copy file
    await FileSystem.copyAsync({
        from: sourceUri,
        to: destUri
    });
    
    return destUri;
}

/**
 * Get image URI for display
 * Now supports external storage paths
 */
export function getImageUri(imagePath) {
    if (imagePath.startsWith('file://')) {
        return imagePath;
    }
    // Check if it's an absolute path (external storage)
    if (imagePath.startsWith('/')) {
        return 'file://' + imagePath;
    }
    // Fallback to document directory
    return FileSystem.documentDirectory + 'images/' + imagePath;
}

/**
 * Scan external storage for images and populate database
 * Path: /sdcard/memTrain/images/CategoryName/*.jpg
 */
export async function scanExternalImages(db) {
    const externalDir = FileSystem.documentDirectory.replace('file://', '').replace(/\/Documents.*/, '') + '/memTrain/images/';
    
    try {
        // Check if directory exists
        const dirInfo = await FileSystem.getInfoAsync(externalDir);
        if (!dirInfo.exists) {
            console.log('External images directory not found:', externalDir);
            return { scanned: 0, added: 0, skipped: 0 };
        }
        
        let scanned = 0;
        let added = 0;
        let skipped = 0;
        
        // Get list of categories (folders)
        const categories = await FileSystem.readDirectoryAsync(externalDir);
        
        for (const category of categories) {
            const categoryPath = externalDir + category + '/';
            
            // Check if it's a directory
            const catInfo = await FileSystem.getInfoAsync(categoryPath);
            if (!catInfo.isDirectory) continue;
            
            // Get images in category
            const files = await FileSystem.readDirectoryAsync(categoryPath);
            
            for (const file of files) {
                // Only process image files
                if (!file.match(/\.(jpg|jpeg|png|gif)$/i)) continue;
                
                scanned++;
                const imagePath = categoryPath + file;
                const name = file.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ');
                
                // Check if already deleted
                const isDeleted = await isItemDeleted(db, imagePath);
                if (isDeleted) {
                    skipped++;
                    continue;
                }
                
                // Check if already exists
                const existing = await db.getFirstAsync(
                    'SELECT id FROM items WHERE image_path = ?',
                    [imagePath]
                );
                
                if (existing) {
                    skipped++;
                    continue;
                }
                
                // Add to database
                try {
                    await addItem(db, {
                        imagePath: imagePath,
                        name: name,
                        category: category
                    });
                    added++;
                } catch (error) {
                    console.error('Error adding item:', name, error);
                    skipped++;
                }
            }
        }
        
        return { scanned, added, skipped };
    } catch (error) {
        console.error('Error scanning external images:', error);
        throw error;
    }
}

/**
 * Get external storage path for images
 */
export function getExternalImagesPath() {
    // On Android: /storage/emulated/0/memTrain/images/
    // This is accessible as /sdcard/memTrain/images/
    return '/sdcard/memTrain/images/';
}

// Made with Bob
