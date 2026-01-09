// Storage utility functions for TailorAI
// Wrapper around chrome.storage.local API

/**
 * Save CV text and metadata to storage
 */
async function saveCVData(cvText, metadata) {
  try {
    await chrome.storage.local.set({
      cvText: cvText,
      cvMetadata: metadata
    });
    console.log('CV data saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving CV data:', error);
    throw error;
  }
}

/**
 * Get CV text from storage
 */
async function getCVText() {
  try {
    const result = await chrome.storage.local.get(['cvText']);
    return result.cvText || null;
  } catch (error) {
    console.error('Error getting CV text:', error);
    throw error;
  }
}

/**
 * Get CV metadata from storage
 */
async function getCVMetadata() {
  try {
    const result = await chrome.storage.local.get(['cvMetadata']);
    return result.cvMetadata || null;
  } catch (error) {
    console.error('Error getting CV metadata:', error);
    throw error;
  }
}

/**
 * Check if CV exists in storage
 */
async function hasCVData() {
  try {
    const result = await chrome.storage.local.get(['cvText', 'cvMetadata']);
    return !!(result.cvText && result.cvMetadata);
  } catch (error) {
    console.error('Error checking CV data:', error);
    return false;
  }
}

/**
 * Delete CV data from storage
 */
async function deleteCVData() {
  try {
    await chrome.storage.local.remove(['cvText', 'cvMetadata']);
    console.log('CV data deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting CV data:', error);
    throw error;
  }
}

/**
 * Save OpenAI API key to storage
 */
async function saveApiKey(apiKey) {
  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    console.log('API key saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}

/**
 * Get OpenAI API key from storage
 */
async function getApiKey() {
  try {
    const result = await chrome.storage.local.get(['openaiApiKey']);
    return result.openaiApiKey || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    throw error;
  }
}

/**
 * Save user settings to storage
 */
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ settings: settings });
    console.log('Settings saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get user settings from storage
 */
async function getSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    return result.settings || {
      letterTone: 'professional',
      includeSignature: true
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      letterTone: 'professional',
      includeSignature: true
    };
  }
}

/**
 * Clear all storage data (for testing or reset)
 */
async function clearAllData() {
  try {
    await chrome.storage.local.clear();
    console.log('All storage data cleared');
    return { success: true };
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

// Export functions for use in other scripts
// Note: In Chrome extensions, we'll need to include this script in HTML files
// or use it directly in the context where chrome.storage is available
