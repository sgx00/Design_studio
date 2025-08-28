import { AIDesignGenerator } from './services/aiDesignGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testVertexAI() {
  try {
    console.log('Testing VertexAI integration...');
    
    const aiDesignGenerator = new AIDesignGenerator();
    
    // Test with a sample flat image (you'll need to provide a real flat image path)
    const flatImagePath = path.join(__dirname, 'uploads', 'flat-28a54470-572d-4d7f-8385-3ffec0a40a1a.png');
    const outputPath = path.join(__dirname, 'uploads', 'test-final-vertexai.png');
    
    console.log('Flat image path:', flatImagePath);
    console.log('Output path:', outputPath);
    
    // Test the generateFinalImage method
    const result = await aiDesignGenerator.generateFinalImage(flatImagePath, outputPath, {
      style: 'casual',
      color: 'blue',
      material: 'cotton'
    });
    
    console.log('Test completed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVertexAI();
