"""
Simple test script for the LangGraph Fashion Agent without complex workflow
"""

import asyncio
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load environment variables
load_dotenv()

class SimpleFashionAgent:
    """Simplified fashion agent for testing"""
    
    def __init__(self):
        """Initialize the simple fashion agent"""
        self.setup_google_ai()
    
    def setup_google_ai(self):
        """Setup Google AI with Gemini models"""
        try:
            # Configure for Vertex AI
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            
            # Initialize models
            self.trend_model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            self.image_model = genai.GenerativeModel(
                model_name="gemini-2.5-flash-image",
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            print("✅ Google AI models initialized successfully")
            
        except Exception as e:
            print(f"❌ Error setting up Google AI: {e}")
            raise

    def analyze_trends(self, category="all"):
        """Analyze current fashion trends"""
        print("🔍 Analyzing current fashion trends...")
        
        try:
            prompt = f"""
            Analyze current fashion trends for {category} category in 2025.
            
            Please provide a comprehensive analysis in the following JSON format:
            
            {{
              "season": "winter",
              "year": 2025,
              "category": "{category}",
              "keyTrends": [
                {{
                  "name": "trend name",
                  "description": "detailed description",
                  "confidence": 0.85,
                  "designImplications": ["implication 1", "implication 2"]
                }}
              ],
              "colorPalettes": [
                {{
                  "name": "palette name",
                  "colors": ["color1", "color2", "color3"],
                  "usage": "primary/secondary/accent",
                  "trendStrength": 0.8
                }}
              ],
              "styleDirections": [
                {{
                  "name": "style direction",
                  "description": "description",
                  "keyElements": ["element1", "element2"],
                  "targetAudience": "audience description"
                }}
              ]
            }}
            
            Focus on actionable insights that can guide garment design decisions.
            """
            
            response = self.trend_model.generate_content(prompt)
            print("✅ Trend analysis completed")
            return response.text
            
        except Exception as e:
            print(f"❌ Error in trend analysis: {e}")
            return f"Error: {str(e)}"

    def generate_design_concept(self, garment_type="dress", trend_analysis="", strategy="balanced"):
        """Generate a design concept"""
        print(f"🎨 Generating design concept for {garment_type}...")
        
        try:
            prompt = f"""
            Create a detailed design concept for a {garment_type} garment based on current fashion trends.
            
            TREND ANALYSIS:
            {trend_analysis}
            
            DESIGN STRATEGY: {strategy}
            
            Please provide a comprehensive design concept including:
            1. Style direction and aesthetic
            2. Color palette and usage
            3. Material suggestions
            4. Silhouette and fit
            5. Key design elements
            6. Target market considerations
            
            Make it detailed and actionable for fashion design.
            """
            
            response = self.trend_model.generate_content(prompt)
            print("✅ Design concept generated")
            return response.text
            
        except Exception as e:
            print(f"❌ Error generating design concept: {e}")
            return f"Error: {str(e)}"

    def create_image(self, design_concept):
        """Create an image based on design concept"""
        print("🖼️ Creating image...")
        
        try:
            image_prompt = f"""
            Create a high-quality fashion design illustration based on this design concept:
            
            {design_concept}
            
            Requirements:
            - Professional fashion illustration style
            - Clean, modern aesthetic
            - High resolution and detailed
            - White background
            - Centered composition
            - Show the garment clearly and attractively
            
            The image should look like a professional fashion design sketch.
            """
            
            response = self.image_model.generate_content([image_prompt])
            
            # Check if image was generated
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        print("✅ Image generated successfully")
                        return "Image generated successfully"
            
            print("⚠️ No image generated, but no error occurred")
            return "No image generated"
            
        except Exception as e:
            print(f"❌ Error creating image: {e}")
            return f"Error: {str(e)}"

async def test_simple_fashion_agent():
    """Test the simple fashion agent"""
    print("🧪 Testing Simple Fashion Agent...")
    
    try:
        # Initialize agent
        print("📋 Initializing agent...")
        agent = SimpleFashionAgent()
        
        # Test 1: Trend Analysis
        print("\n🔍 Test 1: Trend Analysis")
        print("-" * 30)
        trend_analysis = agent.analyze_trends("dresses")
        print(f"Trend Analysis Result: {trend_analysis[:200]}...")
        
        # Test 2: Design Concept Generation
        print("\n🎨 Test 2: Design Concept Generation")
        print("-" * 30)
        design_concept = agent.generate_design_concept("dress", trend_analysis, "balanced")
        print(f"Design Concept: {design_concept[:200]}...")
        
        # Test 3: Image Creation
        print("\n🖼️ Test 3: Image Creation")
        print("-" * 30)
        image_result = agent.create_image(design_concept)
        print(f"Image Creation Result: {image_result}")
        
        print("\n✅ All tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

async def test_different_garments():
    """Test different garment types"""
    print("\n👕 Testing Different Garment Types...")
    
    garment_types = ["dress", "shirt", "pants", "jacket"]
    
    try:
        agent = SimpleFashionAgent()
        
        for garment in garment_types:
            print(f"\n📋 Testing {garment}...")
            
            # Get trend analysis
            trend_analysis = agent.analyze_trends(garment)
            
            # Generate design concept
            design_concept = agent.generate_design_concept(garment, trend_analysis, "balanced")
            
            print(f"✅ {garment} test completed")
            print(f"   Design concept length: {len(design_concept)} characters")
        
        print("\n✅ All garment type tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Garment type tests failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Simple Fashion Agent Tests")
    print("=" * 50)
    
    # Check environment variables
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ GOOGLE_API_KEY not found in environment variables")
        print("Please set your Google API key in the .env file")
        return
    
    # Test 1: Basic functionality
    print("\n🧪 Test 1: Basic Functionality")
    print("-" * 30)
    success1 = await test_simple_fashion_agent()
    
    # Test 2: Different garment types
    print("\n🧪 Test 2: Different Garment Types")
    print("-" * 30)
    success2 = await test_different_garments()
    
    print("\n🎉 All tests completed!")
    print("=" * 50)
    
    if success1 and success2:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")

if __name__ == "__main__":
    asyncio.run(main())
