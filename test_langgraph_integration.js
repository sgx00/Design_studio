/**
 * Test script for LangGraph Fashion Agent Integration
 */

import { LangGraphIntegration } from './services/langgraphIntegration.js';

async function testLangGraphIntegration() {
  console.log('🧪 Testing LangGraph Integration...');
  
  try {
    // Initialize integration
    const integration = new LangGraphIntegration();
    
    // Test 1: Check dependencies
    console.log('\n📋 Test 1: Checking dependencies...');
    const dependenciesOk = await integration.checkDependencies();
    console.log(`Dependencies available: ${dependenciesOk}`);
    
    if (!dependenciesOk) {
      console.log('⚠️ Dependencies not available, testing fallback...');
    }
    
    // Test 2: Generate designs
    console.log('\n📋 Test 2: Generating designs...');
    const request = {
      garmentType: 'dress',
      category: 'dresses',
      strategy: 'balanced',
      count: 2,
      targetAudience: 'young professionals',
      occasion: 'work',
      preferences: {
        colors: ['navy', 'black', 'white'],
        style: 'minimalist'
      }
    };
    
    console.log('Request:', JSON.stringify(request, null, 2));
    
    const result = await integration.generateTrendBasedDesigns(request);
    
    console.log('\n📊 Results:');
    console.log(`Success: ${result.success}`);
    
    if (result.success) {
      console.log('✅ Design generation completed successfully!');
      
      if (result.designs) {
        console.log(`Generated ${result.designs.length} designs`);
        result.designs.forEach((design, index) => {
          console.log(`  Design ${index + 1}: ${design.id}`);
          console.log(`    Strategy: ${design.strategy}`);
          console.log(`    Target: ${design.targetAudience}`);
          console.log(`    Occasion: ${design.occasion}`);
          if (design.isFallback) {
            console.log(`    ⚠️ Fallback design`);
          }
        });
      }
      
      if (result.trendAnalysis) {
        console.log('\n🔍 Trend Analysis:');
        console.log(`  Season: ${result.trendAnalysis.season}`);
        console.log(`  Year: ${result.trendAnalysis.year}`);
        console.log(`  Category: ${result.trendAnalysis.category}`);
        
        if (result.trendAnalysis.keyTrends) {
          console.log('  Key Trends:');
          result.trendAnalysis.keyTrends.slice(0, 3).forEach(trend => {
            console.log(`    - ${trend.name}: ${trend.description}`);
          });
        }
      }
      
      if (result.metadata) {
        console.log('\n📋 Metadata:');
        console.log(`  Generated at: ${result.metadata.generatedAt}`);
        console.log(`  Garment type: ${result.metadata.garmentType}`);
        console.log(`  Strategy: ${result.metadata.strategy}`);
        if (result.metadata.fallback) {
          console.log(`  ⚠️ Fallback mode used`);
        }
      }
    } else {
      console.log('❌ Design generation failed');
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      if (result.error_messages) {
        console.log('Error messages:');
        result.error_messages.forEach(msg => {
          console.log(`  - ${msg}`);
        });
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testDifferentStrategies() {
  console.log('\n🎯 Testing different strategies...');
  
  const strategies = ['trend_following', 'trend_leading', 'balanced', 'sustainable'];
  const integration = new LangGraphIntegration();
  
  for (const strategy of strategies) {
    console.log(`\n📋 Testing strategy: ${strategy}`);
    
    try {
      const request = {
        garmentType: 'shirt',
        category: 'tops',
        strategy: strategy,
        count: 1,
        targetAudience: 'fashion enthusiasts',
        occasion: 'casual',
        preferences: {}
      };
      
      const result = await integration.generateTrendBasedDesigns(request);
      
      if (result.success) {
        console.log(`✅ ${strategy} strategy completed successfully`);
        if (result.designs && result.designs.length > 0) {
          const design = result.designs[0];
          console.log(`   Generated design: ${design.id}`);
          console.log(`   Strategy: ${design.strategy}`);
        }
      } else {
        console.log(`❌ ${strategy} strategy failed: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${strategy}: ${error.message}`);
    }
  }
}

async function testServerEndpoint() {
  console.log('\n🌐 Testing server endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/langgraph-fashion-agent/status');
    const data = await response.json();
    
    console.log('Server status response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`LangGraph available: ${data.data.langgraphAvailable}`);
      console.log(`Message: ${data.data.message}`);
    }
    
  } catch (error) {
    console.log('❌ Server not running or endpoint not available:', error.message);
    console.log('Make sure to start the server with: npm start');
  }
}

async function main() {
  console.log('🚀 Starting LangGraph Integration Tests');
  console.log('=' * 50);
  
  // Test 1: Basic integration
  console.log('\n🧪 Test 1: Basic Integration');
  console.log('-'.repeat(30));
  await testLangGraphIntegration();
  
  // Test 2: Different strategies
  console.log('\n🧪 Test 2: Different Strategies');
  console.log('-'.repeat(30));
  await testDifferentStrategies();
  
  // Test 3: Server endpoint
  console.log('\n🧪 Test 3: Server Endpoint');
  console.log('-'.repeat(30));
  await testServerEndpoint();
  
  console.log('\n🎉 All tests completed!');
  console.log('=' * 50);
}

// Run tests
main().catch(console.error);
