"""
LangGraph-based AI Fashion Agent for Trend Forecasting and Design Generation
Combines trend analysis, design generation, and image creation using Gemini 2.5 Flash Image Preview
"""

import os
import json
import asyncio
import uuid
from typing import TypedDict, Annotated, List, Optional, Dict, Any
from datetime import datetime
import operator
from pathlib import Path

from dotenv import load_dotenv
_ = load_dotenv()

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver        
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Google AI imports
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from tavily import TavilyClient
tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

# Image processing
from PIL import Image
import base64
import io

class FashionAgentState(TypedDict):
    """State management for the fashion agent workflow"""
    # Input parameters
    request: Dict[str, Any]
    garment_type: str
    category: str
    strategy: str
    count: int
    target_audience: str
    occasion: str
    preferences: Dict[str, Any]
    
    # Workflow state
    trend_analysis: Optional[Dict[str, Any]]
    design_prompts: List[Dict[str, Any]]
    generated_designs: List[Dict[str, Any]]
    final_images: List[str]
    
    # Control flow
    current_step: str
    iteration_count: int
    max_iterations: int
    error_messages: List[str]
    
    # Results
    success: bool
    final_result: Optional[Dict[str, Any]]

class LangGraphFashionAgent:
    """LangGraph-based AI Fashion Agent for trend forecasting and design generation"""
    
    def __init__(self, project_id: str = "garment-design-ai-2025", location: str = "global"):
        """Initialize the fashion agent with Google AI and LangGraph"""
        
        # Initialize Google AI
        self.project_id = project_id
        self.location = location
        self.setup_google_ai()
        
        # Initialize LangGraph
        self.graph = None  # Will be built lazily
        self.memory = AsyncSqliteSaver.from_conn_string(":memory:")

        
        # Configuration
        self.config = {
            "max_designs_per_request": 5,
            "design_quality_threshold": 0.8,
            "trend_confidence_threshold": 0.7,
            "enable_variations": True,
            "enable_market_analysis": True
        }
        
        # Trend categories
        self.garment_categories = {
            "tops": {
                "types": ["t-shirt", "blouse", "shirt", "sweater", "jacket", "blazer"],
                "complexity": "medium",
                "trend_sensitivity": "high"
            },
            "bottoms": {
                "types": ["pants", "jeans", "shorts", "skirt", "leggings"],
                "complexity": "medium", 
                "trend_sensitivity": "high"
            },
            "dresses": {
                "types": ["casual dress", "formal dress", "maxi dress", "mini dress", "midi dress"],
                "complexity": "high",
                "trend_sensitivity": "very high"
            },
            "outerwear": {
                "types": ["coat", "jacket", "blazer", "cardigan", "vest"],
                "complexity": "high",
                "trend_sensitivity": "medium"
            }
        }
        
        # Design strategies
        self.design_strategies = {
            "trend_following": {
                "description": "Follow current trends closely",
                "trend_weight": 0.9,
                "creativity_weight": 0.1,
                "market_fit_weight": 0.8
            },
            "trend_leading": {
                "description": "Lead trends with innovative designs",
                "trend_weight": 0.6,
                "creativity_weight": 0.9,
                "market_fit_weight": 0.5
            },
            "balanced": {
                "description": "Balance trends with timeless appeal",
                "trend_weight": 0.7,
                "creativity_weight": 0.5,
                "market_fit_weight": 0.9
            },
            "sustainable": {
                "description": "Focus on sustainable and ethical design",
                "trend_weight": 0.5,
                "creativity_weight": 0.7,
                "market_fit_weight": 0.8
            }
        }

    def setup_google_ai(self):
        """Setup Google AI with Gemini models"""
        try:
            # Configure for Vertex AI
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            
            # Initialize models
            self.trend_model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-exp",
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            self.image_model = genai.GenerativeModel(
                model_name="gemini-2.5-flash-image-preview",
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

    def build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        builder = StateGraph(FashionAgentState)
        
        # Add nodes
        builder.add_node("trend_analyzer", self.trend_analysis_node)
        builder.add_node("design_planner", self.design_planning_node)
        builder.add_node("design_generator", self.design_generation_node)
        builder.add_node("image_creator", self.image_creation_node)
        builder.add_node("quality_assessor", self.quality_assessment_node)
        builder.add_node("result_compiler", self.result_compilation_node)
        
        # Set entry point
        builder.set_entry_point("trend_analyzer")
        
        # Add edges
        builder.add_edge("trend_analyzer", "design_planner")
        builder.add_edge("design_planner", "design_generator")
        builder.add_edge("design_generator", "image_creator")
        builder.add_edge("image_creator", "quality_assessor")
        
        # Conditional edge for quality assessment
        builder.add_conditional_edges(
            "quality_assessor",
            self.should_continue_workflow,
            {
                "continue": "result_compiler",
                "regenerate": "design_generator",
                "end": END
            }
        )
        
        builder.add_edge("result_compiler", END)
        
        # Compile the graph with the checkpointer
        #with self.memory as checkpointer:
        graph = builder.compile()
        return graph

    # Node implementations
    def trend_analysis_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Analyze current fashion trends using web search and AI analysis"""
        print("🔍 Analyzing current fashion trends with web search...")
        
        try:
            category = state.get("category", "all")
            garment_type = state.get("garment_type", "general")
            current_season = self.get_current_season()
            current_year = datetime.now().year
            
            # Step 1: Gather real-time trend data from web search
            print("🌐 Searching for current fashion trends...")
            web_trend_data = self.gather_web_trend_data(category, garment_type, current_season, current_year)
            
            # Step 2: Analyze trends with AI using web data
            print("🤖 Analyzing trends with AI...")
            trend_analysis = self.analyze_trends_with_ai(web_trend_data, category, garment_type, current_season, current_year)
            print("final trend analysis with web data", trend_analysis)
            return {
                "trend_analysis": trend_analysis,
                "current_step": "trend_analysis_complete"
            }
            
        except Exception as e:
            print(f"❌ Error in trend analysis: {e}")
            return {
                "trend_analysis": self.get_default_trends(category),
                "current_step": "trend_analysis_complete",
                "error_messages": [f"Trend analysis error: {str(e)}"]
            }

    def design_planning_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Plan design generation based on trends"""
        print("📋 Planning design generation...")
        
        try:
            trend_analysis = state.get("trend_analysis", {})
            garment_type = state.get("garment_type", "general")
            strategy = state.get("strategy", "balanced")
            count = state.get("count", 3)
            target_audience = state.get("target_audience", "general")
            occasion = state.get("occasion", "everyday")
            preferences = state.get("preferences", {})
            
            strategy_config = self.design_strategies.get(strategy, self.design_strategies["balanced"])
            
            design_prompts = []
            for i in range(count):
                prompt = self.generate_design_prompt(
                    trend_analysis, garment_type, strategy_config,
                    target_audience, occasion, preferences, i
                )
                
                design_prompts.append({
                    "id": f"prompt_{i}",
                    "prompt": prompt,
                    "strategy": strategy,
                    "target_audience": target_audience,
                    "occasion": occasion,
                    "variation": i
                })
            print(design_prompts)
            return {
                "design_prompts": design_prompts,
                "current_step": "design_planning_complete"
            }
            
        except Exception as e:
            print(f"❌ Error in design planning: {e}")
            return {
                "design_prompts": [],
                "current_step": "design_planning_complete",
                "error_messages": [f"Design planning error: {str(e)}"]
            }

    def design_generation_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Generate design concepts"""
        print("🎨 Generating design concepts...")
        
        try:
            design_prompts = state.get("design_prompts", [])
            generated_designs = []
            
            for prompt_data in design_prompts:
                try:
                    # Generate design concept using Gemini
                    response = self.trend_model.generate_content(prompt_data["prompt"])
                    print("Design concept Gemini:", response.text)
                    design_concept = {
                        "id": prompt_data["id"],
                        "prompt": prompt_data["prompt"],
                        "concept": response.text,
                        "strategy": prompt_data["strategy"],
                        "target_audience": prompt_data["target_audience"],
                        "occasion": prompt_data["occasion"],
                        "variation": prompt_data["variation"],
                        "garment_type": state.get("garment_type", "general"),
                        "category": state.get("category", "all"),
                        "generated_at": datetime.now().isoformat()
                    }
                    print("Design concept:", design_concept)
                    generated_designs.append(design_concept)

                    
                except Exception as e:
                    print(f"❌ Error generating design {prompt_data['id']}: {e}")
                    generated_designs.append({
                        "id": prompt_data["id"],
                        "error": str(e),
                        "is_fallback": True
                    })
            
            return {
                "generated_designs": generated_designs,
                "current_step": "design_generation_complete"
            }
            
        except Exception as e:
            print(f"❌ Error in design generation: {e}")
            return {
                "generated_designs": [],
                "current_step": "design_generation_complete",
                "error_messages": [f"Design generation error: {str(e)}"]
            }

    def image_creation_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Create images using Gemini 2.5 Flash Image Preview"""
        print("🖼️ Creating images with Gemini...")
        
        try:
            generated_designs = state.get("generated_designs", [])
            final_images = []
            
            for design in generated_designs:
                if "error" in design:
                    continue
                    
                try:
                    print(f"🎨 Creating product photograph for design {design['id']}...")
                    
                    # Create image prompt for Gemini
                    image_prompt = self.create_image_prompt(design)
                    print(f"📝 Image prompt created for {design.get('garment_type', 'garment')}")
                    
                    # Generate image using Gemini 2.5 Flash Image Preview
                    response = self.image_model.generate_content([
                        image_prompt
                    ])
                    
                    # Extract image from response
                    if response.candidates and response.candidates[0].content.parts:
                        for part in response.candidates[0].content.parts:
                            if hasattr(part, 'inline_data') and part.inline_data:
                                # Save image
                                image_data = part.inline_data.data
                                image_path = self.save_generated_image(image_data, design["id"])
                                if image_path:
                                    final_images.append(image_path)
                                    print(f"✅ Product photograph saved: {image_path}")
                                break
                    else:
                        print(f"⚠️ No image data found in response for design {design['id']}")
                    
                except Exception as e:
                    print(f"❌ Error creating product photograph for design {design['id']}: {e}")
                    continue
            
            return {
                "final_images": final_images,
                "current_step": "image_creation_complete"
            }
            
        except Exception as e:
            print(f"❌ Error in image creation: {e}")
            return {
                "final_images": [],
                "current_step": "image_creation_complete",
                "error_messages": [f"Image creation error: {str(e)}"]
            }

    def quality_assessment_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Assess quality of generated designs and images"""
        print("📊 Assessing quality...")
        
        try:
            generated_designs = state.get("generated_designs", [])
            final_images = state.get("final_images", [])
            
            # Simple quality assessment
            quality_score = 0
            if generated_designs:
                quality_score += 0.5
            if final_images:
                quality_score += 0.5
            
            return {
                "current_step": "quality_assessment_complete",
                "quality_score": quality_score
            }
            
        except Exception as e:
            print(f"❌ Error in quality assessment: {e}")
            return {
                "current_step": "quality_assessment_complete",
                "quality_score": 0,
                "error_messages": [f"Quality assessment error: {str(e)}"]
            }

    def result_compilation_node(self, state: FashionAgentState) -> Dict[str, Any]:
        """Compile final results"""
        print("📦 Compiling final results...")
        
        try:
            final_result = {
                "success": True,
                "trend_analysis": state.get("trend_analysis", {}),
                "generated_designs": state.get("generated_designs", []),
                "final_images": state.get("final_images", []),
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "garment_type": state.get("garment_type", "general"),
                    "category": state.get("category", "all"),
                    "strategy": state.get("strategy", "balanced"),
                    "target_audience": state.get("target_audience", "general"),
                    "occasion": state.get("occasion", "everyday")
                }
            }
            
            return {
                "final_result": final_result,
                "success": True,
                "current_step": "complete"
            }
            
        except Exception as e:
            print(f"❌ Error in result compilation: {e}")
            return {
                "final_result": None,
                "success": False,
                "current_step": "complete",
                "error_messages": [f"Result compilation error: {str(e)}"]
            }

    def should_continue_workflow(self, state: FashionAgentState) -> str:
        """Determine if workflow should continue"""
        #quality_score = state.get("quality_score", 0)
        iteration_count = state.get("iteration_count", 0)
        max_iterations = state.get("max_iterations", 1)
        
        #if quality_score >= 0.8:
         #   return "continue"
        #if iteration_count < max_iterations:
         #   iteration_count += 1
          #  return "regenerate"
        #else:
        #    return "end"
        return "continue"

    # Helper methods
    def get_current_season(self) -> str:
        """Get current season"""
        month = datetime.now().month
        if month >= 2 and month <= 4:
            return "spring"
        elif month >= 5 and month <= 7:
            return "summer"
        elif month >= 8 and month <= 10:
            return "fall"
        else:
            return "winter"

    def parse_trend_analysis(self, analysis_text: str, category: str) -> Dict[str, Any]:
        """Parse trend analysis from AI response"""
        try:
            # Try to extract JSON
            import re
            json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback to default trends
        return self.get_default_trends(category)

    def get_default_trends(self, category: str) -> Dict[str, Any]:
        """Get default trend data"""
        return {
            "season": self.get_current_season(),
            "year": datetime.now().year,
            "category": category,
            "keyTrends": [
                {
                    "name": "Sustainable Fashion",
                    "description": "Eco-friendly materials and ethical production methods",
                    "confidence": 0.9,
                    "designImplications": ["Use organic materials", "Minimize waste", "Consider lifecycle"]
                }
            ],
            "colorPalettes": [
                {
                    "name": "Earth Tones",
                    "colors": ["sage green", "terracotta", "cream", "navy", "rust"],
                    "usage": "primary",
                    "trendStrength": 0.8
                }
            ],
            "styleDirections": [
                {
                    "name": "Modern Minimalism",
                    "description": "Clean, functional, and timeless designs",
                    "keyElements": ["oversized fits", "neutral colors", "quality materials"],
                    "targetAudience": "conscious consumers"
                }
            ],
            "materialTrends": [
                {
                    "material": "organic cotton",
                    "usage": "primary fabric",
                    "sustainability": "sustainable",
                    "trendStrength": 0.8
                }
            ]
        }

    def gather_web_trend_data(self, category: str, garment_type: str, season: str, year: int) -> Dict[str, Any]:
        """Gather real-time fashion trend data using Tavily web search"""
        print(f"🔍 Gathering web trend data for {category} {garment_type}...")
        
        try:
            # Define search queries for comprehensive trend analysis
            search_queries = self.generate_trend_search_queries(category, garment_type, season, year)
            
            all_search_results = []
            
            # Execute multiple searches for comprehensive coverage
            for query_type, query in search_queries.items():
                try:
                    print(f"🔍 Searching: {query}")
                    response = tavily.search(
                        query=query,
                        max_results=3,
                        search_depth="advanced",
                        include_answer=True,
                        include_raw_content=True
                    )
                    
                    if response and response.get('results'):
                        all_search_results.extend(response['results'])
                        print(f"✅ Found {len(response['results'])} results for {query_type}")
                    else:
                        print(f"⚠️ No results found for {query_type}")
                        
                except Exception as e:
                    print(f"❌ Search error for {query_type}: {e}")
                    continue
            
            # Process and structure the search results
            processed_data = self.process_search_results(all_search_results, category, garment_type)
            
            print(f"📊 Processed {len(processed_data.get('sources', []))} trend sources")
            return processed_data
            
        except Exception as e:
            print(f"❌ Error gathering web trend data: {e}")
            return {"error": str(e), "sources": []}

    def generate_trend_search_queries(self, category: str, garment_type: str, season: str, year: int) -> Dict[str, str]:
        """Generate comprehensive search queries for trend analysis"""
        
        # Base queries for different aspects of fashion trends
        queries = {
            "general_trends": f"{season} {year} fashion trends {category}",
            "color_trends": f"{season} {year} fashion color trends {garment_type}",
            "style_trends": f"latest {garment_type} fashion trends {season} {year}",
            "material_trends": f"fashion materials {season} {year} {category}",
            "runway_trends": f"fashion week {season} {year} {category} trends",
            "street_style": f"street style {garment_type} trends {season} {year}",
            "future_trends": f"fashion trends forecast {year} {category}",
            "sustainability": f"sustainable fashion trends {season} {year} {garment_type}"
        }
        
        # Add specific queries based on category
        if category == "dresses":
            queries["dress_specific"] = f"dress trends {season} {year} silhouettes colors"
        elif category == "tops":
            queries["top_specific"] = f"top shirt blouse trends {season} {year}"
        elif category == "bottoms":
            queries["bottom_specific"] = f"pants jeans skirt trends {season} {year}"
        elif category == "outerwear":
            queries["outerwear_specific"] = f"jacket coat blazer trends {season} {year}"
        
        return queries

    def process_search_results(self, search_results: List[Dict], category: str, garment_type: str) -> Dict[str, Any]:
        """Process and structure search results into organized trend data"""
        
        processed_data = {
            "sources": [],
            "trend_mentions": [],
            "color_mentions": [],
            "material_mentions": [],
            "style_mentions": [],
            "raw_content": []
        }
        
        for result in search_results:
            try:
                # Extract and clean content
                title = result.get('title', '')
                content = result.get('content', '')
                url = result.get('url', '')
                
                if not content:
                    continue
                
                # Add to sources
                processed_data["sources"].append({
                    "title": title,
                    "url": url,
                    "content_preview": content[:200] + "..." if len(content) > 200 else content
                })
                
                # Add raw content for AI analysis
                processed_data["raw_content"].append({
                    "title": title,
                    "content": content,
                    "url": url
                })
                
                # Extract trend-related keywords and phrases
                self.extract_trend_keywords(content, processed_data)
                
            except Exception as e:
                print(f"⚠️ Error processing search result: {e}")
                continue
        
        return processed_data

    def extract_trend_keywords(self, content: str, processed_data: Dict[str, Any]):
        """Extract trend-related keywords from content"""
        
        # Simple keyword extraction (can be enhanced with NLP)
        content_lower = content.lower()
        
        # Color keywords
        color_keywords = ['color', 'hue', 'shade', 'palette', 'chromatic', 'neutral', 'bold', 'vibrant']
        if any(keyword in content_lower for keyword in color_keywords):
            processed_data["color_mentions"].append(content[:100])
        
        # Material keywords
        material_keywords = ['fabric', 'material', 'textile', 'cotton', 'silk', 'wool', 'sustainable', 'organic', 'recycled']
        if any(keyword in content_lower for keyword in material_keywords):
            processed_data["material_mentions"].append(content[:100])
        
        # Style keywords
        style_keywords = ['style', 'silhouette', 'cut', 'fit', 'design', 'aesthetic', 'look', 'vibe']
        if any(keyword in content_lower for keyword in style_keywords):
            processed_data["style_mentions"].append(content[:100])
        
        # General trend keywords
        trend_keywords = ['trend', 'trending', 'popular', 'emerging', 'hot', 'must-have', 'in-demand']
        if any(keyword in content_lower for keyword in trend_keywords):
            processed_data["trend_mentions"].append(content[:100])

    def analyze_trends_with_ai(self, web_trend_data: Dict[str, Any], category: str, garment_type: str, season: str, year: int) -> Dict[str, Any]:
        """Analyze web trend data using AI to generate structured trend insights"""
        
        try:
            # Prepare web data for AI analysis
            web_content = self.prepare_web_content_for_ai(web_trend_data)
            
            # Create comprehensive prompt for AI analysis
            analysis_prompt = f"""
            You are a fashion trend analyst with access to real-time web data. Analyze the following web search results about {season} {year} fashion trends for {category} category, specifically {garment_type} garments.

            WEB SEARCH DATA:
            {web_content}

            Based on this real-time data, provide a comprehensive trend analysis in the following JSON format:

            {{
              "season": "{season}",
              "year": {year},
              "category": "{category}",
              "garmentType": "{garment_type}",
              "dataSource": "web_search",
              "keyTrends": [
                {{
                  "name": "trend name",
                  "description": "detailed description based on web data",
                  "confidence": 0.85,
                  "designImplications": ["implication 1", "implication 2"],
                  "source": "web_analysis"
                }}
              ],
              "colorPalettes": [
                {{
                  "name": "palette name",
                  "colors": ["color1", "color2", "color3"],
                  "usage": "primary/secondary/accent",
                  "trendStrength": 0.8,
                  "source": "web_analysis"
                }}
              ],
              "styleDirections": [
                {{
                  "name": "style direction",
                  "description": "description based on web trends",
                  "keyElements": ["element1", "element2"],
                  "targetAudience": "audience description",
                  "source": "web_analysis"
                }}
              ],
              "materialTrends": [
                {{
                  "material": "material name",
                  "usage": "usage description",
                  "sustainability": "sustainable/conventional",
                  "trendStrength": 0.7,
                  "source": "web_analysis"
                }}
              ],
              "emergingTrends": [
                {{
                  "name": "emerging trend",
                  "description": "description of emerging trend",
                  "growthPotential": 0.8,
                  "timeframe": "short/medium/long term"
                }}
              ],
              "marketInsights": [
                {{
                  "insight": "market insight",
                  "relevance": "high/medium/low",
                  "source": "web_analysis"
                }}
              ]
            }}

            IMPORTANT INSTRUCTIONS:
            1. Base your analysis on the actual web search data provided
            2. Extract real trends, colors, materials, and styles mentioned in the sources
            3. Provide confidence scores based on how frequently trends are mentioned
            4. Include emerging trends that show growth potential
            5. Focus on actionable insights for garment design
            6. If web data is limited, supplement with your knowledge but clearly indicate sources
            7. Return ONLY valid JSON - no additional text or explanations

            Analyze the web data and provide the trend analysis:
            """
            
            # Get AI analysis
            response = self.trend_model.generate_content(analysis_prompt)

            trend_analysis = self.parse_trend_analysis(response.text, category)
            
            # Enhance with web data metadata
            if isinstance(trend_analysis, dict):
                trend_analysis["webDataMetadata"] = {
                    "sourcesCount": len(web_trend_data.get("sources", [])),
                    "analysisDate": datetime.now().isoformat(),
                    "dataQuality": "high" if len(web_trend_data.get("sources", [])) > 5 else "medium"
                }
            
            return trend_analysis
            
        except Exception as e:
            print(f"❌ Error in AI trend analysis: {e}")
            # Fallback to default trends with web data context
            fallback_trends = self.get_default_trends(category)
            fallback_trends["dataSource"] = "fallback_with_web_context"
            fallback_trends["webDataMetadata"] = {
                "sourcesCount": len(web_trend_data.get("sources", [])),
                "analysisDate": datetime.now().isoformat(),
                "dataQuality": "limited"
            }
            return fallback_trends

    def prepare_web_content_for_ai(self, web_trend_data: Dict[str, Any]) -> str:
        """Prepare web search data for AI analysis"""
        
        content_parts = []
        
        # Add source summaries
        if web_trend_data.get("sources"):
            content_parts.append("TREND SOURCES:")
            for i, source in enumerate(web_trend_data["sources"][:10], 1):  # Limit to top 10 sources
                content_parts.append(f"{i}. {source['title']}")
                content_parts.append(f"   {source['content_preview']}")
                content_parts.append("")
        
        # Add raw content excerpts
        if web_trend_data.get("raw_content"):
            content_parts.append("DETAILED CONTENT:")
            for i, content in enumerate(web_trend_data["raw_content"][:5], 1):  # Limit to top 5 detailed sources
                content_parts.append(f"Source {i}: {content['title']}")
                content_parts.append(content['content'][:500] + "..." if len(content['content']) > 500 else content['content'])
                content_parts.append("")
        
        # Add trend mentions
        if web_trend_data.get("trend_mentions"):
            content_parts.append("TREND MENTIONS:")
            for mention in web_trend_data["trend_mentions"][:10]:
                content_parts.append(f"- {mention}")
        
        return "\n".join(content_parts)

    def generate_design_prompt(self, trend_analysis: Dict, garment_type: str, 
                             strategy_config: Dict, target_audience: str, 
                             occasion: str, preferences: Dict, variation: int) -> str:
        """Generate design prompt based on trends and strategy"""
        
        prompt = f"""
        You are a fashion design expert. Create a detailed design concept for a {garment_type} garment.

        TREND ANALYSIS:
        {json.dumps(trend_analysis, indent=2)}
        
        DESIGN STRATEGY: {strategy_config['description']}
        - Trend Influence: {strategy_config['trend_weight'] * 100}%
        - Creativity Level: {strategy_config['creativity_weight'] * 100}%
        - Market Fit Focus: {strategy_config['market_fit_weight'] * 100}%
        
        TARGET AUDIENCE: {target_audience}
        OCCASION: {occasion}
        
        Please provide a comprehensive design concept including:
        1. Style direction and aesthetic
        2. Color palette and usage
        3. Material suggestions
        4. Silhouette and fit
        5. Key design elements
        6. Target market considerations
        
        Create a distinct garment design concept while maintaining trend alignment.
        IMPORTANT: Return ONLY the design concept. Do not include any introductory text, explanations, or concluding remarks. Start directly with the design concept.

    
        """
        
        return prompt

    def create_image_prompt(self, design: Dict) -> str:
        """Create image generation prompt for Gemini to generate realistic product photographs"""
        
        # Extract design details for more specific prompting
        garment_type = design.get('garment_type', 'garment')
        target_audience = design.get('target_audience', 'general')
        occasion = design.get('occasion', 'everyday')
        category = design.get('category', 'all')
        
        # Get specific styling guidelines based on garment type
        styling_guidelines = self.get_garment_specific_styling(garment_type, category)
        
        garment_prompt = f"""
        Create a high-quality, photorealistic product photograph of a {garment_type} based on this design concept:
        
        {design['concept']}
        
        PHOTOGRAPHY SPECIFICATIONS:
        - Professional product photography style
        - Studio lighting with soft, even illumination
        - Clean, minimalist white or light gray background
        - High resolution (4K quality)
        - Sharp focus and excellent detail
        - Commercial e-commerce photography aesthetic
        
        COMPOSITION REQUIREMENTS:
        - Centered, well-balanced composition
        - Full garment visible in frame
        - Professional mannequin or model wearing the garment
        - Multiple angles if possible (front view preferred)
        - Proper proportions and realistic fit
        - No distracting elements or props
        
        STYLING GUIDELINES:
        - Target audience: {target_audience}
        - Occasion: {occasion}
        - Garment should appear as if ready for retail sale
        - Professional styling that highlights design features
        - Clean, pressed appearance
        - Natural fabric drape and movement
        
        
        TECHNICAL QUALITY:
        - Photorealistic rendering
        - Accurate color representation
        - Proper fabric texture and material appearance
        - Professional lighting that eliminates harsh shadows
        - High contrast and clarity
        - Commercial photography quality
        
        The final image should look like a professional product photograph that could be used for:
        - E-commerce product listings
        - Fashion retail websites
        - Marketing materials
        - Product catalogs
        
        Avoid any artistic illustrations, sketches, or non-photographic styles. Focus on creating a realistic, commercial-quality product photograph.
        """
        print("final_garment_prompt", garment_prompt)
        return garment_prompt
    def get_garment_specific_styling(self, garment_type: str, category: str) -> str:
        """Get specific styling guidelines based on garment type and category"""
        
        styling_rules = {
            "dress": """
        - Dress should be properly fitted and show natural silhouette
        - Highlight neckline, waistline, and hem details
        - Show fabric drape and movement
        - Professional styling appropriate for the occasion""",
            
            "tops": """
        - Show proper fit around shoulders and chest
        - Highlight neckline, sleeves, and hem details
        - Display fabric texture and pattern clearly
        - Professional presentation suitable for target audience""",
            
            "bottoms": """
        - Show proper fit at waist and hips
        - Highlight pocket details, seams, and hem
        - Display fabric drape and movement
        - Professional styling that shows versatility""",
            
            "outerwear": """
        - Show proper layering and fit
        - Highlight closure details (buttons, zippers, etc.)
        - Display fabric weight and texture
        - Professional styling that shows functionality""",
            
            "jacket": """
        - Show proper structure and tailoring
        - Highlight lapels, pockets, and closure details
        - Display fabric quality and construction
        - Professional styling that emphasizes craftsmanship""",
            
            "blazer": """
        - Show tailored fit and structure
        - Highlight lapels, buttons, and pocket details
        - Display professional appearance
        - Styling appropriate for business or formal occasions""",
            
            "sweater": """
        - Show knit texture and pattern
        - Highlight neckline and sleeve details
        - Display fabric drape and comfort
        - Cozy, professional styling""",
            
            "shirt": """
        - Show crisp, clean appearance
        - Highlight collar, cuffs, and button details
        - Display fabric quality and construction
        - Professional styling suitable for work or casual wear"""
        }
        
        # Return specific styling or default
        return styling_rules.get(garment_type.lower(), """
        - Show proper fit and construction
        - Highlight key design features
        - Display fabric quality and texture
        - Professional styling appropriate for the occasion""")

    def save_generated_image(self, image_data: bytes, design_id: str) -> str:
        """Save generated image to file"""
        try:
            # Create uploads directory if it doesn't exist
            uploads_dir = Path("uploads")
            uploads_dir.mkdir(exist_ok=True)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"langgraph_design_{design_id}_{timestamp}.png"
            filepath = uploads_dir / filename
            
            # Save image
            with open(filepath, "wb") as f:
                f.write(image_data)
            
            print(f"✅ Image saved: {filepath}")
            return str(filepath)
            
        except Exception as e:
            print(f"❌ Error saving image: {e}")
            return ""

    # Main execution method
    async def generate_trend_based_designs(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Main method to generate trend-based designs"""
        print("🚀 Starting LangGraph Fashion Agent workflow...")
        
        try:
            # Initialize state
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
            
            # Execute workflow using ainvoke for compatibility
            thread_config = {"configurable": {"thread_id": f"fashion_agent_{uuid.uuid4()}"}}
            
            print("🔄 Executing workflow...")
            graph =  self.build_graph()
            final_state = await graph.ainvoke(initial_state, thread_config)
            
            if final_state and final_state.get("success"):
                print("✅ Fashion Agent workflow completed successfully!")
                return final_state.get("final_result", {})
            else:
                print("❌ Fashion Agent workflow failed")
                return {
                    "success": False,
                    "error": "Workflow execution failed",
                    "error_messages": final_state.get("error_messages", []) if final_state else []
                }
                
        except Exception as e:
            print(f"❌ Error in main workflow: {e}")
            return {
                "success": False,
                "error": str(e),
                "error_messages": [str(e)]
            }

# Example usage
if __name__ == "__main__":
    async def main():
        # Initialize agent
        response = tavily.search(query="What is the latest fashion trend for t-shirts?", max_results=2)
        print("response", response)
        agent = LangGraphFashionAgent()
        
        # Example request
        request = {
            "garmentType": "dress",
            "category": "dresses",
            "strategy": "balanced",
            "count": 2,
            "targetAudience": "young professionals",
            "occasion": "work",
            "preferences": {
                "colors": ["navy", "black", "white"],
                "style": "minimalist"
            }
        }
        
        # Generate designs
        #result = await agent.generate_trend_based_designs(request)
        #print("Final result:", json.dumps(result, indent=2))
    
    # Run the example
    asyncio.run(main())
