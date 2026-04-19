#!/usr/bin/env python3
"""
Test script for enhanced trend analysis with Tavily web search integration
"""

import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the enhanced fashion agent
from services.langgraphFashionAgent import LangGraphFashionAgent

async def test_enhanced_trend_analysis():
    """Test the enhanced trend analysis functionality"""
    
    print("🧪 Testing Enhanced Trend Analysis with Tavily Web Search")
    print("=" * 60)
    
    try:
        # Initialize the fashion agent
        print("🚀 Initializing LangGraph Fashion Agent...")
        agent = LangGraphFashionAgent()
        print("✅ Agent initialized successfully")
        
        # Test different categories and garment types
        test_cases = [
            {
                "name": "Dress Trends",
                "category": "dresses",
                "garment_type": "dress",
                "strategy": "trend_following",
                "count": 2,
                "target_audience": "young professionals",
                "occasion": "work"
            },
            {
                "name": "Top Trends",
                "category": "tops", 
                "garment_type": "blouse",
                "strategy": "balanced",
                "count": 2,
                "target_audience": "fashion enthusiasts",
                "occasion": "casual"
            },
            {
                "name": "Outerwear Trends",
                "category": "outerwear",
                "garment_type": "jacket",
                "strategy": "sustainable",
                "count": 2,
                "target_audience": "eco-conscious consumers",
                "occasion": "everyday"
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📋 Test Case {i}: {test_case['name']}")
            print("-" * 40)
            
            # Create request
            request = {
                "garmentType": test_case["garment_type"],
                "category": test_case["category"],
                "strategy": test_case["strategy"],
                "count": test_case["count"],
                "targetAudience": test_case["target_audience"],
                "occasion": test_case["occasion"],
                "preferences": {
                    "colors": ["navy", "black", "white"],
                    "style": "modern"
                }
            }
            
            print(f"🎯 Testing: {test_case['garment_type']} for {test_case['category']} category")
            print(f"📊 Strategy: {test_case['strategy']}")
            print(f"👥 Target: {test_case['target_audience']}")
            print(f"🎉 Occasion: {test_case['occasion']}")
            
            # Test just the trend analysis node
            print("\n🔍 Testing trend analysis node...")
            
            # Create initial state
            initial_state = {
                "request": request,
                "garment_type": request.get("garmentType", "general"),
                "category": request.get("category", "all"),
                "strategy": request.get("strategy", "balanced"),
                "count": request.get("count", 3),
                "target_audience": request.get("targetAudience", "general"),
                "occasion": request.get("occasion", "everyday"),
                "preferences": request.get("preferences", {}),
                "current_step": "initialized",
                "iteration_count": 0,
                "max_iterations": 1,
                "error_messages": [],
                "success": False,
                "final_result": None
            }
            
            # Test the trend analysis node directly
            trend_result = agent.trend_analysis_node(initial_state)
            
            if trend_result and trend_result.get("trend_analysis"):
                trend_analysis = trend_result["trend_analysis"]
                print("✅ Trend analysis completed successfully!")
                
                # Display key results
                print(f"📅 Season: {trend_analysis.get('season', 'N/A')}")
                print(f"📊 Data Source: {trend_analysis.get('dataSource', 'N/A')}")
                
                # Show web data metadata if available
                if "webDataMetadata" in trend_analysis:
                    metadata = trend_analysis["webDataMetadata"]
                    print(f"🌐 Sources Count: {metadata.get('sourcesCount', 0)}")
                    print(f"📈 Data Quality: {metadata.get('dataQuality', 'N/A')}")
                
                # Show key trends
                key_trends = trend_analysis.get("keyTrends", [])
                if key_trends:
                    print(f"🎨 Key Trends Found: {len(key_trends)}")
                    for j, trend in enumerate(key_trends[:3], 1):  # Show top 3
                        print(f"   {j}. {trend.get('name', 'N/A')} (confidence: {trend.get('confidence', 0):.2f})")
                
                # Show color palettes
                color_palettes = trend_analysis.get("colorPalettes", [])
                if color_palettes:
                    print(f"🎨 Color Palettes: {len(color_palettes)}")
                    for j, palette in enumerate(color_palettes[:2], 1):  # Show top 2
                        colors = palette.get('colors', [])
                        print(f"   {j}. {palette.get('name', 'N/A')}: {', '.join(colors[:3])}")
                
                # Show emerging trends if available
                emerging_trends = trend_analysis.get("emergingTrends", [])
                if emerging_trends:
                    print(f"🚀 Emerging Trends: {len(emerging_trends)}")
                    for j, trend in enumerate(emerging_trends[:2], 1):
                        print(f"   {j}. {trend.get('name', 'N/A')} ({trend.get('timeframe', 'N/A')})")
                
            else:
                print("❌ Trend analysis failed")
                if trend_result and trend_result.get("error_messages"):
                    for error in trend_result["error_messages"]:
                        print(f"   Error: {error}")
            
            print(f"\n⏱️  Test case {i} completed")
            
            # Add delay between test cases to avoid rate limiting
            if i < len(test_cases):
                print("⏳ Waiting 5 seconds before next test...")
                await asyncio.sleep(5)
        
        print("\n🎉 All trend analysis tests completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

async def test_web_search_only():
    """Test just the web search functionality"""
    
    print("\n🌐 Testing Web Search Functionality Only")
    print("=" * 50)
    
    try:
        agent = LangGraphFashionAgent()
        
        # Test web search for different categories
        test_queries = [
            ("dresses", "dress", "spring", 2025),
            ("tops", "blouse", "spring", 2025),
            ("outerwear", "jacket", "spring", 2025)
        ]
        
        for category, garment_type, season, year in test_queries:
            print(f"\n🔍 Testing web search for {category} {garment_type}...")
            
            # Test web data gathering
            web_data = agent.gather_web_trend_data(category, garment_type, season, year)
            
            if web_data and not web_data.get("error"):
                sources_count = len(web_data.get("sources", []))
                print(f"✅ Web search successful: {sources_count} sources found")
                
                # Show sample sources
                sources = web_data.get("sources", [])
                if sources:
                    print("📰 Sample sources:")
                    for i, source in enumerate(sources[:3], 1):
                        print(f"   {i}. {source.get('title', 'N/A')}")
                        print(f"      {source.get('content_preview', 'N/A')[:100]}...")
                
                # Show trend mentions
                trend_mentions = web_data.get("trend_mentions", [])
                if trend_mentions:
                    print(f"📊 Trend mentions found: {len(trend_mentions)}")
                
            else:
                print(f"❌ Web search failed: {web_data.get('error', 'Unknown error')}")
            
            # Add delay between searches
            await asyncio.sleep(3)
        
        print("\n✅ Web search tests completed!")
        
    except Exception as e:
        print(f"❌ Web search test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🧪 Enhanced Trend Analysis Test Suite")
    print("=" * 50)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 Tavily API Key: {'✅ Set' if os.getenv('TAVILY_API_KEY') else '❌ Missing'}")
    print(f"🔑 Google API Key: {'✅ Set' if os.getenv('GOOGLE_API_KEY') else '❌ Missing'}")
    
    # Run tests
    asyncio.run(test_web_search_only())
    asyncio.run(test_enhanced_trend_analysis())
