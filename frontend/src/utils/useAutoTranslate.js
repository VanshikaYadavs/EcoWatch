/**
 * Custom hook for automatic translation with fallback
 * Uses manual translations from i18n.js first, then falls back to API translation
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { translateText } from './translationService';

/**
 * Hook that provides translation with automatic API fallback
 * @param {string} key - Translation key to look up
 * @param {string} fallbackText - Original text to translate if key not found
 * @param {boolean} enableAutoTranslate - Whether to use API translation as fallback
 * @returns {string} Translated text
 */
export const useAutoTranslate = (key, fallbackText, enableAutoTranslate = true) => {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(fallbackText);

  useEffect(() => {
    const getTranslation = async () => {
      // First, try to get translation from i18n.js
      const manualTranslation = t(key, { defaultValue: null });
      
      if (manualTranslation && manualTranslation !== key) {
        // Manual translation exists, use it
        setTranslatedText(manualTranslation);
        return;
      }

      // If no manual translation and auto-translate is enabled, use API
      if (enableAutoTranslate && i18n.language !== 'en' && fallbackText) {
        try {
          const apiTranslation = await translateText(fallbackText, i18n.language, 'en');
          setTranslatedText(apiTranslation);
        } catch (error) {
          console.error('Auto-translation failed:', error);
          setTranslatedText(fallbackText);
        }
      } else {
        setTranslatedText(fallbackText);
      }
    };

    getTranslation();
  }, [key, fallbackText, enableAutoTranslate, i18n.language, t]);

  return translatedText;
};

/**
 * Synchronous version that returns original text immediately
 * and triggers background translation
 * @param {string} text - Text to translate
 * @param {string} currentLang - Current language code
 * @returns {string} Text (original or translated)
 */
export const getAutoTranslatedText = (text, currentLang) => {
  if (!text || currentLang === 'en') {
    return text;
  }

  // Try to translate in background (non-blocking)
  translateText(text, currentLang, 'en')
    .then(translated => {
      // Translation will be cached for next time
    })
    .catch(err => {
      console.error('Background translation failed:', err);
    });

  return text;
};
