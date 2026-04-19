#!/usr/bin/env python3
"""
Test script for the improved image generation functionality
"""

import asyncio
import json
from services.langgraphFashionAgent import LangGraphFashionAgent

async def test_improved_image_generation():
    """Test the improved image generation with realistic product photographs"""
    
    print("🧪 Testing Improved Image Generation for Realistic Product Photographs")
    print("=" * 70)
    
    # Initialize the agent
    agent = LangGraphFashionAgent()
    
    # Test cases with different garment types
    test_cases = [
        {
            "name": "Professional Dress",
            "request": {
                "garmentType": "dress",
                "category": "dresses",
                "strategy": "balanced",
                "count": 1,
                "targetAudience": "young professionals",
                "occasion": "work",
                "preferences": {
                    "colors": ["navy", "black"],
                    "style": "professional"
                }
            }
        },
        {
            "name": "Casual T-Shirt",
            "request": {
                "garmentType": "t-shirt",
                "category": "tops",
                "strategy": "trend_following",
                "count": 1,
                "targetAudience": "young adults",
                "occasion": "casual",
                "preferences": {
                    "colors": ["white", "gray"],
                    "style": "minimalist"
                }
            }
        },
        {
            "name": "Formal Blazer",
            "request": {
                "garmentType": "blazer",
                "category": "outerwear",
                "strategy": "balanced",
                "count": 1,
                "targetAudience": "business professionals",
                "occasion": "formal",
                "preferences": {
                    "colors": ["charcoal", "navy"],
                    "style": "classic"
                }
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}: {test_case['name']}")
        print("-" * 50)
        
        try:
            # Generate designs with improved image generation
            result = await agent.generate_trend_based_designs(test_case['request'])
            
            if result.get('success'):
                print(f"✅ Successfully generated {test_case['name']}")
                
                # Display results
                if 'final_images' in result and result['final_images']:
                    print(f"📸 Generated {len(result['final_images'])} product photographs:")
                    for img_path in result['final_images']:
                        print(f"   - {img_path}")
                else:
                    print("⚠️ No images were generated")
                
                # Show design concepts
                if 'generated_designs' in result and result['generated_designs']:
                    print(f"🎨 Generated {len(result['generated_designs'])} design concepts")
                    for design in result['generated_designs']:
                        if 'concept' in design:
                            print(f"   - Design ID: {design['id']}")
                            print(f"   - Garment Type: {design.get('garment_type', 'N/A')}")
                            print(f"   - Target Audience: {design.get('target_audience', 'N/A')}")
                            print(f"   - Occasion: {design.get('occasion', 'N/A')}")
                
            else:
                print(f"❌ Failed to generate {test_case['name']}")
                if 'error' in result:
                    print(f"   Error: {result['error']}")
                if 'error_messages' in result:
                    for error_msg in result['error_messages']:
                        print(f"   - {error_msg}")
                        
        except Exception as e:
            print(f"❌ Exception during test case {i}: {e}")
        
        print()
    
    print("🏁 Testing completed!")

def test_image_prompt_generation():
    """Test the image prompt generation functionality"""
    
    print("\n🔍 Testing Image Prompt Generation")
    print("=" * 40)
    
    agent = LangGraphFashionAgent()
    
    # Test different design scenarios
    test_designs = [
        {
            "id": "test_1",
            "concept": "A modern minimalist dress with clean lines, midi length, and subtle pleating details",
            "garment_type": "dress",
            "target_audience": "young professionals",
            "occasion": "work",
            "category": "dresses"
        },
        {
            "id": "test_2", 
            "concept": "A casual cotton t-shirt with relaxed fit and contemporary graphic design",
            "garment_type": "t-shirt",
            "target_audience": "young adults",
            "occasion": "casual",
            "category": "tops"
        },
        {
            "id": "test_3",
            "concept": "A tailored blazer with structured shoulders and modern silhouette",
            "garment_type": "blazer",
            "target_audience": "business professionals", 
            "occasion": "formal",
            "category": "outerwear"
        }
    ]
    
    for design in test_designs:
        print(f"\n📝 Image Prompt for {design['garment_type']}:")
        print("-" * 30)
        
        prompt = agent.create_image_prompt(design)
        print(prompt[:500] + "..." if len(prompt) > 500 else prompt)
        print()

if __name__ == "__main__":
    print("🚀 Starting Image Generation Tests")
    
    # Test prompt generation first
    test_image_prompt_generation()
    
    # Test full workflow
    asyncio.run(test_improved_image_generation())
