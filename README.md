# StyleSynapse.ai

An AI-powered fashion design platform that transforms product images into technical flats and generates realistic final renders using advanced neural network technology. StyleSynapse.ai combines real-time fashion trend analysis with cutting-edge AI to revolutionize the design workflow.

## Features

- **Neural Network Processing**: Convert product images to technical flats using advanced AI
- **Style Generation**: Generate realistic final product images with AI-powered rendering
- **Real-Time Trend Analysis**: Analyze current fashion trends using real APIs and market data
- **Batch Processing**: Process multiple images simultaneously with efficient AI pipelines
- **Modern Web Interface**: Beautiful, responsive UI optimized for design workflows
- **AI Fashion Agent**: Intelligent design recommendations based on current trends

## Advanced AI Integration

StyleSynapse.ai leverages cutting-edge AI technologies including LangGraph agents and real-time API integration for comprehensive trend analysis:

### Supported APIs
- **News API**: Fashion news, runway coverage, consumer behavior
- **Pinterest API**: Trending fashion pins and hashtags
- **Instagram API**: Fashion hashtag popularity and engagement
- **Twitter API**: Fashion-related tweets and sentiment analysis
- **Google Trends**: Search trend data for fashion terms

### Benefits
- **Real-time Data**: Get current, accurate fashion trend information
- **Multiple Sources**: Aggregate data from social media, news, and search
- **Graceful Fallbacks**: Works with or without API keys
- **Rate Limiting**: Respects API limits and quotas
- **Comprehensive Analysis**: Combines multiple data sources for insights

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Design_generation
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Set up API keys** (optional but recommended)
   - Copy `.env.example` to `.env`
   - Add your API keys for trend analysis
   - See `API_SETUP.md` for detailed setup instructions

4. **Start the application**
   ```bash
   npm start
   ```

5. **Test the trend analyzer**
   ```bash
   node test-trend-apis.js
   ```

## API Setup

For the best experience with trend analysis, set up the following APIs:

1. **News API** (Recommended - Free tier available)
   - Sign up at [NewsAPI.org](https://newsapi.org/)
   - Get 1,000 requests per day free

2. **Social Media APIs** (Optional)
   - Pinterest, Instagram, Twitter APIs
   - See `API_SETUP.md` for detailed setup

3. **Environment Variables**
   ```env
   NEWS_API_KEY=your_news_api_key
   PINTEREST_API_KEY=your_pinterest_key
   INSTAGRAM_ACCESS_TOKEN=your_instagram_token
   TWITTER_BEARER_TOKEN=your_twitter_token
   ```

## Architecture

- **Backend**: Node.js with Express and FastAPI
- **Frontend**: React with modern UI components and styled-components
- **AI Engine**: Google Vertex AI (Gemini) and LangGraph agents for advanced processing
- **Neural Networks**: Custom AI models for image-to-flat conversion and style generation
- **APIs**: Real-time fashion trend data from multiple sources
- **Image Processing**: Sharp, Fabric.js, and AI-powered image manipulation

## Documentation

- `API_SETUP.md` - Complete guide for setting up real APIs
- `VERTEXAI_SETUP.md` - Google Vertex AI setup instructions
- `AI_FASHION_AGENT_README.md` - AI fashion agent documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `node test-trend-apis.js`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
