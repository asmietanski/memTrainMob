import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@memTrain_settings';
const DEFAULT_MAX_NEW_ITEMS = 30;

/**
 * Get user settings
 */
export async function getSettings() {
    try {
        const settings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (settings) {
            return JSON.parse(settings);
        }
        return {
            maxNewItemsPerDay: DEFAULT_MAX_NEW_ITEMS
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return {
            maxNewItemsPerDay: DEFAULT_MAX_NEW_ITEMS
        };
    }
}

/**
 * Save user settings
 */
export async function saveSettings(settings) {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Get max new items per day setting
 */
export async function getMaxNewItemsPerDay() {
    const settings = await getSettings();
    return settings.maxNewItemsPerDay || DEFAULT_MAX_NEW_ITEMS;
}

// Made with Bob
