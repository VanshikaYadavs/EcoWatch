# Google Cloud Translation API Setup Guide

## Step 1: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Cloud Translation API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Translation API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

## Step 2: Add API Key to Your Project

1. Create `.env` file in `frontend/` directory (if it doesn't exist)
2. Add your API key:
   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
   ```
3. Save the file

## Step 3: Restart Frontend Server

```bash
cd frontend
npm run start
```

## How It Works

### Priority System
1. **Manual translations** (your existing translations in i18n.js) are ALWAYS used first
2. **API translation** only triggers for unmapped/new locations
3. **Cache**: API translations are cached in browser localStorage to minimize API calls

### Features
- ✅ Automatic translation of new locations
- ✅ All your manual translations remain unchanged
- ✅ Caching reduces API costs
- ✅ Graceful fallback if API fails
- ✅ Works for all 5 languages (English, Hindi, Marathi, Gujarati, Punjabi)

### Example
```javascript
// Existing location - uses manual translation
"MI Road, Jaipur" → "एमआई रोड, जयपूर" (from i18n.js)

// New location - uses API translation
"Amber Fort, Jaipur" → "आमेर किला, जयपूर" (from Google API)
```

## Cost Estimation

- **Free Tier**: 500,000 characters/month
- **Paid**: $20 per 1 million characters
- **Typical Usage**: Each location name ~20 characters = 25,000 translations free per month

## API Restrictions (Optional Security)

Restrict your API key to only allow Translation API:
1. Go to Google Cloud Console → Credentials
2. Edit your API key
3. Under "API restrictions", select "Restrict key"
4. Check only "Cloud Translation API"

## Troubleshooting

**API key not working?**
- Make sure Cloud Translation API is enabled
- Verify `.env` file is in `frontend/` directory
- Restart the dev server after adding the key

**Still showing English?**
- Check browser console for errors
- Verify API key in `.env` starts with `VITE_`
- Hard refresh: Ctrl+Shift+R

## Disable API Translation

To disable and use only manual translations:
- Remove or comment out the API key in `.env`
- Unmapped locations will show as-is from backend
