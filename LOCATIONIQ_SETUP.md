# LocationIQ Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Free API Key

1. Go to [https://locationiq.com/](https://locationiq.com/)
2. Click "Sign Up" (free tier: 5,000 requests/day)
3. Verify your email
4. Go to Dashboard → Access Tokens
5. Copy your API key

### 2. Add API Key to Your App

1. Open `services/placesApi.ts`
2. Replace `YOUR_LOCATIONIQ_API_KEY` with your actual API key:
   ```typescript
   const LOCATIONIQ_API_KEY = "pk.abc123..."; // Your actual key
   ```

### 3. Test the Integration

1. Run your app: `npm start`
2. Allow location permissions
3. Go to Location tab
4. Check console for: `📍 LocationIQ found: X facilities`

## 📊 What You Get with LocationIQ

✅ **Real business names** (not generic "Local Pharmacy")
✅ **Accurate addresses** and contact info
✅ **5,000 free requests/day** (enough for most apps)
✅ **Multiple medical facility types**
✅ **Smart fallback** to OpenStreetMap if needed

## 🎯 Expected Results

Instead of:

- ❌ "Local Pharmacy"
- ❌ "Urgent Care Center"

You'll see:

- ✅ "CVS Pharmacy #1234"
- ✅ "St. Mary's Hospital"
- ✅ "Downtown Medical Clinic"
- ✅ "Dr. Smith Family Practice"

## 🔧 Console Messages to Look For

```
🔍 Searching REAL medical facilities near 40.7128, -74.0060
📍 LocationIQ found: 8 facilities
📍 OSM Overpass found: 12 facilities
✅ Total REAL facilities found: 15
```

## 💡 Pro Tips

1. **Free Tier Limits**: 5,000 requests/day, 2 requests/second
2. **Caching**: Results are cached for 30 minutes to save API calls
3. **Fallback**: If LocationIQ fails, it automatically uses OpenStreetMap
4. **Rate Limiting**: Built-in delays to respect API limits

## 🆘 Need Help?

If you see generic names like "Local Pharmacy", it means:

1. API key not configured correctly
2. No real facilities found in your area (try different location)
3. API reached daily limit (check LocationIQ dashboard)

Check the console logs for specific error messages!
