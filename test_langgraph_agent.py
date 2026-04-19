"""
Test script for the LangGraph Fashion Agent
"""

import asyncio
import json
import os
from dotenv import load_dotenv
from services.langgraphFashionAgent import LangGraphFashionAgent

# Load environment variables
load_dotenv()

async def test_langgraph_fashion_agent():
    """Test the LangGraph Fashion Agent"""
    print("🧪 Testing LangGraph Fashion Agent...")
    
    try:
        # Initialize agent
        print("📋 Initializing agent...")
        agent = LangGraphFashionAgent()
        
        # Test request
        test_request = {
            "garmentType": "dress",
            "category": "women's tops", 
            "strategy": "balanced",
            "count": 1,
            "targetAudience": "young professionals",
            "occasion": "work",
            "preferences": {
                "colors": [],
                "style": "modern"
            }
        }
        
        print("🚀 Starting workflow...")
        print(f"Request: {json.dumps(test_request, indent=2)}")
        
        # Execute workflow
        result = await agent.generate_trend_based_designs(test_request)
        
        print("\n📊 Results:")
        print(f"Success: {result.get('success', False)}")
        
        if result.get('success'):
            print("✅ Workflow completed successfully!")
            
            # Print trend analysis
            if 'trend_analysis' in result:
                print("\n🔍 Trend Analysis:")
                trend_analysis = result['trend_analysis']
                print(f"  Season: {trend_analysis.get('season', 'N/A')}")
                print(f"  Year: {trend_analysis.get('year', 'N/A')}")
                print(f"  Category: {trend_analysis.get('category', 'N/A')}")
                
                if 'keyTrends' in trend_analysis:
                    print("  Key Trends:")
                    for trend in trend_analysis['keyTrends'][:3]:  # Show first 3
                        print(f"    - {trend.get('name', 'N/A')}: {trend.get('description', 'N/A')}")
            
            # Print generated designs
            if 'generated_designs' in result:
                print(f"\n🎨 Generated Designs: {len(result['generated_designs'])}")
                for i, design in enumerate(result['generated_designs'][:2]):  # Show first 2
                    print(f"  Design {i+1}: {design.get('id', 'N/A')}")
                    if 'concept' in design:
                        concept_preview = design['concept'][:100] + "..." if len(design['concept']) > 100 else design['concept']
                        print(f"    Concept: {concept_preview}")
            
            # Print final images
            if 'final_images' in result:
                print(f"\n🖼️ Generated Images: {len(result['final_images'])}")
                for i, image_path in enumerate(result['final_images']):
                    print(f"  Image {i+1}: {image_path}")
            
            # Print metadata
            if 'metadata' in result:
                print(f"\n📋 Metadata:")
                metadata = result['metadata']
                print(f"  Generated at: {metadata.get('generated_at', 'N/A')}")
                print(f"  Garment type: {metadata.get('garment_type', 'N/A')}")
                print(f"  Strategy: {metadata.get('strategy', 'N/A')}")
                print(f"  Target audience: {metadata.get('target_audience', 'N/A')}")
                print(f"  Occasion: {metadata.get('occasion', 'N/A')}")
        
        else:
            print("❌ Workflow failed!")
            if 'error' in result:
                print(f"Error: {result['error']}")
            if 'error_messages' in result:
                print("Error messages:")
                for msg in result['error_messages']:
                    print(f"  - {msg}")
        
        return result
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return {"success": False, "error": str(e)}


async def main():
    """Main test function"""
    print("🚀 Starting LangGraph Fashion Agent Tests")
    print("=" * 50)
    
    # Check environment variables
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ GOOGLE_API_KEY not found in environment variables")
        print("Please set your Google API key in the .env file")
        return
    
    # Test 1: Basic functionality
    print("\n🧪 Test 1: Basic Functionality")
    print("-" * 30)
    await test_langgraph_fashion_agent()
    


if __name__ == "__main__":
    asyncio.run(main())
