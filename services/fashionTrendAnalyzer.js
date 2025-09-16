import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { API_KEYS_CONFIG, RATE_LIMITS, API_ENDPOINTS, FASHION_KEYWORDS } from '../config/apiKeys.js';

class FashionTrendAnalyzer {
  constructor() {
    // Initialize VertexAI for trend analysis
    this.ai = new GoogleGenAI({
      vertexai: true,
      project: 'garment-design-ai-2025',
      location: 'global'
    });
    this.model = 'gemini-2.0-flash-exp';

    // API Configuration - Load from configuration file
    this.apiKeys = {
      pinterest: API_KEYS_CONFIG.PINTEREST_API_KEY,
      instagram: API_KEYS_CONFIG.INSTAGRAM_ACCESS_TOKEN,
      twitter: API_KEYS_CONFIG.TWITTER_BEARER_TOKEN,
      newsApi: API_KEYS_CONFIG.NEWS_API_KEY,
      googleTrends: API_KEYS_CONFIG.GOOGLE_TRENDS_API_KEY,
      fashionista: API_KEYS_CONFIG.FASHIONISTA_API_KEY
    };

    // Fashion trend data sources with real API endpoints
    this.trendSources = API_ENDPOINTS;

    // Fashion-related keywords for trend analysis
    this.fashionKeywords = FASHION_KEYWORDS;

    // Current season and year
    this.currentSeason = this.getCurrentSeason();
    this.currentYear = new Date().getFullYear();

    // Trend categories
    this.trendCategories = {
      colors: ['neutral', 'bold', 'pastel', 'metallic', 'earthy'],
      styles: ['minimalist', 'maximalist', 'vintage', 'futuristic', 'sustainable'],
      materials: ['organic', 'recycled', 'technical', 'luxury', 'casual'],
      silhouettes: ['oversized', 'fitted', 'asymmetric', 'layered', 'monochrome'],
      patterns: ['geometric', 'floral', 'abstract', 'stripes', 'animal']
    };

    // Cached trend data
    this.trendCache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    // Rate limiting for APIs
    this.rateLimits = RATE_LIMITS;
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  // Rate limiting helper
  checkRateLimit(apiName) {
    const limit = this.rateLimits[apiName];
    if (!limit) return true;
    
    if (Date.now() > limit.resetTime) {
      limit.calls = 0;
      limit.resetTime = Date.now() + (apiName === 'twitter' ? 900000 : 3600000);
    }
    
    if (limit.calls >= limit.limit) {
      return false;
    }
    
    limit.calls++;
    return true;
  }

  // Pinterest data extraction helpers
  extractHashtagsFromPins(pins) {
    const hashtags = [];
    pins.forEach(pin => {
      if (pin.description) {
        const matches = pin.description.match(/#\w+/g);
        if (matches) {
          hashtags.push(...matches);
        }
      }
    });
    return [...new Set(hashtags)].slice(0, 10);
  }

  extractStylesFromPins(pins) {
    const styles = [];
    const styleKeywords = ['oversized', 'crop', 'wide-leg', 'cargo', 'blazer', 'puffer'];
    
    pins.forEach(pin => {
      if (pin.description) {
        const description = pin.description.toLowerCase();
        styleKeywords.forEach(keyword => {
          if (description.includes(keyword)) {
            styles.push(keyword);
          }
        });
      }
    });
    
    return [...new Set(styles)].slice(0, 10);
  }

  calculateEngagement(pins) {
    if (!pins.length) return 0;
    const totalEngagement = pins.reduce((sum, pin) => {
      return sum + (pin.stats?.saves || 0) + (pin.stats?.comments || 0);
    }, 0);
    return totalEngagement / pins.length;
  }

  // Instagram data extraction helpers
  calculateInstagramEngagement(hashtags) {
    if (!hashtags.length) return 0;
    const totalMediaCount = hashtags.reduce((sum, tag) => sum + (tag.media_count || 0), 0);
    return totalMediaCount / hashtags.length;
  }

  // Twitter data extraction helpers
  extractHashtagsFromTweets(tweets) {
    const hashtags = [];
    tweets.forEach(tweet => {
      if (tweet.entities && tweet.entities.hashtags) {
        tweet.entities.hashtags.forEach(hashtag => {
          hashtags.push(`#${hashtag.tag}`);
        });
      }
    });
    return [...new Set(hashtags)].slice(0, 10);
  }

  extractColorsFromTweets(tweets) {
    const colors = [];
    const colorKeywords = ['sage', 'terracotta', 'navy', 'cream', 'rust', 'olive', 'beige'];
    
    tweets.forEach(tweet => {
      if (tweet.text) {
        const text = tweet.text.toLowerCase();
        colorKeywords.forEach(color => {
          if (text.includes(color)) {
            colors.push(color);
          }
        });
      }
    });
    
    return [...new Set(colors)].slice(0, 5);
  }

  calculateTwitterEngagement(tweets) {
    if (!tweets.length) return 0;
    const totalEngagement = tweets.reduce((sum, tweet) => {
      const metrics = tweet.public_metrics || {};
      return sum + (metrics.retweet_count || 0) + (metrics.like_count || 0) + (metrics.reply_count || 0);
    }, 0);
    return totalEngagement / tweets.length;
  }

  // Search trends helpers
  isFashionRelated(query) {
    const fashionTerms = ['fashion', 'style', 'clothing', 'outfit', 'trend', 'wear', 'dress', 'shirt', 'pants'];
    const queryLower = query.toLowerCase();
    return fashionTerms.some(term => queryLower.includes(term));
  }

  extractFashionTermsFromNews(articles) {
    const terms = [];
    const fashionKeywords = [
      'sustainable', 'minimalist', 'oversized', 'earth', 'tech', 'slow', 'ethical',
      'vintage', 'luxury', 'street', 'runway', 'capsule', 'gender', 'plus'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      fashionKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          terms.push(keyword);
        }
      });
    });
    
    return [...new Set(terms)].slice(0, 10);
  }

  calculateNewsVolume(articles) {
    const volume = {};
    articles.forEach(article => {
      const date = new Date(article.publishedAt).toDateString();
      volume[date] = (volume[date] || 0) + 1;
    });
    return volume;
  }

  // Fallback data methods
  getFallbackSocialMediaData() {
    return {
      trendingHashtags: [
        '#sustainablefashion',
        '#minimaliststyle',
        '#oversizedfits',
        '#earthtones',
        '#techwear'
      ],
      popularStyles: [
        'oversized blazers',
        'cargo pants',
        'crop tops',
        'wide-leg jeans',
        'puffer jackets'
      ],
      trendingColors: [
        'sage green',
        'terracotta',
        'navy blue',
        'cream',
        'rust orange'
      ],
      engagementMetrics: {}
    };
  }

  getFallbackSearchData() {
    return {
      risingSearches: [
        'sustainable fashion brands',
        'minimalist wardrobe',
        'oversized clothing',
        'earth tone fashion',
        'tech wear style'
      ],
      popularTerms: [
        'slow fashion',
        'capsule wardrobe',
        'gender neutral fashion',
        'upcycled clothing',
        'ethical fashion'
      ],
      searchVolume: {},
      relatedQueries: {}
    };
  }

  // Runway trends helpers
  extractRunwayTrends(articles) {
    const trends = [];
    const trendKeywords = [
      'oversized', 'monochrome', 'sustainable', 'minimalist', 'tech', 'vintage',
      'layered', 'asymmetric', 'gender-fluid', 'upcycled', 'organic', 'recycled'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      trendKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          trends.push(keyword);
        }
      });
    });
    
    return [...new Set(trends)].slice(0, 10);
  }

  extractColorPalettes(articles) {
    const colors = [];
    const colorKeywords = [
      'earth tones', 'neutrals', 'pastels', 'bold', 'metallics', 'monochrome',
      'sage', 'terracotta', 'navy', 'cream', 'rust', 'olive', 'beige'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      colorKeywords.forEach(color => {
        if (text.includes(color)) {
          colors.push(color);
        }
      });
    });
    
    return [...new Set(colors)].slice(0, 8);
  }

  extractMaterials(articles) {
    const materials = [];
    const materialKeywords = [
      'organic cotton', 'recycled polyester', 'hemp', 'bamboo', 'cork',
      'silk', 'wool', 'linen', 'denim', 'leather', 'suede', 'velvet'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      materialKeywords.forEach(material => {
        if (text.includes(material)) {
          materials.push(material);
        }
      });
    });
    
    return [...new Set(materials)].slice(0, 8);
  }

  analyzeSeasonReports(articles) {
    const reports = {};
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      seasons.forEach(season => {
        if (text.includes(season)) {
          reports[season] = (reports[season] || 0) + 1;
        }
      });
    });
    
    return reports;
  }

  getFallbackRunwayData() {
    return {
      designerTrends: [
        'oversized silhouettes',
        'monochrome looks',
        'sustainable materials',
        'minimalist designs',
        'tech-inspired details'
      ],
      colorPalettes: [
        'earth tones',
        'neutrals',
        'pastels',
        'bold primaries',
        'metallics'
      ],
      materials: [
        'organic cotton',
        'recycled polyester',
        'hemp',
        'bamboo',
        'cork'
      ],
      seasonReports: {},
      designerInsights: {}
    };
  }

  // Street style helpers
  extractStreetStyleTrends(hashtags) {
    const trends = [];
    const trendKeywords = [
      'normcore', 'tech', 'sustainable', 'minimalist', 'maximalist', 'gender',
      'vintage', 'streetwear', 'oversized', 'layered', 'monochrome'
    ];
    
    hashtags.forEach(hashtag => {
      const name = hashtag.name.toLowerCase();
      trendKeywords.forEach(keyword => {
        if (name.includes(keyword)) {
          trends.push(keyword);
        }
      });
    });
    
    return [...new Set(trends)].slice(0, 8);
  }

  extractStyleCombinations(tweets) {
    const combinations = [];
    const stylePatterns = [
      /oversized.*blazer.*bike shorts/i,
      /crop top.*high.?waisted/i,
      /monochrome.*outfit.*accessories/i,
      /layered.*textures/i,
      /sporty.*dressy/i
    ];
    
    tweets.forEach(tweet => {
      const text = tweet.text;
      stylePatterns.forEach(pattern => {
        if (pattern.test(text)) {
          combinations.push(text.match(pattern)[0]);
        }
      });
    });
    
    return [...new Set(combinations)].slice(0, 5);
  }

  analyzeLocationTrends(tweets) {
    const locations = {};
    const locationKeywords = ['nyc', 'london', 'paris', 'tokyo', 'milan', 'los angeles'];
    
    tweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      locationKeywords.forEach(location => {
        if (text.includes(location)) {
          locations[location] = (locations[location] || 0) + 1;
        }
      });
    });
    
    return locations;
  }

  extractInfluencerInsights(articles) {
    const insights = {};
    const influencerKeywords = ['influencer', 'blogger', 'stylist', 'fashionista'];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      influencerKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          insights[keyword] = (insights[keyword] || 0) + 1;
        }
      });
    });
    
    return insights;
  }

  getFallbackStreetStyleData() {
    return {
      popularCombinations: [
        'oversized blazer with bike shorts',
        'crop top with high-waisted pants',
        'monochrome outfit with statement accessories',
        'layered look with multiple textures',
        'sporty elements with dressy pieces'
      ],
      emergingStyles: [
        'normcore revival',
        'tech wear influence',
        'sustainable streetwear',
        'minimalist maximalism',
        'gender fluid fashion'
      ],
      locationTrends: {},
      influencerInsights: {}
    };
  }

  // Consumer behavior helpers
  extractPurchasingPreferences(articles) {
    const preferences = [];
    const preferenceKeywords = [
      'sustainable', 'versatile', 'comfortable', 'timeless', 'ethical',
      'quality', 'durable', 'affordable', 'luxury', 'organic'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      preferenceKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          preferences.push(keyword);
        }
      });
    });
    
    return [...new Set(preferences)].slice(0, 8);
  }

  extractStylePreferences(articles) {
    const preferences = [];
    const styleKeywords = [
      'minimalist', 'oversized', 'neutral', 'layered', 'textures',
      'monochrome', 'vintage', 'modern', 'classic', 'trendy'
    ];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      styleKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          preferences.push(keyword);
        }
      });
    });
    
    return [...new Set(preferences)].slice(0, 8);
  }

  analyzeDemographics(articles) {
    const demographics = {};
    const demographicKeywords = ['millennial', 'gen z', 'boomer', 'gen x', 'young', 'older'];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      demographicKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          demographics[keyword] = (demographics[keyword] || 0) + 1;
        }
      });
    });
    
    return demographics;
  }

  analyzeMarketSegments(articles) {
    const segments = {};
    const segmentKeywords = ['luxury', 'fast fashion', 'sustainable', 'streetwear', 'minimalist'];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      segmentKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          segments[keyword] = (segments[keyword] || 0) + 1;
        }
      });
    });
    
    return segments;
  }

  analyzeConsumerSentiment(tweets) {
    const sentiment = {
      preferences: [],
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    const positiveWords = ['love', 'great', 'amazing', 'perfect', 'beautiful', 'sustainable'];
    const negativeWords = ['hate', 'terrible', 'awful', 'expensive', 'cheap', 'fast fashion'];
    
    tweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      let tweetSentiment = 'neutral';
      
      positiveWords.forEach(word => {
        if (text.includes(word)) {
          sentiment.positive++;
          tweetSentiment = 'positive';
          sentiment.preferences.push(word);
        }
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) {
          sentiment.negative++;
          tweetSentiment = 'negative';
        }
      });
      
      if (tweetSentiment === 'neutral') {
        sentiment.neutral++;
      }
    });
    
    return sentiment;
  }

  getFallbackConsumerData() {
    return {
      purchasingPreferences: [
        'sustainable materials',
        'versatile pieces',
        'comfortable fits',
        'timeless designs',
        'ethical production'
      ],
      stylePreferences: [
        'minimalist aesthetic',
        'oversized silhouettes',
        'neutral color palettes',
        'layered looks',
        'mixed textures'
      ],
      demographicInsights: {},
      marketSegments: {}
    };
  }

  async analyzeCurrentTrends(category = 'all') {
    try {
      console.log(`Analyzing current fashion trends for ${category}...`);
      
      // Check cache first
      const cacheKey = `${category}_${this.currentSeason}_${this.currentYear}`;
      if (this.trendCache.has(cacheKey)) {
        const cached = this.trendCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log('Returning cached trend data');
          return cached.data;
        }
      }

      // Gather trend data from multiple sources
      const trendData = await this.gatherTrendData(category);
      
      // Analyze trends using AI
      const analyzedTrends = await this.analyzeTrendsWithAI(trendData, category);
      
      // Cache the results
      this.trendCache.set(cacheKey, {
        data: analyzedTrends,
        timestamp: Date.now()
      });

      return analyzedTrends;

    } catch (error) {
      console.error('Error analyzing trends:', error);
      return this.getFallbackTrends(category);
    }
  }

  async gatherTrendData(category) {
    const trendData = {
      socialMedia: await this.getSocialMediaTrends(),
      searchTrends: await this.getSearchTrends(),
      runwayTrends: await this.getRunwayTrends(),
      streetStyle: await this.getStreetStyleTrends(),
      consumerBehavior: await this.getConsumerBehaviorTrends()
    };

    return trendData;
  }

  async getSocialMediaTrends() {
    try {
      const socialMediaData = {
        trendingHashtags: [],
        popularStyles: [],
        trendingColors: [],
        engagementMetrics: {}
      };

      // Pinterest API - Get trending fashion pins
      if (this.apiKeys.pinterest && this.checkRateLimit('pinterest')) {
        try {
          const pinterestResponse = await axios.get(this.trendSources.pinterest, {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.pinterest}`,
              'Content-Type': 'application/json'
            },
            params: {
              query: 'fashion trends 2024',
              board: 'fashion',
              limit: 50
            }
          });

          if (pinterestResponse.data && pinterestResponse.data.items) {
            const pins = pinterestResponse.data.items;
            socialMediaData.trendingHashtags.push(...this.extractHashtagsFromPins(pins));
            socialMediaData.popularStyles.push(...this.extractStylesFromPins(pins));
            socialMediaData.engagementMetrics.pinterest = this.calculateEngagement(pins);
          }
        } catch (error) {
          console.warn('Pinterest API error:', error.message);
        }
      }

      // Instagram API - Get trending hashtags
      if (this.apiKeys.instagram && this.checkRateLimit('instagram')) {
        try {
          const instagramResponse = await axios.get(this.trendSources.instagram, {
            params: {
              access_token: this.apiKeys.instagram,
              q: 'fashion',
              type: 'hashtag'
            }
          });

          if (instagramResponse.data && instagramResponse.data.data) {
            const hashtags = instagramResponse.data.data;
            socialMediaData.trendingHashtags.push(...hashtags.map(tag => `#${tag.name}`));
            socialMediaData.engagementMetrics.instagram = this.calculateInstagramEngagement(hashtags);
          }
        } catch (error) {
          console.warn('Instagram API error:', error.message);
        }
      }

      // Twitter API - Get fashion-related tweets
      if (this.apiKeys.twitter && this.checkRateLimit('twitter')) {
        try {
          const twitterResponse = await axios.get(this.trendSources.twitter, {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.twitter}`,
              'Content-Type': 'application/json'
            },
            params: {
              query: 'fashion trends OR sustainable fashion OR street style',
              max_results: 100,
              'tweet.fields': 'public_metrics,created_at,entities'
            }
          });

          if (twitterResponse.data && twitterResponse.data.data) {
            const tweets = twitterResponse.data.data;
            socialMediaData.trendingHashtags.push(...this.extractHashtagsFromTweets(tweets));
            socialMediaData.trendingColors.push(...this.extractColorsFromTweets(tweets));
            socialMediaData.engagementMetrics.twitter = this.calculateTwitterEngagement(tweets);
          }
        } catch (error) {
          console.warn('Twitter API error:', error.message);
        }
      }

      // Fallback to simulated data if no APIs are available
      if (socialMediaData.trendingHashtags.length === 0) {
        socialMediaData.trendingHashtags = [
          '#sustainablefashion',
          '#minimaliststyle',
          '#oversizedfits',
          '#earthtones',
          '#techwear'
        ];
      }

      if (socialMediaData.popularStyles.length === 0) {
        socialMediaData.popularStyles = [
          'oversized blazers',
          'cargo pants',
          'crop tops',
          'wide-leg jeans',
          'puffer jackets'
        ];
      }

      if (socialMediaData.trendingColors.length === 0) {
        socialMediaData.trendingColors = [
          'sage green',
          'terracotta',
          'navy blue',
          'cream',
          'rust orange'
        ];
      }

      return socialMediaData;

    } catch (error) {
      console.warn('Error fetching social media trends:', error);
      return this.getFallbackSocialMediaData();
    }
  }

  async getSearchTrends() {
    try {
      const searchData = {
        risingSearches: [],
        popularTerms: [],
        searchVolume: {},
        relatedQueries: {}
      };

      // Google Trends API - Get fashion search trends
      if (this.apiKeys.googleTrends && this.checkRateLimit('googleTrends')) {
        try {
          const trendsResponse = await axios.get(this.trendSources.googleTrends, {
            params: {
              hl: 'en-US',
              tz: '-120',
              geo: 'US',
              cat: '3', // Fashion category
              date: 'today 12-m'
            }
          });

          if (trendsResponse.data) {
            // Parse Google Trends response (removes the ")]}'" prefix)
            const cleanData = trendsResponse.data.replace(/^\)\]\}'/, '');
            const trendsData = JSON.parse(cleanData);
            
            if (trendsData.default && trendsData.default.trendingSearchesDays) {
              const trendingSearches = trendsData.default.trendingSearchesDays[0].trendingSearches;
              searchData.risingSearches = trendingSearches
                .filter(item => this.isFashionRelated(item.title.query))
                .map(item => item.title.query)
                .slice(0, 10);
            }
          }
        } catch (error) {
          console.warn('Google Trends API error:', error.message);
        }
      }

      // News API - Get fashion-related news and search terms
      if (this.apiKeys.newsApi && this.checkRateLimit('newsApi')) {
        try {
          const newsResponse = await axios.get(this.trendSources.newsApi, {
            params: {
              q: 'fashion trends OR sustainable fashion OR street style',
              apiKey: this.apiKeys.newsApi,
              language: 'en',
              sortBy: 'popularity',
              pageSize: 50,
              from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          });

          if (newsResponse.data && newsResponse.data.articles) {
            const articles = newsResponse.data.articles;
            searchData.popularTerms = this.extractFashionTermsFromNews(articles);
            searchData.searchVolume = this.calculateNewsVolume(articles);
          }
        } catch (error) {
          console.warn('News API error:', error.message);
        }
      }

      // Fallback to simulated data if no APIs are available
      if (searchData.risingSearches.length === 0) {
        searchData.risingSearches = [
          'sustainable fashion brands',
          'minimalist wardrobe',
          'oversized clothing',
          'earth tone fashion',
          'tech wear style'
        ];
      }

      if (searchData.popularTerms.length === 0) {
        searchData.popularTerms = [
          'slow fashion',
          'capsule wardrobe',
          'gender neutral fashion',
          'upcycled clothing',
          'ethical fashion'
        ];
      }

      return searchData;

    } catch (error) {
      console.warn('Error fetching search trends:', error);
      return this.getFallbackSearchData();
    }
  }

  async getRunwayTrends() {
    try {
      const runwayData = {
        designerTrends: [],
        colorPalettes: [],
        materials: [],
        seasonReports: {},
        designerInsights: {}
      };

      // News API - Get runway and fashion week coverage
      if (this.apiKeys.newsApi && this.checkRateLimit('newsApi')) {
        try {
          const runwayResponse = await axios.get(this.trendSources.newsApi, {
            params: {
              q: 'fashion week OR runway OR designer collection',
              apiKey: this.apiKeys.newsApi,
              language: 'en',
              sortBy: 'relevancy',
              pageSize: 30,
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          });

          if (runwayResponse.data && runwayResponse.data.articles) {
            const articles = runwayResponse.data.articles;
            runwayData.designerTrends = this.extractRunwayTrends(articles);
            runwayData.colorPalettes = this.extractColorPalettes(articles);
            runwayData.materials = this.extractMaterials(articles);
            runwayData.seasonReports = this.analyzeSeasonReports(articles);
          }
        } catch (error) {
          console.warn('Runway news API error:', error.message);
        }
      }

      // Fashionista API (if available) - Get professional runway analysis
      if (this.apiKeys.fashionista && this.checkRateLimit('fashionista')) {
        try {
          const fashionistaResponse = await axios.get(this.trendSources.fashionista, {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.fashionista}`,
              'Content-Type': 'application/json'
            },
            params: {
              season: this.currentSeason,
              year: this.currentYear,
              category: 'runway'
            }
          });

          if (fashionistaResponse.data) {
            const professionalData = fashionistaResponse.data;
            runwayData.designerInsights = professionalData.insights || {};
            runwayData.designerTrends = [...runwayData.designerTrends, ...(professionalData.trends || [])];
            runwayData.colorPalettes = [...runwayData.colorPalettes, ...(professionalData.colors || [])];
          }
        } catch (error) {
          console.warn('Fashionista API error:', error.message);
        }
      }

      // Fallback to simulated data if no APIs are available
      if (runwayData.designerTrends.length === 0) {
        runwayData.designerTrends = [
          'oversized silhouettes',
          'monochrome looks',
          'sustainable materials',
          'minimalist designs',
          'tech-inspired details'
        ];
      }

      if (runwayData.colorPalettes.length === 0) {
        runwayData.colorPalettes = [
          'earth tones',
          'neutrals',
          'pastels',
          'bold primaries',
          'metallics'
        ];
      }

      if (runwayData.materials.length === 0) {
        runwayData.materials = [
          'organic cotton',
          'recycled polyester',
          'hemp',
          'bamboo',
          'cork'
        ];
      }

      return runwayData;

    } catch (error) {
      console.warn('Error fetching runway trends:', error);
      return this.getFallbackRunwayData();
    }
  }

  async getStreetStyleTrends() {
    try {
      const streetStyleData = {
        popularCombinations: [],
        emergingStyles: [],
        locationTrends: {},
        influencerInsights: {}
      };

      // Instagram API - Get street style hashtags and posts
      if (this.apiKeys.instagram && this.checkRateLimit('instagram')) {
        try {
          const streetStyleResponse = await axios.get('https://graph.instagram.com/v12.0/ig_hashtag_search', {
            params: {
              access_token: this.apiKeys.instagram,
              q: 'streetstyle',
              type: 'hashtag'
            }
          });

          if (streetStyleResponse.data && streetStyleResponse.data.data) {
            const streetStyleHashtags = streetStyleResponse.data.data;
            streetStyleData.emergingStyles = this.extractStreetStyleTrends(streetStyleHashtags);
          }
        } catch (error) {
          console.warn('Street style Instagram API error:', error.message);
        }
      }

      // Twitter API - Get street style discussions
      if (this.apiKeys.twitter && this.checkRateLimit('twitter')) {
        try {
          const streetStyleTwitterResponse = await axios.get(this.trendSources.twitter, {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.twitter}`,
              'Content-Type': 'application/json'
            },
            params: {
              query: 'street style OR streetstyle OR fashion street',
              max_results: 50,
              'tweet.fields': 'public_metrics,created_at,entities'
            }
          });

          if (streetStyleTwitterResponse.data && streetStyleTwitterResponse.data.data) {
            const tweets = streetStyleTwitterResponse.data.data;
            streetStyleData.popularCombinations = this.extractStyleCombinations(tweets);
            streetStyleData.locationTrends = this.analyzeLocationTrends(tweets);
          }
        } catch (error) {
          console.warn('Street style Twitter API error:', error.message);
        }
      }

      // News API - Get street style coverage
      if (this.apiKeys.newsApi && this.checkRateLimit('newsApi')) {
        try {
          const streetStyleNewsResponse = await axios.get(this.trendSources.newsApi, {
            params: {
              q: 'street style OR streetstyle OR fashion street',
              apiKey: this.apiKeys.newsApi,
              language: 'en',
              sortBy: 'relevancy',
              pageSize: 20,
              from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          });

          if (streetStyleNewsResponse.data && streetStyleNewsResponse.data.articles) {
            const articles = streetStyleNewsResponse.data.articles;
            streetStyleData.influencerInsights = this.extractInfluencerInsights(articles);
          }
        } catch (error) {
          console.warn('Street style news API error:', error.message);
        }
      }

      // Fallback to simulated data if no APIs are available
      if (streetStyleData.popularCombinations.length === 0) {
        streetStyleData.popularCombinations = [
          'oversized blazer with bike shorts',
          'crop top with high-waisted pants',
          'monochrome outfit with statement accessories',
          'layered look with multiple textures',
          'sporty elements with dressy pieces'
        ];
      }

      if (streetStyleData.emergingStyles.length === 0) {
        streetStyleData.emergingStyles = [
          'normcore revival',
          'tech wear influence',
          'sustainable streetwear',
          'minimalist maximalism',
          'gender fluid fashion'
        ];
      }

      return streetStyleData;

    } catch (error) {
      console.warn('Error fetching street style trends:', error);
      return this.getFallbackStreetStyleData();
    }
  }

  async getConsumerBehaviorTrends() {
    try {
      const consumerData = {
        purchasingPreferences: [],
        stylePreferences: [],
        demographicInsights: {},
        marketSegments: {}
      };

      // News API - Get consumer behavior and market research articles
      if (this.apiKeys.newsApi && this.checkRateLimit('newsApi')) {
        try {
          const consumerResponse = await axios.get(this.trendSources.newsApi, {
            params: {
              q: 'fashion consumer behavior OR sustainable fashion market OR fashion purchasing trends',
              apiKey: this.apiKeys.newsApi,
              language: 'en',
              sortBy: 'relevancy',
              pageSize: 30,
              from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          });

          if (consumerResponse.data && consumerResponse.data.articles) {
            const articles = consumerResponse.data.articles;
            consumerData.purchasingPreferences = this.extractPurchasingPreferences(articles);
            consumerData.stylePreferences = this.extractStylePreferences(articles);
            consumerData.demographicInsights = this.analyzeDemographics(articles);
            consumerData.marketSegments = this.analyzeMarketSegments(articles);
          }
        } catch (error) {
          console.warn('Consumer behavior news API error:', error.message);
        }
      }

      // Twitter API - Get consumer sentiment and discussions
      if (this.apiKeys.twitter && this.checkRateLimit('twitter')) {
        try {
          const consumerTwitterResponse = await axios.get(this.trendSources.twitter, {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.twitter}`,
              'Content-Type': 'application/json'
            },
            params: {
              query: 'sustainable fashion OR ethical fashion OR slow fashion OR fashion shopping',
              max_results: 100,
              'tweet.fields': 'public_metrics,created_at,entities'
            }
          });

          if (consumerTwitterResponse.data && consumerTwitterResponse.data.data) {
            const tweets = consumerTwitterResponse.data.data;
            const sentiment = this.analyzeConsumerSentiment(tweets);
            consumerData.purchasingPreferences = [...consumerData.purchasingPreferences, ...sentiment.preferences];
            consumerData.stylePreferences = [...consumerData.stylePreferences, ...sentiment.preferences];
          }
        } catch (error) {
          console.warn('Consumer behavior Twitter API error:', error.message);
        }
      }

      // Fallback to simulated data if no APIs are available
      if (consumerData.purchasingPreferences.length === 0) {
        consumerData.purchasingPreferences = [
          'sustainable materials',
          'versatile pieces',
          'comfortable fits',
          'timeless designs',
          'ethical production'
        ];
      }

      if (consumerData.stylePreferences.length === 0) {
        consumerData.stylePreferences = [
          'minimalist aesthetic',
          'oversized silhouettes',
          'neutral color palettes',
          'layered looks',
          'mixed textures'
        ];
      }

      return consumerData;

    } catch (error) {
      console.warn('Error fetching consumer behavior trends:', error);
      return this.getFallbackConsumerData();
    }
  }

  async analyzeTrendsWithAI(trendData, category) {
    try {
      const prompt = this.buildTrendAnalysisPrompt(trendData, category);
      
      const req = {
        model: this.model,
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.9
        }
      };

      const response = await this.ai.models.generateContent(req);
      const analysis = response.text;

      // Parse the AI response into structured data
      return this.parseTrendAnalysis(analysis, trendData);

    } catch (error) {
      console.error('Error analyzing trends with AI:', error);
      return this.getFallbackTrends(category);
    }
  }

  buildTrendAnalysisPrompt(trendData, category) {
    return `Analyze the following fashion trend data for ${this.currentSeason} ${this.currentYear} and provide insights for ${category} category:

SOCIAL MEDIA TRENDS:
${JSON.stringify(trendData.socialMedia, null, 2)}

SEARCH TRENDS:
${JSON.stringify(trendData.searchTrends, null, 2)}

RUNWAY TRENDS:
${JSON.stringify(trendData.runwayTrends, null, 2)}

STREET STYLE TRENDS:
${JSON.stringify(trendData.streetStyle, null, 2)}

CONSUMER BEHAVIOR:
${JSON.stringify(trendData.consumerBehavior, null, 2)}

Please provide a comprehensive analysis in the following JSON format:

{
  "season": "${this.currentSeason}",
  "year": ${this.currentYear},
  "category": "${category}",
  "keyTrends": [
    {
      "name": "trend name",
      "description": "detailed description",
      "confidence": 0.85,
      "sources": ["social", "runway", "street"],
      "designImplications": ["implication 1", "implication 2"]
    }
  ],
  "colorPalettes": [
    {
      "name": "palette name",
      "colors": ["color1", "color2", "color3"],
      "usage": "primary/secondary/accent",
      "trendStrength": 0.8
    }
  ],
  "styleDirections": [
    {
      "name": "style direction",
      "description": "description",
      "keyElements": ["element1", "element2"],
      "targetAudience": "audience description"
    }
  ],
  "materialTrends": [
    {
      "material": "material name",
      "usage": "usage description",
      "sustainability": "sustainable/conventional",
      "trendStrength": 0.7
    }
  ],
  "designRecommendations": [
    {
      "category": "category",
      "recommendations": ["rec1", "rec2", "rec3"],
      "priority": "high/medium/low"
    }
  ]
}

Focus on actionable insights that can guide garment design decisions.`;
  }

  parseTrendAnalysis(analysis, originalData) {
    try {
      // Extract JSON from the AI response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          rawData: originalData,
          analysisTimestamp: new Date().toISOString()
        };
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parseTrendAnalysisFallback(analysis, originalData);
      
    } catch (error) {
      console.error('Error parsing trend analysis:', error);
      return this.getFallbackTrends('all');
    }
  }

  parseTrendAnalysisFallback(analysis, originalData) {
    // Simple keyword extraction as fallback
    const keywords = analysis.toLowerCase().match(/\b\w+\b/g) || [];
    const colorKeywords = keywords.filter(word => 
      ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'pink', 'purple', 'orange', 'brown'].includes(word)
    );
    
    return {
      season: this.currentSeason,
      year: this.currentYear,
      category: 'all',
      keyTrends: [
        {
          name: 'Extracted from analysis',
          description: analysis.substring(0, 200) + '...',
          confidence: 0.6,
          sources: ['ai_analysis'],
          designImplications: ['Use extracted insights for design direction']
        }
      ],
      colorPalettes: colorKeywords.length > 0 ? [
        {
          name: 'Extracted Colors',
          colors: [...new Set(colorKeywords)],
          usage: 'primary',
          trendStrength: 0.6
        }
      ] : [],
      styleDirections: [
        {
          name: 'AI Analyzed Direction',
          description: 'Based on current trend analysis',
          keyElements: ['modern', 'sustainable', 'versatile'],
          targetAudience: 'fashion-forward consumers'
        }
      ],
      materialTrends: [
        {
          material: 'sustainable fabrics',
          usage: 'primary materials',
          sustainability: 'sustainable',
          trendStrength: 0.8
        }
      ],
      designRecommendations: [
        {
          category: 'general',
          recommendations: ['Focus on sustainability', 'Embrace versatility', 'Consider comfort'],
          priority: 'high'
        }
      ],
      rawData: originalData,
      analysisTimestamp: new Date().toISOString()
    };
  }

  getFallbackTrends(category) {
    return {
      season: this.currentSeason,
      year: this.currentYear,
      category: category,
      keyTrends: [
        {
          name: 'Sustainable Fashion',
          description: 'Eco-friendly materials and ethical production methods',
          confidence: 0.9,
          sources: ['runway', 'consumer'],
          designImplications: ['Use organic materials', 'Minimize waste', 'Consider lifecycle']
        },
        {
          name: 'Minimalist Aesthetic',
          description: 'Clean lines, neutral colors, and simple silhouettes',
          confidence: 0.85,
          sources: ['social', 'street'],
          designImplications: ['Focus on clean cuts', 'Use neutral palettes', 'Emphasize quality']
        }
      ],
      colorPalettes: [
        {
          name: 'Earth Tones',
          colors: ['sage green', 'terracotta', 'cream', 'navy', 'rust'],
          usage: 'primary',
          trendStrength: 0.8
        }
      ],
      styleDirections: [
        {
          name: 'Modern Minimalism',
          description: 'Clean, functional, and timeless designs',
          keyElements: ['oversized fits', 'neutral colors', 'quality materials'],
          targetAudience: 'conscious consumers'
        }
      ],
      materialTrends: [
        {
          material: 'organic cotton',
          usage: 'primary fabric',
          sustainability: 'sustainable',
          trendStrength: 0.8
        }
      ],
      designRecommendations: [
        {
          category: 'general',
          recommendations: ['Prioritize sustainability', 'Focus on versatility', 'Embrace comfort'],
          priority: 'high'
        }
      ],
      analysisTimestamp: new Date().toISOString()
    };
  }

  async generateTrendBasedDesignPrompt(trendAnalysis, garmentType = 'general') {
    try {
      const prompt = this.buildDesignPrompt(trendAnalysis, garmentType);
      
      const req = {
        model: this.model,
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          maxOutputTokens: 4096,
          temperature: 0.8,
          topP: 0.9
        }
      };

      const response = await this.ai.models.generateContent(req);
      return response.text;

    } catch (error) {
      console.error('Error generating design prompt:', error);
      return this.getFallbackDesignPrompt(trendAnalysis, garmentType);
    }
  }

  buildDesignPrompt(trendAnalysis, garmentType) {
    const { keyTrends, colorPalettes, styleDirections, materialTrends } = trendAnalysis;
    
    return `Based on the current fashion trends for ${trendAnalysis.season} ${trendAnalysis.year}, create a detailed design prompt for a ${garmentType} garment.

CURRENT TRENDS:
${keyTrends.map(trend => `- ${trend.name}: ${trend.description}`).join('\n')}

COLOR PALETTES:
${colorPalettes.map(palette => `- ${palette.name}: ${palette.colors.join(', ')}`).join('\n')}

STYLE DIRECTIONS:
${styleDirections.map(style => `- ${style.name}: ${style.description}`).join('\n')}

MATERIALS:
${materialTrends.map(material => `- ${material.material}: ${material.usage}`).join('\n')}

Please create a comprehensive design prompt that includes:
1. Specific style direction based on current trends
2. Recommended color palette and usage
3. Material suggestions and texture considerations
4. Silhouette and fit recommendations
5. Key design elements to incorporate
6. Target audience and occasion considerations

Format the response as a detailed, actionable design brief that can guide garment creation.`;
  }

  getFallbackDesignPrompt(trendAnalysis, garmentType) {
    return `Create a modern ${garmentType} design incorporating current ${trendAnalysis.season} trends:

Style: Minimalist and sustainable approach with clean lines and versatile functionality
Colors: Use earth tones and neutral palette (sage green, terracotta, cream, navy)
Materials: Organic cotton or recycled fabrics for sustainability
Silhouette: Slightly oversized for comfort and modern appeal
Details: Focus on quality construction and timeless design elements
Target: Fashion-conscious consumers who value sustainability and versatility

The design should be contemporary, comfortable, and suitable for everyday wear while reflecting current fashion sensibilities.`;
  }

  async getTrendInsights(category = 'all') {
    const trends = await this.analyzeCurrentTrends(category);
    
    return {
      summary: this.generateTrendSummary(trends),
      recommendations: this.generateRecommendations(trends),
      visualGuide: this.generateVisualGuide(trends),
      marketOpportunities: this.identifyMarketOpportunities(trends)
    };
  }

  generateTrendSummary(trends) {
    const topTrends = trends.keyTrends
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    return {
      season: trends.season,
      year: trends.year,
      dominantTrends: topTrends.map(trend => trend.name),
      keyInsights: topTrends.map(trend => trend.description),
      overallDirection: trends.styleDirections[0]?.name || 'Modern Minimalism'
    };
  }

  generateRecommendations(trends) {
    return {
      immediate: trends.designRecommendations
        .filter(rec => rec.priority === 'high')
        .map(rec => rec.recommendations)
        .flat(),
      strategic: trends.designRecommendations
        .filter(rec => rec.priority === 'medium')
        .map(rec => rec.recommendations)
        .flat(),
      longTerm: trends.designRecommendations
        .filter(rec => rec.priority === 'low')
        .map(rec => rec.recommendations)
        .flat()
    };
  }

  generateVisualGuide(trends) {
    return {
      colorPalettes: trends.colorPalettes,
      styleMood: trends.styleDirections,
      materialGuide: trends.materialTrends,
      silhouetteGuide: trends.keyTrends
        .filter(trend => trend.name.toLowerCase().includes('silhouette') || trend.name.toLowerCase().includes('fit'))
    };
  }

  identifyMarketOpportunities(trends) {
    return {
      underservedSegments: this.analyzeMarketGaps(trends),
      emergingCategories: this.identifyEmergingCategories(trends),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(trends)
    };
  }

  analyzeMarketGaps(trends) {
    // Analyze gaps in current market offerings
    return [
      'Sustainable luxury segment',
      'Gender-neutral fashion',
      'Tech-integrated clothing',
      'Size-inclusive sustainable fashion'
    ];
  }

  identifyEmergingCategories(trends) {
    // Identify new or growing categories
    return [
      'Upcycled fashion',
      'Rental fashion',
      'Customizable basics',
      'Wellness-focused apparel'
    ];
  }

  identifyCompetitiveAdvantages(trends) {
    // Identify potential competitive advantages
    return [
      'First-mover in sustainable tech wear',
      'Exclusive sustainable material partnerships',
      'AI-powered customization',
      'Circular fashion model'
    ];
  }
}

export { FashionTrendAnalyzer };
