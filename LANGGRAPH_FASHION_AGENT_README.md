# LangGraph Fashion Agent

A sophisticated AI-powered fashion agent built with LangGraph for trend forecasting and design generation using Google's Gemini 2.5 Flash Image Preview model.

## 🚀 Features

- **Trend Analysis**: Real-time fashion trend analysis using Gemini 2.0 Flash
- **Design Generation**: AI-powered design concept generation
- **Image Creation**: High-quality fashion illustrations using Gemini 2.5 Flash Image Preview
- **Workflow Management**: LangGraph-based state management and workflow orchestration
- **Multiple Strategies**: Support for different design strategies (trend-following, trend-leading, balanced, sustainable)
- **Quality Assessment**: Built-in quality control and iteration capabilities
- **Persistence**: SQLite-based checkpointing for workflow state management

## 🏗️ Architecture

The agent is built using LangGraph's StateGraph pattern with the following workflow:

```
Trend Analysis → Design Planning → Design Generation → Image Creation → Quality Assessment → Result Compilation
```

### Key Components

1. **FashionAgentState**: TypedDict for state management
2. **LangGraphFashionAgent**: Main agent class
3. **Node Functions**: Individual workflow steps
4. **Conditional Edges**: Smart workflow control
5. **Checkpointer**: State persistence

## 📋 Prerequisites

- Python 3.8+
- Google API Key (for Gemini models)
- Required Python packages (see requirements_langgraph.txt)

## 🛠️ Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements_langgraph.txt
   ```

2. **Set up environment variables**:
   Create a `.env` file in the project root:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. **Verify installation**:
   ```bash
   python test_langgraph_agent.py
   ```

## 🎯 Usage

### Basic Usage

```python
import asyncio
from services.langgraphFashionAgent import LangGraphFashionAgent

async def main():
    # Initialize agent
    agent = LangGraphFashionAgent()
    
    # Create request
    request = {
        "garmentType": "dress",
        "category": "dresses",
        "strategy": "balanced",
        "count": 3,
        "targetAudience": "young professionals",
        "occasion": "work",
        "preferences": {
            "colors": ["navy", "black", "white"],
            "style": "minimalist"
        }
    }
    
    # Generate designs
    result = await agent.generate_trend_based_designs(request)
    
    if result.get('success'):
        print("✅ Designs generated successfully!")
        print(f"Generated {len(result.get('generated_designs', []))} designs")
        print(f"Created {len(result.get('final_images', []))} images")
    else:
        print(f"❌ Error: {result.get('error')}")

# Run the example
asyncio.run(main())
```

### Advanced Usage

```python
# Test different strategies
strategies = ["trend_following", "trend_leading", "balanced", "sustainable"]

for strategy in strategies:
    request = {
        "garmentType": "shirt",
        "category": "tops",
        "strategy": strategy,
        "count": 2,
        "targetAudience": "fashion enthusiasts",
        "occasion": "casual"
    }
    
    result = await agent.generate_trend_based_designs(request)
    print(f"Strategy {strategy}: {result.get('success')}")
```

## 🔧 Configuration

### Design Strategies

- **trend_following**: Follow current trends closely (90% trend weight)
- **trend_leading**: Lead trends with innovative designs (60% trend weight, 90% creativity)
- **balanced**: Balance trends with timeless appeal (70% trend weight, 90% market fit)
- **sustainable**: Focus on sustainable and ethical design (50% trend weight, 80% market fit)

### Garment Categories

- **tops**: t-shirt, blouse, shirt, sweater, jacket, blazer
- **bottoms**: pants, jeans, shorts, skirt, leggings
- **dresses**: casual, formal, maxi, mini, midi dresses
- **outerwear**: coat, jacket, blazer, cardigan, vest

### Request Parameters

```python
request = {
    "garmentType": str,      # Type of garment to design
    "category": str,         # Garment category
    "strategy": str,         # Design strategy
    "count": int,           # Number of designs to generate
    "targetAudience": str,   # Target audience
    "occasion": str,        # Use occasion
    "preferences": dict     # User preferences
}
```

## 📊 Workflow Details

### 1. Trend Analysis Node
- Analyzes current fashion trends for the specified category
- Uses Gemini 2.0 Flash for trend analysis
- Returns structured trend data including colors, styles, materials

### 2. Design Planning Node
- Creates design prompts based on trend analysis
- Applies selected strategy weights
- Generates multiple design concepts

### 3. Design Generation Node
- Generates detailed design concepts using Gemini
- Applies trend insights and strategy preferences
- Creates comprehensive design briefs

### 4. Image Creation Node
- Uses Gemini 2.5 Flash Image Preview for image generation
- Creates high-quality fashion illustrations
- Saves images to uploads directory

### 5. Quality Assessment Node
- Evaluates generated designs and images
- Determines if regeneration is needed
- Controls workflow iteration

### 6. Result Compilation Node
- Compiles final results
- Organizes output data
- Returns structured response

## 🎨 Output Format

```python
{
    "success": bool,
    "trend_analysis": {
        "season": str,
        "year": int,
        "category": str,
        "keyTrends": [...],
        "colorPalettes": [...],
        "styleDirections": [...],
        "materialTrends": [...]
    },
    "generated_designs": [
        {
            "id": str,
            "prompt": str,
            "concept": str,
            "strategy": str,
            "target_audience": str,
            "occasion": str,
            "variation": int,
            "generated_at": str
        }
    ],
    "final_images": [str],  # List of image file paths
    "metadata": {
        "generated_at": str,
        "garment_type": str,
        "category": str,
        "strategy": str,
        "target_audience": str,
        "occasion": str
    }
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_langgraph_agent.py
```

The test suite includes:
- Basic functionality test
- Different strategy testing
- Different garment type testing
- Error handling verification

## 🔍 Troubleshooting

### Common Issues

1. **Google API Key Error**:
   ```
   ❌ GOOGLE_API_KEY not found in environment variables
   ```
   Solution: Set your Google API key in the `.env` file

2. **Import Errors**:
   ```
   ModuleNotFoundError: No module named 'langgraph'
   ```
   Solution: Install requirements: `pip install -r requirements_langgraph.txt`

3. **Image Generation Failures**:
   - Check API quotas and limits
   - Verify image model availability
   - Check network connectivity

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=1
```

## 🚀 Performance

- **Trend Analysis**: ~2-5 seconds
- **Design Generation**: ~3-8 seconds per design
- **Image Creation**: ~5-15 seconds per image
- **Total Workflow**: ~30-60 seconds for 3 designs

## 🔮 Future Enhancements

- [ ] Web search integration for real-time trend data
- [ ] Multi-modal input support (reference images)
- [ ] Advanced quality assessment metrics
- [ ] Batch processing capabilities
- [ ] Custom model fine-tuning
- [ ] API endpoint integration
- [ ] Real-time streaming updates

## 📚 References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Google AI Gemini API](https://ai.google.dev/docs)
- [LangChain Documentation](https://python.langchain.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- LangGraph team for the excellent framework
- Google AI for the Gemini models
- Fashion industry experts for trend insights
