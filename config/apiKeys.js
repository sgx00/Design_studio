// API Keys Configuration for Fashion Trend Analyzer
// Add your actual API keys to your .env file

export const API_KEYS_CONFIG = {
  // Pinterest API
  PINTEREST_API_KEY: process.env.PINTEREST_API_KEY || null,
  
  // Instagram API (requires Instagram Basic Display API)
  INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN || null,
  
  // Twitter API v2 (requires Twitter Developer Account)
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || null,
  
  // News API (free tier available)
  NEWS_API_KEY: process.env.NEWS_API_KEY || null,
  
  // Google Trends API (free, no key required but rate limited)
  GOOGLE_TRENDS_API_KEY: process.env.GOOGLE_TRENDS_API_KEY || null,
  
  // Fashionista API (example - replace with actual fashion API)
  FASHIONISTA_API_KEY: process.env.FASHIONISTA_API_KEY || null
};

// API Rate Limits Configuration
export const RATE_LIMITS = {
  pinterest: {
    calls: 0,
    limit: 100,
    resetTime: Date.now() + 3600000, // 1 hour
    window: 3600000
  },
  instagram: {
    calls: 0,
    limit: 200,
    resetTime: Date.now() + 3600000, // 1 hour
    window: 3600000
  },
  twitter: {
    calls: 0,
    limit: 300,
    resetTime: Date.now() + 900000, // 15 minutes
    window: 900000
  },
  newsApi: {
    calls: 0,
    limit: 1000,
    resetTime: Date.now() + 86400000, // 24 hours
    window: 86400000
  },
  googleTrends: {
    calls: 0,
    limit: 50,
    resetTime: Date.now() + 3600000, // 1 hour
    window: 3600000
  }
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
  pinterest: 'https://api.pinterest.com/v5/pins/search',
  instagram: 'https://graph.instagram.com/v12.0/ig_hashtag_search',
  twitter: 'https://api.twitter.com/2/tweets/search/recent',
  newsApi: 'https://newsapi.org/v2/everything',
  googleTrends: 'https://trends.google.com/trends/api/dailytrends',
  fashionista: 'https://api.fashionista.com/v1/trends'
};

// Fashion Keywords for Trend Analysis
export const FASHION_KEYWORDS = [
  'fashion trends', 'sustainable fashion', 'street style', 'runway fashion',
  'minimalist fashion', 'oversized fashion', 'earth tones', 'neutral fashion',
  'tech wear', 'athleisure', 'slow fashion', 'ethical fashion', 'vintage fashion',
  'gender neutral fashion', 'plus size fashion', 'luxury fashion', 'fast fashion',
  'capsule wardrobe', 'upcycled fashion', 'organic fashion', 'recycled fashion'
];

// Helper function to check if API keys are configured
export const checkApiKeysConfigured = () => {
  const configured = {};
  Object.keys(API_KEYS_CONFIG).forEach(key => {
    configured[key] = !!API_KEYS_CONFIG[key];
  });
  return configured;
};

// Helper function to get available APIs
export const getAvailableApis = () => {
  const configured = checkApiKeysConfigured();
  return Object.keys(configured).filter(key => configured[key]);
};

export default {
  API_KEYS_CONFIG,
  RATE_LIMITS,
  API_ENDPOINTS,
  FASHION_KEYWORDS,
  checkApiKeysConfigured,
  getAvailableApis
};
