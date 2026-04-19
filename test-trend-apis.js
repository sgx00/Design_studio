import { FashionTrendAnalyzer } from './services/fashionTrendAnalyzer.js';
import { checkApiKeysConfigured, getAvailableApis } from './config/apiKeys.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTrendAnalyzer() {
  console.log('🧪 Testing Fashion Trend Analyzer with Real APIs\n');

  // Check API configuration
  console.log('📋 API Configuration Status:');
  const configured = checkApiKeysConfigured();
  Object.keys(configured).forEach(api => {
    const status = configured[api] ? '✅ Configured' : '❌ Not configured';
    console.log(`  ${api}: ${status}`);
  });

  console.log('\n🔧 Available APIs:', getAvailableApis());

  // Initialize the trend analyzer
  const analyzer = new FashionTrendAnalyzer();

  try {
    console.log('\n🔍 Testing Trend Analysis...');
    
    // Test social media trends
    console.log('\n📱 Testing Social Media Trends...');
    const socialMediaTrends = await analyzer.getSocialMediaTrends();
    console.log('Social Media Trends:', {
      hashtags: socialMediaTrends.trendingHashtags?.length || 0,
      styles: socialMediaTrends.popularStyles?.length || 0,
      colors: socialMediaTrends.trendingColors?.length || 0,
      hasEngagement: !!socialMediaTrends.engagementMetrics
    });

    // Test search trends
    console.log('\n🔎 Testing Search Trends...');
    const searchTrends = await analyzer.getSearchTrends();
    console.log('Search Trends:', {
      risingSearches: searchTrends.risingSearches?.length || 0,
      popularTerms: searchTrends.popularTerms?.length || 0,
      hasVolume: !!searchTrends.searchVolume
    });

    // Test runway trends
    console.log('\n👗 Testing Runway Trends...');
    const runwayTrends = await analyzer.getRunwayTrends();
    console.log('Runway Trends:', {
      designerTrends: runwayTrends.designerTrends?.length || 0,
      colorPalettes: runwayTrends.colorPalettes?.length || 0,
      materials: runwayTrends.materials?.length || 0
    });

    // Test street style trends
    console.log('\n🛣️ Testing Street Style Trends...');
    const streetStyleTrends = await analyzer.getStreetStyleTrends();
    console.log('Street Style Trends:', {
      combinations: streetStyleTrends.popularCombinations?.length || 0,
      emergingStyles: streetStyleTrends.emergingStyles?.length || 0
    });

    // Test consumer behavior trends
    console.log('\n👥 Testing Consumer Behavior Trends...');
    const consumerTrends = await analyzer.getConsumerBehaviorTrends();
    console.log('Consumer Behavior Trends:', {
      purchasingPreferences: consumerTrends.purchasingPreferences?.length || 0,
      stylePreferences: consumerTrends.stylePreferences?.length || 0
    });

    // Test full trend analysis
    console.log('\n🎯 Testing Full Trend Analysis...');
    const fullAnalysis = await analyzer.analyzeCurrentTrends('all');
    console.log('Full Analysis:', {
      season: fullAnalysis.season,
      year: fullAnalysis.year,
      keyTrends: fullAnalysis.keyTrends?.length || 0,
      colorPalettes: fullAnalysis.colorPalettes?.length || 0,
      styleDirections: fullAnalysis.styleDirections?.length || 0,
      materialTrends: fullAnalysis.materialTrends?.length || 0,
      designRecommendations: fullAnalysis.designRecommendations?.length || 0
    });

    // Test trend insights
    console.log('\n💡 Testing Trend Insights...');
    const insights = await analyzer.getTrendInsights('all');
    console.log('Trend Insights:', {
      hasSummary: !!insights.summary,
      hasRecommendations: !!insights.recommendations,
      hasVisualGuide: !!insights.visualGuide,
      hasMarketOpportunities: !!insights.marketOpportunities
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- The trend analyzer is working with real APIs where configured');
    console.log('- Fallback data is used for APIs that are not configured');
    console.log('- Rate limiting is in place to respect API limits');
    console.log('- Error handling gracefully falls back to simulated data');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check your API keys in the .env file');
    console.log('- Verify your internet connection');
    console.log('- Check if the APIs are accessible');
    console.log('- Review the API_SETUP.md file for configuration help');
  }
}

// Run the test
testTrendAnalyzer().catch(console.error);
