# Football Data Scraping Setup Guide

This guide explains how to set up and use the web scraping functionality for live football data in your Algeria National Team website.

## Data Sources

The application supports multiple data sources:

1. **Football-Data.org API** (Primary) - Free tier available
2. **ESPN Football** (Web scraping with CORS proxy)
3. **Goal.com** (Web scraping alternative)
4. **Mock data** (Fallback for development/demo)

## Setup Instructions

### 1. Get API Keys

#### Football-Data.org (Recommended)
1. Visit [https://www.football-data.org/](https://www.football-data.org/)
2. Register for a free account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file:
   ```
   VITE_FOOTBALL_API_KEY=your_actual_api_key_here
   ```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit the file and add your API keys
VITE_FOOTBALL_API_KEY=your_football_data_api_key
```

### 3. CORS Configuration (For Web Scraping)

If using web scraping from sports websites, you'll need a CORS proxy:

#### Option 1: Use CORS Anywhere (Development)
- The app uses `https://cors-anywhere.herokuapp.com/` by default
- Visit the demo URL and request temporary access for development

#### Option 2: Set up your own CORS proxy
- Deploy your own CORS proxy server
- Update the proxy URL in `footballDataService.js`

### 4. Supported Data

The application fetches:
- **Next matches** - Upcoming fixtures with dates, opponents, venues
- **Recent results** - Last 5-10 match results with scores
- **Team standings** - League/tournament position and statistics
- **Player statistics** - Goals, assists, appearances (mock data for now)

## Implementation Details

### FootballStats Component
- Located at: `src/components/FootballStats.jsx`
- Displays live football data in a modern, responsive UI
- Auto-refreshes every 30 minutes
- Gracefully falls back to mock data if APIs fail

### Data Service
- Located at: `src/services/footballDataService.js`
- Handles API calls and web scraping
- Implements fallback mechanisms
- Caches data for better performance

### Styling
- Located at: `src/components/FootballStats.css`
- Matches the existing website theme
- Green and red color scheme matching Algeria's colors
- Fully responsive design

## Customization

### Adding New Data Sources

1. **Add API integration:**
   ```javascript
   // In footballDataService.js
   async getDataFromNewAPI() {
     const response = await axios.get('https://api.example.com/data');
     return this.formatData(response.data);
   }
   ```

2. **Add web scraping:**
   ```javascript
   async scrapeFromWebsite() {
     const proxyUrl = 'https://api.allorigins.win/get?url=';
     const targetUrl = 'https://example-sports-site.com/algeria';
     // Implement scraping logic
   }
   ```

### Updating Team Information
- Edit team ID in `footballDataService.js` (line 6)
- Update team names and identifiers as needed
- Modify mock data structure for different data formats

### Styling Customization
- Colors: Modify CSS variables in `FootballStats.css`
- Layout: Adjust grid layouts and responsive breakpoints
- Animations: Customize hover effects and transitions

## API Rate Limits

### Football-Data.org Free Tier
- 10 requests per minute
- 12 calls per day for competitions
- Sufficient for this application's needs

### Best Practices
- Data is cached and refreshed every 30 minutes
- Failed requests fall back to mock data
- Multiple API calls are batched using Promise.allSettled()

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Use a CORS proxy for web scraping
   - APIs like Football-Data.org have CORS enabled

2. **API Key Not Working**
   - Verify the key is correct in `.env.local`
   - Check if the key has required permissions
   - Ensure the file name is `.env.local` not `.env`

3. **Data Not Loading**
   - Check browser console for errors
   - Verify network connectivity
   - Mock data should load if all APIs fail

4. **Rate Limiting**
   - Football-Data.org has generous limits for free tier
   - Implement exponential backoff if needed

### Development Mode
- Mock data is always available for development
- Set `VITE_FOOTBALL_API_KEY=demo` to use demo data
- No external dependencies required for basic functionality

## Security Considerations

- API keys are environment variables (not committed to git)
- CORS proxy is only needed for client-side scraping
- Consider server-side scraping for production applications
- Implement request rate limiting and caching

## Future Enhancements

1. **Player Statistics API Integration**
2. **Live Match Scores** (WebSocket implementation)
3. **Historical Data Storage** (Database integration)
4. **Social Media Integration** (Twitter, Instagram feeds)
5. **Match Notifications** (Push notifications)
6. **Multi-language Support** (Arabic, French translations)

## Production Deployment

For production use:
1. Set up proper CORS configuration
2. Implement server-side API calls
3. Add data caching (Redis/memory cache)
4. Set up monitoring for API failures
5. Consider premium API tiers for more data

---

**Note:** This implementation prioritizes reliability by using mock data as fallback, ensuring the website always displays relevant content even when external APIs are unavailable.
