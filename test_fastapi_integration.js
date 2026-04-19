/**
 * Test script to verify FastAPI backend integration
 * Run this to test if the FastAPI backend is working correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

async function testFastAPIIntegration() {
  console.log('🧪 Testing FastAPI Backend Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Get Design Strategies
    console.log('2. Testing design strategies endpoint...');
    const strategiesResponse = await axios.get(`${API_BASE_URL}/api/v1/designs/strategies`);
    console.log('✅ Design strategies loaded:', Object.keys(strategiesResponse.data.strategies));
    console.log('');

    // Test 3: Get Garment Categories
    console.log('3. Testing garment categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/v1/designs/categories`);
    console.log('✅ Garment categories loaded:', Object.keys(categoriesResponse.data.categories));
    console.log('');

    // Test 4: Test Design Generation (with minimal request)
    console.log('4. Testing design generation endpoint...');
    const designRequest = {
      garmentType: 't-shirt',
      category: 'tops',
      strategy: 'balanced',
      count: 1,
      targetAudience: 'general',
      occasion: 'everyday',
      preferences: {}
    };

    console.log('📤 Sending design request:', designRequest);
    const designResponse = await axios.post(`${API_BASE_URL}/api/v1/designs/generate`, designRequest, {
      timeout: 120000 // 2 minutes timeout for design generation
    });
    
    if (designResponse.data.success) {
      console.log('✅ Design generation successful!');
      console.log('📊 Generated designs:', designResponse.data.data.designs?.length || 0);
      if (designResponse.data.data.designs && designResponse.data.data.designs.length > 0) {
        console.log('🎨 First design details:', {
          id: designResponse.data.data.designs[0].id,
          strategy: designResponse.data.data.designs[0].strategy,
          quality: designResponse.data.data.designs[0].quality
        });
      }
    } else {
      console.log('❌ Design generation failed:', designResponse.data.error);
    }
    console.log('');

    // Test 5: List Generated Images
    console.log('5. Testing image listing endpoint...');
    const imagesResponse = await axios.get(`${API_BASE_URL}/api/v1/images`);
    console.log('✅ Images endpoint working, found', imagesResponse.data.images?.length || 0, 'images');
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('✅ FastAPI backend is ready for frontend integration');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\n💡 Make sure the FastAPI backend is running on port 8000');
    console.log('   Run: cd fastapi_backend && python main.py');
  }
}

// Run the test
testFastAPIIntegration();
