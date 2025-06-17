# Google Places API Setup Guide

This guide will help you set up Google Places API to get real phone numbers and enhanced data for nearby medical facilities.

## Why Google Places API?

- ✅ **Real Phone Numbers**: Get actual phone numbers for medical facilities
- ✅ **Rich Data**: Business hours, ratings, websites, detailed addresses
- ✅ **High Quality**: Verified business information
- ✅ **Global Coverage**: Works worldwide with consistent data format
- ✅ **Rate Limits**: 1000 requests per day for free tier

## Step 1: Get Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

## Step 2: Enable Places API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Places API"
3. Click on **Places API** and click **Enable**
4. Also enable **Places API (New)** for enhanced features

## Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key (it will look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 4: Secure Your API Key (Important!)

1. Click on your API key to edit it
2. Under **Application restrictions**, choose:
   - **HTTP referrers (web sites)** if using on web
   - **Android apps** if using on Android
   - **iOS apps** if using on iOS
3. Under **API restrictions**, select **Restrict key** and choose:
   - Places API
   - Places API (New)

## Step 5: Configure in Your App

1. Open `services/placesApi.ts`
2. Replace `YOUR_GOOGLE_PLACES_API_KEY` with your actual API key:
   ```typescript
   const GOOGLE_PLACES_API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

## Step 6: Test the Integration

1. Run your app
2. Navigate to the Location tab
3. Check the console logs for Google Places API results
4. Verify that facilities now show real phone numbers

## API Usage & Costs

### Free Tier
- **Places Nearby Search**: 1000 requests/day free
- **Place Details**: 1000 requests/day free
- After free tier: $17 per 1000 requests

### Our Implementation
- Searches for 5 types of medical facilities
- Gets detailed info for each result
- Typical usage: 20-50 API calls per search
- **Estimated daily usage**: 200-500 calls for active users

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Make sure you replaced `YOUR_GOOGLE_PLACES_API_KEY` with your actual key

2. **"Google Places API error: REQUEST_DENIED"**
   - Check that Places API is enabled in Google Cloud Console
   - Verify your API key has the correct restrictions

3. **"OVER_QUERY_LIMIT"**
   - You've exceeded the free tier limit
   - Consider upgrading to paid plan or implement request caching

4. **No phone numbers found**
   - Some businesses don't provide phone numbers
   - Our fallback system will generate placeholder numbers

### Debugging

Enable detailed logging by checking the browser console or terminal output for:
```
🔍 Searching Google Places for: hospital
📍 Google Places found 5 hospital facilities
✅ Got phone number for: City General Hospital
```

## Alternative Free Options

If you prefer not to use Google Places API, the app will fallback to:

1. **LocationIQ API** (free tier: 5000 requests/day)
2. **OpenStreetMap Overpass API** (completely free)
3. **Nominatim API** (completely free)
4. **Simulated data** (as final fallback)

## Best Practices

1. **Cache Results**: We cache results for 30 minutes to reduce API usage
2. **Rate Limiting**: Built-in delays between requests
3. **Fallback System**: Multiple data sources ensure reliability
4. **Error Handling**: Graceful degradation if APIs fail

## Support

If you need help setting up Google Places API:
1. Check the [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
2. Review the console logs for specific error messages
3. Test with a simple API call in your browser or Postman
