# Alert Suggestions Feature

## Overview
The EcoWatch backend now sends contextual suggestions with environmental alerts via email. When a user receives an alert for AQI, noise, or temperature threshold violations, they also receive actionable recommendations based on the severity of the reading.

## Features

### Automatic Suggestions by Type

#### 🌫️ AQI (Air Quality Index)
- **AQI ≥ 301**: Very Unhealthy Air - Avoid outdoor activities, use N95 masks
- **AQI ≥ 201**: Unhealthy Air - Limit outdoor activities, vulnerable groups stay indoors
- **AQI ≥ 151**: Unhealthy for Sensitive Groups - Children, elderly should reduce activities
- **AQI ≥ 101**: Moderate Air Quality - Keep activities limited

#### 🔊 Noise Level
- **≥ 85 dB**: High Noise - Use hearing protection and noise-cancelling headphones
- **≥ 70 dB**: Elevated Noise - Higher than normal pollution, avoid if possible

#### 🌡️ Temperature
- **≥ 40°C**: Extreme Heat - Stay hydrated, avoid sunlight, keep cool spaces accessible
- **≥ 35°C**: High Temperature - Stay hydrated, avoid intense outdoor activities

## Implementation

### Modified Files

#### [alerts.mjs](../src/alerts.mjs)
- Added `generateSuggestions()` function that analyzes environmental readings and generates context-aware recommendations
- Updated alert email templates to include a suggestions section
- Suggestions appear in a green highlighted box in the email

#### [index.mjs](../src/index.mjs)
- Added `/api/test-alert-with-suggestions` endpoint for testing the feature
- Allows developers to send test alerts with custom environmental values

### Email Template
The alert emails now include:
1. **Alert Header** - Shows alert type and location
2. **Details** - Current values and thresholds
3. **Suggestions Section** (NEW) - Context-aware recommendations based on severity
4. **Footer** - Call to action and company info

## Usage

### Manual Testing

Use the test script to send a test alert:

```bash
# High AQI alert
node scripts/test-alert-suggestions.mjs user@example.com 350

# High noise alert
node scripts/test-alert-suggestions.mjs user@example.com 0 90

# High temperature alert
node scripts/test-alert-suggestions.mjs user@example.com 0 0 42

# Combined alert
node scripts/test-alert-suggestions.mjs user@example.com 250 75 38 "Jaipur"
```

### API Endpoint

Send a POST request to `/api/test-alert-with-suggestions`:

```bash
curl -X POST http://localhost:8083/api/test-alert-with-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "aqi": 350,
    "noise_level": 75,
    "temperature": 38,
    "location": "Jaipur"
  }'
```

**Request Parameters:**
- `to` (required): Recipient email address
- `aqi` (optional): Air Quality Index value
- `noise_level` (optional): Noise level in decibels
- `temperature` (optional): Temperature in Celsius
- `location` (optional): Location name (default: "Test Location")

**Response:**
```json
{
  "ok": true,
  "message": "Alert with suggestions sent successfully",
  "suggestions": [
    "⚠️ Very Unhealthy Air: Avoid outdoor activities. Use N95 masks if you must go out.",
    "🔊 Elevated Noise: The area is experiencing higher than normal noise pollution. Avoid if possible.",
    "☀️ High Temperature: Stay hydrated and avoid intense outdoor activities during peak heat hours."
  ],
  "alertType": "AQI"
}
```

### Automatic Alerts

When the scheduler runs and detects threshold violations, alerts with suggestions are automatically sent to users who:
1. Have email alerts enabled
2. Have matching threshold values
3. Have a valid email address in the system

## Technical Details

### Suggestion Generation Algorithm

The `generateSuggestions()` function:
1. Accepts a reading object with environmental metrics
2. Evaluates each metric against predefined severity thresholds
3. Returns an array of suggestion strings (empty if no threshold violations)
4. Uses emoji prefixes for visual organization in emails

### Email Rate Limiting

The email system includes rate limiting:
- Default: 15-minute minimum interval between emails to the same user
- Configurable via `EMAIL_MIN_INTERVAL_MINUTES` environment variable
- Prevents email spam while allowing important alerts through

### Data Flow

```
Environmental Reading
    ↓
evaluateAndRecordAlerts()
    ↓
generateSuggestions() → Create alert with suggestions
    ↓
sendEmail() → HTML email with formatted suggestions
    ↓
User receives actionable alert
```

## Future Enhancements

Possible improvements:
- [ ] Machine learning-based personalized suggestions
- [ ] Historical data analysis to predict future conditions
- [ ] Integration with local health/weather APIs for more context
- [ ] User-defined suggestion templates
- [ ] Multi-language support for suggestions
- [ ] Suggestion analytics to track which are most helpful

## Testing

The feature includes:
- Test script: `scripts/test-alert-suggestions.mjs`
- Existing test files: `scripts/test-alerts.mjs`, `scripts/test-real-emails.mjs`
- API endpoint for manual testing

To verify suggestions are sent:
1. Ensure SENDGRID_API_KEY is configured
2. Run the test script with a valid email
3. Check the recipient's inbox for the alert email
4. Verify suggestions section appears in the email
