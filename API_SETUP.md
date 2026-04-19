# Fashion Trend Analyzer API Setup Guide

This guide will help you set up the real APIs used by the Fashion Trend Analyzer service to gather actual trend data instead of using simulated data.

## Required API Keys

The Fashion Trend Analyzer now uses real APIs to gather trend data from multiple sources. You'll need to obtain API keys for the services you want to use.

### 1. News API (Recommended - Free Tier Available)

**Purpose**: Gathers fashion news, runway coverage, and consumer behavior articles.

**Setup**:
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to your `.env` file:
   ```
   NEWS_API_KEY=your_news_api_key_here
   ```

**Free Tier**: 1,000 requests per day

### 2. Pinterest API (Optional)

**Purpose**: Gathers trending fashion pins and hashtags.

**Setup**:
1. Visit [Pinterest Developer Portal](https://developers.pinterest.com/)
2. Create a new app
3. Get your access token
4. Add to your `.env` file:
   ```
   PINTEREST_API_KEY=your_pinterest_access_token_here
   ```

**Rate Limit**: 100 requests per hour

### 3. Instagram API (Optional)

**Purpose**: Gathers trending fashion hashtags and engagement data.

**Setup**:
1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Get your access token
5. Add to your `.env` file:
   ```
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
   ```

**Rate Limit**: 200 requests per hour

### 4. Twitter API v2 (Optional)

**Purpose**: Gathers fashion-related tweets and sentiment analysis.

**Setup**:
1. Visit [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account
3. Create a new app
4. Get your Bearer Token
5. Add to your `.env` file:
   ```
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   ```

**Rate Limit**: 300 requests per 15 minutes

### 5. Google Trends API (Free - No Key Required)

**Purpose**: Gathers search trend data for fashion-related terms.

**Setup**: No setup required - the service uses the public Google Trends API.

**Rate Limit**: 50 requests per hour (approximate)

## Environment Variables Setup

Create or update your `.env` file in the root directory:

```env
# Required for AI functionality
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json

# API Keys for Trend Analysis
NEWS_API_KEY=your_news_api_key_here
PINTEREST_API_KEY=your_pinterest_access_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
GOOGLE_TRENDS_API_KEY=optional_google_trends_key
FASHIONISTA_API_KEY=optional_fashionista_api_key

# Other configuration
NODE_ENV=development
PORT=3001
```

## Installation

1. Install the new dependencies:
   ```bash
   npm install
   ```

2. Set up your API keys as described above

3. Start the server:
   ```bash
   npm start
   ```

## API Usage and Fallbacks

The Fashion Trend Analyzer is designed to work with or without API keys:

- **With API Keys**: Uses real data from the configured APIs
- **Without API Keys**: Falls back to simulated data (original behavior)
- **Partial Configuration**: Uses available APIs and falls back for missing ones

## Rate Limiting

The service includes built-in rate limiting to respect API limits:

- **Pinterest**: 100 requests/hour
- **Instagram**: 200 requests/hour  
- **Twitter**: 300 requests/15 minutes
- **News API**: 1,000 requests/day
- **Google Trends**: 50 requests/hour

## Data Sources

### Social Media Trends
- **Pinterest**: Trending fashion pins and hashtags
- **Instagram**: Fashion hashtag popularity
- **Twitter**: Fashion-related tweets and sentiment

### Search Trends
- **Google Trends**: Rising fashion searches
- **News API**: Fashion-related news coverage

### Runway Trends
- **News API**: Fashion week and runway coverage
- **Fashionista API**: Professional runway analysis (if available)

### Street Style Trends
- **Instagram**: Street style hashtags
- **Twitter**: Street style discussions
- **News API**: Street style coverage

### Consumer Behavior
- **News API**: Consumer behavior articles
- **Twitter**: Consumer sentiment analysis

## Testing the APIs

You can test if your APIs are working by checking the configuration:

```javascript
import { checkApiKeysConfigured, getAvailableApis } from './config/apiKeys.js';

console.log('Configured APIs:', checkApiKeysConfigured());
console.log('Available APIs:', getAvailableApis());
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correct
   - Check if the API service is available
   - Ensure you're within rate limits

2. **Rate Limit Exceeded**
   - The service will automatically fall back to simulated data
   - Wait for the rate limit window to reset

3. **Network Errors**
   - Check your internet connection
   - Verify API endpoints are accessible
   - The service will fall back gracefully

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

This will show detailed API request/response information.

## Cost Considerations

- **News API**: Free tier available, paid plans for higher limits
- **Pinterest**: Free for basic usage
- **Instagram**: Free for basic usage
- **Twitter**: Free tier available, paid plans for higher limits
- **Google Trends**: Free

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor API usage to avoid unexpected costs

## Support

If you encounter issues with specific APIs:

1. Check the API provider's documentation
2. Verify your API keys and permissions
3. Test the API directly using tools like Postman
4. Check the service logs for detailed error messages

The Fashion Trend Analyzer will continue to work with fallback data even if some APIs are unavailable.
