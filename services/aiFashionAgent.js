import { FashionTrendAnalyzer } from './fashionTrendAnalyzer.js';
import { AIDesignGenerator } from './aiDesignGenerator.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';

class AIFashionAgent {
  constructor() {
    this.trendAnalyzer = new FashionTrendAnalyzer();
    this.designGenerator = new AIDesignGenerator();
    
    // Agent configuration
    this.config = {
      maxDesignsPerRequest: 5,
      designQualityThreshold: 0.8,
      trendConfidenceThreshold: 0.7,
      enableVariations: true,
      enableMarketAnalysis: true
    };

    // Design categories and their characteristics
    this.garmentCategories = {
      tops: {
        types: ['t-shirt', 'blouse', 'shirt', 'sweater', 'jacket', 'blazer'],
        complexity: 'medium',
        trendSensitivity: 'high'
      },
      bottoms: {
        types: ['pants', 'jeans', 'shorts', 'skirt', 'leggings'],
        complexity: 'medium',
        trendSensitivity: 'high'
      },
      dresses: {
        types: ['casual dress', 'formal dress', 'maxi dress', 'mini dress', 'midi dress'],
        complexity: 'high',
        trendSensitivity: 'very high'
      },
      outerwear: {
        types: ['coat', 'jacket', 'blazer', 'cardigan', 'vest'],
        complexity: 'high',
        trendSensitivity: 'medium'
      },
      accessories: {
        types: ['bag', 'scarf', 'hat', 'belt', 'jewelry'],
        complexity: 'low',
        trendSensitivity: 'very high'
      }
    };

    // Design generation strategies
    this.designStrategies = {
      trend_following: {
        description: 'Follow current trends closely',
        trendWeight: 0.9,
        creativityWeight: 0.1,
        marketFitWeight: 0.8
      },
      trend_leading: {
        description: 'Lead trends with innovative designs',
        trendWeight: 0.6,
        creativityWeight: 0.9,
        marketFitWeight: 0.5
      },
      balanced: {
        description: 'Balance trends with timeless appeal',
        trendWeight: 0.7,
        creativityWeight: 0.5,
        marketFitWeight: 0.9
      },
      sustainable: {
        description: 'Focus on sustainable and ethical design',
        trendWeight: 0.5,
        creativityWeight: 0.7,
        marketFitWeight: 0.8
      }
    };
  }

  async generateTrendBasedDesigns(request) {
    try {
      console.log('AI Fashion Agent: Starting trend-based design generation...');
      
      const {
        garmentType = 'general',
        category = 'all',
        strategy = 'balanced',
        count = 3,
        targetAudience = 'general',
        occasion = 'everyday',
        preferences = {}
      } = request;

      // Step 1: Analyze current trends
      console.log('Step 1: Analyzing current fashion trends...');
      const trendAnalysis = await this.trendAnalyzer.analyzeCurrentTrends(category);
      
      // Step 2: Generate trend-informed design prompts
      console.log('Step 2: Generating trend-informed design prompts...');
      const designPrompts = await this.generateDesignPrompts(
        trendAnalysis, 
        garmentType, 
        strategy, 
        count,
        targetAudience,
        occasion,
        preferences
      );

      // Step 3: Generate designs using AI
      console.log('Step 3: Generating designs using AI...');
      const designs = await this.generateDesigns(designPrompts, trendAnalysis);

      // Step 4: Analyze market fit and opportunities
      console.log('Step 4: Analyzing market fit...');
      const marketAnalysis = this.config.enableMarketAnalysis ? 
        await this.analyzeMarketFit(designs, trendAnalysis) : null;

      // Step 5: Generate variations if enabled
      let variations = [];
      if (this.config.enableVariations && designs.length > 0) {
        console.log('Step 5: Generating design variations...');
        variations = await this.generateDesignVariations(designs[0], trendAnalysis);
      }

      return {
        success: true,
        designs: designs,
        variations: variations,
        trendAnalysis: trendAnalysis,
        marketAnalysis: marketAnalysis,
        designPrompts: designPrompts,
        metadata: {
          generatedAt: new Date().toISOString(),
          strategy: strategy,
          category: category,
          garmentType: garmentType,
          targetAudience: targetAudience,
          occasion: occasion
        }
      };

    } catch (error) {
      console.error('Error in generateTrendBasedDesigns:', error);
      return {
        success: false,
        error: error.message,
        fallbackDesigns: await this.generateFallbackDesigns(request)
      };
    }
  }

  async generateDesignPrompts(trendAnalysis, garmentType, strategy, count, targetAudience, occasion, preferences) {
    const prompts = [];
    const strategyConfig = this.designStrategies[strategy] || this.designStrategies.balanced;

    for (let i = 0; i < count; i++) {
      try {
        // Generate base prompt using trend analyzer
        const basePrompt = await this.trendAnalyzer.generateTrendBasedDesignPrompt(
          trendAnalysis, 
          garmentType
        );

        // Enhance prompt with strategy and preferences
        const enhancedPrompt = this.enhanceDesignPrompt(
          basePrompt,
          strategyConfig,
          targetAudience,
          occasion,
          preferences,
          i
        );

        prompts.push({
          id: uuidv4(),
          prompt: enhancedPrompt,
          strategy: strategy,
          targetAudience: targetAudience,
          occasion: occasion,
          variation: i
        });

      } catch (error) {
        console.error(`Error generating prompt ${i}:`, error);
        // Add fallback prompt
        prompts.push({
          id: uuidv4(),
          prompt: this.getFallbackPrompt(garmentType, trendAnalysis),
          strategy: strategy,
          targetAudience: targetAudience,
          occasion: occasion,
          variation: i,
          isFallback: true
        });
      }
    }

    return prompts;
  }

  enhanceDesignPrompt(basePrompt, strategyConfig, targetAudience, occasion, preferences, variation) {
    let enhancedPrompt = basePrompt;

    // Add strategy-specific instructions
    enhancedPrompt += `\n\nDesign Strategy: ${strategyConfig.description}`;
    enhancedPrompt += `\n- Trend Influence: ${Math.round(strategyConfig.trendWeight * 100)}%`;
    enhancedPrompt += `\n- Creativity Level: ${Math.round(strategyConfig.creativityWeight * 100)}%`;
    enhancedPrompt += `\n- Market Fit Focus: ${Math.round(strategyConfig.marketFitWeight * 100)}%`;

    // Add target audience considerations
    if (targetAudience !== 'general') {
      enhancedPrompt += `\n\nTarget Audience: ${targetAudience}`;
      enhancedPrompt += `\n- Consider age, lifestyle, and purchasing power`;
      enhancedPrompt += `\n- Adapt design elements to audience preferences`;
    }

    // Add occasion-specific requirements
    if (occasion !== 'everyday') {
      enhancedPrompt += `\n\nOccasion: ${occasion}`;
      enhancedPrompt += `\n- Ensure appropriateness for the specific occasion`;
      enhancedPrompt += `\n- Consider dress codes and social expectations`;
    }

    // Add user preferences
    if (Object.keys(preferences).length > 0) {
      enhancedPrompt += `\n\nUser Preferences:`;
      Object.entries(preferences).forEach(([key, value]) => {
        enhancedPrompt += `\n- ${key}: ${value}`;
      });
    }

    // Add variation instructions
    if (variation > 0) {
      enhancedPrompt += `\n\nVariation ${variation + 1}:`;
      enhancedPrompt += `\n- Create a distinct variation while maintaining trend alignment`;
      enhancedPrompt += `\n- Explore different color combinations or silhouette variations`;
    }

    return enhancedPrompt;
  }

  async generateDesigns(designPrompts, trendAnalysis) {
    const designs = [];

    for (const promptData of designPrompts) {
      try {
        console.log(`Generating design for prompt: ${promptData.id}`);

        // Create a mock flat design (in production, this would be generated)
        const mockFlatPath = await this.createMockFlatDesign(promptData, trendAnalysis);
        
        // Generate final design using the AI design generator
        const outputPath = path.join(process.cwd(), 'uploads', `ai-generated-${uuidv4()}.png`);
        
        const finalDesign = await this.designGenerator.generateFinalImage(
          mockFlatPath,
          outputPath,
          {
            style: this.extractStyleFromPrompt(promptData.prompt),
            color: this.extractColorFromPrompt(promptData.prompt),
            material: this.extractMaterialFromPrompt(promptData.prompt),
            textPrompt: promptData.prompt,
            fabricImagePaths: []
          }
        );

        designs.push({
          id: promptData.id,
          prompt: promptData.prompt,
          flatDesign: mockFlatPath,
          finalDesign: finalDesign,
          strategy: promptData.strategy,
          targetAudience: promptData.targetAudience,
          occasion: promptData.occasion,
          trendAlignment: this.calculateTrendAlignment(promptData.prompt, trendAnalysis),
          quality: this.assessDesignQuality(promptData.prompt),
          metadata: {
            generatedAt: new Date().toISOString(),
            isFallback: promptData.isFallback || false
          }
        });

      } catch (error) {
        console.error(`Error generating design for prompt ${promptData.id}:`, error);
        
        // Add fallback design
        designs.push({
          id: promptData.id,
          prompt: promptData.prompt,
          error: error.message,
          isFallback: true,
          strategy: promptData.strategy,
          targetAudience: promptData.targetAudience,
          occasion: promptData.occasion
        });
      }
    }

    return designs;
  }

  async createMockFlatDesign(promptData, trendAnalysis) {
    // In a real implementation, this would generate an actual flat design
    // For now, we'll create a placeholder
    const mockPath = path.join(process.cwd(), 'uploads', `mock-flat-${uuidv4()}.png`);
    
    // Create a simple mock image (you would replace this with actual flat generation)
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    // Draw a simple garment outline
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 600);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.lineTo(300, 50);
    ctx.lineTo(300, 550);
    ctx.lineTo(100, 550);
    ctx.closePath();
    ctx.stroke();
    
    // Add some basic details
    ctx.fillStyle = '#666';
    ctx.fillRect(120, 80, 160, 40); // collar area
    ctx.fillRect(120, 140, 160, 200); // body area
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(mockPath, buffer);
    
    return mockPath;
  }

  extractStyleFromPrompt(prompt) {
    const styleKeywords = ['casual', 'formal', 'sporty', 'elegant', 'minimalist', 'maximalist'];
    const foundStyle = styleKeywords.find(style => 
      prompt.toLowerCase().includes(style)
    );
    return foundStyle || 'casual';
  }

  extractColorFromPrompt(prompt) {
    const colorKeywords = ['blue', 'red', 'green', 'black', 'white', 'gray', 'pink', 'purple', 'orange', 'brown'];
    const foundColor = colorKeywords.find(color => 
      prompt.toLowerCase().includes(color)
    );
    return foundColor || 'blue';
  }

  extractMaterialFromPrompt(prompt) {
    const materialKeywords = ['cotton', 'silk', 'denim', 'leather', 'wool', 'polyester'];
    const foundMaterial = materialKeywords.find(material => 
      prompt.toLowerCase().includes(material)
    );
    return foundMaterial || 'cotton';
  }

  calculateTrendAlignment(prompt, trendAnalysis) {
    let alignment = 0;
    let totalChecks = 0;

    // Check alignment with key trends
    trendAnalysis.keyTrends.forEach(trend => {
      if (prompt.toLowerCase().includes(trend.name.toLowerCase())) {
        alignment += trend.confidence;
        totalChecks++;
      }
    });

    // Check alignment with color palettes
    trendAnalysis.colorPalettes.forEach(palette => {
      const colorMatch = palette.colors.some(color => 
        prompt.toLowerCase().includes(color.toLowerCase())
      );
      if (colorMatch) {
        alignment += palette.trendStrength;
        totalChecks++;
      }
    });

    return totalChecks > 0 ? alignment / totalChecks : 0.5;
  }

  assessDesignQuality(prompt) {
    let quality = 0.7; // Base quality

    // Assess based on prompt complexity and detail
    const wordCount = prompt.split(' ').length;
    if (wordCount > 100) quality += 0.1;
    if (wordCount > 200) quality += 0.1;

    // Assess based on specific design elements mentioned
    const designElements = ['silhouette', 'fit', 'material', 'color', 'texture', 'detail'];
    const elementsMentioned = designElements.filter(element => 
      prompt.toLowerCase().includes(element)
    ).length;
    
    quality += (elementsMentioned / designElements.length) * 0.2;

    return Math.min(quality, 1.0);
  }

  async generateDesignVariations(baseDesign, trendAnalysis) {
    const variations = [];
    const variationCount = 3;

    for (let i = 0; i < variationCount; i++) {
      try {
        const variationPrompt = this.createVariationPrompt(baseDesign.prompt, i, trendAnalysis);
        
        const mockFlatPath = await this.createMockFlatDesign(
          { prompt: variationPrompt, id: uuidv4() },
          trendAnalysis
        );
        
        const outputPath = path.join(process.cwd(), 'uploads', `variation-${uuidv4()}.png`);
        
        const variationDesign = await this.designGenerator.generateFinalImage(
          mockFlatPath,
          outputPath,
          {
            style: this.extractStyleFromPrompt(variationPrompt),
            color: this.extractColorFromPrompt(variationPrompt),
            material: this.extractMaterialFromPrompt(variationPrompt),
            textPrompt: variationPrompt,
            fabricImagePaths: []
          }
        );

        variations.push({
          id: uuidv4(),
          prompt: variationPrompt,
          flatDesign: mockFlatPath,
          finalDesign: variationDesign,
          variationType: this.getVariationType(i),
          baseDesignId: baseDesign.id
        });

      } catch (error) {
        console.error(`Error generating variation ${i}:`, error);
      }
    }

    return variations;
  }

  createVariationPrompt(basePrompt, variationIndex, trendAnalysis) {
    const variationTypes = [
      'color variation',
      'silhouette variation', 
      'material variation'
    ];
    
    const variationType = variationTypes[variationIndex % variationTypes.length];
    
    return `${basePrompt}\n\nVariation ${variationIndex + 1} - ${variationType}:`;
  }

  getVariationType(index) {
    const types = ['color', 'silhouette', 'material'];
    return types[index % types.length];
  }

  async analyzeMarketFit(designs, trendAnalysis) {
    const marketAnalysis = {
      overallScore: 0,
      designScores: [],
      opportunities: [],
      risks: [],
      recommendations: []
    };

    let totalScore = 0;

    designs.forEach(design => {
      if (design.error) return;

      const score = this.calculateMarketFitScore(design, trendAnalysis);
      totalScore += score;

      marketAnalysis.designScores.push({
        designId: design.id,
        score: score,
        strengths: this.identifyDesignStrengths(design, trendAnalysis),
        weaknesses: this.identifyDesignWeaknesses(design, trendAnalysis)
      });
    });

    marketAnalysis.overallScore = designs.length > 0 ? totalScore / designs.length : 0;
    marketAnalysis.opportunities = this.identifyMarketOpportunities(designs, trendAnalysis);
    marketAnalysis.risks = this.identifyMarketRisks(designs, trendAnalysis);
    marketAnalysis.recommendations = this.generateMarketRecommendations(designs, trendAnalysis);

    return marketAnalysis;
  }

  calculateMarketFitScore(design, trendAnalysis) {
    let score = 0;

    // Trend alignment (40% weight)
    score += design.trendAlignment * 0.4;

    // Design quality (30% weight)
    score += design.quality * 0.3;

    // Target audience fit (20% weight)
    score += this.calculateAudienceFit(design, trendAnalysis) * 0.2;

    // Market timing (10% weight)
    score += this.calculateMarketTiming(design, trendAnalysis) * 0.1;

    return score;
  }

  calculateAudienceFit(design, trendAnalysis) {
    // Simplified audience fit calculation
    const audienceKeywords = {
      'young': ['trendy', 'bold', 'colorful'],
      'professional': ['formal', 'elegant', 'neutral'],
      'casual': ['comfortable', 'relaxed', 'versatile']
    };

    const prompt = design.prompt.toLowerCase();
    let fit = 0.5; // Base fit

    Object.entries(audienceKeywords).forEach(([audience, keywords]) => {
      const matches = keywords.filter(keyword => prompt.includes(keyword)).length;
      if (matches > 0) {
        fit += (matches / keywords.length) * 0.2;
      }
    });

    return Math.min(fit, 1.0);
  }

  calculateMarketTiming(design, trendAnalysis) {
    // Simplified market timing calculation
    const trendStrength = trendAnalysis.keyTrends.reduce((sum, trend) => sum + trend.confidence, 0) / trendAnalysis.keyTrends.length;
    return trendStrength;
  }

  identifyDesignStrengths(design, trendAnalysis) {
    const strengths = [];

    if (design.trendAlignment > 0.8) strengths.push('High trend alignment');
    if (design.quality > 0.8) strengths.push('High design quality');
    if (design.prompt.length > 200) strengths.push('Detailed design specification');

    return strengths;
  }

  identifyDesignWeaknesses(design, trendAnalysis) {
    const weaknesses = [];

    if (design.trendAlignment < 0.6) weaknesses.push('Low trend alignment');
    if (design.quality < 0.6) weaknesses.push('Low design quality');
    if (design.prompt.length < 100) weaknesses.push('Vague design specification');

    return weaknesses;
  }

  identifyMarketOpportunities(designs, trendAnalysis) {
    return [
      'Growing demand for sustainable fashion',
      'Rising interest in minimalist designs',
      'Increasing market for gender-neutral clothing',
      'Opportunity in tech-integrated apparel'
    ];
  }

  identifyMarketRisks(designs, trendAnalysis) {
    return [
      'Fast-changing trend cycles',
      'High competition in fashion market',
      'Supply chain disruptions',
      'Economic uncertainty affecting consumer spending'
    ];
  }

  generateMarketRecommendations(designs, trendAnalysis) {
    return [
      'Focus on sustainable materials and production methods',
      'Develop versatile, timeless designs alongside trendy pieces',
      'Consider direct-to-consumer model for better margins',
      'Invest in technology for customization and personalization'
    ];
  }

  async generateFallbackDesigns(request) {
    console.log('Generating fallback designs...');
    
    const fallbackTrends = this.trendAnalyzer.getFallbackTrends('all');
    const fallbackPrompts = [
      this.trendAnalyzer.getFallbackDesignPrompt(fallbackTrends, request.garmentType || 'general')
    ];

    return await this.generateDesigns(
      fallbackPrompts.map(prompt => ({
        id: uuidv4(),
        prompt: prompt,
        strategy: 'balanced',
        targetAudience: 'general',
        occasion: 'everyday',
        isFallback: true
      })),
      fallbackTrends
    );
  }

  getFallbackPrompt(garmentType, trendAnalysis) {
    return `Create a modern ${garmentType} design incorporating current trends:

Style: Clean, versatile, and sustainable approach
Colors: Neutral palette with earth tones
Materials: Organic or recycled fabrics
Silhouette: Comfortable and contemporary
Details: Focus on quality and timeless appeal
Target: Fashion-conscious consumers

The design should be practical, stylish, and suitable for everyday wear.`;
  }

  async getTrendInsights(category = 'all') {
    return await this.trendAnalyzer.getTrendInsights(category);
  }

  async getDesignRecommendations(trendAnalysis, garmentType) {
    const recommendations = {
      immediate: [],
      strategic: [],
      longTerm: []
    };

    // Generate immediate recommendations based on current trends
    trendAnalysis.keyTrends.forEach(trend => {
      if (trend.confidence > 0.8) {
        recommendations.immediate.push({
          trend: trend.name,
          action: `Incorporate ${trend.name} elements in ${garmentType} designs`,
          priority: 'high',
          expectedImpact: 'high'
        });
      }
    });

    // Generate strategic recommendations
    trendAnalysis.colorPalettes.forEach(palette => {
      if (palette.trendStrength > 0.7) {
        recommendations.strategic.push({
          category: 'color',
          action: `Develop ${palette.name} color palette for ${garmentType}`,
          priority: 'medium',
          expectedImpact: 'medium'
        });
      }
    });

    // Generate long-term recommendations
    recommendations.longTerm.push({
      category: 'sustainability',
      action: 'Develop sustainable material partnerships',
      priority: 'low',
      expectedImpact: 'high'
    });

    return recommendations;
  }
}

export { AIFashionAgent };
