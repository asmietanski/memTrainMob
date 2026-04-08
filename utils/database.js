/**
 * Database utility for SQLite operations
 * Manages items, review history, and deleted items
 */

import * as SQLite from 'expo-sqlite';
import { Paths, Directory, File } from 'expo-file-system';
import { makeDirectoryAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

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
        nextDate.setHours(6, 0, 0, 0);  // Set to 6 AM (matches desktop app)
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
 * Uses NEW FileSystem API (File and Directory classes)
 */
export async function copyImageToAppDirectory(sourceUri, category, filename) {
    // Create directories using new Paths API
    const imagesDir = new Directory(Paths.document, 'images');
    
    // Ensure images directory exists - use try-catch as create() may fail if exists
    try {
        await imagesDir.create();
    } catch (error) {
        // Directory likely already exists, ignore error
        if (!error.message?.includes('already exists')) {
            throw error;
        }
    }
    
    const categoryDir = new Directory(imagesDir, category);
    
    // Ensure category directory exists
    try {
        await categoryDir.create();
    } catch (error) {
        // Directory likely already exists, ignore error
        if (!error.message?.includes('already exists')) {
            throw error;
        }
    }
    
    // Copy file using NEW API
    const sourceFile = new File(sourceUri);
    const destFile = new File(categoryDir, filename);
    await sourceFile.copy(destFile);
    
    return destFile.uri;
}

/**
 * Get image URI for display
 * Handles both relative paths (from internal storage) and absolute paths (legacy)
 */
export function getImageUri(imagePath) {
    if (imagePath.startsWith('file://')) {
        return imagePath;
    }
    // Check if it's an absolute path (legacy external storage)
    if (imagePath.startsWith('/')) {
        return 'file://' + imagePath;
    }
    // Relative path - use Paths.document
    const imagesDir = new Directory(Paths.document, 'images');
    const file = new File(imagesDir, imagePath);
    return file.uri;
}

/**
 * Scan Android Documents directory for images and populate database
 * Path: /storage/emulated/0/Documents/memTrain/CategoryName/*.jpg
 */
export async function scanExternalImages(db) {
    // Use Android's public Documents directory
    const basePath = '/storage/emulated/0/Documents/memTrain/';
    
    try {
        let scanned = 0;
        let added = 0;
        let skipped = 0;
        
        // Try to access the directory using new File API
        const baseDir = new Directory(basePath);
        
        // Check if directory exists
        let exists = false;
        try {
            exists = await baseDir.exists();
        } catch (e) {
            console.log('Directory does not exist yet:', basePath);
            return { scanned: 0, added: 0, skipped: 0, error: 'Directory not found. Please create: ' + basePath };
        }
        
        if (!exists) {
            console.log('memTrain directory not found at:', basePath);
            return { scanned: 0, added: 0, skipped: 0, error: 'Directory not found. Please create: ' + basePath };
        }
        
        // List all items in memTrain directory
        const items = await baseDir.list();
        
        for (const item of items) {
            // Check if it's a directory
            if (!item.isDirectory) continue;
            
            const category = item.name;
            const categoryDir = new Directory(basePath + category + '/');
            
            // List files in category directory
            let files;
            try {
                files = await categoryDir.list();
            } catch (e) {
                console.log('Cannot read category directory:', category);
                continue;
            }
            
            for (const file of files) {
                // Skip directories, only process files
                if (file.isDirectory) continue;
                
                // Only process image files
                if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) continue;
                
                scanned++;
                const imagePath = basePath + category + '/' + file.name;
                const name = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ');
                
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
        return { scanned: 0, added: 0, skipped: 0, error: error.message };
    }
}

/**
 * Import images from a ZIP file into app's internal storage
 * Uses NEW FileSystem API (File and Directory classes) - NOT deprecated methods
 * @param {object} db - Database connection
 * @param {string} zipFileUri - URI of the selected ZIP file
 * @returns {object} - Result with counts of imported, skipped, and failed items
 */
export async function importImagesFromZip(db, zipFileUri) {
    const JSZip = require('jszip');
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    
    try {
        console.log('Reading ZIP file:', zipFileUri);
        
        // Read the ZIP file using NEW File API
        const zipFile = new File(zipFileUri);
        const zipBytes = await zipFile.bytes();
        
        console.log('ZIP file read');
        
        // Load ZIP file from bytes
        const zip = await JSZip.loadAsync(zipBytes);
        
        console.log('ZIP loaded, processing files...');
        
        // First, look for image_mapping.json files in the ZIP
        const imageMappings = {};
        const files = Object.keys(zip.files);
        console.log(`Found ${files.length} entries in ZIP`);
        
        // Extract all image_mapping.json files
        for (const filePath of files) {
            const zipEntry = zip.files[filePath];
            if (zipEntry.dir) continue;
            
            if (filePath.endsWith('image_mapping.json')) {
                try {
                    const jsonContent = await zipEntry.async('text');
                    const mapping = JSON.parse(jsonContent);
                    
                    // Determine the category from the path
                    const pathParts = filePath.split('/').filter(p => p.length > 0);
                    let category;
                    if (pathParts.length === 1) {
                        category = 'Imported';
                    } else if (pathParts.length === 2) {
                        category = pathParts[0];
                    } else {
                        category = pathParts[pathParts.length - 2];
                    }
                    
                    imageMappings[category] = mapping;
                    console.log(`Found image_mapping.json for category: ${category}`);
                } catch (error) {
                    console.error('Error parsing image_mapping.json:', error);
                }
            }
        }
        
        for (const filePath of files) {
            const zipEntry = zip.files[filePath];
            
            // Skip directories
            if (zipEntry.dir) continue;
            
            // Only process image files
            if (!filePath.match(/\.(jpg|jpeg|png|gif)$/i)) continue;
            
            // Extract category and filename from path
            // Supports multiple formats:
            // 1. CategoryName/image.jpg (single category in ZIP)
            // 2. ParentFolder/CategoryName/image.jpg (multiple categories)
            // 3. image.jpg (no subdirectory - use ZIP filename as category)
            const pathParts = filePath.split('/').filter(p => p.length > 0);
            
            let filename, category;
            
            if (pathParts.length === 1) {
                // Direct file in ZIP root - use ZIP filename (without .zip) as category
                filename = pathParts[0];
                category = 'Imported';  // Default category name
                console.log('File in ZIP root, using default category:', category);
            } else if (pathParts.length === 2) {
                // CategoryName/image.jpg - use first part as category
                category = pathParts[0];
                filename = pathParts[1];
            } else {
                // Multiple levels - use second-to-last as category
                // e.g., memTrain/CategoryName/image.jpg -> CategoryName
                filename = pathParts[pathParts.length - 1];
                category = pathParts[pathParts.length - 2];
            }
            
            // Use image mapping if available, otherwise use filename
            let name;
            if (imageMappings[category] && imageMappings[category][filename]) {
                name = imageMappings[category][filename];
                console.log(`Using mapped name for ${filename}: ${name}`);
            } else {
                // Fallback to filename-based name
                name = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ');
                console.log(`No mapping found for ${filename}, using filename-based name: ${name}`);
            }
            
            try {
                // Create destination path in app's internal storage using new Paths API
                const imagesDir = new Directory(Paths.document, 'images');
                
                // Ensure images directory exists - use try-catch as create() may fail if exists
                try {
                    await imagesDir.create();
                } catch (createError) {
                    // Directory likely already exists, ignore error
                    if (!createError.message?.includes('already exists')) {
                        throw createError;
                    }
                }
                
                const categoryDir = new Directory(imagesDir, category);
                
                // Ensure category directory exists
                try {
                    await categoryDir.create();
                } catch (createError) {
                    // Directory likely already exists, ignore error
                    if (!createError.message?.includes('already exists')) {
                        throw createError;
                    }
                }
                
                const destFile = new File(categoryDir, filename);
                const destImagePath = destFile.uri;
                const relativeImagePath = category + '/' + filename;
                
                // Check if already deleted
                const isDeleted = await isItemDeleted(db, relativeImagePath);
                if (isDeleted) {
                    skipped++;
                    console.log('Skipping deleted item:', name);
                    continue;
                }
                
                // Check if already exists in database
                const existing = await db.getFirstAsync(
                    'SELECT id, name FROM items WHERE image_path = ?',
                    [relativeImagePath]
                );
                
                if (existing) {
                    // If item exists but name is different (e.g., was imported without mapping),
                    // update the name
                    if (existing.name !== name) {
                        await db.runAsync(
                            'UPDATE items SET name = ? WHERE id = ?',
                            [name, existing.id]
                        );
                        console.log(`Updated name for ${filename}: ${existing.name} -> ${name}`);
                        imported++;
                    } else {
                        skipped++;
                        console.log('Skipping existing item:', name);
                    }
                    continue;
                }
                
                // Extract image data as base64 string for writing
                const imageBase64 = await zipEntry.async('base64');
                
                // Write image to app's internal storage using legacy API (more reliable)
                await writeAsStringAsync(destFile.uri, imageBase64, { encoding: 'base64' });
                
                // Add to database
                await addItem(db, {
                    imagePath: relativeImagePath,
                    name: name,
                    category: category
                });
                
                imported++;
                console.log('Imported:', name);
                
            } catch (error) {
                console.error('Error importing image:', filename, error);
                errors.push(`Failed to import ${filename}: ${error.message}`);
                failed++;
            }
        }
        
        return {
            imported,
            skipped,
            failed,
            errors: errors.length > 0 ? errors : null
        };
        
    } catch (error) {
        console.error('Error during ZIP import:', error);
        throw error;
    }
}

/**
 * Get external storage path for images
 */
export function getExternalImagesPath() {
    // Android's public Documents directory
    return '/storage/emulated/0/Documents/memTrain/';
}

// Made with Bob
