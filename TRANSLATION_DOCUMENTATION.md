# EcoWatch Translation System - Complete Documentation

## Overview
EcoWatch uses a **hybrid translation approach** combining manual translations with automatic API fallback.

## Translation Architecture

### 1. Manual Translations (Primary)
**Location**: `frontend/src/i18n.js`
- Contains 3300+ translation keys for 5 languages
- Always takes priority over API translation
- Guaranteed accuracy and cultural appropriateness

**Languages Supported**:
- English (en)
- Hindi (hi)
- Marathi (mr)
- Gujarati (gu)
- Punjabi (pa)

### 2. Automatic Translation (Fallback)
**Location**: `frontend/src/utils/translationService.js`
- Uses Google Cloud Translation API v2
- Only activates when manual translation doesn't exist
- Results cached in localStorage to minimize API calls

## How Translation Resolution Works

```
User requests translation for "New Location Name"
    ↓
1. Check i18n.js for translation key
    ↓
   Found? → Return manual translation ✅
    ↓
   Not Found ↓
    ↓
2. Check localStorage cache
    ↓
   Found? → Return cached API translation ✅
    ↓
   Not Found ↓
    ↓
3. Call Google Translation API
    ↓
   Success? → Cache & return translated text ✅
    ↓
   Failed ↓
    ↓
4. Return original text as fallback
```

## Components with Translation Integration

### Air Quality Monitor
**File**: `frontend/src/pages/air-quality-monitor/index.jsx`
- Manual location mappings for Rajasthan locations
- API fallback for unmapped backend locations
- Translates location names in charts and tables

### Noise Level Tracking
**File**: `frontend/src/pages/noise-level-tracking/index.jsx`
- Zone type translations (Commercial, Educational, etc.)
- Location name translations
- API fallback enabled

### Shared UI: Select Component
**File**: `frontend/src/components/ui/Select.jsx`
- Uses manual i18n keys for placeholder and messages
- Falls back to automatic API translation if a key is missing in the current language
- Non-blocking updates: renders immediately, then re-renders when translation arrives

### Header & NotFound Pages
**Files**:
- `frontend/src/components/ui/Header.jsx`
- `frontend/src/pages/NotFound.jsx`
- Both now use `useAutoTranslate()` for common labels (title, subtitle, login, 404 texts) to ensure graceful fallback.

### Alert Configuration
**File**: `frontend/src/pages/air-quality-monitor/components/AlertConfiguration.jsx`
- All UI text uses manual translations
- Input labels, descriptions, button text
- No API needed (complete manual coverage)

## Translation Keys Structure

### Zone Types
```javascript
"zones.commercial": "Commercial"      // English
"zones.commercial": "वाणिज्यिक"       // Hindi
"zones.commercial": "व्यापारी"       // Marathi
"zones.commercial": "વાણિજ્યિક"     // Gujarati
"zones.commercial": "ਵਪਾਰਕ"          // Punjabi
```

### Location Names
```javascript
"locations.miRoad": "MI Road, Jaipur"
"locations.clockTower": "Clock Tower, Jodhpur"
"locations.lakePichola": "Lake Pichola, Udaipur"
// ... etc
```

### Alert Messages
```javascript
"alerts.highAqi": "High AQI Detected"
"alerts.elevatedNoise": "Elevated Noise Levels"
// ... etc
```

## Adding New Manual Translations

### Step 1: Add to English Section
```javascript
// In frontend/src/i18n.js, English section (~line 470+)
"newKey": "English Text",
```

### Step 2: Add to All Other Languages
```javascript
// Hindi section (~line 1150+)
"newKey": "हिंदी अनुवाद",

// Marathi section (~line 1550+)
"newKey": "मराठी भाषांतर",

// Gujarati section (~line 2168+)
"newKey": "ગુજરાતી અનુવાદ",

// Punjabi section (~line 2785+)
"newKey": "ਪੰਜਾਬੀ ਅਨੁਵਾਦ",
```

### Step 3: Use in Component
```javascript
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '../utils/useAutoTranslate';

const MyComponent = () => {
  const { t } = useTranslation();
    // Prefer manual translation; fallback to API if missing in current language
    const label = useAutoTranslate('newKey', 'English Text', true);
  
    return <div>{label}</div>;
};
```

## Translation API Setup

### Requirements
- Google Cloud Platform account
- Cloud Translation API enabled
- API key with Translation API access

### Configuration
1. Create `.env` file in `frontend/` directory
2. Add API key:
   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```
3. Restart dev server

### Cost Management
- **Caching**: Translations cached in localStorage
- **Free Tier**: 500,000 characters/month
- **Typical Usage**: ~10-50 API calls per user per session
- **Cost**: $20 per 1M characters after free tier

## Cache Management

### View Cache
```javascript
// In browser console
JSON.parse(localStorage.getItem('ecowatch_translation_cache'))
```

### Clear Cache
```javascript
// In browser console
localStorage.removeItem('ecowatch_translation_cache')
// Or
import { clearTranslationCache } from './utils/translationService';
clearTranslationCache();
```

## Testing Translations

### Test Manual Translations
1. Switch language using UI selector
2. Navigate to different pages
3. Verify all static text translates

### Test API Fallback
1. Add API key to `.env`
2. Add new UI text or backend location without manual translation
3. Verify it translates automatically where `useAutoTranslate()` is used (Select, Header, NotFound, pages with dynamic content)
4. Check localStorage for cached translation and console for API logs

### Test Cache
1. Translate unmapped location
2. Check localStorage for cached entry
3. Refresh page - should use cached version (no API call)

## Troubleshooting

### Issue: Translations not working
**Solution**: 
- Check i18n.js for syntax errors
- Verify translation key exists in all language sections
- Hard refresh browser (Ctrl+Shift+R)

### Issue: API translation not working
**Solution**:
- Verify `.env` file has correct API key
- Check API key has Translation API enabled
- Check browser console for errors
- Verify internet connection

### Issue: Mixed languages appearing
**Solution**:
- Clear translation cache
- Check for duplicate keys in i18n.js
- Verify language selector is working

### Issue: New locations showing in English
**Solution**:
- Add API key to enable automatic translation
- Or add manual translations for the locations
- Check console for "Unmapped location" messages

## Best Practices

### When to Use Manual Translations
- ✅ UI text (buttons, labels, headers)
- ✅ Alert messages
- ✅ System messages
- ✅ Known locations
- ✅ Technical terms

### When to Rely on API Translation
- ✅ User-generated content
- ✅ Dynamic location names from database
- ✅ Temporary/testing data
- ✅ Rare edge cases

### Performance Optimization
- Keep manual translations for frequently used text
- Cache API translations aggressively
- Use batch translation for multiple items
- Lazy-load translations when possible

## Migration Guide

### From English-only to Multilingual
1. Identify all hardcoded strings
2. Add to i18n.js English section with keys
3. Translate to all languages (manual or API)
4. Replace hardcoded strings with t('key')
5. Test in all languages

### Adding New Language
1. Add language code to i18n.js resources
2. Copy English section structure
3. Translate all keys
4. Add to language selector
5. Update translationService.js LANGUAGE_CODES

## API Reference

### translationService.js

#### `translateText(text, targetLang, sourceLang)`
Translate single text string.

**Parameters**:
- `text`: String to translate
- `targetLang`: Target language code (en, hi, mr, gu, pa)
- `sourceLang`: Source language (optional, auto-detect if null)

**Returns**: Promise<string>

#### `translateBatch(texts, targetLang, sourceLang)`
Translate multiple strings efficiently.

**Parameters**:
- `texts`: Array of strings
- `targetLang`: Target language code
- `sourceLang`: Source language (optional)

**Returns**: Promise<string[]>

#### `clearTranslationCache()`
Clear all cached translations.

**Returns**: void

#### `isTranslationApiConfigured()`
Check if API key is set.

**Returns**: boolean

### useAutoTranslate.js

#### `useAutoTranslate(key, fallbackText, enableAutoTranslate)`
React hook for automatic translation.

**Parameters**:
- `key`: Translation key to look up
- `fallbackText`: Text to translate if key not found
- `enableAutoTranslate`: Enable API fallback (default: true)

**Returns**: string (translated text)

## Summary

Your EcoWatch application now has:
- ✅ 3300+ manual translations for 5 languages
- ✅ Automatic API translation for unmapped content
- ✅ Smart caching to reduce API costs
- ✅ Graceful fallbacks at every level
- ✅ Complete translation coverage for all major UI elements

**Your existing translations are protected** - they will always be used first. The API only helps with new, unmapped locations.
