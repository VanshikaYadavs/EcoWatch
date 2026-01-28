/**
 * Translation Service
 * Provides automatic translation fallback via backend API
 * Manual translations in i18n.js always take priority
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const TRANSLATION_CACHE_KEY = 'ecowatch_translation_cache';

// Language code mapping
const LANGUAGE_CODES = {
  en: 'en',
  hi: 'hi',
  mr: 'mr',
  gu: 'gu',
  pa: 'pa'
};

/**
 * Get cached translation from localStorage
 */
export const getCachedTranslation = (text, targetLang) => {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
    const key = `${text}_${targetLang}`;
    return cache[key];
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return null;
  }
};

/**
 * Save translation to localStorage cache
 */
const setCachedTranslation = (text, targetLang, translatedText) => {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
    const key = `${text}_${targetLang}`;
    cache[key] = translatedText;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving translation cache:', error);
  }
};

/**
 * Translate text via backend API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, hi, mr, gu, pa)
 * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang, sourceLang = null) => {
  // Check cache first
  const cached = getCachedTranslation(text, targetLang);
  if (cached) {
    return cached;
  }

  try {
    const requestBody = {
      text,
      targetLang,
      sourceLang
    };

    const response = await fetch(`${BACKEND_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText;

    // Cache the translation
    setCachedTranslation(text, targetLang, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    // Return original text on error
    return text;
  }
};

/**
 * Translate multiple texts in batch (more efficient)
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateTextBatch = async (texts, targetLang, sourceLang = null) => {
  try {
    // Check each text in cache first
    const cached = texts.map(text => ({
      text,
      cached: getCachedTranslation(text, targetLang)
    }));

    // Get uncached texts
    const uncached = cached.filter(item => !item.cached).map(item => item.text);
    
    if (uncached.length === 0) {
      // All texts are cached
      return texts.map(text => getCachedTranslation(text, targetLang) || text);
    }

    // Translate uncached texts via backend
    const requestBody = {
      text: uncached.join('\n||||\n'), // Use delimiter for batch
      targetLang,
      sourceLang
    };

    const response = await fetch(`${BACKEND_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedTexts = data.translatedText.split('\n||||\n');

    // Cache all translations
    uncached.forEach((text, index) => {
      setCachedTranslation(text, targetLang, translatedTexts[index]);
    });

    // Return results with cached values
    return texts.map(text => {
      const cacheIndex = cached.findIndex(item => item.text === text);
      if (cached[cacheIndex].cached) return cached[cacheIndex].cached;
      
      const uncachedIndex = uncached.indexOf(text);
      return translatedTexts[uncachedIndex] || text;
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  try {
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
    console.log('Translation cache cleared');
  } catch (error) {
    console.error('Error clearing translation cache:', error);
  }
};

/**
 * Check if translation API is configured
 */
export const isTranslationApiConfigured = () => {
  // Backend route handles API key presence; frontend does not expose it
  return true;
};
